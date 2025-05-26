import {
  ExamTabState,
  ExamTabManagerConfig,
} from "@/types/examTabManager.types";

export class ExamTabManager {
  private readonly attemptId: string;
  private readonly tabId: string;
  private readonly storageKey: string;
  private readonly timestampKey: string;
  private readonly config: Required<ExamTabManagerConfig>;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private visibilityHandler: (() => void) | null = null;
  private beforeUnloadHandler: (() => void) | null = null;
  private isDestroyed = false;

  constructor(config: ExamTabManagerConfig) {
    this.attemptId = config.attemptId;
    this.tabId = this.generateTabId();
    this.storageKey = `exam_active_${this.attemptId}`;
    this.timestampKey = `${this.storageKey}_timestamp`;

    this.config = {
      ...config,
      heartbeatInterval: config.heartbeatInterval ?? 5000,
      staleTimeout: config.staleTimeout ?? 30000,
      onDuplicateTab: config.onDuplicateTab ?? this.defaultDuplicateHandler,
      onSessionExpired:
        config.onSessionExpired ?? this.defaultSessionExpiredHandler,
    };
  }

  /**
   * Initialize the tab manager and claim the session
   */
  public async initialize(): Promise<boolean> {
    if (this.isDestroyed) return false;

    try {
      // Clean up any stale sessions first
      this.cleanupStaleSession();

      // Check if already active elsewhere
      if (this.isActiveElsewhere()) {
        return false;
      }

      // Claim this tab
      this.claimTab();
      this.setupEventListeners();
      this.startHeartbeat();

      return true;
    } catch (error) {
      console.error("ExamTabManager initialization failed:", error);
      return false;
    }
  }

  /**
   * Check if exam is active in another tab
   */
  private isActiveElsewhere(): boolean {
    try {
      const activeTabId = localStorage.getItem(this.storageKey);
      return activeTabId !== null && activeTabId !== this.tabId;
    } catch (error) {
      console.error("Failed to check active tab status:", error);
      return false;
    }
  }

  /**
   * Claim this tab as the active one
   */
  private claimTab(): void {
    try {
      localStorage.setItem(this.storageKey, this.tabId);
      localStorage.setItem(this.timestampKey, Date.now().toString());
    } catch (error) {
      console.error("Failed to claim tab:", error);
      throw new Error("Unable to claim exam session");
    }
  }

  /**
   * Start heartbeat to maintain active status
   */
  private startHeartbeat(): void {
    if (this.isDestroyed) return;

    this.heartbeatTimer = setInterval(() => {
      if (this.isDestroyed) return;

      try {
        // Only update if we're still the active tab
        if (this.isCurrentTabActive()) {
          localStorage.setItem(this.timestampKey, Date.now().toString());
        } else {
          // Another tab has taken over
          this.handleSessionTakeover();
        }
      } catch (error) {
        console.error("Heartbeat failed:", error);
      }
    }, this.config.heartbeatInterval);
  }

  /**
   * Check if current tab is still the active one
   */
  private isCurrentTabActive(): boolean {
    try {
      return localStorage.getItem(this.storageKey) === this.tabId;
    } catch (error) {
      console.error("Failed to check current tab status:", error);
      return false;
    }
  }

  /**
   * Handle session takeover by another tab
   */
  private handleSessionTakeover(): void {
    this.stopHeartbeat();
    this.config.onSessionExpired();
  }

  /**
   * Setup event listeners for page visibility and beforeunload
   */
  private setupEventListeners(): void {
    if (this.isDestroyed) return;

    // Handle visibility changes
    this.visibilityHandler = () => {
      if (!document.hidden && !this.isCurrentTabActive() && !this.isDestroyed) {
        this.config.onDuplicateTab();
      }
    };
    document.addEventListener("visibilitychange", this.visibilityHandler);

    // Handle page unload
    this.beforeUnloadHandler = () => {
      this.releaseTab();
    };
    window.addEventListener("beforeunload", this.beforeUnloadHandler);
  }

  /**
   * Clean up stale sessions from crashed tabs
   */
  private cleanupStaleSession(): void {
    try {
      const timestampStr = localStorage.getItem(this.timestampKey);
      if (!timestampStr) return;

      const timestamp = parseInt(timestampStr, 10);
      const now = Date.now();

      if (now - timestamp > this.config.staleTimeout) {
        localStorage.removeItem(this.storageKey);
        localStorage.removeItem(this.timestampKey);
      }
    } catch (error) {
      console.error("Failed to cleanup stale session:", error);
    }
  }

  /**
   * Release the current tab's claim
   */
  public releaseTab(): void {
    try {
      if (this.isCurrentTabActive()) {
        localStorage.removeItem(this.storageKey);
        localStorage.removeItem(this.timestampKey);
      }
      this.cleanup();
    } catch (error) {
      console.error("Failed to release tab:", error);
    }
  }

  /**
   * Force release (for error scenarios)
   */
  public forceRelease(): void {
    try {
      localStorage.removeItem(this.storageKey);
      localStorage.removeItem(this.timestampKey);
      this.cleanup();
    } catch (error) {
      console.error("Failed to force release tab:", error);
    }
  }

  /**
   * Get current tab state
   */
  public getTabState(): ExamTabState {
    try {
      const activeTabId = localStorage.getItem(this.storageKey);
      const lastHeartbeat = parseInt(
        localStorage.getItem(this.timestampKey) || "0",
        10
      );

      return {
        isActive: activeTabId === this.tabId,
        tabId: this.tabId,
        lastHeartbeat,
      };
    } catch (error) {
      console.error("Failed to get tab state:", error);
      return {
        isActive: false,
        tabId: this.tabId,
        lastHeartbeat: 0,
      };
    }
  }

  /**
   * Cleanup all resources
   */
  private cleanup(): void {
    this.isDestroyed = true;
    this.stopHeartbeat();
    this.removeEventListeners();
  }

  /**
   * Stop heartbeat timer
   */
  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  /**
   * Remove event listeners
   */
  private removeEventListeners(): void {
    if (this.visibilityHandler) {
      document.removeEventListener("visibilitychange", this.visibilityHandler);
      this.visibilityHandler = null;
    }

    if (this.beforeUnloadHandler) {
      window.removeEventListener("beforeunload", this.beforeUnloadHandler);
      this.beforeUnloadHandler = null;
    }
  }

  /**
   * Generate unique tab ID
   */
  private generateTabId(): string {
    return `tab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Default duplicate tab handler
   */
  private defaultDuplicateHandler = (): void => {
    console.warn("Duplicate tab detected but no handler provided");
  };

  /**
   * Default session expired handler
   */
  private defaultSessionExpiredHandler = (): void => {
    console.warn("Session expired but no handler provided");
  };

  /**
   * Destroy the manager instance
   */
  public destroy(): void {
    this.releaseTab();
  }
}

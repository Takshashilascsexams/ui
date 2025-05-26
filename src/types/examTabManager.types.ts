export interface ExamTabManagerConfig {
  attemptId: string;
  heartbeatInterval?: number;
  staleTimeout?: number;
  onDuplicateTab?: () => void;
  onSessionExpired?: () => void;
}

export interface ExamTabState {
  isActive: boolean;
  tabId: string;
  lastHeartbeat: number;
}

export interface UseExamTabManagerReturn {
  isTabActive: boolean;
  tabState: ExamTabState | null;
  initializeTab: () => Promise<boolean>;
  releaseTab: () => void;
  forceRelease: () => void;
  isInitialized: boolean;
}

export type DuplicateTabAction = "redirect" | "modal" | "custom";

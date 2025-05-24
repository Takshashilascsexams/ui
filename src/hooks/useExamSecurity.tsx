import { useEffect, useRef, useCallback, useState } from "react";
import { toast } from "sonner";

export interface SecurityViolation {
  type: "tab_switch" | "right_click" | "copy_paste" | "fullscreen_exit";
  timestamp: number;
}

interface UseExamSecurityProps {
  isExamActive: boolean;
  onSecurityViolation: (violation: SecurityViolation) => void;
  maxViolations?: number;
  onMaxViolationsReached?: () => void;
}

export const useExamSecurity = ({
  isExamActive,
  onSecurityViolation,
  maxViolations = 5,
  onMaxViolationsReached,
}: UseExamSecurityProps) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const violationCountRef = useRef(0);

  // Simple device detection
  useEffect(() => {
    const checkMobile =
      /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ||
      window.innerWidth < 768;
    setIsMobile(checkMobile);
  }, []);

  // Handle violations
  const handleViolation = useCallback(
    (violation: SecurityViolation) => {
      violationCountRef.current += 1;
      onSecurityViolation(violation);

      const remaining = maxViolations - violationCountRef.current;
      toast.error(
        `Security warning: ${violation.type.replace(
          "_",
          " "
        )} (${remaining} warnings left)`
      );

      if (violationCountRef.current >= maxViolations) {
        onMaxViolationsReached?.();
      }
    },
    [onSecurityViolation, maxViolations, onMaxViolationsReached]
  );

  // 1. Tab switching detection (works on all devices)
  useEffect(() => {
    if (!isExamActive) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        handleViolation({
          type: "tab_switch",
          timestamp: Date.now(),
        });
      }
    };

    const handleWindowBlur = () => {
      if (!document.hidden) {
        handleViolation({
          type: "tab_switch",
          timestamp: Date.now(),
        });
      }
    };

    // Add throttling to prevent spam
    let lastViolation = 0;
    const throttledVisibilityChange = () => {
      const now = Date.now();
      if (now - lastViolation > 2000) {
        // 2 second cooldown
        lastViolation = now;
        handleVisibilityChange();
      }
    };

    document.addEventListener("visibilitychange", throttledVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);

    return () => {
      document.removeEventListener(
        "visibilitychange",
        throttledVisibilityChange
      );
      window.removeEventListener("blur", handleWindowBlur);
    };
  }, [isExamActive, handleViolation]);

  // 2. Right-click prevention
  useEffect(() => {
    if (!isExamActive) return;

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      handleViolation({
        type: "right_click",
        timestamp: Date.now(),
      });
    };

    document.addEventListener("contextmenu", handleContextMenu);
    return () => document.removeEventListener("contextmenu", handleContextMenu);
  }, [isExamActive, handleViolation]);

  // 3. Copy/paste prevention
  useEffect(() => {
    if (!isExamActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Block common shortcuts
      const blocked = [
        { key: "c", ctrl: true }, // Copy
        { key: "v", ctrl: true }, // Paste
        { key: "x", ctrl: true }, // Cut
        { key: "a", ctrl: true }, // Select All
        { key: "s", ctrl: true }, // Save
        { key: "p", ctrl: true }, // Print
        { key: "u", ctrl: true }, // View Source
        { key: "F12" }, // Dev Tools
        { key: "F5" }, // Refresh
      ];

      const isBlocked = blocked.some((combo) => {
        if (combo.key === "F12" || combo.key === "F5") {
          return e.key === combo.key;
        }
        return e.key.toLowerCase() === combo.key && e.ctrlKey === combo.ctrl;
      });

      if (isBlocked) {
        e.preventDefault();
        e.stopPropagation();

        if (["c", "v", "x"].includes(e.key.toLowerCase())) {
          handleViolation({
            type: "copy_paste",
            timestamp: Date.now(),
          });
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isExamActive, handleViolation]);

  // 4. Simple fullscreen management (desktop only)
  const enterFullscreen = useCallback(async () => {
    if (isMobile) return false; // Skip on mobile due to compatibility issues

    try {
      const elem = document.documentElement;
      if (elem.requestFullscreen) {
        await elem.requestFullscreen();
        return true;
      }
    } catch {
      console.warn("Fullscreen not supported");
      return false;
    }
    return false;
  }, [isMobile]);

  const exitFullscreen = useCallback(async () => {
    try {
      if (document.exitFullscreen && document.fullscreenElement) {
        await document.exitFullscreen();
      }
    } catch {
      console.warn("Error exiting fullscreen");
    }
  }, []);

  // 5. Fullscreen change detection (desktop only)
  useEffect(() => {
    if (!isExamActive || isMobile) return;

    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!document.fullscreenElement;

      if (isFullscreen && !isCurrentlyFullscreen) {
        handleViolation({
          type: "fullscreen_exit",
          timestamp: Date.now(),
        });
      }

      setIsFullscreen(isCurrentlyFullscreen);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, [isExamActive, isMobile, isFullscreen, handleViolation]);

  return {
    isMobile,
    isFullscreen,
    violationCount: violationCountRef.current,
    enterFullscreen,
    exitFullscreen,
    maxViolations,
  };
};

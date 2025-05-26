import { useEffect, useRef, useState, useCallback } from "react";
import { ExamTabManager } from "@/utils/examTabManager";
import {
  ExamTabManagerConfig,
  ExamTabState,
  UseExamTabManagerReturn,
} from "@/types/examTabManager.types";

export const useExamTabManager = (
  config: ExamTabManagerConfig
): UseExamTabManagerReturn => {
  const managerRef = useRef<ExamTabManager | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [tabState, setTabState] = useState<ExamTabState | null>(null);

  // Stable reference to config callbacks
  const stableConfig = useRef(config);
  useEffect(() => {
    stableConfig.current = config;
  }, [config.attemptId, config.heartbeatInterval, config.staleTimeout, config]);

  const initializeTab = useCallback(async (): Promise<boolean> => {
    try {
      if (managerRef.current) {
        managerRef.current.destroy();
      }

      managerRef.current = new ExamTabManager(stableConfig.current);
      const success = await managerRef.current.initialize();

      setIsInitialized(success);

      if (success) {
        setTabState(managerRef.current.getTabState());
      }

      return success;
    } catch (error) {
      console.error("Failed to initialize exam tab manager:", error);
      setIsInitialized(false);
      return false;
    }
  }, []);

  const releaseTab = useCallback(() => {
    if (managerRef.current) {
      managerRef.current.releaseTab();
      setIsInitialized(false);
      setTabState(null);
    }
  }, []);

  const forceRelease = useCallback(() => {
    if (managerRef.current) {
      managerRef.current.forceRelease();
      setIsInitialized(false);
      setTabState(null);
    }
  }, []);

  // Update tab state periodically
  useEffect(() => {
    if (!isInitialized || !managerRef.current) return;

    const interval = setInterval(() => {
      if (managerRef.current) {
        setTabState(managerRef.current.getTabState());
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isInitialized]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (managerRef.current) {
        managerRef.current.destroy();
      }
    };
  }, []);

  return {
    isTabActive: tabState?.isActive ?? false,
    tabState,
    initializeTab,
    releaseTab,
    forceRelease,
    isInitialized,
  };
};

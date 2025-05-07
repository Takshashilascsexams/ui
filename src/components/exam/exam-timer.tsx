import { useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";

interface ExamTimerProps {
  timeRemaining: number;
  onTimeUpdate: (time: number) => void;
  onTimeExpired: () => void;
  isSyncing?: boolean;
}

export default function ExamTimer({
  timeRemaining,
  onTimeUpdate,
  onTimeExpired,
}: // isSyncing = false,
ExamTimerProps) {
  // Use a ref to track the previous time value
  const prevTimeRef = useRef(timeRemaining);

  // Use useEffect to handle timer logic
  useEffect(() => {
    // Don't start timer if no time remains
    if (timeRemaining <= 0) {
      onTimeExpired();
      return;
    }

    // Only update the ref when timeRemaining changes from props
    prevTimeRef.current = timeRemaining;

    // Set up timer interval
    const timer = setInterval(() => {
      // Use functional update pattern with the callback
      // This reads the current value directly from the ref
      const newTime = Math.max(0, prevTimeRef.current - 1);

      // Update the ref first
      prevTimeRef.current = newTime;

      // Then call the update function
      onTimeUpdate(newTime);

      // Check if time expired
      if (newTime === 0) {
        clearInterval(timer);
        onTimeExpired();
      }
    }, 1000);

    // Clean up interval on unmount or when timeRemaining changes
    return () => clearInterval(timer);
  }, [timeRemaining, onTimeUpdate, onTimeExpired]);

  // Format time as HH:MM:SS
  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return `${hrs.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <Card className="border border-gray-200 rounded-lg p-4">
      <h3 className="text-sm font-medium text-gray-700 mb-2">Time Remaining</h3>
      <div className="text-2xl font-bold text-center py-2">
        {formatTime(timeRemaining)}
      </div>
      {/* {isSyncing && (
        <p className="text-xs text-gray-500 text-center mt-1">
          Syncing time...
        </p>
      )} */}
    </Card>
  );
}

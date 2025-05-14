import { useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";

interface ExamTimerProps {
  timeRemaining: number;
  onTimeUpdate: (time: number) => void;
  onTimeExpired: () => void;
  isSyncing?: boolean;
  serverTime?: number; // New prop for server time
}

export default function ExamTimer({
  timeRemaining,
  onTimeUpdate,
  onTimeExpired,
  isSyncing = false,
  serverTime,
}: ExamTimerProps) {
  // Track time offset between client and server using a ref instead of state
  const timeOffsetRef = useRef<number>(0);

  // Track the previous time value
  const prevTimeRef = useRef(timeRemaining);

  // Track the last time the timer was updated locally
  const lastTickTime = useRef(Date.now());

  // Track absolute end time (calculated from server data)
  const absoluteEndTimeRef = useRef<number | null>(null);

  // Calculate and set time offset when serverTime is provided
  useEffect(() => {
    if (serverTime && timeRemaining > 0) {
      // Calculate absolute end time from server perspective
      const serverEndTime = serverTime + timeRemaining * 1000;

      // Store the absolute end time
      absoluteEndTimeRef.current = serverEndTime;

      // Calculate offset between client and server time - store in ref
      timeOffsetRef.current = Date.now() - serverTime;

      // Reset last tick time
      lastTickTime.current = Date.now();
    }
  }, [serverTime, timeRemaining]);

  // Timer effect
  useEffect(() => {
    if (timeRemaining <= 0) {
      onTimeExpired();
      return;
    }

    // Update the ref when timeRemaining changes from props
    prevTimeRef.current = timeRemaining;

    // Store the exact second value when timer starts
    const startSecond = Math.floor(Date.now() / 1000);
    const initialSeconds = timeRemaining;

    // Set up timer interval with more frequent checks
    const timer = setInterval(() => {
      let newTime: number;

      if (absoluteEndTimeRef.current !== null) {
        // Use timeOffsetRef (not state) to adjust for server-client clock differences
        const adjustedNow = Date.now() - timeOffsetRef.current;
        newTime = Math.max(
          0,
          Math.ceil((absoluteEndTimeRef.current - adjustedNow) / 1000)
        );
      } else {
        // Fallback calculation based on elapsed whole seconds
        const currentSecond = Math.floor(Date.now() / 1000);
        const elapsedSeconds = currentSecond - startSecond;
        newTime = Math.max(0, initialSeconds - elapsedSeconds);
      }

      // Only update if time has changed
      if (newTime !== prevTimeRef.current) {
        prevTimeRef.current = newTime;
        onTimeUpdate(newTime);

        if (newTime === 0) {
          clearInterval(timer);
          onTimeExpired();
        }
      }
    }, 200); // Run 5x per second for better precision

    return () => clearInterval(timer);
  }, [timeRemaining, onTimeUpdate, onTimeExpired]); // Remove serverTime from dependencies

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
      {isSyncing && (
        <div className="text-xs text-center text-gray-500">
          Syncing with server...
        </div>
      )}
    </Card>
  );
}

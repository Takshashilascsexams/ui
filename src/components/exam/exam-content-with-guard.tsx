import { ExamSessionGuard } from "./exam-session-guard";
import ExamContent from "./exam-content";

export default function ExamContentWithGuard({
  attemptId,
}: {
  attemptId: string;
}) {
  const handleSessionConflict = () => {
    // Log the conflict for analytics
    console.warn(`Session conflict detected for attempt ${attemptId}`);
  };

  return (
    <ExamSessionGuard
      attemptId={attemptId}
      onSessionConflict={handleSessionConflict}
    >
      <ExamContent attemptId={attemptId} />
    </ExamSessionGuard>
  );
}

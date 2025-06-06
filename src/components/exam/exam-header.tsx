import { ExamDetails } from "@/context/exam.context";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

interface ExamHeaderProps {
  examDetails: ExamDetails;
  onSubmit: () => void;
  submitting?: boolean;
  submitDisabled?: boolean;
}

export default function ExamHeader({
  examDetails,
  onSubmit,
  submitting = false,
  submitDisabled = false,
}: ExamHeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 sm:px-6">
      <div className="flex items-center justify-between flex-wrap">
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-medium truncate">{examDetails.title}</h1>
          <p className="text-sm text-gray-500 truncate">
            {examDetails.description}
          </p>
        </div>

        <div className="flex items-center mt-2 sm:mt-0 gap-2">
          <Button
            size="sm"
            onClick={onSubmit}
            className="flex items-center bg-blue-600 hover:bg-blue-700"
            disabled={submitting || submitDisabled}
          >
            {submitting ? (
              <>
                <span className="mr-1 h-4 w-4 animate-spin border-2 border-gray-50 border-t-transparent rounded-full"></span>
                Submitting...
              </>
            ) : (
              <>
                <CheckCircle className="mr-1 h-4 w-4" />
                Submit Exam
              </>
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}

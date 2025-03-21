import { PreviewDataType } from "./hero";
import { sampleQuestions } from "@/utils/arrays";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export type DialogPropType = {
  children: React.ReactNode;
  previewData?: PreviewDataType | null;
};

export default function FormatViewDialog({ children }: DialogPropType) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="lg:max-w-[1000px] w-[450px] lg:w-[700px] rounded-md">
        <DialogHeader className="text-start">
          <DialogTitle>Question Format Guide</DialogTitle>
          <DialogDescription>
            {`For bulk question import, please follow this standardized format in your PDF or Word documents:`}
          </DialogDescription>
        </DialogHeader>

        <div className="w-full">
          <h2 className="text-base font-medium">Required Format:</h2>
          <div className="w-full text-sm">
            {sampleQuestions.map((question) => {
              return (
                <div key={question.id} className="mt-5">
                  <p>
                    {question.id}. {question.questionText}
                  </p>
                  <div className="mt-2 mb-2">
                    <ul>
                      {question.options.map((option, index) => {
                        return (
                          <li key={index}>
                            ({String.fromCharCode(65 + index).toLowerCase()}){" "}
                            {option.optionText}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                  {question.answer && <p>Answer: {question.answer}</p>}
                  {question.explanation && (
                    <p>Explanation (optional): {question.explanation}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

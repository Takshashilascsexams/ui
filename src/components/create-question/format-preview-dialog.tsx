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
      <DialogContent
        aria-describedby={"main"}
        className="w-[360px] lg:w-[700px] h-[700px] lg:h-[650px] rounded-md overflow-y-hidden"
      >
        {/* header */}
        <DialogHeader className="text-start">
          <DialogTitle>Question Format Guide</DialogTitle>
          <DialogDescription>
            {`For bulk question import, please follow this standardized format in your PDF or Word documents:`}
          </DialogDescription>
        </DialogHeader>

        {/* Content */}
        <div className="w-full h-full overflow-y-scroll">
          <div className="w-full text-sm">
            {sampleQuestions.map((question) => {
              return (
                <div key={question.id} className="mt-3">
                  <h2 className="text-base font-medium mb-2">
                    {question.title}
                  </h2>
                  <p>
                    {question.id}. {question.questionText}
                  </p>

                  {/* statements holder */}
                  <div className="mt-2">
                    <ul>
                      {question.statements.map((statement) => {
                        return (
                          <li key={statement.statementNumber}>
                            ({statement.statementNumber}){" "}
                            {statement.statementText}
                          </li>
                        );
                      })}
                    </ul>
                    <p className="mt-2">{question.statementInstructions}</p>
                  </div>

                  {/* options holder */}
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
                  {question.subject && <p>Subject (optional): {question.subject}</p>}
                </div>
              );
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

import { DialogPropType } from "./format-preview-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function QuestionsPreviewDialog({
  children,
  previewData,
}: DialogPropType) {
  if (!previewData) {
    return (
      <Dialog>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent
          aria-describedby={"main"}
          className="w-[360px] lg:w-[700px] rounded-md"
        >
          <DialogTitle>No questions to preview</DialogTitle>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        aria-describedby={"main"}
        className="w-[360px] lg:w-[700px] h-[700px] lg:h-[650px] rounded-md overflow-y-hidden"
      >
        {/* header */}
        <DialogHeader className="text-left">
          <DialogTitle>
            Preview ({previewData?.totalQuestionsExtracted} questions found)
          </DialogTitle>
        </DialogHeader>

        {/* content */}
        <div className="w-full h-full overflow-y-scroll">
          <div className="w-full text-sm">
            {previewData?.preview.map((question, index) => {
              const {
                questionText,
                options,
                statements,
                statementInstruction,
              } = question;

              return (
                <div key={index} className="mt-5">
                  <p>
                    {index + 1}. {questionText}
                  </p>

                  {/* statements */}
                  {statements.length > 0 && (
                    <div className="mt-2 mb-2">
                      <ul>
                        {statements.map((statement, index) => {
                          return (
                            <li key={index}>
                              ({statement.statementNumber}){" "}
                              {statement.statementText}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}

                  {/* statement instruction */}
                  {statementInstruction && <p>{statementInstruction}</p>}

                  {/* options */}
                  <div className="mt-2 mb-2">
                    <ul>
                      {options.map((option, index) => {
                        return (
                          <li key={index}>
                            ({String.fromCharCode(65 + index).toLowerCase()}){" "}
                            {option.optionText}
                          </li>
                        );
                      })}
                    </ul>
                  </div>

                  {/* {answer && <p>Answer: {answer}</p>}
                  {explanation && <p>Explanation (optional): {explanation}</p>} */}
                </div>
              );
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

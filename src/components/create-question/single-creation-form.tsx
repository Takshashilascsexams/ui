import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Label } from "../ui/label";
import {
  difficultyLevel,
  marks,
  negativeMarks,
  questionTypes,
} from "@/utils/arrays";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import getClerkToken from "./getClerkToken";

export const addNewTestFormSchema = z
  .object({
    examId: z.string(),
    questionText: z
      .string()
      .min(10, {
        message: "A question must have at least 10 characters.",
      })
      .max(500, { message: "A question must be less than 500 characters" }),
    type: z.enum(questionTypes as [string, ...string[]], {
      message: "Invalid option selection.",
    }),
    optionA: z.string(),
    optionB: z.string(),
    optionC: z.string(),
    optionD: z.string(),
    statement1: z.string(),
    statement2: z.string(),
    statement3: z.string(),
    statement4: z.string(),
    statementInstruction: z.string(),
    correctAnswer: z.string().min(1, { message: "Correct answer is required" }),
    explanation: z.string(),
    marks: z.enum(marks as [string, ...string[]], {
      message: "Invalid option selection.",
    }),
    difficultyLevel: z.enum(difficultyLevel as [string, ...string[]], {
      message: "Invalid option selection.",
    }),
    subject: z.string(),
    hasNegativeMarking: z.enum(["Yes", "No"], {
      message: "Invalid option selection.",
    }),
    negativeMarks: z.enum(negativeMarks as [string, ...string[]], {
      message: "Invalid option selection.",
    }),
    image: z
      .instanceof(File)
      .optional()
      .refine(
        (file) => {
          if (!file) return true;
          // Check file size (limit to 5MB)
          return file.size <= 5 * 1024 * 1024;
        },
        {
          message: "Image must be less than 5MB",
        }
      )
      .refine(
        (file) => {
          if (!file) return true;
          // Check file type
          return [
            "image/jpeg",
            "image/png",
            "image/gif",
            "image/webp",
          ].includes(file.type);
        },
        {
          message: "Only JPG, PNG, GIF, and WebP image formats are allowed",
        }
      ),
  })
  .superRefine((data, ctx) => {
    // Check if statementInstruction is required for STATEMENT_BASED questions
    if (data.type === "STATEMENT_BASED") {
      if (
        !data.statementInstruction ||
        data.statementInstruction.trim().length === 0
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "Statement instruction is required for statement-based questions",
          path: ["statementInstruction"],
        });
      }

      // Check if at least 2 statements are provided for STATEMENT_BASED questions
      let validStatementCount = 0;
      if (data.statement1 && data.statement1.trim().length > 0)
        validStatementCount++;
      if (data.statement2 && data.statement2.trim().length > 0)
        validStatementCount++;
      if (data.statement3 && data.statement3.trim().length > 0)
        validStatementCount++;
      if (data.statement4 && data.statement4.trim().length > 0)
        validStatementCount++;

      if (validStatementCount < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "At least 2 statements are required for statement-based questions",
          path: ["statement1"], // We'll show the error on statement1 field
        });
      }
    }

    // Check if all options are provided for MCQ questions
    if (data.type === "MCQ") {
      if (!data.optionA || data.optionA.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Option A is required for MCQ questions",
          path: ["optionA"],
        });
      }

      if (!data.optionB || data.optionB.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Option B is required for MCQ questions",
          path: ["optionB"],
        });
      }

      if (!data.optionC || data.optionC.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Option C is required for MCQ questions",
          path: ["optionC"],
        });
      }

      if (!data.optionD || data.optionD.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Option D is required for MCQ questions",
          path: ["optionD"],
        });
      }
    }
  });

export default function CreateExamForm() {
  const [isSubmittingForm, setIsSubmittingForm] = useState<boolean>(false);
  const [currentQuestionType, setCurrentQuestionType] = useState("MCQ");

  const form = useForm<z.infer<typeof addNewTestFormSchema>>({
    resolver: zodResolver(addNewTestFormSchema),
    defaultValues: {
      examId: "",
      questionText: "",
      type: questionTypes[0],
      optionA: "",
      optionB: "",
      optionC: "",
      optionD: "",
      statement1: "",
      statement2: "",
      statement3: "",
      statement4: "",
      statementInstruction: "",
      correctAnswer: "",
      explanation: "",
      marks: marks[0],
      difficultyLevel: difficultyLevel[1],
      subject: "",
      hasNegativeMarking: "No",
      negativeMarks: negativeMarks[0],
    },
  });

  // Watch for changes to questionType
  const watchQuestionType = form.watch("type");

  // Update state when question type changes
  useEffect(() => {
    if (watchQuestionType) {
      setCurrentQuestionType(watchQuestionType);
    }
  }, [watchQuestionType]);

  const onSubmit = async (values: z.infer<typeof addNewTestFormSchema>) => {
    try {
      setIsSubmittingForm(true);

      // Format options as an array of objects with optionText and isCorrect properties
      const options = [];
      const correctOption = values.correctAnswer;

      // Add options if they exist
      if (values.optionA) {
        options.push({
          optionText: values.optionA,
          isCorrect: correctOption === "a",
        });
      }

      if (values.optionB) {
        options.push({
          optionText: values.optionB,
          isCorrect: correctOption === "b",
        });
      }

      if (values.optionC) {
        options.push({
          optionText: values.optionC,
          isCorrect: correctOption === "c",
        });
      }

      if (values.optionD) {
        options.push({
          optionText: values.optionD,
          isCorrect: correctOption === "d",
        });
      }

      // Format statements as an array of objects with statementNumber, statementText, and isCorrect properties
      const statements = [];

      // Only add statements if we have STATEMENT_BASED question type
      if (values.type === "STATEMENT_BASED") {
        // Parse the correctAnswer field to determine which statements are correct
        // Example: if correctAnswer is "1,3" then statements 1 and 3 are correct
        const correctStatements = values.correctAnswer
          .split(",")
          .map((num) => num.trim());

        if (values.statement1) {
          statements.push({
            statementNumber: 1,
            statementText: values.statement1,
            isCorrect: correctStatements.includes("1"),
          });
        }

        if (values.statement2) {
          statements.push({
            statementNumber: 2,
            statementText: values.statement2,
            isCorrect: correctStatements.includes("2"),
          });
        }

        if (values.statement3) {
          statements.push({
            statementNumber: 3,
            statementText: values.statement3,
            isCorrect: correctStatements.includes("3"),
          });
        }

        if (values.statement4) {
          statements.push({
            statementNumber: 4,
            statementText: values.statement4,
            isCorrect: correctStatements.includes("4"),
          });
        }
      }

      // Get auth token
      const clerkToken = await getClerkToken();

      // Build the payload according to your backend API requirements
      const payload = {
        examId: values.examId,
        questionText: values.questionText,
        type: values.type,
        options: options,
        statements: statements,
        statementInstruction:
          values.type === "STATEMENT_BASED" ? values.statementInstruction : "",
        marks: parseInt(values.marks),
        difficultyLevel: values.difficultyLevel,
        subject: values.subject,
        hasNegativeMarking: values.hasNegativeMarking === "Yes",
        negativeMarks: parseFloat(values.negativeMarks),
        explanation: values.explanation,
        image: "",
        correctAnswer: values.correctAnswer,
      };

      const URI = `${process.env.NEXT_PUBLIC_API_URL}/questions/single-upload`;
      const body = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${clerkToken}`,
        },
        body: JSON.stringify(payload),
      };

      // Send the payload to your backend API
      const response = await fetch(URI, body);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create question");
      }

      await response.json();

      // Reset the form after successful submission
      form.reset();

      // Show success message
      toast.success("Question created successfully");
    } catch (error) {
      console.error("Error creating question:", error);
      toast.error(
        `Error: ${
          error instanceof Error ? error.message : "Something went wrong"
        }`
      );
    } finally {
      setIsSubmittingForm(false);
    }
  };

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full flex flex-col items-center justify-center gap-5"
        >
          {/* Exam id */}
          <FormField
            control={form.control}
            name="examId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Exam Id <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter exam Id"
                    className="text-sm"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Question */}
          <FormField
            control={form.control}
            name="questionText"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Question
                  <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter question text"
                    className="text-sm"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* question type */}
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Question type
                  <span className="text-red-500">*</span>
                </FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    setCurrentQuestionType(value);
                  }}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select question type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {questionTypes.map((value, index) => {
                      return (
                        <SelectItem value={value} key={index}>
                          {value}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Statements holder - Show only when STATEMENT_BASED is selected */}
          <div
            className={`w-full transition-all duration-300 ease-in-out ${
              currentQuestionType === "STATEMENT_BASED"
                ? "max-h-[1000px] opacity-100"
                : "max-h-0 opacity-0 overflow-hidden"
            }`}
          >
            <p className="text-sm font-medium">Set statements</p>
            <div className="w-full mt-3 flex flex-col items-center justify-center gap-5">
              {/* Statement 1*/}
              <FormField
                control={form.control}
                name="statement1"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Statement 1 <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Set statement 1"
                        className="text-sm"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Statement 2 */}
              <FormField
                control={form.control}
                name="statement2"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Statement 2 <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Set statement 2"
                        className="text-sm"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Statement 3 */}
              <FormField
                control={form.control}
                name="statement3"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Statement 3 <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Set statement 3"
                        className="text-sm"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Statement 4 */}
              <FormField
                control={form.control}
                name="statement4"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Statement 4<span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Set statement 4"
                        className="text-sm"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Statement instruction */}
              <FormField
                control={form.control}
                name="statementInstruction"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Statement instruction{" "}
                      <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter the statement instruction. e.g - Choose the correct statement."
                        className="text-sm"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Options holder - Show only when MCQ is selected */}
          <div className={`w-full transition-all duration-300 ease-in-out`}>
            <p className="text-sm font-medium">Set options</p>
            <div className="w-full mt-3 flex flex-col items-center justify-center gap-5">
              {/* Option a */}
              <FormField
                control={form.control}
                name="optionA"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Option A <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Set option A"
                        className="text-sm"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Option B */}
              <FormField
                control={form.control}
                name="optionB"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Option B <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Set option B"
                        className="text-sm"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Option C */}
              <FormField
                control={form.control}
                name="optionC"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Option C <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Set option C"
                        className="text-sm"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Option D */}
              <FormField
                control={form.control}
                name="optionD"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Option D <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Set option D"
                        className="text-sm"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Correct answer */}
          <FormField
            control={form.control}
            name="correctAnswer"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Answer <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Assign the correct answer. e.g - a"
                    className="text-sm"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Explanation */}
          <FormField
            control={form.control}
            name="explanation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Explanation <span>(Optional)</span>
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter explanation for the answer"
                    className="text-sm"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* marks */}
          <FormField
            control={form.control}
            name="marks"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Marks
                  <span className="text-red-500">*</span>
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Assign marks" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {marks.map((value, index) => {
                      return (
                        <SelectItem value={value} key={index}>
                          {value}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* difficulty level */}
          <FormField
            control={form.control}
            name="difficultyLevel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Difficulty level
                  <span className="text-red-500">*</span>
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select dificulty level" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {difficultyLevel.map((value, index) => {
                      return (
                        <SelectItem value={value} key={index}>
                          {value}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* subject */}
          <FormField
            control={form.control}
            name="subject"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {"Parent subject of the question"}
                  <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter subject of the question"
                    className="text-sm"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* negative marking option */}
          <FormField
            control={form.control}
            name="hasNegativeMarking"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Has negative marking
                  <span className="text-red-500">*</span>
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select yes or no" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {["Yes", "No"].map((value, index) => {
                      return (
                        <SelectItem value={value} key={index}>
                          {value}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* negative marks */}
          <FormField
            control={form.control}
            name="negativeMarks"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Negative marking value
                  <span className="text-red-500">*</span>
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select negative marking value" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {negativeMarks.map((value, index) => {
                      return (
                        <SelectItem value={value} key={index}>
                          {value}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Image */}
          <FormField
            control={form.control}
            name="image"
            render={({ field }) => (
              <FormItem>
                <Label htmlFor="image">Question image (Optional)</Label>
                <FormControl>
                  <Input
                    type="file"
                    id="image"
                    disabled
                    className="text-sm"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    onChange={async (e) => {
                      if (e.target.files?.[0] === undefined) {
                        return;
                      }

                      const file = e.target.files?.[0];
                      field.onChange(file);

                      if (file.size > 5 * 1024 * 1024) {
                        toast.warning("Image must be less than 5MB");
                        field.onChange(undefined);
                        return;
                      }
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* create button */}
          <Button
            type="submit"
            disabled={
              Object.keys(form.formState.dirtyFields).length < 8 ||
              isSubmittingForm
            }
            className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition disabled:bg-indigo-500 disabled:cursor-not-allowed"
          >
            {isSubmittingForm ? (
              <>
                <Loader2 className="animate-spin" />
                creating
              </>
            ) : (
              "Create"
            )}
          </Button>
        </form>
      </Form>
    </>
  );
}

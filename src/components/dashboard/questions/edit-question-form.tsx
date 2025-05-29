"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, X } from "lucide-react";
import { toast, Toaster } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  marks,
  negativeMarks,
  questionTypes,
  difficultyLevel,
} from "@/utils/arrays";
import questionAdminService, {
  QuestionFormValues,
  QuestionData,
  isStatementBasedQuestion,
} from "@/services/adminQuestions.services";
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

// Zod schema using shared types - matches service exactly
const mcqQuestionSchema = z.object({
  questionText: z.string().min(10, {
    message: "Question text must be at least 10 characters.",
  }),
  type: z.literal("MCQ"),
  difficultyLevel: z.enum(["EASY", "MEDIUM", "HARD"]),
  subject: z.string().min(1, {
    message: "Subject is required",
  }),
  marks: z.string(),
  hasNegativeMarking: z.enum(["Yes", "No"]),
  negativeMarks: z.string(),
  correctAnswer: z.string().min(1, {
    message: "Correct answer is required",
  }),
  questionCode: z.string().optional(),
  options: z.array(
    z.object({
      optionText: z.string().min(1, { message: "Option text is required" }),
      isCorrect: z.boolean(),
    })
  ),
  explanation: z.string().min(1, {
    message: "Explanation is required",
  }),
  image: z.string().optional(),
});

const statementQuestionSchema = z.object({
  questionText: z.string().min(10, {
    message: "Question text must be at least 10 characters.",
  }),
  type: z.literal("STATEMENT_BASED"),
  difficultyLevel: z.enum(["EASY", "MEDIUM", "HARD"]),
  subject: z.string().min(1, {
    message: "Subject is required",
  }),
  marks: z.string(),
  hasNegativeMarking: z.enum(["Yes", "No"]),
  negativeMarks: z.string(),
  correctAnswer: z.string().min(1, {
    message: "Correct answer is required",
  }),
  questionCode: z.string().optional(),
  statementInstruction: z.string().min(1, {
    message: "Statement instruction is required",
  }),
  statements: z.array(
    z.object({
      statementNumber: z.number(),
      statementText: z
        .string()
        .min(1, { message: "Statement text is required" }),
      isCorrect: z.boolean(),
    })
  ),
  options: z.array(
    z.object({
      optionText: z.string().min(1, { message: "Option text is required" }),
      isCorrect: z.boolean(),
    })
  ),
  explanation: z.string().min(1, {
    message: "Explanation is required",
  }),
  image: z.string().optional(),
});

const questionFormSchema = z.discriminatedUnion("type", [
  mcqQuestionSchema,
  statementQuestionSchema,
]);

type FormValues = z.infer<typeof questionFormSchema>;

interface EditQuestionFormProps {
  questionId: string;
}

export default function EditQuestionForm({
  questionId,
}: EditQuestionFormProps) {
  const [isSubmittingForm, setIsSubmittingForm] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(questionFormSchema),
    defaultValues: {
      questionText: "",
      type: "MCQ",
      difficultyLevel: "MEDIUM",
      subject: "",
      marks: "1",
      hasNegativeMarking: "No",
      negativeMarks: "0",
      correctAnswer: "",
      questionCode: "",
      options: [
        { optionText: "", isCorrect: false },
        { optionText: "", isCorrect: false },
        { optionText: "", isCorrect: false },
        { optionText: "", isCorrect: false },
      ],
      statementInstruction: "",
      statements: [],
      explanation: "",
      image: "",
    } as FormValues,
  });

  const questionType = form.watch("type");

  const handleAddOption = () => {
    const currentOptions = form.getValues("options");
    form.setValue("options", [
      ...currentOptions,
      { optionText: "", isCorrect: false },
    ]);
  };

  const handleRemoveOption = (index: number) => {
    const currentOptions = form.getValues("options");
    if (currentOptions.length <= 2) {
      toast.error("At least 2 options are required");
      return;
    }

    form.setValue(
      "options",
      currentOptions.filter((_, i) => i !== index)
    );
  };

  const handleAddStatement = () => {
    const currentStatements = form.getValues("statements") || [];
    form.setValue("statements", [
      ...currentStatements,
      {
        statementNumber: currentStatements.length + 1,
        statementText: "",
        isCorrect: false,
      },
    ]);
  };

  const handleRemoveStatement = (index: number) => {
    const currentStatements = form.getValues("statements") || [];
    if (currentStatements.length <= 2) {
      toast.error("At least 2 statements are required");
      return;
    }

    const updatedStatements = currentStatements
      .filter((_, i) => i !== index)
      .map((stmt, i) => ({ ...stmt, statementNumber: i + 1 }));

    form.setValue("statements", updatedStatements);
  };

  const resetFormForType = (type: string) => {
    if (type === "STATEMENT_BASED") {
      if (
        !form.getValues("statements") ||
        form.getValues("statements").length === 0
      ) {
        form.setValue("statements", [
          { statementNumber: 1, statementText: "", isCorrect: false },
          { statementNumber: 2, statementText: "", isCorrect: false },
        ]);
        form.setValue(
          "statementInstruction",
          "How many of the above statements is/are correct?"
        );
      }
    }
  };

  // Transform QuestionData to form values
  const transformQuestionToFormValues = (
    question: QuestionData
  ): FormValues => {
    const baseValues = {
      questionText: question.questionText,
      difficultyLevel: question.difficultyLevel,
      subject: question.subject,
      marks: question.marks.toString(),
      hasNegativeMarking: question.hasNegativeMarking
        ? ("Yes" as const)
        : ("No" as const),
      negativeMarks: question.negativeMarks.toString(),
      correctAnswer: question.correctAnswer,
      questionCode: question.questionCode || "",
      explanation: question.explanation,
      image: question.image || "",
      options: question.options,
    };

    if (isStatementBasedQuestion(question)) {
      return {
        ...baseValues,
        type: "STATEMENT_BASED",
        statements: question.statements,
        statementInstruction: question.statementInstruction,
      } as FormValues;
    } else {
      return {
        ...baseValues,
        type: "MCQ",
      } as FormValues;
    }
  };

  useEffect(() => {
    const fetchQuestionData = async () => {
      try {
        setIsLoading(true);
        const response = await questionAdminService.getQuestionById(questionId);

        if (response.status === "success" && response.data.question) {
          const formValues = transformQuestionToFormValues(
            response.data.question
          );
          form.reset(formValues);
        } else {
          toast.error("Failed to fetch question data");
        }
      } catch (error) {
        console.error("Error fetching question:", error);
        toast.error("Failed to load question data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuestionData();
  }, [questionId, form]);

  const onSubmit = async (values: FormValues) => {
    try {
      setIsSubmittingForm(true);

      const hasCorrectOption = values.options.some(
        (option) => option.isCorrect
      );
      if (!hasCorrectOption) {
        toast.error("Please mark at least one option as correct");
        setIsSubmittingForm(false);
        return;
      }

      if (values.type === "STATEMENT_BASED") {
        const hasCorrectStatement = values.statements?.some(
          (statement) => statement.isCorrect
        );
        if (!hasCorrectStatement) {
          toast.error("Please mark at least one statement as correct");
          setIsSubmittingForm(false);
          return;
        }
      }

      // Use the service method which handles transformation
      await questionAdminService.updateQuestion(
        questionId,
        values as QuestionFormValues
      );

      toast.success("Question updated successfully");

      setTimeout(() => {
        router.push("/dashboard/questions");
      }, 1500);
    } catch (error) {
      console.error("Error updating question:", error);
      toast.error(
        `Error: ${
          error instanceof Error ? error.message : "Something went wrong"
        }`
      );
    } finally {
      setIsSubmittingForm(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2">Loading question data...</span>
      </div>
    );
  }

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full flex flex-col items-center justify-center gap-5"
        >
          {/* Question Text */}
          <FormField
            control={form.control}
            name="questionText"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>
                  Question Text <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter the question text"
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Question Type */}
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>
                  Question Type <span className="text-red-500">*</span>
                </FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    resetFormForType(value);
                  }}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select question type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {questionTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type === "MCQ" ? "Multiple Choice" : "Statement Based"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Difficulty Level */}
            <FormField
              control={form.control}
              name="difficultyLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Difficulty Level <span className="text-red-500">*</span>
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select difficulty" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {difficultyLevel.map((level) => (
                        <SelectItem key={level} value={level}>
                          {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Subject */}
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Subject <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Enter subject" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Marks */}
            <FormField
              control={form.control}
              name="marks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Marks <span className="text-red-500">*</span>
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select marks" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {marks.map((value) => (
                        <SelectItem key={value} value={value}>
                          {value}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Has Negative Marking */}
            <FormField
              control={form.control}
              name="hasNegativeMarking"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Has Negative Marking <span className="text-red-500">*</span>
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select option" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Yes">Yes</SelectItem>
                      <SelectItem value="No">No</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Negative Marks */}
            <FormField
              control={form.control}
              name="negativeMarks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Negative Marks <span className="text-red-500">*</span>
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select negative marks" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {negativeMarks.map((value) => (
                        <SelectItem key={value} value={value}>
                          {value}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Correct Answer */}
          <FormField
            control={form.control}
            name="correctAnswer"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>
                  Correct Answer <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter correct answer (e.g., 'a' for MCQ or '1,3' for statements)"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Question Code */}
          <FormField
            control={form.control}
            name="questionCode"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>
                  Question Code <span>(Optional)</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter question code (e.g., Q001)"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Image URL */}
          <FormField
            control={form.control}
            name="image"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>
                  Image URL <span>(Optional)</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder="Enter image URL" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Statement Instructions */}
          {questionType === "STATEMENT_BASED" && (
            <FormField
              control={form.control}
              name="statementInstruction"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>
                    Statement Instruction{" "}
                    <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="E.g., How many of the above statements is/are correct?"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Statements Section - Only for STATEMENT_BASED */}
          {questionType === "STATEMENT_BASED" && (
            <div className="w-full space-y-4">
              <div className="flex justify-between items-center">
                <FormLabel>
                  Statements <span className="text-red-500">*</span>
                </FormLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddStatement}
                  className="flex items-center"
                >
                  <Plus className="mr-1 h-4 w-4" /> Add Statement
                </Button>
              </div>

              {form.watch("statements")?.map((_, index) => (
                <div
                  key={`statement-${index}`}
                  className="flex gap-4 items-start w-full"
                >
                  <div className="flex-1">
                    <FormField
                      control={form.control}
                      name={`statements.${index}.statementText`}
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex gap-2 items-center">
                            <span className="font-medium">
                              Statement {index + 1}:
                            </span>
                          </div>
                          <FormControl>
                            <Textarea
                              placeholder={`Enter statement ${index + 1}`}
                              className="min-h-[80px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="pt-7 flex items-center gap-2">
                    <FormField
                      control={form.control}
                      name={`statements.${index}.isCorrect`}
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel className="text-sm font-normal">
                            Correct
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-700"
                      onClick={() => handleRemoveStatement(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Options Section */}
          <div className="w-full space-y-4">
            <div className="flex justify-between items-center">
              <FormLabel>
                Options <span className="text-red-500">*</span>
              </FormLabel>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddOption}
                className="flex items-center"
              >
                <Plus className="mr-1 h-4 w-4" /> Add Option
              </Button>
            </div>

            {form.watch("options").map((_, index) => (
              <div
                key={`option-${index}`}
                className="flex gap-4 items-start w-full"
              >
                <div className="flex-1">
                  <FormField
                    control={form.control}
                    name={`options.${index}.optionText`}
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex gap-2 items-center">
                          <span className="font-medium">
                            Option {String.fromCharCode(97 + index)}:
                          </span>
                        </div>
                        <FormControl>
                          <Input
                            placeholder={`Enter option ${String.fromCharCode(
                              97 + index
                            )}`}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="pt-7 flex items-center gap-2">
                  <FormField
                    control={form.control}
                    name={`options.${index}.isCorrect`}
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={(checked) => {
                              if (questionType === "MCQ" && checked) {
                                // For MCQ, only one option can be correct
                                form.setValue(
                                  "options",
                                  form.getValues("options").map((opt, i) => ({
                                    ...opt,
                                    isCorrect: i === index,
                                  }))
                                );
                              } else {
                                field.onChange(checked);
                              }
                            }}
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-normal">
                          Correct
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-700"
                    onClick={() => handleRemoveOption(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Explanation */}
          <FormField
            control={form.control}
            name="explanation"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>
                  Explanation <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter explanation for the correct answer"
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmittingForm}
            className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition disabled:bg-indigo-500 disabled:cursor-not-allowed"
          >
            {isSubmittingForm ? (
              <>
                <Loader2 className="animate-spin mr-2" />
                Updating...
              </>
            ) : (
              "Update Question"
            )}
          </Button>
        </form>
      </Form>
      <Toaster position="top-center" richColors />
    </>
  );
}

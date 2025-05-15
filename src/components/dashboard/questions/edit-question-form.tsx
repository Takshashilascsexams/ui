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
import { marks, negativeMarks, questionTypes } from "@/utils/arrays";
import questionAdminService from "@/services/adminQuestions.services";
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

// Define the form schema based on the question type
const mcqQuestionSchema = z.object({
  questionText: z.string().min(10, {
    message: "Question text must be at least 10 characters.",
  }),
  type: z.enum(["MCQ", "STATEMENT_BASED"]),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]),
  category: z.string().min(1, {
    message: "Category is required",
  }),
  marks: z.string(),
  negativeMarks: z.string(),
  options: z.array(
    z.object({
      optionText: z.string().min(1, { message: "Option text is required" }),
      isCorrect: z.boolean(),
    })
  ),
  explanation: z.string().min(1, {
    message: "Explanation is required",
  }),
});

const statementQuestionSchema = z.object({
  questionText: z.string().min(10, {
    message: "Question text must be at least 10 characters.",
  }),
  type: z.enum(["MCQ", "STATEMENT_BASED"]),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]),
  category: z.string().min(1, {
    message: "Category is required",
  }),
  marks: z.string(),
  negativeMarks: z.string(),
  statementInstructions: z.string().min(1, {
    message: "Statement instructions are required",
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
});

// Discriminated union to select the correct schema based on the question type
const questionFormSchema = z.discriminatedUnion("type", [
  mcqQuestionSchema.extend({ type: z.literal("MCQ") }),
  statementQuestionSchema.extend({ type: z.literal("STATEMENT_BASED") }),
]);

type QuestionFormValues = z.infer<typeof questionFormSchema>;

interface EditQuestionFormProps {
  questionId: string;
}

export default function EditQuestionForm({
  questionId,
}: EditQuestionFormProps) {
  const [isSubmittingForm, setIsSubmittingForm] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  // Define form with default values
  const form = useForm<QuestionFormValues>({
    resolver: zodResolver(questionFormSchema),
    defaultValues: {
      questionText: "",
      type: "MCQ",
      difficulty: "MEDIUM",
      category: "",
      marks: "1",
      negativeMarks: "0",
      options: [
        { optionText: "", isCorrect: false },
        { optionText: "", isCorrect: false },
        { optionText: "", isCorrect: false },
        { optionText: "", isCorrect: false },
      ],
      // Add these defaults for statement-based questions
      statementInstructions: "",
      statements: [],
      explanation: "",
    } as QuestionFormValues,
  });

  // Get the current question type to conditionally render form fields
  const questionType = form.watch("type");

  // Handle adding a new option for MCQs
  const handleAddOption = () => {
    const currentOptions = form.getValues("options");
    form.setValue("options", [
      ...currentOptions,
      { optionText: "", isCorrect: false },
    ]);
  };

  // Handle removing an option
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

  // Handle adding a new statement for statement-based questions
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

  // Handle removing a statement
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
      // Ensure statements array exists when switching to statement-based
      if (
        !form.getValues("statements") ||
        form.getValues("statements").length === 0
      ) {
        form.setValue("statements", [
          { statementNumber: 1, statementText: "", isCorrect: false },
          { statementNumber: 2, statementText: "", isCorrect: false },
        ]);
        form.setValue(
          "statementInstructions",
          "How many of the above statements is/are correct?"
        );
      }
    }
  };

  // Fetch question data and populate form
  useEffect(() => {
    const fetchQuestionData = async () => {
      try {
        setIsLoading(true);
        const response = await questionAdminService.getQuestionById(questionId);

        if (response.status === "success" && response.data.question) {
          const question = response.data.question;

          // Handle statement-based question type
          if (question.type === "STATEMENT_BASED") {
            form.reset({
              questionText: question.questionText,
              type: question.type,
              difficulty: question.difficulty,
              category: question.category,
              marks: question.marks.toString(),
              negativeMarks: question.negativeMarks.toString(),
              statementInstructions: question.statementInstructions || "",
              statements: question.statements || [],
              options: question.options || [],
              explanation: question.explanation,
            });
          } else {
            // Handle MCQ question type
            form.reset({
              questionText: question.questionText,
              type: question.type,
              difficulty: question.difficulty,
              category: question.category,
              marks: question.marks.toString(),
              negativeMarks: question.negativeMarks.toString(),
              options: question.options || [],
              explanation: question.explanation,
            });
          }
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

  const onSubmit = async (values: QuestionFormValues) => {
    try {
      setIsSubmittingForm(true);

      // Ensure at least one option is marked as correct
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

      // Transform form values to API expected format
      const questionData = {
        ...values,
        marks: parseInt(values.marks),
        negativeMarks: parseFloat(values.negativeMarks),
      };

      // Update question
      await questionAdminService.updateQuestion(questionId, questionData);

      toast.success("Question updated successfully");

      // Navigate back to questions page
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

          {/* Difficulty */}
          <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-5">
            <FormField
              control={form.control}
              name="difficulty"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Difficulty <span className="text-red-500">*</span>
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select difficulty" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="EASY">Easy</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="HARD">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Category */}
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Category <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Enter category" {...field} />
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

          {/* Negative Marks */}
          <FormField
            control={form.control}
            name="negativeMarks"
            render={({ field }) => (
              <FormItem className="w-full">
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

          {/* Statement Instructions (for STATEMENT_BASED questions) */}
          {questionType === "STATEMENT_BASED" && (
            <FormField
              control={form.control}
              name="statementInstructions"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>
                    Statement Instructions{" "}
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

          {/* Statements (for STATEMENT_BASED questions) */}
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

          {/* Options */}
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
                              // For MCQ, only one option can be correct
                              if (questionType === "MCQ" && checked) {
                                // Direct assignment without intermediate variable
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

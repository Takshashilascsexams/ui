import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { difficultyLevel, testCategory } from "@/utils/arrays";
import { createNewExam } from "@/actions/createNewExam";
import { revalidateTestSeries } from "@/actions/fetchTestSeries";
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

const addNewTestFormSchema = z
  .object({
    title: z
      .string()
      .min(6, {
        message: "Test title / subject must be at least 6 characters.",
      })
      .max(100, { message: "Exam title must have less than 100 characters" }),
    description: z
      .string()
      .min(10, {
        message: "Description must be at least 10 characters.",
      })
      .max(300, {
        message: "Exam description must have less than 300 characters",
      }),
    duration: z.string().refine(
      (val) => {
        const durationInMinutes = parseInt(val);
        return !isNaN(durationInMinutes) && durationInMinutes >= 30;
      },
      {
        message: "Exam duration should not be less than 30 mins",
      }
    ),
    totalQuestions: z.string().refine(
      (val) => {
        const questionCount = parseInt(val);
        return !isNaN(questionCount) && questionCount >= 10;
      },
      {
        message: "Each exam should include at least 10 questions.",
      }
    ),
    totalMarks: z.string().refine(
      (val) => {
        const marks = parseInt(val);
        return !isNaN(marks) && marks >= 10;
      },
      {
        message: "Each exam should be of at least 10 marks in total",
      }
    ),
    hasNegativeMarking: z.enum(["Yes", "No"], {
      message: "Invalid option selection.",
    }),
    negativeMarkingValue: z.string().refine(
      (val) => {
        const numVal = parseFloat(val);
        return (
          !isNaN(numVal) && (numVal === 0 || numVal === 0.25 || numVal === 0.5)
        );
      },
      {
        message: "Negative marking value must be either 0, 0.25 or 0.5.",
      }
    ),
    passMarkPercentage: z.string(),
    difficultyLevel: z.enum(difficultyLevel as [string, ...string[]], {
      message: "Invalid selection.",
    }),
    category: z.enum(testCategory as [string, ...string[]], {
      message: "Invalid selection.",
    }),
    allowNavigation: z.enum(["Yes", "No"], {
      message: "Invalid option selection.",
    }),
  })
  .refine(
    (data) => {
      const passPercentage = parseInt(data.passMarkPercentage);
      const totalMarks = parseInt(data.totalMarks);

      return (
        !isNaN(passPercentage) &&
        !isNaN(totalMarks) &&
        passPercentage >= totalMarks * 0.35
      );
    },
    {
      message: "Pass percentage should be at least 35% of total marks.",
      path: ["passMarkPercentage"], // This targets the error at the passMarkPercentage field
    }
  );

export default function CreateExamForm() {
  const [error, setError] = useState<string>("");
  const [isSubmittingForm, setIsSubmittingForm] = useState<boolean>(false);

  const form = useForm<z.infer<typeof addNewTestFormSchema>>({
    resolver: zodResolver(addNewTestFormSchema),
    defaultValues: {
      title: "",
      description: "",
      duration: "",
      totalQuestions: "",
      totalMarks: "",
      hasNegativeMarking: "No",
      negativeMarkingValue: "0",
      passMarkPercentage: "",
      difficultyLevel: difficultyLevel[1],
      category: testCategory[0],
      allowNavigation: "No",
    },
  });

  const onSubmit = async (values: z.infer<typeof addNewTestFormSchema>) => {
    try {
      setIsSubmittingForm(true);
      setError("");

      await createNewExam(values);
      form.reset();
      toast.success("A new test has been created");

      // Revalidate the test series data after creation
      await revalidateTestSeries();
    } catch (error) {
      console.log(error);
      toast.error("Uh oh! Something went wrong.");
      setError((error as Error).message || "Failed to create a new test.");
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
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Title / Subject <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter test title"
                    className="text-sm"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Description
                  <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter test description"
                    className="text-sm"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="duration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {"Exam duration (in mins)"}
                  <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Set exam duration"
                    className="text-sm"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="totalQuestions"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Total number of questions{" "}
                  <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Set total number of questions"
                    className="text-sm"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="totalMarks"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Total marks
                  <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Set total marks"
                    className="text-sm"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="hasNegativeMarking"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Negative marking
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

          <FormField
            control={form.control}
            name="negativeMarkingValue"
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
                    {["0", "0.25", "0.5"].map((value, index) => {
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

          <FormField
            control={form.control}
            name="passMarkPercentage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Pass mark
                  <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Set a pass mark"
                    className="text-sm"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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
                      <SelectValue placeholder="Select difficulty level" />
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

          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Category
                  <span className="text-red-500">*</span>
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select test category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {testCategory.map((value, index) => {
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

          <FormField
            control={form.control}
            name="allowNavigation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Allow navigation (Allow going to previous question)
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

          <div className="w-full">
            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={
              Object.keys(form.formState.dirtyFields).length < 6 ||
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

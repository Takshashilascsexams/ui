import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { difficultyLevel, testCategory } from "@/utils/arrays";
import getClerkToken from "@/actions/getClerkToken";
import { revalidateTestSeries } from "@/actions/server/fetchTestSeries";
import { revalidateCategorizedExams } from "@/actions/client/fetchCategorizedExams";
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
    isFeatured: z.enum(["Yes", "No"], {
      message: "Invalid option selection.",
    }),
    isPremium: z.enum(["Yes", "No"], {
      message: "Invalid option selection.",
    }),
    price: z.string().refine(
      (val) => {
        if (val === undefined || val === "") return true;
        const priceValue = parseFloat(val);
        return !isNaN(priceValue) && priceValue > 0;
      },
      {
        message: "Price must be greater than 0",
      }
    ),
    discountPrice: z.string().refine(
      (val) => {
        if (val === undefined || val === "") return true;
        const discountPrice = parseFloat(val);
        return !isNaN(discountPrice) && discountPrice >= 0;
      },
      {
        message: "Discount price must be greater than 0.",
      }
    ),
    accessPeriod: z.string(),
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
      path: ["passMarkPercentage"],
    }
  )
  .refine(
    (data) => {
      if (data.isPremium === "Yes") {
        const price = parseFloat(data.price || "0");
        return !isNaN(price) && price > 0;
      }
      return true;
    },
    {
      message:
        "Price is required for premium exams and must be greater than 0.",
      path: ["price"],
    }
  )
  .refine(
    (data) => {
      if (data.isPremium === "Yes" && data.price && data.discountPrice) {
        const price = parseFloat(data.price);
        const discountPrice = parseFloat(data.discountPrice);
        return discountPrice < price;
      }
      return true;
    },
    {
      message: "Discount price cannot be greater or equal to original price.",
      path: ["discountPrice"],
    }
  );

export default function CreateExamForm() {
  const [isSubmittingForm, setIsSubmittingForm] = useState<boolean>(false);

  const form = useForm<z.infer<typeof addNewTestFormSchema>>({
    resolver: zodResolver(addNewTestFormSchema),
    defaultValues: {
      title: "",
      description: "",
      duration: "60",
      totalQuestions: "100",
      totalMarks: "100",
      hasNegativeMarking: "No",
      negativeMarkingValue: "0",
      passMarkPercentage: "35",
      difficultyLevel: difficultyLevel[1],
      category: testCategory[0],
      allowNavigation: "No",
      isFeatured: "No",
      isPremium: "No",
      price: "100",
      discountPrice: "0",
      accessPeriod: "0",
    },
  });

  // Watch the isPremium field to conditionally show/hide price fields
  const isPremium = form.watch("isPremium");

  const onSubmit = async (values: z.infer<typeof addNewTestFormSchema>) => {
    try {
      setIsSubmittingForm(true);

      // If not premium, clear price fields before submitting
      if (values.isPremium === "No") {
        values.price = "";
        values.discountPrice = "";
        values.accessPeriod = "0";
      }

      const clerkToken = await getClerkToken();
      const URI = `${process.env.NEXT_PUBLIC_API_URL}/exam`;
      const body = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${clerkToken}`,
        },
        body: JSON.stringify(values),
      };

      const response = await fetch(URI, body);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create question");
      }

      // const data = await response.json();
      // console.log(data);

      form.reset();
      toast.success("A new test has been created");
      // Revalidate
      await revalidateTestSeries();
      await revalidateCategorizedExams();
    } catch (error) {
      console.log(error);
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
          {/* title */}
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

          {/* description */}
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

          {/* duration */}
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

          {/* total questions */}
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

          {/* total marks */}
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

          {/* negative marking */}
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

          {/* negative marking value */}
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

          {/* pass percentage */}
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

          {/* category */}
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

          {/* allow navigation */}
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

          {/* Featured */}
          <FormField
            control={form.control}
            name="isFeatured"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Featured Exam
                  <span className="text-red-500">*</span>
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Is this a featured exam?" />
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

          {/* New Feature: isPremium field */}
          <FormField
            control={form.control}
            name="isPremium"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Premium Exam
                  <span className="text-red-500">*</span>
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Is this a premium exam?" />
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

          {/* Conditional Price Fields - only show if isPremium is "Yes" */}
          {isPremium === "Yes" && (
            <div className="w-full flex flex-col gap-5 border p-4 rounded-lg bg-gray-50">
              {/* Price */}
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        // step="0.01"
                        placeholder="Enter price"
                        className="text-sm"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* discount price */}
              <FormField
                control={form.control}
                name="discountPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Discount Price</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        // step="0.01"
                        placeholder="Enter discount price (if applicable)"
                        className="text-sm"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* access period */}
              <FormField
                control={form.control}
                name="accessPeriod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Access period (in days) </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="e.g - 30"
                        className="text-sm"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {/* button */}
          <Button
            type="submit"
            disabled={
              Object.keys(form.formState.dirtyFields).length < 2 ||
              isSubmittingForm
            }
            className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition disabled:bg-indigo-500 disabled:cursor-not-allowed"
          >
            {isSubmittingForm ? (
              <>
                <Loader2 className="animate-spin mr-2" />
                Creating...
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

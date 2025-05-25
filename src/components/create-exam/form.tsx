import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { difficultyLevel, testCategory, bundleTagName } from "@/utils/arrays";
import getClerkToken from "@/actions/client/getClerkToken";
import { revalidateTestSeries } from "@/actions/client/fetchLatestExams";
import { revalidateCategorizedExams } from "@/actions/client/fetchCategorizedExams";
import { Checkbox } from "../ui/checkbox";
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
        return !isNaN(durationInMinutes) && durationInMinutes >= 15;
      },
      {
        message: "Exam duration should not be less than 15 mins",
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
    allowMultipleAttempts: z.boolean(),
    maxAttempt: z.string().refine(
      (val) => {
        const maxAttempts = parseInt(val);
        return !isNaN(maxAttempts) && maxAttempts >= 1 && maxAttempts <= 2;
      },
      {
        message: "Maximum attempts must be between 1 and 2.",
      }
    ),
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
    isPartOfBundle: z.boolean(),
    bundleTag: z.string(),
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
      message: "Pass mark percentage should be at least 30% of total marks.",
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
  )
  .refine(
    (data) => {
      if (data.isPartOfBundle) {
        return data.bundleTag && data.bundleTag.trim() !== "";
      }
      return true;
    },
    {
      message: "Bundle tag is required when exam is part of a bundle.",
      path: ["bundleTag"],
    }
  )
  .refine(
    (data) => {
      if (data.isPartOfBundle && data.bundleTag) {
        return bundleTagName.includes(data.bundleTag);
      }
      return true;
    },
    {
      message: "Please select a valid bundle tag.",
      path: ["bundleTag"],
    }
  )
  .refine(
    (data) => {
      if (!data.allowMultipleAttempts) {
        const maxAttempts = parseInt(data.maxAttempt);
        return maxAttempts === 1;
      }
      return true;
    },
    {
      message:
        "When multiple attempts are not allowed, maximum attempts should be 1.",
      path: ["maxAttempt"],
    }
  )
  .refine(
    (data) => {
      if (data.allowMultipleAttempts) {
        const maxAttempts = parseInt(data.maxAttempt);
        return maxAttempts > 1;
      }
      return true;
    },
    {
      message:
        "When multiple attempts are allowed, maximum attempts should be greater than 1.",
      path: ["maxAttempt"],
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
      allowMultipleAttempts: false,
      maxAttempt: "1",
      isFeatured: "No",
      isPremium: "No",
      price: "100",
      discountPrice: "0",
      accessPeriod: "0",
      isPartOfBundle: false,
      bundleTag: "",
    },
  });

  // Watch the isPremium field to conditionally show/hide price fields
  const isPremium = form.watch("isPremium");
  const isPartOfBundle = form.watch("isPartOfBundle");
  const allowMultipleAttempts = form.watch("allowMultipleAttempts");

  const onSubmit = async (values: z.infer<typeof addNewTestFormSchema>) => {
    try {
      setIsSubmittingForm(true);

      // If not premium, clear price fields before submitting
      if (values.isPremium === "No") {
        values.price = "";
        values.discountPrice = "";
        values.accessPeriod = "0";
      }

      // If not part of a bundle, clear bundle tag
      if (!values.isPartOfBundle) {
        values.bundleTag = "";
      }

      // Auto-adjust maxAttempt based on allowMultipleAttempts
      if (!values.allowMultipleAttempts) {
        values.maxAttempt = "1";
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
                  Pass mark percentage
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

          {/* ✅ NEW: Allow Multiple Attempts */}
          <FormField
            control={form.control}
            name="allowMultipleAttempts"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center space-x-2">
                  <FormControl>
                    <Checkbox
                      id="allowMultipleAttempts"
                      checked={field.value}
                      onCheckedChange={(checked) => {
                        field.onChange(checked);
                        // ✅ NEW: Auto-adjust maxAttempt when allowMultipleAttempts changes
                        if (!checked) {
                          form.setValue("maxAttempt", "1");
                        } else {
                          form.setValue("maxAttempt", "2");
                        }
                      }}
                    />
                  </FormControl>
                  <FormLabel htmlFor="allowMultipleAttempts">
                    Allow multiple attempts
                  </FormLabel>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* ✅ NEW: Max Attempt - Only show when allowMultipleAttempts is true */}
          {allowMultipleAttempts && (
            <FormField
              control={form.control}
              name="maxAttempt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Maximum attempts allowed
                    <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="2"
                      max="2"
                      placeholder="Enter maximum attempts (2)"
                      className="text-sm"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                  <p className="text-xs text-gray-500 mt-1">
                    Students can attempt this exam up to {field.value || "X"}{" "}
                    times
                  </p>
                </FormItem>
              )}
            />
          )}

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

          {/* Is part of bundle */}
          <FormField
            control={form.control}
            name="isPartOfBundle"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Checkbox
                    id="isPartOfBundle"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel className="ml-2">
                  This exam is part of a bundle
                </FormLabel>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Bundle Tag - Changed from Input to Select */}
          {isPartOfBundle && (
            <FormField
              control={form.control}
              name="bundleTag"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Bundle tag name <span className="text-red-500">*</span>
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select bundle tag" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {bundleTagName.map((value, index) => {
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

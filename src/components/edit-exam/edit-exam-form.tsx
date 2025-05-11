"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast, Toaster } from "sonner";
import { difficultyLevel, testCategory } from "@/utils/arrays";
import { Checkbox } from "@/components/ui/checkbox";
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
import examAdminService from "@/services/adminExam.services";

const editExamFormSchema = z
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

interface EditExamFormProps {
  examId: string;
}

export default function EditExamForm({ examId }: EditExamFormProps) {
  const [isSubmittingForm, setIsSubmittingForm] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  const form = useForm<z.infer<typeof editExamFormSchema>>({
    resolver: zodResolver(editExamFormSchema),
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
      isFeatured: "No",
      isPremium: "No",
      price: "",
      discountPrice: "",
      accessPeriod: "",
      isPartOfBundle: false,
      bundleTag: "",
    },
  });

  // Watch the isPremium field to conditionally show/hide price fields
  const isPremium = form.watch("isPremium");
  const isPartOfBundle = form.watch("isPartOfBundle");

  // Fetch exam data and populate form
  useEffect(() => {
    const fetchExamData = async () => {
      try {
        setIsLoading(true);
        const response = await examAdminService.getExamById(examId);

        if (response.status === "success" && response.data.exam) {
          const exam = response.data.exam;

          // Transform API data to form values
          form.reset({
            title: exam.title,
            description: exam.description,
            duration: exam.duration.toString(),
            totalQuestions: exam.totalQuestions.toString(),
            totalMarks: exam.totalMarks.toString(),
            hasNegativeMarking: exam.hasNegativeMarking ? "Yes" : "No",
            negativeMarkingValue: exam.negativeMarkingValue?.toString() || "0",
            passMarkPercentage: exam.passMarkPercentage.toString(),
            difficultyLevel: exam.difficultyLevel,
            category: exam.category,
            allowNavigation: exam.allowNavigation ? "Yes" : "No",
            isFeatured: exam.isFeatured ? "Yes" : "No",
            isPremium: exam.isPremium ? "Yes" : "No",
            price: exam.price ? exam.price.toString() : "",
            discountPrice: exam.discountPrice
              ? exam.discountPrice.toString()
              : "",
            accessPeriod: exam.accessPeriod
              ? exam.accessPeriod.toString()
              : "0",
            isPartOfBundle: exam.bundleTags && exam.bundleTags.length > 0,
            bundleTag:
              exam.bundleTags && exam.bundleTags.length > 0
                ? exam.bundleTags[0]
                : "",
          });
        } else {
          toast.error("Failed to fetch exam data");
        }
      } catch (error) {
        console.error("Error fetching exam:", error);
        toast.error("Failed to load exam data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchExamData();
  }, [examId, form]);

  const onSubmit = async (values: z.infer<typeof editExamFormSchema>) => {
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

      // Transform form values to API expected format
      const examData = {
        title: values.title,
        description: values.description,
        duration: parseInt(values.duration),
        totalQuestions: parseInt(values.totalQuestions),
        totalMarks: parseInt(values.totalMarks),
        hasNegativeMarking: values.hasNegativeMarking === "Yes",
        negativeMarkingValue: parseFloat(values.negativeMarkingValue),
        passMarkPercentage: parseInt(values.passMarkPercentage),
        difficultyLevel: values.difficultyLevel,
        category: values.category,
        allowNavigation: values.allowNavigation === "Yes",
        isFeatured: values.isFeatured === "Yes",
        isPremium: values.isPremium === "Yes",
        price: values.price ? parseFloat(values.price) : 0,
        discountPrice: values.discountPrice
          ? parseFloat(values.discountPrice)
          : 0,
        accessPeriod: values.accessPeriod ? parseInt(values.accessPeriod) : 0,
        bundleTags:
          values.isPartOfBundle && values.bundleTag ? [values.bundleTag] : [],
        isActive: true, // Add the required isActive property
      };

      // Update exam
      await examAdminService.updateExam(examId, examData);

      toast.success("Exam updated successfully");

      // Navigate back to exams page
      setTimeout(() => {
        router.push("/dashboard/exams");
      }, 1500);
    } catch (error) {
      console.error("Error updating exam:", error);
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
        <span className="ml-2">Loading exam data...</span>
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
                <Select onValueChange={field.onChange} value={field.value}>
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
                <Select onValueChange={field.onChange} value={field.value}>
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
                <Select onValueChange={field.onChange} value={field.value}>
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
                <Select onValueChange={field.onChange} value={field.value}>
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
                <Select onValueChange={field.onChange} value={field.value}>
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
                <Select onValueChange={field.onChange} value={field.value}>
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
                <Select onValueChange={field.onChange} value={field.value}>
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

          {/* Bundle Tag */}
          {isPartOfBundle && (
            <FormField
              control={form.control}
              name="bundleTag"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bundle tag name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Bundle tag name"
                      className="text-sm"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* button */}
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
              "Update Exam"
            )}
          </Button>
        </form>
      </Form>
      <Toaster position="top-center" richColors />
    </>
  );
}

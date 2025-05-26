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
import { difficultyLevel, testCategory, bundleTagName } from "@/utils/arrays";
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
  )
  .refine(
    (data) => {
      // Bundle tag is required when isPartOfBundle is true
      if (data.isPartOfBundle) {
        return data.bundleTag && data.bundleTag.trim().length > 0;
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
      allowMultipleAttempts: false,
      maxAttempt: "1",
      isFeatured: "No",
      isPremium: "No",
      price: "",
      discountPrice: "",
      accessPeriod: "",
      isPartOfBundle: false,
      bundleTag: "",
    },
  });

  // Watch the fields to conditionally show/hide sections
  const isPremium = form.watch("isPremium");
  const isPartOfBundle = form.watch("isPartOfBundle");
  const allowMultipleAttempts = form.watch("allowMultipleAttempts");

  // Effect to handle allowMultipleAttempts changes
  useEffect(() => {
    if (!allowMultipleAttempts) {
      form.setValue("maxAttempt", "1");
    }
  }, [allowMultipleAttempts, form]);

  // Helper function to determine if exam is part of bundle based on MongoDB data
  const determineIsPartOfBundle = (
    bundleTags: string[] | undefined
  ): boolean => {
    if (!bundleTags || !Array.isArray(bundleTags) || bundleTags.length === 0) {
      return false;
    }

    // Check if there's at least one non-empty bundle tag
    return bundleTags.some((tag) => tag && tag.trim().length > 0);
  };

  // Helper function to get the first valid bundle tag
  const getFirstValidBundleTag = (bundleTags: string[] | undefined): string => {
    if (!bundleTags || !Array.isArray(bundleTags) || bundleTags.length === 0) {
      return "";
    }

    // Find the first non-empty bundle tag that exists in bundleTagName array
    const validTag = bundleTags.find(
      (tag) => tag && tag.trim().length > 0 && bundleTagName.includes(tag)
    );
    return validTag || "";
  };

  // Fetch exam data and populate form
  useEffect(() => {
    const fetchExamData = async () => {
      try {
        setIsLoading(true);
        const response = await examAdminService.getExamById(examId);

        if (response.status === "success" && response.data.exam) {
          const exam = response.data.exam;

          // Determine bundle status based on actual data
          const isExamPartOfBundle = determineIsPartOfBundle(exam.bundleTags);
          const bundleTagValue = getFirstValidBundleTag(exam.bundleTags);

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
            allowMultipleAttempts: Boolean(exam.allowMultipleAttempts),
            maxAttempt: exam.maxAttempt ? exam.maxAttempt.toString() : "1",
            isFeatured: exam.isFeatured ? "Yes" : "No",
            isPremium: exam.isPremium ? "Yes" : "No",
            price: exam.price ? exam.price.toString() : "",
            discountPrice: exam.discountPrice
              ? exam.discountPrice.toString()
              : "",
            accessPeriod: exam.accessPeriod
              ? exam.accessPeriod.toString()
              : "0",
            isPartOfBundle: isExamPartOfBundle,
            bundleTag: bundleTagValue,
          });

          // Force form validation after reset
          setTimeout(() => {
            form.trigger();
          }, 100);
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

      // Auto-adjust maxAttempt based on allowMultipleAttempts
      if (!values.allowMultipleAttempts) {
        values.maxAttempt = "1";
      } else if (values.allowMultipleAttempts && values.maxAttempt === "1") {
        values.maxAttempt = "2";
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
        isPartOfBundle: values.isPartOfBundle,
        bundleTag:
          values.isPartOfBundle && values.bundleTag.trim()
            ? values.bundleTag.trim()
            : "",
        isActive: true,
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

  console.log(form);

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

          {/* Allow Multiple Attempts */}
          <FormField
            control={form.control}
            name="allowMultipleAttempts"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center space-x-2">
                  <FormControl>
                    <Checkbox
                      checked={Boolean(field.value)}
                      onCheckedChange={(checked) => {
                        const checkedValue = Boolean(checked);
                        field.onChange(checkedValue);

                        // Auto-adjust maxAttempt when allowMultipleAttempts changes
                        if (!checkedValue) {
                          form.setValue("maxAttempt", "1", {
                            shouldValidate: true,
                          });
                        } else {
                          // Only set to "2" if current value is "1"
                          const currentMaxAttempt =
                            form.getValues("maxAttempt");
                          if (currentMaxAttempt === "1") {
                            form.setValue("maxAttempt", "2", {
                              shouldValidate: true,
                            });
                          }
                        }
                      }}
                    />
                  </FormControl>
                  <FormLabel>Allow multiple attempts</FormLabel>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Max Attempt - Show when allowMultipleAttempts is true OR when loading existing data */}
          {(allowMultipleAttempts || form.getValues("maxAttempt") !== "1") && (
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
                      min="1"
                      max="2"
                      placeholder="Enter maximum attempts"
                      className="text-sm"
                      {...field}
                      disabled={!allowMultipleAttempts}
                    />
                  </FormControl>
                  <FormMessage />
                  <p className="text-xs text-gray-500 mt-1">
                    {allowMultipleAttempts
                      ? `Students can attempt this exam up to ${
                          field.value || "X"
                        } times`
                      : "Multiple attempts are disabled - maximum attempts set to 1"}
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
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>This exam is part of a bundle</FormLabel>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Bundle Tag - Select dropdown like in CreateExamForm */}
          {isPartOfBundle && (
            <FormField
              control={form.control}
              name="bundleTag"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Bundle tag name <span className="text-red-500">*</span>
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
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

import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import previewBulkQuestionsUpload from "@/actions/server/previewBulkQuestionsUpload";
import { PreviewDataType } from "./hero";
import { marks, difficultyLevel, negativeMarks } from "@/utils/arrays";
import axiosInstance from "@/lib/axoisInstance";
import getClerkToken from "@/actions/client/getClerkToken";
import { ArrowUpCircle, CheckCircle2 } from "lucide-react";
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

type BulkCreationFormPropType = {
  children: React.ReactNode;
  setPreviewData: React.Dispatch<React.SetStateAction<PreviewDataType | null>>;
};

export const addNewTestFormSchema = z.object({
  examId: z.string(),
  questionsFileJson: z
    .instanceof(File)
    .refine(
      (file) => file.size <= 10485760, // 10MB limit (10 * 1024 * 1024)
      "File size should be less than 10MB"
    )
    .refine(
      (file) => ["application/json"].includes(file.type),
      "Only JSON files are allowed"
    ),
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
  negativeMarks: z.string().refine(
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
});

// parse json file
const readFileAsJSON = (file: File): Promise<Record<string, unknown>> => {
  return new Promise((resolve, reject) => {
    const reader: FileReader = new FileReader();

    reader.onload = (event: ProgressEvent<FileReader>) => {
      try {
        if (event.target?.result) {
          const jsonData: Record<string, unknown> = JSON.parse(
            event.target.result as string
          );
          resolve(jsonData);
        } else {
          reject(new Error("Failed to read file content"));
        }
      } catch (error) {
        console.log(error);
        reject(new Error("Failed to parse JSON file"));
      }
    };

    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(file);
  });
};

export default function BulkCreationForm({
  setPreviewData,
  children,
}: BulkCreationFormPropType) {
  const [isSubmittingForm, setIsSubmittingForm] = useState<boolean>(false);

  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentBatch, setCurrentBatch] = useState(0);
  const [totalBatches, setTotalBatches] = useState(0);

  const form = useForm<z.infer<typeof addNewTestFormSchema>>({
    resolver: zodResolver(addNewTestFormSchema),
    defaultValues: {
      examId: "",
      marks: marks[0],
      difficultyLevel: difficultyLevel[1],
      subject: "",
      hasNegativeMarking: "No",
      negativeMarks: negativeMarks[0],
    },
  });

  const onSubmit = async (values: z.infer<typeof addNewTestFormSchema>) => {
    try {
      setIsSubmittingForm(true);
      setUploadProgress(0);
      setCurrentBatch(0);

      // Read the JSON file content
      const fileContent = await readFileAsJSON(values.questionsFileJson);

      if (!Array.isArray(fileContent)) {
        toast.error("Invalid file format. Expected an array of questions.");
        setIsSubmittingForm(false);
        return;
      }

      // Define batch parameters
      const totalQuestions = fileContent.length;
      const BATCH_SIZE = 10; // Upload 10 questions at a time
      const batches = Math.ceil(totalQuestions / BATCH_SIZE);
      setTotalBatches(batches);

      let processedCount = 0;
      const failedBatches = [];

      // Process in batches
      for (let i = 0; i < totalQuestions; i += BATCH_SIZE) {
        // Update current batch number
        setCurrentBatch(Math.floor(i / BATCH_SIZE) + 1);

        // Get current batch
        const batch = fileContent.slice(
          i,
          Math.min(i + BATCH_SIZE, totalQuestions)
        );

        try {
          // Get auth token
          const clerkToken = await getClerkToken();

          const body = {
            questionsArray: batch,
            examId: values.examId,
            marks: values.marks,
            difficultyLevel: values.difficultyLevel,
            subject: values.subject,
            hasNegativeMarking: values.hasNegativeMarking,
            negativeMarks: values.negativeMarks,
          };

          // Make API request
          const URI = `${process.env.NEXT_PUBLIC_API_URL}/questions/bulk`;
          await axiosInstance.post(URI, body, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${clerkToken}`,
            },
            timeout: 30000, // 30 seconds timeout per batch
          });

          // Update progress
          processedCount += batch.length;
          const progress = Math.round((processedCount / totalQuestions) * 100);
          setUploadProgress(progress);

          // Optional: Add a small delay between batches
          if (i + BATCH_SIZE < totalQuestions) {
            await new Promise((resolve) => setTimeout(resolve, 500));
          }
        } catch (error) {
          console.error(
            `Error uploading batch ${i}-${i + batch.length}:`,
            error
          );
          failedBatches.push({
            startIndex: i,
            endIndex: Math.min(i + BATCH_SIZE, totalQuestions),
            error: error instanceof Error ? error.message : "Unknown error",
          });
          // Continue with next batch instead of stopping completely
        }
      }

      // Show final results
      if (failedBatches.length > 0) {
        toast.warning(
          `Upload completed with some errors. ${processedCount} of ${totalQuestions} questions uploaded.`
        );
        console.error("Failed batches:", failedBatches);
      } else {
        toast.success(`Successfully uploaded all ${processedCount} questions!`);
        form.reset();
      }
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : "Uh oh! Something went wrong."
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
          {/* Instruction */}
          <div className="w-full flex relative">
            <p className="text-sm font-medium">
              Step 1: Upload the Questions File (JSON Format).
            </p>
            <span className="text-red-500">*</span>
            {children}
          </div>

          {/* Upload file in json format */}
          <FormField
            control={form.control}
            name="questionsFileJson"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    type="file"
                    className="text-sm"
                    accept="application/json,.json"
                    onChange={async (e) => {
                      if (e.target.files?.[0] === undefined) {
                        setPreviewData(null);
                        return;
                      }

                      const file = e.target.files?.[0];
                      field.onChange(file);
                      const data = await previewBulkQuestionsUpload(
                        file as File
                      );

                      if (data.message) {
                        toast.warning(data.message);
                        setPreviewData(null);
                        return;
                      }
                      setPreviewData(data.data);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Instruction */}
          <div className="w-full">
            <p className="text-sm font-medium">
              Step 2: Fill in the Additional Fields Required for Each Question.
            </p>
          </div>

          {/* exam id */}
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
                    placeholder="Select exam id"
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
                  Marks for each question
                  <span className="text-red-500">*</span>
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Assign marks for each questions" />
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
                    placeholder="Enter subject for the question"
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

          {/* Progress bar */}
          {/* {isSubmittingForm && (
            <div className="w-full mt-4">
              <p className="text-sm mb-1">
                Uploading questions (Batch {currentBatch} of {totalBatches})
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {uploadProgress}% complete
              </p>
            </div>
          )} */}

          <UploadProgressBar
            isSubmittingForm={isSubmittingForm}
            currentBatch={currentBatch}
            totalBatches={totalBatches}
            uploadProgress={uploadProgress}
          />

          {/* Create button */}
          <Button
            type="submit"
            disabled={
              Object.keys(form.formState.dirtyFields).length < 3 ||
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

type UploadProgressBarPropType = {
  isSubmittingForm: boolean;
  currentBatch: number;
  totalBatches: number;
  uploadProgress: number;
};

const UploadProgressBar = ({
  isSubmittingForm,
  currentBatch,
  totalBatches,
  uploadProgress,
}: UploadProgressBarPropType) => {
  if (!isSubmittingForm) return null;

  const isComplete = uploadProgress === 100;

  return (
    <div className="w-full mt-6 bg-gray-50 p-4 rounded-lg border border-gray-200 shadow-sm">
      <div className="flex items-center mb-2">
        {isComplete ? (
          <CheckCircle2 className="text-green-600 mr-2" size={20} />
        ) : (
          <ArrowUpCircle
            className="text-blue-600 animate-pulse mr-2"
            size={20}
          />
        )}
        <p className="text-sm font-medium">
          {isComplete
            ? "Upload complete"
            : `Uploading questions (Batch ${currentBatch} of ${totalBatches})`}
        </p>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className={`h-3 rounded-full transition-all duration-300 ${
            isComplete ? "bg-green-500" : "bg-blue-600"
          }`}
          style={{ width: `${uploadProgress}%` }}
        />
      </div>

      <div className="flex justify-between mt-2">
        <p className="text-xs font-medium text-gray-700">
          {uploadProgress}% complete
        </p>
        <p className="text-xs text-gray-500">
          {isComplete
            ? "All questions uploaded successfully"
            : `Batch ${currentBatch} of ${totalBatches}`}
        </p>
      </div>
    </div>
  );
};

import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import bulkQuestionsUpload from "@/actions/bulkQuestionsUpload";
import previewBulkQuestionsUpload from "@/actions/previewBulkQuestionsUpload";
import { PreviewDataType } from "./hero";
import { marks, difficultyLevel, negativeMarks } from "@/utils/arrays";
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
      (file) => file.size <= 2097152, // 2MB limit
      "File size should be less than 2MB"
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
  negativeMarks: z.enum(negativeMarks as [string, ...string[]], {
    message: "Invalid option selection.",
  }),
});

export default function BulkCreationForm({
  setPreviewData,
  children,
}: BulkCreationFormPropType) {
  const [isSubmittingForm, setIsSubmittingForm] = useState<boolean>(false);

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
      const data = await bulkQuestionsUpload(values);
      console.log(data);
      form.reset();
      toast.success("Questions have been uploaded successfully.");
    } catch (error) {
      console.log(error);
      toast.error("Uh oh! Something went wrong.");
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
                      const file = e.target.files?.[0];
                      field.onChange(file);
                      const data = await previewBulkQuestionsUpload(
                        file as File
                      );
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

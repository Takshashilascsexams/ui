import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
// import { completeOnboarding } from "@/actions/client/completeOnboarding";
// import { addUserToDb } from "@/actions/client/addUserToDb";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { gender, category, districts, highestEducation } from "@/utils/arrays";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { completeUserRegistration } from "@/actions/client/completeUserRegistration";
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

// Helper function to clean text by removing special characters and normalizing spaces
const cleanText = (value: string): string => {
  if (!value) return value;
  // Remove special characters except letters, numbers, spaces, and basic punctuation
  const filteredStr = value.replace(/[^\w\s.,'-]/g, "");
  // Normalize spaces (replace multiple spaces with a single space)
  return filteredStr.trim().replace(/\s+/g, " ");
};

// Helper function to format text as title case
const toTitleCase = (value: string): string => {
  if (!value) return value;

  const words = value.split(" ");
  const lowerCaseWords = new Set([
    "a",
    "an",
    "the",
    "and",
    "but",
    "or",
    "for",
    "nor",
    "as",
    "at",
    "by",
    "for",
    "from",
    "in",
    "into",
    "near",
    "of",
    "on",
    "onto",
    "to",
    "with",
    "is",
    "are",
    "was",
    "were",
  ]);

  return words
    .map((word, index) => {
      // Keep acronyms as is
      if (word.length > 1 && word === word.toUpperCase()) {
        return word;
      }

      // Handle hyphenated words
      if (word.includes("-")) {
        return word
          .split("-")
          .map(
            (part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
          )
          .join("-");
      }

      // First word or words that shouldn't be lowercase
      if (index === 0 || !lowerCaseWords.has(word.toLowerCase())) {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      }

      // Lowercase words like articles, prepositions, etc.
      return word.toLowerCase();
    })
    .join(" ");
};

// Transform function that both cleans and formats text
const cleanAndFormat = (value: string): string => {
  return toTitleCase(cleanText(value));
};

const onboardingFormSchema = z.object({
  fullName: z
    .string()
    .min(3, {
      message: "Full name must be at least 3 characters.",
    })
    .max(100, { message: "Full name must have less than 40 characters" })
    .transform(cleanAndFormat),
  careOf: z
    .string()
    .min(3, {
      message: "Father's or mother's name must be at least 3 characters.",
    })
    .max(100, {
      message: "Father's or mother's name must have less than 40 characters",
    })
    .transform(cleanAndFormat),
  phoneNumber: z
    .string()
    .length(10, {
      message: "Phone number must be exactly 10 digits.",
    })
    .regex(/^\d+$/, {
      message: "Phone number must contain only numbers.",
    }),
  dateOfBirth: z.date().refine(
    (dob) => {
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();

      // Adjust if birthday hasn't occurred yet this year
      const hasBirthdayOccurred =
        today.getMonth() > dob.getMonth() ||
        (today.getMonth() === dob.getMonth() &&
          today.getDate() >= dob.getDate());

      if (!hasBirthdayOccurred) {
        age -= 1;
      }

      return age >= 18;
    },
    { message: "Date of birth cannot be less than 18 years." }
  ),
  gender: z.enum(gender as [string, ...string[]]),
  category: z.enum(category as [string, ...string[]]),
  alternatePhoneNumber: z
    .string()
    .refine((val) => val === "" || (val.length === 10 && /^\d+$/.test(val)), {
      message: "If provided, alternate phone number must be exactly 10 digits.",
    })
    .optional(),
  address: z
    .string()
    .min(8, {
      message: "Provide full address",
    })
    .max(100, { message: "Address must have less than 100 characters" })
    .transform(cleanAndFormat),
  district: z.enum(districts as [string, ...string[]], {
    message: "Invalid district selection.",
  }),
  highestEducation: z.enum(highestEducation as [string, ...string[]], {
    message: "Invalid education selection.",
  }),
  collegeOrUniversityName: z.string().transform(cleanAndFormat),
  previouslyAttempted: z.enum(["Yes", "No"], {
    message: "Invalid option selection.",
  }),
  currentlyEmployed: z.enum(["Yes", "No"], {
    message: "Invalid option selection.",
  }),
});

export default function OnboardingForm() {
  const [error, setError] = useState<string>("");
  const [isSubmittingForm, setIsSubmittingForm] = useState<boolean>(false);
  const { user } = useUser();
  const router = useRouter();

  const form = useForm<z.infer<typeof onboardingFormSchema>>({
    resolver: zodResolver(onboardingFormSchema),
    defaultValues: {
      fullName: "",
      careOf: "",
      dateOfBirth: undefined,
      gender: "",
      category: "",
      phoneNumber: "",
      alternatePhoneNumber: "",
      address: "",
      district: "",
      highestEducation: "",
      collegeOrUniversityName: "",
      previouslyAttempted: undefined,
      currentlyEmployed: undefined,
    },
  });

  const onSubmit = async (values: z.infer<typeof onboardingFormSchema>) => {
    try {
      setIsSubmittingForm(true);
      setError("");

      // Use the combined function instead of separate calls
      const result = await completeUserRegistration(values);

      // If successful, reload session and redirect
      if (result.success) {
        await user?.reload();
        form.reset();
        router.push("/dashboard");
      } else {
        // Handle case where the function returns successfully but with an error flag
        setError(result.message || "Registration could not be completed");
      }
    } catch (error) {
      // Handle exceptions thrown by the server action
      setError(
        (error as Error).message ||
          "Could not complete the registration process at the moment."
      );
      console.error("Onboarding error:", error);
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
          {/* Full name */}
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Full name <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="First and last"
                    className="text-sm"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Care of */}
          <FormField
            control={form.control}
            name="careOf"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {"Father's / Mother's name"}{" "}
                  <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="First and last"
                    className="text-sm"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* DOB */}
          <FormField
            control={form.control}
            name="dateOfBirth"
            render={({ field }) => (
              <FormItem className="flex flex-col items-start justify-center w-full">
                <FormLabel>
                  Date of birth <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <DatePicker
                    selected={field.value}
                    onChange={(date) => field.onChange(date)}
                    showYearDropdown
                    scrollableYearDropdown
                    yearDropdownItemNumber={80}
                    dropdownMode="select"
                    dateFormat="MMMM d, yyyy"
                    className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
                    placeholderText="Pick your date of birth"
                    maxDate={
                      new Date(
                        new Date().setFullYear(new Date().getFullYear() - 18)
                      )
                    }
                    minDate={new Date("1940-01-01")}
                    showMonthDropdown
                    onKeyDown={(e) => e.preventDefault()}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Gender */}
          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Gender <span className="text-red-500">*</span>
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your gender" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {gender.map((value, index) => {
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

          {/* Category */}
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Category <span className="text-red-500">*</span>
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {category.map((value, index) => {
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

          {/* Phone number */}
          <FormField
            control={form.control}
            name="phoneNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Phone number <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Provide a phone number"
                    className="text-sm"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Alt phone number */}
          <FormField
            control={form.control}
            name="alternatePhoneNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Alternate phone number</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Provide an alternate phone number"
                    className="text-sm"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Address */}
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Address <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Provide your full address"
                    className="text-sm"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* District */}
          <FormField
            control={form.control}
            name="district"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  District <span className="text-red-500">*</span>
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your district" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {districts.map((value, index) => {
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

          {/* College */}
          <FormField
            control={form.control}
            name="collegeOrUniversityName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  College / University name (leave blank if not enrolled)
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Provide your college / university name"
                    className="text-sm"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Highest education */}
          <FormField
            control={form.control}
            name="highestEducation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Highest education qualification{" "}
                  <span className="text-red-500">*</span>
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select highest education" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {highestEducation.map((value, index) => {
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

          {/* Previous attempted */}
          <FormField
            control={form.control}
            name="previouslyAttempted"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Previously attempted APSC / UPSC ?{" "}
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

          {/* Currently employed */}
          <FormField
            control={form.control}
            name="currentlyEmployed"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Are you currently employed ?{" "}
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
              Object.keys(form.formState.dirtyFields).length < 11 ||
              isSubmittingForm
            }
            className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition disabled:bg-indigo-500 disabled:cursor-not-allowed"
          >
            {isSubmittingForm ? (
              <>
                <Loader2 className="animate-spin mr-2" />
                onboarding
              </>
            ) : (
              "Continue"
            )}
          </Button>
        </form>
      </Form>
    </>
  );
}

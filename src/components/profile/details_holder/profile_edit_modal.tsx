import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type ProfileEditModalPropType = {
  fullName: string;
  email: string;
  phoneNumber: string;
};

export const updateUserFormSchema = z.object({
  fullName: z.string().min(6, {
    message: "Full name must be at least 6 characters.",
  }),
  email: z.string(),
  phoneNumber: z
    .string()
    .length(10, {
      message: "Phone number must be exactly 10 digits.",
    })
    .regex(/^\d+$/, {
      message: "Phone number must contain only numbers.",
    }),
});

export default function ProfileEditModal({
  fullName,
  email,
  phoneNumber,
}: ProfileEditModalPropType) {
  const [error, setError] = useState<string>("");
  const [isSubmittingForm, setIsSubmittingForm] = useState<boolean>(false);

  const form = useForm<z.infer<typeof updateUserFormSchema>>({
    resolver: zodResolver(updateUserFormSchema),
    defaultValues: {
      fullName: fullName,
      email,
      phoneNumber,
    },
  });

  const onSubmit = async (values: z.infer<typeof updateUserFormSchema>) => {
    try {
      setIsSubmittingForm(true);
      setError("");

      console.log(values);
    } catch (error) {
      console.log(error);
      setError((error as Error).message || "Failed to create a new test.");
    } finally {
      setIsSubmittingForm(false);
    }
  };

  return (
    <div>
      <Dialog>
        <DialogTrigger asChild>
          <Button className="bg-green-600 hover:bg-green-700 disabled:bg-green-500">
            Edit profile
          </Button>
        </DialogTrigger>
        <DialogContent className="w-[450px] rounded-lg">
          <DialogHeader className="text-start">
            <DialogTitle>Edit profile</DialogTitle>
            <DialogDescription>
              {`Make changes to your profile here. Click save when you're
                  done.`}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="w-full flex flex-col items-center justify-center gap-5"
              >
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Full Name
                        <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your full name title"
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
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Email
                        <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your email"
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
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Phone Number
                        <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your phone number"
                          className="text-sm"
                          {...field}
                        />
                      </FormControl>
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
                  disabled={isSubmittingForm}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-500"
                >
                  {isSubmittingForm ? (
                    <>
                      <Loader2 /> Saving
                    </>
                  ) : (
                    "Save changes"
                  )}
                </Button>
              </form>
            </Form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

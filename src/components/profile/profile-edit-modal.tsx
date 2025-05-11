import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { toast, Toaster } from "sonner";
import { updateClerkUserData } from "@/actions/client/updateClerkUserData";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// Define the form schema
const updateUserFormSchema = z.object({
  fullName: z.string().min(6, {
    message: "Full name must be at least 6 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  phoneNumber: z
    .string()
    .length(10, {
      message: "Phone number must be exactly 10 digits.",
    })
    .regex(/^\d+$/, {
      message: "Phone number must contain only numbers.",
    }),
});

type UpdateUserFormValues = z.infer<typeof updateUserFormSchema>;

type ProfileEditModalProps = {
  isOpen: boolean;
  onClose: () => void;
  fullName: string;
  email: string;
  phoneNumber: string;
};

export function ProfileEditModal({
  isOpen,
  onClose,
  fullName,
  email,
  phoneNumber,
}: ProfileEditModalProps) {
  const [isSubmittingForm, setIsSubmittingForm] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  // Format phone number (strip any non-digits)
  const formatPhoneNumber = (phone: string) => {
    return phone.replace(/\D/g, "");
  };

  // Initialize form
  const form = useForm<UpdateUserFormValues>({
    resolver: zodResolver(updateUserFormSchema),
    defaultValues: {
      fullName: fullName,
      email: email,
      phoneNumber: formatPhoneNumber(phoneNumber),
    },
  });

  // Handle form submission
  const onSubmit = async (values: UpdateUserFormValues) => {
    try {
      setIsSubmittingForm(true);
      setError("");

      // Call the server action to update user data
      await updateClerkUserData({
        fullName: values.fullName,
        email: values.email,
        phoneNumber: values.phoneNumber,
      });

      toast.success("Profile updated successfully");

      // Close the modal and reset the form
      onClose();
      form.reset();

      // Refresh the page to show updated data
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error("Error updating profile:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to update profile. Please try again."
      );
      toast.error("Failed to update profile");
    } finally {
      setIsSubmittingForm(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>
              Update your personal information below.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 py-4"
            >
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your full name" {...field} />
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
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your email"
                        type="email"
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
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your phone number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {error && (
                <div className="text-sm text-red-500 pt-2">{error}</div>
              )}

              <DialogFooter className="pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={isSubmittingForm}
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700"
                  disabled={isSubmittingForm}
                >
                  {isSubmittingForm ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Toaster position="top-center" richColors />
    </>
  );
}

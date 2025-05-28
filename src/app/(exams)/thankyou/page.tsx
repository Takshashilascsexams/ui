"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Home, ChevronRight, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import LoadingSpinner from "@/components/ui/loading-spinner";

export default function ThankYouPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [canNavigate, setCanNavigate] = useState(false);

  useEffect(() => {
    // Simulate loading time for server confirmation
    // In a real app, you might want to fetch the submission status here
    const loadingTimer = setTimeout(() => {
      setIsLoading(false);

      // Add a small delay before allowing navigation to prevent accidental clicks
      const navigationTimer = setTimeout(() => {
        setCanNavigate(true);
      }, 1000);

      return () => {
        clearTimeout(navigationTimer);
      };
    }, 1500);

    return () => {
      clearTimeout(loadingTimer);
    };
  }, []);

  const handleNavigation = (path: string) => {
    if (canNavigate) {
      router.push(path);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <Card className="w-full max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-xl">
        <CardHeader className="pb-3 px-4 sm:px-6">
          <CardTitle className="text-center text-xl sm:text-2xl lg:text-3xl">
            {isLoading
              ? "Processing Submission..."
              : "Exam Submitted Successfully!"}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          {isLoading ? (
            <div className="text-center py-8">
              <LoadingSpinner size="lg" className="mx-auto mb-4" />
              <p className="text-gray-600">
                Please wait while we process your submission...
              </p>
            </div>
          ) : (
            <>
              <div className="bg-green-50 p-4 sm:p-6 rounded-lg mb-4 sm:mb-6 text-center">
                <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                  <Check className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
                </div>
                <h3 className="text-base sm:text-lg font-medium text-green-800 mb-2">
                  Your exam has been successfully submitted
                </h3>
                <p className="text-sm text-green-700">
                  Thank you for completing the exam. Your responses have been
                  recorded.
                </p>
              </div>

              <div className="space-y-3 sm:space-y-4">
                <div className="bg-blue-50 p-3 sm:p-4 rounded-lg border border-blue-200">
                  <p className="text-blue-800 text-sm sm:text-base font-medium text-center">
                    Go to your profile to view your exam results.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-3 sm:pt-4">
                  <Button
                    className={`flex-1 bg-blue-600 hover:bg-blue-700 text-sm sm:text-base ${
                      !canNavigate ? "opacity-90" : ""
                    }`}
                    onClick={() => handleNavigation("/profile")}
                    disabled={!canNavigate}
                  >
                    <User className="mr-1 sm:mr-2 h-4 w-4" />
                    <span className="hidden xs:inline">View </span>Profile
                  </Button>

                  <Button
                    variant="outline"
                    className={`flex-1 text-sm sm:text-base ${
                      !canNavigate ? "opacity-90" : ""
                    }`}
                    onClick={() => handleNavigation("/tests")}
                    disabled={!canNavigate}
                  >
                    <Home className="mr-1 sm:mr-2 h-4 w-4" />
                    <span className="hidden xs:inline">Back to </span>Tests
                  </Button>
                </div>

                <Button
                  variant="ghost"
                  className={`w-full text-sm sm:text-base ${
                    !canNavigate ? "opacity-90" : ""
                  }`}
                  onClick={() => handleNavigation("/")}
                  disabled={!canNavigate}
                >
                  Go to Home
                  <ChevronRight className="ml-1 sm:ml-2 h-4 w-4" />
                </Button>

                {!canNavigate && (
                  <p className="text-xs text-center text-gray-500 mt-2">
                    Navigation buttons will be active in a moment...
                  </p>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

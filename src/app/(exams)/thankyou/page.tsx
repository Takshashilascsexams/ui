// "use client";

// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import { Check, Home, ChevronRight } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import LoadingSpinner from "@/components/ui/loading-spinner";

// export default function ThankYouPage() {
//   const router = useRouter();
//   const [isLoading, setIsLoading] = useState(true);
//   const [canNavigate, setCanNavigate] = useState(false);

//   useEffect(() => {
//     // Simulate loading time for server confirmation
//     // In a real app, you might want to fetch the submission status here
//     const loadingTimer = setTimeout(() => {
//       setIsLoading(false);

//       // Add a small delay before allowing navigation to prevent accidental clicks
//       const navigationTimer = setTimeout(() => {
//         setCanNavigate(true);
//       }, 1000);

//       return () => {
//         clearTimeout(navigationTimer);
//       };
//     }, 1500);

//     return () => {
//       clearTimeout(loadingTimer);
//     };
//   }, []);

//   const handleNavigation = (path: string) => {
//     if (canNavigate) {
//       router.push(path);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
//       <Card className="w-full max-w-md">
//         <CardHeader className="pb-3">
//           <CardTitle className="text-center text-2xl">
//             {isLoading
//               ? "Processing Submission..."
//               : "Exam Submitted Successfully!"}
//           </CardTitle>
//         </CardHeader>
//         <CardContent>
//           {isLoading ? (
//             <div className="text-center py-8">
//               <LoadingSpinner size="lg" className="mx-auto mb-4" />
//               <p className="text-gray-600">
//                 Please wait while we process your submission...
//               </p>
//             </div>
//           ) : (
//             <>
//               <div className="bg-green-50 p-6 rounded-lg mb-6 text-center">
//                 <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
//                   <Check className="h-8 w-8 text-green-600" />
//                 </div>
//                 <h3 className="text-lg font-medium text-green-800 mb-2">
//                   Your exam has been successfully submitted
//                 </h3>
//                 <p className="text-sm text-green-700">
//                   Thank you for completing the exam. Your responses have been
//                   recorded.
//                 </p>
//               </div>

//               <div className="space-y-4">
//                 <p className="text-gray-600 text-sm">
//                   Your exam results will be processed and made available soon.
//                   You will be notified when your results are ready.
//                 </p>

//                 <div className="flex flex-col sm:flex-row gap-3 pt-4">
//                   <Button
//                     className={`flex-1 bg-gray-800 hover:bg-gray-900 ${
//                       !canNavigate ? "opacity-90" : ""
//                     }`}
//                     onClick={() => handleNavigation("/tests")}
//                     disabled={!canNavigate}
//                   >
//                     <Home className="mr-2 h-4 w-4" />
//                     Back to Tests
//                   </Button>

//                   {/* This button could link to results when implemented */}
//                   <Button
//                     variant="outline"
//                     className={`flex-1 ${!canNavigate ? "opacity-90" : ""}`}
//                     onClick={() => handleNavigation("/")}
//                     disabled={!canNavigate}
//                   >
//                     Go to Home
//                     <ChevronRight className="ml-2 h-4 w-4" />
//                   </Button>
//                 </div>

//                 {!canNavigate && (
//                   <p className="text-xs text-center text-gray-500 mt-2">
//                     Navigation buttons will be active in a moment...
//                   </p>
//                 )}
//               </div>
//             </>
//           )}
//         </CardContent>
//       </Card>
//     </div>
//   );
// }

"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, Home, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import LoadingSpinner from "@/components/ui/loading-spinner";

export default function ThankYouPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const attemptId = searchParams.get("attemptId");
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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-center text-2xl">
            {isLoading
              ? "Processing Submission..."
              : "Exam Submitted Successfully!"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <LoadingSpinner size="lg" className="mx-auto mb-4" />
              <p className="text-gray-600">
                Please wait while we process your submission...
              </p>
            </div>
          ) : (
            <>
              <div className="bg-green-50 p-6 rounded-lg mb-6 text-center">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <Check className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-lg font-medium text-green-800 mb-2">
                  Your exam has been successfully submitted
                </h3>
                <p className="text-sm text-green-700">
                  Thank you for completing the exam. Your responses have been
                  recorded.
                </p>
              </div>

              <div className="space-y-4">
                <p className="text-gray-600 text-sm">
                  Your exam results have been processed. You can view your
                  detailed results now.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Button
                    className={`flex-1 bg-gray-800 hover:bg-gray-900 ${
                      !canNavigate ? "opacity-90" : ""
                    }`}
                    onClick={() => handleNavigation("/tests")}
                    disabled={!canNavigate}
                  >
                    <Home className="mr-2 h-4 w-4" />
                    Back to Tests
                  </Button>

                  {/* View Results button */}
                  <Button
                    variant="outline"
                    className={`flex-1 bg-blue-600 text-white hover:bg-blue-700 ${
                      !canNavigate ? "opacity-90" : ""
                    }`}
                    onClick={() =>
                      handleNavigation(
                        attemptId ? `/results/${attemptId}` : "/tests"
                      )
                    }
                    disabled={!canNavigate || !attemptId}
                  >
                    View Results
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>

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

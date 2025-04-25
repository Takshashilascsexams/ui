import Link from "next/link";
import { Package, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BundleNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-6">
          <Package className="h-8 w-8 text-indigo-600" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Bundle Not Found
        </h1>

        <p className="text-gray-600 mb-6">
          {
            "The bundle you're looking for doesn't exist or you don't have access to it."
          }
        </p>

        <div className="space-y-3">
          <Button asChild className="w-full bg-indigo-600 hover:bg-indigo-700">
            <Link href="/tests">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to All Exams
            </Link>
          </Button>

          <Button asChild variant="outline" className="w-full">
            <Link href="/">Go to Homepage</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

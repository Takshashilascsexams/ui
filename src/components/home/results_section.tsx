import React from "react";
import Link from "next/link";
import { FileText, Download, Trophy } from "lucide-react";
import { format } from "date-fns";

type ResultPublication = {
  id: string;
  examId: string;
  title: string;
  fileUrl: string;
  publishedAt: string;
  studentCount: number;
};

type ResultSectionProps = {
  publications: ResultPublication[];
};

export default function ResultsSection({ publications }: ResultSectionProps) {
  if (!publications || publications.length === 0) return null;

  return (
    <section className="w-full py-12 md:py-16 bg-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-[#2E4057] flex items-center">
            <Trophy className="mr-2 h-5 w-5 text-yellow-500" />
            Latest Exam Results
          </h2>
          {publications.length > 3 && (
            <Link
              href="/results"
              className="text-sm text-[#2E4057] font-semibold opacity-80 hover:opacity-100"
            >
              View All
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {publications.slice(0, 6).map((pub) => {
            return (
              <div
                key={pub.id}
                className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 border border-slate-200"
              >
                <div className="p-5">
                  <h3 className="text-lg font-bold text-[#2E4057] mb-3 flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-blue-600" />
                    {pub.title}
                  </h3>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Published:</span>
                      <span>
                        {format(new Date(pub.publishedAt), "MMM d, yyyy")}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Students:</span>
                      <span>{pub.studentCount} participants</span>
                    </div>
                  </div>

                  <Link
                    href={pub.fileUrl}
                    target="_blank"
                    download={`${pub.title.replace(/\s+/g, "-")}-results.pdf`}
                    className="w-full flex items-center justify-center py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-sm font-medium transition-colors"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Results
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

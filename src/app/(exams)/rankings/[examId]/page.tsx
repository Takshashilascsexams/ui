"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast, Toaster } from "sonner";
import {
  ArrowLeft,
  Trophy,
  Medal,
  User,
  Search,
  InfoIcon,
  DownloadIcon,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { formatTimeDuration } from "@/lib/formatTimeDuration";
import getClerkToken from "@/actions/client/getClerkToken";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Ranking {
  rank: number;
  score: number;
  percentage: string;
  user: {
    id: string;
    name: string;
    avatar: string | null;
  };
  correctAnswers: number;
  wrongAnswers: number;
  unattempted: number;
  timeTaken: number;
  percentile: number;
  attemptId: string;
  attemptedOn: string;
  isCurrentUser?: boolean;
}

interface ExamDetails {
  id: string;
  title: string;
  totalMarks: number;
  totalQuestions: number;
  duration: number;
}

interface RankingsData {
  exam: ExamDetails;
  rankings: Ranking[];
  userRanking: Ranking | null;
  totalAttempts: number;
}

export default function RankingsPage({
  params,
}: {
  params: { examId: string };
}) {
  const router = useRouter();
  const { examId } = params;

  const [rankings, setRankings] = useState<RankingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const fetchRankings = async () => {
      try {
        setLoading(true);

        const token = await getClerkToken();
        if (!token) throw new Error("Authentication token not available");

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/exam-attempt/rankings/${examId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || "Failed to fetch rankings");
        }

        const data = await response.json();
        setRankings(data.data);
      } catch (err) {
        console.error("Error fetching rankings:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch rankings"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchRankings();
  }, [examId]);

  const downloadRankings = async (format: "csv" | "json" = "csv") => {
    try {
      setDownloading(true);

      const token = await getClerkToken();
      if (!token) throw new Error("Authentication token not available");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/exam-attempt/export-rankings/${examId}?format=${format}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to download rankings");
      }

      // Handle CSV download
      if (format === "csv") {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        a.download = `${rankings?.exam.title.replace(
          /\s+/g,
          "_"
        )}_Rankings.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        // Handle JSON download
        const data = await response.json();
        const blob = new Blob([JSON.stringify(data.data, null, 2)], {
          type: "application/json",
        });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        a.download = `${rankings?.exam.title.replace(
          /\s+/g,
          "_"
        )}_Rankings.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      }

      toast.success(`Rankings downloaded as ${format.toUpperCase()}`);
    } catch (err) {
      console.error("Error downloading rankings:", err);
      toast.error("Failed to download rankings");
    } finally {
      setDownloading(false);
    }
  };

  // Filter rankings based on search term
  const filteredRankings = rankings?.rankings.filter((ranking) =>
    ranking.user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mb-4" />
          <p className="text-gray-600">Loading rankings...</p>
        </div>
      </div>
    );
  }

  if (error || !rankings) {
    return (
      <div className="container max-w-4xl mx-auto py-12 px-4">
        <Alert>
          <AlertDescription>
            {error || "Failed to load rankings. Please try again later."}
          </AlertDescription>
        </Alert>
        <div className="mt-4 flex justify-center">
          <Button onClick={() => router.push("/tests")}>Back to Tests</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-5xl mx-auto py-12 px-4">
      <Card className="shadow-sm">
        <CardHeader className="border-b border-gray-100 pb-6">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            <CardTitle className="text-2xl">
              {rankings.exam.title} - Rankings
            </CardTitle>
          </div>
          <CardDescription className="text-base flex justify-between items-center">
            <span>
              Showing rankings of all students who completed this exam
            </span>
            <span className="text-sm font-medium">
              {rankings.totalAttempts} total attempts
            </span>
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-6">
          {/* User's ranking card */}
          {rankings.userRanking && (
            <div className="mb-8 bg-blue-50 border border-blue-100 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-blue-100 p-2 rounded-full">
                  <User className="h-5 w-5 text-blue-700" />
                </div>
                <div>
                  <h3 className="font-medium">Your Performance</h3>
                  <p className="text-sm text-blue-700">
                    Rank: {rankings.userRanking.rank} of{" "}
                    {rankings.totalAttempts}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Score</p>
                  <p className="font-medium">
                    {rankings.userRanking.score} (
                    {rankings.userRanking.percentage}%)
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Percentile</p>
                  <p className="font-medium">
                    {rankings.userRanking.percentile.toFixed(1)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Correct / Wrong</p>
                  <p className="font-medium">
                    {rankings.userRanking.correctAnswers} /{" "}
                    {rankings.userRanking.wrongAnswers}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Time Taken</p>
                  <p className="font-medium">
                    {formatTimeDuration(rankings.userRanking.timeTaken)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Search and download options */}
          <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by name..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
                onClick={() => downloadRankings("csv")}
                disabled={downloading}
              >
                {downloading ? (
                  <LoadingSpinner size="sm" className="mr-1" />
                ) : (
                  <DownloadIcon className="h-4 w-4" />
                )}
                Download CSV
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
                onClick={() => downloadRankings("json")}
                disabled={downloading}
              >
                {downloading ? (
                  <LoadingSpinner size="sm" className="mr-1" />
                ) : (
                  <DownloadIcon className="h-4 w-4" />
                )}
                Download JSON
              </Button>
            </div>
          </div>

          {/* Top performers podium (for desktop) */}
          {rankings.rankings.length >= 3 && (
            <div className="hidden md:flex justify-center items-end space-x-8 mb-10">
              {/* Second Place */}
              <div className="flex flex-col items-center">
                <Avatar className="h-16 w-16 border-2 border-gray-300 mb-2">
                  <AvatarImage
                    src={rankings.rankings[1].user.avatar || undefined}
                  />
                  <AvatarFallback className="bg-gray-100 text-gray-800">
                    {rankings.rankings[1].user.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center">
                  <p className="font-medium truncate max-w-[100px]">
                    {rankings.rankings[1].user.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    {rankings.rankings[1].percentage}%
                  </p>
                </div>
                <div className="mt-2 h-24 w-16 bg-gray-200 flex items-center justify-center rounded-t-lg">
                  <Medal className="h-8 w-8 text-gray-500" />
                  <span className="absolute top-1/2 font-bold text-gray-700">
                    2
                  </span>
                </div>
              </div>

              {/* First Place */}
              <div className="flex flex-col items-center">
                <Avatar className="h-20 w-20 border-2 border-amber-300 mb-2">
                  <AvatarImage
                    src={rankings.rankings[0].user.avatar || undefined}
                  />
                  <AvatarFallback className="bg-amber-100 text-amber-800">
                    {rankings.rankings[0].user.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center">
                  <p className="font-medium truncate max-w-[120px]">
                    {rankings.rankings[0].user.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    {rankings.rankings[0].percentage}%
                  </p>
                </div>
                <div className="mt-2 h-32 w-20 bg-amber-200 flex items-center justify-center rounded-t-lg">
                  <Trophy className="h-10 w-10 text-amber-600" />
                  <span className="absolute top-1/2 font-bold text-amber-800">
                    1
                  </span>
                </div>
              </div>

              {/* Third Place */}
              <div className="flex flex-col items-center">
                <Avatar className="h-14 w-14 border-2 border-amber-700 mb-2">
                  <AvatarImage
                    src={rankings.rankings[2].user.avatar || undefined}
                  />
                  <AvatarFallback className="bg-amber-100 text-amber-900">
                    {rankings.rankings[2].user.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center">
                  <p className="font-medium truncate max-w-[100px]">
                    {rankings.rankings[2].user.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    {rankings.rankings[2].percentage}%
                  </p>
                </div>
                <div className="mt-2 h-20 w-16 bg-amber-700 flex items-center justify-center rounded-t-lg">
                  <Medal className="h-7 w-7 text-amber-200" />
                  <span className="absolute top-1/2 font-bold text-amber-200">
                    3
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Rankings table */}
          <div className="border border-gray-200 rounded-lg">
            <div className="grid grid-cols-12 gap-2 p-3 bg-gray-50 border-b border-gray-200 font-medium text-sm">
              <div className="col-span-1 text-center">Rank</div>
              <div className="col-span-4 sm:col-span-3">Student</div>
              <div className="col-span-3 sm:col-span-2 text-center">Score</div>
              <div className="hidden sm:block sm:col-span-2 text-center">
                Correct/Wrong
              </div>
              <div className="col-span-3 sm:col-span-2 text-center">Time</div>
              <div className="hidden sm:block sm:col-span-2 text-center">
                Percentile
              </div>
            </div>

            {filteredRankings && filteredRankings.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {filteredRankings.map((ranking) => (
                  <div
                    key={ranking.attemptId}
                    className={`grid grid-cols-12 gap-2 p-3 text-sm items-center ${
                      ranking.isCurrentUser ? "bg-blue-50" : ""
                    }`}
                  >
                    <div className="col-span-1 text-center font-medium">
                      {ranking.rank}
                    </div>
                    <div className="col-span-4 sm:col-span-3">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={ranking.user.avatar || undefined} />
                          <AvatarFallback className="bg-gray-100">
                            {ranking.user.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="truncate">{ranking.user.name}</span>
                        {ranking.isCurrentUser && (
                          <span className="text-xs text-blue-600">(You)</span>
                        )}
                      </div>
                    </div>
                    <div className="col-span-3 sm:col-span-2 text-center">
                      <span className="font-medium">{ranking.score}</span>
                      <span className="text-gray-500 ml-1">
                        ({ranking.percentage}%)
                      </span>
                    </div>
                    <div className="hidden sm:flex sm:col-span-2 items-center justify-center">
                      <span className="text-green-600 font-medium">
                        {ranking.correctAnswers}
                      </span>
                      <span className="mx-1">/</span>
                      <span className="text-red-600 font-medium">
                        {ranking.wrongAnswers}
                      </span>
                    </div>
                    <div className="col-span-3 sm:col-span-2 text-center">
                      {formatTimeDuration(ranking.timeTaken)}
                    </div>
                    <div className="hidden sm:block sm:col-span-2 text-center">
                      {ranking.percentile.toFixed(1)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-gray-500">
                {searchTerm
                  ? "No students found matching your search"
                  : "No rankings available yet"}
              </div>
            )}
          </div>

          {/* Help text */}
          <div className="mt-6 flex items-start gap-2 text-sm text-gray-600">
            <InfoIcon className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <p>
              Rankings are updated automatically after each exam submission. If
              your ranking differs from what you expected, it may be due to a
              tie in scores, where time taken to complete the exam is used as a
              tiebreaker.
            </p>
          </div>
        </CardContent>

        <CardFooter className="border-t border-gray-100 pt-6 flex justify-between">
          <Button
            variant="outline"
            onClick={() =>
              router.push(`/result/${rankings.userRanking?.attemptId || ""}`)
            }
            className="flex items-center"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Result
          </Button>

          <Button
            onClick={() => router.push("/tests")}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Browse More Tests
          </Button>
        </CardFooter>
      </Card>

      <Toaster position="top-center" richColors />
    </div>
  );
}

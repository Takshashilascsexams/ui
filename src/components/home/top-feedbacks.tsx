"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import LoadingSpinner from "@/components/ui/loading-spinner";

interface Feedback {
  id: string;
  rating: number;
  comment: string;
  examTitle: string;
  createdAt: string;
  user: {
    id?: string;
    name: string;
    avatar: string | null;
  };
}

interface TopFeedbacksProps {
  limit?: number;
  className?: string;
}

export default function TopFeedbacks({
  limit = 4,
  className = "",
}: TopFeedbacksProps) {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTopFeedbacks = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/feedback/top?limit=${limit}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch feedbacks");
        }

        const data = await response.json();
        setFeedbacks(data.data.feedbacks || []);
      } catch (err) {
        console.error("Error fetching top feedbacks:", err);
        setError("Failed to load feedbacks");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTopFeedbacks();
  }, [limit]);

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Top Feedbacks</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <LoadingSpinner size="md" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Top Feedbacks</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-4">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (feedbacks.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Top Feedbacks</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-4">
            No feedbacks yet. Be the first to leave feedback!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Top Feedbacks</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {feedbacks.map((feedback) => (
          <div key={feedback.id} className="border rounded-md p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  {feedback.user.avatar ? (
                    <AvatarImage
                      src={feedback.user.avatar}
                      alt={feedback.user.name}
                    />
                  ) : (
                    <AvatarFallback>
                      {feedback.user.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{feedback.user.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(feedback.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < feedback.rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
            </div>
            <p className="text-sm">{feedback.comment}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

import React from "react";
import Link from "next/link";
import { MessageSquare, Star, StarHalf, User } from "lucide-react";
import { format } from "date-fns";
import { FetchTopFeedbacksType } from "@/actions/client/fetchTopFeedbacks";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type FeedbacksSectionProps = {
  feedbacks: FetchTopFeedbacksType[];
};

export default function FeedbacksSection({ feedbacks }: FeedbacksSectionProps) {
  if (!feedbacks || feedbacks.length === 0) return null;

  // Function to render star rating
  const renderStarRating = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    // Add full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
      );
    }

    // Add half star if needed
    if (hasHalfStar) {
      stars.push(
        <StarHalf
          key="half"
          className="h-4 w-4 fill-yellow-400 text-yellow-400"
        />
      );
    }

    // Add empty stars to make total 5
    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="h-4 w-4 text-gray-300" />);
    }

    return stars;
  };

  // Function to get user initials for avatar fallback
  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <section className="w-full py-12 md:py-16 bg-green-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-[#2E4057] flex items-center">
            <MessageSquare className="mr-2 h-5 w-5 text-green-600" />
            Student Testimonials
          </h2>
          {feedbacks.length > 3 && (
            <Link
              href="/feedbacks"
              className="text-sm text-[#2E4057] font-semibold opacity-80 hover:opacity-100"
            >
              View All
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {feedbacks.slice(0, 4).map((feedback) => {
            return (
              <div
                key={feedback.id}
                className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 border border-slate-200"
              >
                <div className="p-6">
                  {/* Rating */}
                  <div className="flex items-center mb-3">
                    <div className="flex items-center mr-2">
                      {renderStarRating(feedback.rating)}
                    </div>
                    <span className="text-sm font-medium text-gray-600">
                      {feedback.rating.toFixed(1)}
                    </span>
                  </div>

                  {/* Comment */}
                  <blockquote className="text-gray-700 text-sm mb-4 line-clamp-3 italic">
                    &quot;{feedback.comment}&quot;
                  </blockquote>

                  {/* User Info */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Avatar className="h-8 w-8 mr-3">
                        <AvatarImage
                          src={feedback.user.avatar || undefined}
                          alt={feedback.user.name}
                        />
                        <AvatarFallback className="bg-[#2E4057] text-white text-xs">
                          {feedback.user.name === "Anonymous User" ? (
                            <User className="h-4 w-4" />
                          ) : (
                            getUserInitials(feedback.user.name)
                          )}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium text-[#2E4057]">
                          {feedback.user.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {format(new Date(feedback.createdAt), "MMM d, yyyy")}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Call to action */}
        <div className="text-center mt-8">
          <p className="text-gray-600 text-sm mb-4">
            Join thousands of satisfied students who have achieved their goals
            with us
          </p>
          <Link
            href="/tests"
            className="inline-flex items-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-full text-sm font-medium transition-colors"
          >
            Start Your Journey
          </Link>
        </div>
      </div>
    </section>
  );
}

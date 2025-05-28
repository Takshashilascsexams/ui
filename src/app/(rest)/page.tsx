import { Metadata } from "next";
import { unstable_noStore } from "next/cache";
import { fetchLatestExams } from "@/actions/client/fetchLatestExams";
import { fetchTopFeedbacks } from "@/actions/client/fetchTopFeedbacks";
import HomeLayoutEducational from "@/components/home/home_layout_educational";
import {
  latestBlogsSectionData,
  currentAffairsSectionData,
} from "@/utils/arrays";
import { fetchPublishedResults } from "@/actions/client/fetchPublishedResults";

export const metadata: Metadata = {
  title: "Takshashila School of Civil Services - Exam Portal",
  description:
    "Prepare for your exams with our curated test series, blogs and current affairs updates",
};

const notificationText =
  "Your exam results will be available in your profile once you complete your exam.";

export default async function Home() {
  unstable_noStore();

  // Fetch data in parallel for better performance
  const [testSeries, publishedResults, topFeedbacks] = await Promise.all([
    fetchLatestExams(),
    fetchPublishedResults(),
    fetchTopFeedbacks(4, false), // Fetch top 4 feedbacks, not anonymous
  ]);

  return (
    <HomeLayoutEducational
      notificationText={notificationText}
      testSeries={testSeries}
      latestBlogsData={latestBlogsSectionData}
      currentAffairsData={currentAffairsSectionData}
      publishedResults={publishedResults}
      topFeedbacks={topFeedbacks}
    />
  );
}

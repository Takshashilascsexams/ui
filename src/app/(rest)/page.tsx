import { unstable_noStore } from "next/cache";
import { fetchTestSeries } from "@/actions/client/fetchTestSeries";
import HomeLayoutEducational from "@/components/home/home_layout_educational";
import {
  latestBlogsSectionData,
  currentAffairsSectionData,
} from "@/utils/arrays";
import { fetchPublishedResults } from "@/actions/client/fetchPublishedResults";

const notificationText =
  "Results for Indian Polity Test Series are out! Check Now";

export default async function Home() {
  unstable_noStore();

  // Fetch data in parallel for better performance
  const [testSeries, publishedResults] = await Promise.all([
    fetchTestSeries(),
    fetchPublishedResults(),
  ]);

  return (
    <HomeLayoutEducational
      notificationText={notificationText}
      testSeries={testSeries}
      latestBlogsData={latestBlogsSectionData}
      currentAffairsData={currentAffairsSectionData}
      publishedResults={publishedResults}
    />
  );
}

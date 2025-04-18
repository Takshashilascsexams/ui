import { unstable_noStore } from "next/cache";
import { fetchTestSeries } from "@/actions/client/fetchTestSeries";
import HomeLayoutEducational from "@/components/home/home_layout_educational";
import {
  latestBlogsSectionData,
  currentAffairsSectionData,
} from "@/utils/arrays";

const notificationText =
  "Results for Indian Polity Test Series are out! Check Now";

export default async function Home() {
  unstable_noStore();
  const testSeries = await fetchTestSeries();

  return (
    <HomeLayoutEducational
      notificationText={notificationText}
      testSeries={testSeries}
      latestBlogsData={latestBlogsSectionData}
      currentAffairsData={currentAffairsSectionData}
    />
  );
}

import Hero from "@/components/home/hero";
import SectionsTemplate from "@/components/home/sections_template";
import NotificationSection from "@/components/home/notification_section";
import TestSeriesSection from "@/components/home/test_series_section";
import { fetchTestSeries } from "@/actions/fetchTestSeries";
import {
  latestBlogsSectionData,
  currentAffairsSectionData,
} from "@/utils/arrays";

const notificationText =
  "Results for Indian Polity Test Series are out! Check Now";

export default async function Home() {
  const testSeries = await fetchTestSeries();

  return (
    <div className="w-full h-full">
      <Hero />
      <NotificationSection notificationText={notificationText} />
      <TestSeriesSection testSeries={testSeries} />
      <SectionsTemplate
        title="Latest Blogs"
        data={latestBlogsSectionData}
        buttonTitle="Read More"
        buttonColor="green"
      />
      <SectionsTemplate
        title="Current Affairs"
        data={currentAffairsSectionData}
        buttonTitle="Read More"
        buttonColor="red"
      />
    </div>
  );
}

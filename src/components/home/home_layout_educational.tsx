import Notification from "./notification";
import Hero from "./hero";
import TestSeriesSection from "./test_series_section";
import ContentSection from "./content_section";
import { TestSeriesType } from "@/actions/client/fetchTestSeries";
import FeatureSection from "./feature_section";
import CtaSection from "./cta_section";
import { currentAffairsAndBlogsSectionDataType } from "@/types/dataTypes";

type HomeLayoutEducationalProp = {
  notificationText: string;
  testSeries: TestSeriesType[];
  latestBlogsData: currentAffairsAndBlogsSectionDataType[];
  currentAffairsData: currentAffairsAndBlogsSectionDataType[];
};

export default function HomeLayoutEducational({
  notificationText,
  testSeries,
  latestBlogsData,
  currentAffairsData,
}: HomeLayoutEducationalProp) {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Hero />
      <Notification notificationText={notificationText} />
      <TestSeriesSection testSeries={testSeries} />
      <ContentSection
        title="Latest Blogs"
        data={latestBlogsData}
        buttonTitle="Read More"
        buttonColor="blue"
      />
      <ContentSection
        title="Current Affairs"
        data={currentAffairsData}
        buttonTitle="Read More"
        buttonColor="red"
      />
      <FeatureSection />
      <CtaSection />
    </div>
  );
}

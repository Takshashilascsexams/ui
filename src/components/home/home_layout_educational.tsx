import React from "react";
// import Notification from "./notification";
import Hero from "./hero";
import LatestExamsSection from "./latest-exams-section";
import ContentSection from "./content_section";
import ResultsSection from "./results_section";
import { FetchLatestExamsType } from "@/actions/client/fetchLatestExams";
import FeatureSection from "./feature_section";
import CtaSection from "./cta_section";
import { currentAffairsAndBlogsSectionDataType } from "@/types/dataTypes";

type ResultPublication = {
  id: string;
  examId: string;
  title: string;
  fileUrl: string;
  publishedAt: string;
  studentCount: number;
};

type HomeLayoutEducationalProp = {
  notificationText: string;
  testSeries: FetchLatestExamsType[];
  latestBlogsData: currentAffairsAndBlogsSectionDataType[];
  currentAffairsData: currentAffairsAndBlogsSectionDataType[];
  publishedResults?: ResultPublication[]; // Make this optional
};

export default function HomeLayoutEducational({
  // notificationText,
  testSeries,
  latestBlogsData,
  currentAffairsData,
  publishedResults = [], // Default to empty array
}: HomeLayoutEducationalProp) {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Hero />
      {/* <Notification notificationText={notificationText} /> */}
      <LatestExamsSection testSeries={testSeries} />
      {/* Add Results Section after TestSeriesSection */}
      {publishedResults && publishedResults.length > 0 && (
        <ResultsSection publications={publishedResults} />
      )}
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

import Hero from "@/components/home/hero";
import SectionsTemplate from "@/components/home/sections_template";
import {
  testSeriesSectionData,
  latestBlogsSectionData,
  currentAffairsSectionData,
} from "@/utils/arrays";

export default async function Home() {
  return (
    <div className="w-full h-full">
      <Hero />
      <SectionsTemplate
        title="Test Series"
        data={testSeriesSectionData}
        buttonTitle="Start Now"
        buttonColor="blue"
      />
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

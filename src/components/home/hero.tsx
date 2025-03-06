import Link from "next/link";

export default function Hero() {
  return (
    <div className="w-full px-6 py-20 lg:py-24 bg-gradient-to-br from-[#1a73e8] to-[#34a853] flex flex-col items-center justify-center gap-6 lg:gap-8">
      <div className="w-full">
        <h1 className="text-center text-white text-3xl lg:text-4xl font-semibold">
          {"Welcome to Takshashila SCS Exam Portal"}
        </h1>
      </div>
      <div className="w-full">
        <p className="text-center text-white text-base">
          Prepare for your exams with our curated test series, blogs and current
          affairs updates.
        </p>
      </div>
      <div className="w-full flex items-center justify-center gap-3 lg:gap-5">
        <Link
          href={"#"}
          className="font-medium bg-[#ffcc00] px-3 py-2 rounded-md"
        >
          Explore Exams
        </Link>
        <Link
          href={"https://takshashilascs.com/blogs/"}
          target="_blank"
          className="font-medium bg-[#ffcc00] px-3 py-2 rounded-md"
        >
          Read Blogs
        </Link>
        <Link
          href={"https://takshashilascs.com/current-affairs/"}
          target="_blank"
          className="font-medium bg-[#ffcc00] px-3 py-2 rounded-md"
        >
          Check Current affairs
        </Link>
      </div>
    </div>
  );
}

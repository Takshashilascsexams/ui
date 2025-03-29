import Link from "next/link";

export default function Hero() {
  return (
    <div className="w-full px-4 sm:px-6 py-16 sm:py-20 lg:py-24 bg-gradient-to-br from-[#1a73e8] to-[#34a853] flex flex-col items-center justify-center gap-5 sm:gap-6 lg:gap-8">
      <div className="w-full max-w-4xl">
        <h1 className="text-center text-white text-2xl sm:text-3xl lg:text-4xl font-semibold">
          {"Welcome to Takshashila SCS Exam Portal"}
        </h1>
      </div>
      <div className="w-full max-w-3xl">
        <p className="text-center text-white text-sm sm:text-base lg:text-lg">
          Prepare for your exams with our curated test series, blogs and current
          affairs updates.
        </p>
      </div>
      <div className="w-full flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 lg:gap-5">
        <Link
          href={"/tests"}
          className="w-full sm:w-auto font-medium text-center bg-[#ffcc00] px-5 py-3 rounded-md hover:bg-[#ffdc40] transition-colors"
        >
          Explore Exams
        </Link>
        <Link
          href={"https://takshashilascs.com/blogs/"}
          target="_blank"
          className="w-full sm:w-auto font-medium text-center bg-[#ffcc00] px-5 py-3 rounded-md hover:bg-[#ffdc40] transition-colors"
        >
          Read Blogs
        </Link>
        <Link
          href={"https://takshashilascs.com/current-affairs/"}
          target="_blank"
          className="w-full sm:w-auto font-medium text-center bg-[#ffcc00] px-5 py-3 rounded-md hover:bg-[#ffdc40] transition-colors"
        >
          Current Affairs
        </Link>
      </div>
    </div>
  );
}

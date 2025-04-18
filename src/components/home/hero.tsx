import Link from "next/link";

export default function Hero() {
  return (
    <div className="w-full bg-eduTheme-primary text-white py-12 md:py-16 lg:py-20 relative overflow-hidden">
      <div className="container mx-auto">
        {/* Large circle in bottom left - decorative element */}
        <div
          className="absolute left-[-150px] md:left-[-100px] lg:left-0 bottom-[-100px] lg:bottom-0 
                     w-[200px] md:w-[250px] lg:w-[300px] h-[200px] md:h-[250px] lg:h-[300px] 
                     bg-white/5 rounded-full"
          aria-hidden="true"
        ></div>

        {/* Large circle in right side - decorative element */}
        <div
          className="absolute right-[-100px] md:right-[-50px] lg:right-0 top-1/2 
                     w-[250px] md:w-[300px] lg:w-[400px] h-[250px] md:h-[300px] lg:h-[400px] 
                     bg-white/[0.07] rounded-full transform translate-x-1/3 -translate-y-1/2"
          aria-hidden="true"
        ></div>

        {/* Content positioned above the decorative elements */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6">
            Welcome to Takshashila SCS Exam Portal
          </h1>
          <p className="text-base sm:text-md md:text-xl mb-6 md:mb-8 lg:mb-10 opacity-90">
            Prepare for your exams with our curated test series, blogs and
            current affairs updates.
          </p>

          <div className="w-full flex flex-wrap gap-3 md:gap-4">
            <Link
              href="/tests"
              className="w-full sm:w-auto px-6 sm:px-7 md:px-8 py-3 bg-[#f8971d] text-white text-center text-sm md:text-base 
                        rounded-full font-medium hover:bg-[#e68a36] transition-colors"
            >
              Explore Exams
            </Link>
            <Link
              href="https://takshashilascs.com/blogs/"
              target="_blank"
              className="w-full sm:w-auto px-6 sm:px-7 md:px-8 py-3 bg-white/20 text-white text-center text-sm md:text-base 
                        rounded-full font-medium hover:bg-white/30 transition-colors"
            >
              Read Blogs
            </Link>
            <Link
              href="https://takshashilascs.com/current-affairs/"
              target="_blank"
              className="w-full sm:w-auto px-6 sm:px-7 md:px-8 py-3 bg-white/20 text-white text-center text-sm md:text-base 
                        rounded-full font-medium hover:bg-white/30 transition-colors"
            >
              Current Affairs
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

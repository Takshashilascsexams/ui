import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function CtaSection() {
  return (
    <section className="w-full py-16 bg-gradient-to-r from-[#2E4057]/95 to-[#2E4057]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="mb-8 md:mb-0 md:max-w-xl">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Ready to Ace Your Civil Service Exams?
          </h2>
          <p className="text-white/90">
            Join thousands of aspirants who have successfully prepared for their
            exams using our platform. Start your journey today!
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/tests"
            className="px-6 py-3 bg-[#F2994A] text-white rounded-full font-medium hover:bg-[#e68a36] transition-colors inline-flex items-center justify-center gap-2"
          >
            Get Started
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

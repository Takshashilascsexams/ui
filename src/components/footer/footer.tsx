import Link from "next/link";
import CustomImage from "../custom_image/custom_image";

export default function Footer() {
  return (
    <footer className="w-full px-5 py-20 bg-white border-t border-gray-200">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row md:justify-start md:items-center md:gap-52">
          <div className="mb-6 md:mb-0">
            <Link href="/" className="flex items-center">
              <div className="w-[100px] h-[100px] lg:w-[120px] lg:h-[120px] relative mr-3">
                <CustomImage
                  src="/images/logo.webp"
                  alt="Takshashila Logo"
                  sizes="(max-width: 768px) 100px, (min-width: 769px) 120px"
                />
              </div>
            </Link>
          </div>

          <div className="flex flex-col md:flex-row gap-10 lg:gap-20">
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                Resources
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/tests"
                    className="text-gray-600 hover:text-[#2E4057]"
                  >
                    Test Series
                  </Link>
                </li>
                <li>
                  <Link
                    href="https://takshashilascs.com/blogs/"
                    target="_blank"
                    className="text-gray-600 hover:text-[#2E4057]"
                  >
                    Blogs
                  </Link>
                </li>
                <li>
                  <Link
                    href="https://takshashilascs.com/current-affairs/"
                    target="_blank"
                    className="text-gray-600 hover:text-[#2E4057]"
                  >
                    Current Affairs
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                Connect
              </h3>
              <div className="flex flex-col items-start justify-center gap-2">
                <Link
                  href="https://www.facebook.com/takshashilascs"
                  target="_blank"
                  className="text-gray-600 hover:text-[#2E4057]"
                >
                  Facebook
                </Link>
                <Link
                  href="https://x.com/takshashilascs"
                  target="_blank"
                  className="text-gray-600 hover:text-[#2E4057]"
                >
                  Twitter
                </Link>
                <Link
                  href="https://www.instagram.com/takshashilascs/?hl=en"
                  target="_blank"
                  className="text-gray-600 hover:text-[#2E4057]"
                >
                  Instagram
                </Link>
                <Link href="#" className="text-gray-600 hover:text-[#2E4057]">
                  LinkedIn
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200 text-center">
          <p className="text-gray-500 text-sm">
            © Takshashila School of Civil Services. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

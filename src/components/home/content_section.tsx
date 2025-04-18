import Link from "next/link";

type ContentSectionProps = {
  title: string;
  data: {
    id: number;
    title: string;
    description: string;
    href: string;
  }[];
  buttonTitle: string;
  buttonColor: "blue" | "green" | "red" | "yellow" | "indigo";
};

// Color configuration
const colorClasses = {
  blue: "bg-blue-600 hover:bg-blue-700 text-white",
  green: "bg-green-600 hover:bg-green-700 text-white",
  indigo: "bg-indigo-600 hover:bg-indigo-700 text-white",
  red: "bg-red-600 hover:bg-red-700 text-white",
  yellow: "bg-yellow-600 hover:bg-yellow-700 text-white",
};

export default function ContentSection({
  title,
  data,
  buttonTitle,
  buttonColor,
}: ContentSectionProps) {
  return (
    <section className="w-full py-12 md:py-16 bg-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-8">
          {/* <h2 className="text-2xl font-bold text-[#2E4057] relative after:content-[''] after:absolute after:bottom-[-8px] after:left-0 after:w-12 after:h-1 after:bg-[#F2994A]"> */}
          <h2 className="text-2xl font-bold text-[#2E4057] relative">
            {title}
          </h2>
          <Link
            href="#"
            className="text-sm text-[#2E4057] font-semibold opacity-80 hover:opacity-100"
          >
            View All
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md hover:translate-y-[-8px] transition-all duration-300 border border-slate-200"
            >
              <div className="p-5">
                <h3 className="text-lg font-bold text-[#2E4057] mb-3">
                  {item.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4">{item.description}</p>

                <Link
                  href={item.href}
                  target="_blank"
                  className={`inline-block px-5 py-2 rounded-full text-sm font-medium ${colorClasses[buttonColor]}`}
                >
                  {buttonTitle}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

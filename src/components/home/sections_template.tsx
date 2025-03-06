import { testSeriesSectionData } from "@/utils/arrays";
import { twMerge } from "tailwind-merge";
import Link from "next/link";

const colorClasses = {
  blue: "bg-blue-600 hover:bg-blue-700 disabled:bg-blue-500",
  green: "bg-green-600 hover:bg-green-700 disabled:bg-green-500",
  red: "bg-red-600 hover:bg-red-700 disabled:bg-red-500",
  yellow: "bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-500",
};

type SectionsTemplatePropType = {
  title: string;
  data: typeof testSeriesSectionData;
  buttonTitle: string;
  buttonColor: keyof typeof colorClasses;
};

export default function SectionsTemplate({
  title,
  data,
  buttonTitle,
  buttonColor,
}: SectionsTemplatePropType) {
  return (
    <div className="w-full px-7 lg:px-44 mt-20 flex flex-col items-start justify-center gap-5">
      <div>
        <h2 className="text-lg lg:text-xl font-semibold">{title}</h2>
      </div>

      <div className="w-full flex items-center justify-center gap-5 flex-wrap">
        {data.map((tablet) => {
          return (
            <div
              key={tablet.id}
              className="w-full lg:w-[calc((100%-40px)/3)] min-h-[186px] px-5 py-5 flex flex-col items-start justify-start gap-4 border-[1px] border-slate-200 rounded-lg shadow-lg"
            >
              <div>
                <h3 className="text-base lg:text-lg font-semibold">
                  {tablet.title}
                </h3>
              </div>
              <div>
                <p className="text-sm lg:text-sm">{tablet.description}</p>
              </div>
              <div>
                <Link
                  href={tablet.href}
                  target="_blank"
                  className={twMerge(
                    "px-4 py-2 text-sm text-white font-medium rounded-md",
                    colorClasses[buttonColor]
                  )}
                >
                  {buttonTitle}
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

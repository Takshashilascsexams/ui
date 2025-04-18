import { BookOpen, Clock, Award, FileCheck } from "lucide-react";

type FeatureProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
};

const features = [
  {
    icon: <BookOpen className="h-6 w-6" />,
    title: "Extensive Test Series",
    description:
      "Access comprehensive mock tests designed by subject matter experts to enhance your preparation.",
  },
  {
    icon: <Clock className="h-6 w-6" />,
    title: "Time-Based Testing",
    description:
      "Practice under timed conditions that mirror the actual exam environment.",
  },
  {
    icon: <Award className="h-6 w-6" />,
    title: "Performance Analysis",
    description:
      "Get detailed insights on your strengths and areas for improvement after each test.",
  },
  {
    icon: <FileCheck className="h-6 w-6" />,
    title: "Current Affairs Updates",
    description:
      "Stay updated with the latest current affairs relevant to civil services exams.",
  },
];

function Feature({ icon, title, description }: FeatureProps) {
  return (
    <div className="flex flex-col items-center text-center md:items-start md:text-left">
      <div className="mb-4 p-3 bg-[#2E4057]/10 rounded-full text-[#2E4057]">
        {icon}
      </div>
      <h3 className="text-lg font-bold mb-2 text-[#2E4057]">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

export default function FeatureSection() {
  return (
    <section className="w-full py-16 lg:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-[#2E4057] mb-3">
            Why Choose Takshashila
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Our platform offers tailored resources to help you excel in civil
            services examinations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10">
          {features.map((feature, index) => (
            <Feature
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

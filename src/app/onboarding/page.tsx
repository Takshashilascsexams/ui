"use client";

import LogoHolder from "@/components/onboarding/logo_holder";
import MessageHolder from "@/components/onboarding/message_holder";
import OnboardingForm from "@/components/onboarding/onboardingform";

export default function OnboardingComponent() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-full md:w-[600px] mt-12 mb-12 py-5 px-8 flex flex-col items-center justify-center gap-10 md:border-[1px] md:border-slate-300 md:rounded-md md:shadow-lg">
        <LogoHolder />
        <MessageHolder />
        <OnboardingForm />
      </div>
    </div>
  );
}

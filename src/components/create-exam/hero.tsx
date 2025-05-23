"use client";

import { Toaster } from "../ui/sonner";
import CreateExamForm from "./form";

export default function Hero() {
  return (
    <div className="w-full flex flex-col items-center justify-center">
      <div className="w-full lg:w-[650px] px-8 py-10 mb-10 lg:border-[1px] lg:border-slate-300 lg:rounded-lg lg:shadow-md">
        <div className="mb-5">
          <h1 className="text-lg font-semibold">New Exam</h1>
        </div>
        {/* <div className="mb-5">
          <p className="text-sm text-red-600">All fields are required</p>
        </div> */}
        <CreateExamForm />
        <Toaster position="top-center" richColors />
      </div>
    </div>
  );
}

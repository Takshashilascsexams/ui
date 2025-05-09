"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Toaster } from "../ui/sonner";
import BulkCreationForm from "./bulk-creation-form";
import SingleCreationForm from "./single-creation-form";
import { Group, SquarePen } from "lucide-react";
import { Button } from "@/components/ui/button";
import FormatViewDialog from "./format-preview-dialog";
import QuestionsPreviewDialog from "./questions-preview-dialog";

interface Option {
  optionText: string;
  isCorrect: boolean;
}

interface Statement {
  statementNumber: number;
  statementText: string;
  isCorrect: boolean;
}

interface Question {
  isStatementBased: boolean;
  questionText: string;
  statements: Statement[];
  options: Option[];
  correctAnswer: string;
  statementInstruction: string;
  type: string;
}

export type PreviewDataType = {
  totalQuestionsExtracted: number;
  preview: Question[];
};

export type ActionButtonsHolderPropType = {
  previewData: PreviewDataType | null;
  children: React.ReactNode;
};

export type CustomPreviewModalPropType = {
  previewData: PreviewDataType | null;
  children: React.ReactNode;
};

type BulkCreationOptionHolderPropType = {
  setPreviewData: React.Dispatch<React.SetStateAction<PreviewDataType | null>>;
  children: React.ReactNode;
};

// action buttons
function ActionButtonsHolder() {
  return (
    <div className="w-full lg:w-[650px] px-8 lg:px-0 m-2 lg:m-6 text-sm text-blue-600 flex flex-col lg:flex-row items-start lg:items-center justify-center lg:justify-between gap-5">
      <div className="flex items-center justify-start gap-2">
        <span>
          <Link
            href={"#bulk"}
            className="px-3 py-[6px] flex items-center justify-center gap-2 border-[1px] border-blue-600 rounded-md font-medium"
          >
            <Group size={18} />
            Create in bulk
          </Link>
        </span>
        <span>
          <Link
            href={"#individual"}
            className="max-w-[193px] px-3 py-[6px] flex items-center justify-center gap-2 border-[1px] border-blue-600 rounded-md font-medium"
          >
            <SquarePen size={18} />
            Create single question
          </Link>
        </span>
      </div>

      <div className="flex items-center justify-start gap-4">
        <span>
          <FormatViewDialog>
            <Button
              variant={"ghost"}
              className="p-0 hover:bg-white hover:text-blue-600"
            >
              View format
            </Button>
          </FormatViewDialog>
        </span>
      </div>
    </div>
  );
}

function CustomPreviewDialog({
  children,
  previewData,
}: CustomPreviewModalPropType) {
  return (
    <div>
      <QuestionsPreviewDialog previewData={previewData}>
        {children}
      </QuestionsPreviewDialog>
    </div>
  );
}

// bulk questions creation form holder
function BulkCreationOptionHolder(props: BulkCreationOptionHolderPropType) {
  return (
    <div
      className="w-full lg:w-[650px] px-8 py-10 mb-10 lg:border-[1px] lg:border-slate-300 lg:rounded-lg lg:shadow-md"
      id="bulk"
    >
      <div className="mb-5">
        <h1 className="text-lg font-semibold">Create in Bulk</h1>
      </div>
      <BulkCreationForm {...props} />
      <Toaster position="top-center" richColors />
    </div>
  );
}

// single question creation form holder
function SingleCreationOptionHolder() {
  return (
    <div
      className="w-full lg:w-[650px] px-8 py-10 mb-10 lg:border-[1px] lg:border-slate-300 lg:rounded-lg lg:shadow-md"
      id="individual"
    >
      <div className="mb-5">
        <h1 className="text-lg font-semibold">Create Single Question</h1>
      </div>
      <SingleCreationForm />
      <Toaster position="top-center" richColors />
    </div>
  );
}

// custom separator
function Separator() {
  return (
    <div className="w-full lg:w-[650px] px-8 mb-10 flex items-center justify-center">
      <span className="w-full h-[1px] bg-slate-300"></span>
      <p className="mx-4 text-sm font-medium">Or</p>
      <span className="w-full h-[1px] bg-slate-300"></span>
    </div>
  );
}

export default function Hero() {
  const [previewData, setPreviewData] = useState<PreviewDataType | null>(null);

  return (
    <div className="w-full flex flex-col items-center justify-center">
      <ActionButtonsHolder />
      <BulkCreationOptionHolder setPreviewData={setPreviewData}>
        <CustomPreviewDialog previewData={previewData}>
          <Button
            type="button"
            variant="ghost"
            disabled={!previewData}
            className="text-indigo-600 hover:bg-white hover:text-indigo-600 absolute bottom-[-20px] xl:bottom-[-5px] right-[-10px] xl:right-0"
          >
            Preview
          </Button>
        </CustomPreviewDialog>
      </BulkCreationOptionHolder>
      <Separator />
      <SingleCreationOptionHolder />
    </div>
  );
}

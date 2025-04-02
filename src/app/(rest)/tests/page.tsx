import React from "react";
import { CATEGORIES } from "@/utils/constants";
import { fetchExams } from "@/services/tests.services";

import ExamCatalogueClient from "@/components/tests/test_catalogue";

async function ExamCataloguePage() {
  // Fetch data on the server
  let examData = {
    featured: [],
    exams: [],
    categories: CATEGORIES,
  };

  try {
    const response = await fetchExams();

    // Process the response to extract featured exams and regular exams
    if (response && response.data) {
      const categorizedExams = response.data.categorizedExams || {};

      // Extract featured exams
      const featured = categorizedExams["featured"] || [];
      delete categorizedExams["featured"];

      // Extract all other exams
      const allExams = Object.values(categorizedExams).flat();

      examData = {
        featured,
        exams: allExams,
        categories: CATEGORIES,
      };
    }
  } catch (error) {
    console.error("Error fetching exam data:", error);
    // Continue with empty data to show the UI in error state
  }

  return (
    <ExamCatalogueClient
      initialExams={examData.exams}
      initialFeaturedExams={examData.featured}
      categories={examData.categories}
    />
  );
}

export default ExamCataloguePage;

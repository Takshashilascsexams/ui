// Navigate to exam rules page (client-side only)
export const navigateToExamRules = (examId: string): void => {
  if (typeof window !== "undefined") {
    window.location.href = `/rules?examId=${examId}`;
  }
};

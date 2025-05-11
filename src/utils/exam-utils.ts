/**
 * Utility functions for exams
 */

/**
 * Gets the exam ID safely, handling both _id and id formats
 * @param exam Object containing either _id, id, or both
 * @returns The exam ID as a string
 */
export const getExamId = (exam: { _id?: string; id?: string }): string => {
  return (exam._id || exam.id || "").toString();
};

/**
 * Gets the edit URL for an exam
 * @param exam Object containing either _id, id, or both
 * @returns The URL for editing the exam
 */
export const getExamEditUrl = (exam: { _id?: string; id?: string }): string => {
  const examId = getExamId(exam);
  return `/dashboard/exams/edit/${examId}`;
};

/**
 * Gets the details URL for an exam
 * @param exam Object containing either _id, id, or both
 * @returns The URL for viewing exam details
 */
export const getExamDetailsUrl = (exam: {
  _id?: string;
  id?: string;
}): string => {
  const examId = getExamId(exam);
  return `/dashboard/exams/details/${examId}`;
};

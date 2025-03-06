export const convertToRedeableDate = (date: string | number) => {
  const newDate = new Date(date);
  const readableDate = newDate.toLocaleDateString("en-UK", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return readableDate;
};

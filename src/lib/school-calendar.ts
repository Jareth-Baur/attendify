export function isWeekend(
  dateString: string
) {
  const [year, month, day] = dateString
    .split("-")
    .map(Number);

  const date = new Date(
    year,
    month - 1,
    day
  );

  const dayOfWeek = date.getDay();

  return (
    dayOfWeek === 0 ||
    dayOfWeek === 6
  );
}
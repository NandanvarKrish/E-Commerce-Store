/**
 * Formats a number as a localized currency string.
 */
export function formatCurrency(
  amount: number,
  currency = "USD",
  locale = "en-US"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(amount);
}

/**
 * Formats an ISO date string into a readable date.
 */
export function formatDate(
  dateString: string | Date,
  locale = "en-US"
): string {
  const date = typeof dateString === "string" ? new Date(dateString) : dateString;
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

/**
 * Truncates text to a specified maximum length with an ellipsis.
 */
export function truncate(str: string, length = 60): string {
  if (!str || str.length <= length) return str;
  return `${str.slice(0, length)}...`;
}

/**
 * Formats an ISO date string or Date object to a clean human-readable date.
 * Example output: "04 Oct 2026"
 */
export function formatDate(dateInput: string | Date | undefined | null): string {
  if (!dateInput) return '';

  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return '';

  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

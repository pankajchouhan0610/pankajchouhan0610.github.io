const DATE_FORMAT = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
});

export function formatDate(date: Date): string {
  return DATE_FORMAT.format(date);
}

/** Relative date string matching the listing UI ("2 months ago"). */
export function formatRelativeDate(date: Date, from = new Date()): string {
  const diffMs = from.getTime() - date.getTime();
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const month = 30 * day;
  const year = 365 * day;

  if (diffMs < hour) {
    const minutes = Math.max(1, Math.round(diffMs / minute));
    return minutes === 1 ? '1 minute ago' : `${minutes} minutes ago`;
  }
  if (diffMs < day) {
    const hours = Math.round(diffMs / hour);
    return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
  }
  if (diffMs < month) {
    const days = Math.round(diffMs / day);
    return days === 1 ? '1 day ago' : `${days} days ago`;
  }
  if (diffMs < year) {
    const months = Math.round(diffMs / month);
    return months === 1 ? '1 month ago' : `${months} months ago`;
  }
  const years = Math.round(diffMs / year);
  return years === 1 ? '1 year ago' : `${years} years ago`;
}

export function toIso(date: Date): string {
  return date.toISOString();
}

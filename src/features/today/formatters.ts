export function createTomorrowAtNine() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  date.setHours(9, 0, 0, 0);
  return date.toISOString();
}

export function formatLongDate(value: Date, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(value);
}

export function formatTime(value: string | null, locale: string, fallback: string) {
  if (!value) return fallback;

  return new Intl.DateTimeFormat(locale, {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
}

export function formatDateTime(value: string | null, locale: string, fallback: string) {
  if (!value) return fallback;

  return new Intl.DateTimeFormat(locale, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
}

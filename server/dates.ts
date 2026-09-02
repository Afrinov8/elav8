// Monday-Sunday week boundaries (Elav8 subscription weeks sync to Mon-Sun).
export function startOfWeek(d: Date): Date {
  const date = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const day = date.getUTCDay(); // 0 = Sunday
  const diff = (day === 0 ? -6 : 1) - day;
  date.setUTCDate(date.getUTCDate() + diff);
  return date;
}

export function addDays(d: Date, days: number): Date {
  const date = new Date(d);
  date.setUTCDate(date.getUTCDate() + days);
  return date;
}

export function dayKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

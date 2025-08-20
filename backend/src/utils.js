export function toISODate(date) {
  return date.toISOString().slice(0, 10);
}

// Generate 30-min intervals from 09:00 to 17:00 (UTC) for a date (YYYY-MM-DD)
export function generateDaySlotsUtc(yyyyMmDd) {
  const [y, m, d] = yyyyMmDd.split('-').map(Number);
  const startHour = 9;
  const endHour = 17;
  const out = [];
  for (let h = startHour; h < endHour; h++) {
    for (let min of [0, 30]) {
      const start = new Date(Date.UTC(y, m - 1, d, h, min, 0, 0));
      const end = new Date(start.getTime() + 30 * 60 * 1000);
      out.push({ start, end });
    }
  }
  return out;
}

export function listDatesInclusive(fromISO, toISO) {
  const dates = [];
  const start = new Date(fromISO + 'T00:00:00.000Z');
  const end = new Date(toISO + 'T00:00:00.000Z');
  for (let d = new Date(start); d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
    dates.push(d.toISOString().slice(0,10));
  }
  return dates;
}

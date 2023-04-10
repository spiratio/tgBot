export function convertIntervalToCron(interval: number): string {
  if (interval < 1 || interval > 5000) {
    throw new Error('Interval should be between 1 and 5000');
  }
  const minutes = new Date().getUTCMinutes();
  const hours = Math.floor(interval / 60) % 24;
  const days = Math.floor(interval / (60 * 24));
  const minutesCron = `${minutes} */${interval} * * *`;
  const hoursCron = `${minutes} ${hours} */${days} * *`;
  const daysCron = `${minutes} ${hours} * */${days} *`;

  if (days > 0) {
    return daysCron;
  } else if (hours > 0) {
    return hoursCron;
  } else {
    return minutesCron;
  }
}

export function randomBoolean(): boolean {
  return Math.random() >= 0.5;
}
export function randomNumber(maxNumber: number): number {
  return Math.floor(Math.random() * (maxNumber + 1));
}
export function getUpgradedString(
  specialChars: string[],
  numbers: string[],
  letters: string[],
): string {
  let result = [];
  if (randomBoolean()) {
    result = letters.concat().flat();
    if (randomBoolean()) {
      result = result.concat(numbers, specialChars).flat();
    } else {
      result = result.concat(specialChars, numbers).flat();
    }
  } else {
    result = specialChars.concat().flat();
    if (randomBoolean()) {
      result = result.concat(letters, numbers).flat();
    } else {
      result = result.concat(numbers, letters).flat();
    }
  }
  return result.join('');
}

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
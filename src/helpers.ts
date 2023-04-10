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

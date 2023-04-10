import { randomBoolean, randomNumber } from './helpers';

export class PasswordGenerator {
  private length: number;

  constructor(length: number = 8) {
    this.length = length;
  }

  public generatePassword(): string {
    const specialChars = this.getspecialChars();
    const numbers = this.getNumbers();
    const maxLetterInPass =
      this.length - (specialChars.length + numbers.length);
    const letters = this.getLetters(maxLetterInPass);

    return this.getUpgradedString(specialChars, numbers, letters);
  }
  private getspecialChars(): string[] {
    const result = [];
    const specialChars = ['!', '@', '*', '&', '?'];
    const index = randomNumber(specialChars.length - 1);
    result.push(specialChars[index]);
    return result;
  }
  private getNumbers(): string[] {
    const maxNumbersInPass = randomNumber(3);
    const result = [];
    for (let i = 0; i < maxNumbersInPass; i++) {
      result.push(randomNumber(9).toString());
    }
    return result;
  }
  private getLetters(maxLetterInPass: number): string[] {
    const vowelsLetters = ['a', 'e', 'i', 'o', 'u'];
    const consonantsLetters = [
      'b',
      'c',
      'd',
      'f',
      'g',
      'h',
      'j',
      'k',
      'l',
      'm',
      'n',
      'p',
      'q',
      'r',
      's',
      't',
      'v',
      'w',
      'x',
      'y',
      'z',
    ];
    const result = [];
    let isVowel = randomBoolean();
    for (let i = 0; i < maxLetterInPass; i++) {
      const isUppercase = randomBoolean();
      if (isVowel) {
        if (isUppercase) {
          result.push(
            vowelsLetters[randomNumber(vowelsLetters.length - 1)].toUpperCase(),
          );
        } else {
          result.push(vowelsLetters[randomNumber(vowelsLetters.length - 1)]);
        }
      } else {
        if (isUppercase) {
          result.push(
            consonantsLetters[
              randomNumber(consonantsLetters.length - 1)
            ].toUpperCase(),
          );
        } else {
          result.push(
            consonantsLetters[randomNumber(consonantsLetters.length - 1)],
          );
        }
      }
      isVowel = !isVowel;
    }
    return result;
  }

  private getUpgradedString(
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
}

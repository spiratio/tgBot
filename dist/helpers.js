"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUpgradedString = exports.randomNumber = exports.randomBoolean = void 0;
function randomBoolean() {
    return Math.random() >= 0.5;
}
exports.randomBoolean = randomBoolean;
function randomNumber(maxNumber) {
    return Math.floor(Math.random() * (maxNumber + 1));
}
exports.randomNumber = randomNumber;
function getUpgradedString(specialChars, numbers, letters) {
    let result = [];
    if (randomBoolean()) {
        result = letters.concat().flat();
        if (randomBoolean()) {
            result = result.concat(numbers, specialChars).flat();
        }
        else {
            result = result.concat(specialChars, numbers).flat();
        }
    }
    else {
        result = specialChars.concat().flat();
        if (randomBoolean()) {
            result = result.concat(letters, numbers).flat();
        }
        else {
            result = result.concat(numbers, letters).flat();
        }
    }
    return result.join('');
}
exports.getUpgradedString = getUpgradedString;

/**
 * Checks if a given string is valid JSON.
 *
 * @param {string} str - The string to be checked.
 * @returns {boolean} - Returns true if the string is valid JSON, otherwise false.
 */
export const isValidJSON = (str: string): boolean => {
  try {
    JSON.parse(str);
    return true;
  } catch (e) {
    return false;
  }
};

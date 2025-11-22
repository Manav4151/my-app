export const cleanIsbnInput = (raw: string): string => {
  if (!raw) return '';
  const upper = raw.toUpperCase();
  const alnum = upper.replace(/[^0-9X]/g, '');
  if (alnum.length > 10) return alnum.replace(/[^0-9]/g, '');
  if (alnum.includes('X') && alnum.indexOf('X') !== alnum.length - 1) {
    return alnum.replace(/X/g, '');
  }
  return alnum;
};

const validateISBN10 = (cleanISBN: string): boolean => {
  if (cleanISBN.length !== 10) return false;
  if (!/^\d{9}[\dX]$/.test(cleanISBN)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(cleanISBN[i]) * (10 - i);
  const checkDigit = cleanISBN[9] === 'X' ? 10 : parseInt(cleanISBN[9]);
  sum += checkDigit;
  return sum % 11 === 0;
};

const validateISBN13 = (cleanISBN: string): boolean => {
  if (cleanISBN.length !== 13 || !/^\d{13}$/.test(cleanISBN)) return false;
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cleanISBN[i]) * (i % 2 === 0 ? 1 : 3);
  }
  const checkDigit = (10 - (sum % 10)) % 10;
  return checkDigit === parseInt(cleanISBN[12]);
};

export const validateISBN = (isbn: string): boolean => {
  if (!isbn || isbn.trim() === '') return false;
  const cleanISBN = cleanIsbnInput(isbn);
  if (cleanISBN.length === 10) return validateISBN10(cleanISBN);
  if (cleanISBN.length === 13) return validateISBN13(cleanISBN);
  return false;
};

export const normalizeISBN = (isbn: string): string => {
  if (!isbn) return '';
  return cleanIsbnInput(isbn);
};
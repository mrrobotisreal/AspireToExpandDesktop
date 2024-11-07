export const VALID_LOCALES = [
  'en',
  'en_US',
  'ru',
  'ru_RU',
  'uk',
  'uk_UA',
];

export function validateLocale(locale: string): boolean {
  return VALID_LOCALES.includes(locale);
}

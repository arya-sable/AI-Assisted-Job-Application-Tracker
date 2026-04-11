const INDIAN_LOCATION_REGEX =
  /\b(india|mumbai|pune|bengaluru|bangalore|delhi|new delhi|noida|gurgaon|gurugram|hyderabad|chennai|kolkata|ahmedabad|surat|jaipur|lucknow|coimbatore)\b/i;

const INDIAN_HINT_REGEX =
  /(₹|\b(?:inr|rs\.?|rupees?|lpa|lac|lakh|lakhs|crore|crores|cr)\b)/i;

const OTHER_CURRENCY_HINT_REGEX = /(\$|€|£|\b(?:usd|eur|gbp)\b)/i;
const NUMBER_TOKEN_REGEX = /\d+(?:[.,]\d+)?/;
const RANGE_SEPARATOR_REGEX = /\s*(?:-|–|—|\bto\b)\s*/i;

const INDIAN_NUMBER_FORMATTER = new Intl.NumberFormat('en-IN', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

const formatIndianNumber = (value: number): string => {
  if (!Number.isFinite(value)) return '';
  if (value < 1000) {
    return Number.isInteger(value) ? value.toString() : value.toFixed(2).replace(/\.?0+$/, '');
  }
  return INDIAN_NUMBER_FORMATTER.format(value);
};

const normalizeIndianUnit = (unit: string): string => {
  const normalized = unit.toLowerCase();
  if (normalized === 'lac' || normalized === 'lakh' || normalized === 'lakhs' || normalized === 'lpa') {
    return normalized === 'lpa' ? 'LPA' : 'Lakh';
  }
  if (normalized === 'cr' || normalized === 'crore' || normalized === 'crores') return 'Cr';
  if (normalized === 'k') return 'K';
  if (normalized === 'm') return 'M';
  return unit;
};

const formatIndianSalaryPart = (rawPart: string): string => {
  const part = rawPart.trim();
  if (!part) return '';

  const withoutCurrency = part
    .replace(/₹/g, '')
    .replace(/\b(?:inr|rs\.?|rupees?)\b/gi, '')
    .trim();

  const numberToken = withoutCurrency.match(NUMBER_TOKEN_REGEX)?.[0];
  if (!numberToken) return part;

  const parsedValue = Number(numberToken.replace(/,/g, ''));
  if (!Number.isFinite(parsedValue)) return `₹${withoutCurrency}`;

  const formattedNumber = formatIndianNumber(parsedValue);
  const unitMatch = withoutCurrency.match(/\b(k|m|lpa|lac|lakh|lakhs|cr|crore|crores)\b/i);
  const normalizedUnit = unitMatch ? normalizeIndianUnit(unitMatch[1]) : '';

  const suffix = withoutCurrency
    .replace(numberToken, '')
    .replace(/\b(k|m|lpa|lac|lakh|lakhs|cr|crore|crores)\b/i, '')
    .replace(/\s{2,}/g, ' ')
    .trim();

  const unitSegment = normalizedUnit
    ? normalizedUnit === 'K' || normalizedUnit === 'M'
      ? normalizedUnit
      : ` ${normalizedUnit}`
    : '';
  const suffixSegment = suffix ? ` ${suffix}` : '';
  return `₹${formattedNumber}${unitSegment}${suffixSegment}`.trim();
};

export const normalizeSalaryRange = (salaryRange: string, location?: string): string => {
  const raw = salaryRange.trim();
  if (!raw) return '';

  // Respect explicit non-INR currency inputs.
  if (OTHER_CURRENCY_HINT_REGEX.test(raw) && !INDIAN_HINT_REGEX.test(raw)) return raw;

  const isIndianContext = INDIAN_HINT_REGEX.test(raw) || INDIAN_LOCATION_REGEX.test(location ?? '');
  if (!isIndianContext) return raw;

  const parts = raw.split(RANGE_SEPARATOR_REGEX).map((part) => part.trim()).filter(Boolean);
  if (parts.length > 1 && parts.every((part) => NUMBER_TOKEN_REGEX.test(part))) {
    return parts.map((part) => formatIndianSalaryPart(part)).join(' - ');
  }

  return formatIndianSalaryPart(raw);
};

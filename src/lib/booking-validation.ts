const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

const SWEDISH_PLATE_REGEX = /^[A-ZÅÄÖ]{3}\d{2,3}[A-ZÅÄÖ]?$/;

export function sanitizeRegistration(value: string) {
  return value
    .toUpperCase()
    .replace(/[^A-ZÅÄÖ0-9\s]/gi, "")
    .replace(/\s+/g, " ")
    .slice(0, 8);
}

export function isValidRegistration(value: string) {
  const compact = value.trim().toUpperCase().replace(/\s/g, "");
  if (compact.length < 4 || compact.length > 7) return false;
  if (!/^[A-ZÅÄÖ0-9]+$/.test(compact)) return false;

  const letters = (compact.match(/[A-ZÅÄÖ]/g) ?? []).length;
  const digits = (compact.match(/\d/g) ?? []).length;
  if (letters < 2 || digits < 1) return false;

  return SWEDISH_PLATE_REGEX.test(compact);
}

export function sanitizeEmail(value: string) {
  return value.trim().toLowerCase().replace(/\s/g, "").slice(0, 254);
}

export function isValidEmail(value: string) {
  const email = sanitizeEmail(value);
  return email.length >= 5 && email.length <= 254 && EMAIL_REGEX.test(email);
}

export function sanitizePhone(value: string) {
  return value.replace(/[^\d\s+\-]/g, "").slice(0, 18);
}

export function phoneDigits(value: string) {
  let digits = value.replace(/\D/g, "");
  if (digits.startsWith("46")) {
    digits = `0${digits.slice(2)}`;
  }
  return digits;
}

export function isValidPhone(value: string) {
  const digits = phoneDigits(value);
  return digits.length >= 9 && digits.length <= 10 && digits.startsWith("0");
}

export function isValidBookingContact(fields: {
  registration: string;
  email: string;
  phone: string;
  customerName?: string;
}) {
  const nameOk =
    fields.customerName === undefined ||
    fields.customerName.trim().length >= 2;
  return (
    nameOk &&
    isValidRegistration(fields.registration) &&
    isValidEmail(fields.email) &&
    isValidPhone(fields.phone)
  );
}

export function sanitizeCustomerName(value: string) {
  return value.replace(/\s+/g, " ").trim().slice(0, 80);
}

export function isValidCustomerName(value: string) {
  return sanitizeCustomerName(value).length >= 2;
}

const NBSP = " ";

const currency = new Intl.NumberFormat("en-ZA", {
  style: "currency",
  currency: "ZAR",
});

const signedCurrency = new Intl.NumberFormat("en-ZA", {
  style: "currency",
  currency: "ZAR",
  signDisplay: "exceptZero",
});

function normaliseSpaces(text: string): string {
  return text.replace(/[\s ]/g, NBSP);
}

export function formatCents(cents: number): string {
  return normaliseSpaces(currency.format(cents / 100));
}

export function formatSignedCents(cents: number): string {
  return normaliseSpaces(signedCurrency.format(cents / 100));
}

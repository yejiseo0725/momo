const monthPattern = /^\d{4}-(0[1-9]|1[0-2])$/;

export function getCurrentMonth() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

export function normalizeMonth(value) {
  return typeof value === "string" && monthPattern.test(value) ? value : getCurrentMonth();
}

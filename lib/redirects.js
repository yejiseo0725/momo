import { redirect } from "next/navigation";

function addToastMessage(pathname, type, message) {
  const url = new URL(pathname, "http://momo.local");
  url.searchParams.set(type, message);
  return `${url.pathname}${url.search}${url.hash}`;
}

export function redirectWithSuccess(pathname, message) {
  redirect(addToastMessage(pathname, "message", message));
}

export function redirectWithError(pathname, message) {
  redirect(addToastMessage(pathname, "error", message));
}

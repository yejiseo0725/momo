"use client";

import { useEffect } from "react";
import { toast } from "sonner";

export default function ToastMessage({ error, message }) {
  useEffect(() => {
    const toastType = error ? "error" : "success";
    const toastMessage = error || message;
    const toastKey = `${toastType}:${toastMessage}`;

    if (!toastMessage) {
      return;
    }

    if (error) {
      toast.error(error, { id: toastKey });
    } else {
      toast.success(message, { id: toastKey });
    }

    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.delete("error");
    currentUrl.searchParams.delete("message");
    const cleanedUrl = `${currentUrl.pathname}${currentUrl.search}${currentUrl.hash}`;
    window.history.replaceState(window.history.state, "", cleanedUrl);
  }, [error, message]);

  return null;
}

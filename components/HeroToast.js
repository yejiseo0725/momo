"use client";

import { toast } from "@heroui/react";
import { useEffect, useRef } from "react";

export default function HeroToast({ error, message, trigger }) {
  const lastToast = useRef({ key: "", trigger: null });

  useEffect(() => {
    const toastType = error ? "error" : "success";
    const toastMessage = error || message;
    const toastKey = `${toastType}:${toastMessage}`;

    if (
      !toastMessage
      || (lastToast.current.key === toastKey && lastToast.current.trigger === trigger)
    ) {
      return;
    }

    lastToast.current = { key: toastKey, trigger };
    if (error) {
      toast.danger(error);
    } else {
      toast.success(message);
    }

    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.delete("error");
    currentUrl.searchParams.delete("message");
    const cleanedUrl = `${currentUrl.pathname}${currentUrl.search}${currentUrl.hash}`;
    window.history.replaceState(window.history.state, "", cleanedUrl);
  }, [error, message, trigger]);

  return null;
}
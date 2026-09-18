import { Spinner } from "@heroui/react";

export default function Loading() {
  return (
    <div className="flex items-center gap-2" aria-live="polite">
      <Spinner size="sm" />
      <span>불러오는 중입니다…</span>
    </div>
  );
}

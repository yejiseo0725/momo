"use client";

import { Button, Label, Typography } from "@heroui/react";
import { useRef, useState } from "react";

export default function ImageFileField({
  emptyText = "선택된 파일 없음",
  helpText,
  id,
  isRequired = false,
  label,
  name,
}) {
  const [selectedFileName, setSelectedFileName] = useState("");
  const fileInputRef = useRef(null);
  const fileNameId = `${id}-name`;
  const descriptionId = `${id}-description`;
  const describedBy = `${fileNameId} ${descriptionId}`;

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id} isRequired={isRequired}>{label}</Label>
      <input
        ref={fileInputRef}
        className="sr-only"
        id={id}
        name={name}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        required={isRequired}
        aria-describedby={describedBy}
        onChange={(event) => {
          setSelectedFileName(event.target.files?.[0]?.name || "");
        }}
      />
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          aria-describedby={describedBy}
          onPress={() => fileInputRef.current?.click()}
        >
          사진 선택
        </Button>
        <Typography
          id={fileNameId}
          color="muted"
          type="body-sm"
          aria-live="polite"
        >
          {selectedFileName || emptyText}
        </Typography>
      </div>
      <Typography id={descriptionId} color="muted" type="body-sm">
        {helpText}
      </Typography>
    </div>
  );
}

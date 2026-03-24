"use client";

import { useMemo } from "react";
import { Input } from "@/modules/shared/ui";

type TagInputProps = {
  id: string;
  label: string;
  placeholder?: string;
  defaultValue?: string[];
  helperText?: string;
};

export function TagInput({
  id,
  label,
  placeholder,
  defaultValue = [],
  helperText = "Nhập dữ liệu cách nhau bằng dấu phẩy (ví dụ: React, Node.js, SQL).",
}: TagInputProps) {
  const defaultString = useMemo(() => defaultValue.join(", "), [defaultValue]);

  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-foreground" htmlFor={id}>
        {label}
      </label>
      <Input defaultValue={defaultString} id={id} name={id} placeholder={placeholder ?? "React, Next.js, PostgreSQL"} type="text" />
      <p className="text-xs text-muted-foreground">{helperText}</p>
    </div>
  );
}

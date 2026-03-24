"use client";

import { useState } from "react";

type RatingProps = {
  name: string;
  defaultValue?: number;
  label?: string;
};

function StarIcon({ active }: { active: boolean }) {
  return (
    <svg
      aria-hidden="true"
      className={`h-6 w-6 ${active ? "fill-warning-600 text-warning-600" : "fill-transparent text-muted-foreground/40"}`}
      viewBox="0 0 24 24"
    >
      <path d="M12 2.4l2.87 5.81 6.4.94-4.64 4.52 1.1 6.37L12 17.01l-5.73 3.03 1.09-6.37-4.63-4.52 6.4-.94L12 2.4z" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

export function Rating({ name, defaultValue = 3, label = "Đánh giá" }: RatingProps) {
  const [value, setValue] = useState(defaultValue);

  return (
    <div className="space-y-1.5">
      <div aria-label={label} className="flex items-center gap-1" role="radiogroup">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            aria-checked={star === value}
            aria-label={`${star} sao`}
            className="rounded-sm p-0.5 transition hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300"
            key={star}
            onClick={() => setValue(star)}
            role="radio"
            type="button"
          >
            <StarIcon active={star <= value} />
          </button>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">Mức hiện tại: {value}/5</p>
      <input name={name} type="hidden" value={value} />
    </div>
  );
}

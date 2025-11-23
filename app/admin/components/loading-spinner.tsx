"use client";

interface LoadingSpinnerProps {
  size?: "sm" | "md";
}

const sizeClassMap: Record<NonNullable<LoadingSpinnerProps["size"]>, string> = {
  sm: "size-8",
  md: "size-12",
};

export function LoadingSpinner({ size = "md" }: LoadingSpinnerProps) {
  return (
    <div
      className={`${sizeClassMap[size]} border-b-2 border-l-2 border-white rounded-full animate-spin`}
    />
  );
}

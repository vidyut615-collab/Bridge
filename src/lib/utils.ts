import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDateKolkata(dateInput: Date | string | number | null | undefined): string {
  if (!dateInput) return "—";
  const date = typeof dateInput === "string" || typeof dateInput === "number" ? new Date(dateInput) : dateInput;
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat("en-IN").format(num);
}

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function convertBigIntToString(value: any): any {
  // Handle null and undefined
  if (value === null || value === undefined) {
    return value;
  }

  // Handle BigInt
  if (typeof value === "bigint") {
    return value.toString();
  }

  // Handle Date objects
  if (value instanceof Date) {
    return value.toISOString();
  }

  // Handle arrays
  if (Array.isArray(value)) {
    return value.map(convertBigIntToString);
  }

  // Handle plain objects
  if (typeof value === "object" && value.constructor === Object) {
    return Object.fromEntries(
      Object.entries(value).map(([key, val]) => [
        key,
        convertBigIntToString(val),
      ])
    );
  }

  // Handle Map
  if (value instanceof Map) {
    return new Map(
      Array.from(value.entries()).map(([key, val]) => [
        key,
        convertBigIntToString(val),
      ])
    );
  }

  // Handle Set
  if (value instanceof Set) {
    return new Set(Array.from(value).map(convertBigIntToString));
  }

  // Handle functions (you might want to customize this based on your needs)
  if (typeof value === "function") {
    return value.toString();
  }

  // For all other types (string, number, boolean, symbol), return as is
  return value;
}
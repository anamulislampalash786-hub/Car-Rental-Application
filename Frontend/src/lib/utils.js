import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount) {
    return new Intl.NumberFormat('fi-FI', {
        style:    'currency',
        currency: 'EUR',
    }).format(amount);
}

export function formatDate(date) {
    return format(new Date(date), 'dd MMM yyyy');
}
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function resolveFileUrl(url?: string | null): string {
    if (!url) return '';
    const trimmedUrl = url.trim();
    if (trimmedUrl.startsWith('http') || trimmedUrl.startsWith('data:') || trimmedUrl.startsWith('blob:')) {
        return trimmedUrl;
    }
    // Add slash if missing for local paths
    const cleanUrl = trimmedUrl.startsWith('/') ? trimmedUrl : `/${trimmedUrl}`;

    // Return relative URL to allow Vite proxy to handle it (avoids CORS issues on localhost)
    return cleanUrl;
}

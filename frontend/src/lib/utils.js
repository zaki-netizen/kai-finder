import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind classes with clsx
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Format date to Indonesian format
 */
export function formatDate(date, options = {}) {
  if (!date) return '-';

  const defaultOptions = {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...options,
  };

  return new Date(date).toLocaleDateString('id-ID', defaultOptions);
}

/**
 * Format datetime to Indonesian format
 */
export function formatDateTime(date) {
  if (!date) return '-';

  return new Date(date).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format relative time (e.g., "2 jam yang lalu")
 */
export function formatRelativeTime(date) {
  if (!date) return '-';

  const now = new Date();
  const diff = now - new Date(date);
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 7) {
    return formatDate(date);
  } else if (days > 0) {
    return `${days} hari yang lalu`;
  } else if (hours > 0) {
    return `${hours} jam yang lalu`;
  } else if (minutes > 0) {
    return `${minutes} menit yang lalu`;
  } else {
    return 'Baru saja';
  }
}

/**
 * Get status badge color class
 */
export function getStatusBadge(status) {
  const statusMap = {
    AKTIF: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    DIKLAIM: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    DIAMBIL: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    ARCHIVE: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    APPROVED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    REJECTED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  };

  return statusMap[status] || statusMap.ACTIVE;
}

/**
 * Get status label in Indonesian
 */
export function getStatusLabel(status) {
  const labelMap = {
    AKTIF: 'Tersedia',
    DIKLAIM: 'Diklaim',
    DIAMBIL: 'Sudah Diambil',
    ARCHIVE: 'Diarsipkan',
    PENDING: 'Menunggu',
    APPROVED: 'Disetujui',
    REJECTED: 'Ditolak',
  };

  return labelMap[status] || status;
}

/**
 * Capitalize first letter
 */
export function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Truncate text
 */
export function truncate(str, length = 50) {
  if (!str) return '';
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

/**
 * Generate page title
 */
export function getPageTitle(title) {
  return `${title} | KAI Finder`;
}

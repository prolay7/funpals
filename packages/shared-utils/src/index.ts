/** Shared utility functions */

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

export function truncate(str: string, maxLength = 80): string {
  return str.length > maxLength ? str.slice(0, maxLength - 1) + '…' : str;
}

export function milesLabel(miles: number): string {
  return miles < 1 ? `${Math.round(miles * 5280)} ft` : `${miles.toFixed(1)} mi`;
}

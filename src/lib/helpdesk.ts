/*
 * Helpdesk settings: the app name, the signed-in agent, and the allowed statuses,
 * priorities and departments with their colours. Change these to fit the business.
 */

export const APP_NAME = 'Support Desk';

export const CURRENT_USER = {
  name: 'John Doe',
  initials: 'JD',
  email: 'john@example.com',
};

export const STATUSES = ['open', 'pending', 'closed'];
export const PRIORITIES = ['low', 'medium', 'high'];
export const DEPARTMENTS = ['Technical Support', 'Billing', 'General Inquiry'];

const STATUS_CLASSES: Record<string, string> = {
  open: 'bg-green-500/20 text-green-400',
  pending: 'bg-yellow-500/20 text-yellow-400',
  closed: 'bg-red-500/20 text-red-400',
};

const PRIORITY_CLASSES: Record<string, string> = {
  low: 'bg-gray-700 text-gray-300',
  medium: 'bg-blue-500/20 text-blue-400',
  high: 'bg-orange-500/20 text-orange-400',
};

export const statusClass = (status: string) => STATUS_CLASSES[status] ?? 'bg-gray-700 text-gray-300';
export const priorityClass = (priority: string) => PRIORITY_CLASSES[priority] ?? 'bg-gray-700 text-gray-300';

export const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join('') || '?';

export function timeAgo(value?: string) {
  if (!value) return '';
  const seconds = Math.round((Date.now() - new Date(value).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const units: [number, string][] = [
    [60 * 60 * 24 * 365, 'year'],
    [60 * 60 * 24 * 30, 'month'],
    [60 * 60 * 24 * 7, 'week'],
    [60 * 60 * 24, 'day'],
    [60 * 60, 'hour'],
    [60, 'minute'],
  ];
  for (const [size, unit] of units) {
    if (seconds >= size) {
      const n = Math.floor(seconds / size);
      return `${n} ${unit}${n === 1 ? '' : 's'} ago`;
    }
  }
  return '';
}

export const formatDate = (value?: string) =>
  value ? new Date(value).toLocaleDateString('en', { month: 'long', day: 'numeric', year: 'numeric' }) : '';

/** Number of messages per ticket id. */
export function countByTicket(messages: { ticket_id: string }[]) {
  const counts: Record<string, number> = {};
  for (const m of messages) counts[m.ticket_id] = (counts[m.ticket_id] ?? 0) + 1;
  return counts;
}

/** Newest first. */
export const byNewest = (a: { created_at?: string }, b: { created_at?: string }) =>
  (b.created_at ?? '').localeCompare(a.created_at ?? '');

/** Short, readable ticket number derived from the row id. */
export const ticketNumber = (id: string) => id.replace(/-/g, '').slice(0, 6).toUpperCase();

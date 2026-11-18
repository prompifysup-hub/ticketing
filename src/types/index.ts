import type { Row } from '@/lib/data';

/** A row of the `tickets` table. */
export interface Ticket extends Row {
  subject: string;
  description: string | null;
  status: string; // one of STATUSES in src/lib/helpdesk.ts
  priority: string; // one of PRIORITIES
  department: string | null;
  requester_name: string | null;
  requester_email: string | null;
  /** Values of the custom ticket fields, keyed by ticket_fields id. */
  custom_fields?: Record<string, string | number | null> | null;
}

/** A row of the `ticket_fields` table: a field the business added in Settings. */
export interface TicketField extends Row {
  label: string;
  field_type: 'text' | 'number' | 'date' | 'select';
  /** Choices for a dropdown field. */
  options: string[] | null;
  position: number | null;
}

/** A row of the `ticket_messages` table: one reply in a ticket's conversation. */
export interface Message extends Row {
  ticket_id: string;
  author_name: string;
  body: string;
  is_staff: boolean | null;
}

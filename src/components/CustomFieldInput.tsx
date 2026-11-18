import type { TicketField } from '@/types';

export const FIELD_TYPES: { value: TicketField['field_type']; label: string }[] = [
  { value: 'text', label: 'Text' },
  { value: 'number', label: 'Number' },
  { value: 'date', label: 'Date' },
  { value: 'select', label: 'Dropdown' },
];

const inputClass = 'w-full bg-gray-700 rounded-lg px-4 py-2.5 text-gray-100';

/** Fields ordered as set in Settings. */
export const sortFields = (fields: TicketField[]) =>
  [...fields].sort((a, b) => (a.position ?? 0) - (b.position ?? 0) || (a.created_at ?? '').localeCompare(b.created_at ?? ''));

interface Props {
  field: TicketField;
  value: string | number | null | undefined;
  onChange: (value: string | number | null) => void;
  onBlur?: () => void;
  className?: string;
}

/** One input for a custom ticket field, in the Ticketfy input style. */
export function CustomFieldInput({ field, value, onChange, onBlur, className = inputClass }: Props) {
  if (field.field_type === 'select') {
    return (
      <select className={className} value={value ?? ''} onChange={(e) => onChange(e.target.value || null)}>
        <option value="">—</option>
        {(field.options || []).map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    );
  }
  return (
    <input
      type={field.field_type === 'number' ? 'number' : field.field_type === 'date' ? 'date' : 'text'}
      className={className}
      value={value ?? ''}
      onChange={(e) =>
        onChange(e.target.value === '' ? null : field.field_type === 'number' ? Number(e.target.value) : e.target.value)
      }
      onBlur={onBlur}
    />
  );
}

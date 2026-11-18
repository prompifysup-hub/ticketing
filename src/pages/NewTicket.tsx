import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useTable } from '@/lib/data';
import { DEPARTMENTS, PRIORITIES } from '@/lib/helpdesk';
import type { Ticket, TicketField } from '@/types';
import { CustomFieldInput, sortFields } from '@/components/CustomFieldInput';

const inputClass = 'w-full bg-gray-700 rounded-lg px-4 py-2.5 text-gray-100';
const labelClass = 'block text-sm font-medium text-gray-400 mb-2';

export function NewTicket() {
  const navigate = useNavigate();
  const tickets = useTable<Ticket>('tickets');
  const fields = useTable<TicketField>('ticket_fields');
  const [custom, setCustom] = useState<Record<string, string | number | null>>({});
  const [form, setForm] = useState({
    subject: '',
    requester_name: '',
    requester_email: '',
    department: DEPARTMENTS[0],
    priority: 'medium',
    description: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (field: keyof typeof form) => (e: { target: { value: string } }) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  async function submit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const row = await tickets.create({ ...form, status: 'open', custom_fields: custom });
      navigate(`/tickets/${row.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setSaving(false);
    }
  }

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Create New Ticket</h1>

        <Card>
          <CardHeader>
            <CardTitle>Ticket Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={submit}>
              <div>
                <label className={labelClass}>
                  Subject
                </label>
                <input
                  type="text"
                  required
                  value={form.subject}
                  onChange={set('subject')}
                  className={inputClass}
                  placeholder="Brief description of the issue"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>
                    Customer Name
                  </label>
                  <input
                    type="text"
                    value={form.requester_name}
                    onChange={set('requester_name')}
                    className={inputClass}
                    placeholder="Who reported it"
                  />
                </div>
                <div>
                  <label className={labelClass}>
                    Customer Email
                  </label>
                  <input
                    type="email"
                    value={form.requester_email}
                    onChange={set('requester_email')}
                    className={inputClass}
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>
                  Department
                </label>
                <select className={inputClass} value={form.department} onChange={set('department')}>
                  {DEPARTMENTS.map((d) => (
                    <option key={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClass}>
                  Priority
                </label>
                <select className={inputClass} value={form.priority} onChange={set('priority')}>
                  {PRIORITIES.map((p) => (
                    <option key={p} value={p}>{p[0]!.toUpperCase() + p.slice(1)}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClass}>
                  Description
                </label>
                <textarea
                  rows={6}
                  required
                  value={form.description}
                  onChange={set('description')}
                  className={inputClass}
                  placeholder="Detailed description of the issue..."
                />
              </div>

              {sortFields(fields.rows).length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {sortFields(fields.rows).map((field) => (
                    <div key={field.id}>
                      <label className={labelClass}>{field.label}</label>
                      <CustomFieldInput
                        field={field}
                        value={custom[field.id]}
                        onChange={(value) => setCustom((prev) => ({ ...prev, [field.id]: value }))}
                      />
                    </div>
                  ))}
                </div>
              )}

              {error && <p className="text-sm text-red-400">{error}</p>}

              <Button className="w-full" type="submit" disabled={saving}>
                {saving ? 'Submitting…' : 'Submit Ticket'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

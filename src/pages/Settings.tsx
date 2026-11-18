import { useState, type FormEvent } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { DataNotice } from '@/components/DataNotice';
import { FIELD_TYPES, sortFields } from '@/components/CustomFieldInput';
import { useTable } from '@/lib/data';
import type { TicketField } from '@/types';
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2, X } from 'lucide-react';

const inputClass = 'w-full bg-gray-700 rounded-lg px-4 py-2.5 text-gray-100';
const labelClass = 'block text-sm font-medium text-gray-400 mb-2';

type Draft = { label: string; field_type: TicketField['field_type']; options: string };
const emptyDraft: Draft = { label: '', field_type: 'text', options: '' };

/**
 * Settings: the custom ticket fields. Fields added here appear on the new-ticket form and on
 * every ticket page; their values are stored on the ticket (tickets.custom_fields).
 */
export function Settings() {
  const fields = useTable<TicketField>('ticket_fields');
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const sorted = sortFields(fields.rows);

  const toRow = (d: Draft) => ({
    label: d.label.trim(),
    field_type: d.field_type,
    options: d.field_type === 'select' ? d.options.split(',').map((o) => o.trim()).filter(Boolean) : null,
  });

  async function save(event: FormEvent) {
    event.preventDefault();
    setError(null);
    if (!draft.label.trim()) return setError('Give the field a name.');
    if (draft.field_type === 'select' && !toRow(draft).options?.length) return setError('Add at least one choice, separated by commas.');
    try {
      if (editingId) {
        await fields.update(editingId, toRow(draft));
      } else {
        const position = Math.max(0, ...fields.rows.map((f) => f.position ?? 0)) + 1;
        await fields.create({ ...toRow(draft), position });
      }
      setDraft(emptyDraft);
      setEditingId(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  const edit = (field: TicketField) => {
    setEditingId(field.id);
    setDraft({ label: field.label, field_type: field.field_type, options: (field.options || []).join(', ') });
  };

  const remove = async (field: TicketField) => {
    if (!confirm(`Delete the field “${field.label}”? Values already entered on tickets are no longer shown.`)) return;
    await fields.remove(field.id);
    if (editingId === field.id) {
      setEditingId(null);
      setDraft(emptyDraft);
    }
  };

  const move = async (index: number, direction: -1 | 1) => {
    const a = sorted[index];
    const b = sorted[index + direction];
    if (!a || !b) return;
    await Promise.all([fields.update(a.id, { position: b.position ?? index + direction }), fields.update(b.id, { position: a.position ?? index })]);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <DataNotice error={fields.error} />
        <h1 className="text-2xl font-bold">Settings</h1>

        <Card>
          <CardHeader>
            <CardTitle>Ticket fields</CardTitle>
            <p className="text-sm text-gray-400 mt-1">
              Add your own fields, like an order number or a product. They appear when creating a ticket and on every ticket page.
            </p>
          </CardHeader>
          <CardContent>
            {sorted.length === 0 && !fields.loading && <p className="text-sm text-gray-400">No custom fields yet.</p>}
            <div className="space-y-2">
              {sorted.map((field, index) => (
                <div key={field.id} className="flex items-center justify-between bg-gray-750 rounded-lg px-4 py-3 border border-gray-700">
                  <div className="min-w-0">
                    <div className="font-medium">{field.label}</div>
                    <div className="text-sm text-gray-400">
                      {FIELD_TYPES.find((t) => t.value === field.field_type)?.label}
                      {field.field_type === 'select' && field.options?.length ? `: ${field.options.join(', ')}` : ''}
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 shrink-0">
                    <Button variant="secondary" size="sm" title="Move up" disabled={index === 0} onClick={() => move(index, -1)}>
                      <ArrowUp className="w-4 h-4" />
                    </Button>
                    <Button variant="secondary" size="sm" title="Move down" disabled={index === sorted.length - 1} onClick={() => move(index, 1)}>
                      <ArrowDown className="w-4 h-4" />
                    </Button>
                    <Button variant="secondary" size="sm" title="Edit" onClick={() => edit(field)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="secondary" size="sm" title="Delete" onClick={() => remove(field)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={save} className="mt-6 pt-6 border-t border-gray-700 space-y-4">
              <h4 className="font-medium">{editingId ? 'Edit field' : 'Add a field'}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Field name</label>
                  <input
                    className={inputClass}
                    value={draft.label}
                    onChange={(e) => setDraft({ ...draft, label: e.target.value })}
                    placeholder="e.g. Order number"
                  />
                </div>
                <div>
                  <label className={labelClass}>Type</label>
                  <select
                    className={inputClass}
                    value={draft.field_type}
                    onChange={(e) => setDraft({ ...draft, field_type: e.target.value as Draft['field_type'] })}
                  >
                    {FIELD_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              {draft.field_type === 'select' && (
                <div>
                  <label className={labelClass}>Choices (separated by commas)</label>
                  <input
                    className={inputClass}
                    value={draft.options}
                    onChange={(e) => setDraft({ ...draft, options: e.target.value })}
                    placeholder="e.g. Website, Mobile app, Billing portal"
                  />
                </div>
              )}
              {error && <p className="text-sm text-red-400">{error}</p>}
              <div className="flex items-center space-x-2">
                <Button type="submit" className="flex items-center">
                  <Plus className="w-4 h-4 mr-2" />
                  {editingId ? 'Save field' : 'Add field'}
                </Button>
                {editingId && (
                  <Button
                    type="button"
                    variant="secondary"
                    className="flex items-center"
                    onClick={() => {
                      setEditingId(null);
                      setDraft(emptyDraft);
                      setError(null);
                    }}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

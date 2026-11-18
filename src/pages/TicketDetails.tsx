import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { DataNotice } from '@/components/DataNotice';
import { useTable } from '@/lib/data';
import {
  CURRENT_USER,
  PRIORITIES,
  STATUSES,
  formatDate,
  initials,
  priorityClass,
  statusClass,
  ticketNumber,
  timeAgo,
} from '@/lib/helpdesk';
import type { Message, Ticket, TicketField } from '@/types';
import { CustomFieldInput, sortFields } from '@/components/CustomFieldInput';
import { ArrowLeft, Send, Trash2 } from 'lucide-react';

export function TicketDetails() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const tickets = useTable<Ticket>('tickets');
  const messages = useTable<Message>('ticket_messages');
  const fields = useTable<TicketField>('ticket_fields');
  const [drafts, setDrafts] = useState<Record<string, string | number | null>>({});
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);

  const ticket = tickets.rows.find((t) => t.id === id);
  const thread = messages.rows
    .filter((m) => m.ticket_id === id)
    .sort((a, b) => (a.created_at ?? '').localeCompare(b.created_at ?? ''));

  async function sendReply(e: FormEvent) {
    e.preventDefault();
    if (!reply.trim()) return;
    setSending(true);
    try {
      await messages.create({
        ticket_id: id,
        author_name: CURRENT_USER.name,
        body: reply.trim(),
        is_staff: true,
      });
      setReply('');
      if (ticket?.status === 'open') await tickets.update(id, { status: 'pending' });
    } finally {
      setSending(false);
    }
  }

  async function deleteTicket() {
    if (!confirm('Delete this ticket and its conversation?')) return;
    await Promise.all(thread.map((m) => messages.remove(m.id)));
    await tickets.remove(id);
    navigate('/tickets');
  }

  if (!ticket) {
    return (
      <Layout>
        <div className="space-y-6">
          <DataNotice error={tickets.error} />
          <p className="text-gray-400">{tickets.loading ? 'Loading…' : 'Ticket not found.'}</p>
          <Link to="/tickets" className="text-blue-400 text-sm">Back to tickets</Link>
        </div>
      </Layout>
    );
  }

  const conversation = [
    {
      id: 'original',
      author: ticket.requester_name || 'Customer',
      staff: false,
      body: ticket.description ?? '',
      at: ticket.created_at,
    },
    ...thread.map((m) => ({
      id: m.id,
      author: m.author_name,
      staff: !!m.is_staff,
      body: m.body,
      at: m.created_at,
    })),
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <Link to="/tickets" className="inline-flex items-center text-sm text-gray-400 hover:text-white">
          <ArrowLeft className="w-4 h-4 mr-1" />
          All tickets
        </Link>

        <div className="flex justify-between items-start gap-4">
          <div>
            <h1 className="text-2xl font-bold">{ticket.subject}</h1>
            <p className="text-gray-400">
              Ticket #{ticketNumber(ticket.id)} · Created on {formatDate(ticket.created_at)}
              {ticket.department && <> · {ticket.department}</>}
              {ticket.requester_email && <> · {ticket.requester_email}</>}
            </p>
          </div>
          <div className="flex items-center space-x-2 shrink-0">
            <span className={`px-3 py-1 rounded-full text-sm ${priorityClass(ticket.priority)}`}>
              {ticket.priority}
            </span>
            <span className={`px-3 py-1 rounded-full text-sm ${statusClass(ticket.status)}`}>
              {ticket.status}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            className="bg-gray-700 rounded-lg px-3 py-2 text-sm"
            value={ticket.status}
            onChange={(e) => tickets.update(id, { status: e.target.value })}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>Status: {s}</option>
            ))}
          </select>
          <select
            className="bg-gray-700 rounded-lg px-3 py-2 text-sm"
            value={ticket.priority}
            onChange={(e) => tickets.update(id, { priority: e.target.value })}
          >
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>Priority: {p}</option>
            ))}
          </select>
          <Button variant="secondary" size="sm" className="flex items-center ml-auto" onClick={deleteTicket}>
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>

        {sortFields(fields.rows).length > 0 && (
          <Card>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {sortFields(fields.rows).map((field) => {
                  const saved = ticket.custom_fields?.[field.id] ?? null;
                  const value = field.id in drafts ? drafts[field.id] : saved;
                  const persist = (next: string | number | null) => {
                    if (next === saved) return;
                    tickets.update(id, { custom_fields: { ...(ticket.custom_fields || {}), [field.id]: next } });
                  };
                  return (
                    <div key={field.id}>
                      <label className="block text-sm font-medium text-gray-400 mb-2">{field.label}</label>
                      <CustomFieldInput
                        field={field}
                        value={value}
                        onChange={(next) => {
                          setDrafts((prev) => ({ ...prev, [field.id]: next }));
                          // Dropdowns and dates save straight away; text and numbers when you leave the box.
                          if (field.field_type === 'select' || field.field_type === 'date') persist(next);
                        }}
                        onBlur={() => persist(value)}
                      />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent>
            <div className="space-y-6">
              {conversation.map((m) => (
                <div key={m.id} className="flex items-start space-x-4">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                      m.staff ? 'bg-green-600' : 'bg-blue-500'
                    }`}
                  >
                    {initials(m.author)}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">
                          {m.author}
                          {m.staff && <span className="ml-2 text-xs text-green-400">Staff</span>}
                        </h3>
                        <p className="text-sm text-gray-400">{timeAgo(m.at)}</p>
                      </div>
                    </div>
                    <p className="mt-2 whitespace-pre-wrap">{m.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <form className="space-y-4" onSubmit={sendReply}>
              <textarea
                rows={4}
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                className="w-full bg-gray-700 rounded-lg px-4 py-2.5 text-gray-100 placeholder-gray-400"
                placeholder="Type your reply..."
              />
              <div className="flex justify-end items-center">
                <Button size="sm" type="submit" className="flex items-center" disabled={sending || !reply.trim()}>
                  <Send className="w-4 h-4 mr-2" />
                  {sending ? 'Sending…' : 'Send Reply'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

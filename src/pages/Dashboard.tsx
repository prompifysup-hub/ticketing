import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { TicketList } from '@/components/TicketList';
import { DataNotice } from '@/components/DataNotice';
import { useTable } from '@/lib/data';
import { byNewest, countByTicket } from '@/lib/helpdesk';
import type { Message, Ticket } from '@/types';
import { Plus, Search } from 'lucide-react';

const TITLES: Record<string, string> = {
  open: 'Open Tickets',
  pending: 'Pending Tickets',
  closed: 'Closed Tickets',
};

/** The ticket queue: all tickets, or only those with the given status. */
export function Dashboard({ status }: { status?: string }) {
  const tickets = useTable<Ticket>('tickets');
  const messages = useTable<Message>('ticket_messages');
  const [query, setQuery] = useState('');

  const q = query.trim().toLowerCase();
  const visible = tickets.rows
    .filter((t) => !status || t.status === status)
    .filter(
      (t) =>
        !q ||
        [t.subject, t.description, t.requester_name, t.requester_email, t.department, ...Object.values(t.custom_fields || {}).map((v) => (v === null ? null : String(v)))]
          .some((v) => v?.toLowerCase().includes(q)),
    )
    .sort(byNewest);

  return (
    <Layout>
      <div className="space-y-6">
        <DataNotice error={tickets.error} />

        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">{status ? TITLES[status] ?? status : 'All Tickets'}</h1>
          <Link to="/tickets/new">
            <Button className="flex items-center">
              <Plus className="w-4 h-4 mr-2" />
              New Ticket
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader className="flex items-center justify-between gap-4">
            <CardTitle>{tickets.loading ? 'Loading…' : `${visible.length} tickets`}</CardTitle>
            <div className="relative w-full max-w-xs">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-gray-700 rounded-lg pl-9 pr-4 py-2 text-sm text-gray-100 placeholder-gray-400"
                placeholder="Search tickets…"
              />
            </div>
          </CardHeader>
          <CardContent>
            <TicketList
              tickets={visible}
              replyCounts={countByTicket(messages.rows)}
              emptyText={q ? 'No tickets match your search.' : 'No tickets here yet.'}
            />
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { TicketList } from '@/components/TicketList';
import { DataNotice } from '@/components/DataNotice';
import { useTable } from '@/lib/data';
import { byNewest, countByTicket, timeAgo } from '@/lib/helpdesk';
import type { Message, Ticket } from '@/types';
import {
  Ticket as TicketIcon,
  Inbox,
  MessageSquare,
  Clock,
  CheckCircle
} from 'lucide-react';

const RANGES = [
  { label: 'Last 7 days', days: 7 },
  { label: 'Last 30 days', days: 30 },
  { label: 'Last 90 days', days: 90 },
  { label: 'All time', days: 0 },
];

export function AdminDashboard() {
  const tickets = useTable<Ticket>('tickets');
  const messages = useTable<Message>('ticket_messages');
  const [days, setDays] = useState(30);

  const inRange = useMemo(() => {
    if (!days) return tickets.rows;
    const since = Date.now() - days * 24 * 60 * 60 * 1000;
    return tickets.rows.filter((t) => !t.created_at || new Date(t.created_at).getTime() >= since);
  }, [tickets.rows, days]);

  const open = inRange.filter((t) => t.status === 'open').length;
  const pending = inRange.filter((t) => t.status === 'pending').length;
  const closed = inRange.filter((t) => t.status === 'closed').length;
  const resolutionRate = inRange.length ? Math.round((closed / inRange.length) * 100) : 0;

  const stats = [
    {
      title: 'Total Tickets',
      value: inRange.length,
      icon: <TicketIcon className="w-6 h-6 text-blue-400" />
    },
    {
      title: 'Open Tickets',
      value: open,
      icon: <Inbox className="w-6 h-6 text-green-400" />
    },
    {
      title: 'Pending',
      value: pending,
      icon: <Clock className="w-6 h-6 text-yellow-400" />
    },
    {
      title: 'Resolution Rate (%)',
      value: resolutionRate,
      icon: <CheckCircle className="w-6 h-6 text-purple-400" />
    }
  ];

  const ticketById = useMemo(
    () => Object.fromEntries(tickets.rows.map((t) => [t.id, t])),
    [tickets.rows],
  );
  const recentActivity = [...messages.rows].sort(byNewest).slice(0, 5);
  const pendingTickets = inRange.filter((t) => t.status === 'pending').sort(byNewest).slice(0, 5);
  const replyCounts = countByTicket(messages.rows);

  return (
    <Layout>
      <div className="space-y-6">
        <DataNotice error={tickets.error} />

        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <div className="flex space-x-3">
            <select
              className="bg-gray-700 rounded-lg px-3 py-2 text-sm"
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
            >
              {RANGES.map((r) => (
                <option key={r.days} value={r.days}>{r.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <StatsCard key={stat.title} {...stat} />
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.length === 0 && (
                  <p className="text-gray-400 text-sm">No replies yet.</p>
                )}
                {recentActivity.map((m) => (
                  <Link
                    key={m.id}
                    to={`/tickets/${m.ticket_id}`}
                    className="flex items-center space-x-3 text-sm hover:opacity-80"
                  >
                    <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center shrink-0">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium truncate">
                        {m.author_name} replied on “{ticketById[m.ticket_id]?.subject ?? 'a ticket'}”
                      </p>
                      <p className="text-gray-400">{timeAgo(m.created_at)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Pending Tickets */}
          <Card>
            <CardHeader>
              <CardTitle>Pending Tickets</CardTitle>
            </CardHeader>
            <CardContent>
              <TicketList
                tickets={pendingTickets}
                replyCounts={replyCounts}
                emptyText="No pending tickets."
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}

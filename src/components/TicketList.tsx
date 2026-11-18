import { Link } from 'react-router-dom';
import { Clock, MessageSquare } from 'lucide-react';
import type { Ticket } from '../types';
import { priorityClass, statusClass } from '@/lib/helpdesk';

interface TicketListProps {
  tickets: Ticket[];
  /** Number of replies per ticket id. */
  replyCounts?: Record<string, number>;
  emptyText?: string;
}

export function TicketList({ tickets, replyCounts = {}, emptyText = 'No tickets yet.' }: TicketListProps) {
  if (tickets.length === 0) {
    return <p className="text-gray-400 text-sm">{emptyText}</p>;
  }

  return (
    <div className="space-y-4">
      {tickets.map((ticket) => {
        const replies = replyCounts[ticket.id] ?? 0;
        return (
          <Link
            key={ticket.id}
            to={`/tickets/${ticket.id}`}
            className="block bg-gray-800 rounded-lg p-4 hover:bg-gray-750 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="min-w-0">
                <h3 className="text-lg font-semibold">{ticket.subject}</h3>
                {ticket.description && (
                  <p className="text-gray-400 mt-1 line-clamp-2">{ticket.description}</p>
                )}
              </div>
              <div className="flex items-center space-x-2 shrink-0 ml-4">
                <span className={`px-3 py-1 rounded-full text-sm ${priorityClass(ticket.priority)}`}>
                  {ticket.priority}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm ${statusClass(ticket.status)}`}>
                  {ticket.status}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-4 mt-4 text-sm text-gray-400">
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                {ticket.created_at ? new Date(ticket.created_at).toLocaleDateString() : ''}
              </div>
              <div className="flex items-center">
                <MessageSquare className="w-4 h-4 mr-1" />
                {replies} {replies === 1 ? 'reply' : 'replies'}
              </div>
              {ticket.department && <div>{ticket.department}</div>}
              {ticket.requester_name && <div>{ticket.requester_name}</div>}
            </div>
          </Link>
        );
      })}
    </div>
  );
}

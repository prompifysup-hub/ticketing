import { Routes, Route, Navigate } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { TicketDetails } from './pages/TicketDetails';
import { Settings } from './pages/Settings';
import { NewTicket } from './pages/NewTicket';

function App() {
  return (
    <Routes>
      <Route path="/dashboard" element={<AdminDashboard />} />
      <Route path="/tickets" element={<Dashboard />} />
      <Route path="/tickets/open" element={<Dashboard status="open" />} />
      <Route path="/tickets/pending" element={<Dashboard status="pending" />} />
      <Route path="/tickets/closed" element={<Dashboard status="closed" />} />
      <Route path="/tickets/new" element={<NewTicket />} />
      <Route path="/tickets/:id" element={<TicketDetails />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}

export default App;

/*
 * Sample rows used ONLY when the app runs outside Prompify (no /env-config.js), so the
 * template can be previewed locally. Inside Prompify the real tables are always used.
 * Do not add real data here; create sample rows in the <boltAction type="data"> instead.
 */
const ago = (hours: number) => new Date(Date.now() - hours * 3600 * 1000).toISOString();

export const DEMO_ROWS: Record<string, Record<string, unknown>[]> = {
  ticket_fields: [
    { id: 'demo-f1', label: 'Order number', field_type: 'text', options: null, position: 1, created_at: ago(500) },
    { id: 'demo-f2', label: 'Product', field_type: 'select', options: ['Website', 'Mobile app', 'Billing portal'], position: 2, created_at: ago(499) },
  ],
  tickets: [
    { id: 'demo-t1', subject: 'Payment processing issue', description: 'I tried to pay my invoice twice and both times the card was declined, but my bank says the charge went through.', status: 'pending', priority: 'high', department: 'Billing', custom_fields: { 'demo-f1': '10482', 'demo-f2': 'Billing portal' }, requester_name: 'Maria Lopez', requester_email: 'maria@example.com', created_at: ago(5) },
    { id: 'demo-t2', subject: 'Cannot log in to my account', description: 'The password reset email never arrives. I checked spam as well.', status: 'open', priority: 'high', department: 'Technical Support', custom_fields: { 'demo-f2': 'Website' }, requester_name: 'Tom Becker', requester_email: 'tom@example.com', created_at: ago(9) },
    { id: 'demo-t3', subject: 'Question about upgrading my plan', description: 'If I upgrade in the middle of the month, do I pay the full price?', status: 'open', priority: 'low', department: 'General Inquiry', requester_name: 'Aisha Khan', requester_email: 'aisha@example.com', created_at: ago(26) },
    { id: 'demo-t4', subject: 'Export to CSV is missing columns', description: 'The exported file has no date column since last week.', status: 'pending', priority: 'medium', department: 'Technical Support', requester_name: 'Lukas Weber', requester_email: 'lukas@example.com', created_at: ago(50) },
    { id: 'demo-t5', subject: 'Refund for duplicate order', description: 'I was charged twice for order 10482. Please refund one of them.', status: 'closed', priority: 'medium', department: 'Billing', requester_name: 'Emma Roberts', requester_email: 'emma@example.com', created_at: ago(120) },
    { id: 'demo-t6', subject: 'Change the email on my account', description: 'I would like to use my new work email address instead.', status: 'closed', priority: 'low', department: 'General Inquiry', requester_name: 'Noah Kim', requester_email: 'noah@example.com', created_at: ago(200) },
  ],
  ticket_messages: [
    { id: 'demo-m1', ticket_id: 'demo-t1', author_name: 'John Doe', body: 'Sorry about that, Maria. I can see one successful payment on our side. Could you send a screenshot of the bank statement?', is_staff: true, created_at: ago(4) },
    { id: 'demo-m2', ticket_id: 'demo-t4', author_name: 'John Doe', body: 'Thanks Lukas, we have reproduced this and a fix is on the way.', is_staff: true, created_at: ago(30) },
    { id: 'demo-m3', ticket_id: 'demo-t5', author_name: 'John Doe', body: 'The duplicate charge has been refunded. It can take 3-5 days to show up.', is_staff: true, created_at: ago(100) },
    { id: 'demo-m4', ticket_id: 'demo-t5', author_name: 'Emma Roberts', body: 'Got it, thank you!', is_staff: false, created_at: ago(96) },
    { id: 'demo-m5', ticket_id: 'demo-t6', author_name: 'John Doe', body: 'Done, your account now uses the new address.', is_staff: true, created_at: ago(190) },
  ],
};

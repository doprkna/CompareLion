import { redirect } from 'next/navigation';

/**
 * /messages → /social?tab=messages (alias)
 * Messages/Inbox lives in Social Hub.
 */
export default function MessagesPage() {
  redirect('/social?tab=messages');
}

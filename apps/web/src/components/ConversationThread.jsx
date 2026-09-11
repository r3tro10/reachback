import Link from 'next/link';
import './ConversationThread.css';

export default function ConversationThread({ conversation }) {
  return (
    <div className="conversation-thread">
      <div className="thread-header">
        <h4>Contact #{conversation.contact_id}</h4>
        <span className="status-badge">{conversation.status}</span>
      </div>
      <p className="last-message">
        Last message: {conversation.last_message_at ? new Date(conversation.last_message_at).toLocaleString() : 'Never'}
      </p>
      <Link href={`/conversations/${conversation.id}`} className="btn btn-sm">
        View Thread
      </Link>
    </div>
  );
}

'use client';

import { useState } from 'react';
import api from '@/lib/api';
import './KBEditor.css';

export default function KBEditor({ clientId, entries, onUpdate }) {
  const [newEntry, setNewEntry] = useState({
    question: '',
    answer: '',
    category: '',
  });
  const [loading, setLoading] = useState(false);

  const handleAddEntry = async (e) => {
    e.preventDefault();
    if (!newEntry.question || !newEntry.answer) return;

    setLoading(true);
    try {
      const response = await api.post('/api/kb', {
        client_id: clientId,
        ...newEntry,
      });
      onUpdate([...entries, response.data]);
      setNewEntry({ question: '', answer: '', category: '' });
    } catch (error) {
      console.error('Failed to add KB entry:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEntry = async (id) => {
    try {
      await api.delete(`/api/kb/${id}`);
      onUpdate(entries.filter((e) => e.id !== id));
    } catch (error) {
      console.error('Failed to delete KB entry:', error);
    }
  };

  return (
    <div className="kb-editor">
      <form onSubmit={handleAddEntry} className="kb-form">
        <div className="form-group">
          <label>Question</label>
          <input
            type="text"
            value={newEntry.question}
            onChange={(e) => setNewEntry({ ...newEntry, question: e.target.value })}
            placeholder="e.g., How much does roof repair cost?"
            required
          />
        </div>
        <div className="form-group">
          <label>Answer</label>
          <textarea
            value={newEntry.answer}
            onChange={(e) => setNewEntry({ ...newEntry, answer: e.target.value })}
            placeholder="e.g., Roof repair costs vary depending on the extent of damage..."
            required
          />
        </div>
        <div className="form-group">
          <label>Category</label>
          <input
            type="text"
            value={newEntry.category}
            onChange={(e) => setNewEntry({ ...newEntry, category: e.target.value })}
            placeholder="e.g., Pricing"
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Adding...' : 'Add Entry'}
        </button>
      </form>

      <div className="kb-entries">
        <h3>Knowledge Base Entries</h3>
        {entries.map((entry) => (
          <div key={entry.id} className="kb-entry">
            <h4>{entry.question}</h4>
            <p>{entry.answer}</p>
            {entry.category && <span className="category-badge">{entry.category}</span>}
            <button
              onClick={() => handleDeleteEntry(entry.id)}
              className="btn btn-sm btn-danger"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

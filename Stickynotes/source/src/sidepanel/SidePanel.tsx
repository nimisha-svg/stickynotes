import React, { useState, useEffect } from 'react';
import './SidePanel.css';

interface Note {
  id: string;
  content: string;
  theme: string;
  createdAt: number;
}

const THEMES = [
  'theme-white-memo',
  'theme-todo-pink',
  'theme-spiral-teal',
  'theme-yellow-checklist',
  'theme-dark-grid',
  'theme-lavender-lined'
];

const SidePanel: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load and migrate notes
  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.get(['sticky_notes'], (result) => {
        if (result.sticky_notes) {
          // Migrate old notes that used 'color' to use 'theme'
          const migratedNotes = result.sticky_notes.map((note: any) => ({
            ...note,
            theme: note.theme || THEMES[Math.floor(Math.random() * THEMES.length)]
          }));
          setNotes(migratedNotes);
        }
        setIsLoaded(true);
      });
    } else {
      // Mock data
      setNotes([
        { id: '1', content: 'Buy groceries\n- Milk\n- Eggs\n- Bread', theme: 'theme-todo-pink', createdAt: Date.now() },
        { id: '2', content: 'Design meeting at 3 PM.\nPrepare wireframes.', theme: 'theme-spiral-teal', createdAt: Date.now() - 100000 }
      ]);
      setIsLoaded(true);
    }
  }, []);

  // Save notes
  useEffect(() => {
    if (isLoaded && typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.set({ sticky_notes: notes });
    }
  }, [notes, isLoaded]);

  const addNote = () => {
    const newNote: Note = {
      id: crypto.randomUUID(),
      content: '',
      theme: THEMES[Math.floor(Math.random() * THEMES.length)],
      createdAt: Date.now()
    };
    setNotes([newNote, ...notes]);
  };

  const updateNote = (id: string, content: string) => {
    setNotes(prev => prev.map(note => note.id === id ? { ...note, content } : note));
  };

  const deleteNote = (id: string) => {
    setNotes(prev => prev.filter(note => note.id !== id));
  };

  const cycleTheme = (id: string) => {
    setNotes(prev => prev.map(note => {
      if (note.id === id) {
        const currentIndex = THEMES.indexOf(note.theme);
        const nextIndex = (currentIndex + 1) % THEMES.length;
        return { ...note, theme: THEMES[nextIndex] };
      }
      return note;
    }));
  };

  if (!isLoaded) return <div className="loading">Loading your workspace...</div>;

  return (
    <div className="sidepanel-container">
      <header className="header">
        <h1>My Desk</h1>
        <button className="add-btn" onClick={addNote}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          New Note
        </button>
      </header>

      <div className="notes-grid">
        {notes.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📝</div>
            <p>Your desk is clear. Add a sticky note!</p>
          </div>
        ) : (
          notes.map(note => (
            <div key={note.id} className={`sticky-note ${note.theme}`}>
              <div className="note-actions">
                <button 
                  className="action-btn theme-btn" 
                  onClick={() => cycleTheme(note.id)}
                  title="Change Style"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                    <circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/>
                    <circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/>
                    <circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/>
                    <circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/>
                    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>
                  </svg>
                </button>
                <button 
                  className="action-btn delete-btn" 
                  onClick={() => deleteNote(note.id)}
                  title="Delete Note"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                    <path d="M18 6 6 18M6 6l12 12"/>
                  </svg>
                </button>
              </div>
              <textarea
                placeholder="Write here..."
                value={note.content}
                onChange={(e) => updateNote(note.id, e.target.value)}
                spellCheck={false}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SidePanel;
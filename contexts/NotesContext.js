'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

const NotesContext = createContext();

export function NotesProvider({ children }) {
  const [notes, setNotes] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const savedNotes = localStorage.getItem('daily_notes');
    if (savedNotes) {
      try {
        setNotes(JSON.parse(savedNotes));
      } catch (e) {
        console.error('Failed to parse notes from local storage');
      }
    } else {
      const tutorialNote = {
        id: 'tutorial-note-1',
        content: "Welcome to **Daily Notes**! 🎉\n\nHere are some of the premium features you can use:\n\n* **Markdown Support**: You can use *italics*, **bold**, or create lists!\n* **Smart Labels**: Try typing a hashtag like #tutorial or #ideas to automatically categorize your notes.\n* **Smart Alarms**: Type something like \"Remind me to check the oven in 5 minutes\" and the app will automatically suggest an alarm!\n* **Images**: Click the image icon to attach pictures to your notes.\n* **Archive & Trash**: Keep your active view clean by moving old notes to the archive or trash bin.\n\nEnjoy taking notes!",
        color: 'var(--surface-hover)',
        isPinned: true,
        createdAt: new Date().toISOString(),
        status: 'active',
        labels: ['tutorial']
      };
      setNotes([tutorialNote]);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('daily_notes', JSON.stringify(notes));
    }
  }, [notes, isLoaded]);

  const addNote = (note) => {
    // Add default status if missing
    const newNote = { ...note, status: note.status || 'active', labels: note.labels || [] };
    setNotes((prev) => [newNote, ...prev]);
  };

  const updateNote = (id, updatedFields) => {
    setNotes((prev) =>
      prev.map((note) => (note.id === id ? { ...note, ...updatedFields } : note))
    );
  };

  const deleteNote = (id) => {
    // We now move to trash instead of hard delete, unless already in trash
    setNotes((prev) => 
      prev.map(note => {
        if (note.id === id) {
          if (note.status === 'trash') return null; // Hard delete if already in trash
          return { ...note, status: 'trash' };
        }
        return note;
      }).filter(Boolean)
    );
  };

  const emptyTrash = () => {
    setNotes(prev => prev.filter(note => note.status !== 'trash'));
  };

  const reorderNotes = (activeId, overId) => {
    setNotes((prev) => {
      const oldIndex = prev.findIndex((n) => n.id === activeId);
      const newIndex = prev.findIndex((n) => n.id === overId);
      if (oldIndex !== -1 && newIndex !== -1) {
        const newNotes = [...prev];
        const [movedItem] = newNotes.splice(oldIndex, 1);
        newNotes.splice(newIndex, 0, movedItem);
        return newNotes;
      }
      return prev;
    });
  };

  return (
    <NotesContext.Provider value={{ notes, addNote, updateNote, deleteNote, emptyTrash, reorderNotes, isLoaded }}>
      {children}
    </NotesContext.Provider>
  );
}

export function useNotes() {
  return useContext(NotesContext);
}

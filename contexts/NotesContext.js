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

  return (
    <NotesContext.Provider value={{ notes, addNote, updateNote, deleteNote, emptyTrash, isLoaded }}>
      {children}
    </NotesContext.Provider>
  );
}

export function useNotes() {
  return useContext(NotesContext);
}

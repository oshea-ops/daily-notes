'use client';

import React from 'react';
import { useNotes } from '../contexts/NotesContext';
import NoteCard from './NoteCard';
import { AnimatePresence } from 'framer-motion';
import styles from './NoteList.module.css';

export default function NoteList({ searchQuery = '', filterStatus = 'active' }) {
  const { notes, emptyTrash } = useNotes();

  // Filter notes based on status and search query
  const filteredNotes = notes.filter(note => {
    // Default status is 'active' if undefined for old notes
    const status = note.status || 'active';
    if (status !== filterStatus) return false;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesTitle = note.title?.toLowerCase().includes(query);
      const matchesContent = note.content?.toLowerCase().includes(query);
      const matchesLabels = note.labels?.some(l => l.toLowerCase().includes(query));
      return matchesTitle || matchesContent || matchesLabels;
    }
    return true;
  });

  const pinnedNotes = filteredNotes.filter(note => note.pinned);
  const unpinnedNotes = filteredNotes.filter(note => !note.pinned);

  if (filteredNotes.length === 0) {
    return (
      <div style={{ textAlign: 'center', marginTop: '64px', color: 'var(--text-secondary)' }}>
        <p>{searchQuery ? 'No notes match your search.' : `No notes in ${filterStatus}.`}</p>
      </div>
    );
  }

  return (
    <div className={styles.listContainer}>
      {filterStatus === 'trash' && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
          <span style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>Notes in trash are deleted permanently when you click the trash icon again.</span>
          <button onClick={emptyTrash} style={{ color: 'var(--color-red)', fontWeight: '500', textDecoration: 'underline' }}>Empty Trash</button>
        </div>
      )}
      {pinnedNotes.length > 0 && (
        <>
          <div className={styles.sectionTitle}>PINNED</div>
          <div className={styles.masonryGrid}>
            <AnimatePresence>
              {pinnedNotes.map(note => (
                <NoteCard key={note.id} note={note} />
              ))}
            </AnimatePresence>
          </div>
        </>
      )}

      {unpinnedNotes.length > 0 && (
        <>
          {pinnedNotes.length > 0 && <div className={styles.sectionTitle}>OTHERS</div>}
          <div className={styles.masonryGrid}>
            <AnimatePresence>
              {unpinnedNotes.map(note => (
                <NoteCard key={note.id} note={note} />
              ))}
            </AnimatePresence>
          </div>
        </>
      )}
    </div>
  );
}

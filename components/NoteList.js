'use client';

import React from 'react';
import { useNotes } from '../contexts/NotesContext';
import NoteCard from './NoteCard';
import { AnimatePresence } from 'framer-motion';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import styles from './NoteList.module.css';

export default function NoteList({ searchQuery = '', filterStatus = 'active' }) {
  const { notes, emptyTrash, reorderNotes } = useNotes();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      reorderNotes(active.id, over.id);
    }
  };

  // Filter notes based on status and search query
  const filteredNotes = notes.filter(note => {
    // Default status is 'active' if undefined for old notes
    const status = note.status || 'active';
    const isSectionFilter = filterStatus.startsWith('section:');

    if (isSectionFilter) {
      const targetSectionId = filterStatus.split(':')[1];
      // Do not show trashed notes in sections, and only show notes matching the sectionId
      if (status === 'trash' || note.sectionId !== targetSectionId) return false;
    } else {
      if (status !== filterStatus) return false;
    }

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
    const isSectionFilter = filterStatus.startsWith('section:');
    let emptyMsg = `No notes in ${filterStatus}.`;
    if (isSectionFilter) emptyMsg = 'No notes in this notebook yet.';
    if (searchQuery) emptyMsg = 'No notes match your search.';

    return (
      <div style={{ textAlign: 'center', marginTop: '64px', color: 'var(--text-secondary)' }}>
        <p>{emptyMsg}</p>
      </div>
    );
  }

  return (
    <DndContext 
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
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
            <SortableContext items={pinnedNotes.map(n => n.id)} strategy={rectSortingStrategy}>
              <div className={styles.masonryGrid}>
                <AnimatePresence>
                  {pinnedNotes.map(note => (
                    <NoteCard key={note.id} note={note} />
                  ))}
                </AnimatePresence>
              </div>
            </SortableContext>
          </>
        )}

        {unpinnedNotes.length > 0 && (
          <>
            {pinnedNotes.length > 0 && <div className={styles.sectionTitle}>OTHERS</div>}
            <SortableContext items={unpinnedNotes.map(n => n.id)} strategy={rectSortingStrategy}>
              <div className={styles.masonryGrid}>
                <AnimatePresence>
                  {unpinnedNotes.map(note => (
                    <NoteCard key={note.id} note={note} />
                  ))}
                </AnimatePresence>
              </div>
            </SortableContext>
          </>
        )}
      </div>
    </DndContext>
  );
}

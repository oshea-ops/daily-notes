'use client';

import React, { useState } from 'react';
import { Pin, Trash2, Palette, BellRing, Bell, Archive, RefreshCw } from 'lucide-react';
import { useNotes } from '../contexts/NotesContext';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import styles from './NoteCard.module.css';

const COLORS = [
  'var(--color-default)', 'var(--color-red)', 'var(--color-orange)', 
  'var(--color-yellow)', 'var(--color-green)', 'var(--color-teal)', 
  'var(--color-blue)', 'var(--color-darkblue)', 'var(--color-purple)', 
  'var(--color-pink)', 'var(--color-brown)', 'var(--color-gray)'
];

export default function NoteCard({ note }) {
  const { updateNote, deleteNote } = useNotes();
  const [showPalette, setShowPalette] = useState(false);

  const togglePin = () => {
    updateNote(note.id, { pinned: !note.pinned });
  };

  const changeColor = (color) => {
    updateNote(note.id, { color });
    setShowPalette(false);
  };

  const toggleArchive = () => {
    updateNote(note.id, { status: note.status === 'archived' ? 'active' : 'archived' });
  };

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
      className={styles.card} 
      style={{ backgroundColor: note.color }}
    >
      <button 
        className={`${styles.iconButton} ${styles.pinButton} ${note.pinned ? styles.pinned : ''}`}
        onClick={togglePin}
      >
        <Pin size={18} fill={note.pinned ? "currentColor" : "none"} />
      </button>

      {note.image && (
        <img src={note.image} alt="Attachment" className={styles.attachmentImage} />
      )}

      {note.title && <div className={styles.title}>{note.title}</div>}
      {note.content && (
        <div className={styles.content}>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{note.content}</ReactMarkdown>
        </div>
      )}
      
      {note.labels && note.labels.length > 0 && (
        <div className={styles.labels}>
          {note.labels.map(label => (
            <span key={label} className={styles.labelBadge}>#{label}</span>
          ))}
        </div>
      )}
      
      {note.alarm && (
        <div className={styles.alarmBadge}>
          {note.alarmTriggered ? <Bell size={12} /> : <BellRing size={12} />}
          {format(new Date(note.alarm), 'MMM d, h:mm a')}
        </div>
      )}

      <div className={styles.actions}>
        <button 
          className={styles.iconButton} 
          onClick={() => setShowPalette(!showPalette)}
          title="Change color"
        >
          <Palette size={16} />
        </button>
        <button 
          className={styles.iconButton} 
          onClick={toggleArchive}
          title={note.status === 'archived' ? "Unarchive" : "Archive"}
        >
          {note.status === 'archived' ? <RefreshCw size={16} /> : <Archive size={16} />}
        </button>
        <button 
          className={styles.iconButton} 
          onClick={() => deleteNote(note.id)}
          title={note.status === 'trash' ? "Delete permanently" : "Move to trash"}
        >
          <Trash2 size={16} />
        </button>
      </div>

      {showPalette && (
        <div className={styles.colorPicker}>
          {COLORS.map(color => (
            <div 
              key={color} 
              className={styles.colorOption}
              style={{ backgroundColor: color }}
              onClick={() => changeColor(color)}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}

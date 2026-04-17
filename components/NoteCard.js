'use client';

import React, { useState } from 'react';
import { Pin, Trash2, Palette, BellRing, Bell, Archive, RefreshCw, GripHorizontal, MapPin } from 'lucide-react';
import { useNotes } from '../contexts/NotesContext';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
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

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: note.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    backgroundColor: note.color,
  };

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

  const handleCheckboxToggle = (index, checked) => {
    let matchCount = 0;
    const newContent = note.content.replace(/\[([ xX])\]/g, (match) => {
      if (matchCount === index) {
        matchCount++;
        return checked ? '[x]' : '[ ]';
      }
      matchCount++;
      return match;
    });
    updateNote(note.id, { content: newContent });
  };

  let checkboxIndex = 0;
  const markdownComponents = {
    input: ({ node, checked, ...props }) => {
      if (props.type === 'checkbox') {
        const currentIndex = checkboxIndex++;
        return (
          <input 
            type="checkbox" 
            checked={checked} 
            onChange={(e) => handleCheckboxToggle(currentIndex, e.target.checked)}
            {...props} 
          />
        );
      }
      return <input {...props} />;
    }
  };

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
      className={styles.card} 
      style={style}
      ref={setNodeRef}
    >
      <div 
        className={styles.dragHandle} 
        {...attributes} 
        {...listeners}
      >
        <GripHorizontal size={16} />
      </div>

      <button 
        className={`${styles.iconButton} ${styles.pinButton} ${note.pinned ? styles.pinned : ''}`}
        onClick={togglePin}
      >
        <Pin size={18} fill={note.pinned ? "currentColor" : "none"} />
      </button>

      {note.image && (
        <img src={note.image} alt="Attachment" className={styles.attachmentImage} />
      )}

      {note.audio && (
        <audio controls src={note.audio} className={styles.audioPlayer} />
      )}

      {note.title && <div className={styles.title}>{note.title}</div>}
      {note.content && (
        <div className={styles.content}>
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>{note.content}</ReactMarkdown>
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

      {note.location && (
        <div className={styles.locationBadge}>
          <MapPin size={12} />
          {note.location.lat.toFixed(4)}, {note.location.lng.toFixed(4)}
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

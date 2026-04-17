'use client';

import { useEffect, useRef } from 'react';
import { useNotes } from '../contexts/NotesContext';
import { format } from 'date-fns';

export default function AlarmManager() {
  const { notes, updateNote, isLoaded } = useNotes();
  const checkedAlarms = useRef(new Set());

  useEffect(() => {
    if (!isLoaded) return;

    // Request notification permission if not already granted or denied
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }

    const checkAlarms = () => {
      const now = new Date();
      
      notes.forEach(note => {
        if (note.alarm && !note.alarmTriggered) {
          const alarmTime = new Date(note.alarm);
          
          if (now >= alarmTime && !checkedAlarms.current.has(note.id)) {
            // Trigger alarm!
            checkedAlarms.current.add(note.id);
            
            // Send browser notification
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification('Note Reminder', {
                body: note.content || note.title || 'You have a reminder!',
                icon: '/favicon.ico'
              });
            } else {
              // Fallback to alert if notifications aren't allowed
              alert(`Reminder: ${note.title || 'Note'}\n${note.content}`);
            }

            // Mark alarm as triggered in state
            updateNote(note.id, { alarmTriggered: true });
          }
        }
      });
    };

    // Check every 30 seconds
    const interval = setInterval(checkAlarms, 30000);
    
    // Initial check
    checkAlarms();

    return () => clearInterval(interval);
  }, [notes, updateNote, isLoaded]);

  return null; // This is a logic-only component
}

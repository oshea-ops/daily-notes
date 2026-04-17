'use client';

import { useEffect, useRef } from 'react';
import { useNotes } from '../contexts/NotesContext';
import { format } from 'date-fns';

function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // metres
  const p1 = lat1 * Math.PI/180;
  const p2 = lat2 * Math.PI/180;
  const dp = (lat2-lat1) * Math.PI/180;
  const dl = (lon2-lon1) * Math.PI/180;

  const a = Math.sin(dp/2) * Math.sin(dp/2) +
            Math.cos(p1) * Math.cos(p2) *
            Math.sin(dl/2) * Math.sin(dl/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c;
}

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

    const checkLocations = () => {
      if (typeof navigator === 'undefined' || !navigator.geolocation) return;
      
      const notesWithLocation = notes.filter(n => n.location && !n.locationTriggered);
      if (notesWithLocation.length === 0) return;

      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        notesWithLocation.forEach(note => {
          const dist = getDistance(latitude, longitude, note.location.lat, note.location.lng);
          if (dist > 100 && !checkedAlarms.current.has(note.id + '_loc')) {
            checkedAlarms.current.add(note.id + '_loc');
            
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification('Location Reminder', {
                body: note.content || note.title || 'You have left the area!',
                icon: '/favicon.ico'
              });
            } else {
              alert(`Location Reminder: ${note.title || 'Note'}\n${note.content}`);
            }

            updateNote(note.id, { locationTriggered: true });
          }
        });
      }, (err) => console.error(err));
    };

    // Check every 30 seconds
    const interval = setInterval(() => {
      checkAlarms();
      checkLocations();
    }, 30000);
    
    // Initial check
    checkAlarms();
    checkLocations();

    return () => clearInterval(interval);
  }, [notes, updateNote, isLoaded]);

  return null; // This is a logic-only component
}

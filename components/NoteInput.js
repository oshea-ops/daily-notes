'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Bell, BellOff, Image as ImageIcon, X } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { useNotes } from '../contexts/NotesContext';
import { parseAlarmFromText } from '../utils/parseAlarms';
import styles from './NoteInput.module.css';

export default function NoteInput() {
  const { addNote } = useNotes();
  const [isExpanded, setIsExpanded] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [suggestedAlarm, setSuggestedAlarm] = useState(null);
  const [attachment, setAttachment] = useState(null);
  
  const contentRef = useRef(null);
  const containerRef = useRef(null);
  const recognitionRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    // Setup Speech Recognition
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;

        recognitionRef.current.onresult = (event) => {
          let currentTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              currentTranscript += transcript + ' ';
            }
          }
          if (currentTranscript) {
            setContent((prev) => prev + currentTranscript);
          }
        };

        recognitionRef.current.onerror = (event) => {
          console.error('Speech recognition error', event.error);
          setIsRecording(false);
        };

        recognitionRef.current.onend = () => {
          setIsRecording(false);
        };
      }
    }

    // Handle click outside to close
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        handleSave();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [title, content, suggestedAlarm]);

  useEffect(() => {
    // Auto-resize textarea
    if (contentRef.current) {
      contentRef.current.style.height = 'auto';
      contentRef.current.style.height = `${contentRef.current.scrollHeight}px`;
    }

    // Check for alarm suggestions
    if (content) {
      const alarmDate = parseAlarmFromText(content);
      setSuggestedAlarm(alarmDate);
    } else {
      setSuggestedAlarm(null);
    }
  }, [content]);

  const toggleRecording = (e) => {
    e.preventDefault();
    if (isRecording) {
      recognitionRef.current?.stop();
    } else {
      setIsExpanded(true);
      setContent(prev => prev + (prev && !prev.endsWith(' ') ? ' ' : ''));
      recognitionRef.current?.start();
      setIsRecording(true);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachment(reader.result);
        setIsExpanded(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const extractLabels = (text) => {
    const matches = text.match(/#[\w]+/g);
    return matches ? matches.map(m => m.slice(1)) : [];
  };

  const handleSave = () => {
    if (title.trim() || content.trim() || attachment) {
      addNote({
        id: uuidv4(),
        title: title.trim(),
        content: content.trim(),
        color: 'var(--color-default)',
        pinned: false,
        createdAt: new Date().toISOString(),
        alarm: suggestedAlarm ? suggestedAlarm.toISOString() : null,
        alarmTriggered: false,
        status: 'active',
        labels: extractLabels(content),
        image: attachment
      });
      setTitle('');
      setContent('');
      setSuggestedAlarm(null);
      setAttachment(null);
    }
    setIsExpanded(false);
    if (isRecording) {
      recognitionRef.current?.stop();
    }
  };

  return (
    <div className={styles.container} ref={containerRef}>
      <form className={styles.form} onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
        {isExpanded && (
          <input
            type="text"
            placeholder="Title"
            className={styles.titleInput}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        )}
        
        <textarea
          ref={contentRef}
          placeholder="Take a note... (or use voice)"
          className={styles.contentInput}
          value={content}
          onClick={() => setIsExpanded(true)}
          onChange={(e) => setContent(e.target.value)}
          rows={isExpanded ? 3 : 1}
          maxLength={20000}
        />

        {isExpanded && suggestedAlarm && (
          <div className={styles.alarmSuggestion}>
            <Bell size={14} />
            Suggested Reminder: {suggestedAlarm.toLocaleString([], { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </div>
        )}

        {attachment && (
          <div style={{ position: 'relative', marginTop: '12px', width: 'fit-content' }}>
            <img src={attachment} alt="Attachment" style={{ maxHeight: '200px', borderRadius: '8px' }} />
            <button 
              type="button" 
              onClick={() => setAttachment(null)}
              style={{ position: 'absolute', top: '-8px', right: '-8px', background: 'var(--surface)', borderRadius: '50%', padding: '4px', border: '1px solid var(--border)' }}
            >
              <X size={14} />
            </button>
          </div>
        )}

        {isExpanded && (
          <div className={styles.actions}>
            <div className={styles.iconButtons}>
              <button 
                type="button" 
                className={`${styles.iconButton} ${isRecording ? styles.recording : ''}`}
                onClick={toggleRecording}
                title={isRecording ? "Stop recording" : "Start voice input"}
              >
                {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
              </button>
              <button 
                type="button" 
                className={styles.iconButton}
                onClick={() => fileInputRef.current?.click()}
                title="Add image"
              >
                <ImageIcon size={20} />
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageUpload} 
                accept="image/*" 
                style={{ display: 'none' }} 
              />
            </div>
            <button type="button" className={styles.closeButton} onClick={handleSave}>
              Close
            </button>
          </div>
        )}
      </form>
    </div>
  );
}

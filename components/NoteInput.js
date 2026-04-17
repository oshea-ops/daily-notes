'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Bell, BellOff, Image as ImageIcon, X, Palette, MapPin, Radio } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { useNotes } from '../contexts/NotesContext';
import { parseAlarmFromText } from '../utils/parseAlarms';
import DrawingCanvas from './DrawingCanvas';
import styles from './NoteInput.module.css';

export default function NoteInput() {
  const { addNote } = useNotes();
  const [isExpanded, setIsExpanded] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [suggestedAlarm, setSuggestedAlarm] = useState(null);
  const [attachment, setAttachment] = useState(null);
  const [showDrawingCanvas, setShowDrawingCanvas] = useState(false);
  const [locationCoords, setLocationCoords] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  
  const contentRef = useRef(null);
  const containerRef = useRef(null);
  const recognitionRef = useRef(null);
  const fileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

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

  const handleAddLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setLocationCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setIsExpanded(true);
      }, (err) => {
        console.error("Location error:", err);
      });
    }
  };

  const toggleAudioRecording = async (e) => {
    e.preventDefault();
    if (isRecordingAudio) {
      mediaRecorderRef.current?.stop();
      setIsRecordingAudio(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream);
        audioChunksRef.current = [];
        
        mediaRecorderRef.current.ondataavailable = (e) => {
          if (e.data.size > 0) audioChunksRef.current.push(e.data);
        };
        
        mediaRecorderRef.current.onstop = () => {
          const audioBlobObj = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const reader = new FileReader();
          reader.readAsDataURL(audioBlobObj);
          reader.onloadend = () => {
            setAudioBlob(reader.result);
          };
          // Stop all tracks to release microphone
          stream.getTracks().forEach(track => track.stop());
        };
        
        mediaRecorderRef.current.start();
        setIsRecordingAudio(true);
        setIsExpanded(true);
      } catch (err) {
        console.error("Audio record error:", err);
      }
    }
  };

  const handleSaveDrawing = (dataUrl) => {
    setAttachment(dataUrl);
    setShowDrawingCanvas(false);
    setIsExpanded(true);
  };

  const handleSave = () => {
    if (title.trim() || content.trim() || attachment || audioBlob || locationCoords) {
      addNote({
        id: uuidv4(),
        title: title.trim(),
        content: content.trim(),
        color: 'var(--surface)',
        pinned: false,
        createdAt: new Date().toISOString(),
        alarm: suggestedAlarm ? suggestedAlarm.toISOString() : null,
        alarmTriggered: false,
        status: 'active',
        labels: extractLabels(content),
        image: attachment,
        audio: audioBlob,
        location: locationCoords
      });
      setTitle('');
      setContent('');
      setSuggestedAlarm(null);
      setAttachment(null);
      setAudioBlob(null);
      setLocationCoords(null);
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

        {isExpanded && locationCoords && (
          <div className={styles.alarmSuggestion}>
            <MapPin size={14} />
            Location Geofence Active
            <button type="button" onClick={() => setLocationCoords(null)} style={{ background: 'transparent', border: 'none', marginLeft: '8px', cursor: 'pointer', color: 'var(--text-secondary)' }}><X size={12} /></button>
          </div>
        )}

        {audioBlob && (
          <div style={{ marginTop: '12px' }}>
            <audio controls src={audioBlob} style={{ height: '36px', width: '100%' }} />
            <button type="button" onClick={() => setAudioBlob(null)} style={{ fontSize: '12px', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>Remove Audio</button>
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
              <button 
                type="button" 
                className={`${styles.iconButton} ${isRecordingAudio ? styles.recording : ''}`}
                onClick={toggleAudioRecording}
                title={isRecordingAudio ? "Stop Audio Recording" : "Record Audio Memo"}
              >
                <Radio size={20} />
              </button>
              <button 
                type="button" 
                className={styles.iconButton}
                onClick={() => setShowDrawingCanvas(true)}
                title="Draw sketch"
              >
                <Palette size={20} />
              </button>
              <button 
                type="button" 
                className={`${styles.iconButton} ${locationCoords ? styles.activeIcon : ''}`}
                onClick={handleAddLocation}
                title="Add Location Alarm"
              >
                <MapPin size={20} />
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

      {showDrawingCanvas && (
        <DrawingCanvas 
          onSave={handleSaveDrawing} 
          onClose={() => setShowDrawingCanvas(false)} 
        />
      )}
    </div>
  );
}

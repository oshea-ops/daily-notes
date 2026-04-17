'use client';

import React, { useState } from 'react';
import NoteInput from '../components/NoteInput';
import NoteList from '../components/NoteList';
import Header from '../components/Header';
import { Lightbulb, Archive, Trash2, Plus, X } from 'lucide-react';
import { useNotes } from '../contexts/NotesContext';
import { v4 as uuidv4 } from 'uuid';
import styles from './page.module.css';

const SECTION_COLORS = [
  '#f28b82', '#fbbc04', '#fff475', '#ccff90', '#a7ffeb', 
  '#cbf0f8', '#aecbfa', '#d7aefb', '#fdcfe8', '#e6c9a8'
];

export default function Home() {
  const { sections, addSection, deleteSection } = useNotes();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('active');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const [showAddSection, setShowAddSection] = useState(false);
  const [newSectionName, setNewSectionName] = useState('');
  const [newSectionColor, setNewSectionColor] = useState(SECTION_COLORS[0]);
  const [sectionToDelete, setSectionToDelete] = useState(null);

  const handleAddSection = (e) => {
    e.preventDefault();
    if (newSectionName.trim()) {
      addSection({
        id: uuidv4(),
        name: newSectionName.trim(),
        color: newSectionColor
      });
      setNewSectionName('');
      setShowAddSection(false);
    }
  };

  const currentSectionId = filterStatus.startsWith('section:') ? filterStatus.split(':')[1] : null;

  return (
    <div className={styles.appWrapper}>
      <Header 
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery} 
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />
      
      <div className={styles.mainLayout}>
        <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
          <div className={styles.navLinks}>
            <button 
              className={`${styles.navItem} ${filterStatus === 'active' ? styles.active : ''}`}
              onClick={() => setFilterStatus('active')}
            >
              <Lightbulb size={20} />
              <span>Notes</span>
            </button>
            <button 
              className={`${styles.navItem} ${filterStatus === 'archived' ? styles.active : ''}`}
              onClick={() => setFilterStatus('archived')}
            >
              <Archive size={20} />
              <span>Archive</span>
            </button>
            <button 
              className={`${styles.navItem} ${filterStatus === 'trash' ? styles.active : ''}`}
              onClick={() => setFilterStatus('trash')}
            >
              <Trash2 size={20} />
              <span>Trash</span>
            </button>
          </div>

          <div className={styles.sectionHeader}>
            <span>Notebooks</span>
            <button className={styles.addSectionBtn} onClick={() => setShowAddSection(!showAddSection)} title="Add Notebook">
              {showAddSection ? <X size={16} /> : <Plus size={16} />}
            </button>
          </div>

          {showAddSection && (
            <form className={styles.addSectionForm} onSubmit={handleAddSection}>
              <input 
                autoFocus
                type="text" 
                placeholder="Notebook name..." 
                className={styles.sectionInput}
                value={newSectionName}
                onChange={(e) => setNewSectionName(e.target.value)}
              />
              <div className={styles.colorPicker}>
                {SECTION_COLORS.map(color => (
                  <div 
                    key={color}
                    className={styles.colorChoice}
                    style={{ backgroundColor: color, border: newSectionColor === color ? '2px solid var(--text-main)' : undefined }}
                    onClick={() => setNewSectionColor(color)}
                  />
                ))}
              </div>
              <button type="submit" className={styles.saveSectionBtn}>Create</button>
            </form>
          )}

          <div className={styles.navLinks} style={{ marginTop: '8px' }}>
            {sections.map(sec => (
              <div 
                key={sec.id}
                className={`${styles.navItem} ${styles.sectionNavItem} ${filterStatus === `section:${sec.id}` ? styles.active : ''}`}
                onClick={() => setFilterStatus(`section:${sec.id}`)}
                style={{ cursor: 'pointer' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
                  <div className={styles.colorDot} style={{ backgroundColor: sec.color }} />
                  <span>{sec.name}</span>
                </div>
                <button 
                  type="button"
                  className={styles.deleteSectionBtn}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (sectionToDelete === sec.id) {
                      deleteSection(sec.id);
                      setSectionToDelete(null);
                      if (filterStatus === `section:${sec.id}`) setFilterStatus('active');
                    } else {
                      setSectionToDelete(sec.id);
                      setTimeout(() => {
                        setSectionToDelete(current => current === sec.id ? null : current);
                      }, 3000);
                    }
                  }}
                  title={sectionToDelete === sec.id ? "Click again to confirm" : "Delete Notebook"}
                  style={sectionToDelete === sec.id ? { color: 'var(--color-red)', opacity: 1 } : {}}
                >
                  {sectionToDelete === sec.id ? <span style={{ fontSize: '11px', fontWeight: 'bold', padding: '0 4px' }}>Confirm</span> : <Trash2 size={16} />}
                </button>
              </div>
            ))}
          </div>
        </aside>
        
        <main className={styles.main}>
          {(filterStatus === 'active' || currentSectionId) && <NoteInput currentSectionId={currentSectionId} />}
          <NoteList searchQuery={searchQuery} filterStatus={filterStatus} />
        </main>
      </div>
    </div>
  );
}

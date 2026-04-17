'use client';

import React, { useState } from 'react';
import NoteInput from '../components/NoteInput';
import NoteList from '../components/NoteList';
import Header from '../components/Header';
import { Lightbulb, Archive, Trash2 } from 'lucide-react';
import styles from './page.module.css';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('active');
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
        </aside>
        
        <main className={styles.main}>
          {filterStatus === 'active' && <NoteInput />}
          <NoteList searchQuery={searchQuery} filterStatus={filterStatus} />
        </main>
      </div>
    </div>
  );
}

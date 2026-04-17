'use client';

import React from 'react';
import { Search, Moon, Sun, Menu } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import styles from './Header.module.css';

export default function Header({ searchQuery, setSearchQuery, toggleSidebar }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className={styles.header}>
      <div className={styles.logoArea}>
        <button className={styles.iconButton} onClick={toggleSidebar}>
          <Menu size={24} />
        </button>
        <span style={{ fontSize: '24px' }}>📝</span>
        <span className="hidden sm:inline">Daily Notes</span>
      </div>

      <div className={styles.searchContainer}>
        <Search className={styles.searchIcon} size={20} />
        <input 
          type="text" 
          placeholder="Search notes..." 
          className={styles.searchInput}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className={styles.actions}>
        <button className={styles.iconButton} onClick={toggleTheme} title="Toggle theme">
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>
    </header>
  );
}

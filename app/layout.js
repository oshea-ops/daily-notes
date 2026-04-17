import './globals.css';
import { NotesProvider } from '../contexts/NotesContext';
import { ThemeProvider } from '../contexts/ThemeContext';
import AlarmManager from '../components/AlarmManager';

export const metadata = {
  title: 'Daily Notes',
  description: 'A premium, intelligent note-taking application.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <NotesProvider>
            <AlarmManager />
            {children}
          </NotesProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

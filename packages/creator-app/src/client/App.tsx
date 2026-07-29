import { useState } from 'react';
import NavBar from './components/NavBar';
import Settings from './pages/Settings';
import Platforms from './pages/Platforms';
import Preview from './pages/Preview';
import Publish from './pages/Publish';

export type Page = 'settings' | 'platforms' | 'preview' | 'publish';

export default function App() {
  const [page, setPage] = useState<Page>('settings');

  return (
    <div className="app-layout">
      <NavBar currentPage={page} onNavigate={setPage} />
      <main className="main-content">
        {page === 'settings' && <Settings />}
        {page === 'platforms' && <Platforms />}
        {page === 'preview' && <Preview />}
        {page === 'publish' && <Publish />}
      </main>
    </div>
  );
}

import type { Page } from '../App';

interface NavBarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

const NAV_ITEMS: { id: Page; icon: string; label: string }[] = [
  { id: 'settings', icon: '⚙️', label: 'Einstellungen' },
  { id: 'platforms', icon: '🎙️', label: 'Plattformen' },
  { id: 'preview', icon: '👁️', label: 'Vorschau' },
  { id: 'publish', icon: '🚀', label: 'Veröffentlichen' },
];

export default function NavBar({ currentPage, onNavigate }: NavBarProps) {
  return (
    <nav className="navbar" role="navigation" aria-label="Hauptnavigation">
      <div className="navbar-logo">
        <h1>SLOT-CAST</h1>
        <p>Creator-App</p>
      </div>

      {NAV_ITEMS.map(item => (
        <button
          key={item.id}
          className={`nav-item${currentPage === item.id ? ' active' : ''}`}
          onClick={() => onNavigate(item.id)}
          aria-current={currentPage === item.id ? 'page' : undefined}
        >
          <span className="icon" aria-hidden="true">{item.icon}</span>
          {item.label}
        </button>
      ))}

      <div className="navbar-footer">
        <div>Nur lokal verwenden</div>
        <div>Nicht öffentlich zugänglich</div>
      </div>
    </nav>
  );
}

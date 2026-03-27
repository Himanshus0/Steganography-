import { useState } from 'react';
import { AppProvider } from './context/AppContext';
import { SenderPanel } from './components/SenderPanel';
import { ReceiverPanel } from './components/ReceiverPanel';

type Tab = 'sender' | 'receiver';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('sender');

  return (
    <AppProvider>
      <div className="app-wrapper">
        {/* ── Header ──────────────────────────────────────────────── */}
        <header className="app-header">
          <div className="header-logo">
            <span className="logo-icon">🔏</span>
            <span className="logo-text">SteganoVault</span>
          </div>
          <p className="header-tagline">Invisible messages. Visible simplicity.</p>
        </header>

        {/* ── Tab Navigation ───────────────────────────────────────── */}
        <nav className="tab-nav" role="tablist" aria-label="App mode">
          <button
            role="tab"
            id="tab-sender"
            aria-selected={activeTab === 'sender'}
            aria-controls="panel-sender"
            className={`tab-btn ${activeTab === 'sender' ? 'tab-btn--active' : ''}`}
            onClick={() => setActiveTab('sender')}
          >
            <span>🔒</span> Sender
          </button>
          <button
            role="tab"
            id="tab-receiver"
            aria-selected={activeTab === 'receiver'}
            aria-controls="panel-receiver"
            className={`tab-btn ${activeTab === 'receiver' ? 'tab-btn--active tab-btn--active-mint' : ''}`}
            onClick={() => setActiveTab('receiver')}
          >
            <span>🔓</span> Receiver
          </button>
        </nav>

        {/* ── Main Content ─────────────────────────────────────────── */}
        <main className="main-content">
          <div
            id="panel-sender"
            role="tabpanel"
            aria-labelledby="tab-sender"
            hidden={activeTab !== 'sender'}
          >
            <SenderPanel />
          </div>
          <div
            id="panel-receiver"
            role="tabpanel"
            aria-labelledby="tab-receiver"
            hidden={activeTab !== 'receiver'}
          >
            <ReceiverPanel />
          </div>
        </main>

        {/* ── Footer ───────────────────────────────────────────────── */}
        <footer className="app-footer">
        </footer>
      </div>
    </AppProvider>
  );
}

export default App;

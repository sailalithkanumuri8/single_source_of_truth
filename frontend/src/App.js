import React, { useState, useMemo, useEffect } from 'react';
import './App.css';
import './css/LoadingError.css';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import EscalationList from './components/EscalationList';
import EscalationDetail from './components/EscalationDetail';
import Dashboard from './components/Dashboard';
import { fetchEscalations } from './services/api';
import { calculateStats } from './utils/helpers';
import { useDarkMode } from './hooks/useDarkMode';

function App() {
  const [selectedView, setSelectedView] = useState('escalations');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    category: 'all'
  });
  const [selectedEscalation, setSelectedEscalation] = useState(null);
  const [escalations, setEscalations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [darkMode, toggleDarkMode] = useDarkMode();

  useEffect(() => {
    const loadEscalations = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchEscalations();
        setEscalations(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadEscalations();
  }, []);

  const escalationStats = useMemo(() => calculateStats(escalations), [escalations]);

  const filteredEscalations = useMemo(() => {
    return escalations.filter(escalation => {
      if (filters.status !== 'all' && escalation.status !== filters.status) {
        return false;
      }

      if (filters.priority !== 'all' && escalation.priority !== filters.priority) {
        return false;
      }

      if (filters.category !== 'all' && escalation.category !== filters.category) {
        return false;
      }

      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          escalation.title.toLowerCase().includes(searchLower) ||
          escalation.description.toLowerCase().includes(searchLower) ||
          escalation.id.toLowerCase().includes(searchLower) ||
          escalation.customer.toLowerCase().includes(searchLower) ||
          escalation.tags.some(tag => tag.toLowerCase().includes(searchLower))
        );
      }

      return true;
    });
  }, [escalations, filters, searchTerm]);

  if (loading) {
    return (
      <div className="app">
        <div className="loading-container">
          <div className="loading-message">Loading escalations...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app">
        <div className="error-container">
          <div className="error-title">Error loading data</div>
          <div className="error-message">{error}</div>
          <button 
            className="error-retry-button"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <Header 
        onSearch={setSearchTerm} 
        searchTerm={searchTerm}
        darkMode={darkMode}
        onToggleDarkMode={toggleDarkMode}
        escalations={escalations}
      />
      
      <div className="app-layout">
        <Sidebar 
          selectedView={selectedView}
          onViewChange={setSelectedView}
          filters={filters}
          onFilterChange={setFilters}
          escalationStats={escalationStats}
        />
        
        <main className="main-content">
          {selectedView === 'escalations' && (
            <EscalationList 
              escalations={filteredEscalations}
              onSelectEscalation={setSelectedEscalation}
            />
          )}
          
          {selectedView === 'analytics' && (
            <Dashboard escalations={filteredEscalations} />
          )}
        </main>
      </div>

      {selectedEscalation && (
        <EscalationDetail 
          escalation={selectedEscalation}
          onClose={() => setSelectedEscalation(null)}
        />
      )}
    </div>
  );
}

export default App;

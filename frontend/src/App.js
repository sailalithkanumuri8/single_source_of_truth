import React, { useState, useMemo, useEffect } from 'react';
import './App.css';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import EscalationList from './components/EscalationList';
import EscalationDetail from './components/EscalationDetail';
import Dashboard from './components/Dashboard';
import { fetchEscalations } from './services/api';
import { calculateStats } from './utils/helpers';

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
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <div style={{ fontSize: '1.5rem' }}>Loading escalations...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          flexDirection: 'column',
          gap: '1rem',
          color: '#dc2626'
        }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Error loading data</div>
          <div>{error}</div>
          <button 
            onClick={() => window.location.reload()} 
            style={{
              padding: '0.5rem 1rem',
              marginTop: '1rem',
              cursor: 'pointer',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '0.25rem'
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <Header onSearch={setSearchTerm} searchTerm={searchTerm} />
      
      <div className="app-layout">
        <Sidebar 
          selectedView={selectedView}
          onViewChange={setSelectedView}
          filters={filters}
          onFilterChange={setFilters}
          escalationStats={escalationStats}
        />
        
        <main className="main-content">
          {selectedView === 'dashboard' && (
            <Dashboard escalations={filteredEscalations} />
          )}
          
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

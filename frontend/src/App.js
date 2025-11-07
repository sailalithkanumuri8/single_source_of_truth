import React, { useState, useMemo } from 'react';
import './App.css';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import EscalationList from './components/EscalationList';
import EscalationDetail from './components/EscalationDetail';
import Dashboard from './components/Dashboard';
import { mockEscalations } from './data/mockEscalations';
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

  // Calculate statistics for sidebar using helper
  const escalationStats = useMemo(() => calculateStats(mockEscalations), []);

  // Filter and search escalations
  const filteredEscalations = useMemo(() => {
    return mockEscalations.filter(escalation => {
      // Apply status filter
      if (filters.status !== 'all' && escalation.status !== filters.status) {
        return false;
      }

      // Apply priority filter
      if (filters.priority !== 'all' && escalation.priority !== filters.priority) {
        return false;
      }

      // Apply category filter
      if (filters.category !== 'all' && escalation.category !== filters.category) {
        return false;
      }

      // Apply search filter
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
  }, [filters, searchTerm]);

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
            <Dashboard escalations={mockEscalations} />
          )}
          
          {selectedView === 'escalations' && (
            <EscalationList 
              escalations={filteredEscalations}
              onSelectEscalation={setSelectedEscalation}
            />
          )}
          
          {selectedView === 'analytics' && (
            <Dashboard escalations={mockEscalations} />
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

'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTheme } from '@/components/ui/theme-provider';
import '../styles/FederationPage.css';
import { adminApi } from '@/lib/api';

export default function FederationPage({ onNavigate }) {
  const { theme, toggleTheme } = useTheme();
  const isDarkMode = theme === 'dark';
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [inspector, setInspector] = useState({
    metrics: {
      incoming_per_minute: 0,
      outgoing_per_minute: 0,
      signature_validation: '0%',
      retry_queue: 0
    },
    servers: [],
    recent_incoming: [],
    recent_outgoing: []
  });

  const loadInspector = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await adminApi.getFederationInspector();
      setInspector(data);
    } catch (err) {
      setError(err.message || 'Failed to load federation inspector data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInspector();
    const timer = setInterval(loadInspector, 15000);
    return () => clearInterval(timer);
  }, []);

  const mergedTraffic = useMemo(() => {
    const incoming = (inspector.recent_incoming || []).map((entry, idx) => ({
      ...entry,
      id: `in-${idx}`
    }));
    const outgoing = (inspector.recent_outgoing || []).map((entry, idx) => ({
      ...entry,
      id: `out-${idx}`
    }));
    return [...incoming, ...outgoing]
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .slice(0, 20);
  }, [inspector]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy':
        return '#00ff88';
      case 'degraded':
        return '#ffd700';
      case 'blocked':
        return '#ff4444';
      default:
        return '#888';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'healthy':
        return '🟢';
      case 'degraded':
        return '🟡';
      case 'blocked':
        return '🔴';
      default:
        return '⚪';
    }
  };

  return (
    <div className="federation-container">
      {/* Navigation */}
      <div className="federation-navbar">
        <button
          className="nav-button back-button"
          onClick={() => onNavigate('home')}
        >
          ← Back
        </button>
        <h1 className="navbar-title">Federation Inspector</h1>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            className="nav-btn-profile"
            onClick={() => onNavigate('moderation')}
            style={{
              padding: '8px 12px',
              background: 'rgba(255, 68, 68, 0.1)',
              border: '1px solid #ff4444',
              color: '#ff4444',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            📋 Moderation
          </button>
          <button
            className="nav-btn-profile"
            onClick={() => onNavigate('profile')}
            style={{
              padding: '8px 12px',
              background: isDarkMode ? 'rgba(0, 217, 255, 0.1)' : 'rgba(100, 100, 100, 0.1)',
              border: `1px solid ${isDarkMode ? '#00d9ff' : '#666'}`,
              color: isDarkMode ? '#00d9ff' : '#333',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            Profile
          </button>
          <button
            className="nav-btn-profile"
            onClick={toggleTheme}
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            style={{
              padding: '8px 12px',
              background: isDarkMode ? 'rgba(0, 217, 255, 0.1)' : 'rgba(100, 100, 100, 0.1)',
              border: `1px solid ${isDarkMode ? '#00d9ff' : '#666'}`,
              color: isDarkMode ? '#00d9ff' : '#333',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            {isDarkMode ? '🌞' : '🌙'}
          </button>
        </div>
      </div>

      <div className="federation-content">
        {error && (
          <div style={{
            marginBottom: '18px',
            padding: '12px',
            borderRadius: '8px',
            border: '1px solid rgba(255,68,68,0.45)',
            background: 'rgba(255,68,68,0.1)',
            color: '#ff8080'
          }}>
            {error}
          </div>
        )}

        {/* Health Metrics */}
        <div className="health-section">
          <h2 className="section-title">Federation Health</h2>

          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-icon">📥</div>
              <div className="metric-info">
                <div className="metric-label">Incoming Activities</div>
                <div className="metric-value">{inspector.metrics?.incoming_per_minute || 0}/min</div>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon">📤</div>
              <div className="metric-info">
                <div className="metric-label">Outgoing Activities</div>
                <div className="metric-value">{inspector.metrics?.outgoing_per_minute || 0}/min</div>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon">✔</div>
              <div className="metric-info">
                <div className="metric-label">Signature Validation</div>
                <div className="metric-value">{inspector.metrics?.signature_validation || '0%'}</div>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon">⏳</div>
              <div className="metric-info">
                <div className="metric-label">Retry Queue</div>
                <div className="metric-value">{inspector.metrics?.retry_queue || 0} pending</div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Federation Traffic */}
        <div className="activity-chart">
          <h3>Recent Federation Traffic</h3>
          <div className="servers-table">
            <div className="table-header">
              <div className="col-status">Direction</div>
              <div className="col-domain">Target / Actor</div>
              <div className="col-reputation">Type</div>
              <div className="col-status">Status</div>
              <div className="col-lastseen">Time</div>
            </div>
            {mergedTraffic.length > 0 ? mergedTraffic.map((entry) => (
              <div key={entry.id} className="table-row">
                <div className="col-status">{entry.direction === 'incoming' ? '📥 In' : '📤 Out'}</div>
                <div className="col-domain">
                  <span className="domain-name">{entry.actor_uri || entry.target_inbox || '—'}</span>
                </div>
                <div className="col-reputation">{entry.type || '—'}</div>
                <div className="col-status">{entry.status || 'received'}</div>
                <div className="col-lastseen">{entry.time ? new Date(entry.time).toLocaleString() : '—'}</div>
              </div>
            )) : (
              <div className="table-row">
                <div className="col-domain" style={{ padding: '12px', color: '#888' }}>No recent federation traffic</div>
              </div>
            )}
          </div>
        </div>

        {/* Connected Servers Table */}
        <div className="servers-section">
          <h2 className="section-title">Connected Servers</h2>

          <div className="servers-table">
            <div className="table-header">
              <div className="col-domain">Domain</div>
              <div className="col-status">Status</div>
              <div className="col-reputation">Reputation</div>
              <div className="col-lastseen">Last Seen</div>
              <div className="col-activities">Activities</div>
            </div>

            {(inspector.servers || []).map((server, idx) => (
              <div key={`${server.domain || 'domain'}-${idx}`} className="table-row">
                <div className="col-domain">
                  <span className="domain-name">{server.domain}</span>
                </div>
                <div className="col-status">
                  <span
                    className={`status-badge ${server.status}`}
                    style={{
                      borderColor: getStatusColor(server.status),
                    }}
                  >
                    {getStatusBadge(server.status)} {server.status}
                  </span>
                </div>
                <div className="col-reputation">
                  <span className={`reputation-tag ${server.reputation.toLowerCase().replace(' ', '-')}`}>
                    {server.reputation}
                  </span>
                </div>
                <div className="col-lastseen">{server.last_seen && server.last_seen !== '—' ? new Date(server.last_seen).toLocaleString() : '—'}</div>
                <div className="col-activities">{server.activities_m || 0}/min</div>
              </div>
            ))}
            {(inspector.servers || []).length === 0 && !isLoading && (
              <div className="table-row">
                <div className="col-domain" style={{ padding: '12px', color: '#888' }}>No federated domains observed yet.</div>
              </div>
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="legend-section">
          <h3>Status Indicators</h3>
          <div className="legend-items">
            <div className="legend-item">
              <span className="legend-color healthy">🟢</span>
              <span>Healthy - All systems operational</span>
            </div>
            <div className="legend-item">
              <span className="legend-color degraded">🟡</span>
              <span>Degraded - Slow response or high errors</span>
            </div>
            <div className="legend-item">
              <span className="legend-color blocked">🔴</span>
              <span>Blocked - No communication allowed</span>
            </div>
          </div>
        </div>

        {/* Advanced Options */}
        <div className="advanced-section">
          <h3>Advanced Options</h3>
          <div className="advanced-buttons">
            <button className="advanced-btn" onClick={loadInspector} disabled={isLoading}>
              {isLoading ? '⏳ Refreshing…' : '🔄 Refresh Inspector'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

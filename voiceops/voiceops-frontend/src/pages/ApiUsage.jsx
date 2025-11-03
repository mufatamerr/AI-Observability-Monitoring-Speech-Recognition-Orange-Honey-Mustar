import '../App.css'

function ApiUsage({ onNavigateToWelcome }) {
  // Mock data for the template
  const mockApiStats = {
    totalRequests: 12450,
    totalTokens: 2840000,
    avgLatency: 245,
    successRate: 98.5,
    errorRate: 1.5
  }

  const mockEndpoints = [
    {
      name: '/api/v1/chat',
      requests: 5420,
      avgLatency: 320,
      tokens: 1250000,
      status: 'healthy'
    },
    {
      name: '/api/v1/image-generation',
      requests: 3890,
      avgLatency: 1800,
      tokens: 890000,
      status: 'healthy'
    },
    {
      name: '/api/v1/transcription',
      requests: 2140,
      avgLatency: 450,
      tokens: 450000,
      status: 'warning'
    },
    {
      name: '/api/v1/sentiment',
      requests: 1000,
      avgLatency: 120,
      tokens: 250000,
      status: 'healthy'
    }
  ]

  const mockRecentActivity = [
    { time: '2m ago', endpoint: '/api/v1/chat', tokens: 1250, latency: 285, status: 'success' },
    { time: '5m ago', endpoint: '/api/v1/image-generation', tokens: 3200, latency: 1820, status: 'success' },
    { time: '8m ago', endpoint: '/api/v1/transcription', tokens: 890, latency: 445, status: 'success' },
    { time: '12m ago', endpoint: '/api/v1/chat', tokens: 2100, latency: 310, status: 'error' },
    { time: '15m ago', endpoint: '/api/v1/sentiment', tokens: 650, latency: 115, status: 'success' }
  ]

  return (
    <div className="api-usage-container">
      <div className="api-usage-header">
        <button 
          className="back-button"
          onClick={onNavigateToWelcome}
          aria-label="Back to welcome page"
        >
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path 
              d="M15 18L9 12L15 6" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
          <span>Back</span>
        </button>
        <h1 className="api-usage-title">API Usage Dashboard</h1>
        <div className="header-spacer"></div>
      </div>

      <div className="api-usage-content">
        {/* Overview Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-info">
              <h3 className="stat-label">Total Requests</h3>
              <p className="stat-value">{mockApiStats.totalRequests.toLocaleString()}</p>
              <span className="stat-change positive">+12.5% from last hour</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🔤</div>
            <div className="stat-info">
              <h3 className="stat-label">Total Tokens</h3>
              <p className="stat-value">{(mockApiStats.totalTokens / 1000).toFixed(0)}K</p>
              <span className="stat-change positive">+8.3% from last hour</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">⚡</div>
            <div className="stat-info">
              <h3 className="stat-label">Avg Latency</h3>
              <p className="stat-value">{mockApiStats.avgLatency}ms</p>
              <span className="stat-change negative">-15ms from last hour</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-info">
              <h3 className="stat-label">Success Rate</h3>
              <p className="stat-value">{mockApiStats.successRate}%</p>
              <span className="stat-change positive">+0.2% from last hour</span>
            </div>
          </div>
        </div>

        {/* Endpoints Table */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2 className="section-title">API Endpoints</h2>
            <div className="section-actions">
              <button className="filter-button">Filter</button>
              <button className="refresh-button">Refresh</button>
            </div>
          </div>
          <div className="endpoints-table">
            <div className="table-header">
              <div className="table-cell">Endpoint</div>
              <div className="table-cell">Requests</div>
              <div className="table-cell">Avg Latency</div>
              <div className="table-cell">Tokens</div>
              <div className="table-cell">Status</div>
            </div>
            {mockEndpoints.map((endpoint, index) => (
              <div key={index} className="table-row">
                <div className="table-cell endpoint-name">
                  <code>{endpoint.name}</code>
                </div>
                <div className="table-cell">{endpoint.requests.toLocaleString()}</div>
                <div className="table-cell">{endpoint.avgLatency}ms</div>
                <div className="table-cell">{(endpoint.tokens / 1000).toFixed(0)}K</div>
                <div className="table-cell">
                  <span className={`status-badge ${endpoint.status}`}>
                    {endpoint.status === 'healthy' ? '✓ Healthy' : '⚠ Warning'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2 className="section-title">Recent Activity</h2>
          </div>
          <div className="activity-list">
            {mockRecentActivity.map((activity, index) => (
              <div key={index} className="activity-item">
                <div className="activity-time">{activity.time}</div>
                <div className="activity-endpoint">
                  <code>{activity.endpoint}</code>
                </div>
                <div className="activity-details">
                  <span className="activity-token">{activity.tokens} tokens</span>
                  <span className="activity-latency">{activity.latency}ms</span>
                </div>
                <div className={`activity-status ${activity.status}`}>
                  {activity.status === 'success' ? '✓' : '✗'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Charts Placeholder */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2 className="section-title">Usage Trends</h2>
            <select className="time-range-select">
              <option>Last Hour</option>
              <option>Last 24 Hours</option>
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div className="chart-placeholder">
            <div className="chart-mock">
              <p className="chart-mock-text">📈 Chart visualization will appear here</p>
              <p className="chart-mock-subtext">Real-time metrics and trends</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ApiUsage


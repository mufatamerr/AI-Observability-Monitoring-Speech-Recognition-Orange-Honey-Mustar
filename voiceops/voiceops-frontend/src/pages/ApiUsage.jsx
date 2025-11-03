import '../App.css'
import MagicButton from '../components/MagicButton'
import { useState, useEffect } from 'react'

function ApiUsage({ onNavigateToWelcome }) {
  const [apiStats, setApiStats] = useState({
    totalTokens: 0,
    avgLatency: 0,
    successRate: 100.0,
    errorRate: 0.0
  })
  const [endpoints, setEndpoints] = useState([])
  const [recentActivity, setRecentActivity] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchUsageData = async () => {
    try {
      setLoading(true)
      const [statsRes, endpointsRes, activityRes] = await Promise.all([
        fetch('http://localhost:8000/api/v1/usage/stats'),
        fetch('http://localhost:8000/api/v1/usage/endpoints'),
        fetch('http://localhost:8000/api/v1/usage/activity')
      ])

      if (statsRes.ok) {
        const stats = await statsRes.json()
        setApiStats(stats)
      }

      if (endpointsRes.ok) {
        const data = await endpointsRes.json()
        setEndpoints(data.endpoints || [])
      }

      if (activityRes.ok) {
        const data = await activityRes.json()
        setRecentActivity(data.activity || [])
      }
    } catch (error) {
      console.error('Error fetching usage data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsageData()
    // Refresh every 5 seconds
    const interval = setInterval(fetchUsageData, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="api-usage-container">
      <div className="api-usage-header">
        <MagicButton 
          className="back-button"
          onClick={onNavigateToWelcome}
          aria-label="Back to welcome page"
          particleCount={5}
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
        </MagicButton>
        <h1 className="api-usage-title">API Usage Dashboard</h1>
        <div className="header-spacer"></div>
      </div>

      <div className="api-usage-content">
        {/* Overview Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">🔤</div>
            <div className="stat-info">
              <h3 className="stat-label">Total Tokens</h3>
              <p className="stat-value">
                {loading ? '...' : (apiStats.totalTokens / 1000).toFixed(0) + 'K'}
              </p>
              <span className="stat-change positive">Last 24 hours</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">⚡</div>
            <div className="stat-info">
              <h3 className="stat-label">Avg Latency</h3>
              <p className="stat-value">
                {loading ? '...' : apiStats.avgLatency + 'ms'}
              </p>
              <span className="stat-change">Last 24 hours</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-info">
              <h3 className="stat-label">Success Rate</h3>
              <p className="stat-value">
                {loading ? '...' : apiStats.successRate + '%'}
              </p>
              <span className="stat-change positive">Last 24 hours</span>
            </div>
          </div>
        </div>

        {/* Endpoints Table */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2 className="section-title">API Endpoints</h2>
            <div className="section-actions">
              <MagicButton 
                className="filter-button"
                particleCount={4}
                enableTilt={false}
              >
                Filter
              </MagicButton>
              <MagicButton 
                className="refresh-button"
                particleCount={4}
                enableTilt={false}
                onClick={fetchUsageData}
              >
                Refresh
              </MagicButton>
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
            {loading && endpoints.length === 0 ? (
              <div className="table-row">
                <div className="table-cell" colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>
                  Loading...
                </div>
              </div>
            ) : endpoints.length === 0 ? (
              <div className="table-row">
                <div className="table-cell" colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>
                  No endpoint data available
                </div>
              </div>
            ) : (
              endpoints.map((endpoint, index) => (
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
              ))
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2 className="section-title">Recent Activity</h2>
          </div>
          <div className="activity-list">
            {loading && recentActivity.length === 0 ? (
              <div className="activity-item" style={{ textAlign: 'center', padding: '20px' }}>
                Loading...
              </div>
            ) : recentActivity.length === 0 ? (
              <div className="activity-item" style={{ textAlign: 'center', padding: '20px' }}>
                No recent activity
              </div>
            ) : (
              recentActivity.map((activity, index) => (
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
              ))
            )}
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


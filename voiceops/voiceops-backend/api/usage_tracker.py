"""
API Usage Tracker - Tracks API requests, latency, tokens, and errors
"""
import time
from datetime import datetime, timedelta
from typing import Dict, List, Optional
from collections import defaultdict
import threading

class UsageTracker:
    """Thread-safe in-memory usage tracker for API metrics"""
    
    def __init__(self):
        self._lock = threading.Lock()
        self._requests = []  # List of request records
        self._endpoint_stats = defaultdict(lambda: {
            'requests': 0,
            'total_latency': 0,
            'success_count': 0,
            'error_count': 0,
            'tokens': 0
        })
    
    def record_request(self, endpoint: str, latency_ms: float, success: bool, tokens: int = 0):
        """Record an API request"""
        with self._lock:
            timestamp = datetime.now()
            self._requests.append({
                'endpoint': endpoint,
                'timestamp': timestamp,
                'latency_ms': latency_ms,
                'success': success,
                'tokens': tokens
            })
            
            # Update endpoint stats
            stats = self._endpoint_stats[endpoint]
            stats['requests'] += 1
            stats['total_latency'] += latency_ms
            if success:
                stats['success_count'] += 1
            else:
                stats['error_count'] += 1
            stats['tokens'] += tokens
            
            # Keep only last 1000 requests in memory
            if len(self._requests) > 1000:
                self._requests = self._requests[-1000:]
    
    def get_stats(self, time_range_hours: int = 24) -> Dict:
        """Get aggregated statistics for the last N hours"""
        with self._lock:
            cutoff = datetime.now() - timedelta(hours=time_range_hours)
            recent_requests = [r for r in self._requests if r['timestamp'] >= cutoff]
            
            if not recent_requests:
                return {
                    'totalTokens': 0,
                    'avgLatency': 0,
                    'successRate': 100.0,
                    'errorRate': 0.0
                }
            
            total_tokens = sum(r['tokens'] for r in recent_requests)
            total_latency = sum(r['latency_ms'] for r in recent_requests)
            avg_latency = total_latency / len(recent_requests) if recent_requests else 0
            success_count = sum(1 for r in recent_requests if r['success'])
            error_count = len(recent_requests) - success_count
            success_rate = (success_count / len(recent_requests) * 100) if recent_requests else 100.0
            error_rate = 100.0 - success_rate
            
            return {
                'totalTokens': total_tokens,
                'avgLatency': round(avg_latency, 1),
                'successRate': round(success_rate, 1),
                'errorRate': round(error_rate, 1)
            }
    
    def get_endpoint_stats(self) -> List[Dict]:
        """Get statistics per endpoint"""
        with self._lock:
            endpoints = []
            for endpoint, stats in self._endpoint_stats.items():
                if stats['requests'] == 0:
                    continue
                
                avg_latency = stats['total_latency'] / stats['requests'] if stats['requests'] > 0 else 0
                success_rate = (stats['success_count'] / stats['requests'] * 100) if stats['requests'] > 0 else 100.0
                
                # Determine status based on error rate
                error_rate = (stats['error_count'] / stats['requests'] * 100) if stats['requests'] > 0 else 0
                status = 'healthy' if error_rate < 5 and avg_latency < 2000 else 'warning'
                
                endpoints.append({
                    'name': endpoint,
                    'requests': stats['requests'],
                    'avgLatency': round(avg_latency, 1),
                    'tokens': stats['tokens'],
                    'status': status
                })
            
            # Sort by request count (descending)
            endpoints.sort(key=lambda x: x['requests'], reverse=True)
            return endpoints
    
    def get_recent_activity(self, limit: int = 10) -> List[Dict]:
        """Get recent activity log"""
        with self._lock:
            recent = sorted(self._requests, key=lambda x: x['timestamp'], reverse=True)[:limit]
            
            activity = []
            for req in recent:
                # Calculate time ago
                time_diff = datetime.now() - req['timestamp']
                if time_diff.total_seconds() < 60:
                    time_str = f"{int(time_diff.total_seconds())}s ago"
                elif time_diff.total_seconds() < 3600:
                    time_str = f"{int(time_diff.total_seconds() / 60)}m ago"
                else:
                    time_str = f"{int(time_diff.total_seconds() / 3600)}h ago"
                
                activity.append({
                    'time': time_str,
                    'endpoint': req['endpoint'],
                    'tokens': req['tokens'],
                    'latency': round(req['latency_ms'], 0),
                    'status': 'success' if req['success'] else 'error'
                })
            
            return activity

# Global singleton instance
_usage_tracker = UsageTracker()

def get_tracker() -> UsageTracker:
    """Get the global usage tracker instance"""
    return _usage_tracker


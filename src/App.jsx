import React, { useState, useEffect, useRef } from 'react';
import { Shield, AlertTriangle, Activity, Terminal, Search, Clock, TrendingUp, Zap, Lock, Database, Eye, Wifi } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const SIEMDashboard = () => {
  const [events, setEvents] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [threatIntelligence, setThreatIntelligence] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [scanInput, setScanInput] = useState('');
  const [dataSource, setDataSource] = useState('live'); // 'live' or 'simulated'
  const [metrics, setMetrics] = useState({
    totalEvents: 0,
    criticalAlerts: 0,
    blockedThreats: 0,
    activeIncidents: 0
  });
  const eventLogRef = useRef(null);
  const lastFetchTime = useRef(Date.now());

  // Simulated threat intelligence data
  const threatDatabase = {
    '192.168.1.100': { reputation: 'malicious', score: 95, type: 'C2 Server', country: 'Unknown' },
    '10.0.0.50': { reputation: 'suspicious', score: 65, type: 'Scanning Activity', country: 'CN' },
    '203.0.113.42': { reputation: 'malicious', score: 88, type: 'Malware Distribution', country: 'RU' },
    'malware.exe': { reputation: 'malicious', score: 100, type: 'Trojan', family: 'GenericKD' },
    'suspicious.dll': { reputation: 'suspicious', score: 70, type: 'PUP', family: 'Adware' }
  };

  // Security event types for simulated mode
  const eventTypes = [
    { type: 'INTRUSION_ATTEMPT', severity: 'critical', description: 'Multiple failed SSH login attempts detected' },
    { type: 'MALWARE_DETECTED', severity: 'critical', description: 'Malicious file execution blocked' },
    { type: 'DATA_EXFILTRATION', severity: 'high', description: 'Unusual outbound data transfer' },
    { type: 'PORT_SCAN', severity: 'medium', description: 'Network scanning activity detected' },
    { type: 'PRIVILEGE_ESCALATION', severity: 'critical', description: 'Unauthorized privilege escalation attempt' },
    { type: 'SUSPICIOUS_PROCESS', severity: 'high', description: 'Unknown process spawned from system directory' },
    { type: 'PHISHING_ATTEMPT', severity: 'medium', description: 'Suspicious email link clicked' },
    { type: 'ANOMALOUS_LOGIN', severity: 'high', description: 'Login from unusual geolocation' },
    { type: 'FILE_INTEGRITY', severity: 'medium', description: 'Critical system file modification detected' },
    { type: 'DNS_TUNNELING', severity: 'high', description: 'Potential DNS tunneling detected' }
  ];

  // Fetch real malware URLs from URLhaus
  const fetchURLhausThreats = async () => {
    try {
      // Option 1: Direct fetch (may have CORS issues)
      // const response = await fetch('https://urlhaus-api.abuse.ch/v1/urls/recent/limit/10/');
      
      // Option 2: Use CORS proxy
      // const CORS_PROXY = 'https://corsproxy.io/?';
      // const response = await fetch(`${CORS_PROXY}https://urlhaus-api.abuse.ch/v1/urls/recent/limit/10/`);
      
      // Option 3: Use Vite proxy (requires vite.config.js setup)
      const response = await fetch('/api/urlhaus/v1/urls/recent/limit/10/');
      const data = await response.json();
      
      if (data.query_status === 'ok' && data.urls) {
        return data.urls.map(url => {
          try {
            const urlObj = new URL(url.url);
            return {
              id: `EVT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              timestamp: url.date_added,
              type: 'MALWARE_URL_DETECTED',
              severity: url.threat === 'malware_download' ? 'critical' : 'high',
              description: `Live malware URL detected: ${url.threat || 'Unknown threat'}`,
              sourceIP: urlObj.hostname,
              destIP: '10.0.1.100',
              user: 'threat_intel',
              status: url.url_status === 'online' ? 'detected' : 'archived',
              automated: true,
              metadata: {
                url: url.url.substring(0, 50) + '...',
                malwareType: url.tags ? url.tags.join(', ') : 'Unknown',
                reporter: url.reporter,
                urlStatus: url.url_status,
                source: 'URLhaus (abuse.ch)'
              }
            };
          } catch (e) {
            return null;
          }
        }).filter(Boolean);
      }
    } catch (error) {
      console.error('Error fetching URLhaus data:', error);
    }
    return [];
  };

  // Fetch real SSH attack IPs from Blocklist.de
  const fetchBlocklistSSH = async () => {
    try {
      // Use CORS proxy if direct fetch fails
      const CORS_PROXY = 'https://corsproxy.io/?';
      const response = await fetch(`${CORS_PROXY}https://lists.blocklist.de/lists/ssh.txt`);
      const text = await response.text();
      const ips = text.split('\n')
        .filter(ip => ip.match(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/))
        .slice(0, 5); // Get 5 random IPs
      
      return ips.map(ip => ({
        id: `EVT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
        type: 'INTRUSION_ATTEMPT',
        severity: 'critical',
        description: 'Live SSH brute force attack detected',
        sourceIP: ip,
        destIP: '10.0.0.22',
        user: 'root',
        status: 'blocked',
        automated: true,
        metadata: {
          attackType: 'SSH Brute Force',
          port: '22',
          attempts: Math.floor(Math.random() * 1000) + 100,
          source: 'Blocklist.de',
          realTime: true
        }
      }));
    } catch (error) {
      console.error('Error fetching Blocklist.de data:', error);
    }
    return [];
  };

  // Fetch AbuseIPDB data (requires free API key)
  const fetchAbuseIPDB = async () => {
    // Note: Requires API key - sign up at https://www.abuseipdb.com/register
    // Uncomment and add your key to use this source
    /*
    try {
      const response = await fetch(
        'https://api.abuseipdb.com/api/v2/blacklist?confidenceMinimum=90&limit=10',
        {
          headers: {
            'Key': 'YOUR_ABUSEIPDB_API_KEY',
            'Accept': 'application/json'
          }
        }
      );
      const data = await response.json();
      
      if (data.data) {
        return data.data.map(item => ({
          id: `EVT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date().toISOString(),
          type: 'MALICIOUS_IP_DETECTED',
          severity: item.abuseConfidenceScore > 95 ? 'critical' : 'high',
          description: `Malicious IP detected with ${item.abuseConfidenceScore}% confidence`,
          sourceIP: item.ipAddress,
          destIP: '10.0.1.50',
          user: 'threat_intel',
          status: 'detected',
          automated: true,
          metadata: {
            country: item.countryCode,
            reports: item.totalReports,
            confidenceScore: item.abuseConfidenceScore,
            source: 'AbuseIPDB'
          }
        }));
      }
    } catch (error) {
      console.error('Error fetching AbuseIPDB data:', error);
    }
    */
    return [];
  };

  // Fetch live threat data from all sources
  const fetchLiveThreatData = async () => {
    const now = Date.now();
    
    // Prevent too frequent fetching (minimum 30 seconds between fetches)
    if (now - lastFetchTime.current < 30000) {
      return;
    }
    
    lastFetchTime.current = now;
    
    try {
      const [urlhausData, sshAttacks] = await Promise.all([
        fetchURLhausThreats(),
        fetchBlocklistSSH()
      ]);
      
      const allThreats = [...urlhausData, ...sshAttacks];
      
      // Add to events with slight delay for visual effect
      allThreats.forEach((threat, index) => {
        setTimeout(() => {
          analyzeEvent(threat);
          setEvents(prev => [threat, ...prev].slice(0, 100));
          setMetrics(prev => ({
            ...prev,
            totalEvents: prev.totalEvents + 1
          }));
        }, index * 500); // Stagger by 500ms
      });
      
    } catch (error) {
      console.error('Error fetching live data:', error);
    }
  };

  // Generate simulated event (original function)
  const generateEvent = () => {
    const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
    const sourceIPs = ['192.168.1.100', '10.0.0.50', '172.16.0.25', '203.0.113.42'];
    const users = ['admin', 'root', 'user1', 'system', 'service_account'];
    
    return {
      id: `EVT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      type: eventType.type,
      severity: eventType.severity,
      description: eventType.description,
      sourceIP: sourceIPs[Math.floor(Math.random() * sourceIPs.length)],
      destIP: `10.0.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      user: users[Math.floor(Math.random() * users.length)],
      status: 'detected',
      automated: false
    };
  };

  const analyzeEvent = (event) => {
    // Automated SIEM workflow: Detection → Analysis → Response
    const threat = threatDatabase[event.sourceIP];
    
    if (threat && threat.reputation === 'malicious') {
      event.status = 'blocked';
      event.automated = true;
      
      const alert = {
        id: `ALT-${Date.now()}`,
        eventId: event.id,
        timestamp: new Date().toISOString(),
        severity: 'critical',
        title: `Automated Response: ${event.type}`,
        description: `IP ${event.sourceIP} blocked - Known ${threat.type}`,
        status: 'active',
        automated: true,
        actions: ['IP Blocked', 'Firewall Rule Added', 'Incident Ticket Created']
      };
      
      setAlerts(prev => [alert, ...prev].slice(0, 50));
      setMetrics(prev => ({
        ...prev,
        blockedThreats: prev.blockedThreats + 1,
        activeIncidents: prev.activeIncidents + 1
      }));
    } else if (event.severity === 'critical' || event.automated) {
      const alert = {
        id: `ALT-${Date.now()}`,
        eventId: event.id,
        timestamp: new Date().toISOString(),
        severity: event.severity,
        title: event.automated ? `Live Threat Detected: ${event.type}` : `Manual Review Required: ${event.type}`,
        description: event.description,
        status: 'pending',
        automated: event.automated || false,
        actions: event.automated ? ['Threat Logged', 'Alert Generated', 'Monitoring Active'] : undefined
      };
      
      setAlerts(prev => [alert, ...prev].slice(0, 50));
      setMetrics(prev => ({
        ...prev,
        criticalAlerts: prev.criticalAlerts + 1
      }));
    }
  };

  // Event generation loop - switches between live and simulated
  useEffect(() => {
    if (dataSource === 'live') {
      // Fetch live data immediately
      fetchLiveThreatData();
      
      // Then fetch every 60 seconds
      const interval = setInterval(fetchLiveThreatData, 60000);
      return () => clearInterval(interval);
    } else {
      // Simulated mode - original behavior
      const interval = setInterval(() => {
        const newEvent = generateEvent();
        analyzeEvent(newEvent);
        
        setEvents(prev => [newEvent, ...prev].slice(0, 100));
        setMetrics(prev => ({
          ...prev,
          totalEvents: prev.totalEvents + 1
        }));
      }, 3000);
      
      return () => clearInterval(interval);
    }
  }, [dataSource]);

  // Auto-scroll event log
  useEffect(() => {
    if (eventLogRef.current) {
      eventLogRef.current.scrollTop = 0;
    }
  }, [events]);

  const handleThreatLookup = (indicator) => {
    const intel = threatDatabase[indicator];
    if (intel) {
      setThreatIntelligence({
        indicator,
        ...intel,
        source: 'Local Threat Intelligence',
        lastSeen: new Date().toISOString()
      });
    } else {
      setThreatIntelligence({
        indicator,
        reputation: 'clean',
        score: 10,
        type: 'Unknown',
        source: 'No threat data available'
      });
    }
  };

  const getSeverityColor = (severity) => {
    switch(severity) {
      case 'critical': return 'text-red-500';
      case 'high': return 'text-orange-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-blue-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'blocked': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'detected': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'archived': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      case 'resolved': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  // Chart data
  const eventTrendData = events.slice(0, 10).reverse().map((e, i) => ({
    time: new Date(e.timestamp).toLocaleTimeString(),
    events: i + 1
  }));

  const severityData = [
    { name: 'Critical', value: events.filter(e => e.severity === 'critical').length, color: '#ef4444' },
    { name: 'High', value: events.filter(e => e.severity === 'high').length, color: '#f97316' },
    { name: 'Medium', value: events.filter(e => e.severity === 'medium').length, color: '#eab308' },
    { name: 'Low', value: events.filter(e => e.severity === 'low').length, color: '#3b82f6' }
  ];

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono p-4">
      {/* Header */}
      <div className="border-2 border-green-500 p-4 mb-4 bg-black/80">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-green-500" />
            <div>
              <h1 className="text-2xl font-bold text-green-500">SIEM SECURITY OPERATIONS CENTER</h1>
              <p className="text-sm text-green-600">
                {dataSource === 'live' ? 'Real-time Threat Detection from Live Feeds' : 'Simulated Threat Detection & Response System'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setDataSource('live')}
                className={`px-3 py-1 border text-sm transition-all ${
                  dataSource === 'live'
                    ? 'border-green-500 bg-green-500/20 text-green-400'
                    : 'border-green-900 bg-black text-green-600 hover:border-green-700'
                }`}
              >
                <Wifi className="w-4 h-4 inline mr-1" />
                LIVE
              </button>
              <button
                onClick={() => setDataSource('simulated')}
                className={`px-3 py-1 border text-sm transition-all ${
                  dataSource === 'simulated'
                    ? 'border-green-500 bg-green-500/20 text-green-400'
                    : 'border-green-900 bg-black text-green-600 hover:border-green-700'
                }`}
              >
                SIMULATED
              </button>
            </div>
            <div className="flex items-center gap-2">
              <Activity className={`w-5 h-5 ${dataSource === 'live' ? 'animate-pulse text-red-500' : 'animate-pulse text-green-500'}`} />
              <span className={dataSource === 'live' ? 'text-red-500' : 'text-green-500'}>
                {dataSource === 'live' ? 'LIVE DATA' : 'SYSTEM ACTIVE'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex gap-2 mb-4">
        {['dashboard', 'events', 'alerts', 'intelligence'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 border-2 transition-all ${
              activeTab === tab 
                ? 'border-green-500 bg-green-500/20 text-green-400' 
                : 'border-green-900 bg-black text-green-600 hover:border-green-700'
            }`}
          >
            {tab.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <div className="space-y-4">
          {/* Metrics */}
          <div className="grid grid-cols-4 gap-4">
            <div className="border-2 border-green-500 p-4 bg-black/80">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-sm">TOTAL EVENTS</p>
                  <p className="text-3xl font-bold text-green-400">{metrics.totalEvents}</p>
                </div>
                <Database className="w-8 h-8 text-green-500" />
              </div>
            </div>
            <div className="border-2 border-red-500 p-4 bg-black/80">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-600 text-sm">CRITICAL ALERTS</p>
                  <p className="text-3xl font-bold text-red-400">{metrics.criticalAlerts}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
            </div>
            <div className="border-2 border-orange-500 p-4 bg-black/80">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-600 text-sm">BLOCKED THREATS</p>
                  <p className="text-3xl font-bold text-orange-400">{metrics.blockedThreats}</p>
                </div>
                <Lock className="w-8 h-8 text-orange-500" />
              </div>
            </div>
            <div className="border-2 border-yellow-500 p-4 bg-black/80">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-600 text-sm">ACTIVE INCIDENTS</p>
                  <p className="text-3xl font-bold text-yellow-400">{metrics.activeIncidents}</p>
                </div>
                <Zap className="w-8 h-8 text-yellow-500" />
              </div>
            </div>
          </div>

          {/* Data Source Info Banner */}
          {dataSource === 'live' && (
            <div className="border-2 border-blue-500 p-4 bg-blue-500/10">
              <div className="flex items-center gap-3">
                <Wifi className="w-6 h-6 text-blue-400 animate-pulse" />
                <div>
                  <p className="text-blue-400 font-bold">LIVE THREAT INTELLIGENCE ACTIVE</p>
                  <p className="text-blue-600 text-sm">
                    Data sources: URLhaus (Malware URLs) • Blocklist.de (SSH Attacks) • Updates every 60 seconds
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Charts */}
          <div className="grid grid-cols-2 gap-4">
            <div className="border-2 border-green-500 p-4 bg-black/80">
              <h3 className="text-green-500 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                EVENT TIMELINE
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={eventTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#065f46" />
                  <XAxis dataKey="time" stroke="#10b981" />
                  <YAxis stroke="#10b981" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#000', border: '1px solid #10b981' }}
                    labelStyle={{ color: '#10b981' }}
                  />
                  <Line type="monotone" dataKey="events" stroke="#10b981" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="border-2 border-green-500 p-4 bg-black/80">
              <h3 className="text-green-500 mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5" />
                SEVERITY DISTRIBUTION
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={severityData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {severityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#000', border: '1px solid #10b981' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="border-2 border-green-500 p-4 bg-black/80">
            <h3 className="text-green-500 mb-4 flex items-center gap-2">
              <Terminal className="w-5 h-5" />
              RECENT SECURITY EVENTS
            </h3>
            <div className="space-y-2 max-h-96 overflow-y-auto" ref={eventLogRef}>
              {events.slice(0, 10).map(event => (
                <div 
                  key={event.id}
                  className="border border-green-900 p-3 bg-black/60 hover:border-green-500 cursor-pointer transition-all"
                  onClick={() => setSelectedEvent(event)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-bold ${getSeverityColor(event.severity)}`}>
                        [{event.severity.toUpperCase()}]
                      </span>
                      <span className="text-green-400">{event.type}</span>
                      {event.automated && (
                        <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 border border-blue-500/30">
                          AUTO-RESOLVED
                        </span>
                      )}
                      {event.metadata?.source && (
                        <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 border border-red-500/30">
                          {event.metadata.source}
                        </span>
                      )}
                    </div>
                    <span className="text-green-600 text-sm">{new Date(event.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-green-600 text-sm mt-1">{event.description}</p>
                  <div className="flex gap-4 text-xs text-green-700 mt-2">
                    <span>SRC: {event.sourceIP}</span>
                    <span>DST: {event.destIP}</span>
                    <span>USER: {event.user}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Events Tab */}
      {activeTab === 'events' && (
        <div className="border-2 border-green-500 p-4 bg-black/80">
          <h3 className="text-green-500 mb-4 text-xl">SECURITY EVENT LOG</h3>
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {events.map(event => (
              <div 
                key={event.id}
                className="border border-green-900 p-3 bg-black/60 hover:border-green-500 cursor-pointer"
                onClick={() => setSelectedEvent(event)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-bold ${getSeverityColor(event.severity)}`}>
                      [{event.severity.toUpperCase()}]
                    </span>
                    <span className="text-green-400 font-bold">{event.id}</span>
                    <span className={`text-xs px-2 py-1 border ${getStatusColor(event.status)}`}>
                      {event.status.toUpperCase()}
                    </span>
                    {event.metadata?.source && (
                      <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 border border-red-500/30">
                        LIVE: {event.metadata.source}
                      </span>
                    )}
                  </div>
                  <span className="text-green-600 text-sm">{new Date(event.timestamp).toLocaleString()}</span>
                </div>
                <p className="text-green-400 mb-2">{event.type}: {event.description}</p>
                <div className="grid grid-cols-4 gap-2 text-xs text-green-600">
                  <span>Source IP: {event.sourceIP}</span>
                  <span>Dest IP: {event.destIP}</span>
                  <span>User: {event.user}</span>
                  <span>Automated: {event.automated ? 'YES' : 'NO'}</span>
                </div>
                {event.metadata && (
                  <div className="mt-2 pt-2 border-t border-green-900">
                    <p className="text-green-700 text-xs">
                      {event.metadata.url && `URL: ${event.metadata.url}`}
                      {event.metadata.malwareType && ` | Type: ${event.metadata.malwareType}`}
                      {event.metadata.attackType && ` | Attack: ${event.metadata.attackType}`}
                      {event.metadata.attempts && ` | Attempts: ${event.metadata.attempts}`}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Alerts Tab */}
      {activeTab === 'alerts' && (
        <div className="border-2 border-green-500 p-4 bg-black/80">
          <h3 className="text-green-500 mb-4 text-xl flex items-center gap-2">
            <AlertTriangle className="w-6 h-6" />
            SECURITY ALERTS & AUTOMATED RESPONSES
          </h3>
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {alerts.map(alert => (
              <div 
                key={alert.id}
                className={`border-2 p-4 bg-black/60 ${
                  alert.severity === 'critical' ? 'border-red-500' : 'border-yellow-500'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className={`w-5 h-5 ${alert.severity === 'critical' ? 'text-red-500' : 'text-yellow-500'}`} />
                    <span className="font-bold text-green-400">{alert.id}</span>
                    {alert.automated && (
                      <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 border border-blue-500/30">
                        AUTOMATED RESPONSE
                      </span>
                    )}
                  </div>
                  <span className="text-green-600 text-sm">{new Date(alert.timestamp).toLocaleTimeString()}</span>
                </div>
                <h4 className={`font-bold mb-2 ${alert.severity === 'critical' ? 'text-red-400' : 'text-yellow-400'}`}>
                  {alert.title}
                </h4>
                <p className="text-green-400 mb-3">{alert.description}</p>
                {alert.actions && (
                  <div className="bg-green-500/10 border border-green-500/30 p-2">
                    <p className="text-green-500 text-sm font-bold mb-1">AUTOMATED ACTIONS TAKEN:</p>
                    {alert.actions.map((action, i) => (
                      <div key={i} className="text-green-400 text-sm flex items-center gap-2">
                        <span className="text-green-500">✓</span> {action}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Threat Intelligence Tab */}
      {activeTab === 'intelligence' && (
        <div className="space-y-4">
          <div className="border-2 border-green-500 p-4 bg-black/80">
            <h3 className="text-green-500 mb-4 text-xl flex items-center gap-2">
              <Search className="w-6 h-6" />
              THREAT INTELLIGENCE LOOKUP
            </h3>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={scanInput}
                onChange={(e) => setScanInput(e.target.value)}
                placeholder="Enter IP address or file hash..."
                className="flex-1 bg-black border-2 border-green-500 text-green-400 p-2 focus:outline-none focus:border-green-300"
              />
              <button
                onClick={() => handleThreatLookup(scanInput)}
                className="px-6 py-2 border-2 border-green-500 bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-all"
              >
                SCAN
              </button>
            </div>
            <div className="text-green-600 text-sm mb-4">
              <p>Try scanning: 192.168.1.100, 10.0.0.50, 203.0.113.42, malware.exe, suspicious.dll</p>
            </div>

            {threatIntelligence && (
              <div className={`border-2 p-4 ${
                threatIntelligence.reputation === 'malicious' ? 'border-red-500 bg-red-500/10' :
                threatIntelligence.reputation === 'suspicious' ? 'border-yellow-500 bg-yellow-500/10' :
                'border-green-500 bg-green-500/10'
              }`}>
                <h4 className="text-lg font-bold mb-3 text-green-400">THREAT ANALYSIS RESULTS</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-green-600 text-sm">INDICATOR</p>
                    <p className="text-green-400 font-bold">{threatIntelligence.indicator}</p>
                  </div>
                  <div>
                    <p className="text-green-600 text-sm">REPUTATION</p>
                    <p className={`font-bold ${
                      threatIntelligence.reputation === 'malicious' ? 'text-red-400' :
                      threatIntelligence.reputation === 'suspicious' ? 'text-yellow-400' :
                      'text-green-400'
                    }`}>
                      {threatIntelligence.reputation.toUpperCase()}
                    </p>
                  </div>
                  <div>
                    <p className="text-green-600 text-sm">THREAT SCORE</p>
                    <p className="text-green-400 font-bold">{threatIntelligence.score}/100</p>
                  </div>
                  <div>
                    <p className="text-green-600 text-sm">TYPE</p>
                    <p className="text-green-400 font-bold">{threatIntelligence.type}</p>
                  </div>
                  {threatIntelligence.country && (
                    <div>
                      <p className="text-green-600 text-sm">COUNTRY</p>
                      <p className="text-green-400 font-bold">{threatIntelligence.country}</p>
                    </div>
                  )}
                  {threatIntelligence.family && (
                    <div>
                      <p className="text-green-600 text-sm">MALWARE FAMILY</p>
                      <p className="text-green-400 font-bold">{threatIntelligence.family}</p>
                    </div>
                  )}
                </div>
                <div className="mt-4 border-t border-green-500/30 pt-4">
                  <p className="text-green-600 text-sm">SOURCE</p>
                  <p className="text-green-400">{threatIntelligence.source}</p>
                  <p className="text-green-600 text-xs mt-2">
                    Note: In production, this would query VirusTotal and OTX APIs
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Known Threats Database */}
          <div className="border-2 border-green-500 p-4 bg-black/80">
            <h3 className="text-green-500 mb-4 text-xl">KNOWN THREAT DATABASE</h3>
            <div className="space-y-2">
              {Object.entries(threatDatabase).map(([indicator, data]) => (
                <div 
                  key={indicator}
                  className="border border-green-900 p-3 bg-black/60 hover:border-green-500 cursor-pointer"
                  onClick={() => handleThreatLookup(indicator)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Eye className="w-4 h-4 text-green-500" />
                      <span className="text-green-400 font-bold">{indicator}</span>
                      <span className={`text-xs px-2 py-1 border ${
                        data.reputation === 'malicious' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                        'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                      }`}>
                        {data.reputation.toUpperCase()}
                      </span>
                    </div>
                    <span className="text-green-600 text-sm">Score: {data.score}/100</span>
                  </div>
                  <p className="text-green-600 text-sm mt-1">{data.type}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-8 z-50" onClick={() => setSelectedEvent(null)}>
          <div className="border-2 border-green-500 bg-black p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-green-400">EVENT DETAILS</h3>
              <button onClick={() => setSelectedEvent(null)} className="text-green-500 hover:text-green-300">
                [CLOSE]
              </button>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-green-600 text-sm">EVENT ID</p>
                  <p className="text-green-400 font-bold">{selectedEvent.id}</p>
                </div>
                <div>
                  <p className="text-green-600 text-sm">TIMESTAMP</p>
                  <p className="text-green-400">{new Date(selectedEvent.timestamp).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-green-600 text-sm">EVENT TYPE</p>
                  <p className="text-green-400 font-bold">{selectedEvent.type}</p>
                </div>
                <div>
                  <p className="text-green-600 text-sm">SEVERITY</p>
                  <p className={`font-bold ${getSeverityColor(selectedEvent.severity)}`}>
                    {selectedEvent.severity.toUpperCase()}
                  </p>
                </div>
                <div>
                  <p className="text-green-600 text-sm">SOURCE IP</p>
                  <p className="text-green-400">{selectedEvent.sourceIP}</p>
                </div>
                <div>
                  <p className="text-green-600 text-sm">DESTINATION IP</p>
                  <p className="text-green-400">{selectedEvent.destIP}</p>
                </div>
                <div>
                  <p className="text-green-600 text-sm">USER</p>
                  <p className="text-green-400">{selectedEvent.user}</p>
                </div>
                <div>
                  <p className="text-green-600 text-sm">STATUS</p>
                  <p className={`font-bold ${
                    selectedEvent.status === 'blocked' ? 'text-red-400' :
                    selectedEvent.status === 'detected' ? 'text-yellow-400' :
                    'text-green-400'
                  }`}>
                    {selectedEvent.status.toUpperCase()}
                  </p>
                </div>
              </div>
              <div className="border-t border-green-500/30 pt-3">
                <p className="text-green-600 text-sm mb-2">DESCRIPTION</p>
                <p className="text-green-400">{selectedEvent.description}</p>
              </div>
              {selectedEvent.metadata && (
                <div className="border-t border-green-500/30 pt-3">
                  <p className="text-green-600 text-sm mb-2">ADDITIONAL METADATA</p>
                  <div className="bg-green-500/10 border border-green-500/30 p-3 rounded">
                    {Object.entries(selectedEvent.metadata).map(([key, value]) => (
                      <div key={key} className="text-green-400 text-sm mb-1">
                        <span className="text-green-600">{key}:</span> {value}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {selectedEvent.automated && (
                <div className="bg-blue-500/10 border border-blue-500/30 p-3">
                  <p className="text-blue-400 font-bold mb-2">AUTOMATED RESPONSE EXECUTED</p>
                  <p className="text-green-400 text-sm">
                    This event triggered automated SIEM workflow: Detection → Analysis → Response. 
                    {selectedEvent.metadata?.source && ` Data sourced from ${selectedEvent.metadata.source}.`}
                  </p>
                </div>
              )}
              <div className="flex gap-2 pt-3">
                <button
                  onClick={() => {
                    handleThreatLookup(selectedEvent.sourceIP);
                    setActiveTab('intelligence');
                    setSelectedEvent(null);
                  }}
                  className="px-4 py-2 border-2 border-green-500 bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-all"
                >
                  LOOKUP SOURCE IP
                </button>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="px-4 py-2 border-2 border-red-500 bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all"
                >
                  CLOSE
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer Status Bar */}
      <div className="fixed bottom-0 left-0 right-0 border-t-2 border-green-500 bg-black p-2">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <span className={dataSource === 'live' ? 'text-red-500' : 'text-green-500'}>
              ● {dataSource === 'live' ? 'LIVE THREAT FEED ACTIVE' : 'SYSTEM STATUS: OPERATIONAL'}
            </span>
            <span className="text-green-600">| Events/Min: {Math.floor(events.length / 10)}</span>
            <span className="text-green-600">| Mode: {dataSource.toUpperCase()}</span>
            <span className="text-green-600">| Memory: 2.1GB</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-green-500" />
            <span className="text-green-500">{new Date().toLocaleTimeString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SIEMDashboard;
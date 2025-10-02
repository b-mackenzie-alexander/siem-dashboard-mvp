# SIEM Security Dashboard MVP

A fully functional Security Information and Event Management (SIEM) dashboard demonstrating automated threat detection, analysis, and response workflows.

## 🚀 Features

### Core SIEM Capabilities
- **Real-time Event Monitoring** - Live security event generation and tracking
- **Automated Threat Detection** - Pattern matching against threat intelligence database
- **Automated Response Workflow** - Detection → Analysis → Response pipeline
- **Alert Management** - Severity-based alerting with automated and manual triggers
- **Threat Intelligence Integration** - IOC lookup system (ready for VirusTotal/OTX APIs)
- **Security Analytics** - Real-time charts and metrics visualization
- **Incident Response** - Automated blocking, firewall rules, and ticket creation

### Dashboard Tabs
1. **Dashboard** - Overview with metrics, charts, and recent events
2. **Events** - Complete security event log with filtering
3. **Alerts** - Automated responses and manual review alerts
4. **Intelligence** - Threat intelligence lookup and known threats database

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- VS Code (recommended)

## 🛠️ Installation

### Step 1: Clone or Create Project

```bash
# Create project directory
mkdir siem-dashboard
cd siem-dashboard
```

### Step 2: Initialize Project

```bash
# Initialize npm
npm init -y

# Install dependencies
npm install react react-dom recharts lucide-react

# Install dev dependencies
npm install -D vite @vitejs/plugin-react
```

### Step 3: Project Structure

Create the following directory structure:

```
siem-dashboard/
├── src/
│   ├── App.jsx
│   └── main.jsx
├── index.html
├── vite.config.js
├── package.json
├── .gitignore
└── README.md
```

### Step 4: Copy Files

Copy the content from the artifacts I provided into these files:
- `package.json`
- `vite.config.js`
- `index.html`
- `src/main.jsx`
- `src/App.jsx`

### Step 5: Run the Application

```bash
# Start development server
npm run dev
```

The application will automatically open in your browser at `http://localhost:3000`

## 🎮 Usage

### Running Locally

```bash
# Development mode with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Demo Features

1. **Watch Automated Responses**
   - Events generate every 3 seconds
   - Malicious IPs (192.168.1.100, 203.0.113.42) trigger automatic blocking
   - Check the "Alerts" tab to see automated actions

2. **Threat Intelligence Lookup**
   - Navigate to "Intelligence" tab
   - Try searching: `192.168.1.100`, `malware.exe`, `suspicious.dll`
   - View threat scores, reputation, and details

3. **Event Investigation**
   - Click any event in the dashboard
   - View complete event details
   - Lookup source IPs directly from the modal

4. **Real-time Analytics**
   - Monitor live event timeline chart
   - View severity distribution pie chart
   - Track metrics in the metric cards

## 🔧 Customization

### Add Real Threat Intelligence APIs

Replace the simulated `threatDatabase` with real API calls:

```javascript
// Example: VirusTotal Integration
const scanWithVirusTotal = async (ip) => {
  const response = await fetch(
    `https://www.virustotal.com/api/v3/ip_addresses/${ip}`,
    {
      headers: { 'x-apikey': 'YOUR_VT_API_KEY' }
    }
  );
  const data = await response.json();
  return data;
};

// Example: OTX AlienVault Integration
const scanWithOTX = async (ip) => {
  const response = await fetch(
    `https://otx.alienvault.com/api/v1/indicators/IPv4/${ip}/general`,
    {
      headers: { 'X-OTX-API-KEY': 'YOUR_OTX_API_KEY' }
    }
  );
  const data = await response.json();
  return data;
};
```

### Modify Event Types

Edit the `eventTypes` array in `src/App.jsx` to add your own security events:

```javascript
const eventTypes = [
  { 
    type: 'YOUR_EVENT_TYPE', 
    severity: 'critical', 
    description: 'Your event description' 
  },
  // ... more events
];
```

### Adjust Event Generation Speed

Change the interval in the `useEffect` hook:

```javascript
// Current: 3000ms (3 seconds)
// Faster demo: 1000ms (1 second)
// Slower: 5000ms (5 seconds)
const interval = setInterval(() => {
  // ...
}, 3000); // Change this value
```

## 📊 Architecture

```
┌─────────────────────────────────────────┐
│         SIEM Dashboard (React)          │
├─────────────────────────────────────────┤
│  Event Generator (Simulated)            │
│          ↓                               │
│  Automated Analysis Engine               │
│          ↓                               │
│  Threat Intelligence Lookup              │
│          ↓                               │
│  Alert Generation & Response             │
│          ↓                               │
│  Visualization & Reporting               │
└─────────────────────────────────────────┘
```

## 🎓 Presentation Tips

1. **Start with Dashboard** - Show real-time event generation
2. **Demonstrate Automation** - Point out "AUTO-RESOLVED" badges
3. **Show Threat Intel** - Search for known malicious indicators
4. **Explain Workflow** - Detection → Analysis → Response
5. **Highlight Charts** - Visual representation of security posture

## 🔐 Security Notes

- This is a demonstration/MVP project
- Simulated data is used for events and threats
- In production, use real SIEM data sources (Syslog, SNMP, API integrations)
- Implement proper authentication and authorization
- Use encrypted connections for API calls
- Follow security best practices for deployment

## 📦 Dependencies

- **React** - UI framework
- **Recharts** - Data visualization
- **Lucide React** - Icon library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling (via CDN)

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Change port in vite.config.js
server: {
  port: 3001, // Use different port
  open: true
}
```

### Module Not Found
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Tailwind Classes Not Working
- Tailwind is loaded via CDN in `index.html`
- No configuration needed
- Use only standard Tailwind utility classes

## 📝 License

MIT License - Free for educational and commercial use

## 🤝 Contributing

This is an MVP project for educational purposes. Feel free to fork and extend!

## 📧 Support

For issues or questions, please open an issue in the repository.

---

**Built for Security Operations Center Training & Demonstration**
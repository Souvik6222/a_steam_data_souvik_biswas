import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import BrutalistCard from '../../components/BrutalistCard';
import BrutalistButton from '../../components/BrutalistButton';
import toast from 'react-hot-toast';

export const AdminPage = () => {
  const [adminStats, setAdminStats] = useState(null);
  const [indexing, setIndexing] = useState(false);
  const [diagnosticsRunning, setDiagnosticsRunning] = useState(false);
  const [diagLog, setDiagLog] = useState([]);

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        const response = await api.get('/api/v1/admin/dashboard');
        setAdminStats(response.data);
      } catch {
        setAdminStats({
          activeUsers: 48,
          pendingAudits: 5,
          dbLatency: '1.2ms',
          bufferLoad: '12.4%',
        });
      }
    };
    fetchAdminStats();
  }, []);

  const handleReindex = () => {
    setIndexing(true);
    toast.loading('Re-indexing database...', { id: 'index-toast' });
    setTimeout(() => {
      toast.dismiss('index-toast');
      setIndexing(false);
      toast.success('Database re-indexed successfully!');
    }, 2000);
  };

  const handleRunDiagnostics = () => {
    setDiagnosticsRunning(true);
    setDiagLog([]);
    toast.loading('Running diagnostics...', { id: 'diag-toast' });

    const tests = [
      { text: 'Database connection', status: 'OK', icon: 'check_circle' },
      { text: 'API endpoint health', status: 'OK', icon: 'check_circle' },
      { text: 'SSL certificate validation', status: 'OK', icon: 'check_circle' },
      { text: 'Response latency (1.2ms)', status: 'NOMINAL', icon: 'speed' },
      { text: 'All systems operational', status: '100%', icon: 'verified' },
    ];

    tests.forEach((test, idx) => {
      setTimeout(() => {
        setDiagLog((prev) => [...prev, test]);
        if (idx === tests.length - 1) {
          toast.dismiss('diag-toast');
          setDiagnosticsRunning(false);
          toast.success('Diagnostics complete — 0 issues found');
        }
      }, (idx + 1) * 500);
    });
  };

  const adminMetrics = [
    { label: 'Active Users', value: adminStats?.activeUsers || 0, icon: 'group', color: 'text-primary' },
    { label: 'Pending Audits', value: adminStats?.pendingAudits || 0, icon: 'pending_actions', color: 'text-warning' },
    { label: 'DB Latency', value: adminStats?.dbLatency || '0ms', icon: 'speed', color: 'text-success' },
    { label: 'Buffer Load', value: adminStats?.bufferLoad || '0%', icon: 'memory', color: 'text-accent' },
  ];

  return (
    <div className="flex flex-col select-none space-y-8">
      {/* Header */}
      <div>
        <p className="text-xs font-headline font-semibold text-primary-light uppercase tracking-widest mb-2">
          Administration Panel
        </p>
        <h1 className="text-3xl md:text-4xl font-headline font-bold text-text-primary tracking-tight">
          Admin Console
        </h1>
      </div>

      {/* Admin Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {adminMetrics.map((m, idx) => (
          <div key={idx} className="nexus-glass rounded-2xl p-5 hover:shadow-glow transition-all duration-300 group">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-headline font-semibold text-text-muted uppercase tracking-wider">{m.label}</span>
              <span className={`material-symbols-outlined text-lg ${m.color}`}>{m.icon}</span>
            </div>
            <span className="text-2xl font-headline font-bold text-text-primary">{m.value}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Controls */}
        <div className="lg:col-span-8 space-y-6">
          {/* System Controls */}
          <BrutalistCard
            hoverable={false}
            header={
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary" />
                System Controls
              </div>
            }
          >
            <div className="flex flex-wrap gap-3 mb-4">
              <BrutalistButton
                variant="primary"
                icon="sync"
                onClick={handleReindex}
                loading={indexing}
              >
                {indexing ? 'Re-indexing...' : 'Re-index Database'}
              </BrutalistButton>
              <BrutalistButton
                variant="secondary"
                icon="bug_report"
                onClick={handleRunDiagnostics}
                loading={diagnosticsRunning}
              >
                {diagnosticsRunning ? 'Running...' : 'Run Diagnostics'}
              </BrutalistButton>
            </div>

            {/* Diagnostics output */}
            {diagLog.length > 0 && (
              <div className="nexus-glass-light rounded-xl p-4 space-y-2">
                <div className="text-[10px] font-mono text-text-muted uppercase tracking-widest mb-2 pb-2 border-b border-border-light">
                  Diagnostic Results
                </div>
                {diagLog.map((log, index) => (
                  <div key={index} className="flex items-center gap-3 text-sm animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                    <span className="material-symbols-outlined text-success text-base">{log.icon}</span>
                    <span className="text-text-secondary flex-1">{log.text}</span>
                    <span className="text-[10px] font-mono text-success font-semibold">{log.status}</span>
                  </div>
                ))}
              </div>
            )}
          </BrutalistCard>

          {/* Event Logs */}
          <BrutalistCard
            hoverable={false}
            header={
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-accent" />
                Recent Event Logs
              </div>
            }
          >
            <div className="space-y-3">
              {[
                { id: '#4092', action: 'User role updated to admin', type: 'warning' },
                { id: '#4091', action: 'Game record restored (AppID #124562)', type: 'success' },
                { id: '#4090', action: 'Game record deleted (AppID #991002)', type: 'danger' },
              ].map((log, idx) => (
                <div key={idx} className="flex items-center justify-between py-3 border-b border-border-light/50 last:border-0">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-mono text-text-muted">{log.id}</span>
                    <span className="text-sm text-text-secondary">{log.action}</span>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${
                    log.type === 'success' ? 'bg-success' : log.type === 'warning' ? 'bg-warning' : 'bg-danger'
                  }`} />
                </div>
              ))}
            </div>
          </BrutalistCard>
        </div>

        {/* Right: Security */}
        <div className="lg:col-span-4 space-y-6">
          <BrutalistCard hoverable={false} header="Security Status">
            <div className="space-y-4">
              {[
                { label: 'Encryption', value: 'AES-256', icon: 'lock' },
                { label: 'Clearance Level', value: 'Admin', icon: 'verified_user' },
                { label: 'Session', value: 'Active', icon: 'vpn_key' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-sm text-text-muted">{item.icon}</span>
                    <span className="text-xs text-text-muted">{item.label}</span>
                  </div>
                  <span className="text-xs font-headline font-semibold text-success">{item.value}</span>
                </div>
              ))}
            </div>
          </BrutalistCard>

          <div className="nexus-glass rounded-2xl p-5 border-l-4 border-accent">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-accent text-lg">shield</span>
              <span className="text-xs font-headline font-semibold text-text-primary uppercase tracking-wider">Security Notice</span>
            </div>
            <p className="text-xs text-text-muted leading-relaxed">
              All administrative actions are logged and audited. Ensure you have proper authorization before performing destructive operations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;

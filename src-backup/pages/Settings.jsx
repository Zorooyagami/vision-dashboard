import { useState } from 'react'
import { PERSONAS } from '../data/personas'
import PersonaChip from '../components/PersonaChip'
import VisionLogo from '../components/VisionLogo'



function SourcesTab() {
  const INITIAL_SOURCES = [
    { id: 'web-sdk', name: 'Web SDK', status: 'connected', events: '2.4M', lastSeen: '2 min ago' },
    { id: 'app-sdk', name: 'Mobile App SDK', status: 'connected', events: '1.1M', lastSeen: '5 min ago' },
    { id: 'shopify', name: 'Shopify Orders API', status: 'connected', events: '52K orders', lastSeen: '1 hr ago' },
    { id: 'ga4', name: 'Google Analytics 4', status: 'disconnected', events: '—', lastSeen: '—' },
  ]
  const [sources, setSources] = useState(INITIAL_SOURCES)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newSourceName, setNewSourceName] = useState('')

  const toggleSource = (id) => {
    setSources(prev => prev.map(s => s.id === id ? { ...s, status: s.status === 'connected' ? 'disconnected' : 'connected' } : s))
  }

  return (
    <div className="space-y-4">
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(15,17,23,0.5)' }}>
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 space-y-4">
            <p className="font-bold text-slate-900">Add Data Source</p>
            <input
              autoFocus
              type="text"
              placeholder="Source name (e.g. Segment, Amplitude…)"
              value={newSourceName}
              onChange={e => setNewSourceName(e.target.value)}
              className="w-full text-sm border rounded-lg px-3 py-2 outline-none focus:border-indigo-400"
              style={{ borderColor: '#E2E8F0' }}
            />
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowAddModal(false)} className="px-4 py-2 text-sm text-slate-500 hover:text-slate-700 font-semibold">Cancel</button>
              <button
                onClick={() => {
                  if (newSourceName.trim()) {
                    setSources(prev => [...prev, { id: Date.now().toString(), name: newSourceName.trim(), status: 'disconnected', events: '—', lastSeen: '—' }])
                    setNewSourceName('')
                    setShowAddModal(false)
                  }
                }}
                className="px-4 py-2 text-sm font-bold text-white rounded-lg"
                style={{ background: '#6366F1' }}
              >Add</button>
            </div>
          </div>
        </div>
      )}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">Manage the data sources Vision ingests. At least one Web or App SDK must be connected.</p>
        <button onClick={() => setShowAddModal(true)} className="flex items-center gap-1.5 px-3 py-2 text-sm font-bold text-white rounded-lg" style={{ background: '#6366F1' }}>
          <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
          Add Source
        </button>
      </div>
      <div className="space-y-2">
        {sources.map(s => {
          const connected = s.status === 'connected'
          return (
            <div key={s.id} className="bg-white rounded-2xl p-4 flex items-center gap-4" style={{ boxShadow: '0 1px 3px rgba(15,23,42,0.06)' }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: connected ? '#ECFDF5' : '#F8FAFC' }}>
                <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke={connected ? '#10B981' : '#94A3B8'} strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-900">{s.name}</p>
                <p className="text-xs text-slate-400">{s.events} events · Last seen {s.lastSeen}</p>
              </div>
              <span className="text-[11px] font-bold px-2 py-1 rounded-full" style={{ background: connected ? '#ECFDF5' : '#F1F5F9', color: connected ? '#047857' : '#475569' }}>
                {connected ? '● Connected' : '○ Disconnected'}
              </span>
              <button
                onClick={() => toggleSource(s.id)}
                className="text-xs font-semibold text-slate-400 hover:text-slate-700 transition-colors px-2 py-1 rounded border"
                style={{ borderColor: '#E2E8F0' }}
              >
                {connected ? 'Disconnect' : 'Connect'}
              </button>
            </div>
          )
        })}
      </div>
        <div className="bg-white border rounded-xl p-4" style={{ borderColor: '#E2E8F0' }}>
          <p className="text-xs font-semibold text-slate-700 mb-2">SDK Snippet (Web)</p>
          <div className="rounded-lg p-3 text-[11px] font-mono text-slate-400 overflow-x-auto" style={{ background: '#0F1117' }}>
            <span className="text-purple-400">{'<script>'}</span>{'\n'}
            {'  '}
            <span className="text-blue-400">Vision</span>
            <span className="text-slate-300">.init(</span>
            <span className="text-amber-300">"vs_live_k9x2p..."</span>
            <span className="text-slate-300">)</span>{'\n'}
            <span className="text-purple-400">{'</script>'}</span>
          </div>
        </div>
      </div>
    )
  }

function TeamTab() {
  const INITIAL_MEMBERS = [
    { name: 'Andy Phillips',    email: 'andrew.phillips@webuy.com', role: 'Admin', initials: 'AP', color: '#6366F1', isYou: true },
    { name: 'Neil Majithia',    email: 'nmajithia@webuy.com',       role: 'Admin', initials: 'NM', color: '#8B5CF6', isYou: false },
    { name: 'Jaco Eygelaar',    email: 'jeygelaar@webuy.com',       role: 'Admin', initials: 'JE', color: '#14B8A6', isYou: false },
    { name: 'Luci Fitzpatrick', email: 'lfitzpatrick@webuy.com',    role: 'Admin', initials: 'LF', color: '#F59E0B', isYou: false },
    { name: 'Farhan Samnakay',  email: 'fsamnakay@webuy.com',       role: 'Admin', initials: 'FS', color: '#EF4444', isYou: false },
    { name: 'Oli Blake',        email: 'oblake@webuy.com',          role: 'Admin', initials: 'OB', color: '#10B981', isYou: false },
  ]
  const [members, setMembers] = useState(INITIAL_MEMBERS)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('Editor')
  const [inviteSent, setInviteSent] = useState(false)
  const [copied, setCopied] = useState(false)
  const SHARE_URL = 'https://vision.app/share/vs_k9x2p...'

  const sendInvite = () => {
    if (!inviteEmail.trim()) return
    setMembers(prev => [...prev, {
      name: inviteEmail.split('@')[0],
      email: inviteEmail.trim(),
      role: inviteRole,
      initials: inviteEmail.slice(0, 2).toUpperCase(),
      color: '#94A3B8',
      isYou: false,
    }])
    setInviteEmail('')
    setInviteSent(true)
    setTimeout(() => setInviteSent(false), 2500)
  }

  const removeMember = (email) => {
    setMembers(prev => prev.filter(m => m.email !== email))
  }

  const copyLink = () => {
    navigator.clipboard.writeText(SHARE_URL).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl p-5" style={{ boxShadow: '0 1px 3px rgba(15,23,42,0.06)' }}>
        <p className="text-sm font-bold text-slate-900 mb-3">Invite Member</p>
        <div className="flex gap-2">
          <input
            type="email"
            placeholder="name@company.com"
            value={inviteEmail}
            onChange={e => setInviteEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendInvite()}
            className="flex-1 text-sm border rounded-lg px-3 py-2 outline-none focus:border-indigo-400"
            style={{ borderColor: '#E2E8F0' }}
          />
          <select value={inviteRole} onChange={e => setInviteRole(e.target.value)} className="text-sm border rounded-lg px-3 py-2 outline-none" style={{ borderColor: '#E2E8F0' }}>
            <option>Editor</option>
            <option>Viewer</option>
            <option>Admin</option>
          </select>
          <button
            onClick={sendInvite}
            className="px-4 py-2 text-sm font-bold text-white rounded-lg transition-all"
            style={{ background: inviteSent ? '#10B981' : '#6366F1' }}
          >{inviteSent ? '✓ Sent' : 'Send Invite'}</button>
        </div>
      </div>

      <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: '0 1px 3px rgba(15,23,42,0.06)' }}>
        <div className="px-5 py-3 border-b" style={{ borderColor: '#F1F5F9' }}>
          <p className="text-sm font-bold text-slate-900">{members.length} Members</p>
        </div>
        <table className="w-full">
          <thead style={{ background: '#F8FAFC' }}>
            <tr>
              <th className="text-left text-[10px] font-semibold text-slate-400 px-5 py-3 tracking-wide">MEMBER</th>
              <th className="text-left text-[10px] font-semibold text-slate-400 px-3 py-3 tracking-wide">ROLE</th>
              <th className="text-right text-[10px] font-semibold text-slate-400 px-5 py-3 tracking-wide">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {members.map((m, i) => (
              <tr key={m.email} style={{ background: i % 2 === 0 ? '#fff' : '#FAFBFF', borderTop: '1px solid #F1F5F9' }}>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: m.color }}>
                      {m.initials}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-semibold text-slate-900">{m.name}</p>
                        {m.isYou && (
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded" style={{ background: '#EEF2FF', color: '#4338CA' }}>You</span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400">{m.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-3">
                  <select defaultValue={m.role} className="text-xs font-semibold border rounded-lg px-2 py-1 outline-none" style={{ borderColor: '#E2E8F0', color: '#475569' }}>
                    <option>Admin</option>
                    <option>Editor</option>
                    <option>Viewer</option>
                  </select>
                </td>
                <td className="px-5 py-3 text-right">
                  <button onClick={() => removeMember(m.email)} className="text-xs text-red-400 hover:text-red-600 font-semibold transition-colors">Remove</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-white rounded-2xl p-5 space-y-3" style={{ boxShadow: '0 1px 3px rgba(15,23,42,0.06)' }}>
        <p className="text-sm font-bold text-slate-900">Shared Dashboards</p>
        <p className="text-xs text-slate-400">Anyone with a shared link can view (not edit) the dashboard snapshot.</p>
        <div className="flex gap-2">
          <input readOnly value={SHARE_URL} className="flex-1 text-xs border rounded-lg px-3 py-2 bg-slate-50" style={{ borderColor: '#E2E8F0' }} />
          <button
            onClick={copyLink}
            className="px-3 py-2 text-xs font-semibold border rounded-lg hover:bg-slate-50 transition-colors"
            style={{ borderColor: '#E2E8F0', color: copied ? '#047857' : '#475569' }}
          >{copied ? '✓ Copied' : 'Copy'}</button>
        </div>
      </div>
    </div>
  )
}

function IdentityTab() {
  const [mergeRule, setMergeRule] = useState('deterministic')
  return (
    <div className="space-y-5">
      <p className="text-sm text-slate-500">Control how Vision stitches anonymous sessions to identified users across Web and App.</p>
      <div className="bg-white rounded-2xl p-5 space-y-4" style={{ boxShadow: '0 1px 3px rgba(15,23,42,0.06)' }}>
        <p className="text-sm font-bold text-slate-900">Merge Strategy</p>
        {(['deterministic', 'probabilistic']).map(rule => (
          <label key={rule} className="flex items-start gap-3 cursor-pointer p-3 rounded-xl border transition-all" style={{ borderColor: mergeRule === rule ? '#6366F1' : '#E2E8F0', background: mergeRule === rule ? '#FAFBFF' : '#fff' }}>
            <input type="radio" className="mt-0.5 accent-indigo-500" checked={mergeRule === rule} onChange={() => setMergeRule(rule)} />
            <div>
              <p className="text-sm font-semibold text-slate-800 capitalize">{rule}</p>
              <p className="text-xs text-slate-500 mt-0.5">
                {rule === 'deterministic'
                  ? 'Match users by shared login ID or email. Exact matches only — no false positives.'
                  : 'Match users by device fingerprint + behavioral signals. Higher match rate, small error margin.'}
              </p>
            </div>
          </label>
        ))}
      </div>
      <div className="bg-white rounded-2xl p-5 space-y-3" style={{ boxShadow: '0 1px 3px rgba(15,23,42,0.06)' }}>
        <p className="text-sm font-bold text-slate-900">Identity Keys</p>
        <p className="text-xs text-slate-500">Fields used to identify a returning user. Order determines priority.</p>
        {['User ID (primary)', 'Email address', 'Device fingerprint'].map((key, i) => (
          <div key={key} className="flex items-center gap-3 p-3 rounded-lg border" style={{ borderColor: '#E2E8F0' }}>
            <span className="w-5 h-5 rounded text-[11px] font-bold flex items-center justify-center" style={{ background: '#EEF2FF', color: '#4338CA' }}>{i + 1}</span>
            <span className="text-sm text-slate-700 flex-1">{key}</span>
            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="#64748B" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-2xl p-4 flex items-center justify-between" style={{ boxShadow: '0 1px 3px rgba(15,23,42,0.06)' }}>
        <div>
          <p className="text-sm font-semibold text-slate-900">Cross-device identity graph</p>
          <p className="text-xs text-slate-400 mt-0.5">Enables the Cross-Device Journeys view in Conversion</p>
        </div>
        <div className="w-10 h-5 rounded-full flex items-center px-0.5" style={{ background: '#6366F1' }}>
          <span className="w-4 h-4 rounded-full bg-white shadow block ml-auto" />
        </div>
      </div>
    </div>
  )
}

function ThresholdsTab() {
  const [loyalOrders, setLoyalOrders] = useState(2)
  const [activeMaxOrders, setActiveMaxOrders] = useState(2)
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="space-y-5">
      <p className="text-sm text-slate-500">
        Adjust the numeric thresholds that drive auto-classification. Changes apply to new sessions immediately; historical re-classification runs within 24 hours.
      </p>
      <div className="rounded-xl border p-4 text-xs flex items-start gap-2" style={{ background: '#FFFBEB', borderColor: '#FDE68A' }}>
        <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="#F59E0B" strokeWidth={2} className="mt-0.5 shrink-0"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        <p className="text-amber-800">Priority order: <strong>Collector → Loyal Users → Active Users → First Time Users → Guest Users</strong>. A user matching multiple rules takes the highest-priority Persona.</p>
      </div>
      <div className="space-y-3">
        {PERSONAS.map(p => (
          <div key={p.id} className="bg-white rounded-2xl p-5" style={{ boxShadow: '0 1px 3px rgba(15,23,42,0.06)' }}>
            <div className="flex items-center gap-2 mb-3">
              <PersonaChip id={p.id} size="md" />
              <span className="text-xs text-slate-400 ml-auto">{p.count.toLocaleString()} users currently classified</span>
            </div>
            <div className="rounded-lg px-3 py-2 text-xs font-mono" style={{ background: '#F8FAFC', color: '#475569' }}>
              {p.id === 'loyal' && (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-slate-500">Logged in AND orders_completed ≥</span>
                  <input type="number" value={loyalOrders} min={1} max={10} onChange={e => setLoyalOrders(Number(e.target.value))}
                    className="w-12 text-center rounded border px-1 py-0.5 font-bold" style={{ borderColor: '#6366F1', color: '#6366F1' }} />
                </div>
              )}
              {p.id === 'collector' && <span>Logged in AND purchased_rare_item = true</span>}
              {p.id === 'firsttime' && <span>Logged in AND session_count = 1</span>}
              {p.id === 'active' && (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-slate-500">Logged in AND orders_completed ≤</span>
                  <input type="number" value={activeMaxOrders} min={1} max={10} onChange={e => setActiveMaxOrders(Number(e.target.value))}
                    className="w-12 text-center rounded border px-1 py-0.5 font-bold" style={{ borderColor: '#F59E0B', color: '#B45309' }} />
                </div>
              )}
              {p.id === 'guest' && <span>logged_in = false</span>}
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-end">
        <button onClick={handleSave} className="px-5 py-2 text-sm font-bold text-white rounded-lg transition-all" style={{ background: saved ? '#10B981' : '#6366F1' }}>
          {saved ? '✓ Saved' : 'Save Thresholds'}
        </button>
      </div>
    </div>
  )
}

function TabContent({ tab }) {
  if (tab === 'sources') return <SourcesTab />
  if (tab === 'identity') return <IdentityTab />
  if (tab === 'thresholds') return <ThresholdsTab />
  if (tab === 'team') return <TeamTab />
  return null
}

const TABS = [
  { id: 'sources', label: 'Data Sources', icon: '⚡' },
  { id: 'identity', label: 'Identity Resolution', icon: '🔗' },
  { id: 'thresholds', label: 'Persona Thresholds', icon: '⚙' },
  { id: 'team', label: 'Team & Sharing', icon: '👥' },
]

export default function SettingsPage({ initialTab = 'thresholds' }) {
  const [activeTab, setActiveTab] = useState(initialTab)

  return (
    <div className="p-6 space-y-4">
      <div className="bg-white rounded-2xl p-5 flex items-center gap-5" style={{ boxShadow: '0 1px 3px rgba(15,23,42,0.06)' }}>
        <VisionLogo size={40} theme="color" showWordmark />
        <div className="w-px self-stretch" style={{ background: '#E2E8F0' }} />
        <div>
          <p className="text-sm font-bold text-slate-900">Vision Analytics</p>
          <p className="text-xs text-slate-400">v2.1.0-beta · Workspace: Acme Co</p>
        </div>
        <div className="ml-auto text-right">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Plan</p>
          <p className="text-sm font-bold text-indigo-600">Pro</p>
        </div>
      </div>

      <div>
        <h2 className="text-base font-bold text-slate-900">Settings</h2>
        <p className="text-xs text-slate-400 mt-0.5">Configure Vision's data pipeline, identity rules, and team access</p>
      </div>

      <div className="flex gap-1 border-b" style={{ borderColor: '#E2E8F0' }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all -mb-px"
            style={{
              borderBottomColor: activeTab === tab.id ? '#6366F1' : 'transparent',
              color: activeTab === tab.id ? '#6366F1' : '#64748B',
            }}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      <TabContent tab={activeTab} />
    </div>
  )
}

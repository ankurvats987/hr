import { useEffect, useState } from 'react'
import './App.css'

const initialState = {
  persona: 'employee',
  leaveRequests: [
    { id: 1, employee: 'Isha Verma', type: 'Annual leave', dates: '18 Mar 2026 - 20 Mar 2026', days: 3, status: 'Pending' },
  ],
  checkedIn: false,
  onboarding: [
    { label: 'Sign your offer letter', done: false, required: true },
    { label: 'Upload identity document', done: false, required: true },
    { label: 'Meet your manager', done: true, required: false },
    { label: 'Read the team handbook', done: false, required: false },
  ],
  applicants: 3,
}

const people = [
  { name: 'Isha Verma', role: 'Software Engineer', team: 'Engineering', location: 'Bengaluru', initials: 'IV', color: 'lavender' },
  { name: 'Rohan Kapoor', role: 'Engineering Manager', team: 'Engineering', location: 'Hyderabad', initials: 'RK', color: 'peach' },
  { name: 'Meera Iyer', role: 'Head of People', team: 'People', location: 'Remote', initials: 'MI', color: 'mint' },
  { name: 'Arjun Nair', role: 'Product Designer', team: 'Design', location: 'Bengaluru', initials: 'AN', color: 'blue' },
  { name: 'Tara Menon', role: 'QA Engineer', team: 'Engineering', location: 'Hyderabad', initials: 'TM', color: 'yellow' },
]

const navGroups = [
  { label: 'Work', items: [['home', 'Home'], ['event_available', 'Time off'], ['schedule', 'Attendance'], ['checklist', 'My tasks']] },
  { label: 'People', items: [['group', 'People'], ['account_tree', 'Org chart'], ['work', 'Hiring'], ['rate_review', 'Reviews']] },
  { label: 'Company', items: [['description', 'Documents'], ['campaign', 'Announcements'], ['support_agent', 'Help desk']] },
  { label: 'Admin', items: [['bar_chart', 'Reports'], ['payments', 'Payroll inputs'], ['bolt', 'Automations'], ['history', 'Audit log']] },
]

function Icon({ name, size = 22 }) {
  return <span className="material-symbols-outlined" style={{ fontSize: size }} aria-hidden="true">{name}</span>
}

function Avatar({ initials, color = 'lavender', small = false }) {
  return <span className={`avatar ${color} ${small ? 'avatar-small' : ''}`}>{initials}</span>
}

function Status({ children, tone = 'warning' }) {
  return <span className={`status ${tone}`}>{children}</span>
}

function App() {
  const [data, setData] = useState(() => {
    try { return { ...initialState, ...JSON.parse(localStorage.getItem('hr-demo-state') || '{}') } } catch { return initialState }
  })
  const [page, setPage] = useState('Home')
  const [showWelcome, setShowWelcome] = useState(() => !localStorage.getItem('hr-demo-welcomed'))
  const [showGuide, setShowGuide] = useState(false)
  const [showRequest, setShowRequest] = useState(false)
  const [showPersona, setShowPersona] = useState(false)
  const [toast, setToast] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => localStorage.setItem('hr-demo-state', JSON.stringify(data)), [data])
  useEffect(() => {
    if (!toast) return undefined
    const timer = setTimeout(() => setToast(''), 3500)
    return () => clearTimeout(timer)
  }, [toast])

  const current = data.persona === 'employee' ? people[0] : data.persona === 'manager' ? people[1] : people[2]
  const personaLabel = data.persona === 'employee' ? 'Employee' : data.persona === 'manager' ? 'Manager' : 'HR Admin'
  const go = (next) => { setPage(next); setSearch('') }
  const switchPersona = (next) => {
    const person = next === 'employee' ? people[0] : next === 'manager' ? people[1] : people[2]
    setData((old) => ({ ...old, persona: next }))
    setShowPersona(false)
    setToast(`Now viewing as ${person.name} (${next === 'employee' ? 'Employee' : next === 'manager' ? 'Manager' : 'HR Admin'})`)
  }
  const reset = () => { setData(initialState); setToast('Demo data reset'); setPage('Home') }

  if (page === 'Careers') return <Careers onBack={() => go('Home')} onApply={() => setToast('Application submitted. Return to the HR app to continue the lesson.')} />

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><div className="brand-mark">K</div><div><strong>HR Demo</strong><small>Kestrel Works</small></div></div>
        <div className="workspace-label">Workspace</div>
        <nav>
          {navGroups.map((group) => <div className="nav-group" key={group.label}>
            <div className="nav-label">{group.label}</div>
            {group.items.map(([icon, label]) => <button key={label} className={`nav-item ${page === label ? 'active' : ''}`} onClick={() => go(label)}><Icon name={icon} size={21} /><span>{label}</span>{label === 'Requests' && <b>2</b>}</button>)}
          </div>)}
        </nav>
        <div className="sidebar-bottom">
          <button className={`nav-item ${page === 'Guide' ? 'active' : ''}`} onClick={() => go('Guide')}><Icon name="help" size={21} /><span>Guide</span></button>
          <button className="nav-item" onClick={() => go('Demo controls')}><Icon name="science" size={21} /><span>Demo controls</span></button>
          <div className="sidebar-user"><Avatar initials={current.initials} color={current.color} small /><div><strong>{current.name}</strong><small>{personaLabel}</small></div><Icon name="more_vert" size={20} /></div>
        </div>
      </aside>
      <main className="main">
        <header className="topbar">
          <button className="mobile-menu icon-button" aria-label="Open menu"><Icon name="menu" /></button>
          <div className="breadcrumbs"><span>Workspace</span><Icon name="chevron_right" size={18} /><strong>{page}</strong></div>
          <div className="top-actions">
            <label className="search"><Icon name="search" size={20} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search anything" /></label>
            <button className="icon-button" aria-label="Notifications"><Icon name="notifications" /></button>
            <button className="icon-button" aria-label="Help" onClick={() => setShowGuide(true)}><Icon name="help" /></button>
            <button className="account-button" onClick={() => setShowPersona((old) => !old)}><Avatar initials={current.initials} color={current.color} small /><Icon name="expand_more" size={18} /></button>
            {showPersona && <div className="persona-menu"><div className="menu-heading">View as</div>{[['employee', 'Isha Verma', 'Employee'], ['manager', 'Rohan Kapoor', 'Manager'], ['admin', 'Meera Iyer', 'HR Admin']].map(([key, name, role]) => <button key={key} onClick={() => switchPersona(key)}><Avatar initials={name.split(' ').map((part) => part[0]).join('')} small /><span><strong>{name}</strong><small>{role}</small></span>{data.persona === key && <Icon name="check" size={19} />}</button>)}</div>}
          </div>
        </header>
        <div className="demo-banner"><Icon name="info" size={20} /><span>Demo with sample data. Everything is stored in this browser only.</span><button onClick={() => go('Demo controls')}>Reset demo data</button><button className="banner-close" aria-label="Dismiss"><Icon name="close" size={18} /></button></div>
        <div className="content"><PageContent page={page} data={data} current={current} persona={data.persona} go={go} setData={setData} setToast={setToast} setShowRequest={setShowRequest} reset={reset} /></div>
      </main>
      <nav className="bottom-nav">{[['home', 'Home'], ['group', 'People'], ['event_available', 'Time off'], ['inbox', 'Requests'], ['more_horiz', 'More']].map(([icon, label]) => <button key={label} className={page === label ? 'active' : ''} onClick={() => go(label)}><Icon name={icon} size={22} /><span>{label}</span></button>)}</nav>
      {showRequest && <LeaveDialog onClose={() => setShowRequest(false)} onSave={() => { setData((old) => ({ ...old, leaveRequests: [...old.leaveRequests, { id: Date.now(), employee: current.name, type: 'Annual leave', dates: '25 Mar 2026 - 26 Mar 2026', days: 2, status: 'Pending' }] })); setShowRequest(false); setToast('Leave request submitted') }} />}
      {showWelcome && <Welcome onClose={() => { localStorage.setItem('hr-demo-welcomed', 'true'); setShowWelcome(false) }} onTour={() => { localStorage.setItem('hr-demo-welcomed', 'true'); setShowWelcome(false); setToast('Tour started. Follow the highlighted guidance on each page.') }} />}
      {showGuide && <Guide onClose={() => setShowGuide(false)} />}
      {toast && <div className="snackbar"><Icon name="check_circle" size={20} />{toast}<button onClick={() => setToast('')}><Icon name="close" size={18} /></button></div>}
    </div>
  )
}

function PageContent({ page, data, current, persona, go, setData, setToast, setShowRequest, reset }) {
  if (page === 'Home') return <Dashboard data={data} current={current} persona={persona} go={go} setShowRequest={setShowRequest} setToast={setToast} />
  if (page === 'People') return <People />
  if (page === 'Time off') return <TimeOff data={data} setShowRequest={setShowRequest} />
  if (page === 'Attendance') return <Attendance data={data} setData={setData} setToast={setToast} />
  if (page === 'My tasks') return <Tasks data={data} setData={setData} setToast={setToast} />
  if (page === 'Requests') return <Requests data={data} persona={persona} setData={setData} setToast={setToast} />
  if (page === 'Hiring') return <Hiring data={data} go={go} />
  if (page === 'Onboarding') return <Onboarding data={data} setData={setData} setToast={setToast} />
  if (page === 'Guide') return <GuidePage />
  if (page === 'Demo controls') return <DemoControls reset={reset} />
  return <Placeholder title={page} />
}

function PageHeader({ eyebrow, title, description, action }) {
  return <div className="page-header"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1>{description && <p>{description}</p>}</div>{action}</div>
}

function Dashboard({ data, current, persona, go, setShowRequest, setToast }) {
  const pending = data.leaveRequests.filter((request) => request.status === 'Pending').length
  return <><PageHeader eyebrow="Sunday, 15 March 2026" title={`Good morning, ${current.name.split(' ')[0]}`} description="Here is what needs your attention today." action={<button className="button filled" onClick={() => setShowRequest(true)}><Icon name="add" size={19} />Request leave</button>} />
    <div className="welcome-strip"><div className="welcome-icon"><Icon name="lightbulb" /></div><div><strong>Start with the two minute tour</strong><p>Learn how one employee record connects leave, attendance, hiring and more.</p></div><button className="button tonal" onClick={() => setToast('Tour started. Open Guide anytime for help.')}>Start tour</button><button className="icon-button"><Icon name="close" size={19} /></button></div>
    <section className="stats-grid"><Stat icon="event_available" label="Annual leave balance" value="15 days" note="of 20 days this year" tone="purple" /><Stat icon="schedule" label="This month attendance" value="96%" note="22 of 23 working days" tone="blue" /><Stat icon="checklist" label="Open tasks" value={persona === 'admin' ? '8' : '3'} note="2 due this week" tone="orange" /><Stat icon="inbox" label="Pending approvals" value={persona === 'manager' ? pending + 1 : '2'} note="Needs your attention" tone="green" /></section>
    <div className="dashboard-grid"><section className="panel activity"><div className="panel-header"><div><h2>Recent activity</h2><p>Your latest updates across Kestrel Works</p></div><button className="text-button" onClick={() => go('Audit log')}>View all</button></div><Activity icon="event_available" title="Leave request submitted" detail="Annual leave, 18 Mar to 20 Mar" time="Today, 09:32" color="purple" /><Activity icon="checklist" title="Onboarding task completed" detail="Meet your manager" time="Yesterday, 16:10" color="green" /><Activity icon="campaign" title="New announcement" detail="Quarterly town hall on 28 Mar" time="12 Mar 2026" color="orange" /></section>
      <section className="panel upcoming"><div className="panel-header"><div><h2>Upcoming</h2><p>Important dates and reminders</p></div><button className="icon-button"><Icon name="more_vert" /></button></div><div className="calendar-event"><div className="date-box"><strong>18</strong><small>MAR</small></div><div><strong>Annual leave</strong><p>Wednesday to Friday</p></div><Status>Pending</Status></div><div className="calendar-event"><div className="date-box blue-date"><strong>28</strong><small>MAR</small></div><div><strong>Quarterly town hall</strong><p>16:00, Main meeting room</p></div><Status tone="info">Company</Status></div></section></div>
    <section className="panel quick"><div className="panel-header"><div><h2>Quick actions</h2><p>Common tasks for your role</p></div></div><div className="quick-actions"><QuickAction icon="event_available" label="Request leave" onClick={() => setShowRequest(true)} /><QuickAction icon="fingerprint" label={data.checkedIn ? 'Check out' : 'Check in'} onClick={() => setToast(data.checkedIn ? 'Checked out at 17:42' : 'Checked in at 09:18')} /><QuickAction icon="description" label="View documents" onClick={() => go('Documents')} /><QuickAction icon="support_agent" label="Ask for help" onClick={() => go('Help desk')} /></div></section>
  </>
}

function Stat({ icon, label, value, note, tone }) { return <div className="stat-card"><div className={`stat-icon ${tone}`}><Icon name={icon} /></div><div className="stat-copy"><span>{label}</span><strong>{value}</strong><small>{note}</small></div><Icon name="more_vert" size={20} /></div> }
function Activity({ icon, title, detail, time, color }) { return <div className="activity-row"><div className={`activity-icon ${color}`}><Icon name={icon} size={20} /></div><div><strong>{title}</strong><p>{detail}</p></div><time>{time}</time></div> }
function QuickAction({ icon, label, onClick }) { return <button className="quick-action" onClick={onClick}><span><Icon name={icon} /></span><strong>{label}</strong><Icon name="chevron_right" size={19} /></button> }

function TimeOff({ data, setShowRequest }) {
  return <><PageHeader eyebrow="My time off" title="Time off" description="Plan leave, see balances and keep your team informed." action={<button className="button filled" onClick={() => setShowRequest(true)}><Icon name="add" size={19} />Request leave</button>} /><div className="tabs"><button className="selected">Overview</button><button>Requests</button><button>Calendar</button></div><div className="balance-grid"><div className="balance-card"><div className="balance-title"><span className="balance-dot purple-dot" />Annual leave <button className="icon-button"><Icon name="info" size={18} /></button></div><strong>15 <small>days remaining</small></strong><div className="progress"><span style={{ width: '25%' }} /></div><p>5 days used of 20 days</p></div><div className="balance-card"><div className="balance-title"><span className="balance-dot green-dot" />Sick leave <button className="icon-button"><Icon name="info" size={18} /></button></div><strong>8 <small>days remaining</small></strong><div className="progress green-progress"><span style={{ width: '20%' }} /></div><p>2 days used of 10 days</p></div><div className="balance-card"><div className="balance-title"><span className="balance-dot orange-dot" />Personal leave</div><strong>2 <small>days remaining</small></strong><div className="progress orange-progress"><span style={{ width: '33%' }} /></div><p>1 day used of 3 days</p></div></div><section className="panel table-panel"><div className="panel-header"><div><h2>Leave requests</h2><p>Track the status of your submitted requests</p></div><button className="button outlined"><Icon name="filter_list" size={18} />Filter</button></div><table><thead><tr><th>Leave type</th><th>Dates</th><th>Days</th><th>Status</th><th /></tr></thead><tbody>{data.leaveRequests.map((item) => <tr key={item.id}><td><strong>{item.type}</strong><small>{item.employee}</small></td><td>{item.dates}</td><td>{item.days}</td><td><Status tone={item.status === 'Approved' ? 'success' : item.status === 'Rejected' ? 'error' : 'warning'}>{item.status}</Status></td><td><button className="icon-button"><Icon name="more_vert" /></button></td></tr>)}</tbody></table></section></>
}

function People() { return <><PageHeader eyebrow="People directory" title="People" description="48 people across Kestrel Works." action={<button className="button filled"><Icon name="add" size={19} />Add person</button>} /><div className="toolbar"><label className="search wide"><Icon name="search" size={20} /><input placeholder="Search people" /></label><button className="button outlined"><Icon name="filter_list" size={18} />Filter</button><button className="button outlined"><Icon name="download" size={18} />Export</button></div><section className="panel table-panel"><table><thead><tr><th>Person</th><th>Role</th><th>Team</th><th>Location</th><th>Status</th><th /></tr></thead><tbody>{people.map((person) => <tr key={person.name}><td><div className="person-cell"><Avatar initials={person.initials} color={person.color} small /><strong>{person.name}</strong></div></td><td>{person.role}</td><td>{person.team}</td><td>{person.location}</td><td><Status tone="success">Active</Status></td><td><button className="icon-button"><Icon name="more_vert" /></button></td></tr>)}</tbody></table></section></> }

function Attendance({ data, setData, setToast }) { return <><PageHeader eyebrow="Work hours" title="Attendance" description="Check in, review your working hours and fix missing records." action={<button className="button filled" onClick={() => { setData((old) => ({ ...old, checkedIn: !old.checkedIn })); setToast(data.checkedIn ? 'Checked out at 17:42' : 'Checked in at 09:18') }}><Icon name="fingerprint" size={19} />{data.checkedIn ? 'Check out' : 'Check in'}</button>} /><div className="attendance-hero"><div className="clock"><span className="live-dot" />{data.checkedIn ? '09:18' : 'Not checked in'}<small>Sunday, 15 March 2026</small></div><div className="attendance-summary"><div><span>Today</span><strong>{data.checkedIn ? '8h 24m' : '0h 00m'}</strong></div><div><span>This week</span><strong>36h 40m</strong></div><div><span>Expected</span><strong>40h 00m</strong></div></div></div><section className="panel table-panel"><div className="panel-header"><div><h2>March attendance</h2><p>Working hours are shown in Asia/Kolkata time.</p></div><button className="button outlined"><Icon name="calendar_month" size={18} />Change month</button></div><table><thead><tr><th>Date</th><th>Clock in</th><th>Clock out</th><th>Total</th><th>Status</th></tr></thead><tbody>{[['Fri, 13 Mar', '09:12', '17:48', '8h 36m', 'Present'], ['Thu, 12 Mar', '09:05', '—', '5h 10m', 'Missing check-out'], ['Wed, 11 Mar', '09:20', '17:36', '8h 16m', 'Present']].map((row) => <tr key={row[0]}>{row.map((cell, index) => <td key={cell}>{index === 4 ? <Status tone={cell === 'Present' ? 'success' : 'warning'}>{cell}</Status> : cell}</td>)}</tr>)}</tbody></table></section></> }

function Requests({ data, persona, setData, setToast }) { const pending = data.leaveRequests.filter((r) => r.status === 'Pending'); return <><PageHeader eyebrow="Approvals" title="Requests" description="Review requests that need your decision." /><div className="tabs"><button className="selected">Pending <b className="tab-count">{pending.length}</b></button><button>Approved</button><button>All requests</button></div><section className="panel request-list">{pending.length ? pending.map((item) => <div className="request-row" key={item.id}><Avatar initials="IV" color="lavender" /><div className="request-info"><strong>{item.employee}</strong><p>{item.type}, {item.dates} · {item.days} days</p><small>Submitted today at 09:32</small></div>{persona === 'manager' || persona === 'admin' ? <div className="row-actions"><button className="button outlined" onClick={() => { setData((old) => ({ ...old, leaveRequests: old.leaveRequests.map((r) => r.id === item.id ? { ...r, status: 'Rejected' } : r) })); setToast('Request rejected') }}>Reject</button><button className="button filled" onClick={() => { setData((old) => ({ ...old, leaveRequests: old.leaveRequests.map((r) => r.id === item.id ? { ...r, status: 'Approved' } : r) })); setToast('Leave request approved') }}>Approve</button></div> : <Status>Waiting for approval</Status>}</div>) : <Empty icon="check_circle" title="No pending requests" text="All requests have been reviewed." />}</section></> }

function Tasks({ data, setData, setToast }) { return <><PageHeader eyebrow="Your work" title="My tasks" description="A clear list of things to complete." /><section className="panel task-panel"><div className="panel-header"><div><h2>Onboarding tasks</h2><p>Get set up for your first week at Kestrel Works.</p></div><Status tone="info">2 of 4 done</Status></div>{data.onboarding.map((task, index) => <label className={`task-row ${task.done ? 'done' : ''}`} key={task.label}><input type="checkbox" checked={task.done} onChange={() => { setData((old) => ({ ...old, onboarding: old.onboarding.map((t, i) => i === index ? { ...t, done: !t.done } : t) })); setToast(task.done ? 'Task reopened' : 'Task completed') }} /><span><strong>{task.label}</strong>{task.required && <small>Required</small>}</span><Icon name={task.done ? 'check_circle' : 'radio_button_unchecked'} size={22} /></label>)}</section></> }

function Hiring({ data, go }) { return <><PageHeader eyebrow="Talent" title="Hiring" description="Move candidates from application to onboarding." action={<button className="button filled"><Icon name="add" size={19} />Create job</button>} /><div className="job-card"><div className="job-icon"><Icon name="code" /></div><div className="job-main"><div className="job-title"><h2>Senior frontend engineer</h2><Status tone="success">Published</Status></div><p>Engineering · Bengaluru or Remote</p><div className="job-meta"><span><Icon name="group" size={17} />{data.applicants} applicants</span><span><Icon name="calendar_month" size={17} />Posted 4 days ago</span></div></div><button className="button outlined" onClick={() => go('Careers')}>View careers page</button><button className="icon-button"><Icon name="more_vert" /></button></div><section className="panel funnel"><div className="panel-header"><div><h2>Hiring pipeline</h2><p>Senior frontend engineer</p></div><button className="button outlined"><Icon name="filter_list" size={18} />Filter</button></div><div className="pipeline">{[['Applied', '3', 'blue'], ['Interview 1', '1', 'purple'], ['Offer', '0', 'orange'], ['Hired', '0', 'green']].map(([label, count, color]) => <div className={`pipeline-column ${color}`} key={label}><div className="pipeline-heading"><strong>{label}</strong><span>{count}</span></div>{label === 'Applied' && <div className="candidate-card"><Avatar initials="NS" color="peach" small /><div><strong>Nisha Shah</strong><small>Applied yesterday</small></div><Icon name="more_vert" size={18} /></div>}{label === 'Interview 1' && <div className="candidate-card"><Avatar initials="VK" color="blue" small /><div><strong>Vikram Kumar</strong><small>Interview tomorrow</small></div><Icon name="more_vert" size={18} /></div>}</div>)}</div></section></> }

function Onboarding({ data, setData, setToast }) { const done = data.onboarding.filter((t) => t.done).length; return <><PageHeader eyebrow="People experience" title="Onboarding" description="Help new joiners feel ready from day one." action={<button className="button filled"><Icon name="add" size={19} />Add checklist</button>} /><div className="onboarding-card"><Avatar initials="IV" color="lavender" /><div className="onboarding-person"><h2>Isha Verma</h2><p>Software Engineer · Started 02 Mar 2026</p><div className="progress"><span style={{ width: `${done / data.onboarding.length * 100}%` }} /></div><small>{done} of {data.onboarding.length} tasks completed</small></div><Status tone={done === data.onboarding.length ? 'success' : 'info'}>{done === data.onboarding.length ? 'Complete' : 'In progress'}</Status></div><section className="panel task-panel"><div className="panel-header"><div><h2>New joiner checklist</h2><p>Required tasks keep onboarding consistent.</p></div></div>{data.onboarding.map((task, index) => <label className={`task-row ${task.done ? 'done' : ''}`} key={task.label}><input type="checkbox" checked={task.done} onChange={() => { setData((old) => ({ ...old, onboarding: old.onboarding.map((t, i) => i === index ? { ...t, done: !t.done } : t) })); setToast(task.done ? 'Task reopened' : 'Onboarding task completed') }} /><span><strong>{task.label}</strong><small>{task.required ? 'Required for all new joiners' : 'Recommended'}</small></span><Icon name={task.done ? 'check_circle' : 'radio_button_unchecked'} size={22} /></label>)}</section></> }

function GuidePage() { return <><PageHeader eyebrow="Learn the demo" title="Guide" description="Short lessons explain how the pieces connect." /><div className="lesson-grid">{[['Request leave and get it approved', '4 min', 'Employee then Manager', 'event_available'], ['Check in and fix a missing check-out', '4 min', 'Employee then Manager', 'schedule'], ['Hire someone', '7 min', 'HR Admin', 'work'], ['Onboard a new joiner', '3 min', 'Employee', 'checklist']].map(([title, time, persona, icon], index) => <div className="lesson-card" key={title}><div className="lesson-icon"><Icon name={icon} /></div><span className="lesson-number">Lesson {index + 1}</span><h2>{title}</h2><p>Follow a practical workflow with sample data.</p><div className="lesson-footer"><span><Icon name="schedule" size={16} />{time}</span><span><Icon name="person" size={16} />{persona}</span></div><button className="button tonal">Start lesson <Icon name="arrow_forward" size={18} /></button></div>)}</div></> }
function DemoControls({ reset }) { return <><PageHeader eyebrow="Demo environment" title="Demo controls" description="Reset the sample workspace or learn how this demo works." /><section className="panel settings-panel"><div className="setting-row"><div><h2>Reset demo data</h2><p>Restore the original sample people, requests and onboarding checklist.</p></div><button className="button destructive" onClick={reset}>Reset data</button></div><div className="setting-row"><div><h2>About this demo</h2><p>This is a browser-only prototype. It does not collect personal data or send information to a server.</p></div><Status tone="info">Local only</Status></div></section></> }
function Placeholder({ title }) { return <><PageHeader eyebrow="Kestrel Works" title={title} description="This workspace keeps your people operations in one place." /><Empty icon="description" title={`No ${title.toLowerCase()} to show`} text="This sample area is ready for your next action." /></> }
function Empty({ icon, title, text }) { return <div className="empty"><Icon name={icon} size={42} /><h2>{title}</h2><p>{text}</p></div> }

function LeaveDialog({ onClose, onSave }) { return <div className="scrim"><div className="dialog"><div className="dialog-header"><div><span className="eyebrow">New request</span><h2>Request leave</h2></div><button className="icon-button" onClick={onClose}><Icon name="close" /></button></div><p className="dialog-intro">Tell your manager when you will be away. Annual leave needs 3 days notice.</p><label className="field"><span>Leave type</span><select><option>Annual leave</option><option>Sick leave</option><option>Personal leave</option></select></label><div className="field-row"><label className="field"><span>Start date</span><input type="date" defaultValue="2026-03-25" /></label><label className="field"><span>End date</span><input type="date" defaultValue="2026-03-26" /></label></div><label className="field"><span>Reason <em>Optional</em></span><textarea placeholder="Add a note for your manager" rows="3" /></label><div className="dialog-actions"><button className="button text" onClick={onClose}>Cancel</button><button className="button filled" onClick={onSave}>Submit request</button></div></div></div> }
function Welcome({ onClose, onTour }) { return <div className="scrim"><div className="welcome-dialog"><div className="welcome-mark"><Icon name="groups" size={30} /></div><span className="eyebrow">Kestrel Works</span><h2>Welcome to the HR demo</h2><p>This is a sample workspace for a 48-person product studio. Nothing is sent anywhere, and all changes stay in this browser.</p><p>Switch personas in the top right to experience the same workflow as an employee, manager or HR admin.</p><div className="persona-choice"><button className="selected"><Avatar initials="IV" color="lavender" small /><span><strong>Isha Verma</strong><small>Employee</small></span></button><button><Avatar initials="RK" color="peach" small /><span><strong>Rohan Kapoor</strong><small>Manager</small></span></button><button><Avatar initials="MI" color="mint" small /><span><strong>Meera Iyer</strong><small>HR Admin</small></span></button></div><div className="welcome-actions"><button className="button text" onClick={onClose}>Explore on my own</button><button className="button filled" onClick={onTour}>Take the 2 minute tour</button></div></div></div> }
function Guide({ onClose }) { return <div className="scrim"><aside className="guide-sheet"><div className="sheet-header"><div><span className="eyebrow">Guide</span><h2>Make the most of HR Demo</h2></div><button className="icon-button" onClick={onClose}><Icon name="close" /></button></div><div className="guide-section"><h3>What this page is</h3><p>This workspace connects people, time off, attendance and hiring to the same employee records.</p></div><div className="guide-section"><h3>Why companies have it</h3><p>A shared people system gives everyone a clear view of work, approvals and important documents.</p></div><div className="guide-section"><h3>Try it</h3>{['Open Time off and read your balance', 'Request two days of annual leave', 'Switch to Rohan and approve the request'].map((step) => <label className="guide-check" key={step}><input type="checkbox" />{step}</label>)}</div><button className="button filled full-button" onClick={onClose}>Close guide</button></aside></div> }
function Careers({ onBack, onApply }) { return <div className="careers"><header><div className="brand"><div className="brand-mark">K</div><strong>Kestrel Works</strong></div><span>Careers</span><button className="button outlined" onClick={onBack}>Back to HR app</button></header><main><span className="eyebrow">Join the team</span><h1>Build useful products with us</h1><p className="career-intro">We are a 48-person product studio working from Hyderabad, Bengaluru and anywhere.</p><div className="career-layout"><section className="career-job"><div className="job-title"><h2>Senior frontend engineer</h2><Status tone="success">Published</Status></div><p>Engineering · Bengaluru or Remote · Full time</p><hr /><h3>About the role</h3><p>Help us make thoughtful software for teams that do important work. You will work closely with product, design and engineering.</p><h3>What you will do</h3><ul><li>Build accessible interfaces with React and TypeScript.</li><li>Work with designers to turn ideas into clear experiences.</li><li>Help the team improve how we ship software.</li></ul></section><aside className="apply-card"><h2>Interested in this role?</h2><p>Applications are reviewed by the Kestrel Works team.</p><button className="button filled full-button" onClick={onApply}>Apply for this role</button><small>Your application is sample data for this demo.</small></aside></div></main></div> }

export default App

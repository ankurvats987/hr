const DB_NAME = 'kestrel-hr';
const DB_VERSION = 1;
const STORE = 'state';

const seed = {
  setup: false,
  workspace: { name: 'Kestrel Works', timezone: 'Asia/Kolkata', currency: 'INR' },
  persona: 'employee',
  employees: [
    { id: 'e1', name: 'Isha Verma', role: 'Software Engineer', team: 'Engineering', location: 'Bengaluru', email: 'isha.verma@example.test', status: 'Active' },
    { id: 'e2', name: 'Rohan Kapoor', role: 'Engineering Manager', team: 'Engineering', location: 'Hyderabad', email: 'rohan.kapoor@example.test', status: 'Active' },
    { id: 'e3', name: 'Meera Iyer', role: 'Head of People', team: 'People', location: 'Remote', email: 'meera.iyer@example.test', status: 'Active' },
    { id: 'e4', name: 'Arjun Nair', role: 'Product Designer', team: 'Design', location: 'Bengaluru', email: 'arjun.nair@example.test', status: 'Active' },
  ],
  leaveRequests: [{ id: 'l1', employee: 'Isha Verma', type: 'Annual leave', start: '2026-03-18', end: '2026-03-20', days: 3, status: 'Pending' }],
  attendance: [],
  timesheets: [{ id: 't1', week: 'Week of 02 Mar 2026', employee: 'Isha Verma', hours: 38.5, status: 'Approved', notes: 'Release preparation' }],
  candidates: [{ id: 'c1', name: 'Nisha Shah', job: 'Senior frontend engineer', stage: 'Applied', email: 'nisha.shah@example.test', source: 'Careers' }],
  jobs: [{ id: 'j1', title: 'Senior frontend engineer', department: 'Engineering', location: 'Bengaluru or Remote', status: 'Published' }],
  onboarding: [{ id: 'o1', label: 'Sign your offer letter', done: false, required: true }, { id: 'o2', label: 'Upload identity document', done: false, required: true }, { id: 'o3', label: 'Meet your manager', done: true, required: false }],
  tasks: [{ id: 'task1', label: 'Complete your profile', related: 'Isha Verma', done: false, due: '2026-03-20' }],
  notifications: [],
  audit: [],
};

function openDb() {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) { resolve(null); return; }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function readState() {
  const db = await openDb();
  if (!db) return JSON.parse(localStorage.getItem('kestrel-hr-state') || 'null') || structuredClone(seed);
  return new Promise((resolve, reject) => {
    const request = db.transaction(STORE).objectStore(STORE).get('app');
    request.onsuccess = () => resolve(request.result || structuredClone(seed));
    request.onerror = () => reject(request.error);
  });
}

async function writeState(state) {
  const db = await openDb();
  if (!db) { localStorage.setItem('kestrel-hr-state', JSON.stringify(state)); return state; }
  return new Promise((resolve, reject) => {
    const request = db.transaction(STORE, 'readwrite').objectStore(STORE).put(state, 'app');
    request.onsuccess = () => resolve(state);
    request.onerror = () => reject(request.error);
  });
}

export async function loadState() { return readState(); }
export async function saveState(state) { return writeState(state); }
export function id() { return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`; }

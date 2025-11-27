// ====== CONFIG ======

const SUBJECTS = [
  { code: "010", name: "Air Law" },
  { code: "021", name: "Aircraft General Knowledge" },
  { code: "022", name: "Instrumentation" },
  { code: "031", name: "Mass and Balance" },
  { code: "032", name: "Performance" },
  { code: "033", name: "Flight Planning and Monitoring" },
  { code: "040", name: "Human Performance" },
  { code: "050", name: "Meteorology" },
  { code: "061", name: "General Navigation" },
  { code: "062", name: "Radio Navigation" },
  { code: "070", name: "Operational Procedures" },
  { code: "081", name: "Principles of Flight" },
  { code: "090", name: "Communications" }
];

const DEFAULT_SUBTOPICS = [
  "Topic 1","Topic 2","Topic 3","Topic 4","Topic 5",
  "Topic 6","Topic 7","Topic 8","Topic 9","Topic 10"
];

const STORAGE_KEY = "rory_atpl_tracker_v1";
const START_DATE = new Date("2025-12-01");
const END_DATE = new Date("2026-09-30");

const QUOTES = [
  "The engine is the heart of an aeroplane, but the pilot is its soul.",
  "A mile of highway will take you a mile, but a mile of runway will take you anywhere.",
  "Every study session is one step closer to rotation speed.",
  "Pilots are not born with knowledge; they earn it, page by page.",
  "Difficult exams make for confident captains.",
  "Your future passengers are counting on the work you do today.",
  "Great things are done by a series of small steps brought together."
];

let state = {
  subtopics: {},
  studyDays: [],
  events: {},
  weeklyGoal: null,
  weeklyMastered: 0,
  streak: 0,
  lastStudyDate: null
};

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try { state = JSON.parse(raw); } catch (e) { console.error(e); }
  }
  SUBJECTS.forEach(s => {
    if (!state.subtopics[s.code]) {
      state.subtopics[s.code] = DEFAULT_SUBTOPICS.map(name => ({ name, rating: 0 }));
    }
  });
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function calcSubjectPercent(code) {
  const list = state.subtopics[code] || [];
  if (!list.length) return 0;
  const mastered = list.filter(t => t.rating === 5).length;
  return mastered / list.length * 100;
}

function calcOverallPercent() {
  let total = 0, mastered = 0;
  SUBJECTS.forEach(s => {
    const list = state.subtopics[s.code] || [];
    total += list.length;
    mastered += list.filter(t => t.rating === 5).length;
  });
  if (!total) return 0;
  return mastered / total * 100;
}

function dateToISO(d){return d.toISOString().slice(0,10);}

// QUOTES
function pickDailyQuote() {
  const today = dateToISO(new Date());
  const hash = today.split("-").join("");
  const idx = parseInt(hash,10) % QUOTES.length;
  document.getElementById("daily-quote").textContent = QUOTES[idx];
}

// TABS
function initTabs() {
  const buttons = document.querySelectorAll(".tab-button");
  const tabs = document.query

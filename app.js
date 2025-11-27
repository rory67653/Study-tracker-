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

// Firestore: single document path to store everything
const FIREBASE_COLLECTION = "users";
const FIREBASE_DOCUMENT = "rory-atpl-progress";

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

// Firebase references (will be set in initFirebase)
let firebaseApp = null;
let firestore = null;
let firestoreDocRef = null;
let cloudLoadedOnce = false;

// ====== UTIL & STATE ======

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try { state = JSON.parse(raw); } catch (e) { console.error("State parse error", e); }
  }
  SUBJECTS.forEach(s => {
    if (!state.subtopics[s.code]) {
      state.subtopics[s.code] = DEFAULT_SUBTOPICS.map(name => ({ name, rating: 0 }));
    }
  });
  if (!Array.isArray(state.studyDays)) state.studyDays = [];
  if (!state.events) state.events = {};
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  saveToCloud(); // push to Firestore as well
}

function calcSubjectPercent(code) {
  const list = state.subtopics[code] || [];
  if (!list.length) return 0;
  const mastered = list.filter(t => t.rating === 5).length;
  return (mastered / list.length) * 100;
}

function calcSubjectCounts(code) {
  const list = state.subtopics[code] || [];
  const total = list.length;
  const mastered = list.filter(t => t.rating === 5).length;
  return { mastered, total };
}

function calcOverallPercent() {
  let total = 0, mastered = 0;
  SUBJECTS.forEach(s => {
    const list = state.subtopics[s.code] || [];
    total += list.length;
    mastered += list.filter(t => t.rating === 5).length;
  });
  if (!total) return 0;
  return (mastered / total) * 100;
}

function dateToISO(d) {
  return d.toISOString().slice(0, 10);
}

// ====== QUOTES ======

function pickDailyQuote() {
  const todayISO = dateToISO(new Date());
  let sum = 0;
  for (let i = 0; i < todayISO.length; i++) sum += todayISO.charCodeAt(i);
  const idx = sum % QUOTES.length;
  const el = document.getElementById("daily-quote");
  if (el) el.textContent = QUOTES[idx];
}

// ====== TABS ======

function initTabs() {
  const buttons = document.querySelectorAll(".tab-button");
  const tabs = document.querySelectorAll(".tab-content");
  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      buttons.forEach(b => {
        b.classList.remove("active");
        b.setAttribute("aria-selected", "false");
      });
      tabs.forEach(t => t.classList.remove("visible"));
      btn.classList.add("active");
      btn.setAttribute("aria-selected", "true");
      const id = btn.dataset.tab;
      const target = document.getElementById(id);
      if (target) target.classList.add("visible");
      if (id === "parents") renderParentsView();
    });
  });
}

// ====== SUBJECTS & STARS ======

function renderSubjects() {
  const container = document.getElementById("subjects-container");
  if (!container) return;
  container.innerHTML = "";

  SUBJECTS.forEach(subject => {
    const pct = calcSubjectPercent(subject.code);

    const card = document.createElement("div");
    card.className = "subject-card";

    const header = document.createElement("div");
    header.className = "subject-header";

    const titleBox = document.createElement("div");
    const title = document.createElement("div");
    title.className = "subject-title";
    title.textContent = subject.name;
    const code = document.createElement("div");
    code.className = "subject-code";
    code.textContent = subject.code;
    titleBox.appendChild(title);
    titleBox.appendChild(code);

    const circle = document.createElement("div");
    circle.className = "progress-circle";
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("viewBox", "0 0 48 48");

    const bg = document.createElementNS(svgNS, "circle");
    bg.setAttribute("class", "progress-bg");
    bg.setAttribute("cx", "24");
    bg.setAttribute("cy", "24");
    bg.setAttribute("r", "21");

    const val = document.createElementNS(svgNS, "circle");
    val.setAttribute("class", "progress-value");
    val.setAttribute("cx", "24");
    val.setAttribute("cy", "24");
    val.setAttribute("r", "21");

    const dash = 2 * Math.PI * 21;
    val.style.strokeDasharray = dash;
    const offset = dash * (1 - pct / 100);
    val.style.strokeDashoffset = offset;

    const rootStyle = getComputedStyle(document.documentElement);
    if (pct < 34) {
      val.style.stroke = rootStyle.getPropertyValue("--circle-red") || "#ef4444";
    } else if (pct < 67) {
      val.style.stroke = rootStyle.getPropertyValue("--circle-orange") || "#f59e0b";
    } else {
      val.style.stroke = rootStyle.getPropertyValue("--circle-green") || "#10b981";
    }

    svg.appendChild(bg);
    svg.appendChild(val);
    circle.appendChild(svg);

    const text = document.createElement("div");
    text.className = "progress-text";
    text.textContent = `${Math.round(pct)}%`;
    circle.appendChild(text);

    header.appendChild(titleBox);
    header.appendChild(circle);
    card.appendChild(header);

    const subWrap = document.createElement("div");
    subWrap.className = "subtopics";

    const list = state.subtopics[subject.code] || [];
    list.forEach((topic, idx) => {
      const row = document.createElement("div");
      row.className = "subtopic-row";

      const name = document.createElement("div");
      name.className = "subtopic-name";
      name.textContent = topic.name;

      const stars = document.createElement("div");
      stars.className = "stars";

      for (let i = 1; i <= 5; i++) {
        const span = document.createElement("span");
        span.className = "star" + (topic.rating >= i ? " active" : "");
        span.textContent = "★";
        span.addEventListener("click", () => {
          handleStarClick(subject.code, idx, i);
        });
        stars.appendChild(span);
      }

      row.appendChild(name);
      row.appendChild(stars);
      subWrap.appendChild(row);
    });

    card.appendChild(subWrap);
    container.appendChild(card);
  });
}

function handleStarClick(subjectCode, topicIndex, starValue) {
  const topic = state.subtopics[subjectCode][topicIndex];
  const before5 = topic.rating === 5;
  const newRating = topic.rating === starValue ? 0 : starValue;
  const after5 = newRating === 5;

  topic.rating = newRating;
  recordStudyDay();

  if (!before5 && after5) state.weeklyMastered += 1;
  if (before5 && !after5) state.weeklyMastered = Math.max(0, state.weeklyMastered - 1);

  updateStreak();
  saveState();
  updateStatsOverview();
  updateGraph();
  renderSubjects();
  renderParentsView();
}

// ====== STREAK & STUDY DAYS ======

function recordStudyDay() {
  const todayISO = dateToISO(new Date());
  if (!state.studyDays.includes(todayISO)) state.studyDays.push(todayISO);
}

function updateStreak() {
  const today = new Date();
  const todayISO = dateToISO(today);

  if (!state.lastStudyDate) {
    state.lastStudyDate = todayISO;
    state.streak = 1;
    return;
  }

  const last = new Date(state.lastStudyDate);
  const diffDays = Math.round((today - last) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return;
  } else if (diffDays === 1) {
    state.streak += 1;
    state.lastStudyDate = todayISO;
  } else {
    state.streak = 1;
    state.lastStudyDate = todayISO;
  }
}

// ====== STATS & WEEKLY GOAL ======

function updateStatsOverview() {
  const daysEl = document.getElementById("stat-days-studied");
  const streakEl = document.getElementById("stat-streak");
  const subjEl = document.getElementById("stat-subjects-mastered");
  const statusEl = document.getElementById("weekly-goal-status");

  if (daysEl) daysEl.textContent = state.studyDays.length;
  if (streakEl) streakEl.textContent = `${state.streak}🔥`;

  let masteredSubjects = 0;
  SUBJECTS.forEach(s => {
    if (calcSubjectPercent(s.code) >= 99.5) masteredSubjects += 1;
  });
  if (subjEl) subjEl.textContent = `${masteredSubjects}/${SUBJECTS.length}`;

  if (!statusEl) return;
  if (!state.weeklyGoal) {
    statusEl.textContent = "Set a weekly goal to track your mastered subtopics.";
  } else {
    statusEl.textContent = `This week: ${state.weeklyMastered}/${state.weeklyGoal} subtopics mastered.`;
  }
}

function initWeeklyGoal() {
  const input = document.getElementById("weekly-goal-input");
  const btn = document.getElementById("save-weekly-goal");
  if (!input || !btn) return;

  if (state.weeklyGoal) input.value = state.weeklyGoal;

  btn.addEventListener("click", () => {
    const val = parseInt(input.value, 10);
    if (!isNaN(val) && val > 0) {
      state.weeklyGoal = val;
      saveState();
      updateStatsOverview();
    }
  });
}

// ====== GRAPH ======

let graphCtx;
let currentGraphSubject = "overall";

function initGraph() {
  const canvas = document.getElementById("progress-graph");
  if (!canvas) return;
  graphCtx = canvas.getContext("2d");

  const select = document.getElementById("graph-subject-select");
  if (!select) return;

  select.innerHTML = "";
  const optAll = document.createElement("option");
  optAll.value = "overall";
  optAll.textContent = "Overall progress";
  select.appendChild(optAll);

  SUBJECTS.forEach(s => {
    const o = document.createElement("option");
    o.value = s.code;
    o.textContent = `${s.code} - ${s.name}`;
    select.appendChild(o);
  });

  select.addEventListener("change", () => {
    currentGraphSubject = select.value;
    updateGraph();
  });

  updateGraph();
}

function daysBetween(start, end) {
  return Math.round((end - start) / (1000 * 60 * 60 * 24));
}

function interpolateTarget(dayIndex, totalDays) {
  return (dayIndex / totalDays) * 100;
}

function updateGraph() {
  if (!graphCtx) return;
  const canvas = graphCtx.canvas;
  const width = canvas.width;
  const height = canvas.height;

  graphCtx.clearRect(0, 0, width, height);

  const totalDays = Math.max(1, daysBetween(START_DATE, END_DATE));
  const today = new Date();
  const todayIndex = Math.max(0, Math.min(totalDays, daysBetween(START_DATE, today)));

  graphCtx.strokeStyle = "#30415f";
  graphCtx.lineWidth = 1;
  graphCtx.beginPath();
  graphCtx.moveTo(30, 10);
  graphCtx.lineTo(30, height - 20);
  graphCtx.lineTo(width - 10, height - 20);
  graphCtx.stroke();

  graphCtx.strokeStyle = "#6b7280";
  graphCtx.lineWidth = 1.2;
  graphCtx.beginPath();
  for (let d = 0; d <= totalDays; d += Math.max(1, Math.floor(totalDays / 50))) {
    const t = interpolateTarget(d, totalDays);
    const x = 30 + (d / totalDays) * (width - 40);
    const y = (height - 20) - (t / 100) * (height - 40);
    if (d === 0) graphCtx.moveTo(x, y);
    else graphCtx.lineTo(x, y);
  }
  graphCtx.stroke();

  let pctNow = 0;
  if (currentGraphSubject === "overall") {
    pctNow = calcOverallPercent();
  } else {
    pctNow = calcSubjectPercent(currentGraphSubject);
  }

  graphCtx.strokeStyle = "#1f8ffd";
  graphCtx.lineWidth = 2;
  graphCtx.beginPath();
  const actualX = 30 + (todayIndex / totalDays) * (width - 40);
  const actualY = (height - 20) - (pctNow / 100) * (height - 40);
  graphCtx.moveTo(30, height - 20);
  graphCtx.lineTo(actualX, actualY);
  graphCtx.stroke();

  graphCtx.fillStyle = "#1f8ffd";
  graphCtx.beginPath();
  graphCtx.arc(actualX, actualY, 3, 0, Math.PI * 2);
  graphCtx.fill();
}

// ====== CALENDAR ======

let calendarCurrent = new Date();
let calendarSelectedISO = null;

function initCalendar() {
  const subjectSelect = document.getElementById("event-subject");
  if (!subjectSelect) return;

  subjectSelect.innerHTML = "";
  SUBJECTS.forEach(s => {
    const o = document.createElement("option");
    o.value = s.code;
    o.textContent = `${s.code} - ${s.name}`;
    subjectSelect.appendChild(o);
  });

  const prevBtn = document.getElementById("prev-month");
  const nextBtn = document.getElementById("next-month");
  if (prevBtn) prevBtn.addEventListener("click", () => {
    calendarCurrent.setMonth(calendarCurrent.getMonth() - 1);
    renderCalendar();
  });
  if (nextBtn) nextBtn.addEventListener("click", () => {
    calendarCurrent.setMonth(calendarCurrent.getMonth() + 1);
    renderCalendar();
  });

  const saveBtn = document.getElementById("save-event");
  const delBtn = document.getElementById("delete-event");
  if (saveBtn) saveBtn.addEventListener("click", saveEvent);
  if (delBtn) delBtn.addEventListener("click", deleteEvent);

  renderCalendar();
}

function renderCalendar() {
  const monthYearEl = document.getElementById("calendar-month-year");
  const grid = document.getElementById("calendar-grid");
  if (!monthYearEl || !grid) return;

  grid.innerHTML = "";

  const year = calendarCurrent.getFullYear();
  const month = calendarCurrent.getMonth();
  const firstDay = new Date(year, month, 1);
  const firstWeekday = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthName = firstDay.toLocaleString("default", { month: "long" });
  monthYearEl.textContent = `${monthName} ${year}`;

  const weekdays = ["S", "M", "T", "W", "T", "F", "S"];
  weekdays.forEach(w => {
    const h = document.createElement("div");
    h.className = "calendar-day-header";
    h.textContent = w;
    grid.appendChild(h);
  });

  for (let i = 0; i < firstWeekday; i++) {
    const empty = document.createElement("div");
    grid.appendChild(empty);
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dayEl = document.createElement("div");
    dayEl.className = "calendar-day";

    const num = document.createElement("div");
    num.className = "calendar-day-number";
    num.textContent = d;
    dayEl.appendChild(num);

    const dateISO = dateToISO(new Date(year, month, d));
    if (state.events && state.events[dateISO]) {
      const dot = document.createElement("div");
      dot.className = "calendar-event-dot";
      dayEl.appendChild(dot);
    }
    if (calendarSelectedISO === dateISO) dayEl.classList.add("selected");

    dayEl.addEventListener("click", () => {
      calendarSelectedISO = dateISO;
      renderCalendar();
      loadEventDetails();
    });

    grid.appendChild(dayEl);
  }
}

function loadEventDetails() {
  const label = document.getElementById("selected-date-label");
  const notes = document.getElementById("event-notes");
  const subject = document.getElementById("event-subject");
  const list = document.getElementById("events-list");
  if (!label || !notes || !subject || !list) return;

  if (!calendarSelectedISO) {
    label.textContent = "Select a date";
    notes.value = "";
    list.innerHTML = "";
    return;
  }

  label.textContent = `Events on ${calendarSelectedISO}`;
  const ev = state.events ? state.events[calendarSelectedISO] : null;
  if (ev) {
    subject.value = ev.subjectCode;
    notes.value = ev.notes || "";
    list.innerHTML = `<li>${ev.subjectCode} - ${ev.notes || "Exam"}</li>`;
  } else {
    notes.value = "";
    list.innerHTML = "<li>No exams saved for this date.</li>";
  }
}

function saveEvent() {
  if (!calendarSelectedISO) return;
  const subjectCode = document.getElementById("event-subject").value;
  const notes = document.getElementById("event-notes").value.trim();
  if (!state.events) state.events = {};
  state.events[calendarSelectedISO] = { subjectCode, notes };
  saveState();
  renderCalendar();
  loadEventDetails();
}

function deleteEvent() {
  if (!calendarSelectedISO) return;
  if (state.events && state.events[calendarSelectedISO]) {
    delete state.events[calendarSelectedISO];
    saveState();
  }
  renderCalendar();
  loadEventDetails();
}

// ====== PARENTS TAB RENDERING ======

function renderParentsView() {
  const container = document.getElementById("parents-progress");
  if (!container) return;
  container.innerHTML = "";

  SUBJECTS.forEach(s => {
    const { mastered, total } = calcSubjectCounts(s.code);
    const pct = total ? (mastered / total) * 100 : 0;

    const row = document.createElement("div");
    row.className = "parents-row";

    const header = document.createElement("div");
    header.className = "parents-row-header";

    const subj = document.createElement("div");
    subj.className = "parents-row-subject";
    subj.textContent = `${s.code} — ${s.name}`;

    const count = document.createElement("div");
    count.className = "parents-row-count";
    count.textContent = `${mastered} / ${total} subtopics mastered`;

    header.appendChild(subj);
    header.appendChild(count);

    const bar = document.createElement("div");
    bar.className = "parents-progress-bar";

    const fill = document.createElement("div");
    fill.className = "parents-progress-fill";
    fill.style.width = `${pct}%`;

    bar.appendChild(fill);
    row.appendChild(header);
    row.appendChild(bar);
    container.appendChild(row);
  });
}

// ====== FIREBASE / FIRESTORE ======

function initFirebase() {
  try {
    // from CDN compat SDKs
    firebaseApp = firebase.initializeApp({
      apiKey: "AIzaSyDL46c50panFgoVpxuzTtqBbfpVdVtb4Lg",
      authDomain: "rory-atpl-tracker.firebaseapp.com",
      projectId: "rory-atpl-tracker",
      storageBucket: "rory-atpl-tracker.firebasestorage.app",
      messagingSenderId: "372607717316",
      appId: "1:372607717316:web:6d22ce8921a2fbd7ed5e91",
      measurementId: "G-18XF2Z5PQ9"
    });
    firestore = firebase.firestore();
    firestoreDocRef = firestore.collection(FIREBASE_COLLECTION).doc(FIREBASE_DOCUMENT);
    loadFromCloud(); // attempt initial sync
  } catch (e) {
    console.warn("Firebase init failed (tracker will still work locally):", e);
  }
}

function loadFromCloud() {
  if (!firestoreDocRef) return;
  firestoreDocRef.get().then((doc) => {
    if (doc.exists) {
      const cloudData = doc.data();
      if (cloudData && typeof cloudData === "object") {
        // merge cloud into local state
        state = Object.assign({}, state, cloudData);
        SUBJECTS.forEach(s => {
          if (!state.subtopics[s.code]) {
            state.subtopics[s.code] = DEFAULT_SUBTOPICS.map(name => ({ name, rating: 0 }));
          }
        });
        if (!Array.isArray(state.studyDays)) state.studyDays = [];
        if (!state.events) state.events = {};
        saveState(); // update localStorage with cloud copy
        renderSubjects();
        updateStatsOverview();
        updateGraph();
        renderCalendar();
        renderParentsView();
        cloudLoadedOnce = true;
      }
    } else {
      // first time; create document
      saveToCloud();
    }
  }).catch(err => {
    console.warn("Failed to load from Firestore:", err);
  });
}

function saveToCloud() {
  if (!firestoreDocRef) return;
  if (!cloudLoadedOnce) {
    // avoid overwriting cloud before first read
    return;
  }
  firestoreDocRef.set(state, { merge: true }).catch(err => {
    console.warn("Failed to save to Firestore:", err);
  });
}

// ====== INIT ======

function init() {
  loadState();
  pickDailyQuote();
  initTabs();
  initWeeklyGoal();
  renderSubjects();
  initGraph();
  initCalendar();
  updateStatsOverview();
  renderParentsView();
  initFirebase();
}

document.addEventListener("DOMContentLoaded", init);

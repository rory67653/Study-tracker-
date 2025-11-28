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

// Real subtopics exactly from your lists
const SUBJECT_SUBTOPICS = {
  "010": [
    "01001 International Law: Conventions, Agreements, Organizations",
    "01002 Airworthiness, Aircraft Nationality, and Registration Marks",
    "01004 Personnel Licensing",
    "01005 Rules of the Air",
    "01006 Aircraft Operations",
    "01007 Air Traffic Services (ATS) and Airspace Management",
    "01008 Aeronautical Information Service (AIS) and Aeronautical Charts",
    "01009 Aerodromes",
    "01010 Search and Rescue (SAR)",
    "01011 Security",
    "01012 Aircraft Accident and Incident Investigation",
    "01013 Environment Protection"
  ],
  "021": [
    "021-01 System Design, Loads, Stresses, Maintenance",
    "021-02 Airframe",
    "021-03 Hydraulics",
    "021-04 Landing Gear, Wheels, Tyres, Brakes",
    "021-05 Flight Controls",
    "021-06 Pneumatics – Pressurisation and Air Conditioning Systems",
    "021-07 Anti-icing and De-icing Systems",
    "021-08 Fuel System",
    "021-09 Electrics",
    "021-10 Piston Engines",
    "021-11 Turbine Engines",
    "021-12 Protection and Detection Systems",
    "021-13 Oxygen Systems"
  ],
  "022": [
    "022-01 Sensors and Instruments",
    "022-02 Measurement of Air Data Parameters",
    "022-03 Magnetism – Direct Reading Compass and Flux Valve",
    "022-04 Gyroscopic Principles and Instruments",
    "022-05 Radio Altimeters and Test Instruments",
    "022-06 Flight Director System",
    "022-07 Automatic Flight Control Systems – Autopilot",
    "022-08 Automatic Flight Control Systems – Autothrust – Automatic Thrust Control System",
    "022-09 Warning and Recording Equipment",
    "022-10 Communication Systems",
    "022-11 Flight Management System (FMS) / Flight Management and Guidance System (FMGS)",
    "022-12 Alerting Systems, Proximity Systems",
    "022-13 Integrated Instruments – Electronic Displays",
    "022-14 Maintenance, Monitoring and Recording Systems",
    "022-15 Digital Circuits and Computers"
  ],
  "031": [
    "031-01 Purpose of Mass and Balance Considerations",
    "031-02 Loading",
    "031-04 Mass and Balance Details of Aircraft",
    "031-05 Determination of CG Position",
    "031-06 Cargo Handling"
  ],
  "032": [
    "032-01 General",
    "032-02 (C2.23A) Applicable Operational Requirements Performance Class B – Theory",
    "032-03 (C2.23A) Applicable Operational Requirements Performance Class B – Use of Aeroplane Performance Data for Single and Multi-engine Aeroplanes",
    "032-04 (C5.25A) Applicable Operational Requirements Performance Class A – Theory",
    "032-05 (C5.25A) Applicable Operational Requirements Performance Class A – Use of Aeroplane Performance Data"
  ],
  "033": [
    "033-01 Flight Planning for VFR Flights",
    "033-02 Flight Planning for IFR Flights",
    "033-03 Fuel Planning – CAT.OP.MPA.106 and CAT.OP.MPA.150 plus AMC1, 2 and 3",
    "033-04 Pre-flight Preparation",
    "033-05 ICAO Flight Plan (ATS Flight Plan (FPL))",
    "033-06 Flight Monitoring and In-flight Re-planning"
  ],
  "040": [
    "040-01 Human Factors Basic Concepts",
    "040-02 Basics of Aviation Physiology and Health Maintenance",
    "040-03 Basic Aviation Psychology"
  ],
  "050": [
    "050-01 The Atmosphere",
    "050-02 Wind",
    "050-03 Thermodynamics",
    "050-04 Clouds and Fog",
    "050-05 Precipitation",
    "050-06 Air Masses and Fronts",
    "050-07 Pressure Systems",
    "050-08 Climatology",
    "050-09 Flight Hazards",
    "050-10 Meteorological Information"
  ],
  "061": [
    "061-01 Basics of Navigation",
    "061-02 Visual Flight Rules (VFR) Navigation",
    "061-03 Great Circles and Rhumb Lines",
    "061-04 Charts",
    "061-05 Time"
  ],
  "062": [
    "062-01 Basic Radio Propagation Theory",
    "062-02 Radio Aids",
    "062-03 Radar",
    "062-06 Global Navigation Satellite Systems (GNSSs)",
    "062-07 Performance Based Navigation (PBN)"
  ],
  "070": [
    "071-01 General Requirements",
    "071-02 Special Operational Procedures and Hazards (General Aspects)",
    "071-04 Specialised Operations"
  ],
  "081": [
    "081-01 Subsonic Aerodynamics",
    "081-02 High Speed Aerodynamics",
    "081-03 Stability, Mach Tuck and Upset Prevention and Recovery",
    "081-04 Stability",
    "081-05 Control",
    "081-06 Limitations",
    "081-07 Propellers",
    "081-08 Flight Mechanics"
  ],
  "090": [
    "090-01 Concepts",
    "090-02 General Operating Procedures",
    "090-03 Relevant Weather Information",
    "090-04 Voice Communication Failure",
    "090-05 VHF Propagation and Allocation of Frequencies",
    "090-07 Other Communications"
  ]
};

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

// ====== UTIL & STATE ======

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      state = JSON.parse(raw);
    } catch (e) {
      console.error("State parse error", e);
    }
  }

  // build subtopics from real names
  SUBJECTS.forEach(s => {
    const names = SUBJECT_SUBTOPICS[s.code] || [];
    if (!state.subtopics[s.code]) {
      state.subtopics[s.code] = names.map(name => ({ name, rating: 0 }));
    }
  });

  if (!Array.isArray(state.studyDays)) state.studyDays = [];
  if (!state.events) state.events = {};
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function calcSubjectPercent(code) {
  const list = state.subtopics[code] || [];
  if (!list.length) return 0;
  const mastered = list.filter(t => t.rating === 5).length;
  return (mastered / list.length) * 100;
}

function calcOverallPercent() {
  let total = 0;
  let mastered = 0;
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

  saveState();
  updateStatsOverview();
  updateGraph();
  renderSubjects();
}

// ====== STUDY DAYS ======

function recordStudyDay() {
  const todayISO = dateToISO(new Date());
  if (!state.studyDays.includes(todayISO)) state.studyDays.push(todayISO);
}

// ====== STATS & WEEKLY GOAL ======

function updateStatsOverview() {
  const daysEl = document.getElementById("stat-days-studied");
  const subjEl = document.getElementById("stat-subjects-mastered");
  const statusEl = document.getElementById("weekly-goal-status");

  if (daysEl) daysEl.textContent = state.studyDays.length;

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

  // axes
  graphCtx.strokeStyle = "#30415f";
  graphCtx.lineWidth = 1;
  graphCtx.beginPath();
  graphCtx.moveTo(30, 10);
  graphCtx.lineTo(30, height - 20);
  graphCtx.lineTo(width - 10, height - 20);
  graphCtx.stroke();

  // target line
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

  // actual progress
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
  if (prevBtn)
    prevBtn.addEventListener("click", () => {
      calendarCurrent.setMonth(calendarCurrent.getMonth() - 1);
      renderCalendar();
    });
  if (nextBtn)
    nextBtn.addEventListener("click", () => {
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
}

document.addEventListener("DOMContentLoaded", init);

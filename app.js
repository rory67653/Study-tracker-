// ----- TAB SWITCHING -----
const tabs = document.querySelectorAll(".tab-btn");
const tabContents = document.querySelectorAll(".tab-content");

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    tabs.forEach(t => t.classList.remove("active"));
    tabContents.forEach(c => c.classList.remove("active"));

    tab.classList.add("active");
    const targetId = tab.dataset.tab;
    document.getElementById(targetId).classList.add("active");
  });
});

// ----- DATA MODEL -----
const subjects = [
  { code: "010", name: "Air Law", subtopicsCount: 10 },
  { code: "021", name: "Aircraft General Knowledge", subtopicsCount: 10 },
  { code: "022", name: "Instrumentation", subtopicsCount: 10 },
  { code: "031", name: "Mass & Balance", subtopicsCount: 10 },
  { code: "032", name: "Performance", subtopicsCount: 10 },
  { code: "033", name: "Flight Planning", subtopicsCount: 10 },
  { code: "040", name: "Human Performance", subtopicsCount: 10 },
  { code: "050", name: "Meteorology", subtopicsCount: 10 },
  { code: "061", name: "General Navigation", subtopicsCount: 10 },
  { code: "062", name: "Radio Navigation", subtopicsCount: 10 },
  { code: "070", name: "Operational Procedures", subtopicsCount: 10 },
  { code: "081", name: "Principles of Flight", subtopicsCount: 10 },
  { code: "090", name: "Communications", subtopicsCount: 10 },
];

let ratings = JSON.parse(localStorage.getItem("ratings") || "{}");

// ----- RATINGS HELPERS -----
function saveRatings() {
  localStorage.setItem("ratings", JSON.stringify(ratings));
}

function rateSubtopic(subjectCode, index, value) {
  if (!ratings[subjectCode]) ratings[subjectCode] = {};
  if (ratings[subjectCode][index] === value) {
    delete ratings[subjectCode][index];   // tap same value again = clear
  } else {
    ratings[subjectCode][index] = value;
  }
  saveRatings();
  updateStats();
  updateGraph();
  renderSubjects(); // refresh subject cards
}

function subjectProgress(subject) {
  const r = ratings[subject.code] || {};
  const done = Object.values(r).filter(v => v === 5).length;
  return (done / subject.subtopicsCount) * 100 || 0;
}

// ----- SUBJECTS LIST + MODAL -----
const subjectsList = document.getElementById("subjects-list");

function renderSubjects() {
  subjectsList.innerHTML = "";
  subjects.forEach(subject => {
    const card = document.createElement("div");
    card.className = "subject-card";

    const progress = subjectProgress(subject);

    card.innerHTML = `
      <h3>${subject.code} - ${subject.name}</h3>
      <p>${progress.toFixed(0)}% rated 5★</p>
    `;

    card.addEventListener("click", () => openSubjectModal(subject));
    subjectsList.appendChild(card);
  });
}

function openSubjectModal(subject) {
  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";

  const modal = document.createElement("div");
  modal.className = "modal";

  const title = document.createElement("h2");
  title.textContent = `${subject.code} – ${subject.name}`;

  const list = document.createElement("ul");
  list.className = "subtopic-list";

  const subjectRatings = ratings[subject.code] || {};

  for (let i = 0; i < subject.subtopicsCount; i++) {
    const li = document.createElement("li");
    li.textContent = `Topic ${i + 1}`;

    const stars = document.createElement("span");
    stars.className = "stars";

    for (let s = 1; s <= 5; s++) {
      const btn = document.createElement("button");
      btn.className = "star-btn";
      btn.textContent = subjectRatings[i] >= s ? "★" : "☆";
      btn.addEventListener("click", () => {
        rateSubtopic(subject.code, i, s);
        document.body.removeChild(overlay);
      });
      stars.appendChild(btn);
    }

    li.appendChild(stars);
    list.appendChild(li);
  }

  const close = document.createElement("button");
  close.className = "modal-close-btn";
  close.textContent = "Close";
  close.addEventListener("click", () => {
    document.body.removeChild(overlay);
  });

  modal.appendChild(title);
  modal.appendChild(list);
  modal.appendChild(close);
  overlay.appendChild(modal);
  document.body.appendChild(overlay);
}

// ----- STATS + WEEKLY GOAL -----
const totalRatedEl = document.getElementById("total-rated");
const weeklyProgressEl = document.getElementById("weekly-progress");
const streakDaysEl = document.getElementById("streak-days");
const weeklyTargetInput = document.getElementById("weekly-target");
const updateGoalBtn = document.getElementById("update-goal");

let weeklyGoal = parseInt(localStorage.getItem("weeklyGoal") || "10", 10);

function updateStats() {
  let totalRated = 0;
  Object.values(ratings).forEach(sub => {
    totalRated += Object.keys(sub).length;
  });
  totalRatedEl.textContent = totalRated;

  // simple placeholder streak: 1 day if you have any ratings
  streakDaysEl.textContent = totalRated > 0 ? 1 : 0;

  const progress = weeklyGoal > 0
    ? Math.min(100, (totalRated / weeklyGoal) * 100)
    : 0;
  weeklyProgressEl.textContent = `${progress.toFixed(0)}%`;
}

weeklyTargetInput.value = weeklyGoal;
updateGoalBtn.addEventListener("click", () => {
  const v = parseInt(weeklyTargetInput.value, 10);
  if (!Number.isNaN(v) && v > 0) {
    weeklyGoal = v;
    localStorage.setItem("weeklyGoal", String(weeklyGoal));
    updateStats();
  }
});

// ----- PROGRESS GRAPH -----
const canvas = document.getElementById("progress-graph");
const ctx = canvas.getContext("2d");

const startDate = new Date("2025-12-01");
const endDate = new Date("2026-09-30");

function countFiveStars() {
  let total = 0;
  Object.values(ratings).forEach(sub => {
    total += Object.values(sub).filter(v => v === 5).length;
  });
  return total;
}

function updateGraph() {
  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  const padding = 30;
  const gw = w - padding * 2;
  const gh = h - padding * 2;

  ctx.strokeStyle = "#ccc";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(padding, padding);
  ctx.lineTo(padding, padding + gh);
  ctx.lineTo(padding + gw, padding + gh);
  ctx.stroke();

  const totalSubtopics = subjects.reduce((sum, s) => sum + s.subtopicsCount, 0);
  const rated5 = countFiveStars();

  // target line 0 -> totalSubtopics
  ctx.strokeStyle = "#999";
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(padding, padding + gh);
  ctx.lineTo(padding + gw, padding);
  ctx.stroke();
  ctx.setLineDash([]);

  // progress line 0 -> rated5
  const progY = padding + gh - (rated5 / totalSubtopics) * gh;
  ctx.strokeStyle = "#3fa9f5";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(padding, padding + gh);
  ctx.lineTo(padding + gw, progY);
  ctx.stroke();
}

// ----- INIT -----
function init() {
  renderSubjects();
  updateStats();
  updateGraph();
}

document.addEventListener("DOMContentLoaded", init);

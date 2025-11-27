// Data setup
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

const startDate = new Date("2025-12-01");
const endDate = new Date("2026-09-30");

let weeklyGoal = parseInt(localStorage.getItem("weeklyGoal") || "10");
let ratings = JSON.parse(localStorage.getItem("ratings") || "{}");
let motivationalQuotes = [
  "The sky is not the limit, your mind is.",
  "Keep your eyes on the stars and your feet on the ground.",
  "Every great pilot was once a beginner.",
  "Wings are earned, not given.",
  "In flying, the probability of survival is proportional to the square of your skill.",
];

// DOM Elements
const tabs = document.querySelectorAll(".tab-btn");
const tabContents = document.querySelectorAll(".tab-content");
const quoteEl = document.getElementById("daily-quote");
const subjectsList = document.getElementById("subjects-list");
const graphSubjectSelect = document.getElementById("graph-subject");
const progressGraph = document.getElementById("progress-graph");
const streakDaysEl = document.getElementById("streak-days");
const totalRatedEl = document.getElementById("total-rated");
const weeklyProgressEl = document.getElementById("weekly-progress");
const weeklyTargetInput = document.getElementById("weekly-target");
const updateGoalBtn = document.getElementById("update-goal");

let currentTab = "home";

// Navigation tabs
tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    tabs.forEach(t => t.classList.remove("active"));
    tab.classList.add("active");
    currentTab = tab.dataset.tab;
    tabContents.forEach(tc => tc.classList.remove("active"));
    document.getElementById(currentTab).classList.add("active");
  });
});

// Daily motivational quote logic
function showDailyQuote() {
  // Select quote based on date so it changes daily
  const dayIndex = new Date().getDate() % motivationalQuotes.length;
  quoteEl.textContent = motivationalQuotes[dayIndex];
}

// Save and load ratings
function saveRatings() {
  localStorage.setItem("ratings", JSON.stringify(ratings));
}

function rateSubtopic(subjectCode, subtopicIndex, rating) {
  if (!ratings[subjectCode]) ratings[subjectCode] = {};
  // Toggle clear if rating same value
  if (ratings[subjectCode][subtopicIndex] === rating) {
    delete ratings[subjectCode][subtopicIndex];
  } else {
    ratings[subjectCode][subtopicIndex] = rating;
  }
  saveRatings();
  updateStatsOverview();
  renderSubjects();
  updateGraph();
}

// Render subjects on Subjects tab
function renderSubjects() {
  subjectsList.innerHTML = "";
  subjects.forEach(subject => {
    const card = document.createElement("div");
    card.className = "subject-card";

    const progress = calculateSubjectProgress(subject);
    card.innerHTML = `
      <h3>${subject.code} - ${subject.name}</h3>
      <p>Progress: ${progress.toFixed(0)}%</p>
      <div class="progress-circle" data-subject="${subject.code}"></div>
    `;

    card.addEventListener("click", () => {
      openSubjectDetails(subject);
    });

    subjectsList.appendChild(card);
  });
}

// Calculate progress percentage for a subject
function calculateSubjectProgress(subject) {
  const subtopicRatings = ratings[subject.code] || {};
  let count5Stars = 0;
  let totalSubtopics = subject.subtopicsCount;
  for (let i = 0; i < totalSubtopics; i++) {
    if (subtopicRatings[i] === 5) {
      count5Stars++;
    }
  }
  return (count5Stars / totalSubtopics) * 100;
}

// Render or open subject details (subtopics rating page)
function openSubjectDetails(subject) {
  // Build a modal with subtopics and 5-star rating interface
  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";

  const modal = document.createElement("div");
  modal.className = "modal";

  const title = document.createElement("h2");
  title.textContent = `${subject.code} - ${subject.name} Subtopics`;

  const list = document.createElement("ul");
  list.className = "subtopic-list";

  for (let i = 0; i < subject.subtopicsCount; i++) {
    const li = document.createElement("li");
    li.textContent = `Topic ${i + 1}`;

    const starsContainer = document.createElement("span");
    starsContainer.className = "stars-container";

    for (let star = 1; star <= 5; star++) {
      const starBtn = document.createElement("button");
      starBtn.className = "star-btn";
      starBtn.textContent = "☆";

      if (ratings[subject.code]?.[i] >= star) {
        starBtn.textContent = "★";
      }

      starBtn.addEventListener("click", () => {
        rateSubtopic(subject.code, i, star);
        openSubjectDetails(subject); // reopen modal update stars
        document.body.removeChild(overlay);
      });

      starsContainer.appendChild(starBtn);
    }

    li.appendChild(starsContainer);
    list.appendChild(li);
  }

  // Close button
  const closeBtn = document.createElement("button");
  closeBtn.className = "modal-close-btn";
  closeBtn.textContent = "Close";
  closeBtn.addEventListener("click", () => {
    document.body.removeChild(overlay);
  });

  modal.appendChild(title);
  modal.appendChild(list);
  modal.appendChild(closeBtn);
  overlay.appendChild(modal);
  document.body.appendChild(overlay);
}

// Stats overview update
function updateStatsOverview() {
  // Calculate streak (days with ratings updated), total rated count, weekly progress
  const todayStr = new Date().toISOString().slice(0, 10);
  const firstDate = localStorage.getItem("streakFirstDate");
  const lastDate = localStorage.getItem("streakLastDate");

  // Count total rated subtopics
  let totalRated = 0;
  subjects.forEach(subject => {
    const subRatings = ratings[subject.code] || {};
    totalRated += Object.keys(subRatings).length;
  });
  totalRatedEl.textContent = totalRated;

  // Calculate streak days (consecutive days with any rating activity)
  // For simplicity, assume lastDate and streak stored, or reset if no recent activity
  let streak = 0;
  if (firstDate && lastDate) {
    const last = new Date(lastDate);
    const first = new Date(firstDate);
    streak = Math.floor(
      (last.getTime() - first.getTime()) / (1000 * 60 * 60 * 24)
    ) + 1;
  }
  streakDaysEl.textContent = streak;

  // Weekly progress - how close to weeklyGoal
  const weeklyProgressPercent = Math.min(
    100,
    (totalRated / weeklyGoal) * 100
  ).toFixed(0);
  weeklyProgressEl.textContent = `${weeklyProgressPercent}%`;
}

// Graph update using Canvas API
function updateGraph() {
  const ctx = progressGraph.getContext("2d");
  ctx.clearRect(0, 0, progressGraph.width, progressGraph.height);

  // Draw a simple line graph of subtopics rated 5 stars over time
  // For now plot overall progress by month from startDate to endDate

  const monthsCount =
    endDate.getMonth() -
    startDate.getMonth() +
    1 +
    12 * (endDate.getFullYear() - startDate.getFullYear());

  // X-axis: months
  const padding = 40;
  const graphWidth = progressGraph.width - 2 * padding;
  const graphHeight = progressGraph.height - 2 * padding;

  // Draw axes
  ctx.strokeStyle = "#ccc";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(padding, padding);
  ctx.lineTo(padding, padding + graphHeight);
  ctx.lineTo(padding + graphWidth, padding + graphHeight);
  ctx.stroke();

  // Prepare monthly targets line (straight line from 0 to total subtopics at endDate)
  const total5Stars = subjects.reduce((acc, subject) => {
    return (
      acc +
      Object.values(ratings[subject.code] || {}).filter((v) => v === 5).length
    );
  }, 0);
  const maxSubtopics = subjects.reduce((acc, subject) => acc + subject.subtopicsCount, 0);

  // Simple straight target line from 0 to maxSubtopics from startDate to endDate
  function getX(monthIndex) {
    return padding + (monthIndex / (monthsCount - 1)) * graphWidth;
  }

  function getY(ratedCount) {
    return padding + graphHeight - (ratedCount / maxSubtopics) * graphHeight;
  }

  // Draw target line (gray dashed)
  ctx.strokeStyle = "#999";
  ctx.setLineDash([5, 5]);
  ctx.beginPath();
  ctx.moveTo(padding, getY(0));
  ctx.lineTo(padding + graphWidth, getY(maxSubtopics));
  ctx.stroke();
  ctx.setLineDash([]);

  // Draw progress line (blue solid, cumulative 5-star ratings)
  ctx.strokeStyle = "#3fa9f5";
  ctx.lineWidth = 2;
  ctx.beginPath();

  for (let i = 0; i < monthsCount; i++) {
    // Calculate month rating count approximation proportionally
    const progressUntilMonth = (i / (monthsCount - 1)) * maxSubtopics;
    let y = getY(Math.min(total5Stars, progressUntilMonth));
    let x = getX(i);

    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }
  ctx.stroke();

  // Axis labels (month names)
  ctx.fillStyle = "#eee";
  ctx.font = "12px sans-serif";
  for (let i = 0; i < monthsCount; i++) {
    const monthDate = new Date(startDate.getFullYear(), startDate.getMonth() + i);
    const monthName = monthDate.toLocaleString("default", { month: "short" });
    ctx.fillText(monthName, getX(i) - 15, padding + graphHeight + 15);
  }
}

// Initialization
function init() {
  showDailyQuote();
  renderSubjects();
  updateStatsOverview();
  updateGraph();
  weeklyTargetInput.value = weeklyGoal;

  updateGoalBtn.addEventListener("click", () => {
    const val = parseInt(weeklyTargetInput.value);
    if (val > 0) {
      weeklyGoal = val;
      localStorage.setItem("weeklyGoal", weeklyGoal);
      updateStatsOverview();
    }
  });
}

document.addEventListener("DOMContentLoaded", init);

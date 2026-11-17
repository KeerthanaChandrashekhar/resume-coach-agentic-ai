const WEBHOOK_URL = 'http://localhost:5678/webhook/resume-coach';
const HISTORY_KEY = 'resume_coach_history_v3';
const ACTIVE_ID_KEY = 'resume_coach_active_id_v3';

const ROLES = [
  { name: "Data Analyst", icon: "📊", desc: "SQL, Python, BI dashboards & metrics" },
  { name: "AI/ML Engineer", icon: "🧠", desc: "Deep learning, LLMs, PyTorch & pipelines" },
  { name: "Software Developer", icon: "💻", desc: "DSA, backend APIs, system design" },
  { name: "Web Developer", icon: "🌐", desc: "Frontend, React/JS, REST & databases" },
  { name: "Data Scientist", icon: "🔬", desc: "Statistics, modeling & experimentation" },
  { name: "Cloud Engineer", icon: "☁️", desc: "AWS/GCP, Docker, CI/CD & infrastructure" }
];

function getHistory() {
  try {
    const data = JSON.parse(localStorage.getItem(HISTORY_KEY));
    return Array.isArray(data) ? data : [];
  } catch (_) {
    return [];
  }
}

function saveHistory(list) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(list));
}

function getActiveSession() {
  const list = getHistory();
  if (!list.length) return null;
  const activeId = localStorage.getItem(ACTIVE_ID_KEY);
  return list.find(s => s.sessionId === activeId) || list.at(0) || null;
}

function setActiveSessionId(id) {
  localStorage.setItem(ACTIVE_ID_KEY, id);
}

function upsertSession(sessionObj) {
  const list = getHistory();
  const idx = list.findIndex(s => s.sessionId === sessionObj.sessionId);
  if (idx >= 0) list[idx] = sessionObj;
  else list.unshift(sessionObj);
  saveHistory(list);
  setActiveSessionId(sessionObj.sessionId);
}

function splitInitialResponse(rawText) {
  const text = String(rawText || "").trim();
  const qMatch = text.match(/(?:^|\n)(?:#{1,4}\s*)?(?:\*\*)?(?:Mock Interview\s*[-–:]?\s*)?Question\s*1(?:\s*of\s*5)?[:.\s\*\-]/i);
  if (qMatch && qMatch.index > 40) {
    return {
      resumeReport: text.slice(0, qMatch.index).trim(),
      firstQuestion: text.slice(qMatch.index).trim()
    };
  }
  return {
    resumeReport: text.replace(/\n?[^\n]*Ready for the mock interview[^\n]*$/i, "").trim(),
    firstQuestion: 'Your resume report is ready. When you want to begin the mock interview, say or type "ready".'
  };
}

function extractResumeScore(text) {
  const m100 = String(text).match(/(\d{1,3})\s*\/\s*100/);
  if (m100) return Math.min(100, parseInt(m100.at(1), 10));
  const m10 = String(text).match(/(?:score|rating)[^\d]{0,12}(\d{1,2}(?:\.\d)?)\s*\/\s*10/i);
  if (m10) return Math.round(parseFloat(m10.at(1)) * 10);
  return null;
}

function renderMarkdown(text) {
  const esc = s => String(s).replace(/[&<>]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
  let out = "", inList = false;
  for (const raw of String(text || "").split("\n")) {
    const line = esc(raw).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>");
    const bullet = line.match(/^\s*[-*•]\s+(.*)/);
    if (bullet) {
      if (!inList) { out += "<ul>"; inList = true; }
      out += "<li>" + bullet.at(1) + "</li>";
      continue;
    }
    if (inList) { out += "</ul>"; inList = false; }
    const heading = line.match(/^#{1,4}\s+(.*)/);
    if (heading) out += "<h4>" + heading.at(1) + "</h4>";
    else if (line.trim()) out += "<p>" + line + "</p>";
  }
  return out + (inList ? "</ul>" : "");
}

function stripMarkdown(text) {
  return String(text || "").replace(/[#*_`•-]/g, " ").replace(/\s+/g, " ").trim();
}

function downloadMarkdownFile(filename, content) {
  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

const NL = "\n";

function escapeHtml(s) {
  return String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

// Adds line icons to the sidebar on every page
const NAV_ICONS = {
  "index.html": '<path d="M12 16V4M7 9l5-5 5 5M4 16v4h16v-4"/>',
  "review.html": '<path d="M6 3h8l4 4v14H6zM14 3v4h4M9 12h6M9 16h6"/>',
  "interview.html": '<path d="M4 5h16v11H9l-5 4zM8 9h8M8 12h5"/>',
  "profile.html": '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>'
};
const navSvg = p => '<svg class="nav-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + p + '</svg>';
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".nav-link").forEach(a => {
    const icon = NAV_ICONS[a.getAttribute("href")];
    if (icon) a.insertAdjacentHTML("afterbegin", navSvg(icon));
  });
  const badge = document.querySelector(".brand-badge");
  if (badge) badge.innerHTML = navSvg('<path d="M3 8h18v11H3zM9 8V5h6v3M3 13h18"/>');
});

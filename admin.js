// ===== DEFAULT CATEGORIES =====
const defaultCategories = [
  { title:"YouTube",    desc:"Watch, share, and discover videos from creators worldwide.", emoji:"▶️", color:"#ff0000", bg:"#fff0f0", link:"https://youtube.com" },
  { title:"Facebook",   desc:"Connect with friends, family, and communities you care about.", emoji:"📘", color:"#1877f2", bg:"#f0f4ff", link:"https://facebook.com" },
  { title:"Instagram",  desc:"Share photos and videos, explore stories and reels.", emoji:"📸", color:"#e1306c", bg:"#fff0f5", link:"https://instagram.com" },
  { title:"GitHub",     desc:"Host code, collaborate on projects, and build software together.", emoji:"🐙", color:"#24292e", bg:"#f6f8fa", link:"https://github.com" },
  { title:"Telegram",   desc:"Fast, secure messaging and channels for every interest.", emoji:"✈️", color:"#0088cc", bg:"#f0f8ff", link:"https://telegram.org" },
  { title:"Twitter / X",desc:"Join the conversation on news, trends, and ideas.", emoji:"🐦", color:"#000000", bg:"#f7f7f7", link:"https://x.com" },
  { title:"LinkedIn",   desc:"Build your professional network and find opportunities.", emoji:"💼", color:"#0a66c2", bg:"#f0f6ff", link:"https://linkedin.com" },
  { title:"Reddit",     desc:"Dive into communities for every topic imaginable.", emoji:"🤖", color:"#ff4500", bg:"#fff4f0", link:"https://reddit.com" },
  { title:"TikTok",     desc:"Short-form videos, trends, and creative content.", emoji:"🎵", color:"#010101", bg:"#f5f5f5", link:"https://tiktok.com" },
  { title:"Discord",    desc:"Chat, voice, and community spaces for every group.", emoji:"🎮", color:"#5865f2", bg:"#f2f3ff", link:"https://discord.com" }
];

// ===== API HELPERS =====
async function loadData() {
  try {
    const res = await fetch("/api/data");
    return await res.json();
  } catch {
    return { categories: [], settings: {}, appearance: {} };
  }
}

async function saveData(patch) {
  await fetch("/api/data", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch)
  });
}

// In-memory state
let state = { categories: [], settings: {}, appearance: {} };

async function getCategories() {
  return state.categories.length ? state.categories : defaultCategories;
}

async function saveCategories(cats) {
  state.categories = cats;
  await saveData({ categories: cats });
}

// ===== RENDER ADMIN CARDS =====
async function renderAdminCards() {
  const list = document.getElementById("adminCardList");
  const cats = await getCategories();
  list.innerHTML = "";

  if (cats.length === 0) {
    list.innerHTML = `<p style="color:var(--text-muted);padding:1rem;">No categories yet. Add one!</p>`;
    return;
  }

  cats.forEach((cat, i) => {
    const div = document.createElement("div");
    div.className = "admin-card";
    div.innerHTML = `
      <div class="admin-card-logo" style="background:${cat.bg};color:${cat.color}">
        ${cat.image ? `<img src="${cat.image}" alt="${cat.title}" />` : cat.emoji}
      </div>
      <div class="admin-card-info">
        <strong>${cat.title}</strong>
        <span>${cat.link}</span>
        <span style="margin-top:2px">${cat.desc}</span>
      </div>
      <div class="admin-card-actions">
        <button class="btn-icon" title="Edit" onclick="openEdit(${i})">✏️</button>
        <button class="btn-icon delete" title="Delete" onclick="deleteCategory(${i})">🗑️</button>
        <button class="btn-icon" title="Move Up" onclick="moveCard(${i},-1)">⬆️</button>
        <button class="btn-icon" title="Move Down" onclick="moveCard(${i},1)">⬇️</button>
      </div>
    `;
    list.appendChild(div);
  });
}

// ===== DELETE =====
async function deleteCategory(i) {
  if (!confirm("Delete this category?")) return;
  const cats = await getCategories();
  cats.splice(i, 1);
  await saveCategories(cats);
  renderAdminCards();
}

// ===== REORDER =====
async function moveCard(i, dir) {
  const cats = await getCategories();
  const j = i + dir;
  if (j < 0 || j >= cats.length) return;
  [cats[i], cats[j]] = [cats[j], cats[i]];
  await saveCategories(cats);
  renderAdminCards();
}

// ===== MODAL =====
const overlay    = document.getElementById("modalOverlay");
const form       = document.getElementById("categoryForm");
const modalTitle = document.getElementById("modalTitle");

let currentImageBase64 = "";

const catImageInput = document.getElementById("catImage");
const previewImg    = document.getElementById("previewImg");
const placeholder   = document.getElementById("uploadPlaceholder");
const uploadArea    = document.getElementById("uploadArea");

document.getElementById("browseBtn").addEventListener("click", () => catImageInput.click());

catImageInput.addEventListener("change", () => {
  const file = catImageInput.files[0];
  if (file) readImageFile(file);
});

uploadArea.addEventListener("dragover", e => { e.preventDefault(); uploadArea.classList.add("dragover"); });
uploadArea.addEventListener("dragleave", () => uploadArea.classList.remove("dragover"));
uploadArea.addEventListener("drop", e => {
  e.preventDefault(); uploadArea.classList.remove("dragover");
  const file = e.dataTransfer.files[0];
  if (file && file.type.startsWith("image/")) readImageFile(file);
});

document.getElementById("clearImg").addEventListener("click", () => {
  currentImageBase64 = "";
  previewImg.hidden = true;
  previewImg.src = "";
  placeholder.hidden = false;
  catImageInput.value = "";
});

function readImageFile(file) {
  const reader = new FileReader();
  reader.onload = e => {
    currentImageBase64 = e.target.result;
    previewImg.src = currentImageBase64;
    previewImg.hidden = false;
    placeholder.hidden = true;
  };
  reader.readAsDataURL(file);
}

function setPreview(src) {
  if (src) {
    currentImageBase64 = src;
    previewImg.src = src;
    previewImg.hidden = false;
    placeholder.hidden = true;
  } else {
    currentImageBase64 = "";
    previewImg.src = "";
    previewImg.hidden = true;
    placeholder.hidden = false;
  }
}

function openModal() { overlay.classList.add("open"); }
function closeModal() {
  overlay.classList.remove("open");
  form.reset();
  setPreview("");
  document.getElementById("editIndex").value = "-1";
  modalTitle.textContent = "Add Category";
}

document.getElementById("openAddModal").addEventListener("click", () => {
  modalTitle.textContent = "Add Category";
  document.getElementById("editIndex").value = "-1";
  openModal();
});
document.getElementById("modalClose").addEventListener("click", closeModal);
document.getElementById("cancelModal").addEventListener("click", closeModal);
overlay.addEventListener("click", e => { if (e.target === overlay) closeModal(); });

async function openEdit(i) {
  const cats = await getCategories();
  const cat = cats[i];
  modalTitle.textContent = "Edit Category";
  document.getElementById("editIndex").value = i;
  document.getElementById("catTitle").value = cat.title;
  document.getElementById("catDesc").value  = cat.desc;
  document.getElementById("catEmoji").value = cat.emoji || "";
  document.getElementById("catLink").value  = cat.link;
  document.getElementById("catBg").value    = cat.bg;
  document.getElementById("catColor").value = cat.color;
  setPreview(cat.image || "");
  openModal();
}

// ===== FORM SUBMIT =====
form.addEventListener("submit", async e => {
  e.preventDefault();
  const cats = await getCategories();
  const idx  = parseInt(document.getElementById("editIndex").value);
  const entry = {
    title: document.getElementById("catTitle").value.trim(),
    desc:  document.getElementById("catDesc").value.trim(),
    emoji: document.getElementById("catEmoji").value.trim(),
    link:  document.getElementById("catLink").value.trim(),
    bg:    document.getElementById("catBg").value,
    color: document.getElementById("catColor").value,
    image: currentImageBase64 || "",
  };
  if (idx === -1) { cats.push(entry); } else { cats[idx] = entry; }
  await saveCategories(cats);
  renderAdminCards();
  closeModal();
});

// ===== TABS =====
const tabTitles = { categories: "Categories", settings: "Site Settings", appearance: "Appearance" };

document.querySelectorAll(".nav-item[data-tab]").forEach(btn => {
  btn.addEventListener("click", e => {
    e.preventDefault();
    const tab = btn.dataset.tab;
    document.querySelectorAll(".nav-item").forEach(n => n.classList.remove("active"));
    btn.classList.add("active");
    document.querySelectorAll(".tab-content").forEach(t => t.classList.remove("active"));
    document.getElementById("tab-" + tab).classList.add("active");
    document.getElementById("tabTitle").textContent = tabTitles[tab];
  });
});

// ===== SETTINGS =====
function loadSettings() {
  const s = state.settings || {};
  document.getElementById("siteName").value     = s.siteName     || "FAYDA";
  document.getElementById("siteTagline").value  = s.siteTagline  || "Your Social Directory";
  document.getElementById("heroSubtitle").value = s.heroSubtitle || "All your essential links in one beautiful place.";
  document.getElementById("footerText").value   = s.footerText   || "© 2026 FAYDA. Built with ❤️";
}

async function saveSettings() {
  const s = {
    siteName:     document.getElementById("siteName").value,
    siteTagline:  document.getElementById("siteTagline").value,
    heroSubtitle: document.getElementById("heroSubtitle").value,
    footerText:   document.getElementById("footerText").value,
  };
  state.settings = s;
  await saveData({ settings: s });
  const msg = document.getElementById("settingsSaved");
  msg.hidden = false;
  setTimeout(() => msg.hidden = true, 3000);
}

// ===== APPEARANCE =====
function loadAppearance() {
  const a = state.appearance || {};
  document.getElementById("accentColor").value  = a.accent    || "#6366f1";
  document.getElementById("accent2Color").value = a.accent2   || "#8b5cf6";
  document.getElementById("heroStart").value    = a.heroStart || "#6366f1";
  document.getElementById("heroEnd").value      = a.heroEnd   || "#ec4899";
}

async function saveAppearance() {
  const a = {
    accent:    document.getElementById("accentColor").value,
    accent2:   document.getElementById("accent2Color").value,
    heroStart: document.getElementById("heroStart").value,
    heroEnd:   document.getElementById("heroEnd").value,
  };
  state.appearance = a;
  await saveData({ appearance: a });
  const msg = document.getElementById("appearanceSaved");
  msg.hidden = false;
  setTimeout(() => msg.hidden = true, 3000);
}

// ===== DARK MODE =====
const darkToggle = document.getElementById("darkToggle");
const html = document.documentElement;
const savedTheme = localStorage.getItem("theme");
if (savedTheme) { html.setAttribute("data-theme", savedTheme); darkToggle.textContent = savedTheme === "dark" ? "☀️" : "🌙"; }
darkToggle.addEventListener("click", () => {
  const next = html.getAttribute("data-theme") === "dark" ? "light" : "dark";
  html.setAttribute("data-theme", next);
  darkToggle.textContent = next === "dark" ? "☀️" : "🌙";
  localStorage.setItem("theme", next);
});

// ===== MOBILE SIDEBAR =====
document.getElementById("sidebarToggle").addEventListener("click", () => {
  document.getElementById("sidebar").classList.toggle("open");
});

// ===== INIT =====
(async () => {
  state = await loadData();
  if (!state.categories || state.categories.length === 0) {
    state.categories = defaultCategories;
  }
  renderAdminCards();
  loadSettings();
  loadAppearance();
})();

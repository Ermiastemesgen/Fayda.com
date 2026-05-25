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

// ===== RENDER CARDS =====
function renderCards(data) {
  const grid = document.getElementById("categoryGrid");
  const noResults = document.getElementById("noResults");
  grid.innerHTML = "";

  if (data.length === 0) {
    noResults.hidden = false;
    return;
  }
  noResults.hidden = true;

  data.forEach(cat => {
    const a = document.createElement("a");
    a.className = "card";
    a.href = cat.link;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.setAttribute("aria-label", `Open ${cat.title}`);
    a.innerHTML = `
      <div class="card-logo" style="background:${cat.bg}; color:${cat.color};">
        ${cat.image ? `<img src="${cat.image}" alt="${cat.title}" style="width:100%;height:100%;object-fit:cover;border-radius:12px;" />` : cat.emoji}
      </div>
      <div class="card-title">${cat.title}</div>
      <div class="card-desc">${cat.desc}</div>
      <div class="card-arrow">Visit →</div>
    `;
    grid.appendChild(a);
  });
}

// ===== APPLY SETTINGS & APPEARANCE =====
function applySettings(settings) {
  if (!settings) return;
  if (settings.siteName)    { document.title = settings.siteName + " - Your Social Directory"; document.querySelector(".brand-name").textContent = settings.siteName; }
  if (settings.siteTagline) { document.querySelector(".hero-content h1").innerHTML = `Discover Your Favorite <span class="gradient-text">${settings.siteTagline}</span>`; }
  if (settings.heroSubtitle){ document.querySelector(".hero-content p").textContent = settings.heroSubtitle; }
  if (settings.footerText)  { document.querySelector(".footer p").textContent = settings.footerText; }
}

function applyAppearance(appearance) {
  if (!appearance) return;
  if (appearance.accent)  document.documentElement.style.setProperty("--accent",  appearance.accent);
  if (appearance.accent2) document.documentElement.style.setProperty("--accent2", appearance.accent2);
  if (appearance.heroStart || appearance.heroEnd) {
    const s = appearance.heroStart || "#6366f1";
    const e = appearance.heroEnd   || "#ec4899";
    document.querySelector(".hero").style.background = `linear-gradient(135deg, ${s} 0%, ${e} 100%)`;
  }
}

// ===== SEARCH =====
let allCategories = [];
document.getElementById("searchInput").addEventListener("input", function () {
  const q = this.value.toLowerCase().trim();
  const filtered = allCategories.filter(c =>
    c.title.toLowerCase().includes(q) || c.desc.toLowerCase().includes(q)
  );
  renderCards(filtered);
});

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

// ===== MOBILE MENU =====
const menuBtn    = document.getElementById("menuBtn");
const mobileMenu = document.getElementById("mobileMenu");
menuBtn.addEventListener("click", () => mobileMenu.classList.toggle("open"));
mobileMenu.querySelectorAll("a").forEach(a => a.addEventListener("click", () => mobileMenu.classList.remove("open")));

// ===== CONTACT FORM =====
function handleSubmit(e) {
  e.preventDefault();
  const btn = e.target.querySelector("button");
  btn.textContent = "Sent ✓";
  btn.style.background = "linear-gradient(135deg, #10b981, #059669)";
  btn.disabled = true;
  e.target.reset();
  setTimeout(() => { btn.textContent = "Send Message"; btn.style.background = ""; btn.disabled = false; }, 3000);
}

// ===== INIT — fetch from server =====
(async () => {
  try {
    const res  = await fetch("/api/data");
    const data = await res.json();
    allCategories = (data.categories && data.categories.length) ? data.categories : defaultCategories;
    applySettings(data.settings);
    applyAppearance(data.appearance);
  } catch {
    allCategories = defaultCategories;
  }
  renderCards(allCategories);
})();

const header = document.querySelector(".site-header");
const menuBtn = document.querySelector(".menu-btn");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function onScroll() {
  if (!header) return;
  const solid = window.scrollY > 40;
  header.classList.toggle("is-solid", solid);
  header.classList.toggle("is-top", !solid);
}
onScroll();
window.addEventListener("scroll", onScroll, { passive: true });

if (menuBtn && header) {
  menuBtn.addEventListener("click", () => {
    const open = header.classList.toggle("open");
    menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
  });
  header.querySelectorAll(".nav a").forEach((link) => {
    link.addEventListener("click", () => {
      header.classList.remove("open");
      menuBtn.setAttribute("aria-expanded", "false");
    });
  });
}

/* Diagonal wipe buttons — mirrors Marea's filled/outlined mask hover */
function enhanceWipeButtons() {
  document.querySelectorAll(".pill, .wipe-btn").forEach((el) => {
    if (el.dataset.wipe === "ready") return;
    const label = el.textContent.trim();
    if (!label) return;
    el.dataset.wipe = "ready";
    el.classList.add("wipe-btn");
    if (el.classList.contains("light")) el.classList.add("wipe-btn--light");
    el.innerHTML =
      `<span class="wipe-btn__base"><span>${label}</span></span>` +
      `<span class="wipe-btn__reveal" aria-hidden="true"><span>${label}</span></span>`;
  });
}
enhanceWipeButtons();

/* Sticky stack z-index order */
document.querySelectorAll(".stack").forEach((stack) => {
  [...stack.children].forEach((item, index) => {
    item.classList.add("stack-item");
    item.style.zIndex = String(index + 1);
  });
});

/* Scroll reveals — Framer-style opacity + 10px rise */
function setupReveals() {
  const targets = document.querySelectorAll(
    [
      ".section > .eyebrow",
      ".section > .display",
      ".section > .lede",
      ".section > .welcome-photo",
      ".section > .welcome-note",
      ".stack-item",
      ".center-btn",
      ".quote-block > *",
      ".product",
      ".split-quote > *",
      ".note",
      ".bento > img",
      ".package",
      ".house",
      ".film",
      ".faq-wrap > *",
      ".booking-copy",
      ".booking-card",
      ".trio img",
      ".team > *",
      ".menu-card",
      ".two-col > *",
      ".steps > *",
      ".loc",
      ".acc",
    ].join(", ")
  );

  targets.forEach((el, i) => {
    if (el.classList.contains("stack-item") || el.classList.contains("film")) {
      el.classList.add("reveal-fade");
    } else {
      el.classList.add("reveal");
    }
    if (
      el.classList.contains("stack-item") ||
      el.classList.contains("product") ||
      el.classList.contains("menu-card") ||
      el.classList.contains("package") ||
      el.classList.contains("note")
    ) {
      el.style.setProperty("--reveal-delay", `${(i % 6) * 60}ms`);
    }
  });

  const revealEls = document.querySelectorAll(".reveal, .reveal-fade");

  if (reduceMotion) {
    revealEls.forEach((el) => el.classList.add("is-in"));
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        io.unobserve(entry.target);
      });
    },
    { threshold: 0.14, rootMargin: "0px 0px -6% 0px" }
  );

  revealEls.forEach((el) => io.observe(el));
}
setupReveals();

/* Hero entrance */
if (!reduceMotion) {
  document.querySelector(".hero")?.classList.add("hero-animate");
  requestAnimationFrame(() => {
    document.querySelector(".hero")?.classList.add("is-ready");
  });
}

/* FAQ accordion with height animation */
document.querySelectorAll(".acc").forEach((item) => {
  const btn = item.querySelector("button");
  const answer = item.querySelector(".answer");
  if (!btn || !answer) return;

  const wrap = document.createElement("div");
  wrap.className = "answer-wrap";
  answer.replaceWith(wrap);
  wrap.appendChild(answer);

  if (item.classList.contains("open")) {
    wrap.style.gridTemplateRows = "1fr";
    btn.setAttribute("aria-expanded", "true");
  } else {
    wrap.style.gridTemplateRows = "0fr";
    btn.setAttribute("aria-expanded", "false");
  }

  btn.addEventListener("click", () => {
    const parent = item.parentElement;
    const willOpen = !item.classList.contains("open");

    parent.querySelectorAll(".acc").forEach((el) => {
      el.classList.remove("open");
      const otherBtn = el.querySelector("button");
      const otherWrap = el.querySelector(".answer-wrap");
      if (otherBtn) otherBtn.setAttribute("aria-expanded", "false");
      if (otherWrap) otherWrap.style.gridTemplateRows = "0fr";
    });

    if (willOpen) {
      item.classList.add("open");
      wrap.style.gridTemplateRows = "1fr";
      btn.setAttribute("aria-expanded", "true");
    }
  });
});

/* Forms */
document.querySelectorAll("form[data-form]").forEach((form) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const note = form.querySelector(".form-note");
    if (note) {
      note.classList.remove("show");
      void note.offsetWidth;
      note.classList.add("show");
    }
    form.reset();
  });
});

/* Subtle magnetic hover for compact CTAs */
if (!reduceMotion) {
  document.querySelectorAll(".wipe-btn:not(.wipe-btn--light)").forEach((btn) => {
    btn.addEventListener("pointermove", (e) => {
      const r = btn.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width - 0.5) * 4;
      const y = ((e.clientY - r.top) / r.height - 0.5) * 4;
      btn.style.transform = `translate(${x}px, ${y}px)`;
    });
    btn.addEventListener("pointerleave", () => {
      btn.style.transform = "";
    });
  });
}

/* Soft hero entrance + parallax */
const hero = document.querySelector(".hero");
const heroImgs = hero ? [...hero.querySelectorAll("img")] : [];
let heroReady = reduceMotion;
function renderHeroMotion() {
  if (!hero || !heroImgs.length) return;
  const y = Math.min(window.scrollY, hero.offsetHeight || 0);
  const shift = reduceMotion ? 0 : y * 0.22;
  const scale = heroReady ? 1 : 1.045;
  heroImgs.forEach((img) => {
    img.style.transform = `translate3d(0, ${shift}px, 0) scale(${scale})`;
  });
}
if (!reduceMotion && hero) {
  heroImgs.forEach((img) => {
    img.style.transition = "transform 1.35s cubic-bezier(0.22, 1, 0.36, 1)";
  });
  requestAnimationFrame(() => {
    heroReady = true;
    renderHeroMotion();
    setTimeout(() => {
      heroImgs.forEach((img) => {
        img.style.transition = "transform 0.05s linear";
      });
    }, 1400);
  });
}
window.addEventListener("scroll", renderHeroMotion, { passive: true });
renderHeroMotion();

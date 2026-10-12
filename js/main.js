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

/* Scroll reveals — slide in when entering, slide out when leaving */
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
    if (el.classList.contains("stack-item")) {
      el.classList.add("reveal-fade");
    } else {
      el.classList.add("reveal");
      el.classList.add(i % 2 === 0 ? "reveal-left" : "reveal-right");
    }
    if (
      el.classList.contains("stack-item") ||
      el.classList.contains("product") ||
      el.classList.contains("menu-card") ||
      el.classList.contains("package") ||
      el.classList.contains("note")
    ) {
      el.style.setProperty("--reveal-delay", `${(i % 6) * 50}ms`);
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
        entry.target.classList.toggle("is-in", entry.isIntersecting);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
  );

  revealEls.forEach((el) => io.observe(el));
}
setupReveals();

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

/* Hero entrance + smooth parallax (rAF) */
const hero = document.querySelector(".hero");
const heroImgs = hero ? [...hero.querySelectorAll("img")] : [];
const heroCopy = hero?.querySelector(".hero-copy");
const heroFoot = hero?.querySelector(".hero-foot");
let heroParallaxOn = false;
let heroTick = false;

function renderHeroMotion() {
  if (!hero || !heroImgs.length) return;

  const y = Math.max(0, window.scrollY);
  const h = hero.offsetHeight || window.innerHeight;
  const progress = Math.min(y / h, 1);

  if (!reduceMotion && heroParallaxOn) {
    heroImgs.forEach((img, i) => {
      const speed = 0.22 + i * 0.08;
      const shift = y * speed;
      img.style.transform = `translate3d(0, ${shift}px, 0) scale(1.08)`;
    });
  }

  if (heroCopy) {
    const fade = Math.max(0, 1 - progress * 1.35);
    const lift = reduceMotion ? 0 : progress * -48;
    heroCopy.style.opacity = String(fade);
    heroCopy.style.transform = `translate3d(0, ${lift}px, 0)`;
  }
  if (heroFoot) {
    const fade = Math.max(0, 1 - progress * 1.55);
    const lift = reduceMotion ? 0 : progress * -28;
    heroFoot.style.opacity = String(fade);
    heroFoot.style.transform = `translate3d(0, ${lift}px, 0)`;
  }
}

function onHeroScroll() {
  if (heroTick) return;
  heroTick = true;
  requestAnimationFrame(() => {
    heroTick = false;
    renderHeroMotion();
  });
}

if (hero && !reduceMotion) {
  hero.classList.add("hero-animate");
  requestAnimationFrame(() => {
    hero.classList.add("is-ready");
    heroImgs.forEach((img) => {
      img.style.transform = "translate3d(0, 0, 0) scale(1.08)";
    });
  });
  setTimeout(() => {
    hero.classList.add("is-parallax");
    heroParallaxOn = true;
    renderHeroMotion();
  }, 1450);
} else if (hero) {
  heroParallaxOn = true;
  renderHeroMotion();
}

window.addEventListener("scroll", onHeroScroll, { passive: true });
window.addEventListener("resize", onHeroScroll, { passive: true });
renderHeroMotion();

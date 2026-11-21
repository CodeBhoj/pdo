/* PDO Academy — site interactions */
(function () {
  "use strict";
  document.documentElement.classList.remove("no-js");

  const WHATSAPP_NUMBER = "919129974945";

  /* ---------- Navbar: scroll state + mobile menu ---------- */
  const nav = document.getElementById("nav");
  const toggle = document.getElementById("navToggle");
  const links = document.getElementById("navLinks");

  const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 10);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  const setMenu = (open) => {
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    links.classList.toggle("is-open", open);
    nav.classList.toggle("menu-open", open);
  };
  toggle.addEventListener("click", () => setMenu(toggle.getAttribute("aria-expanded") !== "true"));
  links.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });

  /* ---------- Active nav link while scrolling ---------- */
  const navAnchors = [...links.querySelectorAll('a[href^="#"]:not(.btn)')];
  const sections = navAnchors.map((a) => document.querySelector(a.getAttribute("href"))).filter(Boolean);
  if ("IntersectionObserver" in window) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navAnchors.forEach((a) => a.classList.toggle("is-active", a.getAttribute("href") === "#" + entry.target.id));
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach((s) => spy.observe(s));
  }

  /* ---------- Reveal on scroll ---------- */
  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    reveals.forEach((el, i) => {
      // small stagger for siblings
      el.style.transitionDelay = (i % 4) * 70 + "ms";
      io.observe(el);
    });
  } else {
    reveals.forEach((el) => el.classList.add("is-visible"));
  }

  /* ---------- Lightbox ---------- */
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightboxImg");
  const closeBtn = document.getElementById("lightboxClose");
  let lastFocus = null;

  const openLightbox = (src, alt) => {
    lastFocus = document.activeElement;
    lightboxImg.src = src;
    lightboxImg.alt = alt || "";
    lightbox.hidden = false;
    document.body.style.overflow = "hidden";
    closeBtn.focus();
  };
  const closeLightbox = () => {
    lightbox.hidden = true;
    lightboxImg.src = "";
    document.body.style.overflow = "";
    if (lastFocus) lastFocus.focus();
  };
  document.querySelectorAll("[data-full]").forEach((fig) => {
    fig.tabIndex = 0;
    fig.setAttribute("role", "button");
    const img = fig.querySelector("img");
    const open = () => openLightbox(fig.dataset.full, img && img.alt);
    fig.addEventListener("click", open);
    fig.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); } });
  });
  closeBtn.addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", (e) => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !lightbox.hidden) closeLightbox(); });

  /* ---------- English quiz ---------- */
  const QUESTIONS = [
    {
      q: "Choose the correct sentence:",
      options: ["I am having two brothers.", "I have two brothers.", "I am have two brothers."],
      answer: 1,
      why: "“Have” (to possess) is a state verb, so we don’t use it in the -ing form. Say: I have two brothers.",
    },
    {
      q: "Which one sounds natural?",
      options: ["He is senior than me.", "He is senior to me.", "He is more senior than me."],
      answer: 1,
      why: "Words like senior, junior, superior and inferior take “to”, not “than”.",
    },
    {
      q: "Pick the correct question:",
      options: ["Where you are going?", "Where are you going?", "Where you going are?"],
      answer: 1,
      why: "In questions, the helping verb comes before the subject: Where ARE you going?",
    },
    {
      q: "Fill in the blank: “I have been living here ___ 2020.”",
      options: ["for", "since", "from"],
      answer: 1,
      why: "Use “since” with a point in time (2020, Monday) and “for” with a duration (5 years).",
    },
    {
      q: "Which is correct?",
      options: ["Please discuss about this topic.", "Please discuss this topic.", "Please discuss on this topic."],
      answer: 1,
      why: "“Discuss” never takes “about” or “on”. We simply discuss something.",
    },
    {
      q: "How do you politely ask for help?",
      options: ["Give me your pen.", "Could you lend me your pen, please?", "You give pen."],
      answer: 1,
      why: "“Could you… please?” is polite and professional — perfect for class, office and interviews.",
    },
  ];

  const qEl = document.getElementById("quizQ");
  const optsEl = document.getElementById("quizOptions");
  const explainEl = document.getElementById("quizExplain");
  const nextBtn = document.getElementById("quizNext");
  const countEl = document.getElementById("quizCount");
  const scoreEl = document.getElementById("quizScore");
  const barEl = document.getElementById("quizBar");
  let idx = 0, score = 0;

  function renderQuestion() {
    const item = QUESTIONS[idx];
    countEl.textContent = `Question ${idx + 1} / ${QUESTIONS.length}`;
    barEl.style.width = (idx / QUESTIONS.length) * 100 + "%";
    qEl.textContent = item.q;
    explainEl.textContent = "";
    nextBtn.hidden = true;
    optsEl.innerHTML = "";
    item.options.forEach((text, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "quiz__opt";
      b.textContent = text;
      b.addEventListener("click", () => choose(i, b));
      optsEl.appendChild(b);
    });
  }

  function choose(i, btn) {
    const item = QUESTIONS[idx];
    const buttons = optsEl.querySelectorAll(".quiz__opt");
    buttons.forEach((b) => (b.disabled = true));
    buttons[item.answer].classList.add("is-correct");
    if (i === item.answer) {
      score++;
      scoreEl.textContent = score;
      explainEl.innerHTML = "<strong>✅ Correct!</strong> " + item.why;
    } else {
      btn.classList.add("is-wrong");
      explainEl.innerHTML = "<strong>❌ Not quite.</strong> " + item.why;
    }
    nextBtn.textContent = idx === QUESTIONS.length - 1 ? "See my result →" : "Next question →";
    nextBtn.hidden = false;
    nextBtn.focus();
  }

  function renderResult() {
    barEl.style.width = "100%";
    countEl.textContent = "Completed";
    const msg =
      score === QUESTIONS.length ? "Excellent! You’re ready for our Fluency & Confidence batch." :
      score >= 4 ? "Great job! A little practice will make you truly fluent." :
      "Good start! Our Foundation batch will fix these mistakes in a week.";
    qEl.textContent = "";
    optsEl.innerHTML = `
      <div class="quiz__result">
        <div class="big">${score}/${QUESTIONS.length}</div>
        <p>${msg}</p>
      </div>`;
    explainEl.textContent = "";
    nextBtn.hidden = true;

    const actions = document.createElement("div");
    actions.style.cssText = "display:flex;flex-wrap:wrap;gap:.7rem;justify-content:center";
    const join = document.createElement("a");
    join.className = "btn btn--gold";
    join.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Hello Rohit Sir, I scored ${score}/${QUESTIONS.length} in the PDO English check. I want to join a demo class.`)}`;
    join.target = "_blank";
    join.rel = "noopener";
    join.textContent = "Join a free demo";
    const again = document.createElement("button");
    again.type = "button";
    again.className = "btn btn--ghost";
    again.textContent = "Try again ↻";
    again.addEventListener("click", () => { idx = 0; score = 0; scoreEl.textContent = 0; renderQuestion(); });
    actions.append(join, again);
    optsEl.querySelector(".quiz__result").appendChild(actions);
  }

  nextBtn.addEventListener("click", () => {
    idx++;
    if (idx < QUESTIONS.length) renderQuestion();
    else renderResult();
  });
  renderQuestion();

  /* ---------- Word of the day ---------- */
  const WORDS = [
    { w: "Confident", meta: "/ˈkɒn.fɪ.dənt/ · adjective · आत्मविश्वासी", m: "Feeling sure about your own abilities.", e: "She gave a confident answer in the interview." },
    { w: "Articulate", meta: "/ɑːˈtɪk.jə.lət/ · adjective · स्पष्टवक्ता", m: "Able to express ideas clearly and effectively.", e: "He is an articulate speaker who keeps everyone engaged." },
    { w: "Persevere", meta: "/ˌpɜː.sɪˈvɪər/ · verb · डटे रहना", m: "To keep trying even when something is difficult.", e: "If you persevere, your English will improve every day." },
    { w: "Etiquette", meta: "/ˈet.ɪ.ket/ · noun · शिष्टाचार", m: "The rules of polite behaviour in society.", e: "Good email etiquette creates a professional image." },
    { w: "Eloquent", meta: "/ˈel.ə.kwənt/ · adjective · वाक्पटु", m: "Speaking in a fluent, powerful and persuasive way.", e: "Her eloquent speech won the competition." },
    { w: "Initiative", meta: "/ɪˈnɪʃ.ə.tɪv/ · noun · पहल", m: "The ability to act and take charge without being told.", e: "Take the initiative and speak first in group discussions." },
    { w: "Punctual", meta: "/ˈpʌŋk.tʃu.əl/ · adjective · समय का पाबंद", m: "Doing things or arriving at the expected time.", e: "Being punctual shows respect for other people’s time." },
    { w: "Resilient", meta: "/rɪˈzɪl.i.ənt/ · adjective · लचीला, मज़बूत", m: "Able to recover quickly from difficulties.", e: "Resilient learners treat mistakes as lessons." },
  ];
  const wotd = document.querySelector(".wotd");
  const wEl = document.getElementById("wotdWord");
  const metaEl = document.getElementById("wotdMeta");
  const mEl = document.getElementById("wotdMeaning");
  const eEl = document.getElementById("wotdExample");
  const dayIndex = Math.floor(Date.now() / 86400000) % WORDS.length;
  let wi = dayIndex;

  function showWord(i) {
    const d = WORDS[i];
    wEl.textContent = d.w;
    metaEl.textContent = d.meta;
    mEl.textContent = d.m;
    eEl.textContent = `“${d.e}”`;
  }
  showWord(wi);
  document.getElementById("wotdNext").addEventListener("click", () => {
    wotd.classList.add("is-swapping");
    setTimeout(() => {
      wi = (wi + 1) % WORDS.length;
      showWord(wi);
      wotd.classList.remove("is-swapping");
    }, 250);
  });

  /* ---------- Enquiry form → WhatsApp ---------- */
  const form = document.getElementById("enquiryForm");
  const errEl = document.getElementById("formError");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const name = String(data.get("name") || "").trim();
    const phone = String(data.get("phone") || "").replace(/[^\d+]/g, "");
    const goal = String(data.get("goal") || "");

    if (name.length < 2) { errEl.textContent = "Please enter your name."; form.name.focus(); return; }
    if (phone.replace(/\D/g, "").length < 10) { errEl.textContent = "Please enter a valid 10-digit mobile number."; form.phone.focus(); return; }
    errEl.textContent = "";

    const text = `Hello Rohit Sir! 👋\nI want to book a free demo class at PDO.\n\nName: ${name}\nPhone: ${phone}\nGoal: ${goal}`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, "_blank", "noopener");
  });

  /* ---------- Footer year ---------- */
  document.getElementById("year").textContent = new Date().getFullYear();
})();

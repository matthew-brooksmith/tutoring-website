// ============================================================
// Physics & Maths Tutoring — booking form + availability widget
//
// Loaded after availability.js, which defines window.AVAILABILITY.
// Two parts below:
//   1. Slot picker  — turns AVAILABILITY into the list of clickable
//                      time slots under "When are you available?"
//   2. Booking form — validates the form, applies simple spam
//                      guards, and posts the enquiry to Web3Forms.
// ============================================================

// Web3Forms access keys are meant to be public: this key can only
// ever deliver mail to the address it was registered with, so
// exposing it in client-side code is how the service is designed
// to work (see https://web3forms.com/). It is not a secret.
const WEB3FORMS_ACCESS_KEY = "b1e5dd23-90ef-490f-9d9b-e9e4ecdb8d79";
const SITE_NAME = "Physics & Maths Tutoring";

const DAY_KEYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

// ---- 1. Slot picker ----------------------------------------------------

function isoDate(d) {
  return (
    d.getFullYear() +
    "-" +
    String(d.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(d.getDate()).padStart(2, "0")
  );
}

function prettyDate(d) {
  return d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
}

function slotStart(date, range) {
  const [h, m] = range.split("-")[0].split(":").map(Number);
  const d = new Date(date);
  d.setHours(h, m, 0, 0);
  return d;
}

function prettyTime(range) {
  const [from, to] = range.split("-");
  const fmt = (t) => {
    let [h, m] = t.split(":").map(Number);
    const ampm = h >= 12 ? "pm" : "am";
    h = h % 12 || 12;
    return m ? `${h}.${String(m).padStart(2, "0")}${ampm}` : `${h}${ampm}`;
  };
  return `${fmt(from)}–${fmt(to)}`;
}

function buildSlots() {
  const cfg = window.AVAILABILITY;
  if (!cfg) return [];

  const now = new Date();
  const cutoff = new Date(now.getTime() + (cfg.minNoticeHours || 0) * 3600 * 1000);
  const days = (cfg.weeksAhead || 3) * 7;
  const out = [];

  for (let i = 0; i <= days; i++) {
    const date = new Date(now);
    date.setDate(now.getDate() + i);
    date.setHours(0, 0, 0, 0);

    const iso = isoDate(date);
    if ((cfg.unavailableDates || []).includes(iso)) continue;

    const weekly = (cfg.slots && cfg.slots[DAY_KEYS[date.getDay()]]) || [];
    const extra = (cfg.extraSlots && cfg.extraSlots[iso]) || [];
    const times = [...new Set([...weekly, ...extra])].sort();

    const usable = times.filter((t) => slotStart(date, t) > cutoff);
    if (usable.length) out.push({ iso, date, times: usable });
  }
  return out;
}

function renderSlots() {
  const host = document.getElementById("slot-picker");
  const days = buildSlots();
  host.innerHTML = "";

  if (!days.length) {
    host.innerHTML = '<p class="hint">I need to update my availability!</p>';
  }

  days.forEach((day) => {
    const wrap = document.createElement("div");
    wrap.className = "slot-day";

    const h = document.createElement("h4");
    h.textContent = prettyDate(day.date);
    wrap.appendChild(h);

    const list = document.createElement("div");
    list.className = "slot-list";

    day.times.forEach((range) => {
      const id = `slot-${day.iso}-${range.replace(/[:\-]/g, "")}`;
      const label = document.createElement("label");
      label.className = "slot";
      label.innerHTML =
        `<input type="checkbox" id="${id}" data-slot value="${prettyDate(day.date)}, ${prettyTime(range)}">` +
        `<span>${prettyTime(range)}</span>`;
      list.appendChild(label);
    });

    wrap.appendChild(list);
    host.appendChild(wrap);
  });

  const cfg = window.AVAILABILITY || {};
  const note = document.getElementById("tz-note");
  const bits = [];
  if (cfg.timezoneLabel) bits.push(`All times shown in ${cfg.timezoneLabel}.`);
  if (cfg.note) bits.push(cfg.note);
  note.textContent = bits.join(" ");
}

renderSlots();

// ---- 2. Booking form -----------------------------------------------------

const form = document.getElementById("booking-form");
const status = document.getElementById("status");
const btn = document.getElementById("submit-btn");
const keyIsSet = WEB3FORMS_ACCESS_KEY && !WEB3FORMS_ACCESS_KEY.startsWith("YOUR_");

if (!keyIsSet) {
  document.getElementById("setup-warning").classList.add("show");
}

// Lightweight, client-side spam guards. None of these are strong
// security controls on their own (a determined bot can bypass all
// of them) — they exist to cut down casual/automated spam before
// it reaches the Web3Forms free-tier submission quota. The form's
// own honeypot field ("botcheck") and Web3Forms' own spam filtering
// are the other two layers.
const PAGE_LOADED_AT = Date.now(); // used with MIN_FILL_SECONDS below
const MIN_FILL_SECONDS = 4; // reject submits faster than a human could type
const COOLDOWN_SECONDS = 30; // minimum gap between submits
const MAX_PER_SESSION = 5; // hard cap per page load
let lastSubmitAt = 0,
  submitCount = 0;

// Escapes user-supplied text before it's inserted via innerHTML in
// show(), preventing stored/reflected XSS from the name/phone fields.
function esc(s) {
  return String(s).replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c],
  );
}

function show(kind, msg) {
  status.className = `status show ${kind}`;
  status.innerHTML = msg;
  status.scrollIntoView({ block: "nearest", behavior: "smooth" });
}

function validPhone(v) {
  const digits = v.replace(/[^\d]/g, "");
  return digits.length >= 9 && digits.length <= 15;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  status.className = "status";

  const fd = new FormData(form);
  const name = (fd.get("name") || "").toString().trim();
  const phone = (fd.get("phone") || "").toString().trim();
  const message = (fd.get("message") || "").toString().trim();
  const area = fd.get("subject_area");
  const level = fd.get("level");

  if (!area) return show("err", "Please pick a subject.");
  if (!level) return show("err", "Please pick a level.");
  if (!name) return show("err", "Please add your name.");
  if (!validPhone(phone))
    return show("err", "That phone number doesn't look right — please check it.");
  if (message.length < 5) return show("err", "Please add a line about what you're after.");

  if ((fd.get("botcheck") || "").toString().trim()) {
    return show("ok", "Thanks — that's with me.");
  }

  if ((Date.now() - PAGE_LOADED_AT) / 1000 < MIN_FILL_SECONDS) {
    return show("err", "That came through unusually quickly — please try sending it again.");
  }

  const gap = (Date.now() - lastSubmitAt) / 1000;
  if (lastSubmitAt && gap < COOLDOWN_SECONDS) {
    return show(
      "info",
      `That's just been sent — give it ${Math.ceil(COOLDOWN_SECONDS - gap)} seconds before sending another.`,
    );
  }
  if (submitCount >= MAX_PER_SESSION) {
    return show(
      "info",
      "That's several requests already. Please email me at " +
        "<a href='mailto:REMOVED'>REMOVED</a> instead.",
    );
  }

  const times = [...document.querySelectorAll("[data-slot]:checked")].map((i) => i.value);

  if (!keyIsSet) {
    return show(
      "info",
      "This form isn't connected yet. In the meantime, please email me at " +
        "<a href='mailto:REMOVED'>REMOVED</a>.",
    );
  }

  const payload = {
    access_key: WEB3FORMS_ACCESS_KEY,
    subject: `📚 ${area} (${level}) enquiry from ${name}`,
    from_name: SITE_NAME,
    Name: name,
    Phone: phone,
    Email: fd.get("email") || "—",
    "Subject area": area,
    Level: level,
    "Preferred times": times.length ? times.join("  •  ") : "Not specified",
    Message: message,
    "Sent at": new Date().toLocaleString("en-GB"),
    botcheck: fd.get("botcheck") || "",
  };

  lastSubmitAt = Date.now();
  submitCount++;

  btn.disabled = true;
  btn.textContent = "Sending…";

  try {
    const res = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();

    if (data.success) {
      show(
        "ok",
        `Thanks ${esc(name.split(" ")[0])} — that's with me. ` +
          `I'll text ${esc(phone)} to confirm, usually within a day. ` +
          `Remember your first session is free.`,
      );
      form.reset();
      document.querySelectorAll("[data-slot]:checked").forEach((i) => (i.checked = false));
    } else {
      throw new Error(data.message || "Unknown error");
    }
  } catch (err) {
    show(
      "err",
      "Something went wrong sending that — sorry. Please email me at " +
        "<a href='mailto:REMOVED'>REMOVED</a> instead and I'll pick it up straight away.",
    );
  } finally {
    btn.disabled = false;
    btn.textContent = "Send my request";
  }
});

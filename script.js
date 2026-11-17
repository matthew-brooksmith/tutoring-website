// ============================================================
// Physics & Maths Tutoring — booking form
//
// Two parts below:
//   1. Date picker  — sets the range of the "Request a date" calendar.
//   2. Booking form — validates the form, applies simple spam
//                      guards, and posts the enquiry to Web3Forms.
// ============================================================

// Web3Forms access keys are meant to be public: this key can only
// ever deliver mail to the address it was registered with, so
// exposing it in client-side code is how the service is designed
// to work (see https://web3forms.com/). It is not a secret.
const WEB3FORMS_ACCESS_KEY = "763ce697-e4e4-4fe2-865c-2cba71d5956d";
const SITE_NAME = "Physics & Maths Tutoring";

// ---- 1. Request-date calendar ------------------------------------------

// Formats a "YYYY-MM-DD" string as e.g. "Tuesday 24 November 2026".
function prettyDate(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function isoDate(d) {
  return (
    d.getFullYear() +
    "-" +
    String(d.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(d.getDate()).padStart(2, "0")
  );
}

// The calendar only offers dates from tomorrow up to 3 months ahead.
const dateInput = document.getElementById("request-date");
const MIN_DATE = new Date();
MIN_DATE.setDate(MIN_DATE.getDate() + 1);
const MAX_DATE = new Date();
MAX_DATE.setMonth(MAX_DATE.getMonth() + 3);
dateInput.min = isoDate(MIN_DATE);
dateInput.max = isoDate(MAX_DATE);

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
      "That's several requests already — I'll be in touch about the ones you've sent.",
    );
  }

  const requestedDate = (fd.get("request_date") || "").toString();
  if (requestedDate && (requestedDate < dateInput.min || requestedDate > dateInput.max)) {
    return show("err", "Please pick a date between tomorrow and three months from now.");
  }

  if (!keyIsSet) {
    return show(
      "info",
      "This form isn't connected yet — please try again later.",
    );
  }

  const payload = {
    access_key: WEB3FORMS_ACCESS_KEY,
    subject: `📚 ${area} (${level}) enquiry from ${name}`,
    from_name: SITE_NAME,
    Name: name,
    Phone: phone,
    "Subject area": area,
    Level: level,
    "Requested date": requestedDate ? prettyDate(requestedDate) : "Not specified",
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
          `I'll text ${esc(phone)} to confirm, usually within a day.`,
      );
      form.reset();
    } else {
      throw new Error(data.message || "Unknown error");
    }
  } catch (err) {
    show(
      "err",
      "Something went wrong sending that — sorry. Please try again in a few minutes.",
    );
  } finally {
    btn.disabled = false;
    btn.textContent = "Send my request";
  }
});

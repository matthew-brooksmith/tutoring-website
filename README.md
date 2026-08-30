# Physics & Maths Tutoring — website

A single-page site styled after your poster. Everything lives in `index.html`;
the only file you'll edit regularly is `availability.js`.

```
tutoring-website/
├── index.html        the whole site (design, content, booking form)
├── availability.js   your bookable time slots — edit this one
├── README.md         this file
└── assets/
    ├── matt.jpg      your photo
    └── poster.png    the original poster (kept for reference)
```

To preview it right now, just double-click `index.html`. It opens in your browser
and works offline — the only thing that needs the internet is the form.

---

## 1. Connect the booking form (two minutes, do this first)

The form is built but not yet wired to anything. Until you do this step it shows an
orange "setup needed" notice and tells visitors to WhatsApp you instead.

1. Go to **[web3forms.com](https://web3forms.com)**.
2. Enter your email address (`mmattssmith@outlook.com`) and press the button. No account, no card.
3. They email you an **access key** — a long string like `a1b2c3d4-...`.
4. Open `index.html`, scroll to near the bottom, and find this line:

   ```js
   const WEB3FORMS_ACCESS_KEY = "YOUR_WEB3FORMS_ACCESS_KEY_HERE";
   ```

5. Replace the placeholder with your key, keeping the quote marks. Save.

Test it by filling in the form yourself. You should get an email within seconds
containing the name, phone number, subject, level, preferred times and message.

> **Is it safe to have the key in public code?** Yes. A Web3Forms key can only
> deliver to the email address it was registered with, so the worst anyone can do
> with it is send you a message — which is what the form is for anyway. The free
> tier covers 250 submissions a month.

---

## 2. Getting a notification on your phone

You asked for a text. Worth being straight with you about how this actually works:
UK networks (EE, O2, Vodafone, Three) don't run public email-to-SMS gateways the way
US carriers do, so "email arrives → free text lands" isn't reliably available here.

Three realistic options, cheapest first:

### Option A — Push notification (free, recommended)

Functionally identical to a text: your phone buzzes within seconds, on the lock screen.

- **Outlook app (iOS/Android):** open the booking email → tap the sender → **Add to
  VIP** (or star the sender). Then Settings → Notifications → turn on **VIP / Focused
  only** so routine email stays quiet and these don't.
- Make sure Outlook has notifications enabled in your phone's system settings, and
  set the alert style to **Banner + Sound**.

The booking email subject line is built to stand out: `📚 Physics (A-Level) enquiry from Alex Taylor`.

### Option B — Zapier or Make (paid, genuine SMS)

Create a zap: *New matching email in Outlook* → *Send SMS*. Zapier's SMS action is on
their paid tiers (roughly £15–20/month), which is a lot for this. Only worth it if you
want a real text and don't want to touch code.

### Option C — Twilio (genuine SMS, ~£1/month + ~4p per text)

The proper solution, but it needs a small server-side function — and GitHub Pages is
static-only, so it can't run one. If you later move hosting to Netlify, Vercel or
Cloudflare Pages (all free, all take a custom domain), say the word and I'll write the
function. It's about 20 lines.

**My honest suggestion:** start with Option A. It costs nothing, takes two minutes, and
in practice a VIP push notification reaches you just as fast as a text would.

---

## 3. Updating your availability

Open `availability.js`. It's commented and there's nothing to break.

```js
slots: {
  monday:    ["16:00-17:00", "17:00-18:00", "18:00-19:00"],
  tuesday:   ["16:00-17:00", "17:00-18:00"],
  wednesday: [],                              // not available
  ...
}
```

- **Times are 24-hour**, written `"start-end"`. The site converts them to
  friendly form (`4pm–5pm`) automatically.
- This is your **repeating weekly pattern**. The site turns it into real dates for the
  next three weeks, and rolls forward on its own — you don't need to touch it weekly.
- **Going away?** Add the dates to `unavailableDates` and those days vanish:
  ```js
  unavailableDates: ["2026-08-25", "2026-08-26"],
  ```
- **Free at an unusual time?** Add it to `extraSlots`:
  ```js
  extraSlots: { "2026-08-29": ["14:00-15:00"] },
  ```
- `minNoticeHours: 12` hides anything less than 12 hours away, so nobody books you
  for tonight. Change the number to taste.
- `weeksAhead: 3` controls how far forward the picker looks.

Save the file, refresh the page, and the slots update. If the site is already live,
you'll need to push the change (step 4).

There's always a **"None of these work / I'm flexible"** option below the slots, so a
stale availability list never costs you an enquiry.

---

## 4. Putting it online with GitHub Pages

Free, and it takes a custom domain later.

1. Create a free account at [github.com](https://github.com) if you don't have one.
2. Make a new **public** repository. Name it `tutoring-site` (anything is fine).
3. On the repo page choose **Add file → Upload files**, then drag in `index.html`,
   `availability.js`, `README.md` and the `assets` folder. Commit.
4. Go to **Settings → Pages**. Under *Source* choose **Deploy from a branch**, pick
   `main` and `/ (root)`, save.
5. Wait a minute or two. Your site appears at
   `https://YOUR-USERNAME.github.io/tutoring-site/`.

To update anything later: edit the file locally, then upload it again the same way
(or use GitHub Desktop, which makes it one click).

### Adding your domain when you buy one

1. Buy the domain — Namecheap, Cloudflare Registrar and Gandi are all reasonable.
   Something like `mattsmithtutoring.co.uk`.
2. In GitHub: **Settings → Pages → Custom domain**, enter the domain, save.
   Tick **Enforce HTTPS** once it becomes available.
3. At your registrar, add these DNS records:

   | Type  | Name  | Value                    |
   |-------|-------|--------------------------|
   | A     | `@`   | `185.199.108.153`        |
   | A     | `@`   | `185.199.109.153`        |
   | A     | `@`   | `185.199.110.153`        |
   | A     | `@`   | `185.199.111.153`        |
   | CNAME | `www` | `YOUR-USERNAME.github.io`|

4. DNS takes anywhere from ten minutes to a few hours to propagate. Then HTTPS
   turns on by itself.

---

## 5. Things you might want to change

All in `index.html`:

| What | Where to look |
|------|---------------|
| Your bio / intro paragraph | the `<div class="hero">` block, `class="role"` |
| Qualifications | the `Qualifications` card |
| Short reviews | the `What students say` card — add more `<blockquote class="quote">` lines |
| Featured review | the `<figure class="featured-review">` block below the two cards |
| Teaching approach | the `How I teach` section |
| Topics covered | the `What I cover` section |
| Phone number | search for `447923670931` — it appears seven times |
| Footer logos | replace `assets/cern.png` / `assets/imperial.png`; sizes are set by `.logo-cern` and `.logo-imperial` in the CSS |
| Colours | the `:root` block at the top of the `<style>` — sampled from your poster |
| Photo | replace `assets/matt.jpg` (portrait orientation works best) |

**Adding pricing later:** you chose to leave rates off for now, which is a fair call —
it keeps the conversation open. If you change your mind, copy the structure of the
`How I teach` section and drop it in above the booking form.

---

## 6. Security

A static site has a small attack surface — there's no database, no login, no server-side
code to exploit. The realistic risks are **form abuse** and **the personal data you collect**,
and that's where the protections are aimed.

### What's built in

| Protection | What it does |
|---|---|
| **Content Security Policy** | An allow-list in the `<head>`. The page can only load fonts from Google and images from itself, and — the important one — can only *send* data to `api.web3forms.com`. Nothing can quietly post enquiries elsewhere. |
| **`form-action 'none'`** | Stops any injected form from POSTing to an attacker's server. |
| **Output escaping** | The confirmation message repeats the visitor's name back to them. That text is escaped, so a name containing HTML can't run as code. |
| **Honeypot field** | A hidden input real people never see. If it's filled in, the submission is silently dropped — and shown a fake success, so bots don't learn to work around it. |
| **Timing trap** | Submissions arriving under 4 seconds after page load are rejected. Bots fill forms instantly; people don't. |
| **Rate limit** | 30 seconds between sends, 5 per session. Blunts scripted flooding. |
| **Length caps** | Every field has a `maxlength`, so nobody can paste a megabyte into your inbox. |
| **`rel="noopener noreferrer"`** | External links can't manipulate the page they came from, and don't leak your URL. |
| **Referrer policy** | Only your domain, not the full URL, is shared with sites people click through to. |

### What you still need to do

1. **Tick "Enforce HTTPS"** in GitHub Pages settings once your domain is verified.
   Without it the site is reachable over plain HTTP and form data isn't encrypted in transit.
2. **Turn on 2FA on your GitHub account.** Realistically this is your biggest risk —
   anyone with access to your repo can change the site itself, and no amount of
   in-page security helps with that.
3. **Keep the availability file boring.** Don't put anything in `availability.js`
   you wouldn't want public; it's served as plain text to anyone who looks.

### Two things I can't fix from inside the page

- **Clickjacking.** Preventing your site being embedded in a hostile iframe needs a real
  HTTP header (`X-Frame-Options` or CSP `frame-ancestors`), and GitHub Pages doesn't let
  you set headers. Moving to Netlify or Cloudflare Pages would allow it. The practical
  risk here is very low — there's nothing on the page worth hijacking a click for.
- **Your access key is public.** It has to be, because the form runs in the browser.
  It can only deliver to your email, so the worst case is someone using it to spam
  *you*. If that ever happens, generate a fresh key at web3forms.com and paste in the
  new one — the old one stops working.

### If spam ever becomes a problem

The invisible defences handle ordinary bots. For a determined one, add Cloudflare
Turnstile — it's free and takes about five minutes:

1. Sign up at [cloudflare.com](https://cloudflare.com) → Turnstile → add a site.
2. Add `<script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>`
   to the `<head>`, and add `https://challenges.cloudflare.com` to the `script-src` and
   `frame-src` lines of the Content Security Policy.
3. Drop `<div class="cf-turnstile" data-sitekey="YOUR_SITE_KEY"></div>` just above the
   submit button.
4. Web3Forms validates it automatically.

I'd hold off until you actually see spam. Every extra step between a student and
sending an enquiry costs you enquiries.

### A note on data protection

Most of your enquiries will come from **under-18s or their parents**, and you'll be
holding names and mobile numbers. Under UK GDPR that's personal data, and children's
data is treated with extra care. Nothing onerous applies at your scale, but sensibly:

- Only collect what you need — the form asks for the minimum already.
- Delete enquiries you didn't take on rather than keeping them indefinitely.
- Don't reuse those numbers for marketing. The form promises you won't, so don't.

If you ever start a mailing list or take payments through the site, that changes and
you'd want a proper privacy policy.

---

## 7. Worth knowing

- **Spam:** the form has a hidden honeypot field that catches most bots. If anything
  does get through, Web3Forms has a spam filter you can switch on in their dashboard.
- **The photo:** currently 433×548px, which is fine but a little soft on large screens.
  If you have the original at higher resolution, drop it in as `assets/matt.jpg`.
- **Legal bits:** as a sole trader tutoring in the UK you don't need a privacy policy
  for a form this simple, but if you start collecting emails for marketing, you will.
- **Fonts** load from Google Fonts. If they're ever blocked, the page falls back to
  system fonts and still looks fine.

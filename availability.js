// Attached directly to `window` (not `const`/`let`) because script.js reads
// it as window.AVAILABILITY — a plain top-level const/let does NOT become a
// window property, so the picker would silently show no times without this.
window.AVAILABILITY = {
  timezoneLabel: "UK time (BST/GMT)",
  weeksAhead: 3,
  minNoticeHours: 12,

  slots: {
    monday: ["16:00-17:00", "17:00-18:00", "18:00-19:00"],
    tuesday: ["16:00-17:00", "17:00-18:00"],
    wednesday: [],
    thursday: ["16:00-17:00", "17:00-18:00", "18:00-19:00"],
    friday: ["16:00-17:00"],
    saturday: ["10:00-11:00", "11:00-12:00", "12:00-13:00"],
    sunday: ["10:00-11:00", "11:00-12:00"],
  },

  unavailableDates: [],

  extraSlots: {},

  note: 'Can\'t see a time that works? Pick "None of these" below and tell me what suits you — I can usually be flexible.',
};

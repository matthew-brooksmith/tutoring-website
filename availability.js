// Attached directly to `window` (not `const`/`let`) because script.js reads
// it as window.AVAILABILITY — a plain top-level const/let does NOT become a
// window property, so the picker would silently show no times without this.
window.AVAILABILITY = {
  timezoneLabel: "UK time (BST/GMT)",
  weeksAhead: 3,
  minNoticeHours: 12,

  slots: {
    monday: [],
    tuesday: ["18:00-19:00"],
    wednesday: [],
    thursday: ["18:00-19:00"],
    friday: [],
    saturday: [],
    sunday: [],
  },

  unavailableDates: [],

  extraSlots: {},

  note: "If there are no times listed here that suit you, please message me to arrange something.",
};

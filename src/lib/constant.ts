
export const DEFAULT_ADMIN_EMAIL = "admin@admin.com";

export const TASK_TYPES = [
  "Human Translation",
  "Translation PostEditing",
  "Literary Translation",
  "Text Classification",
  "Label Classification",
  "Translation Error Marking",
];

export const TASK_DOMAINS = [
  "General",
  "Healthcare & Medical",
  "Legal & Compliance",
  "Technology & Software",
  "Business & Finance",
  "Education & Research",
  "Media & Entertainment",
  "Manufacturing & Engineering",
  "Travel & Tourism",
  "Government & Public Sector",
  "E-commerce & Retail",
];

export const TIMEZONES = [
  "UTC-12:00",
  "UTC-11:00",
  "UTC-10:00",
  "UTC-09:00",
  "UTC-08:00",
  "UTC-07:00",
  "UTC-06:00",
  "UTC-05:00",
  "UTC-04:00",
  "UTC-03:00",
  "UTC-02:00",
  "UTC-01:00",
  "UTC+00:00",
  "UTC+01:00",
  "UTC+02:00",
  "UTC+03:00",
  "UTC+04:00",
  "UTC+05:00",
  "UTC+06:00",
  "UTC+07:00",
  "UTC+08:00",
  "UTC+09:00",
  "UTC+10:00",
  "UTC+11:00",
  "UTC+12:00",
];

export const ERROR_CATEGORIES = [
  "Grammar",
  "Spelling",
  "Punctuation",
  "Terminology",
  "Style",
  "Consistency",
  "Cultural Context",
  "Formatting",
  "Omission",
  "Addition",
  "Mistranslation",
  "Untranslated Text",
];

export const ERROR_SEVERITIES = [
  {
    value: "minor",
    label: "Minor",
    description: "Small issues that don't significantly impact meaning",
  },
  {
    value: "major",
    label: "Major",
    description: "Significant issues that affect clarity or accuracy",
  },
  {
    value: "critical",
    label: "Critical",
    description: "Severe issues that completely change or misrepresent meaning",
  },
];

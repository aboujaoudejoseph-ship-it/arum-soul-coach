export const WHEEL_AREAS = [
  { key: "health", label: "Health" },
  { key: "career", label: "Career" },
  { key: "finances", label: "Finances" },
  { key: "personal_growth", label: "Personal Growth" },
  { key: "fun", label: "Fun & Recreation" },
  { key: "relationships", label: "Relationships" },
  { key: "spirituality", label: "Spirituality" },
  { key: "environment", label: "Environment" },
] as const;

export type WheelValues = Partial<Record<(typeof WHEEL_AREAS)[number]["key"], number>>;

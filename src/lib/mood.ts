export const MOODS = [
  { key: "joyful", label: "Joyful", emoji: "😊", score: 9 },
  { key: "calm", label: "Calm", emoji: "😌", score: 8 },
  { key: "hopeful", label: "Hopeful", emoji: "🙂", score: 7 },
  { key: "tender", label: "Tender", emoji: "🥹", score: 6 },
  { key: "tired", label: "Tired", emoji: "😴", score: 4 },
  { key: "anxious", label: "Anxious", emoji: "😟", score: 3 },
] as const;

/** Falls back to a neutral score for any emotion string not in the list above. */
export function moodScore(emotion: string): number {
  return MOODS.find((m) => m.key === emotion)?.score ?? 5;
}

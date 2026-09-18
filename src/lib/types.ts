export type UserRole = "coach" | "client";

export interface Profile {
  id: string;
  role: UserRole;
  name: string;
  email: string;
  coach_id: string | null;
  avatar_url: string | null;
  goals: string | null;
  notes: string | null;
  created_at: string;
}

export interface Exercise {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  icon: string | null;
  active: boolean;
  created_at: string;
}

export interface Assignment {
  id: string;
  client_id: string;
  exercise_id: string;
  assigned_by: string | null;
  assigned_at: string;
  locked: boolean;
}

export interface Submission {
  id: string;
  client_id: string;
  exercise_id: string;
  payload: Record<string, unknown>;
  created_at: string;
}

export interface MoodCheckin {
  id: string;
  client_id: string;
  emotion: string;
  note: string | null;
  date: string;
  created_at: string;
}

export interface Streak {
  client_id: string;
  current: number;
  longest: number;
  last_activity_date: string | null;
}

/** Generated-style Database type, hand-maintained for now (kept small on purpose). */
export interface Database {
  public: {
    Tables: {
      users: { Row: Profile; Insert: Partial<Profile>; Update: Partial<Profile> };
      exercises: { Row: Exercise; Insert: Partial<Exercise>; Update: Partial<Exercise> };
      assignments: { Row: Assignment; Insert: Partial<Assignment>; Update: Partial<Assignment> };
      submissions: { Row: Submission; Insert: Partial<Submission>; Update: Partial<Submission> };
      mood_checkins: { Row: MoodCheckin; Insert: Partial<MoodCheckin>; Update: Partial<MoodCheckin> };
      streaks: { Row: Streak; Insert: Partial<Streak>; Update: Partial<Streak> };
    };
  };
}

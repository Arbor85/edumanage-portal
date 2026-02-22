
export enum AppView {
  ROOMS = 'rooms',
  SUBJECTS = 'subjects',
  SCHEDULE = 'schedule',
  ALERTS = 'alerts',
  PROFILE = 'profile',
  EDIT_ROOM = 'edit_room',
  ADD_SUBJECT = 'add_subject',
  TEACHING_STUFFS = 'teaching_stuffs',
  ADD_TEACHING_STUFF = 'add_teaching_stuff',
  EDIT_TEACHING_STUFF = 'edit_teaching_stuff',
  EDIT_SUBJECT = 'edit_subject',
  ADD_SCHEDULE = 'add_schedule',
  GYM_ACTIVE_WORKOUT = 'gym_active_workout',
  GYM_EXPLORE = 'gym_explore',
  GYM_HISTORY = 'gym_history',
  GYM_SPLIT_PLANNER = 'gym_split_planner',
  GYM_SPLIT_PLANS = 'gym_split_plans',
  GYM_EDIT_SPLIT_PLAN = 'gym_edit_split_plan',
  PLATFORM_SUBSCRIPTION_HISTORY = 'platform_subscription_history',
  MENTEES = 'mentees',
  ACCEPT_MENTEE_INVITATION = 'accept_mentee_invitation'
}

export interface Room {
  id: string;
  name: string;
  location: string;
  size: string;
  purpose: string;
  status: 'Analyzed' | 'Active' | 'Maintenance';
  capacity: number;
  building: string;
}

export interface Subject {
  id: string
  name: string
  code: string
  specialization: string
  fieldOfStudy: string
  department: string
  term: string
  mode: string
  degree: string
  purpose: number
  teachingStuffs: string[]
  size: number
  hours: number
  groups: number
  fill: number
  roomCodes: any[]
  duration: string
}

export interface TeachingStuff {
  id: string;
  name: string;
  analized: boolean;
  phrase: string;
}

export interface ScheduleItem {
  id: string;
  type: 'Lecture' | 'Lab' | 'Seminar';
  subjectName: string;
  roomName: string;
  day: string;
  startTime: string; // e.g., "08:00"
  durationHours: number;
}

export interface Mentee {
  id: string;
  name: string;
  email_address: string;
  invite_key: string;
  status: 'invited' | 'accepted' | 'deleted';
  created: string;
}


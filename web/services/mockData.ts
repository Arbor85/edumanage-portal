
import { Room, Subject, ScheduleItem } from '../types';

export const mockRooms: Room[] = [
  {
    id: '1',
    name: 'Alpha 101',
    location: 'Engineering North • Unit B',
    size: '60 Seats',
    purpose: 'Lecture',
    status: 'Analyzed',
    capacity: 60,
    building: 'Engineering North'
  },
  {
    id: '2',
    name: 'Lab 402-C',
    location: 'Science Plaza • Unit A',
    size: '30 Workstations',
    purpose: 'Comp. Lab',
    status: 'Active',
    capacity: 30,
    building: 'Science Plaza'
  },
  {
    id: '3',
    name: 'Seminar Room 12',
    location: 'Arts Block • Level 3',
    size: '15 Seats',
    purpose: 'Seminar',
    status: 'Maintenance',
    capacity: 15,
    building: 'Arts Block'
  }
];

export const mockSubjects: Subject[] = [
  { id: 's1', name: 'Data Structures', code: 'CS-101', term: 'Fall 2024', specialization: 'CS', department: 'Comp. Science', field: 'Engineering' },
  { id: 's2', name: 'Machine Learning', code: 'AI-302', term: 'Fall 2024', specialization: 'AI', department: 'Comp. Science', field: 'Engineering' },
  { id: 's3', name: 'Linear Algebra', code: 'MA-210', term: 'Spring 2024', specialization: 'MA', department: 'Pure Science', field: 'Mathematics' },
  { id: 's4', name: 'UX Design Fundamentals', code: 'DS-204', term: 'Fall 2024', specialization: 'DS', department: 'Arts & Humanities', field: 'Design' },
  { id: 's5', name: 'Database Systems', code: 'CS-205', term: 'Fall 2024', specialization: 'CS', department: 'Comp. Science', field: 'Engineering' }
];

export const mockSchedule: ScheduleItem[] = [
  { id: 'sch1', type: 'Lecture', subjectName: 'CS101: Data Structures', roomName: 'Room 402', day: 'Mon', startTime: '08:00', durationHours: 1.5 },
  { id: 'sch2', type: 'Lab', subjectName: 'CS102: Physics Lab', roomName: 'Lab B-12', day: 'Mon', startTime: '10:00', durationHours: 2 },
  { id: 'sch3', type: 'Seminar', subjectName: 'Academic Writing', roomName: 'Hall A', day: 'Tue', startTime: '09:00', durationHours: 1 },
  { id: 'sch4', type: 'Lecture', subjectName: 'MA201: Calculus II', roomName: 'Room 301', day: 'Tue', startTime: '13:00', durationHours: 2 }
];

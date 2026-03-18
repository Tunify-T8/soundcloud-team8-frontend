export interface MockUser {
  id: string;
  email: string;
  password: string;
  displayName: string;
  dateOfBirth: { month: number; day: number; year: number };
  gender: 'Male' | 'Female';
}

export const MOCK_USERS: MockUser[] = [
  {
    id: '1',
    email: 'test@tunify.com',
    password: 'Password123',
    displayName: 'TunifyTest',
    dateOfBirth: { month: 1, day: 15, year: 1995 },
    gender: 'Female',
  },
  {
    id: '2',
    email: 'sara@tunify.com',
    password: 'Sara1234!',
    displayName: 'sara.music',
    dateOfBirth: { month: 6, day: 20, year: 1998 },
    gender: 'Female',
  },
  {
    id: '3',
    email: 'ahmed@tunify.com',
    password: 'Ahmed5678!',
    displayName: 'ahmed.beats',
    dateOfBirth: { month: 3, day: 10, year: 2000 },
    gender: 'Male',
  },
  {
    id: '4',
    email: 'nada@tunify.com',
    password: 'Nada9999!',
    displayName: 'nada.plays',
    dateOfBirth: { month: 9, day: 5, year: 1997 },
    gender: 'Female',
  },
  {
    id: '5',
    email: 'test@soundcloud.com',
    password: 'Password123',
    displayName: 'SCTester',
    dateOfBirth: { month: 12, day: 1, year: 1990 },
    gender: 'Male',
  },
];

export const findUserByEmail = (email: string): MockUser | undefined =>
  MOCK_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase());

export const isKnownEmail = (email: string): boolean =>
  !!findUserByEmail(email);

export const isDisplayNameTaken = (name: string): boolean =>
  MOCK_USERS.some((u) => u.displayName.toLowerCase() === name.toLowerCase());
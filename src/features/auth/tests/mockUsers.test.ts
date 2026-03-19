// ============================================================
// mockUsers.test.ts
// Location: src/features/auth/tests/mockUsers.test.ts
// ============================================================

import { describe, it, expect } from 'vitest';
import {
  MOCK_USERS,
  findUserByEmail,
  isKnownEmail,
  isDisplayNameTaken,
} from '../data/mockUsers';

// ════════════════════════════════════════════════════════════════
// MOCK_USERS DATA INTEGRITY
// ════════════════════════════════════════════════════════════════
describe('mockUsers — data integrity', () => {
  it('MOCK_USERS array is not empty', () => {
    expect(MOCK_USERS.length).toBeGreaterThan(0);
  });

  it('MOCK_USERS has at most 5 entries', () => {
    expect(MOCK_USERS.length).toBeLessThanOrEqual(5);
  });

  it('every user has an id', () => {
    for (let i = 0; i < MOCK_USERS.length; i++) {
      expect(MOCK_USERS[i].id).toBeTruthy();
    }
  });

  it('every user has an email', () => {
    for (let i = 0; i < MOCK_USERS.length; i++) {
      expect(MOCK_USERS[i].email).toBeTruthy();
    }
  });

  it('every user has a password', () => {
    for (let i = 0; i < MOCK_USERS.length; i++) {
      expect(MOCK_USERS[i].password).toBeTruthy();
    }
  });

  it('every user has a displayName', () => {
    for (let i = 0; i < MOCK_USERS.length; i++) {
      expect(MOCK_USERS[i].displayName).toBeTruthy();
    }
  });

  it('every user has a gender of Male or Female', () => {
    for (let i = 0; i < MOCK_USERS.length; i++) {
      expect(['Male', 'Female']).toContain(MOCK_USERS[i].gender);
    }
  });

  it('all user emails are unique', () => {
    const emails = MOCK_USERS.map((u) => u.email.toLowerCase());
    const uniqueEmails = new Set(emails);
    expect(uniqueEmails.size).toBe(MOCK_USERS.length);
  });

  it('all user ids are unique', () => {
    const ids = MOCK_USERS.map((u) => u.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(MOCK_USERS.length);
  });
});

// ════════════════════════════════════════════════════════════════
// findUserByEmail
// ════════════════════════════════════════════════════════════════
describe('findUserByEmail', () => {
  it('returns the correct user for a known email', () => {
    const user = findUserByEmail('test@tunify.com');
    expect(user).toBeDefined();
    expect(user?.email).toBe('test@tunify.com');
  });

  it('returns undefined for an unknown email', () => {
    const user = findUserByEmail('nobody@unknown.com');
    expect(user).toBeUndefined();
  });

  it('is case-insensitive — uppercase email still finds the user', () => {
    const user = findUserByEmail('TEST@TUNIFY.COM');
    expect(user).toBeDefined();
    expect(user?.email.toLowerCase()).toBe('test@tunify.com');
  });

  it('is case-insensitive — mixed case email still finds the user', () => {
    const user = findUserByEmail('Test@Tunify.Com');
    expect(user).toBeDefined();
  });

  it('returns undefined for empty string', () => {
    const user = findUserByEmail('');
    expect(user).toBeUndefined();
  });

  it('returns the correct user object with all fields', () => {
    const user = findUserByEmail('test@tunify.com');
    expect(user).toHaveProperty('id');
    expect(user).toHaveProperty('email');
    expect(user).toHaveProperty('password');
    expect(user).toHaveProperty('displayName');
    expect(user).toHaveProperty('gender');
  });

  it('finds every user in MOCK_USERS by their own email', () => {
    for (let i = 0; i < MOCK_USERS.length; i++) {
      const found = findUserByEmail(MOCK_USERS[i].email);
      expect(found).toBeDefined();
      expect(found?.id).toBe(MOCK_USERS[i].id);
    }
  });
});

// ════════════════════════════════════════════════════════════════
// isKnownEmail
// ════════════════════════════════════════════════════════════════
describe('isKnownEmail', () => {
  it('returns true for a known email', () => {
    expect(isKnownEmail('test@tunify.com')).toBe(true);
  });

  it('returns false for an unknown email', () => {
    expect(isKnownEmail('nobody@unknown.com')).toBe(false);
  });

  it('returns false for empty string', () => {
    expect(isKnownEmail('')).toBe(false);
  });

  it('is case-insensitive — uppercase still returns true', () => {
    expect(isKnownEmail('TEST@TUNIFY.COM')).toBe(true);
  });

  it('is case-insensitive — mixed case still returns true', () => {
    expect(isKnownEmail('Test@Tunify.Com')).toBe(true);
  });

  it('returns true for every user in MOCK_USERS', () => {
    for (let i = 0; i < MOCK_USERS.length; i++) {
      expect(isKnownEmail(MOCK_USERS[i].email)).toBe(true);
    }
  });

  it('returns false for a random string that is not an email', () => {
    expect(isKnownEmail('randomstring')).toBe(false);
  });
});

// ════════════════════════════════════════════════════════════════
// isDisplayNameTaken
// ════════════════════════════════════════════════════════════════
describe('isDisplayNameTaken', () => {
  it('returns true for a taken display name', () => {
    const takenName = MOCK_USERS[0].displayName;
    expect(isDisplayNameTaken(takenName)).toBe(true);
  });

  it('returns false for a free display name', () => {
    expect(isDisplayNameTaken('CompletelyFreeUsername999')).toBe(false);
  });

  it('returns false for empty string', () => {
    expect(isDisplayNameTaken('')).toBe(false);
  });

  it('is case-insensitive — uppercase name is still taken', () => {
    const takenName = MOCK_USERS[0].displayName.toUpperCase();
    expect(isDisplayNameTaken(takenName)).toBe(true);
  });

  it('is case-insensitive — lowercase name is still taken', () => {
    const takenName = MOCK_USERS[0].displayName.toLowerCase();
    expect(isDisplayNameTaken(takenName)).toBe(true);
  });

  it('returns true for every display name in MOCK_USERS', () => {
    for (let i = 0; i < MOCK_USERS.length; i++) {
      expect(isDisplayNameTaken(MOCK_USERS[i].displayName)).toBe(true);
    }
  });
});
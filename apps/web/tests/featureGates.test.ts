import { describe, it, expect } from 'vitest';
import { canAccessFeature, type FeatureGateUser } from '@parel/core/config/featureGates';

describe('canAccessFeature', () => {
  const noUser = null as FeatureGateUser | null;
  const lowLevel = { level: 1, role: 'USER', isPremium: false } as FeatureGateUser;
  const level3 = { level: 3, role: 'USER', isPremium: false } as FeatureGateUser;
  const level5 = { level: 5, role: 'USER', isPremium: false } as FeatureGateUser;
  const admin = { level: 1, role: 'ADMIN', isPremium: false } as FeatureGateUser;
  const premium = { level: 1, role: 'USER', isPremium: true } as FeatureGateUser;

  it('allows when user meets level requirement', () => {
    expect(canAccessFeature(level3, 'FLOW_BROWSER').allowed).toBe(true);
    expect(canAccessFeature(level3, 'INVITE').allowed).toBe(true);
    expect(canAccessFeature(level5, 'MARKETPLACE').allowed).toBe(true);
  });

  it('denies when level too low', () => {
    const r = canAccessFeature(lowLevel, 'FLOW_BROWSER');
    expect(r.allowed).toBe(false);
    expect(r.message).toContain('level 3');
  });

  it('DEEP_REPORT unlocks at level 5 (premium not wired)', () => {
    expect(canAccessFeature(level5, 'DEEP_REPORT').allowed).toBe(true);
    const r = canAccessFeature(lowLevel, 'DEEP_REPORT');
    expect(r.allowed).toBe(false);
    expect(r.message).toBe('Unlocks at level 5.');
  });

  it('priority: admin > level', () => {
    expect(canAccessFeature(admin, 'FLOW_BROWSER').allowed).toBe(true);
  });

  it('returns correct message for level gate', () => {
    expect(canAccessFeature(lowLevel, 'RPG').message).toBe('Unlocks at level 3.');
  });

  it('handles null user: returns allowed:false, Sign in required, no throw', () => {
    const r = canAccessFeature(noUser, 'FLOW_BROWSER');
    expect(r.allowed).toBe(false);
    expect(r.message).toBe('Sign in required.');
    expect(r.reason).toEqual({ custom: { message: 'Sign in required.' } });
  });

  it('canAccessFeature(undefined, FLOW_BROWSER) returns allowed:false without throwing', () => {
    const r = canAccessFeature(undefined, 'FLOW_BROWSER');
    expect(r.allowed).toBe(false);
    expect(r.message).toBe('Sign in required.');
  });

  it('lowLevel user with FLOW_BROWSER is deterministic', () => {
    const r = canAccessFeature(lowLevel, 'FLOW_BROWSER');
    expect(r.allowed).toBe(false);
    expect(r.message).toBe('Unlocks at level 3.');
  });
});

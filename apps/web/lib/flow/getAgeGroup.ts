import { getAgeGroup as getOnboardingAgeGroup } from '@parel/types/onboarding';

export type FlowAgeGroup = 'young' | 'mid' | 'mature' | 'unknown';

type GetAgeGroupInput = {
  ageGroupId?: string | null;
  birthYear?: number | null;
  dateOfBirth?: string | Date | null;
};

function ageFromDateOfBirth(dateOfBirth: string | Date, now = new Date()): number | null {
  const dob = new Date(dateOfBirth);
  if (Number.isNaN(dob.getTime())) return null;
  let age = now.getFullYear() - dob.getFullYear();
  const hasHadBirthdayThisYear =
    now.getMonth() > dob.getMonth() ||
    (now.getMonth() === dob.getMonth() && now.getDate() >= dob.getDate());
  if (!hasHadBirthdayThisYear) age -= 1;
  return age < 0 ? null : age;
}

function mapAgeToGroup(age: number): FlowAgeGroup {
  if (age < 25) return 'young';
  if (age >= 60) return 'mature';
  return 'mid';
}

/**
 * Coarse age bucket for safe UI tone selection.
 * Prefers existing onboarding ageGroup, then derives from birth fields when provided.
 */
export function getAgeGroup(input: GetAgeGroupInput): FlowAgeGroup {
  const normalized = getOnboardingAgeGroup(input.ageGroupId);
  if (normalized) {
    if (normalized.id === 'kid' || normalized.id === 'teen' || normalized.id === 'youngAdult') return 'young';
    if (normalized.id === 'senior') return 'mature';
    return 'mid';
  }

  if (typeof input.birthYear === 'number') {
    const age = new Date().getFullYear() - input.birthYear;
    if (age >= 0 && age <= 120) return mapAgeToGroup(age);
  }

  if (input.dateOfBirth) {
    const age = ageFromDateOfBirth(input.dateOfBirth);
    if (age != null) return mapAgeToGroup(age);
  }

  return 'unknown';
}

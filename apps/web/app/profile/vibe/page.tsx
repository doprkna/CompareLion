/**
 * My Vibe Page - User Onboarding Profile Display
 * v0.24.0 - Phase I: Glossary Layer
 * 
 * Shows user's onboarding answers with edit capability
 */

'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  getAgeGroup, 
  getRegion, 
  getTone, 
  getInterests,
  type OnboardingProfile 
} from '@/lib/types/onboarding';
import { Edit, Loader2, Sparkles, MapPin, Heart, MessageCircle } from 'lucide-react';

export default function MyVibePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<OnboardingProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated') {
      // Fetch onboarding profile
      fetch('/api/onboarding/submit')
        .then(res => res.json())
        .then(data => {
          if (data.success && data.data.profile) {
            setProfile(data.data.profile);
          }
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    }
  }, [status, router]);

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    );
  }

  if (!profile || !profile.onboardingCompleted) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="text-6xl mb-4">🤔</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            No vibe detected!
          </h1>
          <p className="text-gray-600 mb-6">
            You haven't completed onboarding yet. Let's set up your profile!
          </p>
          <button
            onClick={() => router.push('/onboarding')}
            className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition"
          >
            Start Onboarding
          </button>
        </div>
      </div>
    );
  }

  const ageGroup = getAgeGroup(profile.ageGroup);
  const region = getRegion(profile.region);
  const tone = getTone(profile.tone);
  const interests = getInterests(profile.interests);

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
            <Sparkles className="text-purple-500" size={36} />
            My Vibe
          </h1>
          <button
            onClick={() => router.push('/onboarding')}
            className="flex items-center gap-2 px-4 py-2 border-2 border-purple-500 text-purple-600 rounded-xl hover:bg-purple-50 transition"
          >
            <Edit size={16} />
            Edit My Vibe
          </button>
        </div>
        <p className="text-gray-600">
          Your personalized profile that helps us tailor questions just for you
        </p>
      </div>

      {/* Profile Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Age Group */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="text-4xl">{ageGroup?.emoji}</div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Age Group</h2>
              <p className="text-sm text-gray-600">Who you are</p>
            </div>
          </div>
          <div className="bg-white/50 rounded-xl p-4">
            <p className="font-semibold text-gray-900 mb-1">
              {ageGroup?.shortLabel || 'Not set'}
            </p>
            <p className="text-sm text-gray-600">
              {ageGroup?.desc || 'No description'}
            </p>
          </div>
        </div>

        {/* Region */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <MapPin className="text-blue-600" size={32} />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Region</h2>
              <p className="text-sm text-gray-600">Where you're from</p>
            </div>
          </div>
          <div className="bg-white/50 rounded-xl p-4">
            <p className="font-semibold text-gray-900 flex items-center gap-2">
              <span className="text-2xl">{region?.flag}</span>
              {region?.label.replace(region.flag, '').trim() || 'Not set'}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Questions tailored to your location
            </p>
          </div>
        </div>

        {/* Interests */}
        <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-2xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Heart className="text-pink-600" size={32} />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Interests</h2>
              <p className="text-sm text-gray-600">What you're into</p>
            </div>
          </div>
          <div className="bg-white/50 rounded-xl p-4">
            {interests.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {interests.map(interest => (
                  <span
                    key={interest.id}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-white rounded-full text-sm font-medium text-gray-700"
                  >
                    <span>{interest.emoji}</span>
                    <span>{interest.label}</span>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No interests selected</p>
            )}
          </div>
        </div>

        {/* Tone */}
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <MessageCircle className="text-orange-600" size={32} />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Tone</h2>
              <p className="text-sm text-gray-600">Your vibe</p>
            </div>
          </div>
          <div className="bg-white/50 rounded-xl p-4">
            <p className="font-semibold text-gray-900 mb-1">
              {tone?.emoji} {tone?.id || 'Not set'}
            </p>
            <p className="text-sm text-gray-600">
              {tone?.desc || 'No description'}
            </p>
          </div>
        </div>
      </div>

      {/* Info box */}
      <div className="mt-8 bg-purple-50 border-2 border-purple-200 rounded-2xl p-6">
        <div className="flex items-start gap-3">
          <Sparkles className="text-purple-500 mt-1" size={20} />
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">
              Why does this matter?
            </h3>
            <p className="text-sm text-gray-700">
              Your vibe helps us show you relevant questions, filter out stuff that doesn't apply to you
              (like "Is Brno nice?" if you're not from Czechia), and tailor the experience to match your personality.
              You can update this anytime!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}


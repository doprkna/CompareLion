"use client";
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Quote, 
  Upload, 
  Eye, 
  EyeOff,
  Coins,
  Gem,
  Star,
  Trophy,
  Clock,
  CheckCircle,
  History
} from 'lucide-react';

const initialProfile = {
  name: '',
  email: '',
  phone: '',
  language: '',
  country: '',
  dateOfBirth: '',
  avatarUrl: '',
  motto: '',
  lastLoginAt: '',
  lastActiveAt: '',
  stats: { totalSessions: 0, totalAnswers: 0, totalTime: 0, lastSessionAnswers: 0, lastSessionTime: 0 },
  sessions: [],
  funds: '0',
  diamonds: 0,
  xp: 0,
  level: 1,
  theme: '',
  newsletterOptIn: false,
};

function formatDate(dateStr: string) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleString();
}
function msToHMS(ms: number) {
  if (!ms || ms < 0) return '0s';
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return [
    h ? h + 'h' : '',
    m ? m + 'm' : '',
    sec ? sec + 's' : '',
  ].filter(Boolean).join(' ');
}

export default function ProfilePage() {
  const [profile, setProfile] = useState(initialProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const base = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${base}/api/profile`, { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          setProfile({
            ...initialProfile,
            ...data.user,
            dateOfBirth: data.user.dateOfBirth ? data.user.dateOfBirth.slice(0, 10) : '',
            lastLoginAt: data.user.lastLoginAt || '',
            lastActiveAt: data.user.lastActiveAt || '',
            stats: data.user.stats || initialProfile.stats,
            sessions: data.user.sessions || [],
          });
        } else {
          setMessage('Failed to load profile.');
        }
      } catch {
        setMessage('Failed to load profile.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange: React.ChangeEventHandler<any> = (e) => {
    const { name, value, type, checked } = e.target;
    setProfile((p) => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleNewsletterChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const optIn = e.target.checked;
    setSaving(true);
    setMessage('');
    
    try {
      const res = await fetch(`${base}/api/newsletter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ optIn }),
      });
      
      const data = await res.json();
      if (data.success) {
        setProfile((p) => ({ ...p, newsletterOptIn: optIn }));
        setMessage(data.message || `Newsletter subscription ${optIn ? 'enabled' : 'disabled'}`);
      } else {
        setMessage(data.error || 'Failed to update newsletter preference');
      }
    } catch {
      setMessage('Failed to update newsletter preference');
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const res = await fetch(`${base}/api/profile`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });
      const data = await res.json();
      if (data.success) {
        setMessage('Profile updated!');
      } else {
        setMessage(data.message || 'Update failed.');
      }
    } catch {
      setMessage('Update failed.');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage('Passwords do not match.');
      return;
    }
    setSaving(true);
    setMessage('');
    // TODO: Implement password change API call
    setMessage('Password change feature coming soon.');
    setSaving(false);
    setShowPasswordForm(false);
    setNewPassword('');
    setConfirmPassword('');
  };

  const StatCard = ({ 
    title, 
    value, 
    icon, 
    subtitle 
  }: { 
    title: string; 
    value: string | number; 
    icon: React.ReactNode;
    subtitle?: string;
  }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-full bg-primary/10 text-primary">
            {icon}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const SessionStatCard = ({ 
    title, 
    value, 
    icon 
  }: { 
    title: string; 
    value: string | number; 
    icon: React.ReactNode;
  }) => (
    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
      <div className="flex items-center space-x-2">
        <div className="text-muted-foreground">{icon}</div>
        <span className="text-sm font-medium">{title}</span>
      </div>
      <span className="text-sm font-mono text-muted-foreground">{value}</span>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Profile</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Profile Info */}
          <div className="space-y-6">
            <Card className="rounded-xl shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="w-5 h-5" />
                  <span>Profile Info</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar Section */}
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center text-muted-foreground text-4xl border-2 border-border">
                      {profile.avatarUrl ? (
                        <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover rounded-full" />
                      ) : (
                        <User className="w-12 h-12" />
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0"
                      disabled
                    >
                      <Upload className="w-4 h-4" />
                    </Button>
                  </div>
                  <Button variant="outline" size="sm" disabled>
                    Upload Photo (coming soon)
                  </Button>
                </div>

                {/* Profile Form */}
                <form onSubmit={handleSave} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="name"
                          name="name"
                          value={profile.name}
                          onChange={handleChange}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={profile.email}
                          onChange={handleChange}
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="phone"
                          name="phone"
                          value={profile.phone}
                          onChange={handleChange}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="country">Country</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="country"
                          name="country"
                          value={profile.country}
                          onChange={handleChange}
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="dateOfBirth"
                        name="dateOfBirth"
                        type="date"
                        value={profile.dateOfBirth}
                        onChange={handleChange}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="motto">Motto</Label>
                    <div className="relative">
                      <Quote className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                      <textarea
                        id="motto"
                        name="motto"
                        value={profile.motto}
                        onChange={handleChange}
                        className="w-full pl-10 pr-3 py-2 border border-input bg-background rounded-md resize-none"
                        rows={3}
                        placeholder="Enter your motto..."
                      />
                    </div>
                  </div>

                  {/* Newsletter Toggle */}
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="newsletterOptIn"
                      checked={profile.newsletterOptIn}
                      onChange={handleNewsletterChange}
                      className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary"
                      disabled={saving}
                    />
                    <Label htmlFor="newsletterOptIn" className="text-sm">
                      Receive PareL newsletter
                    </Label>
                  </div>

                  {/* Save Button */}
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </form>

                {/* Change Password Section */}
                <div className="border-t pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowPasswordForm(!showPasswordForm)}
                    className="w-full"
                  >
                    Change Password
                  </Button>
                  
                  {showPasswordForm && (
                    <form onSubmit={handlePasswordChange} className="mt-4 space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="newPassword">New Password</Label>
                        <div className="relative">
                          <Input
                            id="newPassword"
                            type={showPassword ? "text" : "password"}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="pr-10"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                        <div className="relative">
                          <Input
                            id="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="pr-10"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button type="submit" className="flex-1" disabled={saving}>
                          Update Password
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setShowPasswordForm(false);
                            setNewPassword('');
                            setConfirmPassword('');
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  )}
                </div>

                {message && (
                  <div className="text-center text-sm text-primary mt-2 p-2 bg-primary/10 rounded">
                    {message}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Gamified Info */}
          <div className="space-y-6">
            {/* Stats Cards */}
            <Card className="rounded-xl shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Star className="w-5 h-5" />
                  <span>Gamified Info</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <StatCard
                    title="Funds"
                    value={`$${profile.funds || '0'}`}
                    icon={<Coins className="w-5 h-5" />}
                  />
                  <StatCard
                    title="Diamonds"
                    value={profile.diamonds || 0}
                    icon={<Gem className="w-5 h-5" />}
                  />
                  <StatCard
                    title="XP"
                    value={profile.xp || 0}
                    icon={<Star className="w-5 h-5" />}
                  />
                  <StatCard
                    title="Level"
                    value={profile.level || 1}
                    icon={<Trophy className="w-5 h-5" />}
                  />
                </div>

                {/* Session Stats */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg">Session Stats</h3>
                  <div className="grid grid-cols-1 gap-3">
                    <SessionStatCard
                      title="Last Login"
                      value={formatDate(profile.lastLoginAt)}
                      icon={<Clock className="w-4 h-4" />}
                    />
                    <SessionStatCard
                      title="Last Active"
                      value={formatDate(profile.lastActiveAt)}
                      icon={<Clock className="w-4 h-4" />}
                    />
                    <SessionStatCard
                      title="Total Answers"
                      value={profile.stats.totalAnswers}
                      icon={<CheckCircle className="w-4 h-4" />}
                    />
                    <SessionStatCard
                      title="Total Sessions"
                      value={profile.stats.totalSessions}
                      icon={<Clock className="w-4 h-4" />}
                    />
                    <SessionStatCard
                      title="Total Time"
                      value={msToHMS(profile.stats.totalTime)}
                      icon={<Clock className="w-4 h-4" />}
                    />
                    <SessionStatCard
                      title="Streak"
                      value={profile.streakCount || 0}
                      icon={<Star className="w-4 h-4" />}
                    />
                  </div>
                </div>

                {/* View History Button */}
                <Button variant="outline" className="w-full" disabled>
                  <History className="w-4 h-4 mr-2" />
                  View History (coming soon)
                </Button>
              </CardContent>
            </Card>

            {/* Achievements Grid */}
            <Card className="rounded-xl shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Trophy className="w-5 h-5" />
                  <span>Achievements</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-3">
                  {[...Array(8)].map((_, i) => (
                    <div
                      key={i}
                      className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center text-2xl text-muted-foreground border-2 border-border hover:bg-muted/80 transition-colors"
                    >
                      🏆
                    </div>
                  ))}
                </div>
                <div className="text-center text-muted-foreground text-sm mt-3">
                  (Achievements coming soon)
                </div>
              </CardContent>
            </Card>

            {/* Session History Table */}
            <Card className="rounded-xl shadow-md">
              <CardHeader>
                <CardTitle>Recent Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-1">Date</th>
                        <th className="text-left py-2 px-1">Answers</th>
                        <th className="text-left py-2 px-1">Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {profile.sessions.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="text-center text-muted-foreground py-4">
                            No sessions yet.
                          </td>
                        </tr>
                      ) : (
                        profile.sessions.slice(0, 5).map((s: { id: string; startedAt: string; completedAt: string | null; answers: number; timeSpent: number }) => (
                          <tr key={s.id} className="border-b">
                            <td className="py-2 px-1 text-muted-foreground">
                              {formatDate(s.startedAt)}
                            </td>
                            <td className="py-2 px-1">{s.answers}</td>
                            <td className="py-2 px-1 text-muted-foreground">
                              {msToHMS(s.timeSpent)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

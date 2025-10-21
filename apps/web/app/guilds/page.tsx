'use client';

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { apiFetch } from "@/lib/apiBase";
import { useToast } from "@/components/ui/use-toast";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Crown, Shield, Sword, Star } from "lucide-react";

interface Guild {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  maxMembers: number;
  level: number;
  experience: number;
  leader: {
    id: string;
    name: string;
    email: string;
  };
  members: Array<{
    id: string;
    name: string;
    email: string;
    role: 'LEADER' | 'OFFICER' | 'MEMBER';
    joinedAt: string;
  }>;
  createdAt: string;
  isPublic: boolean;
  requirements: {
    minLevel: number;
    minExperience: number;
  };
}

export default function GuildsPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [guilds, setGuilds] = useState<Guild[]>([]);
  const [loading, setLoading] = useState(true);
  const [userGuild, setUserGuild] = useState<Guild | null>(null);

  useEffect(() => {
    fetchGuilds();
    fetchUserGuild();
  }, []);

  const fetchGuilds = async () => {
    try {
      setLoading(true);
      const response = await apiFetch('/api/guilds');
      if (response.ok) {
        // Ensure guilds is always an array
        const guildsData = response.data;
        if (Array.isArray(guildsData)) {
          setGuilds(guildsData);
        } else {
          console.warn('Guilds data is not an array:', guildsData);
          setGuilds([]);
        }
      } else {
        toast({
          title: "Error",
          description: "Failed to load guilds",
          variant: "destructive",
        });
        setGuilds([]);
      }
    } catch (error) {
      console.error('Error fetching guilds:', error);
      toast({
        title: "Error",
        description: "Failed to load guilds",
        variant: "destructive",
      });
      setGuilds([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserGuild = async () => {
    try {
      const response = await apiFetch('/api/guilds/my-guild');
      if (response.ok) {
        setUserGuild(response.data);
      }
    } catch (error) {
      console.error('Error fetching user guild:', error);
    }
  };

  const joinGuild = async (guildId: string) => {
    try {
      const response = await apiFetch(`/api/guilds/${guildId}/join`, {
        method: 'POST',
      });
      
      if (response.ok) {
        toast({
          title: "Success",
          description: "Successfully joined the guild!",
        });
        fetchGuilds();
        fetchUserGuild();
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to join guild",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error joining guild:', error);
      toast({
        title: "Error",
        description: "Failed to join guild",
        variant: "destructive",
      });
    }
  };

  const leaveGuild = async () => {
    if (!userGuild) return;
    
    try {
      const response = await apiFetch(`/api/guilds/${userGuild.id}/leave`, {
        method: 'POST',
      });
      
      if (response.ok) {
        toast({
          title: "Success",
          description: "Successfully left the guild",
        });
        setUserGuild(null);
        fetchGuilds();
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to leave guild",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error leaving guild:', error);
      toast({
        title: "Error",
        description: "Failed to leave guild",
        variant: "destructive",
      });
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'LEADER':
        return <Crown className="h-4 w-4 text-yellow-500" />;
      case 'OFFICER':
        return <Shield className="h-4 w-4 text-blue-500" />;
      default:
        return <Sword className="h-4 w-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text mb-2">Guilds</h1>
        <p className="text-subtle">
          Join guilds to collaborate with other players and unlock exclusive features.
        </p>
      </div>

      {/* User's Current Guild */}
      {userGuild && (
        <Card className="mb-8 border-accent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-yellow-500" />
              Your Guild: {userGuild.name}
            </CardTitle>
            <CardDescription>{userGuild.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span className="text-sm">{userGuild.memberCount}/{userGuild.maxMembers} members</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4" />
                <span className="text-sm">Level {userGuild.level}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm">{userGuild.experience} XP</span>
              </div>
            </div>
            <Button onClick={leaveGuild} variant="destructive" size="sm">
              Leave Guild
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Available Guilds */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-text mb-4">
          {userGuild ? 'Other Guilds' : 'Available Guilds'}
        </h2>
        
        {guilds.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No Guilds Available"
            description="There are no guilds to join at the moment. Check back later or create your own!"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {guilds.map((guild) => (
              <Card key={guild.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{guild.name}</CardTitle>
                      <CardDescription className="mt-1">
                        {guild.description}
                      </CardDescription>
                    </div>
                    {!guild.isPublic && (
                      <Badge variant="secondary">Private</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {guild.memberCount}/{guild.maxMembers}
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="h-4 w-4" />
                        Level {guild.level}
                      </span>
                    </div>
                    
                    <div className="text-sm text-subtle">
                      <p>Leader: {guild.leader.name}</p>
                      <p>Min Level: {guild.requirements.minLevel}</p>
                    </div>

                    {!userGuild && (
                      <Button 
                        onClick={() => joinGuild(guild.id)}
                        className="w-full"
                        disabled={guild.memberCount >= guild.maxMembers}
                      >
                        {guild.memberCount >= guild.maxMembers ? 'Guild Full' : 'Join Guild'}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Guild Members (if user is in a guild) */}
      {userGuild && (
        <div>
          <h2 className="text-2xl font-semibold text-text mb-4">Guild Members</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userGuild.members.map((member) => (
              <Card key={member.id}>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3">
                    {getRoleIcon(member.role)}
                    <div className="flex-1">
                      <p className="font-medium">{member.name}</p>
                      <p className="text-sm text-subtle capitalize">{member.role.toLowerCase()}</p>
                      <p className="text-xs text-subtle">
                        Joined {new Date(member.joinedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import { useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Swords, CheckCircle, XCircle, Trophy } from "lucide-react";
import { apiFetch } from "@/lib/apiBase";
import { useToast } from "@/components/ui/use-toast";
import { useXp } from "@/components/XpProvider";

interface Challenge {
  id: string;
  type: string;
  status: string;
  message: string | null;
  prompt: string | null;
  response: string | null;
  rewardXp: number;
  rewardKarma: number;
  createdAt: string;
  initiator: { id: string; name: string | null; email: string; image: string | null };
  receiver: { id: string; name: string | null; email: string; image: string | null };
}

interface ChallengeCardProps {
  challenge: Challenge;
  currentUserId: string;
  onUpdate: () => void;
}

export default function ChallengeCard({ challenge, currentUserId, onUpdate }: ChallengeCardProps) {
  const [showModal, setShowModal] = useState(false);
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { triggerXp } = useXp();

  const isReceiver = challenge.receiver.id === currentUserId;
  const isInitiator = challenge.initiator.id === currentUserId;
  const otherUser = isReceiver ? challenge.initiator : challenge.receiver;

  async function handleAction(action: string, responseText?: string) {
    setLoading(true);
    const res = await apiFetch("/api/challenges", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        challengeId: challenge.id,
        action,
        response: responseText,
      }),
    });

    if ((res as any).ok) {
      const data = (res as any).data;
      
      if (action === "accept") {
        toast({
          title: "Challenge Accepted!",
          description: `+${data.karmaGained} Karma`,
        });
      } else if (action === "complete") {
        toast({
          title: "Challenge Completed!",
          description: `+${data.xpGained} XP`,
        });
        triggerXp(data.xpGained, 'xp');
      } else if (action === "decline") {
        toast({
          title: "Challenge Declined",
          description: `${data.karmaLost} Karma`,
          variant: "destructive",
        });
      }

      setShowModal(false);
      onUpdate();
    } else {
      toast({
        title: "Error",
        description: (res as any).error || "Failed to process action",
        variant: "destructive",
      });
    }
    setLoading(false);
  }

  function handleComplete() {
    if (!response.trim()) {
      toast({
        title: "Response Required",
        description: "Please write your response to complete the challenge",
        variant: "destructive",
      });
      return;
    }
    handleAction("complete", response);
  }

  const statusColors: Record<string, string> = {
    pending: "border-yellow-500 bg-yellow-500/5",
    accepted: "border-blue-500 bg-blue-500/5",
    completed: "border-green-500 bg-green-500/5",
    declined: "border-red-500 bg-red-500/5",
  };

  return (
    <>
      <Card className={`${statusColors[challenge.status]} border-2`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Swords className="h-5 w-5 text-accent" />
              <span className="font-bold text-text">
                {isReceiver ? 'Challenge from' : 'Challenge to'} {otherUser.name || otherUser.email}
              </span>
            </div>
            <span className="text-xs uppercase font-bold text-subtle">
              {challenge.status}
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {challenge.message && (
            <div className="text-sm text-subtle italic">
              "{challenge.message}"
            </div>
          )}
          
          {challenge.prompt && (
            <div className="bg-bg border border-border rounded-lg p-3">
              <div className="text-xs text-subtle mb-1">Challenge:</div>
              <div className="text-text font-semibold">{challenge.prompt}</div>
            </div>
          )}

          {challenge.response && (
            <div className="bg-bg border border-accent rounded-lg p-3">
              <div className="text-xs text-subtle mb-1">Response:</div>
              <div className="text-text">{challenge.response}</div>
            </div>
          )}

          <div className="flex items-center gap-2 text-xs text-subtle">
            <Trophy className="h-4 w-4" />
            Rewards: +{challenge.rewardXp} XP, +{challenge.rewardKarma} Karma
          </div>

          {/* Action Buttons */}
          {isReceiver && challenge.status === "pending" && (
            <div className="flex gap-2 pt-2">
              <Button
                size="sm"
                className="flex-1 bg-green-600 hover:bg-green-700"
                onClick={() => handleAction("accept")}
                disabled={loading}
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Accept (+5 Karma)
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="flex-1 border-destructive text-destructive hover:bg-destructive/10"
                onClick={() => handleAction("decline")}
                disabled={loading}
              >
                <XCircle className="h-4 w-4 mr-1" />
                Decline (-5 Karma)
              </Button>
            </div>
          )}

          {isReceiver && challenge.status === "accepted" && (
            <Button
              size="sm"
              className="w-full bg-accent"
              onClick={() => setShowModal(true)}
            >
              Complete Challenge (+{challenge.rewardXp} XP)
            </Button>
          )}

          {challenge.status === "completed" && (
            <div className="text-center text-green-500 text-sm font-semibold">
              ✅ Completed
            </div>
          )}
        </CardContent>
      </Card>

      {/* Response Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="bg-card border-border text-text">
          <DialogHeader>
            <DialogTitle>Complete Challenge</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-bg border border-border rounded-lg p-3">
              <div className="text-sm font-semibold mb-2">{challenge.prompt}</div>
            </div>
            <Textarea
              placeholder="Your response..."
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              className="bg-bg border-border text-text min-h-[100px]"
            />
            <div className="flex gap-2">
              <Button
                className="flex-1 bg-accent"
                onClick={handleComplete}
                disabled={loading || !response.trim()}
              >
                Submit (+{challenge.rewardXp} XP)
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}














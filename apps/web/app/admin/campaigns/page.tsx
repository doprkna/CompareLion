"use client";

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Mail, 
  Send, 
  Loader2, 
  Plus,
  Calendar
} from 'lucide-react';

interface Campaign {
  id: string;
  title: string;
  content: string;
  link: string | null;
  status: string;
  sentAt: string | null;
  deliveredCount: number;
  openedCount: number;
  clickedCount: number;
  createdAt: string;
}

export default function AdminCampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  
  const [newCampaign, setNewCampaign] = useState({
    title: '',
    content: '',
    link: ''
  });

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const res = await fetch('/api/admin/campaigns');
      const data = await res.json();
      
      if (data.success) {
        setCampaigns(data.campaigns || []);
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newCampaign.title || !newCampaign.content) {
      alert('Title and content are required');
      return;
    }

    setCreating(true);
    
    try {
      const res = await fetch('/api/admin/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCampaign)
      });

      const data = await res.json();
      
      if (data.success) {
        setCampaigns([data.campaign, ...campaigns]);
        setNewCampaign({ title: '', content: '', link: '' });
        setShowCreate(false);
      } else {
        alert(data.error || 'Failed to create campaign');
      }
    } catch (error) {
      console.error('Error creating campaign:', error);
      alert('Failed to create campaign');
    } finally {
      setCreating(false);
    }
  };

  const handleSend = async (campaignId: string) => {
    if (!confirm('Are you sure you want to send this campaign?')) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/campaigns/${campaignId}/send`, {
        method: 'POST'
      });

      const data = await res.json();
      
      if (data.success) {
        alert('Campaign queued for sending!');
        fetchCampaigns();
      } else {
        alert(data.error || 'Failed to send campaign');
      }
    } catch (error) {
      console.error('Error sending campaign:', error);
      alert('Failed to send campaign');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-text mb-2">Campaign Management</h1>
          <p className="text-subtle">Create and send marketing campaigns</p>
        </div>
        <Button
          onClick={() => setShowCreate(!showCreate)}
          className="bg-accent hover:bg-accent/90"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Campaign
        </Button>
      </div>

      {/* Create Form */}
      {showCreate && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Create New Campaign</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Title / Subject Line
                </label>
                <Input
                  value={newCampaign.title}
                  onChange={(e) => setNewCampaign({ ...newCampaign, title: e.target.value })}
                  placeholder="e.g., Welcome to PareL Beta!"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Content
                </label>
                <Textarea
                  value={newCampaign.content}
                  onChange={(e) => setNewCampaign({ ...newCampaign, content: e.target.value })}
                  placeholder="Email body content..."
                  rows={8}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Link (optional)
                </label>
                <Input
                  value={newCampaign.link}
                  onChange={(e) => setNewCampaign({ ...newCampaign, link: e.target.value })}
                  placeholder="https://parel.app/..."
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleCreate}
                  disabled={creating}
                  className="bg-accent hover:bg-accent/90"
                >
                  {creating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>Create Campaign</>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowCreate(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Campaigns List */}
      <div className="space-y-4">
        {campaigns.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Mail className="h-12 w-12 mx-auto mb-4 text-subtle opacity-50" />
              <p className="text-subtle">No campaigns yet. Create your first one!</p>
            </CardContent>
          </Card>
        ) : (
          campaigns.map((campaign) => (
            <Card key={campaign.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-text mb-2">
                      {campaign.title}
                    </h3>
                    <p className="text-sm text-subtle mb-3 line-clamp-2">
                      {campaign.content}
                    </p>
                    
                    <div className="flex items-center gap-4 text-sm">
                      <span className={`inline-block px-3 py-1 rounded-full font-medium ${
                        campaign.status === 'draft' 
                          ? 'bg-gray-500/10 text-gray-500'
                          : campaign.status === 'sending'
                          ? 'bg-blue-500/10 text-blue-500'
                          : 'bg-green-500/10 text-green-500'
                      }`}>
                        {campaign.status.toUpperCase()}
                      </span>
                      
                      {campaign.sentAt && (
                        <span className="text-subtle flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(campaign.sentAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {campaign.status === 'draft' && (
                      <Button
                        onClick={() => handleSend(campaign.id)}
                        size="sm"
                        className="bg-accent hover:bg-accent/90"
                      >
                        <Send className="mr-2 h-4 w-4" />
                        Send
                      </Button>
                    )}
                  </div>
                </div>

                {campaign.status === 'sent' && (
                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-text">
                        {campaign.deliveredCount}
                      </div>
                      <div className="text-xs text-subtle">Delivered</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-text">
                        {campaign.openedCount}
                      </div>
                      <div className="text-xs text-subtle">Opened</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-text">
                        {campaign.clickedCount}
                      </div>
                      <div className="text-xs text-subtle">Clicked</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}


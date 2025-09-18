import type { Achievement } from '@/types/achievement';

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first_flow', title: 'First Flow', description: 'Complete your first flow.', icon: '🌱', condition: 'flows_completed >= 1' },
  { id: 'ten_answers', title: '10 Answers', description: 'Answer 10 questions.', icon: '📝', condition: 'answers >= 10' },
  { id: 'create_flow', title: 'Creator', description: 'Create your own flow.', icon: '🧩', condition: 'flows_created >= 1' },
  { id: 'profile_filled', title: 'All Set', description: 'Complete your profile.', icon: '👤', condition: 'profile_complete' },
  { id: 'adult_question', title: '18+ Badge', description: 'Answer your first 18+ question.', icon: '🔞', condition: 'adult_answers >= 1' },
  { id: 'first_share', title: 'Spread the Word', description: 'Share on social media once.', icon: '📣', condition: 'shares >= 1' },
  { id: 'join_group', title: 'Tribe Member', description: 'Join a group.', icon: '👥', condition: 'groups_joined >= 1' },
  { id: 'review_stats', title: 'Analyst', description: 'Open your statistics page.', icon: '📊', condition: 'stats_viewed >= 1' },
  { id: 'week_streak', title: '7-Day Streak', description: 'Log activity 7 days in a row.', icon: '🔥', condition: 'streak_days >= 7' },
  { id: 'first_purchase', title: 'First Purchase', description: 'Buy your first item in the shop.', icon: '🛒', condition: 'purchases >= 1' },
  { id: 'leaderboard_top10', title: 'Top 10', description: 'Reach top 10 on the leaderboard.', icon: '🏆', condition: 'leaderboard_rank <= 10' },
  { id: 'invite_friend', title: 'Connector', description: 'Invite a friend who signs up.', icon: '🤝', condition: 'invites_accepted >= 1' },
  { id: 'five_flows', title: 'Flow Runner', description: 'Complete 5 flows.', icon: '🚀', condition: 'flows_completed >= 5' },
  { id: 'hundred_answers', title: 'Centurion', description: 'Answer 100 questions.', icon: '💯', condition: 'answers >= 100' },
  { id: 'thirty_logins', title: 'Regular', description: 'Log in on 30 different days.', icon: '📅', condition: 'distinct_login_days >= 30' },
  { id: 'first_like', title: 'Taste Maker', description: 'Like or upvote something.', icon: '👍', condition: 'likes >= 1' },
  { id: 'first_comment', title: 'Voice Heard', description: 'Post your first comment.', icon: '💬', condition: 'comments >= 1' },
  { id: 'complete_profile_pic', title: 'Face Card', description: 'Add a profile picture.', icon: '🪪', condition: 'profile_picture_set' },
];

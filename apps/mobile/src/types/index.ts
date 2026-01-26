// Read-only type imports from @parel/db
// No Prisma client. No DB calls. Types only.

// TODO: Import types when @parel/db package is available
// Example:
// import type { Story, Reaction, User } from '@parel/db/generated';

// Placeholder types for now
export type StorySchema = {
  id: string;
  title: string;
  content?: string;
};

export type ReactionSchema = {
  id: string;
  type: string;
  storyId: string;
};

export type UserSchema = {
  id: string;
  email: string;
  name?: string;
};


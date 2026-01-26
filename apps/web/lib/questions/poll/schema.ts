/**
 * Poll Question Schema Definition
 * 
 * This file documents the Prisma schema structure for Poll Question Feature
 * 
 * v0.37.4 - Poll Option Feature
 */

/**
 * Prisma Schema Structure:
 * 
 * Models that should exist or be extended:
 * 
 * 1. Question model extensions:
 *    - isPoll (Boolean, default false) - Whether this question is a poll
 *    - pollOptions (Json?, nullable) - Poll options structure:
 *        [
 *          { id: "A", text: "Option text", votes: 0 },
 *          { id: "B", text: "Option text", votes: 0 },
 *          ...
 *        ]
 * 
 * 2. PollVote model:
 *    - id (String, @id, @default(cuid()))
 *    - userId (String, relation to User)
 *    - questionId (String, relation to Question)
 *    - optionId (String) - The option ID (e.g., "A", "B")
 *    - createdAt (DateTime, @default(now()))
 *    - Relations: user (User), question (Question)
 *    - Unique: [userId, questionId] (one vote per user per question)
 *    - Indexes: [userId], [questionId], [optionId]
 * 
 * Integration Points:
 * - PollVote.userId → User.id (voter)
 * - PollVote.questionId → Question.id (poll question)
 * 
 * Notes:
 * - Unique constraint ensures one vote per user per question
 * - Changing vote: Delete old vote, create new vote (or update if needed)
 * - pollOptions JSON structure allows flexible option management
 * - Votes are counted via aggregation on PollVote table
 */

export const SCHEMA_VERSION = '0.37.4';
export const SCHEMA_MODULE = 'Poll Option Feature';


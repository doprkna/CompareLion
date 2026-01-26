/**
 * Answer Vote Schema Definition
 * 
 * This file documents the Prisma schema structure for Answer Voting Feature
 * 
 * v0.37.11 - Upvote / Downvote Answers
 */

/**
 * Prisma Schema Structure:
 * 
 * Models that should exist:
 * 
 * 1. AnswerVote:
 *    - id (String, @id, @default(cuid()))
 *    - answerId (String, relation to UserReflection)
 *    - userId (String, relation to User)
 *    - value (Int) - 1 for upvote, -1 for downvote
 *    - createdAt (DateTime, @default(now()))
 *    - Relations: answer (UserReflection), user (User)
 *    - Unique: [answerId, userId] (one vote per user per answer)
 *    - Indexes: [answerId], [userId], [answerId, userId]
 * 
 * Integration Points:
 * - AnswerVote.answerId → UserReflection.id (the answer being voted on)
 * - AnswerVote.userId → User.id (the user who voted)
 * 
 * Notes:
 * - Unique constraint ensures one vote per user per answer
 * - Score is computed via aggregation (SUM of values), not stored
 * - Changing vote updates the existing record
 * - Indexes optimize vote queries and score computation
 */

export const SCHEMA_VERSION = '0.37.11';
export const SCHEMA_MODULE = 'Upvote / Downvote Answers';


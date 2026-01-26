/**
 * Skip Question Schema Definition
 * 
 * This file documents the Prisma schema structure for Skip Question Feature
 * 
 * v0.37.2 - Skip Question Feature
 */

/**
 * Prisma Schema Structure:
 * 
 * Models that should exist:
 * 
 * 1. SkipQuestion:
 *    - id (String, @id, @default(cuid()))
 *    - userId (String, relation to User)
 *    - questionId (String, relation to Question)
 *    - skippedAt (DateTime, @default(now()))
 *    - Relations: user (User), question (Question)
 *    - Unique: [userId, questionId] (one skip record per user per question)
 *    - Indexes: [userId], [questionId], [skippedAt]
 * 
 * Integration Points:
 * - SkipQuestion.userId → User.id (user who skipped)
 * - SkipQuestion.questionId → Question.id (skipped question)
 * 
 * Notes:
 * - Unique constraint prevents duplicate skip records
 * - Indexes optimize queries for checking if question is skipped and filtering skipped questions
 * - skippedAt timestamp allows for future "reset skips after X days" functionality
 */

export const SCHEMA_VERSION = '0.37.2';
export const SCHEMA_MODULE = 'Skip Question Feature';


/**
 * Bookmark Schema Definition
 * 
 * This file documents the Prisma schema structure for Question Bookmarks
 * 
 * v0.37.1 - Bookmark Question Feature
 */

/**
 * Prisma Schema Structure:
 * 
 * Models that should exist:
 * 
 * 1. Bookmark:
 *    - id (String, @id, @default(cuid()))
 *    - userId (String, relation to User)
 *    - questionId (String, relation to Question)
 *    - createdAt (DateTime, @default(now()))
 *    - Relations: user (User), question (Question)
 *    - Unique: [userId, questionId] (one bookmark per user per question)
 *    - Indexes: [userId], [questionId], [createdAt]
 * 
 * Integration Points:
 * - Bookmark.userId → User.id (bookmark owner)
 * - Bookmark.questionId → Question.id (bookmarked question)
 * 
 * Notes:
 * - Unique constraint prevents duplicate bookmarks
 * - Indexes optimize queries for user bookmarks and question bookmark counts
 */

export const SCHEMA_VERSION = '0.37.1';
export const SCHEMA_MODULE = 'Bookmark Question Feature';


/**
 * AI Universal Rating Engine Schema Definition
 * 
 * This file documents the Prisma schema structure for AI Universal Rating Engine
 * 
 * v0.38.1 - AI Universal Rating Engine (Core Placeholder)
 */

/**
 * Prisma Schema Structure:
 * 
 * Models that should exist:
 * 
 * 1. RatingRequest:
 *    - id (String, @id, @default(cuid()))
 *    - userId (String, relation to User)
 *    - inputType (String, enum: 'image' | 'text' | 'hybrid')
 *    - imageUrl (String?, nullable) - URL to image if image/hybrid input
 *    - text (String?, nullable) - Text content if text/hybrid input
 *    - category (String) - Category preset (e.g. "snack", "outfit", "car", "gift", "pet")
 *    - createdAt (DateTime, @default(now()))
 *    - Relations: user (User), result (RatingResult?)
 *    - Indexes: [userId], [category], [createdAt] (desc for latest queries)
 * 
 * 2. RatingResult:
 *    - id (String, @id, @default(cuid()))
 *    - requestId (String, relation to RatingRequest, unique)
 *    - metrics (Json) - Category-specific scores (0-100)
 *      Example: { "creativity": 75, "visualAppeal": 62, "vibeScore": 88 }
 *    - summaryText (String) - 1-2 sentence AI summary
 *    - roastText (String) - Playful roast/compliment line
 *    - createdAt (DateTime, @default(now()))
 *    - Relations: request (RatingRequest)
 *    - Indexes: [requestId]
 * 
 * Enums (if using Prisma enum):
 *    enum InputType {
 *      image
 *      text
 *      hybrid
 *    }
 * 
 * Integration Points:
 * - RatingRequest.userId → User.id (request author)
 * - RatingResult.requestId → RatingRequest.id (one result per request)
 * 
 * Notes:
 * - One RatingResult per RatingRequest (unique constraint)
 * - Metrics stored as JSON for flexibility (category-specific scores)
 * - Category presets stored in local JSON file (no DB usage yet)
 * - No analytics, ranking, or moderation yet (future modules)
 */

export const SCHEMA_VERSION = '0.38.1';
export const SCHEMA_MODULE = 'AI Universal Rating Engine (Core Placeholder)';


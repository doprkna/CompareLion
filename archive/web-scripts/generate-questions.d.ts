#!/usr/bin/env tsx
/**
 * Question Generation Worker Script
 *
 * Processes batches of question generation jobs:
 * - Fetches PENDING jobs from the database
 * - Calls GPT API to generate questions
 * - Saves questions to the database
 * - Updates job and batch statuses
 * - Runs with controlled concurrency
 *
 * Usage: pnpm gen:questions
 */
export {};

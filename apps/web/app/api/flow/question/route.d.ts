/**
 * GET /api/flow/question?categoryId=xxx
 * Get next question in flow. When no rows remain (all answered or category empty),
 * returns 200 with { ok: true, done: true } so client shows completion, not error.
 */
export declare const GET: any;

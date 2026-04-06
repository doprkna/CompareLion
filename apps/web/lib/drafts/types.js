/**
 * Draft Review Queue Types
 * Shared types and interfaces for Draft Review Queue & Social Boosting
 * v0.37.5 - Draft Review Queue + Social Boosting (Placeholder)
 */
/**
 * Draft status enum
 */
export var DraftStatus;
(function (DraftStatus) {
    DraftStatus["DRAFT"] = "draft";
    DraftStatus["PENDING"] = "pending";
    DraftStatus["APPROVED"] = "approved";
    DraftStatus["REJECTED"] = "rejected";
})(DraftStatus || (DraftStatus = {}));
/**
 * Review decision enum
 */
export var ReviewDecision;
(function (ReviewDecision) {
    ReviewDecision["APPROVED"] = "approved";
    ReviewDecision["REJECTED"] = "rejected";
})(ReviewDecision || (ReviewDecision = {}));

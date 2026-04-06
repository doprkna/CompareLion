# C20 - Prediction Battles

## Goal

Users forecast future outcomes instead of only expressing opinions. When outcomes are known, predictions are evaluated and users receive accuracy scores. Long-term engagement: users return to check results and maintain reputation as accurate predictors.

## Lifecycle

1. Prediction Created (admin)
2. Users submit predictions
3. Prediction remains open until resolution
4. Outcome is resolved (admin or date trigger)
5. Accuracy + streaks update
6. Rankings refresh

## Data Model

- **PredictionQuestion**: id, title, description, categoryId, options[], correctOptionIdx?, resolutionDate, status (open|closed|resolved), resolvedAt, resolvedBy
- **PredictionAnswer**: userId, predictionId, selectedOptionIdx, createdAt
- **User**: predictionCorrectCount, predictionResolvedCount
- **UserStreak**: predictionCorrectStreak, predictionLongestStreak

## Accuracy

`accuracy = correctCount / resolvedCount` (when resolvedCount > 0)

## Streak

- correct_streak: incremented on correct resolve, reset on incorrect
- longest_streak: max of correct_streak over time

## APIs

- GET /api/predictions – list (status, categoryId)
- POST /api/predictions/[id]/answer – submit (selectedOptionIdx)
- GET /api/predictions/stats – user accuracy, streaks
- GET /api/predictions/leaderboard
- POST /api/admin/predictions – create
- POST /api/admin/predictions/[id]/resolve – resolve (correctOptionIdx)

## Loop Integration

Answer → Predict → Return later → Resolve → Reward → Repeat

## Out of Scope v1

- Notifications on resolve
- Category-filtered leaderboard
- External data verification
- AI mood inference

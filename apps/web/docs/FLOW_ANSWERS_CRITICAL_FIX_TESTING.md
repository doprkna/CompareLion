# Flow Answers API - Critical Fix Testing Guide
**Version 0.12.10 - 2025-10-17**

## 🎯 Testing Objectives

Verify that the critical fix for question answer saving works correctly:
- ✅ Valid CUID optionId → 200 success
- ⚠️ Invalid optionId or wrong type → 422 validation error
- 🚫 No session → 401 unauthorized
- 🔄 Skipping questions still works
- 🧪 Type coercion handles various input formats

## 🧪 Manual Test Commands

### Prerequisites
```bash
# Enable debug mode
export DEBUG_API=true

# Start development server
pnpm dev
```

### Test 1: Valid CUID Option (Should Pass)
```bash
curl -X POST http://localhost:3000/api/flow-answers \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=your-session-token" \
  -d '{
    "questionId": "cmguq4q5d0000inzr3krujckr-1",
    "optionId": "cmguq4q5d0000inzr3krujckr-opt-1",
    "skipped": false,
    "timeMs": 132
  }'
```

**Expected Result:** 200 OK with response data and debug stages

### Test 2: Invalid OptionId (Should Return 422)
```bash
curl -X POST http://localhost:3000/api/flow-answers \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=your-session-token" \
  -d '{
    "questionId": "cmguq4q5d0000inzr3krujckr-1",
    "optionId": "invalid-option-id",
    "skipped": false
  }'
```

**Expected Result:** 422 Unprocessable Entity with "Invalid optionId for this question"

### Test 3: Wrong Type OptionId (Should Coerce to String)
```bash
curl -X POST http://localhost:3000/api/flow-answers \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=your-session-token" \
  -d '{
    "questionId": "cmguq4q5d0000inzr3krujckr-1",
    "optionId": 123,
    "skipped": false
  }'
```

**Expected Result:** 422 Unprocessable Entity (after type coercion to "123")

### Test 4: No Session (Should Return 401)
```bash
curl -X POST http://localhost:3000/api/flow-answers \
  -H "Content-Type: application/json" \
  -d '{
    "questionId": "cmguq4q5d0000inzr3krujckr-1",
    "optionId": "cmguq4q5d0000inzr3krujckr-opt-1",
    "skipped": false
  }'
```

**Expected Result:** 401 Unauthorized

### Test 5: Skip Question (Should Work)
```bash
curl -X POST http://localhost:3000/api/flow-answers \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=your-session-token" \
  -d '{
    "questionId": "cmguq4q5d0000inzr3krujckr-1",
    "skipped": true
  }'
```

**Expected Result:** 200 OK with skipped response

### Test 6: String TimeMs (Should Coerce to Number)
```bash
curl -X POST http://localhost:3000/api/flow-answers \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=your-session-token" \
  -d '{
    "questionId": "cmguq4q5d0000inzr3krujckr-1",
    "optionId": "cmguq4q5d0000inzr3krujckr-opt-1",
    "skipped": false,
    "timeMs": "150"
  }'
```

**Expected Result:** 200 OK with timeMs as number 150

### Test 7: Invalid TimeMs (Should Set to Null)
```bash
curl -X POST http://localhost:3000/api/flow-answers \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=your-session-token" \
  -d '{
    "questionId": "cmguq4q5d0000inzr3krujckr-1",
    "optionId": "cmguq4q5d0000inzr3krujckr-opt-1",
    "skipped": false,
    "timeMs": "not-a-number"
  }'
```

**Expected Result:** 200 OK with timeMs as null

## 🔍 Debug Information Verification

When `DEBUG_API=true`, verify these stages are present in the response:

### Successful Request Stages:
1. `AUTH_START` - Authentication begins
2. `AUTH_SESSION` - Session validation
3. `USER_LOOKUP_START` - User database lookup
4. `USER_LOOKUP_RESULT` - User found
5. `SANITIZATION_START` - Input sanitization begins
6. `SANITIZATION_SUCCESS` - Type coercion completed
7. `VALIDATION_START` - Input validation begins
8. `VALIDATION_SUCCESS` - Validation passed
9. `QUESTION_LOOKUP_START` - Question lookup begins
10. `QUESTION_LOOKUP_RESULT` - Question found
11. `OPTION_VALIDATION_START` - Option validation begins
12. `OPTION_VALIDATION_RESULT` - Option validated
13. `RESPONSE_LOOKUP_START` - Check for existing response
14. `RESPONSE_LOOKUP_RESULT` - Existing response check
15. `RESPONSE_SAVE_START` - Save response begins
16. `RESPONSE_CREATE_SUCCESS` or `RESPONSE_UPDATE_SUCCESS` - Response saved
17. `SUCCESS_COMPLETE` - Request completed successfully

### Error Request Stages:
- Failed stages should show `success: false`
- Error stages should include error messages
- Debug information should show original types vs sanitized types

## 🧪 Frontend Integration Testing

### Test FlowRunner Component:
1. Navigate to `/flow-demo`
2. Open browser dev tools → Network tab
3. Answer a question by clicking an option
4. Verify the request payload:
   ```json
   {
     "questionId": "cmguq4q5d0000inzr3krujckr-1",
     "optionId": "cmguq4q5d0000inzr3krujckr-opt-1",
     "skipped": false
   }
   ```
5. Check response is 200 OK
6. Verify no "Failed to save answer" error

### Test Skip Functionality:
1. Click "Skip" button on a question
2. Verify the request payload:
   ```json
   {
     "questionId": "cmguq4q5d0000inzr3krujckr-1",
     "skipped": true
   }
   ```
3. Check response is 200 OK

## 📊 Performance Testing

### Load Test with Valid Requests:
```bash
# Test with 10 concurrent requests
for i in {1..10}; do
  curl -X POST http://localhost:3000/api/flow-answers \
    -H "Content-Type: application/json" \
    -H "Cookie: next-auth.session-token=your-session-token" \
    -d '{
      "questionId": "cmguq4q5d0000inzr3krujckr-1",
      "optionId": "cmguq4q5d0000inzr3krujckr-opt-1",
      "skipped": false,
      "timeMs": 100
    }' &
done
wait
```

**Expected Result:** All requests should succeed (200 OK)

## 🚨 Error Scenarios Testing

### Test Invalid QuestionId:
```bash
curl -X POST http://localhost:3000/api/flow-answers \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=your-session-token" \
  -d '{
    "questionId": "non-existent-question",
    "optionId": "cmguq4q5d0000inzr3krujckr-opt-1",
    "skipped": false
  }'
```

**Expected Result:** 404 Not Found

### Test Missing Required Fields:
```bash
curl -X POST http://localhost:3000/api/flow-answers \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=your-session-token" \
  -d '{
    "questionId": "cmguq4q5d0000inzr3krujckr-1"
  }'
```

**Expected Result:** 400 Bad Request

## ✅ Success Criteria

A successful test run should show:
- ✅ Valid CUID options save successfully (200 OK)
- ✅ Invalid options return 422 with clear error message
- ✅ Type coercion works for all input types
- ✅ Skipping questions still works
- ✅ Debug information is complete and accurate
- ✅ No 500 Internal Server Errors
- ✅ Frontend integration works smoothly
- ✅ Performance is acceptable (<100ms response time)

## 🔧 Troubleshooting

### If tests fail:
1. Check server logs for specific error messages
2. Verify database connection is working
3. Ensure session token is valid
4. Check that questions and options exist in database
5. Verify debug mode is enabled (`DEBUG_API=true`)

### Common Issues:
- **401 Unauthorized:** Check session token validity
- **422 Invalid optionId:** Verify optionId belongs to the questionId
- **500 Internal Server Error:** Check database connection and Prisma client
- **404 Question not found:** Verify questionId exists and is active



# Flow Answers API Testing Guide

## Overview
This document provides comprehensive testing procedures for the Flow Answers API system, including manual testing steps and automated test execution.

## Prerequisites
- Development server running (`pnpm dev`)
- Database seeded with test data
- Debug mode enabled (`DEBUG_API=true`)

## Manual Testing Procedures

### 1. Authentication Tests

#### Test 1.1: Unauthenticated Request
```bash
curl -X POST http://localhost:3000/api/flow-answers \
  -H "Content-Type: application/json" \
  -d '{"questionId":"test","optionId":"test"}'
```
**Expected Result:** 401 Unauthorized with debug stages showing AUTH_FAILED

#### Test 1.2: Authenticated Request
1. Login to the application
2. Open browser dev tools → Network tab
3. Navigate to `/flow-demo`
4. Answer a question
5. Check the request to `/api/flow-answers`

**Expected Result:** 200 OK with successful response

### 2. Request Body Tests

#### Test 2.1: Invalid JSON
```bash
curl -X POST http://localhost:3000/api/flow-answers \
  -H "Content-Type: application/json" \
  -d 'invalid json'
```
**Expected Result:** 400 Bad Request with BODY_PARSE_ERROR stage

#### Test 2.2: Missing questionId
```bash
curl -X POST http://localhost:3000/api/flow-answers \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=your-token" \
  -d '{"optionId":"test"}'
```
**Expected Result:** 400 Bad Request with VALIDATION_FAILED stage

#### Test 2.3: No Answer Content
```bash
curl -X POST http://localhost:3000/api/flow-answers \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=your-token" \
  -d '{"questionId":"test"}'
```
**Expected Result:** 400 Bad Request with VALIDATION_FAILED stage

### 3. Question Lookup Tests

#### Test 3.1: Non-existent Question
```bash
curl -X POST http://localhost:3000/api/flow-answers \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=your-token" \
  -d '{"questionId":"non-existent","optionId":"test"}'
```
**Expected Result:** 404 Not Found with QUESTION_NOT_FOUND stage

#### Test 3.2: Mock Question (should work)
```bash
curl -X POST http://localhost:3000/api/flow-answers \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=your-token" \
  -d '{"questionId":"cmguq4q5d0000inzr3krujckr-1","optionId":"cmguq4q5d0000inzr3krujckr-opt-1"}'
```
**Expected Result:** 200 OK with mock response

### 4. Response Saving Tests

#### Test 4.1: Create New Response
1. Use a fresh question ID
2. Submit answer
3. Check database for new UserResponse record

**Expected Result:** New record created with correct data

#### Test 4.2: Update Existing Response
1. Use same question ID as Test 4.1
2. Submit different answer
3. Check database for updated record

**Expected Result:** Existing record updated with new data

### 5. Debug Information Tests

#### Test 5.1: Debug Mode Enabled
Set `DEBUG_API=true` and make any request:
```bash
DEBUG_API=true curl -X POST http://localhost:3000/api/flow-answers \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=your-token" \
  -d '{"questionId":"cmguq4q5d0000inzr3krujckr-1","optionId":"cmguq4q5d0000inzr3krujckr-opt-1"}'
```

**Expected Result:** Response includes `debug` object with:
- `stages`: Array of debug stages
- `totalTime`: Request processing time
- `requestId`: Unique request identifier

#### Test 5.2: Debug Stages Verification
Check that all expected stages are present:
- AUTH_START
- AUTH_SESSION
- USER_LOOKUP_START
- USER_LOOKUP_RESULT
- BODY_PARSE_START
- BODY_PARSE_SUCCESS
- VALIDATION_START
- VALIDATION_SUCCESS
- QUESTION_LOOKUP_START
- QUESTION_LOOKUP_RESULT
- RESPONSE_LOOKUP_START
- RESPONSE_LOOKUP_RESULT
- RESPONSE_SAVE_START
- RESPONSE_CREATE_SUCCESS (or RESPONSE_UPDATE_SUCCESS)
- SUCCESS_COMPLETE

## Automated Testing

### Running Tests
```bash
# Run all flow-answers tests
pnpm test flow-answers

# Run with coverage
pnpm test --coverage flow-answers

# Run in watch mode
pnpm test --watch flow-answers
```

### Test Categories
1. **Authentication Tests** - Verify session handling
2. **User Lookup Tests** - Test database user queries
3. **Request Body Tests** - Validate input parsing
4. **Question Lookup Tests** - Test question validation
5. **Response Saving Tests** - Verify database operations
6. **Debug Information Tests** - Ensure debug data is included

## Troubleshooting

### Common Issues

#### Issue: 500 Internal Server Error
**Debug Steps:**
1. Check server logs for specific error
2. Enable debug mode (`DEBUG_API=true`)
3. Check database connection
4. Verify Prisma schema is up to date

#### Issue: Question Not Found
**Debug Steps:**
1. Check if question exists in database
2. Verify question ID format
3. Check if question is active
4. Test with mock question ID

#### Issue: User Not Found
**Debug Steps:**
1. Verify user exists in database
2. Check email format in session
3. Verify authentication is working
4. Check database connection

### Debug Mode Output
When `DEBUG_API=true`, the API returns detailed debug information:
```json
{
  "success": true,
  "response": { ... },
  "debug": {
    "stages": [
      {
        "stage": "AUTH_START",
        "success": true,
        "timestamp": 1697567890123,
        "data": { "timestamp": 1697567890123 }
      },
      // ... more stages
    ],
    "totalTime": 45,
    "requestId": "req_1697567890123_abc123"
  }
}
```

## Performance Testing

### Load Testing
```bash
# Test with multiple concurrent requests
for i in {1..10}; do
  curl -X POST http://localhost:3000/api/flow-answers \
    -H "Content-Type: application/json" \
    -H "Cookie: next-auth.session-token=your-token" \
    -d '{"questionId":"cmguq4q5d0000inzr3krujckr-1","optionId":"cmguq4q5d0000inzr3krujckr-opt-1"}' &
done
wait
```

### Response Time Monitoring
Monitor the `totalTime` field in debug responses to ensure:
- Authentication: < 10ms
- Database queries: < 50ms
- Total request: < 200ms

## Database Verification

### Check UserResponse Table
```sql
SELECT * FROM user_responses 
WHERE userId = 'your-user-id' 
ORDER BY createdAt DESC 
LIMIT 10;
```

### Check FlowQuestion Table
```sql
SELECT id, text, isActive, createdAt 
FROM flow_questions 
WHERE isActive = true 
ORDER BY createdAt DESC;
```

### Check Unique Constraints
```sql
-- Should not return duplicates
SELECT userId, questionId, COUNT(*) 
FROM user_responses 
GROUP BY userId, questionId 
HAVING COUNT(*) > 1;
```

## Success Criteria

A successful test run should show:
- ✅ All authentication tests pass
- ✅ All validation tests pass
- ✅ All database operations succeed
- ✅ Debug information is complete
- ✅ Response times are acceptable
- ✅ No duplicate responses created
- ✅ Mock questions work correctly
- ✅ Real database questions work correctly



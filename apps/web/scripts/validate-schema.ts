#!/usr/bin/env tsx

/**
 * Database Schema Validation Script
 * Validates the Prisma schema for Flow Answers API requirements
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface ValidationResult {
  test: string;
  passed: boolean;
  message: string;
  details?: any;
}

async function validateSchema(): Promise<ValidationResult[]> {
  const results: ValidationResult[] = [];

  try {
    // Test 1: User table has email unique constraint
    try {
      const userCount = await prisma.user.count();
      results.push({
        test: 'User table exists',
        passed: true,
        message: `User table found with ${userCount} records`,
      });
    } catch (error) {
      results.push({
        test: 'User table exists',
        passed: false,
        message: 'User table not found or not accessible',
        details: error,
      });
    }

    // Test 2: FlowQuestion table exists and has required fields
    try {
      const questionCount = await prisma.flowQuestion.count();
      const sampleQuestion = await prisma.flowQuestion.findFirst();
      
      results.push({
        test: 'FlowQuestion table exists',
        passed: true,
        message: `FlowQuestion table found with ${questionCount} records`,
      });

      if (sampleQuestion) {
        const hasRequiredFields = [
          'id',
          'text',
          'isActive',
          'locale',
          'type',
          'createdAt',
        ].every(field => field in sampleQuestion);

        results.push({
          test: 'FlowQuestion has required fields',
          passed: hasRequiredFields,
          message: hasRequiredFields 
            ? 'All required fields present' 
            : 'Missing required fields',
          details: sampleQuestion,
        });
      }
    } catch (error) {
      results.push({
        test: 'FlowQuestion table exists',
        passed: false,
        message: 'FlowQuestion table not found or not accessible',
        details: error,
      });
    }

    // Test 3: UserResponse table exists and has required fields
    try {
      const responseCount = await prisma.userResponse.count();
      const sampleResponse = await prisma.userResponse.findFirst();
      
      results.push({
        test: 'UserResponse table exists',
        passed: true,
        message: `UserResponse table found with ${responseCount} records`,
      });

      if (sampleResponse) {
        const hasRequiredFields = [
          'id',
          'userId',
          'questionId',
          'optionId',
          'valueText',
          'skipped',
          'timeMs',
          'createdAt',
        ].every(field => field in sampleResponse);

        results.push({
          test: 'UserResponse has required fields',
          passed: hasRequiredFields,
          message: hasRequiredFields 
            ? 'All required fields present' 
            : 'Missing required fields',
          details: sampleResponse,
        });
      }
    } catch (error) {
      results.push({
        test: 'UserResponse table exists',
        passed: false,
        message: 'UserResponse table not found or not accessible',
        details: error,
      });
    }

    // Test 4: Unique constraints
    try {
      // Test User.email uniqueness
      const duplicateEmails = await prisma.$queryRaw`
        SELECT email, COUNT(*) as count 
        FROM users 
        GROUP BY email 
        HAVING COUNT(*) > 1
      ` as any[];

      results.push({
        test: 'User.email unique constraint',
        passed: duplicateEmails.length === 0,
        message: duplicateEmails.length === 0 
          ? 'No duplicate emails found' 
          : `Found ${duplicateEmails.length} duplicate emails`,
        details: duplicateEmails,
      });

      // Test UserResponse (userId, questionId) uniqueness
      const duplicateResponses = await prisma.$queryRaw`
        SELECT userId, questionId, COUNT(*) as count 
        FROM user_responses 
        GROUP BY userId, questionId 
        HAVING COUNT(*) > 1
      ` as any[];

      results.push({
        test: 'UserResponse (userId, questionId) unique constraint',
        passed: duplicateResponses.length === 0,
        message: duplicateResponses.length === 0 
          ? 'No duplicate responses found' 
          : `Found ${duplicateResponses.length} duplicate responses`,
        details: duplicateResponses,
      });
    } catch (error) {
      results.push({
        test: 'Unique constraints check',
        passed: false,
        message: 'Error checking unique constraints',
        details: error,
      });
    }

    // Test 5: Foreign key relationships
    try {
      // Test UserResponse -> User relationship
      const userResponseWithUser = await prisma.userResponse.findFirst({
        include: { user: true },
      });

      results.push({
        test: 'UserResponse -> User foreign key',
        passed: !!userResponseWithUser?.user,
        message: userResponseWithUser?.user 
          ? 'Foreign key relationship working' 
          : 'No UserResponse records with valid User relationship',
      });

      // Test UserResponse -> FlowQuestion relationship
      const userResponseWithQuestion = await prisma.userResponse.findFirst({
        include: { question: true },
      });

      results.push({
        test: 'UserResponse -> FlowQuestion foreign key',
        passed: !!userResponseWithQuestion?.question,
        message: userResponseWithQuestion?.question 
          ? 'Foreign key relationship working' 
          : 'No UserResponse records with valid FlowQuestion relationship',
      });
    } catch (error) {
      results.push({
        test: 'Foreign key relationships',
        passed: false,
        message: 'Error checking foreign key relationships',
        details: error,
      });
    }

    // Test 6: Active questions
    try {
      const activeQuestions = await prisma.flowQuestion.count({
        where: { isActive: true },
      });

      const totalQuestions = await prisma.flowQuestion.count();

      results.push({
        test: 'Active questions available',
        passed: activeQuestions > 0,
        message: `${activeQuestions} active questions out of ${totalQuestions} total`,
      });
    } catch (error) {
      results.push({
        test: 'Active questions check',
        passed: false,
        message: 'Error checking active questions',
        details: error,
      });
    }

    // Test 7: Database connection and basic operations
    try {
      await prisma.$queryRaw`SELECT 1`;
      results.push({
        test: 'Database connection',
        passed: true,
        message: 'Database connection successful',
      });
    } catch (error) {
      results.push({
        test: 'Database connection',
        passed: false,
        message: 'Database connection failed',
        details: error,
      });
    }

  } catch (error) {
    results.push({
      test: 'Schema validation',
      passed: false,
      message: 'Unexpected error during validation',
      details: error,
    });
  }

  return results;
}

async function main() {
  console.log('🔍 Validating Database Schema for Flow Answers API...\n');

  const results = await validateSchema();

  let passed = 0;
  let failed = 0;

  results.forEach(result => {
    const status = result.passed ? '✅' : '❌';
    console.log(`${status} ${result.test}: ${result.message}`);
    
    if (result.details && !result.passed) {
      console.log(`   Details: ${JSON.stringify(result.details, null, 2)}`);
    }

    if (result.passed) {
      passed++;
    } else {
      failed++;
    }
  });

  console.log(`\n📊 Validation Summary:`);
  console.log(`   Passed: ${passed}`);
  console.log(`   Failed: ${failed}`);
  console.log(`   Total:  ${results.length}`);

  if (failed === 0) {
    console.log('\n🎉 All validations passed! Database schema is ready for Flow Answers API.');
  } else {
    console.log('\n⚠️  Some validations failed. Please fix the issues before using Flow Answers API.');
    process.exit(1);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());



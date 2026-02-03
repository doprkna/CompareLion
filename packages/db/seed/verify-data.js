/**
 * Data Verification Script
 * Verifies that seeding was successful
 */
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function verifyData() {
    console.log('\n' + '═'.repeat(60));
    console.log('🔍 Database Verification');
    console.log('═'.repeat(60) + '\n');
    try {
        // Count questions
        const questionCount = await prisma.flowQuestion.count();
        const activeQuestions = await prisma.flowQuestion.count({
            where: { isActive: true },
        });
        // Count by type
        const singleChoice = await prisma.flowQuestion.count({
            where: { type: 'SINGLE_CHOICE' },
        });
        const multiChoice = await prisma.flowQuestion.count({
            where: { type: 'MULTI_CHOICE' },
        });
        const range = await prisma.flowQuestion.count({
            where: { type: 'RANGE' },
        });
        const number = await prisma.flowQuestion.count({
            where: { type: 'NUMBER' },
        });
        const text = await prisma.flowQuestion.count({
            where: { type: 'TEXT' },
        });
        // Count options
        const optionCount = await prisma.flowQuestionOption.count();
        // Count responses
        const responseCount = await prisma.userResponse.count();
        // Count demo users
        const demoUserCount = await prisma.user.count({
            where: {
                email: {
                    in: ['demo@parel.app', 'user@parel.app', 'test@parel.app'],
                },
            },
        });
        // Get sample responses by type
        const responsesWithOptions = await prisma.userResponse.count({
            where: { optionIds: { isEmpty: false } },
        });
        const responsesWithNumeric = await prisma.userResponse.count({
            where: { numericVal: { not: null } },
        });
        const responsesWithText = await prisma.userResponse.count({
            where: { textVal: { not: null } },
        });
        console.log('📊 Question Statistics:');
        console.log(`   Total Questions: ${questionCount}`);
        console.log(`   Active Questions: ${activeQuestions}`);
        console.log(`   └─ SINGLE_CHOICE: ${singleChoice}`);
        console.log(`   └─ MULTI_CHOICE: ${multiChoice}`);
        console.log(`   └─ RANGE: ${range}`);
        console.log(`   └─ NUMBER: ${number}`);
        console.log(`   └─ TEXT: ${text}`);
        console.log('');
        console.log('📝 Option Statistics:');
        console.log(`   Total Options: ${optionCount}`);
        console.log('');
        console.log('💬 Response Statistics:');
        console.log(`   Total Responses: ${responseCount}`);
        console.log(`   └─ With Options: ${responsesWithOptions}`);
        console.log(`   └─ With Numeric Values: ${responsesWithNumeric}`);
        console.log(`   └─ With Text: ${responsesWithText}`);
        console.log('');
        console.log('👤 User Statistics:');
        console.log(`   Demo Users: ${demoUserCount}`);
        console.log('');
        // Sample some actual data
        const sampleQuestion = await prisma.flowQuestion.findFirst({
            where: { type: 'SINGLE_CHOICE' },
            include: { options: true, responses: { take: 1 } },
        });
        if (sampleQuestion) {
            console.log('📋 Sample Question:');
            console.log(`   Type: ${sampleQuestion.type}`);
            console.log(`   Text: "${sampleQuestion.text.substring(0, 60)}..."`);
            console.log(`   Options: ${sampleQuestion.options.length}`);
            console.log(`   Responses: ${sampleQuestion.responses.length}`);
            console.log('');
        }
        console.log('═'.repeat(60));
        console.log('✅ Verification Complete!');
        console.log('═'.repeat(60) + '\n');
        // Return summary
        return {
            questions: questionCount,
            options: optionCount,
            responses: responseCount,
            demoUsers: demoUserCount,
        };
    }
    catch (error) {
        console.error('❌ Error during verification:', error);
        throw error;
    }
    finally {
        await prisma.$disconnect();
    }
}
verifyData()
    .then((summary) => {
    console.log('📈 Summary:');
    console.log(`   ✅ Questions: ${summary.questions}`);
    console.log(`   ✅ Options: ${summary.options}`);
    console.log(`   ✅ Responses: ${summary.responses}`);
    console.log(`   ✅ Demo Users: ${summary.demoUsers}\n`);
})
    .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
});

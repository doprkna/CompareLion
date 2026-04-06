/**
 * seed-demo-minimal.ts - Minimal deterministic seed for Demo Flow.
 * 2 categories, 20-30 questions, 1 demo user, 1 admin user. Idempotent. DEV only.
 */
import './_loadEnv';
import './guard-seed-demo-env';
import { PrismaClient, UserRole } from '@parel/db/client';
import { hash } from 'bcryptjs';
const prisma = new PrismaClient();
const ROOT_ID = 'seed-demo-root';
const SUB_ID = 'seed-demo-sub';
const SUBSUB_ID = 'seed-demo-subsub';
const CAT_IDS = ['seed-demo-cat-1', 'seed-demo-cat-2'];
const CAT_NAMES = { 'seed-demo-cat-1': 'Wellbeing', 'seed-demo-cat-2': 'Habits' };
const DEMO_EMAIL = 'demo@example.com';
const LOCALE = 'en';
function qId(catIdx, qIdx) {
    return `seed-demo-q-${catIdx + 1}-${String(qIdx + 1).padStart(2, '0')}`;
}
function optId(catIdx, qIdx, optIdx) {
    return `seed-demo-opt-${catIdx + 1}-${String(qIdx + 1).padStart(2, '0')}-${optIdx + 1}`;
}
async function ensureHierarchy() {
    await prisma.category.upsert({ where: { id: ROOT_ID }, create: { id: ROOT_ID, name: 'Demo Root' }, update: {} });
    await prisma.subCategory.upsert({ where: { id: SUB_ID }, create: { id: SUB_ID, name: 'Demo Sub', categoryId: ROOT_ID }, update: {} });
    await prisma.subSubCategory.upsert({ where: { id: SUBSUB_ID }, create: { id: SUBSUB_ID, name: 'Demo SubSub', subCategoryId: SUB_ID }, update: {} });
}
async function seedCategories() {
    for (const id of CAT_IDS) {
        await prisma.sssCategory.upsert({
            where: { id },
            create: { id, name: CAT_NAMES[id], subSubCategoryId: SUBSUB_ID, status: 'active' },
            update: { name: CAT_NAMES[id], status: 'active' },
        });
    }
}
const QUESTIONS = [
    { text: 'How would you rate your energy level today?', type: 'SINGLE_CHOICE', options: ['Low', 'Moderate', 'High', 'Very high'] },
    { text: 'How many hours did you sleep last night?', type: 'NUMBER' },
    { text: 'What is one thing you are grateful for today?', type: 'TEXT' },
    { text: 'How often do you exercise per week?', type: 'SINGLE_CHOICE', options: ['Never', '1-2 times', '3-4 times', '5+ times'] },
    { text: 'Rate your stress level (1-10)', type: 'NUMBER' },
    { text: 'What helps you relax the most?', type: 'SINGLE_CHOICE', options: ['Meditation', 'Exercise', 'Reading', 'Social time'] },
    { text: 'How would you describe your mood right now?', type: 'TEXT' },
    { text: 'Do you drink enough water daily?', type: 'SINGLE_CHOICE', options: ['Rarely', 'Sometimes', 'Often', 'Always'] },
    { text: 'How many minutes of outdoor time today?', type: 'NUMBER' },
    { text: 'What is your main wellness goal?', type: 'TEXT' },
    { text: 'Which habit do you want to build?', type: 'SINGLE_CHOICE', options: ['Morning routine', 'Exercise', 'Reading', 'Mindfulness'] },
    { text: 'How many days per week do you want to practice this habit?', type: 'NUMBER' },
    { text: 'What triggers your best habits?', type: 'TEXT' },
    { text: 'When do you struggle most with habits?', type: 'SINGLE_CHOICE', options: ['Morning', 'Afternoon', 'Evening', 'Weekends'] },
    { text: 'Rate your current habit consistency (1-10)', type: 'NUMBER' },
];
async function seedQuestions() {
    let count = 0;
    for (let c = 0; c < CAT_IDS.length; c++) {
        const categoryId = CAT_IDS[c];
        for (let q = 0; q < QUESTIONS.length; q++) {
            const qn = QUESTIONS[q];
            const qIdVal = qId(c, q);
            await prisma.flowQuestion.upsert({
                where: { id: qIdVal },
                create: { id: qIdVal, categoryId, locale: LOCALE, text: qn.text, type: qn.type, isActive: true },
                update: { locale: LOCALE, text: qn.text, type: qn.type, isActive: true },
            });
            if (qn.options) {
                for (let o = 0; o < qn.options.length; o++) {
                    await prisma.flowQuestionOption.upsert({
                        where: { id: optId(c, q, o) },
                        create: { id: optId(c, q, o), questionId: qIdVal, label: qn.options[o], value: `v-${o}`, order: o },
                        update: { questionId: qIdVal, label: qn.options[o], value: `v-${o}`, order: o },
                    });
                }
            }
            count++;
        }
    }
    return count;
}
async function seedDemoUser() {
    const pwHash = await hash('password123', 10);
    const adminPwHash = await hash('1AmTheArchitect', 10);
    await prisma.user.upsert({
        where: { email: 'admin@example.com' },
        create: {
            email: 'admin@example.com',
            passwordHash: adminPwHash,
            name: 'Admin User',
            role: UserRole.ADMIN,
            xp: 0, streakCount: 0, level: 1,
            emailVerified: new Date(),
        },
        update: { passwordHash: adminPwHash, name: 'Admin User', role: UserRole.ADMIN },
    });
    await prisma.user.upsert({
        where: { email: DEMO_EMAIL },
        create: {
            email: DEMO_EMAIL,
            passwordHash: pwHash,
            name: 'Demo Player',
            role: UserRole.USER,
            xp: 0,
            streakCount: 0,
            level: 1,
            emailVerified: new Date(),
        },
        update: { xp: 0, streakCount: 0, level: 1 },
    });
    return true;
}
async function main() {
    await ensureHierarchy();
    await seedCategories();
    const qCount = await seedQuestions();
    await seedDemoUser();
    console.log(`seed-demo-minimal: 2 categories, ${qCount} questions, 1 demo user, 1 admin user`);
}
main()
    .then(() => prisma.$disconnect())
    .catch((e) => { console.error(e); process.exit(1); });

/**
 * seed-world.ts - Minimal-but-complete world seed. Dev-only.
 * Eliminates "empty world": inventory, progression, achievements, feed, events, groups.
 * Single source of truth; invoked by prisma/seed.ts and db:seed:world.
 */
import './_loadEnv';
import { ensureDatabaseUrl } from '../src/resolveDatabaseUrl';
import { PrismaClient, QuestionType, UserRole } from '@parel/db/client';
import { hash } from 'bcryptjs';
ensureDatabaseUrl();
const prisma = new PrismaClient();
const DEMO_EMAIL = 'demo@example.com';
const ADMIN_EXAMPLE = 'admin@example.com';
const ADMIN_PAREL = 'admin@parel.local';
const SEED = 1337;
function mulberry32(seed) {
    let s = seed;
    return function () {
        let t = (s += 0x6d2b79f5);
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}
export async function runSeedWorld() {
    const appEnv = (process.env.APP_ENV ?? 'dev').toString().toLowerCase();
    if (appEnv === 'prod' || appEnv === 'production') {
        console.error('Refusing to seed: APP_ENV must be dev');
        process.exit(1);
    }
    const stats = {};
    const demoPw = await hash('password123', 10);
    const adminPw = await hash(process.env.ADMIN_PASSWORD ?? '1AmTheArchitect', 10);
    const demo = await prisma.user.upsert({
        where: { email: DEMO_EMAIL },
        create: {
            email: DEMO_EMAIL,
            passwordHash: demoPw,
            name: 'Demo Player',
            role: UserRole.USER,
            xp: 250,
            level: 3,
            funds: 500,
            diamonds: 20,
            karma: 50,
            streakCount: 2,
            emailVerified: new Date(),
        },
        update: { xp: 250, level: 3, funds: 500, diamonds: 20, karma: 50 },
    });
    await prisma.user.upsert({
        where: { email: ADMIN_EXAMPLE },
        create: {
            email: ADMIN_EXAMPLE,
            passwordHash: adminPw,
            name: 'Admin User',
            role: UserRole.ADMIN,
            xp: 12000,
            funds: 2500,
            diamonds: 100,
            level: 10,
            emailVerified: new Date(),
        },
        update: { passwordHash: adminPw, funds: 2500, diamonds: 100 },
    });
    await prisma.user.upsert({
        where: { email: ADMIN_PAREL },
        create: {
            email: ADMIN_PAREL,
            passwordHash: adminPw,
            name: 'Architect',
            role: UserRole.ADMIN,
            xp: 5000,
            funds: 1000,
            diamonds: 50,
            level: 5,
            emailVerified: new Date(),
        },
        update: { passwordHash: adminPw, funds: 1000, diamonds: 50 },
    });
    const DEMO_USERS = [
        { email: 'demo1@example.com', name: 'Demo User 1', xp: 400, level: 4 },
        { email: 'demo2@example.com', name: 'Demo User 2', xp: 350, level: 4 },
        { email: 'demo3@example.com', name: 'Demo User 3', xp: 300, level: 3 },
        { email: 'demo4@example.com', name: 'Demo User 4', xp: 200, level: 2 },
        { email: 'demo5@example.com', name: 'Demo User 5', xp: 150, level: 2 },
        { email: 'demo6@example.com', name: 'Demo User 6', xp: 100, level: 1 },
    ];
    for (const u of DEMO_USERS) {
        await prisma.user.upsert({
            where: { email: u.email },
            create: {
                email: u.email,
                passwordHash: demoPw,
                name: u.name,
                role: UserRole.USER,
                xp: u.xp,
                level: u.level,
                emailVerified: new Date(),
            },
            update: { xp: u.xp, level: u.level },
        });
    }
    stats['User'] = 9;
    const ROOT_ID = 'seed-world-root';
    const SUB_ID = 'seed-world-sub';
    const SUBSUB_ID = 'seed-world-subsub';
    const CAT_NAMES = ['Wellbeing', 'Habits', 'Money', 'Work', 'Relationships', 'Parenting', 'Health', 'Fun', 'Tech', 'Random'];
    await prisma.category.upsert({ where: { id: ROOT_ID }, update: {}, create: { id: ROOT_ID, name: 'World' } });
    await prisma.subCategory.upsert({ where: { id: SUB_ID }, update: {}, create: { id: SUB_ID, name: 'Flow', categoryId: ROOT_ID } });
    await prisma.subSubCategory.upsert({ where: { id: SUBSUB_ID }, update: {}, create: { id: SUBSUB_ID, name: 'Topics', subCategoryId: SUB_ID } });
    const catIds = [];
    for (let i = 0; i < CAT_NAMES.length; i++) {
        const id = `seed-world-cat-${String(i + 1).padStart(2, '0')}`;
        await prisma.sssCategory.upsert({
            where: { id },
            update: { name: CAT_NAMES[i], status: 'active' },
            create: { id, name: CAT_NAMES[i], subSubCategoryId: SUBSUB_ID, status: 'active' },
        });
        catIds.push(id);
    }
    const CHOICE = [
        { text: 'How would you rate your energy today?', opts: ['Low', 'Moderate', 'High'] },
        { text: 'How often do you exercise?', opts: ['Never', '1-2x', '3+'] },
        { text: 'Sleep quality?', opts: ['Poor', 'Fair', 'Good'] },
    ];
    const rng = mulberry32(SEED);
    let qCount = 0;
    for (let c = 0; c < catIds.length; c++) {
        for (let q = 0; q < 20; q++) {
            const qid = `seed-world-q-${String(c + 1).padStart(2, '0')}-${String(q + 1).padStart(3, '0')}`;
            const tpl = CHOICE[q % CHOICE.length];
            await prisma.flowQuestion.upsert({
                where: { id: qid },
                update: {},
                create: {
                    id: qid,
                    categoryId: catIds[c],
                    text: tpl.text,
                    type: QuestionType.SINGLE_CHOICE,
                    isActive: true,
                },
            });
            for (let o = 0; o < tpl.opts.length; o++) {
                const oid = `${qid}-opt-${o}`;
                await prisma.flowQuestionOption.upsert({
                    where: { id: oid },
                    update: {},
                    create: { id: oid, questionId: qid, label: tpl.opts[o], value: `v${o}`, order: o },
                });
            }
            qCount++;
        }
    }
    stats['FlowQuestion'] = qCount;
    const EQUIP_KEYS = [
        { key: 'seed-world-equip-head', type: 'armor', slot: 'head', name: 'Starter Helm' },
        { key: 'seed-world-equip-body', type: 'armor', slot: 'body', name: 'Starter Chestplate' },
        { key: 'seed-world-equip-legs', type: 'armor', slot: 'legs', name: 'Starter Leggings' },
        { key: 'seed-world-equip-weapon', type: 'weapon', slot: 'weapon', name: 'Starter Sword' },
        { key: 'seed-world-equip-accessories', type: 'armor', slot: 'accessories', name: 'Starter Amulet' },
        { key: 'seed-world-equip-off-hand', type: 'weapon', slot: 'off-hand', name: 'Starter Shield' },
    ];
    for (const e of EQUIP_KEYS) {
        await prisma.item.upsert({
            where: { key: e.key },
            update: {},
            create: {
                key: e.key,
                name: e.name,
                type: e.type,
                slot: e.slot,
                rarity: 'common',
                goldPrice: 100,
            },
        });
    }
    for (let b = 1; b <= 3; b++) {
        const key = `seed-world-backpack-${String(b).padStart(2, '0')}`;
        await prisma.item.upsert({
            where: { key },
            update: { type: 'armor', slot: 'accessories', name: `Spare Amulet ${b}` },
            create: {
                key,
                name: `Spare Amulet ${b}`,
                type: 'armor',
                slot: 'accessories',
                rarity: 'common',
                goldPrice: 25,
            },
        });
    }
    // Shop-visible items: isShopItem + goldPrice required for /api/shop
    for (let i = 0; i < 20; i++) {
        const key = `seed-world-item-${String(i + 1).padStart(2, '0')}`;
        await prisma.item.upsert({
            where: { key },
            update: { isShopItem: true, isFeatured: i < 3 },
            create: {
                key,
                name: `Item ${i + 1}`,
                type: 'weapon',
                rarity: 'common',
                goldPrice: 50 + i * 10,
                isShopItem: true,
                isFeatured: i < 3,
            },
        });
    }
    // Consumable, material, theme Items (inventory tabs)
    for (let i = 1; i <= 6; i++) {
        const key = `seed-world-consumable-` + String(i).padStart(2, '0');
        await prisma.item.upsert({
            where: { key },
            update: {},
            create: {
                key,
                name: "Potion " + i,
                type: 'consumable',
                emoji: '\u{1F9EA}',
                rarity: 'common',
                goldPrice: 25 + i * 5,
            },
        });
    }
    for (let i = 1; i <= 6; i++) {
        const key = `seed-world-material-` + String(i).padStart(2, '0');
        await prisma.item.upsert({
            where: { key },
            update: {},
            create: {
                key,
                name: "Material " + i,
                type: 'material',
                emoji: '\u{1F4E6}',
                rarity: 'common',
                goldPrice: 30 + i * 5,
            },
        });
    }
    for (let i = 1; i <= 4; i++) {
        const key = `seed-world-theme-` + String(i).padStart(2, '0');
        await prisma.item.upsert({
            where: { key },
            update: {},
            create: {
                key,
                name: "Theme " + i,
                type: 'theme',
                emoji: '\u{1F3A8}',
                rarity: 'common',
                goldPrice: 100 + i * 25,
            },
        });
    }
    stats['Item'] = 45;
    const seedUsers = await prisma.user.findMany({ where: { email: { in: [DEMO_EMAIL, ADMIN_EXAMPLE, ADMIN_PAREL] } } });
    const equipKeys = EQUIP_KEYS.map((e) => e.key);
    const backpackKeys = ['seed-world-backpack-01', 'seed-world-backpack-02', 'seed-world-backpack-03'];
    const consumableKeys = ['seed-world-consumable-01', 'seed-world-consumable-02'];
    const materialKeys = ['seed-world-material-01', 'seed-world-material-02'];
    const themeKeys = ['seed-world-theme-01'];
    const userItemKeys = [...equipKeys, ...backpackKeys, ...consumableKeys, ...materialKeys, ...themeKeys];
    const userItems = await prisma.item.findMany({ where: { key: { in: userItemKeys } } });
    const itemByKey = Object.fromEntries(userItems.map((it) => [it.key ?? '', it]));
    for (const user of seedUsers) {
        for (let i = 0; i < equipKeys.length; i++) {
            const item = itemByKey[equipKeys[i]];
            if (!item)
                continue;
            await prisma.userItem.upsert({
                where: { userId_itemId: { userId: user.id, itemId: item.id } },
                update: { quantity: 1, equipped: true },
                create: {
                    userId: user.id,
                    itemId: item.id,
                    quantity: 1,
                    equipped: true,
                },
            });
        }
        for (let i = 0; i < backpackKeys.length; i++) {
            const item = itemByKey[backpackKeys[i]];
            if (!item)
                continue;
            await prisma.userItem.upsert({
                where: { userId_itemId: { userId: user.id, itemId: item.id } },
                update: { quantity: 1, equipped: false },
                create: {
                    userId: user.id,
                    itemId: item.id,
                    quantity: 1,
                    equipped: false,
                },
            });
        }
        for (const k of [...consumableKeys, ...materialKeys, ...themeKeys]) {
            const item = itemByKey[k];
            if (!item)
                continue;
            await prisma.userItem.upsert({
                where: { userId_itemId: { userId: user.id, itemId: item.id } },
                update: { quantity: 1, equipped: false },
                create: {
                    userId: user.id,
                    itemId: item.id,
                    quantity: 1,
                    equipped: false,
                },
            });
        }
    }
    stats['UserItem'] = 42;
    if (seedUsers.length < 3) {
        console.log("WARN: expected 3 seed users, got " + seedUsers.length);
    }
    for (const user of seedUsers) {
        const equipped = await prisma.userItem.count({ where: { userId: user.id, equipped: true } });
        const backpack = await prisma.userItem.count({ where: { userId: user.id, equipped: false } });
        console.log("inventory verify: " + user.email + " equipped=" + equipped + " backpack=" + backpack);
    }
    const items = await prisma.item.findMany({ where: { key: { startsWith: 'seed-world-item-' } }, take: 8 });
    for (let i = 0; i < items.length; i++) {
        await prisma.inventoryItem.upsert({
            where: { userId_itemId: { userId: demo.id, itemId: items[i].id } },
            update: { quantity: 1, equipped: i < 4 },
            create: {
                userId: demo.id,
                itemId: items[i].id,
                itemKey: items[i].key ?? undefined,
                quantity: 1,
                equipped: i < 4,
            },
        });
    }
    stats['InventoryItem'] = 8;
    const ACH_BUCKETS = ['combat', 'mind', 'social', 'commerce', 'integration'];
    const BUCKET_META = {
        combat: { title: 'Combat', desc: 'Battle victories and combat feats', emoji: '\u2694\ufe0f' },
        mind: { title: 'Mind', desc: 'Focus, learning, and mental growth', emoji: '\ud83e\udd20' },
        social: { title: 'Social', desc: 'Connections and community', emoji: '\ud83d\udc65' },
        commerce: { title: 'Commerce', desc: 'Trading and economy', emoji: '\ud83d\udcb0' },
        integration: { title: 'Integration', desc: 'Holistic balance and harmony', emoji: '\ud83d\udd17' },
    };
    const achIdsByBucket = {};
    for (const bucket of ACH_BUCKETS) {
        const meta = BUCKET_META[bucket];
        achIdsByBucket[bucket] = [];
        for (let n = 1; n <= 2; n++) {
            const code = `seed-world-ach-${bucket}-${String(n).padStart(2, '0')}`;
            const ach = await prisma.achievement.upsert({
                where: { code },
                update: {},
                create: {
                    code,
                    key: `ach-${bucket}-${n}`,
                    category: bucket,
                    tier: 1,
                    title: `${meta.title} Achievement ${n}`,
                    description: meta.desc,
                    emoji: meta.emoji,
                    xpReward: 50,
                    rewardGold: 10,
                },
            });
            achIdsByBucket[bucket].push(ach.id);
        }
    }
    stats['Achievement'] = ACH_BUCKETS.length * 2;
    for (const bucket of ACH_BUCKETS) {
        const firstAchId = achIdsByBucket[bucket][0];
        await prisma.userAchievement.upsert({
            where: { userId_achievementId_tier: { userId: demo.id, achievementId: firstAchId, tier: 1 } },
            update: {},
            create: { userId: demo.id, achievementId: firstAchId, tier: 1 },
        });
    }
    stats['UserAchievement'] = ACH_BUCKETS.length;
    // UserResponse + hero stats for demo and admin@example.com (idempotent)
    const TARGET_CATEGORIES = ['seed-world-cat-01', 'seed-world-cat-05', 'seed-world-cat-07', 'seed-world-cat-08', 'seed-world-cat-09'];
    const flowQuestions = [];
    for (const catId of TARGET_CATEGORIES) {
        const qs = await prisma.flowQuestion.findMany({
            where: { categoryId: catId, isActive: true },
            take: 2,
            select: { id: true },
        });
        flowQuestions.push(...qs);
    }
    const questionIds = flowQuestions.map((q) => q.id);
    const options = await prisma.flowQuestionOption.findMany({
        where: { questionId: { in: questionIds } },
        orderBy: { order: 'asc' },
        select: { id: true, questionId: true },
    });
    const firstOptByQuestion = new Map();
    for (const o of options) {
        if (!firstOptByQuestion.has(o.questionId))
            firstOptByQuestion.set(o.questionId, o.id);
    }
    const heroUsers = await prisma.user.findMany({
        where: { email: { in: [DEMO_EMAIL, ADMIN_EXAMPLE] } },
        select: { id: true, email: true },
    });
    let userResponseCount = 0;
    for (const user of heroUsers) {
        for (const q of flowQuestions) {
            const firstOptId = firstOptByQuestion.get(q.id);
            if (!firstOptId)
                continue;
            await prisma.userResponse.upsert({
                where: { userId_questionId: { userId: user.id, questionId: q.id } },
                update: { optionIds: [firstOptId], skipped: false },
                create: {
                    userId: user.id,
                    questionId: q.id,
                    optionIds: [firstOptId],
                    skipped: false,
                },
            });
            userResponseCount++;
        }
    }
    stats['UserResponse'] = userResponseCount;
    await prisma.user.updateMany({
        where: { email: { in: [DEMO_EMAIL, ADMIN_EXAMPLE] } },
        data: {
            statSleep: 25,
            statHealth: 30,
            statSocial: 35,
            statKnowledge: 40,
            statCreativity: 45,
        },
    });
    console.log('hero stats: demo statSleep=25 statHealth=30 statSocial=35 statKnowledge=40 statCreativity=45, admin statSleep=25 statHealth=30 statSocial=35 statKnowledge=40 statCreativity=45');
    // Friends for leaderboard Friends tab (deterministic, idempotent)
    const allSeedEmails = [DEMO_EMAIL, ADMIN_EXAMPLE, ADMIN_PAREL, 'demo1@example.com', 'demo2@example.com', 'demo3@example.com', 'demo4@example.com', 'demo5@example.com', 'demo6@example.com'];
    const allSeedUsers = await prisma.user.findMany({ where: { email: { in: allSeedEmails } } });
    const userByEmail = Object.fromEntries(allSeedUsers.map((u) => [u.email ?? '', u]));
    const friendPairs = [
        [ADMIN_EXAMPLE, DEMO_EMAIL],
        [ADMIN_EXAMPLE, 'demo1@example.com'],
        [ADMIN_EXAMPLE, 'demo2@example.com'],
        [DEMO_EMAIL, 'demo1@example.com'],
        [DEMO_EMAIL, 'demo2@example.com'],
        [DEMO_EMAIL, 'demo3@example.com'],
        ['demo1@example.com', 'demo2@example.com'],
        ['demo2@example.com', 'demo3@example.com'],
        ['demo3@example.com', 'demo4@example.com'],
    ];
    let friendCount = 0;
    for (const [emailA, emailB] of friendPairs) {
        const uA = userByEmail[emailA];
        const uB = userByEmail[emailB];
        if (!uA || !uB)
            continue;
        await prisma.friend.upsert({
            where: { userId_friendId: { userId: uA.id, friendId: uB.id } },
            create: { userId: uA.id, friendId: uB.id, status: 'ACCEPTED' },
            update: { status: 'ACCEPTED' },
        });
        friendCount++;
        await prisma.friend.upsert({
            where: { userId_friendId: { userId: uB.id, friendId: uA.id } },
            create: { userId: uB.id, friendId: uA.id, status: 'ACCEPTED' },
            update: { status: 'ACCEPTED' },
        });
        friendCount++;
    }
    stats['Friend'] = friendCount;
    // Messages for demo (3 messages demo <-> admin so Messages UI isn't blank)
    const demoU = await prisma.user.findUnique({ where: { email: DEMO_EMAIL }, select: { id: true } });
    const adminU = await prisma.user.findUnique({ where: { email: ADMIN_EXAMPLE }, select: { id: true } });
    if (demoU && adminU) {
        const CONTENTS = ['Hey! Welcome to PareL.', 'Great to connect here.', "Let's compare stats sometime!"];
        for (let i = 0; i < 3; i++) {
            await prisma.message.create({
                data: {
                    senderId: i % 2 === 0 ? demoU.id : adminU.id,
                    receiverId: i % 2 === 0 ? adminU.id : demoU.id,
                    content: CONTENTS[i],
                },
            });
        }
        stats['Message'] = 3;
    }
    for (let i = 0; i < 10; i++) {
        await prisma.notification.create({
            data: {
                userId: demo.id,
                type: 'system',
                title: `Notification ${i + 1}`,
                body: 'Seeded',
                isRead: i < 4,
            },
        });
    }
    stats['Notification'] = 10;
    const now = new Date();
    for (let d = 0; d < 8; d++) {
        const start = new Date(now);
        start.setDate(start.getDate() - d);
        start.setHours(0, 0, 0, 0);
        const end = new Date(start);
        end.setDate(end.getDate() + 1);
        await prisma.globalEvent.upsert({
            where: { id: `seed-world-event-${d}` },
            update: {},
            create: {
                id: `seed-world-event-${d}`,
                title: `Daily Challenge ${8 - d}`,
                bonusType: 'xp',
                bonusValue: 25,
                startAt: start,
                endAt: end,
                active: d === 0,
            },
        });
    }
    stats['GlobalEvent'] = 8;
    const extraUsers = await prisma.user.findMany({ where: { email: { in: [ADMIN_EXAMPLE, ADMIN_PAREL] } } });
    const feedUsers = [demo, ...extraUsers];
    for (let i = 0; i < 50; i++) {
        const u = feedUsers[i % feedUsers.length];
        await prisma.globalFeedItem.create({
            data: {
                userId: u.id,
                type: 'reflection',
                title: `Feed ${i + 1}`,
                description: 'Seeded',
            },
        });
    }
    stats['GlobalFeedItem'] = 50;
    const groupNames = ['Phoenix', 'Lightning', 'Ocean', 'Moon', 'Star'];
    let firstGroupId = '';
    for (let i = 0; i < 5; i++) {
        const g = await prisma.group.upsert({
            where: { name: `seed-world-${groupNames[i]}` },
            update: {},
            create: {
                name: `seed-world-${groupNames[i]}`,
                emblem: '⭐',
                motto: 'Unity',
            },
        });
        if (i === 0)
            firstGroupId = g.id;
    }
    await prisma.groupMember.upsert({
        where: { userId_groupId: { userId: demo.id, groupId: firstGroupId } },
        update: {},
        create: { userId: demo.id, groupId: firstGroupId, role: 'member' },
    });
    stats['Group'] = 5;
    stats['GroupMember'] = 1;
    console.log('achievements: ' + ACH_BUCKETS.map(b => `${b}=2`).join(', ') + ', demo UserAchievement=' + stats['UserAchievement']);
    return stats;
}
async function main() {
    const t0 = Date.now();
    const stats = await runSeedWorld();
    const elapsed = ((Date.now() - t0) / 1000).toFixed(2);
    console.log(`seed-world: ${Object.entries(stats).map(([k, v]) => `${k}=${v}`).join(', ')} | ${elapsed}s`);
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(() => prisma.$disconnect());

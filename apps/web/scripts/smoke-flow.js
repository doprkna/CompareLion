import '../../../packages/db/scripts/_loadEnv';
/**
 * Smoke test for Flow demo loop (API-level).
 * Assumes dev server on http://localhost:3001 (or NEXT_PUBLIC_PORT).
 * Requires: SMOKE_KEY in env, demo user (e.g. pnpm db:seed:demo).
 * Sends x-smoke-key header for dev-only auth bypass.
 */
const BASE = process.env.NEXT_PUBLIC_PORT
    ? `http://localhost:${process.env.NEXT_PUBLIC_PORT}`
    : "http://localhost:3001";
const MAX_QUESTIONS = 100;
function fail(step, res, body) {
    const snippet = body.length > 200 ? body.slice(0, 200) + "..." : body;
    console.error(`FAIL [${step}] status=${res.status} body=${snippet}`);
    process.exit(1);
}
function getSmokeHeaders() {
    const key = process.env.SMOKE_KEY?.trim();
    if (!key) {
        console.error("FAIL: SMOKE_KEY must be set in env for smoke tests. Set it in apps/web/.env.local");
        process.exit(1);
    }
    return { "x-smoke-key": key };
}
async function main() {
    const headers = getSmokeHeaders();
    // 1. GET /api/flow/categories
    const catRes = await fetch(`${BASE}/api/flow/categories`, { headers });
    if (!catRes.ok)
        fail("categories", catRes, await catRes.text());
    const catJson = (await catRes.json());
    if (!catJson.success || !Array.isArray(catJson.data) || catJson.data.length === 0) {
        fail("categories", catRes, JSON.stringify(catJson));
    }
    const categoryId = catJson.data[0].id;
    if (!categoryId)
        fail("categories", catRes, "no category id");
    // 2. POST /api/flow/start
    const startRes = await fetch(`${BASE}/api/flow/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...headers },
        body: JSON.stringify({ categoryId }),
    });
    if (!startRes.ok)
        fail("flow/start", startRes, await startRes.text());
    const startJson = (await startRes.json());
    if (!startJson.success)
        fail("flow/start", startRes, JSON.stringify(startJson));
    // 3. Loop: GET question -> POST answer until done
    let questionCount = 0;
    for (;;) {
        const qRes = await fetch(`${BASE}/api/flow/question?categoryId=${encodeURIComponent(categoryId)}`, { headers });
        if (!qRes.ok)
            fail("flow/question", qRes, await qRes.text());
        const qJson = (await qRes.json());
        if (qJson.ok === true && qJson.done === true)
            break;
        let question;
        if (qJson.success && qJson.data) {
            question = qJson.data;
        }
        else {
            fail("flow/question", qRes, JSON.stringify(qJson));
        }
        const type = (question.type || "").toUpperCase();
        let answerPayload = { questionId: question.id };
        if (type === "SINGLE_CHOICE" || type === "MULTI_CHOICE") {
            const opts = question.options;
            if (opts && opts.length > 0) {
                answerPayload.optionIds = [opts[0].id];
            }
        }
        else if (type === "TEXT") {
            answerPayload.textValue = "ok";
        }
        else {
            answerPayload.numericValue = 1;
        }
        const ansRes = await fetch(`${BASE}/api/flow/answer`, {
            method: "POST",
            headers: { "Content-Type": "application/json", ...headers },
            body: JSON.stringify(answerPayload),
        });
        if (!ansRes.ok)
            fail("flow/answer", ansRes, await ansRes.text());
        const ansJson = (await ansRes.json());
        if (!ansJson.success)
            fail("flow/answer", ansRes, JSON.stringify(ansJson));
        questionCount++;
        if (questionCount >= MAX_QUESTIONS)
            break;
    }
    // 4. GET /api/flow/result
    const resultRes = await fetch(`${BASE}/api/flow/result?categoryId=${encodeURIComponent(categoryId)}`, { headers });
    if (!resultRes.ok)
        fail("flow/result", resultRes, await resultRes.text());
    const resultJson = (await resultRes.json());
    if (!resultJson.success)
        fail("flow/result", resultRes, JSON.stringify(resultJson));
    console.log("PASS");
}
main().catch((err) => {
    console.error("FAIL", err?.message ?? err);
    process.exit(1);
});

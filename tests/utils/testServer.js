import express from 'express';
import bodyParser from 'body-parser';
// Import Next.js route handlers
import { GET as pingHandler } from '../apps/web/app/api/ping/route';
import { GET as languagesHandler } from '../apps/web/app/api/languages/route';
const app = express();
app.use(bodyParser.json());
// Wrapper to adapt NextResponse to Express
async function handle(handler, req, res) {
    try {
        const nextRes = await handler(req);
        const data = await nextRes.json();
        res.status(nextRes.status).json(data);
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
}
app.get('/api/ping', (req, res) => handle(pingHandler, req, res));
app.get('/api/languages', (req, res) => handle(languagesHandler, req, res));
export default app;

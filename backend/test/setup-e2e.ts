/**
 * Runs before the test framework loads the spec file — guarantees these
 * are set before `app.module.ts` is required (and ConfigModule.forRoot's
 * validation runs synchronously at that point, not later at compile()).
 * Without this, CI (no .env file on disk) fails env validation; locally
 * it "accidentally" worked off the real .env instead of this isolated db.
 */
process.env.DATABASE_URL = 'file:./test.db';
process.env.FRONTEND_URL = 'http://localhost:5173';
process.env.NODE_ENV = 'test';

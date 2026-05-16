// Sets dummy env vars before any test module is imported.
// ConfigModule.forRoot({ validate }) runs at import time, so these must be set
// before Jest loads the e2e spec files.
process.env.RAWG_API_KEY ??= 'e2e-dummy-rawg-key';
process.env.CLERK_SECRET_KEY ??= 'e2e-dummy-clerk-key';
process.env.CLERK_PUBLISHABLE_KEY ??= 'e2e-dummy-clerk-publishable-key';
process.env.DATABASE_URL ??= 'postgresql://postgres:postgres@localhost:5432/backlogify_test';
process.env.API_KEY ??= 'e2e-test-key';

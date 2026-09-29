import { defineConfig } from 'drizzle-kit'

// Only `drizzle-kit generate` reads this: migrations are applied by the server at start.
export default defineConfig({
  dialect: 'sqlite',
  schema: './src/db/schema.ts',
  out: './drizzle',
})

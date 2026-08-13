import 'dotenv/config'

function requireEnv(name) {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

export const config = {
  port: Number(process.env.PORT ?? 3334),
  databaseUrl: requireEnv('DATABASE_URL'),
}

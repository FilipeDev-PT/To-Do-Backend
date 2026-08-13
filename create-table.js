import { sql } from './src/shared/db.js'

// sql`DROP TABLE IF EXISTS cards`.then(() => {
//     console.log('Table cards dropped successfully')
// }).catch((error) => {
//     console.error('Error dropping table cards:', error)
// })

// sql`DROP TABLE IF EXISTS lists`.then(() => {
//     console.log('Table lists dropped successfully')
// }).catch((error) => {
//     console.error('Error dropping table lists:', error)
// })

// sql`DROP TABLE IF EXISTS boards`.then(() => {
//     console.log('Table boards dropped successfully')
// }).catch((error) => {
//     console.error('Error dropping table boards:', error)
// })

async function createTables() {
  await sql`
    CREATE TABLE IF NOT EXISTS boards (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS lists (
      id TEXT PRIMARY KEY,
      board_id TEXT NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      position INTEGER NOT NULL DEFAULT 0
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS cards (
      id TEXT PRIMARY KEY,
      list_id TEXT NOT NULL REFERENCES lists(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      position INTEGER NOT NULL DEFAULT 0
    )
  `

  console.log('Tables boards, lists, cards created successfully')
}

createTables().catch((error) => {
  console.error('Error creating tables:', error)
  process.exit(1)
})

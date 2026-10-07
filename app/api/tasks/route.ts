import { db } from '@/lib/db';

export async function GET() {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      completed INTEGER DEFAULT 0,
      priority INTEGER DEFAULT 0,
      position INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  const { rows } = await db.execute('SELECT * FROM tasks ORDER BY position ASC, created_at DESC');
  return Response.json(rows);
}

export async function POST(req: Request) {
  const body = await req.json();

  await db.execute(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      completed INTEGER DEFAULT 0,
      priority INTEGER DEFAULT 0,
      position INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  const { rows: maxRows } = await db.execute('SELECT COALESCE(MAX(position), 0) + 1 as next_pos FROM tasks');
  const nextPosition = (maxRows[0] as { next_pos: number }).next_pos;

  await db.execute({
    sql: 'INSERT INTO tasks (title, priority, position) VALUES (?, ?, ?)',
    args: [body.title, body.priority ?? 0, nextPosition],
  });

  const { rows } = await db.execute('SELECT * FROM tasks ORDER BY position ASC, created_at DESC');
  return Response.json(rows, { status: 201 });
}

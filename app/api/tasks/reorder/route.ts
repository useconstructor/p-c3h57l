import { db } from '@/lib/db';

export async function POST(req: Request) {
  const { taskIds } = await req.json();

  if (!Array.isArray(taskIds)) {
    return Response.json({ error: 'taskIds must be an array' }, { status: 400 });
  }

  for (let i = 0; i < taskIds.length; i++) {
    await db.execute({
      sql: 'UPDATE tasks SET position = ? WHERE id = ?',
      args: [i, taskIds[i]],
    });
  }

  const { rows } = await db.execute('SELECT * FROM tasks ORDER BY position ASC');
  return Response.json(rows);
}

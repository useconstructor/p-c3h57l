import { db } from '@/lib/db';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();

  const updates: string[] = [];
  const args: (string | number)[] = [];

  if (body.title !== undefined) {
    updates.push('title = ?');
    args.push(body.title);
  }
  if (body.completed !== undefined) {
    updates.push('completed = ?');
    args.push(body.completed ? 1 : 0);
  }
  if (body.priority !== undefined) {
    updates.push('priority = ?');
    args.push(body.priority ? 1 : 0);
  }
  if (body.position !== undefined) {
    updates.push('position = ?');
    args.push(body.position);
  }

  if (updates.length > 0) {
    args.push(id);
    await db.execute({
      sql: `UPDATE tasks SET ${updates.join(', ')} WHERE id = ?`,
      args,
    });
  }

  const { rows } = await db.execute({
    sql: 'SELECT * FROM tasks WHERE id = ?',
    args: [id],
  });

  return Response.json(rows[0] ?? null);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await db.execute({
    sql: 'DELETE FROM tasks WHERE id = ?',
    args: [id],
  });
  return Response.json({ ok: true });
}

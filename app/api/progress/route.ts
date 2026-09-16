import { auth, isNeonAuthConfigured } from "@/lib/auth/server";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isNeonAuthConfigured) return Response.json({ error: "Neon is not configured" }, { status: 503 });
  const { data } = await auth.getSession();
  if (!data?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const sql = getDb();
  const rows = await sql`SELECT * FROM workout_progress WHERE user_id = ${data.user.id} ORDER BY completed_at DESC LIMIT 100`;
  return Response.json({ progress: rows });
}

export async function POST(request: Request) {
  if (!isNeonAuthConfigured) return Response.json({ error: "Neon is not configured" }, { status: 503 });
  const { data } = await auth.getSession();
  if (!data?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  const sql = getDb();
  const rows = await sql`
    INSERT INTO workout_progress (user_id, exercise_name, duration_seconds, completed)
    VALUES (${data.user.id}, ${body.exerciseName}, ${Number(body.durationSeconds ?? 0)}, ${Boolean(body.completed)})
    RETURNING *
  `;
  return Response.json({ progress: rows[0] }, { status: 201 });
}


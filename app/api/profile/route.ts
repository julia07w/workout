import { auth, isNeonAuthConfigured } from "@/lib/auth/server";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

async function currentUser() {
  if (!isNeonAuthConfigured) return null;
  const { data } = await auth.getSession();
  return data?.user ?? null;
}

export async function GET() {
  const user = await currentUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const sql = getDb();
  const rows = await sql`
    SELECT user_id, email, name, sex, age, height_cm, weight_kg, level,
           goal, training_place, program_period, days_per_week,
           workout_minutes, equipment, created_at, updated_at
    FROM user_profiles
    WHERE user_id = ${user.id}
    LIMIT 1
  `;

  return Response.json({ profile: rows[0] ?? null });
}

export async function PUT(request: Request) {
  const user = await currentUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const sql = getDb();
  const rows = await sql`
    INSERT INTO user_profiles (
      user_id, email, name, sex, age, height_cm, weight_kg, level,
      goal, training_place, program_period, days_per_week,
      workout_minutes, equipment, updated_at
    ) VALUES (
      ${user.id}, ${user.email}, ${body.name ?? user.name ?? ""},
      ${body.sex ?? null}, ${body.age ? Number(body.age) : null},
      ${body.height ? Number(body.height) : null},
      ${body.weight ? Number(body.weight) : null}, ${body.level ?? null},
      ${body.goal ?? null}, ${body.place ?? null}, ${body.period ?? null},
      ${body.days ? Number(body.days) : null},
      ${body.minutes ? Number(body.minutes) : null},
      ${JSON.stringify(body.equipment ?? [])}::jsonb, NOW()
    )
    ON CONFLICT (user_id) DO UPDATE SET
      email = EXCLUDED.email, name = EXCLUDED.name, sex = EXCLUDED.sex,
      age = EXCLUDED.age, height_cm = EXCLUDED.height_cm,
      weight_kg = EXCLUDED.weight_kg, level = EXCLUDED.level,
      goal = EXCLUDED.goal, training_place = EXCLUDED.training_place,
      program_period = EXCLUDED.program_period,
      days_per_week = EXCLUDED.days_per_week,
      workout_minutes = EXCLUDED.workout_minutes,
      equipment = EXCLUDED.equipment, updated_at = NOW()
    RETURNING *
  `;

  return Response.json({ profile: rows[0] });
}


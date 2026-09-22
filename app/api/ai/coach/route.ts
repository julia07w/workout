import OpenAI from "openai";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "AI-тренер пока недоступен: добавь OPENAI_API_KEY в настройках Vercel." }, { status: 503 });

  const session = await auth.getSession();
  if (!session.data?.user) return NextResponse.json({ error: "Сначала войдите в аккаунт" }, { status: 401 });

  try {
    const client = new OpenAI({ apiKey });
    const body = await request.json();
    const exerciseNames = Array.isArray(body.exerciseNames) ? body.exerciseNames.filter((item: unknown) => typeof item === "string").slice(0, 40) : [];
    const profile = {
      sex: String(body.profile?.sex || "не указан"),
      age: String(body.profile?.age || "не указан"),
      height: String(body.profile?.height || "не указан"),
      weight: String(body.profile?.weight || "не указан"),
      level: String(body.profile?.level || "Новичок"),
      goal: String(body.goal || "Поддержание формы"),
      place: String(body.place || "Дом"),
      focus: String(body.focus || "Всё тело"),
      minutes: Number(body.minutes) || 30,
      cardio: String(body.cardio || "Без кардио"),
      cardioMinutes: Number(body.cardioMinutes) || 0,
    };
    const cardioTime = profile.place === "Зал" && profile.cardio !== "Без кардио" ? profile.cardioMinutes : 0;
    const strengthCount = Math.max(0, Math.round(Math.max(0, profile.minutes - cardioTime) / 15));

    const response = await client.responses.create({
      model: "gpt-5-mini",
      instructions: "Ты осторожный фитнес-помощник. Составляй только общие wellness-рекомендации для здорового взрослого, не ставь диагнозы. Не обещай конкретный результат. При боли, беременности, травмах или заболеваниях рекомендуй обратиться к врачу или квалифицированному тренеру. Отвечай по-русски. Выбирай упражнения только дословно из переданного списка.",
      input: `Составь персональный план по этим данным:\n${JSON.stringify(profile)}\nВыбери ровно ${Math.max(1, strengthCount)} силовых упражнений (примерно 15 минут на одно). Кардио, если выбрано, добавляется отдельно и входит в общее время. Не добавляй кардио в exerciseNames.\nДоступные упражнения:\n${exerciseNames.filter((name: string) => !name.startsWith("Кардио на ")).join("; ")}`,
      text: {
        format: {
          type: "json_schema",
          name: "fitness_plan",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              title: { type: "string" },
              explanation: { type: "string" },
              exerciseNames: { type: "array", items: { type: "string" }, minItems: 1, maxItems: 8 },
              coachTips: { type: "array", items: { type: "string" }, minItems: 3, maxItems: 5 },
              meals: { type: "array", minItems: 3, maxItems: 4, items: { type: "object", additionalProperties: false, properties: { type: { type: "string" }, name: { type: "string" }, note: { type: "string" } }, required: ["type","name","note"] } },
              safetyNote: { type: "string" },
            },
            required: ["title","explanation","exerciseNames","coachTips","meals","safetyNote"],
          },
        },
      },
    });

    return NextResponse.json(JSON.parse(response.output_text));
  } catch (error) {
    console.error("AI coach error", error);
    return NextResponse.json({ error: "Не удалось составить AI-план. Проверьте баланс API и попробуйте ещё раз." }, { status: 500 });
  }
}

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { authClient } from "@/lib/auth/client";

type Screen = "home" | "signup" | "quiz" | "plan" | "exercises" | "stretching" | "progress" | "session" | "nutrition";
type StretchMode = "morning" | "evening" | "all";
type StretchMove = { id: string; name: string; seconds: number; instruction: string; image: string; period: "morning" | "evening" };
type Language = "ru" | "lv" | "en";
type Answers = { name: string; email: string; sex: string; age: string; height: string; weight: string; level: string; goal: string; place: string; period: string; days: string; minutes: string; equipment: string[] };
type Exercise = { name: string; focus: string; reps: string; seconds: number; icon: string; image: string; category: "Всё тело" | "Пресс" | "Руки" | "Спина" | "Ноги" | "Ягодицы" | "Кардио"; place: "Дом" | "Зал" | "Дом и зал" };
type QuizStep = { key: string; title: string; subtitle: string; kind?: "profile" | "schedule"; options?: readonly string[] };
type Meal = { type: string; name: string; calories: number; protein: number; time: string; image: string; allergens: string[]; ingredients: string[]; steps: string[] };
type AiPlan = { title: string; explanation: string; exerciseNames: string[]; coachTips: string[]; meals: { type:string; name:string; note:string }[]; safetyNote:string };
type ProgressEntry = { id?: string | number; exercise_name: string; duration_seconds: number; completed: boolean; completed_at: string };

const initial: Answers = { name: "", email: "", sex: "", age: "", height: "", weight: "", level: "Новичок", goal: "Поддержание формы", place: "Дом", period: "Неделя", days: "3", minutes: "30", equipment: [] };

const exercises: Exercise[] = [
  { name:"Разминка в движении", focus:"Всё тело", reps:"3 минуты", seconds:180, icon:"↗", image:"/exercises/warmup.png", category:"Всё тело", place:"Дом и зал" },
  { name:"Приседания", focus:"Ноги и ягодицы", reps:"3 × 12", seconds:45, icon:"↓", image:"/exercises/squat.png", category:"Ноги", place:"Дом и зал" },
  { name:"Отжимания с колен", focus:"Грудь и руки", reps:"3 × 8", seconds:40, icon:"↔", image:"/exercises/knee-pushup.png", category:"Руки", place:"Дом" },
  { name:"Ягодичный мост", focus:"Ягодицы и корпус", reps:"3 × 15", seconds:45, icon:"⌁", image:"/exercises/glute-bridge.png", category:"Ягодицы", place:"Дом" },
  { name:"Планка", focus:"Пресс и корпус", reps:"3 × 30 сек", seconds:30, icon:"—", image:"/exercises/plank-v2.png", category:"Пресс", place:"Дом" },
  { name:"Мёртвый жук", focus:"Глубокие мышцы пресса", reps:"3 × 10", seconds:40, icon:"✣", image:"/exercises/dead-bug.png", category:"Пресс", place:"Дом" },
  { name:"Велосипед", focus:"Пресс и косые мышцы", reps:"3 × 16", seconds:45, icon:"∞", image:"/exercises/bicycle-crunch.png", category:"Пресс", place:"Дом" },
  { name:"Боковая планка", focus:"Косые мышцы живота", reps:"3 × 25 сек", seconds:25, icon:"◢", image:"/exercises/side-plank.png", category:"Пресс", place:"Дом" },
  { name:"Алмазные отжимания", focus:"Трицепс и грудь", reps:"3 × 8", seconds:40, icon:"◇", image:"/exercises/diamond-pushup.png", category:"Руки", place:"Дом" },
  { name:"Обратные отжимания", focus:"Трицепс", reps:"3 × 10", seconds:40, icon:"⇣", image:"/exercises/bench-dips.png", category:"Руки", place:"Дом" },
  { name:"Супермен", focus:"Поясница и спина", reps:"3 × 12", seconds:40, icon:"↑", image:"/exercises/superman.png", category:"Спина", place:"Дом" },
  { name:"Обратные снежные ангелы", focus:"Верх спины и плечи", reps:"3 × 12", seconds:45, icon:"⌁", image:"/exercises/reverse-snow-angels.png", category:"Спина", place:"Дом" },
  { name:"Выпады назад", focus:"Ноги и баланс", reps:"3 × 10", seconds:45, icon:"↙", image:"/exercises/reverse-lunge.png", category:"Ноги", place:"Дом" },
  { name:"Махи ногой назад", focus:"Ягодицы", reps:"3 × 15", seconds:40, icon:"↗", image:"/exercises/glute-kickback-home.png", category:"Ягодицы", place:"Дом" },
  { name:"Сгибание рук с гантелями", focus:"Бицепс", reps:"3 × 12", seconds:45, icon:"∪", image:"/exercises/dumbbell-curl.png", category:"Руки", place:"Зал" },
  { name:"Разгибание рук на блоке", focus:"Трицепс", reps:"3 × 12", seconds:45, icon:"↓", image:"/exercises/cable-triceps-pushdown.png", category:"Руки", place:"Зал" },
  { name:"Тяга верхнего блока", focus:"Широчайшие мышцы", reps:"3 × 12", seconds:50, icon:"⇓", image:"/exercises/lat-pulldown.png", category:"Спина", place:"Зал" },
  { name:"Тяга горизонтального блока", focus:"Середина спины", reps:"3 × 12", seconds:50, icon:"←", image:"/exercises/seated-cable-row.png", category:"Спина", place:"Зал" },
  { name:"Жим ногами", focus:"Квадрицепс и ягодицы", reps:"4 × 10", seconds:55, icon:"↗", image:"/exercises/leg-press.png", category:"Ноги", place:"Зал" },
  { name:"Разгибание ног", focus:"Квадрицепс", reps:"3 × 12", seconds:45, icon:"⌝", image:"/exercises/leg-extension.png", category:"Ноги", place:"Зал" },
  { name:"Сгибание ног лёжа в тренажёре", focus:"Задняя поверхность бедра", reps:"3 × 12", seconds:45, icon:"⌞", image:"/exercises/lying-leg-curl.png", category:"Ноги", place:"Зал" },
  { name:"Хип-траст со штангой", focus:"Ягодицы", reps:"4 × 10", seconds:55, icon:"⌃", image:"/exercises/barbell-hip-thrust.png", category:"Ягодицы", place:"Зал" },
  { name:"Разведение ног в тренажёре", focus:"Ягодицы · ноги в стороны", reps:"3 × 15", seconds:45, icon:"↔", image:"/exercises/hip-abduction-machine-v2.png", category:"Ягодицы", place:"Зал" },
  { name:"Сведение ног в тренажёре", focus:"Внутренняя поверхность бедра · ноги вместе", reps:"3 × 15", seconds:45, icon:"→←", image:"/exercises/hip-adduction-machine.png", category:"Ноги", place:"Зал" },
  { name:"Гиперэкстензия", focus:"Спина, ягодицы и задняя поверхность бедра", reps:"3 × 12", seconds:45, icon:"↗", image:"/exercises/hyperextension.png", category:"Спина", place:"Зал" },
  { name:"Отведение ноги назад в кроссовере", focus:"Ягодицы", reps:"3 × 12 на каждую ногу", seconds:45, icon:"↗", image:"/exercises/cable-kickback-standing.png", category:"Ягодицы", place:"Зал" },
  { name:"Отведение ноги на блоке с опорой на скамью", focus:"Ягодицы", reps:"3 × 12 на каждую ногу", seconds:45, icon:"↗", image:"/exercises/cable-kickback-bench.png", category:"Ягодицы", place:"Зал" },
  { name:"Тяга гантели одной рукой в наклоне", focus:"Широчайшие мышцы спины", reps:"3 × 12 на каждую руку", seconds:45, icon:"↖", image:"/exercises/dumbbell-row.png", category:"Спина", place:"Зал" },
  { name:"Скручивания на блоке", focus:"Пресс", reps:"3 × 15", seconds:45, icon:"⌒", image:"/exercises/cable-crunch.png", category:"Пресс", place:"Зал" },
  { name:"Зашагивания на платформу", focus:"Ягодицы и ноги", reps:"3 × 12 на каждую ногу", seconds:50, icon:"↥", image:"/exercises/step-up.png", category:"Ягодицы", place:"Дом и зал" },
  { name:"Русские скручивания с мячом", focus:"Пресс и косые мышцы живота", reps:"3 × 16 поворотов", seconds:45, icon:"↔", image:"/exercises/russian-twist.png", category:"Пресс", place:"Дом и зал" },
  { name:"Болгарские выпады с гантелями", focus:"Ягодицы и ноги", reps:"3 × 10 на каждую ногу", seconds:50, icon:"↘", image:"/exercises/bulgarian-split-squat.png", category:"Ягодицы", place:"Зал" },
  { name:"Румынская тяга со штангой", focus:"Ягодицы и задняя поверхность бедра", reps:"3 × 10", seconds:50, icon:"↓", image:"/exercises/romanian-deadlift.png", category:"Ноги", place:"Зал" },
  { name:"Приседания в тренажёре Смита", focus:"Ноги и ягодицы", reps:"3 × 10", seconds:50, icon:"↕", image:"/exercises/smith-squat.png", category:"Ноги", place:"Зал" },
  { name:"Кардио на беговой дорожке", focus:"Выносливость и жиросжигание", reps:"20 минут", seconds:1200, icon:"↗", image:"/exercises/treadmill.png", category:"Кардио", place:"Зал" },
  { name:"Кардио на велотренажёре", focus:"Выносливость и ноги", reps:"20 минут", seconds:1200, icon:"◉", image:"/exercises/stationary-bike.png", category:"Кардио", place:"Зал" },
  { name:"Кардио на лестнице", focus:"Ягодицы, ноги и выносливость", reps:"20 минут", seconds:1200, icon:"⇈", image:"/exercises/stair-climber.png", category:"Кардио", place:"Зал" },
];

const stretchMoves: StretchMove[] = [
  { id:"neck-release", name:"Мягкие наклоны шеи", seconds:60, instruction:"Медленно наклони голову к плечу. Не дави рукой; через 30 секунд поменяй сторону.", image:"/stretching/neck-release.png", period:"morning" },
  { id:"cat-cow", name:"Кошка — корова", seconds:60, instruction:"Встань на четвереньки. На вдохе раскрой грудь, на выдохе округли спину. Двигайся плавно.", image:"/stretching/cat-cow.png", period:"morning" },
  { id:"side-reach", name:"Боковое вытяжение", seconds:60, instruction:"Сядь удобно и потянись рукой над головой в сторону. По 30 секунд на каждую сторону.", image:"/stretching/side-reach.png", period:"morning" },
  { id:"hip-flexor-lunge", name:"Выпад с раскрытием таза", seconds:60, instruction:"Опусти одно колено на пол и мягко подай таз вперёд. По 30 секунд на каждую ногу.", image:"/stretching/hip-flexor-lunge.png", period:"morning" },
  { id:"child-pose", name:"Поза ребёнка", seconds:60, instruction:"Опусти таз к пяткам и вытяни руки вперёд. Дыши спокойно, не тянись через боль.", image:"/stretching/child-pose.png", period:"evening" },
  { id:"figure-four", name:"Растяжка ягодиц лёжа", seconds:60, instruction:"Лёжа на спине, положи лодыжку на противоположное колено. По 30 секунд на сторону.", image:"/stretching/figure-four.png", period:"evening" },
  { id:"seated-forward-fold", name:"Наклон к прямым ногам", seconds:60, instruction:"Сядь с вытянутыми ногами и наклоняйся от таза с ровной спиной. Без рывков.", image:"/stretching/seated-forward-fold.png", period:"evening" },
  { id:"supine-twist", name:"Скручивание лёжа", seconds:60, instruction:"Лёжа на спине, мягко опусти согнутое колено в сторону. По 30 секунд на сторону.", image:"/stretching/supine-twist.png", period:"evening" },
];

function exercisePoster(exercise: Exercise) {
  return exercise.image;
}

const meals: Meal[] = [
  { type:"Завтрак", name:"Овсяная каша с ягодами", calories:460, protein:19, time:"10 мин", image:"/meals/breakfast-oats.png", allergens:["Молоко","Орехи"], ingredients:["60 г овсяных хлопьев","150 г греческого йогурта","1/2 банана","80 г голубики","10 г миндаля","1 ч. л. семян чиа"], steps:["Свари овсяные хлопья в воде или молоке 5–7 минут.","Переложи кашу в миску и добавь йогурт.","Выложи банан, ягоды, миндаль и семена чиа."] },
  { type:"Обед", name:"Боул с курицей и киноа", calories:620, protein:48, time:"25 мин", image:"/meals/lunch-chicken-bowl.png", allergens:[], ingredients:["160 г куриной грудки","70 г сухой киноа","200 г овощей","Горсть шпината","1 ч. л. оливкового масла","Лимон и травы"], steps:["Отвари киноа по инструкции на упаковке.","Приправь курицу и обжарь по 5–6 минут с каждой стороны.","Запеки или обжарь овощи, затем собери всё в миске.","Добавь шпинат и заправь лимоном с оливковым маслом."] },
  { type:"Ужин", name:"Лосось с картофелем и спаржей", calories:590, protein:42, time:"30 мин", image:"/meals/dinner-salmon.png", allergens:["Рыба"], ingredients:["170 г филе лосося","220 г молодого картофеля","150 г спаржи","1 ч. л. оливкового масла","Лимон, укроп, перец"], steps:["Разогрей духовку до 200 °C.","Картофель смешай с половиной масла и запекай 15 минут.","Добавь лосось и спаржу, сбрызни оставшимся маслом.","Запекай ещё 12–15 минут и подавай с лимоном."] },
  { type:"Завтрак", name:"Тост с авокадо и яйцом", calories:430, protein:22, time:"15 мин", image:"/meals/avocado-eggs.png", allergens:["Яйца","Глютен"], ingredients:["2 яйца","2 ломтика цельнозернового хлеба","1/2 авокадо","Помидоры черри","Руккола","Лимон, соль и перец"], steps:["Подсуши хлеб на сухой сковороде.","Разомни авокадо с лимоном и специями.","Приготовь яйца пашот или всмятку.","Собери тосты и подай с томатами и зеленью."] },
  { type:"Обед", name:"Тефтели из индейки с гречкой", calories:560, protein:46, time:"35 мин", image:"/meals/turkey-buckwheat.png", allergens:["Молоко"], ingredients:["170 г фарша индейки","70 г сухой гречки","Кабачок и сладкий перец","100 г натурального йогурта","Зелень и чеснок"], steps:["Свари гречку до готовности.","Сформируй тефтели и обжарь или запеки 20 минут.","Запеки овощи до мягкости.","Смешай йогурт с зеленью и подай как соус."] },
  { type:"Перекус", name:"Творожная миска с ягодами", calories:340, protein:30, time:"5 мин", image:"/meals/cottage-berries.png", allergens:["Молоко"], ingredients:["200 г творога 5%","80 г клубники","60 г голубики","1/2 банана","1 ч. л. семян чиа","1 ч. л. мёда"], steps:["Переложи творог в глубокую миску.","Нарежь клубнику и банан.","Добавь все ягоды, семена чиа и немного мёда."] },
];

const quizSteps: readonly QuizStep[] = [
  { key: "sex", title: "Расскажи немного о себе", subtitle: "Это поможет точнее рассчитать нагрузку", kind: "profile" },
  { key: "level", title: "Какой у тебя уровень?", subtitle: "Начнём с комфортной нагрузки", options: ["Новичок", "Средний", "Продвинутый"] },
  { key: "goal", title: "Какая твоя главная цель?", subtitle: "Ты сможешь изменить её позже", options: ["Похудение", "Набор мышц", "Поддержание формы", "Сила и выносливость"] },
  { key: "place", title: "Где будем тренироваться?", subtitle: "Мы подберём упражнения под твоё пространство", options: ["Дом", "Тренажёрный зал", "Дом и зал"] },
  { key: "schedule", title: "Настроим расписание", subtitle: "Выбери комфортный ритм", kind: "schedule" },
  { key: "equipment", title: "Какой инвентарь есть дома?", subtitle: "Можно выбрать несколько вариантов", options: ["Без инвентаря", "Коврик", "Гантели", "Резинки", "Турник"] },
];

function Logo() { return <button className="logo" onClick={() => location.reload()}><span>W</span> WORK OUT</button>; }

const copy = {
  ru: { programs:"Программы", exercises:"Упражнения", progress:"Прогресс", eyebrow:"ТВОЙ РИТМ · ТВОЁ ТЕЛО · ТВОЙ ПРОГРЕСС", hero:"Персональные тренировки для дома и зала.", tempo:"Без давления. В твоём темпе.", start:"Начать тренировку", today:"СЕГОДНЯ", fullBody:"Сила всего тела", min:"мин", items:"упражнений", finish:"Завершить", previous:"Предыдущее", next:"Следующее", done:"Готово", startTimer:"Запустить таймер", pause:"Пауза", sound:"Звук", rest:"Отдых" },
  lv: { programs:"Programmas", exercises:"Vingrinājumi", progress:"Progress", eyebrow:"TAVS RITMS · TAVS ĶERMENIS · TAVS PROGRESS", hero:"Personalizēti treniņi mājām un sporta zālei.", tempo:"Bez spiediena. Tavā tempā.", start:"Sākt treniņu", today:"ŠODIEN", fullBody:"Visa ķermeņa spēks", min:"min", items:"vingrinājumi", finish:"Pabeigt", previous:"Iepriekšējais", next:"Nākamais", done:"Gatavs", startTimer:"Sākt taimeri", pause:"Pauze", sound:"Skaņa", rest:"Atpūta" },
  en: { programs:"Programs", exercises:"Exercises", progress:"Progress", eyebrow:"YOUR RHYTHM · YOUR BODY · YOUR PROGRESS", hero:"Personal workouts for home and gym.", tempo:"No pressure. At your pace.", start:"Start workout", today:"TODAY", fullBody:"Full body strength", min:"min", items:"exercises", finish:"Finish", previous:"Previous", next:"Next", done:"Done", startTimer:"Start timer", pause:"Pause", sound:"Sound", rest:"Rest" },
} as const;

export default function Home() {
  const [screen, setScreen] = useState<Screen>("home");
  const [stretchMode, setStretchMode] = useState<StretchMode>("morning");
  const [completedStretches, setCompletedStretches] = useState<string[]>([]);
  const visibleStretches = stretchMoves.filter((move) => stretchMode === "all" || move.period === stretchMode);
  const stretchMinutes = visibleStretches.reduce((total, move) => total + move.seconds, 0) / 60;
  const stretchCompleted = visibleStretches.filter((move) => completedStretches.includes(move.id)).length;
  const [answers, setAnswers] = useState<Answers>(initial);
  const [step, setStep] = useState(0);
  const [current, setCurrent] = useState(0);
  const [remaining, setRemaining] = useState(exercises[0].seconds);
  const [running, setRunning] = useState(false);
  const [language, setLanguage] = useState<Language>("ru");
  const [languageOpen, setLanguageOpen] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [muscleFilter, setMuscleFilter] = useState("Все");
  const [placeFilter, setPlaceFilter] = useState("Все места");
  const [openMeal, setOpenMeal] = useState<number | null>(null);
  const [builderGoal, setBuilderGoal] = useState(initial.goal);
  const [builderPlace, setBuilderPlace] = useState<"Дом" | "Зал">("Дом");
  const [builderFocus, setBuilderFocus] = useState("Всё тело");
  const [builderMinutes, setBuilderMinutes] = useState(30);
  const [builderCardio, setBuilderCardio] = useState("Без кардио");
  const [cardioMinutes, setCardioMinutes] = useState(20);
  const [workoutQueue, setWorkoutQueue] = useState<number[]>(exercises.map((_, index) => index));
  const [editableWorkout, setEditableWorkout] = useState<number[]>([]);
  const [aiPlan, setAiPlan] = useState<AiPlan | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [password, setPassword] = useState("");
  const [authMode, setAuthMode] = useState<"sign-up" | "sign-in">("sign-up");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [progressEntries, setProgressEntries] = useState<ProgressEntry[]>([]);
  const [progressLoading, setProgressLoading] = useState(false);
  const [progressError, setProgressError] = useState("");
  const audioContext = useRef<AudioContext | null>(null);
  const t = copy[language];

  useEffect(() => {
    if (!running || remaining <= 0) return;
    const id = setInterval(() => setRemaining((v) => v - 1), 1000);
    return () => clearInterval(id);
  }, [running, remaining]);

  useEffect(() => {
    if (remaining === 0 && running) {
      setRunning(false);
      playSignal("finish");
    }
  }, [remaining, running]);

  useEffect(() => {
    if (builderPlace === "Дом") setBuilderCardio("Без кардио");
  }, [builderPlace]);

  useEffect(() => {
    void (async () => {
      try {
        const session = await authClient.getSession();
        if (!session.data?.user) return;
        setIsAuthenticated(true);
        const response = await fetch("/api/profile");
        if (!response.ok) return;
        const { profile } = await response.json();
        if (!profile) return;
        setAnswers((value) => ({ ...value, name:profile.name ?? value.name, email:profile.email ?? value.email, sex:profile.sex ?? value.sex, age:String(profile.age ?? value.age), height:String(profile.height_cm ?? value.height), weight:String(profile.weight_kg ?? value.weight), level:profile.level ?? value.level, goal:profile.goal ?? value.goal, place:profile.training_place ?? value.place, period:profile.program_period ?? value.period, days:String(profile.days_per_week ?? value.days), minutes:String(profile.workout_minutes ?? value.minutes), equipment:profile.equipment ?? value.equipment }));
      } catch {
        // Public pages remain available before Neon credentials are configured.
      }
    })();
  }, []);

  const playSignal = (kind: "start" | "rest" | "finish") => {
    if (!soundOn || typeof window === "undefined") return;
    const AudioCtx = window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const context = audioContext.current ?? new AudioCtx();
    audioContext.current = context;
    if (context.state === "suspended") void context.resume();
    const patterns = kind === "start" ? [523.25,659.25,783.99] : kind === "rest" ? [392,493.88] : [783.99,659.25,523.25];
    const spacing = kind === "rest" ? .24 : .15;
    patterns.forEach((frequency,index) => {
      const start = context.currentTime + .02 + index * spacing;
      [1,2].forEach((layer) => {
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        oscillator.type = layer === 1 ? "sine" : "triangle";
        oscillator.frequency.setValueAtTime(frequency * (layer === 1 ? 1 : 2),start);
        oscillator.frequency.exponentialRampToValueAtTime(frequency * (layer === 1 ? .997 : 1.995),start + .42);
        const volume = layer === 1 ? .09 : .018;
        gain.gain.setValueAtTime(.0001,start);
        gain.gain.exponentialRampToValueAtTime(volume,start + .025);
        gain.gain.exponentialRampToValueAtTime(.0001,start + (kind === "finish" ? .65 : .46));
        oscillator.connect(gain).connect(context.destination);
        oscillator.start(start);
        oscillator.stop(start + .7);
      });
    });
  };

  const toggleTimer = () => {
    if (!running) playSignal("start");
    if (!running && remaining === 0) setRemaining(exercises[current].category === "Кардио" ? cardioMinutes * 60 : exercises[current].seconds);
    setRunning(!running);
  };

  const handleAuth = async () => {
    setAuthError("");
    if (!answers.email || !password || (authMode === "sign-up" && !answers.name)) {
      setAuthError("Заполни имя, почту и пароль.");
      return;
    }
    setAuthLoading(true);
    try {
      const result = authMode === "sign-up"
        ? await authClient.signUp.email({ name:answers.name, email:answers.email, password })
        : await authClient.signIn.email({ email:answers.email, password });
      if (result.error) throw new Error(result.error.message || "Не удалось войти");
      setIsAuthenticated(true);
      setScreen(authMode === "sign-up" ? "quiz" : "plan");
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Не удалось подключиться к Neon Auth");
    } finally {
      setAuthLoading(false);
    }
  };

  const signOut = async () => {
    await authClient.signOut();
    setIsAuthenticated(false);
    setScreen("home");
  };

  const openProgress = async () => {
    setScreen("progress");
    setProgressError("");
    if (!isAuthenticated) return;
    setProgressLoading(true);
    try {
      const response = await fetch("/api/progress", { cache:"no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Не удалось загрузить прогресс");
      setProgressEntries(data.progress ?? []);
    } catch (error) {
      setProgressError(error instanceof Error ? error.message : "Не удалось загрузить прогресс");
    } finally {
      setProgressLoading(false);
    }
  };

  const completeWorkout = () => {
    void fetch("/api/progress", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ exerciseName:exercises[current].name, durationSeconds:exercises[current].category === "Кардио" ? cardioMinutes * 60 : exercises[current].seconds, completed:true }) });
    setScreen("plan");
  };

  const update = (key: keyof Answers, value: string | string[]) => setAnswers((a) => ({ ...a, [key]: value }));
  const chooseEquipment = (value: string) => update("equipment", answers.equipment.includes(value) ? answers.equipment.filter((x) => x !== value) : [...answers.equipment, value]);
  const nextStep = () => {
    if (step < quizSteps.length - 1) return setStep(step + 1);
    void fetch("/api/profile", { method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify(answers) });
    setScreen("plan");
  };
  const selectExercise = (i: number, queue = exercises.map((_, index) => index)) => { setWorkoutQueue(queue); setCurrent(i); setRemaining(exercises[i].category === "Кардио" ? cardioMinutes * 60 : exercises[i].seconds); setRunning(false); setScreen("session"); };
  const time = useMemo(() => `${String(Math.floor(remaining / 60)).padStart(2, "0")}:${String(remaining % 60).padStart(2, "0")}`, [remaining]);
  const nutrition = useMemo(() => {
    const weight = Number(answers.weight) || 65;
    const height = Number(answers.height) || 170;
    const age = Number(answers.age) || 25;
    const base = 10 * weight + 6.25 * height - 5 * age + (answers.sex === "Мужской" ? 5 : -161);
    const goalOffset = answers.goal === "Похудение" ? -350 : answers.goal === "Набор мышц" ? 250 : 0;
    const calories = Math.max(1200, Math.round((base * 1.375 + goalOffset) / 10) * 10);
    return { calories, water: Math.round(weight * 35 / 100) / 10, protein: Math.round(weight * 1.6), carbs: Math.round(calories * .45 / 4), fats: Math.round(calories * .27 / 9) };
  }, [answers]);
  const filteredExercises = useMemo(() => exercises.map((exercise,index)=>({exercise,index})).filter(({exercise}) => (muscleFilter === "Все" || exercise.category === muscleFilter) && (placeFilter === "Все места" || exercise.place === placeFilter || exercise.place === "Дом и зал")), [muscleFilter,placeFilter]);
  const personalWorkout = useMemo(() => {
    const wantedCategories = builderFocus === "Всё тело" ? ["Всё тело","Ноги","Ягодицы","Спина","Руки","Пресс"] : builderFocus.split(" + ");
    const candidates = exercises.map((exercise,index)=>({exercise,index})).filter(({exercise}) => exercise.category !== "Кардио" && (exercise.place === builderPlace || exercise.place === "Дом и зал") && wantedCategories.includes(exercise.category));
    const goalScore = ({exercise}: {exercise:Exercise}) => builderGoal === "Похудение"
      ? (["Всё тело","Ноги","Пресс"].includes(exercise.category) ? 2 : 0)
      : builderGoal === "Набор мышц"
        ? (exercise.place === "Зал" || ["Спина","Ноги","Ягодицы","Руки"].includes(exercise.category) ? 2 : 0)
        : builderGoal === "Сила и выносливость"
          ? (["Всё тело","Спина","Ноги"].includes(exercise.category) ? 2 : 0)
          : 1;
    const cardioTime = builderPlace === "Зал" && builderCardio !== "Без кардио" ? cardioMinutes : 0;
    const count = Math.max(0, Math.round(Math.max(0, builderMinutes - cardioTime) / 15));
    return [...candidates].sort((a,b)=>goalScore(b)-goalScore(a)).slice(0,count);
  }, [builderFocus,builderGoal,builderMinutes,builderPlace,builderCardio,cardioMinutes]);
  const replacementExercises = useMemo(() => exercises.map((exercise,index)=>({exercise,index})).filter(({exercise}) => exercise.place === builderPlace || exercise.place === "Дом и зал"), [builderPlace]);
  useEffect(() => {
    const strength = personalWorkout.map(({index})=>index);
    const cardioIndex = exercises.findIndex((exercise)=>exercise.name === builderCardio);
    setEditableWorkout(cardioIndex >= 0 ? [...strength,cardioIndex] : strength);
  }, [personalWorkout,builderCardio]);
  const replaceWorkoutExercise = (position: number, exerciseIndex: number) => setEditableWorkout((items)=>items.map((item,index)=>index===position?exerciseIndex:item));
  const removeWorkoutExercise = (position: number) => setEditableWorkout((items)=>items.filter((_,index)=>index!==position));
  const addWorkoutExercise = () => {
    const wantedCategories = builderFocus === "Всё тело" ? ["Всё тело","Ноги","Ягодицы","Спина","Руки","Пресс"] : builderFocus.split(" + ");
    const available = replacementExercises.filter(({exercise,index})=>exercise.category !== "Кардио" && !editableWorkout.includes(index));
    const next = available.find(({exercise})=>wantedCategories.includes(exercise.category)) ?? available[0];
    if (next) setEditableWorkout((items)=>[...items,next.index]);
  };
  const generateAiPlan = async () => {
    setAiLoading(true);
    setAiError("");
    try {
      const available = replacementExercises.map(({exercise})=>exercise.name);
      const response = await fetch("/api/ai/coach", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ profile:answers, goal:builderGoal, place:builderPlace, focus:builderFocus, minutes:builderMinutes, cardio:builderCardio, cardioMinutes, exerciseNames:available }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Не удалось получить ответ AI");
      const plan = data as AiPlan;
      const indices = plan.exerciseNames.map((name)=>exercises.findIndex((exercise)=>exercise.name===name)).filter((index)=>index>=0);
      if (indices.length) {
        const cardioTime = builderPlace === "Зал" && builderCardio !== "Без кардио" ? cardioMinutes : 0;
        const strengthLimit = Math.max(0, Math.round(Math.max(0, builderMinutes - cardioTime) / 15));
        const strength = Array.from(new Set(indices)).filter((index)=>exercises[index].category !== "Кардио").slice(0,strengthLimit);
        const cardioIndex = exercises.findIndex((exercise)=>exercise.name === builderCardio);
        setEditableWorkout(cardioIndex >= 0 ? [...strength,cardioIndex] : strength);
      }
      setAiPlan(plan);
    } catch (error) {
      setAiError(error instanceof Error ? error.message : "Не удалось составить AI-план");
    } finally {
      setAiLoading(false);
    }
  };
  const currentQueuePosition = Math.max(0, workoutQueue.indexOf(current));
  const isTimedExercise = exercises[current].category === "Кардио" || ["Планка", "Боковая планка", "Разминка в движении"].includes(exercises[current].name);
  const completedMinutes = Math.round(progressEntries.reduce((sum,item)=>sum + Number(item.duration_seconds || 0),0) / 60);
  const completedDays = new Set(progressEntries.map((item)=>new Date(item.completed_at).toLocaleDateString("ru-RU"))).size;

  return (
    <main>
      <header><Logo /><nav><button className={screen==="plan"?"active":""} onClick={() => setScreen("plan")}>{t.programs}</button><button className={screen==="exercises"?"active":""} onClick={()=>setScreen("exercises")}>{t.exercises}</button><button className={screen==="stretching"?"active":""} onClick={()=>setScreen("stretching")}>Растяжка</button><button className={screen==="nutrition"?"active":""} onClick={() => setScreen("nutrition")}>Питание</button><button className={screen==="progress"?"active":""} onClick={()=>void openProgress()}>{t.progress}</button></nav><div className="header-tools"><div className={`language-menu ${languageOpen ? "open" : ""}`}><button className="language-trigger" onClick={()=>setLanguageOpen(!languageOpen)} aria-expanded={languageOpen} aria-label="Choose language"><span className="globe">◎</span><b>{language.toUpperCase()}</b><i>⌄</i></button>{languageOpen && <div className="language-popover">{(["ru","lv","en"] as Language[]).map((code)=><button key={code} className={language===code?"active":""} onClick={()=>{setLanguage(code);setLanguageOpen(false)}}><span>{code === "ru" ? "Русский" : code === "lv" ? "Latviešu" : "English"}</span><b>{code.toUpperCase()}</b>{language===code&&<i>✓</i>}</button>)}</div>}</div><button className="profile" title={isAuthenticated ? "Выйти из аккаунта" : "Войти"} onClick={()=>isAuthenticated ? void signOut() : setScreen("signup")}>{isAuthenticated ? "✓" : "Ю"}</button></div></header>

      {screen === "home" && <><section className="hero">
        <div className="eyebrow">{t.eyebrow}</div>
        <h1>WORK<br/><em>OUT</em></h1>
        <p>{t.hero}<br/>{t.tempo}</p>
        <button className="primary hero-button" onClick={() => setScreen("signup")}><span>{t.start}</span><b>→</b></button>
        <div className="hero-art"><div className="orb one"/><div className="orb two"/><div className="figure"><i/><strong>●</strong></div></div>
        <button className="scroll" onClick={()=>document.getElementById("about")?.scrollIntoView({behavior:"smooth"})}>УЗНАТЬ, ЧТО ВНУТРИ <span>↓</span></button>
      </section>
      <section className="about-platform" id="about">
        <div className="about-heading"><span>ВСЁ В ОДНОМ МЕСТЕ</span><h2>План, который заботится<br/>не только о тренировках</h2><p>WORK OUT объединяет движение, питание и понятный прогресс — с рекомендациями именно под твои параметры и цель.</p></div>
        <div className="feature-cards">
          <article><i>01</i><div className="feature-icon">✦</div><h3>Персональные тренировки</h3><p>Дом или зал, фотографии упражнений, подходы и нагрузка на неделю или месяц.</p></article>
          <article><i>02</i><div className="feature-icon">◌</div><h3>Умное питание</h3><p>Расчёт калорий, воды и макронутриентов по росту, весу, полу, возрасту и цели.</p></article>
          <article><i>03</i><div className="feature-icon">⌁</div><h3>Готовое меню</h3><p>Завтрак, обед и ужин с фотографиями, рецептом, калорийностью и аллергенами.</p></article>
        </div>
        <div className="about-cta"><p>Начни с короткой анкеты — остальное мы посчитаем сами.</p><button className="primary hero-button" onClick={()=>setScreen("signup")}>Создать мой план <b>→</b></button></div>
      </section></>}

      {screen === "signup" && <section className="center-card auth">
        <button className="back" onClick={() => setScreen("home")}>← На главную</button>
        <span className="mini-icon">W</span><h2>{authMode === "sign-up" ? "Начнём знакомство" : "С возвращением"}</h2><p>{authMode === "sign-up" ? "Создай защищённый аккаунт Neon, чтобы сохранить программу и прогресс." : "Войди, чтобы продолжить свою программу."}</p>
        {authMode === "sign-up" && <label>Как тебя зовут?<input placeholder="Твоё имя" value={answers.name} onChange={(e) => update("name", e.target.value)}/></label>}
        <label>Электронная почта<input type="email" placeholder="name@example.com" value={answers.email} onChange={(e) => update("email", e.target.value)}/></label>
        <label>Пароль<input type="password" placeholder="Не менее 8 символов" value={password} onChange={(e)=>setPassword(e.target.value)} onKeyDown={(e)=>{if(e.key==="Enter") void handleAuth()}}/></label>
        {authError && <div className="auth-error">{authError}</div>}
        <button className="primary wide" disabled={authLoading} onClick={()=>void handleAuth()}>{authLoading ? "Подключаемся…" : authMode === "sign-up" ? "Создать аккаунт" : "Войти"} <b>→</b></button>
        <button className="auth-switch" onClick={()=>{setAuthMode(authMode === "sign-up" ? "sign-in" : "sign-up");setAuthError("")}}>{authMode === "sign-up" ? "Уже есть аккаунт? Войти" : "Нет аккаунта? Зарегистрироваться"}</button>
        <small>Данные авторизации защищённо хранятся в Neon Auth.</small>
      </section>}

      {screen === "quiz" && <section className="quiz-wrap">
        <div className="progress"><span style={{width: `${((step + 1) / quizSteps.length) * 100}%`}}/></div>
        <div className="step-label">ШАГ {step + 1} ИЗ {quizSteps.length}</div><h2>{quizSteps[step].title}</h2><p>{quizSteps[step].subtitle}</p>
        {quizSteps[step].kind === "profile" && <div className="form-grid">
          <label>Пол<select value={answers.sex} onChange={(e) => update("sex", e.target.value)}><option value="">Выбери</option><option>Женский</option><option>Мужской</option><option>Не указывать</option></select></label>
          <label>Возраст<input type="number" placeholder="25" value={answers.age} onChange={(e) => update("age", e.target.value)}/></label>
          <label>Рост, см<input type="number" placeholder="170" value={answers.height} onChange={(e) => update("height", e.target.value)}/></label>
          <label>Вес, кг<input type="number" placeholder="65" value={answers.weight} onChange={(e) => update("weight", e.target.value)}/></label>
        </div>}
        {quizSteps[step].kind === "schedule" && <div className="form-grid">
          <label>Программа<select value={answers.period} onChange={(e) => update("period", e.target.value)}><option>Неделя</option><option>Месяц</option></select></label>
          <label>Тренировок в неделю<select value={answers.days} onChange={(e) => update("days", e.target.value)}>{[2,3,4,5,6].map(x=><option key={x}>{x}</option>)}</select></label>
          <label className="full">Длительность, минут<input type="number" value={answers.minutes} onChange={(e) => update("minutes", e.target.value)}/></label>
        </div>}
        {quizSteps[step].options && <div className="options">{quizSteps[step].options.map((o) => { const multi = quizSteps[step].key === "equipment"; const active = multi ? answers.equipment.includes(o) : answers[quizSteps[step].key as keyof Answers] === o; return <button className={active ? "selected" : ""} key={o} onClick={() => multi ? chooseEquipment(o) : update(quizSteps[step].key as keyof Answers, o)}><span>{active ? "✓" : "○"}</span>{o}</button>})}</div>}
        <div className="quiz-actions"><button className="secondary" onClick={() => step ? setStep(step - 1) : setScreen("signup")}>← Назад</button><button className="primary" onClick={nextStep}>{step === quizSteps.length - 1 ? "Создать программу" : "Продолжить"} →</button></div>
      </section>}

      {screen === "plan" && <section className="dashboard">
        <div className="welcome"><div><span>ДОБРО ПОЖАЛОВАТЬ{answers.name ? `, ${answers.name.toUpperCase()}` : ""}</span><h2>Твой план на {answers.period === "Месяц" ? "месяц" : "неделю"}</h2><p>{answers.goal} · {answers.place} · {answers.days} раза в неделю</p></div><div className="streak"><b>3</b><small>дня подряд</small></div></div>
        <div className="week">{["ПН","ВТ","СР","ЧТ","ПТ","СБ","ВС"].map((d,i)=><div className={i===1?"today":i<1?"done":""} key={d}><span>{d}</span><b>{14+i}</b><i>{i<1?"✓":i===1?"•":""}</i></div>)}</div>
        <div className="workout-builder">
          <div className="builder-heading"><div><span>ПЕРСОНАЛЬНЫЙ КОНСТРУКТОР</span><h3>Собери тренировку под себя</h3><p>Мы автоматически подберём упражнения под твою цель, место, зоны тела и доступное время.</p></div><div className="builder-time"><strong>{builderMinutes}</strong><small>минут</small></div></div>
          <div className="builder-controls">
            <label>Цель<select value={builderGoal} onChange={(e)=>setBuilderGoal(e.target.value)}><option>Похудение</option><option>Набор мышц</option><option>Поддержание формы</option><option>Сила и выносливость</option></select></label>
            <label>Место<select value={builderPlace} onChange={(e)=>setBuilderPlace(e.target.value as "Дом"|"Зал")}><option>Дом</option><option>Зал</option></select></label>
            <label>Зоны тела<select value={builderFocus} onChange={(e)=>setBuilderFocus(e.target.value)}><option>Всё тело</option><option>Пресс + Ноги</option><option>Руки</option><option>Спина</option><option>Ноги + Ягодицы</option></select></label>
            <label>Время<select value={builderMinutes} onChange={(e)=>setBuilderMinutes(Number(e.target.value))}>{[15,20,30,45,60,90,120].map(value=><option key={value} value={value}>{value === 90 ? "1 час 30 минут" : value === 120 ? "2 часа" : `${value} минут`}</option>)}</select></label>
            <label>Кардио в зале<select value={builderCardio} disabled={builderPlace !== "Зал"} onChange={(e)=>setBuilderCardio(e.target.value)}><option>Без кардио</option><option>Кардио на беговой дорожке</option><option>Кардио на велотренажёре</option><option>Кардио на лестнице</option></select></label>
            <label>Время кардио<select value={cardioMinutes} disabled={builderCardio === "Без кардио"} onChange={(e)=>setCardioMinutes(Number(e.target.value))}>{[5,10,15,20,30,40,45,60].map(value=><option key={value} value={value}>{value} минут</option>)}</select></label>
          </div>
          <div className="builder-result"><div className="builder-list">{editableWorkout.map((exerciseIndex,index)=><div className={`builder-exercise ${exercises[exerciseIndex].category === "Кардио" ? "cardio-item" : ""}`} key={`${index}-${exerciseIndex}`}><b>{String(index+1).padStart(2,"0")}</b><div><strong>{exercises[exerciseIndex].name}</strong><small>{exercises[exerciseIndex].focus} · {exercises[exerciseIndex].category === "Кардио" ? `${cardioMinutes} минут` : exercises[exerciseIndex].reps}</small></div><select aria-label={`Заменить ${exercises[exerciseIndex].name}`} value={exerciseIndex} onChange={(e)=>replaceWorkoutExercise(index,Number(e.target.value))}>{replacementExercises.map(({exercise,index:optionIndex})=><option value={optionIndex} key={optionIndex}>{exercise.name}</option>)}</select><button className="remove-exercise" aria-label={`Убрать ${exercises[exerciseIndex].name}`} title="Убрать упражнение" onClick={()=>removeWorkoutExercise(index)}>×</button></div>)}<button className="add-exercise" type="button" onClick={addWorkoutExercise} disabled={!replacementExercises.some(({exercise,index})=>exercise.category !== "Кардио" && !editableWorkout.includes(index))}><b>＋</b> Добавить упражнение</button></div><div className="builder-summary"><small>ТВОЯ ТРЕНИРОВКА</small><strong>{editableWorkout.length} упражнений</strong><p>{builderGoal} · {builderPlace}<br/>{builderFocus} · {builderMinutes === 90 ? "1 час 30 минут" : builderMinutes === 120 ? "2 часа" : `${builderMinutes} минут`}{builderCardio !== "Без кардио" && <><br/>{builderCardio.replace("Кардио на ","")} · {cardioMinutes} минут</>}</p><button className="primary" disabled={!editableWorkout.length} onClick={()=>editableWorkout.length&&selectExercise(editableWorkout[0],editableWorkout)}>Начать план <b>→</b></button></div></div>
          <div className="ai-coach-actions"><div><span>✦ AI-ТРЕНЕР</span><p>OpenAI проанализирует параметры и перестроит упражнения и питание под выбранную цель.</p></div><button className="ai-generate" disabled={aiLoading} onClick={()=>void generateAiPlan()}>{aiLoading ? "Составляю план…" : "Составить план с AI"}</button></div>
          {aiError && <div className="ai-error">{aiError}</div>}
          {aiPlan && <div className="ai-plan"><div className="ai-plan-intro"><span>ПЛАН ОТ AI-ТРЕНЕРА</span><h4>{aiPlan.title}</h4><p>{aiPlan.explanation}</p></div><div><h5>Советы тренера</h5><ul>{aiPlan.coachTips.map((tip)=><li key={tip}>{tip}</li>)}</ul></div><div><h5>Идеи питания</h5><ul>{aiPlan.meals.map((meal)=><li key={`${meal.type}-${meal.name}`}><b>{meal.type}: {meal.name}</b><small>{meal.note}</small></li>)}</ul></div><p className="ai-safety">{aiPlan.safetyNote}</p></div>}
        </div>
        <div className="section-title"><div><span>БИБЛИОТЕКА УПРАЖНЕНИЙ</span><h3>Выбери свою тренировку</h3></div><p>{filteredExercises.length} из {exercises.length} упражнений</p></div>
        <div className="exercise-filters"><div><span>Зона тела</span>{["Все","Пресс","Руки","Спина","Ноги","Ягодицы","Кардио"].map(item=><button key={item} className={muscleFilter===item?"active":""} onClick={()=>setMuscleFilter(item)}>{item}</button>)}<button className="stretch-filter" onClick={()=>setScreen("stretching")}>Растяжка ↗</button></div><div><span>Где</span>{["Все места","Дом","Зал"].map(item=><button key={item} className={placeFilter===item?"active":""} onClick={()=>setPlaceFilter(item)}>{item}</button>)}</div></div>
        <div className="exercise-grid">{filteredExercises.map(({exercise:e,index:i})=><article key={e.name} onClick={()=>selectExercise(i)}><div className={`exercise-art art-${i%6}`}><img src={exercisePoster(e)} alt={`${e.name}: техника выполнения`}/><em>{e.place === "Зал" ? "GYM" : e.place === "Дом" ? "HOME" : "ALL"}</em><button aria-label={`Открыть упражнение: ${e.name}`}>→</button></div><div><small>{e.category} · {e.focus}</small><h4>{e.name}</h4><p>{e.reps}</p></div></article>)}</div>
        <button className="stretching-shortcut" onClick={()=>setScreen("stretching")}><span>ОТДЕЛЬНЫЙ РАЗДЕЛ</span><strong>Растяжка для утра и вечера</strong><small>Мягкие комплексы по 4 минуты или полный комплекс за 8 минут</small><b>Открыть растяжку →</b></button>
        <button className="primary start-session hero-button" onClick={()=>selectExercise(0)}><span>{t.start}</span><b>→</b></button>
        <button className="nutrition-banner" onClick={()=>setScreen("nutrition")}><span><i>НОВОЕ</i><b>Твой план питания</b><small>{nutrition.calories} ккал · {nutrition.water} л воды в день</small></span><strong>Посмотреть меню →</strong></button>
      </section>}

      {screen === "exercises" && <section className="dashboard standalone-page">
        <button className="stretching-shortcut stretching-shortcut-top" onClick={()=>setScreen("stretching")}><span>ОТДЕЛЬНЫЙ РАЗДЕЛ</span><strong>Растяжка для утра и вечера</strong><small>Выбери утренний, вечерний или полный комплекс</small><b>Открыть растяжку →</b></button>
        <div className="page-intro"><span>ДВИГАЙСЯ ПРАВИЛЬНО</span><h2>Все упражнения</h2><p>Выбери зону тела и место тренировки. Нажми на карточку, чтобы увидеть фотографию и количество подходов. У планки есть таймер.</p></div>
        <div className="section-title"><div><span>БИБЛИОТЕКА УПРАЖНЕНИЙ</span><h3>Найди подходящее упражнение</h3></div><p>{filteredExercises.length} из {exercises.length} упражнений</p></div>
        <div className="exercise-filters"><div><span>Зона тела</span>{["Все","Пресс","Руки","Спина","Ноги","Ягодицы","Кардио"].map(item=><button key={item} className={muscleFilter===item?"active":""} onClick={()=>setMuscleFilter(item)}>{item}</button>)}<button className="stretch-filter" onClick={()=>setScreen("stretching")}>Растяжка ↗</button></div><div><span>Где</span>{["Все места","Дом","Зал"].map(item=><button key={item} className={placeFilter===item?"active":""} onClick={()=>setPlaceFilter(item)}>{item}</button>)}</div></div>
        <div className="exercise-grid">{filteredExercises.map(({exercise:e,index:i})=><article key={e.name} onClick={()=>selectExercise(i)}><div className={`exercise-art art-${i%6}`}><img src={exercisePoster(e)} alt={`${e.name}: техника выполнения`}/><em>{e.place === "Зал" ? "GYM" : e.place === "Дом" ? "HOME" : "ALL"}</em><button aria-label={`Открыть упражнение: ${e.name}`}>→</button></div><div><small>{e.category} · {e.focus}</small><h4>{e.name}</h4><p>{e.reps}</p></div></article>)}</div>
      </section>}

      {screen === "stretching" && <section className="dashboard standalone-page stretching-page">
        <button className="back" onClick={()=>setScreen("exercises")}>← Все упражнения</button>
        <div className="stretching-hero">
          <div className="stretching-hero-copy"><span>ВОССТАНОВЛЕНИЕ · ДВИЖЕНИЕ</span><h2>Немного времени<br/>для себя</h2><p>Выбери мягкий комплекс под своё настроение. Каждое движение делай плавно, без боли и задержки дыхания.</p><div className="stretching-hero-meta"><b>8 движений</b><b>Без оборудования</b><b>Дома или в зале</b></div></div>
          <img src="/exercises/stretch.png" alt="Спокойная растяжка сидя на коврике" />
        </div>
        <div className="stretching-controls"><div><span>ТВОЙ КОМПЛЕКС</span><h3>{stretchMode === "morning" ? "Проснуться мягко" : stretchMode === "evening" ? "Отпустить напряжение" : "Полная растяжка"}</h3><p>{stretchMode === "morning" ? "Разбуди шею, спину и таз перед началом дня." : stretchMode === "evening" ? "Замедлись и расслабь мышцы после активного дня." : "Утренние и вечерние движения в одном комплексе."}</p></div><div className="stretching-tabs" role="group" aria-label="Выбрать комплекс растяжки">{([{"id":"morning","label":"Утренняя"},{"id":"evening","label":"Вечерняя"},{"id":"all","label":"Всё вместе"}] as const).map((option)=><button key={option.id} className={stretchMode===option.id?"active":""} aria-pressed={stretchMode===option.id} onClick={()=>setStretchMode(option.id)}>{option.label}</button>)}</div></div>
        <div className="stretching-progress"><div><span>{visibleStretches.length} движения · {stretchMinutes} минут</span><strong>{stretchCompleted} из {visibleStretches.length} выполнено</strong></div><div className="stretching-progress-track"><span style={{width:`${stretchCompleted / visibleStretches.length * 100}%`}} /></div></div>
        <div className="stretching-list">{visibleStretches.map((move,index)=><article className={completedStretches.includes(move.id)?"completed":""} key={move.id}><img src={move.image} alt={`Как выполнить: ${move.name}`} /><div className="stretching-move-copy"><span>{String(index+1).padStart(2,"0")} / {move.period === "morning" ? "Утро" : "Вечер"}</span><h4>{move.name}</h4><p>{move.instruction}</p><small>{move.seconds} секунд</small></div><button type="button" aria-label={`${completedStretches.includes(move.id)?"Отменить выполнение":"Отметить выполненным"}: ${move.name}`} aria-pressed={completedStretches.includes(move.id)} onClick={()=>setCompletedStretches((previous)=>previous.includes(move.id)?previous.filter((id)=>id!==move.id):[...previous,move.id])}>{completedStretches.includes(move.id)?"✓":"○"}<span>{completedStretches.includes(move.id)?"Готово":"Сделано"}</span></button></article>)}</div>
        <p className="stretching-note">Если движение вызывает боль или головокружение, остановись. Растяжка должна ощущаться мягко и комфортно.</p>
      </section>}

      {screen === "progress" && <section className="dashboard standalone-page progress-page">
        <div className="page-intro"><span>ТВОИ РЕЗУЛЬТАТЫ</span><h2>Прогресс тренировок</h2><p>Здесь сохраняются упражнения после нажатия «Готово» в конце тренировки.</p></div>
        {!isAuthenticated ? <div className="progress-empty"><strong>Войди в аккаунт</strong><p>Чтобы сохранять тренировки и видеть историю прогресса, нужна авторизация.</p><button className="primary" onClick={()=>setScreen("signup")}>Войти или зарегистрироваться →</button></div> : progressLoading ? <div className="progress-empty"><strong>Загружаем прогресс…</strong></div> : progressError ? <div className="progress-empty error"><strong>Не удалось загрузить данные</strong><p>{progressError}</p><button className="secondary" onClick={()=>void openProgress()}>Попробовать снова</button></div> : <>
          <div className="progress-stats"><article><small>ЗАВЕРШЕНО</small><strong>{progressEntries.length}</strong><span>упражнений</span></article><article><small>ВРЕМЯ</small><strong>{completedMinutes}</strong><span>минут</span></article><article><small>АКТИВНОСТЬ</small><strong>{completedDays}</strong><span>дней</span></article></div>
          {progressEntries.length === 0 ? <div className="progress-empty"><strong>Первая тренировка впереди</strong><p>Открой упражнения, выполни тренировку и нажми «Готово» — результат появится здесь.</p><button className="primary" onClick={()=>setScreen("exercises")}>Выбрать упражнение →</button></div> : <div className="progress-history"><div className="section-title"><div><span>ИСТОРИЯ</span><h3>Последние тренировки</h3></div></div>{progressEntries.map((item,index)=><article key={item.id ?? `${item.completed_at}-${index}`}><div className="history-check">✓</div><div><strong>{item.exercise_name}</strong><span>{new Date(item.completed_at).toLocaleString("ru-RU", { day:"numeric", month:"long", hour:"2-digit", minute:"2-digit" })}</span></div><b>{Math.max(1,Math.round(Number(item.duration_seconds)/60))} мин</b></article>)}</div>}
        </>}
      </section>}

      {screen === "nutrition" && <section className="nutrition-page">
        <button className="back" onClick={()=>setScreen("plan")}>← Вернуться к тренировкам</button>
        <div className="nutrition-hero"><div><span className="eyebrow">ПИТАНИЕ НА СЕГОДНЯ</span><h2>Еда, которая работает<br/>вместе с тобой</h2><p>Расчёт основан на данных анкеты и выбранной цели. Значения ориентировочные и не заменяют консультацию врача или диетолога.</p></div><div className="calorie-ring"><div><strong>{nutrition.calories}</strong><span>ккал в день</span></div></div></div>
        <div className="nutrition-stats">
          <article><span>💧</span><div><small>Вода</small><b>{nutrition.water} л</b><p>в течение дня</p></div></article>
          <article><span>◒</span><div><small>Белки</small><b>{nutrition.protein} г</b><p>для восстановления</p></div></article>
          <article><span>◇</span><div><small>Углеводы</small><b>{nutrition.carbs} г</b><p>для энергии</p></div></article>
          <article><span>○</span><div><small>Жиры</small><b>{nutrition.fats} г</b><p>для баланса</p></div></article>
        </div>
        <div className="meal-heading"><div><span>МЕНЮ НА ДЕНЬ</span><h3>Что приготовить сегодня</h3></div><p>{meals.reduce((sum,meal)=>sum+meal.calories,0)} ккал в основных приёмах пищи</p></div>
        <div className="meal-grid">{meals.map((meal,index)=><article className={`meal-card ${openMeal===index?"expanded":""}`} key={meal.name}><div className="meal-photo"><img src={meal.image} alt={meal.name}/><span>{meal.type}</span></div><div className="meal-body"><div className="meal-meta"><span>{meal.calories} ккал</span><span>{meal.protein} г белка</span><span>⏱ {meal.time}</span></div><h4>{meal.name}</h4><div className="allergens"><small>Аллергены:</small>{meal.allergens.length ? meal.allergens.map(a=><span key={a}>{a}</span>) : <span className="safe">не указаны</span>}</div><button className="recipe-toggle" onClick={()=>setOpenMeal(openMeal===index?null:index)}>{openMeal===index?"Скрыть рецепт":"Открыть рецепт"}<b>{openMeal===index?"−":"+"}</b></button>{openMeal===index&&<div className="recipe"><div><h5>Ингредиенты</h5><ul>{meal.ingredients.map(item=><li key={item}>{item}</li>)}</ul></div><div><h5>Как приготовить</h5><ol>{meal.steps.map(step=><li key={step}>{step}</li>)}</ol></div></div>}</div></article>)}</div>
      </section>}

      {screen === "session" && <section className="session">
        <div className="session-top"><button className="secondary" onClick={()=>{playSignal("finish");setScreen("plan")}}>✕ {t.finish}</button><button className={`sound-toggle ${soundOn?"on":""}`} onClick={()=>setSoundOn(!soundOn)}>{soundOn?"🔊":"🔇"} {t.sound}</button><span>{currentQueuePosition + 1} / {workoutQueue.length}</span></div>
        <div className="session-card"><div className="media-panel"><div className="big-art photo-stage"><img key={current} src={exercisePoster(exercises[current])} alt={`${exercises[current].name} — фото упражнения`}/></div></div><div className="session-info"><small>{exercises[current].focus}</small><h2>{exercises[current].name}</h2><p>{exercises[current].category === "Кардио" ? `${cardioMinutes} минут` : exercises[current].reps}</p>{isTimedExercise && <><div className="timer">{time}</div><button className={`primary round ${running?"is-running":""}`} onClick={toggleTimer}>{running ? "Ⅱ" : "▶"}</button><span>{running ? t.pause : t.startTimer}</span></>}</div></div>
        <div className="session-nav"><button disabled={currentQueuePosition===0} onClick={()=>{playSignal("rest");selectExercise(workoutQueue[currentQueuePosition-1],workoutQueue)}}>← {t.previous}</button><div>{workoutQueue.map((exerciseIndex)=><i key={exerciseIndex} className={exerciseIndex===current?"active":""}/>)}</div><button onClick={()=>{playSignal("rest");currentQueuePosition < workoutQueue.length-1 ? selectExercise(workoutQueue[currentQueuePosition+1],workoutQueue) : void completeWorkout()}}>{currentQueuePosition === workoutQueue.length-1 ? t.done : t.next} →</button></div>
      </section>}
    </main>
  );
}

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { authClient } from "@/lib/auth/client";

type Screen = "home" | "signup" | "quiz" | "plan" | "session" | "nutrition";
type Language = "ru" | "lv" | "en";
type MediaMode = "animation" | "video";
type Answers = { name: string; email: string; sex: string; age: string; height: string; weight: string; level: string; goal: string; place: string; period: string; days: string; minutes: string; equipment: string[] };
type Exercise = { name: string; focus: string; reps: string; seconds: number; icon: string; image?: string; videoId: string; category: "Всё тело" | "Пресс" | "Руки" | "Спина" | "Ноги" | "Ягодицы"; place: "Дом" | "Зал" | "Дом и зал" };
type QuizStep = { key: string; title: string; subtitle: string; kind?: "profile" | "schedule"; options?: readonly string[] };
type Meal = { type: string; name: string; calories: number; protein: number; time: string; image: string; allergens: string[]; ingredients: string[]; steps: string[] };

const initial: Answers = { name: "", email: "", sex: "", age: "", height: "", weight: "", level: "Новичок", goal: "Поддержание формы", place: "Дом", period: "Неделя", days: "3", minutes: "30", equipment: [] };

const exercises: Exercise[] = [
  { name:"Разминка в движении", focus:"Всё тело", reps:"3 минуты", seconds:180, icon:"↗", videoId:"GCzecFateXc", category:"Всё тело", place:"Дом и зал" },
  { name:"Приседания", focus:"Ноги и ягодицы", reps:"3 × 12", seconds:45, icon:"↓", image:"/exercises/squat.png", videoId:"Uv_DKDl7EjA", category:"Ноги", place:"Дом и зал" },
  { name:"Отжимания с колен", focus:"Грудь и руки", reps:"3 × 8", seconds:40, icon:"↔", image:"/exercises/knee-pushup.png", videoId:"svNswI9wudk", category:"Руки", place:"Дом" },
  { name:"Ягодичный мост", focus:"Ягодицы и корпус", reps:"3 × 15", seconds:45, icon:"⌁", image:"/exercises/glute-bridge.png", videoId:"h5UOyrVYAhs", category:"Ягодицы", place:"Дом" },
  { name:"Планка", focus:"Пресс и корпус", reps:"3 × 30 сек", seconds:30, icon:"—", videoId:"mwlp75MS6Rg", category:"Пресс", place:"Дом" },
  { name:"Мёртвый жук", focus:"Глубокие мышцы пресса", reps:"3 × 10", seconds:40, icon:"✣", videoId:"bxn9FBrt4-A", category:"Пресс", place:"Дом" },
  { name:"Велосипед", focus:"Пресс и косые мышцы", reps:"3 × 16", seconds:45, icon:"∞", videoId:"9FGilxCbdz8", category:"Пресс", place:"Дом" },
  { name:"Боковая планка", focus:"Косые мышцы живота", reps:"3 × 25 сек", seconds:25, icon:"◢", videoId:"K2VljzCC16g", category:"Пресс", place:"Дом" },
  { name:"Алмазные отжимания", focus:"Трицепс и грудь", reps:"3 × 8", seconds:40, icon:"◇", videoId:"J0DnG1_S92I", category:"Руки", place:"Дом" },
  { name:"Обратные отжимания", focus:"Трицепс", reps:"3 × 10", seconds:40, icon:"⇣", videoId:"0326dy_-CzM", category:"Руки", place:"Дом" },
  { name:"Супермен", focus:"Поясница и спина", reps:"3 × 12", seconds:40, icon:"↑", videoId:"z6PJMT2y8GQ", category:"Спина", place:"Дом" },
  { name:"Обратные снежные ангелы", focus:"Верх спины и плечи", reps:"3 × 12", seconds:45, icon:"⌁", videoId:"YB0egDzsu18", category:"Спина", place:"Дом" },
  { name:"Выпады назад", focus:"Ноги и баланс", reps:"3 × 10", seconds:45, icon:"↙", videoId:"xrPteyQLGAo", category:"Ноги", place:"Дом" },
  { name:"Махи ногой назад", focus:"Ягодицы", reps:"3 × 15", seconds:40, icon:"↗", videoId:"SJ1Xuz9D-ZQ", category:"Ягодицы", place:"Дом" },
  { name:"Сгибание рук с гантелями", focus:"Бицепс", reps:"3 × 12", seconds:45, icon:"∪", videoId:"ykJmrZ5v0Oo", category:"Руки", place:"Зал" },
  { name:"Разгибание рук на блоке", focus:"Трицепс", reps:"3 × 12", seconds:45, icon:"↓", videoId:"2-LAMcpzODU", category:"Руки", place:"Зал" },
  { name:"Тяга верхнего блока", focus:"Широчайшие мышцы", reps:"3 × 12", seconds:50, icon:"⇓", videoId:"CAwf7n6Luuc", category:"Спина", place:"Зал" },
  { name:"Тяга горизонтального блока", focus:"Середина спины", reps:"3 × 12", seconds:50, icon:"←", videoId:"B42JiqHrrRw", category:"Спина", place:"Зал" },
  { name:"Жим ногами", focus:"Квадрицепс и ягодицы", reps:"4 × 10", seconds:55, icon:"↗", videoId:"IZxyjW7MPJQ", category:"Ноги", place:"Зал" },
  { name:"Разгибание ног", focus:"Квадрицепс", reps:"3 × 12", seconds:45, icon:"⌝", videoId:"YyvSfVjQeL0", category:"Ноги", place:"Зал" },
  { name:"Сгибание ног в тренажёре", focus:"Задняя поверхность бедра", reps:"3 × 12", seconds:45, icon:"⌞", videoId:"1Tq3QdYUuHs", category:"Ноги", place:"Зал" },
  { name:"Хип-траст со штангой", focus:"Ягодицы", reps:"4 × 10", seconds:55, icon:"⌃", videoId:"SEdqd1n0cvg", category:"Ягодицы", place:"Зал" },
  { name:"Отведение ног в тренажёре", focus:"Средняя ягодичная", reps:"3 × 15", seconds:45, icon:"↔", videoId:"jf9PBwwNAMs", category:"Ягодицы", place:"Зал" },
  { name:"Скручивания на блоке", focus:"Пресс", reps:"3 × 15", seconds:45, icon:"⌒", videoId:"AV5PmZJIrrw", category:"Пресс", place:"Зал" },
  { name:"Спокойная растяжка", focus:"Всё тело", reps:"4 минуты", seconds:240, icon:"○", videoId:"8GL73mrsvJ8", category:"Всё тело", place:"Дом и зал" },
];

function exercisePoster(exercise: Exercise) {
  if (exercise.image) return exercise.image;
  if (exercise.name === "Разминка в движении") return "/exercises/covers/warmup.png";
  if (exercise.name === "Спокойная растяжка") return "/exercises/covers/stretch.png";
  const group = exercise.category === "Пресс" ? "core" : exercise.category === "Руки" ? "arms" : exercise.category === "Спина" ? "back" : exercise.category === "Ноги" ? "legs" : exercise.category === "Ягодицы" ? "glutes" : "core";
  const place = exercise.place === "Зал" ? "gym" : "home";
  return `/exercises/covers/${place}-${group}.png`;
}

const meals: Meal[] = [
  { type:"Завтрак", name:"Овсяная каша с ягодами", calories:460, protein:19, time:"10 мин", image:"/meals/breakfast-oats.png", allergens:["Молоко","Орехи"], ingredients:["60 г овсяных хлопьев","150 г греческого йогурта","1/2 банана","80 г голубики","10 г миндаля","1 ч. л. семян чиа"], steps:["Свари овсяные хлопья в воде или молоке 5–7 минут.","Переложи кашу в миску и добавь йогурт.","Выложи банан, ягоды, миндаль и семена чиа."] },
  { type:"Обед", name:"Боул с курицей и киноа", calories:620, protein:48, time:"25 мин", image:"/meals/lunch-chicken-bowl.png", allergens:[], ingredients:["160 г куриной грудки","70 г сухой киноа","200 г овощей","Горсть шпината","1 ч. л. оливкового масла","Лимон и травы"], steps:["Отвари киноа по инструкции на упаковке.","Приправь курицу и обжарь по 5–6 минут с каждой стороны.","Запеки или обжарь овощи, затем собери всё в миске.","Добавь шпинат и заправь лимоном с оливковым маслом."] },
  { type:"Ужин", name:"Лосось с картофелем и спаржей", calories:590, protein:42, time:"30 мин", image:"/meals/dinner-salmon.png", allergens:["Рыба"], ingredients:["170 г филе лосося","220 г молодого картофеля","150 г спаржи","1 ч. л. оливкового масла","Лимон, укроп, перец"], steps:["Разогрей духовку до 200 °C.","Картофель смешай с половиной масла и запекай 15 минут.","Добавь лосось и спаржу, сбрызни оставшимся маслом.","Запекай ещё 12–15 минут и подавай с лимоном."] },
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
  const [answers, setAnswers] = useState<Answers>(initial);
  const [step, setStep] = useState(0);
  const [current, setCurrent] = useState(0);
  const [remaining, setRemaining] = useState(exercises[0].seconds);
  const [running, setRunning] = useState(false);
  const [language, setLanguage] = useState<Language>("ru");
  const [languageOpen, setLanguageOpen] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [mediaMode, setMediaMode] = useState<MediaMode>("animation");
  const [muscleFilter, setMuscleFilter] = useState("Все");
  const [placeFilter, setPlaceFilter] = useState("Все места");
  const [openMeal, setOpenMeal] = useState<number | null>(null);
  const [password, setPassword] = useState("");
  const [authMode, setAuthMode] = useState<"sign-up" | "sign-in">("sign-up");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
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

  const completeWorkout = () => {
    void fetch("/api/progress", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ exerciseName:exercises[current].name, durationSeconds:exercises[current].seconds, completed:true }) });
    setScreen("plan");
  };

  const update = (key: keyof Answers, value: string | string[]) => setAnswers((a) => ({ ...a, [key]: value }));
  const chooseEquipment = (value: string) => update("equipment", answers.equipment.includes(value) ? answers.equipment.filter((x) => x !== value) : [...answers.equipment, value]);
  const nextStep = () => {
    if (step < quizSteps.length - 1) return setStep(step + 1);
    void fetch("/api/profile", { method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify(answers) });
    setScreen("plan");
  };
  const selectExercise = (i: number) => { setCurrent(i); setRemaining(exercises[i].seconds); setRunning(false); setScreen("session"); };
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

  return (
    <main>
      <header><Logo /><nav><button onClick={() => setScreen("plan")}>{t.programs}</button><button>{t.exercises}</button><button onClick={() => setScreen("nutrition")}>Питание</button><button>{t.progress}</button></nav><div className="header-tools"><div className={`language-menu ${languageOpen ? "open" : ""}`}><button className="language-trigger" onClick={()=>setLanguageOpen(!languageOpen)} aria-expanded={languageOpen} aria-label="Choose language"><span className="globe">◎</span><b>{language.toUpperCase()}</b><i>⌄</i></button>{languageOpen && <div className="language-popover">{(["ru","lv","en"] as Language[]).map((code)=><button key={code} className={language===code?"active":""} onClick={()=>{setLanguage(code);setLanguageOpen(false)}}><span>{code === "ru" ? "Русский" : code === "lv" ? "Latviešu" : "English"}</span><b>{code.toUpperCase()}</b>{language===code&&<i>✓</i>}</button>)}</div>}</div><button className="profile" title={isAuthenticated ? "Выйти из аккаунта" : "Войти"} onClick={()=>isAuthenticated ? void signOut() : setScreen("signup")}>{isAuthenticated ? "✓" : "Ю"}</button></div></header>

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
          <article><i>01</i><div className="feature-icon">▶</div><h3>Персональные тренировки</h3><p>Дом или зал, видео правильной техники, таймеры и нагрузка на неделю или месяц.</p></article>
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
        <div className="section-title"><div><span>БИБЛИОТЕКА УПРАЖНЕНИЙ</span><h3>Выбери свою тренировку</h3></div><p>{filteredExercises.length} из {exercises.length} упражнений</p></div>
        <div className="exercise-filters"><div><span>Зона тела</span>{["Все","Пресс","Руки","Спина","Ноги","Ягодицы"].map(item=><button key={item} className={muscleFilter===item?"active":""} onClick={()=>setMuscleFilter(item)}>{item}</button>)}</div><div><span>Где</span>{["Все места","Дом","Зал"].map(item=><button key={item} className={placeFilter===item?"active":""} onClick={()=>setPlaceFilter(item)}>{item}</button>)}</div></div>
        <div className="exercise-grid">{filteredExercises.map(({exercise:e,index:i})=><article key={e.name} onClick={()=>selectExercise(i)}><div className={`exercise-art art-${i%6}`}><img src={exercisePoster(e)} alt={`${e.name}: техника выполнения`}/><em>{e.place === "Зал" ? "GYM" : e.place === "Дом" ? "HOME" : "ALL"}</em><button aria-label={`Открыть упражнение: ${e.name}`}>→</button></div><div><small>{e.category} · {e.focus}</small><h4>{e.name}</h4><p>{e.reps}</p></div></article>)}</div>
        <button className="primary start-session hero-button" onClick={()=>selectExercise(0)}><span>{t.start}</span><b>→</b></button>
        <button className="nutrition-banner" onClick={()=>setScreen("nutrition")}><span><i>НОВОЕ</i><b>Твой план питания</b><small>{nutrition.calories} ккал · {nutrition.water} л воды в день</small></span><strong>Посмотреть меню →</strong></button>
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
        <div className="session-top"><button className="secondary" onClick={()=>{playSignal("finish");setScreen("plan")}}>✕ {t.finish}</button><button className={`sound-toggle ${soundOn?"on":""}`} onClick={()=>setSoundOn(!soundOn)}>{soundOn?"🔊":"🔇"} {t.sound}</button><span>{current + 1} / {exercises.length}</span></div>
        <div className="session-card"><div className="media-panel"><div className={`big-art ${mediaMode === "video" ? "video-stage" : "animation-stage"}`}>{mediaMode === "video" ? <iframe key={exercises[current].videoId} src={`https://www.youtube-nocookie.com/embed/${exercises[current].videoId}?rel=0&modestbranding=1&playsinline=1`} title={`${exercises[current].name} — техника выполнения`} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen/> : <img key={current} src={exercisePoster(exercises[current])} alt={`${exercises[current].name} — анимационная демонстрация`}/>}<i>{mediaMode === "video" ? "VIDEO GUIDE" : "LIVE MOTION"}</i>{mediaMode === "animation"&&<div className="motion-lines"><span/><span/><span/></div>}</div><div className="media-switch" role="group" aria-label="Формат демонстрации"><button className={mediaMode==="animation"?"active":""} onClick={()=>setMediaMode("animation")}><span>◉</span> Анимация</button><button className={mediaMode==="video"?"active":""} onClick={()=>setMediaMode("video")}><span>▶</span> Видео с YouTube</button></div></div><div className="session-info"><small>{exercises[current].focus}</small><h2>{exercises[current].name}</h2><p>{exercises[current].reps}</p><div className="timer">{time}</div><button className={`primary round ${running?"is-running":""}`} onClick={toggleTimer}>{running ? "Ⅱ" : "▶"}</button><span>{running ? t.pause : t.startTimer}</span></div></div>
        <div className="session-nav"><button disabled={!current} onClick={()=>{playSignal("rest");selectExercise(current-1)}}>← {t.previous}</button><div>{exercises.map((_,i)=><i key={i} className={i===current?"active":""}/>)}</div><button onClick={()=>{playSignal("rest");current < exercises.length-1 ? selectExercise(current+1) : void completeWorkout()}}>{current === exercises.length-1 ? t.done : t.next} →</button></div>
      </section>}
    </main>
  );
}

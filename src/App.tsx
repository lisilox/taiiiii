import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

type Question = {
  id: number
  q: string
  answers: { text: string; correct: boolean }[]
  hint?: string
}

const QUESTIONS: Question[] = [
  {
    id: 1,
    q: "Куда ты скоро полетишь отдыхать?",
    answers: [
      { text: "Тай", correct: true },
      { text: "Греция", correct: false },
      { text: "Мальдивы", correct: false },
    ],
    hint: "помнишь, мы смотрели виллы на Пхукете?",
  },
  {
    id: 2,
    q: "Кто самая красивая на планете?",
    answers: [
      { text: "Анджелина Джоли", correct: false },
      { text: "Ты", correct: true },
      { text: "Ева Грин", correct: false },
    ],
  },
  {
    id: 3,
    q: "Когда мы начали встречаться?",
    answers: [
      { text: "19 марта", correct: false },
      { text: "11 сентября", correct: false },
      { text: "24 мая", correct: true },
    ],
    hint: "конец весны. тёплый вечер, который всё изменил.",
  },
  {
    id: 4,
    q: "Как сильно я тебя люблю?",
    answers: [
      { text: "очень сильно", correct: true },
      { text: "бесконечно", correct: true },
      { text: "безмерно", correct: true },
    ],
  },
  {
    id: 5,
    q: "Когда мы расстанемся?",
    answers: [
      { text: "скоро", correct: false },
      { text: "никогда", correct: true },
      { text: "по окончанию таймера", correct: false },
    ],
  }
]

const fontDisplay = `"Fraunces", "Instrument Serif", Georgia, ui-serif, serif`
const fontUI = `"Plus Jakarta Sans", Inter, ui-sans-serif, system-ui, -apple-system, sans-serif`

function MintNoise() {
  return (
    <div
      aria-hidden
      style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 2,
        opacity: 0.032,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
      }}
    />
  )
}

function MusicPill({ playing, onToggle }: { playing: boolean, onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className="group flex items-center gap-3 rounded-full border border-[#c2dccf] bg-[#f6fbf8]/78 backdrop-blur-md px-3.5 py-2 text-[12.3px] text-[#224838] shadow-[0_2px_20px_rgba(34,72,56,0.07)] transition hover:bg-white"
      style={{ fontFamily: fontUI }}
    >
      <span className="relative flex h-7 w-7 items-center justify-center rounded-full bg-[#d8f1e2]">
        <span className={`absolute h-7 w-7 rounded-full bg-[#bfe8d3] ${playing ? 'animate-ping opacity-50' : 'opacity-0'}`} />
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="relative text-[#1f4f3a]">
          {playing
            ? <><rect x="7" y="6" width="2.8" height="12" fill="currentColor" rx="0.8"/><rect x="14.2" y="6" width="2.8" height="12" fill="currentColor" rx="0.8"/></>
            : <path d="M8 6.4v11.2L18.4 12 8 6.4Z" fill="currentColor" />
          }
        </svg>
      </span>
      <span className="pr-1 leading-tight text-left">
        <span className="block text-[10.5px] tracking-[0.1em] text-[#6a9180] uppercase">Наша песня</span>
        <span className="block font-medium tracking-[-0.01em] text-[12.8px]">You Are My Destiny - Paul Anka</span>
      </span>
    </button>
  )
}

function Header({ step }: { step: "home" | "quiz" | "note" }) {
  return (
    <header className="sticky top-0 z-40 pt-7 md:pt-10 pointer-events-none">
      <div className="max-w-[1100px] mx-auto px-6 md:px-10 flex items-center justify-between">
        <div style={{ fontFamily: fontUI }} className="text-[11.5px] tracking-[0.17em] text-[#496b5c]">
          NASTYA • <span className="opacity-80">PRIVATE EDITION</span>
        </div>
        <div style={{ fontFamily: fontUI }} className="hidden sm:flex items-center gap-5 text-[11.3px] text-[#5b8171]">
          <span className={step === "home" ? "text-[#164432] font-[550]" : ""}>01 Главная</span>
          <span className="text-[#b5cbc1]">·</span>
          <span className={step === "quiz" ? "text-[#164432] font-[550]" : ""}>02 Вопросы</span>
          <span className="text-[#b5cbc1]">·</span>
          <span className={step === "note" ? "text-[#164432] font-[550]" : ""}>03 Записка</span>
        </div>
      </div>
    </header>
  )
}

export default function App() {
  const [page, setPage] = useState<"home" | "quiz" | "note">("home")
  const [qIndex, setQIndex] = useState(0)
  const [wrongId, setWrongId] = useState<string | null>(null)
  const [goodFlash, setGoodFlash] = useState<string | null>(null)
  const [musicPlaying, setMusicPlaying] = useState(false)
  const [answeredCount, setAnsweredCount] = useState(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    if (!audioRef.current) return
    if (musicPlaying) {
      audioRef.current.volume = 0.38
      audioRef.current.play().catch(() => setMusicPlaying(false))
    } else {
      audioRef.current.pause()
    }
  }, [musicPlaying])

  const currentQ = QUESTIONS[qIndex]

  const handleAnswer = (correct: boolean, key: string) => {
    if (goodFlash) return
    if (correct) {
      setGoodFlash(key)
      setAnsweredCount(c => c + 1)
      setTimeout(() => {
        setGoodFlash(null)
        if (qIndex + 1 < QUESTIONS.length) {
          setQIndex(qi => qi + 1)
        } else {
          setPage("note")
          window.scrollTo({ top: 0, behavior: "smooth" })
        }
      }, 680)
    } else {
      setWrongId(key)
      setTimeout(() => setWrongId(null), 850)
    }
  }

  return (
    <div style={{ fontFamily: fontUI }} className="min-h-screen text-[#18392c] bg-[#f1f9f4] relative overflow-x-hidden">
      {/* Mint editorial backdrop */}
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0" style={{
          background: `
            radial-gradient(1100px 780px at 78% -10%, #d7f3e3 0%, #eef9f3 36%, #f4fbf7 60%, #f1f9f4 100%),
            linear-gradient(180deg, #f4fbf7 0%, #edf8f2 100%)
          `
        }}/>
        <div className="absolute -top-24 -right-24 w-[680px] h-[520px] rounded-[100%] blur-[120px] opacity-[.55]" style={{
          background: "radial-gradient(65% 65% at 50% 40%, #bff0d6 0%, #d4f6e6 45%, transparent 80%)"
        }}/>
        <div className="absolute inset-0 opacity-[0.034]" style={{
          backgroundImage:
            `repeating-linear-gradient(0deg, rgba(24,57,44,.7) 0 1px, transparent 1px 3px),
             repeating-linear-gradient(90deg, rgba(24,57,44,.37) 0 1px, transparent 1px 4px)`
        }}/>
      </div>
      <MintNoise/>

      <audio
        ref={audioRef}
        loop
        preload="none"
        src="https://cdn.pixabay.com/audio/2022/03/24/audio_7ef61e6b4e.mp3"
      />

      <div className="relative z-10">
        <Header step={page} />

        <main className="max-w-[1100px] mx-auto px-6 md:px-10 pb-24 min-h-[78vh]">
          <AnimatePresence mode="wait">
            {page === "home" && (
              <motion.section
                key="home"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: .55, ease: [.21,.47,.32,.98] }}
                className="pt-14 md:pt-[92px]"
              >
                <div className="grid lg:grid-cols-12 gap-10 md:gap-8 items-start">
                  <div className="lg:col-span-7">
                    <div className="text-[11.5px] tracking-[0.19em] text-[#4f7e66] mb-6">ЭКСКЛЮЗИВНО ДЛЯ НАСТИ • V.1</div>
                    <h1 style={{ fontFamily: fontDisplay }} className="text-[64px] sm:text-[100px] md:text-[132px] leading-[0.86] tracking-[-0.031em] text-[#13392b]">
                      Настя,
                      <span className="block italic font-[340] tracking-[-0.025em] text-[#22604a]">привет.</span>
                    </h1>
                    <p className="mt-10 max-w-[590px] text-[18.3px] leading-relaxed text-[#305a48]">
                      Я сделал тебе маленькое место в интернете. Очень спокойное,
                      очень мятное, очень твоё. Там пара вопросов, маленькая проверка
                      на то, помнишь ли ты нас, и записка в конце.
                    </p>
                    <p className="mt-4 max-w-[560px] text-[16.6px] leading-relaxed text-[#3e6c58]/90">
                      Сделал как в бутике. Ничего лишнего. Только ты.
                    </p>

                    <div className="mt-11 flex flex-wrap items-center gap-5">
                      <button
                        onClick={() => { setPage("quiz"); setQIndex(0); setAnsweredCount(0) }}
                        className="group relative rounded-full bg-[#163a2b] text-[#dff8ea] px-7 py-[15px] text-[14.8px] tracking-[-0.01em] shadow-[0_10px_36px_rgba(18,52,38,0.23)] transition hover:translate-y-[-1px] hover:shadow-[0_15px_38px_rgba(18,52,38,0.29)] active:translate-y-[0px]"
                      >
                        Продолжить →
                      </button>
                      <span className="text-[13.4px] text-[#4e7d66]">это займёт 45 секунд</span>
                    </div>

                    <div className="mt-8">
                      <MusicPill playing={musicPlaying} onToggle={() => setMusicPlaying(v=>!v)} />
                      <p className="mt-2 text-[11.8px] text-[#5f8b77]">
                        Фоновый плейсхолдер. Наша песня:{" "}
                        <a href="https://www.youtube.com/watch?v=k7fihig4u0Y" target="_blank" rel="noreferrer" className="underline decoration-[#8abfa7]/70 underline-offset-2 hover:text-[#214f3b]">
                          You Are My Destiny - Paul Anka
                        </a>
                      </p>
                    </div>
                  </div>

                  <div className="lg:col-span-5 pt-4 lg:pt-20">
                    <div className="relative mx-auto max-w-[420px]">
                      <div className="absolute -inset-7 rounded-[32px] bg-[#d7f0e2]/70 blur-[34px]" />
                      <div className="relative rounded-[30px] border border-[#c8e5d4] bg-[#fafefb]/84 shadow-[0_24px_70px_rgba(34,88,64,.13)] p-7 md:p-9 backdrop-blur-[2px]">
                        <div className="text-[11px] tracking-[0.18em] text-[#5c8b74]">FOR NASTYA</div>
                        <div style={{ fontFamily: fontDisplay }} className="mt-3 text-[42px] leading-[1.02] text-[#1d4634]">
                          Mint<br/>Private<br/>Note
                        </div>
                        <div className="mt-5 text-[13.7px] leading-relaxed text-[#3d6b57]">
                          Нежный мятный интерфейс. Тёплая бумага. Тихие анимации.
                          Как открытка, только живая.
                        </div>
                        <div className="mt-6 border-t border-[#cee7d8] pt-4 text-[12.5px] text-[#4b7c63] flex items-center justify-between">
                          <span>Limited · 1 / 1</span>
                          <span>24.05</span>
                        </div>
                      </div>
                      <div className="absolute -right-5 -top-5 h-16 w-16 rounded-full bg-[#183a2c] text-[#d7f4e4] grid place-items-center shadow-[0_12px_26px_rgba(18,50,36,.26)] rotate-[9deg]" style={{ fontFamily: fontDisplay }}>
                        <span className="text-[22px]">♡</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-[76px] border-t border-[#cfe8d7] pt-6 flex flex-wrap gap-x-10 gap-y-3 text-[12.6px] text-[#4e7d67]">
                  <span>Спокойная типографика</span>
                  <span>•</span>
                  <span>Мятный лён</span>
                  <span>•</span>
                  <span>Ручная сборка</span>
                  <span>•</span>
                  <span>Без уведомлений</span>
                </div>
              </motion.section>
            )}

            {page === "quiz" && (
              <motion.section
                key={`quiz-${qIndex}`}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                transition={{ duration: .45, ease: [.21,.47,.32,.98] }}
                className="pt-12 md:pt-[74px]"
              >
                <div className="grid lg:grid-cols-12 gap-10 items-start">
                  <div className="lg:col-span-7">
                    <div className="text-[11.2px] tracking-[0.18em] text-[#518068]">ВОПРОС {qIndex+1} / {QUESTIONS.length}</div>

                    <h2 style={{ fontFamily: fontDisplay }} className="mt-4 text-[44px] sm:text-[60px] md:text-[70px] leading-[0.98] tracking-[-0.025em] text-[#13392b] max-w-[720px]">
                      {currentQ.q}
                    </h2>
                    {currentQ.hint && (
                      <div className="mt-4 text-[14.6px] text-[#497964]">{currentQ.hint}</div>
                    )}

                    <div className="mt-9 flex flex-col gap-3.5 max-w-[600px]">
                      {currentQ.answers.map((a, i) => {
                        const key = `${qIndex}-${i}`
                        const isWrong = wrongId === key
                        const isGood = goodFlash === key
                        return (
                          <motion.button
                            key={key}
                            onClick={() => handleAnswer(a.correct, key)}
                            disabled={!!goodFlash}
                            animate={
                              isWrong
                                ? { x: [0, -6, 6, -4, 4, 0], backgroundColor: ["#fff", "#ffeaea", "#ffeaea", "#fff"] }
                                : isGood
                                  ? { scale: [1, 1.012, 1], backgroundColor: ["#ffffff", "#e7ffee", "#e7ffee"] }
                                  : { x: 0 }
                            }
                            transition={{ duration: isWrong ? 0.56 : 0.44, ease: [0.22,1,0.36,1] }}
                            className={`group w-full text-left rounded-[18px] border px-5 sm:px-6 py-[18px] sm:py-[19px] backdrop-blur shadow-[0_10px_32px_rgba(28,72,52,.075)] transition
                              ${isGood ? "border-[#9bdcb8] ring-1 ring-[#a8e8c4] bg-[#f2fff7]" : ""}
                              ${isWrong ? "border-[#ffc7c7] ring-1 ring-[#ffc7c7] bg-white" : ""}
                              ${!isGood && !isWrong ? "border-[#cfe6d7] bg-white/92 hover:border-[#b8dcca] hover:shadow-[0_16px_42px_rgba(28,72,52,.11)]" : ""}
                              ${goodFlash ? "cursor-default" : ""}
                            `}
                          >
                            <div className="flex items-center justify-between gap-4">
                              <span className={`text-[17.4px] sm:text-[18.5px] tracking-[-0.011em] ${isWrong ? "text-[#b73b3b]" : isGood ? "text-[#165b3b]" : "text-[#1a3b2c]"}`}>
                                {a.text}
                              </span>
                              <span className={`text-[11px] tracking-wider transition ${isWrong ? "text-[#ce5858] opacity-100" : isGood ? "text-[#2d8e62] opacity-100" : "text-[#6c9782] opacity-70 group-hover:opacity-100"}`}>
                                {isWrong ? "мм, мимо ♡" : isGood ? "верно! →" : "выбрать"}
                              </span>
                            </div>
                            {isWrong && (
                              <div className="pt-1.5 text-[12.7px] text-[#c44b4b]">
                                Ответ был неправильный, попробуй ещё.
                              </div>
                            )}
                            {isGood && (
                              <div className="pt-1.5 text-[12.7px] text-[#2a875c]">
                                Точно! Иду дальше…
                              </div>
                            )}
                          </motion.button>
                        )
                      })}
                    </div>

                    <div className="mt-7 text-[12.8px] text-[#5b8570]">
                      Не волнуйся, ошибаться можно. Я подожду.
                    </div>
                  </div>

                  {/* Right info */}
                  <div className="lg:col-span-5">
                    <div className="lg:sticky lg:top-[114px]">
                      <div className="rounded-[26px] border border-[#c9e4d3] bg-[#f8fffa]/87 p-6 md:p-7 shadow-[0_18px_52px_rgba(30,78,57,.09)]">
                        <div className="text-[11px] tracking-[0.17em] text-[#55836c]">ПРОГРЕСС</div>
                        <div className="mt-2.5 h-[7px] rounded-full bg-[#d9f0e2] overflow-hidden">
                          <motion.div
                            initial={false}
                            animate={{ width: `${(answeredCount/QUESTIONS.length)*100}%` }}
                            className="h-full bg-[#2a6148]"
                            transition={{ duration: .45 }}
                          />
                        </div>
                        <div className="mt-2 text-[12.7px] text-[#518068]">{answeredCount} из {QUESTIONS.length} отвечено</div>

                        <div className="mt-6 text-[14.8px] leading-relaxed text-[#345e4a]">
                          Это маленькие якоря нашей истории. Отвечай честно.
                          Пропустить нельзя, только вместе до конца. ♡
                        </div>

                        <div className="mt-5 border-t border-[#d4eade] pt-4 text-[12.4px] text-[#608f7a] space-y-1.5">
                          <div>• Вопрос {qIndex+1} из {QUESTIONS.length}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.section>
            )}

            {page === "note" && (
              <motion.section
                key="note"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -18 }}
                transition={{ duration: .55, ease: [.21,.47,.32,.98] }}
                className="pt-14 md:pt-[80px]"
              >
                <NotePage onRestart={() => { setQIndex(0); setAnsweredCount(0); setPage("home"); window.scrollTo({top:0, behavior:"smooth"}) }} />
              </motion.section>
            )}
          </AnimatePresence>
        </main>

        <footer className="border-t border-[#cde7d6]">
          <div className="max-w-[1100px] mx-auto px-6 md:px-10 py-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-[12.3px] text-[#5b8772]">
            <div>
              Сделано с любовью • Только для Насти
            </div>
            <div className="flex items-center gap-7">
              <span>24.05</span>
              <span>Тай скоро</span>
              <span>♡</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}

function NotePage({ onRestart }: { onRestart: () => void }) {
  const [opened, setOpened] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setOpened(true), 520)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="max-w-[940px]">
      <div className="text-[11.3px] tracking-[0.18em] text-[#4d7d66]">ЗАПИСКА • PRIVATE</div>
      <h2 style={{ fontFamily: fontDisplay }} className="mt-4 text-[52px] sm:text-[74px] md:text-[84px] leading-[0.94] tracking-[-0.024em] text-[#13392b]">
        Приключения<br/>в тае.
      </h2>
      <p className="mt-5 text-[16.7px] text-[#3d6b58] max-w-[600px]">
        Ты ответила на все вопросы. Умница. Вот твоё письмо.
      </p>

      <div className="mt-14 md:mt-18 relative">
        {/* glow */}
        <div className="absolute -inset-x-10 -top-8 h-[300px] rounded-[40px] blur-[66px] opacity-80" style={{
          background: "radial-gradient(60% 60% at 50% 45%, #c9f0d9 0%, #e6faf0 58%, transparent 78%)"
        }} />

        <div className="relative mx-auto w-full max-w-[700px]">
          {/* Envelope */}
          <div className="relative rounded-[30px] border border-[#c7e5d2] bg-[#f7fffa] shadow-[0_28px_80px_rgba(30,84,60,.15)] px-5 sm:px-10 py-10 sm:py-12">
            {/* top flap - opens once */}
            <motion.div
              initial={{ rotateX: 0 }}
              animate={{ rotateX: opened ? -158 : 0 }}
              transition={{ duration: 0.98, ease: [0.22,1,0.36,1], delay: 0.15 }}
              style={{ transformOrigin: "top center", transformPerspective: 1400 }}
              className="absolute left-4 right-4 -top-[1px] h-[150px] z-20"
            >
              <div
                className="h-full w-full rounded-t-[28px] border border-[#c5e4cf]"
                style={{
                  background: "linear-gradient(180deg,#ecfaf2 0%,#d6f3e2 100%)",
                  clipPath: "polygon(0 0, 100% 0, 50% 92%)",
                }}
              />
              {/* wax seal slides away */}
              <motion.div
                initial={{ opacity: 1, y: 0 }}
                animate={{ opacity: opened ? 0 : 1, y: opened ? -12 : 0 }}
                transition={{ duration: .4, delay: opened ? 0.25 : 0 }}
                className="absolute left-1/2 top-[58px] -translate-x-1/2 h-[60px] w-[60px] rounded-full bg-[#1d3d30] text-[#daf3e5] grid place-items-center shadow-[0_8px_22px_rgba(19,48,35,.28)]"
                style={{ fontFamily: fontDisplay }}
              >
                Н
              </motion.div>
            </motion.div>

            {/* letter */}
            <motion.div
              initial={{ y: 34, opacity: 0.95 }}
              animate={{ y: opened ? -6 : 34, opacity: 1 }}
              transition={{ duration: 0.78, delay: 0.58, ease: [0.22, 1, 0.36, 1] }}
              className="relative z-10 rounded-[22px] bg-[#fffcf7] border border-[#eadfcf] shadow-[0_16px_48px_rgba(44,32,18,.07)] px-[26px] sm:px-11 py-10 sm:py-12 mt-7"
            >
              <div className="text-[11.5px] tracking-[0.16em] text-[#ac8f6d]">ДЛЯ НАСТИ</div>
              <div style={{ fontFamily: fontDisplay }} className="mt-4 text-[32px] sm:text-[40px] leading-[1.13] text-[#2d2217]">
                Приключения в тае.
              </div>

              <div className="mt-7 space-y-[18px] max-w-[560px] text-[17.6px] leading-[1.78] text-[#433222]" style={{ fontFamily: fontDisplay }}>
                <p>
                  Я желаю тебе замечательно провести время на отдыхе с семьёй, чтобы вы бесконечно веселились и проводили время вместе, я буду очень скучать и бесконечно сильно ждать твоего возвращения домой, я очень сильно переживаю и надеюсь что все будет хорошо за этот период нашей разлуки, а именно почти месяц.
                </p>
                <p>
                  За такое столь не малое время может произойти многое, например ты сможешь банально от меня отвыкнуть, от моего присутствия рядом или моих прикосновений, но это все исправимо, а самое главное это может укрепить наши отношения, ведь они закаляются когда мы будет проходить через такие трудности, самое главное быть верными друг другу и честными.
                </p>
                <p>
                  Люблю тебя очень сильно мой котёнок ❤️❤️❤️
                </p>
              </div>

              <div className="mt-9 text-[16.7px] text-[#735540]" style={{ fontFamily: fontDisplay }}>
                твой ♡
              </div>
            </motion.div>
          </div>

          <div className="mt-7 flex flex-wrap items-center justify-between gap-4 text-[13.2px] text-[#4c8067]">
            <div>Письмо уже открыто. Это навсегда твоё. ♡</div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setOpened(o => !o)}
                className="rounded-full border border-[#bbdbc8] bg-white/90 px-4 py-2 hover:bg-white transition text-[12.9px]"
              >
                {opened ? "закрыть конверт" : "открыть снова"}
              </button>
              <button onClick={onRestart} className="text-[12.8px] text-[#4f7d68] underline underline-offset-[3px] decoration-[#a6ceb8]">
                пройти снова
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="h-10" />
    </div>
  )
}
"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface OnboardingModalProps {
    onComplete: (username: string) => void;
}

const ANIME_CLASS_QUIZ = [
    {
        question: "What pulls you into an anime?",
        options: [
            { label: "Epic fights & power-ups", icon: "⚔️", type: "action" },
            { label: "Deep lore & mysteries", icon: "🌀", type: "psychological" },
            { label: "Wholesome daily life", icon: "☕", type: "sliceOfLife" },
            { label: "Romance & emotions", icon: "🌸", type: "romance" },
        ],
    },
    {
        question: "Pick your ideal Friday night anime:",
        options: [
            { label: "Dark & complex thriller", icon: "🔪", type: "psychological" },
            { label: "Fantasy adventure", icon: "🗡️", type: "fantasy" },
            { label: "Comedy with friends", icon: "😂", type: "comedy" },
            { label: "Something that wrecks me emotionally", icon: "😭", type: "drama" },
        ],
    },
];

const CLASS_FROM_TYPE: Record<string, { en: string; jp: string; emoji: string; description: string }> = {
    action: { en: "Warrior Class", jp: "戦闘型", emoji: "⚔️", description: "You live for the hype. Every battle is personal." },
    psychological: { en: "Philosopher Class", jp: "哲学型", emoji: "🌀", description: "You dissect every frame. Complexity is your fuel." },
    sliceOfLife: { en: "Slice-of-Life Enjoyer", jp: "日常型", emoji: "☕", description: "You find the extraordinary in the ordinary." },
    romance: { en: "Empath Class", jp: "感情型", emoji: "🌸", description: "You feel everything. That's your superpower." },
    fantasy: { en: "Dreamer Class", jp: "幻想型", emoji: "✨", description: "You chase worlds that don't exist yet." },
    comedy: { en: "Comedy Connoisseur", jp: "笑劇型", emoji: "😂", description: "Life's too short for cringe. You know quality laughs." },
    drama: { en: "Empath Class", jp: "感情型", emoji: "💔", description: "You feel everything. That's your superpower." },
};

export function OnboardingModal({ onComplete }: OnboardingModalProps) {
    const { user } = useAuth();
    const [step, setStep] = useState<"username" | "quiz" | "result">("username");
    const [username, setUsername] = useState(
        user?.user_metadata?.full_name?.split(" ")[0]?.toLowerCase().replace(/[^a-z0-9_]/g, "") ?? ""
    );
    const [usernameError, setUsernameError] = useState("");
    const [quizStep, setQuizStep] = useState(0);
    const [answers, setAnswers] = useState<string[]>([]);
    const [saving, setSaving] = useState(false);

    const suggestedClass = (() => {
        const counts: Record<string, number> = {};
        answers.forEach(a => { counts[a] = (counts[a] ?? 0) + 1; });
        const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "action";
        return CLASS_FROM_TYPE[top] ?? CLASS_FROM_TYPE.action;
    })();

    const validateUsername = (val: string) => {
        if (val.length < 3) return "At least 3 characters required";
        if (val.length > 20) return "Max 20 characters";
        if (!/^[a-z0-9_]+$/.test(val)) return "Only lowercase letters, numbers, underscores";
        return "";
    };

    const handleUsernameNext = () => {
        const err = validateUsername(username);
        if (err) { setUsernameError(err); return; }
        setUsernameError("");
        setStep("quiz");
    };

    const handleQuizAnswer = (type: string) => {
        const newAnswers = [...answers, type];
        setAnswers(newAnswers);
        if (quizStep < ANIME_CLASS_QUIZ.length - 1) {
            setQuizStep(q => q + 1);
        } else {
            setStep("result");
        }
    };

    const handleFinish = async () => {
        setSaving(true);
        try {
            const supabase = createClient();
            // Update user metadata with username and anime class
            await supabase.auth.updateUser({
                data: {
                    kairo_username: username,
                    kairo_class: suggestedClass.en,
                    kairo_class_jp: suggestedClass.jp,
                    onboarding_complete: true,
                },
            });
        } catch (e) {
            console.error("Failed to save onboarding", e);
        }
        setSaving(false);
        onComplete(username);
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4"
            style={{ backgroundColor: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="w-full max-w-md border-2 border-[var(--border-color)] rounded-[var(--border-radius)] overflow-hidden"
                style={{ backgroundColor: "var(--bg-card)", boxShadow: "6px 6px 0px var(--border-color)" }}
            >
                {/* Header */}
                <div className="px-6 pt-6 pb-4 border-b-2 border-[var(--border-color)]">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">カイロ</span>
                        <span className="text-xs font-mono-data px-2 py-0.5 border border-[var(--border-color)] rounded" style={{ color: "var(--text-muted)" }}>
                            ONBOARDING
                        </span>
                    </div>
                    <div className="text-xs font-mono-data" style={{ color: "var(--text-muted)" }}>
                        Step {step === "username" ? 1 : step === "quiz" ? 2 : 3} of 3
                    </div>
                    {/* Progress bar */}
                    <div className="mt-3 h-1 rounded-full overflow-hidden" style={{ backgroundColor: "var(--bg-primary)" }}>
                        <motion.div
                            className="h-full rounded-full"
                            style={{ backgroundColor: "var(--accent)" }}
                            animate={{ width: step === "username" ? "33%" : step === "quiz" ? "66%" : "100%" }}
                            transition={{ duration: 0.4 }}
                        />
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {/* STEP 1: Username */}
                    {step === "username" && (
                        <motion.div
                            key="username"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="p-6 flex flex-col gap-5"
                        >
                            <div>
                                <h2 className="text-xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>
                                    Choose your handle
                                </h2>
                                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                                    This is your Kairo identity. Choose wisely.
                                </p>
                            </div>

                            <div>
                                <div
                                    className="flex items-center gap-2 border-2 rounded-[var(--border-radius)] px-3 py-2.5 focus-within:border-[var(--accent)] transition-colors"
                                    style={{ borderColor: usernameError ? "#DC2626" : "var(--border-color)", backgroundColor: "var(--bg-primary)" }}
                                >
                                    <span className="text-sm font-mono-data" style={{ color: "var(--text-muted)" }}>@</span>
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={e => {
                                            setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""));
                                            setUsernameError("");
                                        }}
                                        onKeyDown={e => e.key === "Enter" && handleUsernameNext()}
                                        placeholder="your_handle"
                                        maxLength={20}
                                        className="flex-1 bg-transparent text-sm font-mono-data outline-none"
                                        style={{ color: "var(--text-primary)" }}
                                        autoFocus
                                    />
                                    <span className="text-xs font-mono-data" style={{ color: "var(--text-muted)" }}>
                                        {username.length}/20
                                    </span>
                                </div>
                                {usernameError && (
                                    <p className="text-xs mt-1.5 font-mono-data" style={{ color: "#DC2626" }}>{usernameError}</p>
                                )}
                            </div>

                            <button
                                onClick={handleUsernameNext}
                                disabled={!username}
                                className="w-full py-2.5 font-bold text-sm border-2 border-[var(--border-color)] rounded-[var(--border-radius)] cursor-pointer hover:opacity-80 transition-opacity disabled:opacity-40"
                                style={{ backgroundColor: "var(--text-primary)", color: "var(--bg-card)", boxShadow: "3px 3px 0px var(--border-color)" }}
                            >
                                Continue →
                            </button>
                        </motion.div>
                    )}

                    {/* STEP 2: Quiz */}
                    {step === "quiz" && (
                        <motion.div
                            key={`quiz-${quizStep}`}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="p-6 flex flex-col gap-5"
                        >
                            <div>
                                <h2 className="text-xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>
                                    {ANIME_CLASS_QUIZ[quizStep].question}
                                </h2>
                                <p className="text-xs font-mono-data" style={{ color: "var(--text-muted)" }}>
                                    Question {quizStep + 1} of {ANIME_CLASS_QUIZ.length} · Determines your Viewer Class
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                {ANIME_CLASS_QUIZ[quizStep].options.map(opt => (
                                    <button
                                        key={opt.type}
                                        onClick={() => handleQuizAnswer(opt.type)}
                                        className="flex flex-col items-start gap-2 p-4 border-2 rounded-[var(--border-radius)] cursor-pointer hover:border-[var(--accent)] hover:opacity-90 transition-all text-left"
                                        style={{ borderColor: "var(--border-color)", backgroundColor: "var(--bg-primary)" }}
                                    >
                                        <span className="text-2xl">{opt.icon}</span>
                                        <span className="text-xs font-semibold leading-tight" style={{ color: "var(--text-primary)" }}>
                                            {opt.label}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 3: Result */}
                    {step === "result" && (
                        <motion.div
                            key="result"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="p-6 flex flex-col gap-5 items-center text-center"
                        >
                            <motion.div
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                                className="text-5xl"
                            >
                                {suggestedClass.emoji}
                            </motion.div>
                            <div>
                                <p className="text-xs font-mono-data mb-2" style={{ color: "var(--text-muted)" }}>
                                    YOUR ANIME CLASS
                                </p>
                                <h2 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
                                    {suggestedClass.en}
                                </h2>
                                <p className="text-lg font-jp mt-0.5" style={{ color: "var(--accent)" }}>
                                    {suggestedClass.jp}
                                </p>
                            </div>
                            <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
                                {suggestedClass.description}
                            </p>

                            <div className="w-full p-3 border-2 rounded-[var(--border-radius)] text-left"
                                style={{ borderColor: "var(--border-color)", backgroundColor: "var(--bg-primary)" }}>
                                <div className="text-xs font-mono-data mb-1" style={{ color: "var(--text-muted)" }}>WELCOME,</div>
                                <div className="text-lg font-bold font-mono-data" style={{ color: "var(--text-primary)" }}>@{username}</div>
                            </div>

                            <button
                                onClick={handleFinish}
                                disabled={saving}
                                className="w-full py-2.5 font-bold text-sm border-2 border-[var(--border-color)] rounded-[var(--border-radius)] cursor-pointer hover:opacity-80 transition-opacity disabled:opacity-40"
                                style={{ backgroundColor: "var(--accent)", color: "var(--bg-card)", boxShadow: "3px 3px 0px var(--border-color)" }}
                            >
                                {saving ? "Saving..." : "Enter Kairo →"}
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}
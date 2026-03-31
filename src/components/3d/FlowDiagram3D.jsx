import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Upload, Sparkles, CheckCircle } from "lucide-react";
import { useTranslation } from 'react-i18next';

function FlowStep({ icon, title, subtitle, color, delay, index }) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, amount: 0.5 });

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
            transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
            className="relative group"
        >
            {/* Glassmorphism Card */}
            <div
                className="relative p-8 rounded-3xl backdrop-blur-xl border-2 transition-all duration-500 group-hover:scale-105 group-hover:shadow-2xl bg-card/50"
                style={{
                    borderColor: `${color}40`,
                    boxShadow: `0 8px 32px rgba(0,0,0,0.2), 0 0 80px ${color}20`,
                }}
            >
                {/* Glow Effect */}
                <div
                    className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl -z-10"
                    style={{
                        background: `radial-gradient(circle at center, ${color}40, transparent 70%)`,
                    }}
                />

                {/* Icon Container */}
                <div
                    className="w-24 h-24 mx-auto mb-6 rounded-2xl flex items-center justify-center relative overflow-hidden"
                    style={{
                        background: `linear-gradient(135deg, ${color}20, ${color}10)`,
                        boxShadow: `0 4px 24px ${color}30`,
                    }}
                >
                    {/* Animated Background */}
                    <div
                        className="absolute inset-0 opacity-30 animate-pulse"
                        style={{
                            background: `radial-gradient(circle at 30% 30%, ${color}60, transparent)`,
                        }}
                    />

                    {/* Icon */}
                    <div className="relative z-10" style={{ color }}>
                        {icon}
                    </div>
                </div>

                {/* Title */}
                <h3 className="text-2xl font-black text-foreground mb-2 text-center font-heading">
                    {title}
                </h3>

                {/* Subtitle */}
                <p className="text-muted-foreground text-center text-sm">
                    {subtitle}
                </p>

                {/* Step Number */}
                <div
                    className="absolute -top-4 -right-4 w-12 h-12 rounded-full flex items-center justify-center text-white font-black text-lg"
                    style={{
                        background: `linear-gradient(135deg, ${color}, ${color}80)`,
                        boxShadow: `0 4px 16px ${color}40`,
                    }}
                >
                    {index + 1}
                </div>
            </div>
        </motion.div>
    );
}

export default function FlowDiagram3D() {
    const { t } = useTranslation();

    const steps = [
        {
            icon: <Upload size={48} strokeWidth={2.5} />,
            title: t('components.flow.step1.title', "Upload"),
            subtitle: t('components.flow.step1.subtitle', "Dokumente hochladen"),
            color: "#10b981", // Emerald
        },
        {
            icon: <Sparkles size={48} strokeWidth={2.5} />,
            title: t('components.flow.step2.title', "KI-Analyse"),
            subtitle: t('components.flow.step2.subtitle', "Automatische Prüfung"),
            color: "#14b8a6", // Teal
        },
        {
            icon: <CheckCircle size={48} strokeWidth={2.5} />,
            title: t('components.flow.step3.title', "Bewilligt"),
            subtitle: t('components.flow.step3.subtitle', "Geld erhalten"),
            color: "#06b6d4", // Cyan
        },
    ];

    return (
        <div className="relative py-12">
            {/* Content */}
            <div className="relative z-10 max-w-7xl mx-auto px-6">
                {/* Steps Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 relative">
                    {steps.map((step, index) => (
                        <div key={index} className="relative">
                            <FlowStep
                                {...step}
                                delay={index * 0.2}
                                index={index}
                            />

                            {/* Arrow Between Steps (Desktop) */}
                            {index < steps.length - 1 && (
                                <div className="hidden md:block absolute top-1/2 -right-6 transform -translate-y-1/2 z-20">
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{
                                            duration: 1,
                                            delay: index * 0.2 + 0.5,
                                            repeat: Infinity,
                                            repeatType: "reverse",
                                        }}
                                    >
                                        <svg
                                            width="48"
                                            height="48"
                                            viewBox="0 0 48 48"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                d="M8 24H40M40 24L32 16M40 24L32 32"
                                                stroke="url(#arrow-gradient)"
                                                strokeWidth="3"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                            <defs>
                                                <linearGradient
                                                    id="arrow-gradient"
                                                    x1="8"
                                                    y1="24"
                                                    x2="40"
                                                    y2="24"
                                                >
                                                    <stop offset="0%" stopColor="#10b981" />
                                                    <stop offset="100%" stopColor="#14b8a6" />
                                                </linearGradient>
                                            </defs>
                                        </svg>
                                    </motion.div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Bottom Tagline */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.8 }}
                    className="text-center mt-16"
                >
                    <p className="text-xl text-muted-foreground">
                        <span className="text-primary font-bold">{t('components.flow.tagline.auto', 'Automatisch.')}</span>{" "}
                        <span className="text-teal-500 font-bold">{t('components.flow.tagline.secure', 'Sicher.')}</span>{" "}
                        <span className="text-foreground font-bold">{t('components.flow.tagline.time', 'In 3 Minuten.')}</span>
                    </p>
                </motion.div>
            </div>
        </div>
    );
}

/**
 * GradientBackground - Lightweight alternative to video backgrounds
 * Uses pure CSS animations for smooth, performant backgrounds
 */
import PropTypes from 'prop-types';

export default function GradientBackground({ theme = 'default', className = '' }) {
    const gradientThemes = {
        dashboard: {
            gradient: 'from-blue-500/20 via-purple-500/20 to-indigo-500/20',
            animation: 'gradient-shift-slow',
            overlay: 'from-blue-600/10 via-transparent to-purple-600/10'
        },
        analysis: {
            gradient: 'from-emerald-500/20 via-teal-500/20 to-cyan-500/20',
            animation: 'gradient-shift-medium',
            overlay: 'from-emerald-600/10 via-transparent to-teal-600/10'
        },
        applications: {
            gradient: 'from-blue-500/20 via-cyan-500/20 to-indigo-500/20',
            animation: 'gradient-shift-slow',
            overlay: 'from-blue-600/10 via-transparent to-cyan-600/10'
        },
        upload: {
            gradient: 'from-purple-500/20 via-pink-500/20 to-orange-500/20',
            animation: 'gradient-shift-fast',
            overlay: 'from-purple-600/10 via-transparent to-pink-600/10'
        },
        invoices: {
            gradient: 'from-emerald-500/20 via-blue-500/20 to-teal-500/20',
            animation: 'gradient-shift-medium',
            overlay: 'from-emerald-600/10 via-transparent to-blue-600/10'
        },
        default: {
            gradient: 'from-slate-500/20 via-gray-500/20 to-zinc-500/20',
            animation: 'gradient-shift-slow',
            overlay: 'from-slate-600/10 via-transparent to-gray-600/10'
        }
    };

    const config = gradientThemes[theme] || gradientThemes.default;

    return (
        <div className={`fixed inset-0 z-0 overflow-hidden ${className}`}>
            {/* Animated Gradient Layer 1 */}
            <div
                className={`absolute inset-0 bg-gradient-to-br ${config.gradient} animate-${config.animation}`}
                style={{
                    filter: 'blur(80px)',
                    transform: 'scale(1.2)'
                }}
            />

            {/* Animated Gradient Layer 2 (Reverse) */}
            <div
                className={`absolute inset-0 bg-gradient-to-tl ${config.gradient} animate-${config.animation}`}
                style={{
                    filter: 'blur(100px)',
                    transform: 'scale(1.3)',
                    animationDelay: '1s',
                    animationDirection: 'reverse'
                }}
            />

            {/* Radial Overlay */}
            <div className={`absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] ${config.overlay}`} />

            {/* Mesh Gradient (Ultra Premium) */}
            <div
                className="absolute inset-0 opacity-30"
                style={{
                    background: `
            radial-gradient(at 20% 30%, hsla(200, 70%, 50%, 0.3) 0px, transparent 50%),
            radial-gradient(at 80% 70%, hsla(280, 70%, 50%, 0.3) 0px, transparent 50%),
            radial-gradient(at 40% 80%, hsla(160, 70%, 50%, 0.3) 0px, transparent 50%)
          `,
                    filter: 'blur(60px)'
                }}
            />

            {/* Noise Texture */}
            <div
                className="absolute inset-0 opacity-[0.02] mix-blend-overlay"
                style={{
                    backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 400 400\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' /%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\' /%3E%3C/svg%3E")',
                    backgroundRepeat: 'repeat'
                }}
            />

            {/* CSS Animations */}
            <style>{`
        @keyframes gradient-shift-slow {
          0%, 100% { transform: translate(0%, 0%) scale(1.2); }
          25% { transform: translate(5%, 5%) scale(1.25); }
          50% { transform: translate(10%, -5%) scale(1.2); }
          75% { transform: translate(-5%, 10%) scale(1.25); }
        }

        @keyframes gradient-shift-medium {
          0%, 100% { transform: translate(0%, 0%) scale(1.2); }
          33% { transform: translate(8%, 8%) scale(1.3); }
          66% { transform: translate(-8%, -8%) scale(1.25); }
        }

        @keyframes gradient-shift-fast {
          0%, 100% { transform: translate(0%, 0%) scale(1.2); }
          50% { transform: translate(10%, 10%) scale(1.35); }
        }

        .animate-gradient-shift-slow {
          animation: gradient-shift-slow 20s ease-in-out infinite;
        }

        .animate-gradient-shift-medium {
          animation: gradient-shift-medium 15s ease-in-out infinite;
        }

        .animate-gradient-shift-fast {
          animation: gradient-shift-fast 10s ease-in-out infinite;
        }
      `}</style>
        </div>
    );
}

GradientBackground.propTypes = {
    theme: PropTypes.oneOf(['dashboard', 'analysis', 'applications', 'upload', 'invoices', 'default']),
    className: PropTypes.string
};

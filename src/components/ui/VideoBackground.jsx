import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

/**
 * VideoBackground - Ultra Premium Video Background Component
 * Supports multiple themes with optimized playback and fallback support
 */
export default function VideoBackground({
    theme = 'default',
    opacity = 0.15,
    blur = 'sm',
    overlay = true,
    className = ''
}) {
    const videoRef = useRef(null);

    // Video sources for different themes
    const videoSources = {
        // Dashboard: Dynamic Data Visualization
        dashboard: '/videos/dashboard-bg.mp4',

        // Anspruchsanalyse: Green Financial Flow
        analysis: '/videos/analysis-green-flow.mp4',

        // Anträge: Blue Document Animation
        applications: '/videos/applications-blue-docs.mp4',

        // Upload: Upload Progress Animation
        upload: '/videos/upload-particles.mp4',

        // Abrechnungen: Financial Charts
        invoices: '/videos/invoices-charts.mp4',

        // Default: Abstract Particles
        default: '/videos/abstract-particles.mp4'
    };

    const videoSource = videoSources[theme] || videoSources.default;

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        // Optimize video playback
        video.playbackRate = 0.75; // Slow motion for premium feel

        // Auto-play with error handling
        const playVideo = async () => {
            try {
                await video.play();
            } catch (error) {
                console.log('Video autoplay prevented:', error);
            }
        };

        playVideo();

        return () => {
            if (video) {
                video.pause();
            }
        };
    }, [videoSource]);

    const blurClasses = {
        none: '',
        sm: 'blur-sm',
        md: 'blur-md',
        lg: 'blur-lg',
        xl: 'blur-xl'
    };

    return (
        <div className={`fixed inset-0 z-0 overflow-hidden ${className}`}>
            {/* Video Layer */}
            <video
                ref={videoRef}
                className={`absolute inset-0 w-full h-full object-cover ${blurClasses[blur]}`}
                style={{ opacity }}
                autoPlay
                loop
                muted
                playsInline
                poster="/images/video-poster.jpg"
            >
                <source src={videoSource} type="video/mp4" />
                <source src={videoSource.replace('.mp4', '.webm')} type="video/webm" />
                {/* Fallback gradient for browsers that don't support video */}
            </video>

            {/* Gradient Overlay */}
            {overlay && (
                <div className="absolute inset-0 bg-gradient-to-br from-background/80 via-background/60 to-background/80 backdrop-blur-[1px]" />
            )}

            {/* Noise Texture Overlay */}
            <div
                className="absolute inset-0 opacity-[0.015] mix-blend-overlay"
                style={{
                    backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 400 400\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' /%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\' /%3E%3C/svg%3E")',
                    backgroundRepeat: 'repeat'
                }}
            />
        </div>
    );
}

VideoBackground.propTypes = {
    theme: PropTypes.oneOf(['dashboard', 'analysis', 'applications', 'upload', 'invoices', 'default']),
    opacity: PropTypes.number,
    blur: PropTypes.oneOf(['none', 'sm', 'md', 'lg', 'xl']),
    overlay: PropTypes.bool,
    className: PropTypes.string
};

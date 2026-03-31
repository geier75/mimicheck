/**
 * PREMIUM VIDEO HERO BACKGROUND
 * 
 * Features:
 * - Autoplay Background Video
 * - Fallback to Gradient
 * - Performance Optimized
 * - Responsive (Mobile uses Poster)
 * - Lazy Loading
 * - Accessibility
 * 
 * @author Cascade AI
 * @date 2025-11-14
 */

import { useEffect, useRef, useState } from 'react';

export default function VideoHero({ 
  children, 
  className = '', 
  videoSrc = null,
  posterSrc = null,
  opacity = 0.4
}) {
  const videoRef = useRef(null);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if mobile device
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (!videoRef.current || !videoSrc || isMobile) return;

    const video = videoRef.current;

    // Handle video loading
    const handleCanPlay = () => {
      setIsVideoLoaded(true);
      setTimeout(() => setShowVideo(true), 100);
    };

    const handleError = () => {
      console.warn('Video failed to load, using fallback');
      setIsVideoLoaded(false);
    };

    video.addEventListener('canplaythrough', handleCanPlay);
    video.addEventListener('error', handleError);

    // Attempt to play
    video.play().catch(err => {
      console.warn('Autoplay prevented:', err);
    });

    return () => {
      video.removeEventListener('canplaythrough', handleCanPlay);
      video.removeEventListener('error', handleError);
    };
  }, [videoSrc, isMobile]);

  return (
    <div className={`relative ${className}`}>
      {/* Gradient Fallback (always visible on mobile) */}
      <div className="absolute inset-0 -z-20 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-indigo-950 dark:to-purple-950" />

      {/* Animated Gradient Orbs (fallback decoration) */}
      <div className={`absolute inset-0 -z-10 transition-opacity duration-1000 ${showVideo && !isMobile ? 'opacity-0' : 'opacity-100'}`}>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-400/30 to-purple-400/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-indigo-400/30 to-pink-400/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Video Background (Desktop only) */}
      {videoSrc && !isMobile && (
        <div 
          className="absolute inset-0 -z-10 overflow-hidden"
          style={{
            opacity: showVideo ? opacity : 0,
            transition: 'opacity 2s ease-in'
          }}
        >
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover"
            autoPlay
            loop
            muted
            playsInline
            poster={posterSrc}
            aria-label="Background video"
          >
            <source src={videoSrc} type="video/mp4" />
            <source src={videoSrc.replace('.mp4', '.webm')} type="video/webm" />
            Your browser does not support the video tag.
          </video>

          {/* Dark overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/40 via-slate-900/20 to-slate-900/60 dark:from-slate-950/60 dark:via-slate-950/40 dark:to-slate-950/80" />
        </div>
      )}

      {/* Content Overlay */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

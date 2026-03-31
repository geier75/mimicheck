import { useEffect, useRef } from 'react';

/**
 * UploadAnimation - Professional Data Transfer Background
 * Theme: Secure Data Upload (Violet/Pink)
 * - Upward moving particles representing data upload
 * - Professional color palette (Violet/Indigo with Pink accents)
 * - Minimalist design
 */
export default function UploadAnimation({ className = '' }) {
    const canvasRef = useRef(null);
    const animationRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let width = window.innerWidth;
        let height = window.innerHeight;

        const resizeCanvas = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
        };
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // Upload Particle
        class UploadParticle {
            constructor() {
                this.reset();
            }

            reset() {
                this.x = Math.random() * width;
                this.y = height + Math.random() * 100;
                this.vy = -(Math.random() * 0.5 + 0.2); // Upward movement
                this.vx = (Math.random() - 0.5) * 0.1;
                this.size = Math.random() * 1.5 + 0.5;

                // Professional Palette:
                // 80% Violet/Indigo (Secure)
                // 20% Pink (Modern)
                const isAccent = Math.random() > 0.8;
                if (isAccent) {
                    this.color = `hsla(320, 70%, 60%, ${Math.random() * 0.3 + 0.1})`; // Pink
                } else {
                    this.color = `hsla(260, 60%, 55%, ${Math.random() * 0.3 + 0.1})`; // Violet
                }
            }

            update() {
                this.y += this.vy;
                this.x += this.vx;

                if (this.y < -10) this.reset();
            }

            draw(ctx) {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = this.color;
                ctx.fill();
            }
        }

        const particles = Array.from({ length: 80 }, () => new UploadParticle());

        const animate = () => {
            ctx.clearRect(0, 0, width, height);

            // Ultra-subtle gradient background
            const gradient = ctx.createLinearGradient(0, 0, width, height);
            gradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);

            particles.forEach(p => {
                p.update();
                p.draw(ctx);
            });

            // Vertical connections (representing upload streams)
            ctx.lineWidth = 0.5;
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    // Connect only if close and vertically aligned
                    if (dist < 100 && Math.abs(dx) < 30) {
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);

                        const gradient = ctx.createLinearGradient(particles[i].x, particles[i].y, particles[j].x, particles[j].y);
                        gradient.addColorStop(0, particles[i].color);
                        gradient.addColorStop(1, particles[j].color);

                        ctx.strokeStyle = gradient;
                        ctx.globalAlpha = (1 - dist / 100) * 0.15;
                        ctx.stroke();
                        ctx.globalAlpha = 1;
                    }
                }
            }

            animationRef.current = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className={`w-full h-full block ${className}`}
            style={{ opacity: 0.6 }}
        />
    );
}

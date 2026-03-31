import { useEffect, useRef } from 'react';

/**
 * DashboardAnimation - Professional Data Intelligence Background
 * Theme: Serious Data Analytics (Blue/Purple)
 * - Subtle network connections representing data points
 * - Professional color palette (Blue/Indigo with Purple accents)
 * - Minimalist design, no distracting floating charts
 */
export default function DashboardAnimation({ className = '' }) {
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

        // Professional Network Node (Blue Theme)
        class NetworkNode {
            constructor() {
                this.reset();
            }

            reset() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.vx = (Math.random() - 0.5) * 0.2; // Very slow movement
                this.vy = (Math.random() - 0.5) * 0.2;
                this.size = Math.random() * 1.5 + 0.5;

                // Professional Palette:
                // 80% Blue/Indigo (Trust/Tech)
                // 20% Purple (Innovation)
                const isAccent = Math.random() > 0.8;
                if (isAccent) {
                    this.color = `hsla(270, 70%, 60%, ${Math.random() * 0.3 + 0.1})`; // Purple
                } else {
                    this.color = `hsla(220, 80%, 55%, ${Math.random() * 0.3 + 0.1})`; // Blue
                }
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;

                if (this.x < 0 || this.x > width) this.vx *= -1;
                if (this.y < 0 || this.y > height) this.vy *= -1;
            }

            draw(ctx) {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = this.color;
                ctx.fill();
            }
        }

        const nodes = Array.from({ length: 70 }, () => new NetworkNode());

        const animate = () => {
            ctx.clearRect(0, 0, width, height);

            // Ultra-subtle gradient background
            const gradient = ctx.createLinearGradient(0, 0, width, height);
            gradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);

            nodes.forEach(node => {
                node.update();
                node.draw(ctx);
            });

            ctx.lineWidth = 0.5;
            for (let i = 0; i < nodes.length; i++) {
                for (let j = i + 1; j < nodes.length; j++) {
                    const dx = nodes[i].x - nodes[j].x;
                    const dy = nodes[i].y - nodes[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < 120) {
                        ctx.beginPath();
                        ctx.moveTo(nodes[i].x, nodes[i].y);
                        ctx.lineTo(nodes[j].x, nodes[j].y);

                        const gradient = ctx.createLinearGradient(nodes[i].x, nodes[i].y, nodes[j].x, nodes[j].y);
                        gradient.addColorStop(0, nodes[i].color);
                        gradient.addColorStop(1, nodes[j].color);

                        ctx.strokeStyle = gradient;
                        ctx.globalAlpha = (1 - dist / 120) * 0.15;
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

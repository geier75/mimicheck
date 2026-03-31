import { useEffect, useRef } from 'react';

/**
 * AnalysisAnimation - Interactive DACH Premium Background
 * Theme: "Living Bureaucracy" - Serious but responsive
 * - Particles connect to mouse cursor (Interactive)
 * - AOK-inspired Fresh Green + Warm Orange accents
 * - Smooth, organic movement
 */
export default function AnalysisAnimation({ className = '' }) {
    const canvasRef = useRef(null);
    const animationRef = useRef(null);
    const mouseRef = useRef({ x: 0, y: 0 });

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

        // Mouse Interaction
        const handleMouseMove = (e) => {
            const rect = canvas.getBoundingClientRect();
            mouseRef.current = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };
        };
        window.addEventListener('mousemove', handleMouseMove);

        // Professional Network Node
        class NetworkNode {
            constructor() {
                this.reset();
            }

            reset() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.vx = (Math.random() - 0.5) * 0.2;
                this.vy = (Math.random() - 0.5) * 0.2;
                this.size = Math.random() * 1.5 + 0.5;

                // DACH Premium Palette:
                // Fresh "AOK" Green (Health/Growth) + Warm "Service" Orange
                const isAccent = Math.random() > 0.85;
                if (isAccent) {
                    this.color = `hsla(30, 90%, 55%, ${Math.random() * 0.4 + 0.2})`; // Warm Orange
                } else {
                    this.color = `hsla(150, 80%, 40%, ${Math.random() * 0.3 + 0.1})`; // Fresh Green
                }
                this.baseX = this.x;
                this.baseY = this.y;
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;

                // Mouse Interaction: Move slightly away from mouse
                const dx = mouseRef.current.x - this.x;
                const dy = mouseRef.current.y - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const maxDistance = 200;

                if (distance < maxDistance) {
                    const forceDirectionX = dx / distance;
                    const forceDirectionY = dy / distance;
                    const force = (maxDistance - distance) / maxDistance;
                    const directionX = forceDirectionX * force * 2; // Repel strength
                    const directionY = forceDirectionY * force * 2;

                    this.x -= directionX;
                    this.y -= directionY;
                }

                // Bounce off edges
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

        const nodes = Array.from({ length: 100 }, () => new NetworkNode());

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

            // Draw connections
            ctx.lineWidth = 0.5;

            // 1. Connect nodes to each other
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

                // 2. Connect nodes to mouse
                const dx = mouseRef.current.x - nodes[i].x;
                const dy = mouseRef.current.y - nodes[i].y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 250) {
                    ctx.beginPath();
                    ctx.moveTo(nodes[i].x, nodes[i].y);
                    ctx.lineTo(mouseRef.current.x, mouseRef.current.y);
                    ctx.strokeStyle = 'rgba(16, 185, 129, 0.2)'; // Green connection to mouse
                    ctx.globalAlpha = (1 - dist / 250) * 0.3;
                    ctx.stroke();
                    ctx.globalAlpha = 1;
                }
            }

            animationRef.current = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            window.removeEventListener('mousemove', handleMouseMove);
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className={`w-full h-full block ${className}`}
            style={{ opacity: 0.7 }}
        />
    );
}

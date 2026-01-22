import React, { useEffect, useRef, useCallback } from 'react';

// Supply chain node locations (approximate x,y percentages on map)
const supplyChainNodes = [
    { id: 1, name: 'Shanghai', x: 82, y: 42, type: 'manufacturing' },
    { id: 2, name: 'Mumbai', x: 68, y: 48, type: 'sourcing' },
    { id: 3, name: 'Dhaka', x: 73, y: 45, type: 'manufacturing' },
    { id: 4, name: 'Ho Chi Minh', x: 77, y: 52, type: 'manufacturing' },
    { id: 5, name: 'Istanbul', x: 55, y: 38, type: 'distribution' },
    { id: 6, name: 'Rotterdam', x: 48, y: 30, type: 'distribution' },
    { id: 7, name: 'Los Angeles', x: 15, y: 40, type: 'distribution' },
    { id: 8, name: 'New York', x: 25, y: 38, type: 'distribution' },
    { id: 9, name: 'São Paulo', x: 30, y: 68, type: 'sourcing' },
    { id: 10, name: 'Cairo', x: 55, y: 45, type: 'sourcing' },
    { id: 11, name: 'Nairobi', x: 57, y: 58, type: 'sourcing' },
    { id: 12, name: 'Singapore', x: 77, y: 58, type: 'distribution' },
    { id: 13, name: 'Tokyo', x: 88, y: 38, type: 'distribution' },
    { id: 14, name: 'Sydney', x: 90, y: 72, type: 'distribution' },
    { id: 15, name: 'London', x: 47, y: 30, type: 'distribution' },
    { id: 16, name: 'Dubai', x: 62, y: 46, type: 'distribution' },
];

// Connections between nodes (textile supply chain routes)
const connections = [
    { from: 1, to: 7 }, { from: 1, to: 8 }, { from: 1, to: 6 },
    { from: 2, to: 6 }, { from: 2, to: 16 }, { from: 2, to: 1 },
    { from: 3, to: 6 }, { from: 3, to: 15 }, { from: 3, to: 1 },
    { from: 4, to: 7 }, { from: 4, to: 12 }, { from: 4, to: 1 },
    { from: 5, to: 6 }, { from: 5, to: 15 },
    { from: 9, to: 8 }, { from: 9, to: 6 },
    { from: 10, to: 5 }, { from: 10, to: 16 },
    { from: 11, to: 16 }, { from: 11, to: 6 },
    { from: 12, to: 13 }, { from: 12, to: 14 },
    { from: 6, to: 15 }, { from: 6, to: 8 },
    { from: 16, to: 6 }, { from: 16, to: 12 },
];

export const WorldMap = ({ className = '' }) => {
    const canvasRef = useRef(null);
    const animationRef = useRef(null);
    const particlesRef = useRef([]);
    const timeRef = useRef(0);

    const getNodeColor = useCallback((type) => {
        switch (type) {
            case 'manufacturing': return { r: 74, g: 179, b: 126 }; // Green
            case 'sourcing': return { r: 56, g: 163, b: 165 }; // Teal
            case 'distribution': return { r: 74, g: 126, b: 179 }; // Blue
            default: return { r: 74, g: 179, b: 126 };
        }
    }, []);

    const initParticles = useCallback((canvas) => {
        const particles = [];
        connections.forEach((conn, index) => {
            const fromNode = supplyChainNodes.find(n => n.id === conn.from);
            const toNode = supplyChainNodes.find(n => n.id === conn.to);
            if (fromNode && toNode) {
                particles.push({
                    id: index,
                    fromX: (fromNode.x / 100) * canvas.width,
                    fromY: (fromNode.y / 100) * canvas.height,
                    toX: (toNode.x / 100) * canvas.width,
                    toY: (toNode.y / 100) * canvas.height,
                    progress: Math.random(),
                    speed: 0.001 + Math.random() * 0.002,
                    color: getNodeColor(fromNode.type),
                });
            }
        });
        return particles;
    }, [getNodeColor]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const resizeCanvas = () => {
            canvas.width = canvas.offsetWidth * window.devicePixelRatio;
            canvas.height = canvas.offsetHeight * window.devicePixelRatio;
            ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
            particlesRef.current = initParticles(canvas);
        };

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        const draw = () => {
            const width = canvas.offsetWidth;
            const height = canvas.offsetHeight;
            
            ctx.clearRect(0, 0, width, height);
            
            // Draw connections with gradient
            connections.forEach((conn) => {
                const fromNode = supplyChainNodes.find(n => n.id === conn.from);
                const toNode = supplyChainNodes.find(n => n.id === conn.to);
                if (!fromNode || !toNode) return;

                const fromX = (fromNode.x / 100) * width;
                const fromY = (fromNode.y / 100) * height;
                const toX = (toNode.x / 100) * width;
                const toY = (toNode.y / 100) * height;

                // Curved connection line
                const midX = (fromX + toX) / 2;
                const midY = (fromY + toY) / 2 - Math.abs(toX - fromX) * 0.15;

                ctx.beginPath();
                ctx.moveTo(fromX, fromY);
                ctx.quadraticCurveTo(midX, midY, toX, toY);
                
                const gradient = ctx.createLinearGradient(fromX, fromY, toX, toY);
                gradient.addColorStop(0, 'rgba(74, 179, 126, 0.1)');
                gradient.addColorStop(0.5, 'rgba(56, 163, 165, 0.2)');
                gradient.addColorStop(1, 'rgba(74, 126, 179, 0.1)');
                
                ctx.strokeStyle = gradient;
                ctx.lineWidth = 1;
                ctx.stroke();
            });

            // Draw and animate particles along paths
            particlesRef.current.forEach((particle) => {
                particle.progress += particle.speed;
                if (particle.progress > 1) particle.progress = 0;

                const t = particle.progress;
                const fromNode = supplyChainNodes.find(n => n.id === connections[particle.id]?.from);
                const toNode = supplyChainNodes.find(n => n.id === connections[particle.id]?.to);
                
                if (!fromNode || !toNode) return;

                const fromX = (fromNode.x / 100) * width;
                const fromY = (fromNode.y / 100) * height;
                const toX = (toNode.x / 100) * width;
                const toY = (toNode.y / 100) * height;
                const midX = (fromX + toX) / 2;
                const midY = (fromY + toY) / 2 - Math.abs(toX - fromX) * 0.15;

                // Quadratic bezier curve position
                const x = Math.pow(1 - t, 2) * fromX + 2 * (1 - t) * t * midX + Math.pow(t, 2) * toX;
                const y = Math.pow(1 - t, 2) * fromY + 2 * (1 - t) * t * midY + Math.pow(t, 2) * toY;

                // Draw particle with glow
                const glow = ctx.createRadialGradient(x, y, 0, x, y, 8);
                glow.addColorStop(0, `rgba(${particle.color.r}, ${particle.color.g}, ${particle.color.b}, 0.8)`);
                glow.addColorStop(1, `rgba(${particle.color.r}, ${particle.color.g}, ${particle.color.b}, 0)`);
                
                ctx.beginPath();
                ctx.arc(x, y, 8, 0, Math.PI * 2);
                ctx.fillStyle = glow;
                ctx.fill();

                ctx.beginPath();
                ctx.arc(x, y, 2, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${particle.color.r}, ${particle.color.g}, ${particle.color.b}, 1)`;
                ctx.fill();
            });

            // Draw nodes with pulsing effect
            timeRef.current += 0.02;
            supplyChainNodes.forEach((node, index) => {
                const x = (node.x / 100) * width;
                const y = (node.y / 100) * height;
                const color = getNodeColor(node.type);
                
                // Pulse animation with staggered timing
                const pulsePhase = timeRef.current + index * 0.3;
                const pulseScale = 1 + Math.sin(pulsePhase) * 0.3;
                const pulseOpacity = 0.3 + Math.sin(pulsePhase) * 0.2;

                // Outer glow
                const outerGlow = ctx.createRadialGradient(x, y, 0, x, y, 20 * pulseScale);
                outerGlow.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, ${pulseOpacity})`);
                outerGlow.addColorStop(1, `rgba(${color.r}, ${color.g}, ${color.b}, 0)`);
                
                ctx.beginPath();
                ctx.arc(x, y, 20 * pulseScale, 0, Math.PI * 2);
                ctx.fillStyle = outerGlow;
                ctx.fill();

                // Inner node
                const innerGlow = ctx.createRadialGradient(x, y, 0, x, y, 6);
                innerGlow.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, 1)`);
                innerGlow.addColorStop(0.5, `rgba(${color.r}, ${color.g}, ${color.b}, 0.8)`);
                innerGlow.addColorStop(1, `rgba(${color.r}, ${color.g}, ${color.b}, 0.4)`);

                ctx.beginPath();
                ctx.arc(x, y, 6, 0, Math.PI * 2);
                ctx.fillStyle = innerGlow;
                ctx.fill();

                // Core dot
                ctx.beginPath();
                ctx.arc(x, y, 3, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, 0.9)`;
                ctx.fill();
            });

            animationRef.current = requestAnimationFrame(draw);
        };

        draw();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [initParticles, getNodeColor]);

    return (
        <canvas
            ref={canvasRef}
            className={`absolute inset-0 w-full h-full ${className}`}
            style={{ opacity: 0.8 }}
        />
    );
};

export default WorldMap;

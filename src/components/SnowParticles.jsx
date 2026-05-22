import { useEffect } from "react";

export default function SnowParticles() {
  useEffect(() => {
    const canvas = document.getElementById("snow-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let W = window.innerWidth, H = window.innerHeight;
    canvas.width = W; canvas.height = H;

    const FLAKES = 90;
    const flakes = Array.from({ length: FLAKES }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 2.5 + 0.5,
      speed: Math.random() * 0.6 + 0.2,
      drift: (Math.random() - 0.5) * 0.3,
      alpha: Math.random() * 0.5 + 0.2,
    }));

    let raf;
    function draw() {
      ctx.clearRect(0, 0, W, H);
      for (const f of flakes) {
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(186,230,253,${f.alpha})`;
        ctx.fill();
        f.y += f.speed;
        f.x += f.drift;
        if (f.y > H + 4) { f.y = -4; f.x = Math.random() * W; }
        if (f.x > W + 4) f.x = -4;
        if (f.x < -4) f.x = W + 4;
      }
      raf = requestAnimationFrame(draw);
    }
    draw();

    const onResize = () => {
      W = window.innerWidth; H = window.innerHeight;
      canvas.width = W; canvas.height = H;
    };
    window.addEventListener("resize", onResize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", onResize); };
  }, []);

  return <canvas id="snow-canvas" />;
}
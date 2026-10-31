import React, { useEffect, useRef, useState } from 'react';
import { usePlayer } from '../../context/PlayerContext.jsx';
import { Waves, Activity, BarChart2 } from 'lucide-react';

export default function VisualizerBars3D({
  barCount = 48,
  height = 48,
  className = '',
  initialMode = 'fluid',
  showControls = true,
}) {
  const canvasRef = useRef(null);
  const { isPlaying, analyserRef } = usePlayer();
  const [visualMode, setVisualMode] = useState(initialMode); // 'fluid' | 'oscilloscope' | 'spectrum'

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;
    const bufferLength = 64;
    const dataArray = new Uint8Array(bufferLength);

    let phase = 0;

    const render = () => {
      animationId = requestAnimationFrame(render);
      const w = canvas.width;
      const h = canvas.height;
      const centerY = h / 2;
      ctx.clearRect(0, 0, w, h);

      // Check real frequency/audio data if analyser is active
      let hasRealAudio = false;
      if (isPlaying && analyserRef?.current) {
        try {
          analyserRef.current.getByteFrequencyData(dataArray);
          for (let k = 0; k < 12; k++) {
            if (dataArray[k] > 0) {
              hasRealAudio = true;
              break;
            }
          }
        } catch (e) {}
      }

      phase += isPlaying ? 0.055 : 0.018;

      if (visualMode === 'fluid') {
        // --- 1. NEON FLUID DUAL-SURFACE SOUNDWAVE ---
        const resolution = 52;
        const step = w / (resolution - 1);
        const points = [];

        for (let i = 0; i < resolution; i++) {
          const x = i * step;
          let ampFactor = 0;

          if (isPlaying) {
            const freqVal = hasRealAudio ? dataArray[i % bufferLength] / 255 : 0.65;
            const sine1 = Math.sin(phase * 2.2 + i * 0.2);
            const sine2 = Math.cos(phase * 3.8 - i * 0.32) * 0.55;
            const sine3 = Math.sin(phase * 5.2 + i * 0.45) * 0.25;
            ampFactor = (sine1 + sine2 + sine3) * (h * 0.42) * (0.35 + freqVal * 0.85);
          } else {
            ampFactor = Math.sin(phase + i * 0.16) * (h * 0.09);
          }

          const edgeDist = Math.min(i, resolution - 1 - i) / (resolution * 0.18);
          const edgeWeight = Math.min(1, edgeDist);
          const y = centerY - ampFactor * edgeWeight;
          points.push({ x, y, amp: ampFactor * edgeWeight });
        }

        // Translucent ambient glow fill between upper & lower mirrored curves
        const fillGrad = ctx.createLinearGradient(0, 0, 0, h);
        fillGrad.addColorStop(0, 'rgba(0, 240, 255, 0.22)');
        fillGrad.addColorStop(0.5, 'rgba(168, 85, 247, 0.32)');
        fillGrad.addColorStop(1, 'rgba(236, 72, 153, 0.22)');

        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 0; i < points.length - 1; i++) {
          const xc = (points[i].x + points[i + 1].x) / 2;
          const yc = (points[i].y + points[i + 1].y) / 2;
          ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
        }
        ctx.lineTo(w, centerY);
        for (let i = points.length - 1; i >= 0; i--) {
          const mirY = centerY + (centerY - points[i].y);
          ctx.lineTo(points[i].x, mirY);
        }
        ctx.closePath();
        ctx.fillStyle = fillGrad;
        ctx.fill();

        // Top Neon Curve Stroke
        const strokeGrad = ctx.createLinearGradient(0, 0, w, 0);
        strokeGrad.addColorStop(0, '#00f0ff');
        strokeGrad.addColorStop(0.35, '#a855f7');
        strokeGrad.addColorStop(0.7, '#ec4899');
        strokeGrad.addColorStop(1, '#f59e0b');

        ctx.strokeStyle = strokeGrad;
        ctx.lineWidth = isPlaying ? 2.5 : 1.5;
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = isPlaying ? 12 : 4;

        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 0; i < points.length - 1; i++) {
          const xc = (points[i].x + points[i + 1].x) / 2;
          const yc = (points[i].y + points[i + 1].y) / 2;
          ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
        }
        ctx.stroke();

        // Mirrored Bottom Neon Curve Stroke
        ctx.beginPath();
        ctx.moveTo(points[0].x, centerY + (centerY - points[0].y));
        for (let i = 0; i < points.length - 1; i++) {
          const xc = (points[i].x + points[i + 1].x) / 2;
          const yc = centerY + (centerY - (points[i].y + points[i + 1].y) / 2);
          ctx.quadraticCurveTo(points[i].x, centerY + (centerY - points[i].y), xc, yc);
        }
        ctx.stroke();

        // Secondary Harmonic Ribbon (Electric Violet/Amber)
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(236, 72, 153, 0.8)';
        ctx.lineWidth = 1.4;
        ctx.shadowColor = '#ec4899';
        ctx.shadowBlur = 8;
        for (let i = 0; i < resolution; i++) {
          const x = i * step;
          const sineH = Math.sin(phase * 3.2 + i * 0.32) * (isPlaying ? h * 0.24 : h * 0.05);
          const edgeDist = Math.min(i, resolution - 1 - i) / (resolution * 0.18);
          const y = centerY + sineH * Math.min(1, edgeDist);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Baseline Glow
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
        ctx.lineWidth = 1;
        ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.moveTo(0, centerY);
        ctx.lineTo(w, centerY);
        ctx.stroke();

      } else if (visualMode === 'oscilloscope') {
        // --- 2. ELECTRIC OSCILLOSCOPE CYBER WAVE ---
        const resolution = 60;
        const step = w / (resolution - 1);

        const oscGrad = ctx.createLinearGradient(0, 0, w, 0);
        oscGrad.addColorStop(0, '#00f0ff');
        oscGrad.addColorStop(0.5, '#38bdf8');
        oscGrad.addColorStop(1, '#a855f7');

        ctx.strokeStyle = oscGrad;
        ctx.lineWidth = 2.2;
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = isPlaying ? 16 : 5;

        ctx.beginPath();
        for (let i = 0; i < resolution; i++) {
          const x = i * step;
          const freq = hasRealAudio ? dataArray[i % bufferLength] / 255 : 0.55;
          const wave = isPlaying
            ? Math.sin(phase * 4 + i * 0.28) * Math.cos(phase * 1.5 + i * 0.12) * (h * 0.44) * (0.3 + freq * 0.7)
            : Math.sin(phase * 1.5 + i * 0.2) * (h * 0.08);

          const edge = Math.min(1, Math.min(i, resolution - 1 - i) / 6);
          const y = centerY + wave * edge;

          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);

          if (isPlaying && i % 5 === 0) {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(x - 1.5, y - 1.5, 3, 3);
          }
        }
        ctx.stroke();

      } else {
        // --- 3. SPECTRUM PILL EQUALIZER ---
        const bars = 36;
        const barWidth = (w / bars) * 0.65;
        const gap = (w / bars) * 0.35;

        for (let i = 0; i < bars; i++) {
          const freq = hasRealAudio ? dataArray[i % bufferLength] / 255 : Math.sin(phase + i * 0.25) * 0.4 + 0.5;
          const amplitude = isPlaying ? Math.max(6, freq * (h * 0.88)) : Math.max(4, Math.sin(phase + i * 0.2) * 8 + 12);
          const x = i * (barWidth + gap);
          const y = centerY - amplitude / 2;

          const barGrad = ctx.createLinearGradient(0, y, 0, y + amplitude);
          barGrad.addColorStop(0, '#00f0ff');
          barGrad.addColorStop(0.5, '#a855f7');
          barGrad.addColorStop(1, '#ec4899');

          ctx.fillStyle = barGrad;
          ctx.shadowColor = '#a855f7';
          ctx.shadowBlur = isPlaying ? 8 : 2;

          ctx.beginPath();
          ctx.roundRect(x, y, barWidth, amplitude, 3);
          ctx.fill();
        }
      }
    };

    render();

    return () => cancelAnimationFrame(animationId);
  }, [isPlaying, analyserRef, visualMode]);

  return (
    <div className={`relative flex flex-col items-center group select-none ${className}`}>
      {/* Wave Canvas */}
      <canvas
        ref={canvasRef}
        width={320}
        height={height}
        className="w-full h-full cursor-pointer"
        onClick={() => {
          // Quick-cycle mode on click
          setVisualMode((m) => (m === 'fluid' ? 'oscilloscope' : m === 'oscilloscope' ? 'spectrum' : 'fluid'));
        }}
        title="Click to switch wave animation style"
      />

      {/* Mini Style Switcher Pills (Visible on Hover / Small) */}
      {showControls && (
        <div className="flex items-center gap-1 mt-1 opacity-60 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => setVisualMode('fluid')}
            className={`px-2 py-0.5 rounded-full text-[9px] font-bold flex items-center gap-1 transition-all ${
              visualMode === 'fluid'
                ? 'bg-purple-500/30 text-cyan-300 border border-purple-500/50'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
            title="Neon Fluid Wave"
          >
            <Waves className="w-2.5 h-2.5" />
            <span>Fluid</span>
          </button>
          <button
            onClick={() => setVisualMode('oscilloscope')}
            className={`px-2 py-0.5 rounded-full text-[9px] font-bold flex items-center gap-1 transition-all ${
              visualMode === 'oscilloscope'
                ? 'bg-purple-500/30 text-cyan-300 border border-purple-500/50'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
            title="Cyber Oscilloscope"
          >
            <Activity className="w-2.5 h-2.5" />
            <span>Oscilloscope</span>
          </button>
          <button
            onClick={() => setVisualMode('spectrum')}
            className={`px-2 py-0.5 rounded-full text-[9px] font-bold flex items-center gap-1 transition-all ${
              visualMode === 'spectrum'
                ? 'bg-purple-500/30 text-cyan-300 border border-purple-500/50'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
            title="Studio Spectrum"
          >
            <BarChart2 className="w-2.5 h-2.5" />
            <span>Spectrum</span>
          </button>
        </div>
      )}
    </div>
  );
}

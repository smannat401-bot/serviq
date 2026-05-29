import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface HonorScoreMeterProps {
  score: number;
  size?: number;
  strokeWidth?: number;
}

const HonorScoreMeter: React.FC<HonorScoreMeterProps> = ({
  score,
  size = 120,
  strokeWidth = 10
}) => {
  const [displayScore, setDisplayScore] = useState(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (displayScore / 100) * circumference;

  useEffect(() => {
    const timer = setTimeout(() => {
      setDisplayScore(score);
    }, 500);
    return () => clearTimeout(timer);
  }, [score]);

  const getColor = (s: number) => {
    if (s >= 90) return '#10b981'; // Emerald 500
    if (s >= 80) return '#3b82f6'; // Blue 500
    if (s >= 75) return '#f59e0b'; // Amber 500
    if (s >= 70) return '#f97316'; // Orange 500
    return '#ef4444'; // Red 500
  };

  const getLevel = (s: number) => {
    if (s >= 90) return 'Trusted';
    if (s >= 80) return 'Good';
    if (s >= 75) return 'Warning';
    if (s >= 70) return 'Critical';
    return 'Suspended';
  };

  const color = getColor(displayScore);

  return (
    <div className="relative flex flex-col items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress Circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 8px ${color}80)` }}
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold tracking-tighter" style={{ color }}>
          {Math.round(displayScore)}
        </span>
        <span className="text-[10px] uppercase font-bold opacity-50 tracking-widest -mt-1">
          Score
        </span>
      </div>

      <div
        className="absolute -bottom-6 px-3 py-0.5 rounded-full text-[10px] font-bold border"
        style={{
          backgroundColor: `${color}20`,
          borderColor: `${color}40`,
          color: color
        }}
      >
        {getLevel(score)}
      </div>
    </div>
  );
};

export default HonorScoreMeter;

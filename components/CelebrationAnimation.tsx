import React from 'react';

export const CelebrationAnimation: React.FC = () => (
  <>
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl">
      {[...Array(15)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1.5 h-1.5 bg-amber-400 rounded-full animate-confetti"
          style={{
            top: `${50 + (Math.random() - 0.5) * 40}%`,
            left: `${50 + (Math.random() - 0.5) * 40}%`,
            animationDelay: `${Math.random() * 1.5}s`,
            animationDuration: `${1 + Math.random()}s`,
          }}
        />
      ))}
    </div>
    <style>{`
      @keyframes confetti {
        0% { transform: translateY(0) scale(1.5); opacity: 1; }
        100% { transform: translateY(80px) scale(0); opacity: 0; }
      }
      .animate-confetti {
        animation: confetti ease-out forwards;
      }
    `}</style>
  </>
);

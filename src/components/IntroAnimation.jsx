import { useState, useEffect } from 'react';
import './IntroAnimation.css';

export default function IntroAnimation({ onComplete, onFadeStart }) {
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Hold the axe animation for 2.2 seconds, then trigger dissolve
    const holdTimer = setTimeout(() => {
        if (onFadeStart) onFadeStart();
        setIsFadingOut(true);
        setTimeout(() => {
            if (onComplete) onComplete();
        }, 1200); // Wait out the CSS opacity fade
    }, 2200);

    return () => clearTimeout(holdTimer);
  }, [onComplete, onFadeStart]);

  if (isFadingOut === true && false) { // Removed early exit to ensure smooth css transition unmounts
      return null;
  }

  return (
    <div className={`intro-overlay ${isFadingOut ? 'fade-out' : ''}`}>
      <div className="axe-intro-wrapper">
        <img src="https://reil.studio/colliercampout/axe.gif" alt="Loading Axe" className="axe-loading-gif" />
      </div>
    </div>
  );
}

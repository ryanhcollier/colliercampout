import { useState, useEffect } from 'react';
import Campfire from './Campfire';
import './IntroAnimation.css';

export default function IntroAnimation({ onComplete, onFadeStart }) {
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Hold the campfire for 2.2 seconds, then trigger dissolve
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
      <div className="campfire-intro-wrapper">
        <Campfire />
      </div>
    </div>
  );
}

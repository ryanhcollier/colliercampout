import { useEffect, useRef } from 'react';
import { chaptersArray } from '../data/journey';

export default function Sidebar({ activeChapterId, setActiveChapterId, onImageClick }) {
  const chapterRefs = useRef({});

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '-40% 0px -40% 0px',
      threshold: 0 // Trigger when intersecting the middle 20% of the screen
    };

    const observerCallback = (entries) => {
      // Find the currently intersecting entry (if multiple, prefer the one intersecting)
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveChapterId(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    Object.values(chapterRefs.current).forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, [setActiveChapterId]);

  return (
    <div className="sidebar" id="features">
      {chaptersArray.map((chapter) => {
        const isActive = activeChapterId === chapter.id;
        
        return (
          <section
            key={chapter.id}
            id={chapter.id}
            ref={(el) => (chapterRefs.current[chapter.id] = el)}
            className={`chapter ${isActive ? 'active' : ''}`}
            onMouseEnter={() => setActiveChapterId(chapter.id)}
          >
            {chapter.id === 'trip' && (
              <div className="wip">
                <b>TCC IS A LIVE WORK IN PROGRESS. PLEASE EXCUSE ANY ERRORS.</b>
              </div>
            )}
            
            <div className="location">
              {chapter.title}
              <div className="dates">{chapter.dates}</div>
              
              {chapter.sleepsite && (
                <div className="sleepsite">
                  <b>{chapter.sleepsite}</b>
                </div>
              )}
              
              {chapter.specs && (
                <div className="specs">{chapter.specs}</div>
              )}
              
              <div className="info">
                {chapter.description}
                {chapter.id === 'trip' && (
                  <>
                    <br />-<br />
                    <div className="special">
                      Scroll down to learn more about each stop, and click an image for a better view.
                    </div>
                  </>
                )}
              </div>
              
              {chapter.images && chapter.images.length > 0 && (
                <div className="image-gallery">
                  {chapter.images.map((img, idx) => (
                    <img 
                      key={idx}
                      src={img.thumb} 
                      alt={img.title || chapter.title} 
                      className="thumbnail-image"
                      onClick={() => onImageClick(img.src)}
                    />
                  ))}
                </div>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}

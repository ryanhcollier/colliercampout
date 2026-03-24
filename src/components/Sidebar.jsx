import { useRef, useEffect } from 'react';
import { chaptersArray } from '../data/journey';
import Campfire from './Campfire';

export default function Sidebar({ activeChapterId, setActiveChapterId, onImageClick, isReady }) {
  const sidebarRef = useRef(null);
  const chapterRefs = useRef({});

  useEffect(() => {
    const isMobile = window.innerWidth <= 768;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveChapterId(entry.target.id);
        }
      });
    }, {
      root: sidebarRef.current,
      rootMargin: isMobile ? '-5% 0px -95% 0px' : '-40% 0px -40% 0px',
      threshold: 0
    });

    Object.values(chapterRefs.current).forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [setActiveChapterId]);

  return (
    <div className={`sidebar ${!isReady ? 'hidden-right' : ''}`} id="features" ref={sidebarRef}>
      {chaptersArray.map((chapter) => {
        const isActive = activeChapterId === chapter.id;
        
        return (
          <section
            key={chapter.id}
            id={chapter.id}
            ref={(el) => (chapterRefs.current[chapter.id] = el)}
            className={`chapter ${isActive ? 'active' : ''}`}
          >
            {chapter.id === 'trip' && (
              <Campfire />
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
            </div>

            {chapter.images && chapter.images.length > 0 && (
              <div className="sidebar-gallery">
                {chapter.images.map((img, idx) => (
                  <img
                    key={idx}
                    src={img.src}
                    alt={img.title || chapter.title}
                    onClick={() => onImageClick(chapter.images, idx)}
                    loading="lazy"
                  />
                ))}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}

import { chaptersArray } from '../data/journey';

export default function JourneyTimeline({ activeChapterId }) {
  const activeIndex = chaptersArray.findIndex(c => c.id === activeChapterId);
  const total = chaptersArray.length - 1; 
  
  const percentage = activeIndex <= 0 ? 0 : (activeIndex / total) * 100;

  return (
    <div className="journey-timeline">
      <div className="timeline-track">
        <div className="timeline-fill" style={{ width: `${percentage}%` }}></div>
        <div className="timeline-marker" style={{ left: `${percentage}%` }}>
          🚘
        </div>
      </div>
    </div>
  );
}

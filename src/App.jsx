import { useState } from 'react';
import AppMap from './components/Map';
import Sidebar from './components/Sidebar';
import ImageModal from './components/ImageModal';
import JourneyTimeline from './components/JourneyTimeline';
import IntroAnimation from './components/IntroAnimation';
import { chaptersArray } from './data/journey';
import './App.css';

function App() {
  const [activeChapterId, setActiveChapterId] = useState('trip');
  const [modalData, setModalData] = useState(null); // { images: [], index: 0 }
  const [showIntro, setShowIntro] = useState(true);
  const [isSidebarReady, setIsSidebarReady] = useState(false);

  const activeChapter = chaptersArray.find(c => c.id === activeChapterId) || chaptersArray[0];

  return (
    <>
      {showIntro && (
        <IntroAnimation 
          onFadeStart={() => setIsSidebarReady(true)}
          onComplete={() => setShowIntro(false)} 
        />
      )}
      <div className="app-container">
        <AppMap activeChapterId={activeChapterId} />
      
      <Sidebar 
        activeChapterId={activeChapterId} 
        setActiveChapterId={setActiveChapterId} 
        onImageClick={(images, index) => setModalData({ images, index })}
        isReady={isSidebarReady}
      />
      
      <JourneyTimeline activeChapterId={activeChapterId} />
      
      {modalData && (
        <ImageModal 
          images={modalData.images}
          initialIndex={modalData.index}
          onClose={() => setModalData(null)} 
        />
      )}
    </div>
    </>
  );
}

export default App;

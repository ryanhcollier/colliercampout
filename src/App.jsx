import { useState } from 'react';
import AppMap from './components/Map';
import Sidebar from './components/Sidebar';
import ImageModal from './components/ImageModal';
import JourneyTimeline from './components/JourneyTimeline';
import { chaptersArray } from './data/journey';
import './App.css';

function App() {
  const [activeChapterId, setActiveChapterId] = useState('trip');
  const [modalData, setModalData] = useState(null); // { images: [], index: 0 }

  const activeChapter = chaptersArray.find(c => c.id === activeChapterId) || chaptersArray[0];

  return (
    <div className="app-container">
      <AppMap activeChapterId={activeChapterId} />
      
      <Sidebar 
        activeChapterId={activeChapterId} 
        setActiveChapterId={setActiveChapterId} 
        onImageClick={(images, index) => setModalData({ images, index })}
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
  );
}

export default App;

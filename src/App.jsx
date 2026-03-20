import { useState } from 'react';
import AppMap from './components/Map';
import Sidebar from './components/Sidebar';
import ImageModal from './components/ImageModal';
import './App.css';

function App() {
  const [activeChapterId, setActiveChapterId] = useState('trip');
  const [modalImageSrc, setModalImageSrc] = useState(null);

  return (
    <div className="app-container">
      <AppMap activeChapterId={activeChapterId} />
      <Sidebar 
        activeChapterId={activeChapterId} 
        setActiveChapterId={setActiveChapterId} 
        onImageClick={setModalImageSrc}
      />
      
      {modalImageSrc && (
        <ImageModal 
          src={modalImageSrc} 
          onClose={() => setModalImageSrc(null)} 
        />
      )}
    </div>
  );
}

export default App;

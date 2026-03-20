import { useState, useRef, useEffect } from 'react';
import Map, { Marker, Popup, NavigationControl } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { chaptersArray } from '../data/journey';
import { MapPin, Tent, BedDouble } from 'lucide-react';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || '';

const iconMap = {
  embassy: MapPin,
  campsite: Tent,
  lodging: BedDouble
};

export default function AppMap({ activeChapterId }) {
  const mapRef = useRef();
  const [popupInfo, setPopupInfo] = useState(null);

  useEffect(() => {
    if (activeChapterId && mapRef.current) {
      const chapter = chaptersArray.find(c => c.id === activeChapterId);
      if (chapter) {
        mapRef.current.flyTo({
          center: chapter.center,
          zoom: chapter.zoom,
          bearing: chapter.bearing || 0,
          pitch: chapter.pitch || 0,
          speed: chapter.speed || 0.6,
          essential: true
        });
      }
    }
  }, [activeChapterId]);

  return (
    <div className="map-container">
      <Map
        ref={mapRef}
        initialViewState={{
          longitude: -100.941,
          latitude: 39.176,
          zoom: 3.5,
          bearing: 0,
          pitch: 0
        }}
        mapStyle="mapbox://styles/rhcollier/cj27xhu8s000m2so75ow7mbgt"
        mapboxAccessToken={MAPBOX_TOKEN}
        interactiveLayerIds={['clusters']}
      >
        <NavigationControl position="top-left" />
        
        {chaptersArray.map((chapter) => {
          if (chapter.id === 'trip') return null; // Root chapter has no specific marker
          
          const IconComponent = iconMap[chapter.icon] || MapPin;
          const isActive = chapter.id === activeChapterId;
          
          return (
            <Marker
              key={chapter.id}
              longitude={chapter.center[0]}
              latitude={chapter.center[1]}
              anchor="bottom"
              onClick={e => {
                e.originalEvent.stopPropagation();
                setPopupInfo(chapter);
              }}
            >
              <div className={`map-marker ${isActive ? 'active' : ''}`}>
                <IconComponent size={isActive ? 24 : 18} />
              </div>
            </Marker>
          );
        })}

        {popupInfo && (
          <Popup
            anchor="top"
            longitude={popupInfo.center[0]}
            latitude={popupInfo.center[1]}
            onClose={() => setPopupInfo(null)}
            closeOnClick={false}
            className="custom-popup"
          >
            <div>
              <strong>{popupInfo.title}</strong>
              {popupInfo.sleepsite && <div>{popupInfo.sleepsite}</div>}
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
}

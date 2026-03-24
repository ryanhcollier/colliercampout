import { useState, useRef, useEffect, useMemo } from 'react';
import Map, { Marker, Popup, NavigationControl, Source, Layer } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { chaptersArray } from '../data/journey';
import { MapPin, Tent, BedDouble } from 'lucide-react';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || '';

const iconMap = {
  embassy: MapPin,
  campsite: Tent,
  lodging: BedDouble
};

import routeLegs from '../data/routeLegs.json';

export default function AppMap({ activeChapterId }) {
  const mapRef = useRef();
  const [popupInfo, setPopupInfo] = useState(null);
  
  const animatedCoords = useRef([]);
  const animationFrame = useRef();

  useEffect(() => {
    if (activeChapterId && mapRef.current) {
      const chapter = chaptersArray.find(c => c.id === activeChapterId);
      const activeIndex = chaptersArray.indexOf(chapter);
      
      if (chapter) {
        const isTrip = chapter.id === 'trip';
        const isFinale = activeIndex === chaptersArray.length - 1;
        
        const map = mapRef.current.getMap();
        
        // Dynamically query the Mapbox topography mesh natively prior to tearing it down for the flight
        let calculatedPitch = chapter.pitch !== undefined ? chapter.pitch : 55;
        if (chapter.pitch === undefined && map.isStyleLoaded()) {
            const actualElevation = map.queryTerrainElevation(chapter.center);
            // If the altitude exceeds 1200m (~4000ft), flatten the camera angle to highlight the physical mountains natively
            if (actualElevation && actualElevation > 1200) {
                calculatedPitch = 68;
            }
        }

        // Strip the terrain exaggeration completely to prevent altitude-tracking jitter over mountains during flight
        if (map.isStyleLoaded()) {
           map.setTerrain(null);
        }
        
        const isMobile = window.innerWidth <= 768;

        let targetZoom = chapter.zoom > 10 ? chapter.zoom - 1.5 : chapter.zoom;
        if (isFinale) {
            targetZoom = 3.2; // Zoom out to continental view natively on desktop for the finale
        }
        
        if (isMobile && (isTrip || isFinale)) {
            targetZoom = Math.max(0, targetZoom - 1.5); // Pull back camera on mobile to fit the entire US
        }

        mapRef.current.flyTo({
          center: isFinale ? chaptersArray[0].center : chapter.center,
          zoom: targetZoom, 
          pitch: (isTrip || isFinale) ? 0 : calculatedPitch, // Natively apply dynamic topographical tilt
          bearing: (isTrip || isFinale) ? 0 : (chapter.bearing || 0), 
          speed: chapter.speed || 0.45,
          curve: 1.5, // Flattened the curve to keep flights closer to the ground and smoother
          essential: true,
          padding: { right: isMobile ? 0 : window.innerWidth / 3 } // Wipe padding on mobile since the map mounts vertically
        });

        map.once('moveend', () => {
            if (map.isStyleLoaded()) {
                // Instantly pop the 3D terrain mesh back in after flight stops
                map.setTerrain({ 'source': 'mapbox-dem', 'exaggeration': 4.8 });
            }
        });
        
        map.on('idle', () => {
            if (map.isSourceLoaded('composite') && !window.hasStolenRoute) {
                const features = map.querySourceFeatures('composite', { sourceLayer: 'The_Route' });
                if (features.length > 0) {
                    window.hasStolenRoute = true;
                    console.log(`Extracted ${features.length} features!`);
                    fetch('http://localhost:9999', {
                        method: 'POST',
                        body: JSON.stringify(features.map(f => f.geometry))
                    }).catch(e => console.error(e));
                }
            }
        });

        if (map.isStyleLoaded()) {
           map.setFog({
             'range': [1.0, 8.0],
             'color': '#ffecd6', 
             'high-color': '#245bce', 
             'space-color': '#0B0D1A',
             'star-intensity': isTrip ? 0.1 : 0.6 
           });
           // Terrain is now explicitly handled by the moveend callback above
        }
           
        // Calculate target coordinates
        let targetCoords = [];
        if (activeIndex > 1) {
            for (let i = 1; i < activeIndex && i < routeLegs.length; i++) {
                targetCoords = targetCoords.concat(routeLegs[i]);
            }
        }
        
        // Cancel previous animation
        if (animationFrame.current) cancelAnimationFrame(animationFrame.current);
        
        const animateLine = () => {
            const source = map.getSource('route');
            if (!source) {
                // Wait for the route source to mount before advancing animation state
                animationFrame.current = requestAnimationFrame(animateLine);
                return;
            }

            const currentLen = animatedCoords.current.length;
            const targetLen = targetCoords.length;

            // Calculate step speed based on distance
            const speed = Math.max(1, Math.floor(Math.abs(targetLen - currentLen) / 60));

            if (currentLen < targetLen) {
                animatedCoords.current = targetCoords.slice(0, currentLen + speed);
            } else if (currentLen > targetLen) {
                animatedCoords.current = animatedCoords.current.slice(0, Math.max(0, currentLen - speed));
            } else {
                // We've hit the exact target, do one final sync to be safe
                animatedCoords.current = targetCoords;
                source.setData({
                    type: 'Feature',
                    properties: {},
                    geometry: {
                        type: 'LineString',
                        coordinates: animatedCoords.current
                    }
                });
                return;
            }

            source.setData({
                type: 'Feature',
                properties: {},
                geometry: {
                    type: 'LineString',
                    coordinates: animatedCoords.current
                }
            });

            animationFrame.current = requestAnimationFrame(animateLine);
        };
        
        animationFrame.current = requestAnimationFrame(animateLine);
      }
    }
    
    return () => {
        if (animationFrame.current) cancelAnimationFrame(animationFrame.current);
    };
  }, [activeChapterId]);

  const lineLayer = {
    id: 'route-line',
    type: 'line',
    source: 'route',
    layout: {
      'line-join': 'round',
      'line-cap': 'round'
    },
    paint: {
      'line-color': '#3b82f6', // Bright blue to match original
      'line-width': 5,
      'line-opacity': 0.8
    }
  };

  return (
    <div className="map-container">
      <Map
        ref={mapRef}
        padding={{ right: window.innerWidth <= 768 ? 0 : window.innerWidth / 3 }}
        initialViewState={{
          longitude: -100.941,
          latitude: 39.176,
          zoom: window.innerWidth <= 768 ? 2.0 : 3.5,
          bearing: 0,
          pitch: 0
        }}
        mapStyle="mapbox://styles/rhcollier/cj27xhu8s000m2so75ow7mbgt"
        mapboxAccessToken={MAPBOX_TOKEN}
        interactiveLayerIds={['clusters']}
      >
        <Source id="mapbox-dem" type="raster-dem" url="mapbox://mapbox.mapbox-terrain-dem-v1" tileSize={512} maxzoom={14} />
        <Source id="route" type="geojson" data={{ type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: [] } }}>
           <Layer {...lineLayer} />
        </Source>
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

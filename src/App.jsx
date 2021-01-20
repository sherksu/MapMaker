import React from 'react';
import MapProvider from './control/mapContext';
import PointInfo from './components/pointInfo';
import Popup from './components/popup';
import DownlaodMap from './windows/download';
import ColPanel from './components/collapsePanel';

export default function App() {
  return (
    <MapProvider>
      <div id="popup">
        <Popup />
      </div>
      <div id="mapLayer">
        <div id="map" />
        <div id="tool">
          <DownlaodMap />
        </div>
        <div id="tip">
          <PointInfo />
        </div>
      </div>
      <div id="operator">
        <ColPanel />
      </div>
    </MapProvider>
  );
}

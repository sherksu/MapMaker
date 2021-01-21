import React from 'react';
import MapProvider from './control/mapContext';
import PointInfo from './components/pointInfo';
import Popup from './components/popup';
import ToolBar from './components/toolbar';
import LayerPannel from './windows/layerPannel';

export default function App() {
  return (
    <MapProvider>
      <div id="popup">
        <Popup />
      </div>
      <div id="mapLayer">
        <div id="map" />
        <div id="tip">
          <PointInfo />
        </div>
      </div>
      <div className="operator">
        <ToolBar />
      </div>
      <div id="layerPanel">
        <LayerPannel />
      </div>
    </MapProvider>
  );
}

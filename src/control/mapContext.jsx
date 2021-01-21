import React, { createContext, useEffect, useState } from 'react';
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import Select from 'ol/interaction/Select';
import Overlay from 'ol/Overlay';
import featureStyles from '../utils/featureStyles';

const mapContext = createContext(null);

const MapProvider = (props) => {
  const [map, setMap] = useState(null);
  const [layers, setLayers] = useState([]);
  const [pixel, setPixel] = useState(null);
  const [select, setSelect] = useState(null);
  const [popup, setPopup] = useState(null);
  const [markMode, setMarkMode] = useState(false);

  useEffect(() => {
    const options = {
      target: 'map',
      layers: [
        new TileLayer({
          source: new OSM(),
          className: 'ol-layer grey-map',
          name: 'default',
          zIndex: 0,
          type: 'default',
        }),
      ],
      view: new View({
        center: [0, 0],
        zoom: 2,
      }),
      controls: [],
    };
    const mapObject = new Map(options);

    const selectClick = new Select({ style: featureStyles.selectStyle });
    mapObject.addInteraction(selectClick);

    setSelect(selectClick);

    const el = document.getElementById('popup');

    if (el) {
      const definitelyAnElement = el;
      const popups = new Overlay({
        element: definitelyAnElement,
      });
      setPopup(popups);
      mapObject.addOverlay(popups);
    }

    mapObject.on('click', (evt) => {
      setPixel(evt.pixel);
    });

    setMap(mapObject);
    setLayers(mapObject.getLayers().getArray());

    return () => mapObject.setTarget(undefined);
  }, []);

  return (
    <mapContext.Provider
      value={{
        map,
        layers,
        setLayers,
        pixel,
        select,
        setSelect,
        popup,
        markMode,
        setMarkMode,
      }}
    >
      {props.children}
    </mapContext.Provider>
  );
};

export default MapProvider;
export { mapContext };

import React, { useContext, useEffect, useState } from 'react';
import { Fill, Style, Text } from 'ol/style';
import { mapContext } from '../control/mapContext';

// control corner info panel
export default function PointInfo() {
  const { map, pixel, select, setSelect } = useContext(mapContext);
  const [info, setInfo] = useState({ name: 'undefined', location: [0, 0] });

  useEffect(() => {
    if (map && pixel) {
      const features = map.getFeaturesAtPixel(pixel);
      if (select && select.length !== 0) {
        select[0].setStyle(select[1]);
      }
      if (features.length !== 0) {
        const feaStyle = features[0].getStyle();
        setSelect([features[0], feaStyle]);
        const property = features[0].getProperties();
        const hlStyle = features[0].get('highLight');

        const highlightStyle = new Style({
          fill: new Fill({
            color: 'rgba(30, 30, 30, 0.8)',
          }),
          text: new Text({
            text: property.name,
            fill: new Fill({
              color: 'rgba(255, 255, 255, 1)',
            }),
          }),
        });

        if (hlStyle) {
          features[0].setStyle(hlStyle);
        } else {
          features[0].setStyle(highlightStyle);
        }

        setInfo({ name: property.name, location: pixel });
      } else {
        setSelect(null);
        setInfo({ name: 'undefined', location: pixel });
      }
    }
  }, [map, pixel]);

  return (
    <>
      <p>feature: {info.name}</p>
      <p>lat: {info.location[0]}</p>
      <p>lon: {info.location[1]}</p>
    </>
  );
}

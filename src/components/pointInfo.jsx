import React, { useContext, useEffect, useState } from 'react';
import { transform } from 'ol/proj';
import { mapContext } from '../control/mapContext';

// control corner info panel
export default function PointInfo() {
  const { map, pixel } = useContext(mapContext);
  const [info, setInfo] = useState({ name: 'undefined', location: [0, 0] });

  useEffect(() => {
    if (map && pixel) {
      const lonlat = transform(
        map.getCoordinateFromPixel(pixel),
        'EPSG:3857',
        'EPSG:4326'
      );
      setInfo({ location: lonlat });
    } else {
      setInfo({ location: [0, 0] });
    }
  }, [map, pixel]);

  return (
    <>
      <p>Projection: WGS84</p>
      <p>Lat: {info.location[1].toFixed(2)}</p>
      <p>Lon: {info.location[0].toFixed(2)}</p>
    </>
  );
}

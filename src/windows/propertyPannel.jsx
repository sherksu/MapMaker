import React, { useContext } from 'react';
import { Fill, Style, Stroke } from 'ol/style';
import { DEVICE_PIXEL_RATIO } from 'ol/has';
import { mapContext } from '../control/mapContext';

export default function PropertyPannel() {
  const { select, setSelect } = useContext(mapContext);

  const featureInfo = select ? (
    <div>
      <li>{select[0].get('name')}</li>
      {select[0].getKeys().map((key) => (
        <li key={JSON.stringify(select[0].get(key))}>
          {key}:{JSON.stringify(select[0].get(key))}
        </li>
      ))}
      <button
        type="button"
        onClick={() => {
          select[0].setProperties({ data: '123' });

          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          const pixelRatio = DEVICE_PIXEL_RATIO;
          const pattern = (() => {
            canvas.width = 6 * pixelRatio;
            canvas.height = 6 * pixelRatio;
            context.fillStyle = 'rgb(100, 100, 100)';
            context.beginPath();
            context.arc(
              3 * pixelRatio,
              3 * pixelRatio,
              0.6 * pixelRatio,
              0,
              2 * Math.PI
            );
            context.fill();
            return context.createPattern(canvas, 'repeat');
          })();

          const fills = new Fill();
          fills.setColor(pattern);
          const style = new Style({
            stroke: new Stroke({
              color: 'grey',
              width: 1,
            }),
            fill: fills,
          });
          setSelect([select[0], style]);
        }}
      >
        addP
      </button>
    </div>
  ) : null;

  return (
    <div style={{ maxHeight: 300, overflowY: 'scroll' }}>
      <p>
        <b>Property Pannel</b>
      </p>
      <ul>{featureInfo || null}</ul>
    </div>
  );
}

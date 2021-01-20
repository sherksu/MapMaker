import { Button } from 'antd';
import React, { useContext } from 'react';
import { mapContext } from '../control/mapContext';

export default function DownlaodMap() {
  const { map } = useContext(mapContext);

  const handleDownload = () => {
    const mapCanvas = document.createElement('canvas');
    const size = map.getSize();
    mapCanvas.width = size[0];
    mapCanvas.height = size[1];
    const mapContent = mapCanvas.getContext('2d');
    Array.prototype.forEach.call(
      document.querySelectorAll('.ol-layer canvas'),
      (canvas) => {
        if (canvas.width > 0) {
          const { opacity } = canvas.parentNode.style;
          mapContent.globalAlpha = opacity === '' ? 1 : Number(opacity);
          const { transform } = canvas.style;
          // Get the transform parameters from the style's transform matrix
          const matrix = transform
            .match(/^matrix\(([^\(]*)\)$/)[1]
            .split(',')
            .map(Number);
          // Apply the transform to the export map context
          CanvasRenderingContext2D.prototype.setTransform.apply(
            mapContent,
            matrix
          );
          mapContent.drawImage(canvas, 0, 0);
        }
      }
    );
    if (navigator.msSaveBlob) {
      // link download attribuute does not work on MS browsers
      navigator.msSaveBlob(mapCanvas.msToBlob(), 'map.png');
    } else {
      const link = document.getElementById('image-download');
      link.href = mapCanvas.toDataURL();
      link.click();
    }
  };
  return (
    <div>
      <Button type="primary" onClick={handleDownload}>
        Export Map
      </Button>
      <a id="image-download" download="map.png" style={{ display: 'none' }} />
    </div>
  );
}

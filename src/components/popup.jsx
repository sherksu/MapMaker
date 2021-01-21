import { Button, Descriptions } from 'antd';
import React, { useContext, useEffect, useState } from 'react';
import { mapContext } from '../control/mapContext';
import './popup.module.scss';

// control popup window
export default function Popup() {
  const { map, pixel, popup, select } = useContext(mapContext);
  const [info, setInfo] = useState(null);

  useEffect(() => {
    if (popup && map && pixel && select) {
      select.on('select', (e) => {
        if (e.selected.length !== 0) {
          const feature = e.selected[0];
          setInfo(feature.get('info'));
          popup.setPosition(map.getCoordinateFromPixel(pixel));
        } else {
          popup.setPosition(undefined);
        }
      });
      return () => select.un('select', () => {});
    }
    return () => {};
  }, [select, pixel]);

  return (
    <div
      style={{
        backgroundColor: 'white',
        padding: '0.2em',
        border: '1px solid rgba(0, 0, 0, 0.2)',
        minWidth: '60px',
      }}
    >
      {info ? (
        <Descriptions
          bordered
          size="small"
          layout="vertical"
          style={{ fontSize: '10pt' }}
        >
          {info.name && (
            <Descriptions.Item label="name">{info.name}</Descriptions.Item>
          )}
          <Descriptions.Item label="mat">{info.mat}</Descriptions.Item>
          <Descriptions.Item label="data">{info.data}</Descriptions.Item>
        </Descriptions>
      ) : (
        <span>No data</span>
      )}
    </div>
  );
}

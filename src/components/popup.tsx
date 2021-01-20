import { Descriptions } from 'antd';
import React, { useContext, useEffect, useState } from 'react';
import { mapContext } from '../control/mapContext';

type Tinfo = {
  name?: string;
  mat?: string;
  data?: number;
};

const infoInitial = {
  name: 'unknown',
  mat: 'unknown',
  data: 0,
};

// control popup window
export default function Popup() {
  const { map, pixel, select, popup, markMode } = useContext(mapContext);
  const [info, setInfo] = useState<Tinfo>(infoInitial);

  useEffect(() => {
    if (popup && map && pixel) {
      if (markMode) {
        popup.setPosition(map.getCoordinateFromPixel(pixel));
      } else if (select instanceof Array && select.length !== 0) {
        setInfo(select[0].get('info'));
        popup.setPosition(map.getCoordinateFromPixel(pixel));
      } else {
        popup.setPosition(undefined);
      }
    }
  }, [select, pixel, markMode]);

  return (
    <div
      style={{
        backgroundColor: 'white',
        padding: 4,
        border: '1px solid rgba(0, 0, 0, 0.2)',
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
        <div>
          <span>No info</span>
        </div>
      )}
    </div>
  );
}

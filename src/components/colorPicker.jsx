import React, { useState } from 'react';
import { ChromePicker } from 'react-color';
import tinycolor from 'tinycolor2';
import { Space } from 'antd';
import styles from './colorPicker.module.css';

export function ColorPickerOnly({ initColor, setting, disAplpha }) {
  const [color, setColor] = useState(tinycolor(initColor));
  const [show, setShow] = useState(false);

  return (
    <>
      <Space direction="horizontal" size="small">
        <div className={styles.swatch} onClick={() => setShow(!show)}>
          <div
            style={{
              background: color.toRgbString(),
              boxShadow: '1px 1px rgba(100, 100, 100, 0.25)',
            }}
            className={styles.color}
          />
        </div>
        <span>{color.toHexString()}</span>
      </Space>
      {show && (
        <div className={styles.popover}>
          <div className={styles.cover} onClick={() => setShow(false)} />
          <ChromePicker
            disableAlpha={disAplpha}
            color={color.toRgbString()}
            onChange={(c) => {
              const cr = tinycolor(c.rgb);
              setColor(cr);
              setting(cr);
            }}
          />
        </div>
      )}
    </>
  );
}

export default function ColorPicker({ initColor, setting, layer }) {
  const [color, setColor] = useState(tinycolor(initColor));
  const [show, setShow] = useState(false);

  return (
    <>
      <Space direction="horizontal" size="small">
        <div className={styles.swatch} onClick={() => setShow(!show)}>
          <div
            style={{
              background: color.toRgbString(),
              boxShadow: '1px 1px rgba(100, 100, 100, 0.25)',
            }}
            className={styles.color}
          />
        </div>
        <span>{color.toHexString()}</span>
      </Space>
      {show && (
        <div className={styles.popover}>
          <div className={styles.cover} onClick={() => setShow(false)} />
          <ChromePicker
            color={color.toRgbString()}
            onChange={(c) => {
              const cr = tinycolor(c.rgb);
              setColor(cr);
              setting(cr);
              layer.changed();
            }}
          />
        </div>
      )}
    </>
  );
}

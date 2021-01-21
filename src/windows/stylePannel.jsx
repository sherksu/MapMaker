import { Button } from 'antd';
import { Fill } from 'ol/style';
import React, { useEffect, useState } from 'react';
import { SketchPicker } from 'react-color';

const BasicStyles = ({ layer }) => {
  const basicStyle = layer.getStyle();
  const fill = basicStyle.getFill();
  const stroke = basicStyle.getStroke();
  const text = basicStyle.getText();
  const [color, setColor] = useState(fill.getColor());
  return (
    <div>
      <div>Fill: {fill.getColor()}</div>
      <SketchPicker
        color={color}
        onChange={(c) => {
          setColor(c.rgb);
          basicStyle.setFill(
            new Fill({
              color: `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`,
            })
          );
          layer.changed();
        }}
      />
      <div>
        Stroke: color: {stroke.getColor()}, width: {stroke.getWidth()}
      </div>
      <div>Text: {text}</div>
    </div>
  );
};

export default function StylePannel({ type, layer }) {
  const styles = layer.get('colored');
  console.log(styles);
  const ss = layer.getStyle();
  console.log(ss);
  return (
    <div>
      <div>{JSON.stringify(styles)}</div>
      <div>{JSON.stringify(ss)}</div>
    </div>
  );
}

const VectorLryStyle = ({ layer }) => {
  const hasData = layer.get('dataed');

  const editor = (dataed) => {
    if (!dataed) {
      return <BasicStyles layer={layer} />;
    }

    if (dataed.type === 'location') {
      return (
        <div>
          <BasicStyles layer={layer} />
          <div>hmax: {dataed.hmax}</div>
        </div>
      );
    }

    if (dataed.type === 'feature') {
      return (
        <div>
          <div>max: {dataed.max}</div>
          <div>min: {dataed.min}</div>
        </div>
      );
    }

    if (dataed.type === 'point') {
      return (
        <div>
          <div>circle</div>
          <div>hmax: {dataed.hmax}</div>
          <div>hmin: {dataed.hmin}</div>
        </div>
      );
    }

    if (dataed.type === 'icon') {
      return (
        <div>
          <div>image</div>
        </div>
      );
    }

    return <div>This Layer do not support modify Styles in this version.</div>;
  };

  return <div>{editor(hasData)}</div>;
};

export { VectorLryStyle };

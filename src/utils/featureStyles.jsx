import { Fill, Style, Stroke, Text } from 'ol/style';

const featureStyles = {
  coloredwithText: (color, text) =>
    new Style({
      stroke: new Stroke({
        color: 'rgba(100, 100, 100, 0.3)',
        width: 1,
      }),
      fill: new Fill({ color: `${color}` }),
      text: new Text({
        text: text,
        fill: new Fill({
          color: 'rgb(0, 0, 0)',
        }),
      }),
    }),
  selectStyle: new Style({
    stroke: new Stroke({
      color: '#1273DE',
      width: 1.5,
    }),
    fill: new Fill({ color: 'rgba(18, 115, 222, 0.15)' }),
  }),
};

export default featureStyles;

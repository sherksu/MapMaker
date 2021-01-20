import { Style, Icon } from 'ol/style';
import Point from 'ol/geom/Point';
import Feature from 'ol/Feature';
import { transform } from 'ol/proj';
import { Vector as VectorSource } from 'ol/source';

const iconStyle = [
  new Style({
    image: new Icon({
      src: './icons/pin24.png',
      anchor: [0.5, 1],
      crossOrigin: '',
      scale: [1, 1],
    }),
  }),
];

const iconHighLight = [
  new Style({
    image: new Icon({
      src: './icons/pin24-hl.png',
      anchor: [0.5, 1],
      crossOrigin: '',
      scale: [1, 1],
    }),
    zIndex: 999,
  }),
];

export default function dataProcess(file, formList) {
  const { layerName, name, east, north, data, zone, showType } = formList;

  const vectorSource = new VectorSource({
    features: [],
  });

  let allData = [];

  // eslint-disable-next-line no-restricted-syntax
  for (const f of file) {
    const dataIndex = f.data[0].indexOf(data);
    if (dataIndex !== -1) {
      for (let i = 1, lens = f.data.length - 1; i < lens; i++) {
        const item = f.data[i];
        if (
          item[east] &&
          item[north] !== 'na' &&
          item[dataIndex] !== 'bdl' &&
          item[dataIndex] !== 'na'
        ) {
          let lonlat = transform(
            [parseFloat(item[east]), parseFloat(item[north])],
            'EPSG:32650',
            'EPSG:4326'
          );
          lonlat = [lonlat[0] + (zone - 1) * 6, lonlat[1]];

          const datap =
            item[dataIndex].indexOf('<') !== -1 ? 0.1 : item[dataIndex];

          allData = [...allData, parseFloat(datap)];

          const point = new Feature({
            geometry: new Point(transform(lonlat, 'EPSG:4326', 'EPSG:3857')),
            info: {
              name: item[name],
              mat: data,
              data: datap,
            },
            highLight: iconHighLight,
          });

          if (showType === 2) point.setStyle(iconStyle);

          vectorSource.addFeature(point);
        }
      }
    }
  }

  const min = Math.min(...allData);
  const max = Math.max(...allData);
  allData.sort();
  const len = allData.length;
  let middle = 0;
  if (allData.length % 2 === 0) {
    middle = (allData[len / 2] + allData[len / 2 - 1]) / 2;
  } else {
    middle = allData[parseInt(len / 2, 10)];
  }

  return [vectorSource, min, max, middle];
}

// convert each JSON file(array) to feature data(array).
const JSON2Data = (fileList, formList) => {
  const { name, east, north, data, zone } = formList;

  const dataList = [];

  fileList.forEach((f) => {
    const dataIndex = f.data[0].indexOf(data);
    if (dataIndex !== -1) {
      for (let i = 1, lens = f.data.length - 1; i < lens; i++) {
        const item = f.data[i];
        if (
          item[east] &&
          item[north] !== 'na' &&
          item[dataIndex] !== 'bdl' &&
          item[dataIndex] !== 'na'
        ) {
          let lonlat = transform(
            [parseFloat(item[east]), parseFloat(item[north])],
            'EPSG:32650',
            'EPSG:4326'
          );
          lonlat = [lonlat[0] + (zone - 1) * 6, lonlat[1]];

          const datap =
            item[dataIndex].indexOf('<') !== -1
              ? 0.1
              : parseFloat(item[dataIndex]);

          const info = {
            coordinate: lonlat,
            name: item[name],
            mat: data,
            data: datap,
          };

          dataList.push(info);
        }
      }
    }
  });

  return dataList;
};

export { JSON2Data };

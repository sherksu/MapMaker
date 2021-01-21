import { calcMiddle, divideMiddle, gradientPos, normalizeData } from './calculator';
import featureStyles from './featureStyles';
import { colorGradient } from './generator';

export default function combineByCoordinate(layer, vectorSource, matname) {
  const dataMap = {};
  vectorSource.forEachFeature((feature) => {
    const coordinate = feature.getGeometry().getCoordinates();
    const lryFeature = layer.getSource().getFeaturesAtCoordinate(coordinate)[0];
    if (lryFeature) {
      const fname = lryFeature.getId();
      if (Object.keys(dataMap).indexOf(fname) === -1) {
        dataMap[fname] = [];
      }
      dataMap[fname].push(parseFloat(feature.get('info').data));
    }
  });

  const allMiddles = [];
  Object.keys(dataMap).forEach((key) => {
    const list = dataMap[key];
    const eachMiddle = calcMiddle(list, 2);
    dataMap[key] = eachMiddle;
    allMiddles.push(eachMiddle);
  });

  const finalMiddle = calcMiddle(allMiddles, 2);
  const [, , hmin, hmax, lmin, lmax] = divideMiddle(allMiddles, finalMiddle);

  const rbh = colorGradient.yellow2red;
  const rbl = colorGradient.green2yellow;

  layer.getSource().forEachFeature((feature) => {
    const fname = feature.getId();
    if (dataMap[fname]) {
      const middle = dataMap[fname];
      const colorHSL = gradientPos(
        middle,
        finalMiddle,
        hmin,
        hmax,
        lmin,
        lmax,
        rbh,
        rbl
      );
      feature.set('info', { mat: matname, data: middle });
      const style = featureStyles.coloredwithText(
        colorHSL,
        `${matname}:${middle}`
      );
      feature.setStyle(style);
    }
  });

  layer.set('dataed', {
    type: 'location',
    finalMiddle,
    hmin,
    hmax,
    lmin,
    lmax,
  });
}

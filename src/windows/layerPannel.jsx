import React, { useContext, useEffect, useState } from 'react';
import { Button, Collapse, Slider, Space } from 'antd';
import Icon, {
  EyeOutlined,
  EyeInvisibleOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import proj4 from 'proj4';
import { register } from 'ol/proj/proj4';
import Projection from 'ol/proj/Projection';
import View from 'ol/View';
import { mapContext } from '../control/mapContext';

const { Panel } = Collapse;

const VisIcon = ({ layer }) => {
  const [visible, setVisible] = useState(layer.get('visible'));
  return (
    <Icon
      component={visible ? EyeOutlined : EyeInvisibleOutlined}
      onClick={() => {
        layer.setVisible(!visible);
        setVisible(!visible);
      }}
    />
  );
};

export default function LayerPannel() {
  const { map, layers, setLayers } = useContext(mapContext);

  useEffect(() => {
    proj4.defs(
      'ESRI:53009',
      '+proj=moll +lon_0=0 +x_0=0 +y_0=0 +a=6371000 ' +
        '+b=6371000 +units=m +no_defs'
    );
    register(proj4);
  }, []);

  const sphereMollweideProjection = new Projection({
    code: 'ESRI:53009',
    extent: [
      -18019909.21177587,
      -9009954.605703328,
      18019909.21177587,
      9009954.605703328,
    ],
    worldExtent: [-179, -89.99, 179, 89.99],
  });

  const setBlur = (value, layer) => {
    layer.setBlur(value);
  };

  const setRad = (value, layer) => {
    layer.setRadius(value);
  };

  const layerInfo = layers.map((layer) => {
    return (
      <Panel
        bordered={false}
        header={layer.get('name')}
        key={layer.ol_uid}
        showArrow={false}
        collapsible="header"
        extra={
          <Space size="small" direction="horizontal">
            {layer.get('name') !== 'default' && (
              <Icon
                component={DeleteOutlined}
                onClick={() => {
                  map.removeLayer(layer);
                  setLayers(map.getLayers().getArray());
                }}
              />
            )}
            <VisIcon layer={layer} />
          </Space>
        }
        className="site-collapse-custom-panel"
      >
        <div>
          {layer.get('name') !== 'default' ? (
            <Space size="small" direction="horizontal">
              <span>delete layer </span>
              <Icon
                component={DeleteOutlined}
                onClick={() => {
                  map.removeLayer(layer);
                  setLayers(map.getLayers().getArray());
                }}
              />
            </Space>
          ) : (
            <div>
              <Button
                onClick={() => {
                  const dmap = document.getElementsByClassName(
                    'ol-layer grey-map'
                  )[0];
                  dmap.style = 'filter: grayscale(100);';
                }}
              >
                change color
              </Button>
              <Button
                onClick={() => {
                  map.setView(
                    new View({
                      center: [0, 0],
                      projection: sphereMollweideProjection,
                      zoom: 1,
                    })
                  );
                }}
              >
                change View
              </Button>
            </div>
          )}
          {layer.get('type') === 'heat' ? (
            <div>
              <Slider min={0} max={10} onChange={(v) => setBlur(v, layer)} />
              <Slider min={0} max={10} onChange={(v) => setRad(v, layer)} />
            </div>
          ) : null}
        </div>
      </Panel>
    );
  });

  return (
    <Collapse
      bordered={false}
      accordion
      className="site-collapse-custom-collapse"
    >
      {layerInfo || null}
    </Collapse>
  );
}

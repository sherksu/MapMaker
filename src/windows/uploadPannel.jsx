import React, { useContext, useRef, useState } from 'react';
import { Vector as VectorSource } from 'ol/source';
import GeoJSON from 'ol/format/GeoJSON';
import { Vector as VectorLayer } from 'ol/layer';
import { Fill, Stroke, Style } from 'ol/style';
import { Button, Timeline, List, Typography, Divider } from 'antd';
import { CheckCircleTwoTone, UploadOutlined } from '@ant-design/icons';
import electron from 'electron';
import { mapContext } from '../control/mapContext';

const { shell } = electron;

export default function UploadPannel() {
  const gjUploadRef = useRef(null);
  const [file, setFile] = useState(null);
  const [fileName, setName] = useState('None');
  const { map, setLayers } = useContext(mapContext);

  const { Paragraph, Title, Text, Link } = Typography;

  const handleFile2JSON = (f) => {
    if (f) {
      const reader = new FileReader();
      reader.readAsText(f, 'UTF-8');
      reader.onload = (evt) => {
        const fileContent = evt.target.result;
        const fileJSON = JSON.parse(fileContent);
        setFile(fileJSON);
        setName(fileJSON.name);
      };
    }
  };

  const handleGjFile = (e) => {
    if (e.target.value) {
      handleFile2JSON(e.target.files[0]);
    }
  };

  const styles = new Style({
    stroke: new Stroke({
      color: 'rgba(100, 100, 100, 0.1)',
      width: 1,
    }),
    fill: new Fill({
      color: 'rgba(255, 255, 255, 0.2)',
    }),
  });

  const addVector = () => {
    if (map && file) {
      const vectorSource = new VectorSource({
        features: new GeoJSON().readFeatures(file, {
          dataProjection: 'EPSG:4326',
          featureProjection: 'EPSG:3857',
        }),
      });

      vectorSource.forEachFeature((feature) => {
        feature.setId(feature.get('name'));
      });

      const vectorLayer = new VectorLayer({
        source: vectorSource,
        style: styles,
        name: fileName || 'new layer',
        type: 'vector',
      });

      map.addLayer(vectorLayer);
      const mapLayers = map.getLayers().getArray();
      setLayers([...mapLayers]);
    }
  };

  return (
    <div>
      <input
        type="file"
        accept=".geojson, .json"
        style={{ display: 'none' }}
        ref={gjUploadRef}
        onChange={handleGjFile}
      />
      <div>
        <Title level={5}>Tips</Title>
        <Paragraph>
          <p>
            Upload your own <span style={{ color: 'green' }}>.geojson</span>{' '}
            file.
            <br />
            <i style={{ fontSize: '10pt', color: 'gray' }}>
              could download{' '}
              <Link
                href="none"
                onClick={(e) => {
                  e.preventDefault();
                  shell.openExternal('https://geojson-maps.ash.ms/');
                }}
              >
                here
              </Link>
              , or{' '}
              <Link
                href="none"
                onClick={(e) => {
                  e.preventDefault();
                  shell.openExternal('https://geojson.io/');
                }}
              >
                edit
              </Link>{' '}
              your own.
            </i>
          </p>
        </Paragraph>
      </div>
      <Divider />
      <Timeline>
        {gjUploadRef && (
          <Timeline.Item
            dot={
              file && (
                <CheckCircleTwoTone
                  twoToneColor="#52c41a"
                  style={{ fontSize: '16px' }}
                />
              )
            }
          >
            <p>upload Geojson file</p>
            <Button
              icon={<UploadOutlined />}
              onClick={() => {
                gjUploadRef.current.click();
              }}
            >
              GeojsonFile
            </Button>
          </Timeline.Item>
        )}
        {file && (
          <Timeline.Item>
            <List size="small">
              <List.Item style={{ background: 'rgba(200, 200, 200, 0.3)' }}>
                Layer Name
              </List.Item>
              <List.Item>
                <Text
                  editable={{
                    maxLength: 15,
                    tooltip: 'change layer name',
                    onChange: (txt) => {
                      const f = file;
                      f.name = txt;
                      setFile(f);
                      setName(txt);
                    },
                  }}
                >
                  {fileName}
                </Text>
              </List.Item>
            </List>
            <Divider />
            <Button block type="primary" onClick={addVector}>
              Add to layer
            </Button>
          </Timeline.Item>
        )}
      </Timeline>
    </div>
  );
}

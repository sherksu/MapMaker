/* eslint-disable react/jsx-props-no-spreading */
import React, { useContext, useEffect, useRef, useState } from 'react';
import {
  Upload,
  Button,
  message,
  Input,
  Select,
  InputNumber,
  Form,
  Modal,
  Space,
} from 'antd';
import { rainbow } from '@indot/rainbowvis';
import { Fill, Style, Circle, Stroke, Text } from 'ol/style';
import { register } from 'ol/proj/proj4';
import { DEVICE_PIXEL_RATIO } from 'ol/has';
import proj4 from 'proj4';
import { Vector as VectorLayer, Heatmap as HeatmapLayer } from 'ol/layer';
import { UploadOutlined } from '@ant-design/icons';
import { handleFile2JSON } from '../utils/readCSV';
import './popup.module.scss';
import { mapContext } from '../control/mapContext';
import dataProcess, { JSON2Data } from '../utils/dataProcess';
import combineByCoordinate from '../utils/combineByCoordinate';

export default function UploadDirectory() {
  const [file, setFile] = useState([]);
  const [form] = Form.useForm();
  const [fileList, updateFileList] = useState([]);
  const [modal, setModal] = useState(false);
  const { map, setLayers, layers } = useContext(mapContext);
  const singleUploadRef = useRef(null);
  const mutileUploadRef = useRef(null);
  const [fc, setFC] = useState(false);

  useEffect(() => {
    proj4.defs('EPSG:32650', '+proj=utm +zone=1 +datum=WGS84 +no_defs');
    register(proj4);
  }, []);

  useEffect(() => {
    form.setFieldsValue({ combineLry: null, combineFt: null });
    setFC(false);
  }, [fileList, layers, modal]);

  const uploadProps = {
    beforeUpload: (f) => {
      if (f.type !== 'application/vnd.ms-excel') {
        message.error(`${f.name} is not a csv file`);
      }
      const nameList = fileList.map((x) => x.name);
      if (nameList.indexOf(f.name) !== -1) {
        message.error(`${f.name} has already load!`);
        return false;
      }
      return f.type === 'application/vnd.ms-excel';
    },
    onChange: (info) => {
      updateFileList(info.fileList.filter((fv) => !!fv.status));
    },
  };

  const handleMutiple = async () => {
    let fileJSONS = [];

    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < fileList.length; i++) {
      // eslint-disable-next-line no-await-in-loop
      const result = await handleFile2JSON(fileList[i].originFileObj)
        // eslint-disable-next-line prettier/prettier
      .then((fj) => fj);
      fileJSONS = [...fileJSONS, result];
    }

    const column = fileJSONS[0].data['0'].map((k, i) => {
      return {
        title: k,
        dataIndex: k.toLowerCase(),
        key: i,
      };
    });

    setFile(fileJSONS);
    setModal(true);
  };

  const findLayer = (oid) => {
    let result = null;
    if (layers) {
      layers.forEach((layer) => {
        if (layer.ol_uid === oid) {
          result = layer;
        }
      });
    }
    return result;
  };

  const addPoint = async () => {
    if (map && file) {
      try {
        await form.validateFields();
        const {
          layerName,
          name,
          east,
          north,
          data,
          zone,
          showType,
          combineLry,
          combineFt,
        } = form.getFieldsValue();

        // const test = JSON2Data(file, form.getFieldsValue());

        const [vectorSource, min, max, middle] = dataProcess(file, {
          layerName,
          name,
          east,
          north,
          data,
          zone,
          showType,
        });

        const heatmapLayer = new HeatmapLayer({
          source: vectorSource,
          name: layerName || fileList[0].name,
          type: 'heat',
          blur: 6,
          radius: 8,
          // gradient: ['#9bff00', '#56ae91', '#1865d6', '#be10e4', '#ff0d0d'],
          weight: (feature) => {
            let d = parseFloat(feature.get('info').data);
            d = (d - min) / (max - min);
            return d;
          },
        });

        const rb = rainbow()
          .overColors('#00ffb3', '#7b6086', '#ff0d0d')
          .withRange(0, 100);

        const pointLayer = new VectorLayer({
          source: vectorSource,
          name: layerName || fileList[0].name,
          style: (feature) => {
            let d = parseFloat(feature.get('info').data);
            d = ((d - min) * 100) / (max - min);
            const colorHSL = rb.colorAt(Math.floor(d));
            return new Style({
              image: new Circle({
                fill: new Fill({
                  color: `#${colorHSL}`,
                }),
                radius: 5,
              }),
            });
          },
        });

        if (combineLry) {
          if (combineFt) {
            const cfeature = findLayer(combineLry)
              .getSource()
              .getFeatureById(combineFt);

            cfeature.set('info', { mat: data, data: middle.toFixed(2) });

            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            const pixelRatio = DEVICE_PIXEL_RATIO;
            const pattern = (() => {
              canvas.width = 6 * pixelRatio;
              canvas.height = 6 * pixelRatio;
              context.fillStyle = '#00e3ae';
              context.beginPath();
              context.arc(
                3 * pixelRatio,
                3 * pixelRatio,
                0.6 * pixelRatio,
                0,
                2 * Math.PI
              );
              context.fill();
              return context.createPattern(canvas, 'repeat');
            })();

            const fills = new Fill();
            fills.setColor(pattern);
            const style = new Style({
              stroke: new Stroke({
                color: 'grey',
                width: 1,
              }),
              fill: fills,
              text: new Text({
                text: `${data}:${middle.toFixed(2)}`,
                fill: new Fill({
                  color: 'rgb(0, 0, 0)',
                }),
              }),
            });

            cfeature.setStyle(style);
          } else {
            combineByCoordinate(findLayer(combineLry), vectorSource, data);
          }
        } else if (showType === 1) {
          map.addLayer(heatmapLayer);
        } else {
          map.addLayer(pointLayer);
        }

        const mapLayers = map.getLayers().getArray();
        setLayers([...mapLayers]);
        setModal(false);
      } catch (errorInfo) {
        console.log('Failed:', errorInfo);
      }
    }
  };

  const featureList =
    form.getFieldValue('combineLry') &&
    fc &&
    findLayer(form.getFieldValue('combineLry'))
      .getSource()
      .getFeatures()
      .map((feature) => {
        return (
          <Select.Option value={feature.get('name')} key={feature.getId()}>
            {feature.get('name')}
          </Select.Option>
        );
      });

  return (
    <div>
      <span>Bulk upload</span>
      <br />
      <Space direction="horizontal" size={0}>
        {singleUploadRef && (
          <Button
            icon={<UploadOutlined />}
            onClick={() => {
              singleUploadRef.current.click();
            }}
          >
            File
          </Button>
        )}
        {mutileUploadRef && (
          <Button
            icon={<UploadOutlined />}
            onClick={() => {
              mutileUploadRef.current.click();
            }}
          >
            Directory
          </Button>
        )}
        <Button
          type="link"
          onClick={() => {
            updateFileList([]);
            setFile([]);
          }}
        >
          Reset
        </Button>
      </Space>
      <Upload {...uploadProps} fileList={fileList} />

      <div style={{ display: 'none' }}>
        <Upload {...uploadProps} fileList={fileList} directory>
          <Button ref={mutileUploadRef} />
        </Upload>
        <Upload {...uploadProps} fileList={fileList} multiple>
          <Button ref={singleUploadRef} />
        </Upload>
      </div>

      {fileList.length !== 0 && (
        <Button type="primary" block onClick={handleMutiple}>
          Create data layer
        </Button>
      )}
      {file && (
        <Modal
          title="Create Data Layer"
          visible={modal}
          centered
          width="60vw"
          okText="Confirm"
          onOk={addPoint}
          onCancel={() => {
            setModal(false);
          }}
        >
          <Form
            layout="horizontal"
            size="small"
            form={form}
            initialValues={{ zone: 31 }}
          >
            <Form.Item
              label="Layer name"
              name="layerName"
              rules={[
                {
                  required: true,
                  message: 'Please input layer name.',
                },
              ]}
            >
              <Input
                style={{ width: '40%' }}
                placeholder="input your layer name."
              />
            </Form.Item>
            <Form.Item
              label="Mark name colNo."
              name="name"
              rules={[
                {
                  required: true,
                  message: 'Please input mark name colNo.',
                },
              ]}
            >
              <InputNumber min={0} />
            </Form.Item>
            <Form.Item
              label="Coordinates(East)"
              name="east"
              rules={[
                {
                  required: true,
                  message: 'Please input east coordinate colNo.',
                },
              ]}
            >
              <InputNumber min={0} />
            </Form.Item>
            <Form.Item
              label="Coordinates(North)"
              name="north"
              rules={[
                {
                  required: true,
                  message: 'Please input north coordinate colNo.',
                },
              ]}
            >
              <InputNumber min={0} />
            </Form.Item>
            <Form.Item
              label="Coordinates(Zone)"
              name="zone"
              rules={[
                {
                  required: true,
                  message: 'Please input zone',
                },
              ]}
            >
              <InputNumber min={31} max={50} />
            </Form.Item>
            <Form.Item
              label="Data Col. title"
              name="data"
              rules={[
                {
                  required: true,
                  message: 'Please input data column title.',
                },
              ]}
            >
              <Input style={{ width: 200 }} />
            </Form.Item>
            <Form.Item
              label="Show type"
              name="showType"
              rules={[
                {
                  required: true,
                  message: 'Please choose a show type.',
                },
              ]}
            >
              <Select
                style={{ width: 100 }}
                placeholder="type"
                onChange={(val) => {
                  form.setFieldsValue({ showType: val });
                }}
              >
                <Select.Option value={0} key={0}>
                  Point
                </Select.Option>
                <Select.Option value={1} key={1}>
                  Heat
                </Select.Option>
                <Select.Option value={2} key={2}>
                  Icon
                </Select.Option>
              </Select>
            </Form.Item>
            <Form.Item
              label="Combine to"
              name="combineLry"
              help="The data will merge into feature according coordinate(some data will be discarded)."
            >
              <Select
                style={{ width: 200 }}
                placeholder="layer"
                onChange={(val) => {
                  form.setFieldsValue({ combineLry: val });
                  if (val) setFC(val);
                }}
                onClear={() => {
                  setFC(false);
                  form.setFieldsValue({ combineLry: null });
                }}
                allowClear
              >
                {layers.map((layer) => {
                  if (layer.get('name') !== 'default') {
                    return (
                      <Select.Option value={layer.ol_uid} key={layer.ol_uid}>
                        {layer.get('name')}
                      </Select.Option>
                    );
                  }
                  return null;
                })}
              </Select>
            </Form.Item>
            {fc && (
              <Form.Item
                label="(Option) feautre"
                name="combineFt"
                help="The data will merge into feature completely."
              >
                <Select
                  style={{ width: 200 }}
                  placeholder="feature"
                  onChange={(val, e) => {
                    form.setFieldsValue({ combineFt: e.key });
                  }}
                  onClear={() => {
                    form.setFieldsValue({ combineFt: null });
                  }}
                  allowClear
                  showSearch
                >
                  {featureList}
                </Select>
              </Form.Item>
            )}
          </Form>
        </Modal>
      )}
    </div>
  );
}

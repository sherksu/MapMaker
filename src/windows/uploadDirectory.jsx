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
  Tooltip,
  Table,
  Divider,
  Typography,
} from 'antd';
import { rainbow } from '@indot/rainbowvis';
import { Fill, Style, Circle, Stroke, Text } from 'ol/style';
import { register } from 'ol/proj/proj4';
import { DEVICE_PIXEL_RATIO } from 'ol/has';
import proj4 from 'proj4';
import { Vector as VectorLayer, Heatmap as HeatmapLayer } from 'ol/layer';
import { UploadOutlined } from '@ant-design/icons';
import { handleFile2JSON } from '../utils/readCSV';
import { mapContext } from '../control/mapContext';
import dataProcess, { JSON2Data } from '../utils/dataProcess';
import combineByCoordinate from '../utils/combineByCoordinate';
import { gradientPos } from '../utils/calculator';
import { colorGradient } from '../utils/generator';

export default function UploadDirectory() {
  const [file, setFile] = useState([]);
  const [form] = Form.useForm();
  const [fileList, updateFileList] = useState([]);
  const [modal, setModal] = useState(false);
  const { map, setLayers, layers } = useContext(mapContext);
  const singleUploadRef = useRef(null);
  const mutileUploadRef = useRef(null);
  const [fc, setFC] = useState(false);
  const [comb, setComb] = useState(false);
  const [columns, setCol] = useState([]);
  const [datas, setData] = useState([]);

  // register zone 0 UTM projection.
  useEffect(() => {
    proj4.defs('EPSG:32650', '+proj=utm +zone=1 +datum=WGS84 +no_defs');
    register(proj4);
  }, []);

  // reset layer info when layer change.
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
        title: `${k}: [${i}]`,
        dataIndex: k.toLowerCase(),
        key: i,
      };
    });

    let data = [];
    const maxlen =
      fileJSONS[0].data.length - 10 > 0 ? 10 : fileJSONS[0].data.length;
    for (let i = 1; i < maxlen; i++) {
      if (i !== 0) {
        const source = { key: String(i) };
        fileJSONS[0].data[i].forEach((f, h) => {
          source[fileJSONS[0].data['0'][h].toLowerCase()] = f;
        });
        data = [...data, source];
      }
    }

    setCol(column);
    setData(data);
    setFile(fileJSONS);
    const mapLayers = map.getLayers().getArray();
    setLayers([...mapLayers]);
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

        const [vectorSource, hmin, hmax, lmin, lmax, middle] = dataProcess(
          file,
          {
            layerName,
            name,
            east,
            north,
            data,
            zone,
            showType,
          }
        );

        const whichType = (types) => {
          switch (types) {
            case 1:
              return 'heat';
            case 2:
              return 'icon';
            case 0:
              return 'point';
            default:
              return 'null';
          }
        };

        const type = whichType(showType);

        const heatmapLayer = new HeatmapLayer({
          source: vectorSource,
          name: layerName || fileList[0].name,
          type: 'heat',
          blur: 6,
          radius: 8,
          // gradient: ['#9bff00', '#56ae91', '#1865d6', '#be10e4', '#ff0d0d'],
          weight: (feature) => {
            let d = parseFloat(feature.get('info').data);
            d = (d - lmin) / (hmax - lmin);
            return d;
          },
        });

        const rbh = colorGradient.yellow2red;
        const rbl = colorGradient.green2yellow;

        const pointLayer = new VectorLayer({
          source: vectorSource,
          type: 'vector',
          name: layerName || fileList[0].name,
          style: (feature) => {
            const d = parseFloat(feature.get('info').data).toFixed(2);
            const colorHSL = gradientPos(
              d,
              middle,
              hmin,
              hmax,
              lmin,
              lmax,
              rbh,
              rbl
            );
            return new Style({
              image: new Circle({
                fill: new Fill({
                  color: colorHSL,
                }),
                radius: 5,
              }),
            });
          },
          dataed: {
            type,
            finalMiddle: middle,
            hmin,
            hmax,
            lmin,
            lmax,
          },
        });

        if (combineLry) {
          if (combineFt) {
            const cfeature = findLayer(combineLry)
              .getSource()
              .getFeatureById(combineFt);

            cfeature.set('info', { mat: data, data: middle });

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
                text: `${data}:${middle}`,
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

  const { Paragraph, Title } = Typography;

  return (
    <div>
      <div>
        <Title level={5}>Tips</Title>
        <Paragraph>
          <p>
            Upload bulk of <span style={{ color: 'green' }}>.csv</span> files.
          </p>
          <p style={{ fontSize: '10pt', color: 'gray' }}>
            You could either create a new layer or merge data into existed
            layers/features.
          </p>
        </Paragraph>
      </div>
      <Divider />
      <Space direction="horizontal" size="small">
        {singleUploadRef && (
          <Button
            icon={<UploadOutlined />}
            onClick={() => {
              singleUploadRef.current.click();
            }}
          >
            Files
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
        <div style={{ width: '100%', display: 'flex', flexDirection: 'row' }}>
          <Tooltip
            placement="bottom"
            color="cyan"
            title={<span style={{ fontSize: '9pt' }}>create a new layer</span>}
          >
            <Button
              style={{ width: '100%', marginRight: 8 }}
              type="primary"
              onClick={() => {
                handleMutiple();
                setComb(false);
              }}
            >
              Create
            </Button>
          </Tooltip>
          <Tooltip
            placement="bottom"
            color="cyan"
            title={
              <span style={{ fontSize: '9pt' }}>merge into layer/feature</span>
            }
          >
            <Button
              style={{ width: '100%' }}
              type="primary"
              onClick={() => {
                handleMutiple();
                setComb(true);
              }}
            >
              Combine
            </Button>
          </Tooltip>
        </div>
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
            initialValues={{ zone: 1 }}
          >
            {!comb && (
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
            )}
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
              <InputNumber min={1} max={60} />
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
            {!comb && (
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
            )}
            {comb && (
              <>
                <Form.Item
                  label="Combine to"
                  name="combineLry"
                  help="The data will merge into feature according coordinate(some data will be discarded)."
                  rules={[
                    {
                      required: true,
                      message: 'Please choose a layer.',
                    },
                  ]}
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
                          <Select.Option
                            value={layer.ol_uid}
                            key={layer.ol_uid}
                          >
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
              </>
            )}
          </Form>
          <Table
            footer={() => 'Sample of first file data'}
            columns={columns}
            dataSource={datas.slice(0, 5)}
            size="small"
            bordered
            scroll={{ x: 'max-content' }}
            pagination={false}
          />
        </Modal>
      )}
    </div>
  );
}

import React, { useContext, useEffect, useState } from 'react';
import { Vector as VectorSource } from 'ol/source';
import { Vector as VectorLayer, Heatmap as HeatmapLayer } from 'ol/layer';
import { Fill, Style, Circle, Icon } from 'ol/style';
import proj4 from 'proj4';
import Feature from 'ol/Feature';
import { register } from 'ol/proj/proj4';
import { transform } from 'ol/proj';
import Point from 'ol/geom/Point';
import {
  Table,
  Modal,
  Space,
  Form,
  Input,
  InputNumber,
  Select,
  Button,
  Upload,
  message,
  Divider,
} from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { handleFile2JSON } from '../utils/readCSV';
import { mapContext } from '../control/mapContext';
import UploadDirectory from './uploadDirectory';

export default function DataPannel() {
  const [file, setFile] = useState(null);
  const [columns, setCol] = useState([]);
  const [datas, setData] = useState([]);
  const [modal, setModal] = useState(false);
  const { map, setLayers, layers } = useContext(mapContext);
  const [form] = Form.useForm();
  const [fileList, updateFileList] = useState([]);

  useEffect(() => {
    proj4.defs(
      'EPSG:32650',
      '+proj=utm +zone=50 +datum=WGS84 +units=m +no_defs'
    );
    register(proj4);
  }, []);

  useEffect(() => {
    if (form) {
      form.resetFields();
    }
  }, [file]);

  useEffect(() => {
    if (fileList.length === 0) {
      setFile(null);
    }
  }, [fileList]);

  const reviewData = () => {
    if (file) {
      const column = file.data['0'].map((k, i) => {
        return {
          title: k,
          dataIndex: k.toLowerCase(),
          key: i,
        };
      });

      let data = [];
      for (let i = 1; i <= 10; i++) {
        if (i !== 0 && i <= 10) {
          const source = { key: String(i) };
          file.data[i].forEach((f, h) => {
            source[file.data['0'][h].toLowerCase()] = f;
          });
          data = [...data, source];
        }
      }

      setCol(column);
      setData(data);
      setModal(true);
    }
    if (form) {
      form.setFieldsValue({
        combine: null,
      });
    }
  };

  const addPoint = async () => {
    const fill = new Fill({
      color: '#ff0d0d',
    });

    const styles = [
      new Style({
        image: new Circle({
          fill: fill,
          radius: 5,
        }),
        fill: fill,
      }),
    ];

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
          combine,
        } = form.getFieldValue();
        const vectorSource = new VectorSource({
          features: [],
        });

        let allData = [];

        const findLayer = (oid) => {
          let result;
          layers.forEach((layer) => {
            if (layer.ol_uid === oid) {
              result = layer;
            }
          });
          return result;
        };

        for (let i = 1, lens = file.data.length - 1; i < lens; i++) {
          const item = file.data[i];
          if (
            item[east] &&
            item[north] !== 'na' &&
            item[data] !== 'bdl' &&
            item[data] !== 'na'
          ) {
            let lonlat = transform(
              [parseFloat(item[east]), parseFloat(item[north])],
              'EPSG:32650',
              'EPSG:4326'
            );
            lonlat = [lonlat[0] + (zone - 1) * 6, lonlat[1]];

            const datap = item[data].indexOf('<') !== -1 ? 0.1 : item[data];

            allData = [...allData, parseFloat(datap)];

            const point = new Feature({
              geometry: new Point(transform(lonlat, 'EPSG:4326', 'EPSG:3857')),
              info: { name: item[name], mat: columns[data].title, data: datap },
            });

            point.setStyle(showType === 0 ? styles : iconStyle);

            if (combine) {
              findLayer(combine).getSource().addFeature(point);
            } else {
              vectorSource.addFeature(point);
            }
          }
        }

        if (!combine) {
          const min = Math.min(...allData);
          const max = Math.max(...allData);

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

          const pointLayer = new VectorLayer({
            source: vectorSource,
            name: layerName || fileList[0].name,
          });

          if (showType === 1) {
            map.addLayer(heatmapLayer);
          } else {
            map.addLayer(pointLayer);
          }
        }

        const mapLayers = map.getLayers().getArray();
        setLayers([...mapLayers]);
        setModal(false);
      } catch (errorInfo) {
        console.log('Failed:', errorInfo);
      }
    }
  };

  return (
    <div>
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <div>
          <span>Single upload</span>
          <br />
          <Upload
            fileList={fileList}
            beforeUpload={(fv) => {
              if (fv.type !== 'application/vnd.ms-excel') {
                message.error(`${fv.name} is not a csv file`);
              }
              return fv.type === 'application/vnd.ms-excel';
            }}
            onChange={(info) => {
              updateFileList(info.fileList.filter((fv) => !!fv.status));
            }}
            customRequest={async (e) => {
              await handleFile2JSON(e.file).then((fj) => {
                setFile(fj);
                return e.onSuccess('ok');
              });
            }}
            maxCount={1}
          >
            <Button icon={<UploadOutlined />}>File</Button>
          </Upload>
          <div>
            {file ? (
              <Button block type="primary" onClick={reviewData}>
                Create data layer
              </Button>
            ) : null}
          </div>
        </div>
        <Divider />
        <UploadDirectory />
      </Space>

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
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <Form
            layout="horizontal"
            size="small"
            form={form}
            initialValues={{ zone: 31 }}
          >
            <Form.Item label="Layer name" name="layerName">
              <Input
                style={{ width: '40%' }}
                placeholder={
                  fileList.length !== 0
                    ? fileList[0].name
                    : 'please input layer name.'
                }
              />
            </Form.Item>
            <Form.Item
              label="Choose Mark Name"
              name="name"
              rules={[
                {
                  required: true,
                  message: 'Please choose mark name col.',
                },
              ]}
            >
              <Select
                style={{ width: 100 }}
                placeholder="Mark Name"
                onChange={(val) => {
                  form.setFieldsValue({ name: val });
                }}
              >
                {columns.map((col) => (
                  <Select.Option value={col.key} key={col.key}>
                    {col.title}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              label="Coordinates(East)"
              name="east"
              rules={[
                {
                  required: true,
                  message: 'Please choose east coordinate col.',
                },
              ]}
            >
              <Select
                style={{ width: 100 }}
                placeholder="Easting"
                onChange={(val) => {
                  form.setFieldsValue({ east: val });
                }}
              >
                {columns.map((col) => (
                  <Select.Option value={col.key} key={col.key}>
                    {col.title}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              label="Coordinates(North)"
              name="north"
              rules={[
                {
                  required: true,
                  message: 'Please choose north coordinate col.',
                },
              ]}
            >
              <Select
                style={{ width: 100 }}
                placeholder="Northing"
                onChange={(val) => {
                  form.setFieldsValue({ north: val });
                }}
              >
                {columns.map((col) => (
                  <Select.Option value={col.key} key={col.key}>
                    {col.title}
                  </Select.Option>
                ))}
              </Select>
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
              label="Choose Data"
              name="data"
              rules={[
                {
                  required: true,
                  message: 'Please choose data col.',
                },
              ]}
            >
              <Select
                style={{ width: 100 }}
                placeholder="Data Col."
                onChange={(val) => {
                  form.setFieldsValue({ data: val });
                }}
              >
                {columns.map((col) => (
                  <Select.Option value={col.key} key={col.key}>
                    {col.title}
                  </Select.Option>
                ))}
              </Select>
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
              name="combine"
              help="The data will merge with existed layer(option)"
            >
              <Select
                style={{ width: 200 }}
                placeholder="layer"
                onChange={(val) => {
                  form.setFieldsValue({ combine: val });
                }}
                onClear={(val) => {
                  form.setFieldsValue({ combine: null });
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
                  return <></>;
                })}
              </Select>
            </Form.Item>
          </Form>
          <Table
            footer={() => 'Sample of source data'}
            columns={columns}
            dataSource={datas.slice(0, 5)}
            size="small"
            bordered
            scroll={{ x: 'max-content' }}
            pagination={false}
          />
        </Space>
      </Modal>
    </div>
  );
}

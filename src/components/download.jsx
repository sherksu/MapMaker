/* eslint-disable prefer-destructuring */
import { Button, Tooltip, Modal, Form, Select, Checkbox } from 'antd';
import React, { useContext, useState } from 'react';
import { SaveOutlined } from '@ant-design/icons';
import { mapContext } from '../control/mapContext';

export default function DownloadMap() {
  const { map } = useContext(mapContext);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(false);
  const [form] = Form.useForm();

  const dims = {
    0: [800, 600],
    1: [1280, 1080],
    2: [2560, 1440],
  };

  const handleDownload = async () => {
    try {
      await form.validateFields();

      const { sizeset, whole } = form.getFieldsValue();

      setLoading(true);
      setModal(false);
      document.body.style.cursor = 'progress';

      // const format = document.getElementById('format').value;
      const dim = dims[sizeset];
      let width = dim[0];
      let height = dim[1];
      const size = map.getSize();
      const zoomSet = map.getView().getZoom();
      const centerSet = map.getView().getCenter();
      const viewResolution = map.getView().getResolution();

      map.once('rendercomplete', () => {
        const mapCanvas = document.createElement('canvas');
        mapCanvas.width = width;
        mapCanvas.height = height;
        const mapContent = mapCanvas.getContext('2d');
        Array.prototype.forEach.call(
          document.querySelectorAll('.ol-layer canvas'),
          (canvas) => {
            if (canvas.width > 0) {
              const opacity = canvas.parentNode.style.opacity;
              mapContent.globalAlpha = opacity === '' ? 1 : Number(opacity);
              const transform = canvas.style.transform;
              // Get the transform parameters from the style's transform matrix
              const matrix = transform
                .match(/^matrix\(([^\(]*)\)$/)[1]
                .split(',')
                .map(Number);
              // Apply the transform to the export map context
              CanvasRenderingContext2D.prototype.setTransform.apply(
                mapContent,
                matrix
              );
              mapContent.drawImage(canvas, 0, 0);
            }
          }
        );

        if (navigator.msSaveBlob) {
          navigator.msSaveBlob(mapCanvas.msToBlob(), 'map.png');
        } else {
          const link = document.getElementById('image-download');
          link.href = mapCanvas.toDataURL();
          link.click();
        }

        map.setSize(size);
        map.getView().setCenter(centerSet);
        map.getView().setZoom(zoomSet);
        map.getView().setResolution(viewResolution);
        setLoading(false);
        document.body.style.cursor = 'auto';
      });

      if (whole) {
        map.getView().setCenter([0, 0]);
        map.getView().setZoom(0);
        const sizes = map.getSize();
        const resolutions = map.getView().getResolution();
        const scaling = Math.min(sizes[0] / (height * 3), sizes[1] / height);
        map.getView().setResolution(resolutions * scaling);
        width = height * 4;
        height *= 2;
      }

      // Set print size
      const printSize = [width, height];
      map.setSize(printSize);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <Tooltip title="Export Map" placement="left" color="green">
      <Button
        type="primary"
        shape="circle"
        size="large"
        onClick={() => setModal(!modal)}
        loading={loading}
        icon={<SaveOutlined />}
      />
      <a id="image-download" download="map.png" style={{ display: 'none' }} />
      <Modal
        title="Download"
        visible={modal}
        onCancel={() => setModal(false)}
        onOk={handleDownload}
      >
        <Form form={form} labelCol={{ span: 6, offset: 0 }} labelAlign="left">
          <Form.Item
            label="size"
            name="sizeset"
            initialValue={0}
            rules={[
              {
                required: true,
                message: 'Please choose the export size.',
              },
            ]}
          >
            <Select
              defaultValue={0}
              onChange={(val) => {
                form.setFieldsValue({ sizeset: val });
              }}
            >
              <Select.Option value={0} key={0}>
                800x600
              </Select.Option>
              <Select.Option value={1} key={1}>
                1280x1080
              </Select.Option>
              <Select.Option value={2} key={2}>
                2560x1440
              </Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="whole">
            <Checkbox
              onChange={(e) => {
                form.setFieldsValue({ whole: e.target.checked });
              }}
            >
              Full Map
            </Checkbox>
          </Form.Item>
        </Form>
      </Modal>
    </Tooltip>
  );
}

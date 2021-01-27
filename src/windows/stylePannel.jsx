/* eslint-disable react/prop-types */
import React, { useState } from 'react';
import {
  Descriptions,
  Divider,
  Input,
  InputNumber,
  Space,
  Form,
  Button,
  Typography,
  Slider,
} from 'antd';
import { OSM, XYZ } from 'ol/source';
import electron from 'electron';
import { Circle, Fill, Stroke, Style, Text } from 'ol/style';
import ColorPicker, { ColorPickerOnly } from '../components/colorPicker';
import { colorGradient } from '../utils/generator';
import { calcMiddle, divideMiddle, gradientPos } from '../utils/calculator';

const { shell } = electron;

const tieStyle = {
  padding: '0.5rem 1rem',
};

const BasicStyles = ({ layer }) => {
  const basicStyle = layer.getStyle();
  const fill = basicStyle.getFill();
  const stroke = basicStyle.getStroke();

  return (
    <div>
      <Descriptions
        className="optionDes"
        title="Fill"
        bordered
        column={1}
        labelStyle={tieStyle}
        contentStyle={tieStyle}
      >
        <Descriptions.Item label="color">
          <ColorPicker
            initColor={fill.getColor()}
            layer={layer}
            setting={(color) => fill.setColor(color.toRgbString())}
          />
        </Descriptions.Item>
      </Descriptions>
      <Descriptions
        className="optionDes"
        title="Stroke"
        bordered
        column={1}
        labelStyle={tieStyle}
        contentStyle={tieStyle}
      >
        <Descriptions.Item label="color">
          <ColorPicker
            initColor={stroke.getColor()}
            layer={layer}
            setting={(color) => stroke.setColor(color.toRgbString())}
          />
        </Descriptions.Item>
        <Descriptions.Item label="width">
          <InputNumber
            size="small"
            min={1}
            max={10}
            defaultValue={stroke.getWidth()}
            onChange={(val) => {
              stroke.setWidth(val);
              layer.changed();
            }}
          />
        </Descriptions.Item>
      </Descriptions>
    </div>
  );
};

const DataStyles = ({ data, layer }) => {
  const { hmin, hmax, lmin, lmax, finalMiddle } = data;
  const [middle, setMiddle] = useState(finalMiddle);
  const [fstrok] = useState(
    new Stroke({
      color: '#000000',
      width: 1,
    })
  );
  const [ftext] = useState(
    new Text({
      fill: new Fill({ color: '#000000' }),
      scale: [1, 1],
      backgroundFill: new Fill({ color: '#ffffff' })
    })
  );
  const [colors, setColors] = useState({
    c1: '#59ff15',
    c2: '#fcdc00',
    c3: '#ff1515',
  });

  const review = (cl) => {
    const colorHex = colorGradient.createTwo(cl).view.css();
    return (
      <div
        style={{
          backgroundImage: colorHex,
          width: 100,
          height: 10,
        }}
      />
    );
  };

  const handleChange = () => {
    const { rbh, rbl } = colorGradient.createTwo(colors);
    layer
      .getSource()
      .getFeatures()
      .forEach((feature) => {
        const info = feature.get('info');
        const styles = feature.getStyle();
        if (info) {
          const colorHex = gradientPos(
            parseFloat(info.data),
            middle,
            middle,
            hmax,
            lmin,
            middle,
            rbh,
            rbl
          );
          styles.getFill().setColor(colorHex);
          styles.setStroke(fstrok);
          styles.getText().setFill(ftext.getFill());
          styles.getText().setScale(ftext.getScale());
          styles.getText().setBackgroundFill(ftext.getBackgroundFill());
        }
      });
    layer.changed();
  };

  return (
    <div>
      <Descriptions
        className="optionDes"
        title="Data Gradient"
        bordered
        direction="verticle"
        column={1}
        labelStyle={tieStyle}
        contentStyle={tieStyle}
      >
        <Descriptions.Item label="min">
          <ColorPickerOnly
            initColor={colors.c1}
            disAplpha
            setting={(color) =>
              setColors({ ...colors, c1: color.toRgbString() })
            }
          />
        </Descriptions.Item>
        <Descriptions.Item label="middle">
          <ColorPickerOnly
            initColor={colors.c2}
            disAplpha
            setting={(color) =>
              setColors({ ...colors, c2: color.toRgbString() })
            }
          />
          <InputNumber
            min={lmin}
            max={hmax}
            value={middle}
            onChange={setMiddle}
          />
        </Descriptions.Item>
        <Descriptions.Item label="max">
          <ColorPickerOnly
            initColor={colors.c3}
            disAplpha
            setting={(color) =>
              setColors({ ...colors, c3: color.toRgbString() })
            }
          />
        </Descriptions.Item>
        <Divider />
        <Descriptions.Item label="Preview">{review(colors)}</Descriptions.Item>
      </Descriptions>
      <Descriptions
        className="optionDes"
        title="Data Stroke"
        bordered
        column={1}
        labelStyle={tieStyle}
        contentStyle={tieStyle}
      >
        <Descriptions.Item label="color">
          <ColorPickerOnly
            initColor={fstrok.getColor()}
            setting={(color) => fstrok.setColor(color.toRgbString())}
          />
        </Descriptions.Item>
        <Descriptions.Item label="width">
          <InputNumber
            size="small"
            min={1}
            max={10}
            defaultValue={fstrok.getWidth()}
            onChange={(val) => {
              fstrok.setWidth(val);
            }}
          />
        </Descriptions.Item>
      </Descriptions>
      <Descriptions
        className="optionDes"
        title="Text"
        bordered
        column={1}
        labelStyle={tieStyle}
        contentStyle={tieStyle}
      >
        <Descriptions.Item label="color">
          <ColorPickerOnly
            initColor={ftext.getFill().getColor()}
            setting={(color) => ftext.getFill().setColor(color.toRgbString())}
          />
        </Descriptions.Item>
        <Descriptions.Item label="size">
          <InputNumber
            size="small"
            min={1}
            max={5}
            step={0.1}
            defaultValue={ftext.getScale()[0]}
            onChange={(val) => {
              ftext.setScale([val, val]);
            }}
          />
        </Descriptions.Item>
        <Descriptions.Item label="bgcolor">
          <ColorPickerOnly
            initColor={ftext.getBackgroundFill().getColor()}
            setting={(color) =>
              ftext.getBackgroundFill().setColor(color.toRgbString())
            }
          />
        </Descriptions.Item>
      </Descriptions>
      <Button type="primary" block onClick={handleChange}>
        Change
      </Button>
    </div>
  );
};

const ImageStyles = ({ data, layer }) => {
  const { hmin, hmax, lmin, lmax, finalMiddle } = data;
  const [middle, setMiddle] = useState(finalMiddle);
  const [radius, setRadius] = useState(5);
  const [colors, setColors] = useState({
    c1: '#59ff15',
    c2: '#fcdc00',
    c3: '#ff1515',
  });
  const [fstrok] = useState(
    new Stroke({
      color: '#000000',
      width: 1,
    })
  );

  const review = (cl) => {
    const colorHex = colorGradient.createTwo(cl).view.css();
    return (
      <div
        style={{
          backgroundImage: colorHex,
          width: 100,
          height: 10,
        }}
      />
    );
  };

  const handleChange = () => {
    const { rbh, rbl } = colorGradient.createTwo(colors);

    layer.setStyle((feature) => {
      const d = parseFloat(feature.get('info').data).toFixed(2);
      const colorHSL = gradientPos(
        d,
        middle,
        middle,
        hmax,
        lmin,
        middle,
        rbh,
        rbl
      );
      return new Style({
        image: new Circle({
          fill: new Fill({
            color: colorHSL,
          }),
          stroke: fstrok,
          radius,
        }),
      });
    });
    layer.changed();
  };

  return (
    <div>
      <Descriptions
        className="optionDes"
        title="Data Gradient"
        bordered
        direction="verticle"
        column={1}
        labelStyle={tieStyle}
        contentStyle={tieStyle}
      >
        <Descriptions.Item label="min">
          <ColorPickerOnly
            initColor={colors.c1}
            disAplpha
            setting={(color) =>
              setColors({ ...colors, c1: color.toRgbString() })
            }
          />
        </Descriptions.Item>
        <Descriptions.Item label="middle">
          <ColorPickerOnly
            initColor={colors.c2}
            disAplpha
            setting={(color) =>
              setColors({ ...colors, c2: color.toRgbString() })
            }
          />
          <InputNumber
            min={lmin}
            max={hmax}
            value={middle}
            onChange={setMiddle}
          />
        </Descriptions.Item>
        <Descriptions.Item label="max">
          <ColorPickerOnly
            initColor={colors.c3}
            disAplpha
            setting={(color) =>
              setColors({ ...colors, c3: color.toRgbString() })
            }
          />
        </Descriptions.Item>
        <Divider />
        <Descriptions.Item label="Preview">{review(colors)}</Descriptions.Item>
      </Descriptions>
      <Descriptions
        className="optionDes"
        title="Circle"
        bordered
        column={1}
        labelStyle={tieStyle}
        contentStyle={tieStyle}
      >
        <Descriptions.Item label="radius">
          <InputNumber
            size="small"
            min={1}
            max={20}
            value={radius}
            onChange={(val) => {
              setRadius(val);
            }}
          />
        </Descriptions.Item>
      </Descriptions>
      <Descriptions
        className="optionDes"
        title="Circle Stroke"
        bordered
        column={1}
        labelStyle={tieStyle}
        contentStyle={tieStyle}
      >
        <Descriptions.Item label="color">
          <ColorPickerOnly
            initColor={fstrok.getColor()}
            setting={(color) => fstrok.setColor(color.toRgbString())}
          />
        </Descriptions.Item>
        <Descriptions.Item label="width">
          <InputNumber
            size="small"
            min={1}
            max={10}
            defaultValue={fstrok.getWidth()}
            onChange={(val) => {
              fstrok.setWidth(val);
            }}
          />
        </Descriptions.Item>
      </Descriptions>
      <Button type="primary" block onClick={handleChange}>
        Change
      </Button>
    </div>
  );
};

const VectorLryStyle = ({ layer }) => {
  const hasData = layer.get('dataed');

  const editor = (dataed) => {
    if (!dataed) {
      return <BasicStyles layer={layer} />;
    }

    if (dataed.type === 'location') {
      return (
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          <BasicStyles layer={layer} />
          <Divider style={{ margin: 0 }} />
          <DataStyles data={dataed} layer={layer} />
        </Space>
      );
    }

    if (dataed.type === 'feature') {
      const allData = [];
      layer
        .getSource()
        .getFeatures()
        .forEach((feature) => {
          if (feature.get('info')) {
            allData.push(parseFloat(feature.get('info').data));
          }
        });

      const middle = calcMiddle(allData, 2);
      const [, , hmin, hmax, lmin, lmax] = divideMiddle(allData, middle);
      const Gdata = { finalMiddle: middle, hmin, hmax, lmin, lmax };

      return (
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          <BasicStyles layer={layer} />
          <Divider style={{ margin: 0 }} />
          <DataStyles data={Gdata} layer={layer} />
        </Space>
      );
    }

    if (dataed.type === 'point') {
      return (
        <div>
          <ImageStyles data={dataed} layer={layer} />
        </div>
      );
    }

    if (dataed.type === 'icon') {
      return (
        <div>
          <div>This version do not support change Icon.</div>
        </div>
      );
    }

    return <div>This Layer do not support modify Styles in this version.</div>;
  };

  return <div>{editor(hasData)}</div>;
};

const HeatStyle = ({ layer }) => {
  const [blur, setBlur] = useState(layer.getBlur());
  const [radius, setRadius] = useState(layer.getRadius());

  const setBlurs = (value) => {
    layer.setBlur(value);
    setBlur(value);
    layer.changed();
  };

  const setRads = (value) => {
    layer.setRadius(value);
    setRadius(value);
    layer.changed();
  };

  return (
    <Space direction="vertical" size="small" style={{ width: '100%' }}>
      <div>
        <h4>Set Blur</h4>
        <Slider min={1} max={50} step={1} onChange={setBlurs} value={blur} />
      </div>
      <div>
        <h4>Set Radius</h4>
        <Slider min={1} max={50} step={1} onChange={setRads} value={radius} />
      </div>
    </Space>
  );
};

const DefaultStyles = ({ layer }) => {
  const [form] = Form.useForm();

  const { Paragraph, Link } = Typography;

  const handle2XYZ = async () => {
    try {
      await form.validateFields();
      layer.setSource(
        new XYZ({
          url: form.getFieldValue('xyz'),
        })
      );
      layer.changed();
    } catch (err) {
      console.log(err);
    }
  };

  const handleReset = () => {
    layer.setSource(new OSM());
    layer.changed();
  };

  return (
    <>
      <div>
        <Paragraph>
          <p>Change the style of default map.</p>
          <p style={{ fontSize: '10pt', color: 'gray' }}>
            could get api from{' '}
            <Link
              href="none"
              onClick={(e) => {
                e.preventDefault();
                shell.openExternal('https://www.mapbox.com/');
              }}
            >
              mapbox
            </Link>
            (need registe).
          </p>
          <p style={{ fontSize: '10pt', color: 'gray' }}>
            when you create the map, could find url in share modal window
            <br />
            <i style={{ color: 'orange' }}>Third party/Fulcrum.</i>
          </p>
        </Paragraph>
      </div>
      <Form form={form} size="small">
        <Form.Item
          label="XYZ api"
          name="xyz"
          rules={[
            {
              required: true,
              message: 'Input valid api url.',
            },
          ]}
        >
          <Input />
        </Form.Item>
      </Form>
      <div style={{ width: '100%', display: 'flex', flexDirection: 'row' }}>
        <Button
          style={{ width: '100%', marginRight: 8 }}
          type="primary"
          onClick={handle2XYZ}
        >
          Change
        </Button>
        <Button
          style={{ width: '100%', marginRight: 8 }}
          type="dashed"
          onClick={handleReset}
        >
          Reset
        </Button>
      </div>
    </>
  );
};

export { VectorLryStyle, DefaultStyles, HeatStyle };

import React from 'react';
import { Collapse, Tooltip } from 'antd';
import { QuestionCircleOutlined, LayoutOutlined } from '@ant-design/icons';
import DragableList from '../components/dragableList';

const { Panel } = Collapse;

export default function LayerPannel() {
  // const setBlur = (value, layer) => {
  //   layer.setBlur(value);
  // };

  // const setRad = (value, layer) => {
  //   layer.setRadius(value);
  // };

  return (
    <Collapse className="colNull">
      <Panel
        bordered={false}
        header={
          <span>
            <LayoutOutlined style={{ float: 'left', fontSize: '12pt' }} />
            <i>Layer panel</i>
          </span>
        }
        key={1}
        showArrow={false}
        className="panelNull"
        extra={
          <Tooltip
            placement="bottom"
            color="green"
            title={
              <span style={{ fontSize: '10pt' }}>
                - Edit layer style <br />- Drag to reset layer proirity
              </span>
            }
          >
            <QuestionCircleOutlined />
          </Tooltip>
        }
      >
        <DragableList />
      </Panel>
    </Collapse>
  );
}

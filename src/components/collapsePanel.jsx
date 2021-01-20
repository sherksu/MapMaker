import React from 'react';
import { Collapse } from 'antd';
import UploadPannel from '../windows/uploadPannel.jsx';
import LayerPannel from '../windows/layerPannel';
import DataPannel from '../windows/dataPannel';

const { Panel } = Collapse;

export default function ColPanel() {
  return (
    <div className="scrollNull">
      <Collapse>
        <Panel header="Geojson" key="1">
          <UploadPannel />
        </Panel>
        <Panel header="Layers" key="2">
          <LayerPannel />
        </Panel>
        <Panel header="DataSet" key="3">
          <DataPannel />
        </Panel>
      </Collapse>
    </div>
  );
}

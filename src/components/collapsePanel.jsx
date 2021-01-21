import React from 'react';
import { Collapse, Drawer } from 'antd';
import UploadPannel from '../windows/uploadPannel';
import UploadDirectory from '../windows/uploadDirectory';

const { Panel } = Collapse;

export default function ColPanel({ visible, setVisible }) {
  const handleClose = () => {
    setVisible(false);
  };

  return (
    <>
      <Drawer
        title="Load Data"
        placement="right"
        mask={false}
        onClose={handleClose}
        visible={visible}
        bodyStyle={{ padding: 0 }}
        width="20vw"
        style={visible ? { minWidth: 300 } : null}
        key="right"
      >
        <div className="scrollNull">
          <Collapse>
            <Panel header="Geojson" key="1">
              <UploadPannel />
            </Panel>
            <Panel header="DataSet" key="2">
              <UploadDirectory />
            </Panel>
          </Collapse>
        </div>
      </Drawer>
    </>
  );
}

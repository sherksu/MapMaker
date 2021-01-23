import React from 'react';
import { Collapse, Drawer } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import UploadPannel from '../windows/uploadPannel';
import UploadDirectory from '../windows/uploadDirectory';

const { Panel } = Collapse;

const drawerStyle = {
  position: 'relative',
  height: '100vh',
};

export default function ColPanel({ visible, setVisible }) {
  const handleClose = () => {
    setVisible(false);
  };

  return (
    <>
      <Drawer
        title={<span style={{ color: 'white' }}>Load Data</span>}
        headerStyle={{ padding: '1rem', background: '#096dd9' }}
        placement="right"
        mask={false}
        onClose={handleClose}
        closeIcon={<CloseOutlined style={{ color: 'white' }} />}
        visible={visible}
        bodyStyle={{ padding: 0 }}
        width="20vw"
        style={visible ? { ...drawerStyle, minWidth: 300 } : drawerStyle}
        key="right"
        getContainer={false}
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

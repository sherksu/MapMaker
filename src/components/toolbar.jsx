import React, { useState } from 'react';
import { Button, Tooltip, Space } from 'antd';
import { ProfileOutlined } from '@ant-design/icons';
import ColPanel from './collapsePanel';
import DownloadMap from './download';

export default function ToolBar() {
  const [visible, setVisible] = useState(false);

  const showDrawer = () => {
    setVisible(!visible);
  };

  return (
    <div>
      <Space size="middle" direction="vertical">
        <Tooltip title="Load Data" placement="left" color="green">
          <Button
            type="primary"
            shape="circle"
            size="large"
            icon={<ProfileOutlined />}
            onClick={showDrawer}
          />
        </Tooltip>
        <DownloadMap />
      </Space>
      <ColPanel visible={visible} setVisible={setVisible} />
    </div>
  );
}

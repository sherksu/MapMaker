import { Drawer } from 'antd';
import React, { useState, useCallback, useContext, useEffect } from 'react';
import update from 'react-addons-update';
import { mapContext } from '../control/mapContext';
import StylePannel, { VectorLryStyle } from '../windows/stylePannel';
import DragableItem from './dragbleItem';

const DragableContainer = () => {
  const { map, layers, setLayers } = useContext(mapContext);
  const [styleDrawer, setStyleDrawer] = useState(null);
  const [refresh, setRefresh] = useState(false);
  const [lry, setLry] = useState([]);

  useEffect(() => {
    if (map) {
      setLry(map.getLayers().getArray());
    }
  }, [refresh, map, layers]);

  const moveCard = useCallback(
    (dragIndex, hoverIndex) => {
      const dragCard = lry[dragIndex];
      const newIndex = update(lry, {
        $splice: [
          [dragIndex, 1],
          [hoverIndex, 0, dragCard],
        ],
      });
      newIndex.forEach((layer, i) => {
        layer.setZIndex(i - 100);
      });
      setLry(newIndex);
      setLayers(newIndex);
    },
    [layers]
  );

  const styleShow = (type) => {
    switch (type) {
      case 'default':
        return <div>default</div>;
      case 'heat':
        return <div>heat</div>;
      case 'vector':
        return <VectorLryStyle layer={styleDrawer} />;
      default:
        return <div style={{ color: 'red' }}>Something going wrong.</div>;
    }
  };

  const renderCard = (card, index) => {
    return (
      <DragableItem
        key={card.ol_uid}
        index={index}
        id={card.ol_uid}
        layer={card}
        moveCard={moveCard}
        refresh={refresh}
        setRefresh={setRefresh}
        setStyleDrawer={setStyleDrawer}
      />
    );
  };

  return (
    <>
      <div>
        {lry
          .sort((a, b) => {
            const x = a.getZIndex() ? a.getZIndex() : 0;
            const y = b.getZIndex() ? b.getZIndex() : 0;
            return x - y;
          })
          .map((card, i) => renderCard(card, i))}
      </div>
      <Drawer
        title="Style Edit"
        placement="left"
        mask={false}
        onClose={() => {
          setStyleDrawer(null);
        }}
        visible={styleDrawer}
        key="left"
      >
        {styleDrawer && styleShow(styleDrawer.get('type'))}
      </Drawer>
    </>
  );
};

export default DragableContainer;

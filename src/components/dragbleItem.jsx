import { Space } from 'antd';
import React, { useContext, useRef, useState } from 'react';
import ReactDom from 'react-dom';
import { useDrag, useDrop } from 'react-dnd';
import Icon, {
  EyeOutlined,
  EyeInvisibleOutlined,
  DeleteOutlined,
  DragOutlined,
  EditOutlined,
} from '@ant-design/icons';
import { mapContext } from '../control/mapContext';

const ItemTypes = {
  CARD: 'card',
};

const style = {
  border: '1px solid rgb(200, 200, 200)',
  padding: '0.2rem 0.5rem',
  backgroundColor: 'white',
  width: '100%',
  overflow: 'hidden',
};
const handleStyle = {
  width: '1rem',
  height: '1rem',
  display: 'inline-block',
  marginRight: '0.75rem',
  cursor: 'move',
};

const VisIcon = ({ layer }) => {
  const [visible, setVisible] = useState(layer.get('visible'));
  return (
    <Icon
      component={visible ? EyeOutlined : EyeInvisibleOutlined}
      onClick={() => {
        layer.setVisible(!visible);
        setVisible(!visible);
      }}
    />
  );
};

export default function DragableItem({
  id,
  layer,
  index,
  moveCard,
  refresh,
  setRefresh,
  setStyleDrawer,
}) {
  const { map, setLayers, layers } = useContext(mapContext);
  const ref = useRef(null);
  const [, drop] = useDrop({
    accept: ItemTypes.CARD,
    hover(item, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;
      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }
      // Determine rectangle on screen
      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      // Get vertical middle
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      // Determine mouse position
      const clientOffset = monitor.getClientOffset();
      // Get pixels to the top
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;
      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%
      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }
      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }
      // Time to actually perform the action
      moveCard(dragIndex, hoverIndex);
      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex;
    },
  });
  const [{ isDragging }, drag] = useDrag({
    item: { type: ItemTypes.CARD, id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });
  const opacity = isDragging ? 0 : 1;
  drag(drop(ref));
  return (
    <>
      <div ref={ref} style={{ ...style, opacity }}>
        <div ref={drag} style={handleStyle}>
          <DragOutlined />
        </div>
        <span style={{ maxWidth: 40, overflow: 'hidden', userSelect: 'none' }}>
          {layer.get('name')}:{index}
        </span>
        <Space
          size="small"
          direction="horizontal"
          style={{ float: 'right', lineHeight: '1rem' }}
        >
          {layer.get('type') !== 'default' && (
            <Icon
              component={DeleteOutlined}
              onClick={() => {
                map.removeLayer(layer);
                setRefresh(!refresh);
              }}
            />
          )}
          <Icon
            component={EditOutlined}
            onClick={() => {
              setStyleDrawer(layer);
            }}
          />
          <VisIcon layer={layer} />
        </Space>
      </div>
    </>
  );
}

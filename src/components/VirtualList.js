import React, { useState, useEffect, useRef } from 'react';
import { List } from 'antd';
import { FixedSizeList as VList } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';

const VirtualList = ({ data, renderItem, itemHeight = 73, className }) => {
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);
  const listRef = useRef();

  useEffect(() => {
    const handleResize = () => {
      setWindowHeight(window.innerHeight);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const Row = ({ index, style }) => {
    const item = data[index];
    return (
      <div style={style}>
        {renderItem(item, index)}
      </div>
    );
  };

  if (!data || data.length === 0) {
    return (
      <List
        className={className}
        dataSource={[]}
        renderItem={renderItem}
        locale={{ emptyText: 'No data' }}
      />
    );
  }

  return (
    <div style={{ height: Math.min(windowHeight * 0.7, data.length * itemHeight) }}>
      <AutoSizer>
        {({ height, width }) => (
          <VList
            ref={listRef}
            height={height}
            itemCount={data.length}
            itemSize={itemHeight}
            width={width}
          >
            {Row}
          </VList>
        )}
      </AutoSizer>
    </div>
  );
};

export default VirtualList;
import React from 'react';
import { Layout, Menu } from 'antd';
import { BookOutlined, UserOutlined, SwapOutlined } from '@ant-design/icons';
import './App.css';
import BookManagement from './components/BookManagement';
import ReaderManagement from './components/ReaderManagement';
import BorrowManagement from './components/BorrowManagement';

const { Header, Content, Sider } = Layout;

const App: React.FC = () => {
  const [selectedKey, setSelectedKey] = React.useState('1');

  const renderContent = () => {
    switch (selectedKey) {
      case '1':
        return <BookManagement />;
      case '2':
        return <ReaderManagement />;
      case '3':
        return <BorrowManagement />;
      default:
        return <BookManagement />;
    }
  };

  return (
    <Layout>
      <Header style={{ padding: 0, background: '#fff' }}>
        <div style={{ padding: '0 24px', fontSize: '20px', fontWeight: 'bold', color: '#1890ff' }}>
          图书馆管理系统
        </div>
      </Header>
      <Layout hasSider>
        <Sider style={{ background: '#fff' }} width={200}>
          <Menu
            mode="inline"
            selectedKeys={[selectedKey]}
            style={{ height: '100%' }}
            onClick={({ key }) => setSelectedKey(key)}
            items={[
              {
                key: '1',
                icon: <BookOutlined />,
                label: '图书管理'
              },
              {
                key: '2',
                icon: <UserOutlined />,
                label: '读者管理'
              },
              {
                key: '3',
                icon: <SwapOutlined />,
                label: '借阅管理'
              }
            ]}
          />
        </Sider>
        <Content style={{ margin: '24px', background: '#fff', padding: '24px', minHeight: 280 }}>
          {renderContent()}
        </Content>
      </Layout>
    </Layout>
  );
};

export default App;

import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Switch, useHistory, useLocation } from 'react-router-dom';
import { Layout, Menu, message } from 'antd';
import {
    BarChartOutlined,
    SyncOutlined,
    LineChartOutlined,
    SettingOutlined,
    DatabaseOutlined
} from '@ant-design/icons';
import Sync from './components/Sync';
import Stats from './components/Stats';
import Insight from './components/Insight';
import Config from './components/Config';
import DataManagement from './components/DataManagement';
import { initWasm } from './utils/wasmUtils';

const { Header, Content } = Layout;

const NavigationMenu = () => {
    const history = useHistory();
    const location = useLocation();

    const menuItems = [
        { key: '/', label: 'Stats', icon: <BarChartOutlined /> },
        { key: '/sync', label: 'Sync', icon: <SyncOutlined /> },
        { key: '/insight', label: 'Insight', icon: <LineChartOutlined /> },
        { key: '/config', label: 'Config', icon: <SettingOutlined /> },
        { key: '/manage', label: 'Data Management', icon: <DatabaseOutlined /> }
    ];

    return (
        <Menu
            theme="dark"
            mode="horizontal"
            selectedKeys={[location.pathname]}
            items={menuItems}
            onClick={({ key }) => history.push(key)}
        />
    );
};

const App = () => {
    useEffect(() => {
        // Initialize WASM module
        initWasm().catch(error => {
            console.error('Failed to initialize WASM:', error);
            message.error('Failed to initialize application. Please refresh the page.');
        });
    }, []);

    return (
        <Router>
            <Layout>
                <Header>
                    <NavigationMenu />
                </Header>
                <Content style={{ padding: '24px', minHeight: 'calc(100vh - 64px)' }}>
                    <Switch>
                        <Route exact path="/" component={Stats} />
                        <Route path="/sync" component={Sync} />
                        <Route path="/insight" component={Insight} />
                        <Route path="/config" component={Config} />
                        <Route path="/manage" component={DataManagement} />
                    </Switch>
                </Content>
            </Layout>
        </Router>
    );
};

export default App;

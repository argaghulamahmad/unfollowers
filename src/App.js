import React, { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Route, Switch, useHistory, useLocation } from 'react-router-dom';
import { Layout, Menu, message, Spin } from 'antd';
import {
    BarChartOutlined,
    SyncOutlined,
    LineChartOutlined,
    SettingOutlined,
    DatabaseOutlined
} from '@ant-design/icons';
import { initWasm } from './utils/wasmUtils';
import './styles/App.css';
import './styles/Upload.css';

const { Header, Content } = Layout;

// Lazy load components
const Stats = lazy(() => import('./components/Stats'));
const Sync = lazy(() => import('./components/Sync'));
const Insight = lazy(() => import('./components/Insight'));
const Config = lazy(() => import('./components/Config'));
const DataManagement = lazy(() => import('./components/DataManagement'));

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
                    <Suspense fallback={<div style={{ textAlign: 'center', padding: '50px' }}><Spin size="large" /></div>}>
                        <Switch>
                            <Route exact path="/" component={Stats} />
                            <Route path="/sync" component={Sync} />
                            <Route path="/insight" component={Insight} />
                            <Route path="/config" component={Config} />
                            <Route path="/manage" component={DataManagement} />
                        </Switch>
                    </Suspense>
                </Content>
            </Layout>
        </Router>
    );
};

export default App;

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
import ErrorBoundary from './components/ErrorBoundary';
import './styles/App.css';
import './styles/Upload.css';

const { Header, Content } = Layout;

// Register service worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/serviceWorker.js')
            .then(registration => {
                console.log('ServiceWorker registration successful');
            })
            .catch(err => {
                console.log('ServiceWorker registration failed: ', err);
            });
    });
}

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
            message.error('Failed to initialize WASM module');
            console.error('WASM initialization error:', error);
        });
    }, []);

    return (
        <ErrorBoundary>
            <Router>
                <Layout className="layout">
                    <Header>
                        <NavigationMenu />
                    </Header>
                    <Content style={{ padding: '0 50px', marginTop: 64 }}>
                        <Suspense fallback={<div className="loading-container"><Spin size="large" /></div>}>
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
        </ErrorBoundary>
    );
};

export default App;

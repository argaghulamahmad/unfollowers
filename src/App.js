import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { Layout, message } from 'antd';
import Sync from './components/Sync';
import Stats from './components/Stats';
import Insight from './components/Insight';
import Config from './components/Config';
import DataManagement from './components/DataManagement';
import { initWasm } from './utils/wasmUtils';

const { Content } = Layout;

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
                <Content style={{ padding: '50px' }}>
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

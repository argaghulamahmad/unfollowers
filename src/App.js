import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
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
                    <Routes>
                        <Route path="/" element={<Stats />} />
                        <Route path="/sync" element={<Sync />} />
                        <Route path="/insight" element={<Insight />} />
                        <Route path="/config" element={<Config />} />
                        <Route path="/manage" element={<DataManagement />} />
                    </Routes>
                </Content>
            </Layout>
        </Router>
    );
};

export default App;

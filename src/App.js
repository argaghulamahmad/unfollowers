import React from 'react';
import './App.css';
import { BrowserRouter as Router, Link, Route, Switch } from "react-router-dom";
import { Divider, Menu, Space } from "antd";
import Insight from "./components/Insight";
import Uploader from './components/Uploader';
import Config from "./components/Config";
import Stats from "./components/Stats";

const menuItems = [
    { key: "stats", label: "Stats", path: "/stats", component: Stats },
    { key: "insight", label: "Insight", path: "/", component: Insight },
    { key: "uploadFile", label: "Upload", path: "/upload", component: Uploader },
    { key: "config", label: "Config", path: "/config", component: Config },
];

function App() {
    return (
        <div className="App">
            <Router>
                <div className="App">
                    <div className="AppContent">
                        <Divider orientation="center">
                            <h1>Unfollowers</h1>
                        </Divider>
                        <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
                            <Menu style={{ position: 'relative', display: 'flex', justifyContent: 'center' }} mode="horizontal">
                                {menuItems.map(item => (
                                    <Menu.Item key={item.key}>
                                        <Link to={item.path}>{item.label}</Link>
                                    </Menu.Item>
                                ))}
                            </Menu>
                            <Switch>
                                {menuItems.map(item => (
                                    <Route key={item.key} exact path={item.path} render={() => <item.component />} />
                                ))}
                            </Switch>
                        </Space>
                    </div>
                </div>
            </Router>
        </div>
    );
}

export default App;

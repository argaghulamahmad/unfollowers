import './App.css';

import {BrowserRouter as Router, Link, Route, Switch} from "react-router-dom";
import {Divider, Menu, Space} from "antd";
import Insight from "./components/Insight";
import Uploader from './components/Uploader';
import Config from "./components/Config";
import Stats from "./components/Stats";

function App() {
    return (
        <div className="App">
            <Router>
                <div className="App">
                    <div className="AppContent">
                        <Divider orientation="center">
                            <h1>Unfollowers</h1>
                        </Divider>

                        <Space direction="vertical" size="middle" style={{display: 'flex'}}>
                            <Menu style={{
                                position: 'relative',
                                display: 'flex',
                                justifyContent: 'center'
                            }} mode="horizontal">
                                <Menu.Item key="stats">
                                    <Link to="/stats">Stats</Link>
                                </Menu.Item>
                                <Menu.Item key="insight">
                                    <Link to="/">Insight</Link>
                                </Menu.Item>
                                <Menu.Item key="uploadFile">
                                    <Link to="/upload">Upload</Link>
                                </Menu.Item>
                                <Menu.Item key="config">
                                    <Link to="/config">Config</Link>
                                </Menu.Item>
                            </Menu>

                            <Switch>
                                <Route exact path="/stats">
                                    <Stats/>
                                </Route>
                                <Route exact path="/">
                                    <Insight/>
                                </Route>
                                <Route exact path="/upload">
                                    <Uploader/>
                                </Route>
                                <Route exact path="/config">
                                    <Config/>
                                </Route>
                            </Switch>
                        </Space>
                    </div>
                </div>
            </Router>
        </div>
    );
}

export default App;

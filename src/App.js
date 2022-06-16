import './App.css';

import Data from "./components/Data";
import Uploader from './components/Uploader';
import {BrowserRouter as Router, Link, Route, Switch} from "react-router-dom";
import {Divider, Menu} from "antd";

function App() {
    return (
        <div className="App">
            <Router>
                <div className="App">
                    <div className="AppContent">
                        <Divider orientation="center">
                            <h1>Teligobot</h1>
                            <Menu mode="horizontal">
                                <Menu.Item key="home">
                                    <Link to="/">Home</Link>
                                </Menu.Item>
                                <Menu.Item key="uploadFile">
                                    <Link to="/upload">Upload</Link>
                                </Menu.Item>
                            </Menu>
                        </Divider>

                        <Switch>
                            <Route exact path="/">
                                <Data/>
                            </Route>
                            <Route exact path="/upload">
                                <Uploader/>
                            </Route>
                        </Switch>
                    </div>
                </div>
            </Router>
        </div>
    );
}

export default App;

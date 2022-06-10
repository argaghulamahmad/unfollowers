import React from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter as Router, Link, Route, Switch} from "react-router-dom";

import './index.css';
import 'antd/dist/antd.css'

import reportWebVitals from './reportWebVitals';

import {ApolloClient, ApolloProvider, InMemoryCache} from "@apollo/client";

import {ReactKeycloakProvider} from "@react-keycloak/web";
import keycloakClient from "./Keycloak"

import {Divider, Menu} from "antd";

import Data from './pages/Data';
import Help from "./pages/Help";

import PrivateRoute from "./helpers/PrivateRoute";
import UploadFile from "./pages/Upload";

let gqlUri = process.env.REACT_APP_GQL_ENDPOINT;

const client = new ApolloClient({
    uri: gqlUri,
    cache: new InMemoryCache()
});


ReactDOM.render(
    <React.StrictMode>
        <ApolloProvider client={client}>
            <ReactKeycloakProvider authClient={keycloakClient}>
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
                                        <Link to="/uploadFile">Upload</Link>
                                    </Menu.Item>
                                    <Menu.Item key="help">
                                        <Link to="/help">Help</Link>
                                    </Menu.Item>
                                </Menu>
                            </Divider>

                            <Switch>
                                <Route exact path="/">
                                    <PrivateRoute>
                                        <Data/>
                                    </PrivateRoute>
                                </Route>
                                <Route exact path="/uploadFile">
                                    <PrivateRoute>
                                        <UploadFile/>
                                    </PrivateRoute>
                                </Route>
                                <Route exact path="/help">
                                    <Help/>
                                </Route>
                            </Switch>
                        </div>
                    </div>
                </Router>
            </ReactKeycloakProvider>
        </ApolloProvider>
    </React.StrictMode>,
    document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

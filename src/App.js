import './App.css';

import Data from "./components/Data";
import Uploader from './components/Uploader';
import {BrowserRouter as Router, Route, Switch} from "react-router-dom";

function App() {
    return (
        <div className="App">
            <Router>
                <div className="App">
                    <div className="AppContent">
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

import {useKeycloak} from "@react-keycloak/web";
import {Button} from "antd";

const PrivateRoute = ({children}) => {
    const {keycloak} = useKeycloak();

    const isLoggedIn = keycloak.authenticated;

    return isLoggedIn ? children : <div>
        <Button type="primary" onClick={() => keycloak.login()} block>
            Sign In
        </Button>
        <Button type="text" primary onClick={() => keycloak.register()} block>
            Sign Up
        </Button>
    </div>;
};

export default PrivateRoute;

import {useKeycloak} from "@react-keycloak/web";
import {Button} from "antd";

const CanLogout = () => {
    const {keycloak} = useKeycloak();

    const isLoggedIn = keycloak.authenticated;

    return isLoggedIn ? <div>
        <Button type="text" danger onClick={() => keycloak.logout()} block>
            Sign Out
        </Button>
    </div> : null;
};

export default CanLogout;

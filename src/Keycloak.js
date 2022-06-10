import Keycloak from "keycloak-js";

let keyCloackClientId = process.env.REACT_APP_KEYCLOACK_CLIENT_ID;

const keycloak = new Keycloak({
    url: "https://auth.argaghulamahmad.dev/auth",
    realm: "Teligobot",
    clientId: keyCloackClientId,
});

export default keycloak;

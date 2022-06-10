import {gql} from "@apollo/client";

const GET_TELIGOBOT_PROFILES = gql`
    query GetTeligobotProfiles($req: TeligobotRequest) {
        teligobotProfiles(input: $req) {
            Epoch
            Link
            Timestamp
            Username
        }
    }
`;

export default GET_TELIGOBOT_PROFILES

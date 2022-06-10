import {gql} from "@apollo/client";

const GET_LATEST_UPDATED_AT = gql`
    query GetLatestUpdatedAt($req: TeligobotLastUpdatedAtRequest) {
      lastUpdatedAt(input: $req) {
        lastUpdatedAt
      }
    }
`;

export default GET_LATEST_UPDATED_AT

import {useCallback} from 'react';
import {useLazyQuery} from '@apollo/react-hooks';
import getProfiles from './useGetProfiles.graphql.js';

const useGetProfiles = (onLoaded) => {
    const [doFetch, {loading = false, error = false}] = useLazyQuery(getProfiles, {
        fetchPolicy: 'network-only',
        onCompleted: _data => {
            const {teligobotProfiles} = _data || [];
            onLoaded({data: teligobotProfiles});
        },
    });

    const load = useCallback((params) => {
        doFetch({
            variables: {
                ...params,
            },
        });
    }, [doFetch]);

    return {getProfilesLoading: loading, getProfilesError: error, getProfilesLoad: load};
};

export default useGetProfiles;

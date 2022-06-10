import {useCallback} from 'react';
import {useLazyQuery} from '@apollo/react-hooks';
import getLatestUpdatedAt from './useGetLatestUpdatedAt.graphql.js';

const useGetLatestUpdatedAt = (onLoaded) => {
    const [doFetch, {loading = false, error = false}] = useLazyQuery(getLatestUpdatedAt, {
        fetchPolicy: 'network-only',
        onCompleted: _data => {
            const {lastUpdatedAt} = _data.lastUpdatedAt || "";
            onLoaded({data: lastUpdatedAt});
        },
    });

    const load = useCallback((params) => {
        doFetch({
            variables: {
                ...params,
            },
        });
    }, [doFetch]);

    return {getLatestUpdatedAtLoading: loading, getLatestUpdatedAtError: error, getLatestUpdatedAtLoad: load};
};

export default useGetLatestUpdatedAt;

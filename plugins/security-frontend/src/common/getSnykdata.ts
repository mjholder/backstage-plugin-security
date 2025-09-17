import { useState, useEffect } from 'react';
import { useApi, configApiRef, fetchApiRef } from '@backstage/core-plugin-api';

export const getSnykData = () => {
    const [result, setResult] = useState<any>({});
    const [loaded, setLoaded] = useState<boolean>(false);
    const [error, setError] = useState<boolean>(false);
    const [projectId, setProjectId] = useState<string>("");

    // Get Backstage objects
    const config = useApi(configApiRef);
    const fetchApi = useApi(fetchApiRef);
    const backendUrl = config.getString('backend.baseUrl');

    const getProjectId = (data: Array<String>) => {
        data.map((projTarget) => {
            if (projTarget?.attributes?.display_name === "insights-platform/malware-detection-backend") {
                return projTarget?.id;
            }

            return ""
        })
    }

    const getGrypeRepoData = async () => {
        // Find project ID
        await fetchApi.fetch(`${backendUrl}/api/proxy/snyk/rest/orgs/ORG_ID/targets?version=2024-08-25&limit=100`)
            .then(response => response.json())
            .then(response => {
                setProjectId(getProjectId(response.data))
            })
            .catch((_error) => {
                setError(true)
                console.error(`Error fetching Snyk project target data: ${_error}`);
            })
    }

    useEffect(() => {
        getGrypeRepoData()
    }, []);

    return { result, loaded, error }
}

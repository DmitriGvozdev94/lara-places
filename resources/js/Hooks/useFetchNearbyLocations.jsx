import { useState, useEffect } from 'react';
import axios from 'axios';

export default function useFetchNearbyLocations(latitude, longitude, radius, tags = [], size = 10) {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!latitude || !longitude || !radius) return;

        async function fetchData() {
            try {
                const response = await axios.post('/fetch-locations', {
                    latitude,
                    longitude,
                    radius,
                    tags,
                    size
                });

                if (response.status === 200) {
                    setData(response.data);
                    setError(null);
                } else {
                    console.error(`Error: ${response.status} - ${response.statusText}`);
                    setError('Failed to fetch data');
                }
            } catch (err) {
                console.error('Error fetching locations:', err);
                setError('Failed to fetch data');
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [latitude, longitude, radius, tags, size]);

    return { data, loading, error };
}

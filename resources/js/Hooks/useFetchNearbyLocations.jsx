// resources/js/Hooks/useFetchNearbyLocations.jsx

import { useState, useEffect } from 'react';
import axios from 'axios';
import { indexDataToElasticsearch } from '@/Utils/Opensearch';

export default function useFetchNearbyLocations(latitude, longitude, radius) {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!latitude || !longitude || !radius) return;

        async function fetchData() {
            try {
                const url = `http://overpass-api.de/api/interpreter`
                const query = `
                [out:json];
                node[amenity=restaurant](around:${radius},${latitude},${longitude});
                out;
                `;  
                const params = new URLSearchParams({ data: query });
                const response = await fetch(`${url}?${params.toString()}`);
                if (response.ok) {
                    const data = await response.json();
                    console.log(data)
                    console.log(data.elements)
                    setData(data.elements || []);
                    setError(null);

                    indexDataToElasticsearch(data.elements || []);
                } else {
                    console.error(`Error: ${response.status} - ${response.statusText}`);
                }

            } catch (err) {
                console.error('Error fetching locations:', err);
                setError('Failed to fetch data');
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [latitude, longitude, radius]);

    return { data, loading, error };
}

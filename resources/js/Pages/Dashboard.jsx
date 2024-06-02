// resources/js/Pages/Dashboard.jsx

import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { DataGrid } from '@mui/x-data-grid';
import { IconButton } from '@mui/material';
import useFetchNearbyLocations from '@/Hooks/useFetchNearbyLocations';
import { useState, useEffect } from 'react';
import BlockIcon from '@mui/icons-material/Block';

async function addToIgnore(itemId) {
    console.log("Ignoring Item: ", itemId)
    try {
        const response = await axios.post('/ignore-list', {
            item_id: itemId,
        }, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
            }});
        } 
    catch (error) {
        console.error('Error ignoring item:', error);
        throw `Error ignoring item`
    }
} 

export default function Dashboard({ auth }) {
    const [latitude, setLatitude] = useState(45.42121997393463); // Default Location BNK
    const [longitude, setLongitude] = useState(-75.70225556954014);
    const [radius, setRadius] = useState(1000); // Default radius in meters
    const [numResults, setNumResults] = useState(11);
    const [tags, setTags] = useState([]); // Default filter is empty
    const [refreshTag, setRefreshTag] = useState(0);

    const { data, loading, error } = useFetchNearbyLocations(latitude, longitude, radius, tags, numResults, refreshTag);



    const handleAddToIgnore = (e, row) => {
        e.stopPropagation();
        console.log(row)
        addToIgnore(row.id).then((res) => {
            console.log(res)
            setRefreshTag(prevKey => prevKey + 1); // Trigger re-fetch
        }).catch((err) => {
            console.log(err)
        })
    }

    

    const columns = [
        { field: 'actions', headerName: 'Actions', width: 100, renderCell: (params) => {
            return (
              <IconButton
                onClick={(e) => handleAddToIgnore(e, params.row)}
                variant="contained"
              >
                <BlockIcon></BlockIcon>
              </IconButton>
            );
        }},
        { field: 'name', headerName: 'Name', width: 300 },
        { field: 'type', headerName: 'Type', width: 200 },
        { field: 'cuisine', headerName: 'Cuisine', width: 200 },

    ];

    const rows = data.map((item) => ({
        id: item?._source?.id,
        lat: item?._source?.lat,
        lon: item?._source?.lon,
        type: item?._source?.tags?.amenity || "Unknown",
        name: item?._source?.tags?.name || "Unknown",
        cuisine: item?._source?.tags?.cuisine || "Unknown",
    }));

    useEffect(() => {
        console.log(latitude, longitude, radius);

    }, [latitude, longitude, radius]);

    useEffect(() => {console.log(data)}, [data]);

    useEffect(() => {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition((position) => {
                setLatitude(position.coords.latitude);
                setLongitude(position.coords.longitude);
            });
        } else {
            console.error('Geolocation is not available');
        }
    }, []);
    const handleTagsChange = (e) => {
        setTags(e.target.value.split(',').map(tag => tag.trim()));
    };
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Dashboard</h2>}
        >
            <Head title="Dashboard" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <div>You're logged in!</div>
                            <label className="block mt-4">Select Radius (in meters):</label>
                            <input
                            type="number"
                            defaultValue={radius}
                            onBlur={(e) => setRadius(e.target.value)}
                            placeholder="Radius in meters"
                            className="rounded-md border p-2 mt-1 w-full"
                            />

                            <label className="block mt-4">Number of Results:</label>
                            <input
                                type="number"
                                defaultValue={numResults}
                                onBlur={(e) => setNumResults(e.target.value)}
                                placeholder="Number of results"
                                className="rounded-md border p-2 mt-1 w-full"
                            />

                            <label className="block mt-4">Tags (comma-separated):</label>
                            <input
                                type="text"
                                defaultValue={tags.join(', ')}
                                onBlur={handleTagsChange}
                                placeholder="e.g. restaurant, cafe"
                                className="rounded-md border p-2 mt-1 w-full"
                            />
                            {error && <p className="text-red-500 mt-2">{error}</p>}
                            <div style={{ height: 400, width: '100%', marginTop: '1rem' }}>
                                <DataGrid
                                    rows={loading ? [] : rows}
                                    columns={columns}
                                    pageSize={10}
                                    loading={loading}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

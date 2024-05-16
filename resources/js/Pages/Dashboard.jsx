// resources/js/Pages/Dashboard.jsx

import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { DataGrid } from '@mui/x-data-grid';
import useFetchNearbyLocations from '@/Hooks/useFetchNearbyLocations';
import { useState, useEffect } from 'react';

export default function Dashboard({ auth }) {
    const [latitude, setLatitude] = useState(45.42121997393463);
    const [longitude, setLongitude] = useState(-75.70225556954014);
    const [radius, setRadius] = useState(1000); // Default radius in meters

    const { data, loading, error } = useFetchNearbyLocations(latitude, longitude, radius);

    const columns = [
        { field: 'name', headerName: 'Name', width: 300 },
        { field: 'type', headerName: 'Type', width: 200 },
        { field: 'cuisine', headerName: 'Cuisine', width: 200 },
    ];

    const rows = data.map((item) => ({
        id: item.id,
        lat: item.lat,
        lon: item.lon,
        type: item.tags.amenity || "Unknown",
        name: item.tags.name || "Unknown",
        cuisine: item.tags.cuisine || "Unknown",
    }));

    useEffect(() => {
        console.log(latitude, longitude, radius);

    }, [latitude, longitude, radius]);

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
                                value={radius}
                                onChange={(e) => setRadius(e.target.value)}
                                placeholder="Radius in meters"
                                className="rounded-md border p-2 mt-1 w-full"
                            />
                            {error && <p className="text-red-500 mt-2">{error}</p>}
                            <div style={{ height: 400, width: '100%', marginTop: '1rem' }}>
                                <DataGrid
                                    rows={loading ? [] : rows}
                                    columns={columns}
                                    pageSize={5}
                                    checkboxSelection
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

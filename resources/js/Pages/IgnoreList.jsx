import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { DataGrid } from '@mui/x-data-grid';
import { useState } from 'react';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import { IconButton } from '@mui/material';
import { useEffect } from 'react';

const removeFromIgnore = async (id) => {
    try {
        await axios.delete(`/ignore-list/${id}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
            }
        });
        window.location.reload(); // Refresh the page to update the list
    } catch (error) {
        console.error('Failed to delete item:', error);
    }
};

export default function IgnoreList({ auth, ignoredItems }) {

    const handleRemoveFromIgnore = (e, row) => {
        e.stopPropagation();
        console.log(row)
        removeFromIgnore(row.item_id).then((res) => {
            console.log(res)
        }).catch((err) => {
            console.log(err)
        })
    }

    useEffect(() => {
        console.log(ignoredItems)  
    }, [ignoredItems])

    const columns = [
        { field: 'actions', headerName: 'Actions', width: 100, renderCell: (params) => {
            return (
              <IconButton
                onClick={(e) => handleRemoveFromIgnore(e, params.row)}
                variant="contained"
              >
                <RemoveCircleIcon></RemoveCircleIcon>
              </IconButton>
            );
        }},
        { field: 'name', headerName: 'Name', width: 200 },
        { field: 'type', headerName: 'Type', width: 200 },
        { field: 'cuisine', headerName: 'Cuisine', width: 200 },
        // Add more columns if necessary
    ];

    const rows = ignoredItems.map((item, index) => ({
        id: index,
        item_id: item.item_id,
        name: item?.tags?.name || "Unknown",
        type: item?.tags?.amenity || "Unknown",
        cuisine: item?.tags?.cuisine || "Unknown",
    }));

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Ignore List</h2>}
        >
            <Head title="Ignore List" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <div>Here are the items you have ignored:</div>
                            <div style={{ height: 400, width: '100%', marginTop: '1rem' }}>
                                <DataGrid
                                    rows={rows}
                                    columns={columns}
                                    pageSize={10}
                                    loading={false}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

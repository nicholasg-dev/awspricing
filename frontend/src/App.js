import React, { useEffect, useState } from 'react';
import {
    DataGrid,
    GridToolbar
} from '@mui/x-data-grid';
import {
    Box,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Typography,
    CircularProgress,
    Alert,
    Tabs,
    Tab,
    Grid,
    Paper
} from '@mui/material';
import {
    PriceHistory,
    SavingsCalculator,
    InstanceComparison,
    PriceAlerts
} from './components';
import './App.css';

function App() {
    const [rows, setRows] = useState([]);
    const [regions, setRegions] = useState([]);
    const [selectedRegion, setSelectedRegion] = useState('');
    const [os, setOs] = useState('');
    const [pricing, setPricing] = useState('');
    const [filteredRows, setFilteredRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState(0);
    const [selectedInstances, setSelectedInstances] = useState([]);
    const [priceHistory, setPriceHistory] = useState([]);

    // Fetch regions on component mount
    useEffect(() => {
        fetch('http://localhost:4000/api/regions')
            .then(res => res.json())
            .then(data => {
                setRegions(data);
                setSelectedRegion('us-east-1'); // Set default region
            })
            .catch(err => setError('Failed to fetch regions'));
    }, []);

    // Fetch instance data when region changes
    useEffect(() => {
        if (!selectedRegion) return;

        setLoading(true);
        setError(null);

        fetch(`http://localhost:4000/api/instances/${selectedRegion}`)
            .then(res => res.json())
            .then(data => {
                setRows(data);
                setLoading(false);
            })
            .catch(err => {
                setError('Failed to fetch instance data');
                setLoading(false);
            });
    }, [selectedRegion]);

    // Filter rows based on selected OS and pricing type
    useEffect(() => {
        let data = rows;
        if (os) data = data.filter(r => r.os === os);
        if (pricing) data = data.filter(r => r[pricing] !== null);
        setFilteredRows(data.map((r, i) => ({ id: i, ...r })));
    }, [rows, os, pricing]);

    const columns = [
        { field: 'instanceType', headerName: 'Instance Type', width: 150 },
        { field: 'os', headerName: 'OS', width: 100 },
        { field: 'vCPU', headerName: 'vCPU', width: 80, type: 'number' },
        { field: 'memoryGiB', headerName: 'Memory (GiB)', width: 120, type: 'number' },
        { field: 'networkPerformance', headerName: 'Network', width: 150 },
        {
            field: 'onDemand',
            headerName: 'On-Demand ($/hr)',
            width: 150,
            type: 'number',
            valueFormatter: ({ value }) => value?.toFixed(4)
        },
        {
            field: 'reserved',
            headerName: 'Reserved ($/hr)',
            width: 150,
            type: 'number',
            valueFormatter: ({ value }) => value?.toFixed(4)
        },
        {
            field: 'spot',
            headerName: 'Spot ($/hr)',
            width: 120,
            type: 'number',
            valueFormatter: ({ value }) => value?.toFixed(4)
        },
        {
            field: 'spotLastUpdated',
            headerName: 'Spot Price Updated',
            width: 200,
            valueFormatter: ({ value }) => value ? new Date(value).toLocaleString() : 'N/A'
        }
    ];

    // Handle tab change
    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    // Handle row selection for comparison
    const handleInstanceSelection = (newSelection) => {
        const selectedRows = newSelection.map(id =>
            filteredRows.find(row => row.id === id)
        ).filter(Boolean);

        // Limit to 3 instances for comparison
        setSelectedInstances(selectedRows.slice(0, 3));
    };

    // Fetch price history when an instance is selected
    useEffect(() => {
        if (selectedInstances.length > 0 && selectedRegion) {
            const fetchPriceHistory = async () => {
                try {
                    const response = await fetch(
                        `http://localhost:4000/api/price-history/${selectedRegion}/${selectedInstances[0].instanceType}`
                    );
                    if (response.ok) {
                        const data = await response.json();
                        setPriceHistory(data);
                    }
                } catch (err) {
                    console.error('Error fetching price history:', err);
                }
            };

            fetchPriceHistory();
        }
    }, [selectedInstances, selectedRegion]);

    return (
        <Box sx={{ p: 4 }}>
            <Typography variant="h4" gutterBottom>AWS EC2 Instance Pricing</Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
            )}

            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <FormControl sx={{ minWidth: 200 }}>
                    <InputLabel>Region</InputLabel>
                    <Select
                        value={selectedRegion}
                        label="Region"
                        onChange={e => setSelectedRegion(e.target.value)}
                    >
                        {regions.map(region => (
                            <MenuItem key={region.id} value={region.id}>
                                {region.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <FormControl>
                    <InputLabel>OS</InputLabel>
                    <Select
                        value={os}
                        label="OS"
                        onChange={e => setOs(e.target.value)}
                    >
                        <MenuItem value="">All</MenuItem>
                        <MenuItem value="Linux">Linux</MenuItem>
                        <MenuItem value="Windows">Windows</MenuItem>
                    </Select>
                </FormControl>

                <FormControl>
                    <InputLabel>Pricing</InputLabel>
                    <Select
                        value={pricing}
                        label="Pricing"
                        onChange={e => setPricing(e.target.value)}
                    >
                        <MenuItem value="">All</MenuItem>
                        <MenuItem value="onDemand">On-Demand</MenuItem>
                        <MenuItem value="reserved">Reserved</MenuItem>
                        <MenuItem value="spot">Spot</MenuItem>
                    </Select>
                </FormControl>
            </Box>

            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                <Tabs value={activeTab} onChange={handleTabChange}>
                    <Tab label="Pricing" />
                    <Tab label="History" />
                    <Tab label="Compare" />
                    <Tab label="Alerts" />
                    <Tab label="Calculator" />
                </Tabs>
            </Box>

            <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
                {activeTab === 0 && (
                    <div style={{ height: 600, width: '100%' }}>
                        {loading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                                <CircularProgress />
                            </Box>
                        ) : (
                            <DataGrid
                                rows={filteredRows}
                                columns={columns}
                                pageSize={20}
                                rowsPerPageOptions={[20, 50, 100]}
                                checkboxSelection
                                onRowSelectionModelChange={handleInstanceSelection}
                                components={{
                                    Toolbar: GridToolbar
                                }}
                                density="compact"
                            />
                        )}
                    </div>
                )}

                {activeTab === 1 && (
                    <PriceHistory
                        instanceType={selectedInstances.length > 0 ? selectedInstances[0].instanceType : ''}
                        region={selectedRegion}
                        data={priceHistory}
                    />
                )}

                {activeTab === 2 && (
                    <InstanceComparison instances={selectedInstances} />
                )}

                {activeTab === 3 && (
                    <PriceAlerts
                        instanceType={selectedInstances.length > 0 ? selectedInstances[0].instanceType : ''}
                        region={selectedRegion}
                        os={selectedInstances.length > 0 ? selectedInstances[0].os : ''}
                    />
                )}

                {activeTab === 4 && (
                    <SavingsCalculator
                        instanceType={selectedInstances.length > 0 ? selectedInstances[0].instanceType : ''}
                        region={selectedRegion}
                        os={selectedInstances.length > 0 ? selectedInstances[0].os : ''}
                    />
                )}

                {activeTab !== 0 && selectedInstances.length === 0 && (
                    <Alert severity="info" sx={{ mb: 2 }}>
                        Select an instance from the Pricing tab to view detailed information.
                    </Alert>
                )}
            </Paper>
        </Box>
    );
}

export default App;

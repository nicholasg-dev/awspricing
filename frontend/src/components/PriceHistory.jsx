import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
    Box,
    Paper,
    Typography,
    CircularProgress,
    Alert,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Grid,
    Card,
    CardContent,
    Divider,
    Tooltip as MuiTooltip,
    ToggleButton,
    ToggleButtonGroup
} from '@mui/material';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

export const PriceHistory = ({ instanceType, region, data, os = 'Linux' }) => {
    const [historyData, setHistoryData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [timeRange, setTimeRange] = useState(30); // Default to 30 days
    const [priceTypes, setPriceTypes] = useState(['onDemand', 'spot', 'reserved']);
    const [stats, setStats] = useState({
        onDemand: { avg: 0, min: 0, max: 0, current: 0 },
        spot: { avg: 0, min: 0, max: 0, current: 0 },
        reserved: { avg: 0, min: 0, max: 0, current: 0 }
    });

    // Handle time range change
    const handleTimeRangeChange = (event) => {
        setTimeRange(event.target.value);
    };

    // Handle price type filter change
    const handlePriceTypeChange = (event, newPriceTypes) => {
        if (newPriceTypes.length) {
            setPriceTypes(newPriceTypes);
        }
    };

    useEffect(() => {
        // If data is provided directly, use it
        if (data && data.length > 0) {
            setHistoryData(data);
            return;
        }

        // Otherwise fetch from API
        if (!instanceType || !region) return;

        const fetchPriceHistory = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(
                    `http://localhost:4000/api/price-history/${region}/${instanceType}?days=${timeRange}&os=${os}`
                );
                if (!response.ok) {
                    throw new Error('Failed to fetch price history');
                }
                const data = await response.json();
                setHistoryData(data);
            } catch (err) {
                console.error('Error fetching price history:', err);
                setError('Failed to load price history data');
            } finally {
                setLoading(false);
            }
        };

        fetchPriceHistory();
    }, [instanceType, region, data, timeRange, os]);

    // Calculate statistics when history data changes
    useEffect(() => {
        if (historyData.length === 0) return;

        const newStats = {
            onDemand: { avg: 0, min: 0, max: 0, current: 0 },
            spot: { avg: 0, min: 0, max: 0, current: 0 },
            reserved: { avg: 0, min: 0, max: 0, current: 0 }
        };

        // Group data by price type
        const groupedData = {
            onDemand: historyData.filter(d => d.priceType === 'onDemand'),
            spot: historyData.filter(d => d.priceType === 'spot'),
            reserved: historyData.filter(d => d.priceType === 'reserved')
        };

        // Calculate statistics for each price type
        Object.keys(groupedData).forEach(priceType => {
            const prices = groupedData[priceType].map(d => d.price).filter(Boolean);
            if (prices.length > 0) {
                newStats[priceType] = {
                    avg: prices.reduce((sum, price) => sum + price, 0) / prices.length,
                    min: Math.min(...prices),
                    max: Math.max(...prices),
                    current: prices[prices.length - 1] // Most recent price
                };
            }
        });

        setStats(newStats);
    }, [historyData]);

    // Prepare chart data based on selected price types
    const chartData = {
        labels: historyData
            .filter(d => d.priceType === 'onDemand') // Use onDemand dates as base
            .map(d => new Date(d.timestamp).toLocaleDateString()),
        datasets: [
            priceTypes.includes('onDemand') ? {
                label: 'On-Demand Price',
                data: historyData
                    .filter(d => d.priceType === 'onDemand')
                    .map(d => d.price),
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                tension: 0.1,
                fill: false
            } : null,
            priceTypes.includes('spot') ? {
                label: 'Spot Price',
                data: historyData
                    .filter(d => d.priceType === 'spot')
                    .map(d => d.price),
                borderColor: 'rgb(255, 99, 132)',
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                tension: 0.1,
                fill: false
            } : null,
            priceTypes.includes('reserved') ? {
                label: 'Reserved Price',
                data: historyData
                    .filter(d => d.priceType === 'reserved')
                    .map(d => d.price),
                borderColor: 'rgb(54, 162, 235)',
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                tension: 0.1,
                fill: false,
                borderDash: [5, 5] // Dashed line for reserved
            } : null
        ].filter(Boolean) // Remove null datasets
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: `Price History for ${instanceType} (${os})`,
                font: {
                    size: 16
                }
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        return `${context.dataset.label}: $${context.raw.toFixed(4)} per hour`;
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Price ($/hr)'
                },
                ticks: {
                    callback: function(value) {
                        return '$' + value.toFixed(4);
                    }
                }
            },
            x: {
                title: {
                    display: true,
                    text: 'Date'
                }
            }
        }
    };

    // Format price for display
    const formatPrice = (price) => {
        return price ? `$${price.toFixed(4)}` : 'N/A';
    };

    // Render price statistics card
    const renderStatCard = (title, color, statData) => {
        return (
            <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent>
                    <Typography variant="h6" sx={{ color, mb: 1 }}>{title}</Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Grid container spacing={1}>
                        <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary">Current:</Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography variant="body2" fontWeight="bold">{formatPrice(statData.current)}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary">Average:</Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography variant="body2">{formatPrice(statData.avg)}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary">Minimum:</Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography variant="body2">{formatPrice(statData.min)}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary">Maximum:</Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography variant="body2">{formatPrice(statData.max)}</Typography>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
        );
    };

    if (loading) {
        return (
            <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
                <Typography variant="h6">Price History</Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                    <CircularProgress />
                </Box>
            </Paper>
        );
    }

    if (error) {
        return (
            <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
                <Typography variant="h6">Price History</Typography>
                <Alert severity="error">{error}</Alert>
            </Paper>
        );
    }

    if (historyData.length === 0) {
        return (
            <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
                <Typography variant="h6">Price History</Typography>
                <Alert severity="info">No price history data available for this instance type.</Alert>
            </Paper>
        );
    }

    return (
        <Paper elevation={3} sx={{ p: 3, mb: 2 }}>
            <Typography variant="h6" gutterBottom>Price History</Typography>

            {/* Controls */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} md={6}>
                    <FormControl fullWidth size="small">
                        <InputLabel>Time Range</InputLabel>
                        <Select
                            value={timeRange}
                            label="Time Range"
                            onChange={handleTimeRangeChange}
                        >
                            <MenuItem value={7}>Last 7 days</MenuItem>
                            <MenuItem value={14}>Last 14 days</MenuItem>
                            <MenuItem value={30}>Last 30 days</MenuItem>
                            <MenuItem value={60}>Last 60 days</MenuItem>
                            <MenuItem value={90}>Last 90 days</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                        <Typography variant="body2" sx={{ mr: 2 }}>Price Types:</Typography>
                        <ToggleButtonGroup
                            value={priceTypes}
                            onChange={handlePriceTypeChange}
                            aria-label="price types"
                            size="small"
                        >
                            <ToggleButton value="onDemand" aria-label="on-demand">
                                On-Demand
                            </ToggleButton>
                            <ToggleButton value="spot" aria-label="spot">
                                Spot
                            </ToggleButton>
                            <ToggleButton value="reserved" aria-label="reserved">
                                Reserved
                            </ToggleButton>
                        </ToggleButtonGroup>
                    </Box>
                </Grid>
            </Grid>

            {/* Chart */}
            <Box sx={{ height: 400, mb: 3 }}>
                <Line data={chartData} options={chartOptions} />
            </Box>

            {/* Statistics */}
            <Typography variant="h6" gutterBottom>Price Statistics</Typography>
            <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                    {renderStatCard('On-Demand Price', 'rgb(75, 192, 192)', stats.onDemand)}
                </Grid>
                <Grid item xs={12} md={4}>
                    {renderStatCard('Spot Price', 'rgb(255, 99, 132)', stats.spot)}
                </Grid>
                <Grid item xs={12} md={4}>
                    {renderStatCard('Reserved Price', 'rgb(54, 162, 235)', stats.reserved)}
                </Grid>
            </Grid>
        </Paper>
    );
};

export default PriceHistory;

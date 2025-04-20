import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
    Box,
    Paper,
    Typography,
    CircularProgress,
    Alert
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

export const PriceHistory = ({ instanceType, region, data }) => {
    const [historyData, setHistoryData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

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
                const response = await fetch(`http://localhost:4000/api/price-history/${region}/${instanceType}`);
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
    }, [instanceType, region, data]);

    const chartData = {
        labels: historyData.map(d => new Date(d.timestamp).toLocaleDateString()),
        datasets: [
            {
                label: 'On-Demand Price',
                data: historyData.map(d => d.price && d.priceType === 'onDemand' ? d.price : null),
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1,
                fill: false
            },
            {
                label: 'Spot Price',
                data: historyData.map(d => d.price && d.priceType === 'spot' ? d.price : null),
                borderColor: 'rgb(255, 99, 132)',
                tension: 0.1,
                fill: false
            }
        ]
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: `Price History for ${instanceType}`,
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Price ($/hr)'
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
        <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6">Price History</Typography>
            <Box sx={{ height: 300, mt: 2 }}>
                <Line data={chartData} options={chartOptions} />
            </Box>
        </Paper>
    );
};

export default PriceHistory;

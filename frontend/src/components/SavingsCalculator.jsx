import React, { useState } from 'react';
import {
    Paper,
    Typography,
    TextField,
    Button,
    Grid,
    Select,
    MenuItem,
    InputLabel,
    FormControl,
    CircularProgress,
    Alert,
    Box
} from '@mui/material';

export const SavingsCalculator = ({ instanceType, region, os }) => {
    const [hours, setHours] = useState(730); // Default to 1 month (730 hours)
    const [riTerm, setRiTerm] = useState('1yr');
    const [riPayment, setRiPayment] = useState('no_upfront');
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const calculateSavings = async () => {
        if (!instanceType || !region || !os) {
            setError('Please select an instance type, region, and OS first');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch('http://localhost:4000/api/calculate-savings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    instanceType,
                    region,
                    os,
                    hours,
                    riTerm,
                    riPayment
                })
            });

            if (!response.ok) {
                throw new Error('Failed to calculate savings');
            }

            const data = await response.json();
            setResults(data);
        } catch (err) {
            console.error('Error calculating savings:', err);
            setError('Failed to calculate savings');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" gutterBottom>Savings Calculator</Typography>
            
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            
            <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                    <TextField
                        label="Hours per month"
                        type="number"
                        fullWidth
                        value={hours}
                        onChange={(e) => setHours(Number(e.target.value))}
                        InputProps={{ inputProps: { min: 1 } }}
                    />
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth>
                        <InputLabel>Reserved Term</InputLabel>
                        <Select
                            value={riTerm}
                            label="Reserved Term"
                            onChange={(e) => setRiTerm(e.target.value)}
                        >
                            <MenuItem value="1yr">1 Year</MenuItem>
                            <MenuItem value="3yr">3 Years</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth>
                        <InputLabel>Payment Option</InputLabel>
                        <Select
                            value={riPayment}
                            label="Payment Option"
                            onChange={(e) => setRiPayment(e.target.value)}
                        >
                            <MenuItem value="no_upfront">No Upfront</MenuItem>
                            <MenuItem value="partial_upfront">Partial Upfront</MenuItem>
                            <MenuItem value="all_upfront">All Upfront</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                    <Button
                        variant="contained"
                        onClick={calculateSavings}
                        fullWidth
                        sx={{ height: '56px' }}
                        disabled={loading || !instanceType || !region || !os}
                    >
                        {loading ? <CircularProgress size={24} /> : 'Calculate Savings'}
                    </Button>
                </Grid>
                
                {results && (
                    <Grid item xs={12}>
                        <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                            <Typography variant="subtitle1" gutterBottom>
                                Cost Comparison for {instanceType} ({os}) in {region}
                            </Typography>
                            
                            <Grid container spacing={2}>
                                <Grid item xs={12} md={4}>
                                    <Typography variant="body2">
                                        <strong>On-Demand:</strong> ${results.onDemand.hourly.toFixed(4)}/hr
                                    </Typography>
                                    <Typography variant="body2">
                                        Total for {hours} hours: ${results.onDemand.total.toFixed(2)}
                                    </Typography>
                                </Grid>
                                
                                <Grid item xs={12} md={4}>
                                    <Typography variant="body2">
                                        <strong>Reserved ({riTerm}):</strong> ${results.reserved.hourly.toFixed(4)}/hr
                                    </Typography>
                                    {results.reserved.upfront > 0 && (
                                        <Typography variant="body2">
                                            Upfront payment: ${results.reserved.upfront.toFixed(2)}
                                        </Typography>
                                    )}
                                    <Typography variant="body2">
                                        Total for {hours} hours: ${results.reserved.total.toFixed(2)}
                                    </Typography>
                                </Grid>
                                
                                <Grid item xs={12} md={4}>
                                    <Typography variant="body2">
                                        <strong>Spot:</strong> ${results.spot.hourly.toFixed(4)}/hr
                                    </Typography>
                                    <Typography variant="body2">
                                        Total for {hours} hours: ${results.spot.total.toFixed(2)}
                                    </Typography>
                                </Grid>
                            </Grid>
                            
                            <Box sx={{ mt: 2, p: 1, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                                <Typography variant="subtitle2" color="primary">
                                    Potential Savings:
                                </Typography>
                                <Typography variant="body2">
                                    Reserved vs On-Demand: ${results.savings.reservedVsOnDemand.toFixed(2)} ({((results.savings.reservedVsOnDemand / results.onDemand.total) * 100).toFixed(0)}%)
                                </Typography>
                                <Typography variant="body2">
                                    Spot vs On-Demand: ${results.savings.spotVsOnDemand.toFixed(2)} ({((results.savings.spotVsOnDemand / results.onDemand.total) * 100).toFixed(0)}%)
                                </Typography>
                            </Box>
                        </Box>
                    </Grid>
                )}
            </Grid>
        </Paper>
    );
};

export default SavingsCalculator;

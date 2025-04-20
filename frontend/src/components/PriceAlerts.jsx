import React, { useState } from 'react';
import {
    Paper,
    Typography,
    TextField,
    Button,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    CircularProgress,
    Alert,
    Snackbar
} from '@mui/material';

export const PriceAlerts = ({ instanceType, region, os }) => {
    const [alert, setAlert] = useState({
        instanceType: instanceType || '',
        region: region || '',
        os: os || '',
        priceType: 'spot',
        threshold: '',
        email: ''
    });
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setAlert(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const createAlert = async () => {
        // Validate inputs
        if (!alert.instanceType || !alert.region || !alert.os || !alert.threshold || !alert.email) {
            setError('Please fill in all fields');
            return;
        }

        if (!alert.email.includes('@')) {
            setError('Please enter a valid email address');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch('http://localhost:4000/api/price-alerts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...alert,
                    threshold: Number(alert.threshold),
                    active: true
                })
            });

            if (!response.ok) {
                throw new Error('Failed to create alert');
            }

            setSuccess(true);
            // Reset form
            setAlert({
                instanceType: instanceType || '',
                region: region || '',
                os: os || '',
                priceType: 'spot',
                threshold: '',
                email: ''
            });
        } catch (err) {
            console.error('Error creating price alert:', err);
            setError('Failed to create price alert');
        } finally {
            setLoading(false);
        }
    };

    const handleCloseSnackbar = () => {
        setSuccess(false);
    };

    return (
        <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" gutterBottom>Price Alerts</Typography>
            
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            
            <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                    <TextField
                        name="instanceType"
                        label="Instance Type"
                        fullWidth
                        value={alert.instanceType}
                        onChange={handleChange}
                        disabled={!!instanceType}
                    />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                    <TextField
                        name="region"
                        label="Region"
                        fullWidth
                        value={alert.region}
                        onChange={handleChange}
                        disabled={!!region}
                    />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                        <InputLabel>OS</InputLabel>
                        <Select
                            name="os"
                            value={alert.os}
                            label="OS"
                            onChange={handleChange}
                            disabled={!!os}
                        >
                            <MenuItem value="Linux">Linux</MenuItem>
                            <MenuItem value="Windows">Windows</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                        <InputLabel>Price Type</InputLabel>
                        <Select
                            name="priceType"
                            value={alert.priceType}
                            label="Price Type"
                            onChange={handleChange}
                        >
                            <MenuItem value="onDemand">On-Demand</MenuItem>
                            <MenuItem value="reserved">Reserved</MenuItem>
                            <MenuItem value="spot">Spot</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                    <TextField
                        name="threshold"
                        label="Price Threshold ($/hr)"
                        type="number"
                        fullWidth
                        value={alert.threshold}
                        onChange={handleChange}
                        InputProps={{ inputProps: { min: 0, step: 0.001 } }}
                    />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                    <TextField
                        name="email"
                        label="Email"
                        type="email"
                        fullWidth
                        value={alert.email}
                        onChange={handleChange}
                    />
                </Grid>
                
                <Grid item xs={12}>
                    <Button
                        variant="contained"
                        onClick={createAlert}
                        disabled={loading}
                    >
                        {loading ? <CircularProgress size={24} /> : 'Create Alert'}
                    </Button>
                </Grid>
            </Grid>
            
            <Snackbar
                open={success}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                message="Price alert created successfully"
            />
        </Paper>
    );
};

export default PriceAlerts;

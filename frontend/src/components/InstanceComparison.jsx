import React from 'react';
import {
    Paper,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Typography,
    Box,
    Alert
} from '@mui/material';

export const InstanceComparison = ({ instances }) => {
    if (!instances || instances.length === 0) {
        return (
            <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
                <Typography variant="h6">Instance Comparison</Typography>
                <Alert severity="info">Select instances to compare</Alert>
            </Paper>
        );
    }

    // Define comparison metrics
    const metrics = [
        { key: 'vCPU', label: 'vCPU', formatter: (value) => value },
        { key: 'memoryGiB', label: 'Memory (GiB)', formatter: (value) => value },
        { key: 'networkPerformance', label: 'Network Performance', formatter: (value) => value },
        { key: 'onDemand', label: 'On-Demand Price ($/hr)', formatter: (value) => value?.toFixed(4) || 'N/A' },
        { key: 'reserved', label: 'Reserved Price ($/hr)', formatter: (value) => value?.toFixed(4) || 'N/A' },
        { key: 'spot', label: 'Spot Price ($/hr)', formatter: (value) => value?.toFixed(4) || 'N/A' },
    ];

    // Calculate price differences
    const calculateDifference = (instance1, instance2, key) => {
        if (!instance1[key] || !instance2[key]) return 'N/A';
        
        const diff = ((instance2[key] - instance1[key]) / instance1[key]) * 100;
        return `${diff > 0 ? '+' : ''}${diff.toFixed(1)}%`;
    };

    return (
        <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" gutterBottom>Instance Comparison</Typography>
            
            <Box sx={{ overflowX: 'auto' }}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell><strong>Feature</strong></TableCell>
                            {instances.map(instance => (
                                <TableCell key={instance.instanceType}>
                                    <strong>{instance.instanceType}</strong>
                                    <Typography variant="caption" display="block">
                                        {instance.os}
                                    </Typography>
                                </TableCell>
                            ))}
                            {instances.length > 1 && (
                                <TableCell>
                                    <strong>Difference</strong>
                                    <Typography variant="caption" display="block">
                                        (% change)
                                    </Typography>
                                </TableCell>
                            )}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {metrics.map(metric => (
                            <TableRow key={metric.key}>
                                <TableCell>{metric.label}</TableCell>
                                {instances.map(instance => (
                                    <TableCell key={`${instance.instanceType}-${metric.key}`}>
                                        {metric.formatter(instance[metric.key])}
                                    </TableCell>
                                ))}
                                {instances.length > 1 && (
                                    <TableCell>
                                        {calculateDifference(instances[0], instances[1], metric.key)}
                                    </TableCell>
                                )}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Box>
        </Paper>
    );
};

export default InstanceComparison;

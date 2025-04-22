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
    Paper,
    Container,
    useMediaQuery,
    useTheme,
    Drawer,
    AppBar,
    Toolbar,
    IconButton,
    Divider,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import TableViewIcon from '@mui/icons-material/TableView';
import HistoryIcon from '@mui/icons-material/History';
import CompareIcon from '@mui/icons-material/Compare';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CalculateIcon from '@mui/icons-material/Calculate';
import {
    PriceHistory,
    SavingsCalculator,
    InstanceComparison,
    PriceAlerts
} from './components';
import './App.css';

function App() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [drawerOpen, setDrawerOpen] = useState(false);

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

    const handleDrawerToggle = () => {
        setDrawerOpen(!drawerOpen);
    };

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

    // Drawer content
    const drawerWidth = 240;
    const drawerContent = (
        <Box sx={{ width: drawerWidth }}>
            <Box sx={{ p: 2 }}>
                <Typography variant="h6" noWrap component="div">
                    AWS Pricing Tool
                </Typography>
            </Box>
            <Divider />
            <List>
                <ListItem disablePadding>
                    <ListItemButton selected={activeTab === 0} onClick={() => setActiveTab(0)}>
                        <ListItemIcon>
                            <TableViewIcon />
                        </ListItemIcon>
                        <ListItemText primary="Pricing" />
                    </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                    <ListItemButton selected={activeTab === 1} onClick={() => setActiveTab(1)}>
                        <ListItemIcon>
                            <HistoryIcon />
                        </ListItemIcon>
                        <ListItemText primary="Price History" />
                    </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                    <ListItemButton selected={activeTab === 2} onClick={() => setActiveTab(2)}>
                        <ListItemIcon>
                            <CompareIcon />
                        </ListItemIcon>
                        <ListItemText primary="Compare" />
                    </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                    <ListItemButton selected={activeTab === 3} onClick={() => setActiveTab(3)}>
                        <ListItemIcon>
                            <NotificationsIcon />
                        </ListItemIcon>
                        <ListItemText primary="Alerts" />
                    </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                    <ListItemButton selected={activeTab === 4} onClick={() => setActiveTab(4)}>
                        <ListItemIcon>
                            <CalculateIcon />
                        </ListItemIcon>
                        <ListItemText primary="Calculator" />
                    </ListItemButton>
                </ListItem>
            </List>
        </Box>
    );

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            {/* App Bar */}
            <AppBar position="static">
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2, display: { md: 'none' } }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
                        AWS EC2 Instance Pricing
                    </Typography>
                </Toolbar>
            </AppBar>

            {/* Main content */}
            <Box sx={{ display: 'flex', flex: 1 }}>
                {/* Sidebar for desktop */}
                {!isMobile && (
                    <Box
                        component="nav"
                        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
                    >
                        <Drawer
                            variant="permanent"
                            sx={{
                                display: { xs: 'none', md: 'block' },
                                '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                            }}
                            open
                        >
                            {drawerContent}
                        </Drawer>
                    </Box>
                )}

                {/* Temporary drawer for mobile */}
                <Drawer
                    variant="temporary"
                    open={drawerOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{ keepMounted: true }}
                    sx={{
                        display: { xs: 'block', md: 'none' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                    }}
                >
                    {drawerContent}
                </Drawer>

                {/* Main content area */}
                <Container maxWidth="xl" sx={{ mt: 3, mb: 3, flex: 1 }}>
                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
                    )}

                    {/* Filters */}
                    <Grid container spacing={2} sx={{ mb: 3 }}>
                        <Grid item xs={12} sm={4}>
                            <FormControl fullWidth>
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
                        </Grid>

                        <Grid item xs={6} sm={4}>
                            <FormControl fullWidth>
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
                        </Grid>

                        <Grid item xs={6} sm={4}>
                            <FormControl fullWidth>
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
                        </Grid>
                    </Grid>

                    {/* Tabs for mobile */}
                    {isMobile && (
                        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                            <Tabs
                                value={activeTab}
                                onChange={handleTabChange}
                                variant="scrollable"
                                scrollButtons="auto"
                            >
                                <Tab label="Pricing" />
                                <Tab label="History" />
                                <Tab label="Compare" />
                                <Tab label="Alerts" />
                                <Tab label="Calculator" />
                            </Tabs>
                        </Box>
                    )}

                    {/* Main content */}
                    <Paper elevation={3} sx={{ p: { xs: 1, sm: 2 }, mb: 2 }}>
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
                                os={selectedInstances.length > 0 ? selectedInstances[0].os : 'Linux'}
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
                </Container>
            </Box>
        </Box>
    );
}

export default App;

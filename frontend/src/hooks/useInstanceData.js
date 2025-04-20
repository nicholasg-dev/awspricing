/**
 * Custom hook for fetching and managing instance data
 */
import { useState, useEffect, useCallback } from 'react';
import { fetchInstances } from '../services/api';

/**
 * Hook for fetching and filtering EC2 instance data
 * @param {string} region - AWS region ID
 * @returns {Object} Instance data and filter functions
 */
const useInstanceData = (region) => {
  const [instances, setInstances] = useState([]);
  const [filteredInstances, setFilteredInstances] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    os: '',
    pricingType: '',
    instanceType: '',
    minVCPU: '',
    maxVCPU: '',
    minMemory: '',
    maxMemory: '',
  });

  // Fetch instances when region changes
  useEffect(() => {
    if (!region) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchInstances(region);
        // Add unique IDs to instances
        const instancesWithIds = data.map((instance, index) => ({
          ...instance,
          id: index,
        }));
        setInstances(instancesWithIds);
        setFilteredInstances(instancesWithIds);
      } catch (err) {
        setError('Failed to fetch instance data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [region]);

  // Apply filters when instances or filters change
  useEffect(() => {
    if (!instances.length) return;

    let filtered = [...instances];

    // Filter by OS
    if (filters.os) {
      filtered = filtered.filter((instance) => instance.os === filters.os);
    }

    // Filter by pricing type
    if (filters.pricingType) {
      filtered = filtered.filter(
        (instance) => instance[filters.pricingType] !== null
      );
    }

    // Filter by instance type
    if (filters.instanceType) {
      filtered = filtered.filter((instance) =>
        instance.instanceType.toLowerCase().includes(filters.instanceType.toLowerCase())
      );
    }

    // Filter by vCPU
    if (filters.minVCPU) {
      filtered = filtered.filter(
        (instance) => instance.vCPU >= parseInt(filters.minVCPU, 10)
      );
    }
    if (filters.maxVCPU) {
      filtered = filtered.filter(
        (instance) => instance.vCPU <= parseInt(filters.maxVCPU, 10)
      );
    }

    // Filter by memory
    if (filters.minMemory) {
      filtered = filtered.filter(
        (instance) => instance.memoryGiB >= parseFloat(filters.minMemory)
      );
    }
    if (filters.maxMemory) {
      filtered = filtered.filter(
        (instance) => instance.memoryGiB <= parseFloat(filters.maxMemory)
      );
    }

    setFilteredInstances(filtered);
  }, [instances, filters]);

  // Update a specific filter
  const updateFilter = useCallback((name, value) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  }, []);

  // Reset all filters
  const resetFilters = useCallback(() => {
    setFilters({
      os: '',
      pricingType: '',
      instanceType: '',
      minVCPU: '',
      maxVCPU: '',
      minMemory: '',
      maxMemory: '',
    });
  }, []);

  return {
    instances: filteredInstances,
    loading,
    error,
    filters,
    updateFilter,
    resetFilters,
  };
};

export default useInstanceData;

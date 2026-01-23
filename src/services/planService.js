/**
 * Service for handling API calls related to plans
 */

import { servicesAxiosInstance } from './config';

/**
 * Fetch all plans from the API
 * @returns {Promise<Object>} The plans data
 */
export const fetchPlans = async () => {
  try {
    const response = await servicesAxiosInstance.get('/plans');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching plans:', error);
    throw error;
  }
};

/**
 * Get plan details by type and category
 * @param {Object} plansData - The plans data from API
 * @param {string} planType - The plan type (basic, pro, premier)
 * @param {string} category - The category (masters, bachelors, mba)
 * @returns {Object} The plan details
 */
export const getPlanDetails = (plansData, planType, category) => {
  if (!plansData) {
    return {
      name: 'Loading...',
      price: 0,
      features: []
    };
  }
  
  return plansData[category][planType];
};

export default {
  fetchPlans,
  getPlanDetails
};

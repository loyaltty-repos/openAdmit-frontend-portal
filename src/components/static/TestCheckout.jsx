
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Checkout from '../../Pages/Static/Checkout';

const TestCheckout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Set up test state in location.state by navigating with state
    const testState = {
      planType: 'pro',
      price: 39999,
      category: 'masters',
      planDetails: {
        name: 'UpBroad Pro',
        features: [
          'Help you shortlist universities',
          'Prepare and Assess Your Admissions Documents Tailored for 3 Unique Universities',
          'Become Your Mentors',
          'Help You Crack Interviews',
          'Guide You Through Scholarships'
        ]
      }
    };

    // Replace current location with test state
    navigate('/test-checkout', { state: testState, replace: true });
  }, [navigate]);

  return <Checkout />;
};

export default TestCheckout;

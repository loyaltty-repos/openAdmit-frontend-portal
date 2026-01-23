
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import OrderConfirmation from '../OrderConfirmation';

const TestOrderConfirmation = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Set up test state in location.state by navigating with state
    const testState = {
      orderDetails: {
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
        },
        customerData: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          phone: '+91 9876543210',
          address: '123 Test Street, Apartment 4B',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400001',
          emergencyContact: 'Jane Doe',
          emergencyPhone: '+91 9876543211'
        },
        orderId: 'UB1703123456789',
        paymentId: 'PAY1703123456789'
      }
    };

    // Replace current location with test state
    navigate('/test-order-confirmation', { state: testState, replace: true });
  }, [navigate]);

  return <OrderConfirmation />;
};

export default TestOrderConfirmation;

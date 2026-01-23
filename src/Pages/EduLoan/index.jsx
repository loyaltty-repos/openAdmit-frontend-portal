import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import SidebarHeader from '../../components/SidebarHeader';
import AppSidebar from '../../components/AppSidebar';
import { SidebarProvider, SidebarInset } from '../../components/ui/sidebar';
import { apiService } from '../../services/api.services';
import { useNavigate } from 'react-router-dom';

const EduLoan = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    email: '',
    pinCode: '',
    address: '',
    admissionTerm: 'Fall\'23',
    admissionStatus: '',
    coBorrower: {
      name: '',
      universitiesReceivedAdmitFrom: []
    }
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'coBorrowerName') {
      setFormData(prevData => ({
        ...prevData,
        coBorrower: {
          ...prevData.coBorrower,
          name: value
        }
      }));    
    } else if (name === 'universities') {
      const universitiesList = value.split(',').map(uni => uni.trim()).filter(uni => uni);
      setFormData(prevData => ({
        ...prevData,
        coBorrower: {
          ...prevData.coBorrower,
          universitiesReceivedAdmitFrom: universitiesList
        }
      }));
    } else {
      setFormData(prevData => ({
        ...prevData,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const response = await apiService.post('/loans/apply', {
        name: formData.name,
        phoneNumber: formData.phoneNumber,
        email: formData.email,
        pinCode: formData.pinCode,
        address: formData.address,
        admissionTerm: formData.admissionTerm,
        admissionStatus: formData.admissionStatus,
        coBorrower: {
          name: formData.coBorrower.name,
          universitiesReceivedAdmitFrom: formData.coBorrower.universitiesReceivedAdmitFrom
        }
      });

      if (response.success) {

        alert('Loan application submitted successfully!');

        navigate('/dashboard');
      } else {
        setError(response.message || 'Failed to submit loan application');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while submitting your application');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-gray-50">
        <AppSidebar isSidebarOpen={isSidebarOpen} />
        
        <SidebarInset>
          <SidebarHeader isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
          
          <main className="flex-1 w-full overflow-x-hidden overflow-y-auto bg-gray-50 p-4 pt-8 md:p-6 md:pt-10">
            <div className="w-full max-w-3xl mx-auto bg-white rounded-lg shadow-sm my-4">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-800 text-center mb-6">Edu Loan Form</h2>
                
                {error && (
                  <div className="mb-4 p-4 text-sm text-red-700 bg-red-100 rounded-lg">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-1"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      placeholder="+919876543210"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-1"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-1"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">PIN Code</label>
                    <input
                      type="text"
                      name="pinCode"
                      value={formData.pinCode}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-1"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-1"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Admission Term</label>
                    <div className="relative">
                      <select
                        name="admissionTerm"
                        value={formData.admissionTerm}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-1 focus:ring-primary-1"
                      >
                        <option value="Fall'23">Fall&apos;23</option>
                        <option value="Spring'24">Spring&apos;24</option>
                        <option value="Fall'24">Fall&apos;24</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Admission Status</label>
                    <div className="relative">
                      <select
                        name="admissionStatus"
                        value={formData.admissionStatus}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-1 focus:ring-primary-1"
                        required
                      >
                        <option value="">-Select-</option>
                        <option value="Accepted">Accepted</option>
                        <option value="Pending">Pending</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" />
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-200 my-4 pt-4">
                    <p className="block text-sm text-center font-medium text-gray-700 mb-3">Co Borrower Details</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Co-Borrower Name</label>
                    <input
                      type="text"
                      name="coBorrowerName"
                      value={formData.coBorrower.name}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-1"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Universities Received Admit From
                      <span className="text-xs text-gray-500 ml-1">(Separate multiple universities with commas)</span>
                    </label>
                    <input
                      type="text"
                      name="universities"
                      value={formData.coBorrower.universitiesReceivedAdmitFrom.join(', ')}
                      onChange={handleChange}
                      placeholder="e.g. Harvard, Stanford, MIT"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-1"
                      required
                    />
                  </div>
                  
                  <div className="mt-6 flex justify-center">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`px-10 py-2 cursor-pointer bg-primary-1 text-white font-medium hover:bg-primary-1/90 focus:outline-none ${
                        isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default EduLoan;
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { updateUserProfile } from '@/services/api.services';
import { toast } from 'sonner';
import PropTypes from 'prop-types';

const ProgramDetailsForm = ({ data, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    programDetails: {
      program: data?.programDetails?.program || '',
      validity: data?.programDetails?.validity 
        ? new Date(data.programDetails.validity).toISOString().split('T')[0] 
        : ''
    }
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const [parent, child] = name.split('.');
    setFormData({
      ...formData,
      [parent]: {
        ...formData[parent],
        [child]: value
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await updateUserProfile(formData);
      
      if (response.status) {        toast.success('Program details updated successfully', {
          style: {
            backgroundColor: '#10B981',
            color: 'white',
          }
        });
        if (onSuccess) onSuccess();
        onClose();
      } else {
        toast.error(response.message || 'Failed to update details');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Something went wrong while updating your details');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="program">Program</Label>
        <Input 
          id="program" 
          name="programDetails.program" 
          value={formData.programDetails.program} 
          onChange={handleChange} 
          placeholder="Enter your program"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="validity">Validity</Label>
        <Input 
          id="validity" 
          name="programDetails.validity" 
          type="date" 
          value={formData.programDetails.validity} 
          onChange={handleChange}
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
};

ProgramDetailsForm.propTypes = {
  data: PropTypes.shape({
    programDetails: PropTypes.shape({
      program: PropTypes.string,
      validity: PropTypes.string
    })
  }),
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired
};

export default ProgramDetailsForm;
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { updateUserProfile } from '@/services/api.services';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';
import PropTypes from 'prop-types';

const validatePhoneNumber = (number) => {
  const phoneRegex = /^\+\d{1,3}\d{10}$/;
  return phoneRegex.test(number);
};

const formatPhoneNumber = (number) => {
  if (!number) return '';
  if (!number.startsWith('+')) {
    return '+91' + number.replace(/\D/g, '');
  }
  return number;
};

const PersonalDetailsForm = ({ data, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: data?.name || '',
    personalDetails: {
      dob: data?.personalDetails?.dob ? new Date(data.personalDetails.dob).toISOString().split('T')[0] : '',
      gender: data?.personalDetails?.gender || '',
      address: data?.personalDetails?.address || '',
      profession: data?.personalDetails?.profession || ''
    },
    phoneNumber: data?.phoneNumber || ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handlePhoneNumberChange = (e) => {
    const input = e.target.value;
    // Only allow digits and +
    const sanitizedInput = input.replace(/[^\d+]/g, '');
    const formattedNumber = formatPhoneNumber(sanitizedInput);
    setFormData(prev => ({
      ...prev,
      phoneNumber: formattedNumber
    }));
  };

  const handleSelectChange = (value, field) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validatePhoneNumber(formData.phoneNumber)) {
      toast.error('Phone number must start with country code (e.g., +918388656625)');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await updateUserProfile(formData);
      if (response.success) {
        toast.success('Personal details updated successfully');
        if (onSuccess) onSuccess();
        onClose();
      } else {
        toast.error(response.message || 'Failed to update details');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.message || 'Something went wrong while updating your details');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input 
          id="name" 
          name="name" 
          value={formData.name} 
          onChange={handleChange} 
          placeholder="Enter your full name"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phoneNumber">Phone Number</Label>
        <div className="space-y-1">
          <Input 
            id="phoneNumber" 
            name="phoneNumber" 
            value={formData.phoneNumber} 
            onChange={handlePhoneNumberChange}
            placeholder="+91XXXXXXXXXX"
          />
          <p className="text-xs text-muted-foreground">Must include country code (e.g., +918388656625)</p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="dob">Date of Birth</Label>
        <Input 
          id="dob" 
          name="personalDetails.dob" 
          type="date" 
          value={formData.personalDetails.dob} 
          onChange={handleChange}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="gender">Gender</Label>
        <Select 
          value={formData.personalDetails.gender} 
          onValueChange={(value) => handleSelectChange(value, 'personalDetails.gender')}
        >
          <SelectTrigger id="gender">
            <SelectValue placeholder="Select gender" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="MALE">Male</SelectItem>
            <SelectItem value="FEMALE">Female</SelectItem>
            <SelectItem value="OTHER">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="profession">Profession</Label>
        <Input 
          id="profession" 
          name="personalDetails.profession" 
          value={formData.personalDetails.profession} 
          onChange={handleChange} 
          placeholder="Enter your profession"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Textarea 
          id="address" 
          name="personalDetails.address" 
          value={formData.personalDetails.address} 
          onChange={handleChange} 
          placeholder="Enter your address"
          rows={3}
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

PersonalDetailsForm.propTypes = {
  data: PropTypes.shape({
    name: PropTypes.string,
    phoneNumber: PropTypes.string,
    personalDetails: PropTypes.shape({
      dob: PropTypes.string,
      gender: PropTypes.string,
      address: PropTypes.string,
      profession: PropTypes.string
    })
  }),
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired
};

export default PersonalDetailsForm;
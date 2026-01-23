import { useState } from 'react';
import PropTypes from 'prop-types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { updateUserProfile } from '@/services/api.services';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';

const CollegeDetailsForm = ({ data, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    collegeDetails: {
      branch: data?.collegeDetails?.branch || '',
      highestDegree: data?.collegeDetails?.highestDegree || '',
      university: data?.collegeDetails?.university || '',
      college: data?.collegeDetails?.college || '',
      gpa: data?.collegeDetails?.gpa || '',
      toppersGPA: data?.collegeDetails?.toppersGPA || '',
      noOfBacklogs: data?.collegeDetails?.noOfBacklogs || '',
      admissionTerm: data?.collegeDetails?.admissionTerm || '',
      coursesApplying: data?.collegeDetails?.coursesApplying 
        ? data.collegeDetails.coursesApplying.join(', ') 
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
    
    // Process courses as an array
    const submissionData = {
      collegeDetails: {
        ...formData.collegeDetails,
        coursesApplying: formData.collegeDetails.coursesApplying
          ? formData.collegeDetails.coursesApplying.split(',').map(course => course.trim())
          : []
      }
    };
    
    // Convert numeric fields to numbers
    if (submissionData.collegeDetails.gpa) {
      submissionData.collegeDetails.gpa = parseFloat(submissionData.collegeDetails.gpa);
    }
    if (submissionData.collegeDetails.toppersGPA) {
      submissionData.collegeDetails.toppersGPA = parseFloat(submissionData.collegeDetails.toppersGPA);
    }
    if (submissionData.collegeDetails.noOfBacklogs) {
      submissionData.collegeDetails.noOfBacklogs = parseInt(submissionData.collegeDetails.noOfBacklogs);
    }
    
    try {      
      const response = await updateUserProfile(submissionData);
        if (response.status) {        
        toast('College details updated successfully', {
          style: {
            backgroundColor: '#10B981',
            color: 'white',
            border: '1px solid #059669'
          },
          className: 'bg-green-500 text-white',
          important: true,
          icon: '✅'
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
    <form onSubmit={handleSubmit} className="space-y-4 pr-2">
      <div className="space-y-2">
        <Label htmlFor="branch">Branch</Label>
        <Input 
          id="branch" 
          name="collegeDetails.branch" 
          value={formData.collegeDetails.branch} 
          onChange={handleChange} 
          placeholder="e.g., Computer Science"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="highestDegree">Highest Degree</Label>
        <Input 
          id="highestDegree" 
          name="collegeDetails.highestDegree" 
          value={formData.collegeDetails.highestDegree} 
          onChange={handleChange} 
          placeholder="e.g., B.Tech, M.Tech, BCA"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="university">University</Label>
        <Input 
          id="university" 
          name="collegeDetails.university" 
          value={formData.collegeDetails.university} 
          onChange={handleChange} 
          placeholder="Enter university name"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="college">College</Label>
        <Input 
          id="college" 
          name="collegeDetails.college" 
          value={formData.collegeDetails.college} 
          onChange={handleChange} 
          placeholder="Enter college name"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="gpa">GPA</Label>
        <Input 
          id="gpa" 
          name="collegeDetails.gpa" 
          type="number" 
          step="0.01"
          value={formData.collegeDetails.gpa} 
          onChange={handleChange} 
          placeholder="Enter your GPA"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="toppersGPA">Topper&apos;s GPA</Label>
        <Input 
          id="toppersGPA" 
          name="collegeDetails.toppersGPA" 
          type="number"
          step="0.01"
          value={formData.collegeDetails.toppersGPA} 
          onChange={handleChange} 
          placeholder="Enter topper&apos;s GPA"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="noOfBacklogs">Number of Backlogs</Label>
        <Input 
          id="noOfBacklogs" 
          name="collegeDetails.noOfBacklogs" 
          type="number"
          value={formData.collegeDetails.noOfBacklogs} 
          onChange={handleChange} 
          placeholder="Enter number of backlogs"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="admissionTerm">Admission Term</Label>
        <Input 
          id="admissionTerm" 
          name="collegeDetails.admissionTerm" 
          value={formData.collegeDetails.admissionTerm} 
          onChange={handleChange} 
          placeholder="e.g., Fall 2025"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="coursesApplying">Courses Applying (comma-separated)</Label>
        <Textarea 
          id="coursesApplying" 
          name="collegeDetails.coursesApplying" 
          value={formData.collegeDetails.coursesApplying} 
          onChange={handleChange} 
          placeholder="e.g., MS in Computer Science, MS in Data Science"
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

CollegeDetailsForm.propTypes = {
  data: PropTypes.shape({
    collegeDetails: PropTypes.shape({
      branch: PropTypes.string,
      highestDegree: PropTypes.string,
      university: PropTypes.string,
      college: PropTypes.string,
      gpa: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      toppersGPA: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      noOfBacklogs: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      admissionTerm: PropTypes.string,
      coursesApplying: PropTypes.array
    })
  }),
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func
};

export default CollegeDetailsForm;
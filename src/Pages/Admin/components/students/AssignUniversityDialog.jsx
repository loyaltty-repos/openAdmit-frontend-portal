import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { apiService } from '@/services/api.services';
import { Loader2, X } from 'lucide-react';
import PropTypes from 'prop-types';
import { toast } from 'sonner';

export function AssignUniversityDialog({ studentId, onAssign }) {
  const [open, setOpen] = useState(false);
  const [universities, setUniversities] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUniversity, setSelectedUniversity] = useState(null);
  const [admissionStatus, setAdmissionStatus] = useState('Applied');
  const [universityStatus, setUniversityStatus] = useState('Ambitious');
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [universityCurrentPage , setUniversityCurrentPage] = useState(1);
  const [universityPaginationData , setUniversityPaginationData] = useState({});
  

  const fetchUniversities = useCallback(async () => {
    try {
      setLoading(true);
       let queryString = `?page=${universityCurrentPage}`;
      if (searchQuery) {
          queryString += `&search=${encodeURIComponent(searchQuery)}`;
      }

      const response = await apiService.get(`/admin/universities${queryString}` );
      if (response.data?.universities) {
        setUniversities(response.data.universities);
        setUniversityPaginationData(response.data.pagination)
      }
    } catch (error) {
      toast.error('Failed to fetch universities');
      console.error('Error fetching universities:', error);
    } finally {
      setLoading(false);
    }
  }, [universityCurrentPage , searchQuery]);

  const fetchAssignments = useCallback(async () => {
    try {
      const response = await apiService.get(
        `/admin/student-university-assignments?studentId=${studentId}`
      );
      if (response.data?.assignments) {
        setAssignments(response.data.assignments);
      }
    } catch (error) {
      toast.error('Failed to fetch assignments');
      console.error('Error fetching assignments:', error);
    }
  }, [studentId]);

  useEffect(() => {
    if (open) {
      fetchUniversities();
      fetchAssignments();
    }
  }, [open, fetchUniversities, fetchAssignments ]);

  const resetForm = () => {
    setSelectedUniversity(null);
    setAdmissionStatus('Applied');
    setUniversityStatus('Ambitious');
    setSearchQuery('');
    setSelectedAssignment(null);
    setIsEditing(false);
  };

  const handleDelete = async (assignmentId) => {
    try {
      setLoading(true);
      await apiService.delete(
        `/admin/student-university-assignments/${assignmentId}`
      );
      await fetchAssignments();
      toast.success('Assignment deleted successfully');
      resetForm();
    } catch (error) {
      toast.error('Failed to delete assignment');
      console.error('Error deleting assignment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (assignment) => {
    setSelectedAssignment(assignment);
    const university = universities.find(
      (u) => u._id === assignment.universityId._id
    );
    setSelectedUniversity(university);
    setAdmissionStatus(assignment.admissionStatus);
    setUniversityStatus(assignment.universityStatus);
    setIsEditing(true);
  };

  const handleAssign = async () => {
    if (!selectedUniversity) return;

    try {
      setLoading(true);
      const endpoint = isEditing
        ? `/admin/student-university-assignments/${selectedAssignment._id}`
        : '/admin/student-university-assignments';

      const method = isEditing ? 'put' : 'post';
      const data = {
        studentId,
        universityId: selectedUniversity._id,
        admissionStatus,
        admissionComments: 'Awaiting response',
        universityStatus,
      };

      const response = await apiService[method](endpoint, data);

      if (response.success) {
        onAssign();
        await fetchAssignments();
        resetForm();
        toast.success(
          isEditing
            ? 'Assignment updated successfully'
            : 'University assigned successfully'
        );
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'An error occurred';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // const filteredUniversities = universities.filter((uni) =>
  //   uni.name.toLowerCase().includes(searchQuery.toLowerCase())
  // );

  return (
    <Dialog open={open} onOpenChange={setOpen} >
      <DialogTrigger asChild>
        <Button variant="default" className="cursor-pointer">University Assignments</Button>
      </DialogTrigger>
      <DialogContent className="md:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage University Assignments</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Edit university assignment'
              : 'Assign a new university to the student'}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4 ">

          {assignments.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-medium">Current Assignments</h3>
              <div className="grid grid-cols-1 gap-2 max-h-[200px] overflow-y-auto">
                {assignments.map((assignment) => (
                  <div
                    key={assignment._id}
                    className="flex items-center justify-between p-2 border rounded"
                  >
                    <div>
                      <p className="font-medium">
                        {assignment.universityId.name} -{' '}
                        {assignment.universityId.program}
                      </p>
                      <p className="text-sm text-gray-500">
                        Status: {assignment.admissionStatus} | Type:{' '}
                        {assignment.universityStatus}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(assignment)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(assignment._id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Search and University Grid */}
          <div className="space-y-4">
            <Input
              placeholder="Search universities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            <div className="grid grid-cols-2 gap-4 max-h-[300px] overflow-y-auto">
              {universities.map((uni) => (
                <button
                  key={uni._id}
                  type="button"
                  className={`p-4 border rounded text-left transition-colors ${
                    selectedUniversity?._id === uni._id
                      ? 'border-primary bg-primary/10'
                      : 'hover:border-primary/50'
                  }`}
                  onClick={() => setSelectedUniversity(uni)}
                >
                  <p className="font-medium">{uni.name}</p>
                  <p className="text-sm text-gray-500">{uni.program}</p>
                </button>
              ))}
            </div>
             {universityPaginationData && universityPaginationData?.totalPages > 0 ? (
          <div className="flex justify-center my-6 gap-2">
            <Button
              variant="outline"
              disabled={universityPaginationData.currentPage == 1 ? true :false}
              onClick={()=> setUniversityCurrentPage(universityPaginationData.currentPage - 1)}
            >
              Previous
            </Button>
            <span className="px-4 py-2">
              Page {universityPaginationData.currentPage} of {universityPaginationData.totalPages}
            </span>
            <Button
              variant="outline"
              disabled={universityPaginationData.totalPages == universityPaginationData.currentPage ? true : false}
              onClick={() => setUniversityCurrentPage(universityPaginationData.currentPage + 1)}
            >
              Next
            </Button>
          </div>
        ): (
          <div>
            <h1 className='text-center'>No Data Found</h1>
          </div>
        )}

            {selectedUniversity && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label>Admission Status</label>
                  <Select
                    value={admissionStatus}
                    onValueChange={setAdmissionStatus}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Applied">Applied</SelectItem>
                      <SelectItem value="Accepted">Accepted</SelectItem>
                      <SelectItem value="Rejected">Rejected</SelectItem>
                      <SelectItem value="Pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label>University Status</label>
                  <Select
                    value={universityStatus}
                    onValueChange={setUniversityStatus}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Ambitious">Ambitious</SelectItem>
                      <SelectItem value="Achievable">Achievable</SelectItem>
                      <SelectItem value="Safe">Safe</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>
        </div>
        <DialogFooter className="flex gap-2">
          {isEditing && (
            <Button
              variant="outline"
              onClick={resetForm}
              disabled={loading}
            >
              Cancel Edit
            </Button>
          )}
          <Button
            onClick={handleAssign}
            disabled={!selectedUniversity || loading}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditing ? 'Update Assignment' : 'Assign University'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

AssignUniversityDialog.propTypes = {
  studentId: PropTypes.string.isRequired,
  onAssign: PropTypes.func.isRequired,
};

import { useState, useEffect } from 'react';
import {
  getApplications,
  updateApplication,
  deleteApplication,
} from '@/services/applicationService';
import { getTasksByStudentId } from '@/services/taskService';
import { getTeamMembers } from '@/services/teamService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { EditIcon, Loader2, TrashIcon, X } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { getUser } from '@/lib/auth';


// Helper function to format date
const format = (date, formatStr) => {
  if (!date) return '';
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

// Helper function to check edit permissions
const hasEditPermission = () => {
  const currentUser = getUser();
  return currentUser && (currentUser.role === 'ADMIN' || currentUser.role === 'EDITOR');
};

const StudentApplication = ({ studentId }) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // Add pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalApplications, setTotalApplications] = useState(0);
  const limit = 10; // Set a default limit for applications per page


  // State for update modal
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [updatingApp, setUpdatingApp] = useState(null);
  const [updateForm, setUpdateForm] = useState({
    status: '',
    progress: '',
    taskAssignments: [],
    assignTo: '',
  });
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [membersLoading, setMembersLoading] = useState(false);
  const [isTaskDropdownOpen, setIsTaskDropdownOpen] = useState(false);

  const resetFrom =()=>{
    setUpdateForm({
    status: '',
    progress: '',
    taskAssignments: [],
    assignTo: '',
  })
    setTasks([])
    setMembers([])
    setIsTaskDropdownOpen(false)
  }

  // Function to fetch applications for the given studentId with pagination
  const fetchApplications = async (page = 1) => {
    if (!studentId) return;
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: page,
        limit: limit,
        studentId: studentId,
      };
      const res = await getApplications(params);
      setApplications(res.data?.applications || []);

      // Update pagination state from the API response
      if (res.data?.pagination) {
        setTotalPages(res.data.pagination.totalPages);
        setTotalApplications(res.data.pagination.total);
        setCurrentPage(res.data.pagination.page);
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load applications');
      toast.error(err?.response?.data?.message || 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications(currentPage);
  }, [studentId, currentPage]);

  // Handle opening the update modal
  const handleUpdate = async (app) => {
    if (!hasEditPermission()) {
      toast.error('You don\'t have permission to update applications');
      return;
    }
    setUpdatingApp(app);
    setUpdateForm({
      status: app.status || '',
      progress: app.progress || '',
      taskAssignments: app.taskAssignments?.map(t => t.taskId || t._id) || [],
      assignTo: app.assignTo?._id || app.assignTo || '',
    });

    // Fetch tasks and members for the dropdowns
    setTasksLoading(true);
    getTasksByStudentId({ studentId : app.studentId?._id || app.studentId})
      .then(res => setTasks(res.data?.task || []))
      .catch(() => setTasks([]))
      .finally(() => setTasksLoading(false));

    setMembersLoading(true);
    getTeamMembers({ page: 1, limit: 100 })
      .then(res => {
        setMembers(res.data?.members || res.members || [])
      })
      .catch(() => setMembers([]))
      .finally(() => setMembersLoading(false));

    setIsUpdateOpen(true);
  };

  // Handle update form submission
    const handleUpdateSubmit = async (e) => {
        e.preventDefault();
        if (!hasEditPermission()) {
            toast.error('You don\'t have permission to update applications');
            return;
        }
        if (!updatingApp) return;

        try {
            setLoading(true);

            const payload = {};
            if (updateForm.status) payload.status = updateForm.status;
            if (
                updateForm.progress !== '' &&
                updateForm.progress !== null &&
                updateForm.progress !== undefined
            ) {
                payload.progress = Number(updateForm.progress);
            }

            // --- Task Assignments Validation ---
            if (Array.isArray(updateForm.taskAssignments)) {
                if (updateForm.taskAssignments.length === 0) {
                    toast.error('At least one task assignment is required');
                    setLoading(false);
                    return;
                }

                const existingTaskIds = updatingApp.taskAssignments.map(
                    (t) => t.taskId?._id || t._id || t
                );

                const newTasks = updateForm.taskAssignments.filter(
                    (taskId) => !existingTaskIds.includes(taskId)
                );
                const removedTasks = existingTaskIds.filter(
                    (taskId) => !updateForm.taskAssignments.includes(taskId)
                );

                if (newTasks.length > 0 || removedTasks.length > 0) {
                    payload.taskAssignments = updateForm.taskAssignments;
                }
            } else if (updatingApp.taskAssignments && updatingApp.taskAssignments.length > 0) {
                payload.taskAssignments = [];
            }
            // --- End Validation ---

            if (updateForm.assignTo) payload.assignTo = updateForm.assignTo;

            await updateApplication(updatingApp._id, payload);
            toast.success('Application updated successfully');
            setIsUpdateOpen(false);
            setUpdatingApp(null);
            fetchApplications(currentPage); // Refetch applications to show updated data
        } catch (err) {
            toast.error('Failed to update application: ' + err.response?.data?.message);
        } finally {
            setLoading(false);
        }
    };

  // Handle application deletion
  const handleDelete = async (appId) => {
    if (!hasEditPermission()) {
      toast.error('You don\'t have permission to delete applications');
      return;
    }
    if (window.confirm('Are you sure you want to delete this application?')) {
      try {
        await deleteApplication(appId);
        toast.success('Application deleted successfully');
        fetchApplications(currentPage); // Refetch applications
      } catch (err) {
        toast.error('Failed to delete application: ' + err.response?.data?.message);
      }
    }
  };

  if (loading) {
    return <div className="text-center text-muted-foreground">Loading applications...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="px-2">
          {applications.length === 0 ? (
            <div className="text-center text-muted-foreground p-8">No applications found for this student.</div>
          ) : (
            <Table >
              <TableHeader>
                <TableRow>
                  <TableHead>University</TableHead>
                  <TableHead>Program</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Last Updated</TableHead>
                  {hasEditPermission() && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody >
                {applications.map((app) => {
                  const university = app.university || app.universityId || {};
                  const program = university.program || app.program || 'N/A';
                  const status = app.status || 'N/A';
                  const progress = typeof app.progress === 'number' ? app.progress : 0;
                  const lastUpdated = app.updatedAt || app.createdAt || '';

                  let badgeClass = 'bg-gray-200 text-gray-700';
                  switch (status.toUpperCase()) {
                    case 'APPROVED':
                      badgeClass = 'bg-green-500 text-white';
                      break;
                    case 'REJECTED':
                      badgeClass = 'bg-red-500 text-white';
                      break;
                    case 'PENDING':
                      badgeClass = 'bg-yellow-500 text-white';
                      break;
                    case 'INTERVIEW':
                      badgeClass = 'bg-blue-500 text-white';
                      break;
                  }

                  return (
                    <TableRow  key={app._id}>
                      <TableCell className="font-medium">{university.name || 'N/A'}</TableCell>
                      <TableCell>{program}</TableCell>
                      <TableCell>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badgeClass}`}>{status}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-2 rounded-full" style={{ width: `${progress}%`, background: progress === 100 ? '#22c55e' : '#3b82f6' }}></div>
                          </div>
                          <span className="text-xs font-medium">{progress}%</span>
                        </div>
                      </TableCell>
                      <TableCell>{lastUpdated ? format(lastUpdated, 'yyyy-MM-dd') : 'N/A'}</TableCell>
                      {hasEditPermission() && (
                        <TableCell className="text-right">
                          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleUpdate(app)}>
                            <EditIcon className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500" onClick={() => handleDelete(app._id)}>
                            <TrashIcon className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      {/* Pagination Controls */}
      {totalApplications > limit && (
        <div className="flex items-center justify-between mt-4">
          <div>
            Showing {Math.min((currentPage - 1) * limit + 1, totalApplications)} - {Math.min(currentPage * limit, totalApplications)} of {totalApplications} applications
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => prev + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Update Application Modal */}
      <Dialog open={isUpdateOpen} onOpenChange={(isOpen)=>{
        setIsUpdateOpen(isOpen)
        if(!isOpen){
          resetFrom()
        }
}}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Update Application</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateSubmit} className="space-y-4">
            <div>
              <label className="block mb-1 font-medium">Status</label>
              <Select
                value={updateForm.status}
                onValueChange={val => setUpdateForm(f => ({ ...f, status: val }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                        <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
                        <SelectItem value="SUBMITTED">Submitted</SelectItem>
                        <SelectItem value="REVIEWED">Reviewed</SelectItem>
                        <SelectItem value="APPROVED">Approved</SelectItem>
                        <SelectItem value="DRAFT">Draft</SelectItem>
                        <SelectItem value="REJECTED">Rejected</SelectItem>
                    </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block mb-1 font-medium">Progress (%)</label>
              <Input
                type="number"
                min="0"
                max="100"
                value={updateForm.progress}
                onChange={e => setUpdateForm(f => ({ ...f, progress: e.target.value }))}
                placeholder="Enter progress (0-100)"
              />
            </div>
             <div>
              <label className="block mb-1 font-medium">Assign To</label>
              <Select
                value={updateForm.assignTo}
                onValueChange={val => setUpdateForm(f => ({ ...f, assignTo: val }))}
                disabled={membersLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder={membersLoading ? 'Loading members...' : 'Select Member'} />
                </SelectTrigger>
                <SelectContent>
                  {members.map(member => (
                    <SelectItem key={member._id} value={member._id}>{member.email}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
           <div>
            <label className="block mb-1 font-medium">Task Assignments</label>
            <div className="relative">
                <button
                    type="button"
                    className="w-full border rounded-md p-2 text-left disabled:bg-gray-100 disabled:cursor-not-allowed"
                    disabled={tasksLoading}
                    onClick={() => setIsTaskDropdownOpen(!isTaskDropdownOpen)}>
                    {updateForm.taskAssignments.length > 0
                        ? `${updateForm.taskAssignments.length} task(s) selected`
                        : 'Select Tasks'}
                </button>
                {isTaskDropdownOpen && (
                    <div className="z-10 bg-white border rounded-md mt-1 w-full text-sm  max-h-[200px] overflow-y-auto">
                        <ul className='p-2'>
                            {tasksLoading ? (
                                <div className="p-2 flex justify-center">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                </div>
                            ) : (
                                tasks.length > 0 ? (
                                    tasks.map((task) => {
                                        const taskId = task.taskId?._id || task._id;
                                        const isSelected = updateForm.taskAssignments.includes(taskId);
                                        return (
                                            <li
                                                key={taskId}
                                                className={`p-2 mx-2 cursor-pointer hover:bg-gray-100 flex justify-between items-center ${
                                                    isSelected ? 'bg-gray-200' : ''
                                                }`}
                                                onClick={() => {
                                                    setUpdateForm((f) => {
                                                        const alreadySelected = f.taskAssignments.includes(taskId);
                                                        return {
                                                            ...f,
                                                            taskAssignments: alreadySelected
                                                                ? f.taskAssignments.filter((tid) => tid !== taskId)
                                                                : [...f.taskAssignments, taskId]
                                                        }
                                                    });
                                                }}>
                                                {task.taskId?.title || task.title}
                                                {isSelected && <span className="text-xs">✓</span>}
                                            </li>
                                        )
                                    })
                                ) : (
                                    <h1 className="text-center"> No Task Found</h1>
                                )
                            )}
                        </ul>
                    </div>
                )}
            </div>

            {/* Selected tasks badges/chips */}
            {updateForm.taskAssignments.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                    {tasks
                        .filter((t) => updateForm.taskAssignments.includes(t.taskId?._id || t._id))
                        .map((t) => (
                            <span
                                key={t.taskId?._id || t._id}
                                className="text-sm bg-gray-100 px-2 py-1 rounded flex items-center gap-1">
                                {t.taskId?.title || t.title}
                                <button
                                    type="button"
                                    onClick={() =>
                                        setUpdateForm((f) => ({
                                            ...f,
                                            taskAssignments: f.taskAssignments.filter((tid) => tid !== (t.taskId?._id || t._id))
                                        }))
                                    }>
                                    <X className="h-3 w-3" />
                                </button>
                            </span>
                        ))}
                </div>
            )}
        </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsUpdateOpen(false)}>Cancel</Button>
              <Button type="submit" variant="default" disabled={loading}>Update</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentApplication;
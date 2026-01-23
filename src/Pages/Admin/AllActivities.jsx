import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useState, useEffect, memo } from 'react';
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
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { MultipleStudentSelect } from '@/components/tasks/MultipleStudentSelect';
import { Loader2, ChevronDown, ChevronUp, FileText, CheckCircle, Clock, AlertCircle, Download, User, MessageSquare, Calendar } from 'lucide-react';
import { getStudentQuestionnaireResponses } from '@/services/api.services';
import { getAdminStudentActivities, markStudentActivityAsRead } from '@/services/adminActivityService';
import { getStudents } from '@/services/studentService';

const statusClasses = {
  PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  ACTIVE: 'bg-blue-100 text-blue-800 border-blue-300',
  COMPLETED: 'bg-green-100 text-green-800 border-green-300',
  REJECTED: 'bg-red-100 text-red-800 border-red-300',
};

const PAGE_SIZE = 10;

const TaskPopupInner = memo(({ task, onClose, specificStudentId, specificQuestionnaireId }) => {
  const [responses, setResponses] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState({});               // studentId → true/false

  // -----------------------------------------------------------------
  // FETCH
  // -----------------------------------------------------------------
  const fetchResponses = async () => {
    if (!task?._id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await getStudentQuestionnaireResponses(task._id, 1, 10);
      console.log('API RESPONSE:', res);
      if (res?.data?.success) setResponses(res.data.data);
      else setError('Failed to load responses');
    } catch (err) {
      console.error('API ERROR:', err);
      setError(err?.response?.data?.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('Opening popup with task:', task, 'specificStudentId:', specificStudentId, 'specificQuestionnaireId:', specificQuestionnaireId); // Debug log
    fetchResponses();
  }, [task?._id]);

  // Filter responses based on specific student and/or questionnaire
  const filteredData = responses?.data
    ? responses.data.filter(student => 
        (!specificStudentId || student._id === specificStudentId)
      ).map(student => ({
        ...student,
        questionnaires: student.questionnaires.filter(q => 
          (!specificQuestionnaireId || q.questionnaireId === specificQuestionnaireId)
        )
      })).filter(student => student.questionnaires.length > 0) // Only include students with matching questionnaires
    : [];

  const filteredResponses = {
    ...responses,
    data: filteredData
  };

  // -----------------------------------------------------------------
  // TOGGLE EXPAND
  // -----------------------------------------------------------------
  const toggle = (studentId) => {
    setExpanded((prev) => ({ ...prev, [studentId]: !prev[studentId] }));
  };

  // -----------------------------------------------------------------
  // HELPERS
  // -----------------------------------------------------------------
  const statusIcon = (assignmentStatus) => {
    switch (assignmentStatus) {
      case 'COMPLETED': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'PENDING': return <AlertCircle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const answerDisplay = (q) => {
    if (!q.answer) return <span className="text-muted-foreground">Not answered</span>;

    if (q.ansType === 'FILE')
      return (
        <a href={q.answer} target="_blank" rel="noopener noreferrer"
           className="inline-flex items-center gap-1 text-blue-600 hover:underline">
          <Download className="h-3 w-3" /> View File
        </a>
      );

    if (q.ansType === 'CHECKBOX')
      return Array.isArray(q.answer) ? q.answer.join(', ') : q.answer;

    if (q.ansType === 'DATE')
      return new Date(q.answer).toLocaleDateString();

    return q.answer;
  };

  if (!task) return null;

  return (
    <Dialog open={!!task} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[820px] max-h-[90vh] overflow-y-auto p-0">
        {/* ---------- HEADER ---------- */}
        <DialogHeader className="p-6 pb-3 border-b">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2 text-xl font-bold">
                <FileText className="h-5 w-5" />
                {task.title}
              </DialogTitle>
              {task.description && (
                <DialogDescription className="mt-1 text-sm">
                  {task.description}
                </DialogDescription>
              )}
            </div>
            {/* <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button> */}
          </div>
        </DialogHeader>

        {/* ---------- BODY ---------- */}
        <div className="p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="mt-2 text-sm text-muted-foreground">Loading responses…</p>
            </div>
          ) : error ? (
            <p className="text-center py-8 text-destructive">{error}</p>
          ) : !filteredResponses.data || filteredResponses.data.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No responses found.</p>
          ) : (
            <>
              {/* ---- STUDENT LIST (Tailwind Collapsible) ---- */}
              <div className="space-y-4">
                {filteredResponses.data.map((student) => {
                  const isOpen = !!expanded[student._id];
                  const completed = student.questionnaires.filter(q => q.assignmentStatus === 'COMPLETED').length;
                  const total = student.questionnaires.length;
                  const percent = Math.round((completed / total) * 100);

                  return (
                    <Card key={student._id} className="overflow-hidden">
                      {/* ----- HEADER (clickable) ----- */}
                      <button
                        onClick={() => toggle(student._id)}
                        className="w-full text-left p-4 hover:bg-muted/50 transition-colors flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-semibold">{student.name}</p>
                            <p className="text-sm text-muted-foreground">{student.email}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="text-sm font-medium">
                              {completed}/{total} Completed
                            </p>
                            <p className="text-xs text-muted-foreground">{percent}%</p>
                          </div>

                          <Badge
                            variant={completed === total ? 'success' : 'secondary'}
                            className="capitalize"
                          >
                            {completed === total ? 'Done' : 'In Progress'}
                          </Badge>

                          {isOpen ? (
                            <ChevronUp className="h-5 w-5 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                      </button>

                      {/* ----- COLLAPSIBLE CONTENT (Tailwind) ----- */}
                      <div
                        className={`transition-all duration-300 ease-in-out overflow-hidden ${
                          isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
                        }`}
                      >
                        <div className="border-t p-4 bg-muted/5 space-y-4">
                          {student.questionnaires.map((q) => (
                            <Card key={q.questionnaireId} className="border">
                              <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                  <CardTitle className="flex items-center gap-2 text-base font-semibold">
                                    {statusIcon(q.assignmentStatus)}
                                    {q.title}
                                  </CardTitle>
                                  <Badge
                                    variant={
                                      q.assignmentStatus === 'COMPLETED'
                                        ? 'success'
                                        : 'secondary'
                                    }
                                  >
                                    {q.assignmentStatus}
                                  </Badge>
                                </div>

                                {q.subtask && (
                                  <p className="mt-1 text-sm text-muted-foreground">
                                    Subtask: {q.subtask.title}
                                  </p>
                                )}

                                <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                                  <Calendar className="h-3 w-3" />
                                  Assigned: {new Date(q.assignedAt).toLocaleDateString()}
                                </p>
                              </CardHeader>

                              <CardContent className="space-y-3">
                                {q.questions.map((ques) => (
                                  <div
                                    key={ques._id}
                                    className="p-3 bg-background rounded-md border space-y-2"
                                  >
                                    <div className="flex items-start justify-between">
                                      <p className="font-medium text-sm">{ques.question}</p>
                                      <Badge
                                        variant={ques.status === 'SUBMITTED' ? 'outline' : 'secondary'}
                                        className="text-xs"
                                      >
                                        {ques.status}
                                      </Badge>
                                    </div>

                                    <div className="text-sm text-muted-foreground">
                                      {answerDisplay(ques)}
                                    </div>

                                    {ques.submittedAt && (
                                      <p className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <Calendar className="h-3 w-3" />
                                        {new Date(ques.submittedAt).toLocaleString()}
                                      </p>
                                    )}

                                    {ques.feedback && (
                                      <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                                        <p className="flex items-start gap-1 text-xs text-green-800">
                                          <MessageSquare className="h-3 w-3 mt-0.5" />
                                          <span className="font-medium">Feedback:</span> {ques.feedback}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* ---------- FOOTER ---------- */}
        <DialogFooter className="p-4 border-t">
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});

const AllActivities = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [activities, setActivities] = useState([]);
  const [students, setStudents] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [viewTask, setViewTask] = useState(null);

  const handleMarkAsRead = async (activityId) => {
    if (activityId) {
      try {
        await markStudentActivityAsRead(activityId);
        // Optimistically update local state
        setActivities(prev => prev.map(activity => 
          activity._id === activityId ? { ...activity, isRead: true } : activity
        ));
      } catch (err) {
        console.error('Failed to mark activity as read:', err);
        // Optionally handle error (e.g., show toast)
      }
    }
  };

  // Fetch students for filter dropdown
  useEffect(() => {
    async function fetchStudents() {
      try {
        const res = await getStudents({ page: 1, limit: 100 });
        setStudents(res.data?.students || []);
      } catch (err) {
        setStudents([]);
        console.error('Failed to load students:', err);
      }
    }
    fetchStudents();
  }, []);

  // Fetch activities with filters and pagination
  useEffect(() => {
    async function fetchActivities() {
      setLoading(true);
      setError(null);
      try {
        const params = {
          page,
          limit: PAGE_SIZE,
          search: searchQuery || undefined,
          status: statusFilter !== 'ALL' ? statusFilter : undefined,
          students: selectedStudents.length > 0 ? selectedStudents.join(',') : undefined,
        };
        const res = await getAdminStudentActivities(params.page, params.limit, params);
        setActivities(res.data?.activities || []);
        setTotalPages(res.data?.pages || 1);
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load activities');
      } finally {
        setLoading(false);
      }
    }
    fetchActivities();
  }, [searchQuery, statusFilter, selectedStudents, page]);

  const handleStudentsChange = (selected) => {
    setSelectedStudents(selected);
    setPage(1);
  };

  const handleStatusChange = (value) => {
    setStatusFilter(value);
    setPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setPage(1);
  };

  const handleRowClick = async (activity) => {
    const isSubmission = activity.message?.includes('submitted responses for questionnaire');
    if (!activity.isRead) {
      await handleMarkAsRead(activity._id);
    }
    if (isSubmission) {
      console.log('Clicked submission activity:', activity); // Debug log to see full activity structure
      const taskId = activity.details?.taskId;
      if (taskId) {
        const match = activity.message.match(/\"(.*?)\"/);
        const questionnaireTitle = match ? match[1] : 'Unknown Questionnaire';
        setViewTask({ 
          _id: taskId, 
          title: `Responses for "${questionnaireTitle}"`,
          specificStudentId: activity.student._id,
          specificQuestionnaireId: activity.details?.questionnaireId
        });
      } else {
        console.log('No taskId found in activity.details');
      }
    }
    if (activity.applicationId) {
      window.location.href = `/app/${activity.applicationId}`;
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">All Activities</h1>

      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <Input
          className="max-w-md"
          placeholder="Search activities..."
          value={searchQuery}
          onChange={handleSearchChange}
        />
        <div className="flex flex-col sm:flex-row gap-4">
          <Select value={statusFilter} onValueChange={(e)=>{setSearchQuery('') ; handleStatusChange(e)}}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="SUBMITTED">Submitted</SelectItem>
              <SelectItem value="UPDATED">Updated</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
            </SelectContent>
          </Select>

          {/* <div className="w-[220px]">
            <MultipleStudentSelect
              students={students}
              selectedStudents={selectedStudents}
              onChange={handleStudentsChange}
            />
          </div> */}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Student Activities</CardTitle>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="text-center text-red-500">{error}</div>
          ) : loading ? (
            <div className="text-center text-muted-foreground">Loading...</div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activities.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">No activities found.</TableCell>
                    </TableRow>
                  ) : (
                    activities.map((activity) => {
                      const isUnread = !activity.isRead;
                      const isSubmission = activity.message?.includes('submitted responses for questionnaire');
                      const isClickable = isUnread || isSubmission || activity.applicationId;
                      const rowClass = `${isUnread ? 'bg-primary/10 border-l-4 border-primary hover:bg-primary/20' : 'hover:bg-gray-50'} ${isClickable ? 'cursor-pointer' : ''}`;
                      return (
                        <TableRow
                          key={activity._id}
                          className={rowClass}
                          onClick={() => handleRowClick(activity)}
                          title={activity.applicationId ? 'Go to application' : ''}
                        >
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={activity.student?.image} alt={activity.student?.name} />
                                <AvatarFallback>{(activity.student?.name || activity.student?.email || 'U').split(' ').map(n => n[0]).join('')}</AvatarFallback>
                              </Avatar>
                              <span className="font-medium text-gray-900">{activity.student?.name || activity.student?.email || 'Unknown'}</span>
                            </div>
                          </TableCell>
                          <TableCell className='truncate max-w-[150px]' title={activity.activityType}>{activity.activityType || activity.type || '-'}</TableCell>
                          <TableCell>{activity.subject || activity.message || '-'}</TableCell>
                          <TableCell>{activity.createdAt ? new Date(activity.createdAt).toLocaleDateString() : '-'}</TableCell>
                          <TableCell>
                            {activity.status && (
                              <Badge variant="outline" className={statusClasses[activity.status] || ''}>
                                {activity.status.toLowerCase()}
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>

              {/* Pagination Controls */}
              {totalPages > 1 && 
              <div className="flex justify-end items-center gap-2 mt-4">
                <button
                  className="px-3 py-1 rounded border disabled:opacity-50"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </button>
                <span>Page {page} of {totalPages}</span>
                <button
                  className="px-3 py-1 rounded border disabled:opacity-50"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next
                </button>
              </div>

              }
            </>
          )}
        </CardContent>
      </Card>
      {viewTask && (
        <TaskPopupInner 
          task={viewTask} 
          onClose={() => setViewTask(null)}
          specificStudentId={viewTask.specificStudentId}
          specificQuestionnaireId={viewTask.specificQuestionnaireId}
        />
      )}
    </div>
  );
};

export default AllActivities;
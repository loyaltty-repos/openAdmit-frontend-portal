import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';
import { useState, useEffect, memo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Loader2, X, ChevronDown, ChevronUp, FileText, CheckCircle, Clock, AlertCircle, Download, User, MessageSquare } from 'lucide-react';
import { getStudentQuestionnaireResponses } from '@/services/api.services';
import { getAdminStudentActivities, getAdminDashboardStats, getAdminUpcomingDeadlines, markStudentActivityAsRead } from '@/services/adminActivityService';
import { useNavigate } from 'react-router-dom';

// ✅ NEW: Admin Logs widget (Admin Notifications)
import AdminLogs from '@/components/AdminLogs';

function getInitials(name) {
  if (!name) return '';
  const parts = name.split(' ');
  if (parts.length === 1) return parts[0][0];
  return parts[0][0] + parts[1][0];
}

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
        <DialogHeader className="p-4 sm:p-6 pb-2 sm:pb-3 border-b">
          <div className="flex items-center justify-between">
            <div className="flex-1 pr-2 sm:pr-0">
              <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl font-bold">
                <FileText className="h-5 w-5 flex-shrink-0" />
                {task.title}
              </DialogTitle>
              {task.description && (
                <DialogDescription className="mt-1 text-sm line-clamp-2">
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
        <div className="p-4 sm:p-6">
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
                        className="w-full text-left p-3 sm:p-4 hover:bg-muted/50 transition-colors flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <User className="h-5 w-5 text-primary" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold truncate">{student.name}</p>
                            <p className="text-sm text-muted-foreground truncate">{student.email}</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 sm:gap-3 w-full sm:w-auto">
                          <div className="text-right flex-shrink-0">
                            <p className="text-sm font-medium hidden sm:block">
                              {completed}/{total} Completed
                            </p>
                            <p className="text-xs text-muted-foreground">{percent}%</p>
                          </div>

                          <Badge
                            variant={completed === total ? 'success' : 'secondary'}
                            className="capitalize flex-shrink-0"
                          >
                            {completed === total ? 'Done' : 'In Progress'}
                          </Badge>

                          {isOpen ? (
                            <ChevronUp className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                          )}
                        </div>
                      </button>

                      {/* ----- COLLAPSIBLE CONTENT (Tailwind) ----- */}
                      <div
                        className={`transition-all duration-300 ease-in-out overflow-hidden ${
                          isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
                        }`}
                      >
                        <div className="border-t p-3 sm:p-4 bg-muted/5 space-y-4">
                          {student.questionnaires.map((q) => (
                            <Card key={q.questionnaireId} className="border">
                              <CardHeader className="pb-2 sm:pb-3">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                  <CardTitle className="flex items-center gap-2 text-sm sm:text-base font-semibold flex-1">
                                    {statusIcon(q.assignmentStatus)}
                                    <span className="truncate">{q.title}</span>
                                  </CardTitle>
                                  <Badge
                                    variant={
                                      q.assignmentStatus === 'COMPLETED'
                                        ? 'success'
                                        : 'secondary'
                                    }
                                    className="flex-shrink-0"
                                  >
                                    {q.assignmentStatus}
                                  </Badge>
                                </div>

                                {q.subtask && (
                                  <p className="mt-1 text-sm text-muted-foreground line-clamp-1">
                                    Subtask: {q.subtask.title}
                                  </p>
                                )}

                                <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                                  <Calendar className="h-3 w-3 flex-shrink-0" />
                                  Assigned: {new Date(q.assignedAt).toLocaleDateString()}
                                </p>
                              </CardHeader>

                              <CardContent className="space-y-3 p-0">
                                {q.questions.map((ques) => (
                                  <div
                                    key={ques._id}
                                    className="p-2 sm:p-3 bg-background rounded-md border space-y-2"
                                  >
                                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                                      <p className="font-medium text-sm line-clamp-2 sm:pr-2">{ques.question}</p>
                                      <Badge
                                        variant={ques.status === 'SUBMITTED' ? 'outline' : 'secondary'}
                                        className="text-xs flex-shrink-0 self-start sm:self-auto"
                                      >
                                        {ques.status}
                                      </Badge>
                                    </div>

                                    <div className="text-sm text-muted-foreground break-words">
                                      {answerDisplay(ques)}
                                    </div>

                                    {ques.submittedAt && (
                                      <p className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <Calendar className="h-3 w-3 flex-shrink-0" />
                                        {new Date(ques.submittedAt).toLocaleString()}
                                      </p>
                                    )}

                                    {ques.feedback && (
                                      <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                                        <p className="flex items-start gap-1 text-xs text-green-800 break-words">
                                          <MessageSquare className="h-3 w-3 mt-0.5 flex-shrink-0" />
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
          <Button onClick={onClose} variant="outline" className="w-full sm:w-auto">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalActiveApplications: 0,
    totalPendingTasks: 0,
    totalCompletedTasks: 0,
    statsChange: {},
  });
  const [activities, setActivities] = useState([]);
  const [deadlines, setDeadlines] = useState([]);
  const [loading, setLoading] = useState({
    stats: true,
    activities: true,
    deadlines: true,
  });
  const [error, setError] = useState(null);
  const [viewTask, setViewTask] = useState(null);
  const navigate = useNavigate();

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

  useEffect(() => {
    async function fetchDashboard() {
      setLoading({
        stats: true,
        activities: true,
        deadlines: true,
      });
      setError(null);
      
      try {
        const statsRes = await getAdminDashboardStats();
        
        setStats({
          totalStudents: statsRes.data?.totalStudents || 0,
          totalActiveApplications: statsRes.data?.totalActiveApplications || 0,
          totalPendingTasks: statsRes.data?.totalPendingTasks || 0,
          totalCompletedTasks: statsRes.data?.totalCompletedTasks || 0,
          statsChange: statsRes.data?.statsChange || {
            totalStudents: '0%',
            totalActiveApplications: '0%',
            totalPendingTasks: '0%',
            totalCompletedTasks: '0%'
          }
        });
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
      } finally {
        setLoading(prev => ({ ...prev, stats: false }));
      }
      
      try {
        const activitiesRes = await getAdminStudentActivities(1, 5 , {});
        setActivities(activitiesRes.data?.activities || []);
      } catch (err) {
        console.error('Error fetching activities:', err);
      } finally {
        setLoading(prev => ({ ...prev, activities: false }));
      }
      
      try {
        const deadlinesRes = await getAdminUpcomingDeadlines(1, 5);
        setDeadlines(deadlinesRes.data?.upcomingDeadlines || []);
      } catch (err) {
        console.error('Error fetching deadlines:', err);
      } finally {
        setLoading(prev => ({ ...prev, deadlines: false }));
      }
    }
    
    fetchDashboard();
  }, []);

  console.log(activities)
  return (
    <div className="space-y-4 w-full">
      <div className="flex flex-col sm:flex-row flex-wrap gap-2 items-start sm:items-center justify-between">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center space-x-2">
          <Button size="sm" className="sm:min-w-[140px]">
            <Calendar className="mr-2 h-4 w-4" /> {new Date().toLocaleDateString()}
          </Button>
        </div>
      </div>

      {error ? (
        <div className="text-center text-red-500">{error}</div>
      ) : (
        <div className="grid gap-4 sm:gap-6">
          {/* Stats Row */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {loading.stats ? (
              <>
                {[1, 2, 3, 4].map(i => (
                  <Card key={i}>
                    <CardContent className="pt-4 sm:pt-6 pb-3 sm:pb-4">
                      <div className="text-center text-muted-foreground py-4">Loading...</div>
                    </CardContent>
                  </Card>
                ))}
              </>
            ) : (
              <>
                <Card onClick={() => navigate('/admin/students')} className='cursor-pointer'>
                  <CardContent className="pt-4 sm:pt-6 pb-3 sm:pb-4">
                    <div className="text-xs text-muted-foreground font-medium">Total Students</div>
                    <div className="text-2xl sm:text-3xl font-bold mt-1">
                      {stats.totalStudents}
                    </div>
                    
                  </CardContent>
                </Card>
                {/* <Card>
                  <CardContent className="pt-4 sm:pt-6 pb-3 sm:pb-4">
                    <div className="text-xs text-muted-foreground font-medium">Active Applications</div>
                    <div className="text-2xl sm:text-3xl font-bold mt-1">
                      {stats.totalActiveApplications}
                    </div>
                   
                  </CardContent>
                </Card> */}
                <Card onClick={() => navigate('/admin/tasks')} className='cursor-pointer'>
                  <CardContent className="pt-4 sm:pt-6 pb-3 sm:pb-4">
                    <div className="text-xs text-muted-foreground font-medium">Pending Tasks</div>
                    <div className="text-2xl sm:text-3xl font-bold mt-1">
                      {stats.totalPendingTasks}
                    </div>
                    
                  </CardContent>
                </Card>
                <Card onClick={() => navigate('/admin/tasks')} className='cursor-pointer'>
                  <CardContent className="pt-4 sm:pt-6 pb-3 sm:pb-4">
                    <div className="text-xs text-muted-foreground font-medium">Completed Tasks</div>
                    <div className="text-2xl sm:text-3xl font-bold mt-1">
                      {stats.totalCompletedTasks}
                    </div>
                    
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          {/* ✅ Row 1: Recent Activity (left) + Admin Logs (right) */}
          <div className="grid gap-4 sm:gap-3 lg:grid-cols-3">
            {/* Recent Activity (UNCHANGED) */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-3 sm:p-6 max-md:p-3">
              <div className="font-semibold text-base sm:text-lg mb-4 line-clamp-1 text-gray-900"> Student's Activity</div>
              <div className="divide-y">
                {loading.activities ? (
                  <div className="text-center text-muted-foreground py-8">Loading activities...</div>
                ) : activities.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">No recent activity found.</div>
                ) : (
                  activities.map((activity) => {
                    const isSubmission = activity.message?.includes('submitted responses for questionnaire');
                    const highlightClass = !activity.isRead ? 'bg-primary/10 border-l-4 border-primary hover:bg-primary/20 rounded-r p-2' : '';
                    const handleClick = async () => {
                      if (!activity.isRead) {
                        await handleMarkAsRead(activity._id);
                      }
                      if (isSubmission) {
                        console.log('Clicked submission activity:', activity); 
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
                    };
                    return (
                      <div 
                        key={activity._id} 
                        className={`flex flex-col sm:flex-row sm:items-center py-3 sm:py-4 gap-3 sm:gap-4 ${highlightClass} ${isSubmission ? 'cursor-pointer hover:bg-gray-50 transition-colors' : activity.isRead ? '' : 'cursor-pointer hover:bg-primary/20 transition-colors'}`}
                        onClick={handleClick}
                      >
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-base font-bold text-gray-600">
                          {getInitials(activity.student?.name || activity.student?.email || 'U')}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 truncate">{activity.student?.name || activity.student?.email || 'Unknown Student'}</div>
                          <div className="text-sm text-muted-foreground line-clamp-2 break-words">{activity.message}</div>
                        </div>
                        <div className="flex flex-row sm:flex-col items-end justify-between sm:justify-end min-w-0 sm:min-w-[80px]">
                          <span className="text-xs text-gray-500 truncate sm:block">{new Date(activity.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          <span className={`mt-1 sm:mt-0 text-xs px-2 py-0.5 rounded-full font-semibold ${activity.status === 'COMPLETED' ? 'bg-primary/10 text-primary' : activity.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'}`}>{activity.status?.toLowerCase()}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              <div className="flex justify-end mt-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-primary"
                  onClick={() => {

                    if (typeof window !== 'undefined') {
                      window.location.href = '/admin/all-activities';
                    }
                  }}
                >
                  View All
                </Button>
              </div>
            </div>

            {/* ✅ Right Side: Admin Logs (Admin Notifications) */}
            <div className="lg:col-span-1">
              <AdminLogs limit={5} showViewAll/>
            </div>
          </div>

          {/* ✅ Row 2: Upcoming Deadlines (MOVED BELOW, UNCHANGED CONTENT) */}
          <div className="bg-white rounded-lg shadow-sm p-3 sm:p-6 max-md:p-3">
            <div className="font-semibold text-base sm:text-lg mb-4 line-clamp-1">Upcoming Deadlines</div>
            <div className="space-y-4">
              {loading.deadlines ? (
                <div className="text-center text-muted-foreground py-8">Loading deadlines...</div>
              ) : deadlines.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">Not available</div>
              ) : (
                deadlines.map((deadline, i) => (
                  <div key={deadline._id || i} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                    <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold flex-shrink-0 ${
                      deadline.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : 
                      deadline.status === 'ACTIVE' ? 'bg-blue-100 text-blue-700' : 
                      deadline.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 
                      'bg-green-100 text-green-700'}`}>
                      {deadline.title?.[0] || 'T'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">{deadline.title || 'Not available'}</div>
                      <div className="text-xs text-muted-foreground truncate">{deadline.student?.name || deadline.student?.email || 'Not available'}</div>
                    </div>
                    <div className="flex flex-col items-end min-w-0 sm:min-w-[90px]">
                      <span className="text-xs text-gray-500 truncate">
                        {deadline.dueDate ? new Date(deadline.dueDate).toLocaleDateString() : 
                         deadline.assignedAt ? new Date(deadline.assignedAt).toLocaleDateString() : 
                         'Not set'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      )}
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

export default AdminDashboard;

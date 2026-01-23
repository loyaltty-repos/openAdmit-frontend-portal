import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Eye, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getTaskSubtaskQuestionDetails } from '@/services/questionnaireService';
import { toast } from 'sonner';

export function StudentQuestionnaires({ studentId }) {
  const [questionnaires, setQuestionnaires] = useState([]);
  const [selectedQuestionnaire, setSelectedQuestionnaire] = useState(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [paginationData , setPaginationData] = useState({})
  const [currentPage , setCurrentPage] = useState(1)
  
  useEffect(() => {
    const fetchQuestionnaireData = async () => {
      if (!studentId) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await getTaskSubtaskQuestionDetails({studentId , page : currentPage});
        
        if (response && response.success) {
          // Extract all questionnaires from all subtasks
          const allQuestionnaires = [];
          
          if (response.student && response.student.tasks) {
            response.student.tasks.forEach(task => {
              if (task.subtasks && Array.isArray(task.subtasks)) {
                task.subtasks.forEach(subtask => {
                  if (subtask.questionnaires && Array.isArray(subtask.questionnaires) && subtask.questionnaires.length > 0) {
                    // Add task/subtask context to each questionnaire
                    const enhancedQuestionnaires = subtask.questionnaires.map(q => ({
                      ...q,
                      taskName: task.task.title || 'Unknown Task',
                      subtaskName: subtask.title || (subtask.subtaskId?.name) || 'Unknown Subtask',
                      taskId: task.task._id,
                      subtaskId: subtask._id || subtask.assignmentId
                    }));
                    
                    allQuestionnaires.push(...enhancedQuestionnaires);
                  }
                });
              }
            });
          }
          
          setQuestionnaires(allQuestionnaires);
          setPaginationData(response.pagination)
        } else {
          setError('Failed to fetch questionnaire data');
        }
      } catch (err) {
        console.error('Error fetching questionnaire data:', err);
        setError(err.message || 'An error occurred while fetching questionnaires');
        toast.error('Failed to load questionnaire data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchQuestionnaireData();
  }, [studentId , currentPage]);
  
  const handleViewQuestionnaire = (questionnaire) => {
    setSelectedQuestionnaire(questionnaire);
    setIsViewOpen(true);
  };

  const getStatusBadge = (status) => {
    const normalizedStatus = status ? status.toLowerCase() : 'pending';
    
    switch (normalizedStatus) {
      case 'completed':
      case 'done':
      case 'finished':
        return <Badge className="bg-green-100 text-green-800 border-green-300">Completed</Badge>;
      case 'pending':
      case 'in progress':
      case 'in-progress':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">Pending</Badge>;
      case 'not-started':
      case 'not started':
      case 'new':
        return <Badge className="bg-gray-100 text-gray-800 border-gray-300">Not Started</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 border-gray-300">{status || 'Unknown'}</Badge>;
    }
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="text-xl">Questionnaires</CardTitle>
        <CardDescription>
          View questionnaires submitted by this student
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        
        {error && (
          <div className="rounded-md bg-red-50 p-4 my-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error loading questionnaires</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {!isLoading && !error && questionnaires.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p>No questionnaires found for this student.</p>
          </div>
        )}
        
        {!isLoading && !error && questionnaires.length > 0 && (
          <div className="space-y-4">
            {questionnaires.map((questionnaire) => (
              <div 
                key={questionnaire._id} 
                className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <h3 className="font-medium">{questionnaire.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {questionnaire.taskName} &gt; {questionnaire.subtaskName}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {questionnaire.updatedAt 
                        ? `Last updated: ${new Date(questionnaire.updatedAt).toLocaleDateString()}` 
                        : 'No submission date available'
                      }
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(questionnaire.status)}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleViewQuestionnaire(questionnaire)}
                  >
                    <Eye className="h-4 w-4 mr-1" /> View
                  </Button>
                </div>
              </div>
            ))}

            {paginationData && paginationData.totalPages > 1 && (
              <div className="flex justify-center my-6 gap-2">
                <Button
                  variant="outline"
                  disabled={!paginationData.hasPrevPage}
                  onClick={()=> setCurrentPage(paginationData.page - 1)}
                >
                  Previous
                </Button>
                <span className="px-4 py-2">
                  Page {paginationData.page} of {paginationData.totalPages}
                </span>
                <Button
                  variant="outline"
                  disabled={!paginationData.hasNextPage}
                  onClick={() => setCurrentPage(paginationData.page + 1 )}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>

      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{selectedQuestionnaire?.title}</DialogTitle>
            <DialogDescription>
              {selectedQuestionnaire?.taskName} &gt; {selectedQuestionnaire?.subtaskName}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Tabs defaultValue="questions">
              <TabsList className="w-full">
                <TabsTrigger value="questions" className="flex-1">Questions</TabsTrigger>
                <TabsTrigger value="details" className="flex-1">Details</TabsTrigger>
              </TabsList>
              <TabsContent value="questions" className="mt-4">
                <div className="space-y-4">
                  {selectedQuestionnaire?.questions?.length > 0 ? (
                    selectedQuestionnaire.questions.map((question, index) => (
                      <div key={question._id || index} className="border-b pb-3 last:border-0">
                        <h3 className="font-medium text-sm">{question.question}</h3>
                        {question.answer ? (
                          <div className="mt-2">
                            <p className="text-xs text-muted-foreground">Answer:</p>
                            <p className="text-sm mt-1">{question.answer}</p>
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground italic mt-1">No answer provided</p>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground italic text-sm">No questions available for this questionnaire.</p>
                  )}
                </div>
              </TabsContent>
              <TabsContent value="details" className="mt-4">
                <div className="text-sm space-y-3">
                  <div>
                    <p className="text-muted-foreground text-xs">Status:</p>
                    <p>{selectedQuestionnaire?.status || 'Unknown'}</p>
                  </div>
                  
                  <div>
                    <p className="text-muted-foreground text-xs">Last Updated:</p>
                    <p>{selectedQuestionnaire?.updatedAt ? new Date(selectedQuestionnaire.updatedAt).toLocaleString() : 'Not available'}</p>
                  </div>
                  
                  <div>
                    <p className="text-muted-foreground text-xs">Description:</p>
                    <p>{selectedQuestionnaire?.description || 'No description available'}</p>
                  </div>
                  
                  <div>
                    <p className="text-muted-foreground text-xs">Total Questions:</p>
                    <p>{selectedQuestionnaire?.questions?.length || 0} questions</p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

StudentQuestionnaires.propTypes = {
  studentId: PropTypes.string.isRequired,
};
import React, { useEffect, useState, memo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Loader2,
  ChevronDown,
  ChevronUp,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  ExternalLink,
  Upload,
  User,
  Edit,
} from 'lucide-react';

import { getStudentQuestionnaireResponses, uploadDocumentUrl } from '@/services/api.services';
import { toast } from 'sonner';

function TaskPopup({ task, onClose }) {
  const [responses, setResponses] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState({});
  const [uploading, setUploading] = useState({});
  const [editingDoc, setEditingDoc] = useState(null);
  const [editingStudent, setEditingStudent] = useState(null);
  const [docUrlInput, setDocUrlInput] = useState('');

  // Fetch responses
  const fetchResponses = async () => {
    if (!task?._id) return;

    setLoading(true);
    setError(null);
    try {
      const res = await getStudentQuestionnaireResponses(task._id, 1, 10);
      if (res?.data?.success) {
        setResponses(res.data.data);
      } else {
        setError('Failed to load responses');
      }
    } catch (err) {
      console.error('API ERROR:', err);
      setError(err?.response?.data?.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };
  console.log(responses)
  useEffect(() => {
    fetchResponses();
  }, [task?._id]);

  const toggle = (studentId) => {
    setExpanded((prev) => ({ ...prev, [studentId]: !prev[studentId] }));
  };

  const statusIcon = (assignmentStatus) => {
    switch (assignmentStatus) {
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'PENDING':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const handleUploadDocument = async () => {
    if (!docUrlInput.trim()) {
      toast.error('Please enter a valid URL');
      return;
    }

    setUploading((prev) => ({ ...prev, [editingDoc]: true }));

    try {
      await uploadDocumentUrl(task._id, editingDoc, docUrlInput, editingStudent);

      // Update UI - only for the specific student
      setResponses((prev) => {
        const newData = JSON.parse(JSON.stringify(prev)); // deep clone
        const targetStudent = newData.data.find((s) => s._id === editingStudent);
        if (targetStudent) {
          targetStudent.questionnaires.forEach((q) => {
            if (q.questionnaireId === editingDoc) {
              q.documentURL = docUrlInput;
              q.documentStatus = 'UPLOADED';
            }
          });
        }
        return newData;
      });

      toast.success('Document URL saved successfully!');
      setEditingDoc(null);
      setEditingStudent(null);
      setDocUrlInput('');
    } catch (err) {
      toast.error(err?.message || 'Failed to save document URL');
    } finally {
      setUploading((prev) => ({ ...prev, [editingDoc]: false }));
    }
  };

  const startEditing = (questionnaireId, currentUrl = '', studentId) => {
    setEditingDoc(questionnaireId);
    setEditingStudent(studentId);
    setDocUrlInput(currentUrl);
  };

  const cancelEditing = () => {
    setEditingDoc(null);
    setEditingStudent(null);
    setDocUrlInput('');
  };

  if (!task) return null;

  return (
    <Dialog open={!!task} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="p-6 pb-3 border-b">
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <FileText className="h-5 w-5" />
            {task.title}
          </DialogTitle>
          {task.description && (
            <DialogDescription className="mt-1 text-sm">
              {task.description}
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="mt-2 text-sm text-muted-foreground">Loading responses…</p>
            </div>
          ) : error ? (
            <p className="text-center py-8 text-destructive">{error}</p>
          ) : !responses?.data?.length ? (
            <p className="text-center py-8 text-muted-foreground">No responses found.</p>
          ) : (
            <div className="space-y-4">
              {responses.data.map((student) => {
                const isOpen = !!expanded[student._id];
                const completed = student.questionnaires.filter(
                  (q) => q.assignmentStatus === 'COMPLETED'
                ).length;
                const total = student.questionnaires.length;
                const percent = total ? Math.round((completed / total) * 100) : 0;

                return (
                  <Card key={student._id} className="overflow-hidden">
                    <button
                      onClick={() => toggle(student._id)}
                      className="w-full text-left p-4 hover:bg-muted/50 transition-colors flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold">{student.name || 'Unknown Student'}</p>
                          <p className="text-sm text-muted-foreground">{student.email}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {completed}/{total} Completed
                          </p>
                          <p className="text-xs text-muted-foreground">{percent}%</p>
                        </div>
                        <Badge variant={completed === total ? 'success' : 'secondary'}>
                          {completed === total ? 'Done' : 'In Progress'}
                        </Badge>
                        {isOpen ? (
                          <ChevronUp className="h-5 w-5" />
                        ) : (
                          <ChevronDown className="h-5 w-5" />
                        )}
                      </div>
                    </button>

                    {isOpen && (
                      <div className="border-t p-4 bg-muted/5 space-y-4">
                        {student.questionnaires.map((q) => (
                          <Card key={q.questionnaireId} className="border mx-4 mb-4">
                            <CardHeader className="pb-3">
                              <div className="flex flex-col gap-3">
                                <div className="flex items-center justify-between flex-wrap gap-3">
                                  <CardTitle className="flex items-center gap-2 text-base font-semibold">
                                    {statusIcon(q.assignmentStatus)}
                                    {q.title}
                                  </CardTitle>

                                  <div className="flex items-center gap-3">
                                    <Badge
                                      variant={
                                        q.assignmentStatus === 'COMPLETED' ? 'success' : 'secondary'
                                      }
                                    >
                                      {q.assignmentStatus}
                                    </Badge>

                                    {/* Document Upload / View / Edit */}
                                    {q.assignmentStatus === 'COMPLETED' && (
                                      <>
                                        {editingDoc === q.questionnaireId && editingStudent === student._id ? (
                                          <div className="flex items-center gap-2 flex-wrap">
                                            <Input
                                              value={docUrlInput}
                                              onChange={(e) => setDocUrlInput(e.target.value)}
                                              placeholder="https://example.com/document.pdf"
                                              className="h-9 w-64 text-sm"
                                              autoFocus
                                            />
                                            <Button
                                              size="sm"
                                              onClick={handleUploadDocument}
                                              disabled={uploading[editingDoc]}
                                            >
                                              {uploading[editingDoc] ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                              ) : (
                                                'Upload'
                                              )}
                                            </Button>
                                            <Button
                                              size="sm"
                                              variant="ghost"
                                              onClick={cancelEditing}
                                            >
                                              Cancel
                                            </Button>
                                          </div>
                                        ) : (
                                          <div className="flex items-center gap-2">
                                            {q.documentURL ? (
                                              <>
                                                <a
                                                  href={q.documentURL}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  className="text-green-700 hover:text-green-900 font-medium text-sm flex items-center gap-1 underline"
                                                >
                                                  <FileText className="h-4 w-4" />
                                                  View Document
                                                  <ExternalLink className="h-3 w-3" />
                                                </a>
                                                <Button
                                                  size="sm"
                                                  variant="ghost"
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    startEditing(q.questionnaireId, q.documentURL || '', student._id);
                                                  }}
                                                  className="h-6 w-6 p-0 cursor-pointer"
                                                >
                                                  <Edit className="h-3 w-3" />
                                                </Button>
                                              </>
                                            ) : (
                                              <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  startEditing(q.questionnaireId, q.documentURL || '', student._id);
                                                }}
                                                className="flex items-center gap-1"
                                              >
                                                <Upload className="h-3.5 w-3.5" />
                                                Upload Document URL
                                              </Button>
                                            )}
                                          </div>
                                        )}
                                      </>
                                    )}
                                  </div>
                                </div>

                                {q.subtask && (
                                  <p className="text-sm text-muted-foreground">
                                    Subtask: {q.subtask.title}
                                  </p>
                                )}
                              </div>
                            </CardHeader>

                            <CardContent className="space-y-3">
                              {q.questions.map((ques) => (
                                <div
                                  key={ques._id}
                                  className="p-3 bg-background rounded-md border"
                                >
                                  <div className="flex items-start justify-between mb-1">
                                    <p className="font-medium text-sm">{ques.question}</p>
                                    <Badge variant="outline" className="text-xs">
                                      {ques.status || 'PENDING'}
                                    </Badge>
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {ques.answer ? (
                                      ques.ansType === 'FILE' ? (
                                        <a
                                          href={ques.answer}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-blue-600 hover:underline flex items-center gap-1"
                                        >
                                          <FileText className="h-3 w-3" />
                                          View File
                                        </a>
                                      ) : Array.isArray(ques.answer) ? (
                                        ques.answer.join(', ')
                                      ) : (
                                        ques.answer
                                      )
                                    ) : (
                                      <span className="italic text-muted-foreground">
                                        Not answered
                                      </span>
                                    )}
                                  </div>
                                  {ques.submittedAt && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {new Date(ques.submittedAt).toLocaleString()}
                                    </p>
                                  )}
                                </div>
                              ))}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        <DialogFooter className="p-4 border-t">
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default memo(TaskPopup);
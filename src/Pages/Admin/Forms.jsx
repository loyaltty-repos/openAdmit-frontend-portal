import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Filter, Plus, Eye, Edit, Trash2, Save, ChevronRight, ChevronLeft, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { createQuestionnaire, getQuestionnaires, deleteQuestionnaire, getQuestionnaireById, updateQuestionnaire } from '@/services/questionnaireService';
import { getLoans } from '@/services/loanService';
import { getUser } from '@/lib/auth';

const Forms = () => {
  const [questionnaires, setQuestionnaires] = useState([]);
  const [selectedQuestionnaire, setSelectedQuestionnaire] = useState(null);
  const [loans, setLoans] = useState([]);

  const hasEditPermission = () => {
    const currentUser = getUser();
    return currentUser && (currentUser.role === 'ADMIN' || currentUser.role === 'EDITOR');
  };

  const [loanFilters, setLoanFilters] = useState({
    page: 1,
    limit: 10,
    status: '',
    admissionTerm: '',
    search: ''
  });
  const [loanPagination, setLoanPagination] = useState({
    currentPage: 1,
    totalPages: 0,
    totalItems: 0,
    itemsPerPage: 10
  }); const [isLoadingLoans, setIsLoadingLoans] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null); const [isViewLoanOpen, setIsViewLoanOpen] = useState(false);

  const [questionnairsFilter, setQuestionnairesFilter] = useState({
    page: 1,
    limit: 10,
    search: '',
    status: ''
  })
  const [questionnairesPagination, setQuestionnairesPagination] = useState({})


  const fetchLoans = useCallback(async () => {
    setIsLoadingLoans(true);
    try {
      const filters = { ...loanFilters };
      if (filters.status === 'ALL') {
        delete filters.status;
      }
      const response = await getLoans(filters);
      setLoans(response.data.loans);
      setLoanPagination(response.data.pagination);
    } catch (error) {
      toast.error(`Failed to fetch loans: ${error.response?.data?.message}`);
    } finally {
      setIsLoadingLoans(false);
    }
  }, [loanFilters]);
  const fetchQuestionnaires = useCallback(async () => {
    try {
      const response = await getQuestionnaires({ questionnairsFilter });
      setQuestionnaires(response.data?.questionnaires || []);
      setQuestionnairesPagination(response.data?.pagination)
    } catch (error) {
      toast.error(`Failed to fetch questionnaires: ${error.response?.data?.message}`);
    }
  }, [questionnairsFilter]);

  useEffect(() => {
    fetchQuestionnaires();
    fetchLoans();
  }, [fetchLoans, fetchQuestionnaires]);

  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formStatus, setFormStatus] = useState('ACTIVE')
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [questionType, setQuestionType] = useState('TEXT');
  const [optionText, setOptionText] = useState('');
  const [selectedMainTask, setSelectedMainTask] = useState('');
  const [selectedSubtask, setSelectedSubtask] = useState('');
  const [currentEditingQuestion, setCurrentEditingQuestion] = useState(null);

  const mainTaskCategories = [
    'Application Documents',
    'Test Preparation',
    'Financial Documentation',
    'Visa Application',
    'University Selection'
  ];

  const subtaskTemplates = {
    'Application Documents': [
      'Draft SOP',
      'Review with counselor',
      'Final submission',
      'Fill personal details',
      'Academic information',
      'Upload documents'
    ],
    'Test Preparation': [
      'Speaking practice',
      'Writing exercise',
      'Mock test',
      'Vocabulary building'
    ],
    'Financial Documentation': [
      'Bank statements',
      'Income proof',
      'Affidavit',
      'Financial guarantee letter'
    ],
    'Visa Application': [
      'Fill visa form',
      'Book appointment',
      'Prepare for interview'
    ],
    'University Selection': [
      'Research universities',
      'Compare programs',
      'Check requirements'
    ]
  };
  const statusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return <Badge className="bg-green-500">Active</Badge>;
      case 'draft':
        return <Badge variant="outline" className='bg-amber-300  '>Draft</Badge>;
      case 'archived':
        return <Badge variant="secondary">Archived</Badge>;
      case 'pending':
        return <Badge variant="outline" className="border-yellow-500 text-yellow-500">Pending</Badge>;
      case 'approved':
        return <Badge className="bg-green-500">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  }; const handleAddQuestion = () => {
    // Check if user has permission
    if (!hasEditPermission()) {
      toast.error('You don\'t have permission to add questions');
      return;
    }

    if (!newQuestion.trim()) {
      toast.error('Please enter question text');
      return;
    }

    const upperQuestionType = questionType.toUpperCase();
    const newQuestionObj = {
      id: questions.length + 1,
      text: newQuestion,
      type: upperQuestionType,
      required: true,
      options: (upperQuestionType === 'MULTIPLE_CHOICE' || upperQuestionType === 'CHECKBOX') ? [] : undefined
    };

    if (upperQuestionType === 'MULTIPLE_CHOICE' || upperQuestionType === 'CHECKBOX') {
      setQuestions([...questions, newQuestionObj]);
      setCurrentEditingQuestion(newQuestionObj);
      toast.info('Please add at least 2 options for this question');
      return;
    } else {
      setQuestions([...questions, newQuestionObj]);
      setNewQuestion('');
      setQuestionType('TEXT');
    }
  };
  const handleAddOption = (questionId) => {
    // Check if user has permission
    if (!hasEditPermission()) {
      toast.error('You don\'t have permission to add options');
      return;
    }

    if (!optionText.trim()) {
      toast.error('Option text cannot be empty');
      return;
    }

    const updatedQuestions = questions.map(q => {
      if (q.id === questionId) {
        const newOptions = [...(q.options || []), optionText];
        return {
          ...q,
          options: newOptions
        };
      }
      return q;
    });
    setQuestions(updatedQuestions);
    setOptionText('');
  };
  const handleRemoveOption = (questionId, optionIndex) => {
    // Check if user has permission
    if (!hasEditPermission()) {
      toast.error('You don\'t have permission to remove options');
      return;
    }

    const question = questions.find(q => q.id === questionId);
    if (question && question.options && question.options.length <= 2) {
      toast.error('Multiple choice questions must have at least 2 options');
      return;
    }

    const updatedQuestions = questions.map(q => {
      if (q.id === questionId) {
        const newOptions = [...(q.options || [])];
        newOptions.splice(optionIndex, 1);
        return { ...q, options: newOptions };
      }
      return q;
    });
    setQuestions(updatedQuestions);
  };

  const handleEditQuestion = (question) => {
    // Check if user has permission
    if (!hasEditPermission()) {
      toast.error('You don\'t have permission to edit questions');
      return;
    }

    setCurrentEditingQuestion(question);
    setNewQuestion(question.text);
    setQuestionType(question.type);
  };

  const handleUpdateQuestion = () => {
    // Check if user has permission
    if (!hasEditPermission()) {
      toast.error('You don\'t have permission to update questions');
      return;
    }

    if (currentEditingQuestion && newQuestion.trim()) {
      const updatedQuestions = questions.map(q => {
        if (q.id === currentEditingQuestion.id) {
          return {
            ...q,
            text: newQuestion,
            type: questionType.toUpperCase()
          };
        }
        return q;
      });
      setQuestions(updatedQuestions);
      setNewQuestion('');
      setQuestionType('TEXT');
      setCurrentEditingQuestion(null);
    }
  };

  const handleRemoveQuestion = (questionId) => {
    // Check if user has permission
    if (!hasEditPermission()) {
      toast.error('You don\'t have permission to remove questions');
      return;
    }

    const updatedQuestions = questions.filter(q => q.id !== questionId);
    setQuestions(updatedQuestions);
    if (currentEditingQuestion?.id === questionId) {
      setCurrentEditingQuestion(null);
      setNewQuestion('');
      setQuestionType('TEXT');
    }
  };

  const handleSaveForm = async () => {
    // Check if user has permission
    if (!hasEditPermission()) {
      toast.error('You don\'t have permission to create or edit forms');
      return;
    }

    if (formTitle.trim() === '') {
      toast.error('Please enter a form title');
      return;
    }

    if (formStatus.trim === '') {
      toast.error('Please select Status')
      return;
    }

    if (questions.length === 0) {
      toast.error('Please add at least one question');
      return;
    }


    const invalidQuestion = questions.find(q => {
      const questionType = q.type.toUpperCase();
      return (questionType === 'MULTIPLE_CHOICE' || questionType === 'CHECKBOX') &&
        (!q.options || q.options.length < 2);
    });

    if (invalidQuestion) {
      toast.error(`Question "${invalidQuestion.text}" needs at least 2 options. Please add more options before saving.`);
      setCurrentEditingQuestion(invalidQuestion);
      setNewQuestion(invalidQuestion.text);
      setQuestionType(invalidQuestion.type);
      return;
    }

    try {
      const formData = {
        title: formTitle,
        description: formDescription,
        status: formStatus,
        questions: questions.map(q => {
          const questionType = q.type.toUpperCase();
          return {
            question: q.text,
            ansType: questionType,
            options: ['MULTIPLE_CHOICE', 'CHECKBOX'].includes(questionType) ? q.options : undefined
          };
        })
      };

      if (selectedQuestionnaire) {
        await updateQuestionnaire(selectedQuestionnaire._id, formData);
        toast.success('Form updated successfully!');
      } else {
        await createQuestionnaire(formData);
        toast.success('Form created successfully!');
      }

      fetchQuestionnaires();
      setIsCreateFormOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error saving form:', error);
      toast.error(`Failed to save form: ${error.response?.data?.message}`);
    }
  };

  const handleSaveAndAssign = () => {
    // Check if user has permission
    if (!hasEditPermission()) {
      toast.error('You don\'t have permission to create or assign forms');
      return;
    }

    if (formTitle.trim() === '' || !selectedMainTask || !selectedSubtask) {
      toast.error('Please fill all required fields');
      return;
    }

    handleSaveForm();
    toast.success(`Form assigned to ${selectedMainTask} > ${selectedSubtask}`);
  };

  const resetForm = () => {
    setFormTitle('');
    setFormDescription('');
    setFormStatus('ACTIVE')
    setQuestions([]);
    setQuestionType('TEXT');
    setNewQuestion('');
    setCurrentStep(1);
    setSelectedMainTask('');
    setSelectedSubtask('');
    setCurrentEditingQuestion(null);
    setSelectedQuestionnaire(null);
  };

  const nextStep = () => {
    // Check if user has permission
    if (!hasEditPermission()) {
      toast.error('You don\'t have permission to proceed');
      return;
    }

    if (currentStep === 1 && formTitle.trim() === '') {
      toast.error('Please enter a form title');
      return;
    }
    if (currentStep === 1 && formStatus.trim() === '') {
      toast.error('Please Select Status');
      return;
    }
    setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };
  const handleViewLoan = async (loan) => {
    setSelectedLoan(loan);
    setIsViewLoanOpen(true);
  };

  console.log(questionnaires);
  return (
    <div>
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2 items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Questionnaires & Forms</h1>
          {hasEditPermission() && (
            <Button onClick={() => setIsCreateFormOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Create Form
            </Button>
          )}
        </div>

        <Tabs defaultValue="questionnaires">
          <TabsList >
            <TabsTrigger value="questionnaires">Questionnaires</TabsTrigger>
            <TabsTrigger value="eduloans">Education Loan Forms</TabsTrigger>
          </TabsList>

          <TabsContent value="questionnaires" className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  onChange={(e) => setQuestionnairesFilter(prevFilters => ({ ...prevFilters, status: '', page: 1, search: e.target.value }))}
                  placeholder="Search questionnaires..."
                  className="pl-8 w-full"
                />
              </div>

              <div>
                <Select
                  defaultValue="ACTIVE"
                  value={questionnairsFilter.status}
                  onValueChange={(e) => setQuestionnairesFilter(prevFilters => ({ ...prevFilters, page: 1, status: e }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select by Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="ARCHIVED">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>All Questionnaires</CardTitle>
                <CardDescription>
                  Manage student questionnaires and view responses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Questions</TableHead>
                      {/* <TableHead>Responses</TableHead> */}
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {questionnaires.length === 0 ? (
                      <TableRow>                        <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                        No questionnaires found. Click &quot;Create Form&quot; to add one.
                      </TableCell>
                      </TableRow>
                    ) : questionnaires.map((form) => (
                      <TableRow key={form._id}>
                        <TableCell className="font-medium">{form.title || ''}</TableCell>
                        <TableCell>{form.description || ''}</TableCell>
                        <TableCell>{Array.isArray(form.questions) ? form.questions.length : 0}</TableCell>
                        {/* <TableCell>{form.responses || 0}</TableCell> */}
                        <TableCell>{statusBadge(form.status || 'draft')}</TableCell>
                        <TableCell>{form.createdAt ? new Date(form.createdAt).toLocaleDateString() : ''}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            {hasEditPermission() && (
                              <>
                                <Button variant="ghost" size="icon" onClick={async () => {
                                  // Check if user has permission
                                  if (!hasEditPermission()) {
                                    toast.error('You don\'t have permission to edit forms');
                                    return;
                                  }

                                  try {
                                    const response = await getQuestionnaireById(form._id);
                                    setSelectedQuestionnaire(response.data);
                                    setFormTitle(response.data.title);
                                    setFormDescription(response.data.description);
                                    setFormStatus(response.data.status)
                                    setQuestions(response.data.questions.map(q => ({
                                      id: q._id,
                                      text: q.question,
                                      type: q.ansType,
                                      required: true,
                                      options: q.options || []
                                    })));
                                    setIsCreateFormOpen(true);
                                  } catch (error) {
                                    toast.error(`Failed to load questionnaire: ${error.response?.data?.message}`);
                                  }
                                }}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="text-destructive" onClick={async () => {
                                  // Check if user has permission
                                  if (!hasEditPermission()) {
                                    toast.error('You don\'t have permission to delete forms');
                                    return;
                                  }

                                  try {
                                    await deleteQuestionnaire(form._id);
                                    toast.success('Form deleted successfully');
                                    fetchQuestionnaires();
                                  } catch (error) {
                                    toast.error(`Failed to delete form: ${error.response?.data?.message}`);
                                  }
                                }}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {questionnairesPagination && (
                  <div className="flex justify-center my-6 gap-2">
                    <Button
                      variant="outline"
                      disabled={!questionnairesPagination.hasPreviousPage}
                      onClick={() => setQuestionnairesFilter(prevFilters => ({
                        ...prevFilters,
                        page: questionnairesPagination.currentPage - 1
                      }))}
                    >
                      Previous
                    </Button>
                    <span className="px-4 py-2">
                      Page {questionnairesPagination.currentPage} of {questionnairesPagination.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      disabled={!questionnairesPagination.hasNextPage}
                      onClick={() => setQuestionnairesFilter(prevFilters => ({ ...prevFilters, page: questionnairesPagination.currentPage + 1 }))}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="eduloans" className="space-y-4" onSelect={() => fetchLoans()}>
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search by university name..."
                  className="pl-8 w-full"
                  value={loanFilters.search}
                  onChange={(e) => {
                    setLoanFilters(prev => ({ ...prev, search: e.target.value }));
                    if (!e.target.value) fetchLoans();
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && fetchLoans()}
                />
              </div>
              <Select
                value={loanFilters.status}
                onValueChange={(value) => {
                  setLoanFilters(prev => ({ ...prev, status: value, page: 1 }));
                  fetchLoans();
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>                <SelectContent>
                  <SelectItem value="ALL">All Status</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Education Loan Forms</CardTitle>
                <CardDescription>
                  Manage education loan applications and their status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student Name</TableHead>
                      <TableHead>Universities Applied</TableHead>
                      <TableHead>Loan Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Admission Term</TableHead>
                      <TableHead>Applied Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoadingLoans ? (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                          <div className="flex items-center justify-center">
                            <Loader2 className="h-6 w-6 animate-spin" />
                            <span className="ml-2">Loading loans...</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : loans.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                          No loan applications found.
                        </TableCell>
                      </TableRow>
                    ) : (loans.map((loan) => (
                      <TableRow key={loan._id}>
                        <TableCell className="font-medium">{loan.appliedBy?.name || loan.name || 'N/A'}</TableCell>
                        <TableCell>{loan.coBorrower?.universitiesReceivedAdmitFrom?.join(', ') || 'N/A'}</TableCell>
                        <TableCell>{loan.amount ? `$${loan.amount.toLocaleString()}` : 'N/A'}</TableCell>
                        <TableCell>{statusBadge(loan.status?.toLowerCase())}</TableCell>
                        <TableCell>{loan.admissionTerm || 'N/A'}</TableCell>
                        <TableCell>{new Date(loan.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" onClick={() => handleViewLoan(loan)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                    )}
                  </TableBody>
                </Table>


                {loans.length > 0 && (
                  <div className="flex items-center justify-between py-4">
                    <div className="text-sm text-muted-foreground">
                      Showing page {loanPagination.currentPage} of {loanPagination.totalPages}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setLoanFilters(prev => ({ ...prev, page: prev.page - 1 }));
                          fetchLoans();
                        }}
                        disabled={loanPagination.currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setLoanFilters(prev => ({ ...prev, page: prev.page + 1 }));
                          fetchLoans();
                        }}
                        disabled={loanPagination.currentPage === loanPagination.totalPages}
                      >
                        Next
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}


                <Dialog open={isViewLoanOpen} onOpenChange={setIsViewLoanOpen}>
                  <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Loan Application Details</DialogTitle>
                      <DialogDescription>
                        View detailed information about this loan application
                      </DialogDescription>
                    </DialogHeader>

                    {selectedLoan && (
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Student Name</Label>
                            <p className="text-sm mt-1">{selectedLoan.appliedBy?.name || selectedLoan.name}</p>
                          </div>
                          <div>
                            <Label>Status</Label>
                            <div className="mt-1">{statusBadge(selectedLoan.status?.toLowerCase())}</div>
                          </div>
                          <div>
                            <Label>Email</Label>
                            <p className="text-sm mt-1">{selectedLoan.email}</p>
                          </div>
                          <div>
                            <Label>Phone Number</Label>
                            <p className="text-sm mt-1">{selectedLoan.phoneNumber}</p>
                          </div>
                          <div>
                            <Label>Admission Term</Label>
                            <p className="text-sm mt-1">{selectedLoan.admissionTerm}</p>
                          </div>
                          <div>
                            <Label>Admission Status</Label>
                            <p className="text-sm mt-1">{selectedLoan.admissionStatus}</p>
                          </div>
                        </div>

                        <div className="border-t pt-4 mt-2">
                          <h4 className="font-medium mb-2">Co-Borrower Details</h4>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Co-Borrower Name</Label>
                              <p className="text-sm mt-1">{selectedLoan.coBorrower?.name}</p>
                            </div>
                            <div className="col-span-2">
                              <Label>Universities Applied</Label>
                              <div className="mt-2 space-y-1">
                                {selectedLoan.coBorrower?.universitiesReceivedAdmitFrom?.map((uni, index) => (
                                  <Badge key={index} variant="secondary" className="mr-2">
                                    {uni}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="border-t pt-4 mt-2">
                          <h4 className="font-medium mb-2">Address Information</h4>
                          <div>
                            <Label>Address</Label>
                            <p className="text-sm mt-1">{selectedLoan.address}</p>
                          </div>
                          <div className="mt-2">
                            <Label>PIN Code</Label>
                            <p className="text-sm mt-1">{selectedLoan.pinCode}</p>
                          </div>
                        </div>

                        <div className="border-t pt-4 mt-2">
                          <h4 className="font-medium mb-2">Application Timeline</h4>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Applied Date</Label>
                              <p className="text-sm mt-1">{new Date(selectedLoan.appliedDate).toLocaleDateString()}</p>
                            </div>
                            <div>
                              <Label>Last Updated</Label>
                              <p className="text-sm mt-1">{new Date(selectedLoan.updatedAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsViewLoanOpen(false)}>
                        Close
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={isCreateFormOpen} onOpenChange={(open) => {
        if (!open) resetForm();
        setIsCreateFormOpen(open);
      }}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-none">
            <DialogTitle>Create New Form</DialogTitle>
            <DialogDescription>
              {currentStep === 1 && 'Set up basic form information'}
              {currentStep === 2 && 'Add questions to your form'}
              {currentStep === 3 && 'Assign form to a task (optional)'}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-6">
            {currentStep === 1 && (
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="formTitle">Form Title *</Label>
                  <Input
                    id="formTitle"
                    placeholder="Enter form title"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    disabled={!hasEditPermission()}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="formDescription">Description</Label>
                  <Textarea
                    id="formDescription"
                    placeholder="Enter a description for this form"
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    disabled={!hasEditPermission()}
                  />
                </div>

                <div>
                  <Label htmlFor="Status" className="mb-2">Status</Label>
                  <Select
                    defaultValue="ACTIVE"
                    value={formStatus}
                    onValueChange={(e) => setFormStatus(e)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="DRAFT">Draft</SelectItem>
                      <SelectItem value="ARCHIVED">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="grid gap-4 py-4">
                <div className="border rounded-md p-4">
                  <h3 className="font-medium mb-2">Form Questions</h3>

                  <div className="space-y-4 mb-4">
                    {questions.map((q, index) => (
                      <div key={q.id} className="border rounded-md p-3 bg-muted/20">
                        <div className="flex items-start justify-between">
                          <div className="w-full">
                            <p className="font-medium">{index + 1}. {q.text}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="secondary">{q.type}</Badge>
                              {(q.type.toUpperCase() === 'MULTIPLE_CHOICE' || q.type.toUpperCase() === 'CHECKBOX') && (
                                <Badge variant="outline" className="text-xs">
                                  {q.options?.length || 0} options
                                </Badge>
                              )}
                            </div>

                            {(q.type.toUpperCase() === 'MULTIPLE_CHOICE' || q.type.toUpperCase() === 'CHECKBOX') && q.options && (
                              <div className="mt-2">
                                <p className="text-xs font-medium mb-2">Options:</p>
                                <div className="space-y-2">
                                  {q.options.map((option, i) => (
                                    <div key={i} className="flex items-center gap-2 bg-background rounded p-2">
                                      <div className="w-6 h-6 flex items-center justify-center border rounded bg-muted">
                                        {i + 1}
                                      </div>
                                      <span className="flex-1">{option}</span>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 text-destructive hover:text-destructive/90"
                                        onClick={() => handleRemoveOption(q.id, i)}
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            <div className="mt-3 pl-4 border-l-2 border-muted">
                              {q.type.toUpperCase() === 'TEXT' && (
                                <Input disabled placeholder="Short answer text" className="max-w-sm" />
                              )}
                              {q.type.toUpperCase() === 'PARAGRAPH' && (
                                <Textarea disabled placeholder="Long answer text" className="max-w-sm" />
                              )}
                              {q.type.toUpperCase() === 'DATE' && (
                                <Input disabled type="date" className="max-w-sm" />
                              )}
                              {q.type.toUpperCase() === 'FILE' && (
                                <div className="max-w-sm p-4 border-2 border-dashed rounded-md text-center text-sm text-muted-foreground">
                                  File upload area
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditQuestion(q)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-destructive"
                              onClick={() => handleRemoveQuestion(q.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>

                        {currentEditingQuestion?.id === q.id && (
                          <div className="mt-3 border-t pt-3">
                            <div className="grid gap-2 mb-2">
                              <Input
                                placeholder="Edit question text"
                                value={newQuestion}
                                onChange={(e) => setNewQuestion(e.target.value)}
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-2 mb-2">
                              <Select
                                value={questionType}
                                onValueChange={(value) => {
                                  setQuestionType(value);
                                  if (value === 'MULTIPLE_CHOICE' || value === 'CHECKBOX') {
                                    toast.info('Remember to add at least 2 options');
                                  }
                                }}
                                disabled={!hasEditPermission()}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Question type" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="TEXT">Text</SelectItem>
                                  <SelectItem value="PARAGRAPH">Paragraph</SelectItem>
                                  <SelectItem value="MULTIPLE_CHOICE">Multiple Choice</SelectItem>
                                  <SelectItem value="CHECKBOX">Checkbox</SelectItem>
                                  <SelectItem value="DATE">Date</SelectItem>
                                  <SelectItem value="FILE">File Upload</SelectItem>
                                </SelectContent>
                              </Select>

                              {/* <Button onClick={handleUpdateQuestion}>Update Question</Button> */}
                              {/* <Button onClick={handleUpdateQuestion} disabled={!newQuestion.trim() || !hasEditPermission()}>
                                Update Question
                              </Button> */}
                            </div>
                            {(questionType === 'MULTIPLE_CHOICE' || questionType === 'CHECKBOX') && (
                              <div className="mt-4 p-4 border rounded-md bg-muted/50">
                                <div className="flex items-center justify-between mb-3">
                                  <p className="text-sm font-medium">Question Options</p>
                                  {(q.options?.length || 0) < 2 && (
                                    <Badge variant="destructive" className="text-xs">
                                      Add at least {2 - (q.options?.length || 0)} more option(s)
                                    </Badge>
                                  )}
                                </div>
                                <div className="space-y-3">

                                  {q.options?.map((option, i) => (
                                    <div key={i} className="flex items-center gap-2 bg-background rounded p-2">
                                      <div className="w-6 h-6 flex items-center justify-center border rounded bg-muted">
                                        {i + 1}
                                      </div>
                                      <span className="flex-1">{option}</span>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 text-destructive hover:text-destructive/90"
                                        onClick={() => handleRemoveOption(q.id, i)}
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  ))}


                                  <div className="flex gap-2 mt-2">
                                    <Input
                                      placeholder="Type new option and press Enter"
                                      value={optionText}
                                      onChange={(e) => setOptionText(e.target.value)}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter' && optionText.trim()) {
                                          handleAddOption(q.id);
                                        }
                                      }}
                                      className="flex-1"
                                      disabled={!hasEditPermission()}
                                    />
                                    <Button
                                      variant="secondary"
                                      onClick={() => handleAddOption(q.id)}
                                      disabled={!hasEditPermission() || !optionText.trim()}
                                    >
                                      Add
                                    </Button>
                                  </div>

                                  <p className="text-xs text-muted-foreground mt-2">
                                    Press Enter or click Add to insert each option
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="text-sm font-medium mb-2">
                      {currentEditingQuestion ? 'Edit Question' : 'Add New Question'}
                    </h4>
                    <div className="grid gap-2 mb-2">
                      <Input
                        placeholder="Enter question text"
                        value={newQuestion}
                        onChange={(e) => setNewQuestion(e.target.value)}
                        disabled={!!currentEditingQuestion || !hasEditPermission()}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <Select value={questionType} onValueChange={setQuestionType}
                        disabled={!!currentEditingQuestion || !hasEditPermission()}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Question type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="TEXT">Text</SelectItem>
                          <SelectItem value="PARAGRAPH">Paragraph</SelectItem>
                          <SelectItem value="MULTIPLE_CHOICE">Multiple Choice</SelectItem>
                          <SelectItem value="CHECKBOX">Checkbox</SelectItem>
                          <SelectItem value="DATE">Date</SelectItem>
                          <SelectItem value="FILE">File Upload</SelectItem>
                        </SelectContent>
                      </Select>
                      {/* 
                      <Button
                        onClick={handleAddQuestion}
                        disabled={!hasEditPermission()}
                      >
                        Add Question
                      </Button> */}
                      {currentEditingQuestion ? (
                        <Button
                          onClick={handleUpdateQuestion}
                          disabled={!newQuestion.trim() || !hasEditPermission()}
                        >
                          Update Question
                        </Button>
                      ) : (
                        <Button
                          onClick={handleAddQuestion}
                          disabled={!newQuestion.trim() || !hasEditPermission()}
                        >
                          Add Question
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Assign to Task (Optional)</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    You can assign this form to a specific task or save it for later assignment.
                  </p>

                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div>
                      <Label htmlFor="mainTask" className="text-xs mb-1 block">Main Task</Label>
                      <Select value={selectedMainTask} onValueChange={setSelectedMainTask} disabled={!hasEditPermission()}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select main task" />
                        </SelectTrigger>
                        <SelectContent>
                          {mainTaskCategories.map((task) => (
                            <SelectItem key={task} value={task}>
                              {task}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="subtask" className="text-xs mb-1 block">Subtask</Label>
                      <Select
                        value={selectedSubtask}
                        onValueChange={setSelectedSubtask}
                        disabled={!hasEditPermission() || !selectedMainTask}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select subtask" />
                        </SelectTrigger>
                        <SelectContent>
                          {selectedMainTask && subtaskTemplates[selectedMainTask]?.map((subtask) => (
                            <SelectItem key={subtask} value={subtask}>
                              {subtask}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="flex-none mt-4 border-t pt-4">
            <div className="flex justify-between w-full">
              <div>
                {currentStep > 1 && (
                  <Button variant="outline" onClick={prevStep}>
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                )}
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsCreateFormOpen(false)}>
                  Cancel
                </Button>

                {currentStep < 2 ? (
                  <Button
                    onClick={nextStep}
                    disabled={!hasEditPermission()}
                  >
                    Next
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="default"
                      onClick={handleSaveForm}
                      disabled={!hasEditPermission()}
                    >
                      <Save className="mr-2 h-4 w-4" />
                      Save Form
                    </Button>
                    {selectedMainTask && selectedSubtask && (
                      <Button
                        onClick={handleSaveAndAssign}
                        disabled={!hasEditPermission()}
                      >
                        Save & Assign
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Forms;
import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { getQuestionnaireQuestions, submitQuestionnaireResponses } from '@/services/questionnaireService';
import { uploadFile } from '@/services/uploadService';
import { toast } from 'sonner';
import { SidebarProvider, SidebarInset } from '../../components/ui/sidebar';
import AppSidebar from '../../components/AppSidebar';
import SidebarHeader from '../../components/SidebarHeader';

const Questionnaire = () => {
    const { taskId, subtaskId, questionnaireId } = useParams();
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [questions, setQuestions] = useState([]);
    const [responses, setResponses] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [uploadingFiles, setUploadingFiles] = useState({});
    const [openQuestions, setOpenQuestions] = useState({});
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    const fetchQuestions = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await getQuestionnaireQuestions(taskId, subtaskId, questionnaireId);

            if (response.success && response.data?.questionnaire) {
                const questionsList = response.data.questionnaire.questions || [];
                setTitle(response.data.questionnaire.title || '');
                setDescription(response.data.questionnaire.description || '');
                const formattedQuestions = questionsList.map(q => ({
                    _id: q._id,
                    text: q.question,
                    type: q.ansType.toUpperCase(),
                    ansType: q.ansType,
                    options: q.options || [],
                    response: q.answer,
                    status: q.status
                }));

                setQuestions(formattedQuestions);

                const initialResponses = {};
                formattedQuestions.forEach(question => {
                    if (question?.response) {
                        initialResponses[question._id] = question.response;
                    }
                });
                setResponses(initialResponses);
            } else {
                toast.error(response.message || 'Failed to load questions');
            }
        } catch (error) {
            console.error('Error fetching questions:', error);
            toast.error('Failed to load questions');
        } finally {
            setIsLoading(false);
        }
    }, [taskId, subtaskId, questionnaireId]);

    useEffect(() => {
        fetchQuestions();
    }, [fetchQuestions]);

    const toggleQuestion = (questionId) => {
        setOpenQuestions(prev => ({
            ...prev,
            [questionId]: !prev[questionId]
        }));
    };

    const handleResponseChange = (questionId, answer) => {
        setResponses(prev => ({
            ...prev,
            [questionId]: answer
        }));
    }; const handleSubmit = async () => {
        try {
            setIsSaving(true);
            const formattedResponses = Object.entries(responses).map(([questionId, answer]) => {
                const question = questions.find(q => q._id === questionId);
                let formattedAnswer; switch (question.ansType?.toUpperCase()) {
                    case 'TEXT':
                    case 'PARAGRAPH':

                        formattedAnswer = String(answer || '');
                        break;                          
                        case 'DATE':
                        if (answer && /^\d{4}-\d{2}-\d{2}$/.test(answer)) {
                            const [year, month, day] = answer.split('-');
                            if (year >= 1900 && year <= 2100 && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
                                formattedAnswer = answer;
                            } else {
                                throw new Error('Please enter a valid date');
                            }
                        } else {
                            throw new Error('Please select a date');
                        }
                        break;
                    case 'FILE':

                        formattedAnswer = String(answer || '');
                        break;
                    case 'MULTIPLE_CHOICE':

                        formattedAnswer = answer ? [String(answer)] : [];
                        break;
                    case 'CHECKBOX':

                        formattedAnswer = Array.isArray(answer) ? answer.map(String) : [];
                        break;
                    default:

                        formattedAnswer = '';
                }

                return {
                    questionId,
                    answer: formattedAnswer
                };
            });

            const response = await submitQuestionnaireResponses({
                taskId,
                subtaskId,
                questionnaireId,
                responses: formattedResponses
            });

            if (response.success) {
                toast.success('Responses saved successfully');
                navigate(-1);
            } else {
                throw new Error(response.message || 'Failed to save responses');
            }
        } catch (error) {
            console.error('Error submitting responses:', error);
            toast.error(error.message || 'Failed to save responses');
        } finally {
            setIsSaving(false);
        }
    };

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="py-10 text-center">
                    <div className="space-y-4">
                        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mx-auto"></div>
                        <div className="h-4 w-64 bg-gray-200 rounded animate-pulse mx-auto"></div>
                        <div className="space-y-3 mt-8">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="bg-white rounded-lg p-4 mx-auto max-w-2xl">
                                    <div className="flex items-center space-x-4">
                                        <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                                        <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            );
        }

        if (questions.length === 0) {
            return (
                <div className="py-10 text-center">
                    <div className="bg-white rounded-lg p-8 max-w-lg mx-auto">
                        <p className="text-gray-600 mb-6">No questions available for this questionnaire.</p>
                        <button
                            onClick={() => navigate(-1)}
                            className="px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-150"
                        >
                            Return to Checklist
                        </button>
                    </div>
                </div>
            );
        }

        return (
            <div className="space-y-2">
                {questions.map((question, index) => (
                    question && (
                        <div key={question._id} className="bg-white rounded-lg shadow-sm mb-4">
                            <div
                                className="p-4 flex items-center cursor-pointer hover:bg-gray-50 transition-colors duration-150"
                                onClick={() => toggleQuestion(question._id)}
                            >
                                <div className="flex-shrink-0 mr-3">
                                    <div
                                        className="w-8 h-8 bg-primary text-white rounded-md flex items-center justify-center text-sm font-medium">
                                        {index + 1}
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-gray-800 font-medium text-base">{question.text}</h3>
                                </div>
                                <div className="flex-shrink-0 ml-2">
                                    {openQuestions[question._id] ? (
                                        <ChevronUp className="h-5 w-5 text-gray-600" />
                                    ) : (
                                        <ChevronDown className="h-5 w-5 text-gray-600" />
                                    )}
                                </div>
                            </div>
                            {openQuestions[question._id] && (

                                <div className="px-6 pb-6 pt-3 ml-11 border-t border-gray-100 bg-gray-50/50">
                                    {(question.type === 'TEXT' || question.type === 'PARAGRAPH') && (

                                        <textarea
                                            value={responses[question._id] || ''}
                                            onChange={(e) => handleResponseChange(question._id, e.target.value)}
                                            className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
                                            rows={question.type === 'PARAGRAPH' ? 6 : 2}
                                            placeholder="Enter your answer here..."
                                        />
                                    )}                                    {question.type === 'DATE' && (
                                        <div className="space-y-2">
                                            <input
                                                type="date"
                                                value={responses[question._id] || ''}
                                                max={new Date().toISOString().split('T')[0]}
                                                onChange={(e) => {
                                                    const selectedDate = e.target.value;
                                                    if (selectedDate) {
                                                        // Validate and format the date strictly
                                                        const [year, month, day] = selectedDate.split('-');
                                                        if (year && month && day) {
                                                            handleResponseChange(question._id, `${year}-${month}-${day}`);
                                                        }
                                                    } else {
                                                        handleResponseChange(question._id, ''); // Empty string instead of null
                                                    }
                                                }}
                                                className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
                                                required
                                            />
                                            {responses[question._id] && (
                                                <div className="text-sm text-gray-600">
                                                    Selected: {new Date(responses[question._id]).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    {question.type === 'FILE' && (
                                        <div className="relative w-full">
                                            <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg bg-white hover:border-primary transition-colors duration-150">
                                                {responses[question._id] ? (
                                                    <div className="space-y-2">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                </svg>
                                                                <span>File uploaded successfully</span>
                                                            </div>
                                                            <button
                                                                onClick={() => handleResponseChange(question._id, null)}
                                                                className="text-red-500 hover:text-red-600 text-sm"
                                                            >
                                                                Remove
                                                            </button>
                                                        </div>
                                                        <a
                                                            href={responses[question._id]}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-primary hover:text-primary-2 text-sm underline"
                                                        >
                                                            View uploaded file
                                                        </a>
                                                    </div>
                                                ) : uploadingFiles[question._id] ? (
                                                    <div className="flex flex-col items-center justify-center py-4">
                                                        <div className="w-8 h-8 border-4 border-t-transparent border-primary rounded-full animate-spin mb-2"></div>
                                                        <p className="text-sm text-gray-600">Uploading file...</p>
                                                    </div>
                                                ) : (
                                                    <div>
                                                        <label className="flex flex-col items-center gap-2 cursor-pointer">
                                                            <input
                                                                type="file"
                                                                className="hidden"
                                                                accept=".pdf,.doc,.docx"
                                                                onChange={async (e) => {
                                                                    const file = e.target.files[0];
                                                                    if (!file) return;

                                                                    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
                                                                    if (file.size > MAX_SIZE) {
                                                                        toast.error('File size should be less than 10MB');
                                                                        return;
                                                                    }

                                                                    const validFileTypes = [
                                                                        'application/pdf',
                                                                        'application/msword',
                                                                        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                                                                    ];
                                                                    if (!validFileTypes.includes(file.type)) {
                                                                        toast.error('Please upload a valid document (PDF or Word)');
                                                                        return;
                                                                    }

                                                                    try {
                                                                        // Set uploading state for this question
                                                                        setUploadingFiles(prev => ({
                                                                            ...prev,
                                                                            [question._id]: true
                                                                        }));
                                                                        
                                                                        const formData = new FormData();
                                                                        formData.append('file', file);
                                                                        formData.append('category', 'resume');

                                                                        const response = await uploadFile(formData);
                                                                        if (response.success) {
                                                                            handleResponseChange(question._id, response.data.url);
                                                                            toast.success('File uploaded successfully');
                                                                        } else {
                                                                            throw new Error(response.message || 'Upload failed');
                                                                        }
                                                                    } catch (error) {
                                                                        console.error('Error uploading file:', error);
                                                                        toast.error(error.message || 'Failed to upload file');
                                                                    } finally {
                                                                        // Clear uploading state
                                                                        setUploadingFiles(prev => ({
                                                                            ...prev,
                                                                            [question._id]: false
                                                                        }));
                                                                    }
                                                                }}
                                                            />
                                                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                                            </svg>
                                                            <div className="text-center">
                                                                <p className="text-sm font-medium text-gray-700">Click to upload or drag and drop</p>
                                                                <p className="text-xs text-gray-500">PDF or Word documents (max 10MB)</p>
                                                            </div>
                                                        </label>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                    {question.type === 'MULTIPLE_CHOICE' && question.options && (
                                        <div className="space-y-3">
                                            {question.options.map((option) => (
                                                <label key={option} className="flex items-center space-x-3 p-3 hover:bg-white rounded-lg cursor-pointer transition-colors duration-150 bg-white">
                                                    <input
                                                        type="radio"
                                                        name={question._id}
                                                        value={option}
                                                        checked={responses[question._id]?.[0] === option}
                                                        onChange={(e) => handleResponseChange(question._id, [e.target.value])}
                                                        className="text-primary focus:ring-primary h-4 w-4"
                                                    />
                                                    <span className="text-gray-700 text-sm">{option}</span>
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                    {(question.type === 'CHECKBOX' || question.type === 'MULTIPLE_CHOICE_MULTIPLE') && question.options && (
                                        <div className="space-y-3">
                                            {question.options.map((option) => (
                                                <label key={option} className="flex items-center space-x-3 p-3 hover:bg-white rounded-lg cursor-pointer transition-colors duration-150 bg-white">
                                                    <input
                                                        type="checkbox"
                                                        value={option}
                                                        checked={(responses[question._id] || []).includes(option)}
                                                        onChange={(e) => {
                                                            const currentResponses = responses[question._id] || [];
                                                            const newResponses = e.target.checked
                                                                ? [...currentResponses, option]
                                                                : currentResponses.filter(r => r !== option);
                                                            handleResponseChange(question._id, newResponses);
                                                        }}
                                                        className="text-primary focus:ring-primary"
                                                    />
                                                    <span className="text-gray-700">{option}</span>
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )
                ))}        <div className="flex justify-end gap-4 pt-6">
                    <button
                        onClick={() => navigate(-1)}
                        className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-150"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSaving || Object.values(uploadingFiles).some(Boolean)}
                        className="px-6 py-2.5 cursor-pointer bg-primary text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
                    >
                        {isSaving ? 'Saving...' : Object.values(uploadingFiles).some(Boolean) ? 'File Upload in Progress...' : 'Submit Answers'}
                    </button>
                </div>
            </div>
        );
    };

    return (
        <SidebarProvider>
            <div className="flex min-h-screen w-full bg-gray-50">
                <AppSidebar isSidebarOpen={isSidebarOpen} />

                <SidebarInset>
                    <SidebarHeader isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

                    <main className="flex-1 w-full overflow-x-hidden overflow-y-auto bg-gray-50 p-4 pt-8 md:p-6 md:pt-10">
                        <div className="w-full mx-auto">
                            <div className="p-6">                <button
                                onClick={() => navigate(-1)}
                                className="mb-6 text-primary hover:text-primary-2 flex items-center gap-2 transition-colors duration-150"
                            >
                                <span>←</span> Back to Checklist
                            </button>

                                <h1 className="text-2xl font-bold text-primary mb-2">{title}</h1>
                                {description && (
                                    <p className="text-gray-600 mb-6">{description}</p>
                                )}

                                {renderContent()}
                            </div>
                        </div>
                    </main>
                </SidebarInset>
            </div>
        </SidebarProvider>
    );
};

export default Questionnaire;

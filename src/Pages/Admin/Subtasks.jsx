import { useState, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Search, Filter, Plus, Edit, Trash2, ChevronLeft, ChevronRight, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import {
    createSubtask,
    updateSubtask,
    deleteSubtask,
    getSubtasks,
} from '@/services/subtaskService';
import { uploadFile } from '@/services/uploadService';
import { getQuestionnaires } from '@/services/questionnaireService';
import { Checkbox } from '@/components/ui/checkbox';
import { getUser } from '@/lib/auth';

const Subtasks = () => {
    const [subtasks, setSubtasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [isCreateSubtaskOpen, setIsCreateSubtaskOpen] = useState(false);
    const [isEditSubtaskOpen, setIsEditSubtaskOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSubtask, setSelectedSubtask] = useState(null);
    const [questionnairesPagination, setQuestionnairesPagination] = useState({});
    const [questionnaireCurrentPage, setQuestionnaireCurrentPage] = useState(1);

    // Permission check functions
    const hasEditPermission = () => {
        const currentUser = getUser();
        return currentUser && (currentUser.role === 'ADMIN' || currentUser.role === 'EDITOR');
    };

    const [newSubtask, setNewSubtask] = useState({
        title: '',
        description: '',
        logo: '',           // uploaded URL (after save)
        logoUrl: '',        // existing URL (edit mode only)
        logoFile: null,     // new file selected
        logoPreview: undefined, // data URL for instant preview
        priority: 'MEDIUM',
        questionnaireIds: []
    });
    const [availableQuestionnaires, setAvailableQuestionnaires] = useState([]);
    const [fileUploading, setFileUploading] = useState(false);

    const priorityBadge = (priority) => {
        switch (priority?.toUpperCase()) {
            case 'HIGH':
                return <Badge variant="destructive">High</Badge>;
            case 'MEDIUM':
                return <Badge variant="secondary">Medium</Badge>;
            case 'LOW':
                return <Badge>Low</Badge>;
            default:
                return null;
        }
    };

    useEffect(() => {
        const fetchSubtasks = async () => {
            try {
                setLoading(true);
                const response = await getSubtasks(page, limit);
                if (response.success) {
                    setSubtasks(Array.isArray(response.data.subtasks) ? response.data.subtasks : []);
                    setTotalPages(response.data.pagination.totalPages || 1);
                } else {
                    throw new Error(response.error || 'Failed to fetch subtasks');
                }
            } catch (err) {
                console.error('Error fetching subtasks:', err);
                setError(err.message || 'Failed to fetch subtasks');
                toast.error('Failed to fetch subtasks: ' + err.response?.data?.message);
                setSubtasks([]);
            } finally {
                setLoading(false);
            }
        };

        fetchSubtasks();
    }, [page, limit]);

    useEffect(() => {
        const fetchQuestionnaires = async () => {
            let questionnairsFilter = { page: questionnaireCurrentPage }
            try {
                const response = await getQuestionnaires({ questionnairsFilter });
                if (response.success) {
                    setAvailableQuestionnaires(response.data.questionnaires);
                    setQuestionnairesPagination(response.data.pagination)
                }
            } catch (err) {
                console.error('Error fetching questionnaires:', err);
                toast.error('Failed to fetch questionnaires: ' + err.response?.data?.message);
            }
        };

        fetchQuestionnaires();
    }, [questionnaireCurrentPage]);

    // Cleanup preview URL
    useEffect(() => {
        return () => {
            if (newSubtask.logoPreview) {
                URL.revokeObjectURL(newSubtask.logoPreview);
            }
        };
    }, [newSubtask.logoPreview]);

    const handleCreateSubtask = async () => {
        if (!newSubtask.title.trim()) {
            toast.error('Please enter a subtask title');
            return;
        }

        if (!hasEditPermission()) {
            toast.error('You don\'t have permission to create subtasks');
            return;
        }

        try {
            setLoading(true);
            let logoUrl = newSubtask.logo;

            // Upload new file if selected
            if (newSubtask.logoFile) {
                setFileUploading(true);
                const formData = new FormData();
                formData.append('file', newSubtask.logoFile);
                formData.append('category', 'profile-pic');
                const uploadRes = await uploadFile(formData);
                if (uploadRes.success) {
                    logoUrl = uploadRes.data.url;
                } else {
                    throw new Error(uploadRes.message || 'Failed to upload logo');
                }
                setFileUploading(false);
            }

            const createResponse = await createSubtask({
                title: newSubtask.title,
                description: newSubtask.description,
                logo: logoUrl,
                priority: newSubtask.priority.toUpperCase(),
                questionnaireIds: newSubtask.questionnaireIds
            });

            if (createResponse.success) {
                const response = await getSubtasks(page, limit);
                if (response.success) {
                    setSubtasks(Array.isArray(response.data.subtasks) ? response.data.subtasks : []);
                    setIsCreateSubtaskOpen(false);
                    resetSubtaskForm();
                    toast.success('Subtask created successfully!');
                }
            } else {
                throw new Error(createResponse.error || 'Failed to create subtask');
            }
        } catch (err) {
            console.error('Error creating subtask:', err);
            toast.error(err.response?.data?.message || 'Failed to create subtask');
        } finally {
            setLoading(false);
            setFileUploading(false);
        }
    };

    const handleEditSubtask = async () => {
        if (!selectedSubtask) return;

        if (!hasEditPermission()) {
            toast.error('You don\'t have permission to edit subtasks');
            return;
        }

        try {
            setLoading(true);
            let logoUrl = newSubtask.logo || newSubtask.logoUrl;

            // Upload new file if selected
            if (newSubtask.logoFile) {
                setFileUploading(true);
                const formData = new FormData();
                formData.append('file', newSubtask.logoFile);
                formData.append('category', 'profile-pic');
                const uploadRes = await uploadFile(formData);
                if (uploadRes.success) {
                    logoUrl = uploadRes.data.url;
                } else {
                    throw new Error(uploadRes.message || 'Failed to upload logo');
                }
                setFileUploading(false);
            }

            const updateResponse = await updateSubtask(selectedSubtask._id, {
                title: newSubtask.title,
                description: newSubtask.description,
                logo: logoUrl,
                priority: newSubtask.priority.toUpperCase(),
                questionnaireIds: newSubtask.questionnaireIds
            });

            if (updateResponse.success) {
                const response = await getSubtasks(page, limit);
                if (response.success) {
                    setSubtasks(Array.isArray(response.data.subtasks) ? response.data.subtasks : []);
                    setIsEditSubtaskOpen(false);
                    resetSubtaskForm();
                    toast.success('Subtask updated successfully!');
                }
            } else {
                throw new Error(updateResponse.error || 'Failed to update subtask');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update subtask');
        } finally {
            setLoading(false);
            setFileUploading(false);
            setSelectedSubtask(null);
        }
    };

    const resetSubtaskForm = () => {
        setNewSubtask({
            title: '',
            description: '',
            logo: '',
            logoUrl: '',
            logoFile: null,
            logoPreview: undefined,
            priority: 'MEDIUM',
            questionnaireIds: []
        });
    };

    const handleOpenEditSubtask = (subtask) => {
        if (!hasEditPermission()) {
            toast.error('You don\'t have permission to edit subtasks');
            return;
        }

        setSelectedSubtask(subtask);
        setNewSubtask({
            title: subtask.title,
            description: subtask.description,
            logo: subtask.logo || '',
            logoUrl: subtask.logo || '',
            logoFile: null,
            logoPreview: undefined,
            priority: subtask.priority,
            questionnaireIds: subtask.questionnaires?.map(q => q._id) || []
        });
        setIsEditSubtaskOpen(true);
    };

    const handleDeleteSubtask = async (subtaskId) => {
        if (!hasEditPermission()) {
            toast.error('You don\'t have permission to delete subtasks');
            return;
        }

        if (!confirm('Are you sure you want to delete this subtask?')) {
            return;
        }

        try {
            setLoading(true);
            const deleteResponse = await deleteSubtask(subtaskId);
            if (deleteResponse.success) {
                const response = await getSubtasks(page, limit);
                if (response.success) {
                    setSubtasks(Array.isArray(response.data.subtasks) ? response.data.subtasks : []);
                    toast.success('Subtask deleted successfully!');
                }
            } else {
                throw new Error(deleteResponse.error || 'Failed to delete subtask');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete subtask');
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = (e) => {
        if (!hasEditPermission()) {
            toast.error('You don\'t have permission to upload files');
            e.target.value = '';
            return;
        }

        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('Please upload a valid image');
            e.target.value = '';
            return;
        }

        // Instant preview
        const previewUrl = URL.createObjectURL(file);
        setNewSubtask(prev => ({
            ...prev,
            logoFile: file,
            logoPreview: previewUrl,
            logo: '' // clear old uploaded URL
        }));
    };

    const handleQuestionnaireChange = (questionnaire) => {
        setNewSubtask(prev => {
            const currentIds = prev.questionnaireIds || [];
            const newIds = currentIds.includes(questionnaire._id)
                ? currentIds.filter(id => id !== questionnaire._id)
                : [...currentIds, questionnaire._id];

            return {
                ...prev,
                questionnaireIds: newIds
            };
        });
    };

    const isQuestionnaireSelected = (questionnaireId) => {
        return newSubtask.questionnaireIds?.includes(questionnaireId);
    };

    const filteredSubtasks = subtasks.filter(subtask =>
        subtask.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        subtask.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-4">
            {error ? (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
                    <span className="block sm:inline">{error}</span>
                </div>
            ) : (
                <div className="flex-1 space-y-4">
                    <div className="flex flex-wrap gap-2 items-center justify-between">
                        <h1 className="text-2xl font-bold tracking-tight">Subtask Management</h1>
                        {hasEditPermission() && (
                            <Button onClick={() => setIsCreateSubtaskOpen(true)}>
                                <Plus className="mr-2 h-4 w-4" /> Add New Subtask
                            </Button>
                        )}
                    </div>

                    {loading ? (
                        <div className="text-center py-8">
                            Loading subtasks...
                        </div>
                    ) : (
                        <Card>
                            <CardHeader>
                                <div className="flex flex-wrap gap-2 justify-between items-center">
                                    <div>
                                        <CardTitle>All Subtasks</CardTitle>
                                        <CardDescription>View and manage subtasks for assignments</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[300px]">Title</TableHead>
                                            <TableHead className="w-[100px]">Priority</TableHead>
                                            <TableHead className="w-[300px]">Questionnaires</TableHead>
                                            <TableHead className="w-[100px] text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {subtasks.map((subtask) => (
                                            <TableRow key={subtask._id}>
                                                <TableCell className="font-medium">{subtask.title}</TableCell>
                                                <TableCell>{priorityBadge(subtask.priority)}</TableCell>
                                                <TableCell>
                                                    {subtask.questionnaires && subtask.questionnaires.length > 0 ? (
                                                        <div className="flex gap-1 flex-nowrap" title={subtask.questionnaires.map((q) => q.title).join(', ')}>
                                                            {subtask.questionnaires.slice(0, 3).map((questionnaire) => (
                                                                <Badge key={questionnaire._id} variant="outline">
                                                                    {questionnaire.title}
                                                                </Badge>
                                                            ))}

                                                            {subtask.questionnaires.length > 3 && (
                                                                <span
                                                                    className="text-sm font-bold text-muted-foreground cursor-pointer"
                                                                    title={subtask.questionnaires.map((q) => q.title).join(', ')}
                                                                >
                                                                    ...
                                                                </span>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="text-sm text-muted-foreground">
                                                            No questionnaires assigned
                                                        </span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-1">
                                                        {hasEditPermission() ? (
                                                            <>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => handleOpenEditSubtask(subtask)}
                                                                >
                                                                    <Edit className="h-4 w-4" />
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="text-destructive"
                                                                    onClick={() => handleDeleteSubtask(subtask._id)}
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </>
                                                        ) : (
                                                            <span className="text-sm text-muted-foreground px-2">View only</span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                                <div className="flex flex-wrap items-center justify-between space-x-2 py-4">
                                    <div className="text-sm text-muted-foreground">
                                        {subtasks.length > 0 ? (
                                            <>
                                                Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, subtasks.length)} of{' '}
                                                {subtasks.length} entries
                                            </>
                                        ) : (
                                            'No entries to show'
                                        )}
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                                            disabled={page === 1 || loading}
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                            Previous
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                                            disabled={page === totalPages || loading}
                                        >
                                            Next
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    <Dialog
                        open={isCreateSubtaskOpen || isEditSubtaskOpen}
                        onOpenChange={() => {
                            if (isCreateSubtaskOpen) setIsCreateSubtaskOpen(false);
                            if (isEditSubtaskOpen) setIsEditSubtaskOpen(false);
                            resetSubtaskForm();
                        }}
                    >
                        <DialogContent className="max-w-[600px] h-[80vh] grid grid-rows-[auto,1fr,auto]">
                            <DialogHeader>
                                <DialogTitle>{isEditSubtaskOpen ? 'Edit Subtask' : 'Create New Subtask'}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 overflow-y-auto">
                                <div>
                                    <Label htmlFor="title" className="mb-2">Title</Label>
                                    <Input
                                        id="title"
                                        placeholder="Enter subtask title"
                                        value={newSubtask.title}
                                        onChange={(e) => setNewSubtask(prev => ({ ...prev, title: e.target.value }))}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="description" className="mb-2">Description</Label>
                                    <Textarea
                                        id="description"
                                        placeholder="Enter subtask description"
                                        value={newSubtask.description}
                                        onChange={(e) => setNewSubtask(prev => ({ ...prev, description: e.target.value }))}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="priority" className="mb-2">Priority</Label>
                                    <Select
                                        defaultValue="MEDIUM"
                                        value={newSubtask.priority}
                                        onValueChange={(value) => setNewSubtask(prev => ({ ...prev, priority: value }))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select priority" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="HIGH">High</SelectItem>
                                            <SelectItem value="MEDIUM">Medium</SelectItem>
                                            <SelectItem value="LOW">Low</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label className="mb-2">Questionnaires</Label>
                                    <div className="border rounded-md p-4 space-y-2 max-h-[150px] overflow-y-auto" role="group" aria-label="Select questionnaires">
                                        {availableQuestionnaires?.map((questionnaire) => (
                                            <div key={questionnaire._id} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`questionnaire-${questionnaire._id}`}
                                                    checked={isQuestionnaireSelected(questionnaire._id)}
                                                    onCheckedChange={() => handleQuestionnaireChange(questionnaire)}
                                                />
                                                <Label
                                                    htmlFor={`questionnaire-${questionnaire._id}`}
                                                    className="cursor-pointer"
                                                >
                                                    {questionnaire.title}
                                                </Label>
                                            </div>
                                        ))}
                                        {questionnairesPagination && questionnairesPagination.totalPages > 1 && (
                                            <div className="flex justify-center my-1 text-xs gap-2">
                                                <Button
                                                    variant="outline"
                                                    disabled={!questionnairesPagination.hasPreviousPage}
                                                    onClick={() => setQuestionnaireCurrentPage(questionnairesPagination.currentPage - 1)}
                                                >
                                                    Previous
                                                </Button>
                                                <span className="px-4 py-2">
                                                    Page {questionnairesPagination.currentPage} of {questionnairesPagination.totalPages}
                                                </span>
                                                <Button
                                                    variant="outline"
                                                    disabled={!questionnairesPagination.hasNextPage}
                                                    onClick={() => setQuestionnaireCurrentPage(questionnairesPagination.currentPage + 1)}
                                                >
                                                    Next
                                                </Button>
                                            </div>
                                        )}
                                        {availableQuestionnaires?.length === 0 && (
                                            <p className="text-sm text-muted-foreground">No questionnaires available</p>
                                        )}
                                    </div>
                                </div>

                                {/* === LOGO SECTION WITH PREVIEW === */}
                                <div>
                                    <Label htmlFor="logo" className="mb-2">Logo</Label>
                                    <div className="flex flex-col gap-3">
                                        {/* Preview */}
                                        {(newSubtask.logoPreview || (isEditSubtaskOpen && newSubtask.logoUrl)) && (
                                            <div className="relative w-full max-w-[200px] h-[100px] border rounded-md overflow-hidden bg-gray-50">
                                                <img
                                                    src={newSubtask.logoPreview || newSubtask.logoUrl}
                                                    alt="Logo preview"
                                                    className="w-full h-full object-contain"
                                                />
                                                {newSubtask.logoPreview && (
                                                    <button
                                                        onClick={() => {
                                                            if (newSubtask.logoPreview) {
                                                                URL.revokeObjectURL(newSubtask.logoPreview);
                                                            }
                                                            setNewSubtask(prev => ({
                                                                ...prev,
                                                                logoPreview: undefined,
                                                                logoFile: null,
                                                            }));
                                                        }}
                                                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 text-xs hover:bg-red-600"
                                                        title="Remove image"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                )}
                                            </div>
                                        )}

                                        {/* File Input */}
                                        <div className="flex gap-2 items-center">
                                            <Input
                                                id="logo"
                                                type="file"
                                                accept="image/*"
                                                onChange={handleFileUpload}
                                                disabled={fileUploading}
                                                className="flex-1"
                                            />
                                            {fileUploading && <Loader2 className="h-4 w-4 animate-spin" />}
                                        </div>

                                        <p className="text-xs text-muted-foreground">
                                            {isEditSubtaskOpen && newSubtask.logoUrl && !newSubtask.logoPreview
                                                ? 'Current logo shown above. Select a new file to replace.'
                                                : 'Upload an image (optional)'}
                                        </p>
                                    </div>
                                </div>
                                {/* === END LOGO SECTION === */}

                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => {
                                    if (isCreateSubtaskOpen) setIsCreateSubtaskOpen(false);
                                    if (isEditSubtaskOpen) setIsEditSubtaskOpen(false);
                                    resetSubtaskForm();
                                }}>
                                    Cancel
                                </Button>
                                <Button
                                    onClick={isEditSubtaskOpen ? handleEditSubtask : handleCreateSubtask}
                                    disabled={loading || fileUploading}
                                >
                                    {loading || fileUploading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            {fileUploading ? 'Uploading...' : isEditSubtaskOpen ? 'Updating...' : 'Creating...'}
                                        </>
                                    ) : (
                                        isEditSubtaskOpen ? 'Update' : 'Create'
                                    )}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            )}
        </div>
    );
};

export default Subtasks;
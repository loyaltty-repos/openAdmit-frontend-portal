import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Briefcase, Link, X, Loader2, User } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { createDocument } from '@/services/taskService';

const DocumentsPopup = ({
  open,
  onOpenChange,
  students = [],
  teamMembers = [],
  fetchStudents,
  studentSearch,
  setStudentSearch,
  studentPagination,
  loading,
  hasEditPermission,
  onDocumentAdded,
}) => {
  const [newDocument, setNewDocument] = useState({
    documentName: '',
    documentURL: '',
    priority: 'MEDIUM',
    assignee: '',
  });

  // Only one student allowed
  const [selectedStudent, setSelectedStudent] = useState(null); // { id, name, email }
  const [isStudentDropdownOpen, setIsStudentDropdownOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const resetForm = () => {
    setNewDocument({ documentName: '', documentURL: '', priority: 'MEDIUM', assignee: '' });
    setSelectedStudent(null);
    setStudentSearch('');
    setIsStudentDropdownOpen(false);
  };

  useEffect(() => {
    if (!open) resetForm();
  }, [open]);

  const handleSelectStudent = (student) => {
    setSelectedStudent(student);
    setIsStudentDropdownOpen(false); // close dropdown after selection
  };

  const handleRemoveStudent = () => {
    setSelectedStudent(null);
  };

  const handleAddDocument = async () => {
    if (!newDocument.documentName.trim()) return toast.error('Document name is required');
    if (!newDocument.documentURL.trim()) return toast.error('Document URL is required');
    if (!selectedStudent) return toast.error('Please select a student');

    if (!hasEditPermission()) return toast.error('No permission to add documents');

    try {
      setSaving(true);

      const payload = {
        documentName: newDocument.documentName.trim(),
        documentURL: newDocument.documentURL.trim(),
        priority: newDocument.priority,
        student: selectedStudent.id, // single student ID
        assignee: newDocument.assignee || null,
      };

      await createDocument(payload);

      toast.success('Document added successfully!');
      onDocumentAdded?.();
      onOpenChange(false);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to add document');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Document</DialogTitle>
          <DialogDescription>
            Share a document link and assign it to a single student.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Document Name */}
          <div className="grid gap-2">
            <label className="text-sm font-medium">Document Name</label>
            <Input
              placeholder="e.g. Draft"
              value={newDocument.documentName}
              onChange={(e) => setNewDocument({ ...newDocument, documentName: e.target.value })}
            />
          </div>

          {/* Document URL */}
          <div className="grid gap-2">
            <label className="text-sm font-medium">Document URL</label>
            <Input
              placeholder="https://drive.google.com/..."
              value={newDocument.documentURL}
              onChange={(e) => setNewDocument({ ...newDocument, documentURL: e.target.value })}
            />
          </div>

          {/* Single Student Selection */}
          <div className="grid gap-2">
            <label className="text-sm font-medium">Assign to Student (Required)</label>
            <div className="relative">
              <button
                type="button"
                className="w-full border rounded-md p-3 text-left bg-background flex items-center justify-between"
                onClick={() => setIsStudentDropdownOpen(!isStudentDropdownOpen)}
              >
                {selectedStudent ? (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedStudent.name} ({selectedStudent.email})</span>
                  </div>
                ) : (
                  <span className="text-muted-foreground">Select a student...</span>
                )}
                <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isStudentDropdownOpen && (
                <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg max-h-96 overflow-hidden">
                  <div className="p-2">
                    <Input
                      placeholder="Search students..."
                      value={studentSearch}
                      onChange={(e) => setStudentSearch(e.target.value)}
                    />
                  </div>
                  <ul className="max-h-60 overflow-y-auto">
                    {loading.students ? (
                      <li className="p-4 text-center">
                        <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                      </li>
                    ) : students.length === 0 ? (
                      <li className="p-4 text-center text-muted-foreground">No students found</li>
                    ) : (
                      students.map((student) => (
                        <li
                          key={student.id}
                          className="px-4 py-3 hover:bg-muted cursor-pointer flex items-center gap-3"
                          onClick={() => handleSelectStudent(student)}
                        >
                          <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <div>
                            <div className="font-medium">{student.name}</div>
                            <div className="text-xs text-muted-foreground">{student.email}</div>
                          </div>
                        </li>
                      ))
                    )}
                  </ul>

                  {/* Pagination */}
                  {(studentPagination.hasPrev || studentPagination.hasNext) && (
                    <div className="flex justify-center gap-4 p-2 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={!studentPagination.hasPrev}
                        onClick={() => fetchStudents(studentSearch, studentPagination.currentPage - 1)}
                      >
                        Prev
                      </Button>
                      <span className="py-2 text-sm">
                        {studentPagination.currentPage} / {studentPagination.totalPages || 1}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={!studentPagination.hasNext}
                        onClick={() => fetchStudents(studentSearch, studentPagination.currentPage + 1)}
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Show selected student with remove option */}
            {selectedStudent && (
              <div className="mt-2">
                <Badge variant="secondary" className="py-2 px-3 flex items-center gap-2">
                  <User className="h-3 w-3" />
                  {selectedStudent.name} ({selectedStudent.email})
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 ml-1 hover:bg-destructive hover:text-destructive-foreground rounded-full"
                    onClick={handleRemoveStudent}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              </div>
            )}
          </div>

          {/* Priority & Assignee */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Priority</label>
              <Select value={newDocument.priority} onValueChange={(v) => setNewDocument({ ...newDocument, priority: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="LOW">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium">Assignee</label>
              <Select value={newDocument.assignee} onValueChange={(v) => setNewDocument({ ...newDocument, assignee: v })}>
                <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                <SelectContent>
                  {teamMembers.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4" />
                        {member.name} ({member.role})
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleAddDocument} disabled={saving || !selectedStudent}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              'Add Document'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentsPopup;
import { useState, useEffect } from 'react'
import { getStudentForAdmin, getStudents } from '@/services/studentService'
import { getUniversities } from '@/services/universityService'
import { getUniversityAssignments } from '@/services/universityAssignmentService'
import { getTeamMembers } from '@/services/teamService'
import { getTasksByStudentId } from '@/services/taskService'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, CheckCircle2, XCircle, EditIcon, TrashIcon, Loader2, X } from 'lucide-react'
import { toast } from '@/components/ui/sonner'
// Removed unused Link import
import { getUser } from '@/lib/auth'
import { getApplications, updateApplication, createApplication, deleteApplication, getApplicationById } from '@/services/applicationService'

const format = (date, formatStr) => {
    if (!date) return ''
    const d = new Date(date)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const fullMonths = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

    if (formatStr === 'MMM d, yyyy') {
        return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`
    } else if (formatStr === 'MMMM d, yyyy') {
        return `${fullMonths[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`
    } else if (formatStr === 'MMMM yyyy') {
        return `${fullMonths[d.getMonth()]} ${d.getFullYear()}`
    } else if (formatStr === 'MMM yyyy') {
        return `${months[d.getMonth()]} ${d.getFullYear()}`
    }

    return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`
}

const hasEditPermission = () => {
    const currentUser = getUser()
    return currentUser && (currentUser.role === 'ADMIN' || currentUser.role === 'EDITOR')
}

const Applications = () => {
    // const [applications, setApplications] = useState([]);
    const [filteredApplications, setFilteredApplications] = useState([])
    const [searchQuery, setSearchQuery] = useState('')
    const [activeStatus, setActiveStatus] = useState('all')
    // Removed unused sortConfig state
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [createForm, setCreateForm] = useState({
        studentId: '',
        universityId: '',
        taskAssignments: [],
        assignTo: ''
    })
    const [tasks, setTasks] = useState([])
    const [tasksLoading, setTasksLoading] = useState(false)
    const [students, setStudents] = useState([])
    const [universities, setUniversities] = useState([])
    const [members, setMembers] = useState([])
    const [studentsLoading, setStudentsLoading] = useState(false)
    const [universitiesLoading, setUniversitiesLoading] = useState(false)
    const [membersLoading, setMembersLoading] = useState(false)
    const [dropdownError, setDropdownError] = useState(null)

    // State for update modal
    const [isUpdateOpen, setIsUpdateOpen] = useState(false)
    const [updateForm, setUpdateForm] = useState({
        status: '',
        progress: '',
        taskAssignments: [],
        assignTo: ''
    })
    const [updatingAppId, setUpdatingAppId] = useState(null)

    // 🔹 Student dropdown states
    const [studentSearch, setStudentSearch] = useState('')
    const [studentPagination, setStudentPagination] = useState({})
    const [isStudentDropdownOpen, setIsStudentDropdownOpen] = useState(false)
    const [selectedStudentDetails, setSelectedStudentDetails] = useState(null)

    // 🔹 University dropdown states
    const [universitySearch, setUniversitySearch] = useState('')
    const [universityPagination, setUniversityPagination] = useState({})
    const [isUniversityDropdownOpen, setIsUniversityDropdownOpen] = useState(false)
    const [selectedUniversityDetails, setSelectedUniversityDetails] = useState(null)

    // 🔹 Task dropdown states
    const [taskSearch, setTaskSearch] = useState('')
    const [taskPagination, setTaskPagination] = useState({})
    const [isTaskDropdownOpen, setIsTaskDropdownOpen] = useState(false)
    const [applicationStatus , setApplicationStatus] = useState(undefined)
    const [applicationPaginationData , setApplicationPaginationData] = useState({})
    const [applicationCurrentPage ,setApplicationCurrentPage] = useState(1)

    // Add this line at the top of your component's state declarations
const [isEditTaskDropdownOpen, setIsEditTaskDropdownOpen] = useState(false);

    const handleUpdate = async (app) => {
        // Check if user has permission to update applications
        if (!hasEditPermission()) {
            toast.error('You don\'t have permission to update applications')
            return
        }

        setUpdatingAppId(app.id || app._id)
        console.log(app , 'sjajs')

        // Always fetch members for update modal (like create modal)
        setMembersLoading(true)
        try {
            const res = await getTeamMembers({ page: 1, limit: 100 })
            setMembers(res.data?.members || res.members || [])
        } catch {
            setMembers([])
        } finally {
            setMembersLoading(false)
        }

        let studentId = app.student?._id || app.studentId?._id || app.studentId || app.student
        if (studentId) {
            setTasksLoading(true)
            try {
                const res = await getTasksByStudentId({studentId})
                setTasks(res.data?.task || [])
            } catch {
                setTasks([])
            } finally {
                setTasksLoading(false)
            }
        } else {
            setTasks([])
        }

        let taskAssignments = []
        if (Array.isArray(app.taskAssignments) && app.taskAssignments.length > 0) {
            taskAssignments = app.taskAssignments.map((t) => t.taskId || t._id || t)
        }

        let assignTo = ''
        if (app.assignTo && typeof app.assignTo === 'object') {
            assignTo = app.assignTo._id || ''
        } else if (typeof app.assignTo === 'string') {
            assignTo = app.assignTo
        }
        setUpdateForm({
            status: app.status || '',
            progress: app.progress || '',
            taskAssignments,
            assignTo
        })
        setIsUpdateOpen(true)
    }

    const handleUpdateSubmit = async (e) => {
        e.preventDefault()

        // Check if user has permission to update applications
        if (!hasEditPermission()) {
            toast.error('You don\'t have permission to update applications')
            return
        }

        try {
            setLoading(true)

            const payload = {}
            if (updateForm.status) payload.status = updateForm.status
            if (
                updateForm.progress !== '' &&
                updateForm.progress !== null &&
                updateForm.progress !== undefined
            ) {
                payload.progress = Number(updateForm.progress)
            }

            if (Array.isArray(updateForm.taskAssignments)) {
                const validTaskIds = tasks.map((t) => t.taskId?._id || t._id)
                const filteredTaskAssignments = updateForm.taskAssignments.filter((id) =>
                    validTaskIds.includes(id)
                )

                if (filteredTaskAssignments.length === 0) {
                    toast.error('At least one task assignment is required')
                    setLoading(false)
                    return
                }

                payload.taskAssignments = filteredTaskAssignments
            }

            if (updateForm.assignTo) payload.assignTo = updateForm.assignTo

            await updateApplication(updatingAppId, payload)
            toast.success('Application updated')
            setIsUpdateOpen(false)
            setUpdatingAppId(null)

            // Refetch applications
            const params = {
                page: 1,
                limit: 10,
                search: searchQuery || undefined,
                status: activeStatus !== 'all' ? activeStatus.toUpperCase() : undefined,
            }
            const res = await getApplications(params)
            setFilteredApplications(res.data?.applications || [])
            setIsEditTaskDropdownOpen(false)
        } catch (err) {
            toast.error('Failed to update application: ' + err.response?.data?.message)
            console.error('Update application error:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (app) => {
        // Check if user has permission to delete applications
        if (!hasEditPermission()) {
            toast.error('You don\'t have permission to delete applications')
            return
        }

        if (!window.confirm('Are you sure you want to delete this application?')) return
        try {
            await deleteApplication(app.id || app._id)
            toast.success('Application deleted')
            const params = {
                page: 1,
                limit: 10,
                search: searchQuery || undefined,
                status: activeStatus !== 'all' ? activeStatus.toUpperCase() : undefined
            }
            const res = await getApplications(params)
            setFilteredApplications(res.data?.applications || [])
        } catch (err) {
            toast.error('Failed to delete application: ' + err.response?.data?.message)
            console.error('Delete application error:', err)
        }
    }

    // 🔹 Fetch students
    const fetchStudents = async (search = studentSearch, page = 1) => {
        try {
            setStudentsLoading(true)
            const params = { search, page, limit: 10 }
            const res = await getStudentForAdmin({ params })
            if (res.data.students) {
                setStudents(
                    res.data.students.map((s) => ({
                        id: s._id,
                        name: s.name || s.email,
                        email: s.email
                    }))
                )
                setStudentPagination(res.data.pagination)
            }
        } catch (err) {
            toast.error('Failed to fetch students: ' + err.response?.data?.message)
        } finally {
            setStudentsLoading(false)
        }
    }

    // 🔹 Fetch universities
    const fetchUniversities = async (search = universitySearch, page = 1) => {
        if (!createForm.studentId) return

        try {
            setUniversitiesLoading(true)
            const params = { search, page, limit: 10, studentId: createForm.studentId }
            const res = await getUniversityAssignments(params)

            if (res.data) {
                setUniversities(
                    res.data.assignments.map((u) => ({
                        id: u.universityId._id,
                        name: u.universityId.name
                    }))
                )
                setUniversityPagination(res.data.pagination)
            }
        } catch (err) {
            toast.error('Failed to fetch universities: ' + err.response?.data?.message)
        } finally {
            setUniversitiesLoading(false)
        }
    }

    // 🔹 Fetch tasks
    const fetchTasks = async (search = taskSearch, page = 1) => {
        if (!createForm.studentId ) return

        try {
            setTasksLoading(true)
            const params = {
                search,
                page,
                limit: 10,
                studentId: createForm.studentId,
            }
            const res = await getTasksByStudentId(params)

            if (res.data) {
                setTasks(
                    res.data.task.map((t) => ({
                        id: t.taskId._id,
                        title: t.taskId.title
                    }))
                )
                setTaskPagination(res.data.pagination)
            }
        } catch (err) {
            toast.error('Failed to fetch tasks: ' + err.response?.data?.message)
        } finally {
            setTasksLoading(false)
        }
    }

    // 🔹 when modal opens → fetch students
    useEffect(() => {
        if (isCreateOpen) {
            fetchStudents(studentSearch, 1)
           
        }
    }, [studentSearch, isCreateOpen])

    // 🔹 when student changes → fetch universities
    useEffect(() => {
        if (isCreateOpen && createForm.studentId) {
            fetchUniversities(universitySearch, 1)
        }
    }, [isCreateOpen, createForm.studentId, universitySearch])

    // 🔹 when student + university selected → fetch tasks
    useEffect(() => {
        if (isCreateOpen && createForm.studentId ) {
            fetchTasks(taskSearch, 1)
        }
    }, [isCreateOpen, createForm.studentId,  taskSearch])

    useEffect(() => {
        if (!isCreateOpen) return
        setMembersLoading(true)
        getTeamMembers({ page: 1, limit: 100 })
            .then((res) => setMembers(res.data?.members || res.members || []))
            .catch(() => setDropdownError('Failed to load members'))
            .finally(() => setMembersLoading(false))
    }, [isCreateOpen])

    // useEffect(() => {
    //     if (!isCreateOpen || !createForm.studentId) {
    //         setTasks([])
    //         return
    //     }
    //     setTasksLoading(true)
    //     getTasksByStudentId(createForm.studentId)
    //         .then((res) => setTasks(res.data?.task || []))
    //         .catch(() => setTasks([]))
    //         .finally(() => setTasksLoading(false))
    // }, [isCreateOpen, createForm.studentId])

    useEffect(() => {
        async function fetchApplications() {
            setLoading(true)
            setError(null)
            try {
                const params = {
                    page: applicationCurrentPage,
                    limit: 10,
                    search: searchQuery || undefined,
                    status: applicationStatus !== '' ? applicationStatus : undefined 
                }
                const res = await getApplications(params)

                setFilteredApplications(res.data?.applications || [])
                setApplicationPaginationData(res.data?.pagination)
            } catch (err) {
                setError(err?.response?.data?.message || 'Failed to load applications')
            } finally {
                setLoading(false)
            }
        }
        fetchApplications()
    }, [searchQuery, activeStatus ,applicationStatus , applicationCurrentPage])

    const handleStatusChange = async (id, newStatus) => {
        // Check if user has permission to change application status
        if (!hasEditPermission()) {
            toast.error('You don\'t have permission to change application status')
            return
        }

        try {
            setLoading(true)
            await updateApplication(id, { status: newStatus.toUpperCase() })
            toast.success('Application status updated')

            const params = {
                page: 1,
                limit: 10,
                search: searchQuery || undefined,
                status: activeStatus !== 'all' ? activeStatus.toUpperCase() : undefined
            }
            const res = await getApplications(params)
            // setApplications(res.data?.applications || []);
            setFilteredApplications(res.data?.applications || [])
        } catch (err) {
            toast.error('Failed to update status: ' + err.response?.data?.message)
            console.error('Update application status error:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleSearch = (e) => {
        setApplicationCurrentPage(1);
        setApplicationStatus('');
        setSearchQuery(e.target.value)
    }

    const handleTabChange = (value) => {
        
        setActiveStatus(value)
    }

    const resetForm = ()=>{
      setIsEditTaskDropdownOpen(false)
      setIsStudentDropdownOpen(false);
      setIsUniversityDropdownOpen(false);
      setIsTaskDropdownOpen(false);
      setSelectedStudentDetails(null);
      setSelectedUniversityDetails(null);
      setCreateForm({
        studentId: '',
        universityId: '',
        taskAssignments: [],
        assignTo: ''
       });
       setTasks([])
      
      
    }

    // console.log('Filtered Applications:', filteredApplications);
    return (
        <div className="space-y-6">
            {error && <div className="text-center text-red-500">{error}</div>}
            {loading && <div className="text-center text-muted-foreground">Loading...</div>}
            <div className="flex flex-wrap gap-2 items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">Applications</h1>
                <div className="flex items-center gap-2">
                    {hasEditPermission() && (
                        <Button
                            variant="default"
                            onClick={() => setIsCreateOpen(true)}>
                            + Create Application
                        </Button>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search applications..."
                        className="pl-8 w-full"
                        value={searchQuery}
                        onChange={handleSearch}
                    />

                </div>
                <Select
                    value={applicationStatus}
                    onValueChange={(e) => ( setApplicationCurrentPage(1), setSearchQuery(''),  setApplicationStatus(e))}>
                    <SelectTrigger className="w-fit">
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

            <Tabs
                defaultValue="all"
                value={activeStatus}
                onValueChange={handleTabChange}>
                {/* <TabsList className="max-w-full overflow-x-auto justify-start">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="pending">Pending</TabsTrigger>
                    <TabsTrigger value="approved">Approved</TabsTrigger>
                    <TabsTrigger value="rejected">Rejected</TabsTrigger>
                    <TabsTrigger value="interview">Interview</TabsTrigger>
                </TabsList> */}

                <TabsContent
                    value="all"
                    className="space-y-4">
                    {filteredApplications.length === 0 ? (
                        <div className="text-center text-muted-foreground py-8">No applications available</div>
                    ) : (
                        <Card>
                            <CardContent className="md:px-6">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[20%]">Student</TableHead>
                                            <TableHead className="w-[20%]">Email</TableHead>
                                            <TableHead className="w-[20%]">University</TableHead>
                                            <TableHead className="w-[20%]">Program</TableHead>
                                            <TableHead className="w-[12%]">Status</TableHead>
                                            <TableHead className="w-[13%]">Progress</TableHead>
                                            <TableHead className="w-[10%]">Last Updated</TableHead>
                                            <TableHead className="w-[10%] text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredApplications.map((app) => {
                                            const student = app.student || app.studentId || {}
                                            const email = app?.studentId?.email || ''
                                            const university = app.university || app.universityId || {}
                                            const program = university.program || app.program || ''
                                            const status = app.status || ''
                                            const progress = typeof app.progress === 'number' ? app.progress : 0
                                            const lastUpdated = app.updatedAt || app.lastUpdated || app.submissionDate || app.createdAt || ''
                                            // Status badge color
                                            let badgeClass = ''
                                            let badgeText = ''
                                            switch (status.toUpperCase()) {
                                                case 'SUBMITTED':
                                                    badgeClass = 'bg-green-800 text-white'
                                                    badgeText = 'Submitted'
                                                    break
                                                case 'REVIEWED':
                                                    badgeClass = 'bg-blue-500 text-white'
                                                    badgeText = 'REVIEWED'
                                                    break
                                                case 'UNDER_REVIEW':
                                                    badgeClass = 'bg-yellow-500 text-white'
                                                    badgeText = 'Under Review'
                                                    break
                                                case 'DRAFT':
                                                    badgeClass = 'bg-gray-200 text-gray-700'
                                                    badgeText = 'Draft'
                                                    break
                                                case 'REJECTED':
                                                    badgeClass = 'bg-red-500 text-white'
                                                    badgeText = 'Rejected'
                                                    break
                                                case 'APPROVED':
                                                    badgeClass = 'bg-green-500 text-white'
                                                    badgeText = 'Approved'
                                                    break
                                                case 'PENDING':
                                                    badgeClass = 'bg-yellow-500 text-white'
                                                    badgeText = 'Pending'
                                                    break
                                                case 'INTERVIEW':
                                                    badgeClass = 'bg-blue-500 text-white'
                                                    badgeText = 'Interview'
                                                    break
                                                default:
                                                    badgeClass = 'bg-gray-200 text-gray-700'
                                                    badgeText = status
                                                    break
                                            }
                                            return (
                                                <TableRow key={app.id || app._id}>
                                                    <TableCell className="font-bold">{student.name || ''}</TableCell>
                                                    <TableCell className="truncate max-w-[100px]">{email || ''}</TableCell>
                                                    <TableCell className="truncate max-w-[150px]">{university.name || ''}</TableCell>
                                                    <TableCell className="truncate max-w-[100px]">{program}</TableCell>
                                                    <TableCell>
                                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badgeClass}`}>
                                                            {badgeText}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                                <div
                                                                    className="h-2 rounded-full"
                                                                    style={{
                                                                        width: `${progress}%`,
                                                                        background: progress === 100 ? '#22c55e' : '#3b82f6'
                                                                    }}></div>
                                                            </div>
                                                            <span className="text-xs font-medium ml-2">{progress}%</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>{lastUpdated ? format(lastUpdated, 'yyyy-MM-dd') : ''}</TableCell>
                                                    <TableCell className="text-right flex gap-2 justify-end">
                                                        {hasEditPermission() && (
                                                            <>
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() => handleUpdate(app)}>
                                                                    <svg
                                                                        xmlns="http://www.w3.org/2000/svg"
                                                                        className="h-4 w-4"
                                                                        fill="none"
                                                                        viewBox="0 0 24 24"
                                                                        stroke="currentColor">
                                                                        <path
                                                                            strokeLinecap="round"
                                                                            strokeLinejoin="round"
                                                                            strokeWidth={2}
                                                                            d="M15.232 5.232l3.536 3.536M9 13h3l8-8a2.828 2.828 0 00-4-4l-8 8v3zm0 0v3h3"
                                                                        />
                                                                    </svg>
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="destructive"
                                                                    onClick={() => handleDelete(app)}>
                                                                    <svg
                                                                        xmlns="http://www.w3.org/2000/svg"
                                                                        className="h-4 w-4"
                                                                        fill="none"
                                                                        viewBox="0 0 24 24"
                                                                        stroke="currentColor">
                                                                        <path
                                                                            strokeLinecap="round"
                                                                            strokeLinejoin="round"
                                                                            strokeWidth={2}
                                                                            d="M6 18L18 6M6 6l12 12"
                                                                        />
                                                                    </svg>
                                                                </Button>
                                                            </>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        })}
                                    </TableBody>
                                  </Table>
                                    {applicationPaginationData.totalPages > 1 && (
                                        <div className="flex justify-center items-center gap-2 p-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                disabled={!applicationPaginationData?.hasPrevPage}
                                                onClick={() => setApplicationCurrentPage(applicationPaginationData.page - 1)}>
                                                Previous
                                            </Button>
                                            <span>
                                                {applicationPaginationData?.page || 1} of {applicationPaginationData?.totalPages || 1}
                                            </span>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                disabled={!applicationPaginationData?.hasNextPage}
                                                onClick={() => setApplicationCurrentPage( applicationPaginationData.page + 1)}>
                                                Next
                                            </Button>
                                        </div>
                                    )}
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                <Dialog
                    open={isCreateOpen}
                    onOpenChange={(isOpen) => {
                        setIsCreateOpen(isOpen);

                        if (!isOpen) {
                            resetForm();
                        }
                    }}>
                    <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Create Application</DialogTitle>
                        </DialogHeader>
                        <form
                            onSubmit={async (e) => {
                                e.preventDefault()

                                // Check if user has permission to create applications
                                if (!hasEditPermission()) {
                                    toast.error('You don\'t have permission to create applications')
                                    return
                                }

                                try {
                                    setLoading(true)

                                    if (!createForm.studentId || !createForm.universityId) {
                                        toast.error('Please select both Student and University')
                                        return
                                        }

                                    const payload = {
                                        studentId: createForm.studentId,
                                        universityId: createForm.universityId,
                                        taskAssignments: createForm.taskAssignments,
                                        assignTo: createForm.assignTo
                                    }

                                    await createApplication(payload)
                                    toast.success('Application created')
                                    setIsCreateOpen(false)
                                    resetForm()
                                    setCreateForm({ studentId: '', universityId: '', taskAssignments: [], assignTo: '' })
                                    // Refetch applications
                                    const params = {
                                        page: applicationCurrentPage,
                                        limit: 10,
                                        search: searchQuery || undefined,
                                        status: applicationStatus !== '' ? applicationStatus : undefined                                                    
                                    }
                                    const res = await getApplications(params)
                                    // setApplications(res.data?.applications || []);
                                    setFilteredApplications(res.data?.applications || [])
                                } catch (err) {
                                    toast.error('Failed to create application: ' + err.response?.data?.message)
                                    console.error('Create application error:', err)
                                     resetForm()
                                } finally {
                                    setLoading(false)
                                   
                                }
                            }}
                            className="space-y-4">
                            {/* Student Select */}
                            <div>
                                <label className="block mb-1 font-medium">Student</label>
                                <div className="relative">
                                    <button
                                        type="button"
                                        className="w-full border rounded-md p-2 text-left"
                                        onClick={() => setIsStudentDropdownOpen(!isStudentDropdownOpen)}>
                                        {selectedStudentDetails
                                            ? `${selectedStudentDetails.name} (${selectedStudentDetails.email})`
                                            : 'Select Student'}
                                    </button>
                                    {isStudentDropdownOpen && (
                                        <div className=" z-10 bg-white border rounded-md mt-1 w-full text-sm">
                                            <div className="p-2">
                                                <Input
                                                    placeholder="Search students..."
                                                    value={studentSearch}
                                                    onChange={(e) => setStudentSearch(e.target.value)}
                                                />
                                            </div>
                                            {studentsLoading ? (
                                                <div className="p-2 flex justify-center">
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                </div>
                                            ) : (
                                                <ul className="px-2">
                                                    {students.length > 0 ? (
                                                        students.map((student) => (
                                                            <li
                                                                key={student.id}
                                                                className="p-2 hover:bg-gray-100 cursor-pointer"
                                                                onClick={() => {
                                                                    setCreateForm((f) => ({
                                                                        ...f,
                                                                        studentId: student.id,
                                                                        universityId: '',       // reset dependent fields properly
                                                                        taskAssignments: []     // reset tasks
                                                                    }))
                                                                    setSelectedStudentDetails(student)
                                                                    setIsStudentDropdownOpen(false)
                                                                    setIsUniversityDropdownOpen(false)
                                                                    setIsTaskDropdownOpen(false)
                                                                    setSelectedUniversityDetails(null)
                                                                    }}>
                                                                {student.name} ({student.email})
                                                            </li>
                                                        ))
                                                    ) : (
                                                        <h1 className="text-center">No Student Found</h1>
                                                    )}
                                                </ul>
                                            )}
                                            {studentPagination.totalPages > 1 && (
                                                <div className="flex justify-center items-center gap-2 p-2">
                                                    <Button
                                                        type='button'
                                                        variant="outline"
                                                        size="sm"
                                                        disabled={!studentPagination?.hasPrev}
                                                        onClick={() => fetchStudents(studentSearch, studentPagination.currentPage - 1)}>
                                                        Previous
                                                    </Button>
                                                    <span>
                                                        {studentPagination?.currentPage || 1} of {studentPagination?.totalPages || 1}
                                                    </span>
                                                    <Button
                                                        type='button'
                                                        variant="outline"
                                                        size="sm"
                                                        disabled={!studentPagination?.hasNext}
                                                        onClick={() => fetchStudents(studentSearch, studentPagination.currentPage + 1)}>
                                                        Next
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                                {/* {selectedStudentDetails && (
    <div className="mt-2 flex items-center gap-2">
      <span className="text-sm bg-gray-100 px-2 py-1 rounded">
        {selectedStudentDetails.name}
      </span>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => {
          setCreateForm((f) => ({ ...f, studentId: '', taskAssignments: [] }));
          setSelectedStudentDetails(null);
        }}
      >
        <X className="h-3 w-3" />
      </Button>
    </div>
  )} */}
                            </div>

                            {/* University Dropdown */}
                            {/* University Select */}
                            <div>
                                <label className="block mb-1 font-medium">University</label>
                                <div className="relative">
                                    <button
                                        type="button"
                                        className="w-full border rounded-md p-2 text-left disabled:bg-gray-100 disabled:cursor-not-allowed"
                                        disabled={!createForm.studentId}
                                        onClick={() => setIsUniversityDropdownOpen(!isUniversityDropdownOpen)}>
                                        {selectedUniversityDetails ? selectedUniversityDetails.name : 'Select University'}
                                    </button>
                                    {isUniversityDropdownOpen && createForm.studentId && (
                                        <div className=" z-10 bg-white border rounded-md mt-1 w-full text-sm">
                                            {/* <div className="p-2">
          <Input
            placeholder="Search universities..."
            value={universitySearch}
            onChange={(e) => setUniversitySearch(e.target.value)}
          />
        </div> */}
                                            {universitiesLoading ? (
                                                <div className="p-2 flex justify-center">
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                </div>
                                            ) : (
                                                <ul className="p-2">
                                                    {universities.length > 0 ? (
                                                        universities.map((uni) => (
                                                            <li
                                                                key={uni.id}
                                                                className="p-2  hover:bg-gray-100 cursor-pointer"
                                                                onClick={() => {
                                                                    setCreateForm((f) => ({ ...f, universityId: uni.id, taskAssignments: [] }))
                                                                    setSelectedUniversityDetails(uni)
                                                                    setIsUniversityDropdownOpen(false)
                                                                    }}>
                                                                {uni.name}
                                                            </li>
                                                        ))
                                                    ) : (
                                                        <h1 className="text-center"> No University Found </h1>
                                                    )}
                                                </ul>
                                            )}
                                            {universityPagination.totalPages > 1 && (
                                                <div className="flex justify-center items-center gap-2 p-2">
                                                    <Button
                                                        type='button'
                                                        variant="outline"
                                                        size="sm"
                                                        disabled={!universityPagination?.hasPrevPage}
                                                        onClick={() => fetchUniversities(universitySearch, universityPagination.page - 1)}>
                                                        Previous
                                                    </Button>
                                                    <span>
                                                        {universityPagination?.page || 1} of {universityPagination?.totalPages || 1}
                                                    </span>
                                                    <Button
                                                        type='button'
                                                        variant="outline"
                                                        size="sm"
                                                        disabled={!universityPagination?.hasNextPage}
                                                        onClick={() => fetchUniversities(universitySearch, universityPagination.page + 1)}>
                                                        Next
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                                {/* {selectedUniversityDetails && (
    <div className="mt-2 flex items-center gap-2">
      <span className="text-sm bg-gray-100 px-2 py-1 rounded">
        {selectedUniversityDetails.name}
      </span>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => {
          setCreateForm((f) => ({ ...f, universityId: '', taskAssignments: [] }));
          setSelectedUniversityDetails(null);
        }}
      >
        <X className="h-3 w-3" />
      </Button>
    </div>
  )} */}
                            </div>

                            <div>
                                <label className="block mb-1 font-medium">Assign To</label>
                                <Select
                                    value={createForm.assignTo}
                                    onValueChange={(val) => setCreateForm((f) => ({ ...f, assignTo: val }))}
                                    disabled={membersLoading}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder={membersLoading ? 'Loading members...' : 'Select Member'} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {members.map((member) => (
                                            <SelectItem
                                                key={member._id}
                                                value={member._id}>
                                                {member.email}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            {dropdownError && <div className="text-red-500 text-sm">{dropdownError}</div>}

                            {/* Task Assignments Dropdown */}
                            <div>
                                <label className="block mb-1 font-medium">Task Assignments</label>
                                <div className="relative">
                                    <button
                                        type="button"
                                        className="w-full border rounded-md p-2 text-left disabled:bg-gray-100 disabled:cursor-not-allowed"
                                        disabled={!createForm.studentId }
                                        onClick={() => setIsTaskDropdownOpen(!isTaskDropdownOpen)}>
                                        {createForm.taskAssignments.length > 0
                                            ? `${createForm.taskAssignments.length} task(s) selected`
                                            : 'Select Tasks'}
                                    </button>
                                    {isTaskDropdownOpen && createForm.studentId  && (
                                        <div className=" z-10 bg-white border rounded-md mt-1 w-full text-sm">
                                            {/* <div className="p-2">
                                                <Input
                                                    placeholder="Search tasks..."
                                                    value={taskSearch}
                                                    onChange={(e) => setTaskSearch(e.target.value)}
                                                />
                                            </div> */}
                                            {tasksLoading ? (
                                                <div className="p-2 flex justify-center">
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                </div>
                                            ) : (
                                                <ul className='p-2'>
                                                    {tasks.length > 0 ? (
                                                        tasks.map((task) => {
                                                            const isSelected = createForm.taskAssignments.includes(task.id)
                                                            return (
                                                                <li
                                                                    key={task.id}
                                                                    className={`p-2 mx-2 cursor-pointer hover:bg-gray-100 flex justify-between items-center ${
                                                                        isSelected ? 'bg-gray-200' : ''
                                                                    }`}
                                                                    onClick={() => {
                                                                        setCreateForm((f) => {
                                                                            const alreadySelected = f.taskAssignments.includes(task.id)
                                                                            return {
                                                                                ...f,
                                                                                taskAssignments: alreadySelected
                                                                                    ? f.taskAssignments.filter((tid) => tid !== task.id)
                                                                                    : [...f.taskAssignments, task.id]
                                                                            }
                                                                        })
                                                                    }}>
                                                                    {task.title}
                                                                    {isSelected && <span className="text-xs">✓</span>}
                                                                </li>
                                                            )
                                                        })
                                                    ) : (
                                                        <h1 className="text-center"> No Task Found</h1>
                                                    )}
                                                </ul>
                                            )}
                                            {/* <div className="flex justify-center items-center gap-2 p-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    disabled={!taskPagination?.hasPrevPage}
                                                    onClick={() => fetchTasks(taskSearch, taskPagination.page - 1)}>
                                                    Previous
                                                </Button>
                                                <span>
                                                    {taskPagination?.page || 1} of {taskPagination?.totalPages || 1}
                                                </span>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    disabled={!taskPagination?.hasNextPage}
                                                    onClick={() => fetchTasks(taskSearch, taskPagination.page + 1)}>
                                                    Next
                                                </Button>
                                            </div> */}
                                        </div>
                                    )}
                                </div>

                                {/* Selected tasks chips */}
                                {createForm.taskAssignments.length > 0 && (
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {tasks
                                            .filter((t) => createForm.taskAssignments.includes(t.id))
                                            .map((t) => (
                                                <span
                                                    key={t.id}
                                                    className="text-sm bg-gray-100 px-2 py-1 rounded flex items-center gap-1">
                                                    {t.title}
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setCreateForm((f) => ({
                                                                ...f,
                                                                taskAssignments: f.taskAssignments.filter((tid) => tid !== t.id)
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
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsCreateOpen(false)}>
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    variant="default"
                                    disabled={loading}>
                                    Create
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>

                <TabsContent
                    value="pending"
                    className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Pending Applications</CardTitle>
                            <CardDescription>Applications awaiting review and decision</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[25%]">Student</TableHead>
                                        <TableHead className="w-[20%]">University</TableHead>
                                        {/* <TableHead className="w-[20%]">Program</TableHead> */}
                                        <TableHead className="w-[15%]">Submission Date</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredApplications.length > 0 ? (
                                        filteredApplications.map((app) => {
                                            // Normalize for both old and new API shapes
                                            const student = app.student || app.studentId || {}
                                            const university = app.university || app.universityId || {}
                                            const studentName = student && student.name ? student.name : ''
                                            return (
                                                <TableRow key={app.id || app._id}>
                                                    <TableCell className="font-medium">
                                                        <div className="flex items-center gap-2">
                                                            <Avatar className="h-8 w-8">
                                                                <AvatarFallback>
                                                                    {studentName
                                                                        ? studentName
                                                                              .split(' ')
                                                                              .map((n) => n[0])
                                                                              .join('')
                                                                        : ''}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div>
                                                                <div className="font-medium">{studentName}</div>
                                                                <div className="text-xs text-muted-foreground">{app.id || app._id}</div>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>{university && university.name ? university.name : ''}</TableCell>
                                                    {/* <TableCell>{app.program}</TableCell> */}
                                                    <TableCell>{format(app.submissionDate, 'MMM d, yyyy')}</TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end space-x-2">
                                                            {hasEditPermission() && (
                                                                <>
                                                                    <Button
                                                                        size="sm"
                                                                        variant="default"
                                                                        className="h-8"
                                                                        onClick={() => handleStatusChange(app.id, 'approved')}>
                                                                        <CheckCircle2 className="mr-2 h-4 w-4" />
                                                                        Approve
                                                                    </Button>
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                        className="h-8"
                                                                        onClick={() => handleStatusChange(app.id, 'interview')}>
                                                                        Schedule Interview
                                                                    </Button>
                                                                </>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        })
                                    ) : (
                                        <TableRow>
                                            <TableCell
                                                colSpan={5}
                                                className="text-center py-4">
                                                No pending applications found
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent
                    value="approved"
                    className="space-y-4">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[25%]">Student</TableHead>
                                <TableHead className="w-[20%]">University</TableHead>
                                {/* <TableHead className="w-[20%]">Program</TableHead> */}
                                <TableHead className="w-[15%]">Approval Date</TableHead>
                                <TableHead className="w-[10%]">Start Date</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                                <TableHead className="w-[10%]">Update</TableHead>
                                <TableHead className="w-[10%]">Delete</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredApplications.length > 0 ? (
                                filteredApplications.map((app) => {
                                    // Normalize for both old and new API shapes
                                    const student = app.student || app.studentId || {}
                                    const university = app.university || app.universityId || {}
                                    const studentName = student && student.name ? student.name : ''
                                    return (
                                        <TableRow key={app.id || app._id}>
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-2">
                                                    <Avatar className="h-8 w-8">
                                                        <AvatarFallback>
                                                            {studentName
                                                                ? studentName
                                                                      .split(' ')
                                                                      .map((n) => n[0])
                                                                      .join('')
                                                                : ''}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <div className="font-medium">{studentName}</div>
                                                        <div className="text-xs text-muted-foreground">{app.id || app._id}</div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>{university && university.name ? university.name : ''}</TableCell>
                                            {/* <TableCell>{university && university.program ? university.program : ''}</TableCell> */}
                                            <TableCell>{app.decisionDate ? format(app.decisionDate, 'MMM d, yyyy') : 'N/A'}</TableCell>
                                            <TableCell>{app.startDate ? format(app.startDate, 'MMM yyyy') : 'N/A'}</TableCell>
                                            <TableCell className="text-right">{/* View button removed */}</TableCell>
                                            {hasEditPermission() && (
                                                <>
                                                    <TableCell>
                                                        <Button
                                                            size="icon"
                                                            variant="outline"
                                                            className="h-8 w-8"
                                                            onClick={() => handleUpdate(app)}>
                                                            <EditIcon />
                                                        </Button>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Button
                                                            size="icon"
                                                            variant="destructive"
                                                            className="h-8 w-8"
                                                            onClick={() => handleDelete(app)}>
                                                            <TrashIcon />
                                                        </Button>
                                                    </TableCell>
                                                </>
                                            )}
                                            {!hasEditPermission() && (
                                                <>
                                                    <TableCell></TableCell>
                                                    <TableCell></TableCell>
                                                </>
                                            )}
                                        </TableRow>
                                    )
                                })
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={6}
                                        className="text-center py-4">
                                        No approved applications found
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TabsContent>

                <TabsContent
                    value="rejected"
                    className="space-y-4">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[25%]">Student</TableHead>
                                <TableHead className="w-[20%]">University</TableHead>
                                {/* <TableHead className="w-[20%]">Program</TableHead> */}
                                <TableHead className="w-[15%]">Rejection Date</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredApplications.length > 0 ? (
                                filteredApplications.map((app) => {
                                    const student = app.student || app.studentId || {}
                                    const university = app.university || app.universityId || {}
                                    const studentName = student && student.name ? student.name : ''
                                    return (
                                        <TableRow key={app.id || app._id}>
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-2">
                                                    <Avatar className="h-8 w-8">
                                                        <AvatarFallback>
                                                            {studentName
                                                                ? studentName
                                                                      .split(' ')
                                                                      .map((n) => n[0])
                                                                      .join('')
                                                                : ''}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <div className="font-medium">{studentName}</div>
                                                        <div className="text-xs text-muted-foreground">{app.id || app._id}</div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>{university && university.name ? university.name : ''}</TableCell>
                                            {/* <TableCell>{university && university.program ? university.program : ''}</TableCell> */}
                                            <TableCell>{app.decisionDate ? format(app.decisionDate, 'MMM d, yyyy') : 'N/A'}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end space-x-2">
                                                    {hasEditPermission() && (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => handleStatusChange(app.id, 'pending')}>
                                                            Reconsider
                                                        </Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={5}
                                        className="text-center py-4">
                                        No rejected applications found
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TabsContent>

                <TabsContent
                    value="interview"
                    className="space-y-4">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[25%]">Student</TableHead>
                                <TableHead className="w-[20%]">University</TableHead>
                                {/* <TableHead className="w-[20%]">Program</TableHead> */}
                                <TableHead className="w-[15%]">Submission Date</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredApplications.length > 0 ? (
                                filteredApplications.map((app) => {
                                    // Normalize for both old and new API shapes
                                    const student = app.student || app.studentId || {}
                                    const university = app.university || app.universityId || {}
                                    const studentName = student && student.name ? student.name : ''
                                    return (
                                        <TableRow key={app.id || app._id}>
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-2">
                                                    <Avatar className="h-8 w-8">
                                                        <AvatarFallback>
                                                            {studentName
                                                                ? studentName
                                                                      .split(' ')
                                                                      .map((n) => n[0])
                                                                      .join('')
                                                                : ''}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <div className="font-medium">{studentName}</div>
                                                        <div className="text-xs text-muted-foreground">{app.id || app._id}</div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>{university && university.name ? university.name : ''}</TableCell>
                                            {/* <TableCell>{university && university.program ? university.program : ''}</TableCell> */}
                                            <TableCell>{format(app.submissionDate, 'MMM d, yyyy')}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end space-x-2">
                                                    <Button
                                                        size="sm"
                                                        variant="default"
                                                        className="h-8"
                                                        onClick={() => handleStatusChange(app.id, 'approved')}>
                                                        <CheckCircle2 className="mr-2 h-4 w-4" />
                                                        Approve
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="h-8"
                                                        onClick={() => handleStatusChange(app.id, 'rejected')}>
                                                        <XCircle className="mr-2 h-4 w-4" />
                                                        Reject
                                                    </Button>
                                                    <Button
                                                        size="icon"
                                                        variant="outline"
                                                        className="h-8 w-8"
                                                        onClick={() => console.log('View interview details')}>
                                                        {/* Replace with appropriate action */}
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={5}
                                        className="text-center py-4">
                                        No interview applications found
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TabsContent>
            </Tabs>

            {/* Update Application Modal */}
            <Dialog
                open={isUpdateOpen}
                 onOpenChange={(isOpen) => {
                        setIsUpdateOpen(isOpen);

                        if (!isOpen) {
                            resetForm();
                        }
                    }}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Update Application</DialogTitle>
                    </DialogHeader>
                    <form
                        onSubmit={handleUpdateSubmit}
                        className="space-y-4">
                        <div>
                            <label className="block mb-1 font-medium">Status</label>
                            <Select
                                value={updateForm.status}
                                onValueChange={(val) => setUpdateForm((f) => ({ ...f, status: val }))}>
                                <SelectTrigger className="w-full">
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
                                onChange={(e) => setUpdateForm((f) => ({ ...f, progress: e.target.value }))}
                                placeholder="Enter progress (0-100)"
                            />
                        </div>
                        <div>
                            <label className="block mb-1 font-medium">Assign To</label>
                            <Select
                                value={updateForm.assignTo}
                                onValueChange={(val) => setUpdateForm((f) => ({ ...f, assignTo: val }))}
                                disabled={membersLoading}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder={membersLoading ? 'Loading members...' : 'Select Member'} />
                                </SelectTrigger>
                                <SelectContent>
                                    {members.map((member) => (
                                        <SelectItem
                                            key={member._id}
                                            value={member._id}>
                                            {member.email}
                                        </SelectItem>
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
                                onClick={() =>setIsEditTaskDropdownOpen(!isEditTaskDropdownOpen)}>
                                {updateForm.taskAssignments.length > 0
                                    ? `${updateForm.taskAssignments.length} task's selected`
                                    : 'Select Tasks'}
                            </button>
                            {isEditTaskDropdownOpen && (
                                <div className="z-10 bg-white border rounded-md mt-1 w-full text-sm ">
                                    <ul className='p-2 max-h-[200px] overflow-y-auto'>
                                        {tasksLoading ? (
                                            <div className="p-2 flex justify-center">
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            </div>
                                        ) : (
                                            tasks.length > 0 ? (
                                                tasks.map((task) => {
                                                    // Use the correct ID field for the task object
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
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsUpdateOpen(false)}>
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="default"
                                disabled={loading}>
                                Update
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default Applications

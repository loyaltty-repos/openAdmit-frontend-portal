// import { useEffect, useState, useRef } from 'react'
// import { useNavigate, useSearchParams } from 'react-router-dom'

// import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore'
// import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
// import { signInWithCustomToken } from 'firebase/auth'
// import { db, storage, auth } from '@/lib/firebase'

// import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
// import { Button } from '@/components/ui/button'
// import { Input } from '@/components/ui/input'
// import { Search, Send, Paperclip, MoreVertical, Plus, FileText, Image as ImageIcon, Download } from 'lucide-react'
// import { Avatar, AvatarFallback } from '@/components/ui/avatar'
// import { Textarea } from '@/components/ui/textarea'
// import { ScrollArea } from '@/components/ui/scroll-area'
// import { Badge } from '@/components/ui/badge'
// import { Tabs, TabsContent } from '@/components/ui/tabs'
// import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
// import { Command, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command'
// import { generateAdminToken, getAllStudents, getChatsAdmin } from '@/services/chatService'
// import defaultUser from '../../assets/defaultuser.png'
// import { toast } from 'sonner'


// const Messages = () => {
//     const [searchParams] = useSearchParams()
//     const targetStudentId = searchParams.get('studentId')

//     const [loading, setLoading] = useState(false)
//     const [chatLoading, setChatLoading] = useState(false)
//     const [studentListPagination, setStudentListPagination] = useState({})
//     const [currentPage, setCurrentPage] = useState(1)
//     const [conversations, setConversations] = useState([])
//     const [isDialogOpen, setIsDialogOpen] = useState(false)
//     const [students, setStudents] = useState([])

//     const [selectedRoom, setSelectedRoom] = useState({
//         firebaseToken: '',
//         chatRoomId: '',
//         studentId: '',
//         studentInfo: null,
//         adminInfo: null
//     })
//     const [messages, setMessages] = useState([])
//     const [newMessage, setNewMessage] = useState('')
//     const [selectedFile, setSelectedFile] = useState(null)
//     const [uploading, setUploading] = useState(false)
//     const [authenticated, setAuthenticated] = useState(false)
//     const [chatPagination, setChatPagination] = useState(false)
//     const [currentChatpage, setCurrentChatpage] = useState(1)
//     const [chatSearch, setchatSearch] = useState('')
//     const [studentSearch, setStudentSearch] = useState('')
//     const [roomsLoading ,setRoomsLoading] = useState(false)

//     const messagesEndRef = useRef(null)
//     const fileInputRef = useRef(null)

//     const navigate = useNavigate();

//     useEffect(() => {
//         if (targetStudentId && selectedRoom.studentId === targetStudentId) {
//             navigate('/admin/messages', { replace: true });
//         }
//     }, [selectedRoom.studentId, targetStudentId, navigate]);

//     useEffect(() => {
//         const handleTargetStudent = async () => {
//             if (targetStudentId && students.length > 0) {
//                 const targetStudent = students.find(student => student.id === targetStudentId)
//                 if (targetStudent) {
//                     await generateRoomToken(targetStudent)
//                 }
//             }
//         }
//         handleTargetStudent()
//     }, [targetStudentId, students])

//     useEffect(() => {
//         let isMounted = true
//         const fetchStudents = async () => {
//             try {
//                 setLoading(true)
//                 const response = await getAllStudents({ page: currentPage , search: studentSearch })
//                 if (isMounted && response.data?.data?.students) {
//                     setStudents(response.data.data.students)
//                     setStudentListPagination(response.data.data.pagination)
//                 }
//             } catch (error) {
//                 if (isMounted) {
//                     toast.error(error.response?.data?.message || 'Failed to fetch Students')
//                 }
//             } finally {
//                 if (isMounted) setLoading(false)
//             }
//         }
//         fetchStudents()
//         return () => {
//             isMounted = false
//         }
//     }, [currentPage , studentSearch])

//     useEffect(() => {
//         let isMounted = true
//         const fetchAdminChats = async () => {
//             try {
//                 setRoomsLoading(true)
//                 const response = await getChatsAdmin({page: currentChatpage , search :chatSearch})
//                 if (isMounted && response.data?.data?.chatRooms) {
//                     setConversations(response.data.data.chatRooms)
//                     setChatPagination(response.data.data.pagination)
//                 }
//             } catch (error) {
//                 if (isMounted) {
//                     toast.error(error.response?.data?.message || 'Failed to fetch conversations')
//                 }
//             } finally {
//                 if (isMounted) setRoomsLoading(false)
//             }
//         }
//         fetchAdminChats()
//         return () => {
//             isMounted = false
//         }
//     }, [currentChatpage , chatSearch ])

//     const scrollToBottom = () => {
//         messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
//     }

//     useEffect(() => {
//         scrollToBottom()
//     }, [messages])

//     useEffect(() => {
//         const authenticateUser = async () => {
//             if (!selectedRoom.firebaseToken) return
//             try {
//                 setAuthenticated(false)
//                 setChatLoading(true)
//                 await signInWithCustomToken(auth, selectedRoom.firebaseToken)
//                 setAuthenticated(true)
//             } catch (error) {
//                 console.error('Firebase authentication error:', error)
//                 toast.error('Failed to connect to chat')
//                 setChatLoading(false)
//             }
//         }
//         authenticateUser()
//     }, [selectedRoom.firebaseToken])

//     useEffect(() => {
//         if (!authenticated || !selectedRoom.chatRoomId) return

//         setChatLoading(true)
//         const messagesRef = collection(db, 'chatRooms', selectedRoom.chatRoomId, 'messages')
//         const q = query(messagesRef, orderBy('timestamp', 'asc'))

//         const unsubscribe = onSnapshot(
//             q,
//             (snapshot) => {
//                 const newMessages = snapshot.docs.map((doc) => ({
//                     id: doc.id,
//                     ...doc.data(),
//                     timestamp: doc.data().timestamp?.toDate()
//                 }))
//                 setMessages(newMessages)
//                 // console.log('fhalsd', newMessages)
//                 setChatLoading(false)
//             },
//             (error) => {
//                 console.error('Messages subscription error:', error)
//                 toast.error('Failed to load messages')
//                 setChatLoading(false)
//             }
//         )

//         return () => unsubscribe()
//     }, [authenticated, selectedRoom.chatRoomId])

//     const generateRoomToken = async (student) => {
//         try {
//             setChatLoading(true)
//             const res = await generateAdminToken({ targetId: student.id })
//             if (res.data.success) {
//                 setSelectedRoom({
//                     firebaseToken: res.data.data?.firebaseToken,
//                     chatRoomId: res.data.data?.chatRoomId,
//                     studentId: res.data.data?.targetInfo?.id,
//                     studentInfo: res.data.data?.targetInfo,
//                     adminInfo: res.data.data?.userInfo
//                 })
//                 setIsDialogOpen(false)
//             } else {
//                 toast.error('Failed to generate Token')
//             }
//         } catch (error) {
//             toast.error(error.response?.data?.message || 'Failed to generate Token')
//         } finally {
//         }
//     }

//     const handleFileSelect = (event) => {
//         const file = event.target.files[0]
//         if (!file) return
//         if (file.size > 10 * 1024 * 1024) {
//             toast.error('File size must be less than 10MB')
//             return
//         }
//         setSelectedFile(file)
//     }

//     const uploadFile = async (file) => {
//         const fileName = `${Date.now()}_${file.name}`
//         const fileRef = ref(storage, `chat-files/${selectedRoom.chatRoomId}/${fileName}`)
//         await uploadBytes(fileRef, file)
//         const downloadURL = await getDownloadURL(fileRef)
//         return {
//             name: file.name,
//             url: downloadURL,
//             type: file.type,
//             size: file.size
//         }
//     }

//     const sendMessage = async () => {
//         if (!newMessage.trim() && !selectedFile) return
//         if (!authenticated) {
//             toast.error('Authentication in progress. Please wait.')
//             return
//         }

//         try {
//             setUploading(true)
//             let fileData = null
//             if (selectedFile) {
//                 fileData = await uploadFile(selectedFile)
//             }

//             const messageData = {
//                 content: newMessage.trim(),
//                 senderId: selectedRoom.adminInfo.id,
//                 senderName: selectedRoom.adminInfo.name,
//                 senderRole: selectedRoom.adminInfo.role,
//                 timestamp: serverTimestamp(),
//                 file: fileData,
//                 type: fileData ? 'file' : 'text'
//             }

//             const messagesRef = collection(db, 'chatRooms', selectedRoom.chatRoomId, 'messages')
//             await addDoc(messagesRef, messageData)

//             setNewMessage('')
//             setSelectedFile(null)
//             if (fileInputRef.current) {
//                 fileInputRef.current.value = ''
//             }
//         } catch (error) {
//             console.error('Send message error:', error)
//             toast.error('Failed to send message')
//         } finally {
//             setUploading(false)
//         }
//     }

//     const handleKeyPress = (e) => {
//         if (e.key === 'Enter' && !e.shiftKey) {
//             e.preventDefault()
//             sendMessage()
//         }
//     }

//     const formatFileSize = (bytes) => {
//         if (bytes === 0) return '0 Bytes'
//         const k = 1024
//         const sizes = ['Bytes', 'KB', 'MB', 'GB']
//         const i = Math.floor(Math.log(bytes) / Math.log(k))
//         return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
//     }

//     return (
//         <div className="space-y-4">
//             <div className="flex flex-wrap gap-2 items-center justify-between">
//                 <h1 className="text-2xl font-bold tracking-tight">Communication</h1>
//                 <Dialog
//                     open={isDialogOpen}
//                     onOpenChange={(open)=> { setIsDialogOpen(open) ; setStudentSearch('') ; setCurrentPage(1)}}>
//                     <DialogTrigger asChild>
//                         <Button onClick={() => setIsDialogOpen(true)}>
//                             <Plus className="mr-2 h-4 w-4" /> New Message
//                         </Button>
//                     </DialogTrigger>
//                     <DialogContent className="sm:max-w-[600px] max-h-[80vh]">
//                         <DialogHeader>
//                             <DialogTitle>New Message</DialogTitle>
//                             <DialogDescription>Select a student to start a new conversation.</DialogDescription>
//                         </DialogHeader>
//                          <div className="relative">
//                             <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
//                             <Input
//                                 type="search"
//                                 placeholder="Search students..."
//                                 className="pl-8 w-full"
//                                 onChange={(e)=>{setStudentSearch(e.target.value) ; setCurrentPage(1)}}
//                             />
//                           </div>
//                         <Command>
//                             <CommandList>
//                                 <CommandEmpty>No students found.</CommandEmpty>
//                                 {students.length > 0 && (
//                                     <CommandGroup heading="Students">
//                                         {students.map((student) => (
//                                             <CommandItem
//                                                 className="mb-2 cursor-pointer"
//                                                 key={student.id}
//                                                 onSelect={() => generateRoomToken(student)}>
//                                                 <div className="flex gap-2 items-center">
//                                                     <img
//                                                         src={student.profilePicture || defaultUser}
//                                                         alt={student.name}
//                                                         className="w-10 h-10 rounded-full"
//                                                     />
//                                                     <span className="text-lg">
//                                                         {student.name === 'Unnamed Student'
//                                                             ? `${student.name} (${student.email})`
//                                                             : `${student.name} (${student.email})`}
//                                                     </span>
//                                                 </div>
//                                             </CommandItem>
//                                         ))}
//                                     </CommandGroup>
//                                 )}
//                             </CommandList>
//                             {studentListPagination && studentListPagination.totalPages > 1 && (
//                                 <div className="flex justify-center mt-4 text-xs gap-2">
//                                     <Button
//                                         variant="outline"
//                                         disabled={studentListPagination.currentPage === 1}
//                                         onClick={() => setCurrentPage((p) => p - 1)}>
//                                         Previous
//                                     </Button>
//                                     <span className="px-4 py-2">
//                                         Page {studentListPagination.currentPage} of {studentListPagination.totalPages}
//                                     </span>
//                                     <Button
//                                         variant="outline"
//                                         disabled={studentListPagination.currentPage === studentListPagination.totalPages}
//                                         onClick={() => setCurrentPage((p) => p + 1)}>
//                                         Next
//                                     </Button>
//                                 </div>
//                             )}
//                         </Command>
//                     </DialogContent>
//                 </Dialog>
//             </div>

//             <Tabs defaultValue="direct">
//                 <TabsContent
//                     value="direct"
//                     className="space-y-4">
//                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[calc(100vh-200px)]">
//                         <Card className="md:col-span-1">
//                             <CardHeader className="px-4 py-3">
//                                 <div className="relative">
//                                     <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
//                                     <Input
//                                         type="search"
//                                         placeholder="Search conversations..."
//                                         className="pl-8 w-full"
//                                         onChange={(e)=>{setchatSearch(e.target.value) ; setCurrentChatpage(1)}}
//                                     />
//                                 </div>
//                             </CardHeader>
//                             <CardContent className="px-2 pb-0">
//                                 <ScrollArea className="md:h-[calc(100vh-300px)]">
//                                     {roomsLoading ? (
//                                         <div className="flex h-full items-center justify-center">
//                                                 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
//                                             </div>
//                                       ) : conversations.map((convo) => (
//                                         <div
//                                             key={convo.participants.student.id}
//                                             className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-muted ${selectedRoom.studentId === convo.participants.student.id ? 'bg-gray-300' : ''}`}
//                                             onClick={() => generateRoomToken(convo.participants.student)}>
//                                             <Avatar>
//                                                 <img
//                                                     src={convo.participants.student.profilePicture || defaultUser}
//                                                     alt={convo.participants.student.name}
//                                                     className="w-10 h-10 rounded-full"
//                                                 />
//                                             </Avatar>
//                                             <div className="flex-1 overflow-hidden">
//                                                 <h4 className="font-medium text-base truncate">
//                                                     {convo.participants.student.name === 'Unnamed Student'
//                                                         ? convo.participants.student.email
//                                                         : convo.participants.student.name}
//                                                 </h4>
//                                                <p className="text-sm text-muted-foreground truncate flex items-center justify-between">
//                                                   <span className='truncate max-w-[150px]'>
//                                                     {convo.latestMessage?.type === 'file'
//                                                       ? `file : ${convo.latestMessage?.file?.name}`
//                                                       : convo.latestMessage?.content || 'No messages yet'}
//                                                   </span>
//                                                   {convo.latestMessage?.timestamp && (
//                                                     <span className="ml-2 text-xs text-gray-500 whitespace-nowrap">
//                                                       {new Date(convo.latestMessage.timestamp._seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
//                                                     </span>
//                                                   )}
//                                                 </p>
//                                             </div>
//                                         </div>
//                                     ))}
//                                      {chatPagination && chatPagination.totalPages > 1 && (
//                                         <div className="flex justify-center mt-4 text-xs gap-2">
//                                             <Button
//                                                 variant="outline"
//                                                 disabled={chatPagination.currentPage === 1}
//                                                 onClick={() => setCurrentChatpage((p) => p - 1)}>
//                                                 Prev
//                                             </Button>
//                                             <span className="px-4 py-2">
//                                                 Page {chatPagination.currentPage} of {chatPagination.totalPages}
//                                             </span>
//                                             <Button
//                                                 variant="outline"
//                                                 disabled={chatPagination.currentPage === chatPagination.totalPages}
//                                                 onClick={() => setCurrentChatpage((p) => p + 1)}>
//                                                 Next
//                                             </Button>
//                                         </div>
//                                     )}
//                                 </ScrollArea>
//                             </CardContent>
//                         </Card>

//                         <Card className="md:col-span-2 max-h-[calc(100vh-160px)] flex flex-col">
//                             {selectedRoom.chatRoomId ? (
//                                 <>
//                                     <CardHeader className="px-4 py-3 flex flex-row items-center border-b">
//                                         <div className="flex items-center flex-1">
//                                             <Avatar className="h-8 w-8 mr-2">
//                                                 <img
//                                                     src={selectedRoom.studentInfo?.profilePicture || defaultUser}
//                                                     alt={selectedRoom.studentInfo?.name}
//                                                     className="w-8 h-8 rounded-full"
//                                                 />
//                                             </Avatar>
//                                             <div>
//                                                 <CardTitle className="text-base">{selectedRoom.studentInfo?.name ? selectedRoom.studentInfo?.name : selectedRoom.studentInfo?.email }</CardTitle>
//                                             </div>
//                                         </div>
//                                         {/* <Button
//                                             variant="ghost"
//                                             size="icon">
//                                             <MoreVertical className="h-4 w-4" />
//                                         </Button> */}
//                                     </CardHeader>

//                                     <ScrollArea className="flex-1  overflow-y-auto p-4">
//                                         {chatLoading ? (
//                                             <div className="flex h-full items-center justify-center">
//                                                 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
//                                             </div>
//                                         ) : (
//                                             <>
//                                                 {messages.map((message) => {
//                                                     const isFromUser = message.senderId === selectedRoom.adminInfo.id
//                                                     return (
//                                                         <div
//                                                             key={message.id}
//                                                             className={`flex mb-4 ${isFromUser ? 'justify-end' : 'justify-start'}`}>
//                                                             {!isFromUser && (
//                                                                 <Avatar className="h-8 w-8 mr-2 mt-1">
//                                                                     <img
//                                                                         src={selectedRoom.studentInfo?.profilePicture || defaultUser}
//                                                                         alt={selectedRoom.studentInfo?.name}
//                                                                     />
//                                                                 </Avatar>
//                                                             )}
//                                                             <div
//                                                                 className={`max-w-[80%] rounded-lg px-4 py-2 ${isFromUser ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
//                                                                 <div className="flex justify-between items-center mb-1">
//                                                                     <span className="font-medium text-xs">{isFromUser ? `${message.senderName} (you)` : message.senderName}</span>
//                                                                     <span className="text-xs opacity-70 ml-2">
//                                                                         {message.timestamp?.toLocaleTimeString([], {
//                                                                             hour: '2-digit',
//                                                                             minute: '2-digit'
//                                                                         })}
//                                                                     </span>
//                                                                 </div>
//                                                                 {message.type === 'file' && message.file ? (
//                                                                     <div className="p-2 my-1 rounded-md bg-white ">
//                                                                         {message.file.type.startsWith('image/') ? (
//                                                                             <img
//                                                                                 src={message.file.url}
//                                                                                 alt={message.file.name}
//                                                                                 className="max-w-xs max-h-48 rounded-md my-1"
//                                                                             />
//                                                                         ) : (
//                                                                             <div className="flex items-center gap-2 p-2 rounded-md bg-white text-black ">
//                                                                                 <FileText className="h-6 w-6" />
//                                                                                 <div className="flex-1">
//                                                                                     <p className="text-sm font-medium truncate">
//                                                                                         {message.file.name}
//                                                                                     </p>
//                                                                                     <p className="text-xs opacity-80">
//                                                                                         {formatFileSize(message.file.size)}
//                                                                                     </p>
//                                                                                 </div>
//                                                                                 <a
//                                                                                     href={message.file.url}
//                                                                                     target="_blank"
//                                                                                     rel="noopener noreferrer"
//                                                                                     download={message.file.name}>
//                                                                                     <Download className="h-5 w-5 cursor-pointer" />
//                                                                                 </a>
//                                                                             </div>
//                                                                         )}
//                                                                     </div>
//                                                                 ) : null}
//                                                                 {message.content && <p className="text-sm whitespace-pre-wrap">{message.content}</p>}
//                                                             </div>
//                                                         </div>
//                                                     )
//                                                 })}
//                                                 <div ref={messagesEndRef} />
//                                             </>
//                                         )}
//                                     </ScrollArea>

//                                     <CardFooter className="p-4 border-t">
//                                         <div className="flex w-full items-center gap-2">
//                                             <input
//                                                 type="file"
//                                                 ref={fileInputRef}
//                                                 onChange={handleFileSelect}
//                                                 className="hidden"
//                                             />
//                                             <Button
//                                                 variant="outline"
//                                                 size="icon"
//                                                 className="shrink-0"
//                                                 onClick={() => fileInputRef.current?.click()}
//                                                 disabled={uploading}>
//                                                 <Paperclip className="h-4 w-4" />
//                                             </Button>
//                                             <div className="flex-1 relative">
//                                                 {selectedFile && (
//                                                     <div className="absolute bottom-full left-0 w-full p-2 bg-gray-100 rounded-t-md">
//                                                         <div className="flex items-center gap-2 text-sm">
//                                                             <FileText className="h-4 w-4" />
//                                                             <span className="truncate flex-1">{selectedFile.name}</span>
//                                                             <button
//                                                                 onClick={() => setSelectedFile(null)}
//                                                                 className="font-bold">
//                                                                 X
//                                                             </button>
//                                                         </div>
//                                                     </div>
//                                                 )}
//                                                 <Textarea
//                                                     placeholder="Type your message..."
//                                                     className="min-h-10 flex-1"
//                                                     rows={1}
//                                                     value={newMessage}
//                                                     onChange={(e) => setNewMessage(e.target.value)}
//                                                     onKeyPress={handleKeyPress}
//                                                     disabled={uploading}
//                                                 />
//                                             </div>
//                                             <Button
//                                                 size="icon"
//                                                 onClick={sendMessage}
//                                                 disabled={(!newMessage.trim() && !selectedFile) || uploading}>
//                                                 {uploading ? (
//                                                     <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
//                                                 ) : (
//                                                     <Send className="h-4 w-4" />
//                                                 )}
//                                             </Button>
//                                         </div>
//                                     </CardFooter>
//                                 </>
//                             ) : (
//                                 <div className="flex h-full items-center justify-center text-muted-foreground">
//                                     Select a conversation to start messaging
//                                 </div>
//                             )}
//                         </Card>
//                     </div>
//                 </TabsContent>

//             </Tabs>
//         </div>
//     )
// }

// export default Messages



import { useEffect, useState, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import {
    collection,
    addDoc,
    query,
    orderBy,
    onSnapshot,
    serverTimestamp,
    writeBatch,
    doc
} from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { signInWithCustomToken } from 'firebase/auth'
import { db, storage, auth } from '@/lib/firebase'

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Send, Paperclip, Plus, FileText, Download } from 'lucide-react'
import { Avatar } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent } from '@/components/ui/tabs'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from '@/components/ui/dialog'
import {
    Command,
    CommandList,
    CommandEmpty,
    CommandGroup,
    CommandItem
} from '@/components/ui/command'
import {
    generateAdminToken, getAllStudents, getChatsAdmin, setAdminChatPresence,
    getStudentChatPresence
} from '@/services/chatService'
import { sendChatMessageNotificationToStudent } from '@/services/notificationService'
import defaultUser from '../../assets/defaultuser.png'
import { toast } from 'sonner'

const Messages = () => {
    const [searchParams] = useSearchParams()
    const targetStudentId = searchParams.get('studentId')

    const [loading, setLoading] = useState(false)
    const [chatLoading, setChatLoading] = useState(false)
    const [studentListPagination, setStudentListPagination] = useState({})
    const [currentPage, setCurrentPage] = useState(1)
    const [conversations, setConversations] = useState([])
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [students, setStudents] = useState([])

    const [selectedRoom, setSelectedRoom] = useState({
        firebaseToken: '',
        chatRoomId: '',
        studentId: '',
        studentInfo: null,
        adminInfo: null
    })
    const [messages, setMessages] = useState([])
    const [newMessage, setNewMessage] = useState('')
    const [selectedFile, setSelectedFile] = useState(null)
    const [uploading, setUploading] = useState(false)
    const [authenticated, setAuthenticated] = useState(false)
    const [chatPagination, setChatPagination] = useState(false)
    const [currentChatpage, setCurrentChatpage] = useState(1)
    const [chatSearch, setchatSearch] = useState('')
    const [studentSearch, setStudentSearch] = useState('')
    const [roomsLoading, setRoomsLoading] = useState(false)

    const messagesEndRef = useRef(null)
    const fileInputRef = useRef(null)

    const navigate = useNavigate()
// ✅ Presence: when admin is on messages page, mark online; on leave, mark offline
useEffect(() => {
    const setPresence = async (isOnline) => {
        try {
            await setAdminChatPresence(isOnline)
        } catch (e) {
            // don't break UI if presence fails
            console.error('Failed to set admin chat presence:', e)
        }
    }

    setPresence(true)
    return () => {
        setPresence(false)
    }
}, [])
    useEffect(() => {
        if (targetStudentId && selectedRoom.studentId === targetStudentId) {
            navigate('/admin/messages', { replace: true })
        }
    }, [selectedRoom.studentId, targetStudentId, navigate])

    useEffect(() => {
        const handleTargetStudent = async () => {
            if (targetStudentId && students.length > 0) {
                const targetStudent = students.find((student) => student.id === targetStudentId)
                if (targetStudent) {
                    await generateRoomToken(targetStudent)
                }
            }
        }
        handleTargetStudent()
    }, [targetStudentId, students])

    useEffect(() => {
        let isMounted = true
        const fetchStudents = async () => {
            try {
                setLoading(true)
                const response = await getAllStudents({ page: currentPage, search: studentSearch })
                if (isMounted && response.data?.data?.students) {
                    setStudents(response.data.data.students)
                    setStudentListPagination(response.data.data.pagination)
                }
            } catch (error) {
                if (isMounted) {
                    toast.error(error.response?.data?.message || 'Failed to fetch Students')
                }
            } finally {
                if (isMounted) setLoading(false)
            }
        }
        fetchStudents()
        return () => {
            isMounted = false
        }
    }, [currentPage, studentSearch])

    useEffect(() => {
        let isMounted = true
        const fetchAdminChats = async () => {
            try {
                setRoomsLoading(true)
                const response = await getChatsAdmin({ page: currentChatpage, search: chatSearch })
                if (isMounted && response.data?.data?.chatRooms) {
                    setConversations(response.data.data.chatRooms)
                    setChatPagination(response.data.data.pagination)
                }
            } catch (error) {
                if (isMounted) {
                    toast.error(error.response?.data?.message || 'Failed to fetch conversations')
                }
            } finally {
                if (isMounted) setRoomsLoading(false)
            }
        }
        fetchAdminChats()
        return () => {
            isMounted = false
        }
    }, [currentChatpage, chatSearch])

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    useEffect(() => {
        const authenticateUser = async () => {
            if (!selectedRoom.firebaseToken) return
            try {
                setAuthenticated(false)
                setChatLoading(true)
                await signInWithCustomToken(auth, selectedRoom.firebaseToken)
                setAuthenticated(true)
            } catch (error) {
                console.error('Firebase authentication error:', error)
                toast.error('Failed to connect to chat')
                setChatLoading(false)
            }
        }
        authenticateUser()
    }, [selectedRoom.firebaseToken])

    useEffect(() => {
        if (!authenticated || !selectedRoom.chatRoomId) return

        setChatLoading(true)
        const messagesRef = collection(db, 'chatRooms', selectedRoom.chatRoomId, 'messages')
        const q = query(messagesRef, orderBy('timestamp', 'asc'))

        const unsubscribe = onSnapshot(
            q,
            async (snapshot) => {
                const newMessages = snapshot.docs.map((docSnap) => ({
                    id: docSnap.id,
                    ...docSnap.data(),
                    timestamp: docSnap.data().timestamp?.toDate()
                }))
                setMessages(newMessages)
                setChatLoading(false)

                // --- Mark messages as read by admin in Firestore (backend state) ---
                const adminId = selectedRoom.adminInfo?.id
                if (!adminId) return

                const unreadDocs = snapshot.docs.filter((docSnap) => {
                    const data = docSnap.data()
                    return data.senderId !== adminId && data.isReadByAdmin !== true
                })

                if (unreadDocs.length > 0) {
                    try {
                        const batch = writeBatch(db)
                        unreadDocs.forEach((docSnap) => {
                            const msgRef = doc(
                                db,
                                'chatRooms',
                                selectedRoom.chatRoomId,
                                'messages',
                                docSnap.id
                            )
                            batch.update(msgRef, { isReadByAdmin: true })
                        })
                        await batch.commit()
                    } catch (err) {
                        console.error('Failed to update isReadByAdmin flags:', err)
                    }
                }
            },
            (error) => {
                console.error('Messages subscription error:', error)
                toast.error('Failed to load messages')
                setChatLoading(false)
            }
        )

        return () => unsubscribe()
    }, [authenticated, selectedRoom.chatRoomId])

    // 🔥 UPDATED: now also accepts optional chatRoomId to update left list immediately
    const generateRoomToken = async (student, chatRoomId = null) => {
        try {
            setChatLoading(true)
            const res = await generateAdminToken({ targetId: student.id })
            if (res.data.success) {
                setSelectedRoom({
                    firebaseToken: res.data.data?.firebaseToken,
                    chatRoomId: res.data.data?.chatRoomId,
                    studentId: res.data.data?.targetInfo?.id,
                    studentInfo: res.data.data?.targetInfo,
                    adminInfo: res.data.data?.userInfo
                })
                setIsDialogOpen(false)

                // 🌟 LOCAL UI UPDATE: mark this convo as read immediately
                if (chatRoomId) {
                    setConversations((prev) =>
                        prev.map((c) =>
                            c.chatRoomId === chatRoomId
                                ? {
                                    ...c,
                                    unreadCountForAdmin: 0,
                                    latestMessage: c.latestMessage
                                        ? {
                                            ...c.latestMessage,
                                            isReadByAdmin: true
                                        }
                                        : c.latestMessage
                                }
                                : c
                        )
                    )
                }
            } else {
                toast.error('Failed to generate Token')
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to generate Token')
        } finally {
            setChatLoading(false)
        }
    }

    const handleFileSelect = (event) => {
        const file = event.target.files[0]
        if (!file) return
        if (file.size > 10 * 1024 * 1024) {
            toast.error('File size must be less than 10MB')
            return
        }
        setSelectedFile(file)
    }

    const uploadFile = async (file) => {
        const fileName = `${Date.now()}_${file.name}`
        const fileRef = ref(storage, `chat-files/${selectedRoom.chatRoomId}/${fileName}`)
        await uploadBytes(fileRef, file)
        const downloadURL = await getDownloadURL(fileRef)
        return {
            name: file.name,
            url: downloadURL,
            type: file.type,
            size: file.size
        }
    }

const sendMessage = async () => {
    if (!newMessage.trim() && !selectedFile) return
    if (!authenticated) {
        toast.error('Authentication in progress. Please wait.')
        return
    }

    try {
        setUploading(true)

        const messageText = newMessage.trim()
        let fileData = null
        if (selectedFile) {
            fileData = await uploadFile(selectedFile)
        }

        const messageData = {
            content: messageText,
            senderId: selectedRoom.adminInfo.id,
            senderName: selectedRoom.adminInfo.name,
            senderRole: selectedRoom.adminInfo.role,
            timestamp: serverTimestamp(),
            file: fileData,
            type: fileData ? 'file' : 'text',
            isReadByStudent: false,
            isReadByAdmin: true
        }

        const messagesRef = collection(db, 'chatRooms', selectedRoom.chatRoomId, 'messages')
        await addDoc(messagesRef, messageData)

        // ✅ If student is not present, notify student
        try {
            if (selectedRoom.studentId) {
                const presenceRes = await getStudentChatPresence(selectedRoom.studentId)
                const isStudentOnline =
                    presenceRes?.data?.data?.isOnline ??
                    presenceRes?.data?.isOnline ??
                    false

                if (!isStudentOnline) {
                    const title = `New message from ${selectedRoom.adminInfo?.name || 'Admin'}`
                    const message = fileData
                        ? 'Sent you a file'
                        : messageText
                            ? messageText.slice(0, 160)
                            : 'Sent you a message'

                    await sendChatMessageNotificationToStudent(selectedRoom.studentId, {
                        title,
                        message
                    })
                }
            }
        } catch (notifErr) {
            console.error('Failed to notify student for chat message:', notifErr)
        }

        setNewMessage('')
        setSelectedFile(null)
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    } catch (error) {
        console.error('Send message error:', error)
        toast.error('Failed to send message')
    } finally {
        setUploading(false)
    }
}


    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            sendMessage()
        }
    }

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes'
        const k = 1024
        const sizes = ['Bytes', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap gap-2 items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">Communication</h1>
                <Dialog
                    open={isDialogOpen}
                    onOpenChange={(open) => {
                        setIsDialogOpen(open)
                        setStudentSearch('')
                        setCurrentPage(1)
                    }}>
                    <DialogTrigger asChild>
                        <Button onClick={() => setIsDialogOpen(true)}>
                            <Plus className="mr-2 h-4 w-4" /> New Message
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px] max-h-[80vh]">
                        <DialogHeader>
                            <DialogTitle>New Message</DialogTitle>
                            <DialogDescription>Select a student to start a new conversation.</DialogDescription>
                        </DialogHeader>
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Search students..."
                                className="pl-8 w-full"
                                onChange={(e) => {
                                    setStudentSearch(e.target.value)
                                    setCurrentPage(1)
                                }}
                            />
                        </div>
                        <Command>
                            <CommandList>
                                <CommandEmpty>No students found.</CommandEmpty>
                                {students.length > 0 && (
                                    <CommandGroup heading="Students">
                                        {students.map((student) => (
                                            <CommandItem
                                                className="mb-2 cursor-pointer "
                                                key={student.id}
                                                onSelect={() => generateRoomToken(student)}>
                                                <div className="flex gap-2 items-center">
                                                    <img
                                                        src={student.profilePicture || defaultUser}
                                                        alt={student.name}
                                                        className="w-10 h-10 rounded-full"
                                                    />
                                                    <span className="text-lg">
                                                        {student.name === 'Unnamed Student'
                                                            ? `${student.name} (${student.email})`
                                                            : `${student.name} (${student.email})`}
                                                    </span>
                                                </div>
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                )}
                            </CommandList>
                            {studentListPagination && studentListPagination.totalPages > 1 && (
                                <div className="flex justify-center mt-4 text-xs gap-2">
                                    <Button
                                        variant="outline"
                                        disabled={studentListPagination.currentPage === 1}
                                        onClick={() => setCurrentPage((p) => p - 1)}>
                                        Previous
                                    </Button>
                                    <span className="px-4 py-2">
                                        Page {studentListPagination.currentPage} of {studentListPagination.totalPages}
                                    </span>
                                    <Button
                                        variant="outline"
                                        disabled={studentListPagination.currentPage === studentListPagination.totalPages}
                                        onClick={() => setCurrentPage((p) => p + 1)}>
                                        Next
                                    </Button>
                                </div>
                            )}
                        </Command>
                    </DialogContent>
                </Dialog>
            </div>

            <Tabs defaultValue="direct">
                <TabsContent value="direct" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[calc(100vh-200px)]">
                        {/* LEFT: Chat list */}
                        <Card className="md:col-span-1">
                            <CardHeader className="px-4 py-3">
                                <div className="relative">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        type="search"
                                        placeholder="Search conversations..."
                                        className="pl-8 w-full"
                                        onChange={(e) => {
                                            setchatSearch(e.target.value)
                                            setCurrentChatpage(1)
                                        }}
                                    />
                                </div>
                            </CardHeader>
                            <CardContent className="px-2 pb-0">
                                <ScrollArea className="md:h-[calc(100vh-300px)]">
                                    {roomsLoading ? (
                                        <div className="flex h-full items-center justify-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                                        </div>
                                    ) : (

                                        conversations.map((convo) => {
                                            const isSelected = selectedRoom.studentId === convo.participants.student.id;
                                            const isUnread =
                                                convo.latestMessage &&
                                                convo.latestMessage.isReadByAdmin === false;

                                            return (
                                                <div
                                                    key={convo.chatRoomId}
                                                    className={[
                                                        "flex items-center gap-3 p-3 cursor-pointer",
                                                        isSelected ? "bg-gray-300" : "",
                                                        isUnread
                                                            ? "bg-primary/10 border-l-4 border-primary hover:bg-primary/20 rounded-r"
                                                            : "",
                                                    ].join(" ")}
                                                    onClick={() => generateRoomToken(convo.participants.student, convo.chatRoomId)}
                                                >
                                                    <Avatar>
                                                        <img
                                                            src={convo.participants.student.profilePicture || defaultUser}
                                                            alt={convo.participants.student.name}
                                                            className="w-10 h-10 rounded-full"
                                                        />
                                                    </Avatar>
                                                    {/* {console.log(convo)} */}
                                                    <div className="flex-1 overflow-hidden">
                                                        <h4 className="font-medium text-base truncate">
                                                            {convo.participants.student.name === "Student"
                                                                ? convo.participants.student.email
                                                                : convo.participants.student.name}
                                                        </h4>

                                                        <p className="text-sm text-muted-foreground truncate flex items-center justify-between">
                                                            <span className="truncate max-w-[150px]">
                                                                {convo.latestMessage?.type === "file"
                                                                    ? `file : ${convo.latestMessage?.file?.name}`
                                                                    : convo.latestMessage?.content || "No messages yet"}
                                                            </span>

                                                            {convo.latestMessage?.timestamp && (
                                                                <span className="ml-2 text-xs text-gray-500 whitespace-nowrap">
                                                                    {new Date(
                                                                        convo.latestMessage.timestamp._seconds * 1000
                                                                    ).toLocaleTimeString([], {
                                                                        hour: "2-digit",
                                                                        minute: "2-digit",
                                                                    })}
                                                                </span>
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })

                                    )
                                    }
                                    {chatPagination && chatPagination.totalPages > 1 && (
                                        <div className="flex justify-center mt-4 text-xs gap-2">
                                            <Button
                                                variant="outline"
                                                disabled={chatPagination.currentPage === 1}
                                                onClick={() => setCurrentChatpage((p) => p - 1)}>
                                                Prev
                                            </Button>
                                            <span className="px-4 py-2">
                                                Page {chatPagination.currentPage} of {chatPagination.totalPages}
                                            </span>
                                            <Button
                                                variant="outline"
                                                disabled={
                                                    chatPagination.currentPage === chatPagination.totalPages
                                                }
                                                onClick={() => setCurrentChatpage((p) => p + 1)}>
                                                Next
                                            </Button>
                                        </div>
                                    )}
                                </ScrollArea>
                            </CardContent>
                        </Card>

                        {/* RIGHT: Chat panel */}
                        <Card className="md:col-span-2 max-h-[calc(100vh-160px)] flex flex-col">
                            {selectedRoom.chatRoomId ? (
                                <>
                                    <CardHeader className="px-4 py-3 flex flex-row items-center border-b">
                                        <div className="flex items-center flex-1">
                                            <Avatar className="h-8 w-8 mr-2">
                                                <img
                                                    src={selectedRoom.studentInfo?.profilePicture || defaultUser}
                                                    alt={selectedRoom.studentInfo?.name}
                                                    className="w-8 h-8 rounded-full"
                                                />
                                            </Avatar>
                                            <div>
                                                <CardTitle className="text-base">
                                                    {selectedRoom.studentInfo?.name
                                                        ? selectedRoom.studentInfo?.name
                                                        : selectedRoom.studentInfo?.email}
                                                </CardTitle>
                                            </div>
                                        </div>
                                    </CardHeader>

                                    <ScrollArea className="flex-1 overflow-y-auto p-4">
                                        {chatLoading ? (
                                            <div className="flex h-full items-center justify-center">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                                            </div>
                                        ) : (
                                            <>
                                                {messages.map((message) => {
                                                    const isFromUser =
                                                        message.senderId === selectedRoom.adminInfo.id
                                                    return (
                                                        <div
                                                            key={message.id}
                                                            className={`flex mb-4 ${isFromUser
                                                                ? 'justify-end'
                                                                : 'justify-start'
                                                                }`}>
                                                            {!isFromUser && (
                                                                <Avatar className="h-8 w-8 mr-2 mt-1">
                                                                    <img
                                                                        src={
                                                                            selectedRoom.studentInfo?.profilePicture ||
                                                                            defaultUser
                                                                        }
                                                                        alt={selectedRoom.studentInfo?.name}
                                                                    />
                                                                </Avatar>
                                                            )}
                                                            <div
                                                                className={`max-w-[80%] rounded-lg px-4 py-2 ${isFromUser
                                                                    ? 'bg-primary text-primary-foreground'
                                                                    : 'bg-muted'
                                                                    }`}>
                                                                <div className="flex justify-between items-center mb-1">
                                                                    <span className="font-medium text-xs">
                                                                        {isFromUser
                                                                            ? `${message.senderName} (you)`
                                                                            : message.senderName}
                                                                    </span>
                                                                    <span className="text-xs opacity-70 ml-2">
                                                                        {message.timestamp?.toLocaleTimeString([], {
                                                                            hour: '2-digit',
                                                                            minute: '2-digit'
                                                                        })}
                                                                    </span>
                                                                </div>
                                                                {message.type === 'file' && message.file ? (
                                                                    <div className="p-2 my-1 rounded-md bg-white ">
                                                                        {message.file.type.startsWith('image/') ? (
                                                                            <img
                                                                                src={message.file.url}
                                                                                alt={message.file.name}
                                                                                className="max-w-xs max-h-48 rounded-md my-1"
                                                                            />
                                                                        ) : (
                                                                            <div className="flex items-center gap-2 p-2 rounded-md bg-white text-black ">
                                                                                <FileText className="h-6 w-6" />
                                                                                <div className="flex-1">
                                                                                    <p className="text-sm font-medium truncate">
                                                                                        {message.file.name}
                                                                                    </p>
                                                                                    <p className="text-xs opacity-80">
                                                                                        {formatFileSize(
                                                                                            message.file.size
                                                                                        )}
                                                                                    </p>
                                                                                </div>
                                                                                <a
                                                                                    href={message.file.url}
                                                                                    target="_blank"
                                                                                    rel="noopener noreferrer"
                                                                                    download={message.file.name}>
                                                                                    <Download className="h-5 w-5 cursor-pointer" />
                                                                                </a>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                ) : null}
                                                                {message.content && (
                                                                    <p className="text-sm whitespace-pre-wrap">
                                                                        {message.content}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )
                                                })}
                                                <div ref={messagesEndRef} />
                                            </>
                                        )}
                                    </ScrollArea>

                                    <CardFooter className="p-4 border-t">
                                        <div className="flex w-full items-center gap-2">
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                onChange={handleFileSelect}
                                                className="hidden"
                                            />
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="shrink-0"
                                                onClick={() => fileInputRef.current?.click()}
                                                disabled={uploading}>
                                                <Paperclip className="h-4 w-4" />
                                            </Button>
                                            <div className="flex-1 relative">
                                                {selectedFile && (
                                                    <div className="absolute bottom-full left-0 w-full p-2 bg-gray-100 rounded-t-md">
                                                        <div className="flex items-center gap-2 text-sm">
                                                            <FileText className="h-4 w-4" />
                                                            <span className="truncate flex-1">
                                                                {selectedFile.name}
                                                            </span>
                                                            <button
                                                                onClick={() => setSelectedFile(null)}
                                                                className="font-bold">
                                                                X
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                                <Textarea
                                                    placeholder="Type your message..."
                                                    className="min-h-10 flex-1"
                                                    rows={1}
                                                    value={newMessage}
                                                    onChange={(e) => setNewMessage(e.target.value)}
                                                    onKeyPress={handleKeyPress}
                                                    disabled={uploading}
                                                />
                                            </div>
                                            <Button
                                                size="icon"
                                                onClick={sendMessage}
                                                disabled={(!newMessage.trim() && !selectedFile) || uploading}>
                                                {uploading ? (
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                ) : (
                                                    <Send className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </div>
                                    </CardFooter>
                                </>
                            ) : (
                                <div className="flex h-full items-center justify-center text-muted-foreground">
                                    Select a conversation to start messaging
                                </div>
                            )}
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}

export default Messages

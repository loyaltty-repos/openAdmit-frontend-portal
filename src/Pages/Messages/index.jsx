// import { useState, useEffect, useRef } from 'react'
// import defaultUser from '../../assets/defaultuser.png'

// import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore'
// import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
// import { signInWithCustomToken } from 'firebase/auth'
// import { db, storage, auth } from '../../lib/firebase'

// import { getChatsStudents, generateStudentToken } from '../../services/chatService'

// import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
// import AppSidebar from '@/components/AppSidebar'
// import SidebarHeader from '@/components/SidebarHeader'
// import { Mic, Paperclip, Send, Smile, FileText, Download } from 'lucide-react'
// import { toast } from 'sonner'
// import { ScrollArea } from '@radix-ui/react-scroll-area'
// import { Button } from '@/components/ui/button'
// import { Avatar } from '@radix-ui/react-avatar'

// const Chat = () => {
//     const [isSidebarOpen, setIsSidebarOpen] = useState(true)

//     const [loading, setLoading] = useState(false)
//     const [chatLoading, setChatLoading] = useState(false)
//     const [uploading, setUploading] = useState(false)

//     const [conversations, setConversations] = useState([])
//     const [selectedRoom, setSelectedRoom] = useState({
//         firebaseToken: '',
//         chatRoomId: '',
//         adminId: '',
//         adminInfo: null,
//         studentInfo: null
//     })
//     const [messages, setMessages] = useState([])
//     const [newMessage, setNewMessage] = useState('')
//     const [selectedFile, setSelectedFile] = useState(null)
//     const [authenticated, setAuthenticated] = useState(false)
//     const [chatPagination, setChatPagination] = useState({})
//     const [currentChatPage, setCurrentChatPage] = useState({})

//     const messagesEndRef = useRef(null)
//     const fileInputRef = useRef(null)

//     useEffect(() => {
//         let isMounted = true
//         const fetchStudentChats = async () => {
//             try {
//                 setLoading(true)
//                 const response = await getChatsStudents({ page: currentChatPage })
//                 console.log(response)
//                 if (isMounted && response.data?.data?.chatRooms) {
//                     setConversations(response.data.data.chatRooms)
//                     setChatPagination(response.data.data.pagination)
//                 }
//                 console.log(conversations)
//             } catch (error) {
//                 if (isMounted) {
//                     toast.error(error.response?.data?.message || 'Failed to fetch conversations')
//                 }
//             } finally {
//                 if (isMounted) setLoading(false)
//             }
//         }
//         fetchStudentChats()
//         return () => {
//             isMounted = false
//         }
//     }, [currentChatPage])

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

//     const handleSelectConversation = async (admin) => {
//         if (!admin || !admin.id) {
//             toast.error('Invalid contact selected.')
//             return
//         }

//         if (selectedRoom.adminId === admin.id) return

//         try {
//             setChatLoading(true)
//             setMessages([])
//             const res = await generateStudentToken({ Data: { targetId: admin.id } })
//             if (res.data.success) {
//                 setSelectedRoom({
//                     firebaseToken: res.data.data?.firebaseToken,
//                     chatRoomId: res.data.data?.chatRoomId,
//                     adminId: res.data.data?.targetInfo?.id,
//                     adminInfo: res.data.data?.targetInfo,
//                     studentInfo: res.data.data?.userInfo
//                 })
//             } else {
//                 toast.error('Failed to initialize chat session.')
//                 setChatLoading(false)
//             }
//         } catch (error) {
//             toast.error(error.response?.data?.message || 'Failed to select conversation')
//             setChatLoading(false)
//         }
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

//     const sendMessage = async (e) => {
//         e.preventDefault()
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
//                 senderId: selectedRoom.studentInfo.id,
//                 senderName: selectedRoom.studentInfo.name,
//                 senderRole: selectedRoom.studentInfo.role,
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

//     const handleFileSelect = (event) => {
//         const file = event.target.files[0]
//         if (!file) return
//         if (file.size > 10 * 1024 * 1024) {
//             toast.error('File size must be less than 10MB')
//             return
//         }
//         setSelectedFile(file)
//     }

//     const formatFileSize = (bytes) => {
//         if (bytes === 0) return '0 Bytes'
//         const k = 1024
//         const sizes = ['Bytes', 'KB', 'MB', 'GB']
//         const i = Math.floor(Math.log(bytes) / Math.log(k))
//         return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
//     }

//     return (
//         <SidebarProvider>
//             <div className="flex min-h-screen w-full bg-gray-50">
//                 <AppSidebar isSidebarOpen={isSidebarOpen} />

//                 <SidebarInset>
//                     <SidebarHeader
//                         isOpen={isSidebarOpen}
//                         setIsOpen={setIsSidebarOpen}
//                     />

//                     <main className="flex-1 w-full overflow-hidden bg-gray-50 p-4 md:p-6">
//                         <div className="max-w-7xl mx-auto">
//                             <h1 className="text-xl font-semibold text-gray-800 mb-6">Message Center</h1>

//                             <div
//                                 className=" rounded-lg shadow-sm overflow-y-auto md:flex  gap-4"
//                                 style={{ height: 'calc(100vh - 180px)' }}>
//                                 {/* Contacts Panel */}
//                                 <div className="md:w-1/3 border-2 border-gray-200 max-md:mb-4 pb-4 rounded-xl overflow-y-auto">
//                                     <div className="p-4 border-b border-gray-100">
//                                         <h2 className="text-lg font-medium">Inbox</h2>
//                                     </div>

//                                     <div className="divide-y divide-gray-100">
//                                         {loading ? (
//                                             <div className="flex h-full items-center justify-center">
//                                                 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
//                                             </div>
//                                         ) : conversations.map((convo) => (
//                                             <div
//                                                 key={convo.chatRoomId}
//                                                 className={`flex gap-2 mx-2 rounded-lg items-center p-4 cursor-pointer hover:bg-gray-50 ${selectedRoom.adminId === convo.participants.member.id ? 'bg-gray-200' : ''}`}
//                                                 onClick={() => handleSelectConversation(convo.participants.member)}>
//                                                 <div className="flex-shrink-0">
//                                                     <img
//                                                         src={convo.participants.member.profilePicture || defaultUser}
//                                                         alt={convo.participants.member.name}
//                                                         className="h-10 w-10 rounded-full bg-gray-200 "
//                                                     />
//                                                 </div>
//                                                 <div className="flex-1 overflow-hidden">
//                                                     <h4 className="font-medium text-base truncate">
//                                                         {convo.participants.member.name === 'Unnamed Student'
//                                                             ? convo.participants.member.email
//                                                             : convo.participants.member.name}
//                                                     </h4>
//                                                     <p className="text-sm text-muted-foreground truncate flex items-center justify-between">
//                                                         <span className='truncate max-w-[150px]'>
//                                                             {convo.latestMessage?.type === 'file'
//                                                                 ? `file : ${convo.latestMessage?.file?.name}`
//                                                                 : convo.latestMessage?.content || 'No messages yet'}
//                                                         </span>
//                                                         {convo.latestMessage?.timestamp && (
//                                                             <span className="ml-2 text-xs text-gray-500 whitespace-nowrap">
//                                                                 {new Date(convo.latestMessage.timestamp._seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
//                                                             </span>
//                                                         )}
//                                                     </p>
//                                                 </div>
//                                             </div>
//                                         ))}
//                                         {chatPagination && chatPagination.totalPages > 1 && (
//                                             <div className="flex justify-center mt-4 text-xs gap-2">
//                                                 <Button
//                                                     variant="outline"
//                                                     disabled={chatPagination.currentPage === 1}
//                                                     onClick={() => setCurrentChatpage((p) => p - 1)}>
//                                                     Prev
//                                                 </Button>
//                                                 <span className="px-4 py-2">
//                                                     Page {chatPagination.currentPage} of {chatPagination.totalPages}
//                                                 </span>
//                                                 <Button
//                                                     variant="outline"
//                                                     disabled={chatPagination.currentPage === chatPagination.totalPages}
//                                                     onClick={() => setCurrentChatpage((p) => p + 1)}>
//                                                     Next
//                                                 </Button>
//                                             </div>
//                                         )}
//                                     </div>
//                                 </div>

//                                 {/* Chat Panel */}
//                                 <div className="flex-1 flex max-md:max-h-[80vh]  border-2 border-gray-200 rounded-xl flex-col">
//                                     {selectedRoom.chatRoomId ? (
//                                         <>
//                                             {/* Chat Header */}
//                                             <div className="p-4 border-b border-gray-100 flex  items-center justify-between">
//                                                 <div className="flex items-center gap-3">
//                                                     <img
//                                                         src={selectedRoom.adminInfo?.profilePicture || defaultUser}
//                                                         alt={selectedRoom.adminInfo?.name}
//                                                         className="h-8 w-8 rounded-full bg-gray-200"
//                                                     />
//                                                     <h3 className="font-semibold">{selectedRoom.adminInfo?.name}</h3>
//                                                 </div>
//                                             </div>

//                                             {/* Messages Area */}
//                                             <ScrollArea className="flex-1 overflow-y-auto p-4 space-y-4">
//                                                 {chatLoading ? (
//                                                     <div className="flex h-full items-center justify-center">
//                                                         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
//                                                     </div>
//                                                 ) : (
//                                                     <>
//                                                         {messages.map((msg) => {
//                                                             const isOutgoing = msg.senderId === selectedRoom.studentInfo.id
//                                                             return (
//                                                                 <div
//                                                                     key={msg.id}
//                                                                     className={`flex ${isOutgoing ? 'justify-end' : 'justify-start'}`}>
//                                                                     {!isOutgoing && (
//                                                                         <Avatar className="h-8 w-8 mr-2 mt-1 rounded-full overflow-hidden">
//                                                                             <img
//                                                                                 src={selectedRoom.adminInfo?.profilePicture || defaultUser}
//                                                                                 alt={selectedRoom.adminInfo?.name}
//                                                                             />
//                                                                         </Avatar>
//                                                                     )}
//                                                                     <div
//                                                                         className={`rounded-lg p-3 max-w-xs md:max-w-md ${isOutgoing ? 'bg-primary text-white' : 'bg-gray-100 text-gray-800'
//                                                                             }`}>
//                                                                         {msg.type === 'file' && msg.file ? (
//                                                                             <div className="p-2 my-1 rounded-md  bg-opacity-10">
//                                                                                 {msg.file.type.startsWith('image/') ? (
//                                                                                     <img
//                                                                                         src={msg.file.url}
//                                                                                         alt={msg.file.name}
//                                                                                         className="max-w-xs max-h-48 rounded-md my-1"
//                                                                                     />
//                                                                                 ) : (
//                                                                                     <div className="flex items-center gap-2 p-2 rounded-md bg-white text-black">
//                                                                                         <FileText className="h-6 w-6 text-gray-600 shrink-0" />

//                                                                                         <div className="flex-1 min-w-0"> {/* Key: min-w-0 allows truncation */}
//                                                                                             <p className="text-sm font-medium text-black truncate">
//                                                                                                 {msg.file.name}
//                                                                                             </p>
//                                                                                             <p className="text-xs text-gray-600 opacity-80">
//                                                                                                 {formatFileSize(msg.file.size)}
//                                                                                             </p>
//                                                                                         </div>

//                                                                                         <a
//                                                                                             href={msg.file.url}
//                                                                                             target="_blank"
//                                                                                             rel="noopener noreferrer"
//                                                                                             download={msg.file.name}
//                                                                                             className="shrink-0"
//                                                                                         >
//                                                                                             <Download className="h-5 w-5 cursor-pointer text-gray-600 hover:text-gray-800" />
//                                                                                         </a>
//                                                                                     </div>
//                                                                                 )}
//                                                                             </div>
//                                                                         ) : null}
//                                                                         {msg.content && <p className="whitespace-pre-wrap">{msg.content}</p>}
//                                                                         <p
//                                                                             className={`text-xs mt-1 text-right ${isOutgoing ? 'text-white/80' : 'text-gray-500'}`}>
//                                                                             {msg.timestamp?.toLocaleTimeString([], {
//                                                                                 hour: '2-digit',
//                                                                                 minute: '2-digit'
//                                                                             })}
//                                                                         </p>
//                                                                     </div>
//                                                                 </div>
//                                                             )
//                                                         })}
//                                                         <div ref={messagesEndRef} />
//                                                     </>
//                                                 )}
//                                             </ScrollArea>

//                                             {/* Message Input */}
//                                             <div className="border-t border-gray-100 p-4">
//                                                 <form
//                                                     onSubmit={sendMessage}
//                                                     className="flex items-center gap-2">
//                                                     <input
//                                                         type="file"
//                                                         ref={fileInputRef}
//                                                         onChange={handleFileSelect}
//                                                         className="hidden"
//                                                     />
//                                                     <button
//                                                         type="button"
//                                                         className="p-2 text-gray-400 hover:text-gray-600"
//                                                         onClick={() => fileInputRef.current?.click()}
//                                                         disabled={uploading}>
//                                                         <Paperclip className="h-5 w-5" />
//                                                     </button>
//                                                     <div className="relative flex-grow">
//                                                         {selectedFile && (
//                                                             <div className="absolute bottom-full left-0 w-full p-2 bg-gray-100 rounded-t-md text-xs">
//                                                                 <div className="flex items-center gap-2">
//                                                                     <FileText className="h-4 w-4" />
//                                                                     <span className="truncate flex-1">{selectedFile.name}</span>
//                                                                     <button
//                                                                         onClick={() => {
//                                                                             setSelectedFile(null)
//                                                                             if (fileInputRef.current) fileInputRef.current.value = ''
//                                                                         }}
//                                                                         className="font-bold text-red-500">
//                                                                         X
//                                                                     </button>
//                                                                 </div>
//                                                             </div>
//                                                         )}
//                                                         <input
//                                                             type="text"
//                                                             placeholder="Type your Message..."
//                                                             className="w-full py-2 px-4 rounded-full border border-gray-300 focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
//                                                             value={newMessage}
//                                                             onChange={(e) => setNewMessage(e.target.value)}
//                                                             disabled={uploading}
//                                                         />
//                                                     </div>
//                                                     <button
//                                                         type="submit"
//                                                         className="p-2 bg-primary text-white rounded-full hover:bg-green-700 disabled:bg-gray-400"
//                                                         disabled={(!newMessage.trim() && !selectedFile) || uploading}>
//                                                         {uploading ? (
//                                                             <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
//                                                         ) : (
//                                                             <Send className="h-5 w-5" />
//                                                         )}
//                                                     </button>
//                                                 </form>
//                                             </div>
//                                         </>
//                                     ) : (
//                                         <div className="flex h-full max-md:h-[400px] items-center justify-center text-gray-500">
//                                             Select a conversation to start messaging
//                                         </div>
//                                     )}
//                                 </div>
//                             </div>
//                         </div>
//                     </main>
//                 </SidebarInset>
//             </div>
//         </SidebarProvider>
//     )
// }

// export default Chat



import { useState, useEffect, useRef } from 'react'
import defaultUser from '../../assets/defaultuser.png'

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
import { db, storage, auth } from '../../lib/firebase'

import {
    getChatsStudents, generateStudentToken, setStudentChatPresence,
    getAdminChatPresence
} from '../../services/chatService'
import { sendChatMessageNotificationToAdmin } from '../../services/notificationService'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import AppSidebar from '@/components/AppSidebar'
import SidebarHeader from '@/components/SidebarHeader'
import { Mic, Paperclip, Send, Smile, FileText, Download } from 'lucide-react'
import { toast } from 'sonner'
import { ScrollArea } from '@radix-ui/react-scroll-area'
import { Button } from '@/components/ui/button'
import { Avatar } from '@radix-ui/react-avatar'

const Chat = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true)

    const [loading, setLoading] = useState(false)
    const [chatLoading, setChatLoading] = useState(false)
    const [uploading, setUploading] = useState(false)

    const [conversations, setConversations] = useState([])
    const [selectedRoom, setSelectedRoom] = useState({
        firebaseToken: '',
        chatRoomId: '',
        adminId: '',
        adminInfo: null,
        studentInfo: null
    })
    const [messages, setMessages] = useState([])
    const [newMessage, setNewMessage] = useState('')
    const [selectedFile, setSelectedFile] = useState(null)
    const [authenticated, setAuthenticated] = useState(false)
    const [chatPagination, setChatPagination] = useState({})
    const [currentChatPage, setCurrentChatPage] = useState(1)

    const messagesEndRef = useRef(null)
    const fileInputRef = useRef(null)
    // ✅ Presence: when student is on chat page, mark online; on leave, mark offline
    useEffect(() => {
        const setPresence = async (isOnline) => {
            try {
                await setStudentChatPresence(isOnline)
            } catch (e) {
                // no UI break if presence fails
                console.error('Failed to set student chat presence:', e)
            }
        }

        setPresence(true)
        return () => {
            setPresence(false)
        }
    }, [])
    useEffect(() => {
        let isMounted = true
        const fetchStudentChats = async () => {
            try {
                setLoading(true)
                const response = await getChatsStudents({ page: currentChatPage })
                console.log(response)
                if (isMounted && response.data?.data?.chatRooms) {
                    setConversations(response.data.data.chatRooms)
                    setChatPagination(response.data.data.pagination)
                }
                console.log(conversations)
            } catch (error) {
                if (isMounted) {
                    toast.error(error.response?.data?.message || 'Failed to fetch conversations')
                }
            } finally {
                if (isMounted) setLoading(false)
            }
        }
        fetchStudentChats()
        return () => {
            isMounted = false
        }
    }, [currentChatPage])

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
                setChatLoading(false)
            } catch (error) {
                console.error('Firebase authentication error:', error)
                toast.error('Failed to connect to chat')
                setChatLoading(false)
            }
        }
        authenticateUser()
    }, [selectedRoom.firebaseToken])

    // Listen to messages and mark them as read by student
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

                // --- Mark messages as read by student ---
                const studentId = selectedRoom.studentInfo?.id
                if (!studentId) return

                const unreadDocs = snapshot.docs.filter((docSnap) => {
                    const data = docSnap.data()
                    // consider messages not sent by this student and not yet marked as read
                    return (
                        data.senderId !== studentId &&
                        data.isReadByStudent === false
                    )
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
                            batch.update(msgRef, { isReadByStudent: true })
                        })
                        await batch.commit()
                        console.log(
                            `Marked ${unreadDocs.length} messages as read by student for room ${selectedRoom.chatRoomId}`
                        )
                    } catch (err) {
                        console.error('Failed to update isReadByStudent flags:', err)
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

    const handleSelectConversation = async (admin) => {
        if (!admin || !admin.id) {
            toast.error('Invalid contact selected.')
            return
        }

        if (selectedRoom.adminId === admin.id) return

        try {
            setChatLoading(true)
            setMessages([])
            const res = await generateStudentToken({ Data: { targetId: admin.id } })
            if (res.data.success) {
                setSelectedRoom({
                    firebaseToken: res.data.data?.firebaseToken,
                    chatRoomId: res.data.data?.chatRoomId,
                    adminId: res.data.data?.targetInfo?.id,
                    adminInfo: res.data.data?.targetInfo,
                    studentInfo: res.data.data?.userInfo
                })
            } else {
                toast.error('Failed to initialize chat session.')
                setChatLoading(false)
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to select conversation')
            setChatLoading(false)
        }
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

  const sendMessage = async (e) => {
    e.preventDefault()
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
            senderId: selectedRoom.studentInfo.id,
            senderName: selectedRoom.studentInfo.name,
            senderRole: selectedRoom.studentInfo.role,
            timestamp: serverTimestamp(),
            file: fileData,
            type: fileData ? 'file' : 'text',
            isReadByStudent: false,
            isReadByAdmin: false
        }

        const messagesRef = collection(db, 'chatRooms', selectedRoom.chatRoomId, 'messages')
        await addDoc(messagesRef, messageData)

        // ✅ If admin is not present, notify admin
        try {
            if (selectedRoom.adminId) {
                const presenceRes = await getAdminChatPresence(selectedRoom.adminId)
                const isAdminOnline =
                    presenceRes?.data?.data?.isOnline ??
                    presenceRes?.data?.isOnline ??
                    false

                if (!isAdminOnline) {
                    const title = `New message from ${selectedRoom.studentInfo?.name || 'Student'}`
                    const message = fileData
                        ? 'Sent you a file'
                        : messageText
                            ? messageText.slice(0, 160)
                            : 'Sent you a message'

                    await sendChatMessageNotificationToAdmin({
                        adminId: selectedRoom.adminId,
                        title,
                        message
                    })
                }
            }
        } catch (notifErr) {
            console.error('Failed to notify admin for chat message:', notifErr)
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

    const handleFileSelect = (event) => {
        const file = event.target.files[0]
        if (!file) return
        if (file.size > 10 * 1024 * 1024) {
            toast.error('File size must be less than 10MB')
            return
        }
        setSelectedFile(file)
    }

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes'
        const k = 1024
        const sizes = ['Bytes', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    return (
        <SidebarProvider>
            <div className="flex min-h-screen w-full bg-gray-50">
                <AppSidebar isSidebarOpen={!isSidebarOpen} />

                <SidebarInset>
                    <SidebarHeader
                        isOpen={isSidebarOpen}
                        setIsOpen={setIsSidebarOpen}
                    />

                    <main className="flex-1 w-full overflow-hidden bg-gray-50 p-4 md:p-6">
                        <div className="max-w-7xl mx-auto">
                            <h1 className="text-xl font-semibold text-gray-800 mb-6">Message Center</h1>

                            <div
                                className=" rounded-lg shadow-sm overflow-y-auto md:flex  gap-4"
                                style={{ height: 'calc(100vh - 180px)' }}>
                                {/* Contacts Panel */}
                                <div className="md:w-1/3 border-2 border-gray-200 max-md:mb-4 pb-4 rounded-xl overflow-y-auto">
                                    <div className="p-4 border-b border-gray-100">
                                        <h2 className="text-lg font-medium">Inbox</h2>
                                    </div>

                                    <div className="divide-y divide-gray-100">
                                        {loading ? (
                                            <div className="flex h-full items-center justify-center">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                                            </div>
                                        ) : conversations.map((convo) => (
                                            <div
                                                key={convo.chatRoomId}
                                                className={`flex gap-2 mx-2 rounded-lg items-center p-4 cursor-pointer hover:bg-gray-50 ${selectedRoom.adminId === convo.participants.member.id ? 'bg-gray-200' : ''}`}
                                                onClick={() => handleSelectConversation(convo.participants.member)}>
                                                <div className="flex-shrink-0">
                                                    <img
                                                        src={convo.participants.member.profilePicture || defaultUser}
                                                        alt={convo.participants.member.name}
                                                        className="h-10 w-10 rounded-full bg-gray-200 "
                                                    />
                                                </div>
                                                <div className="flex-1 overflow-hidden">
                                                    <h4 className="font-medium text-base truncate">
                                                        {convo.participants.member.name === 'Unnamed Student'
                                                            ? convo.participants.member.email
                                                            : convo.participants.member.name}
                                                    </h4>
                                                    <p className="text-sm text-muted-foreground truncate flex items-center justify-between">
                                                        <span className='truncate max-w-[150px]'>
                                                            {convo.latestMessage?.type === 'file'
                                                                ? `file : ${convo.latestMessage?.file?.name}`
                                                                : convo.latestMessage?.content || 'No messages yet'}
                                                        </span>
                                                        {convo.latestMessage?.timestamp && (
                                                            <span className="ml-2 text-xs text-gray-500 whitespace-nowrap">
                                                                {new Date(convo.latestMessage.timestamp._seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </span>
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                        {chatPagination && chatPagination.totalPages > 1 && (
                                            <div className="flex justify-center mt-4 text-xs gap-2">
                                                <Button
                                                    variant="outline"
                                                    disabled={chatPagination.currentPage === 1}
                                                    onClick={() => setCurrentChatPage((p) => p - 1)}>
                                                    Prev
                                                </Button>
                                                <span className="px-4 py-2">
                                                    Page {chatPagination.currentPage} of {chatPagination.totalPages}
                                                </span>
                                                <Button
                                                    variant="outline"
                                                    disabled={chatPagination.currentPage === chatPagination.totalPages}
                                                    onClick={() => setCurrentChatPage((p) => p + 1)}>
                                                    Next
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Chat Panel */}
                                <div className="flex-1 flex max-md:max-h-[80vh]  border-2 border-gray-200 rounded-xl flex-col">
                                    {selectedRoom.chatRoomId ? (
                                        <>
                                            {/* Chat Header */}
                                            <div className="p-4 border-b border-gray-100 flex  items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <img
                                                        src={selectedRoom.adminInfo?.profilePicture || defaultUser}
                                                        alt={selectedRoom.adminInfo?.name}
                                                        className="h-8 w-8 rounded-full bg-gray-200"
                                                    />
                                                    <h3 className="font-semibold">{selectedRoom.adminInfo?.name}</h3>
                                                </div>
                                            </div>

                                            {/* Messages Area */}
                                            <ScrollArea className="flex-1 overflow-y-auto p-4 space-y-4">
                                                {chatLoading ? (
                                                    <div className="flex h-full items-center justify-center">
                                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                                                    </div>
                                                ) : (
                                                    <>
                                                        {messages.map((msg) => {
                                                            const isOutgoing = msg.senderId === selectedRoom.studentInfo.id
                                                            return (
                                                                <div
                                                                    key={msg.id}
                                                                    className={`flex ${isOutgoing ? 'justify-end' : 'justify-start'}`}>
                                                                    {!isOutgoing && (
                                                                        <Avatar className="h-8 w-8 mr-2 mt-1 rounded-full overflow-hidden">
                                                                            <img
                                                                                src={selectedRoom.adminInfo?.profilePicture || defaultUser}
                                                                                alt={selectedRoom.adminInfo?.name}
                                                                            />
                                                                        </Avatar>
                                                                    )}
                                                                    <div
                                                                        className={`rounded-lg p-3 max-w-xs md:max-w-md ${isOutgoing ? 'bg-primary text-white' : 'bg-gray-100 text-gray-800'
                                                                            }`}>
                                                                        {msg.type === 'file' && msg.file ? (
                                                                            <div className="p-2 my-1 rounded-md  bg-opacity-10">
                                                                                {msg.file.type.startsWith('image/') ? (
                                                                                    <img
                                                                                        src={msg.file.url}
                                                                                        alt={msg.file.name}
                                                                                        className="max-w-xs max-h-48 rounded-md my-1"
                                                                                    />
                                                                                ) : (
                                                                                    <div className="flex items-center gap-2 p-2 rounded-md bg-white text-black">
                                                                                        <FileText className="h-6 w-6 text-gray-600 shrink-0" />

                                                                                        <div className="flex-1 min-w-0">
                                                                                            <p className="text-sm font-medium text-black truncate">
                                                                                                {msg.file.name}
                                                                                            </p>
                                                                                            <p className="text-xs text-gray-600 opacity-80">
                                                                                                {formatFileSize(msg.file.size)}
                                                                                            </p>
                                                                                        </div>

                                                                                        <a
                                                                                            href={msg.file.url}
                                                                                            target="_blank"
                                                                                            rel="noopener noreferrer"
                                                                                            download={msg.file.name}
                                                                                            className="shrink-0"
                                                                                        >
                                                                                            <Download className="h-5 w-5 cursor-pointer text-gray-600 hover:text-gray-800" />
                                                                                        </a>
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        ) : null}
                                                                        {msg.content && <p className="whitespace-pre-wrap">{msg.content}</p>}
                                                                        <p
                                                                            className={`text-xs mt-1 text-right ${isOutgoing ? 'text-white/80' : 'text-gray-500'}`}>
                                                                            {msg.timestamp?.toLocaleTimeString([], {
                                                                                hour: '2-digit',
                                                                                minute: '2-digit'
                                                                            })}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            )
                                                        })}
                                                        <div ref={messagesEndRef} />
                                                    </>
                                                )}
                                            </ScrollArea>

                                            {/* Message Input */}
                                            <div className="border-t border-gray-100 p-4">
                                                <form
                                                    onSubmit={sendMessage}
                                                    className="flex items-center gap-2">
                                                    <input
                                                        type="file"
                                                        ref={fileInputRef}
                                                        onChange={handleFileSelect}
                                                        className="hidden"
                                                    />
                                                    <button
                                                        type="button"
                                                        className="p-2 text-gray-400 hover:text-gray-600"
                                                        onClick={() => fileInputRef.current?.click()}
                                                        disabled={uploading}>
                                                        <Paperclip className="h-5 w-5" />
                                                    </button>
                                                    <div className="relative flex-grow">
                                                        {selectedFile && (
                                                            <div className="absolute bottom-full left-0 w-full p-2 bg-gray-100 rounded-t-md text-xs">
                                                                <div className="flex items-center gap-2">
                                                                    <FileText className="h-4 w-4" />
                                                                    <span className="truncate flex-1">{selectedFile.name}</span>
                                                                    <button
                                                                        onClick={() => {
                                                                            setSelectedFile(null)
                                                                            if (fileInputRef.current) fileInputRef.current.value = ''
                                                                        }}
                                                                        className="font-bold text-red-500">
                                                                        X
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        )}
                                                        <input
                                                            type="text"
                                                            placeholder="Type your Message..."
                                                            className="w-full py-2 px-4 rounded-full border border-gray-300 focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                                                            value={newMessage}
                                                            onChange={(e) => setNewMessage(e.target.value)}
                                                            disabled={uploading}
                                                        />
                                                    </div>
                                                    <button
                                                        type="submit"
                                                        className="p-2 bg-primary text-white rounded-full hover:bg-green-700 disabled:bg-gray-400"
                                                        disabled={(!newMessage.trim() && !selectedFile) || uploading}>
                                                        {uploading ? (
                                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                                        ) : (
                                                            <Send className="h-5 w-5" />
                                                        )}
                                                    </button>
                                                </form>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="flex h-full max-md:h-[400px] items-center justify-center text-gray-500">
                                            Select a conversation to start messaging
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </main>
                </SidebarInset>
            </div>
        </SidebarProvider>
    )
}

export default Chat

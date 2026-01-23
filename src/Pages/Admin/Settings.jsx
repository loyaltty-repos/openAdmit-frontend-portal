import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/sonner';
import { updatePassword, getCurrentUser, updateProfile, uploadFile } from '@/services/api.services';
import { logout } from '@/lib/auth';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Bell,
  Shield,
  Users,
  LogOut,
  ExternalLink,
  Check,
  Loader2,
  Plus,
  Trash2,
  Edit
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { getTeamMembers, addTeamMember, updateTeamMember, deleteTeamMember } from '@/services/teamService';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { getUser } from '@/lib/auth';

const Settings = () => {
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [editMember, setEditMember] = useState(null);
  const [user, setUser] = useState(getUser());
  const [initialFormData, setInitialFormData] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    bio: '',
    role: 'VIEWER'
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });

  const fetchMembers = async () => {
    if (user?.role !== 'ADMIN') return;

    try {
      setLoading(true);
      const response = await getTeamMembers({ page: pagination.currentPage, limit: pagination.itemsPerPage });
      setMembers(response.data.members);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching members:', error.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (user?.role === 'ADMIN') {
      fetchMembers();
    }
  }, [pagination.currentPage, user?.role]);

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        setLoading(true);
        const response = await getCurrentUser();
        const userData = response.data;
        setFormData(prev => ({ ...prev, ...userData }));
        setInitialFormData(userData); // Store initial data
      } catch (error) {
        console.error('Error loading profile:', error);
        toast.error('Failed to load profile data: ' + error.response?.data?.message);
      } finally {
        setLoading(false);
      }
    };

    loadUserProfile();
  }, []);

  useEffect(() => {
    if (user) {
      const initialData = {
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        address: user.address || '',
        bio: user.bio || '',
      };
      setFormData(initialData);
      setInitialFormData(initialData);
    }
  }, [user]);

  const checkForChanges = (fields) => {
    if (!initialFormData) return false;
    return Object.keys(fields).some(field => {
      const newValue = fields[field]?.toString()?.trim() || '';
      const initialValue = initialFormData[field]?.toString()?.trim() || '';
      return newValue !== initialValue;
    });
  };

  const handleMemberSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMember) {
        await updateTeamMember(editMember._id, formData);
      } else {
        await addTeamMember(formData);
      }
      fetchMembers();
      setAddMemberOpen(false);
      setEditMember(null);
      setFormData({ firstName: '', lastName: '', email: '', password: '', bio: '', role: 'VIEWER' });
    } catch (error) {
      console.error('Error saving member:', error);
    }
  };
  const handleDeleteMember = async (memberId) => {
    try {
      await deleteTeamMember(memberId);
      fetchMembers();
    } catch (error) {
      console.error('Error deleting member:', error);
      alert(error?.response?.data?.message || 'Cannot delete this team member');
    }
  };

  const getMemberInitials = (firstName, lastName) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE':
        return 'text-green-500 border-green-500';
      case 'INVITED':
        return 'text-amber-500 border-amber-500';
      default:
        return 'text-gray-500 border-gray-500';
    }
  };

  const getRoleBadgeStyle = (role) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-purple-500';
      case 'EDITOR':
        return 'bg-blue-500';
      case 'VIEWER':
        return 'bg-gray-500';
      default:
        return '';
    }
  };


  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
      </div>

      <Tabs defaultValue="profile">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="sm:w-64 w-full">
            <TabsList className="flex flex-col w-full h-fit space-y-1 bg-transparent p-0">
              <TabsTrigger value="profile" className="justify-start w-full">
                <User className="mr-2 h-4 w-4" /> Profile
              </TabsTrigger>
              <TabsTrigger value="notifications" className="justify-start w-full">
                <Bell className="mr-2 h-4 w-4" /> Notifications
              </TabsTrigger>
              <TabsTrigger value="security" className="justify-start w-full">
                <Shield className="mr-2 h-4 w-4" /> Security
              </TabsTrigger>
              {user?.role === 'ADMIN' && (
                <TabsTrigger value="team" className="justify-start w-full">
                  <Users className="mr-2 h-4 w-4" /> Team Members
                </TabsTrigger>
              )}
              <TabsTrigger value="integrations" className="justify-start w-full">
                <ExternalLink className="mr-2 h-4 w-4" /> Integrations
              </TabsTrigger>
            </TabsList>            
            <Separator className="my-4" />
            <Button 
              variant="outline" 
              className="w-full justify-start text-destructive hover:text-destructive" 
              onClick={() => {
                logout();
                navigate('/admin/login');
              }}
            >
              <LogOut className="mr-2 h-4 w-4" /> Log Out
            </Button>
          </div>

          <div className="flex-1">
            <div className="space-y-4">
              <TabsContent value="profile">
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>
                      Update your personal information and profile settings
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                      <Avatar className="w-16 h-16">
                        <AvatarImage src={user?.profilePicture || ''} />
                        <AvatarFallback className="text-lg">{getMemberInitials(user?.firstName, user?.lastName)}</AvatarFallback>
                      </Avatar>
                      <div className="space-y-1">
                        <h3 className="font-medium">Profile Picture</h3>
                        <p className="text-sm text-muted-foreground">
                          Upload a picture to personalize your account
                        </p>
                        <div className="flex gap-2 mt-2">
                          <input
                            type="file"
                            id="profile-image"
                            accept="image/*"
                            className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;

                              try {
                                setLoading(true);
                                const formData = new FormData();
                                formData.append('file', file);
                                formData.append('category', 'profile');

                                const response = await uploadFile(formData);
                                if (!response.success) {
                                  throw new Error(response.message || 'Failed to upload image');
                                }

                                await updateProfile({
                                  profilePicture: response.data.url
                                });

                                const localUser = getUser();
                                localStorage.setItem('user', JSON.stringify({
                                  ...localUser,
                                  profilePicture: response.data.url
                                }));

                                toast.success('Profile picture updated successfully');
                                window.location.reload();
                              } catch (error) {
                                console.error('Error uploading profile picture:', error);
                                toast.error(error?.response?.data?.message || 'Failed to update profile picture');
                              } finally {
                                setLoading(false);
                              }
                            }}
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => document.getElementById('profile-image').click()}
                            disabled={loading}
                          >
                            {loading ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Uploading...
                              </>
                            ) : (
                              'Change'
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-destructive"
                            onClick={async () => {
                              try {
                                setLoading(true);
                                await updateProfile({
                                  profilePicture: ''
                                });

                                const localUser = getUser();
                                localStorage.setItem('user', JSON.stringify({
                                  ...localUser,
                                  profilePicture: ''
                                }));

                                toast.success('Profile picture removed');
                                window.location.reload();
                              } catch (error) {
                                console.error('Error removing profile picture:', error);
                                toast.error('Failed to remove profile picture: ' + error.response?.data?.message);
                              } finally {
                                setLoading(false);
                              }
                            }}
                            disabled={loading || !user?.profilePicture}
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    </div>
                    <Separator />
                    <form onChange={(e) => {
                      const formData = new FormData(e.target.form);
                      const fields = {};
                      ['firstName', 'lastName', 'phone', 'address', 'bio'].forEach(field => {
                        fields[field] = formData.get(field)?.trim() || '';
                      });
                      const hasChanges = checkForChanges(fields);
                      setHasChanges(hasChanges);
                    }} onSubmit={async (e) => {
                      e.preventDefault();
                      e.stopPropagation();

                      if (loading) return;
                      setLoading(true);
                      try {
                        const formData = new FormData(e.target);
                        const updateData = {};
                        const fields = ['firstName', 'lastName', 'phone', 'address', 'bio'];

                        fields.forEach(field => {
                          const value = formData.get(field);
                          if (value && value.trim()) {
                            updateData[field] = value.trim();
                          }
                        }); if (Object.keys(updateData).length === 0) {
                          toast.error('Please update at least one field');
                          setLoading(false);
                          return;
                        }


                        const { firstName, lastName } = updateData;
                        if (firstName && firstName.length < 2) {
                          toast.error('First name must be at least 2 characters');
                          setLoading(false);
                          return;
                        }
                        if (lastName && lastName.length < 2) {
                          toast.error('Last name must be at least 2 characters');
                          setLoading(false);
                          return;
                        }

                        const response = await updateProfile(updateData);

                        if (response.success) {

                          const updatedUserData = response.data;
                          setFormData(prev => ({ ...prev, ...updatedUserData }));


                          setUser(prev => ({ ...prev, ...updatedUserData }));


                          const localUser = getUser();
                          localStorage.setItem('user', JSON.stringify({
                            ...localUser,
                            ...updatedUserData
                          }));

                          toast.success('Profile updated successfully');
                        } else {
                          throw new Error(response.message || 'Failed to update profile');
                        }
                      } catch (error) {
                        console.error('Profile update error:', error);
                        toast.error(error?.response?.data?.message || 'Failed to update profile');
                      } finally {
                        setLoading(false);
                      }
                    }}>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">First Name</Label>
                          <Input
                            id="firstName"
                            name="firstName"
                            defaultValue={user?.firstName}
                            onChange={(e) => {
                              setFormData({ ...formData, firstName: e.target.value });
                              setHasChanges(checkForChanges({ ...formData, firstName: e.target.value }));
                            }}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Last Name</Label>
                          <Input
                            id="lastName"
                            name="lastName"
                            defaultValue={user?.lastName}
                            onChange={(e) => {
                              setFormData({ ...formData, lastName: e.target.value });
                              setHasChanges(checkForChanges({ ...formData, lastName: e.target.value }));
                            }}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            defaultValue={user?.email}
                            disabled
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone Number</Label>
                          <Input
                            id="phone"
                            name="phone"
                            type="tel"
                            defaultValue={user?.phone || ''}
                            placeholder="+1234567890"
                            onChange={(e) => {
                              setFormData({ ...formData, phone: e.target.value });
                              setHasChanges(checkForChanges({ ...formData, phone: e.target.value }));
                            }}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="address">Address</Label>
                          <Input
                            id="address"
                            name="address"
                            defaultValue={user?.address || ''}
                            placeholder="Your address"
                            onChange={(e) => {
                              setFormData({ ...formData, address: e.target.value });
                              setHasChanges(checkForChanges({ ...formData, address: e.target.value }));
                            }}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="bio">Bio</Label>
                          <Input
                            id="bio"
                            name="bio"
                            defaultValue={user?.bio || ''}
                            placeholder="Tell us about yourself"
                            onChange={(e) => {
                              setFormData({ ...formData, bio: e.target.value });
                              setHasChanges(checkForChanges({ ...formData, bio: e.target.value }));
                            }}
                          />
                        </div>
                      </div>                        <div className="mt-6 flex justify-end">
                        <Button
                          type="submit"
                          className={`hover:cursor-pointer transition-colors ${hasChanges ? 'hover:bg-primary/90' : ''}`}
                          variant="default"
                          disabled={loading || !hasChanges}
                        >
                          {loading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            'Save Changes'
                          )}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>


              <TabsContent value="notifications">
                <Card>
                  <CardHeader>
                    <CardTitle>Notification Preferences</CardTitle>
                    <CardDescription>
                      Manage how and when you receive notifications
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium">Email Notifications</h3>
                      <div className="grid gap-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="email-new-applications" className="text-sm font-normal">
                              New Application Submissions
                            </Label>
                            <p className="text-xs text-muted-foreground">
                              Receive notifications when students submit new applications
                            </p>
                          </div>
                          <Switch id="email-new-applications" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="email-document-uploads" className="text-sm font-normal">
                              Document Uploads
                            </Label>
                            <p className="text-xs text-muted-foreground">
                              Get notified when students upload new documents
                            </p>
                          </div>
                          <Switch id="email-document-uploads" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="email-task-completion" className="text-sm font-normal">
                              Task Completions
                            </Label>
                            <p className="text-xs text-muted-foreground">
                              Get notified when tasks are completed
                            </p>
                          </div>
                          <Switch id="email-task-completion" />
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h3 className="text-sm font-medium">In-App Notifications</h3>
                      <div className="grid gap-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="app-messages" className="text-sm font-normal">
                              New Messages
                            </Label>
                            <p className="text-xs text-muted-foreground">
                              Show notifications for new messages and chats
                            </p>
                          </div>
                          <Switch id="app-messages" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="app-deadlines" className="text-sm font-normal">
                              Approaching Deadlines
                            </Label>
                            <p className="text-xs text-muted-foreground">
                              Show alerts for upcoming application deadlines
                            </p>
                          </div>
                          <Switch id="app-deadlines" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="app-system" className="text-sm font-normal">
                              System Updates
                            </Label>
                            <p className="text-xs text-muted-foreground">
                              Get notified about system maintenance and updates
                            </p>
                          </div>
                          <Switch id="app-system" />
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Notification Delivery</h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="notification-summary">Daily Summary</Label>
                          <Select defaultValue="end-of-day">
                            <SelectTrigger id="notification-summary">
                              <SelectValue placeholder="Select timing" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">Don&apos;t send summary</SelectItem>
                              <SelectItem value="morning">Morning (8 AM)</SelectItem>
                              <SelectItem value="afternoon">Afternoon (2 PM)</SelectItem>
                              <SelectItem value="end-of-day">End of Day (6 PM)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end">
                    <Button>Save Preferences</Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              <TabsContent value="security">
                <Card>
                  <CardHeader>
                    <CardTitle>Security Settings</CardTitle>
                    <CardDescription>
                      Update your password
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <form onSubmit={async (e) => {
                      e.preventDefault();
                      const formData = new FormData(e.target);
                      const oldPassword = formData.get('oldPassword');
                      const newPassword = formData.get('newPassword');
                      const confirmPassword = formData.get('confirmPassword');

                      if (newPassword !== confirmPassword) {
                        toast.error('New passwords do not match');
                        return;
                      }

                      try {
                        await updatePassword({
                          oldPassword,
                          newPassword,
                          confirmPassword
                        });
                        toast.success('Password updated successfully');
                        e.target.reset();
                      } catch (error) {
                        toast.error(error?.response?.data?.message || 'Failed to update password');
                      }
                    }}>
                      <div className="space-y-4">
                        <div className="grid gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="oldPassword">Current Password</Label>
                            <Input id="oldPassword" name="oldPassword" type="password" required />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="newPassword">New Password</Label>
                            <Input id="newPassword" name="newPassword" type="password" required minLength={6} />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm New Password</Label>
                            <Input id="confirmPassword" name="confirmPassword" type="password" required minLength={6} />
                          </div>
                          <Button type="submit" className="w-fit">Update Password</Button>
                        </div>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="team">
                {user?.role === 'ADMIN' && (
                  <div className="space-y-4">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0">
                        <div>
                          <CardTitle>Team Members</CardTitle>
                          <CardDescription>
                            Manage team access and permissions
                          </CardDescription>
                        </div>
                        <Dialog open={addMemberOpen} onOpenChange={setAddMemberOpen}>
                          <DialogTrigger asChild>
                            <Button onClick={() => {
                              setEditMember(null);
                              setFormData({ firstName: '', lastName: '', email: '', password: '', bio: '', role: 'VIEWER' });
                            }}>
                              <Plus className="mr-2 h-4 w-4" />
                              Add Member
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>{editMember ? 'Edit Member' : 'Add New Member'}</DialogTitle>
                              <DialogDescription>
                                {editMember ? 'Update member information and role.' : 'Add a new team member and set their role.'}
                              </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleMemberSubmit} className="space-y-4">
                              <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="firstName">First Name</Label>
                                    <Input
                                      id="firstName"
                                      value={formData.firstName}
                                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                      required
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="lastName">Last Name</Label>
                                    <Input
                                      id="lastName"
                                      value={formData.lastName}
                                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                      required
                                    />
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="email">Email</Label>
                                  <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                  />
                                </div>
                                {!editMember && (
                                  <div className="space-y-2">
                                    <Label htmlFor="password">Password</Label>
                                    <Input
                                      id="password"
                                      type="password"
                                      value={formData.password}
                                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                      required
                                    />
                                  </div>
                                )}
                                <div className="space-y-2">
                                  <Label htmlFor="bio">Bio</Label>
                                  <Input
                                    id="bio"
                                    value={formData.bio}
                                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="role">Role</Label>
                                  <Select
                                    value={formData.role}
                                    onValueChange={(value) => setFormData({ ...formData, role: value })}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select a role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="ADMIN">Admin</SelectItem>
                                      <SelectItem value="EDITOR">Editor</SelectItem>
                                      <SelectItem value="VIEWER">Viewer</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                              <DialogFooter>
                                <Button type="submit">{editMember ? 'Update' : 'Add'} Member</Button>
                              </DialogFooter>
                            </form>
                          </DialogContent>
                        </Dialog>
                      </CardHeader>
                      <CardContent>
                        {loading ? (
                          <div className="flex justify-center items-center p-8">
                            <Loader2 className="h-8 w-8 animate-spin" />
                          </div>
                        ) : (
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {members.map((member) => (
                                <TableRow key={member._id}>
                                  <TableCell className="flex items-center gap-2">
                                    <Avatar className="h-8 w-8">
                                      {member.profilePicture ? (
                                        <AvatarImage src={member.profilePicture} />
                                      ) : null}
                                      <AvatarFallback>{getMemberInitials(member.firstName, member.lastName)}</AvatarFallback>
                                    </Avatar>
                                    <span className="font-medium">{member.firstName} {member.lastName}</span>
                                  </TableCell>
                                  <TableCell>{member.email}</TableCell>
                                  <TableCell>
                                    <Badge className={getRoleBadgeStyle(member.role)}>{member.role}</Badge>
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant="outline" className={getStatusColor(member.status)}>
                                      {member.status}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-right space-x-2">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        setEditMember(member);
                                        setFormData({
                                          firstName: member.firstName,
                                          lastName: member.lastName,
                                          email: member.email,
                                          bio: member.bio || '',
                                          role: member.role
                                        });
                                        setAddMemberOpen(true);
                                      }}
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>                                  <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-destructive"
                                      onClick={() => handleDeleteMember(member._id)}
                                      disabled={member.role === 'ADMIN'}
                                      title={member.role === 'ADMIN' ? 'Admin members cannot be deleted' : 'Delete member'}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        )}
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle>Role Permissions</CardTitle>
                        <CardDescription>
                          Define access levels for different user roles
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Permission</TableHead>
                              <TableHead className="text-center">Admin</TableHead>
                              <TableHead className="text-center">Editor</TableHead>
                              <TableHead className="text-center">Viewer</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <TableRow>
                              <TableCell className="font-medium">View Dashboard</TableCell>
                              <TableCell className="text-center"><Check className="mx-auto h-4 w-4 text-green-500" /></TableCell>
                              <TableCell className="text-center"><Check className="mx-auto h-4 w-4 text-green-500" /></TableCell>
                              <TableCell className="text-center"><Check className="mx-auto h-4 w-4 text-green-500" /></TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium">Edit Student Profiles</TableCell>
                              <TableCell className="text-center"><Check className="mx-auto h-4 w-4 text-green-500" /></TableCell>
                              <TableCell className="text-center"><Check className="mx-auto h-4 w-4 text-green-500" /></TableCell>
                              <TableCell className="text-center">-</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium">Manage Users</TableCell>
                              <TableCell className="text-center"><Check className="mx-auto h-4 w-4 text-green-500" /></TableCell>
                              <TableCell className="text-center">-</TableCell>
                              <TableCell className="text-center">-</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium">View Reports</TableCell>
                              <TableCell className="text-center"><Check className="mx-auto h-4 w-4 text-green-500" /></TableCell>
                              <TableCell className="text-center"><Check className="mx-auto h-4 w-4 text-green-500" /></TableCell>
                              <TableCell className="text-center">-</TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </TabsContent>

              {/* Integrations tab */}
              <TabsContent value="integrations">
                <Card>
                  <CardHeader>
                    <CardTitle>Integrations</CardTitle>
                    <CardDescription>
                      Connect with external services and applications
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Configure your integrations here.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </div>
        </div>
      </Tabs>
    </div>
  );
};

export default Settings;
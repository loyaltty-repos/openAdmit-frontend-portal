import { useState, useEffect, useCallback } from 'react';
import { getUser } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Edit, Plus, FilePlus, Trash2 } from 'lucide-react';
import { toast } from "sonner";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { getCategories, getFaqs, createCategory, createFaq, updateFaq, deleteFaq, deleteCategory, updateCategory } from '../../services/api.services';

const FAQs = () => {
  const [categories, setCategories] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [faqCategories, setFaqCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isNewCategoryModalOpen, setIsNewCategoryModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    categoryId: ''
  });
  const [newCategory, setNewCategory] = useState({
    name: '',
    description: ''
  });
  const [editingCategory, setEditingCategory] = useState(null);
  const [isEditCategoryModalOpen, setIsEditCategoryModalOpen] = useState(false);
  const [editCategoryForm, setEditCategoryForm] = useState({
    name: '',
    description: ''
  });
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [categoriesRes, faqsRes] = await Promise.all([
        getCategories(),
        getFaqs(selectedCategory !== 'all' ? selectedCategory : null)
      ]);

      if (categoriesRes.success) {
        setCategories(categoriesRes.data);
      }

      if (faqsRes.success) {
        if (selectedCategory !== 'all') {
          setFaqs(faqsRes.data);
        } else {
          const allFaqs = faqsRes.data.flatMap(category =>
            category.faqs.map(faq => ({
              ...faq,
              categoryName: category.category.name
            }))
          );
          setFaqs(allFaqs);
          const processedCategories = categoriesRes.data.map(category => {
            const categoryData = faqsRes.data.find(c => c._id === category._id);
            return {
              id: category._id,
              name: category.name,
              count: categoryData?.faqs?.length || 0
            };
          });
          setFaqCategories(processedCategories);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory]);
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddFaq = async (e) => {
    e.preventDefault();
    try {
      const response = await createFaq(formData);
      if (response.success) {
        await fetchData();
        setIsAddModalOpen(false);
        setFormData({ question: '', answer: '', categoryId: '' });
        toast.success("FAQ added successfully");
      }
    } catch (error) {
      console.error('Error adding FAQ:', error);
      toast.error(error.response?.data?.message || "Failed to add FAQ");
    }
  };

  const handleEditFaq = async (e) => {
    e.preventDefault();
    try {
      const response = await updateFaq(editingFaq._id, formData);
      if (response.success) {
        await fetchData();
        setIsEditModalOpen(false);
        setEditingFaq(null);
        setFormData({ question: '', answer: '', categoryId: '' });
        toast.success("FAQ updated successfully");
      }
    } catch (error) {
      console.error('Error updating FAQ:', error);
      toast.error(error.response?.data?.message || "Failed to update FAQ");
    }
  };

  const handleDeleteFaq = async (faqId) => {
    if (window.confirm('Are you sure you want to delete this FAQ?')) {
      try {
        const response = await deleteFaq(faqId);
        if (response.success) {
          await fetchData();
          toast.success("FAQ deleted successfully");
        }
      } catch (error) {
        console.error('Error deleting FAQ:', error);
        toast.error(error.response?.data?.message || "Failed to delete FAQ");
      }
    }
  };
  const handleAddCategory = async (e) => {
    e.preventDefault();
    try {
      const response = await createCategory(newCategory);
      if (response.success) {
        await fetchData();
        setIsNewCategoryModalOpen(false);
        setNewCategory({ name: '', description: '' });
        toast.success("Category added successfully");
      }
    } catch (error) {
      console.error('Error adding category:', error);
      toast.error(error.response?.data?.message || "Failed to add category");
    }
  };

  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    try {
      const response = await updateCategory(editingCategory._id, editCategoryForm);
      if (response.success) {
        await fetchData();
        setIsEditCategoryModalOpen(false);
        setEditingCategory(null);
        setEditCategoryForm({ name: '', description: '' });
        toast.success("Category updated successfully");
      }
    } catch (error) {
      console.error('Error updating category:', error);
      toast.error(error.response?.data?.message || "Failed to update category");
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category? All associated FAQs will also be deleted.')) {
      try {
        const response = await deleteCategory(categoryId);
        if (response.success) {
          await fetchData();
          toast.success("Category and associated FAQs deleted successfully");
        }
      } catch (error) {
        console.error('Error deleting category:', error);
        toast.error(error.response?.data?.message || "Failed to delete category");
      }
    }
  };

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = searchQuery.toLowerCase() === '' ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || faq.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const knowledgeArticles = [
    {
      id: 1,
      title: 'Complete Guide to the Common Application',
      description: 'A comprehensive walkthrough of the Common Application platform used by many US universities.',
      category: 'application',
      dateUpdated: '2023-09-15'
    },
    {
      id: 2,
      title: 'Writing an Effective Statement of Purpose',
      description: 'Tips and strategies for crafting a compelling statement of purpose that stands out to admissions committees.',
      category: 'application',
      dateUpdated: '2023-09-20'
    },
    {
      id: 3,
      title: 'Navigating F1 Visa Interview Questions',
      description: 'Common questions asked in F1 visa interviews and how to prepare effective answers.',
      category: 'visa',
      dateUpdated: '2023-08-30'
    },
    {
      id: 4,
      title: 'Understanding Financial Aid Options for International Students',
      description: 'A breakdown of scholarships, grants, and loan opportunities available to international students.',
      category: 'financial',
      dateUpdated: '2023-09-05'
    },
    {
      id: 5,
      title: 'How to Obtain Official Academic Transcripts',
      description: 'Step-by-step process for requesting and securing official academic transcripts from your institutions.',
      category: 'documents',
      dateUpdated: '2023-08-25'
    }
  ];

  const hasEditPermission = () => {
    const currentUser = getUser();
    return currentUser && (currentUser.role === 'ADMIN' || currentUser.role === 'EDITOR');
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">FAQs & Knowledge Base</h1>
        {hasEditPermission() && (
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" className="cursor-pointer" onClick={() => setIsNewCategoryModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Add Category
            </Button>
            <Button className="cursor-pointer" onClick={() => setIsAddModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Add FAQ
            </Button>
            <Button className="cursor-pointer">
              <FilePlus className="mr-2 h-4 w-4" /> New Article
            </Button>
          </div>
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search FAQs and articles..."
          className="pl-8 w-full"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <Tabs defaultValue="faqs">
        <TabsList>
          <TabsTrigger value="faqs">FAQs</TabsTrigger>
          <TabsTrigger value="knowledge">Knowledge Base</TabsTrigger>
        </TabsList>

        <TabsContent value="faqs" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle className="text-lg">Categories</CardTitle>
              </CardHeader>
              <CardContent className="p-3">
                <ScrollArea className="h-[calc(100vh-300px)]">
                  <div className="space-y-2">
                    <div
                      className={`flex items-center justify-between rounded-md px-3 py-2 ${selectedCategory === 'all' ? 'bg-muted' : ''
                        } cursor-pointer`}
                      onClick={() => setSelectedCategory('all')}
                    >
                      <span>All Categories</span>
                      <Badge variant="secondary">{faqs.length}</Badge>
                    </div>
                    {categories.map((category) => (
                      <div
                        key={category._id}
                        className={`flex items-center justify-between rounded-md px-3 py-2 ${selectedCategory === category._id ? 'bg-muted' : ''
                          } hover:bg-muted cursor-pointer`}
                        onClick={() => setSelectedCategory(category._id)}
                      >
                        <span>{category.name}</span>                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            {faqCategories.find(c => c.id === category._id)?.count || 0}
                          </Badge>
                          {hasEditPermission() && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingCategory(category);
                                  setEditCategoryForm({
                                    name: category.name,
                                    description: category.description || ''
                                  });
                                  setIsEditCategoryModalOpen(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteCategory(category._id);
                                }}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card className="md:col-span-3">
              <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
                <CardDescription>
                  Manage FAQs for students about studying abroad
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">Loading FAQs...</div>
                ) : filteredFaqs.length === 0 ? (
                  <div className="text-center py-8">No FAQs found</div>
                ) : (
                  <Accordion type="single" collapsible className="w-full">
                    {filteredFaqs.map((faq) => (
                      <AccordionItem key={faq._id} value={faq._id}>
                        <div className="flex items-center justify-between">
                          <AccordionTrigger className="text-left flex-1">
                            {faq.question}
                          </AccordionTrigger>
                          {hasEditPermission() && (
                            <div className="flex gap-2 mr-4">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingFaq(faq);
                                  setFormData({
                                    question: faq.question,
                                    answer: faq.answer,
                                    categoryId: faq.categoryId
                                  });
                                  setIsEditModalOpen(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteFaq(faq._id);
                                }}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          )}
                        </div>
                        <AccordionContent className="text-muted-foreground">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="knowledge" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle className="text-lg">Categories</CardTitle>
              </CardHeader>
              <CardContent className="p-3">
                <ScrollArea className="h-[calc(100vh-300px)]">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between rounded-md px-3 py-2 bg-muted font-medium cursor-pointer">
                      <span>All Categories</span>
                      <Badge variant="secondary">{faqCategories.reduce((acc, cat) => acc + cat.count, 0)}</Badge>
                    </div>
                    {faqCategories.map((category) => (
                      <div
                        key={category.id}
                        className="flex items-center justify-between rounded-md px-3 py-2 hover:bg-muted cursor-pointer"
                      >
                        <span>{category.name}</span>
                        <Badge variant="outline">{category.count}</Badge>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card className="md:col-span-3">
              <CardHeader>
                <CardTitle>Knowledge Base Articles</CardTitle>
                <CardDescription>
                  In-depth guides and resources for students and advisors
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {knowledgeArticles.map((article) => (
                    <Card key={article.id} className="overflow-hidden">
                      <CardContent className="p-0">
                        <div className="p-6">
                          <div className="flex items-center justify-between mb-2">
                            <Badge variant="outline">{article.category}</Badge>
                            <span className="text-xs text-muted-foreground">
                              Updated: {article.dateUpdated}
                            </span>
                          </div>
                          <h3 className="text-lg font-semibold mb-2">{article.title}</h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            {article.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <Button variant="outline" size="sm">Read More</Button>
                            <Button variant="ghost" size="icon">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={isNewCategoryModalOpen} onOpenChange={setIsNewCategoryModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Category</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddCategory} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Category Name</label>
              <Input
                value={newCategory.name}
                onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))
                }
                placeholder="Enter category name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <Input
                value={newCategory.description}
                onChange={(e) => setNewCategory(prev => ({ ...prev, description: e.target.value }))
                }
                placeholder="Enter category description"
              />
            </div>
            <DialogFooter>
              <Button type="submit">Add Category</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New FAQ</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddFaq} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))
                }
                className="w-full px-3 py-2 border rounded-md"
                required
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Question</label>
              <Input
                value={formData.question}
                onChange={(e) => setFormData(prev => ({ ...prev, question: e.target.value }))
                }
                placeholder="Enter FAQ question"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Answer</label>
              <textarea
                value={formData.answer}
                onChange={(e) => setFormData(prev => ({ ...prev, answer: e.target.value }))
                }
                placeholder="Enter FAQ answer"
                className="w-full px-3 py-2 border rounded-md min-h-[100px]"
                required
              />
            </div>
            <DialogFooter>
              <Button type="submit">Add FAQ</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit FAQ</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditFaq} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))
                }
                className="w-full px-3 py-2 border rounded-md"
                required
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Question</label>
              <Input
                value={formData.question}
                onChange={(e) => setFormData(prev => ({ ...prev, question: e.target.value }))
                }
                placeholder="Enter FAQ question"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Answer</label>
              <textarea
                value={formData.answer}
                onChange={(e) => setFormData(prev => ({ ...prev, answer: e.target.value }))
                }
                placeholder="Enter FAQ answer"
                className="w-full px-3 py-2 border rounded-md min-h-[100px]"
                required
              />
            </div>
            <DialogFooter>
              <Button type="submit">Update FAQ</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditCategoryModalOpen} onOpenChange={setIsEditCategoryModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateCategory} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Category Name</label>
              <Input
                value={editCategoryForm.name}
                onChange={(e) => setEditCategoryForm(prev => ({ ...prev, name: e.target.value }))
                }
                placeholder="Enter category name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <Input
                value={editCategoryForm.description}
                onChange={(e) => setEditCategoryForm(prev => ({ ...prev, description: e.target.value }))
                }
                placeholder="Enter category description"
              />
            </div>
            <DialogFooter>
              <Button type="submit">Update Category</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FAQs;

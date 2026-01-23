import { useState, useEffect } from 'react';
import { Search, ChevronDown, ChevronUp } from 'lucide-react';
import { SidebarProvider, SidebarInset } from '../../components/ui/sidebar';
import AppSidebar from '../../components/AppSidebar';
import SidebarHeader from '../../components/SidebarHeader';

const FAQ = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [faqData, setFaqData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openItems, setOpenItems] = useState({});
  const [openCategories, setOpenCategories] = useState({});

  useEffect(() => {
    const timer = setTimeout(() => {
      setFaqData(mockFaqData);
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const toggleItem = (itemId) => {
    setOpenItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };


  const toggleCategory = (categoryId) => {
    const newOpenState = !openCategories[categoryId];
    
    setOpenCategories(prev => ({
      ...prev,
      [categoryId]: newOpenState
    }));
    
    const category = faqData.find(cat => cat._id === categoryId);
    if (!category) return;
    
    const updatedOpenItems = { ...openItems };
    category.faqs.forEach(faq => {
      updatedOpenItems[faq._id] = newOpenState;
    });
    
    setOpenItems(updatedOpenItems);
  };

  const filteredFAQs = searchQuery.trim() === '' 
    ? faqData 
    : faqData.map(category => ({
        ...category,
        faqs: category.faqs.filter(faq => 
          faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
        )
      })).filter(category => category.faqs.length > 0);

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gray-50">
        <AppSidebar isSidebarOpen={isSidebarOpen} />
        
        <SidebarInset>
          <SidebarHeader isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
          
          <main className="flex-1 w-full overflow-x-hidden overflow-y-auto bg-gray-50 p-4 pt-8 md:p-6 md:pt-10">
            <div className="w-full mx-auto">
              <div className="p-6">
                <h1 className="text-2xl font-bold text-primary mb-6">FAQs</h1>
                
                {/* Search Bar - Left aligned */}
                <div className="relative mb-6 max-w-md bg-white">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 " />
                  <input
                    type="text"
                    placeholder="Search your question here"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-md focus:outline-none text-gray-700"
                  />
                </div>

                {isLoading ? (
                  <div className="py-10 text-center">
                    <p>Loading FAQs...</p>
                  </div>
                ) : filteredFAQs.length === 0 ? (
                  <div className="py-10 text-center">
                    <p>No FAQs found matching your search</p>
                  </div>
                ) : (
                  <>
                    {filteredFAQs.map((category) => (
                      <div key={category._id} className="mb-6">

                        <div 
                          className="bg-white p-3 rounded-md mb-2 flex items-center cursor-pointer"
                          onClick={() => toggleCategory(category._id)}
                        >
                          <div className="w-7 h-7 bg-primary text-white rounded-sm flex items-center justify-center mr-3 text-sm font-medium">?</div>
                          <h2 className="text-black font-medium">{category.category?.name || 'Orientation'}</h2>
                          <div className="ml-auto bg-white">
                            {openCategories[category._id] ? (
                              <ChevronUp className="h-5 w-5 text-primary" />
                            ) : (
                              <ChevronDown className="h-5 w-5 text-primary" />
                            )}
                          </div>
                        </div>


                        <div className="space-y-2">
                          {category.faqs.map((faq) => (
                            <div key={faq._id} className="border border-gray-100 rounded-md overflow-hidden">

                              <div 
                                className="p-4 flex items-center cursor-pointer" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleItem(faq._id);
                                }}
                              >
                                <div className="flex-shrink-0 mr-3">
                                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <rect width="24" height="24" rx="4" fill="#F1F1F1"/>
                                    <path d="M7 12H17M7 8H17M7 16H13" stroke="#666666" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                </div>
                                <div className="flex-1">
                                  <h3 className="text-gray-800 font-normal text-base">{faq.question}</h3>
                                </div>
                                <div className="flex-shrink-0 ml-2">
                                  {openItems[faq._id] ? (
                                    <ChevronUp className="h-5 w-5 text-gray-500" />
                                  ) : (
                                    <ChevronDown className="h-5 w-5 text-gray-500" />
                                  )}
                                </div>
                              </div>
                              

                              {openItems[faq._id] && (
                                <div className="px-4 pb-4 pt-0 ml-10">
                                  <p className="text-gray-600">{faq.answer}</p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};


const mockFaqData = [
  {
    _id: 'category1',
    category: { name: 'Orientation' },
    faqs: [
      {
        _id: 'faq1',
        question: 'Welcome to AdmitEDGE Admission Counseling program. What is the most compelling reason for enrolling in AdmitEDGE.com for your admissions?',
        answer: 'I am amazed by the state of the art technology that you guys use. Just looking at the learning tracker made me want to buy the program. The SFAs are very helpful and overall they have greatly helped me in my preparation for GRE and I am sure they would also help me in getting admits in my dream university.'
      },
      {
        _id: 'faq2',
        question: 'Welcome to AdmitEDGE Admission Counseling program. What is the most compelling reason for enrolling in AdmitEDGE.com for your admissions?',
        answer: 'I am amazed by the state of the art technology that you guys use. Just looking at the learning tracker made me want to buy the program. The SFAs are very helpful and overall they have greatly helped me in my preparation for GRE and I am sure they would also help me in getting admits in my dream university.'
      },
      {
        _id: 'faq3',
        question: 'Welcome to AdmitEDGE Admission Counseling program. What is the most compelling reason for enrolling in AdmitEDGE.com for your admissions?',
        answer: 'I am amazed by the state of the art technology that you guys use. Just looking at the learning tracker made me want to buy the program. The SFAs are very helpful and overall they have greatly helped me in my preparation for GRE and I am sure they would also help me in getting admits in my dream university.'
      },
      {
        _id: 'faq4',
        question: 'Welcome to AdmitEDGE Admission Counseling program. What is the most compelling reason for enrolling in AdmitEDGE.com for your admissions?',
        answer: 'I am amazed by the state of the art technology that you guys use. Just looking at the learning tracker made me want to buy the program. The SFAs are very helpful and overall they have greatly helped me in my preparation for GRE and I am sure they would also help me in getting admits in my dream university.'
      }
    ]
  }
];

export default FAQ;
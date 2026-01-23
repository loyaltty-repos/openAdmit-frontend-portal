import {
    Globe,
    FileText,
    ClipboardList,
    BarChart,
} from 'lucide-react';

const features = [
    {
        title: 'Dream College Management',
        description:
            'Effortlessly explore, shortlist, and manage your dream college applications with smart tools that keep everything organized.',
        icon: Globe,
        color: 'bg-blue-500/10 dark:bg-blue-500/20',
        iconColor: 'text-blue-500',
    },
    {
        title: 'Document Assistance',
        description:
            'Instant help with your academic or application documents—upload, review, and get guidance on the go.',
        icon: FileText,
        color: 'bg-purple-500/10 dark:bg-purple-500/20',
        iconColor: 'text-purple-500',
    },
    {
        title: 'Form Filling Support',
        description:
            'Simplify complex application forms with guided assistance and AI-powered autofill to avoid mistakes.',
        icon: ClipboardList,
        color: 'bg-green-500/10 dark:bg-green-500/20',
        iconColor: 'text-green-500',
    },
    {
        title: 'Status Management',
        description:
            'Track your application progress and deadlines in one place with real-time updates and smart reminders.',
        icon: BarChart,
        color: 'bg-amber-500/10 dark:bg-amber-500/20',
        iconColor: 'text-amber-500',
    },
];

export const Features = () => {
    return (
        <section
            id="features"
            className="py-20 bg-gray-50 relative overflow-hidden"
        >
            <div
                className="absolute inset-0 bg-[radial-gradient(circle_at_15%_50%,rgba(83,107,250,0.05),transparent_35%),radial-gradient(circle_at_85%_30%,rgba(0,188,255,0.05),transparent_30%)]"
                aria-hidden="true"
            />

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="max-w-3xl mx-auto text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900 dark:text-white">
                        Simplify Your Study Abroad Journey
                    </h2>
                    <p className="text-lg text-gray-600 dark:text-gray-300">
                        Goupbroad streamlines every step of your international education process—from college selection to application tracking
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all duration-300 hover:translate-y-[-2px] animate-fade-in"
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            <div
                                className={`w-12 h-12 rounded-lg flex items-center justify-center mb-5 ${feature.color}`}
                            >
                                <feature.icon className={`h-6 w-6 ${feature.iconColor}`} />
                            </div>
                            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                                {feature.title}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Features;

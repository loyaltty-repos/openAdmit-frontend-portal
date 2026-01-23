import Footer from '@/components/static/Footer'
import Navigation from '@/components/static/Navigation'
import React from 'react'

const TermsCondition = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <Navigation />
            <section className="bg-gradient-to-r from-primary via-primary-600 to-primary-700 text-white py-20 pt-[200px]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">Terms & Conditions</h1>
                    <p className="text-xl md:text-2xl text-primary-100 mb-10 max-w-4xl mx-auto leading-relaxed">
                        By using our services, you agree to these terms.
                    </p>
                </div>
            </section>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-grow">
                <div className="space-y-12 text-gray-700 text-lg leading-relaxed">
                    {/* Section: Introduction */}
                    <div>
                        <h2 className="text-3xl font-bold mb-4 text-gray-900">1. Acceptance of Terms</h2>
                        <p>
                            Welcome to Goupbroad! These Terms & Conditions ("Terms") govern your use of the Goupbroad website and services
                            (collectively, the "Service"). By accessing or using our Service, you agree to be bound by these Terms and our Privacy
                            Policy. If you do not agree to all the terms and conditions, you may not use our Service.
                        </p>
                    </div>

                    {/* Section: Service Description */}
                    <div>
                        <h2 className="text-3xl font-bold mb-4 text-gray-900">2. Description of Service</h2>
                        <p>
                            Goupbroad provides a platform to assist individuals in their journey to study abroad. Our services may include, but are
                            not limited to, connecting you with educational institutions, providing information on visa processes, scholarship
                            resources, and general guidance on studying in a foreign country. We act as a facilitator and do not guarantee admission,
                            visa approval, or financial aid. The final decisions rest with the respective institutions and government bodies.
                        </p>
                    </div>

                    {/* Section: User Responsibilities */}
                    <div>
                        <h2 className="text-3xl font-bold mb-4 text-gray-900">3. User Responsibilities</h2>
                        <p>
                            You agree to provide accurate, current, and complete information during your use of the Service. You are responsible for
                            all activities that occur under your account and for maintaining the confidentiality of your password. You must comply
                            with all applicable laws and regulations of both your home country and the country you intend to study in. Any
                            misrepresentation or fraudulent activity will result in the immediate termination of your account.
                        </p>
                    </div>

                    {/* Section: Limitation of Liability */}
                    <div>
                        <h2 className="text-3xl font-bold mb-4 text-gray-900">4. Limitation of Liability</h2>
                        <p>
                            To the maximum extent permitted by law, Goupbroad and its affiliates, officers, employees, and agents will not be liable
                            for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether
                            incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses, resulting from (a) your
                            use or inability to use the Service; (b) any unauthorized access to or use of our servers and/or any personal information
                            stored therein.
                        </p>
                    </div>

                    {/* Section: Termination */}
                    <div>
                        <h2 className="text-3xl font-bold mb-4 text-gray-900">5. Termination</h2>
                        <p>
                            We may terminate or suspend your access to the Service immediately, without prior notice or liability, for any reason
                            whatsoever, including without limitation if you breach the Terms. Upon termination, your right to use the Service will
                            cease immediately.
                        </p>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}

export default TermsCondition

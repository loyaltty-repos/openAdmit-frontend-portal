import Footer from '@/components/static/Footer'
import Navigation from '@/components/static/Navigation'
import React from 'react'

const PrivacyPolicy = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <Navigation />
            <section className="bg-gradient-to-r from-primary via-primary-600 to-primary-700 text-white py-20 pt-[200px]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">Privacy Policy</h1>
                    <p className="text-xl md:text-2xl text-primary-100 mb-10 max-w-4xl mx-auto leading-relaxed">
                        We are committed to protecting your privacy.
                    </p>
                </div>
            </section>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-grow">
                <div className="space-y-12 text-gray-700 text-lg leading-relaxed">
                    {/* Section: Information We Collect */}
                    <div>
                        <h2 className="text-3xl font-bold mb-4 text-gray-900">1. Information We Collect</h2>
                        <p>
                            We collect various types of information to provide and improve our Service to you. This may include personal information
                            such as your name, email address, phone number, and academic history, as well as non-personal information like your IP
                            address and browsing behavior on our site.
                        </p>
                    </div>

                    {/* Section: How We Use Your Information */}
                    <div>
                        <h2 className="text-3xl font-bold mb-4 text-gray-900">2. How We Use Your Information</h2>
                        <p>
                            The information we collect is used to:
                            <ul className="list-disc list-inside mt-4 space-y-2">
                                <li>Provide, operate, and maintain our Service.</li>
                                <li>Improve, personalize, and expand our Service.</li>
                                <li>Understand and analyze how you use our Service.</li>
                                <li>Communicate with you, either directly or through one of our partners.</li>
                                <li>Send you emails and updates regarding your study abroad journey.</li>
                            </ul>
                        </p>
                    </div>

                    {/* Section: How We Share Your Information */}
                    <div>
                        <h2 className="text-3xl font-bold mb-4 text-gray-900">3. How We Share Your Information</h2>
                        <p>
                            We do not sell, trade, or otherwise transfer your personal information to outside parties without your consent. We may
                            share your information with trusted partners who assist us in operating our website, conducting our business, or servicing
                            you, as long as those parties agree to keep this information confidential. This includes sharing your data with
                            educational institutions and visa consultants to facilitate your application process.
                        </p>
                    </div>

                    {/* Section: Data Security */}
                    <div>
                        <h2 className="text-3xl font-bold mb-4 text-gray-900">4. Data Security</h2>
                        <p>
                            We implement a variety of security measures to maintain the safety of your personal information when you enter, submit, or
                            access your personal information. However, no method of transmission over the Internet or method of electronic storage is
                            100% secure.
                        </p>
                    </div>

                    {/* Section: Your Rights */}
                    <div>
                        <h2 className="text-3xl font-bold mb-4 text-gray-900">5. Your Rights</h2>
                        <p>
                            You have the right to access, update, or delete your personal information. You can also opt-out of receiving marketing
                            communications from us at any time. If you wish to exercise any of these rights, please contact us at the email address
                            provided on our website.
                        </p>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}

export default PrivacyPolicy

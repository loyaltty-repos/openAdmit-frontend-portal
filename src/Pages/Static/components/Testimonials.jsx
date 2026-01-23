
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Star, User } from 'lucide-react';

const Testimonials = () => {
  const testimonials = [
    {
      name: 'Kritik Shrivastava',
      // university: 'University of Toronto, Canada',
      course: 'MBA - UC Riverside',
      // image: 'https://images.unsplash.com/photo-1494790108755-2616b612b5bc?w=150&h=150&fit=crop&crop=face',
      text: `Anushk and his team were exceptional.
Their guidance helped me secure admits
to Columbia, Emory, and other top
universities, along with a $100K
scholarship from UC Riverside. I highly
recommend Anushk and his team for end-to-end support throughout the application
process.`,
      rating: 5,
      // achievement: 'Secured $15K Scholarship'
    },
    {
      name: 'Prachi Agarwal',
      // university: 'University of Melbourne, Australia',
      course: 'MEM - Northwestern',
      // image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      text: `I was initially skeptical about trusting Upbroad,
having had poor experiences with two
consultancies in my previous application cycle. One
counselor from LeapScholar repeatedly pushed
universities I never asked for, calling them ‘backups.’
My call with Anushk changed everything. It was
clear they work for the student—not for universities.
The team was highly responsive, delivered strong
SOPs across applications, and revised them
whenever I wasn’t fully satisfied.`,
      rating: 5,
      // achievement: '8 University Applications'
    },
    {
      name: 'Amulya',
      // university: 'Technical University of Munich, Germany',
      course: 'Ms Finance - UC San Diego',
      // image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      text: `Hi, I’m Amulya, MS in Finance from UC San
Diego’s Rady School of Management. Working
with Anushk and his team was a great decision.
They understood every detail of the admissions
process and helped me craft strong SOPs and
LORs. The entire process was smooth and well-structured. I’ve already recommended them to a
friend and will continue referring others
planning to study in the U.S.`,
      rating: 5,
      // achievement: 'Full Scholarship Recipient'
    },
  ];

  return (
    <section id="testimonials" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Success Stories from Students Like You

          </h2>
          <p className="text-lg sm:text-lg md:text-xl text-gray-600 max-w-4xl mx-auto sm:text-center text-justify">
            Hear how students turned their study abroad dreams into real success with Upbroad’s
            transparent, mentor-led guidance.          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card
              key={index}
              className="hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-gray-100 flex flex-col h-full"
            >
              <CardContent className="p-6 flex flex-col flex-1">
                {/* Rating */}
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>

                {/* Testimonial Text - takes available space but doesn't push footer down too far */}
                <p className="text-gray-600 mb-6 italic flex-1 text-justify ">
                  "{testimonial.text}"
                </p>

                {/* Achievement Badge - optional, only show if exists */}
                {testimonial.achievement && (
                  <div className="bg-primary-50 text-primary-700 text-xs font-semibold px-3 py-1 rounded-full inline-block mb-4">
                    {testimonial.achievement}
                  </div>
                )}

                {/* Student Info - always stuck to bottom */}
                <div className="flex items-center mt-auto">
                  <div className="relative w-12 h-12 rounded-full mr-4 overflow-hidden bg-gray-200 flex items-center justify-center flex-shrink-0">
                    {/* Only render img if image exists */}
                    {testimonial.image ? (
                      <img
                        src={testimonial.image}
                        alt={testimonial.name}
                        className="absolute inset-0 w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.parentElement
                            .querySelector('.fallback-user')
                            ?.classList.remove('hidden');
                        }}
                      />
                    ) : null}

                    {/* Lucide User Icon - fallback */}
                    <User className="w-8 h-8 text-gray-500 fallback-user" />
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                    <p className="text-sm text-gray-500">{testimonial.course}</p>
                    {testimonial.university && (
                      <p className="text-sm text-primary font-medium">{testimonial.university}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 text-center">
          <div className="grid grid-cols-3 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-700 mb-2">100%</div>
              <div className="text-sm text-gray-600">Success Rate</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-700 mb-2">4.9/5</div>
              <div className="text-sm text-gray-600">Student Rating</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-700 mb-2">400+</div>
              <div className="text-sm text-gray-600">Happy Students</div>
            </div>
            {/* <div className="text-center">
              <div className="text-3xl font-bold text-primary-700 mb-2">24/7</div>
              <div className="text-sm text-gray-600">Support Available</div>
            </div> */}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;

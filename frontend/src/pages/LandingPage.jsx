// LandingPage.jsx

import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Heart, Info, MessageCircleHeart, LightbulbIcon, LogIn, UserPlus, Star, ArrowRight, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Navigation Bar */}
      <nav className="w-full py-4 px-6 flex justify-between items-center border-b bg-white/80 backdrop-blur-sm fixed top-0 z-50">
        <div className="flex items-center gap-2">
          <Heart className="h-6 w-6 text-rose-500 animate-pulse" />
          <h1 className="text-xl font-bold text-slate-800">MindfulPath</h1>
        </div>
        <div className="flex gap-4">
          <Button variant="ghost" size="sm" asChild className="hover:bg-rose-50">
            <Link to="/signin" className="flex items-center">
              <LogIn className="mr-2 h-4 w-4" />
              Sign In
            </Link>
          </Button>
          <Button size="sm" asChild className="bg-rose-500 hover:bg-rose-600">
            <Link to="/signup" className="flex items-center">
              <UserPlus className="mr-2 h-4 w-4" />
              Sign Up
            </Link>
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/src/assets/hero-bg.jpg')] bg-cover bg-center opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-white/80 to-transparent"></div>
        <div className="max-w-4xl mx-auto text-center px-4 relative z-10 animate-fade-in">
          <h1 className="text-5xl md:text-7xl font-bold text-slate-800 mb-6 leading-tight">
            Your Journey to Mental Wellness Starts Here
          </h1>
          <p className="text-xl md:text-2xl text-slate-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Professional support and guidance to help you navigate through life's challenges and find your path to healing.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" className="bg-rose-500 hover:bg-rose-600 text-white px-8 py-6 text-lg transition-all duration-300 hover:scale-105" asChild>
              <Link to="/signup">Get Started</Link>
            </Button>
            <Button variant="outline" size="lg" className="border-2 px-8 py-6 text-lg transition-all duration-300 hover:scale-105" asChild>
              <Link to="/resources">Learn More</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 animate-fade-in">
            How We Can Help You
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Info className="h-8 w-8 text-blue-500 mb-2" />,
                title: "Understanding Your Journey",
                description: "Gain insights into your mental health journey with personalized assessments and professional guidance."
              },
              {
                icon: <MessageCircleHeart className="h-8 w-8 text-rose-500 mb-2" />,
                title: "Professional Counseling",
                description: "Connect with experienced counselors who provide a safe space for healing and growth."
              },
              {
                icon: <LightbulbIcon className="h-8 w-8 text-amber-500 mb-2" />,
                title: "Personalized Support",
                description: "Receive tailored strategies and tools to help you overcome challenges and achieve mental wellness."
              }
            ].map((feature, index) => (
              <div key={index} className="animate-fade-in" style={{ animationDelay: `${index * 200}ms` }}>
                <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <CardHeader>
                    {feature.icon}
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-32 px-4 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 animate-fade-in">
            What Our Clients Say
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                quote: "The support I received here was transformative. My counselor helped me understand and overcome my challenges in ways I never thought possible.",
                author: "Sarah M."
              },
              {
                quote: "I found a safe space to heal and grow. The professional guidance and tools provided have been invaluable in my journey to better mental health.",
                author: "James R."
              }
            ].map((testimonial, index) => (
              <div key={index} className="animate-fade-in" style={{ animationDelay: `${index * 200}ms` }}>
                <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardContent className="pt-8">
                    <div className="flex items-center mb-4">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="h-5 w-5 text-amber-400 fill-amber-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-slate-600 italic mb-4 text-lg leading-relaxed">
                      "{testimonial.quote}"
                    </p>
                    <p className="font-semibold text-slate-800 text-lg">{testimonial.author}</p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-4 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 text-white">
        <div className="max-w-4xl mx-auto text-center animate-fade-in">
          <h2 className="text-4xl font-bold mb-6">Ready to Start Your Journey?</h2>
          <p className="text-xl mb-8">
            Take the first step towards better mental health today.
          </p>
          <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-6 text-lg transition-all duration-300 hover:scale-105" asChild>
            <Link to="/signup" className="flex items-center">
              Get Started Now
              <ChevronRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Counsellor Application Section */}
      <section className="py-32 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center animate-fade-in">
          <h2 className="text-4xl font-bold mb-6">Join Our Team of Professional Counsellors</h2>
          <p className="text-slate-600 mb-8 text-lg">
            Make a difference in people's lives by joining our team of dedicated mental health professionals.
          </p>
          <Button 
            size="lg" 
            variant="outline" 
            className="border-2 border-rose-500 text-rose-500 hover:bg-rose-50 px-8 py-6 text-lg transition-all duration-300 hover:scale-105"
            onClick={() => navigate('/counsellorapplicationform')}
          >
            Apply to be a Counsellor
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-sm text-slate-400">
            
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

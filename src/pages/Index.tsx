
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import HeroSection from '@/components/landing/HeroSection';
import FeaturePillars from '@/components/landing/FeaturePillars';
import HowItWorks from '@/components/landing/HowItWorks';
import DashboardPreview from '@/components/landing/DashboardPreview';
import FinalCTA from '@/components/landing/FinalCTA';

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useSupabaseAuth();

  useEffect(() => {
    // If user is authenticated, redirect to dashboard
    if (!isLoading && isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  const handleGetStarted = () => {
    navigate('/auth');
  };

  const handleWatchDemo = () => {
    // Smooth scroll to how it works section
    const element = document.getElementById('how-it-works');
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // If user is authenticated, they'll be redirected by useEffect
  if (isAuthenticated) {
    return null;
  }

  // Show landing page for non-authenticated users
  return (
    <div className="min-h-screen">
      <HeroSection onGetStarted={handleGetStarted} onWatchDemo={handleWatchDemo} />
      <FeaturePillars />
      <div id="how-it-works">
        <HowItWorks />
      </div>
      <DashboardPreview />
      <FinalCTA onGetStarted={handleGetStarted} />
    </div>
  );
};

export default Index;

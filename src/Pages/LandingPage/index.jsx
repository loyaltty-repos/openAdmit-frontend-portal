'use client';
import { Navbar } from '@/components/NavBar';
import { useEffect, useState } from 'react';
import Hero from '@/components/Hero';
import { Spotlight } from '@/components/ui/spotlight';
import Loader from '@/components/ui/loader';
import Features from '@/components/Features';
import HowItWorks from '@/components/HowItWorks';
import TechStack from '@/components/TechStack';
import ServerMetrics from '@/components/ServiceMetrics';
import { getServerHealth } from '@/services/api.services';
import Footer from '@/components/Footer';

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(false);
  const [serverStatus, setServerStatus] = useState({
    application: {
      environment: 'development',
      uptime: 'loading...',
      memoryUsage: {
        heapTotal: 'loading...',
        heapUsed: 'loading...'
      }
    },
    system: {
      cpuUsage: [0, 0, 0],
      totalMemory: '1',
      freeMemory: '1'
    },
    timestamp: Date.now()
  });

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  }, []);

  useEffect(() => {
    const fetchServerStatus = async () => {
      try {
        const response = await getServerHealth();
        
        if (response?.success) {
          setServerStatus(response.data);
          setIsOnline(true);
        } else {
          setIsOnline(false);
        }
      } catch (error) {
        console.error('Failed to fetch server status:', error);
        setIsOnline(false);
      }
    };
  
    fetchServerStatus();
    const interval = setInterval(fetchServerStatus, 600000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {isLoading ? (
        <Loader />
      ) : (
        <div className="min-h-screen flex flex-col">
          <Navbar status={isOnline} />
          <Spotlight className="-top-20 md:block bottom-3 md:left-60 md:-top-20" fill="#145044" /> 
          <Spotlight className="-top-20 md:block bottom-3 md:left-60 md:-top-20" fill="#145044" />
          <main className="flex-grow">
            <Hero />
            <Features/>
            <HowItWorks/>
            <ServerMetrics isOnline={isOnline} serverStatus={serverStatus}/>
            <TechStack/>
            <Footer/>
          </main>
        </div>
      )}
    </>
  );
}

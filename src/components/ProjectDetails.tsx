import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useParams, useNavigate } from 'react-router-dom';
import { projectsData } from './projectsData';
import { ConnectWallet } from './ConnectWallet';
import { useWallet } from '../contexts/WalletContext';

const ProjectDetails: React.FC = () => {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>();
  const { connected } = useWallet();
  const [donationAmount, setDonationAmount] = useState<string>('');
  
  // Find project by ID from URL parameter
  const project = projectsData.find(p => p.id === Number(projectId));
  
  // Handle back button click
  const handleBackClick = () => {
    navigate('/');
  };
  
  // Handle donation submission
  const handleDonate = () => {
    // Here you would call your donation function
    console.log(`Donating ${donationAmount} Aleo credits to project ${projectId}`);
    // Reset the input field after donation
    setDonationAmount('');
    // Display success message or redirect
  };
  
  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Project Not Found</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">The project you're looking for doesn't exist or has been removed.</p>
          <button 
            onClick={handleBackClick}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-full font-medium"
          >
            Back to Projects
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Top Hero Banner */}
      <div className="w-full bg-indigo-900 dark:bg-indigo-900 relative">
        <div className="absolute inset-0 opacity-20">
          <img 
            src={project.image} 
            alt={project.title} 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 py-16">
          <button 
            onClick={handleBackClick}
            className="mb-6 flex items-center text-white hover:text-blue-200 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Projects
          </button>

          <div className="flex flex-col md:flex-row gap-8">
            <div className="w-full">
              {project.status && project.roundInfo && (
                <div className="inline-block bg-green-500 text-xs font-semibold text-white px-2 py-1 rounded mb-4">
                  {project.status} | {project.roundInfo}
                </div>
              )}
              <h1 className="text-4xl font-bold text-white mb-4">{project.title}</h1>
              <p className="text-lg text-blue-100 mb-6">{project.description}</p>


              <div className="flex items-center">
                <img 
                  src={project.creatorImage} 
                  alt={project.creatorName} 
                  className="w-10 h-10 rounded-full mr-3 border-2 border-white"
                />
                <div>
                  <span className="block text-blue-100 text-sm">Lead Researcher at Quantum Labs</span>
                  <span className="text-white font-medium">{project.creatorName}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Progress Bar (Separate Section) */}
      <div className="bg-indigo-800 dark:bg-indigo-800 py-4">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="flex justify-between text-sm text-blue-100 mb-1">
                <span>Progress</span>
                <span>{project.percentFunded}%</span>
              </div>
              <div className="w-full bg-indigo-700 dark:bg-indigo-700 rounded-full h-2.5">
                <div 
                  className="bg-blue-400 dark:bg-blue-400 h-2.5 rounded-full" 
                  style={{ width: `${project.percentFunded}%` }}
                ></div>
              </div>
            </div>
            
            <div className="flex gap-8">
              <div className="text-center">
                <div className="text-xl font-bold text-white">{project.currentAmount.toLocaleString()} <span className="text-blue-200 text-sm font-normal">Credits</span></div>
                <div className="text-xs text-blue-200">of {project.targetAmount.toLocaleString()}</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-white">{project.contributors}</div>
                <div className="text-xs text-blue-200">Contributors</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-white">{project.daysLeft}</div>
                <div className="text-xs text-blue-200">Days Left</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Left Column: Project Overview */}
          <div className="w-full lg:w-7/12">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Project Overview</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-6">{project.overview}</p>
              
              {project.keyInnovations && (
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Key Innovations</h3>
                  <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
                    {project.keyInnovations.map((innovation, index) => (
                      <li key={index}>{innovation}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {project.researchProgress && (
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Research Progress</h3>
                  <p className="text-gray-700 dark:text-gray-300">{project.researchProgress}</p>
                </div>
              )}
              
              {project.impactAndApplications && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Impact & Applications</h3>
                  <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
                    {project.impactAndApplications.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            
            {/* Add additional sections here if needed */}
          </div>
          
          {/* Right Column: Support This Project */}
          <div className="w-full lg:w-5/12">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 sticky top-6">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Support This Project</h2>
              
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-5 mb-6">
                <div className="flex items-center mb-4">
                  <div className="bg-indigo-100 dark:bg-indigo-900 p-3 rounded-full mr-4">
                    <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-300" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 dark:text-white text-lg">Support with Aleo</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Make a contribution using Aleo cryptocurrency</p>
                  </div>
                </div>
                
                <div className="flex flex-col gap-3">
                  {/* Dynamic Donation UI */}
                  <div className="relative">
                    {/* Donation Form */}
                    <div className={`${!connected ? 'filter blur-sm pointer-events-none' : ''} transition-all duration-300`}>
                      <div className="mb-4">
                        <label htmlFor="donation-amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Donation Amount (Aleo Credits)
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            id="donation-amount"
                            value={donationAmount}
                            onChange={(e) => setDonationAmount(e.target.value)}
                            className="block w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Enter amount"
                          />
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <span className="text-gray-500 dark:text-gray-400">ALEO</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Connect Wallet Overlay (when not connected) */}
                    {!connected && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-full">
                          <ConnectWallet buttonText="Connect Wallet" />
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Donate Button (only shown when connected) */}
                  {connected && (
                    <div className="mt-2">
                      <button
                        onClick={handleDonate}
                        disabled={!donationAmount || parseFloat(donationAmount) <= 0}
                        className={`w-full py-3 px-4 rounded-lg font-medium flex items-center justify-center ${
                          !donationAmount || parseFloat(donationAmount) <= 0
                            ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                        }`}
                      >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Donate Now
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center justify-center mt-6">
                <button 
                  className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                  onClick={() => {
                    const url = window.location.href;
                    navigator.clipboard.writeText(url);
                    // Could add a toast notification here
                  }}
                >
                  <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                  </svg>
                  Share Project Link
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails; 
import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ConnectWallet } from './ConnectWallet';
import { useWallet } from '../contexts/WalletContext';
import { useAleo } from '../contexts/AleoContext';

// Define project data interface
interface ProjectData {
  projectKey: string; // Project key for URL (without 'field' suffix)
  title: string;
  description: string;
  currentAmount: number;
  targetAmount: number;
  percentFunded: number;
  creatorName: string;
  creatorImage: string;
  image: string;
  contributors?: number;
  daysLeft?: number;
  overview?: string;
  status?: string;
  roundInfo?: string;
  aleoInteractionKey?: string; // Full Aleo key with 'field' suffix for blockchain interactions
  originalIndex?: number; // Original blockchain index
}

// Define blockchain project interface
interface BlockchainProject {
  project_owner: string;
  project_details: {
    title: string;
    description: string;
    img?: string;
  };
  collected_amount: number;
  num_supporters: number;
  joined_round: number;
  is_approved: boolean;
}

// Define location state type
interface LocationState {
  projectData?: ProjectData;
  fromHomepage?: boolean;
}

const ProjectDetails: React.FC = () => {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { projectKey } = useParams<{ projectKey: string }>();
  const { connected } = useWallet();
  const { donateToProject, getProjectKey, currentRound, fetchCurrentRound, fetchAllProjects, isLoading, error } = useAleo();
  
  // State for donation
  const [donationAmount, setDonationAmount] = useState<string>('');
  const [donationStatus, setDonationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [transactionError, setTransactionError] = useState<string | null>(null);
  
  // State for project data
  const [project, setProject] = useState<ProjectData | null>(null);
  const [isLoadingProject, setIsLoadingProject] = useState<boolean>(false);
  const [projectNotFound, setProjectNotFound] = useState<boolean>(false);
  const [daysLeftInRound] = useState<number>(14); // Default days left
  
  // Refs to prevent multiple fetches
  const hasFetchedRound = useRef<boolean>(false);
  const hasInitializedProject = useRef<boolean>(false);

  // Get location state
  const locationState = location.state as LocationState;
  const projectDataFromState = locationState?.projectData;
  const fromHomepage = locationState?.fromHomepage;

  // Fetch current round when component mounts (no wallet connection required for browsing)
  useEffect(() => {
    if (!currentRound && !hasFetchedRound.current) {
      hasFetchedRound.current = true;
      fetchCurrentRound();
    }
  }, [currentRound, fetchCurrentRound]);

  // Initialize project data - either from state or fetch from chain
  useEffect(() => {
    if (hasInitializedProject.current) {
      return;
    }

    if (!projectKey) {
      setProjectNotFound(true);
      return;
    }

    // Case 1: Project data passed from homepage
    if (fromHomepage && projectDataFromState) {
      setProject(projectDataFromState);
      setProjectNotFound(false);
      hasInitializedProject.current = true;
      return;
    }

    // Case 2: Direct URL access - need to fetch from chain
    if (!currentRound || isLoading) {
      return;
    }

    if (hasInitializedProject.current) {
      return; // Prevent multiple fetches
    }

    hasInitializedProject.current = true;
    setIsLoadingProject(true);
    setProjectNotFound(false);

    fetchAllProjects(currentRound.round_id)
      .then(async (allFetchedBlockchainProjects: BlockchainProject[]) => {
        let foundProject: ProjectData | null = null;

        // Search through all projects to find one that generates the matching project key
        for (let arrayIndex = 0; arrayIndex < allFetchedBlockchainProjects.length; arrayIndex++) {
          const blockchainProject = allFetchedBlockchainProjects[arrayIndex];
          const projectIndex = arrayIndex + 1; // Project indices start from 1 in Aleo contract
          
          // Check basic validity first
          const hasValidOwner = blockchainProject.project_owner && blockchainProject.project_owner.trim() !== '';
          const hasValidTitle = blockchainProject.project_details?.title && blockchainProject.project_details.title.trim() !== '';
          
          if (!hasValidOwner || !hasValidTitle) {
            continue;
          }

          // Generate the key for this project
          const aleoKeyWithSuffix = await getProjectKey(currentRound.round_id, projectIndex);
          if (!aleoKeyWithSuffix) {
            console.error(`ProjectDetails: Failed to generate key for project at index ${projectIndex}`);
            continue;
          }

          const urlKey = aleoKeyWithSuffix.replace(/field$/, '');

          if (urlKey === projectKey) {
            // Verify this is an approved project
            if (!blockchainProject.is_approved) {
              break; // Found but not approved
            }

            // Convert to UI format
            const targetAmount = 10_000_000;
            const percentFunded = Math.min(
              Math.round((blockchainProject.collected_amount / targetAmount) * 100),
              100
            );

            foundProject = {
              projectKey: projectKey,
              title: blockchainProject.project_details.title,
              description: blockchainProject.project_details.description,
              image: blockchainProject.project_details.img || '',
              currentAmount: blockchainProject.collected_amount,
              targetAmount: targetAmount,
              percentFunded: percentFunded,
              contributors: blockchainProject.num_supporters,
              daysLeft: currentRound.is_active ? daysLeftInRound : 0,
              creatorName: `${blockchainProject.project_owner.substring(0, 6)}...${blockchainProject.project_owner.substring(blockchainProject.project_owner.length - 4)}`,
              creatorImage: '',
              overview: blockchainProject.project_details.description,
              status: blockchainProject.is_approved ? 'Approved' : 'Pending',
              roundInfo: `Round #${blockchainProject.joined_round}`,
              aleoInteractionKey: aleoKeyWithSuffix,
              originalIndex: projectIndex
            };

            break;
          }
        }

        if (foundProject) {
          setProject(foundProject);
          setProjectNotFound(false);
        } else {
          setProject(null);
          setProjectNotFound(true);
        }
      })
      .catch((fetchError: any) => {
        console.error('Error fetching projects from chain:', fetchError);
        setProjectNotFound(true);
      })
      .finally(() => {
        setIsLoadingProject(false);
      });

  }, [
    projectKey,
    fromHomepage,
    projectDataFromState,
    currentRound,
    isLoading,
    fetchAllProjects,
    getProjectKey,
    daysLeftInRound
  ]);
  
  // Handle back button click
  const handleBackClick = () => {
    navigate('/');
  };
  
  // Handle donation submission
  const handleDonate = async () => {
    if (!connected || !currentRound) {
      setTransactionError('Please connect your wallet first');
      return;
    }

    if (!donationAmount || parseFloat(donationAmount) <= 0) {
      setTransactionError('Please enter a valid amount');
      return;
    }

    if (!project?.aleoInteractionKey) {
      setTransactionError('Aleo interaction key not available for this project');
      return;
    }

    setDonationStatus('loading');
    setTransactionError(null);

    try {
      const success = await donateToProject(project.aleoInteractionKey, parseFloat(donationAmount) * 1_000_000);
      
      if (success) {
        setDonationStatus('success');
        setDonationAmount('');
        setTimeout(() => {
          setDonationStatus('idle');
        }, 3000);
      } else {
        throw new Error('Transaction failed');
      }
    } catch (err: any) {
      setDonationStatus('error');
      setTransactionError(err.message || 'Failed to process donation');
    }
  };
  
  // Show loading state
  if (isLoading || isLoadingProject) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading project details...</p>
        </div>
      </div>
    );
  }
  
  // Show project not found state
  if (projectNotFound || !project) {
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
            crossOrigin="anonymous"
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
                  crossOrigin="anonymous"
                />
                <div>
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
            </div>
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
                            disabled={donationStatus === 'loading'}
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
                  
                  {/* Donation Status Message */}
                  {transactionError && (
                    <div className="text-red-500 text-sm mb-2">
                      {transactionError}
                    </div>
                  )}
                  
                  {donationStatus === 'success' && (
                    <div className="text-green-500 text-sm mb-2">
                      Donation successful! Thank you for your support.
                    </div>
                  )}

                  {isLoading && (
                    <div className="text-blue-500 text-sm mb-2">
                      Loading round information...
                    </div>
                  )}
                  
                  {/* Donate Button (only shown when connected) */}
                  {connected && (
                    <div className="mt-2">
                      <button
                        onClick={handleDonate}
                        disabled={!donationAmount || parseFloat(donationAmount) <= 0 || donationStatus === 'loading' || !currentRound?.is_active}
                        className={`w-full py-3 px-4 rounded-lg font-medium flex items-center justify-center ${
                          !donationAmount || parseFloat(donationAmount) <= 0 || donationStatus === 'loading' || !currentRound?.is_active
                            ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                        }`}
                      >
                        {donationStatus === 'loading' ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Processing...
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Donate Now
                          </>
                        )}
                      </button>
                    </div>
                  )}
                  
                  {/* Round status message */}
                  {connected && currentRound && !currentRound.is_active && (
                    <div className="text-amber-500 text-sm mt-2">
                      Note: The current funding round is not active. Donations are temporarily paused.
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
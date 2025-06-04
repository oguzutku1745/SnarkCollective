import React, { useEffect, useState, useRef } from 'react';
import { useAleo } from '../contexts/AleoContext';
import { useWallet } from '../contexts/WalletContext';
import { useTheme } from '../contexts/ThemeContext';

// Admin address from the Leo contract
const ADMIN_ADDRESS = 'aleo1pqcumqvf0vjqq800uuyaqqt6s2q6dxcgglywhf6dpzac2cmjgu8q2876eu';

// Define project interface for real data
interface ProjectInfo {
  project_owner: string;
  collected_amount: number;
  joined_round: number;
  num_supporters: number;
  is_approved: boolean;
  is_claimed: boolean;
  project_details: {
    title: string;
    description: string;
    img: string;
    // Store original field values for transactions
    title_field?: string;
    img_field?: string;
    description_field?: string;
  };
}

// ProjectCard component for admin panel
const AdminProjectCard: React.FC<{
  project: ProjectInfo;
  type: 'submitted' | 'approved';
  index: number;
  onApprove?: (project: ProjectInfo, index: number) => void;
  isApproving?: boolean;
}> = ({ project, type, index, onApprove, isApproving }) => {
  const { isDarkMode } = useTheme();
  
  // Calculate some display values
  const targetAmount = 10_000_000; // Default target amount
  const percentFunded = Math.min(
    Math.round((project.collected_amount / targetAmount) * 100),
    100
  );
  
  const statusConfig = type === 'submitted' ? {
    label: 'Pending Approval',
    bgColor: 'bg-yellow-100 dark:bg-yellow-900',
    textColor: 'text-yellow-800 dark:text-yellow-200'
  } : {
    label: 'Approved',
    bgColor: 'bg-green-100 dark:bg-green-900',
    textColor: 'text-green-800 dark:text-green-200'
  };

  // Create a simple placeholder image using data URL
  const createPlaceholderImage = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      // Fill with indigo background
      ctx.fillStyle = '#4f46e5';
      ctx.fillRect(0, 0, 600, 400);
      
      // Add text
      ctx.fillStyle = 'white';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Project Image', 300, 200);
    }
    
    return canvas.toDataURL();
  };

  const placeholderImage = createPlaceholderImage();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md transition-transform hover:scale-[1.02] hover:shadow-lg">
      <div className="h-48 bg-gray-100 dark:bg-gray-700 relative overflow-hidden">
        <img 
          src={project.project_details.img || placeholderImage} 
          alt={project.project_details.title}
          className="w-full h-full object-cover"
          crossOrigin="anonymous"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = placeholderImage;
          }}
        />
        <div className="absolute top-3 left-3">
          <span className={`inline-block ${statusConfig.bgColor} ${statusConfig.textColor} text-xs font-semibold px-2 py-1 rounded`}>
            {statusConfig.label}
          </span>
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">{project.project_details.title}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">{project.project_details.description}</p>
        
        {type === 'approved' && (
          <div className="mb-4">
            <div className="text-xs text-gray-500 dark:text-gray-400 uppercase mb-1">COLLECTED</div>
            <div className="flex items-center justify-between mb-1">
              <div className="text-gray-800 dark:text-white font-bold">
                {project.collected_amount.toLocaleString()} 
                <span className="text-gray-500 dark:text-gray-400 font-normal"> / {targetAmount.toLocaleString()} Credits</span>
              </div>
              <div className="text-blue-600 dark:text-blue-400">{percentFunded}% Funded</div>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full" 
                style={{ width: `${percentFunded}%` }}
              ></div>
            </div>
          </div>
        )}
        
        <div className="space-y-2 text-xs text-gray-500 dark:text-gray-400 mb-4">
          <div className="flex items-center justify-between">
            <span>Owner:</span>
            <span className="font-mono">{project.project_owner.substring(0, 8)}...{project.project_owner.substring(project.project_owner.length - 4)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Round:</span>
            <span>#{project.joined_round}</span>
          </div>
          {type === 'approved' && (
            <>
              <div className="flex items-center justify-between">
                <span>Supporters:</span>
                <span>{project.num_supporters}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Status:</span>
                <span className={project.is_claimed ? 'text-green-600' : 'text-blue-600'}>
                  {project.is_claimed ? 'Claimed' : 'Active'}
                </span>
              </div>
            </>
          )}
        </div>

        {/* Approve button for submitted projects */}
        {type === 'submitted' && onApprove && (
          <div className="mt-4">
            <button
              onClick={() => onApprove(project, index + 1)} // index + 1 because project_index starts from 1
              disabled={isApproving}
              className={`w-full py-2 px-4 rounded-lg font-medium flex items-center justify-center ${
                isApproving
                  ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {isApproving ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Approving...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Approve Project
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const AdminPanel: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { connected, address } = useWallet();
  const { 
    currentRound, 
    fetchCurrentRound, 
    fetchAllProjects,
    approveProject,
    startRound, 
    finishRound, 
    isLoading, 
    error 
  } = useAleo();
  
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusType, setStatusType] = useState<'success' | 'error' | 'info'>('info');
  const [projects, setProjects] = useState<ProjectInfo[]>([]);
  const [approvedProjects, setApprovedProjects] = useState<ProjectInfo[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState<boolean>(false);
  const [approvingProjectIndex, setApprovingProjectIndex] = useState<number | null>(null);
  const [projectCounts, setProjectCounts] = useState<{
    approved: number;
    submitted: number;
  }>({ approved: 0, submitted: 0 });
  const hasFetchedRound = useRef<boolean>(false);
  const hasFetchedProjects = useRef<boolean>(false);

  // Check if connected wallet is admin
  useEffect(() => {
    if (connected && address) {
      // In a real implementation, this would check against the admin_address in the contract
      setIsAdmin(address === ADMIN_ADDRESS);
    } else {
      setIsAdmin(false);
    }
  }, [connected, address]);

  // Fetch current round data when component mounts
  useEffect(() => {
    if (connected && !hasFetchedRound.current && !currentRound) {
      hasFetchedRound.current = true;
      fetchCurrentRound();
    }
  }, [connected, fetchCurrentRound]);

  // Fetch projects when round is available
  useEffect(() => {
    const fetchProjects = async () => {
      if (currentRound && connected && !hasFetchedProjects.current) {
        hasFetchedProjects.current = true;
        setIsLoadingProjects(true);
        try {
          const allProjects = await fetchAllProjects(currentRound.round_id);
          setProjects(allProjects);
          setApprovedProjects(allProjects.filter(p => p.is_approved));
          setProjectCounts({
            approved: allProjects.filter(p => p.is_approved).length,
            submitted: allProjects.filter(p => !p.is_approved).length
          });
        } catch (error) {
          console.error('Error fetching projects:', error);
          // Fallback to round data if available
          if (currentRound) {
            setProjectCounts({
              approved: currentRound.approved_projects || 0,
              submitted: currentRound.submitted_projects || 0
            });
          }
        } finally {
          setIsLoadingProjects(false);
        }
      }
    };

    fetchProjects();
  }, [currentRound?.round_id, connected, fetchAllProjects]);

  // Handle project approval
  const handleApproveProject = async (project: ProjectInfo, projectIndex: number) => {
    if (!connected || !isAdmin || !currentRound) {
      setStatusMessage('You must be connected as admin to perform this action');
      setStatusType('error');
      return;
    }

    setApprovingProjectIndex(projectIndex);
    setStatusMessage(`Approving project: ${project.project_details.title}...`);
    setStatusType('info');

    try {
      const success = await approveProject(currentRound.round_id, projectIndex, project);
      
      if (success) {
        setStatusMessage(`Project "${project.project_details.title}" approved successfully!`);
        setStatusType('success');
        
        // Instead of resetting flags and clearing everything, do a targeted refresh
        // Just refresh the project data without clearing flags
        const refreshProjects = async () => {
          setIsLoadingProjects(true);
          try {
            const allProjects = await fetchAllProjects(currentRound.round_id);
            setProjects(allProjects);
            setApprovedProjects(allProjects.filter(p => p.is_approved));
            setProjectCounts({
              approved: allProjects.filter(p => p.is_approved).length,
              submitted: allProjects.filter(p => !p.is_approved).length
            });
          } catch (error) {
            console.error('Error refreshing projects after approval:', error);
          } finally {
            setIsLoadingProjects(false);
          }
        };

        // Refresh projects after approval
        await refreshProjects();
        
        // Clear status message after 3 seconds
        setTimeout(() => {
          setStatusMessage(null);
        }, 3000);
      } else {
        throw new Error('Failed to approve project');
      }
    } catch (err: any) {
      setStatusMessage(err.message || 'Failed to approve project');
      setStatusType('error');
    } finally {
      setApprovingProjectIndex(null);
    }
  };

  // Handle starting a round
  const handleStartRound = async () => {
    if (!connected || !isAdmin) {
      setStatusMessage('You must be connected as admin to perform this action');
      setStatusType('error');
      return;
    }

    try {
      setStatusMessage('Starting round...');
      setStatusType('info');
      
      const success = await startRound();
      
      if (success) {
        setStatusMessage('Round started successfully!');
        setStatusType('success');
        // Reset project fetch flags to reload data
        hasFetchedRound.current = false;
        hasFetchedProjects.current = false;
      } else {
        throw new Error('Failed to start round');
      }
    } catch (err: any) {
      setStatusMessage(err.message || 'Failed to start round');
      setStatusType('error');
    }
  };

  // Handle finishing a round
  const handleFinishRound = async () => {
    if (!connected || !isAdmin) {
      setStatusMessage('You must be connected as admin to perform this action');
      setStatusType('error');
      return;
    }

    try {
      setStatusMessage('Finishing round...');
      setStatusType('info');
      
      const success = await finishRound();
      
      if (success) {
        setStatusMessage('Round finished successfully!');
        setStatusType('success');
        // Reset project fetch flags to reload data
        hasFetchedRound.current = false;
        hasFetchedProjects.current = false;
      } else {
        throw new Error('Failed to finish round');
      }
    } catch (err: any) {
      setStatusMessage(err.message || 'Failed to finish round');
      setStatusType('error');
    }
  };

  // Refresh round data
  const handleRefreshData = () => {
    if (connected) {
      // Reset flags to force refetch
      hasFetchedRound.current = false;
      hasFetchedProjects.current = false;
      
      // Clear current data
      setProjects([]);
      setApprovedProjects([]);
      setProjectCounts({ approved: 0, submitted: 0 });
      
      // Trigger refetch
      fetchCurrentRound();
    }
  };

  if (!connected) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Admin Panel</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Please connect your wallet to access the admin panel.</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Admin Panel</h2>
        <p className="text-gray-600 dark:text-gray-400">You don't have admin privileges.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-8">Admin Panel</h1>
        
        {/* Status Message */}
        {statusMessage && (
          <div className={`mb-6 p-4 rounded-lg border ${
            statusType === 'success' 
              ? 'bg-green-100 dark:bg-green-900 border-green-300 dark:border-green-700 text-green-700 dark:text-green-300'
              : statusType === 'error'
              ? 'bg-red-100 dark:bg-red-900 border-red-300 dark:border-red-700 text-red-700 dark:text-red-300'
              : 'bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300'
          }`}>
            <div className="flex items-center">
              {statusType === 'success' && (
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              {statusType === 'error' && (
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              {statusType === 'info' && (
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              <span>{statusMessage}</span>
            </div>
          </div>
        )}
        
        {/* Current Round Status */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Current Round Status</h2>
          
          {isLoading && !currentRound ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-indigo-500 mr-3"></div>
              <span className="text-gray-600 dark:text-gray-400">Loading round data...</span>
            </div>
          ) : currentRound ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Round ID</h3>
                  <p className="text-2xl font-bold text-gray-800 dark:text-white">{currentRound.round_id}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</h3>
                  <p className={`text-2xl font-bold ${currentRound.is_active ? 'text-green-600' : 'text-red-600'}`}>
                    {currentRound.is_active ? 'Active' : 'Inactive'}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Submitted Projects</h3>
                  <p className="text-2xl font-bold text-gray-800 dark:text-white">{currentRound.submitted_projects}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Approved Projects</h3>
                  <p className="text-2xl font-bold text-gray-800 dark:text-white">{currentRound.approved_projects}</p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <button
                  onClick={handleStartRound}
                  disabled={currentRound.is_active || isLoading}
                  className={`px-6 py-2 rounded-lg font-medium ${
                    currentRound.is_active || isLoading
                      ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  {isLoading ? 'Processing...' : 'Start Round'}
                </button>
                <button
                  onClick={handleFinishRound}
                  disabled={!currentRound.is_active || isLoading}
                  className={`px-6 py-2 rounded-lg font-medium ${
                    !currentRound.is_active || isLoading
                      ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                      : 'bg-red-600 hover:bg-red-700 text-white'
                  }`}
                >
                  {isLoading ? 'Processing...' : 'Finish Round'}
                </button>
                <button
                  onClick={handleRefreshData}
                  disabled={isLoading}
                  className={`px-6 py-2 rounded-lg font-medium ${
                    isLoading
                      ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh Data
                </button>
              </div>
            </div>
          ) : (
            <p className="text-red-600 dark:text-red-400">Failed to load round data</p>
          )}
          
          {error && (
            <div className="mt-4 p-4 bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 rounded-lg">
              <p className="text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}
        </div>

        {/* Submitted Projects (Pending Approval) */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
            Submitted Projects ({projectCounts.submitted})
          </h2>
          
          {isLoadingProjects ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500 mr-3"></div>
              <span className="text-gray-600 dark:text-gray-400">Loading projects...</span>
            </div>
          ) : projectCounts.submitted > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.filter(project => !project.is_approved).map((project, index) => (
                <AdminProjectCard key={index} project={project} type="submitted" index={index} onApprove={handleApproveProject} isApproving={approvingProjectIndex === index} />
              ))}
            </div>
          ) : (
            <p className="text-gray-600 dark:text-gray-400 text-center py-8">No submitted projects found.</p>
          )}
        </div>

        {/* Approved Projects */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
            Approved Projects ({projectCounts.approved})
          </h2>
          
          {isLoadingProjects ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500 mr-3"></div>
              <span className="text-gray-600 dark:text-gray-400">Loading projects...</span>
            </div>
          ) : projectCounts.approved > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {approvedProjects.map((project, index) => (
                <AdminProjectCard key={index} project={project} type="approved" index={index} />
              ))}
            </div>
          ) : (
            <p className="text-gray-600 dark:text-gray-400 text-center py-8">No approved projects found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel; 
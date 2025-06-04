import React, { useEffect, useState, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useAleo } from '../contexts/AleoContext';
import { useWallet } from '../contexts/WalletContext';

interface ProjectCardProps {
  title: string;
  description: string;
  currentAmount: number;
  targetAmount: number;
  percentFunded: number;
  creatorName: string;
  creatorImage: string;
  image: string;
  projectKey: string;
  projectData: ProjectData;
  onClick: () => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  title,
  description,
  currentAmount,
  targetAmount,
  percentFunded,
  creatorName,
  creatorImage,
  image,
  onClick
}) => {
  const { isDarkMode } = useTheme();

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

  // Create a simple creator avatar using data URL
  const createCreatorAvatar = (initials: string) => {
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 200;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      // Fill with indigo background
      ctx.fillStyle = '#4f46e5';
      ctx.fillRect(0, 0, 200, 200);
      
      // Add initials
      ctx.fillStyle = 'white';
      ctx.font = 'bold 48px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(initials, 100, 120);
    }
    
    return canvas.toDataURL();
  };

  const placeholderImage = createPlaceholderImage();
  const creatorInitials = creatorName.substring(0, 2).toUpperCase();
  const placeholderAvatar = createCreatorAvatar(creatorInitials);

  return (
    <div 
      className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md cursor-pointer transition-transform hover:scale-[1.02] hover:shadow-lg"
      onClick={onClick}
    >
      <div className="h-48 bg-gray-100 dark:bg-gray-700 relative overflow-hidden">
        <img 
          src={image || placeholderImage} 
          alt={title}
          className="w-full h-full object-cover"
          crossOrigin="anonymous"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = placeholderImage;
          }}
        />
      </div>
      <div className="p-4">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">{title}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{description}</p>
        <div className="mb-2">
          <div className="text-xs text-gray-500 dark:text-gray-400 uppercase mb-1">COLLECTED</div>
          <div className="flex items-center justify-between mb-1">
            <div className="text-gray-800 dark:text-white font-bold">{currentAmount.toLocaleString()} <span className="text-gray-500 dark:text-gray-400 font-normal">/ {targetAmount.toLocaleString()} Credits</span></div>
            <div className="text-blue-600 dark:text-blue-400">{percentFunded}% Funded</div>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full" 
              style={{ width: `${percentFunded}%` }}
            ></div>
          </div>
        </div>
        <div className="flex items-center mt-4">
          <img 
            src={creatorImage || placeholderAvatar} 
            alt={creatorName}
            className="w-8 h-8 rounded-full mr-2 border border-gray-200 dark:border-gray-700"
            crossOrigin="anonymous"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = placeholderAvatar;
            }}
          />
          <span className="text-gray-800 dark:text-white text-sm">{creatorName}</span>
        </div>
      </div>
    </div>
  );
};

interface ProjectData {
  projectKey: string;
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
  aleoInteractionKey?: string;
  originalIndex?: number;
}

const FundingPlatform: React.FC = () => {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const { connected } = useWallet();
  const { currentRound, fetchCurrentRound, isLoading, error, fetchAllProjects, getProjectKey } = useAleo();
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [daysLeft, setDaysLeft] = useState<number>(14);
  const [isLoadingProjects, setIsLoadingProjects] = useState<boolean>(false);
  const hasFetchedProjects = useRef<boolean>(false);
  const hasFetchedRound = useRef<boolean>(false);
  
  // Load round information when component mounts (no wallet connection required for browsing)
  useEffect(() => {
    if (!hasFetchedRound.current) {
      hasFetchedRound.current = true;
      fetchCurrentRound();
    }
  }, [fetchCurrentRound]);
  
  // Load projects when round information changes
  useEffect(() => {
    if (currentRound && !hasFetchedProjects.current && !isLoadingProjects) {
      hasFetchedProjects.current = true;
      setIsLoadingProjects(true);
      
      // Fetch approved projects regardless of round status for display
      fetchAllProjects(currentRound.round_id)
        .then(async (fetchedProjects) => {
          if (fetchedProjects.length > 0) {
            // Process all projects and generate their keys
            const processedProjects: ProjectData[] = [];
            
            for (let arrayIndex = 0; arrayIndex < fetchedProjects.length; arrayIndex++) {
              const project = fetchedProjects[arrayIndex];
              const projectIndex = arrayIndex + 1; // Project indices start from 1 in Aleo contract
              
              const hasValidOwner = project.project_owner && project.project_owner.trim() !== '';
              const hasValidTitle = project.project_details?.title && project.project_details.title.trim() !== '';
              const isApproved = project.is_approved === true;
              
              // Only include approved projects in the UI
              if (hasValidOwner && hasValidTitle && isApproved) {
                const aleoKeyWithSuffix = await getProjectKey(currentRound.round_id, projectIndex);
                
                if (!aleoKeyWithSuffix) {
                  console.error(`FundingPlatform: Failed to generate project key for approved project at projectIndex ${projectIndex}`);
                  continue; // Skip this project if we can't generate a key
                }
                
                const projectKeyForUrl = aleoKeyWithSuffix.replace(/field$/, '');
                
                // Default target amount - in a real app, this could be stored elsewhere
                const targetAmount = 10_000_000;
                const percentFunded = Math.min(
                  Math.round((project.collected_amount / targetAmount) * 100),
                  100
                );
                
                const uiProject: ProjectData = {
                  projectKey: projectKeyForUrl,
                  title: project.project_details.title,
                  description: project.project_details.description,
                  image: project.project_details.img || '', // Will use placeholder in component
                  currentAmount: project.collected_amount,
                  targetAmount: targetAmount,
                  percentFunded: percentFunded,
                  contributors: project.num_supporters,
                  daysLeft: currentRound.is_active ? daysLeft : 0,
                  creatorName: `${project.project_owner.substring(0, 6)}...${project.project_owner.substring(project.project_owner.length - 4)}`,
                  creatorImage: '', // Will use placeholder in component
                  overview: project.project_details.description,
                  status: project.is_approved ? 'Approved' : 'Pending',
                  roundInfo: `Round #${project.joined_round}`,
                  aleoInteractionKey: aleoKeyWithSuffix, // Store full key for blockchain interactions
                  originalIndex: projectIndex // Store project index (1-based) for reference
                };
                
                processedProjects.push(uiProject);
              }
            }
            
            setProjects(processedProjects);
          } else {
            // No projects found, clear the projects array
            setProjects([]);
          }
          setIsLoadingProjects(false);
        })
        .catch(error => {
          console.error('Error fetching approved projects:', error);
          setProjects([]);
          setIsLoadingProjects(false);
        });
    }
  }, [currentRound, fetchAllProjects, getProjectKey, isLoadingProjects, daysLeft]);
  
  // Handle project card click to navigate to project details
  const handleProjectClick = (project: ProjectData) => {
    // Navigate with project data passed via router state
    navigate(`/project/${project.projectKey}`, { 
      state: { 
        projectData: project,
        fromHomepage: true // Flag to indicate this came from homepage
      } 
    });
    window.scrollTo(0, 0); // Scroll to top when navigating
  };

  // Handle submit project button click
  const handleSubmitProjectClick = () => {
    navigate('/submit');
    window.scrollTo(0, 0);
  };

  // Handle explore grants button click
  const handleExploreGrantsClick = () => {
    // Scroll to the projects section
    const projectsSection = document.getElementById('projects-section');
    if (projectsSection) {
      projectsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="py-20 text-center px-4">
        <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
          Funding the <span className="bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-blue-300 dark:to-indigo-400 text-transparent bg-clip-text">Future</span> Together
        </h1>
        <p className="text-xl text-gray-700 dark:text-gray-300 mb-10 max-w-3xl mx-auto">
          Discover and support innovative projects at the intersection of science and technology
        </p>
        <div className="flex justify-center gap-4 flex-wrap">
          <button 
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-full font-medium"
            onClick={handleExploreGrantsClick}
          >
            Explore Current Grants
          </button>
          <button 
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-full font-medium flex items-center"
            onClick={handleSubmitProjectClick}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Submit Your Project
          </button>
        </div>
      </div>

      {/* Projects Section */}
      <div id="projects-section" className="max-w-7xl mx-auto px-4 pb-20">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {currentRound ? `Round #${currentRound.round_id}` : 'Current Grant Round'}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {currentRound 
                ? `${projects.length} ${projects.length === 1 ? 'project is' : 'projects are'} seeking funding in this round` 
                : 'Loading project information...'}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 dark:bg-indigo-900 rounded-full px-4 py-2 text-blue-800 dark:text-white flex items-center">
              <span className={`${currentRound?.is_active ? 'bg-green-500' : 'bg-red-500'} w-3 h-3 rounded-full inline-block mr-2`}></span>
              {currentRound?.is_active 
                ? `Round active - ends in: ${daysLeft} days` 
                : 'Round not active'}
            </div>
            <button className="bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-white border border-gray-200 dark:border-gray-700 px-4 py-2 rounded-lg flex items-center shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filter
            </button>
          </div>
        </div>

        {isLoading || isLoadingProjects ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        ) : projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map(project => (
              <ProjectCard
                key={project.projectKey}
                title={project.title}
                description={project.description}
                currentAmount={project.currentAmount}
                targetAmount={project.targetAmount}
                percentFunded={project.percentFunded}
                creatorName={project.creatorName}
                creatorImage={project.creatorImage}
                image={project.image}
                projectKey={project.projectKey}
                projectData={project}
                onClick={() => handleProjectClick(project)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-4">
              {currentRound && currentRound.is_active 
                ? "No current active projects."
                : currentRound
                  ? "Round not active. No projects to display."
                  : "Loading projects..."}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {currentRound && currentRound.is_active
                ? "There are no active projects in the current round. Why not submit one?"
                : currentRound
                  ? "Check back later when a new round starts."
                  : "Please wait while we load the current projects."}
            </p>
            {currentRound && currentRound.is_active && (
              <button
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-full font-medium"
                onClick={handleSubmitProjectClick}
              >
                Submit a Project
              </button>
            )}
          </div>
        )}

        {projects.length > 0 && (
          <div className="flex justify-center mt-12">
            <button 
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-full font-medium flex items-center"
              onClick={() => {
                // In a real implementation, you would load more projects
              }}
            >
              Load More Projects
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FundingPlatform; 
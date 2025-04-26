import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { projectsData, ProjectData } from './projectsData';

interface ProjectCardProps {
  title: string;
  description: string;
  currentAmount: number;
  targetAmount: number;
  percentFunded: number;
  creatorName: string;
  creatorImage: string;
  image: string;
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

  return (
    <div 
      className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md cursor-pointer transition-transform hover:scale-[1.02] hover:shadow-lg"
      onClick={onClick}
    >
      <div className="h-48 bg-gray-100 dark:bg-gray-700 relative overflow-hidden">
        <img 
          src={image} 
          alt={title}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-4">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">{title}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{description}</p>
        <div className="mb-2">
          <div className="text-xs text-gray-500 dark:text-gray-400 uppercase mb-1">COLLECTED</div>
          <div className="flex items-center justify-between mb-1">
            <div className="text-gray-800 dark:text-white font-bold">{currentAmount} ETH <span className="text-gray-500 dark:text-gray-400 font-normal">/ {targetAmount} ETH</span></div>
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
            src={creatorImage} 
            alt={creatorName} 
            className="w-8 h-8 rounded-full mr-3"
          />
          <span className="text-gray-800 dark:text-white text-sm">{creatorName}</span>
        </div>
      </div>
    </div>
  );
};

const FundingPlatform: React.FC = () => {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  
  // Handle project card click to navigate to project details
  const handleProjectClick = (projectId: number) => {
    navigate(`/project/${projectId}`);
    window.scrollTo(0, 0); // Scroll to top when navigating
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="py-20 text-center px-4">
        <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
          <span className="bg-gradient-to-r from-indigo-600 to-blue-500 dark:from-indigo-400 dark:to-blue-300 text-transparent bg-clip-text">Funding</span> the <span className="bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-blue-300 dark:to-indigo-400 text-transparent bg-clip-text">Future</span> <span className="bg-gradient-to-r from-indigo-600 to-blue-500 dark:from-indigo-400 dark:to-blue-300 text-transparent bg-clip-text">Together</span>
        </h1>
        <p className="text-xl text-gray-700 dark:text-gray-300 mb-10 max-w-3xl mx-auto">
          Discover and support innovative projects at the intersection of science and technology
        </p>
        <div className="flex justify-center gap-4 flex-wrap">
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-full font-medium">
            Explore Current Grants
          </button>
          <button className="bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-white dark:text-white border border-gray-300 dark:border-gray-600 px-6 py-3 rounded-full font-medium">
            Learn How it Works
          </button>
        </div>
      </div>

      {/* Projects Section */}
      <div className="max-w-7xl mx-auto px-4 pb-20">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Current Grant Round</h2>
            <p className="text-gray-600 dark:text-gray-400">Innovative projects seeking funding this month</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 dark:bg-indigo-900 rounded-full px-4 py-2 text-blue-800 dark:text-white flex items-center">
              <span className="bg-blue-500 dark:bg-indigo-600 w-3 h-3 rounded-full inline-block mr-2"></span>
              Round ends in: 14 days
            </div>
            <button className="bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-white border border-gray-200 dark:border-gray-700 px-4 py-2 rounded-lg flex items-center shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filter
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projectsData.map(project => (
            <ProjectCard
              key={project.id}
              title={project.title}
              description={project.description}
              currentAmount={project.currentAmount}
              targetAmount={project.targetAmount}
              percentFunded={project.percentFunded}
              creatorName={project.creatorName}
              creatorImage={project.creatorImage}
              image={project.image}
              onClick={() => handleProjectClick(project.id)}
            />
          ))}
        </div>

        <div className="flex justify-center mt-12">
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-full font-medium flex items-center">
            Load More Projects
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default FundingPlatform; 
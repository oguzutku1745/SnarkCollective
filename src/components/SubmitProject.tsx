import React, { useState, useEffect, useRef } from 'react';
import { useAleo } from '../contexts/AleoContext';
import { useWallet } from '../contexts/WalletContext';
import { useNavigate } from 'react-router-dom';

const SubmitProject: React.FC = () => {
  const navigate = useNavigate();
  const { connected, address } = useWallet();
  const { submitProject, fetchCurrentRound, currentRound, isLoading, error } = useAleo();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    targetAmount: '',
  });
  
  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const hasFetchedRound = useRef<boolean>(false);
  
  // Fetch current round when component mounts
  useEffect(() => {
    if (connected && !currentRound && !hasFetchedRound.current) {
      hasFetchedRound.current = true;
      fetchCurrentRound();
    }
  }, [connected, currentRound, fetchCurrentRound]);
  
  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!connected) {
      setStatusMessage('Please connect your wallet first');
      setSubmissionStatus('error');
      return;
    }
    
    if (!currentRound) {
      setStatusMessage('Unable to fetch round information');
      setSubmissionStatus('error');
      return;
    }
    
    if (currentRound.is_active) {
      setStatusMessage('Projects can only be submitted when a round is not active');
      setSubmissionStatus('error');
      return;
    }
    
    // Validate form
    if (!formData.title.trim() || !formData.description.trim() || !formData.imageUrl.trim()) {
      setStatusMessage('Please fill out all required fields');
      setSubmissionStatus('error');
      return;
    }
    
    setSubmissionStatus('loading');
    setStatusMessage('Converting strings and submitting your project...');
    
    try {
      // Convert strings to field format using Leo Stringer
      const projectInputs = {
        title: formData.title,
        img: formData.imageUrl,
        description: formData.description
      };
      
      const success = await submitProject(projectInputs.title, projectInputs.img, projectInputs.description);
      
      if (success) {
        setSubmissionStatus('success');
        setStatusMessage('Project submitted successfully!');
        
        // Reset form after successful submission
        setFormData({
          title: '',
          description: '',
          imageUrl: '',
          targetAmount: '',
        });
        
        // Redirect to home after 2 seconds
        setTimeout(() => {
          navigate('/');
        }, 2000);
      } else {
        throw new Error('Failed to submit project');
      }
    } catch (err: any) {
      setSubmissionStatus('error');
      setStatusMessage(err.message || 'Failed to submit project');
    }
  };
  
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Submit Your Project</h1>
        
        {!connected ? (
          <div className="bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900/30 text-yellow-700 dark:text-yellow-400 px-4 py-3 rounded-lg mb-6">
            Please connect your wallet to submit a project.
          </div>
        ) : currentRound && currentRound.is_active ? (
          <div className="bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900/30 text-yellow-700 dark:text-yellow-400 px-4 py-3 rounded-lg mb-6">
            Project submissions are only allowed between funding rounds. Currently round #{currentRound.round_id} is active.
          </div>
        ) : null}
        
        {statusMessage && (
          <div className={`mb-6 p-4 rounded-lg ${
            submissionStatus === 'success' ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 
            submissionStatus === 'error' ? 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400' :
            'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
          }`}>
            {statusMessage}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Project Title*
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="block w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter a clear, descriptive title"
              disabled={submissionStatus === 'loading' || (currentRound?.is_active === true)}
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Project Description*
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={6}
              className="block w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Describe your project, its goals, and why it's important"
              disabled={submissionStatus === 'loading' || (currentRound?.is_active === true)}
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Project Image URL*
            </label>
            <input
              type="text"
              id="imageUrl"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleInputChange}
              className="block w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="https://example.com/your-image.jpg"
              disabled={submissionStatus === 'loading' || (currentRound?.is_active === true)}
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="targetAmount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Target Funding Amount (Credits)
            </label>
            <input
              type="text"
              id="targetAmount"
              name="targetAmount"
              value={formData.targetAmount}
              onChange={handleInputChange}
              className="block w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="100000"
              disabled={submissionStatus === 'loading' || (currentRound?.is_active === true)}
            />
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              This is for display purposes. The actual funding goal is tracked on-chain.
            </p>
          </div>
          
          <div className="flex justify-between items-center mt-8">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            
            <button
              type="submit"
              disabled={
                submissionStatus === 'loading' || 
                !connected || 
                (currentRound?.is_active === true)
              }
              className={`px-6 py-2 rounded-lg font-medium ${
                submissionStatus === 'loading' || !connected || (currentRound?.is_active === true)
                  ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              }`}
            >
              {submissionStatus === 'loading' ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </div>
              ) : 'Submit Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubmitProject; 
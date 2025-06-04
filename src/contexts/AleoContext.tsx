import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { useWallet } from './WalletContext';
import { useDokoJsWASM } from '../hooks/useDokoJsWasm';

// Program constants
const PROGRAM_ID = 'snarkcollective_program.aleo';

interface Round {
  round_id: number;
  is_active: boolean;
  approved_projects: number;
  submitted_projects: number;
}

interface ProjectDetails {
  title: string;
  img: string;
  description: string;
  // Store original field values for transactions
  title_field?: string;
  img_field?: string;
  description_field?: string;
}

interface ProjectInfo {
  project_owner: string;
  collected_amount: number;
  joined_round: number;
  num_supporters: number;
  is_approved: boolean;
  is_claimed: boolean;
  project_details: ProjectDetails;
}

interface AleoContextType {
  currentRound: Round | null;
  isLoading: boolean;
  error: string | null;
  fetchCurrentRound: () => Promise<Round | null>;
  forceRefreshRound: () => Promise<Round | null>;
  startRound: () => Promise<boolean>;
  finishRound: () => Promise<boolean>;
  submitProject: (title: string, img: string, description: string) => Promise<boolean>;
  donateToProject: (projectKey: string, amount: number) => Promise<boolean>;
  approveProject: (roundId: number, projectIndex: number, projectInfo: ProjectInfo) => Promise<boolean>;
  getProjectKey: (roundId: number, projectIndex: number) => Promise<string | null>;
  fetchApprovedProjects: (roundId: number) => Promise<ProjectInfo[]>;
  fetchSubmittedProjects: (roundId: number) => Promise<ProjectInfo[]>;
  fetchAllProjects: (roundId: number) => Promise<ProjectInfo[]>;
}

const AleoContext = createContext<AleoContextType>({
  currentRound: null,
  isLoading: false,
  error: null,
  fetchCurrentRound: async () => null,
  forceRefreshRound: async () => null,
  startRound: async () => false,
  finishRound: async () => false,
  submitProject: async () => false,
  donateToProject: async () => false,
  approveProject: async () => false,
  getProjectKey: async () => null,
  fetchApprovedProjects: async () => [],
  fetchSubmittedProjects: async () => [],
  fetchAllProjects: async () => [],
});

export function AleoProvider({ children }: { children: ReactNode }) {
  const { connected, address, createTransaction } = useWallet();
  const [dokoWasmInstance, wasmLoading, wasmError] = useDokoJsWASM();
  const [currentRound, setCurrentRound] = useState<Round | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Helper function to generate a hash from ProjectKey using BHP256
  const getProjectKey = useCallback(async (roundId: number, projectIndex: number): Promise<string | null> => {
    if (!dokoWasmInstance) {
      if (wasmError) {
        console.error('WASM Error:', wasmError);
      }
      return null;
    }

    if (wasmLoading) {
      return null;
    }

    try {
      // Create the ProjectKey struct string as Leo would represent it
      const projectKeyString = `{round_id: ${roundId}u32, project_index: ${projectIndex}u16}`;
      
      // Check if Hasher is available
      if (!dokoWasmInstance.Hasher || typeof dokoWasmInstance.Hasher.hash !== 'function') {
        console.error('❌ Hasher not available in WASM instance');
        return null;
      }
      
      // Use BHP256 hash to field as specified in the Leo program
      const hashedKey = dokoWasmInstance.Hasher.hash('bhp256', projectKeyString, 'field', 'testnet');
      
      return hashedKey;
    } catch (error: any) {
      console.error('❌ Error generating project key hash:', error.message);
      return null;
    }
  }, [dokoWasmInstance, wasmLoading, wasmError]);

  // Fetch current round from the contract
  const fetchCurrentRound = useCallback(async (): Promise<Round | null> => {
    // Note: Wallet connection not required for reading round data - only for transactions
    // This allows users to browse round information without connecting their wallet

    // Avoid duplicate fetches
    if (isLoading) return currentRound;
    
    setIsLoading(true);
    setError(null);

    try {
      // Make real API call to Aleo explorer to get round data
      const apiUrl = 'https://api.explorer.provable.com/v1/testnet/program/snarkcollective_program.aleo/mapping/rounds/1u8';
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Get response as text since it's not valid JSON
      const responseText = await response.text();
      
      // Parse the string manually to extract values
      // Expected format: "{ round_id: 0u32, is_active: false, approved_projects: 0u16, submitted_projects: 1u16 }"
      
      const parseAleoStringResponse = (text: string) => {
        const roundIdMatch = text.match(/round_id:\s*(\d+)u32/);
        const isActiveMatch = text.match(/is_active:\s*(true|false)/);
        const approvedProjectsMatch = text.match(/approved_projects:\s*(\d+)u16/);
        const submittedProjectsMatch = text.match(/submitted_projects:\s*(\d+)u16/);
        
        return {
          round_id: roundIdMatch ? roundIdMatch[1] + 'u32' : '0u32',
          is_active: isActiveMatch ? isActiveMatch[1] : 'false',
          approved_projects: approvedProjectsMatch ? approvedProjectsMatch[1] + 'u16' : '0u16',
          submitted_projects: submittedProjectsMatch ? submittedProjectsMatch[1] + 'u16' : '0u16'
        };
      };
      
      const parsedData = parseAleoStringResponse(responseText);
      
      // Helper function to safely parse Aleo values
      const parseAleoValue = (value: any, suffix: string): number => {
        if (value === null || value === undefined) {
          return 0;
        }
        
        if (typeof value === 'number') {
          return value;
        }
        
        if (typeof value === 'string') {
          const cleanValue = value.replace(suffix, '').trim();
          const parsed = parseInt(cleanValue);
          return isNaN(parsed) ? 0 : parsed;
        }
        
        return 0;
      };
      
      // Helper function to safely parse boolean values
      const parseAleoBoolean = (value: any): boolean => {
        if (value === null || value === undefined) {
          return false;
        }
        
        if (typeof value === 'boolean') {
          return value;
        }
        
        if (typeof value === 'string') {
          return value.toLowerCase() === 'true';
        }
        
        return false;
      };
      
      // Convert the parsed data to our Round interface
      const parsedRound: Round = {
        round_id: parseAleoValue(parsedData.round_id, 'u32'),
        is_active: parseAleoBoolean(parsedData.is_active),
        approved_projects: parseAleoValue(parsedData.approved_projects, 'u16'),
        submitted_projects: parseAleoValue(parsedData.submitted_projects, 'u16')
      };
      
      setCurrentRound(parsedRound);
      return parsedRound;
    } catch (error: any) {
      const errorMsg = error?.message || 'Failed to fetch round data from blockchain';
      console.error('❌ Error fetching round data:', error);
      setError(errorMsg);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  // Start a round (admin only)
  const startRound = useCallback(async (): Promise<boolean> => {
    if (!connected || !address) {
      setError('Wallet not connected');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await createTransaction({
        programId: PROGRAM_ID,
        functionName: 'start_round',
        inputs: [],
        fee: 2_000_000, // Set appropriate fee
      });

      if (result.error) {
        throw new Error(result.error);
      }

      // Refresh round data after starting a round
      await fetchCurrentRound();
      return true;
    } catch (error: any) {
      const errorMsg = error?.message || 'Failed to start round';
      setError(errorMsg);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [connected, address, createTransaction]);

  // Finish a round (admin only)
  const finishRound = useCallback(async (): Promise<boolean> => {
    if (!connected || !address) {
      setError('Wallet not connected');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await createTransaction({
        programId: PROGRAM_ID,
        functionName: 'finish_round',
        inputs: [],
        fee: 2_000_000, // Set appropriate fee
      });

      if (result.error) {
        throw new Error(result.error);
      }

      // Refresh round data after finishing a round
      await fetchCurrentRound();
      return true;
    } catch (error: any) {
      const errorMsg = error?.message || 'Failed to finish round';
      setError(errorMsg);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [connected, address, createTransaction]);

  // Submit a project
  const submitProject = useCallback(async (title: string, img: string, description: string): Promise<boolean> => {
    if (!connected || !address) {
      setError('Wallet not connected');
      return false;
    }

    if (!currentRound) {
      await fetchCurrentRound();
      if (!currentRound) {
        setError('Could not fetch current round');
        return false;
      }
    }

    setIsLoading(true);
    setError(null);

    try {
      // Based on the main.leo contract, we need to provide round_id and project_index
      const roundId = currentRound.round_id;
      const projectIndex = currentRound.submitted_projects + 1;

      const result = await createTransaction({
        programId: PROGRAM_ID,
        functionName: 'submit_project',
        inputs: [
          title,         // title: field (converted from string)
          img,           // img: field (converted from string)
          description,   // description: field (converted from string)
          `${roundId}u32`,       // round_id: u32
          `${projectIndex}u16`,  // project_index: u16
        ],
        fee: 2_000_000, // Set appropriate fee
      });

      if (result.error) {
        throw new Error(result.error);
      }

      // Refresh round data after submitting a project
      await fetchCurrentRound();
      return true;
    } catch (error: any) {
      const errorMsg = error?.message || 'Failed to submit project';
      setError(errorMsg);
      console.error('Project submission error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [connected, address, currentRound, createTransaction]);

  // Donate to a project
  const donateToProject = useCallback(async (projectKey: string, amount: number): Promise<boolean> => {
    if (!connected || !address) {
      setError('Wallet not connected');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await createTransaction({
        programId: PROGRAM_ID,
        functionName: 'donate_public',
        inputs: [
          projectKey,  // project_key: field (already hashed)
          `${amount}u64`,      // amount: u64
          address,     // user_address: address
        ],
        fee: 2_000_000, // Set appropriate fee
      });

      if (result.error) {
        throw new Error(result.error);
      }

      return true;
    } catch (error: any) {
      const errorMsg = error?.message || 'Failed to donate to project';
      setError(errorMsg);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [connected, address, createTransaction]);

  // Fetch approved projects for a given round
  const fetchApprovedProjects = useCallback(async (roundId: number): Promise<ProjectInfo[]> => {
    // Note: Wallet connection not required for reading project data - only for transactions
    // This allows users to browse projects without connecting their wallet

    if (!dokoWasmInstance) {
      const errorMsg = wasmError 
        ? `WASM initialization failed: ${wasmError}` 
        : wasmLoading 
          ? 'WASM is still loading, please wait...' 
          : 'DokoJS WASM not loaded yet';
      setError(errorMsg);
      return [];
    }

    if (wasmLoading) {
      setError('WASM is still loading, please wait...');
      return [];
    }

    setIsLoading(true);
    setError(null);

    try {
      const projects: ProjectInfo[] = [];
      
      // Get the current round to know how many projects to check
      const round = currentRound || await fetchCurrentRound();
      if (!round) {
        return [];
      }

      // Iterate through all possible project indices for this round
      for (let projectIndex = 1; projectIndex <= round.approved_projects; projectIndex++) {
        try {
          const projectKey = await getProjectKey(roundId, projectIndex);
          if (!projectKey) {
            continue;
          }

          // Fetch project from project_details_approved mapping
          const apiUrl = `https://api.explorer.provable.com/v1/testnet/program/snarkcollective_program.aleo/mapping/project_details_approved/${projectKey}`;
          
          const response = await fetch(apiUrl);
          
          if (response.ok) {
            const responseText = await response.text();
            
            // Parse the project data from the API response
            const projectInfo = parseProjectInfoFromApi(responseText);
            if (projectInfo) {
              // Only include projects that are actually approved
              if (projectInfo.is_approved) {
                projects.push(projectInfo);
              }
            }
          }
        } catch (error) {
          console.error(`❌ Error fetching project ${projectIndex}:`, error);
          // Continue with next project instead of failing completely
        }
      }

      return projects;
    } catch (error: any) {
      const errorMsg = error?.message || 'Failed to fetch approved projects';
      console.error('❌ fetchApprovedProjects error:', errorMsg);
      setError(errorMsg);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [dokoWasmInstance, wasmLoading, wasmError, currentRound, fetchCurrentRound, getProjectKey]);

  // Fetch submitted projects for a given round (admin only)
  const fetchSubmittedProjects = useCallback(async (roundId: number): Promise<ProjectInfo[]> => {
    // Note: Wallet connection not required for reading project data - only for transactions
    // This allows users to browse projects without connecting their wallet

    if (!dokoWasmInstance) {
      const errorMsg = wasmError 
        ? `WASM initialization failed: ${wasmError}` 
        : wasmLoading 
          ? 'WASM is still loading, please wait...' 
          : 'DokoJS WASM not loaded yet';
      setError(errorMsg);
      console.error('❌', errorMsg);
      return [];
    }

    if (wasmLoading) {
      setError('WASM is still loading, please wait...');
      return [];
    }

    setIsLoading(true);
    setError(null);

    try {
      const projects: ProjectInfo[] = [];
      
      // Get the current round to know how many projects to check
      const round = currentRound || await fetchCurrentRound();
      if (!round) {
        return [];
      }

      // Iterate through all possible project indices for this round
      for (let projectIndex = 1; projectIndex <= round.submitted_projects; projectIndex++) {
        try {
          const projectKey = await getProjectKey(roundId, projectIndex);
          if (!projectKey) continue;

          // Fetch project from project_details_submitted mapping
          const response = await fetch(`https://api.explorer.provable.com/v1/testnet/program/snarkcollective_program.aleo/mapping/project_details_submitted/${projectKey}`);
          
          if (response.ok) {
            const responseText = await response.text();
            
            // Parse the project data from the API response
            const projectInfo = parseProjectInfoFromApi(responseText);
            if (projectInfo) {
              // Only include projects that are NOT approved yet
              if (!projectInfo.is_approved) {
                projects.push(projectInfo);
              }
            }
          }
        } catch (error) {
          console.error(`Error fetching submitted project ${projectIndex}:`, error);
          // Continue with next project instead of failing completely
        }
      }

      return projects;
    } catch (error: any) {
      const errorMsg = error?.message || 'Failed to fetch submitted projects';
      setError(errorMsg);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [dokoWasmInstance, wasmLoading, wasmError, currentRound, fetchCurrentRound, getProjectKey]);

  // Fetch all projects (both submitted and approved) for a given round
  const fetchAllProjects = useCallback(async (roundId: number): Promise<ProjectInfo[]> => {
    // Note: Wallet connection not required for reading project data - only for transactions
    // This allows users to browse projects without connecting their wallet

    if (!dokoWasmInstance) {
      const errorMsg = wasmError 
        ? `WASM initialization failed: ${wasmError}` 
        : wasmLoading 
          ? 'WASM is still loading, please wait...' 
          : 'DokoJS WASM not loaded yet';
      setError(errorMsg);
      return [];
    }

    if (wasmLoading) {
      setError('WASM is still loading, please wait...');
      return [];
    }

    setIsLoading(true);
    setError(null);

    try {
      const allProjects: ProjectInfo[] = [];
      
      // Get the current round to know how many projects to check
      const round = currentRound || await fetchCurrentRound();
      if (!round) {
        return [];
      }

      // Fetch from both mappings to get all projects
      const maxProjects = Math.max(round.submitted_projects, round.approved_projects);
      
      for (let projectIndex = 1; projectIndex <= maxProjects; projectIndex++) {
        try {
          const projectKey = await getProjectKey(roundId, projectIndex);
          if (!projectKey) {
            continue;
          }

          // Check approved mapping first - if found here, this is the authoritative version
          const approvedUrl = `https://api.explorer.provable.com/v1/testnet/program/snarkcollective_program.aleo/mapping/project_details_approved/${projectKey}`;
          const submittedUrl = `https://api.explorer.provable.com/v1/testnet/program/snarkcollective_program.aleo/mapping/project_details_submitted/${projectKey}`;
          
          let projectInfo = null;
          
          // Try approved mapping first - this takes priority
          try {
            const approvedResponse = await fetch(approvedUrl);
            if (approvedResponse.ok) {
              const responseText = await approvedResponse.text();
              projectInfo = parseProjectInfoFromApi(responseText);
              if (projectInfo) {
                // This project exists in approved mapping, so it should only appear in approved section
                allProjects.push(projectInfo);
                continue; // Skip checking submitted mapping since we found it in approved
              }
            }
          } catch (error) {
            // Continue to check submitted mapping
          }

          // Only check submitted mapping if NOT found in approved mapping
          try {
            const submittedResponse = await fetch(submittedUrl);
            if (submittedResponse.ok) {
              const responseText = await submittedResponse.text();
              projectInfo = parseProjectInfoFromApi(responseText);
              if (projectInfo) {
                // This project exists only in submitted mapping, so it should appear in submitted section
                allProjects.push(projectInfo);
              }
            }
          } catch (error) {
            // Continue with next project
          }
        } catch (error) {
          console.error(`❌ Error fetching project ${projectIndex}:`, error);
          // Continue with next project instead of failing completely
        }
      }

      return allProjects;
    } catch (error: any) {
      const errorMsg = error?.message || 'Failed to fetch all projects';
      console.error('❌ fetchAllProjects error:', errorMsg);
      setError(errorMsg);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [dokoWasmInstance, wasmLoading, wasmError, currentRound, fetchCurrentRound, getProjectKey]);

  // Helper function to decode Leo field values back to strings
  const decodeFieldToString = (fieldValue: string): string => {
    try {
      // Remove 'field' suffix and convert to BigInt
      const fieldNumber = BigInt(fieldValue.replace('field', ''));
      
      // Convert BigInt to bytes array (little-endian)
      const bytes: number[] = [];
      let num = fieldNumber;
      
      // Extract bytes in little-endian order
      while (num > 0n) {
        bytes.push(Number(num & 0xFFn));
        num = num >> 8n;
      }
      
      // Convert bytes to string, stopping at null terminator
      let result = '';
      for (const byte of bytes) {
        if (byte === 0) break; // Stop at null terminator
        result += String.fromCharCode(byte);
      }
      
      return result.trim();
    } catch (error) {
      console.error('Error decoding field value:', fieldValue, error);
      return fieldValue; // Return original if decoding fails
    }
  };

  // Helper function to parse ProjectInfo from API response
  const parseProjectInfoFromApi = (responseText: string): ProjectInfo | null => {
    try {
      // Handle null or empty responses
      if (!responseText || responseText.trim() === '' || responseText === 'null') {
        return null;
      }
      
      // Parse the Leo struct format
      // Remove outer braces and split by commas, but be careful with nested objects
      const cleanText = responseText.replace(/^["\s{]+|["\s}]+$/g, '');
      
      // Parse the main fields
      const projectOwnerMatch = cleanText.match(/project_owner:\s*([^,\n]+)/);
      const collectedAmountMatch = cleanText.match(/collected_amount:\s*(\d+)u64/);
      const joinedRoundMatch = cleanText.match(/joined_round:\s*(\d+)u32/);
      const numSupportersMatch = cleanText.match(/num_supporters:\s*(\d+)u32/);
      const isApprovedMatch = cleanText.match(/is_approved:\s*(true|false)/);
      const isClaimedMatch = cleanText.match(/is_claimed:\s*(true|false)/);
      
      // Parse nested project_details
      const titleMatch = cleanText.match(/title:\s*(\d+field)/);
      const imgMatch = cleanText.match(/img:\s*(\d+field)/);
      const descriptionMatch = cleanText.match(/description:\s*(\d+field)/);

      // Decode field values to strings
      const decodedTitle = titleMatch?.[1] ? decodeFieldToString(titleMatch[1]) : '';
      const decodedImg = imgMatch?.[1] ? decodeFieldToString(imgMatch[1]) : '';
      const decodedDescription = descriptionMatch?.[1] ? decodeFieldToString(descriptionMatch[1]) : '';

      // Extract nested ProjectDetails
      const projectDetails: ProjectDetails = {
        title: decodedTitle,
        img: decodedImg,
        description: decodedDescription,
        title_field: titleMatch?.[1],
        img_field: imgMatch?.[1],
        description_field: descriptionMatch?.[1]
      };

      const projectInfo: ProjectInfo = {
        project_owner: projectOwnerMatch?.[1]?.trim() || '',
        collected_amount: parseInt(collectedAmountMatch?.[1] || '0'),
        joined_round: parseInt(joinedRoundMatch?.[1] || '0'),
        num_supporters: parseInt(numSupportersMatch?.[1] || '0'),
        is_approved: isApprovedMatch?.[1] === 'true',
        is_claimed: isClaimedMatch?.[1] === 'true',
        project_details: projectDetails
      };

      return projectInfo;
    } catch (error) {
      console.error('❌ Error parsing project info:', error);
      return null;
    }
  };

  // Approve a project (admin only)
  const approveProject = useCallback(async (roundId: number, projectIndex: number, projectInfo: ProjectInfo): Promise<boolean> => {
    if (!connected || !address) {
      setError('Wallet not connected');
      return false;
    }

    if (!dokoWasmInstance) {
      setError('WASM not loaded - please wait and try again');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Generate the project key
      const projectKey = await getProjectKey(roundId, projectIndex);
      if (!projectKey) {
        throw new Error('Failed to generate project key');
      }

      // Format ProjectInfo in Leo struct syntax (not JSON)
      // Leo expects: "{field1: value1, field2: value2, nested: {field3: value3}}"
      // Use original field values for the transaction, not decoded strings
      const titleField = projectInfo.project_details.title_field || `"${projectInfo.project_details.title}"`;
      const imgField = projectInfo.project_details.img_field || `"${projectInfo.project_details.img}"`;
      const descriptionField = projectInfo.project_details.description_field || `"${projectInfo.project_details.description}"`;
      
      const projectInfoLeoFormat = `{project_owner: ${projectInfo.project_owner}, collected_amount: ${projectInfo.collected_amount}u64, joined_round: ${projectInfo.joined_round}u32, num_supporters: ${projectInfo.num_supporters}u32, is_approved: ${projectInfo.is_approved}, is_claimed: ${projectInfo.is_claimed}, project_details: {title: ${titleField}, img: ${imgField}, description: ${descriptionField}}}`;

      const result = await createTransaction({
        programId: PROGRAM_ID,
        functionName: 'approve_project',
        inputs: [
          projectKey,                // project_key: field
          projectInfoLeoFormat       // project_info: ProjectInfo (Leo struct format)
        ],
        fee: 500_000, // Set appropriate fee
      });

      if (result.error) {
        throw new Error(result.error);
      }

      // Refresh round data after approving a project
      await fetchCurrentRound();
      return true;
    } catch (error: any) {
      const errorMsg = error?.message || 'Failed to approve project';
      setError(errorMsg);
      console.error('Project approval error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [connected, address, dokoWasmInstance, createTransaction, getProjectKey, fetchCurrentRound]);

  const contextValue: AleoContextType = {
    currentRound,
    isLoading,
    error,
    fetchCurrentRound,
    forceRefreshRound: fetchCurrentRound,
    startRound,
    finishRound,
    submitProject,
    donateToProject,
    approveProject,
    getProjectKey,
    fetchApprovedProjects,
    fetchSubmittedProjects,
    fetchAllProjects,
  };

  return (
    <AleoContext.Provider value={contextValue}>
      {children}
    </AleoContext.Provider>
  );
}

// Custom hook for using the Aleo context
export function useAleo() {
  const context = useContext(AleoContext);
  if (context === undefined) {
    throw new Error('useAleo must be used within an AleoProvider');
  }
  return context;
} 
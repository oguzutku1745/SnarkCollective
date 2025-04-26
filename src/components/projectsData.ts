export interface ProjectData {
  id: number;
  title: string;
  description: string;
  currentAmount: number;
  targetAmount: number;
  percentFunded: number;
  creatorName: string;
  creatorImage: string;
  image: string;
  tags?: string[];
  status?: string;
  roundInfo?: string;
  overview?: string;
  keyInnovations?: string[];
  researchProgress?: string;
  impactAndApplications?: string[];
  contributors?: number;
  daysLeft?: number;
}

// Project data 
export const projectsData: ProjectData[] = [
  {
    id: 1,
    title: 'Quantum Neural Interface Project',
    description: 'A revolutionary brain-computer interface utilizing quantum computing principles to enhance human cognitive abilities and connect neural pathways to digital environments.',
    currentAmount: 245.78,
    targetAmount: 500,
    percentFunded: 49.2,
    creatorName: 'Dr. Alex Mercer',
    creatorImage: 'https://randomuser.me/api/portraits/men/32.jpg',
    image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
    tags: ['Neuroscience', 'Quantum Computing', 'AI Integration'],
    roundInfo: 'Round 4 - Ending in 14 days',
    status: 'ACTIVE',
    overview: "The Quantum Neural Interface (QNI) project represents a paradigm shift in how humans interact with technology. By leveraging quantum computing principles, we\'re developing a non-invasive interface that can interpret neural signals with unprecedented accuracy and speed.",
    keyInnovations: [
      'Quantum entanglement-based signal processing for real-time neural mapping',
      'Non-invasive sensor array utilizing advanced nanomaterials',
      'AI-powered adaptive learning algorithms that improve with usage',
      'Open protocol for third-party application development'
    ],
    researchProgress: "Our team has already achieved several breakthroughs in laboratory settings, demonstrating basic command recognition with 97% accuracy. The current prototype has successfully enabled test subjects to control digital interfaces using only their thoughts, with minimal training required.",
    impactAndApplications: [
      'Medical: Revolutionary solutions for paralysis patients and neurological disorders',
      'Education: Direct knowledge transfer and accelerated learning capabilities',
      'Computing: Intuitive human-computer interaction beyond current interface limitations',
      'Communication: Thought-to-text and thought-to-thought possibilities'
    ],
    contributors: 1423,
    daysLeft: 14
  },
  {
    id: 2,
    title: 'Fusion Energy Breakthrough',
    description: 'Developing a compact fusion reactor that could revolutionize clean energy production.',
    currentAmount: 78.2,
    targetAmount: 150,
    percentFunded: 52.1,
    creatorName: 'Dr. Emma Fusion',
    creatorImage: 'https://randomuser.me/api/portraits/women/44.jpg',
    image: 'https://images.unsplash.com/photo-1589149098258-3e9102cd63d3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
    tags: ['Fusion Energy', 'Clean Energy', 'Physics'],
    roundInfo: 'Round 3 - Ending in 21 days',
    status: 'ACTIVE',
    overview: "Our project aims to develop a breakthrough compact fusion reactor that could revolutionize clean energy production. Using innovative magnetic confinement techniques and advanced materials, we are creating a sustainable fusion solution.",
    keyInnovations: [
      'Advanced magnetic confinement system',
      'Novel plasma stabilization technique',
      'High-temperature superconducting magnets',
      'Efficient heat exchange system'
    ],
    researchProgress: "We have achieved stable plasma confinement for over 30 seconds in our laboratory prototype, a significant milestone. Our team has developed new materials capable of withstanding the extreme conditions inside the reactor.",
    impactAndApplications: [
      'Energy: Zero-carbon electricity generation with minimal waste',
      'Industry: Reliable high-output power for manufacturing',
      'Space: Potential for compact high-energy propulsion systems',
      'Environmental: Replacing fossil fuels with clean energy alternative'
    ],
    contributors: 892,
    daysLeft: 21
  },
  {
    id: 3,
    title: 'Neural Interface Platform',
    description: 'A non-invasive brain-computer interface for controlling digital devices with thought.',
    currentAmount: 63.8,
    targetAmount: 120,
    percentFunded: 53.2,
    creatorName: 'Prof. Michael Neuro',
    creatorImage: 'https://randomuser.me/api/portraits/men/62.jpg',
    image: 'https://images.unsplash.com/photo-1581093198693-b493a8f9358c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
    tags: ['Neuroscience', 'Human-Computer Interaction', 'AI'],
    status: 'ACTIVE',
    roundInfo: 'Round 3 - Ending in 18 days',
    overview: "Our platform combines advanced EEG technology with machine learning to create an accessible neural interface for everyday use. Unlike quantum-based approaches, we focus on practical applications using proven technology that can be commercialized today.",
    keyInnovations: [
      'Advanced EEG signal processing algorithms',
      'Machine learning pattern recognition for thought commands',
      'User-friendly headset design for everyday wear',
      'Extensive SDK for third-party developers'
    ],
    researchProgress: "We've completed three generations of prototypes, with our latest version achieving 85% accuracy across a wide range of users with just 10 minutes of training time. Beta testing with 50 participants has shown promising results for common digital interactions.",
    impactAndApplications: [
      'Accessibility: Enabling digital access for people with mobility limitations',
      'Gaming: Immersive control systems for next-generation entertainment',
      'Productivity: Hands-free computer control for professionals',
      'IoT: Simple thought-based control of smart home devices'
    ],
    contributors: 753,
    daysLeft: 18
  },
  {
    id: 4,
    title: 'Autonomous Helper Robots',
    description: 'Developing affordable helper robots for elderly care and household assistance.',
    currentAmount: 89.5,
    targetAmount: 200,
    percentFunded: 44.8,
    creatorName: 'Dr. Sarah Robotics',
    creatorImage: 'https://randomuser.me/api/portraits/women/22.jpg',
    image: 'https://images.unsplash.com/photo-1535378620166-273708d44e4c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
    tags: ['Robotics', 'Elderly Care', 'Automation'],
    status: 'ACTIVE',
    roundInfo: 'Round 4 - Ending in 14 days',
    contributors: 631,
    daysLeft: 14
  },
  {
    id: 5,
    title: 'Medical Nanorobotics',
    description: 'Pioneering nanobots for targeted drug delivery and non-invasive surgical procedures.',
    currentAmount: 105.3,
    targetAmount: 180,
    percentFunded: 58.5,
    creatorName: 'Dr. James Nano',
    creatorImage: 'https://randomuser.me/api/portraits/men/45.jpg',
    image: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
    tags: ['Nanotechnology', 'Medicine', 'Robotics'],
    status: 'ACTIVE',
    roundInfo: 'Round 3 - Ending in 20 days',
    contributors: 845,
    daysLeft: 20
  },
  {
    id: 6,
    title: 'Vertical Farming Revolution',
    description: 'Developing AI-controlled vertical farms to grow food with 95% less water in urban environments.',
    currentAmount: 68.9,
    targetAmount: 120,
    percentFunded: 57.4,
    creatorName: 'Dr. Olivia Green',
    creatorImage: 'https://randomuser.me/api/portraits/women/28.jpg',
    image: 'https://images.unsplash.com/photo-1601704114459-54e8a6524be6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
    tags: ['Agriculture', 'Sustainability', 'Urban Development'],
    status: 'ACTIVE',
    roundInfo: 'Round 4 - Ending in 17 days',
    contributors: 712,
    daysLeft: 17
  }
]; 
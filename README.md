# Snark Collective - Aleo Wallet Integration Template

A modern, responsive React application template for integrating Aleo wallets into your dApp. This template provides a complete foundation for building decentralized applications on the Aleo blockchain with a focus on user experience and developer productivity.

## Features

- **Multi-Wallet Support**: Integrate with multiple Aleo wallets including Puzzle, Leo, Fox, and Soter
Note: Fox Wallet only supports Mainnet
- **Complete Wallet API**: Unified interface for transactions, signatures, decryption, and record management
- **Theme-Aware Design**: Dynamically changes logos and UI elements based on light/dark mode
- **Modern UI/UX**: Responsive design built with Tailwind CSS
- **Dark Mode**: Built-in dark mode support
- **Wallet Context**: Centralized wallet state management with React Context
- **TypeScript**: Full TypeScript support for better developer experience
- **Vite**
- **React**

## 📋 Prerequisites

- Node.js (v16+)
- npm or yarn
- An Aleo wallet (Puzzle, Leo, Fox, or Soter)

## 🛠️ Getting Started

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/oguzutku1745/snarkcollective.git
   cd snarkcollective
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn
   ```

3. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

## 🧩 Project Structure

```
snarkcollective/
├── public/              # Static assets
├── src/
│   ├── assets/          # Images and other assets
│   │   ├── logo.png           # Logo for dark mode
│   │   ├── logodark.png       # Logo for light mode
│   │   ├── writing.png        # Text logo for dark mode
│   │   ├── writingdark.png    # Text logo for light mode
│   │   └── ... (wallet icons)
│   ├── components/      # UI components
│   │   ├── ConnectWallet.tsx  # Wallet connection component
│   │   ├── Header.tsx         # Application header with theme-aware logos
│   │   ├── Footer.tsx         # Application footer
│   │   ├── Layout.tsx         # Main layout wrapper
│   │   ├── ThemeToggle.tsx    # Dark/light mode toggle
│   │   └── WalletDemo.tsx     # Demo of wallet integration with expandable sections
│   ├── contexts/        # React contexts
│   │   ├── WalletContext.tsx  # Wallet state management
│   │   └── ThemeContext.tsx   # Theme state management
│   ├── main.tsx         # Application entry point
│   └── index.css        # Global styles
├── index.html           # HTML template
├── package.json         # Dependencies and scripts
├── tsconfig.json        # TypeScript configuration
└── vite.config.ts       # Vite configuration
```

## 💼 Key Components

### WalletContext

The `WalletContext` provides a centralized way to manage wallet connections across your application. It handles:

- Wallet connection and disconnection
- Connection state tracking
- Error handling
- Wallet selection
- Transaction, signature, and record management with a unified API for all supported wallets

```tsx
// Example usage in a component
import { useWallet } from '../contexts/WalletContext';

function MyComponent() {
  const { 
    connected, 
    connecting, 
    address, 
    walletName, 
    connectWallet, 
    disconnectWallet,
    createTransaction,
    signMessage,
    decryptMessage,
    getRecords 
  } = useWallet();
  
  // Create a transaction that works with any supported wallet
  const handleTransaction = async () => {
    if (connected) {
      const result = await createTransaction({
        programId: 'credits.aleo',
        functionName: 'transfer',
        inputs: ['aleo1abc...', '1000000u64'],
        fee: 3000
      });
      
      if (result.transactionId) {
        console.log(`Transaction submitted: ${result.transactionId}`);
      }
    }
  };
}
```

### ThemeContext

The `ThemeContext` manages the application's theme state, providing automatic detection of system preferences and persistent theme selection:

```tsx
// Example usage
import { useTheme } from '../contexts/ThemeContext';

function MyComponent() {
  const { theme, isDarkMode, toggleTheme } = useTheme();
  
  return (
    <div>
      <p>Current theme: {theme}</p>
      <button onClick={toggleTheme}>
        Switch to {isDarkMode ? 'light' : 'dark'} mode
      </button>
      
      {/* Conditional rendering based on theme */}
      {isDarkMode ? (
        <img src="/dark-logo.png" alt="Logo" />
      ) : (
        <img src="/light-logo.png" alt="Logo" />
      )}
    </div>
  );
}
```

### ConnectWallet Component

The `ConnectWallet` component provides a ready-to-use UI for connecting to Aleo wallets. It includes:

- Wallet selection modal
- Connection status indicators
- Error handling
- Responsive design

```tsx
// Example usage
import { ConnectWallet } from './components/ConnectWallet';

function App() {
  return (
    <div>
      <ConnectWallet 
        buttonText="Connect Your Wallet" 
        modalTitle="Choose Your Wallet" 
      />
    </div>
  );
}
```

### WalletDemo Component

The `WalletDemo` component showcases how to use the `WalletContext` with an expandable UI:

- Collapsible sections for different wallet operations
- Connection status and wallet information
- Transaction creation demo
- Message signing
- Decryption
- Records management
- Transaction history viewing
- Error details
- Connection logs

This component serves as a reference implementation for a well-organized wallet interface that keeps functionality accessible while maintaining a clean UI.

## 🔧 Customization

### Theming & Branding

The template supports dynamic branding based on the user's theme preference:

1. **Logo Switching**: Place your dark and light mode logo variants in the `assets` directory 
2. **Theme Detection**: The app automatically detects user system preferences
3. **Theme Toggle**: Users can manually switch between themes with the `ThemeToggle` component

### Styling

The template uses Tailwind CSS for styling. You can customize the theme by modifying the `tailwind.config.js` file:

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        // Add your custom colors
      },
      // Add other theme customizations
    },
  },
  // ...
};
```

### Adding New Wallets

To add support for a new wallet:

1. Update the `WalletContext.tsx` file to include the new wallet's connection logic
2. Add the wallet's icon to the `assets` directory
3. Update the `ConnectWallet.tsx` component to include the new wallet option
4. Implement transaction handling for the new wallet in the `createTransaction` method

## 🧪 Optimizations

The codebase includes several optimizations to improve maintainability and performance:

1. **Consolidated Adapter Patterns**: Common patterns for wallet adapters are extracted to reduce code duplication
2. **Centralized Error Handling**: Standardized error handling functions reduce duplication and ensure consistent behavior
3. **Theme-Aware Components**: SVGs and images adapt to the current theme for better visibility

## 📚 Documentation

For more detailed documentation on the Aleo blockchain and wallet integration, visit:

- [Aleo Developer Documentation](https://developer.aleo.org/)
- [Aleo Adapters Documentation](https://github.com/arcane-finance-defi/aleo-wallet-adapters)
- [Puzzle SDK Documentation](https://docs.puzzle.online/)
- [Leo Adapter Documentation](https://github.com/demox-labs/aleo-wallet-adapter)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [Aleo](https://aleo.org/) for building the Aleo blockchain
- [React](https://reactjs.org/) for the amazing frontend library
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- [Vite](https://vitejs.dev/) for the fast build tool

---

Built with ❤️ by the Snark Collective team
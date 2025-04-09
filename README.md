# Snark Collective - Aleo Wallet Integration Template

A modern, responsive React application template for integrating Aleo wallets into your dApp. This template provides a complete foundation for building decentralized applications on the Aleo blockchain with a focus on user experience and developer productivity.

![Snark Collective](https://via.placeholder.com/800x400?text=Snark+Collective)

## 🚀 Features

- **Multi-Wallet Support**: Seamlessly integrate with multiple Aleo wallets including Puzzle, Leo, Fox, and Soter
- **Complete Transaction API**: Unified interface for creating transactions across all supported wallet types
- **Modern UI/UX**: Clean, responsive design built with Tailwind CSS
- **Dark Mode**: Built-in dark mode support with smooth transitions
- **Wallet Context**: Centralized wallet state management with React Context
- **TypeScript**: Full TypeScript support for better developer experience
- **Vite**: Lightning-fast development and build times
- **React 18**: Built on the latest React features

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
│   ├── components/      # UI components
│   │   ├── ConnectWallet.tsx  # Wallet connection component
│   │   ├── Header.tsx         # Application header
│   │   ├── Footer.tsx         # Application footer
│   │   ├── Layout.tsx         # Main layout wrapper
│   │   └── WalletDemo.tsx     # Demo of wallet integration
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
- Transaction creation with a unified API for all supported wallets

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
    createTransaction 
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

The `WalletDemo` component showcases how to use the `WalletContext` to display wallet connection state and create transactions, including:

- Connection status
- Wallet information
- Transaction creation demo for all supported wallets (Puzzle, Leo, Fox, Soter)
- Error messages
- Connection logs

This component serves as a reference implementation for how to consume the wallet context and create transactions in your application, regardless of the wallet type.

## 🔧 Customization

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
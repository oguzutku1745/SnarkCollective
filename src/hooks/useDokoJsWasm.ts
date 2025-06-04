import { useEffect, useState } from "react";

let loadingPromise: any = null;
let loadedSDK: any = null;

async function initializeWasm() {
    try {
        console.log("🔄 Starting WASM initialization...");
        
        // Import the module first to check exports
        const wasmModule = await import("@doko-js/wasm");
        console.log("📦 WASM module imported:", wasmModule);
        console.log("🔍 Available WASM exports:", Object.keys(wasmModule));
        
        // Try to call the default function if it exists
        if (typeof (wasmModule as any).default === 'function') {
            console.log("🔧 Calling WASM default init function...");
            const wasm = await (wasmModule as any).default();
            console.log("✅ WASM initialized", wasm);
        } else {
            console.log("⚠️ No default init function found, checking if WASM is already ready");
        }
        
        // Test that the Hasher is working
        if (wasmModule.Hasher && typeof wasmModule.Hasher.hash === 'function') {
            console.log("🔍 Testing WASM Hasher functionality...");
            
            try {
                const testHash = wasmModule.Hasher.hash('bhp256', 'test', 'field', 'testnet');
                console.log("✅ WASM initialization verified with test hash:", testHash);
            } catch (hashError: any) {
                console.error("❌ Hash test failed:", hashError);
                throw hashError;
            }
        } else {
            throw new Error("Hasher not available in WASM module");
        }
        
        console.log("🎉 WASM module ready for use");
        return wasmModule;
    } catch (error: any) {
        console.error("❌ Failed to initialize WASM:", error);
        throw error;
    }
}

export const useDokoJsWASM = () => {
    const [dokoWasmInstance, setDokoWasmInstance] = useState(loadedSDK);
    const [loading, setLoading] = useState(!loadedSDK);
    const [error, setError] = useState<string | null>(null);

    const loadWasm = async () => {
        if (loadedSDK) {
            console.log("📋 Using cached WASM instance");
            setDokoWasmInstance(loadedSDK);
            setLoading(false);
            return;
        }
        
        if (typeof window !== 'undefined') {
            if (!loadingPromise) {
                console.log("🚀 Starting new WASM load process");
                setLoading(true);
                setError(null);
                
                loadingPromise = initializeWasm()
                    .then(async (sdk) => {
                        console.log("✅ SDK loaded successfully:", sdk);
                        loadedSDK = sdk;
                        setDokoWasmInstance(sdk);
                        setLoading(false);
                        setError(null);
                    })
                    .catch((error: any) => {
                        console.error("❌ Failed to load the SDK:", error);
                        setLoading(false);
                        setError(error.message || 'Failed to load WASM');
                        loadingPromise = null; // Reset so we can try again
                    });
            } else {
                console.log("⏳ Waiting for existing WASM load process");
                loadingPromise.then(() => {
                    if (loadedSDK) {
                        setDokoWasmInstance(loadedSDK);
                        setLoading(false);
                        setError(null);
                    }
                }).catch((error: any) => {
                    setLoading(false);
                    setError(error.message || 'Failed to load WASM');
                });
            }
        }
    };

    useEffect(() => {
        loadWasm();
    }, []);

    return [dokoWasmInstance, loading, error] as const;
}; 
let wasmInstance = null;

// Load the Go WASM executor
const initGoWasm = async () => {
    if (!window.Go) {
        // Load wasm_exec.js script
        const script = document.createElement('script');
        script.src = '/wasm_exec.js';
        script.async = true;
        await new Promise((resolve, reject) => {
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }
};

export const initWasm = async () => {
    if (wasmInstance) {
        return true;
    }

    await initGoWasm();
    const go = new window.Go();

    try {
        const result = await WebAssembly.instantiateStreaming(
            fetch('/main.wasm'),
            go.importObject
        );
        wasmInstance = result.instance;
        go.run(wasmInstance);
        return true;
    } catch (error) {
        throw new Error(`Failed to initialize WASM: ${error.message}`);
    }
};

export const resetWasmInstance = () => {
    wasmInstance = null;
};
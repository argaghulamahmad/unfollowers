// Load the WASM module
export const initWasm = async () => {
    if (!WebAssembly.instantiateStreaming) {
        // Polyfill for browsers that don't support instantiateStreaming
        WebAssembly.instantiateStreaming = async (resp, importObject) => {
            const source = await (await resp).arrayBuffer();
            return await WebAssembly.instantiate(source, importObject);
        };
    }

    try {
        const go = new Go();
        const result = await WebAssembly.instantiateStreaming(
            fetch('/wasm/compare.wasm'),
            go.importObject
        );
        go.run(result.instance);
        console.log('WASM module loaded successfully');
    } catch (error) {
        console.error('Failed to load WASM module:', error);
        throw error;
    }
};
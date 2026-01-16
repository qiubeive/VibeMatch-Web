/**
 * Wasm Driver - C 语言内核驱动器
 * 职责：管理 WebAssembly 内存、加载 .wasm 文件、数据 Marshaling
 */

let wasmModule = null;

// 1. 初始化 Wasm (单例模式)
export const initWasm = async () => {
    if (wasmModule) return wasmModule;

    try {
        // 这里的 vibematch.js 是编译后生成的胶水代码
        // 它应该位于 public/vibematch.js
        if (window.createModule) {
            wasmModule = await window.createModule();
            console.log("🟢 Wasm Core Loaded: C 语言内核已启动");
            return wasmModule;
        }
        
        // 动态加载胶水代码
        const script = document.createElement('script');
        script.src = '/vibematch.js';
        document.body.appendChild(script);
        
        return new Promise((resolve) => {
            script.onload = () => {
                // createModule 是 Emscripten 导出的工厂函数
                window.createModule().then(instance => {
                    wasmModule = instance;
                    console.log("🟢 Wasm Core Loaded: C 语言内核已启动");
                    resolve(wasmModule);
                });
            };
            script.onerror = () => {
                console.warn("🟡 Wasm Load Failed: 将降级回 JS 模式");
                resolve(null);
            };
        });
    } catch (e) {
        console.warn("Wasm not found, fallback to JS.");
        return null;
    }
};

// 2. 核心调用函数
export const processImageWasm = (imageData, mode, param) => {
    if (!wasmModule) {
        throw new Error("Wasm core not loaded");
    }

    const { width, height, data } = imageData;
    const byteCount = width * height * 4;

    // A. 在 C 语言堆内存中分配空间 (malloc)
    const ptr = wasmModule._malloc(byteCount);

    // B. 将 JS 的 Uint8ClampedArray 拷贝到 C 内存 (HEAPU8)
    wasmModule.HEAPU8.set(data, ptr);

    // C. 调用 C 函数处理 (直接操作指针)
    // process_image(uint8_t* data, int width, int height, int mode, int param)
    wasmModule._process_image(ptr, width, height, mode, param);

    // D. 将处理后的结果拷回 JS
    // 注意：我们需要拷贝一份新的内存，因为 C 的内存在 free 后就不能用了
    const resultArray = new Uint8ClampedArray(wasmModule.HEAPU8.subarray(ptr, ptr + byteCount));
    
    // E. 释放 C 内存 (free) - 极其重要，否则内存泄漏
    wasmModule._free(ptr);

    return new ImageData(resultArray, width, height);
};
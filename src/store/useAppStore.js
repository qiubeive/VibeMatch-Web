import { create } from 'zustand';

export const useAppStore = create((set) => ({
  // --- 1. 数据状态 ---
  // 默认图片 URL
  imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop",
  // 实际的 Image 对象 (用于 Canvas 处理)
  originalImage: null, 
  // 提取出的颜色数组
  baseColors: [],     
  
  // --- 2. 界面状态 ---
  activeEngine: 'fluid', // fluid | glitch | chaos | pixel
  uiMode: 'clean', // 新增：clean | wechat | rednote
  isProcessing: false,
  
  // --- 3. 参数控制 ---
  params: {
    darken: 30,    // 压暗程度
    noise: 10,     // 噪点强度
    text: '',      // 叠加文案
  },

  // --- Actions (操作方法) ---
  // 新增：切换 UI 模式的方法
  setUiMode: (mode) => set({ uiMode: mode }),
  // 上传新图片
  uploadImage: (file) => {
    const url = URL.createObjectURL(file);
    set({ imageUrl: url });
  },

  // 设置加载完成的图片对象
  setLoadedImage: (img) => set({ originalImage: img }),
  
  // 设置分析出的颜色
  setBaseColors: (colors) => set({ baseColors: colors }),
  
  // 切换引擎
  setEngine: (engineId) => set({ activeEngine: engineId }),
  
  // 更新参数 (通用方法)
  updateParams: (key, value) => set((state) => ({
    params: { ...state.params, [key]: value }
  })),
}));
import { create } from 'zustand';

export const useAppStore = create((set) => ({
  // --- 1. 数据状态 ---
  // 默认图片 URL
  imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop",
  // 实际的 Image 对象
  originalImage: null, 
  // 提取出的颜色 (这里只存一个主色，具体配色由 renderPipeline 实时计算)
  baseColors: [],     
  
  // --- 2. 界面状态 ---
  activeEngine: 'fluid', // fluid | glitch | chaos | pixel
  uiMode: 'clean',       // clean | wechat | rednote | chat
  isProcessing: false,
  
  // --- 3. 参数控制 ---
  params: {
    darken: 30,    // 压暗程度
    noise: 10,     // 噪点强度
    text: '',      // 叠加文案
    colorMode: 'natural' // natural (自然) | contrast (撞色) | analogous (邻近) | cyber (赛博)
  },

  // --- Actions ---
  
  uploadImage: (file) => {
    const url = URL.createObjectURL(file);
    set({ imageUrl: url, isProcessing: true });
  },

  setLoadedImage: (img) => set({ originalImage: img, isProcessing: false }),
  
  setBaseColors: (colors) => set({ baseColors: colors }),
  
  setEngine: (engineId) => set({ activeEngine: engineId }),
  
  setUiMode: (mode) => set({ uiMode: mode }),
  
  // 深度合并更新参数
  updateParams: (key, value) => set((state) => ({
    params: { ...state.params, [key]: value }
  })),
}));
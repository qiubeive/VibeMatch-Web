/*
 * VibeMatch High-Performance Core
 * Target: WebAssembly
 * Author: Qiubei (Communication Engineering)
 * * 真正的 C 语言图像处理内核。
 * 编译指令 (Emscripten): 
 * emcc vibematch_core.c -s WASM=1 -s EXPORTED_FUNCTIONS="['_process_image', '_malloc', '_free']" -o ../../public/vibematch.js
 */

#include <stdlib.h>
#include <stdint.h>
#include <math.h>
#include <string.h>

// 定义像素结构，方便指针移动
typedef struct {
    uint8_t r;
    uint8_t g;
    uint8_t b;
    uint8_t a;
} Pixel;

// 辅助：获取像素亮度
uint8_t get_luma(Pixel p) {
    return (uint8_t)(0.299 * p.r + 0.587 * p.g + 0.114 * p.b);
}

// 核心算法 1：像素排序 (Pixel Sort)
// 通信原理思维：将图像看作信号，按幅度(亮度)对特定频段(阈值区间)进行重排
void apply_pixel_sort(Pixel* pixels, int width, int height, int threshold_low, int threshold_high) {
    // 逐列处理 (模拟信号扫描)
    for (int x = 0; x < width; x++) {
        int y = 0;
        while (y < height) {
            // 1. 寻找“故障”区间的起点
            int start_y = y;
            while (start_y < height) {
                uint8_t luma = get_luma(pixels[start_y * width + x]);
                if (luma >= threshold_low && luma <= threshold_high) break;
                start_y++;
            }

            // 2. 寻找终点
            int end_y = start_y + 1;
            while (end_y < height) {
                uint8_t luma = get_luma(pixels[end_y * width + x]);
                if (luma < threshold_low || luma > threshold_high) break;
                end_y++;
            }

            // 3. 对区间内的像素进行排序 (这里使用简单的冒泡，为了演示原理)
            // 在实际工程中，C语言的指针操作速度极快，这种暴力排序也是毫秒级
            int len = end_y - start_y;
            if (len > 1) {
                for (int i = 0; i < len - 1; i++) {
                    for (int j = 0; j < len - i - 1; j++) {
                        int idx1 = (start_y + j) * width + x;
                        int idx2 = (start_y + j + 1) * width + x;
                        if (get_luma(pixels[idx1]) > get_luma(pixels[idx2])) {
                            Pixel temp = pixels[idx1];
                            pixels[idx1] = pixels[idx2];
                            pixels[idx2] = temp;
                        }
                    }
                }
            }
            y = end_y;
        }
    }
}

// 核心算法 2：RGB 通道分离干扰 (RGB Shift)
void apply_rgb_shift(Pixel* pixels, int width, int height, int offset) {
    // 分配临时缓冲区用于拷贝，防止读写冲突
    // C 语言手动内存管理是基本功
    Pixel* temp = (Pixel*)malloc(width * height * sizeof(Pixel));
    memcpy(temp, pixels, width * height * sizeof(Pixel));

    for (int i = 0; i < width * height; i++) {
        int row = i / width;
        int col = i % width;

        // 红色通道左移
        int r_idx = row * width + (col - offset + width) % width;
        // 蓝色通道右移
        int b_idx = row * width + (col + offset) % width;

        pixels[i].r = temp[r_idx].r;
        pixels[i].b = temp[b_idx].b;
        // 绿色保持不动作为基准信号
    }

    free(temp);
}

// --- 暴露给 JS 的主入口 ---
// mode: 1 = Pixel Sort, 2 = RGB Shift
void process_image(uint8_t* data, int width, int height, int mode, int param) {
    Pixel* pixels = (Pixel*)data;
    
    if (mode == 1) {
        // 参数 param 控制阈值范围
        apply_pixel_sort(pixels, width, height, 50, 50 + param * 2);
    } else if (mode == 2) {
        // 参数 param 控制偏移量
        apply_rgb_shift(pixels, width, height, param);
    }
}
export interface OptimizationResult {
  file: File
  originalSize: number
  newSize: number
  savingsPercent: number
  previewUrl: string
}

export interface OptimizationOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
  format?: 'image/webp' | 'image/jpeg'
}

/**
 * Optimizes an image file in the browser using the Canvas API.
 * Converts to WebP by default for best compression.
 */
export async function optimizeImage(
  file: File,
  options: OptimizationOptions = {}
): Promise<OptimizationResult> {
  const {
    maxWidth = 1920,
    maxHeight = 1920,
    quality = 0.8,
    format = 'image/webp'
  } = options

  // 1. Check if it's an image
  if (!file.type.startsWith('image/') || file.type === 'image/svg+xml') {
    return {
      file,
      originalSize: file.size,
      newSize: file.size,
      savingsPercent: 0,
      previewUrl: URL.createObjectURL(file)
    }
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        // 2. Calculate new dimensions while maintaining aspect ratio
        let width = img.width
        let height = img.height

        if (width > maxWidth) {
          height = (maxWidth / width) * height
          width = maxWidth
        }
        if (height > maxHeight) {
          width = (maxHeight / height) * width
          height = maxHeight
        }

        // 3. Draw to canvas
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Failed to get canvas context'))
          return
        }

        ctx.drawImage(img, 0, 0, width, height)

        // 4. Export to blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to create blob'))
              return
            }

            // 5. Create new File object
            const extension = format === 'image/webp' ? 'webp' : 'jpg'
            const newFileName = file.name.replace(/\.[^/.]+$/, "") + `_opt.${extension}`
            const optimizedFile = new File([blob], newFileName, { type: format })

            resolve({
              file: optimizedFile,
              originalSize: file.size,
              newSize: optimizedFile.size,
              savingsPercent: Math.round(((file.size - optimizedFile.size) / file.size) * 100),
              previewUrl: URL.createObjectURL(optimizedFile)
            })
          },
          format,
          quality
        )
      }
      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = e.target?.result as string
    }
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

/**
 * Formats bytes to a human-readable string.
 */
export function formatBytes(bytes: number, decimals: number = 2) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

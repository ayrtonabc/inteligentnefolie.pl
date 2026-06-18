export async function optimizeVideo(file: File): Promise<File> {
  return new Promise(async (resolve, reject) => {
    try {
      const { FFmpeg } = await import('@ffmpeg/ffmpeg')
      const { fetchFile } = await import('@ffmpeg/util')
      
      const ffmpeg = new FFmpeg()
      await ffmpeg.load()
      
      const inputName = 'input' + file.name.substring(file.name.lastIndexOf('.'))
      const outputName = 'output.mp4'
      
      await ffmpeg.writeFile(inputName, await fetchFile(file))
      
      await ffmpeg.exec([
        '-i', inputName,
        '-c:v', 'libx264',
        '-preset', 'medium',
        '-crf', '28',
        '-c:a', 'aac',
        '-b:a', '128k',
        '-movflags', '+faststart',
        '-vf', 'scale=1920:-2',
        '-y',
        outputName
      ])
      
      const data = await ffmpeg.readFile(outputName)
      const uint8Array = data as Uint8Array
      const arrayBuffer = uint8Array.slice().buffer.slice(uint8Array.byteOffset, uint8Array.byteOffset + uint8Array.byteLength)
      const blob = new Blob([arrayBuffer], { type: 'video/mp4' })
      const optimizedFile = new File([blob], file.name.replace(/\.\w+$/, '.mp4'), { type: 'video/mp4' })
      
      await ffmpeg.deleteFile(inputName)
      await ffmpeg.deleteFile(outputName)
      
      resolve(optimizedFile)
    } catch (error) {
      console.error('Video optimization failed:', error)
      resolve(file)
    }
  })
}

export function isVideoFile(file: File): boolean {
  return file.type.startsWith('video/')
}
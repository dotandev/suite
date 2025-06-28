import { v2 as cloudinary } from 'cloudinary'
import { Readable } from 'stream'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
})

export async function uploadEncryptedData(data: string): Promise<string> {
  const buffer = Buffer.from(data, 'utf-8')

  const stream = cloudinary.uploader.upload_stream({
    resource_type: 'raw',
    folder: 'patents',
    use_filename: true,
    unique_filename: false,
  })

  const uploadPromise = new Promise<string>((resolve, reject) => {
    const readable = new Readable()
    readable.push(buffer)
    readable.push(null)

    stream.on('finish', () => {}) // optional
    stream.on('error', reject)
    stream.on('response', (res) => {
      // not needed
    })

    cloudinary.uploader.upload_stream(
      {
        resource_type: 'raw',
        folder: 'patents',
        use_filename: true,
        unique_filename: true,
      },
      (error, result) => {
        if (error) return reject(error)
        if (!result?.secure_url) return reject(new Error('Upload failed'))
        resolve(result.secure_url)
      }
    ).end(buffer)
  })

  return uploadPromise
}

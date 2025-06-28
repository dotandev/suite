// import type { NextApiRequest, NextApiResponse } from 'next'
// import { v2 as cloudinary } from 'cloudinary'

// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
//   api_key: process.env.CLOUDINARY_API_KEY!,
//   api_secret: process.env.CLOUDINARY_API_SECRET!,
// })

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   if (req.method !== 'POST') return res.status(405).end()

//   const { encryptedData } = req.body

//   if (!encryptedData || typeof encryptedData !== 'string') {
//     return res.status(400).json({ error: 'Missing or invalid encryptedData' })
//   }

//   try {
//     const result = await cloudinary.uploader.upload(
//       `data:text/plain;base64,${btoa(encryptedData)}`,
//       {
//         resource_type: 'raw',
//         folder: 'patents',
//       }
//     )

//     return res.status(200).json({ url: result.secure_url })
//   } catch (error) {
//     console.error('[Cloudinary Upload Error]', error)
//     return res.status(500).json({ error: 'Upload failed' })
//   }
// }



// import { NextRequest, NextResponse } from 'next/server'
// import { v2 as cloudinary } from 'cloudinary'

// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
//   api_key: process.env.CLOUDINARY_API_KEY!,
//   api_secret: process.env.CLOUDINARY_API_SECRET!,
// })

// export async function POST(req: NextRequest) {
//   const body = await req.json()
//   const { encryptedData } = body

//   if (!encryptedData) {
//     return NextResponse.json({ error: 'Missing encrypted data' }, { status: 400 })
//   }

//   try {
//     const result = await cloudinary.uploader.upload(
//       `data:text/plain;base64,${btoa(encryptedData)}`,
//       {
//         resource_type: 'image',
//         folder: 'patents',
//       }
//     )

//     return NextResponse.json({ url: result.secure_url })
//   } catch (err) {
//     console.error('[Cloudinary Upload Error]', err)
//     return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
//   }
// }




// import { NextRequest, NextResponse } from 'next/server'
// import { v2 as cloudinary } from 'cloudinary'

// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
//   api_key: process.env.CLOUDINARY_API_KEY!,
//   api_secret: process.env.CLOUDINARY_API_SECRET!,
// })

// // Use formidable or other parser if needed; here simplified assuming raw binary in body
// export async function POST(req: NextRequest) {
//   try {
//     // Parse multipart form data
//     const formData = await req.formData()
//     const file = formData.get('file') as Blob | null

//     if (!file) {
//       return NextResponse.json({ error: 'Missing file' }, { status: 400 })
//     }

//     // Upload file buffer to Cloudinary as raw file
//     const arrayBuffer = await file.arrayBuffer()

//     const result = await cloudinary.uploader.upload_stream(
//       {
//         resource_type: 'raw',
//         folder: 'patents',
//         public_id: `patent-${Date.now()}`,
//       },
//       (error, result) => {
//         if (error) {
//           console.error('[Cloudinary Upload Error]', error)
//           throw error
//         }
//         return result
//       }
//     )

//     // Because cloudinary.uploader.upload_stream uses callback style, use a helper promise wrapper:
//     const uploadPromise = new Promise<string>((resolve, reject) => {
//       const stream = cloudinary.uploader.upload_stream(
//         { resource_type: 'raw', folder: 'patents' },
//         (error, result) => {
//           if (error) reject(error)
//           else resolve(result?.secure_url ?? '')
//         }
//       )
//       stream.end(Buffer.from(arrayBuffer))
//     })

//     const url = await uploadPromise

//     return NextResponse.json({ url })
//   } catch (error) {
//     console.error('[Upload Error]', error)
//     return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
//   }
// }









// import { NextRequest, NextResponse } from 'next/server'
// import { v2 as cloudinary } from 'cloudinary'

// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
//   api_key: process.env.CLOUDINARY_API_KEY!,
//   api_secret: process.env.CLOUDINARY_API_SECRET!,
// })

// export async function POST(req: NextRequest) {
//   try {
//     // Parse multipart form data
//     const formData = await req.formData()
//     const file = formData.get('file') as Blob | null

//     if (!file) {
//       return NextResponse.json({ error: 'Missing file' }, { status: 400 })
//     }

//     const arrayBuffer = await file.arrayBuffer()

//     // Wrap Cloudinary upload_stream in a Promise for async/await usage
//     const uploadResult = await new Promise<string>((resolve, reject) => {
//       const stream = cloudinary.uploader.upload_stream(
//         { resource_type: 'raw', folder: 'patents' },
//         (error, result) => {
//           if (error) reject(error)
//           else resolve(result?.secure_url ?? '')
//         }
//       )
//       stream.end(Buffer.from(arrayBuffer))
//     })

//     return NextResponse.json({ url: uploadResult })
//   } catch (error) {
//     console.error('[Upload Error]', error)
//     return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
//   }
// }





// import { NextRequest, NextResponse } from 'next/server'
// import { v2 as cloudinary } from 'cloudinary'

// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
//   api_key: process.env.CLOUDINARY_API_KEY!,
//   api_secret: process.env.CLOUDINARY_API_SECRET!,
// })

// export async function POST(req: NextRequest) {
//   try {
//     // Parse multipart form data
//     const formData = await req.formData()
//     const file = formData.get('file') as Blob | null

//     if (!file) {
//       return NextResponse.json({ error: 'Missing file' }, { status: 400 })
//     }

//     const arrayBuffer = await file.arrayBuffer()
//     const buffer = Buffer.from(arrayBuffer)

//     // Explicitly set resource_type as 'image' and format to 'png'
//     const uploadResult = await new Promise<string>((resolve, reject) => {
//       const stream = cloudinary.uploader.upload_stream(
//         {
//           resource_type: 'image',
//           folder: 'patents',
//           format: 'png',
//         },
//         (error, result) => {
//           if (error) reject(error)
//           else resolve(result?.secure_url ?? '')
//         }
//       )
//       stream.end(buffer)
//     })

//     return NextResponse.json({ url: uploadResult })
//   } catch (error) {
//     console.error('[Upload Error]', error)
//     return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
//   }
// }
















import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as Blob | null;

    if (!file) {
      return NextResponse.json({ error: 'Missing file' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const uploadResult = await new Promise<string>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'image',
          folder: 'patents',
          format: 'png', // Ensures Cloudinary saves it as a PNG
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result?.secure_url ?? '');
        }
      );
      stream.end(buffer);
    });

    return NextResponse.json({ url: uploadResult });
  } catch (error) {
    console.error('[Upload Error]', error);
    return NextResponse.json({ error: error }, { status: 500 });
  }
}

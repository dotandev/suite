// import { v2 as cloudinary } from 'cloudinary';
// import { NextRequest } from 'next/server';
// import { Readable } from 'stream';
// import { IncomingForm } from 'formidable';
// import { promisify } from 'util';
// import { readFile } from 'fs/promises';

// export const config = {
//   api: {
//     bodyParser: false,
//   },
// };

// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
//   api_key: process.env.CLOUDINARY_API_KEY!,
//   api_secret: process.env.CLOUDINARY_API_SECRET!,
// });

// function bufferToStream(buffer: Buffer): Readable {
//   const stream = new Readable();
//   stream.push(buffer);
//   stream.push(null);
//   return stream;
// }

// export async function POST(req: NextRequest) {
//   const contentType = req.headers.get('content-type') || '';
//   if (!contentType.includes('multipart/form-data')) {
//     return new Response(JSON.stringify({ error: 'Invalid content-type' }), {
//       status: 400,
//     });
//   }

//   const form = new IncomingForm({ multiples: false });
//   const parseForm = promisify(form.parse.bind(form));

//   try {
//     const [fields, files] = await parseForm(await req.formData());
//     const file = files.file?.[0];

//     if (!file || !file.filepath) {
//       return new Response(JSON.stringify({ error: 'No file uploaded' }), {
//         status: 400,
//       });
//     }

//     const buffer = await readFile(file.filepath);
//     const stream = bufferToStream(buffer);

//     const uploadResult = await new Promise<any>((resolve, reject) => {
//       const cloudStream = cloudinary.uploader.upload_stream(
//         {
//           folder: 'agreements',
//           resource_type: 'auto',
//         },
//         (error, result) => {
//           if (error) reject(error);
//           else resolve(result);
//         }
//       );

//       stream.pipe(cloudStream);
//     });

//     return new Response(JSON.stringify({ url: uploadResult.secure_url }), {
//       status: 200,
//     });
//   } catch (err) {
//     console.error('Upload failed:', err);
//     return new Response(JSON.stringify({ error: 'Upload failed' }), {
//       status: 500,
//     });
//   }
// }
















// // app/api/agreement/upload/route.ts

// import { v2 as cloudinary } from 'cloudinary';
// import { NextRequest } from 'next/server';
// import { Readable } from 'stream';
// import formidable from 'formidable';
// import { readFile } from 'fs/promises';
// import { promisify } from 'util';
// import { IncomingMessage } from 'http';

// export const config = {
//   api: {
//     bodyParser: false,
//   },
// };

// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
//   api_key: process.env.CLOUDINARY_API_KEY!,
//   api_secret: process.env.CLOUDINARY_API_SECRET!,
// });

// function bufferToStream(buffer: Buffer): Readable {
//   const stream = new Readable();
//   stream.push(buffer);
//   stream.push(null);
//   return stream;
// }

// export async function POST(req: NextRequest) {
//   const form = formidable({ multiples: false });
//   const parse = promisify(form.parse.bind(form));

//   const [files] = await parse(req as unknown as IncomingMessage);
//   const file = Array.isArray(files.file) ? files.file[0] : files.file;

//   if (!file || !file.filepath) {
//     return new Response(JSON.stringify({ error: 'No file uploaded' }), { status: 400 });
//   }

//   const buffer = await readFile(file.filepath);
//   const stream = bufferToStream(buffer);

//   const uploaded = await new Promise((resolve, reject) => {
//     cloudinary.uploader.upload_stream(
//       { folder: 'agreements', resource_type: 'auto' },
//       (err, result) => {
//         if (err || !result) reject(err);
//         else resolve(result);
//       }
//     ).end(buffer);
//   });

//   return new Response(JSON.stringify({ url: (uploaded as any).secure_url }), { status: 200 });
// }






// import { v2 as cloudinary } from 'cloudinary';
// import { NextRequest } from 'next/server';
// import { IncomingForm } from 'formidable';
// import { promisify } from 'util';
// import { readFile } from 'fs/promises';
// import { Readable } from 'stream';
// import type { IncomingMessage } from 'http';

// export const config = {
//   api: {
//     bodyParser: false,
//   },
// };

// // Cloudinary config
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
//   api_key: process.env.CLOUDINARY_API_KEY!,
//   api_secret: process.env.CLOUDINARY_API_SECRET!,
// });

// // Utility: Convert buffer to stream
// function bufferToStream(buffer: Buffer): Readable {
//   const stream = new Readable();
//   stream.push(buffer);
//   stream.push(null);
//   return stream;
// }

// // POST handler
// export async function POST(req: NextRequest) {
//   const contentType = req.headers.get('content-type') || '';
//   if (!contentType.includes('multipart/form-data')) {
//     return new Response(JSON.stringify({ error: 'Expected multipart/form-data' }), { status: 400 });
//   }

//   // Parse the incoming form
//   const form = new IncomingForm({ multiples: false });
//   const parse = promisify(form.parse.bind(form));
//   let files;

//   try {
//     const [parsedFiles] = await parse(req as unknown as IncomingMessage);
//     files = parsedFiles;
//   } catch (err) {
//     return new Response(JSON.stringify({ error: 'Form parsing failed' }), { status: 400 });
//   }

//   // Extract file
//   const file = Array.isArray(files.file) ? files.file[0] : files.file;
//   if (!file?.filepath) {
//     return new Response(JSON.stringify({ error: 'No file uploaded' }), { status: 400 });
//   }

//   // Read and stream to Cloudinary
//   try {
//     const buffer = await readFile(file.filepath);
//     const stream = bufferToStream(buffer);

//     const uploadResult = await new Promise((resolve, reject) => {
//       const uploadStream = cloudinary.uploader.upload_stream(
//         {
//           folder: 'agreements',
//           resource_type: 'auto',
//         },
//         (err, result) => {
//           if (err) reject(err);
//           else resolve(result);
//         }
//       );

//       stream.pipe(uploadStream);
//     });

//     return new Response(JSON.stringify({ url: (uploadResult as any).secure_url }), {
//       status: 200,
//     });
//   } catch (err) {
//     console.error('Upload failed:', err);
//     return new Response(JSON.stringify({ error: 'Upload failed' }), { status: 500 });
//   }
// }








import { v2 as cloudinary } from 'cloudinary';
import { NextRequest } from 'next/server';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('file') as File | null;

  if (!file) {
    return new Response(JSON.stringify({ error: 'No file uploaded' }), { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Upload to Cloudinary directly from buffer
  const upload = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'agreements', resource_type: 'auto' },
      (err, result) => {
        if (err) reject(err);
        else resolve(result);
      }
    );

    stream.end(buffer); // send buffer to stream
  });

  console.log("uploaded-url", (upload as any).secure_url)

  return new Response(JSON.stringify({ url: (upload as any).secure_url }), { status: 200 });
}

// // /pages/api/patent.ts
// import type { NextApiRequest, NextApiResponse } from 'next';
// import { exec } from 'child_process';

// const PACKAGE_ID = process.env.NEXT_PUBLIC_DEVNET_CONTRACT_PACKAGE_ID!;
// const SENDER = process.env.SUI_SENDER!;
// const GAS_BUDGET = '100000000';

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   if (req.method !== 'POST') return res.status(405).end('Method Not Allowed');

//   const { encryptedCode, imageUrl } = req.body;

//   if (!encryptedCode || !imageUrl) {
//     return res.status(400).json({ error: 'Missing encryptedCode or imageUrl' });
//   }

//   const command = `sui client call \
//     --package ${PACKAGE_ID} \
//     --module patent \
//     --function create_patent \
//     --args "${encryptedCode}" "${imageUrl}" \
//     --gas-budget ${GAS_BUDGET} \
//     --sender ${SENDER}`;

//   exec(command, (err, stdout, stderr) => {
//     if (err) {
//       console.error('Sui call failed:', stderr);
//       return res.status(500).json({ error: stderr });
//     }
//     console.log('Sui call output:', stdout);
//     return res.status(200).json({ message: 'Patent created', output: stdout });
//   });
// }



// import { NextRequest, NextResponse } from 'next/server';
// import { exec } from 'child_process';

// const PACKAGE_ID = process.env.NEXT_PUBLIC_DEVNET_CONTRACT_PACKAGE_ID!;
// const GAS_BUDGET = '100000000';

// export async function POST(req: NextRequest) {
//   try {
//     const body = await req.json();
//     const { encryptedCode, imageUrl, sender } = body;

//     if (!encryptedCode || !imageUrl) {
//       return NextResponse.json(
//         { error: 'Missing encryptedCode or imageUrl' },
//         { status: 400 }
//       );
//     }

//     const command = `sui client call \
//       --package ${PACKAGE_ID} \
//       --module patent \
//       --function create_patent \
//       --args "${encryptedCode}" "${imageUrl}" \
//       --gas-budget ${GAS_BUDGET} \
//       --sender ${sender}`;

//     const result = await new Promise<{ stdout: string; stderr: string }>((resolve, reject) => {
//       exec(command, (error, stdout, stderr) => {
//         if (error) reject({ stdout, stderr });
//         else resolve({ stdout, stderr });
//       });
//     });

//     if (result.stderr) {
//       console.error('[Sui Call Error]', result.stderr);
//       return NextResponse.json({ error: result.stderr }, { status: 500 });
//     }

//     return NextResponse.json({ message: 'Patent created', output: result.stdout });
//   } catch (err: any) {
//     console.error('[API Error]', err);
//     return NextResponse.json({ error: err }, { status: 500 });
//   }
// }





// import { NextRequest, NextResponse } from 'next/server';
// import { exec } from 'child_process';

// const PACKAGE_ID = process.env.NEXT_PUBLIC_DEVNET_CONTRACT_PACKAGE_ID!;
// const GAS_BUDGET = '100000000';

// export async function POST(req: NextRequest) {
//   try {
//     const body = await req.json();
//     const { encryptedCode, imageUrl, sender } = body;

//     if (!encryptedCode || !imageUrl || !sender) {
//       return NextResponse.json(
//         { error: 'Missing encryptedCode, imageUrl or sender' },
//         { status: 400 }
//       );
//     }

//     const command = `sui client call \
//       --package ${PACKAGE_ID} \
//       --module patent \
//       --function create_patent \
//       --args "${encryptedCode}" "${imageUrl}" \
//       --gas-budget ${GAS_BUDGET} \
//       --sender ${sender}`;

//     const result = await new Promise<{ stdout: string; stderr: string }>((resolve, reject) => {
//       exec(command, (error, stdout, stderr) => {
//         if (error) reject({ stdout, stderr });
//         else resolve({ stdout, stderr });
//       });
//     });

//     if (result.stderr) {
//       console.error('[Sui Call Error]', result.stderr);
//       return NextResponse.json({ error: result.stderr }, { status: 500 });
//     }

//     // Extract the transaction digest
//     const match = result.stdout.match(/Transaction Digest:\s+(\S+)/);
//     const digest = match ? match[1] : null;

//     return NextResponse.json({
//       message: 'Patent created successfully',
//       digest,
//       output: result.stdout,
//     });
//   } catch (err: any) {
//     console.error('[API Error]', err);
//     return NextResponse.json({ error: err }, { status: 500 });
//   }
// }








import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';

const PACKAGE_ID = process.env.NEXT_PUBLIC_DEVNET_CONTRACT_PACKAGE_ID!;
const GAS_BUDGET = '100000000';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { encryptedName, encryptedDescription, encryptedCode, imageUrl, createdAt, sender } = body;

    if (!encryptedName || !encryptedDescription || !encryptedCode || !imageUrl || !createdAt || !sender) {
      return NextResponse.json(
        { error: 'Missing one or more required fields' },
        { status: 400 }
      );
    }

    // Construct CLI command with all args in exact order the Move contract expects:
    const command = `sui client call \
      --package ${PACKAGE_ID} \
      --module patent \
      --function create_patent \
      --args "${encryptedName}" "${encryptedDescription}" "${encryptedCode}" "${imageUrl}" "${createdAt}" \
      --gas-budget ${GAS_BUDGET} \
      --sender ${sender}`;

    const result = await new Promise<{ stdout: string; stderr: string }>((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) reject({ stdout, stderr });
        else resolve({ stdout, stderr });
      });
    });

    if (result.stderr) {
      console.error('[Sui Call Error]', result.stderr);
      return NextResponse.json({ error: result.stderr }, { status: 500 });
    }

    // Extract transaction digest from stdout
    const match = result.stdout.match(/Transaction Digest:\s+(\S+)/);
    const digest = match ? match[1] : null;

    return NextResponse.json({
      message: 'Patent created successfully',
      digest,
      output: result.stdout,
    });
  } catch (err: any) {
    console.error('[API Error]', err);
    return NextResponse.json({ error: err.message || err }, { status: 500 });
  }
}

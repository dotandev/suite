import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';

const PACKAGE_ID = process.env.NEXT_PUBLIC_DEVNET_CONTRACT_PACKAGE_ID!;
const GAS_BUDGET = '10000000000';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      encryptedMedia,
      encryptedMetadata,
    //   encryptedSigners,
      signer1,
      signer2,
      expiry,
      sender,
    } = body;

    if (
      !encryptedMedia ||
      !encryptedMetadata ||
    //   !Array.isArray(encryptedSigners) ||
      !expiry ||
      !sender
    ) {
      return NextResponse.json(
        { error: 'Missing one or more required fields' },
        { status: 400 }
      );
    }

    // Format signers as CLI array
    // const formattedSigners = encryptedSigners.map(s => `"${s}"`).join(' ');

    // const signersArg = JSON.stringify(encryptedSigners);

    // Construct CLI call
    const command = `sui client call \
      --package ${PACKAGE_ID} \
      --module agreement \
      --function create_agreement \
      --args ${encryptedMedia} ${encryptedMetadata} ${signer1} ${signer2} ${expiry} \
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

    const digestMatch = result.stdout.match(/Transaction Digest:\s+(\S+)/);
    const digest = digestMatch ? digestMatch[1] : null;

    return NextResponse.json({
      message: 'Agreement created successfully',
      digest,
      output: result.stdout,
    });
  } catch (err: any) {
    console.error('[API Error]', err);
    return NextResponse.json({ error: err.message || err }, { status: 500 });
  }
}

// 'use client';
// import { useState } from 'react';
// import { useCurrentAccount } from '@mysten/dapp-kit';
// import { useQuery } from '@tanstack/react-query';
// import { Button } from '@radix-ui/themes';
// import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
// import Loading from '~~/components/Loading';

// const client = new SuiClient({ url: getFullnodeUrl('devnet') });

// export default function AgreementList() {
//   const acct = useCurrentAccount();
//   const [activeTab, setActiveTab] = useState<'created' | 'participating'>('created');

//   const { data, isLoading, error } = useQuery(
//     ['agreements', acct?.address],
//     async () => {
//       if (!acct?.address) return { created: [], participating: [] };

//       const pkg = process.env.NEXT_PUBLIC_CONTRACT_PACKAGE_ID;

//       const [evCreated, evSigned] = await Promise.all([
//         client.queryEvents({ query: { MoveEventType: `${pkg}::agreement::AgreementCreated` } }),
//         client.queryEvents({ query: { MoveEventType: `${pkg}::agreement::AgreementSigned` } }),
//       ]);

//       const createdEvents = evCreated.data.filter(
//         (e) => (e.parsedJson as any).creator === acct.address
//       );

//       const signedEvents = evSigned.data.filter(
//         (e) => (e.parsedJson as any).signer === acct.address
//       );

//       const createdIds = createdEvents.map((e) => (e.parsedJson as any).agreement_id);
//       const signedIds = signedEvents.map((e) => (e.parsedJson as any).agreement_id);

//       const participatingIds = signedIds.filter((id) => !createdIds.includes(id));

//       const fetchByIds = async (ids: string[]) => {
//         if (!ids.length) return [];
//         const objs = await client.getObjectBatch({
//           ids: ids.map((id) => `0x${id}`),
//           options: { showContent: true },
//         });

//         return objs
//           .filter((o) => o.data?.content)
//           .map((o) => {
//             const fields = (o.data!.content as any).fields;
//             return {
//               agreementId: o.data!.objectId,
//               mediaHash: fields.media_hash,
//               metadataHash: fields.metadata_hash,
//               signatories: fields.signatories,
//               signed: fields.signed,
//               active: fields.active,
//               expiry: fields.expiry,
//               revoked: fields.revoked,
//               proposedMetadata: fields.proposed_metadata,
//               editSigned: fields.edit_signed,
//             };
//           });
//       };

//       const [created, participating] = await Promise.all([
//         fetchByIds(createdIds),
//         fetchByIds(participatingIds),
//       ]);

//       return { created, participating };
//     },
//     { enabled: !!acct }
//   );

//   if (!acct) return <div>Please connect your wallet</div>;
//   if (isLoading) return <Loading />;
//   if (error) return <div>Error loading agreements</div>;

//   const agreements = activeTab === 'created' ? data!.created : data!.participating;

//   return (
//     <div className="space-y-4 max-w-3xl mx-auto">
//       <div className="flex gap-4 mb-4">
//         <Button
//           variant={activeTab === 'created' ? 'solid' : 'outline'}
//           onClick={() => setActiveTab('created')}
//         >
//           Created
//         </Button>
//         <Button
//           variant={activeTab === 'participating' ? 'solid' : 'outline'}
//           onClick={() => setActiveTab('participating')}
//         >
//           Participating
//         </Button>
//       </div>

//       {agreements.length === 0 ? (
//         <div>No agreements in this category</div>
//       ) : (
//         agreements.map((a: any) => (
//           <div key={a.agreementId} className="border p-4 rounded shadow">
//             <p><strong>ID:</strong> {a.agreementId}</p>
//             <p><strong>Expiry:</strong> {a.expiry}</p>
//             <p><strong>Active:</strong> {a.active ? 'Yes' : 'No'}</p>
//             <p><strong>Revoked:</strong> {a.revoked ? 'Yes' : 'No'}</p>
//             <p><strong>Signatories:</strong> {a.signatories.join(', ')}</p>
//             <p><strong>Signed:</strong> {a.signed.join(', ')}</p>
//           </div>
//         ))
//       )}
//     </div>
//   );
// }



// 'use client';
// import { useEffect, useState } from 'react';
// import { useCurrentAccount } from '@mysten/dapp-kit';
// import { useQuery } from '@tanstack/react-query';
// import { Button } from '@radix-ui/themes';
// import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
// import Loading from '~~/components/Loading';
// import { decryptString } from '../../../../lib/encrypt';

// const client = new SuiClient({ url: getFullnodeUrl('devnet') });
// const SECRET = process.env.NEXT_PUBLIC_CRYPTO_SECRET || 'secret';

// export default function AgreementList() {
//   const acct = useCurrentAccount();
//   const [activeTab, setActiveTab] = useState<'created' | 'participating'>('created');

//   const { data, isLoading, error } = useQuery(
//     ['agreements', acct?.address],
//     async () => {
//       if (!acct?.address) return { created: [], participating: [] };

//       const pkg = process.env.NEXT_PUBLIC_CONTRACT_PACKAGE_ID;

//       const [evCreated, evSigned] = await Promise.all([
//         client.queryEvents({ query: { MoveEventType: `${pkg}::agreement::AgreementCreated` } }),
//         client.queryEvents({ query: { MoveEventType: `${pkg}::agreement::AgreementSigned` } }),
//       ]);

//       const createdEvents = evCreated.data.filter((e) => (e.parsedJson as any).creator === acct.address);
//       const signedEvents = evSigned.data.filter((e) => (e.parsedJson as any).signer === acct.address);

//       const createdIds = createdEvents.map((e) => (e.parsedJson as any).agreement_id);
//       const signedIds = signedEvents.map((e) => (e.parsedJson as any).agreement_id);

//       const participatingIds = signedIds.filter((id) => !createdIds.includes(id));

//       const fetchByIds = async (ids: string[]) => {
//         if (!ids.length) return [];
//         const objs = await client.multiGetObjects({
//           ids: ids.map((id) => `0x${id}`),
//           options: { showContent: true },
//         });

//         return Promise.all(objs
//           .filter((o) => o.data?.content)
//           .map(async (o) => {
//             const fields = (o.data!.content as any).fields;

//             let mediaUrl = '';
//             let metadata = {};

//             try {
//               mediaUrl = await decryptString(fields.media_hash, SECRET);
//               const metadataStr = await decryptString(fields.metadata_hash, SECRET);
//               metadata = JSON.parse(metadataStr);
//             } catch (e) {
//               console.warn('Failed to decrypt or parse:', e);
//             }

//             return {
//               agreementId: o.data!.objectId,
//               mediaUrl,
//               metadata,
//               signatories: fields.signatories,
//               signed: fields.signed,
//               active: fields.active,
//               expiry: fields.expiry,
//               revoked: fields.revoked,
//               proposedMetadata: fields.proposed_metadata,
//               editSigned: fields.edit_signed,
//             };
//           }));
//       };

//       const [created, participating] = await Promise.all([
//         fetchByIds(createdIds),
//         fetchByIds(participatingIds),
//       ]);

//       return { created, participating };
//     },
//     { enabled: !!acct }
//   );

//   if (!acct) return <div>Please connect your wallet</div>;
//   if (isLoading) return <Loading />;
//   if (error) return <div>Error loading agreements</div>;

//   const agreements = activeTab === 'created' ? data!.created : data!.participating;

//   const renderMediaPreview = (url: string) => {
//     if (!url) return null;
//     if (url.match(/\.(mp4|webm)$/)) {
//       return <video controls className="max-w-full rounded" src={url} />;
//     }
//     if (url.match(/\.(mp3|wav)$/)) {
//       return <audio controls src={url} />;
//     }
//     if (url.match(/\.(jpg|jpeg|png|gif|svg)$/)) {
//       return <img src={url} alt="media" className="max-w-full rounded" />;
//     }
//     return <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Open Media</a>;
//   };

//   return (
//     <div className="space-y-4 max-w-4xl mx-auto">
//       <div className="flex gap-4 mb-6">
//         <Button
//           variant={activeTab === 'created' ? 'solid' : 'outline'}
//           onClick={() => setActiveTab('created')}
//         >
//           Created
//         </Button>
//         <Button
//           variant={activeTab === 'participating' ? 'solid' : 'outline'}
//           onClick={() => setActiveTab('participating')}
//         >
//           Participating
//         </Button>
//       </div>

//       {agreements.length === 0 ? (
//         <div>No agreements in this category</div>
//       ) : (
//         agreements.map((a: any) => (
//           <div key={a.agreementId} className="border p-6 rounded shadow space-y-2">
//             <p><strong>ID:</strong> {a.agreementId}</p>
//             <p><strong>Expiry:</strong> {a.expiry}</p>
//             <p><strong>Active:</strong> {a.active ? '✅ Yes' : '❌ No'}</p>
//             <p><strong>Revoked:</strong> {a.revoked ? '❌ Yes' : '✅ No'}</p>
//             <p><strong>Signatories:</strong> {a.signatories.join(', ')}</p>
//             <p><strong>Signed:</strong> {a.signed.join(', ')}</p>

//             {a.mediaUrl && (
//               <div>
//                 <p><strong>Media:</strong></p>
//                 <div>{renderMediaPreview(a.mediaUrl)}</div>
//               </div>
//             )}

//             {a.metadata && Object.keys(a.metadata).length > 0 && (
//               <div>
//                 <p><strong>Metadata:</strong></p>
//                 <ul className="list-disc list-inside">
//                   {Object.entries(a.metadata).map(([key, value]) => (
//                     <li key={key}><strong>{key}:</strong> {value as string}</li>
//                   ))}
//                 </ul>
//               </div>
//             )}
//           </div>
//         ))
//       )}
//     </div>
//   );
// }




// 'use client';
// import { useState } from 'react';
// import { useCurrentAccount } from '@mysten/dapp-kit';
// import { useQuery } from '@tanstack/react-query';
// import { Button } from '@radix-ui/themes';
// import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
// import Loading from '~~/components/Loading';
// import { decryptString } from '../../../../lib/encrypt';

// const client = new SuiClient({ url: getFullnodeUrl('devnet') });
// const SECRET = process.env.NEXT_PUBLIC_CRYPTO_SECRET || 'secret';

// export default function AgreementList() {
//   const acct = useCurrentAccount();
//   const [activeTab, setActiveTab] = useState<'created' | 'participating'>('created');

//   const { data, isLoading, error } = useQuery(
//     ['agreements', acct?.address],
//     async () => {
//       if (!acct?.address) return { created: [], participating: [] };

//       const pkg = process.env.NEXT_PUBLIC_CONTRACT_PACKAGE_ID;

//       // Query events for agreements created and signed
//       const [evCreated, evSigned] = await Promise.all([
//         client.queryEvents({ query: { MoveEventType: `${pkg}::agreement::AgreementCreated` } }),
//         client.queryEvents({ query: { MoveEventType: `${pkg}::agreement::AgreementSigned` } }),
//       ]);

//       const createdEvents = evCreated.data.filter((e) => (e.parsedJson as any).creator === acct.address);
//       const signedEvents = evSigned.data.filter((e) => (e.parsedJson as any).signer === acct.address);

//       const createdIds = createdEvents.map((e) => (e.parsedJson as any).agreement_id);
//       const signedIds = signedEvents.map((e) => (e.parsedJson as any).agreement_id);

//       // Participating = signed but not created
//       const participatingIds = signedIds.filter((id) => !createdIds.includes(id));

//       // Fetch agreement objects by IDs
//       const fetchByIds = async (ids: string[]) => {
//         if (!ids.length) return [];

//         const objs = await client.multiGetObjects({
//           ids: ids.map((id) => `0x${id}`),
//           options: { showContent: true },
//         });

//         return Promise.all(objs
//           .filter((o) => o.data?.content)
//           .map(async (o) => {
//             const fields = (o.data!.content as any).fields;

//             // Decrypt media and metadata
//             let mediaUrl = '';
//             let metadata = {};
//             try {
//               mediaUrl = await decryptString(fields.media_hash, SECRET);
//               const metadataStr = await decryptString(fields.metadata_hash, SECRET);
//               metadata = JSON.parse(metadataStr);
//             } catch (e) {
//               console.warn('Failed to decrypt or parse:', e);
//             }

//             // Compose signatories and signed status according to contract's new schema
//             const signatories = [fields.signatory1, fields.signatory2];
//             const signed = [
//               fields.signed1 ? fields.signatory1 : null,
//               fields.signed2 ? fields.signatory2 : null,
//             ].filter(Boolean); // Only include who actually signed

//             return {
//               agreementId: o.data!.objectId,
//               mediaUrl,
//               metadata,
//               signatories,
//               signed,
//               active: fields.active,
//               expiry: fields.expiry,
//               revoked: fields.revoked,
//               proposedMetadata: fields.proposed_metadata,
//               editSigned: [fields.edit_signed1, fields.edit_signed2],
//             };
//           }));
//       };

//       const [created, participating] = await Promise.all([
//         fetchByIds(createdIds),
//         fetchByIds(participatingIds),
//       ]);

//       return { created, participating };
//     },
//     { enabled: !!acct }
//   );

//   if (!acct) return <div>Please connect your wallet</div>;
//   if (isLoading) return <Loading />;
//   if (error) return <div>Error loading agreements</div>;

//   const agreements = activeTab === 'created' ? data!.created : data!.participating;

//   const renderMediaPreview = (url: string) => {
//     if (!url) return null;
//     if (url.match(/\.(mp4|webm)$/)) {
//       return <video controls className="max-w-full rounded" src={url} />;
//     }
//     if (url.match(/\.(mp3|wav)$/)) {
//       return <audio controls src={url} />;
//     }
//     if (url.match(/\.(jpg|jpeg|png|gif|svg)$/)) {
//       return <img src={url} alt="media" className="max-w-full rounded" />;
//     }
//     return (
//       <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
//         Open Media
//       </a>
//     );
//   };

//   return (
//     <div className="space-y-4 max-w-4xl mx-auto">
//       <div className="flex gap-4 mb-6">
//         <Button
//           variant={activeTab === 'created' ? 'solid' : 'outline'}
//           onClick={() => setActiveTab('created')}
//         >
//           Created
//         </Button>
//         <Button
//           variant={activeTab === 'participating' ? 'solid' : 'outline'}
//           onClick={() => setActiveTab('participating')}
//         >
//           Participating
//         </Button>
//       </div>

//       {agreements.length === 0 ? (
//         <div>No agreements in this category</div>
//       ) : (
//         agreements.map((a: any) => (
//           <div key={a.agreementId} className="border p-6 rounded shadow space-y-2">
//             <p><strong>ID:</strong> {a.agreementId}</p>
//             <p><strong>Expiry:</strong> {a.expiry}</p>
//             <p><strong>Active:</strong> {a.active ? '✅ Yes' : '❌ No'}</p>
//             <p><strong>Revoked:</strong> {a.revoked ? '❌ Yes' : '✅ No'}</p>
//             <p><strong>Signatories:</strong> {a.signatories.join(', ')}</p>
//             <p><strong>Signed:</strong> {a.signed.join(', ')}</p>

//             {a.mediaUrl && (
//               <div>
//                 <p><strong>Media:</strong></p>
//                 <div>{renderMediaPreview(a.mediaUrl)}</div>
//               </div>
//             )}

//             {a.metadata && Object.keys(a.metadata).length > 0 && (
//               <div>
//                 <p><strong>Metadata:</strong></p>
//                 <ul className="list-disc list-inside">
//                   {Object.entries(a.metadata).map(([key, value]) => (
//                     <li key={key}>
//                       <strong>{key}:</strong> {value as string}
//                     </li>
//                   ))}
//                 </ul>
//               </div>
//             )}
//           </div>
//         ))
//       )}
//     </div>
//   );
// }







// 'use client';
// import { useState } from 'react';
// import { useCurrentAccount } from '@mysten/dapp-kit';
// import { useQuery } from '@tanstack/react-query';
// import { Button } from '@radix-ui/themes';
// import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
// import Loading from '~~/components/Loading';
// import { decryptString } from '../../../../lib/encrypt';

// const client = new SuiClient({ url: getFullnodeUrl('devnet') });
// const SECRET = process.env.NEXT_PUBLIC_CRYPTO_SECRET || 'secret';

// export default function AgreementList() {
//   const acct = useCurrentAccount();
//   const [activeTab, setActiveTab] = useState<'created' | 'participating'>('created');

//   const { data, isLoading, error } = useQuery({
//     queryKey: ['agreements', acct?.address],
//     queryFn: async () => {
//       if (!acct?.address) return { created: [], participating: [] };

//       const pkg = process.env.NEXT_PUBLIC_CONTRACT_PACKAGE_ID;

//       // Query events for agreements created and signed
//       const [evCreated, evSigned] = await Promise.all([
//         client.queryEvents({ query: { MoveEventType: `${pkg}::agreement::AgreementCreated` } }),
//         client.queryEvents({ query: { MoveEventType: `${pkg}::agreement::AgreementSigned` } }),
//       ]);

//       const createdEvents = evCreated.data.filter((e) => (e.parsedJson as any).creator === acct.address);
//       const signedEvents = evSigned.data.filter((e) => (e.parsedJson as any).signer === acct.address);

//       const createdIds = createdEvents.map((e) => (e.parsedJson as any).agreement_id);
//       const signedIds = signedEvents.map((e) => (e.parsedJson as any).agreement_id);

//       const participatingIds = signedIds.filter((id) => !createdIds.includes(id));

//       console.log("events", {
//         createdEvents,
//         signedEvents
//       })

//       const fetchByIds = async (ids: string[]) => {
//         if (!ids.length) return [];

//         const objs = await client.multiGetObjects({
//           ids: ids.map((id) => `0x${id}`),
//           options: { showContent: true },
//         });

//         return Promise.all(objs
//           .filter((o) => o.data?.content)
//           .map(async (o) => {
//             const fields = (o.data!.content as any).fields;

//             let mediaUrl = '';
//             let metadata = {};
//             try {
//               mediaUrl = await decryptString(fields.media_hash, SECRET);
//               const metadataStr = await decryptString(fields.metadata_hash, SECRET);
//               metadata = JSON.parse(metadataStr);
//             } catch (e) {
//               console.warn('Failed to decrypt or parse:', e);
//             }

//             const signatories = [fields.signatory1, fields.signatory2];
//             const signed = [
//               fields.signed1 ? fields.signatory1 : null,
//               fields.signed2 ? fields.signatory2 : null,
//             ].filter(Boolean);

//             return {
//               agreementId: o.data!.objectId,
//               mediaUrl,
//               metadata,
//               signatories,
//               signed,
//               active: fields.active,
//               expiry: fields.expiry,
//               revoked: fields.revoked,
//               proposedMetadata: fields.proposed_metadata,
//               editSigned: [fields.edit_signed1, fields.edit_signed2],
//             };
//           }));
//       };

//       const [created, participating] = await Promise.all([
//         fetchByIds(createdIds),
//         fetchByIds(participatingIds),
//       ]);

//       return { created, participating };
//     },
//     enabled: !!acct,
//   }) as any;

//   if (!acct) return <div>Please connect your wallet</div>;
//   if (isLoading) return <Loading />;
//   if (error) return <div>Error loading agreements</div>;

//   const agreements = activeTab === 'created' ? data!.created : data!.participating;

//   const renderMediaPreview = (url: string) => {
//     if (!url) return null;
//     if (url.match(/\.(mp4|webm)$/)) return <video controls className="max-w-full rounded" src={url} />;
//     if (url.match(/\.(mp3|wav)$/)) return <audio controls src={url} />;
//     if (url.match(/\.(jpg|jpeg|png|gif|svg)$/)) return <img src={url} alt="media" className="max-w-full rounded" />;
//     return <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Open Media</a>;
//   };

//   return (
//     <div className="space-y-4 max-w-4xl mx-auto">
//       <div className="flex gap-4 mb-6">
//         <Button variant={activeTab === 'created' ? 'solid' : 'outline'} onClick={() => setActiveTab('created')}>Created</Button>
//         <Button variant={activeTab === 'participating' ? 'solid' : 'outline'} onClick={() => setActiveTab('participating')}>Participating</Button>
//       </div>

//       {agreements.length === 0 ? (
//         <div>No agreements in this category</div>
//       ) : (
//         agreements.map((a: any) => (
//           <div key={a.agreementId} className="border p-6 rounded shadow space-y-2">
//             <p><strong>ID:</strong> {a.agreementId}</p>
//             <p><strong>Expiry:</strong> {a.expiry}</p>
//             <p><strong>Active:</strong> {a.active ? '✅ Yes' : '❌ No'}</p>
//             <p><strong>Revoked:</strong> {a.revoked ? '❌ Yes' : '✅ No'}</p>
//             <p><strong>Signatories:</strong> {a.signatories.join(', ')}</p>
//             <p><strong>Signed:</strong> {a.signed.join(', ')}</p>

//             {a.mediaUrl && (
//               <div>
//                 <p><strong>Media:</strong></p>
//                 <div>{renderMediaPreview(a.mediaUrl)}</div>
//               </div>
//             )}

//             {a.metadata && Object.keys(a.metadata).length > 0 && (
//               <div>
//                 <p><strong>Metadata:</strong></p>
//                 <ul className="list-disc list-inside">
//                   {Object.entries(a.metadata).map(([key, value]) => (
//                     <li key={key}><strong>{key}:</strong> {value as string}</li>
//                   ))}
//                 </ul>
//               </div>
//             )}
//           </div>
//         ))
//       )}
//     </div>
//   );
// }










// 'use client';
// import { useState } from 'react';
// import { useCurrentAccount } from '@mysten/dapp-kit';
// import { useQuery } from '@tanstack/react-query';
// import { Button } from '@radix-ui/themes';
// import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
// import Loading from '~~/components/Loading';
// import { decryptString } from '../../../../lib/encrypt';

// const client = new SuiClient({ url: getFullnodeUrl('devnet') });
// const SECRET = process.env.NEXT_PUBLIC_CRYPTO_SECRET || 'secret';

// export default function AgreementList() {
//   const acct = useCurrentAccount();
//   const [activeTab, setActiveTab] = useState<'created' | 'participating'>('created');

//   const { data, isLoading } = useQuery({
//     queryKey: ['agreements', acct?.address],
//     queryFn: async () => {
//       if (!acct?.address) return { created: [], participating: [] };

//       const pkg = process.env.NEXT_PUBLIC_CONTRACT_PACKAGE_ID;

//       try {
//         // Query events for agreements created and signed
//         // const [evCreated, evSigned] = await Promise.all([
//         //   client.queryEvents({ query: { MoveEventType: `${pkg}::agreement::AgreementCreated` } }),
//         //   client.queryEvents({ query: { MoveEventType: `${pkg}::agreement::AgreementSigned` } }),
//         // ]);

//         const [evCreated,
//             //  evSigned
//             ] = await Promise.all([
//             client.queryEvents({
//               query: { MoveEventType: `${pkg}::agreement::AgreementCreated` },
//               limit: 50,            // Add a limit to avoid huge responses
//               order: 'descending',  // Optional: get latest events first
//             }),
//             // client.queryEvents({
//             //   query: { MoveEventType: `${pkg}::agreement::AgreementSigned` },
//             //   limit: 50,
//             //   order: 'descending',
//             // }),
//           ]);

//         console.log("response", {
//             evCreated, 
//             // evSigned
//         })

//         const createdEvents = evCreated.data.filter((e) => (e.parsedJson as any).creator === acct.address);
//         // const signedEvents = evSigned.data.filter((e) => (e.parsedJson as any).signer === acct.address);

//         const createdIds = createdEvents.map((e) => (e.parsedJson as any).agreement_id);
//         // const signedIds = signedEvents.map((e) => (e.parsedJson as any).agreement_id);

//         // Participating agreements are signed but not created by this account
//         // const participatingIds = signedIds.filter((id) => !createdIds.includes(id));

//         // Helper to fetch and decrypt agreement objects by IDs
//         const fetchByIds = async (ids: string[]) => {
//           if (!ids.length) return [];

//           const objs = await client.multiGetObjects({
//             ids: ids.map((id) => `0x${id}`),
//             options: { showContent: true },
//           });

//           return Promise.all(
//             objs
//               .filter((o) => o.data?.content)
//               .map(async (o) => {
//                 const fields = (o.data!.content as any).fields;

//                 let mediaUrl = '';
//                 let metadata = {};
//                 try {
//                   mediaUrl = await decryptString(fields.media_hash, SECRET);
//                   const metadataStr = await decryptString(fields.metadata_hash, SECRET);
//                   metadata = JSON.parse(metadataStr);
//                 } catch (e) {
//                   console.warn('Failed to decrypt or parse:', e);
//                 }

//                 const signatories = [fields.signatory1, fields.signatory2];
//                 const signed = [
//                   fields.signed1 ? fields.signatory1 : null,
//                   fields.signed2 ? fields.signatory2 : null,
//                 ].filter(Boolean);

//                 return {
//                   agreementId: o.data!.objectId,
//                   mediaUrl,
//                   metadata,
//                   signatories,
//                   signed,
//                   active: fields.active,
//                   expiry: fields.expiry,
//                   revoked: fields.revoked,
//                   proposedMetadata: fields.proposed_metadata,
//                   editSigned: [fields.edit_signed1, fields.edit_signed2],
//                 };
//               })
//           );
//         };

//         const [created,
//             //  participating

//         ] = await Promise.all([
//           fetchByIds(createdIds),
//         //   fetchByIds(participatingIds),
//         ]);

//         return { created,
//             //  participating 
//             };
//       } catch (err) {
//         console.warn('Error fetching agreements from Sui client:', err);
//         // Return empty arrays to avoid error UI
//         return { created: [], participating: [] };
//       }
//     },
//     enabled: !!acct,
//   }) as any;

//   if (!acct) return <div>Please connect your wallet</div>;
//   if (isLoading) return <Loading />;

//   const agreements = activeTab === 'created' ? data?.created ?? [] : data?.participating ?? [];

//   const renderMediaPreview = (url: string) => {
//     if (!url) return null;
//     if (url.match(/\.(mp4|webm)$/)) return <video controls className="max-w-full rounded" src={url} />;
//     if (url.match(/\.(mp3|wav)$/)) return <audio controls src={url} />;
//     if (url.match(/\.(jpg|jpeg|png|gif|svg)$/)) return <img src={url} alt="media" className="max-w-full rounded" />;
//     return (
//       <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
//         Open Media
//       </a>
//     );
//   };

//   return (
//     <div className="space-y-4 max-w-4xl mx-auto">
//       <div className="flex gap-4 mb-6">
//         <Button variant={activeTab === 'created' ? 'solid' : 'outline'} onClick={() => setActiveTab('created')}>
//           Created
//         </Button>
//         <Button
//           variant={activeTab === 'participating' ? 'solid' : 'outline'}
//           onClick={() => setActiveTab('participating')}
//         >
//           Participating
//         </Button>
//       </div>

//       {agreements.length === 0 ? (
//         <div>No agreements in this category</div>
//       ) : (
//         agreements.map((a: any) => (
//           <div key={a.agreementId} className="border p-6 rounded shadow space-y-2">
//             <p>
//               <strong>ID:</strong> {a.agreementId}
//             </p>
//             <p>
//               <strong>Expiry:</strong> {a.expiry}
//             </p>
//             <p>
//               <strong>Active:</strong> {a.active ? '✅ Yes' : '❌ No'}
//             </p>
//             <p>
//               <strong>Revoked:</strong> {a.revoked ? '❌ Yes' : '✅ No'}
//             </p>
//             <p>
//               <strong>Signatories:</strong> {a.signatories.join(', ')}
//             </p>
//             <p>
//               <strong>Signed:</strong> {a.signed.join(', ')}
//             </p>

//             {a.mediaUrl && (
//               <div>
//                 <p>
//                   <strong>Media:</strong>
//                 </p>
//                 <div>{renderMediaPreview(a.mediaUrl)}</div>
//               </div>
//             )}

//             {a.metadata && Object.keys(a.metadata).length > 0 && (
//               <div>
//                 <p>
//                   <strong>Metadata:</strong>
//                 </p>
//                 <ul className="list-disc list-inside">
//                   {Object.entries(a.metadata).map(([key, value]) => (
//                     <li key={key}>
//                       <strong>{key}:</strong> {value as string}
//                     </li>
//                   ))}
//                 </ul>
//               </div>
//             )}
//           </div>
//         ))
//       )}
//     </div>
//   );
// }











// 'use client';
// import { useState } from 'react';
// import { useCurrentAccount } from '@mysten/dapp-kit';
// import { useQuery } from '@tanstack/react-query';
// import { Button } from '@radix-ui/themes';
// import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
// import Loading from '~~/components/Loading';
// import { decryptString } from '../../../../lib/encrypt';
// import { CONTRACT_PACKAGE_VARIABLE_NAME } from '~~/config/network';
// import useNetworkConfig from '~~/hooks/useNetworkConfig';

// const client = new SuiClient({ url: getFullnodeUrl('devnet') });
// const SECRET = process.env.NEXT_PUBLIC_CRYPTO_SECRET || 'secret';


// export default function AgreementList() {
//     const acct = useCurrentAccount();
//     const [activeTab, setActiveTab] = useState<'created' | 'participating'>('created');
//     const pkg = process.env.NEXT_PUBLIC_CONTRACT_PACKAGE_ID;
//     const { useNetworkVariable } = useNetworkConfig();
//     const packageId = useNetworkVariable(CONTRACT_PACKAGE_VARIABLE_NAME)
    
//   const { data, isLoading } = useQuery({
//     queryKey: ['agreements', acct?.address],
//     queryFn: async () => {
//       if (!acct?.address) return { created: [], participating: [] };

//       try {
//         // Step 1: fetch all owned objects of the account
//         const ownedObjects = await client.getOwnedObjects({
//           owner: acct.address,
//           filter: {
//             StructType: `${packageId}::agreement::Agreement`,
//           },
//           options: { showContent: true },
//         });

//         // Step 2: Extract and decrypt agreements
//         const agreements = await Promise.all(
//           ownedObjects.data
//             .filter((obj) => obj.data?.content && obj.data.content.dataType === 'moveObject')
//             .map(async (obj) => {
//               const fields = (obj.data!.content as any).fields;

//               // Decrypt media and metadata (with fallback)
//               let mediaUrl = '';
//               let metadata = {};
//               try {
//                 mediaUrl = await decryptString(fields.media_hash, SECRET);
//                 const metadataStr = await decryptString(fields.metadata_hash, SECRET);
//                 metadata = JSON.parse(metadataStr);
//               } catch (e) {
//                 console.warn('Failed to decrypt or parse:', e);
//               }

//               // Determine signatories and signed status
//               const signatories = [fields.signatory1, fields.signatory2];
//               const signed = [
//                 fields.signed1 ? fields.signatory1 : null,
//                 fields.signed2 ? fields.signatory2 : null,
//               ].filter(Boolean);

//               return {
//                 agreementId: obj.data!.objectId,
//                 creator: fields.creator,
//                 mediaUrl,
//                 metadata,
//                 signatories,
//                 signed,
//                 active: fields.active,
//                 expiry: fields.expiry,
//                 revoked: fields.revoked,
//                 proposedMetadata: fields.proposed_metadata,
//                 editSigned: [fields.edit_signed1, fields.edit_signed2],
//               };
//             })
//         );

//         // Step 3: split into created and participating agreements
//         const created = agreements.filter((a) => a.creator === acct.address);
//         const participating = agreements.filter(
//           (a) => a.creator !== acct.address && a.signatories.includes(acct.address)
//         );

//         return { created, participating };
//       } catch (err) {
//         console.warn('Error fetching agreements from Sui client:', err);
//         return { created: [], participating: [] };
//       }
//     },
//     enabled: !!acct,
//   }) as any;

//   if (!acct) return <div>Please connect your wallet</div>;
//   if (isLoading) return <Loading />;

//   const agreements = activeTab === 'created' ? data?.created ?? [] : data?.participating ?? [];

//   const renderMediaPreview = (url: string) => {
//     if (!url) return null;
//     if (url.match(/\.(mp4|webm)$/)) return <video controls className="max-w-full rounded" src={url} />;
//     if (url.match(/\.(mp3|wav)$/)) return <audio controls src={url} />;
//     if (url.match(/\.(jpg|jpeg|png|gif|svg)$/)) return <img src={url} alt="media" className="max-w-full rounded" />;
//     return (
//       <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
//         Open Media
//       </a>
//     );
//   };

//   return (
//     <div className="space-y-4 max-w-4xl mx-auto">
//       <div className="flex gap-4 mb-6">
//         <Button variant={activeTab === 'created' ? 'solid' : 'outline'} onClick={() => setActiveTab('created')}>
//           Created
//         </Button>
//         <Button
//           variant={activeTab === 'participating' ? 'solid' : 'outline'}
//           onClick={() => setActiveTab('participating')}
//         >
//           Participating
//         </Button>
//       </div>

//       {agreements.length === 0 ? (
//         <div>No agreements in this category</div>
//       ) : (
//         agreements.map((a: any) => (
//           <div key={a.agreementId} className="border p-6 rounded shadow space-y-2">
//             <p>
//               <strong>ID:</strong> {a.agreementId}
//             </p>
//             <p>
//               <strong>Expiry:</strong> {a.expiry}
//             </p>
//             <p>
//               <strong>Active:</strong> {a.active ? '✅ Yes' : '❌ No'}
//             </p>
//             <p>
//               <strong>Revoked:</strong> {a.revoked ? '❌ Yes' : '✅ No'}
//             </p>
//             <p>
//               <strong>Creator:</strong> {a.creator}
//             </p>
//             <p>
//               <strong>Signatories:</strong> {a.signatories.join(', ')}
//             </p>
//             <p>
//               <strong>Signed:</strong> {a.signed.join(', ')}
//             </p>

//             {a.mediaUrl && (
//               <div>
//                 <p>
//                   <strong>Media:</strong>
//                 </p>
//                 <div>{renderMediaPreview(a.mediaUrl)}</div>
//               </div>
//             )}

//             {a.metadata && Object.keys(a.metadata).length > 0 && (
//               <div>
//                 <p>
//                   <strong>Metadata:</strong>
//                 </p>
//                 <ul className="list-disc list-inside">
//                   {Object.entries(a.metadata).map(([key, value]) => (
//                     <li key={key}>
//                       <strong>{key}:</strong> {value as string}
//                     </li>
//                   ))}
//                 </ul>
//               </div>
//             )}
//           </div>
//         ))
//       )}
//     </div>
//   );
// }






// 'use client';
// import { useState } from 'react';
// import { useCurrentAccount } from '@mysten/dapp-kit';
// import { useQuery } from '@tanstack/react-query';
// import { Button } from '@radix-ui/themes';
// import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
// import Loading from '~~/components/Loading';
// import { decryptString } from '../../../../lib/encrypt';
// import { CONTRACT_PACKAGE_VARIABLE_NAME } from '~~/config/network';
// import useNetworkConfig from '~~/hooks/useNetworkConfig';

// const client = new SuiClient({ url: getFullnodeUrl('devnet') });
// const SECRET = process.env.NEXT_PUBLIC_CRYPTO_SECRET || 'secret';

// export default function AgreementList() {
//   const acct = useCurrentAccount();
//   const [activeTab, setActiveTab] = useState<'created' | 'participating'>('created');

//   // Use your network config hook to get package ID reliably
//   const { useNetworkVariable } = useNetworkConfig();
//   const packageId = useNetworkVariable(CONTRACT_PACKAGE_VARIABLE_NAME) || process.env.NEXT_PUBLIC_CONTRACT_PACKAGE_ID;

//   const { data, isLoading } = useQuery(
//     ['agreements', acct?.address],
//     async () => {
//       if (!acct?.address) return { created: [], participating: [] };

//       try {
//         // Step 1: Fetch owned objects (IDs only)
//         const ownedObjectsResp = await client.getOwnedObjects({
//           owner: acct.address,
//           filter: {
//             StructType: `${packageId}::agreement::Agreement`,
//           },
//           // No showContent here!
//         });

//         const ownedObjectIds = ownedObjectsResp.data.map((obj) => obj.data?.objectId);

//         if (ownedObjectIds.length === 0) {
//           return { created: [], participating: [] };
//         }

//         // Step 2: Fetch full content for those objects
//         const objectsWithContent = await client.multiGetObjects({
//           ids: ownedObjectIds as string[],
//           options: { showContent: true },
//         });

//         // Step 3: Parse and decrypt objects
//         const agreements = await Promise.all(
//           objectsWithContent
//             .filter((obj) => obj.data?.content && obj.data.content.dataType === 'moveObject')
//             .map(async (obj) => {
//               const fields = (obj.data!.content as any).fields;

//               let mediaUrl = '';
//               let metadata = {};
//               try {
//                 mediaUrl = await decryptString(fields.media_hash, SECRET);
//                 const metadataStr = await decryptString(fields.metadata_hash, SECRET);
//                 metadata = JSON.parse(metadataStr);
//               } catch (e) {
//                 console.warn('Failed to decrypt or parse:', e);
//               }

//               const signatories = [fields.signatory1, fields.signatory2];
//               const signed = [
//                 fields.signed1 ? fields.signatory1 : null,
//                 fields.signed2 ? fields.signatory2 : null,
//               ].filter(Boolean);

//               return {
//                 agreementId: obj.data!.objectId,
//                 creator: fields.creator,
//                 mediaUrl,
//                 metadata,
//                 signatories,
//                 signed,
//                 active: fields.active,
//                 expiry: fields.expiry,
//                 revoked: fields.revoked,
//                 proposedMetadata: fields.proposed_metadata,
//                 editSigned: [fields.edit_signed1, fields.edit_signed2],
//               };
//             })
//         );

//         // Step 4: Split agreements into created and participating
//         const created = agreements.filter((a) => a.creator === acct.address);
//         const participating = agreements.filter(
//           (a) => a.creator !== acct.address && a.signatories.includes(acct.address)
//         );

//         return { created, participating };
//       } catch (err) {
//         console.warn('Error fetching agreements from Sui client:', err);
//         return { created: [], participating: [] };
//       }
//     },
//     {
//       enabled: !!acct?.address,
//     }
//   ) as any;

//   if (!acct) return <div>Please connect your wallet</div>;
//   if (isLoading) return <Loading />;

//   const agreements = activeTab === 'created' ? data?.created ?? [] : data?.participating ?? [];

//   const renderMediaPreview = (url: string) => {
//     if (!url) return null;
//     if (url.match(/\.(mp4|webm)$/)) return <video controls className="max-w-full rounded" src={url} />;
//     if (url.match(/\.(mp3|wav)$/)) return <audio controls src={url} />;
//     if (url.match(/\.(jpg|jpeg|png|gif|svg)$/)) return <img src={url} alt="media" className="max-w-full rounded" />;
//     return (
//       <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
//         Open Media
//       </a>
//     );
//   };

//   return (
//     <div className="space-y-4 max-w-4xl mx-auto">
//       <div className="flex gap-4 mb-6">
//         <Button variant={activeTab === 'created' ? 'solid' : 'outline'} onClick={() => setActiveTab('created')}>
//           Created
//         </Button>
//         <Button variant={activeTab === 'participating' ? 'solid' : 'outline'} onClick={() => setActiveTab('participating')}>
//           Participating
//         </Button>
//       </div>

//       {agreements.length === 0 ? (
//         <div>No agreements in this category</div>
//       ) : (
//         agreements.map((a: any) => (
//           <div key={a.agreementId} className="border p-6 rounded shadow space-y-2">
//             <p>
//               <strong>ID:</strong> {a.agreementId}
//             </p>
//             <p>
//               <strong>Expiry:</strong> {a.expiry}
//             </p>
//             <p>
//               <strong>Active:</strong> {a.active ? '✅ Yes' : '❌ No'}
//             </p>
//             <p>
//               <strong>Revoked:</strong> {a.revoked ? '❌ Yes' : '✅ No'}
//             </p>
//             <p>
//               <strong>Creator:</strong> {a.creator}
//             </p>
//             <p>
//               <strong>Signatories:</strong> {a.signatories.join(', ')}
//             </p>
//             <p>
//               <strong>Signed:</strong> {a.signed.join(', ')}
//             </p>

//             {a.mediaUrl && (
//               <div>
//                 <p>
//                   <strong>Media:</strong>
//                 </p>
//                 <div>{renderMediaPreview(a.mediaUrl)}</div>
//               </div>
//             )}

//             {a.metadata && Object.keys(a.metadata).length > 0 && (
//               <div>
//                 <p>
//                   <strong>Metadata:</strong>
//                 </p>
//                 <ul className="list-disc list-inside">
//                   {Object.entries(a.metadata).map(([key, value]) => (
//                     <li key={key}>
//                       <strong>{key}:</strong> {value as string}
//                     </li>
//                   ))}
//                 </ul>
//               </div>
//             )}
//           </div>
//         ))
//       )}
//     </div>
//   );
// }









// 'use client';
// import { useState } from 'react';
// import { useCurrentAccount } from '@mysten/dapp-kit';
// import { useQuery } from '@tanstack/react-query';
// import { Button } from '@radix-ui/themes';
// import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
// import Loading from '~~/components/Loading';
// import { decryptString } from '../../../../lib/encrypt';
// import { CONTRACT_PACKAGE_VARIABLE_NAME } from '~~/config/network';
// import useNetworkConfig from '~~/hooks/useNetworkConfig';

// const client = new SuiClient({ url: getFullnodeUrl('devnet') });
// const SECRET = process.env.NEXT_PUBLIC_CRYPTO_SECRET || 'secret';

// export default function AgreementList() {
//   const acct = useCurrentAccount();
//   const [activeTab, setActiveTab] = useState<'created' | 'participating'>('created');

//   // Use your network config hook to get package ID reliably
//   const { useNetworkVariable } = useNetworkConfig();
//   const packageId =
//     useNetworkVariable(CONTRACT_PACKAGE_VARIABLE_NAME) || process.env.NEXT_PUBLIC_CONTRACT_PACKAGE_ID;

//   const { data, isLoading } = useQuery({
//     queryKey: ['agreements', acct?.address],
//     queryFn: async () => {
//       if (!acct?.address) return { created: [], participating: [] };

//       try {
//         // Step 1: Fetch owned objects (IDs only)
//         const ownedObjectsResp = await client.getOwnedObjects({
//           owner: acct.address,
//           filter: {
//             StructType: `${packageId}::agreement`,
//           },
//           // no showContent here: fetch only IDs for now
//         });

//         console.log("omo ehn", {
//             packageId,
//             ownedObjectsResp
//         })

//         const ownedObjectIds = ownedObjectsResp.data
//           .map((obj) => obj.data?.objectId)
//           .filter(Boolean) as string[];

//         if (ownedObjectIds.length === 0) {
//           return { created: [], participating: [] };
//         }

//         // Step 2: Fetch full content for those objects
//         const objectsWithContent = await client.multiGetObjects({
//           ids: ownedObjectIds,
//           options: { showContent: true },
//         });

//         // Step 3: Parse and decrypt objects
//         const agreements = await Promise.all(
//           objectsWithContent
//             .filter((obj) => obj.data?.content && obj.data.content.dataType === 'moveObject')
//             .map(async (obj) => {
//               const fields = (obj.data!.content as any).fields;

//               let mediaUrl = '';
//               let metadata = {};
//               try {
//                 mediaUrl = await decryptString(fields.media_hash, SECRET);
//                 const metadataStr = await decryptString(fields.metadata_hash, SECRET);
//                 metadata = JSON.parse(metadataStr);
//               } catch (e) {
//                 console.warn('Failed to decrypt or parse:', e);
//               }

//               const signatories = [fields.signatory1, fields.signatory2];
//               const signed = [
//                 fields.signed1 ? fields.signatory1 : null,
//                 fields.signed2 ? fields.signatory2 : null,
//               ].filter(Boolean);

//               return {
//                 agreementId: obj.data!.objectId,
//                 creator: fields.creator,
//                 mediaUrl,
//                 metadata,
//                 signatories,
//                 signed,
//                 active: fields.active,
//                 expiry: fields.expiry,
//                 revoked: fields.revoked,
//                 proposedMetadata: fields.proposed_metadata,
//                 editSigned: [fields.edit_signed1, fields.edit_signed2],
//               };
//             })
//         );

//         // Step 4: Split agreements into created and participating
//         const created = agreements.filter((a) => a.creator === acct.address);
//         const participating = agreements.filter(
//           (a) => a.creator !== acct.address && a.signatories.includes(acct.address)
//         );

//         return { created, participating };
//       } catch (err) {
//         console.warn('Error fetching agreements from Sui client:', err);
//         return { created: [], participating: [] };
//       }
//     },
//     enabled: !!acct?.address,
//   }) as any;

//   if (!acct) return <div>Please connect your wallet</div>;
//   if (isLoading) return <Loading />;

//   const agreements = activeTab === 'created' ? data?.created ?? [] : data?.participating ?? [];

//   const renderMediaPreview = (url: string) => {
//     if (!url) return null;
//     if (url.match(/\.(mp4|webm)$/)) return <video controls className="max-w-full rounded" src={url} />;
//     if (url.match(/\.(mp3|wav)$/)) return <audio controls src={url} />;
//     if (url.match(/\.(jpg|jpeg|png|gif|svg)$/)) return (
//       <img src={url} alt="media" className="max-w-full rounded" />
//     );
//     return (
//       <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
//         Open Media
//       </a>
//     );
//   };

//   return (
//     <div className="space-y-4 max-w-4xl mx-auto">
//       <div className="flex gap-4 mb-6">
//         <Button
//           variant={activeTab === 'created' ? 'solid' : 'outline'}
//           onClick={() => setActiveTab('created')}
//         >
//           Created
//         </Button>
//         <Button
//           variant={activeTab === 'participating' ? 'solid' : 'outline'}
//           onClick={() => setActiveTab('participating')}
//         >
//           Participating
//         </Button>
//       </div>

//       {agreements.length === 0 ? (
//         <div>No agreements in this category</div>
//       ) : (
//         agreements.map((a: any) => (
//           <div key={a.agreementId} className="border p-6 rounded shadow space-y-2">
//             <p>
//               <strong>ID:</strong> {a.agreementId}
//             </p>
//             <p>
//               <strong>Expiry:</strong> {a.expiry}
//             </p>
//             <p>
//               <strong>Active:</strong> {a.active ? '✅ Yes' : '❌ No'}
//             </p>
//             <p>
//               <strong>Revoked:</strong> {a.revoked ? '❌ Yes' : '✅ No'}
//             </p>
//             <p>
//               <strong>Creator:</strong> {a.creator}
//             </p>
//             <p>
//               <strong>Signatories:</strong> {a.signatories.join(', ')}
//             </p>
//             <p>
//               <strong>Signed:</strong> {a.signed.join(', ')}
//             </p>

//             {a.mediaUrl && (
//               <div>
//                 <p>
//                   <strong>Media:</strong>
//                 </p>
//                 <div>{renderMediaPreview(a.mediaUrl)}</div>
//               </div>
//             )}

//             {a.metadata && Object.keys(a.metadata).length > 0 && (
//               <div>
//                 <p>
//                   <strong>Metadata:</strong>
//                 </p>
//                 <ul className="list-disc list-inside">
//                   {Object.entries(a.metadata).map(([key, value]) => (
//                     <li key={key}>
//                       <strong>{key}:</strong> {value as string}
//                     </li>
//                   ))}
//                 </ul>
//               </div>
//             )}
//           </div>
//         ))
//       )}
//     </div>
//   );
// }



// 'use client';
// import { useState } from 'react';
// import { useCurrentAccount } from '@mysten/dapp-kit';
// import { useQuery } from '@tanstack/react-query';
// import { Button } from '@radix-ui/themes';
// import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
// import Loading from '~~/components/Loading';
// import { decryptString } from '../../../../lib/encrypt';
// import { CONTRACT_PACKAGE_VARIABLE_NAME } from '~~/config/network';
// import useNetworkConfig from '~~/hooks/useNetworkConfig';

// const client = new SuiClient({ url: getFullnodeUrl('devnet') });
// const SECRET = process.env.NEXT_PUBLIC_CRYPTO_SECRET || 'secret';

// export default function AgreementList() {
//   const acct = useCurrentAccount();
//   const [activeTab, setActiveTab] = useState<'created' | 'participating'>('created');

//   const { useNetworkVariable } = useNetworkConfig();
//   const packageId =
//     useNetworkVariable(CONTRACT_PACKAGE_VARIABLE_NAME) || process.env.NEXT_PUBLIC_CONTRACT_PACKAGE_ID;

//   const { data, isLoading } = useQuery({
//     queryKey: ['agreements', acct?.address],
//     queryFn: async () => {
//       if (!acct?.address) return { created: [], participating: [] };

//       const objects = await client.getOwnedObjects({
//         owner: acct.address,
//         filter: {
//           StructType: `${packageId}::agreement::Agreement`,
//         },
//         options: {
//           showContent: true,
//         },
//       });

//       // Map and decrypt agreements, filtering out invalid ones
//       const agreements = (
//         objects.data
//           .map((obj) => {
//             const content = obj.data?.content;
//             if (
//               !content ||
//               content.dataType !== 'moveObject' ||
//               content.type !== `${packageId}::agreement::Agreement`
//             ) {
//               return null;
//             }

//             const fields = content.fields as {
//               creator: string;
//               media_hash: string;
//               metadata_hash: string;
//               signatory1: string;
//               signatory2: string;
//               signed1: boolean;
//               signed2: boolean;
//               active: boolean;
//               expiry: string;
//               revoked: boolean;
//               proposed_metadata: string;
//               edit_signed1: boolean;
//               edit_signed2: boolean;
//             };

//             // Decrypt media_url and metadata safely
//             let mediaUrl = '';
//             let metadata = {};
//             try {
//               const mediaUrl = decryptString(fields.media_hash, SECRET);
//               const metadataStr = decryptString(fields.metadata_hash, SECRET);
//               metadata = JSON.parse(metadataStr);
//             } catch (e) {
//               console.warn('Failed to decrypt or parse:', e);
//             }

//             const signatories = [fields.signatory1, fields.signatory2];
//             const signed = [
//               fields.signed1 ? fields.signatory1 : null,
//               fields.signed2 ? fields.signatory2 : null,
//             ].filter(Boolean);

//             return {
//               agreementId: obj.data?.objectId as string,
//               creator: fields.creator,
//               mediaUrl,
//               metadata,
//               signatories,
//               signed,
//               active: fields.active,
//               expiry: fields.expiry,
//               revoked: fields.revoked,
//               proposedMetadata: fields.proposed_metadata,
//               editSigned: [fields.edit_signed1, fields.edit_signed2],
//             };
//           })
//           .filter(Boolean) as any[]
//       );

//       // Separate into created and participating
//       return {
//         created: agreements.filter((a) => a.creator === acct.address),
//         participating: agreements.filter(
//           (a) => a.creator !== acct.address && a.signatories.includes(acct.address)
//         ),
//       };
//     },
//     enabled: !!acct?.address,
//   }) as any;

//   if (!acct) return <div>Please connect your wallet</div>;
//   if (isLoading) return <Loading />;

//   const agreements = activeTab === 'created' ? data?.created ?? [] : data?.participating ?? [];

//   const renderMediaPreview = (url: string) => {
//     if (!url) return null;
//     if (url.match(/\.(mp4|webm)$/)) return <video controls className="max-w-full rounded" src={url} />;
//     if (url.match(/\.(mp3|wav)$/)) return <audio controls src={url} />;
//     if (url.match(/\.(jpg|jpeg|png|gif|svg)$/)) return (
//       <img src={url} alt="media" className="max-w-full rounded" />
//     );
//     return (
//       <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
//         Open Media
//       </a>
//     );
//   };

//   return (
//     <div className="space-y-4 max-w-4xl mx-auto">
//       <div className="flex gap-4 mb-6">
//         <Button
//           variant={activeTab === 'created' ? 'solid' : 'outline'}
//           onClick={() => setActiveTab('created')}
//         >
//           Created
//         </Button>
//         <Button
//           variant={activeTab === 'participating' ? 'solid' : 'outline'}
//           onClick={() => setActiveTab('participating')}
//         >
//           Participating
//         </Button>
//       </div>

//       {agreements.length === 0 ? (
//         <div>No agreements in this category</div>
//       ) : (
//         agreements.map((a: any) => (
//           <div key={a.agreementId} className="border p-6 rounded shadow space-y-2">
//             <p>
//               <strong>ID:</strong> {a.agreementId}
//             </p>
//             <p>
//               <strong>Expiry:</strong> {a.expiry}
//             </p>
//             <p>
//               <strong>Active:</strong> {a.active ? '✅ Yes' : '❌ No'}
//             </p>
//             <p>
//               <strong>Revoked:</strong> {a.revoked ? '❌ Yes' : '✅ No'}
//             </p>
//             <p>
//               <strong>Creator:</strong> {a.creator}
//             </p>
//             <p>
//               <strong>Signatories:</strong> {a.signatories.join(', ')}
//             </p>
//             <p>
//               <strong>Signed:</strong> {a.signed.join(', ')}
//             </p>

//             {a.mediaUrl && (
//               <div>
//                 <p>
//                   <strong>Media:</strong>
//                 </p>
//                 <div>{renderMediaPreview(a.mediaUrl)}</div>
//               </div>
//             )}

//             {a.metadata && Object.keys(a.metadata).length > 0 && (
//               <div>
//                 <p>
//                   <strong>Metadata:</strong>
//                 </p>
//                 <ul className="list-disc list-inside">
//                   {Object.entries(a.metadata).map(([key, value]) => (
//                     <li key={key}>
//                       <strong>{key}:</strong> {value as string}
//                     </li>
//                   ))}
//                 </ul>
//               </div>
//             )}
//           </div>
//         ))
//       )}
//     </div>
//   );
// }




'use client';
import { useState } from 'react';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@radix-ui/themes';
import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
import Loading from '~~/components/Loading';
import { decryptString } from '../../../../lib/encrypt';
import { CONTRACT_PACKAGE_VARIABLE_NAME } from '~~/config/network';
import useNetworkConfig from '~~/hooks/useNetworkConfig';

const client = new SuiClient({ url: getFullnodeUrl('devnet') });
const SECRET = process.env.NEXT_PUBLIC_CRYPTO_SECRET || 'secret';

export default function AgreementList() {
  const acct = useCurrentAccount();
  const [activeTab, setActiveTab] = useState<'created' | 'participating'>('created');

  const { useNetworkVariable } = useNetworkConfig();
  const packageId =
    useNetworkVariable(CONTRACT_PACKAGE_VARIABLE_NAME) || process.env.NEXT_PUBLIC_CONTRACT_PACKAGE_ID;

  const { data, isLoading } = useQuery({
    queryKey: ['agreements', acct?.address],
    queryFn: async () => {
      if (!acct?.address) return { created: [], participating: [] };

      const objects = await client.getOwnedObjects({
        owner: acct.address,
        filter: {
          StructType: `0x9978b85fc8a99279635ff62b0bad1793a46a0c941d9b31353bdda97b8486000f::agreement::Agreement`,
        },
        options: {
          showContent: true,
        },
      });

      const agreements = (
        await Promise.all(
          objects.data.map(async (obj) => {
            const content = obj.data?.content;
            if (
              !content ||
              content.dataType !== 'moveObject' ||
              content.type !== `${packageId}::agreement::Agreement`
            ) {
              return null;
            }

            const fields = content.fields as {
              creator: string;
              media_hash: string;
              metadata_hash: string;
              signatory1: string;
              signatory2: string;
              signed1: boolean;
              signed2: boolean;
              active: boolean;
              expiry: string;
              revoked: boolean;
              proposed_metadata: string;
              edit_signed1: boolean;
              edit_signed2: boolean;
            };

            let mediaUrl = '';
            let metadata = {};
            try {
              mediaUrl = await decryptString(fields.media_hash, SECRET);
              const metadataStr = await decryptString(fields.metadata_hash, SECRET);
              metadata = JSON.parse(metadataStr);
            } catch (e) {
              console.warn('Failed to decrypt or parse:', e);
            }

            const signatories = [fields.signatory1, fields.signatory2];
            const signed = [
              fields.signed1 ? fields.signatory1 : null,
              fields.signed2 ? fields.signatory2 : null,
            ].filter(Boolean);

            return {
              agreementId: obj.data?.objectId as string,
              creator: fields.creator,
              mediaUrl,
              metadata,
              signatories,
              signed,
              active: fields.active,
              expiry: fields.expiry,
              revoked: fields.revoked,
              proposedMetadata: fields.proposed_metadata,
              editSigned: [fields.edit_signed1, fields.edit_signed2],
            };
          })
        )
      ).filter(Boolean) as any[];

      return {
        created: agreements.filter((a) => a.creator === acct.address),
        participating: agreements.filter(
          (a) => a.creator !== acct.address && a.signatories.includes(acct.address)
        ),
      };
    },
    enabled: !!acct?.address,
  }) as any;

  if (!acct) return <div>Please connect your wallet</div>;
  if (isLoading) return <Loading />;

  const agreements = activeTab === 'created' ? data?.created ?? [] : data?.participating ?? [];

  const renderMediaPreview = (url: string) => {
    if (!url) return null;
    if (url.match(/\.(mp4|webm)$/)) return <video controls className="max-w-full rounded" src={url} />;
    if (url.match(/\.(mp3|wav)$/)) return <audio controls src={url} />;
    if (url.match(/\.(jpg|jpeg|png|gif|svg)$/)) return (
      <img src={url} alt="media" className="max-w-full rounded" />
    );
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
        Open Media
      </a>
    );
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      <div className="flex gap-4 mb-6">
        <Button
          variant={activeTab === 'created' ? 'solid' : 'outline'}
          onClick={() => setActiveTab('created')}
        >
          Created
        </Button>
        <Button
          variant={activeTab === 'participating' ? 'solid' : 'outline'}
          onClick={() => setActiveTab('participating')}
        >
          Participating
        </Button>
      </div>

      {agreements.length === 0 ? (
        <div>No agreements in this category</div>
      ) : (
        agreements.map((a: any) => (
          <div key={a.agreementId} className="border p-6 rounded shadow space-y-2">
            <p><strong>ID:</strong> {a.agreementId}</p>
            <p><strong>Expiry:</strong> {a.expiry}</p>
            <p><strong>Active:</strong> {a.active ? '✅ Yes' : '❌ No'}</p>
            <p><strong>Revoked:</strong> {a.revoked ? '❌ Yes' : '✅ No'}</p>
            <p><strong>Creator:</strong> {a.creator}</p>
            <p><strong>Signatories:</strong> {a.signatories.join(', ')}</p>
            <p><strong>Signed:</strong> {a.signed.join(', ')}</p>

            {a.mediaUrl && (
              <div>
                <p><strong>Media:</strong></p>
                <div>{renderMediaPreview(a.mediaUrl)}</div>
              </div>
            )}

            {a.metadata && Object.keys(a.metadata).length > 0 && (
              <div>
                <p><strong>Metadata:</strong></p>
                <ul className="list-disc list-inside">
                  {Object.entries(a.metadata).map(([key, value]) => (
                    <li key={key}>
                      <strong>{key}:</strong> {value as string}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}

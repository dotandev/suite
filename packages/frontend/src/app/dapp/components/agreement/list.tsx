import { useCurrentAccount } from "@mysten/dapp-kit";
import { getFullnodeUrl, SuiClient } from "@mysten/sui/client";
import { useQuery } from "@tanstack/react-query";
import Loading from "~~/components/Loading";

const packageId = process.env.NEXT_PUBLIC_DEVNET_CONTRACT_PACKAGE_ID;

const client = new SuiClient({ url: getFullnodeUrl('devnet') });

export default function AgreementList() {
  const currentAccount = useCurrentAccount();

  const { data, isPending, error } = useQuery({
    queryKey: ["agreements", currentAccount?.address],
    queryFn: async () => {
      if (!currentAccount?.address) return [];
      const res = await client.getOwnedObjects({
        owner: currentAccount.address,
        filter: { StructType: `${packageId}::agreement::Agreement` },
        options: { showContent: true },
      });
      return res.data || [];
    },
  });

  if (!currentAccount) return <p>Connect wallet</p>;
  if (isPending) return <Loading />;
  if (error) return <p>Error fetching agreements: {String(error)}</p>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {data.map((obj: any) => {
        const content = obj.data?.content;
        return (
          <div key={obj.data?.objectId} className="border p-4 rounded shadow">
            <p className="text-sm font-bold">ID: {obj.data?.objectId}</p>
            <p>Active: {String(content?.fields?.active)}</p>
            <p>Signatories: {(content?.fields?.signatories || []).join(", ")}</p>
            <p>Signed: {(content?.fields?.signed || []).join(", ")}</p>
          </div>
        );
      })}
    </div>
  );
}
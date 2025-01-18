"use client";

import { useEffect, useCallback, useState } from "react";
import sdk, {
  AddFrame,
  SignIn as SignInCore,
  type Context,
} from "@farcaster/frame-sdk";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { config } from "~/components/providers/WagmiProvider";
import { PurpleButton } from "~/components/ui/PurpleButton";
import { truncateAddress } from "~/lib/truncateAddress";
import { base, optimism, zora } from "wagmi/chains";
import { useContractWrite, useWaitForTransactionReceipt } from "wagmi";
import { ZORA_MINT_CONTRACT, ZORA_CHAIN_ID } from "~/lib/constants";
import { useAccount } from "wagmi";
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { createStore } from "mipd";
import { Label } from "~/components/ui/label";
import { PROJECT_TITLE } from "~/lib/constants";

function MintCard({ context }: { context: Context.FrameContext | undefined }) {
  const { address } = useAccount();
  const { data: hash, writeContract, isPending } = useContractWrite();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ 
    hash,
    chainId: ZORA_CHAIN_ID
  });

  const canMint = context?.interactor?.viewerContext?.liked && 
                 context?.interactor?.viewerContext?.following;

  const handleMint = async () => {
    if (!canMint) return;
    
    writeContract({
      address: ZORA_MINT_CONTRACT,
      abi: [
        {
          name: "mint",
          type: "function",
          stateMutability: "payable",
          inputs: [],
          outputs: [],
        },
      ] as const,
      functionName: "mint",
      chainId: ZORA_CHAIN_ID,
      value: BigInt(0) // Free mint
    });
  };

  return (
    <Card className="border-neutral-200 bg-white">
      <CardHeader>
        <CardTitle className="text-neutral-900">Mint Your Frame</CardTitle>
        <CardDescription className="text-neutral-600">
          {canMint 
            ? "You're eligible to mint!"
            : "Like & follow to unlock minting"}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 text-neutral-800">
        <div className="flex flex-col gap-2">
          <Label>Status:</Label>
          {isPending && <span>Confirming in wallet...</span>}
          {isConfirming && <span>Transaction pending...</span>}
          {isConfirmed && <span>Mint successful!</span>}
        </div>
        
        <Button 
          onClick={handleMint}
          disabled={!canMint || isPending}
          className="w-full"
        >
          {isPending ? "Minting..." : "Mint Frame"}
        </Button>

        {address && (
          <div className="text-sm text-neutral-600">
            Connected: {truncateAddress(address)}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function Frame(
  { title }: { title?: string } = { title: PROJECT_TITLE }
) {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [context, setContext] = useState<Context.FrameContext>();

  const [added, setAdded] = useState(false);

  const [addFrameResult, setAddFrameResult] = useState("");

  const addFrame = useCallback(async () => {
    try {
      await sdk.actions.addFrame();
    } catch (error) {
      if (error instanceof AddFrame.RejectedByUser) {
        setAddFrameResult(`Not added: ${error.message}`);
      }

      if (error instanceof AddFrame.InvalidDomainManifest) {
        setAddFrameResult(`Not added: ${error.message}`);
      }

      setAddFrameResult(`Error: ${error}`);
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      const context = await sdk.context;
      if (!context) {
        return;
      }

      setContext(context);
      setAdded(context.client.added);

      // If frame isn't already added, prompt user to add it
      if (!context.client.added) {
        addFrame();
      }

      sdk.on("frameAdded", ({ notificationDetails }) => {
        setAdded(true);
      });

      sdk.on("frameAddRejected", ({ reason }) => {
        console.log("frameAddRejected", reason);
      });

      sdk.on("frameRemoved", () => {
        console.log("frameRemoved");
        setAdded(false);
      });

      sdk.on("notificationsEnabled", ({ notificationDetails }) => {
        console.log("notificationsEnabled", notificationDetails);
      });
      sdk.on("notificationsDisabled", () => {
        console.log("notificationsDisabled");
      });

      sdk.on("primaryButtonClicked", () => {
        console.log("primaryButtonClicked");
      });

      console.log("Calling ready");
      sdk.actions.ready({});

      // Set up a MIPD Store, and request Providers.
      const store = createStore();

      // Subscribe to the MIPD Store.
      store.subscribe((providerDetails) => {
        console.log("PROVIDER DETAILS", providerDetails);
        // => [EIP6963ProviderDetail, EIP6963ProviderDetail, ...]
      });
    };
    if (sdk && !isSDKLoaded) {
      console.log("Calling load");
      setIsSDKLoaded(true);
      load();
      return () => {
        sdk.removeAllListeners();
      };
    }
  }, [isSDKLoaded, addFrame]);

  if (!isSDKLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <div
      style={{
        paddingTop: context?.client.safeAreaInsets?.top ?? 0,
        paddingBottom: context?.client.safeAreaInsets?.bottom ?? 0,
        paddingLeft: context?.client.safeAreaInsets?.left ?? 0,
        paddingRight: context?.client.safeAreaInsets?.right ?? 0,
      }}
    >
      <div className="w-[300px] mx-auto py-2 px-2">
        <h1 className="text-2xl font-bold text-center mb-4 text-neutral-900">{title}</h1>
        <MintCard context={context} />
      </div>
    </div>
  );
}

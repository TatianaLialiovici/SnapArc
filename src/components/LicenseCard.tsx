"use client";

import Image from "next/image";
import { useReadContract } from "wagmi";
import { useMarketContract } from "@/hooks/useMarketContract";
import { formatDate, formatUsdc, truncateAddress } from "@/lib/format";

interface LicenseCardProps {
  tokenId: bigint;
}

interface LicenseTuple {
  0: bigint;
  1: string;
  2: bigint;
  3: bigint;
}

interface PhotoTuple {
  0: string;
  1: string;
  2: string;
  3: string;
  4: bigint;
  5: boolean;
  6: bigint;
}

export function LicenseCard({ tokenId }: LicenseCardProps) {
  const { address, abi } = useMarketContract();

  const { data: license } = useReadContract({
    address,
    abi,
    functionName: "licenses",
    args: [tokenId],
    query: { enabled: !!address },
  });

  const photoId = license ? (license as LicenseTuple)[0] : undefined;

  const { data: tokenURI } = useReadContract({
    address,
    abi,
    functionName: "tokenURI",
    args: [tokenId],
    query: { enabled: !!address },
  });

  const { data: photo } = useReadContract({
    address,
    abi,
    functionName: "photos",
    args: photoId ? [photoId] : undefined,
    query: { enabled: !!address && !!photoId },
  });

  const photoTuple = photo as PhotoTuple | undefined;
  const licenseTuple = license as LicenseTuple | undefined;

  return (
    <div className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
      <div className="relative aspect-video overflow-hidden bg-slate-100 dark:bg-slate-800">
        {photoTuple?.[3] ? (
          <Image
            src={photoTuple[3]}
            alt={photoTuple[1]}
            fill
            className="object-cover transition duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-slate-500">Loading...</div>
        )}
      </div>
      <div className="p-5">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{photoTuple?.[1] ?? "License"}</h3>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          {photoTuple?.[2]}
        </p>
        <div className="mt-4 space-y-1 text-sm text-slate-500">
          <p>Token ID: {tokenId.toString()}</p>
          <p>Buyer: {licenseTuple ? truncateAddress(licenseTuple[1]) : "-"}</p>
          <p>Price: {licenseTuple ? formatUsdc(licenseTuple[2]) : "-"}</p>
          <p>Purchased: {licenseTuple ? formatDate(licenseTuple[3]) : "-"}</p>
        </div>
        {!!tokenURI && (
          <a
            href={tokenURI as string}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-block text-sm font-medium text-indigo-600 hover:underline"
          >
            View license metadata
          </a>
        )}
      </div>
    </div>
  );
}

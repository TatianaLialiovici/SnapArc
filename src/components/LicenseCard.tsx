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
    <div className="surface group overflow-hidden p-0 transition-transform duration-500 hover:-translate-y-1.5">
      <div className="relative m-3 aspect-[4/3] overflow-hidden rounded-2xl bg-[rgb(var(--paper-2))]">
        {photoTuple?.[3] ? (
          <Image
            src={photoTuple[3]}
            alt={photoTuple[1]}
            fill
            className="object-cover transition duration-700 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="aura-stage h-full w-full">
            <div className="aura-blob h-full w-full" style={{ borderRadius: "16px" }}>
              <div className="aura-grain" />
            </div>
          </div>
        )}
        <span className="absolute left-3 top-3 rounded-full bg-[rgba(255,255,255,0.85)] px-2.5 py-1 font-mono text-[0.6rem] uppercase tracking-widest text-ink-soft backdrop-blur">
          License #{tokenId.toString()}
        </span>
      </div>
      <div className="px-5 pb-5">
        <h3 className="display-title text-xl text-ink">{photoTuple?.[1] ?? "License"}</h3>
        <p className="mt-1.5 line-clamp-2 text-sm text-ink-soft">{photoTuple?.[2]}</p>
        <div className="mt-4 space-y-1.5 font-mono text-xs text-ink-faint">
          <p>BUYER // {licenseTuple ? truncateAddress(licenseTuple[1]) : "—"}</p>
          <p>PRICE // {licenseTuple ? formatUsdc(licenseTuple[2]) : "—"}</p>
          <p>CAPTURED // {licenseTuple ? formatDate(licenseTuple[3]) : "—"}</p>
        </div>
        {!!tokenURI && (
          <a
            href={tokenURI as string}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-block text-sm font-medium text-[rgb(var(--accent))] hover:underline"
          >
            View license metadata →
          </a>
        )}
      </div>
    </div>
  );
}

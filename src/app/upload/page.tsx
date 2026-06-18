"use client";

import { useState, useRef } from "react";
import { useAccount } from "wagmi";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { Navbar } from "@/components/Navbar";
import { useMarketContract } from "@/hooks/useMarketContract";
import { uploadToPinata } from "@/lib/ipfs";
import { MAX_PRICE_USDC, MIN_PRICE_USDC, parseUsdc } from "@/lib/format";
import Link from "next/link";

export default function UploadPage() {
  const { isConnected } = useAccount();
  const { address, abi } = useMarketContract();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<string>("0.25");
  const [file, setFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hash, setHash] = useState<`0x${string}` | undefined>(undefined);

  const fileRef = useRef<HTMLInputElement>(null);

  const { writeContractAsync, isPending: isSubmitting } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const handleUpload = async () => {
    if (!file) return;
    const jwt = process.env.NEXT_PUBLIC_PINATA_JWT;
    if (!jwt) {
      setError("Pinata JWT is not configured. Paste the image URL manually or set NEXT_PUBLIC_PINATA_JWT.");
      return;
    }
    setUploading(true);
    setError(null);
    try {
      const result = await uploadToPinata(file, jwt);
      setImageUrl(result.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "IPFS upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!address || !isConnected) {
      setError("Please connect your wallet and deploy the contract first.");
      return;
    }
    if (!imageUrl) {
      setError("Provide an image URL or upload a file to IPFS.");
      return;
    }
    const numericPrice = parseFloat(price);
    if (numericPrice < MIN_PRICE_USDC || numericPrice > MAX_PRICE_USDC) {
      setError(`Price must be between ${MIN_PRICE_USDC} and ${MAX_PRICE_USDC} USDC.`);
      return;
    }

    try {
      const tx = await writeContractAsync({
        address,
        abi,
        functionName: "addPhoto",
        args: [title, description, imageUrl, parseUsdc(price)],
      });
      setHash(tx);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Transaction failed");
    }
  };

  return (
    <>
      <Navbar />
      <main className="relative overflow-hidden px-5 py-14">
        <div className="mx-auto max-w-2xl">
          <span className="label-mono fade-rise">Capture // New Frame</span>
          <h1 className="display-title mt-3 text-4xl text-ink fade-rise sm:text-5xl">Capture a frame</h1>
          <p className="mt-3 text-ink-soft fade-rise">
            List your work and set a license price between ${MIN_PRICE_USDC.toFixed(2)} and $
            {MAX_PRICE_USDC.toFixed(2)} USDC. Buyers acquire it as an on-chain license NFT.
          </p>

          <form onSubmit={handleSubmit} className="surface mt-8 space-y-6 p-7 fade-rise" style={{ animationDelay: "0.1s" }}>
            <div>
              <label className="label-mono mb-1.5 block">Title</label>
              <input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="field"
                placeholder="Golden Gate at sunset"
              />
            </div>

            <div>
              <label className="label-mono mb-1.5 block">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="field"
                rows={3}
                placeholder="Optional details about the photo"
              />
            </div>

            <div>
              <label className="label-mono mb-1.5 block">Price / USDC</label>
              <input
                required
                type="number"
                step="0.01"
                min={MIN_PRICE_USDC}
                max={MAX_PRICE_USDC}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="field"
              />
            </div>

            <div>
              <label className="label-mono mb-1.5 block">Photo file</label>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="w-full text-sm text-ink-soft file:mr-3 file:rounded-full file:border-0 file:bg-[rgb(var(--paper-2))] file:px-4 file:py-1.5 file:font-mono file:text-xs file:uppercase file:tracking-widest file:text-ink-soft"
              />
              <button
                type="button"
                onClick={handleUpload}
                disabled={!file || uploading}
                className="pill-ghost mt-3 text-sm"
              >
                {uploading ? "Uploading to IPFS…" : "Upload to IPFS"}
              </button>
            </div>

            <div>
              <label className="label-mono mb-1.5 block">Image URL (IPFS or direct)</label>
              <input
                required
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="field"
                placeholder="https://ipfs.io/ipfs/Qm..."
              />
            </div>

            {error && (
              <div className="rounded-2xl border border-[rgba(214,84,96,0.35)] bg-[rgba(214,84,96,0.08)] p-3 text-sm text-[rgb(var(--danger))]">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || isConfirming || !isConnected}
              className="pill-primary w-full justify-center"
            >
              {isSubmitting ? "Submitting…" : isConfirming ? "Confirming…" : "List Photo"}
            </button>
          </form>

          {isSuccess && (
            <div className="surface mt-6 p-5">
              <p className="display-title text-lg text-ink">Frame captured successfully.</p>
              <Link href="/browse" className="mt-2 inline-block text-sm font-medium text-[rgb(var(--accent))] hover:underline">
                View in the gallery →
              </Link>
            </div>
          )}
        </div>
      </main>
    </>
  );
}

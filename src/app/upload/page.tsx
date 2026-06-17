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
      <main className="relative overflow-hidden px-4 py-12">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950" />
        <div className="mx-auto max-w-2xl">
          <h1 className="text-3xl font-bold">Upload a photo</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-300">
            List your work and set a license price between {MIN_PRICE_USDC} and {MAX_PRICE_USDC} USDC.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6 rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
            <div>
              <label className="mb-1 block text-sm font-medium">Title</label>
              <input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-900"
                placeholder="Golden Gate at sunset"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-900"
                rows={3}
                placeholder="Optional details about the photo"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Price (USDC)</label>
              <input
                required
                type="number"
                step="0.01"
                min={MIN_PRICE_USDC}
                max={MAX_PRICE_USDC}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-900"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Photo file</label>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="w-full text-sm"
              />
              <button
                type="button"
                onClick={handleUpload}
                disabled={!file || uploading}
                className="mt-3 rounded-xl bg-slate-800 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-slate-700 disabled:opacity-50"
              >
                {uploading ? "Uploading to IPFS..." : "Upload to IPFS"}
              </button>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Image URL (IPFS or direct)</label>
              <input
                required
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-900"
                placeholder="https://ipfs.io/ipfs/Qm..."
              />
            </div>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || isConfirming || !isConnected}
              className="w-full rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-500 hover:shadow-indigo-600/30 disabled:opacity-50"
            >
              {isSubmitting ? "Submitting..." : isConfirming ? "Confirming..." : "List Photo"}
            </button>
          </form>

          {isSuccess && (
            <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300">
              <p className="font-semibold">Photo listed successfully!</p>
              <Link href="/browse" className="mt-2 inline-block text-sm font-medium text-indigo-600 hover:underline">
                View in marketplace
              </Link>
            </div>
          )}
        </div>
      </main>
    </>
  );
}

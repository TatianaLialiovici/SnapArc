/**
 * Pin a file to IPFS via the Pinata API.
 * Requires a Pinata JWT set in NEXT_PUBLIC_PINATA_JWT.
 */
export async function uploadToPinata(
  file: File,
  jwt: string
): Promise<{ ipfsHash: string; url: string }> {
  const form = new FormData();
  form.append("file", file);

  const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${jwt}`,
    },
    body: form,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Pinata upload failed (${res.status}): ${text}`);
  }

  const data = (await res.json()) as { IpfsHash: string };
  return {
    ipfsHash: data.IpfsHash,
    url: `https://ipfs.io/ipfs/${data.IpfsHash}`,
  };
}

export function isIpfsUrl(url: string): boolean {
  return url.startsWith("ipfs://") || url.startsWith("https://ipfs.io/ipfs/");
}

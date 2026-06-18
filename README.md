# SnapArc — Usage & Rights Sheet

Hi — if you're reading this you want to license one of my photographs. Good. This is the sheet I'd hand a client instead of a contract drafted by a stock agency's legal team. It tells you what I charge, what you're allowed to do with the picture, how the proof of your rights is recorded, and where the money actually lands. No account to register, no agency standing between us, no payout I'm waiting on. You pick a frame, you pay for it, the right is yours.

SnapArc is the small storefront I built to do exactly that, and only that.

## Rates

I price each photograph individually, and I keep every price inside one narrow band. There are no tiers, no "personal vs. commercial" splits, no surcharge for moving fast.

| Item | Amount |
| --- | --- |
| Lowest a frame can be priced | 0.10 USDC |
| Highest a frame can be priced | 0.50 USDC |
| What you pay | exactly the number on the listing |
| Add-ons, rush fees, desk fees | none |

The band isn't a guideline I try to stick to — it's enforced. The contract refuses to list a photo priced below 0.10 or above 0.50 USDC, and it refuses a purchase whose amount doesn't match the listing to the wei. So you can't accidentally overpay, and I can't quietly mark something up after you've seen it.

## The grant

Buy a frame and you're granted a **standard royalty-free usage right** to that image — one image, one right, per purchase. License three photographs and you've made three purchases and hold three separate rights.

What's unusual is the form the proof takes. The right is issued to your wallet as an ERC-721 token, and the token isn't a pointer to a row in my database — the relevant facts are written into it: which photograph, the title, the amount you paid, the timestamp, your address, and mine. If a client, an editor, or a platform ever asks you to show you cleared the rights, you show the token. You're not forwarding me an email and hoping I still have the thread.

Because the grant lives in your wallet, I can't revoke it. I'm free to reprice a listing or pull it down for future buyers, but a right you already hold is settled and stays settled.

## How the money reaches me

This is the section that explains why I stopped feeding these frames to stock libraries, so let me be blunt about the arithmetic.

When a stock site sells a sub-dollar license, the photographer typically nets roughly half of it after the platform's commission, and then can't even withdraw that half until it clears a payout minimum. For a 10- to 50-cent frame, that math is fatal: the only way to make it work is to bundle, subscribe, and wait. Direct selling at these prices has never been worth the friction.

SnapArc removes the middleman by removing the place a middleman's cut would sit. When you call `buyLicense`, the contract mints your token and forwards your **entire payment to me in the same transaction** — straight to my wallet, not into an escrow balance, a holding account, or a payout queue. There's no platform float for a commission to be skimmed from.

The reason this is viable on **Arc** specifically, and not on a general-purpose chain or through an agency, comes down to two properties that micro-licensing demands and almost nothing else satisfies: the price is denominated in the same dollar-stablecoin you settle in (USDC is Arc's native unit, so a "0.20 USDC" listing means 0.20 dollars, full stop, no second asset to acquire and convert), and the cost of moving that 20 cents is small enough that the sale clears a profit. At a dime a frame, those two facts are the whole business model. Strip them out and a 10-cent license is, once again, only worth handling through someone who'll keep half of it — which is precisely the arrangement I left.

There's also a running ledger: every sale adds to `photographerEarnings` for my address as it happens, so "what has this body of work actually earned" is a figure anyone can read back from the chain, not a statement I wait for at month's end.

## Kicking the tires before you buy

Two helper scripts ship in the repo so you can watch the mechanics work without taking my word for any of this:

- `npm run agent:buyer` — run from a funded test wallet, it picks an active listing and licenses it, so you can watch a purchase and a token mint go through end to end. I call it the "buyer agent," but be clear about what it is: a **demo script you trigger**, not an autonomous service. Nothing buys on its own.
- `npm run agent:royalty` — reads the `LicensePurchased` log for a given photographer and prints licenses sold and total earned. Again, a **reporting tool you run** against public events, not a background process.

For honesty's sake: there is **no x402 layer, no machine-to-machine paywall, and no autonomous agent** anywhere in this. Licensing is a plain wallet transaction on the listing page. The scripts are conveniences, nothing more.

## The fine print

- **Contract:** `SnapArcMarket` — an ERC-721 collection (OpenZeppelin Enumerable + Ownable, purchases guarded against reentrancy), Solidity 0.8.27, source verified on ArcScan so you can read the terms in code rather than trusting this sheet.
- **Address:** `0xE3132F95fE13E7e527FC04c41ae98d877e638589`
- **Network:** Arc Testnet — chain ID `5042002`, native currency USDC (18 decimals).
- **Read it yourself:** https://testnet.arcscan.app/address/0xE3132F95fE13E7e527FC04c41ae98d877e638589

The calls that do the real work, if you care to inspect them:

- `addPhoto(title, description, imageURI, price)` — I list a frame; `price` must fall between `MIN_PRICE` (0.10) and `MAX_PRICE` (0.50), and the collection is capped at `MAX_PHOTOS` (10,000) listings.
- `buyLicense(photoId)` — you send exactly the listed `price` as the call value; the contract mints your token, forwards the full amount to me, and emits `LicensePurchased`.
- `updatePhoto(photoId, newPrice, active)` — only the photographer of a frame may reprice or retire it.
- `getActivePhotoIds()`, `getLicenseIdsByOwner(owner)`, `photographerEarnings(address)` — views for browsing what's available, listing the rights you hold, and reading a photographer's running total.
- `tokenURI(tokenId)` — returns the license metadata as on-chain base64 JSON, so the proof is self-contained.

The storefront itself is a Next.js app (browse, upload, your licenses, earnings) talking to the contract through viem and wagmi. Listed price is final. Once your token mints the purchase is non-refundable — by that point the right is in your wallet and the payment is in mine, and neither of us can take the other's back. If you need usage beyond standard royalty-free, write to me and we'll handle it off this sheet; the on-chain product is exactly what's described above.

— Tatiana Lialiovici

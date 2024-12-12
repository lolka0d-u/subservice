# OnlySol

A Solana Anchor project where users are able to purshase/sell private subscriptions to images.

## Prerequisites

- [Solana](https://solana.com/docs/intro/installation)
- [Anchor](https://www.anchor-lang.com/docs/installation)
- [Node.js](https://nodejs.org/)

## Features

- Creators can upload images, set name & price with different tiers for a month subscription
- Creators can withdraw funds from their payto account
- Creators image links are encrypted
- Users can buy different tiers of subscriptions to images from different creators
- Automatic subscription expiration after 30 days
- Users can view active subscriptions and remaining time
- Users can view images from creators they follow

## How to run

1. Download required dependencies (see prerequisites)

2. Build the project:

```
anchor build
```

2. Sync keys:

```
anchor sync
```

3. Deploy and validate:

```
anchor test --skip-local-validator --skip-build
```
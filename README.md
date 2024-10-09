<p align="center">
  <img src="https://github.com/cometh-hq/android4337/blob/3e30328458e6a441c0be632189d97a0896f5816b/cometh-logo.png" alt="Cometh"/>
</p>

# rtn-4337

`rtn-4337` is a React Native SDK for building with [ERC-4337](https://eips.ethereum.org/EIPS/eip-4337).
It wraps two existing libraries, [android4337](https://github.com/cometh-hq/android4337) and [swift4337](https://github.com/cometh-hq/swift4337).
Built for the new React Native architecture with TurboModules, `rtn-4337` brings the main features from the native libraries. While not all features from the native versions are available, the key functionalities have been included.

## Installation

To add `rtn-4337` to your React Native project, use Yarn or npm to install the package directly from the GitHub repository:

```console
yarn add cometh-hq/rtn-4337 // or npm install cometh-hq/rtn-4337
```

## Getting Started
### Overview

```typescript
const chainId = 84532 // needed for android
const rpcUrl = "https://base-sepolia.g.alchemy.com/v2/UEwp8FtpdjcL5oekF6CjMzxe1D3768XU"
const bundlerUrl = "https://bundler.cometh.io/84532/?apikey=Y3dZHg2cc2qOT9ukzvxZZ7jEloTqx5rx"
const paymasterUrl = "https://paymaster.cometh.io/84532?apikey=Y3dZHg2cc2qOT9ukzvxZZ7jEloTqx5rx"
const signer = {...}

const safeAccount = new SafeAccount(
  chainId, // needed for android
  rpcUrl,
  bundlerUrl,
  signer,
  paymasterUrl
)

const to = "TO_ADDRESS"
const value = "0x0"
const data = "0xaaaa"
const hash = await safeAccount.sendUserOperation(to, value, data)
```

### Smart Account

Allows users to interact with their smart accounts, encapsulating ERC-4337 logic such as deploying the smart account on the first operation,
estimating user operations, and sponsoring gas.

#### SafeAccount

In this version of the SDK, we provide support for [Safe Accounts](https://safe.global/).

```typescript
const safeAccount = new SafeAccount(chainId, rpcUrl, bundlerUrl, signer, paymasterUrl)
const userOpHash = await safeAccount.sendUserOperation(to, value, data)
```

##### Constructor

```typescript
constructor(
    chainId: number,
    rpcUrl: string,
    bundlerUrl: string,
    signer: PasskeySigner | EOASigner,
    paymasterUrl?: string,
    safeConfig: SafeConfig = defaultConfig
)
```

- chainId: Needed for android lib.
- paymasterUrl: If specified, it will be used when preparing the user operation to sponsor gas fees.
- safeConfig: If not provided, the default configuration will be used.

```swift
// these values are from the safe deployments repo
(https://github.com/safe-global/safe-modules-deployments/tree/main/src/assets/safe-4337-module)
const defaultConfig: SafeConfig = {
  safeModuleSetupAddress: "0x2dd68b007B46fBe91B9A7c3EDa5A7a1063cB5b47",
  safe4337ModuleAddress: "0x75cf11467937ce3F2f357CE24ffc3DBF8fD5c226",
  safeSingletonL2Address: "0x29fcB43b46531BcA003ddC8FCB67FFE91900C762",
  safeProxyFactoryAddress: "0x4e1DCf7AD4e460CfD30791CCC4F9c8a4f820ec67",
  safeWebAuthnSharedSignerAddress: "0xfD90FAd33ee8b58f32c00aceEad1358e4AFC23f9",
  safeMultiSendAddress: "0x38869bf66a61cF6bDB996A6aE40D5853Fd43B526",
  safeP256VerifierAddress: "0x445a0683e494ea0c5AF3E83c5159fBE47Cf9e765",
  safeWebauthnSignerFactoryAddress: "0xF7488fFbe67327ac9f37D5F722d83Fc900852Fbf"
}
```

### Signer

To control a Smart Account, users need a Signer for authentication.

#### PasskeySigner

Passkeys provide enhanced security and simplify authentication through quick methods like biometrics. Supported by Apple, Google, and Microsoft, they are widely implemented on iOS and Android. Their adoption improves the user experience by making authentication faster and simpler.

On chain contracts use ERC-1271 and WebAuthn standards for verifying WebAuthn signatures with the secp256r1 curve.

> [!IMPORTANT]
> To enable passkey support on Android and iOS, you need to follow some instructions. Please refer to the original libraries for more information:
> - [android4337](https://github.com/cometh-hq/swift4337?tab=readme-ov-file#passkey-signer)
> - [swift4337](https://github.com/cometh-hq/swift4337?tab=readme-ov-file#passkey-signer)

> [!IMPORTANT]  
> When initializing a Safe Account with a Passkey signer it will use the Safe WebAuthn Shared Signer to respect 4337 limitation. For more information have a look at [Safe Documentation](https://github.com/safe-global/safe-modules/tree/main/modules/passkey/contracts/4337#safe-webauthn-shared-signer)

##### Safe WebAuthn Shared Signer

> [!IMPORTANT]
> At the moment, we only support the Safe WebAuthn Shared Signer.

There is one notable caveat when using the passkey module with ERC-4337 specifically, which is that ERC-4337 user operations can only deploy exactly one CREATE2 contract whose address matches the sender of the user operation. This means that deploying both the Safe account and its WebAuthn credential owner in a user operation's initCode is not possible.
In order to bypass this limitation you can use the SafeWebAuthnSharedSigner: a singleton that can be used as a Safe owner.
For more Infos : [Safe passkey module](https://github.com/safe-global/safe-modules/blob/main/modules/passkey/contracts/4337/README.md#overview)

To sign user operations with a Passkey, provide a passkey signer when creating the Safe Account. The Passkey will be created when the user sends a user operation. If the Passkey doesn't exist for the specified name, the registration process will start, and the user will need to use their biometrics.

Then when a request to sign a message is received, the user has to use its biometric to sign the message.

```typescript
const signer = { rpId: "sample4337.cometh.io", userName: "my_user" }
const safeAccount = new SafeAccount(chainId, rpcUrl, bundlerUrl, signer, paymasterUrl)

const userOpHash = await safeAccount.sendUserOperation(to, value, data)
```

This will init a safe with a Passkey Signer using the Safe WebAuthn Shared Signer contract as owner.
When deploying the safe, the Safe WebAuthn Shared Signer will be configured with the x and y of the passkey used.

You can check the example app for a complete example (see [sample](https://github.com/cometh-hq/rt-4337/tree/main/example)).


##### Safe WebAuthn Signer

Not yet supported.

#### EOASigner

Not yet supported.

### RPC, Bundler and Paymaster URLs

- RPC: To interact with the blockchain and call methods on smart contracts.
- Bundler: To send, estimate, and get user operations receipts, you need a Bundler.
- Paymaster: To sponsorise gas for users you need a Paymaster client.

The native libraries allow for overriding and creating your own RPC, bundler, or paymaster; this is not the case with this SDK. 
Thus, we use the default implementations provided by the underlying native libraries.

## Dependencies




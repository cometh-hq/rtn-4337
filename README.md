<p align="center">
  <img src="https://github.com/cometh-hq/android4337/blob/3e30328458e6a441c0be632189d97a0896f5816b/cometh-logo.png" alt="Cometh"/>
</p>

# rtn-4337

`rtn-4337` is a React Native SDK that wraps natives libraries [android4337](https://github.com/cometh-hq/android4337) and [swift4337](https://github.com/cometh-hq/swift4337) for building with [ERC-4337](https://eips.ethereum.org/EIPS/eip-4337).

Built for the new React Native architecture with TurboModules, `rtn-4337` brings the main features from the native libraries.

We currently support the following features:
- **Safe Account**: We offer a high-level API for deploying and managing smart accounts (currently supporting Safe Account).
- **Bundler**: Comprehensive support for all bundler methods as defined
  by [ERC-4337](https://eips.ethereum.org/EIPS/eip-4337#rpc-methods-eth-namespace).
- **Paymaster**: Enables paymaster for gas fee sponsorship.
- **Signers**: We support Passkey Signer, which allows users to sign user operation using biometrics.

## Installation

To add `rtn-4337` to your React Native project, install the package directly from the GitHub repository:

```
npm install @cometh/rtn-4337
```

### Configure for iOS

1. Add the following lines to your `Podfile`:

```
source 'https://github.com/cometh-hq/pod-specs' # Needed to get the latest version of argentlabs/web3.swift with Cocoapods
source 'https://github.com/CocoaPods/Specs.git'
use_modular_headers!
```

2. Set your deployment target to `15.6`.

If you're using expo, you can add this line to your `Podfile.properties.json`:

```
"ios.deploymentTarget": "15.6" 
```

or change it via Xcode.

3. Use statically linked frameworks

If expo, add this line to your `Podfile.properties.json`:

```
"ios.useFrameworks": "static"
```

4. Then run CocoaPods installation:

```
npx pod-install
``` 

## Getting Started
### Overview

```typescript
import {SafeAccount} from '@cometh/rtn-4337';

const safeAccount = new SafeAccount(
  {
    chainId: 84532, // needed for android
    rpcUrl: 'https://base-sepolia.g.alchemy.com/v2/UEwp8FtpdjcL5oekF6CjMzxe1D3768XU',
    bundlerUrl: 'https://bundler.cometh.io/84532/?apikey=Y3dZHg2cc2qOT9ukzvxZZ7jEloTqx5rx',
    signer: {...},
    paymasterUrl: 'https://paymaster.cometh.io/84532?apikey=Y3dZHg2cc2qOT9ukzvxZZ7jEloTqx5rx',
  }
)

const to = "TO_ADDRESS"
const value = "0x0"
const data = "0xaaaa"
const hash = await safeAccount.sendUserOperation([{to, value, data}])
```

### Smart Account

Allows users to interact with their smart accounts, encapsulating ERC-4337 logic such as deploying the smart account on the first operation,
estimating user operations, and sponsoring gas.

#### SafeAccount

In this version of the SDK, we provide support for [Safe Accounts](https://safe.global/).

```typescript
const safeAccount = new SafeAccount({ chainId, rpcUrl, bundlerUrl, signer, paymasterUrl})
const userOpHash = await safeAccount.sendUserOperation([{to, value, data}])
```

##### Constructor

```typescript
constructor(
        { chainId, rpcUrl, bundlerUrl, signer, paymasterUrl, address, safeConfig = defaultConfig }: 
        {
          chainId: number,
          rpcUrl: string,
          bundlerUrl: string,
          signer: PasskeySigner | EOASigner,
          paymasterUrl?: string,
          address?: string,
          safeConfig?: SafeConfig
        })
```

- **chainId**: Needed for android lib.
- **signer**: The signer used to sign user operations: EOASigner or PasskeySigner.
- **paymasterUrl**: If specified, it will be used when preparing the user operation to sponsor gas fees.
- **address**: If provided, the Safe Account will be initialized with this address.
- **safeConfig**: If not provided, the default configuration will be used.

```typescript
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

> [!NOTE]  
> We use the default Gas Estimator provided by the native libraries. For more details, refer to their implementation of `RPCGasEstimator`:
> - [android4337](https://github.com/cometh-hq/android4337/blob/main/android4337/src/main/java/io/cometh/android4337/gasprice/RPCGasEstimator.kt)
> - [swift4337](https://github.com/cometh-hq/swift4337/blob/main/Sources/swift4337/gas-estimator/RPCGasEstimator.swift)


##### Multi send

We provide a method to send multiple transactions in a single user operation using multisend ([contract](https://github.com/safe-global/safe-smart-account/blob/main/contracts/libraries/MultiSend.sol)).
When you send more than one transaction, we use the multisend contract.

```typescript
const userOpHash = await safeAccount.sendUserOperation([
  { to: "<address1>", value: "<value1>", data: "<data1>" },
  { to: "<address2>", value: "<value2>", data: "<data2>" },
  ])
```

##### Sign message (eip-1271)

SmartAccount implements Message Signature following [EIP 1271](https://eips.ethereum.org/EIPS/eip-1271).

Safe provide an implementation in its smart account contract.
We provide methods that allow the signature and the verification of Signature for Safe.


```typescript
const message = "0xaaaa"
const signature = await safeAccount.signMessage(message)
const isValidSignature = await safeAccount.isValidSignature(message, signature)
```


### Signer

To control a Smart Account, users need a Signer for authentication.

#### PasskeySigner

Passkeys provide enhanced security and simplify authentication through quick methods like biometrics. Supported by Apple, Google, and Microsoft, they are widely implemented on iOS and Android. Their adoption improves the user experience by making authentication faster and simpler.

On chain contracts use ERC-1271 and WebAuthn standards for verifying WebAuthn signatures with the secp256r1 curve.

> [!IMPORTANT]
> To enable passkey support on Android and iOS, you need to follow some instructions. Please refer to the original libraries for more information:
> - [android4337](https://github.com/cometh-hq/android4337?tab=readme-ov-file#passkey-signer)
> - [swift4337](https://github.com/cometh-hq/swift4337?tab=readme-ov-file#passkey-signer)

> [!IMPORTANT]  
> When initializing a Safe Account with a Passkey signer it will use the Safe WebAuthn Shared Signer to respect 4337 limitation. For more information have a look at [Safe Documentation](https://github.com/safe-global/safe-modules/tree/main/modules/passkey/contracts/4337#safe-webauthn-shared-signer)

##### Safe WebAuthn Shared Signer

There is one notable caveat when using the passkey module with ERC-4337 specifically, which is that ERC-4337 user operations can only deploy exactly one CREATE2 contract whose address matches the sender of the user operation. This means that deploying both the Safe account and its WebAuthn credential owner in a user operation's initCode is not possible.
In order to bypass this limitation you can use the SafeWebAuthnSharedSigner: a singleton that can be used as a Safe owner.
For more Infos : [Safe passkey module](https://github.com/safe-global/safe-modules/blob/main/modules/passkey/contracts/4337/README.md#overview)

To sign user operations with a Passkey, provide a passkey signer when creating the Safe Account. 
If the Passkey doesn't exist for the specified name, the registration process will start, and the user will need to use their biometrics.

Then when a request to sign a message is received, the user has to use its biometric to sign the message.

```typescript
const signer = await PasskeySigner.create("sample4337.cometh.io", "my_user")
const safeAccount = new SafeAccount({ chainId, rpcUrl, bundlerUrl, signer, paymasterUrl})
const userOpHash = await safeAccount.sendUserOperation([{to, value, data}])
```

This will init a safe with a Passkey Signer using the Safe WebAuthn Shared Signer contract as owner.
When deploying the safe, the Safe WebAuthn Shared Signer will be configured with the x and y of the passkey used.

You can check the example app for a complete example (see [example](https://github.com/cometh-hq/rt-4337/tree/main/example)).

##### Using an existing passkey

If you prefer to manage the passkey on your side, you can initialize a signer by directly providing the passkey.

```typescript
const passkey = { x: "<passkey_x>", y: "<passkey_y>" }
const signer = Passkey.fromExisting("sample4337.cometh.io", "my_user", passkey)
const safeAccount = new SafeAccount({ chainId, rpcUrl, bundlerUrl, signer, paymasterUrl})
```

##### Safe WebAuthn Signer

Not yet supported.

#### EOASigner

You can also use an EOASigner to sign user operations. This signer is used to sign user operations with an EOA.

**NOTE: TODO**.

```typescript
const signer = { privateKey: "xxxxxxxxxxx" }
const safeAccount = new SafeAccount({ chainId, rpcUrl, bundlerUrl, signer, paymasterUrl})
const userOpHash = await safeAccount.sendUserOperation([{to, value, data}])
```

### Recovery Module

#### Enable Recovery Module

rtn-4337 provides a way to enable a recovery module for a Safe Account. In our implementation, we use [Delay Module](https://github.com/gnosisguild/zodiac-modifier-delay) as recovery module.

Here is the API we provide:

```typescript
fun enableRecovery(guardianAddress: Address, recoveryModuleConfig: RecoveryModuleConfig = RecoveryModuleConfig()): String
fun getCurrentGuardian(delayAddress: Address): Address?
fun isRecoveryStarted(delayAddress: Address): Boolean
fun cancelRecovery(delayAddress: Address): String
```

- **enableRecovery**: Enables the recovery module for the safe account by passing the guardian address and the recovery module configuration.
- **getCurrentGuardian**: Returns the current guardian address (if any) for the delay module.
- **isRecoveryStarted**: Returns true if the recovery process has started.
- **cancelRecovery**: Cancels the recovery process (if any).

`RecoveryModuleConfig` describes the configuration used for the recovery module, we provides default values:

```typescript
const defaultRecoveryConfig: RecoveryConfig = {
  moduleFactoryAddress: "0x000000000000aDdB49795b0f9bA5BC298cDda236",
  delayModuleAddress: "0xd54895B1121A2eE3f37b502F507631FA1331BED6",
  recoveryCooldown: 86400,
  recoveryExpiration: 604800,
};
```

You can override the default values by providing your own `RecoveryConfig`.


### RPC, Bundler and Paymaster URLs

- RPC: To interact with the blockchain and call methods on smart contracts.
- Bundler: To send, estimate, and get user operations receipts, you need a Bundler.
- Paymaster: To sponsorise gas for users you need a Paymaster client.

The native libraries allow for overriding and creating your own RPC, bundler, or paymaster; this is not the case with this SDK. 
Thus, we use the default implementations provided by the underlying native libraries.


## Contributors

The initial project was crafted by the team at Cometh. However, we encourage anyone to help implement new features and to keep this library up-to-date. Please follow the [contributing guidelines](https://github.com/cometh-hq/rtn-4337/blob/main/CONTRIBUTING.md).

## License

Released under the [Apache License](https://github.com/cometh-hq/rtn-4337/blob/main/LICENSE.txt).





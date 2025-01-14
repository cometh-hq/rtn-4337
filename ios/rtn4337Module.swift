import ExpoModulesCore
import swift4337
import web3
import BigInt

class Rtn4337Exception: GenericException<String> {
    override var reason: String {
        "\(param)"
    }
}

public class rtn4337Module: Module {
    public func definition() -> ModuleDefinition {
        Name("rtn4337")
        
        // SIGNER
        
        AsyncFunction("createPasskeySigner") { (rpId: String, userName: String) -> [String: String] in
            do {
                let signer = try await SafePasskeySigner(domain:rpId, name:userName)
                return [
                    "x": signer.publicX.web3.hexString,
                    "y": signer.publicY.web3.hexString
                ]
            } catch {
                throw Rtn4337Exception(error.localizedDescription)
            }
        }
        
        // BUNDLER
        
        AsyncFunction("ethGetUserOperationReceipt") { (bundlerUrl: String, userOpHash: String) -> [String: Any?]? in
            do {
                guard let bundlerUrl = URL(string: bundlerUrl) else {
                    throw Rtn4337Exception("Invalid bundler URL")
                }
                let bundler = BundlerClient(url: bundlerUrl)
                let resp = try await bundler.eth_getUserOperationReceipt(userOpHash)
                return resp?.toDictionary()
            } catch {
                throw Rtn4337Exception(error.localizedDescription)
            }
        }
        
        AsyncFunction("ethGetUserOperationByHash") { (bundlerUrl: String, userOpHash: String) -> [String: Any?]? in
            do {
                guard let bundlerUrl = URL(string: bundlerUrl) else {
                    throw Rtn4337Exception("Invalid bundler URL")
                }
                let bundler = BundlerClient(url: bundlerUrl)
                let resp = try await bundler.eth_getUserOperationByHash(userOpHash)
                return resp?.toDictionary()
            } catch {
                throw Rtn4337Exception(error.localizedDescription)
            }
        }
        
        // SAFE ACCOUNT
        
        AsyncFunction("sendUserOperation") { (params: CommonParams, to: String, value: String, data: String, delegateCall: Bool) -> String in
            do {
                let safeAccount = try await getSafeAccount(params: params)
                let userOpHash = try await safeAccount.sendUserOperation(
                    to: EthereumAddress(to),
                    value: BigUInt(hex: value)!,
                    data: data.web3.hexData!
                )
                return userOpHash
            } catch let error as EthereumClientError {
                var message = ""
                if case .executionError(let jSONRPCErrorDetail) = error {
                    message = jSONRPCErrorDetail.description
                }
                throw Rtn4337Exception("cannot send user op: \(message)")
            } catch {
                throw Rtn4337Exception(error.localizedDescription)
            }
        }
        
        AsyncFunction("sendMultiSendUserOperation") { (params: CommonParams, txParams: [TxParamsRecord]) -> String in
            do {
                let safeAccount = try await getSafeAccount(params: params)
                let params = txParams.compactMap{ record in
                    return TransactionParams(
                        to: EthereumAddress(record.to!),
                        value: BigUInt(record.value!) ?? BigUInt(0),
                        data: record.data?.web3.hexData ?? Data()
                    )
                }
                return try await safeAccount.sendUserOperation(params)
            } catch let error as EthereumClientError {
                var message = ""
                if case .executionError(let jSONRPCErrorDetail) = error {
                    message = jSONRPCErrorDetail.description
                }
                throw Rtn4337Exception("cannot send user op: \(message)")
            } catch {
                throw Rtn4337Exception(error.localizedDescription)
            }
        }
        
        AsyncFunction("predictAddress") { (chainId: Int, rpcUrl: String, signer: [String: Any], safeConfig: [String: String]) -> String in
            do {
                guard let rpcUrl = URL(string: rpcUrl) else {
                    throw Rtn4337Exception("Invalid RPC URL")
                }
                let rpc = EthereumHttpClient(url: rpcUrl, network: .custom(String(chainId)))
                let signer = try await getSigner(signer: signer, rpc: rpc)
                return try await SafeAccount.predictAddress(signer: signer, rpc: rpc, safeConfig: safeConfig.toSafeConfig()).asString()
            } catch {
                throw Rtn4337Exception(error.localizedDescription)
            }
        }
        
        AsyncFunction("getOwners") { (params: CommonParams) -> [String] in
            do {
                let safeAccount = try await getSafeAccount(params: params)
                let owners = try await safeAccount.getOwners()
                return owners.map { $0.asString() }
            } catch {
                throw Rtn4337Exception(error.localizedDescription)
            }
        }
        
        AsyncFunction("isDeployed") { (params: CommonParams) -> Bool in
            do {
                let safeAccount = try await getSafeAccount(params: params)
                let isDeployed = try await safeAccount.isDeployed()
                return isDeployed
            } catch let error as SmartAccountError {
                throw Rtn4337Exception(error.localizedDescription)
            }
        }
        
        AsyncFunction("addOwner") { (params: CommonParams, owner: String) -> String in
            do {
                let safeAccount = try await getSafeAccount(params: params)
                let userOpHash = try await safeAccount.addOwner(address: EthereumAddress(owner))
                return userOpHash
            } catch let error as SmartAccountError {
                throw Rtn4337Exception(error.localizedDescription)
            }
        }
        
        AsyncFunction("prepareUserOperation") { (params: CommonParams, to: String, value: String, data: String, delegateCall: Bool) -> [String: String?] in
            do {
                let safeAccount = try await getSafeAccount(params: params)
                let userOperation = try await safeAccount.prepareUserOperation(to: EthereumAddress(to), value: BigUInt(hex: value)!, delegateCall: delegateCall)
                return userOperation.toDictionary()
            } catch let error as SmartAccountError {
                throw Rtn4337Exception(error.localizedDescription)
            }
        }
        
        AsyncFunction("signUserOperation") { (params: CommonParams, userOp: UserOperationRecord) -> String in
            do {
                let safeAccount = try await getSafeAccount(params: params)
                let signature = try await safeAccount.signUserOperation(userOp.toUserOperation())
                return signature.web3.hexString
            } catch let error as EthereumClientError {
                var message = ""
                if case .executionError(let jSONRPCErrorDetail) = error {
                    message = jSONRPCErrorDetail.description
                }
                throw Rtn4337Exception("cannot sign user op: \(message)")
            } catch {
                throw Rtn4337Exception(error.localizedDescription)
            }
        }
        
        AsyncFunction("signMessage") { (params: CommonParams, message: String) -> String in
            let safeAccount = try await getSafeAccount(params: params)
            guard let data = message.web3.hexData else {
                throw Rtn4337Exception("Invalid message")
            }
            guard let signature = try await safeAccount.signMessage(data) else {
                throw Rtn4337Exception("Cannot sign message")
            }
            return signature.web3.hexString
        }
        
        AsyncFunction("isValidSignature") { (params: CommonParams, message: String, signature: String) -> Bool in
            let safeAccount = try await getSafeAccount(params: params)
            guard let messageData = message.web3.hexData else {
                throw Rtn4337Exception("Invalid message")
            }
            guard let signatureData = signature.web3.hexData else {
                throw Rtn4337Exception("Invalid signature")
            }
            let isValidSignature = try await safeAccount.isValidSignature(messageData, signature: signatureData)
            return isValidSignature
        }
        
        // Connect API
        AsyncFunction("connectApiInitWallet") { (params: ConnectParams, walletAddress: String, initiatorAddress: String, publicKeyId: String?, publicKeyX: String?, publicKeyY: String?, deviceData: ConnectDeviceData?, promise: Promise)  in
            let api = ConnectApi(apiKey: params.apiKey!, baseUrl: params.baseUrl!)
            var data: DeviceData? = nil
            if deviceData != nil {
                data = DeviceData(
                    browser: deviceData?.browser, os: deviceData?.os, platform: deviceData?.platform
                )
            }
            api.initWallet(chainId: "\(params.chainId!)", walletAddress: walletAddress, initiatorAddress: initiatorAddress, publicKeyId: publicKeyId, publicKeyX: publicKeyX, publicKeyY: publicKeyY, deviceData: data) { result in
                promise.resolve(handleConnectResp(result: result))
            }
        }
        AsyncFunction("connectApiCreateWebAuthnSigner") { (params: ConnectParams, walletAddress: String, publicKeyId: String, publicKeyX: String, publicKeyY: String, deviceData: ConnectDeviceData, signerAddress: String, promise: Promise) in
            let api = ConnectApi(apiKey: params.apiKey!, baseUrl: params.baseUrl!)
            let data = DeviceData(
                browser: deviceData.browser, os: deviceData.os, platform: deviceData.platform
            )
            api.createWebAuthnSigner(chainId: "\(params.chainId!)", walletAddress: walletAddress, publicKeyId: publicKeyId, publicKeyX: publicKeyX, publicKeyY: publicKeyY, deviceData: data, signerAddress: signerAddress, isSharedWebAuthnSigner: true) { result in
                promise.resolve(handleConnectResp(result: result))
            }
        }
        AsyncFunction("connectApiGetPasskeySignersByWalletAddress") { (params: ConnectParams, walletAddress: String, promise: Promise)  in
            let api = ConnectApi(apiKey: params.apiKey!, baseUrl: params.baseUrl!)
            api.getPasskeySignersByWalletAddress(walletAddress: walletAddress) { result in
                promise.resolve(handleConnectResp(result: result))
            }
        }
        AsyncFunction("connectApiIsValidSignature") { (params: ConnectParams, walletAddress: String, message: String, signature: String, promise: Promise)  in
            let api = ConnectApi(apiKey: params.apiKey!, baseUrl: params.baseUrl!)
            api.isValidSignature(walletAddress: walletAddress, chainId: "\(params.chainId!)", message: message, signature: signature) { result in
                promise.resolve(handleConnectResp(result: result))
            }
        }

    }
}

private func handleConnectResp<T>(result: Result<T, APIError>) -> [String: Any?] {
    switch result {
    case .success(let result):
        if result is InitWalletResponse {
            let resp = result as! InitWalletResponse
            return [
                "success": resp.success,
                "isNewWallet": resp.isNewWallet
            ]
        }
        else if result is GetPasskeySignersByWalletAddressResponse {
            let resp = result as! GetPasskeySignersByWalletAddressResponse
            return [
                "success": resp.success,
                "webAuthnSigners": resp.webAuthnSigners.map {
                    return [
                        "_id": $0._id,
                        "publicKeyId": $0.publicKeyId,
                        "publicKeyX": $0.publicKeyX,
                        "publicKeyY": $0.publicKeyY,
                        "signerAddress": $0.signerAddress,
                        "isSharedWebAuthnSigner": $0.isSharedWebAuthnSigner,
                    ]
                }
            ]
        }
        else if result is IsValidSignatureResp {
            let resp = result as! IsValidSignatureResp
            return [
                "success": resp.success,
                "result": resp.result
            ]
        }
        else {
            return [
                "success": true
            ]
        }
    case .failure(let error):
        return [
            "error": error
        ]
    }
}

private func getSafeAccount(params: CommonParams) async throws -> SafeAccount {
    try params.verify()
    
    guard let rpcUrl = URL(string: params.rpcUrl!) else {
        throw Rtn4337Exception("Invalid RPC URL")
    }
    let rpc = EthereumHttpClient(url: rpcUrl, network: .custom(String(params.chainId!)))
    
    guard let bundlerUrl = URL(string: params.bundlerUrl!) else {
        throw Rtn4337Exception("Invalid bundler URL")
    }
    let bundler = BundlerClient(url: bundlerUrl)
    
    let paymasterClient = params.paymasterUrl.flatMap { urlString in
        URL(string: urlString).map { PaymasterClient(url: $0) }
    }
    let signer = try await getSigner(signer: params.signer!, rpc: rpc)
    let address = params.address != nil ? EthereumAddress(params.address!) : nil
    return try await SafeAccount(address: address, signer: signer, rpc: rpc, bundler: bundler, paymaster: paymasterClient)
}

private func getSigner(signer: [String: Any], rpc: EthereumHttpClient) async throws -> SignerProtocol {
    if let rpId = signer["rpId"] as? String, let userName = signer["userName"] as? String {
        if let passkeyX = signer["passkeyX"] as? String, let passkeyY = signer["passkeyY"] as? String {
            let passkey = PublicKey(x: passkeyX, y:passkeyY)
            let signer = try await SafePasskeySigner(publicKey: passkey, domain: rpId, name: userName, isSharedWebauthnSigner: true, rpc: rpc)
            return signer
        }
        let signer = try await SafePasskeySigner(domain: rpId, name: userName, isSharedWebauthnSigner: true, rpc: rpc)
        return signer
    } else {
        if let privateKey = signer["privateKey"] as? String {
            return try EthereumAccount.importAccount(addingTo: EthereumKeyLocalStorage(), privateKey: privateKey, keystorePassword: "dev_only").toSigner()
        }
    }
    throw Rtn4337Exception("signer is not valid")
}

extension [String: String] {
    func toSafeConfig() -> SafeConfig {
        return SafeConfig(
            safeSingletonL2: self["safeSingletonL2Address"]!,
            proxyFactory: self["safeProxyFactoryAddress"]!,
            ERC4337ModuleAddress: self["safe4337ModuleAddress"]!,
            safeModuleSetupAddress: self["safeModuleSetupAddress"]!,
            entryPointAddress: self["entryPointAddress"]!,
            safeWebAuthnSharedSignerAddress: self["safeWebAuthnSharedSignerAddress"]!,
            safeMultiSendAddress: self["safeMultiSendAddress"]!,
            safeP256VerifierAddress: self["safeP256VerifierAddress"]!,
            safeWebauthnSignerFactory: self["safeWebauthnSignerFactoryAddress"]!
        )
    }
}

extension GetUserOperationReceiptResponse {
    public func toDictionary() -> [String: Any?] {
        return [
            "userOpHash": userOpHash,
            "sender": sender,
            "nonce": nonce,
            "actualGasUsed": actualGasUsed,
            "actualGasCost": actualGasCost,
            "success": success,
            "logs": logs.map { $0.toDictionary() }, 
            "receipt": receipt.toDictionary(),
            "paymaster": paymaster
        ]
    }
}

extension Log {
    public func toDictionary() -> [String: Any] {
        return [
            "logIndex": logIndex,
            "transactionIndex": transactionIndex,
            "transactionHash": transactionHash,
            "blockHash": blockHash,
            "blockNumber": blockNumber,
            "address": address,
            "data": data,
            "topics": topics,
        ]
    }
}

extension Receipt {
    public func toDictionary() -> [String: Any?] {
        return [
            "transactionHash": transactionHash,
            "transactionIndex": transactionIndex,
            "blockHash": blockHash,
            "blockNumber": blockNumber,
            "cumulativeGasUsed": cumulativeGasUsed,
            "gasUsed": gasUsed,
            "contractAddress": contractAddress,
            "status": status,
            "from": from,
            "to": to,
            "logs": logs.map { $0.toDictionary() },
            "logsBloom": logsBloom,
            "effectiveGasPrice": effectiveGasPrice,
        ]
    }
}

extension UserOperation {
    public func toDictionary() -> [String: String?] {
        return [
            "sender": sender,
            "nonce": nonce,
            "factory": factory,
            "factoryData": factoryData,
            "callData": callData,
            "preVerificationGas": preVerificationGas,
            "callGasLimit": callGasLimit,
            "verificationGasLimit": verificationGasLimit,
            "maxFeePerGas": maxFeePerGas,
            "maxPriorityFeePerGas": maxPriorityFeePerGas,
            "paymaster": paymaster,
            "paymasterData": paymasterData,
            "paymasterVerificationGasLimit": paymasterVerificationGasLimit,
            "paymasterPostOpGasLimit": paymasterPostOpGasLimit,
            "signature": signature
        ]
    }
}

extension UserOperationRecord {
    public func toUserOperation() -> UserOperation {
        return UserOperation(
            sender: self.sender!,
            nonce: self.nonce!,
            factory: self.factory,
            factoryData: self.factoryData,
            callData: self.callData!,
            preVerificationGas: self.preVerificationGas!,
            callGasLimit: self.callGasLimit!,
            verificationGasLimit: self.verificationGasLimit!,
            maxFeePerGas: self.maxFeePerGas!,
            maxPriorityFeePerGas: self.maxPriorityFeePerGas!,
            paymaster: self.paymaster,
            paymasterData: self.paymasterData,
            paymasterVerificationGasLimit: self.paymasterVerificationGasLimit,
            paymasterPostOpGasLimit: self.paymasterPostOpGasLimit,
            signature: self.signature!
        )
    }
}

extension GetUserOperationByHashResponse {
    public func toDictionary() -> [String: Any?] {
        var dict: [String: Any?] = [
            "userOperation": self.userOperation.toDictionary(),
            "entryPoint": self.entryPoint,
            "transactionHash": self.transactionHash,
            "blockHash": self.blockHash,
            "blockNumber": self.blockNumber
        ]
        return dict
    }
}
            
            

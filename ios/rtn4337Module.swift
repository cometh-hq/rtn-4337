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
                "publicX": signer.publicX.web3.hexString,
                "publicY": signer.publicY.web3.hexString
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
        var dict: [String: Any?] = [
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
        return dict
    }
}

extension Log {
    public func toDictionary() -> [String: Any] {
        return [
            "address": address,
            "data": data,
            "topics": topics
        ]
    }
}

extension Receipt {
    public func toDictionary() -> [String: Any?] {
        return [
            "status": status,
            "contractAddress": contractAddress,
            "cumulativeGasUsed": cumulativeGasUsed,
            "gasUsed": gasUsed,
            "logsBloom": logsBloom,
            "logs": logs.map { $0.toDictionary() },
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
            
            

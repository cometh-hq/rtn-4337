package io.cometh.rtn4337

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.Arguments;

import io.cometh.rtn4337.toReadableArray
import io.cometh.rtn4337.NativeRTN4337Spec
import io.cometh.android4337.safe.SafeAccount
import io.cometh.android4337.safe.signer.eoa.EOASigner
import io.cometh.android4337.safe.signer.passkey.PasskeySigner
import io.cometh.android4337.safe.signer.Signer
import io.cometh.android4337.bundler.SimpleBundlerClient
import io.cometh.android4337.paymaster.PaymasterClient
import io.cometh.android4337.utils.toByteArray
import io.cometh.android4337.utils.hexToBigInt
import io.cometh.android4337.utils.hexToAddress
import io.cometh.android4337.utils.hexToByteArray
import io.cometh.android4337.utils.toHex
import io.cometh.android4337.UserOperation
import io.cometh.android4337.safe.SafeConfig
import io.cometh.android4337.bundler.response.UserOperationReceipt

import org.web3j.protocol.core.methods.response.Log
import org.web3j.protocol.core.methods.response.TransactionReceipt
import org.web3j.protocol.http.HttpService
import org.web3j.crypto.Credentials

import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext


class ERC4337Module(val reactContext: ReactApplicationContext) : NativeRTN4337Spec(reactContext) {

    override fun getName() = NAME

    private val TAG = "ERC4337Module"

    override fun sendUserOperation(
        chainId: Double,
        rpcUrl: String,
        bundlerUrl: String,
        to_address: String,
        value: String,
        data: String,
        delegateCall: Boolean,
        signer: ReadableMap,
        config: ReadableMap,
        paymasterUrl: String?,
        address: String?,
        promise: Promise
    ) {
        CoroutineScope(Dispatchers.Main).launch {
            val rpcService = HttpService(rpcUrl)
            val bundlerClient = SimpleBundlerClient(HttpService(bundlerUrl))
            val paymasterClient = if (paymasterUrl != null) PaymasterClient(paymasterUrl) else null
            try {
              val s = getSigner(signer)
              withContext(Dispatchers.IO) {
                  val safeConfig = getSafeConfig(config)
                  val safeAccount = getSafeAccount(address, s, rpcService, bundlerClient, chainId.toInt(), paymasterClient, safeConfig)
                  val hash = safeAccount.sendUserOperation(to_address.hexToAddress(), value = value.hexToBigInt(), data = data.toByteArray(), delegateCall = delegateCall)
                  promise.resolve(hash)
              }
            } catch (e: Exception) {
              android.util.Log.e(TAG, "sendUserOperation error", e)
              promise.reject(e)
            }
        }
    }

    private fun getSafeConfig(config: ReadableMap): SafeConfig {
        return SafeConfig(
            safeModuleSetupAddress = config.getString("safeModuleSetupAddress")!!,
            safe4337ModuleAddress = config.getString("safe4337ModuleAddress")!!,
            safeSingletonL2Address = config.getString("safeSingletonL2Address")!!,
            safeProxyFactoryAddress = config.getString("safeProxyFactoryAddress")!!,
            safeWebAuthnSharedSignerAddress = config.getString("safeWebAuthnSharedSignerAddress")!!,
            safeMultiSendAddress = config.getString("safeMultiSendAddress")!!,
            safeP256VerifierAddress = config.getString("safeP256VerifierAddress")!!,
            safeWebauthnSignerFactoryAddress = config.getString("safeWebauthnSignerFactoryAddress")!!,
        )
    }

    private suspend fun getSigner(signer: ReadableMap): Signer {
        if (signer.hasKey("rpId")) {
            val rpId = signer.getString("rpId")!!
            val userName = signer.getString("userName")!!
            return PasskeySigner.withSharedSigner(reactContext, rpId, userName)
        } else {
            val privateKey = signer.getString("privateKey")!!
            return EOASigner(Credentials.create(privateKey))
        }
    }

    override fun signUserOperation(
        chainId: Double,
        rpcUrl: String,
        bundlerUrl: String,
        sender: String,
        nonce: String,
        factory: String,
        factoryData: String,
        callData: String,
        preVerificationGas: String,
        callGasLimit: String,
        verificationGasLimit: String,
        maxFeePerGas: String,
        maxPriorityFeePerGas: String,
        paymaster: String,
        paymasterData: String,
        paymasterVerificationGasLimit: String,
        paymasterPostOpGasLimit: String,
        signature: String,
        signer: ReadableMap,
        config: ReadableMap,
        address: String?,
        promise: Promise,
    ) {
        CoroutineScope(Dispatchers.Main).launch {
            val rpcService = HttpService(rpcUrl)
            val bundlerClient = SimpleBundlerClient(HttpService(bundlerUrl))
            val userOperation = UserOperation(
                sender,
                nonce,
                factory,
                factoryData,
                callData,
                preVerificationGas,
                callGasLimit,
                verificationGasLimit,
                maxFeePerGas,
                maxPriorityFeePerGas,
                paymaster,
                paymasterData,
                paymasterVerificationGasLimit,
                paymasterPostOpGasLimit,
                signature,
            )
            try {
                val s = getSigner(signer)
                val safeConfig = getSafeConfig(config)
                val safeAccount = withContext(Dispatchers.IO) {
                    getSafeAccount(address, s, rpcService, bundlerClient, chainId.toInt(), null, safeConfig)
                }
                val result = safeAccount.signUserOperation(userOperation)
                promise.resolve(result.toHex())
            } catch (e: Exception) {
                android.util.Log.e(TAG, "signUserOperation error", e)
                promise.reject(e)
            }
        }
    }

    private fun getSafeAccount(address: String?, signer: Signer, rpcService: HttpService, bundlerClient: SimpleBundlerClient, chainId: Int, paymasterClient: PaymasterClient?, config: SafeConfig): SafeAccount {
        return if (address != null) {
            SafeAccount.fromAddress(address, signer, bundlerClient, chainId, rpcService, paymasterClient= paymasterClient, config = config)
        } else {
            SafeAccount.createNewAccount(signer, bundlerClient, chainId, rpcService, paymasterClient= paymasterClient, config = config)
        }
    }

    override fun predictAddress(rpcUrl: String, signer: ReadableMap, promise: Promise) {
        CoroutineScope(Dispatchers.Main).launch {
            val rpcService = HttpService(rpcUrl)
            try {
                val s = getSigner(signer)
                val address = withContext(Dispatchers.IO) {
                    SafeAccount.predictAddress(s, rpcService)
                }
                promise.resolve(address)
            } catch (e: Exception) {
                android.util.Log.e(TAG, "predictAddress error", e)
                promise.reject(e)
            }
        }
    }

    override fun getOwners(
        chainId: Double,
        rpcUrl: String,
        bundlerUrl: String,
        signer: ReadableMap,
        config: ReadableMap,
        address: String?,
        promise: Promise
    ) {
        CoroutineScope(Dispatchers.Main).launch {
            try {
                val s = getSigner(signer)
                val owners = withContext(Dispatchers.IO) {
                    val safeAccount = getSafeAccount(address, s, HttpService(rpcUrl), SimpleBundlerClient(HttpService(bundlerUrl)), chainId.toInt(), null, getSafeConfig(config))
                    safeAccount.getOwners() ?: emptyList()
                }
                promise.resolve(owners.map { it.toString() }.toReadableArray())
            } catch (e: Exception) {
                android.util.Log.e(TAG, "getOwners error", e)
                promise.reject(e)
            }
       }
    }

    override fun isDeployed(
        chainId: Double,
        rpcUrl: String,
        bundlerUrl: String,
        signer: ReadableMap,
        config: ReadableMap,
        address: String?,
        promise: Promise
    ) {
        CoroutineScope(Dispatchers.Main).launch {
            try {
                val s = getSigner(signer)
                val isDeployed = withContext(Dispatchers.IO) {
                    val safeAccount = getSafeAccount(address, s, HttpService(rpcUrl), SimpleBundlerClient(HttpService(bundlerUrl)), chainId.toInt(), null, getSafeConfig(config))
                    safeAccount.isDeployed()
                }
                promise.resolve(isDeployed)
            } catch (e: Exception) {
                android.util.Log.e(TAG, "isDeployed error", e)
                promise.reject(e)
            }
       }
    }

    override fun addOwner(
        chainId: Double,
        rpcUrl: String,
        bundlerUrl: String,
        owner: String,
        signer: ReadableMap,
        config: ReadableMap,
        paymasterUrl: String?,
        address: String?,
        promise: Promise
    ) {
        CoroutineScope(Dispatchers.Main).launch {
            try {
                val s = getSigner(signer)
                val paymasterClient = if (paymasterUrl != null) PaymasterClient(paymasterUrl) else null
                val hash = withContext(Dispatchers.IO) {
                    val safeAccount = getSafeAccount(address, s, HttpService(rpcUrl), SimpleBundlerClient(HttpService(bundlerUrl)), chainId.toInt(), paymasterClient, getSafeConfig(config))
                    safeAccount.addOwner(owner.hexToAddress())
                }
                promise.resolve(hash)
            } catch (e: Exception) {
                android.util.Log.e(TAG, "addOwner error", e)
                promise.reject(e)
            }
       }
    }

    override fun prepareUserOperation(
       chainId: Double,
       rpcUrl: String,
       bundlerUrl: String,
       to_address: String,
       value: String,
       data: String,
       delegateCall: Boolean,
       signer: ReadableMap,
       config: ReadableMap,
       paymasterUrl: String?,
       address: String?,
       promise: Promise
    ) {
        CoroutineScope(Dispatchers.Main).launch {
            val rpcService = HttpService(rpcUrl)
            val bundlerClient = SimpleBundlerClient(HttpService(bundlerUrl))
            val paymasterClient = if (paymasterUrl != null) PaymasterClient(paymasterUrl) else null
            try {
              val s = getSigner(signer)
              withContext(Dispatchers.IO) {
                  val safeConfig = getSafeConfig(config)
                  val safeAccount = getSafeAccount(address, s, rpcService, bundlerClient, chainId.toInt(), paymasterClient, safeConfig)
                  val userOp = safeAccount.prepareUserOperation(to_address.hexToAddress(), value = value.hexToBigInt(), data = data.toByteArray(), delegateCall = delegateCall)
                  val map: WritableMap = Arguments.createMap()
                  map.putString("sender", userOp.sender)
                  map.putString("nonce", userOp.nonce)
                  map.putString("factory", userOp.factory)
                  map.putString("factoryData", userOp.factoryData)
                  map.putString("callData", userOp.callData)
                  map.putString("callGasLimit", userOp.callGasLimit)
                  map.putString("verificationGasLimit", userOp.verificationGasLimit)
                  map.putString("preVerificationGas", userOp.preVerificationGas)
                  map.putString("maxFeePerGas", userOp.maxFeePerGas)
                  map.putString("maxPriorityFeePerGas", userOp.maxPriorityFeePerGas)
                  map.putString("paymaster", userOp.paymaster)
                  map.putString("paymasterData", userOp.paymasterData)
                  map.putString("paymasterVerificationGasLimit", userOp.paymasterVerificationGasLimit)
                  map.putString("paymasterPostOpGasLimit", userOp.paymasterPostOpGasLimit)
                  map.putString("signature", userOp.signature)
                  promise.resolve(map)
              }
            } catch (e: Exception) {
              android.util.Log.e(TAG, "prepareUserOperation error", e)
              promise.reject(e)
            }
       }
    }

    override fun createPasskeySigner(
       rpId: String,
       userName: String,
       promise: Promise
    ) {
       CoroutineScope(Dispatchers.Main).launch {
           try {
               val passkeySigner = PasskeySigner.withSharedSigner(reactContext, rpId, userName)
               val map: WritableMap = Arguments.createMap()
               map.putString("x", passkeySigner.passkey.x.toHex())
               map.putString("y", passkeySigner.passkey.y.toHex())
               promise.resolve(map)
           } catch (e: Exception) {
                android.util.Log.e(TAG, "createPasskeySigner error", e)
                promise.reject(e)
           }
       }
    }

    override fun ethGetUserOperationReceipt(
       bundlerUrl: String,
       userOpHash: String,
       promise: Promise
    ) {
         CoroutineScope(Dispatchers.Main).launch {
              try {
                val resp = withContext(Dispatchers.IO) {
                     SimpleBundlerClient(HttpService(bundlerUrl)).ethGetUserOperationReceipt(userOpHash).send()
                }
                val receipt = resp.result
                if (receipt == null) {
                    promise.resolve(null)
                } else {
                    promise.resolve(receipt.mapToWritableMap())
                }
              } catch (e: Exception) {
                 android.util.Log.e(TAG, "ethGetUserOperationReceipt error", e)
                 promise.reject(e)
              }
         }
    }


    override fun ethGetUserOperationByHash(
        bundlerUrl: String,
        userOpHash: String,
        promise: Promise
    ) {

    }

    private fun UserOperationReceipt.mapToWritableMap(): WritableMap {
        val map: WritableMap = Arguments.createMap()
        map.putString("userOpHash", userOpHash)
        map.putString("sender", sender)
        map.putString("nonce", nonce)
        map.putString("actualGasUsed", actualGasUsed)
        map.putString("actualGasCost", actualGasCost)
        map.putString("success", success)
        map.putString("paymaster", paymaster)
        map.putString("paymaster", paymaster)
        map.putMap("receipt", receipt.mapToWritableMap())
        map.putArray("logs", logs.map { it.mapToWritableMap() }.toReadableArray())
        return map
    }

    private fun TransactionReceipt.mapToWritableMap(): WritableMap {
        val map: WritableMap = Arguments.createMap()
        map.putString("transactionHash", transactionHash)
        map.putString("transactionIndex", getTransactionIndexRaw())
        map.putString("blockHash", blockHash)
        map.putString("blockNumber", getBlockNumberRaw())
        map.putString("cumulativeGasUsed", getCumulativeGasUsedRaw())
        map.putString("gasUsed", getGasUsedRaw())
        map.putString("contractAddress", contractAddress)
        map.putString("root", root)
        map.putString("status", status)
        map.putString("from", from)
        map.putString("to", to)
        map.putArray("logs", logs.map { it.mapToWritableMap() }.toReadableArray())
        map.putString("logsBloom", logsBloom)
        map.putString("revertReason", revertReason)
        map.putString("type", type)
        map.putString("effectiveGasPrice", effectiveGasPrice)
        return map
    }

    private fun Log.mapToWritableMap(): WritableMap {
        val map: WritableMap = Arguments.createMap()
        map.putString("logIndex", getLogIndexRaw())
        map.putString("transactionIndex", getTransactionIndexRaw())
        map.putString("transactionHash", transactionHash)
        map.putString("blockHash", blockHash)
        map.putString("blockNumber", getBlockNumberRaw())
        map.putString("address", address)
        map.putString("data", data)
        map.putArray("topics", topics.toReadableArray())
        return map
    }


    companion object {
        const val NAME = "RTN4337"
    }
}

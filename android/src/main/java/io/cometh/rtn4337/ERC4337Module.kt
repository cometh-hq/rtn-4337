package io.cometh.rtn4337

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReadableMap;

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

import org.web3j.protocol.http.HttpService
import org.web3j.crypto.Credentials

import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

import android.util.Log


class ERC4337Module(val reactContext: ReactApplicationContext) : NativeRTN4337Spec(reactContext) {

    override fun getName() = NAME

    private val TAG = "ERC4337Module"

    override fun sendUserOperation(
        chainId: Double,
        rpcUrl: String,
        bundlerUrl: String,
        paymasterUrl: String?,
        to_address: String,
        value: String,
        data: String,
        delegateCall: Boolean,
        signer: ReadableMap,
        config: ReadableMap,
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
                  val safeAccount = SafeAccount.createNewAccount(s, bundlerClient, chainId.toInt(), rpcService, paymasterClient = paymasterClient, config = safeConfig)
                  val hash = safeAccount.sendUserOperation(to_address.hexToAddress(), value = value.hexToBigInt(), data = data.toByteArray(), delegateCall = delegateCall)
                  promise.resolve(hash)
              }
            } catch (e: Exception) {
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
            //val shared = signer.getBoolean("shared") ?: true
            //if (shared) {
            return PasskeySigner.withSharedSigner(reactContext, rpId, userName)
            //} else {
            //throw Exception("Not implemented")
            //}
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
                    SafeAccount.createNewAccount(s, bundlerClient, chainId.toInt(), rpcService, config = safeConfig)
                }
                Log.i(TAG, "signUserOperation: $userOperation")
                val result = safeAccount.signUserOperation(userOperation)
                Log.i(TAG, "signUserOperation result=$result")
                promise.resolve(result.toHex())
            } catch (e: Exception) {
                Log.e(TAG, "signUserOperation error", e)
                promise.reject(e)
            }
        }
    }

    override fun predictAddress(rpcUrl: String, signer: ReadableMap, promise: Promise) {
        CoroutineScope(Dispatchers.Main).launch {
            val rpcService = HttpService(rpcUrl)
            try {
                val signer = getSigner(signer)
                val address = withContext(Dispatchers.IO) {
                    SafeAccount.predictAddress(signer, rpcService)
                }
                promise.resolve(address)
            } catch (e: Exception) {
                Log.e(TAG, "predictAddress error", e)
                promise.reject(e)
            }
        }
    }

    override fun getOwners(
        chainId: Double,
        rpcUrl: String,
        bundlerUrl: String,
        signer: ReadableMap,
        promise: Promise
    ) {
        CoroutineScope(Dispatchers.Main).launch {
            val rpcService = HttpService(rpcUrl)
            val bundlerClient = SimpleBundlerClient(HttpService(bundlerUrl))
            try {
                val s = getSigner(signer)
                val owners = withContext(Dispatchers.IO) {
                    val safeAccount = SafeAccount.createNewAccount(s, bundlerClient, chainId.toInt(), rpcService)
                    safeAccount.getOwners() ?: emptyList()
                }
                promise.resolve(owners.map { it.toString() }.toReadableArray())
            } catch (e: Exception) {
                Log.e(TAG, "getOwners error", e)
                promise.reject(e)
            }
       }
    }

    companion object {
        const val NAME = "RTN4337"
    }
}

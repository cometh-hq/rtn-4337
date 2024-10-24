package io.cometh.rtn4337.types

import expo.modules.kotlin.records.Field
import expo.modules.kotlin.records.Record
import io.cometh.android4337.UserOperation

class UserOperationRecord : Record {
    @Field
    val sender: String? = null

    @Field
    val nonce: String? = null

    @Field
    val factory: String? = null

    @Field
    val factoryData: String? = null

    @Field
    val callData: String? = null

    @Field
    val preVerificationGas: String? = null

    @Field
    val callGasLimit: String? = null

    @Field
    val verificationGasLimit: String? = null

    @Field
    val maxFeePerGas: String? = null

    @Field
    val maxPriorityFeePerGas: String? = null

    @Field
    val paymaster: String? = null

    @Field
    val paymasterData: String? = null

    @Field
    val paymasterVerificationGasLimit: String? = null

    @Field
    val paymasterPostOpGasLimit: String? = null

    @Field
    val signature: String? = null
}

fun UserOperationRecord.toUserOp(): UserOperation {
    return UserOperation(
        sender = sender!!,
        nonce = nonce!!,
        factory = factory,
        factoryData = factoryData,
        callData = callData!!,
        preVerificationGas = preVerificationGas!!,
        callGasLimit = callGasLimit!!,
        verificationGasLimit = verificationGasLimit!!,
        maxFeePerGas = maxFeePerGas!!,
        maxPriorityFeePerGas = maxPriorityFeePerGas!!,
        paymaster = paymaster,
        paymasterData = paymasterData,
        paymasterVerificationGasLimit = paymasterVerificationGasLimit,
        paymasterPostOpGasLimit = paymasterPostOpGasLimit,
        signature = signature
    )
}
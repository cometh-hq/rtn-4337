package io.cometh.rtn4337.types

import expo.modules.kotlin.records.Field
import expo.modules.kotlin.records.Record

class CommonParams : Record {
    @Field
    val chainId: Int? = null

    @Field
    val rpcUrl: String? = null

    @Field
    val bundlerUrl: String? = null

    @Field
    val config: Map<String, String>? = null

    @Field
    val address: String? = null

    @Field
    val paymasterUrl: String? = null

    @Field
    val signer: Map<String, String>? = null

}

fun CommonParams.verifyMandatoryUrls() {
    requireNotNull(rpcUrl) { "rpcUrl is required" }
    requireNotNull(bundlerUrl) { "bundlerUrl is required" }
    requireNotNull(config) { "config is required" }
}


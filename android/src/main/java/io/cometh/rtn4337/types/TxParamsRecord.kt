package io.cometh.rtn4337.types

import expo.modules.kotlin.records.Field
import expo.modules.kotlin.records.Record

class TxParamsRecord : Record {
    @Field
    val to: String? = null

    @Field
    val value: String? = null

    @Field
    val data: String? = null

    @Field
    val delegateCall: Boolean = false

}


fun TxParamsRecord.verifyParams() {
    requireNotNull(to) { "to is required" }
}
package io.cometh.rtn4337.types

import expo.modules.kotlin.records.Field
import expo.modules.kotlin.records.Record

class ConnectParams : Record {

    @Field
    val chainId: Int? = null

    @Field
    val apiKey: String? = null

    @Field
    val baseUrl: String? = null
}
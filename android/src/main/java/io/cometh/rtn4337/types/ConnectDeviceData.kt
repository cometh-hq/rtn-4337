package io.cometh.rtn4337.types

import expo.modules.kotlin.records.Field
import expo.modules.kotlin.records.Record

class ConnectDeviceData : Record {
    @Field
    val browser: String? = null

    @Field
    val os: String? = null

    @Field
    val platform: String? = null
}
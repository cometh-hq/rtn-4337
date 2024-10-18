package io.cometh.rtn4337

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.WritableArray
import com.facebook.react.bridge.WritableMap;

fun List<Any>.toReadableArray(): ReadableArray {
    val writableArray: WritableArray = Arguments.createArray()
    
    for (item in this) {
        when (item) {
            is String -> writableArray.pushString(item)
            is Int -> writableArray.pushInt(item)
            is Boolean -> writableArray.pushBoolean(item)
            is Double -> writableArray.pushDouble(item)
            is WritableMap -> writableArray.pushMap(item)
            else -> throw IllegalArgumentException("Unsupported data type: ${item::class.java}")
        }
    }
    return writableArray
}

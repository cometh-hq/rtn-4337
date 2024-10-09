package io.cometh.rtn4337;

import com.facebook.react.TurboReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.model.ReactModuleInfoProvider
import com.facebook.react.module.model.ReactModuleInfo

class ERC4337Package : TurboReactPackage() {
    override fun getModule(name: String, reactContext: ReactApplicationContext): NativeModule {
       //if (name == ERC4337Module.NAME) {
        return ERC4337Module(reactContext)
       //} else {
         //null
       //}
    }

     override fun getReactModuleInfoProvider() = ReactModuleInfoProvider {
       mapOf(
         ERC4337Module.NAME to ReactModuleInfo(
           ERC4337Module.NAME,
           ERC4337Module.NAME,
           false, // canOverrideExistingModule
           false, // needsEagerInit
           true, // hasConstants
           false, // isCxxModule
           true // isTurboModule
         )
       )
     }
}

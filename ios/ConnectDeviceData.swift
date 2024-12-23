import ExpoModulesCore

struct ConnectDeviceData: Record {
    @Field
    var browser: String?
    
    @Field
    var os: String?
    
    @Field
    var platform: String?
}

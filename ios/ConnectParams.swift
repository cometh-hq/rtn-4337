import ExpoModulesCore

struct ConnectParams: Record {
    @Field
    var apiKey: String?
    
    @Field
    var chainId: Int?
    
    @Field
    var baseUrl: String?
}

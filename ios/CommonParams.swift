import ExpoModulesCore

struct CommonParams: Record {
    @Field
    var chainId: Int?
    
    @Field
    var rpcUrl: String?
    
    @Field
    var bundlerUrl: String?
    
    @Field
    var config: [String: String]?
    
    @Field
    var address: String?
    
    @Field
    var paymasterUrl: String?
    
    @Field
    var signer: [String: Any]?

}

extension CommonParams {
    func verify() throws {
        if rpcUrl == nil {
            throw Rtn4337Exception("rpcUrl is required")
        }
        if bundlerUrl == nil {
            throw Rtn4337Exception("bundlerUrl is required")
        }
        if config == nil {
            throw Rtn4337Exception("config is required")
        }
    }
}

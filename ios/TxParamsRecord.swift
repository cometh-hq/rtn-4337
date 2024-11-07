import ExpoModulesCore

struct TxParamsRecord: Record {
    @Field
    var to: String?
    @Field
    var value: String?
    @Field
    var data: String?
    @Field
    var delegateCall: Bool = false
}

extension TxParamsRecord {
    func verify() throws {
        if to == nil {
            throw Rtn4337Exception("rpcUrl is required")
        }
    }
}

import ExpoModulesCore

struct UserOperationRecord: Record {
    @Field
    var sender: String?
    
    @Field
    var nonce: String?
    
    @Field
    var factory: String?
    
    @Field
    var factoryData: String?
    
    @Field
    var callData: String?
    
    @Field
    var preVerificationGas: String?
    
    @Field
    var callGasLimit: String?
    
    @Field
    var verificationGasLimit: String?
    
    @Field
    var maxFeePerGas: String?
    
    @Field
    var maxPriorityFeePerGas: String?
    
    @Field
    var paymaster: String?
    
    @Field
    var paymasterData: String?
    
    @Field
    var paymasterVerificationGasLimit: String?
    
    @Field
    var paymasterPostOpGasLimit: String?
    
    @Field
    var signature: String?
}


 // Start of Selection
import React, { useState } from "react";
import {
  Button,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  PasskeySigner,
  Bundler,
  SafeAccount,
  SafeUtils,
  EOASigner,
  ConnectApi,
  UserOperationReceiptPoller,
} from "rtn-4337";

export default function App() {
  const [address, setAddress] = useState("");
  const [owners, setOwners] = useState("");
  const [userOpHash, setUserOpHash] = useState("");
  const [isDeployed, setIsDeployed] = useState("");
  const [addOwner, setAddOwner] = useState("");
  const [safeAccount, setSafeAccount] = useState<SafeAccount | null>(null);
  const [passkeySigner, setPasskeySigner] = useState<PasskeySigner | null>(null);
  const [eoaSigner, setEoaSigner] = useState<EOASigner | null>(null);
  const [userName, setUserName] = useState("userName");
  const [recoveryResult, setRecoveryResult] = useState("");
  const [guardianAddress, setGuardianAddress] = useState("");
  const [recoveryStarted, setRecoveryStarted] = useState("");
  const [recoveryCancelled, setRecoveryCancelled] = useState("");
  const rpId = "passkey.startapp.nc";
  const bundler = new Bundler(
    "https://bundler.cometh.io/84532/?apikey=Y3dZHg2cc2qOT9ukzvxZZ7jEloTqx5rx"
  );

  const reset = () => {
    setAddress("");
    setOwners("");
    setUserOpHash("");
    setIsDeployed("");
    setAddOwner("");
    setSafeAccount(null);
    setPasskeySigner(null);
    setEoaSigner(null);
  };

  const createSafeAccount = async (signer: PasskeySigner | EOASigner) => {
    try {
      const account = new SafeAccount({
        chainId: 84532,
        rpcUrl: "https://base-sepolia.g.alchemy.com/v2/UEwp8FtpdjcL5oekF6CjMzxe1D3768XU",
        bundlerUrl: "https://bundler.cometh.io/84532?apikey=Y3dZHg2cc2qOT9ukzvxZZ7jEloTqx5rx",
        signer,
        paymasterUrl: "https://paymaster.cometh.io/84532?apikey=Y3dZHg2cc2qOT9ukzvxZZ7jEloTqx5rx",
      });
      setSafeAccount(account);
    } catch (error) {
      console.error("Error creating SafeAccount:", error);
    }
  };

  const handleCreatePasskey = async () => {
    reset();
    try {
      const signer = await PasskeySigner.create(rpId, userName);
      console.log("Passkey created:", signer);
      setPasskeySigner(signer);
      await createSafeAccount(signer);
    } catch (error) {
      console.error("Cannot create passkey:", error);
    }
  };

  const handleAddEOASigner = () => {
    reset();
    const signer = new EOASigner("0x4bddaeef5fb283e847abf0bd480a771b7695d70f413b248dc56c0bb1bb4a0b86");
    setEoaSigner(signer);
    createSafeAccount(signer);
  };

  const handleSendUserOperation = async (operations: any[]) => {
    if (!safeAccount) return;
    setUserOpHash("⌛");
    try {
      const result = await safeAccount.sendUserOperation(operations);
      console.log("User Op sent:", result);
      setUserOpHash(`✅ ${result}`);
      const poller = new UserOperationReceiptPoller(bundler);
      const receipt = await poller.waitForReceipt(result);
      console.log("Receipt:", receipt);
    } catch (error) {
      setUserOpHash(`❌ error: ${error}`);
      console.error("Error sending User Op:", error);
    }
  };

  const handleConnectAPI = async () => {
    const apiKey = "bnptvYrGQAqDTJOGpAUiMFAaw3QKjjeN";
    const walletAddress = "0x2AE4d78a1Ec1c9dd5B36fBb7d970Ac304049b9fA";
    const api = new ConnectApi(apiKey, "https://api.4337.cometh.io", 84532);

    try {
      const signers = await api.getPasskeySignersByWalletAddress({ walletAddress });
      console.log("Passkey Signers:", signers);
    } catch (error) {
      console.error("Error fetching passkey signers:", error);
    }

    try {
      const isValid = await api.isValidSignature({
        walletAddress,
        message: "0xaaaa",
        signature: "0x123456",
      });
      console.log("Is Valid Signature:", isValid);
    } catch (error) {
      console.error("Error validating signature:", error);
    }

    try {
      const newSigner = await api.createWebAuthnSigner({
        walletAddress,
        publicKeyId: "0x123456",
        publicKeyX: "0x123456",
        publicKeyY: "0x123456",
        deviceData: {
          browser: "Chrome",
          os: "Android",
          platform: "Mobile",
        },
        signerAddress: walletAddress,
      });
      console.log("WebAuthn Signer Created:", newSigner);
    } catch (error) {
      console.error("Error creating WebAuthn signer:", error);
    }

    try {
      const initResult = await api.initWallet({
        walletAddress,
        initiatorAddress: "0x2f920a66c2f9760f6fe5f49b289322ddf60f9103",
      });
      console.log("Wallet Initialized:", initResult);
    } catch (error) {
      console.error("Error initializing wallet:", error);
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView>
        <ScrollView>
          <View style={styles.section}>
            <Button title="Get UserOp Receipt" onPress={async () => {
              try {
                const receipt = await bundler.ethGetUserOperationReceipt("0x5f2c9267b1d7472fd2e6decefda916024bc8aafb38f0cca40ca7e21c7509e22b");
                console.log("Receipt:", receipt);
              } catch (error) {
                console.error("Cannot get UserOp receipt:", error);
              }
            }} />
            <Button title="Get UserOp By Hash" onPress={async () => {
              try {
                const receipt = await bundler.ethGetUserOperationByHash("0x5f2c9267b1d7472fd2e6decefda916024bc8aafb38f0cca40ca7e21c7509e22b");
                console.log("Receipt:", receipt);
              } catch (error) {
                console.error("Cannot get UserOp by hash:", error);
              }
            }} />
            <TextInput
              style={styles.input}
              value={userName}
              onChangeText={setUserName}
              placeholder="Type here"
              autoCapitalize="none"
            />
            <Button title="Create/Get Passkey" onPress={handleCreatePasskey} />
            {passkeySigner && <Text style={styles.status}>✅ Passkey OK!</Text>}
            <Button title="Add EOA Signer" onPress={handleAddEOASigner} />
            {eoaSigner && <Text style={styles.status}>✅ EOA Signer OK!</Text>}
          </View>

          {safeAccount && (passkeySigner || eoaSigner) && (
            <>
              <View style={styles.section}>
                <Button title="Predict Address" onPress={async () => {
                  setAddress("⌛");
                  try {
                    const signer = passkeySigner || eoaSigner!;
                    const predictedAddress = await SafeUtils.predictAddress(
                      84532,
                      "https://base-sepolia.g.alchemy.com/v2/UEwp8FtpdjcL5oekF6CjMzxe1D3768XU",
                      signer
                    );
                    setAddress(`✅ ${predictedAddress}`);
                  } catch (error) {
                    setAddress(`❌ error: ${error}`);
                  }
                }} />
                <Text style={styles.description}>Address: {address}</Text>
              </View>

              <View style={styles.section}>
                <Button title="Send Transaction" onPress={() => handleSendUserOperation([
                  {
                    to: "0x2f920a66C2f9760f6fE5F49b289322Ddf60f9103",
                    value: "0x0",
                    data: "0xaaaa",
                    delegateCall: false,
                  },
                ])} />
                <Button title="Send Multiple Transactions" onPress={() => handleSendUserOperation([
                  { to: "0x4FbF9EE4B2AF774D4617eAb027ac2901a41a7b5F", value: "0x0", data: "0x06661abd" },
                  { to: "0x2f920a66C2f9760f6fE5F49b289322Ddf60f9103" },
                  { to: "0x2f920a66C2f9760f6fE5F49b289322Ddf60f9103", data: "0xaaaa" },
                ])} />
                <Text style={styles.description}>UserOp Hash: {userOpHash}</Text>
              </View>

              <View style={styles.section}>
                <Button title="Get Owners" onPress={async () => {
                  setOwners("⌛");
                  try {
                    const ownerList = await safeAccount.getOwners();
                    setOwners(`✅ ${ownerList.join(", ")}`);
                  } catch (error) {
                    setOwners(`❌ error: ${error}`);
                  }
                }} />
                <Text style={styles.description}>Owners: {owners}</Text>
              </View>

              <View style={styles.section}>
                <Button title="Check Deployment" onPress={async () => {
                  setIsDeployed("⌛");
                  try {
                    const deployed = await safeAccount.isDeployed();
                    setIsDeployed(deployed ? "true" : "false");
                  } catch (error) {
                    setIsDeployed(`❌ error: ${error}`);
                  }
                }} />
                <Text style={styles.description}>Is Deployed: {isDeployed}</Text>
              </View>

              <View style={styles.section}>
                <Button title="Add Owner" onPress={async () => {
                  setAddOwner("⌛");
                  try {
                    const result = await safeAccount.addOwner("0x999999cf1046e68e36E1aA2E0E07105eDDD1f08E");
                    setAddOwner(`✅ ${result}`);
                  } catch (error) {
                    setAddOwner(`❌ error: ${error}`);
                  }
                }} />
                <Text style={styles.description}>Add Owner: {addOwner}</Text>
              </View>
            </>
          )}

          <View style={styles.section}>
            <Button title="Sign User Operation" onPress={async () => {
              if (!safeAccount) return;
              const userOp = {
                sender: "0x2f920a66C2f9760f6fE5F49b289322Ddf60f9103",
                nonce: "0x0",
                factory: "0x2f920a66C2f9760f6fE5F49b289322Ddf60f9103",
                factoryData: "0xaaaa",
                callData: "0xaaaa",
                preVerificationGas: "0xaaaa",
                callGasLimit: "0xaaaa",
                verificationGasLimit: "0xaaaa",
                maxFeePerGas: "0xaaaa",
                maxPriorityFeePerGas: "0xaaaa",
                paymaster: "0x2f920a66C2f9760f6fE5F49b289322Ddf60f9103",
                paymasterData: "0xaaaa",
                paymasterVerificationGasLimit: "0xaaaa",
                paymasterPostOpGasLimit: "0xaaaa",
                signature: "0xaaaa",
              };
              try {
                const result = await safeAccount.signUserOperation(userOp);
                console.log("Signed UserOp:", result);
              } catch (error) {
                console.error("Error signing UserOp:", error);
              }
            }} />

            <Button title="Sign Message & Validate" onPress={async () => {
              if (!safeAccount) return;
              const message = "0xaaaa";
              try {
                const signature = await safeAccount.signMessage(message);
                console.log("Signature:", signature);
                const isValid = await safeAccount.isValidSignature(message, signature);
                console.log(`Is Valid Signature: ${isValid}`);
              } catch (error) {
                console.error("Error signing or validating message:", error);
              }
            }} />

            <Button title="Connect API" onPress={handleConnectAPI} />
            <View style={styles.section}>
              <Button title="enableRecovery" onPress={async () => {
                if (!safeAccount) return;
                try {
                  const result = await safeAccount.enableRecovery(
                    "0x999999cf1046e68e36E1aA2E0E07105eDDD1f08E",
                  );
                  setRecoveryResult(result || "");
                } catch (error) {
                  console.error("Error enabling Recovery Module:", error);
                } 
              }} />
              <Text style={styles.description}>Hash: {recoveryResult}</Text>
            </View>
            <View style={styles.section}>
              <Button title="getGuardianAddress" onPress={async () => {
                if (!safeAccount) return;
                try {
                  const delayModuleAddress = await safeAccount.predictDelayModuleAddress();
                  const result = await safeAccount.getCurrentGuardian(delayModuleAddress);
                  console.log("Guardian Address:", result); 
                  setGuardianAddress(result || "");
                } catch (error) {
                  console.error("Error getting Guardian Address:", error);
                }
              }} /> 
              <Text style={styles.description}>Guardian Address: {guardianAddress}</Text>
            </View>
            <View style={styles.section}> 
              <Button title="isRecoveryStarted" onPress={async () => {
                if (!safeAccount) return;
                try {
                  const delayModuleAddress = await safeAccount.predictDelayModuleAddress();
                  const result = await safeAccount.isRecoveryStarted(delayModuleAddress);
                  console.log("Recovery Started:", result);
                  setRecoveryStarted(result ? "true" : "false");
                } catch (error) {
                  console.error("Error checking Recovery Started:", error);
                }
              }} />
              <Text style={styles.description}>Recovery Started: {recoveryStarted}</Text>
            </View>
            <View style={styles.section}> 
              <Button title="cancelRecovery" onPress={async () => {
                if (!safeAccount) return;
                try {
                  const delayModuleAddress = await safeAccount.predictDelayModuleAddress();
                  const result = await safeAccount.cancelRecovery(delayModuleAddress);
                  console.log("Recovery Cancelled:", result);
                  setRecoveryCancelled(result || "");
                } catch (error) {
                  console.error("Error cancelling Recovery:", error);
                }
              }} />
              <Text style={styles.description}>Recovery Cancelled: {recoveryCancelled}</Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    padding: 10,
  },
  section: {
    marginTop: 20,
  },
  description: {
    marginTop: 8,
    fontSize: 16,
    color: "#fff",
  },
  status: {
    marginTop: 8,
    fontSize: 16,
    color: "green",
  },
  input: {
    height: 40,
    borderColor: "white",
    color: "white",
    borderWidth: 1,
    paddingHorizontal: 8,
    marginBottom: 16,
    borderRadius: 4,
  },
});

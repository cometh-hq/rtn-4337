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
} from "rtn-4337";

export default function App() {
  const [address, setAddress] = useState("");
  const [owners, setOwners] = useState("");
  const [userOpHash, setUserOpHash] = useState("");
  const [isDeployed, setIsDeployed] = useState("");
  const [addOwner, setAddOwner] = useState("");
  const [safeAccount, setSafeAccount] = useState<SafeAccount | null>(null);
  const [passkeySigner, setPasskeySigner] = useState<PasskeySigner | null>(
    null,
  );
  const [eoaSigner, setEoaSigner] = useState<EOASigner | null>(null);
  const [userName, setUserName] = useState("userName");

  const rpId = "passkey.startapp.nc";
  const bundler = new Bundler(
    "https://bundler.cometh.io/84532/?apikey=Y3dZHg2cc2qOT9ukzvxZZ7jEloTqx5rx",
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

  return (
    <View style={styles.container}>
      <SafeAreaView>
        <ScrollView>
          <View style={{ marginTop: 20 }}>
            <Button
              title="Get UserOp Receipt"
              onPress={() => {
                bundler
                  .ethGetUserOperationReceipt(
                    "0x5f2c9267b1d7472fd2e6decefda916024bc8aafb38f0cca40ca7e21c7509e22b",
                  )
                  .then((receipt) => {
                    console.log("receipt", JSON.stringify(receipt));
                  })
                  .catch((error) => {
                    console.error("cannot get userop receipt", error);
                  });
              }}
            />
            <Button
              title="Get UserOp By Hash"
              onPress={() => {
                bundler
                  .ethGetUserOperationByHash(
                    "0x5f2c9267b1d7472fd2e6decefda916024bc8aafb38f0cca40ca7e21c7509e22b",
                  )
                  .then((receipt) => {
                    console.log("receipt", JSON.stringify(receipt));
                  })
                  .catch((error) => {
                    console.error("cannot get user op by hash", error);
                  });
              }}
            />
            <TextInput
              style={styles.input}
              value={userName}
              onChangeText={(text) => setUserName(text)}
              placeholder="Type here"
              autoCapitalize="none"
            />
            <Button
              title="Create/Get passkey"
              onPress={() => {
                reset();
                // const x =
                //   // "0x009b0ebda4628ab37791a7a6fb10de9bfc04badff8f4174d6429cff9add3e05c15";
                //   "0x03944b1f2a13bb91dc17fc7760053be27452338beed4afec483f7b4f247f3543";
                // const y =
                //   // "0x5d76026eeec014c76b03564dce040f55f30d726d0b6b2b4da5a6b41d5a3309c4";
                //   "0xfe918fa660ededcadd0a64f6493644d0e1577ebe9290259d4b09a41418bf17cc";
                // const signer = PasskeySigner.fromExisting(rpId, userName, {
                //   x,
                //   y,
                // });
                // console.log("passkey created", JSON.stringify(signer));
                // const account = new SafeAccount({
                //   chainId: 84532, // needed for android
                //   rpcUrl:
                //     "https://base-sepolia.g.alchemy.com/v2/UEwp8FtpdjcL5oekF6CjMzxe1D3768XU",
                //   bundlerUrl:
                //     "https://bundler.cometh.io/84532?apikey=Y3dZHg2cc2qOT9ukzvxZZ7jEloTqx5rx",
                //   signer,
                //   paymasterUrl:
                //     "https://paymaster.cometh.io/84532?apikey=Y3dZHg2cc2qOT9ukzvxZZ7jEloTqx5rx",
                // });
                // setPasskeySigner(signer);
                // setSafeAccount(account);
                PasskeySigner.create(rpId, userName)
                  .then((signer) => {
                    console.log("passkey created", JSON.stringify(signer));
                    const account = new SafeAccount({
                      chainId: 84532, // needed for android
                      rpcUrl:
                        "https://base-sepolia.g.alchemy.com/v2/UEwp8FtpdjcL5oekF6CjMzxe1D3768XU",
                      bundlerUrl:
                        "https://bundler.cometh.io/84532?apikey=Y3dZHg2cc2qOT9ukzvxZZ7jEloTqx5rx",
                      signer,
                      paymasterUrl:
                        "https://paymaster.cometh.io/84532?apikey=Y3dZHg2cc2qOT9ukzvxZZ7jEloTqx5rx",
                    });
                    setPasskeySigner(signer);
                    setSafeAccount(account);
                  })
                  .catch((error) => {
                    console.error("cannot create passkey", error);
                  });
              }}
            />
            {passkeySigner && (
              <Text style={styles.sectionDescription}>✅ Passkey OK !</Text>
            )}
            <Button
              title="EOA Signer"
              onPress={() => {
                reset();
                const signer = new EOASigner(
                  "0x4bddaeef5fb283e847abf0bd480a771b7695d70f413b248dc56c0bb1bb4a0b86",
                );
                const account = new SafeAccount({
                  chainId: 84532, // needed for android
                  rpcUrl:
                    "https://base-sepolia.g.alchemy.com/v2/UEwp8FtpdjcL5oekF6CjMzxe1D3768XU",
                  bundlerUrl:
                    "https://bundler.cometh.io/84532?apikey=Y3dZHg2cc2qOT9ukzvxZZ7jEloTqx5rx",
                  signer,
                  paymasterUrl:
                    "https://paymaster.cometh.io/84532?apikey=Y3dZHg2cc2qOT9ukzvxZZ7jEloTqx5rx",
                });
                setEoaSigner(signer);
                setSafeAccount(account);
              }}
            />
            {eoaSigner && (
              <Text style={styles.sectionDescription}>✅ EOA Signer OK !</Text>
            )}
          </View>
          {safeAccount && (passkeySigner || eoaSigner) && (
            <>
              <View style={{ marginTop: 20 }}>
                <Button
                  title="Predict address"
                  onPress={() => {
                    setAddress("⌛");
                    SafeUtils.predictAddress(
                      84532,
                      "https://base-sepolia.g.alchemy.com/v2/UEwp8FtpdjcL5oekF6CjMzxe1D3768XU",
                      passkeySigner ? passkeySigner : eoaSigner!,
                    )
                      .then((result: string) => {
                        setAddress("✅ " + result);
                      })
                      .catch((error: string) => {
                        setAddress("❌ error: " + error);
                      });
                  }}
                />
              </View>
              <Text style={styles.sectionDescription}>Address = {address}</Text>
              <View style={styles.button}>
                <Button
                  title="Send Transaction"
                  onPress={() => {
                    console.log("Sending User Op");
                    setUserOpHash("⌛");
                    safeAccount
                      .sendUserOperation([
                        {
                          to: "0x2f920a66C2f9760f6fE5F49b289322Ddf60f9103",
                          value: "0x0",
                          data: "0xaaaa",
                          delegateCall: false,
                        },
                      ])
                      .then((result) => {
                        console.log("User Op sent", result);
                        setUserOpHash("✅ " + result);
                      })
                      .catch((error) => {
                        setUserOpHash("❌ error: " + error);
                        console.error("error=" + JSON.stringify(error));
                        console.error(error);
                      });
                  }}
                />
                {/* <Button
                title="Prepare User Operation"
                onPress={() => {
                  console.log("Preparing User Op");
                  safeAccount
                    .prepareUserOperation(
                      "0x2f920a66C2f9760f6fE5F49b289322Ddf60f9103",
                      "0x0",
                      "0xaaaa",
                      false,
                    )
                    .then((result) => {
                      console.log("User Op Prepared", result);
                    })
                    .catch((error) => {
                      console.error("error=" + JSON.stringify(error));
                    });
                }}
              /> */}
              </View>
              <Button
                title="Send Multi Transaction"
                onPress={() => {
                  console.log("Sending User Op");
                  setUserOpHash("⌛");
                  safeAccount
                    .sendUserOperation([
                      {
                        to: "0x4FbF9EE4B2AF774D4617eAb027ac2901a41a7b5F",
                        value: "0x0",
                        data: "0x06661abd",
                      },
                      {
                        to: "0x2f920a66C2f9760f6fE5F49b289322Ddf60f9103",
                      },
                      {
                        to: "0x2f920a66C2f9760f6fE5F49b289322Ddf60f9103",
                        data: "0xaaaa",
                      },
                    ])
                    .then((result) => {
                      console.log("User Op sent", result);
                      setUserOpHash("✅ " + result);
                    })
                    .catch((error) => {
                      setUserOpHash("❌ error: " + error);
                      console.error("error=" + JSON.stringify(error));
                      console.error(error);
                    });
                }}
              />
              <Text style={styles.sectionDescription}>hash = {userOpHash}</Text>
              <View style={styles.button}>
                <Button
                  title="Get owners"
                  onPress={() => {
                    setOwners("⌛");
                    safeAccount
                      .getOwners()
                      .then((result) => {
                        setOwners("✅ " + result.join(", "));
                      })
                      .catch((error) => {
                        setOwners("❌ error: " + error);
                      });
                  }}
                />
              </View>
              <Text style={styles.sectionDescription}>Owners = {owners}</Text>
              <View style={styles.button}>
                <Button
                  title="Is deployed ?"
                  onPress={() => {
                    setIsDeployed("⌛");
                    safeAccount
                      .isDeployed()
                      .then((result) => {
                        setIsDeployed(result ? "true" : "false");
                      })
                      .catch((error) => {
                        setIsDeployed("❌ error: " + error);
                      });
                  }}
                />
              </View>
              <Text style={styles.sectionDescription}>
                isDeployed = {isDeployed}
              </Text>
              <View style={styles.button}>
                <Button
                  title="Add owner"
                  onPress={() => {
                    setAddOwner("⌛");
                    safeAccount
                      .addOwner("0x999999cf1046e68e36E1aA2E0E07105eDDD1f08E")
                      .then((result) => {
                        setAddOwner("✅ " + result);
                      })
                      .catch((error) => {
                        setAddOwner("❌ error: " + error);
                      });
                  }}
                />
              </View>
              <Text style={styles.sectionDescription}>
                addOwner = {addOwner}
              </Text>
            </>
          )}
          <Button
            title="Sign User Op"
            onPress={() => {
              console.log("Sign User Op");
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
              safeAccount!
                .signUserOperation(userOp)
                .then((result) => {
                  console.log(result);
                })
                .catch((error) => {
                  console.error(error);
                });
            }}
          />
          <Button
            title="Sign message & validate"
            onPress={() => {
              const message = "0xaaaa";
              safeAccount!
                .signMessage(message)
                .then((result) => {
                  console.log(result);
                  safeAccount!
                    .isValidSignature(message, result)
                    .then((result) => {
                      console.log(`isValidSignature=${result}`);
                    });
                })
                .catch((error) => {
                  console.error(error);
                });
            }}
          />
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
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "600",
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: "400",
    userSelect: "text",
    color: "#fff",
  },
  button: {
    marginTop: 10,
  },
  highlight: {
    fontWeight: "700",
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

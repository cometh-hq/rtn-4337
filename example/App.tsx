/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import {Bundler, PasskeySigner, SafeAccount, SafeUtils} from 'rtn-4337';
import React from 'react';
import {Button, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TextInput, View} from 'react-native';

import {Colors} from 'react-native/Libraries/NewAppScreen';

function App(): React.JSX.Element {
  const backgroundStyle = {
    padding: 10,
  };

  const [address, setAddress] = React.useState('');
  const [owners, setOwners] = React.useState('');
  const [userOpHash, setUserOpHash] = React.useState('');
  const [isDeployed, setIsDeployed] = React.useState('');
  const [addOwner, setAddOwner] = React.useState('');
  const [safeAccount, setSafeAccount] = React.useState<SafeAccount | null>(null);
  const [signer, setSigner] = React.useState<PasskeySigner | null>(null);
  const [userName, setUserName] = React.useState('passkey_username');

  const rpId = 'sample4337.cometh.io';

  const bundler = new Bundler('https://bundler.cometh.io/84532/?apikey=Y3dZHg2cc2qOT9ukzvxZZ7jEloTqx5rx');

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={'dark-content'}
        backgroundColor={Colors.darker}
      />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={backgroundStyle}>
        <View>
          <View style={{marginTop: 20}}>
            <Button title={'Get Receipt'} onPress={() => {
              bundler
                .ethGetUserOperationReceipt('0xa5a6f2aff433b95ecc8ff8985370ee3f868664612af8260aae5c7b1c07f655fc')
                .then((receipt) => {
                  console.log('userOpHash', receipt.userOpHash);
                  console.log('sender', receipt.sender);
                  console.log('nonce', receipt.nonce);
                  console.log('actualGasUsed', receipt.actualGasUsed);
                  console.log('actualGasCost', receipt.actualGasCost);
                  console.log('success', receipt.success);
                  console.log('paymaster', receipt.paymaster);
                  console.log('receipt', receipt.receipt);
                  console.log('transactionIndex', receipt.transactionIndex);
                  console.log('logs', receipt.logs);
                }).catch((error) => {
                  console.error('cannot get receipt', error);
                }
              );
            }}/>
            <TextInput
              style={styles.input}
              value={userName}
              onChangeText={(text) => setUserName(text)}
              placeholder="Type here"
              autoCapitalize="none"
            />
            <Button title={'Create/Get passkey'} onPress={() => {
              PasskeySigner
                .create(rpId, userName)
                .then((_signer) => {
                  const account = new SafeAccount({
                      chainId: 84532, // needed for android
                      rpcUrl: 'https://base-sepolia.g.alchemy.com/v2/UEwp8FtpdjcL5oekF6CjMzxe1D3768XU',
                      bundlerUrl: 'https://bundler.cometh.io/84532/?apikey=Y3dZHg2cc2qOT9ukzvxZZ7jEloTqx5rx',
                      signer: _signer,
                      paymasterUrl: 'https://paymaster.cometh.io/84532?apikey=Y3dZHg2cc2qOT9ukzvxZZ7jEloTqx5rx',
                    }
                  );
                  setSigner(_signer);
                  setSafeAccount(account);
                });
            }}/>
            {signer && <Text style={styles.sectionDescription}>✅ Passkey OK !</Text>}
          </View>
          {safeAccount && signer &&
            <>
              <View style={{marginTop: 20}}>
                <Button title={'Predict address'} onPress={() => {
                  setAddress('⌛');
                  SafeUtils.predictAddress('https://base-sepolia.g.alchemy.com/v2/UEwp8FtpdjcL5oekF6CjMzxe1D3768XU', signer)
                    .then((result) => {
                      setAddress('✅ ' + result);
                    })
                    .catch((error) => {
                      setAddress('❌ error: ' + error);
                    });
                }}/>
              </View>
              <Text style={styles.sectionDescription}>Address = {address}</Text>
              <View style={styles.button}>
                <Button title={'Send Transaction'} onPress={() => {
                  console.log('Sending User Op');
                  setUserOpHash('⌛');
                  safeAccount.sendUserOperation(
                    '0x2f920a66C2f9760f6fE5F49b289322Ddf60f9103',
                    '0x0',
                    '0xaaaa',
                    false
                  ).then((result) => {
                    console.log('User Op sent', result);
                    setUserOpHash('✅ ' + result);
                  }).catch((error) => {
                    setUserOpHash('❌ error: ' + error);
                    console.error(error);
                  });
                }}/>
              </View>
              <Text style={styles.sectionDescription}>hash = {userOpHash}</Text>
              <View style={styles.button}>
                <Button title={'Get owners'} onPress={() => {
                  setOwners('⌛');
                  safeAccount.getOwners().then((result) => {
                    setOwners('✅ ' + result.join(', '));
                  })
                    .catch((error) => {
                      setOwners('❌ error: ' + error);
                    });
                }}/>
              </View>
              <Text style={styles.sectionDescription}>Owners = {owners}</Text>
              <View style={styles.button}>
                <Button title={'Is deployed ?'} onPress={() => {
                  setIsDeployed('⌛');
                  safeAccount.isDeployed().then((result) => {
                    setIsDeployed(result ? 'true' : 'false');
                  })
                    .catch((error) => {
                      setIsDeployed('❌ error: ' + error);
                    });
                }}/>
              </View>
              <Text style={styles.sectionDescription}>isDeployed = {isDeployed}</Text>
              <View style={styles.button}>
                <Button title={'Add owner'} onPress={() => {
                  setAddOwner('⌛');
                  safeAccount.addOwner('0x999999cf1046e68e36E1aA2E0E07105eDDD1f08E').then((result) => {
                    setAddOwner('✅ ' + result);
                  })
                    .catch((error) => {
                      setAddOwner('❌ error: ' + error);
                    });
                }}/>
              </View>
              <Text style={styles.sectionDescription}>addOwner = {addOwner}</Text>
            </>}
          {/*<Button title={"Sign User Op"} onPress={() => {*/}
          {/*  console.log("Sign User Op")*/}
          {/*  const userOp = {*/}
          {/*    sender: "0x2f920a66C2f9760f6fE5F49b289322Ddf60f9103",*/}
          {/*    nonce: "0x0",*/}
          {/*    factory: "0x2f920a66C2f9760f6fE5F49b289322Ddf60f9103",*/}
          {/*    factoryData: "0xaaaa",*/}
          {/*    callData: "0xaaaa",*/}
          {/*    preVerificationGas: "0xaaaa",*/}
          {/*    callGasLimit: "0xaaaa",*/}
          {/*    verificationGasLimit: "0xaaaa",*/}
          {/*    maxFeePerGas: "0xaaaa",*/}
          {/*    maxPriorityFeePerGas: "0xaaaa",*/}
          {/*    paymaster: "0x2f920a66C2f9760f6fE5F49b289322Ddf60f9103",*/}
          {/*    paymasterData: "0xaaaa",*/}
          {/*    paymasterVerificationGasLimit: "0xaaaa",*/}
          {/*    paymasterPostOpGasLimit: "0xaaaa",*/}
          {/*    signature: "0xaaaa"*/}
          {/*  }*/}
          {/*  safeAccount.signUserOperation(userOp).then((result) => {*/}
          {/*    console.log(result)*/}
          {/*  }).catch((error) => {*/}
          {/*    console.error(error)*/}
          {/*  })*/}
          {/*}}/>*/}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
    ;
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
    userSelect: 'text',
    color: Colors.white,
  },
  button: {
    marginTop: 10,
  },
  highlight: {
    fontWeight: '700',
  },
  input: {
    height: 40,
    borderColor: 'white',
    color: 'white',
    borderWidth: 1,
    paddingHorizontal: 8,
    marginBottom: 16,
    borderRadius: 4,

  },
});

export default App;

/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import SafeAccount from 'rtn-4337/js/SafeAccount';
import * as SafeUtils from 'rtn-4337/js/SafeUtils';
import type {PropsWithChildren} from 'react';
import React from 'react';
import {Button, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, useColorScheme, View,} from 'react-native';

import {Colors, Header,} from 'react-native/Libraries/NewAppScreen';

type SectionProps = PropsWithChildren<{
  title: string;
}>;

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  const [address, setAddress] = React.useState("no address")
  const [owners, setOwners] = React.useState("no owners")

  const signer = {
    rpId: "sample4337.cometh.io",
    userName: "my_user",
    // privateKey: "4bddaeef5fb283e847abf0bd480a771b7695d70f413b248dc56c0bb1bb4a0b86"
  }
  const safeAccount = new SafeAccount(
    84532, // needed for android
    "https://base-sepolia.g.alchemy.com/v2/UEwp8FtpdjcL5oekF6CjMzxe1D3768XU",
    "https://bundler.cometh.io/84532/?apikey=Y3dZHg2cc2qOT9ukzvxZZ7jEloTqx5rx",
    signer,
    "https://paymaster.cometh.io/84532?apikey=Y3dZHg2cc2qOT9ukzvxZZ7jEloTqx5rx"
  )

  SafeUtils.predictAddress("https://base-sepolia.g.alchemy.com/v2/UEwp8FtpdjcL5oekF6CjMzxe1D3768XU", signer)
    .then((result) => {
      setAddress(result)
    })
    .catch((error) => {
      setAddress("error: " + error)
    })

  safeAccount.getOwners().then((result) => {
    setOwners(result.join(", "))
  })
    .catch((error) => {
      setOwners("error: " + error)
    })

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={backgroundStyle}>
        <Header/>
        <View
          style={{
            backgroundColor: isDarkMode ? Colors.black : Colors.white,
          }}>

          <Text style={styles.sectionTitle}>Addresse = {address}</Text>
          <Text style={styles.sectionDescription}>Owners = {owners}</Text>

          <Button title={"Send Transaction"} onPress={() => {
            console.log("Sending User Op")
            safeAccount.sendUserOperation("0x2f920a66C2f9760f6fE5F49b289322Ddf60f9103", "0x", "0xaaaa", false).then((result) => {
              console.log(result)
            }).catch((error) => {
              console.error(error)
            })
          }}/>
          <Button title={"Sign User Op"} onPress={() => {
            console.log("Sign User Op")
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
              signature: "0xaaaa"
            }
            safeAccount.signUserOperation(userOp).then((result) => {
              console.log(result)
            }).catch((error) => {
              console.error(error)
            })
          }}/>
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
  },
  highlight: {
    fontWeight: '700',
  },
});

export default App;

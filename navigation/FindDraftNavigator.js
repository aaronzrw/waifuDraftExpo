import * as React from 'react';
import { Platform, StatusBar, StyleSheet, View, Image, Dimensions, SafeAreaView} from 'react-native';
import { Text, Button, TouchableRipple } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

//Navigation
import { NavigationContainer } from '@react-navigation/native';
import { createSwitchNavigator } from 'react-navigation';
import { createStackNavigator } from '@react-navigation/stack';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';

import TabBarIcon from '../components/TabBarIcon';

//Screens
import FindDraftScreen from '../screens/FindDraft';
const homeIcon = require('../assets/images/HomeIcon.png')
const bossIcon = require('../assets/images/atkIcon.png')

//Chroma
const chroma = require('chroma-js')
const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
		flex:1,
		position: "relative",
		//top: StatusBar.currentHeight,
	},
	video: {
		width: 300,
		height: 300,
	},
	image:{
		width: width * .8,
		height: width * .8
	},
	background: {
		height: height,
		width: width,
		alignItems: 'center',
		justifyContent: 'center',
		position:"absolute",
		zIndex: -1
	},
	navmenu:{
		width: width,
		height: 30,
		justifyContent:"center",
		alignItems:"center",
		backgroundColor: "rgba(0,0,0,.15)",
	},
	loadingContainer:{
		width: width,
		height: height,
		justifyContent:"center",
		alignItems:"center",
		backgroundColor: "rgba(0,0,0,.15)",
		position: "absolute",
		zIndex: 10
	}
})

const INITIAL_ROUTE_NAME = 'FindDraft';
const FindDraftStack = createStackNavigator();
export default function FindDraftNavigator(props) {
  goBackFunc = props.setBackBtnFunc;
  
  return (
    <NavigationContainer>
      <FindDraftStack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyle: {backgroundColor: "transparent"}
        }}
        initialRouteName={INITIAL_ROUTE_NAME}
      >
        <FindDraftStack.Screen name="FindDraft" initialParams={{goBackFunc}} component={FindDraftScreen} />
      </FindDraftStack.Navigator>
    </NavigationContainer>
  );
}
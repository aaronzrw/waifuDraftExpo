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
import ChatScreen from '../screens/Chat';
import ViewChatScreen from '../screens/ViewChat';
import NewChatScreen from '../screens/NewChat';

import ProfileScreen from '../screens/Profile';

import TradeScreen from '../screens/Trade';
import OtherUserProfileScreen from '../screens/OtherUserProfile';
import OtherUserCharDetailsScreen from '../screens/OtherUserCharDetails';
import NewTradeScreen from '../screens/NewTrade';
import ViewTradeScreen from '../screens/ViewTrade';

import HomeScreen from '../screens/Home';
import VoteDetailsScreen from '../screens/VoteDetails';
import CharDetailsScreen from '../screens/CharDetails';
import CharUpdateScreen from '../screens/CharUpdate';

import GauntletScreen from '../screens/Gauntlet';
import BossFightScreen from '../screens/BossFight';

import SearchScreen from '../screens/Search';
import SearchSeriesScreen from '../screens/SearchSeries';
import SearchCharactersScreen from '../screens/SearchCharacters';
import SeachCharacterDetailsScreen from '../screens/SeachCharacterDetails';
import ViewWishListCharactersScreen from '../screens/ViewWishListCharacters';
import UserWaifuFavoritesScreen from '../screens/UserWaifuFavorites';

import ShopScreen from '../screens/Shop';
import BossShopScreen from '../screens/BossShop';
import BuyWaifuScreen from '../screens/BuyWaifu';

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

const HomeStack = createStackNavigator();
function HomeStackScreen(props) {
  return (
    <HomeStack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: {backgroundColor: "transparent"}
      }}
      initialRouteName={"Home"}
    >
      <HomeStack.Screen name="Home" initialParams={{goBackFunc}} component={HomeScreen} />
      <HomeStack.Screen name="VoteDetails" initialParams={{goBackFunc}} component={VoteDetailsScreen} />
    </HomeStack.Navigator>
  );
}

const SearchStack = createStackNavigator();
function SearchStackScreen() {
  return (
    <SearchStack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: {backgroundColor: "transparent"}
      }}
    >
      <SearchStack.Screen name="Search" initialParams={{goBackFunc}} component={SearchScreen} />
      <SearchStack.Screen name="SearchSeries" initialParams={{goBackFunc}} component={SearchSeriesScreen} />
      <SearchStack.Screen name="SearchCharacters" initialParams={{goBackFunc}} component={SearchCharactersScreen} />
      <SearchStack.Screen name="SeachCharacterDetails" initialParams={{goBackFunc}} component={SeachCharacterDetailsScreen} />
      <SearchStack.Screen name="ViewWishListCharacters" initialParams={{goBackFunc}} component={ViewWishListCharactersScreen} />
    </SearchStack.Navigator>
  );
}

const ProfileStack = createStackNavigator();
function ProfileStackScreen() {
  return (
    <ProfileStack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: {backgroundColor: "transparent"},
      }}
    >
      <ProfileStack.Screen name="Profile" initialParams={{goBackFunc}} component={ProfileScreen} />
      <ProfileStack.Screen name="CharDetails" initialParams={{goBackFunc}} component={CharDetailsScreen} />
      <ProfileStack.Screen name="CharUpdate" initialParams={{goBackFunc}} component={CharUpdateScreen} />
      <ProfileStack.Screen name="OtherUserCharDetails" initialParams={{goBackFunc}} component={OtherUserCharDetailsScreen} />
      <ProfileStack.Screen name="ViewTrade" initialParams={{goBackFunc}} component={ViewTradeScreen} />
      {/* <ProfileStack.Screen name="SeachCharacterDetails" initialParams={{goBackFunc}} component={SeachCharacterDetailsScreen} /> */}
      <ProfileStack.Screen name="UserWaifuFavorites" initialParams={{goBackFunc}} component={UserWaifuFavoritesScreen} />
      <ProfileStack.Screen name="FindDraft" initialParams={{goBackFunc}} component={FindDraftScreen} />
    </ProfileStack.Navigator>
  );
}

const TradeStack = createStackNavigator();
function TradeStackScreen() {
  return (
    <TradeStack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: {backgroundColor: "transparent"}
      }}
    >
      <TradeStack.Screen name="Trade" initialParams={{goBackFunc}} component={TradeScreen} />
      <TradeStack.Screen name="OtherUserProfile" initialParams={{goBackFunc}} component={OtherUserProfileScreen} />
      <TradeStack.Screen name="CharDetails" initialParams={{goBackFunc}} component={CharDetailsScreen} />
      <TradeStack.Screen name="OtherUserCharDetails" initialParams={{goBackFunc}} component={OtherUserCharDetailsScreen} />
      <TradeStack.Screen name="NewTrade" initialParams={{goBackFunc}} component={NewTradeScreen} />
      <TradeStack.Screen name="ViewTrade" initialParams={{goBackFunc}} component={ViewTradeScreen} />
      <TradeStack.Screen name="ViewChat" initialParams={{goBackFunc}} component={ViewChatScreen} />
      {/* <TradeStack.Screen name="SeachCharacterDetails" initialParams={{goBackFunc}} component={SeachCharacterDetailsScreen} /> */}
      <TradeStack.Screen name="UserWaifuFavorites" initialParams={{goBackFunc}} component={UserWaifuFavoritesScreen} />
    </TradeStack.Navigator>
  );
}

const GauntletStack = createStackNavigator();
function GauntletStackScreen() {
  return (
    <GauntletStack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: {backgroundColor: "transparent"}
      }}
    >
      <GauntletStack.Screen name="Gauntlet" initialParams={{goBackFunc}} component={GauntletScreen} />
      <GauntletStack.Screen name="BossFight" initialParams={{goBackFunc}} component={BossFightScreen} />
      <GauntletStack.Screen name="BossShop" initialParams={{goBackFunc}} component={BossShopScreen} />
    </GauntletStack.Navigator>
  );
}

const ShopStack = createStackNavigator();
function ShopStackScreen() {
  return (
    <ShopStack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: {backgroundColor: "transparent"}
      }}
    >
      <ShopStack.Screen name="Shop" initialParams={{goBackFunc}} component={ShopScreen} />
      <ShopStack.Screen name="BuyWaifu" initialParams={{goBackFunc}} component={BuyWaifuScreen} />
    </ShopStack.Navigator>
  );
}

const ChatStack = createStackNavigator();
function ChatStackScreen() {
  return (
    <ChatStack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: {backgroundColor: "transparent"}
      }}
    >
      <ChatStack.Screen name="Chat" initialParams={{goBackFunc}} component={ChatScreen} />
      <ChatStack.Screen name="ViewChat" initialParams={{goBackFunc}} component={ViewChatScreen} />
      <ChatStack.Screen name="NewChat" initialParams={{goBackFunc}} component={NewChatScreen} />
    </ChatStack.Navigator>
  );
}

var goBackFunc = null;
const INITIAL_ROUTE_NAME = 'Home';
const BottomTab = createMaterialBottomTabNavigator();
export default function DraftAuctionNavigator(props) {
  goBackFunc = props.setBackBtnFunc;
  
  return (
    <NavigationContainer>
      <BottomTab.Navigator
        initialRouteName={INITIAL_ROUTE_NAME}
        renderTouchable
        keyboardHidesNavigationBar
        labeled={false}
      >
        <BottomTab.Screen name="Profile"
          component={ProfileStackScreen}
          options={{
            title: 'Profile',
            tabBarColor: chroma('aqua').darken(.25).hex(),
            tabBarIcon: ({ focused }) => <TabBarIcon activeColor="white" focused={focused} name="user" />,
          }}
        />

        <BottomTab.Screen name ="Chats"
          component={ChatStackScreen}
          options={{
            title: "Chats",
            tabBarColor: "white",
            tabBarIcon: ({ focused }) => <MaterialCommunityIcons name="message-text-outline" size={24} color={focused ? "black" : "#ccc"} />,
          }}
        >

        </BottomTab.Screen>

        <BottomTab.Screen name="Trade"
          component={TradeStackScreen}
          options={{
            title: 'Trade',
            tabBarColor: chroma('silver').hex(),
            tabBarIcon: ({ focused }) => <TabBarIcon activeColor="white" focused={focused} name="exchange-alt" />,
          }}
        />
        
        <BottomTab.Screen name="Home"
          component={HomeStackScreen}
          options={{
            title: 'Home',
            tabBarColor: "black",
            tabBarIcon: ({ focused }) =>
            // <View style={{flex:1, alignItems: "center", justifyContent:"center"}}>
              // {/* <Image source={homeIcon} style={{height:65, width:65, position:"absolute", alignSelf:"center"}} /> */}
              <TabBarIcon focused={focused} activeColor='white' name="home" style={{position:"absolute", alignSelf:"center"}}  />
            // </View>
            ,
          }}
        />
        
        <BottomTab.Screen name="Shop"
          component={ShopStackScreen}
          options={{
            title: 'Shop',
            tabBarColor: chroma('green').brighten().hex(),
            tabBarIcon: ({ focused }) => <TabBarIcon activeColor="white" focused={focused} name="dollar-sign" />,
          }}
        />
        <BottomTab.Screen name="Gauntlet"
          component={GauntletStackScreen}
          options={{
            title: 'Gauntlet',
            tabBarColor: chroma('rgba(255,149,0,1)'),
            tabBarIcon: ({ focused }) => <Image style={{height: 30, width: 30, tintColor: !focused ? '#ccc' : 'white'}} source={bossIcon} />,
          }}
        />
        <BottomTab.Screen name="Search"
          component={SearchStackScreen}
          options={{
            title: 'Search',
            tabBarLabel: "Search",
            tabBarColor: chroma('aquamarine').luminance(0.5),
            tabBarIcon: ({ focused }) => <TabBarIcon activeColor="white" focused={focused} name="search" />,
          }}
        />
      </BottomTab.Navigator>
    </NavigationContainer>
  );
}
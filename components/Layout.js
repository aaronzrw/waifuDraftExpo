import _ from 'lodash';
import React, { Component, createRef, forwardRef, useState, useEffect, useRef } from 'react';
import { Platform, StatusBar, StyleSheet, View, Image, Dimensions, SafeAreaView, AppState} from 'react-native';
import { Text, TextInput, Button, ActivityIndicator } from 'react-native-paper';

import {
	LOADING_UI,
	STOP_LOADING_UI,
	SET_USER_CREDENTIALS,
	UNSUB_SNAPSHOTS,
	SET_SNACKBAR
} from '../redux/types';

//Components
import Toast from '../components/Toast'
import BackBtn from '../components/BackBtn'

//Expo
import { Video } from 'expo-av';
import * as Font from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
import * as Updates from 'expo-updates';
import * as Notifications2 from 'expo-notifications';
import { Notifications } from 'expo';
import * as Permissions from 'expo-permissions';
import Constants from 'expo-constants';

//Navigation
import FindDraftNavigator from '../navigation/FindDraftNavigator'
import DraftAuctionNavigator from '../navigation/DraftAuctionNavigator'

//Screens
import LoginSignUp from '../screens/LoginSignUp';

//Action
import { setRealTimeListeners } from '../redux/actions/dataActions';
import { setAuthorizationHeader } from '../redux/actions/userActions';

//Redux
import store from '../redux/store';
import watch from 'redux-watch'

//Firebase
import firebase from 'firebase/app'
import 'firebase/auth'

//icons
import splashGif from '../assets/images/splash.gif'

const chroma = require('chroma-js')
const { width, height } = Dimensions.get('window');
const loadingGif = "https://firebasestorage.googleapis.com/v0/b/waifudraftunlimited.appspot.com/o/Loading.gif?alt=media&token=371cd83f-57f9-4802-98e1-241b067582b4";

const styles = StyleSheet.create({
  container: {
		flex:1,
		position: "relative",
		backgroundColor: "rgba(0,0,0,.75)",
	},
	video: {
		width: 300,
		height: 300,
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
	image:{
		width: width * .8,
		height: width * .8
	},
	loadingContainer:{
		width: '100%',
		height: '100%',
		justifyContent:"center",
		alignItems:"center",
		backgroundColor: "rgba(0,0,0,.75)",
		position: "absolute",
		zIndex: 1000
	}
})

class Layout extends Component {
	static displayName = Layout.name;
	constructor(props) {
		super(props);
		this.state = {
			loading: true,
			authUser: props.authUser,
			appState: AppState.currentState,
			nav: null,
			showOvr: null,
			goBackOvr: null,
			draftSettings: null
		};

		this.startListeners = _.debounce(this.startListeners.bind(this), 500)
		this.setBackBtnFunc = this.setBackBtnFunc.bind(this)
		this.switchRender = this.switchRender.bind(this)
	}

	_handleAppStateChange = async (nextAppState) => {
		if ((this.state.appState.match(/inactive|background/) && nextAppState === 'active') || (this.state.appState == "active" && nextAppState == undefined)) {
			this.startListeners()
						
			// Notifications2.setNotificationHandler({
			// 	handleNotification: async () => ({
			// 		shouldShowAlert: true,
			// 		shouldPlaySound: false,
			// 		shouldSetBadge: false,
			// 	}),
			// });

			// This listener is fired whenever a notification is received while the app is foregrounded
			// Notifications2.addNotificationReceivedListener(this._handleNotification);

			// This listener is fired whenever a user taps on or interacts with a notification (works when app is foregrounded, backgrounded, or killed)
			// Notifications2.addNotificationResponseReceivedListener(this._handleNotificationResponse);

			try {
				const update = await Updates.checkForUpdateAsync();
				if (update.isAvailable) {
					await Updates.fetchUpdateAsync();
	
					store.dispatch({
						type: SET_SNACKBAR,
						payload: { type: "success", message: "New Update Avalible. Applying..." }
					});
	
					//... notify user of update...
					this.setState(async () => {
						await Updates.reloadAsync();
					}, 1000)
				}
				else{
					console.log("No Update")
				}
			}
			catch (e) {
				// handle or log error
				// store.dispatch({
				// 	type: SET_SNACKBAR,
				// 	payload: { type: "error", message: "Error Applying Update" }
				// });
			}
		}
		else{
			store.dispatch({ type: UNSUB_SNAPSHOTS });

			if(this.uiUnsubscribe != null){
				this.uiUnsubscribe()
				// Notifications.removeAllNotificationListeners();
			}
		}

    	this.setState({appState: nextAppState});
	}

	_handleNotification = notification => {
		store.dispatch({type: SET_SNACKBAR, payload: {type:"error", message: "notification recieved"}});
    	this.setState({ notification: notification });
	};

  	_handleNotificationResponse = response => {
		store.dispatch({type: SET_SNACKBAR, payload: {type:"info", message: "notification clicked"}});

		// const data = response.notification.request.content.data
		// store.dispatch({type: SET_SNACKBAR, payload: {type:"info", message: data}});
	};
	
	async componentDidMount() {
		AppState.addEventListener('change', this._handleAppStateChange);
		
		this._handleAppStateChange();
	}

	componentWillUnmount(){
		AppState.addEventListener('change', this._handleAppStateChange);
		this.mounted = false;
	}
	
	async startListeners(){
		let uiReducerWatch = watch(store.getState, 'UI')
		this.uiUnsubscribe = store.subscribe(uiReducerWatch((newVal, oldVal, objectPath) => {
			this.setState({ ...newVal })
		}))
		
		let draftReducerWatch = watch(store.getState, 'draft')
		this.draftUnsubscribe = store.subscribe(draftReducerWatch((newVal, oldVal, objectPath) => {
			this.setState({ draftSettings: {...newVal} })
		}))

		store.dispatch({type: LOADING_UI})
		
		if(this.state.authUser != null){
			// setAuthorizationHeader()
			await setRealTimeListeners(this.state.authUser.uid)
			this.registerForPushNotificationsAsync(this.state.authUser.uid);
			// this._notificationSubscription = Notifications.addListener(this._handleNotification);
		}
		
		store.dispatch({type: STOP_LOADING_UI})
	}

	UNSAFE_componentWillReceiveProps(props){
		if(!_.isEqual(props.authUser, this.state.authUser))
			this.startListeners(props)
	}

  	registerForPushNotificationsAsync = async (userId) => {
		try{
			const { status: existingStatus } = await Permissions.getAsync(Permissions.NOTIFICATIONS);
			let finalStatus = existingStatus;

			if (existingStatus !== 'granted') {
				const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
				finalStatus = status;
			}

			if (finalStatus !== 'granted') {
				console.log('Failed to get push token for push notification!');
				return;
			}
			
			token = await Notifications.getExpoPushTokenAsync();
			
			await firebase.firestore().doc(`users/${userId}`).get()
			.then((userRef) => {
				var user = userRef.data();
				
				if(user.token == undefined || user.token != token){ //add user token or update it if is different
					userRef.ref.update({token})
				}
			})
			.catch((err) => {
				// store.dispatch({type: SET_SNACKBAR, payload: {type:"error", message: "cant set token"}});
			})

			if (Platform.OS === 'android') {
				// Notifications.createChannelAndroidAsync('default', {
				// 	name: 'default',
				// 	sound: true,
				// 	priority: 'max',
				// 	vibrate: [0, 250, 250, 250],
				// });
			}
		}
		catch(err){
			// store.dispatch({type: SET_SNACKBAR, payload: {type:"info", message: "Error getting permissions"}});
			await firebase.firestore().collection(`logs`).add({log: err, timestamp: new Date()})
			.catch((err) => {
				store.dispatch({type: SET_SNACKBAR, payload: {type:"error", message: "Error adding error log"}});
			});
		}
	};
	
	setBackBtnFunc(nav, showOvr = null, goBackOvr = null){
		this.setState({
			nav,
			showOvr,
			goBackOvr
		})
	}

	switchRender(){
		var draftState = this.state.draftSettings == null ? null : this.state.draftSettings.draftState;

		switch(draftState){
			case "FindDraft":
				return (
					<FindDraftNavigator setBackBtnFunc={this.setBackBtnFunc}/>
				)
			case "DraftLoaded":
				return(
					<DraftAuctionNavigator setBackBtnFunc={this.setBackBtnFunc}/>
				)
			default:
				return (
					<View style={[styles.loadingContainer, {zIndex: 1, backgroundColor: chroma('black')}]}>
						{/* <Image style={{flex: 1}} source={splashGif} /> */}
					</View>
				)
		}
	}
	render() {
		return (
			<View style={styles.container}>
				{
					this.state.loading ?
						<View style={styles.loadingContainer}>
							<Image style={styles.image} source={{uri: loadingGif}} />
						</View>
					: <></>
				}

				<>
					{
						this.state.authUser == null ? 
							<LoginSignUp />
						:
							//Draft View Render
							this.switchRender()
					}
				</>
				
				<BackBtn nav={this.state.nav} goBackOvr={this.state.goBackOvr} showOvr={this.state.showOvr}/>
				<Toast/>
			</View>
		);
	}
}
export default Layout;
import React, { Component, createRef, forwardRef } from 'react';
import { Input, Slider } from 'react-native-elements';
import * as Localization from 'expo-localization';
import { Text, FAB, TextInput, Button, ActivityIndicator, Searchbar, Switch } from 'react-native-paper';
import { Animated, Easing, Platform, StatusBar, StyleSheet, View, TouchableOpacity, TouchableHighlight, ScrollView,
  Image, ImageBackground, Dimensions, FlatList, Modal, KeyboardAvoidingView } from 'react-native';
import {setRealTimeListeners, updateWaifuImg} from '../redux/actions/dataActions'

import _ from 'lodash'
import lz from "lz-string";
import Swiper from 'react-native-swiper'
import SwipeIndicator from '../components/SwipeIndicator'
import DateTimePicker from '@react-native-community/datetimepicker';
import NumericInput from 'react-native-numeric-input'
// import Slider from '@react-native-community/slider';

import Icon from 'react-native-vector-icons/FontAwesome';
import {
  SET_SNACKBAR,
  LOADING_UI,
  STOP_LOADING_UI
} from '../redux/types';

import watch from 'redux-watch'
import store from '../redux/store'
import * as firebase from 'firebase';
import 'firebase/auth';

import bossFightGif from '../assets/images/Boss-Fight.gif'

const chroma = require('chroma-js')
const { width, height } = Dimensions.get('window');

import * as dateFns from 'date-fns'
import { zonedTimeToUtc } from 'date-fns-tz'
const {listTimeZones, findTimeZone, getZonedTime, getUnixTime} = require('timezone-support')

export default class FindDraft extends Component {
  constructor(props){
    super();

    var views = ["FindDraft", "NewDraft"]
    var selView = props.route.params.selView ?? "FindDraft";
    var index = views.findIndex(x => x == selView);

    this.state = {
      navigation: props.navigation,
      goBackFunc: props.route.params.goBackFunc,
      user: store.getState().user.creds,
      userDrafts: [],
      userId: firebase.auth().currentUser.uid,
      hasPass: true,
      draftRec: null,
      draftCode: "",
      draftPass: "",
      draftData: {
        img: "",
        name: "",
        code: "",
        pass: "",
        defaultPoints: 5,
        defaultStatCoins: 0,
        defaultRankCoins: 0,
        defaultHOFCoins: 0,
        season:{
          length: 1,
          open: dateFns.setSeconds(dateFns.startOfDay(new Date()), 0),
          close: dateFns.setMinutes(dateFns.setSeconds(dateFns.endOfDay(new Date()), 0), 0),
          isActive: true,
          number: 0
        },
        dailyPoll: {
          open: dateFns.setSeconds(dateFns.startOfDay(new Date()), 0),
          close: dateFns.setMinutes(dateFns.setSeconds(dateFns.endOfDay(new Date()), 0), 0),
          isActive: false,
          charCount: 5
        },
        weeklyPoll: {
          open: dateFns.setSeconds(dateFns.startOfDay(new Date()), 0),
          close: dateFns.setMinutes(dateFns.setSeconds(dateFns.endOfDay(new Date()), 0), 0),
          isActive: false,
          charCount: 5,
          closeTimeRefresh: 2,
          closeResetMax: 5
        },
        boss: {
          open: dateFns.setSeconds(dateFns.startOfDay(new Date()), 0),
          close: dateFns.setMinutes(dateFns.setSeconds(dateFns.endOfDay(new Date()), 0), 0),
          count: 10
        },
        timeZone: Localization.timezone
      },
      showDailyOpen: false,
      showDailyClose: false,
      showWeeklyOpen: false,
      showWeeklyClose: false,
      findDraftImgSize: 50,
      newDraftImgSize: 50,
      views,
      index
    };
    
    this.setSubscribes = this.setSubscribes.bind(this)
    this.unSetSubscribes = this.unSetSubscribes.bind(this)

    this.FindDraft = this.FindDraft.bind(this)
    this.JoinDraft = this.JoinDraft.bind(this)
    this.createNewDraft = this.createNewDraft.bind(this)
  }

  async setSubscribes(){
    this.state.goBackFunc(this.state.navigation)

    var userDrafts = [];
    await firebase.firestore().collectionGroup('users').where("id", '==', this.state.userId).get()
    .then(function (querySnapshot) {
      userDrafts = querySnapshot.docs.map(doc => doc.ref.parent.parent.id)
    });

    this.setState({userDrafts})
  }

  unSetSubscribes(){
    // if(this.dataUnsubscribe != null)
    //   this.dataUnsubscribe()
    
    // if(this.userUnsubscribe != null)
    //   this.userUnsubscribe()
  }
  
  componentDidMount(){
    this._navFocusUnsubscribe = this.state.navigation.addListener('focus', () => this.setSubscribes());
    this._navBlurUnsubscribe = this.state.navigation.addListener('blur', () => this.unSetSubscribes());
  }

  componentWillUnmount(){
    this._navFocusUnsubscribe();
    this._navBlurUnsubscribe();
  }
  
  async FindDraft(){
    console.log(this.state.draftCode)

    var draft = await firebase.firestore().collection(`drafts`)
      .where('settings.code', '==', this.state.draftCode).get()
      .then((snap) => {
        var draftRec = [];
        snap.forEach(function(doc) {
          draftRec.push({draftId: doc.id , ...doc.data().settings})
        });
        
        if(_.isEmpty(draftRec)){
          return null
        }
        else{
          return draftRec[0]
        }
      })

    this.setState({ draftPass: "" })

    if(draft != null){
      this.setState({ draftRec: draft })
      return
    }

    store.dispatch({
      type: SET_SNACKBAR,
      payload: {type: "warning", message: `No Draft Found`}
    });
  }

  async JoinDraft(){
    if(this.state.user.currentDraftId && this.state.user.currentDraftId == this.state.draftRec.draftId || this.state.userDrafts.includes(this.state.draftRec.draftId)){
      store.dispatch({
        type: SET_SNACKBAR,
        payload: {type: "warning", message: `Your Already In This Draft`}
      });
      return
    }

    if(!this.state.draftPass || this.state.draftPass != lz.decompressFromUTF16(this.state.draftRec.pass)){
      store.dispatch({
        type: SET_SNACKBAR,
        payload: {type: "warning", message: `Password Invalid`}
      });
      return
    }

    await firebase.firestore().doc(`users/${this.state.userId}`).get()
    .then((doc) => {
      store.dispatch({
        type: SET_SNACKBAR,
        payload: {type: "successful", message: `Joining Draft`}
      });

      firebase.firestore().doc(`/users/${this.state.userId}`).update({currentDraftId: this.state.draftRec.draftId})
      return firebase.firestore().doc(`drafts/${this.state.draftRec.draftId}/users/${this.state.userId}`).set({})
    })
    .then(async () => {
      store.dispatch({type: LOADING_UI})

      await setRealTimeListeners(this.state.userId)
      
      store.dispatch({type: STOP_LOADING_UI})
    })
  }

  async createNewDraft(){
    store.dispatch({type: LOADING_UI})

    console.log(lz.compressToUTF16("0000"))

    if(!this.state.draftData.name){
      store.dispatch({
        type: SET_SNACKBAR,
        payload: {type: "warning", message: `You Must Add A Draft name`}
      });
      return;
    }

    if(!(this.state.draftData.img.match(/\.(jpeg|jpg|gif|png)$/) != null)){
      store.dispatch({
        type: SET_SNACKBAR,
        payload: {type: "warning", message: `Image Url Must Be .jpeg, .jpg, .gif or .png`}
      });
      return;
    }

    var draftCodes = await (await firebase.firestore().collection('drafts').get()).docs.map(x => x.data().settings.code);

    var code = "";
    while(code == "" || draftCodes.includes(code)){
      code = this.randomString('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ');
    }

    var draftId = ""
    var settings = _.cloneDeep(this.state.draftData);

    settings.code = code;
    if(settings.pass)
      settings.pass = lz.compressToUTF16(settings.pass)
    
    //set Dates
    var season = settings.season;
    season.open = dateFns.setHours(season.open, settings.weeklyPoll.open.getHours());
    season.open = dateFns.setMinutes(season.open, settings.weeklyPoll.open.getMinutes());
    season.open = firebase.firestore.Timestamp.fromDate(season.open)

    //Set Season Close based on season length and time using weekly poll close
    // season.close = dateFns.addMonths(season.close, season.length);
    // season.close = dateFns.endOfWeek(season.close, {weekStartsOn: 1});
    season.close = dateFns.setHours(season.close, settings.weeklyPoll.close.getHours());
    season.close = dateFns.setMinutes(season.close, settings.weeklyPoll.close.getMinutes());
    season.close = dateFns.setSeconds(season.close, settings.weeklyPoll.close.getSeconds());
    season.close = firebase.firestore.Timestamp.fromDate(season.close)
    
    //Dont need to set daily dates since bg processes will reset them everyday

    //set weekly poll dates
    var weeklyPoll = settings.weeklyPoll;
    
    //set the dates from the onCreate function
    // weeklyPoll.open = this.getClosestDayOfLastWeek('Mon', weeklyPoll.open) //set week open to monday of this week
    // weeklyPoll.close = this.getClosestDayOfLastWeek('Fri', weeklyPoll.close) //set week close to friday of the open week
    
    weeklyPoll.open = firebase.firestore.Timestamp.fromDate(weeklyPoll.open)
    weeklyPoll.close = firebase.firestore.Timestamp.fromDate(weeklyPoll.close)
      
    var boss = settings.boss;
    boss.open = weeklyPoll.open
    boss.close = weeklyPoll.close
    
    //create draft record
    await firebase.firestore().doc(`drafts/${code}`).set({settings})
    .then((doc) => {
      var adminUser = {
        id: this.state.userId,
        userName: this.state.user.userName,
        img: this.state.user.img,
        favoriteSeries: [],
        wishList: [],
        isAdmin: true,
        isActive: true,
        dailyBonusRedeemed: false,
        points: settings.defaultPoints,
        statCoins: settings.defaultStatCoins,
        rankCoins: settings.defaultRankCoins,
        HOFCoins: settings.defaultHOFCoins,
        createdDate: firebase.firestore.Timestamp.now(),
        modifiedDate: firebase.firestore.Timestamp.now(),
      }

      //add create user to users sub collection as admin
      return firebase.firestore().doc(`drafts/${code}/users/${this.state.userId}`).set(adminUser)
    })
    .then(() => {
      //switch user to this draft
      return firebase.firestore().doc(`users/${this.state.userId}`).update({currentDraftId: code})
    })
    .then(async () => {
      //if(this.state.navigation.dangerouslyGetParent() != null){
        await setRealTimeListeners(this.state.userId)
      //}

      var draftData = this.state.draftData;
      draftData.code = code;
      this.setState({ draftData })

      store.dispatch({type: STOP_LOADING_UI})

      // this.state.navigation.goBack()
      // this.state.navigation.navigate("Home")
    })
    .catch((err) => {
      console.log(err)
      store.dispatch({type: STOP_LOADING_UI})
    })
  }

  getClosestDayOfLastWeek(dayOfWeek, fromDate = new Date()) {
    // follow the getISODay format (7 for Sunday, 1 for Monday)
    const dayOfWeekMap = {
      Mon: 1,
      Tue: 2,
      Wed: 3,
      Thur: 4,
      Fri: 5,
      Sat: 6,
      Sun: 7,
    };

    //+- 6 because we are looking for a different day so dont includes current day of week
    var startRange = dateFns.addDays(fromDate, -6);
    var endRange = dateFns.addDays(fromDate, 6);
    var fullRange = dateFns.eachDayOfInterval({
      start: startRange,
      end: endRange
    })

    var dayDates = fullRange.filter(x => dateFns.getISODay(x) == dayOfWeekMap[dayOfWeek]);
    var closestDate = dateFns.closestTo(fromDate, dayDates)
    closestDate = dateFns.setHours(closestDate, fromDate.getHours())
    closestDate = dateFns.setMinutes(closestDate, fromDate.getMinutes())
    closestDate = dateFns.setSeconds(closestDate, fromDate.getSeconds())
    
    console.log(closestDate)    
    return closestDate;
  }

  randomString(chars) {
    var result = ''
    for(var i = 0; i < 4; i++)
      result += _.sample(chars)
    
    return result;
  }
  
  render(){
    var tintColor = "white";
    switch(this.state.index){
      case 0: 
        tintColor = "black"
        break;
      case 1: 
        tintColor = "white"
        break;
    }

    return (
      <View style={[{flex:1, width:width, justifyContent:"center", alignItems:"center", backgroundColor: "white"}]}>
        <SwipeIndicator horiSwipe={true} tintColor={tintColor} />
        <Swiper
          index={this.state.index}
          bounces
          removeClippedSubviews
          // scrollEnabled={false}
          showsPagination={false}
          onIndexChanged={(index) => {this.setState({index})}}
          ref='swiper'
        >
          {/* Find Draft View */}
          <View style={{flex:1, width:width, justifyContent:"center", alignItems:"center"}}>
            <View style={{flex: 1, width: width, position: "relative", backgroundColor: "red"}}>
              <View style={{height:50, width: width, position: "relative", backgroundColor:chroma('black').alpha(.1), flexDirection: "row", justifyContent:"center", alignItems:"center"}}>
                <Text style={[styles.text, {flex: 1}]}>
                  Draft Search
                </Text>
              </View>

              <View style={styles.updtImgCon}>
                <View style={{ flex: 1, width: width, justifyContent: "center", alignItems:"center"}}
                  onLayout={(event) => {
                    var {x, y, width, height} = event.nativeEvent.layout;
                    this.setState({ findDraftImgSize: height})
                  }}
                >
                  {
                    this.state.draftRec != null && this.state.draftRec.img != "" ?
                      <Image
                        source={{ uri: this.state.draftRec.img }} 
                        style={[styles.profileImg, {width: this.state.findDraftImgSize/2, height: this.state.findDraftImgSize/2}]} 
                      />
                    :
                    <></>
                  }
                  
                  {
                    this.state.draftRec != null && this.state.draftRec.name ?
                      <Input label="Draft Name" autoCapitalize="characters" disabled
                        inputContainerStyle={{borderWidth: 1, borderRadius: 20, borderColor: chroma('black'), paddingLeft: 8, paddingRight: 8}}
                        style={{fontFamily: "Edo", fontWeight: 'normal', fontSize: 30, color: "black", textAlign: "center"}}
                        labelStyle={{fontFamily: "Edo", fontWeight: 'normal', fontSize: 15, color: "black", textAlign: "center"}}
                        value={this.state.draftRec.name}
                      />
                    : <></>
                  }
                  
                  {
                    this.state.draftRec != null ?
                    <Button mode={"contained"} color={chroma('aqua').hex()}
                      labelStyle={{fontSize: 20, fontFamily: "Edo"}}
                      onPress={() => this.JoinDraft()}
                    >
                      Join Draft
                    </Button>
                
                    : <></>
                  }
                </View>

                <View
                  style={{
                    height: 'auto',
                    width: width,
                    justifyContent: "center", alignItems: "center",
                    backgroundColor: chroma('white'), padding: 20
                  }}
                >
                  <KeyboardAvoidingView behavior={Platform.OS == 'ios' ? 'padding' : 'height'} style={{ height: 'auto', width: width * .65 }}>
                    <Input maxLength={4} placeholder="1234" label="Draft Code (4 characters)" autoCapitalize="characters"
                      inputContainerStyle={{borderWidth: 1, borderRadius: 20, borderColor: chroma('black'), paddingLeft: 8, paddingRight: 8}}
                      style={{fontFamily: "Edo", fontWeight: 'normal', fontSize: 35, color: "black", textAlign: "center"}}
                      labelStyle={{fontFamily: "Edo", fontWeight: 'normal', fontSize: 15, color: "black", textAlign: "center"}}
                      value={this.state.draftCode}
                      onChangeText={(draftCode) => {
                        if(draftCode.match(/^[a-zA-Z0-9]*$/i))
                          this.setState({ draftCode })
                      }}
                    />
                    
                    {
                      this.state.draftRec != null && this.state.draftRec.pass ?
                        <Input maxLength={6} placeholder="123456" label="Draft Password (6 characters)" autoCapitalize="characters"
                          inputContainerStyle={{borderWidth: 1, borderRadius: 20, borderColor: chroma('black'), paddingLeft: 8, paddingRight: 8}}
                          style={{fontFamily: "Edo", fontWeight: 'normal', fontSize: 20, color: "black", textAlign: "center"}}
                          labelStyle={{fontFamily: "Edo", fontWeight: 'normal', fontSize: 15, color: "black", textAlign: "center"}}
                          value={this.state.draftPass}
                          onChangeText={(draftPass) => {
                            if(draftPass.match(/^[a-zA-Z0-9]*$/i))
                              this.setState({ draftPass })
                          }}
                          leftIcon={
                            <Icon
                              name='key'
                              size={24}
                              color='black'
                            />
                          }
                        />
                      : <></>
                    }
                  </KeyboardAvoidingView>

                  <Button mode={"contained"} color={chroma('aqua').hex()}
                    labelStyle={{fontSize: 20, fontFamily: "Edo"}}
                    disabled={this.state.draftCode.length != 4}
                    onPress={() => this.FindDraft()}
                  >
                    Search
                  </Button>
                </View>
              </View>
            </View>
          </View>
        
          {/* New Draft View */}
          <View style={{flex:1, width:width, justifyContent:"center", alignItems:"center"}}>
            <View style={{height:50, width: width, position: "relative", backgroundColor:chroma('black').alpha(.1), flexDirection: "row", justifyContent:"center", alignItems:"center"}}>
              <Text style={[styles.text, {flex: 1}]}>
                Create New Draft
              </Text>
            </View>

            <ImageBackground
              source={{ uri: this.state.draftData.img.match(/\.(jpeg|jpg|gif|png)$/) ? this.state.draftData.img : "https://i.imgur.com/Km3Ctkb.gif" }}
              style={{flex: 1, backgroundColor: chroma("black")}} resizeMode="cover" imageStyle={{opacity: .5}}
            >
              {
                this.state.draftData.code ?
                  <ImageBackground source={bossFightGif} resizeMode="cover"
                    style={{flex: 1, width: width, backgroundColor: chroma("black"), justifyContent: "center", alignItems: "center"}}>
                      <Text style={[styles.text,{color: "white", fontSize: 100}]}>{this.state.draftData.code}</Text>
                  </ImageBackground>
                :
                <>
                  <ScrollView style={{flex:1, width: width}}>
                    <KeyboardAvoidingView
                      contentContainerStyle={{ flex: 1, width: width, justifyContent:"center", alignItems:"center" }}
                      style={{ flex: 1, width: width, alignItems:"center" }}
                      behavior={Platform.OS == 'ios' ? 'padding' : 'height'} 
                    >
                      <Input placeholder={`${this.state.user.userName}'s Draft`} label="Draft Name"
                        inputContainerStyle={{borderWidth: 1, borderRadius: 20, borderColor: chroma('white'), paddingLeft: 8, paddingRight: 8}}
                        style={{ fontFamily: "Edo", fontWeight: 'normal', fontSize: 35, color: "white", textAlign: "center"}}
                        labelStyle={styles.label}
                        value={this.state.draftData.name}
                        selectionColor={chroma('white')}
                        onChangeText={(text) => {
                          var draftData = this.state.draftData;
                          draftData.name = text;

                          this.setState({draftData})
                        }}
                      />

                      <Input placeholder="Paste Url" label="Draft Img Url (.Jpeg/.Jpg/.Gif/.Png Only)"
                        inputContainerStyle={{borderWidth: 1, borderRadius: 20, borderColor: chroma('white'), paddingLeft: 8, paddingRight: 8}}
                        style={{ fontSize: 35, color: "white", textAlign:"center"}}
                        labelStyle={styles.label}
                        selectionColor={chroma('white')}
                        value={this.state.draftData.img}
                        onChangeText={(text) => {
                          var draftData = this.state.draftData;
                          draftData.img = text;

                          this.setState({draftData})
                        }}
                        leftIcon={
                          <Icon
                            name='image'
                            size={24}
                            color='white'
                          />
                        }
                      />
                    
                      {/* <Switch value={this.state.hasPass} onValueChange={() => this.setState({ hasPass: !this.state.hasPass })} /> */}
                      {
                        this.state.hasPass ?
                          <Input maxLength={6} placeholder="A1B2C3" label="Draft Password (6 character max)" autoCapitalize="characters"
                            containerStyle={{width: width * .65}}
                            inputContainerStyle={{borderWidth: 1, borderRadius: 20, borderColor: chroma('white'), paddingLeft: 8, paddingRight: 8}}
                            style={{fontFamily: "Edo", fontWeight: 'normal', fontSize: 35, color: "white", textAlign: "center"}}
                            labelStyle={styles.label}
                            selectionColor={chroma('white')}
                            value={this.state.draftData.pass}
                            onChangeText={(pass) => {
                              if(pass.match(/^[a-zA-Z0-9]*$/i)){
                                var draftData = this.state.draftData;
                                draftData.pass = pass;
    
                                this.setState({ draftData })
                              }
                            }}
                            leftIcon={
                              <Icon
                                name='key'
                                size={24}
                                color='white'
                              />
                            }
                          />
                        : <></>
                      }

                      <Text style={[styles.label]}>
                        Season Length - {this.state.draftData.season.length} Months
                      </Text>
                      <View style={{ width: width *.6, height: 50, alignItems: 'stretch', justifyContent: 'center' }}>
                        <Slider
                          animateTransitions={true}
                          minimumValue={1}
                          maximumValue={6}
                          step={1}
                          minimumTrackTintColor={chroma('red').hex()}
                          maximumTrackTintColor="#FFFFFF"
                          thumbStyle={{ height: 40, width: 40, overflow: "hidden",borderRadius: 20, borderColor:"red", borderWidth: 2, backgroundColor: 'transparent' }}
                          thumbProps={{
                            children: (
                              <Animated.Image
                                source={{uri: this.state.draftData.img.match(/\.(jpeg|jpg|gif|png)$/) ? this.state.draftData.img : "https://i.imgur.com/Km3Ctkb.gif"}}
                                style={{height: 40, width: 40}}
                              />
                            ),
                          }}
                          value={this.state.draftData.season.length}
                          onValueChange={(length) =>{
                            var draftData = this.state.draftData;
                            draftData.season = Object.assign(draftData.season, {length})

                            this.setState({ draftData })
                          }}
                        />
                      </View>

                      <View style={{height:'auto', marginTop: 10}}>
                        <Text style={[styles.label]}>
                          Daily Poll Times
                        </Text>
                        <View style={{width: width, height: 'auto', flexDirection:"row", justifyContent: "center", alignItems:"center"}}>
                          {/* Daily Poll Start */}
                          <View style={{flex: 1, justifyContent: "center", alignItems:"center"}}>
                            <Text style={[styles.label]}>
                              {this.state.draftData.dailyPoll.open.toLocaleTimeString([], {timeStyle: 'short'})}
                            </Text>
                            <Button mode={"contained"} color={chroma('aqua').hex()}
                              labelStyle={{fontSize: 20, fontFamily: "Edo"}}
                              style={{ width: '65%' }} 
                              onPress={() => {
                                this.setState({showDailyOpen: true}, () => this.setState({showDailyOpen: false}))
                              }}>Open</Button>
                            
                            {this.state.showDailyOpen ?
                              <DateTimePicker
                                testID="dailyOpenTime"
                                value={this.state.draftData.dailyPoll.open}
                                mode="time"
                                is24Hour={false}
                                onChange={(event, open) => {
                                  this.setState({showWeeklyOpen:false}, () => {
                                  if(!open){
                                      return
                                    }

                                    var draftData = this.state.draftData;
                                    draftData.dailyPoll = Object.assign(this.state.draftData.dailyPoll, {open});

                                    this.setState({draftData})
                                  })
                                }}
                                minuteInterval={30}
                              />
                            : <></>}
                          </View>

                          {/* Daily Poll Close */}
                          <View style={{flex: 1, justifyContent: "center", alignItems:"center"}}>
                            <Text style={[styles.label]}>
                              {this.state.draftData.dailyPoll.close.toLocaleTimeString([], {timeStyle: 'short'})}
                            </Text>
                            <Button mode={"contained"} color={chroma('aqua').hex()}
                              labelStyle={{fontSize: 20, fontFamily: "Edo"}}
                              style={{ width: '65%' }} 
                              onPress={() => this.setState({showDailyClose: true}, () => this.setState({showDailyClose: Platform.OS === 'ios'}))}>Close</Button>
                            
                            {this.state.showDailyClose && (
                              <DateTimePicker
                                testID="dailyCloseTime"
                                value={this.state.draftData.dailyPoll.close}
                                mode={"time"}
                                is24Hour={false}
                                onChange={(event, close) => {
                                  this.setState({showDailyClose:false}, () => {
                                    if(!close){
                                      return
                                    }

                                    var draftData = this.state.draftData;
                                    draftData.dailyPoll = Object.assign(this.state.draftData.dailyPoll, {close});

                                    this.setState({draftData})
                                  })
                                }}
                                minuteInterval={30}
                              />
                            )}
                          </View>
                        </View>
                      </View>

                      <Text style={[styles.label]}>
                        {this.state.draftData.dailyPoll.charCount} Daily Characters 
                      </Text>
                      <View style={{ width: width *.6, height: 50, alignItems: 'stretch', justifyContent: 'center' }}>
                        <Slider
                          animateTransitions={true}
                          minimumValue={3}
                          maximumValue={10}
                          step={1}
                          minimumTrackTintColor={chroma('red').hex()}
                          maximumTrackTintColor="#FFFFFF"
                          thumbStyle={{ height: 40, width: 40, overflow: "hidden",borderRadius: 20, borderColor:"red", borderWidth: 2, backgroundColor: 'transparent' }}
                          thumbProps={{
                            children: (
                              <Animated.Image
                                source={{uri: this.state.draftData.img.match(/\.(jpeg|jpg|gif|png)$/) ? this.state.draftData.img : "https://i.imgur.com/Km3Ctkb.gif"}}
                                style={{height: 40, width: 40}}
                              />
                            ),
                          }}
                          value={this.state.draftData.dailyPoll.charCount}
                          onValueChange={(charCount) =>{
                            var draftData = this.state.draftData;
                            draftData.dailyPoll.charCount = charCount

                            this.setState({ draftData })
                          }}
                        />
                      </View>

                      <View style={{height:'auto', marginTop: 10}}>
                        <Text style={[styles.label]}>
                          Weekly Poll Times
                        </Text>
                        <View style={{width: width, height: 'auto', flexDirection:"row"}}>

                          {/* Weekly Poll Start */}
                          <View style={{flex: 1, justifyContent: "center", alignItems:"center"}}>
                            <Text style={[styles.label]}>
                              {this.state.draftData.weeklyPoll.open.toLocaleTimeString([], {timeStyle: 'short'})}
                            </Text>
                            <Button mode={"contained"} color={chroma('aqua').hex()}
                              labelStyle={{fontSize: 20, fontFamily: "Edo"}}
                              style={{ width: '65%' }} 
                              onPress={() => this.setState({showWeeklyOpen: true}, () => this.setState({showWeeklyOpen: Platform.OS === 'ios'}))}>Open</Button>

                            {this.state.showWeeklyOpen && (
                              <DateTimePicker
                                testID="weeklyOpenTime"
                                value={this.state.draftData.weeklyPoll.open}
                                mode={"time"}
                                is24Hour={false}
                                onChange={(event, open) => {
                                  this.setState({showWeeklyOpen:false}, () => {
                                    if(!open){
                                      return
                                    }

                                    var draftData = this.state.draftData;
                                    draftData.weeklyPoll = Object.assign(this.state.draftData.weeklyPoll, {open});

                                    this.setState({draftData})
                                  })
                                }}
                                minuteInterval={30}
                              />
                            )}
                          </View>

                          {/* Weekly Poll Close */}
                          <View style={{flex: 1, justifyContent: "center", alignItems:"center"}}>
                            <Text style={[styles.label]}>
                              {this.state.draftData.weeklyPoll.close.toLocaleTimeString([], {timeStyle: 'short'})}
                            </Text>
                            <Button mode={"contained"} color={chroma('aqua').hex()}
                              labelStyle={{fontSize: 20, fontFamily: "Edo"}}
                              style={{ width: '65%' }} 
                              onPress={() => this.setState({showWeeklyClose: true}, () => this.setState({showWeeklyClose: Platform.OS === 'ios'}))}>Close</Button>
                            
                            {this.state.showWeeklyClose && (
                              <DateTimePicker
                                testID="weeklyCloseTime"
                                value={this.state.draftData.weeklyPoll.close}
                                mode={"time"}
                                is24Hour={false}
                                onChange={(event, close) => {
                                  this.setState({showWeeklyClose:false}, () => {
                                    if(!close){
                                      return
                                    }
                                    
                                    var draftData = this.state.draftData;
                                    draftData.weeklyPoll = Object.assign(this.state.draftData.weeklyPoll, {close});

                                    this.setState({draftData})
                                  })
                                }}
                                minuteInterval={30}
                              />
                            )}
                          </View>
                        </View>
                      </View>

                      <View style={{height:'auto', marginTop: 20}}>
                        <Text style={[styles.label]}>
                          {this.state.draftData.defaultPoints} Starting Points
                        </Text>
                        
                        <View style={{ width: width *.6, height: 50, alignItems: 'stretch', justifyContent: 'center' }}>
                          <Slider
                            animateTransitions={true}
                            minimumValue={5}
                            maximumValue={100}
                            step={5}
                            minimumTrackTintColor={chroma('red').hex()}
                            maximumTrackTintColor="#FFFFFF"
                            thumbStyle={{ height: 40, width: 40, overflow: "hidden",borderRadius: 20, borderColor:"red", borderWidth: 2, backgroundColor: 'transparent' }}
                            thumbProps={{
                              children: (
                                <Animated.Image
                                  source={{uri: this.state.draftData.img.match(/\.(jpeg|jpg|gif|png)$/) ? this.state.draftData.img : "https://i.imgur.com/Km3Ctkb.gif"}}
                                  style={{height: 40, width: 40}}
                                />
                              ),
                            }}
                            value={this.state.draftData.defaultPoints}
                            onValueChange={(defaultPoints) =>{
                              var draftData = Object.assign(this.state.draftData, {defaultPoints})
                              this.setState({draftData})
                            }}
                          />
                        </View>
                      </View>
                    
                    </KeyboardAvoidingView>
                  </ScrollView>
              
                  <Button mode={"contained"} color={chroma('aqua').hex()}
                  labelStyle={{fontSize: 20, fontFamily: "Edo"}}
                  disabled={!this.state.draftData.name || !(this.state.draftData.img.match(/\.(jpeg|jpg|gif|png)$/) != null)}
                  onPress={() => this.createNewDraft()}
                >
                  Create New Draft
                </Button>
                </>
              }
            </ImageBackground>
          </View>
        </Swiper>
      </View>
    );
  }
}

FindDraft.navigationOptions = {
  header: null,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  updtImgCon: {
    flex: 1,
    width: width,
    alignItems:"center",
    justifyContent:"center",
  },
  profileImg:{
    // height: width/2,
    // width: width/2,
    borderRadius: 20,
    // marginTop: 5,
    // marginBottom: 5,
    // position: 'absolute',
    //resizeMode: "cover",
    // overflow: "hidden",
    shadowColor: '#000',
    shadowOpacity: 1,
    // elevation: 1,
    // zIndex: 1,
  },
  buttonRowView: {
    height: 75,
    width: width,
    flexDirection: "row",
  },
  buttonItem:{
    flex: 1,
    padding: 8,
    alignSelf:"center",
    justifyContent: "center",
    shadowColor: '#000',
    shadowOpacity: 1,
    elevation: 2,
  },
  nameView:{
    height: "auto",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,.75)",
  },
  nameText:{
    color:"white"
  },
	textField: {
    height: 50,
    width: width * .95,
    fontFamily: "Edo",
    textAlign: "center",
		backgroundColor: "white"
	},
  text:{
    fontFamily: "Edo",
    fontSize: 30,
    textAlign: "center"
  },
  label:{
    fontSize: 15,
    fontFamily: "Edo",
    fontWeight: 'normal',
    color: "white",
    textAlign: "center"
  },
  detailsView:{
    flex: 1,
  },
  statsView:{
    flex: 1,
    width: width,
    alignItems: "center",
    justifyContent: "center",
    position: "relative"
  },
  statsRow: {
    width: width,
    backgroundColor: chroma('black').alpha(.3),
    position: "absolute",
    bottom: 0,
  },
	statText:{
    fontSize: 65,
    fontFamily: "TarrgetLaser",
    textAlign: "center",
    color: "white",
    textShadowColor: chroma('aqua').brighten().hex(),
    textShadowOffset: {width: -1, height: 1},
    textShadowRadius: 10,
	},
  imgUpdtFab: {
    position: 'absolute',
    left: 0,
    top: '10%',
    backgroundColor: chroma('aqua').hex()
  },
  fab: {
    position: 'absolute',
    right: 0,
    top: '10%',
    backgroundColor: chroma('aqua').hex()
  },
  cancelFab: {
    position: 'absolute',
    zIndex: 2,
    left: 5,
    bottom: 5,
    backgroundColor: chroma('red').hex()
  },
  submitFab: {
    position: 'absolute',
    zIndex: 2,
    right: 5,
    bottom: 5,
    backgroundColor: chroma('#80ff80').hex()
  },
});

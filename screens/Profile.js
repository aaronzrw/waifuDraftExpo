import React, { Component, PureComponent, createRef, forwardRef } from 'react';
import { Input, Slider, BottomSheet as BS2 } from 'react-native-elements';
import { Platform, StatusBar, StyleSheet, View, TouchableOpacity, Image, ImageBackground, Dimensions, FlatList } from 'react-native';
import { Text, Portal, FAB, TouchableRipple, Card, Button, Modal, TextInput } from 'react-native-paper';
import { Modalize } from 'react-native-modalize';

import Animated from 'react-native-reanimated'
const AnimatedView = Animated.View

import BottomSheet from 'reanimated-bottom-sheet';

import { FlatGrid } from 'react-native-super-grid';

import _ from 'lodash'
import ls from 'lz-string';
import Swiper from 'react-native-swiper'

import UserProfileImg from '../components/UserProfileImg'
import SwipeIndicator from '../components/SwipeIndicator'
import UserSettingsBottomSheet from '../components/UserSettingsBottomSheet'

//Firebase
import firebase, { firestore } from 'firebase/app'
import 'firebase/auth'

//Media
import Icon from 'react-native-vector-icons/FontAwesome';
import { MaterialIcons } from '@expo/vector-icons';

import defIcon from '../assets/images/defIcon.png'
import atkIcon from '../assets/images/atkIcon.png'
import ChestOpen from '../assets/images/ChestOpen.gif'
import ChestShake from '../assets/images/ChestShake.gif'

import cancelIcon from '../assets/images/CancelIcon.png'
import backIcon from '../assets/images/BackIcon.png'

import animeIcon from '../assets/images/AMLogo.png'
import marvelIcon from '../assets/images/MarvelLogo.png'
import dcIcon from '../assets/images/DCLogo.png'
import bossFightGif from '../assets/images/Boss-Fight.gif'

//Redux
import store from '../redux/store';
import watch from 'redux-watch';
import { getSearchData, switchDraft } from '../redux/actions/dataActions';

import {
  LOADING_UI,
  STOP_LOADING_UI,
	SET_USER_CREDENTIALS,
	SET_SNACKBAR
} from '../redux/types';

import { logoutUser } from '../redux/actions/userActions'

//Component
import WaifuCard from '../components/WaifuCard'
import { user } from 'firebase-functions/lib/providers/auth';

const chroma = require('chroma-js')
const { width, height } = Dimensions.get('window');

const modalizeRef = React.createRef(null);
const ssRef = React.createRef();
const bs = React.createRef();

export default class Profile extends Component {
  constructor(props) {
    super();

    this.mounted = true;
    this.emailVal = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    var trades = _.cloneDeep(store.getState().data.trades);
    trades = trades.filter(x => x.from.husbandoId == store.getState().user.creds.userId ||
      x.to.husbandoId == store.getState().user.creds.userId)

    this.fall = new Animated.Value(1);
    this.animated = React.createRef(new Animated.Value(0)).current;

    this.state = {
      navigation: props.navigation,
      goBackFunc: props.route.params.goBackFunc,
      draftSettings: store.getState().draft,
			loading: store.getState().data.loading,
      waifuList: store.getState().data.waifuList,
      userInfo: store.getState().user.creds,
      waifus: _.cloneDeep(store.getState().user.waifus),
      users: [{...store.getState().user.creds, waifus: store.getState().user.waifus }].concat(store.getState().user.otherUsers),
      showUpdateUserName: false,
      showEmailUpdate: false,
      showPasswordUpdate: false,
      trades: trades,
      reAuthSuc: false,
      newUserName: null,
      newEmail: null,
      currPass: null,
      pin: null,
      newPass: null,
      newConfPass: null,
      chestOpen: false,
      waifuType: "All",
      dailyBonusRedeemed: true,
      showSwitchDraft: false,
      size: {width,height},
      settingsIndex: 0,
      otherDrafts: [],
      handle: false,
    };

    this.selectWaifu = this.selectWaifu.bind(this)
    this.selectTrade = this.selectTrade.bind(this)
    this.closeUserModal = this.closeUserModal.bind(this)
    
    this.reAuthUser = this.reAuthUser.bind(this)
    this.updateEmail = this.updateEmail.bind(this)
    this.updateUserName = this.updateUserName.bind(this)
    this.updatePassword = this.updatePassword.bind(this)

    this.setSubscribes = this.setSubscribes.bind(this)
    this.unSetSubscribes = this.unSetSubscribes.bind(this)
    this.checkDailyBonus = this.checkDailyBonus.bind(this)
    
    this.changeFabState = this.changeFabState.bind(this)
    this.openUserFavoritesScreen = this.openUserFavoritesScreen.bind(this)
  }
  
  //#region functions
  async setSubscribes(){
    this.state.goBackFunc(this.state.navigation, false)

    let dataReducerWatch = watch(store.getState, 'data')
    let userReducerWatch = watch(store.getState, 'user')

    this.dataUnsubscribe = store.subscribe(dataReducerWatch((newVal, oldVal, objectPath) => {
      var trades = _.cloneDeep(newVal.trades);
      trades = trades.filter(x => x.from.husbandoId == this.state.userInfo.userId || x.to.husbandoId == this.state.userInfo.userId)

      var userInfo = this.state.userInfo;

      var selectedWaifu = null;
      if(this.state.selectedWaifu != null){
        selectedWaifu = newVal.waifuList.filter(x => x.waifuId == this.state.selectedWaifu.waifuId)[0]
      }

			this.setState({ userInfo, selectedWaifu, trades, waifuList: newVal.waifuList })
    }))

    this.userUnsubscribe = store.subscribe(userReducerWatch(async (newVal, oldVal, objectPath) => {
      var selectedWaifu = null;
      var users = [{...newVal.creds, waifus: newVal.waifus }].concat(newVal.otherUsers);
      if(this.state.selectedWaifu != null){
        selectedWaifu = newVal.waifus.filter(x => x.waifuId == this.state.selectedWaifu.waifuId)[0]
      }

      var drafts = []    
      var currentDraftId = newVal.creds.currentDraftId;
      await firebase.firestore().collectionGroup('users').where("id", '==', this.state.userInfo.userId).get()
      .then(async function (querySnapshot) {
        var draftIds = querySnapshot.docs.map(doc => doc.ref.parent.parent.id)
  
        drafts = (await firebase.firestore().collection(`drafts`)
        .where(firestore.FieldPath.documentId(), "in", draftIds)
        .get()).docs.filter(x => x.id != currentDraftId).map(x => {
          return {
            id: x.id,
            name: x.data().settings.name,
            img: x.data().settings.img,
            code: x.data().settings.code,
            pass: x.data().settings.pass
          }
        })      
      });
      this.setState({userInfo: newVal.creds, waifus: newVal.waifus, otherDrafts: drafts, selectedWaifu, users, dailyBonusRedeemed: newVal.creds.dailyBonusRedeemed })
    }))
    
    var trades = _.cloneDeep(store.getState().data.trades);
    trades = trades.filter(x => x.from.husbandoId == this.state.userInfo.userId || x.to.husbandoId == this.state.userInfo.userId)
    var users = [{...store.getState().user.creds, waifus: store.getState().user.waifus }].concat(store.getState().user.otherUsers);

    var drafts = []    
    var currentDraftId = this.state.userInfo.currentDraftId;
    await firebase.firestore().collectionGroup('users').where("id", '==', this.state.userInfo.userId).get()
    .then(async function (querySnapshot) {
      var draftIds = querySnapshot.docs.map(doc => doc.ref.parent.parent.id)

      drafts = (await firebase.firestore().collection(`drafts`)
      .where(firestore.FieldPath.documentId(), "in", draftIds)
      .get()).docs.filter(x => x.id != currentDraftId).map(x => {
        return {
          id: x.id,
          name: x.data().settings.name,
          img: x.data().settings.img,
          code: x.data().settings.code,
          pass: x.data().settings.pass
        }
      })      
    });

    this.setState({
      otherDrafts: drafts,
      users,
      trades,
      userInfo: store.getState().user.creds,
      waifus: store.getState().user.waifus,
      waifuList: store.getState().data.waifuList,
      dailyBonusRedeemed: store.getState().user.creds.dailyBonusRedeemed
    })
  }

  unSetSubscribes(){
    if(this.dataUnsubscribe != null)
      this.dataUnsubscribe()
    
    if(this.userUnsubscribe != null)
      this.userUnsubscribe()
  }

  async componentDidMount(){
    this._navFocusUnsubscribe = this.state.navigation.addListener('focus', () => this.setSubscribes());
    this._navBlurUnsubscribe = this.state.navigation.addListener('blur', () => this.unSetSubscribes());
  }

  componentWillUnmount(){
    this._navFocusUnsubscribe();
    this._navBlurUnsubscribe();
    this.mounted = false;
  }
  
  selectTrade(trade){
    this.state.navigation.navigate("ViewTrade", {trade})
  }

  selectWaifu(waifu){
    this.state.navigation.navigate("CharDetails", {waifu})
  }

  async updateEmail(){
    var user = firebase.auth().currentUser;
    var userInfo = this.state.userInfo;
    var newEmail = this.state.newEmail;

    await user.updateEmail(newEmail)
    .then(function() {
      return firebase.firestore().doc(`users/${userInfo.userId}`).update({email: newEmail})
    })
    .then(() => {
      store.dispatch({
        type: SET_SNACKBAR,
        payload: {type: "success", message: `Email Updated`}
      });
    })
    .catch(function(error) {
      store.dispatch({
        type: SET_SNACKBAR,
        payload: {type: "error", message: `Error Updating Email`}
      });
    });

    this.closeUserModal()
  }

  async updatePassword(){
    var user = firebase.auth().currentUser;
    await user.updatePassword(this.state.newPass)
    .then(function() {
      store.dispatch({
        type: SET_SNACKBAR,
        payload: {type: "success", message: `Password Updated`}
      });
    }).catch(function(error) {
      store.dispatch({
        type: SET_SNACKBAR,
        payload: {type: "error", message: `Error Updating Password`}
      });
    });

    this.closeUserModal()
  }

  async updateUserName(){
    await firebase.firestore().doc(`${this.state.draftSettings.path}/users/${this.state.userInfo.userId}`).update({userName: this.state.newUserName})
    .then(() => {
      store.dispatch({
        type: SET_SNACKBAR,
        payload: {type: "success", message: `Username Updated`}
      });
    })
    .catch((err) => {
      store.dispatch({
        type: SET_SNACKBAR,
        payload: {type: "error", message: `Error Updating Username`}
      });
    })

    this.closeUserModal()
  }

  closeUserModal(){
    this.setState({
      newUserName: null,
      newEmail: null,
      currPass: null,
      newPass: null,
      newConfPass: null,
      showUpdateUserName: false,
      showEmailUpdate: false,
      showPasswordUpdate: false,
      reAuthSuc: false
    })
  }

  async reAuthUser(){
    var user = firebase.auth().currentUser;
    var credential = firebase.auth.EmailAuthProvider.credential(
      user.email, // references the user's email address
      this.state.currPass
    );

    // Prompt the user to re-provide their sign-in creds
    var result = await user.reauthenticateWithCredential(credential).then(function() {
      // User re-authenticated
      console.log("Reatuh successful")
      return true;
    }).catch(function(error) {
      // An error happened.
      store.dispatch({
        type: SET_SNACKBAR,
        payload: {type: "error", message: `Password Invalid`}
      });
      return false;
    });

    this.setState({ reAuthSuc: result });
  }

  openUserFavoritesScreen(){
    var userId = this.state.userInfo.userId
    this.state.navigation.navigate("UserWaifuFavorites", {userId})
  }
  
  async checkDailyBonus(){
    var user = this.state.userInfo;

    if(this.state.dailyBonusRedeemed){
      store.dispatch({
        type: SET_SNACKBAR,
        payload: {type: "warning", message: `You've Already Claimed Todays Bonus`}
      });
    }
    else if(!this.state.chestOpen){
      this.setState({chestOpen: true})

      await firebase.firestore().doc(`${this.state.draftSettings.path}/users/${user.userId}`).get()
      .then(doc => {
        var draft = store.getState().draft;
        var points = doc.data().points;

        var streak = this.state.userInfo.streak || 0;

        return doc.ref.update({points: points + draft.defaultPoints, dailyBonusRedeemed: true, streak: streak + 1})
      })
      
      setTimeout(function(){
        store.dispatch({
          type: SET_SNACKBAR,
          payload: {type: "info", message: `Daily Bonus Collected!`}
        });
        this.setState({chestOpen: false})
      }.bind(this), 1000)
    }
  }

  changeSettingsFabState(){
    var fabState = this.state.settingsFabOpen;
    this.setState({settingsFabOpen: !fabState})
  }
  
  changeFabState(){
    var fabState = this.state.fabOpen;
    this.setState({fabOpen: !fabState})
  }

  //#endregion

  render(){
    //#region default values
    var waifus = _.cloneDeep(this.state.waifuList).filter(x => this.state.waifus.includes(x.waifuId));

    switch(this.state.waifuType){
      case "Anime-Manga":
        waifus = waifus.filter(x => x.type == "Anime-Manga")
        break;
      case "Marvel":
        waifus = waifus.filter(x => x.type == "Marvel")
        break;
      case "DC":
        waifus = waifus.filter(x => x.type == "DC")
        break;
    }

    var waifuGroups = _.chain(waifus)
    .orderBy((o) => (o.attack + o.defense), ['desc'])
    .groupBy(waifu => Number(waifu.rank))
    .map((waifus, rank) => ({ rank: Number(rank), waifus }))
    .orderBy(group => Number(group.rank), ['desc'])
    .value()

    waifus = waifuGroups.flatMap(x => x.waifus)

    var trades = _.orderBy(_.cloneDeep(this.state.trades), ['createdDate'], ['desc'])

    var activeTrades = _.cloneDeep(trades.filter(x => x.status == "Active"))
    var completedTrades = _.cloneDeep(trades.filter(x => x.status != "Active"))

    trades = activeTrades.concat(completedTrades);
    //#endregion

    return (
      <>
        {this.state.loading ?
          <></> 
        :
          <>
            <SwipeIndicator horiSwipe={true} tintColor={"black"}/>
            <Swiper
              index={0}
              showsPagination={false}
            >
              <View style={[styles.container, {backgroundColor: "white", justifyContent:"flex-start"}]}>
                <UserSettingsBottomSheet drafts={this.state.otherDrafts}/>

                <UserProfileImg user={this.state.userInfo} img={this.state.userInfo.img}/>

                <View style={[styles.userInfoView]}>
                  <View style={[styles.userInfo]}>
                    <TouchableOpacity activeOpacity={.25} onPress={() => this.setState({ showUpdateUserName: true })}  style={{height: 'auto', flexDirection:"row", justifyContent:"center", alignItems:"center"}}>
                      <Text style={[styles.text]}>{this.state.userInfo.userName}</Text>
                      <MaterialIcons name="edit" size={24} color="black" />
                    </TouchableOpacity>
                    
                    <TouchableOpacity activeOpacity={.25} onPress={() => this.setState({ showEmailUpdate: true })} style={{height: 'auto', flexDirection:"row", justifyContent:"center", alignItems:"center"}}>
                      <Text style={[styles.text, {fontSize: 20}]}>{this.state.userInfo.email}</Text>
                      <MaterialIcons name="edit" size={24} color="black"/>
                    </TouchableOpacity>
                    
                    <TouchableOpacity activeOpacity={.25} onPress={() => this.setState({ showPasswordUpdate: true })} style={{height: 'auto', flexDirection:"row", justifyContent:"center", alignItems:"center"}}>
                      <Text style={[styles.text]}>Password</Text>
                      <MaterialIcons name="edit" size={24} color="black"/>
                    </TouchableOpacity>
                  </View>
                  
                  <View style={[styles.userStatsView]}>
                    <Text style={[styles.text]}>Points - {this.state.userInfo.points}</Text>
                    <Text style={[styles.text]}>Rank Coins - {this.state.userInfo.rankCoins}</Text>
                    <Text style={[styles.text]}>Stat Coins - {this.state.userInfo.statCoins}</Text>
                    {/* <Text style={[styles.text]}>Submit Slots - {this.state.userInfo.submitSlots}</Text> */}
                  </View>
                </View>

                {!this.state.dailyBonusRedeemed && !this.state.chestOpen ?
                  <View style={{height: 150, width: width, alignItems:"center", justifyContent:"center"}}>
                    <TouchableOpacity activeOpacity={.5} onPress={() => this.checkDailyBonus()}
                      style={{height: 'auto', width: 'auto', alignItems:"center", justifyContent:"center"}}>
                      <Image source={this.state.chestOpen ? ChestOpen : ChestShake} style={{height: 125, width:125}} />
                    </TouchableOpacity>
                  </View>
                :<></>}

                {
                  this.state.chestOpen ?
                    <View style={{height: 150, width: width, alignItems:"center", justifyContent:"center"}}>
                      <TouchableOpacity style={{height: 'auto', width: 'auto'}}>
                        <Image source={this.state.chestOpen ? ChestOpen : ChestShake} style={{height: 125, width:125}} />
                      </TouchableOpacity>
                    </View>
                  :<></>
                }
              </View>

              <View style={styles.waifuListView}>
                <View style={{width: width, height: 50, backgroundColor: chroma('white')}}>
                  <Text style={styles.text}>TRADES</Text>
                </View>
                <FlatGrid
                  itemDimension={200}
                  items={_.cloneDeep(this.state.trades.filter(x => x.status == "Active")).concat(_.cloneDeep(this.state.trades.filter(x => x.status != "Active")))}
                  style={styles.gridView}
                  // staticDimension={300}
                  // fixed
                  spacing={20}
                  renderItem={({item, index}) => {
                    const users = this.state.users;
                    const fromUser = users.filter(x => x.userId == item.from.husbandoId)[0];
                    const toUser = users.filter(x => x.userId == item.to.husbandoId)[0];

                    return(
                      <TouchableOpacity activeOpacity={.25}
                        onPress={() => this.selectTrade(item)} 
                        style={[styles.itemContainer, {backgroundColor: index % 2 ? chroma('white').alpha(.75) : chroma('black').alpha(.75)}]}
                      >
                        {
                          item.status != "Active" ?
                          <View style={{...StyleSheet.absoluteFillObject, zIndex: 20, elevation: 15, justifyContent:"center", alignItems:"center"}}>
                            <Text style={[styles.text, 
                            {
                              fontSize:50, 
                              color: item.status == "Accepted" ? chroma("green").brighten() :
                                chroma('red').brighten()
                            }]}>{item.status}</Text>
                          </View>
                          : <></>
                        }

                        <View style={{flexDirection:"row", backgroundColor: chroma('white')}}>
                          <View style={{flex: 1}}>
                            <Text style={[styles.text]}>From</Text>
                          </View>
                          <View style={{flex: 1}}>
                            <Text style={[styles.text]}>To</Text>
                          </View>
                        </View>
                        
                        <View style={{flex: 1, flexDirection:"row"}}>
                          <View style={{flex: 1, justifyContent: "center", alignItems:"center"}}>
                            <View style={[styles.tradeUserImg]}>
                              <Image source={{uri: fromUser.img}} style={[styles.tradeUserImg]} />
                            </View>
                          </View>
                          
                          <View style={{flex: 1, justifyContent: "center", alignItems:"center"}}>
                            <View style={[styles.tradeUserImg]}>
                              <Image source={{uri: toUser.img}} style={[styles.tradeUserImg]} />
                            </View>
                          </View>
                        </View>
                        
                        <View style={{flexDirection:"row", backgroundColor: chroma('white')}}>
                            <View style={{flex: 1}}>
                              <Text style={[styles.text, {fontSize: 20}]}>
                                {item.createdDate.toDateString()}
                              </Text>
                            </View>
                          </View>
                      </TouchableOpacity>
                    )
                  }}
                />
              </View>
            
              <View style={styles.waifuListView}>
                <View style={{width: width, height: 50, backgroundColor: chroma('white')}}>
                <Text style={styles.text}>WAIFUS - {waifus.length}</Text>
                </View>
                <FlatGrid
                  itemDimension={150}
                  items={waifus}
                  style={styles.gridView}
                  // staticDimension={300}
                  // fixed
                  spacing={20}
                  renderItem={({item, index}) => {
                    return(
                      <WaifuCard waifu={item} selectWaifu={() => this.selectWaifu(item)}/>
                    )
                  }}
                />

                <FAB.Group
                  fabStyle={{backgroundColor: chroma('aqua').hex()}}
                  open={this.state.fabOpen}
                  icon={'settings'}
                  actions={[
                    { icon: 'heart-box',
                      label: 'Show Favorited Waifus',
                      onPress: () => this.openUserFavoritesScreen()
                    },
                    { icon: 'account-multiple-outline',
                      label: 'Show All Waifus',
                      onPress: () => this.setState({waifuType: "All", fabOpen: false})
                    },
                    {
                      icon: ({ size, color }) =>
                        (
                          <Image
                            source={animeIcon}
                            style={{ width: size, height: size}}
                          />
                        ),
                      // icon: {marvelIcon},
                      label: 'Show Anime Waifus',
                      onPress: () => this.setState({waifuType: "Anime-Manga", fabOpen: false})
                    },
                    {
                      icon: ({ size, color }) =>
                        (
                          <Image
                            source={marvelIcon}
                            style={{ width: size , height: size}}
                          />
                        ),
                      label: 'Show Marvel Waifus',
                      onPress: () => this.setState({waifuType: "Marvel", fabOpen: false})
                    },
                    {
                      icon: ({ size, color }) =>
                        (
                          <Image
                            source={dcIcon}
                            style={{ width: size , height: size}}
                          />
                        ),
                      label: 'Show DC Waifus',
                      onPress: () => this.setState({waifuType: "DC", fabOpen: false})
                    },
                  ]}
                  onStateChange={() => this.changeFabState()}
                />
          
              </View>
            </Swiper>
          </>
        }

        {/* Update User Info Modal */}
        <Modal
          animationType="slide"
          visible={this.state.showUpdateUserName == true || this.state.showEmailUpdate == true || this.state.showPasswordUpdate == true }
          onDismiss={this.closeUserModal}
          onRequestClose={this.closeUserModal}
        >
          <TouchableOpacity activeOpacity={.25} onPress={this.closeUserModal}  style={{height: 75, width: 75, position: "absolute", left: 10, top: 10, zIndex: 1,
           justifyContent:"center", alignItems:"center"}}>
            <Image source={backIcon} style={[{ height: 50, width: 50 }]} />
          </TouchableOpacity>

          {
            !this.state.reAuthSuc ?
              <View style={{height: height, width: width, backgroundColor: chroma('white')}}>
                <View style={{flex:1, width:width, marginTop: 22, justifyContent:"center", alignItems:"center"}}>
                  <TextInput
                    label="Enter Current Password"
                    underlineColor= "teal"
                    style={styles.textField}
                    secureTextEntry={true}
                    value={this.state.currPass}
                    mode="Outlined"
                    onChangeText={(text) => this.setState({ currPass: text})}
                  />

                  <Button
                    mode={"contained"} color={chroma('aqua').hex()}
                    labelStyle={{fontSize: 20, fontFamily: "Edo"}}
                    disabled={this.state.currPass == null}
                    onPress={() => this.reAuthUser()}
                  >
                    Submit
                  </Button>
                </View>
              </View>
            : 
              <View style={{height: height, width: width, backgroundColor: chroma('white')}}>
                {
                  this.state.showUpdateUserName ?
                    <View style={{flex:1, width:width, marginTop: 22, justifyContent:"center", alignItems:"center"}}>
                      <TextInput
                        label="New UserName"
                        placeholder={this.state.userInfo.userName}
                        underlineColor= "teal"
                        style={styles.textField}
                        value={this.state.newUserName}
                        mode="Outlined"
                        onChangeText={(text) => this.setState({ newUserName: text})}
                      />

                      <Button
                        mode={"contained"} color={chroma('aqua').hex()}
                        labelStyle={{fontSize: 20, fontFamily: "Edo"}}
                        disabled={this.state.newUserName == null || this.state.newUserName == this.state.userInfo.userName}
                        onPress={this.updateUserName}
                      >
                        Submit
                      </Button>
                    </View>
                  : this.state.showEmailUpdate ?
                    <View style={{flex:1, width:width, marginTop: 22, justifyContent:"center", alignItems:"center"}}>
                      <TextInput
                        label="New Email"
                        placeholder={this.state.userInfo.email}
                        underlineColor= "teal"
                        style={styles.textField}
                        value={this.state.newEmail}
                        mode="Outlined"
                        onChangeText={(text) => this.setState({ newEmail: text})}
                      />

                      <Button
                        mode={"contained"} color={chroma('aqua').hex()}
                        labelStyle={{fontSize: 20, fontFamily: "Edo"}}
                        disabled={this.state.newEmail == null || this.state.newEmail == this.state.userInfo.email || !this.emailVal.test(String(this.state.newEmail).toLowerCase())}
                        onPress={this.updateEmail}
                      >
                        Submit
                      </Button>
                    </View>
                  : this.state.showPasswordUpdate ?
                    <View style={{flex:1, width:width, marginTop: 22, justifyContent:"center", alignItems:"center"}}>
                      <TextInput
                        label="New Password"
                        secureTextEntry={true}
                        underlineColor= "teal"
                        style={styles.textField}
                        value={this.state.newPass}
                        mode="Outlined"
                        onChangeText={(text) => this.setState({ newPass: text})}
                      />
                      
                      <TextInput
                        label="Confirm Password"
                        secureTextEntry={true}
                        underlineColor= "teal"
                        style={styles.textField}
                        value={this.state.newConfPass}
                        mode="Outlined"
                        onChangeText={(text) => this.setState({ newConfPass: text})}
                      />
                      
                      <Button
                        mode={"contained"} color={chroma('aqua').hex()}
                        labelStyle={{fontSize: 20, fontFamily: "Edo"}}
                        disabled={
                          (this.state.newPass == null || this.state.newConfPass == null) ||
                          (this.state.newPass != this.state.newConfPass)
                        }
                        onPress={this.updatePassword}
                      >
                        Submit
                      </Button>
                    </View>
                  : <></>
                }
              </View>
          }
        </Modal>
      </>
    );
  }
}

Profile.navigationOptions = {
  header: null,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    alignItems:"center",
    justifyContent: "center",
    backgroundColor: chroma('white').alpha(.75),
  },
  profileImg:{
    height: width/2.25,
    width: width/2.25,
    marginTop: 5,
    marginBottom: 5,
    borderRadius: width/2,
    resizeMode: "cover",
    overflow: "hidden",
    shadowColor: '#000',
    shadowOpacity: 1,
    elevation: 10,
    alignItems:"center",
    justifyContent:"center",
  },
  tradeUserImg:{
    height: width/3,
    width: width/3,
    marginTop: 5,
    marginBottom: 5,
    borderRadius: width/3,
    resizeMode: "cover",
    overflow: "hidden",
    shadowColor: '#000',
    shadowOpacity: 1,
    elevation: 10,
    alignItems:"center",
    justifyContent:"center",
  },
	textField: {
    backgroundColor: "white",
    width: width * .9
	},
  userInfoView:{
    height: 'auto',
    width: width,
    shadowColor: '#000',
  },
  userInfo: {
    height: 'auto',
    width: width,
    //overflow: "hidden",
    shadowColor: '#000',
    shadowOpacity: 1,
    //elevation: 1,
    backgroundColor: chroma('white').alpha(.85),
    alignItems:"center",
    justifyContent:"center"
  },
  userStatsView:{
    height:'auto',
    width: width,
    padding: 10,
    backgroundColor: chroma('black').alpha(.025),
  },
  text:{
    fontFamily: "Edo",
    fontSize: 35,
    textAlign: "center"
  },
  titleView:{
    flex: 1,
    position: "absolute",
    bottom: 0,
  },
  waifuListView:{
    flex:1,
    width: width,
    backgroundColor: chroma('black').alpha(.75),
  },
  gridView: {
    flex: 1,
  },
  itemContainer: {
    justifyContent: 'flex-end',
    borderRadius: 10,
    // padding: 10,
    height: 250,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 1,
    elevation: 10
  },
  settingsContainer: {
    justifyContent: 'center',
    alignItems: "center",
    borderRadius: 10,
    height: 75,
    borderWidth: 1,
    borderColor: chroma("black").alpha(.05),
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 1,
    elevation: 5
  },
  draftContainer: {
    justifyContent: 'flex-end',
    borderRadius: 10,
    // padding: 10,
    height: 100,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 1,
    elevation: 10
  },
  statView:{
    flex:1, flexDirection: "row",
    backgroundColor: chroma('black').alpha(.45),
    position: "absolute", top: 0, zIndex: 2,
    paddingTop: 10, paddingBottom: 10, paddingLeft: 10
  },
  statRow:{
    flex:1,
    flexDirection: "row",
    alignItems:"center",
    justifyContent: "center"
  },
  statImg: {
    height: 25,
    width: 25,
  },
  statsText:{
    flex:1,
    fontFamily:"Edo",
    fontSize:25,
    marginLeft: 5
  },
  favFab: {
    position: 'absolute',
    zIndex: 10,
    margin: 5,
    right: 0,
    top: 0
  }
})
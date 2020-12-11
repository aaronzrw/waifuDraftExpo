import React, { Component, PureComponent, createRef, forwardRef } from 'react';
<<<<<<< HEAD
<<<<<<< HEAD
import { Platform, StatusBar, StyleSheet, View, TouchableOpacity, Image, ImageBackground, Dimensions, FlatList } from 'react-native';
import { Text, Portal, FAB, TouchableRipple, Card, Button, Modal, TextInput } from 'react-native-paper';
=======
=======
>>>>>>> parent of 167f5e0... add switch draft feature and update boss fight screen.
import { Input, Slider, BottomSheet } from 'react-native-elements';
import { Platform, StatusBar, StyleSheet, View, TouchableOpacity, Image, ImageBackground, Dimensions, FlatList } from 'react-native';
import { Text, Portal, FAB, TouchableRipple, Card, Button, Modal, TextInput } from 'react-native-paper';

>>>>>>> parent of 167f5e0... add switch draft feature and update boss fight screen.
import { FlatGrid } from 'react-native-super-grid';

import _ from 'lodash'
import ls from 'lz-string';
import Swiper from 'react-native-swiper'

import UserProfileImg from '../components/UserProfileImg'
<<<<<<< HEAD
import { MaterialIcons } from '@expo/vector-icons';
=======
import SwipeIndicator from '../components/SwipeIndicator'
<<<<<<< HEAD
>>>>>>> parent of 167f5e0... add switch draft feature and update boss fight screen.
=======
>>>>>>> parent of 167f5e0... add switch draft feature and update boss fight screen.

//Firebase
import firebase, { firestore } from 'firebase/app'
import 'firebase/auth'

//Media
<<<<<<< HEAD
<<<<<<< HEAD
=======
=======
>>>>>>> parent of 167f5e0... add switch draft feature and update boss fight screen.
import { Icon } from 'react-native-elements'
import { MaterialIcons } from '@expo/vector-icons';

>>>>>>> parent of 167f5e0... add switch draft feature and update boss fight screen.
import defIcon from '../assets/images/defIcon.png'
import atkIcon from '../assets/images/atkIcon.png'
import ChestOpen from '../assets/images/ChestOpen.gif'
import ChestShake from '../assets/images/ChestShake.gif'

import animeIcon from '../assets/images/AnimeLogo.png'
import marvelIcon from '../assets/images/MarvelLogo.png'
import dcIcon from '../assets/images/DCLogo.png'

//Redux
import store from '../redux/store';
<<<<<<< HEAD
import watch from 'redux-watch'
=======
import watch from 'redux-watch';
import { getSearchData } from '../redux/actions/dataActions';
<<<<<<< HEAD
>>>>>>> parent of 167f5e0... add switch draft feature and update boss fight screen.
=======
>>>>>>> parent of 167f5e0... add switch draft feature and update boss fight screen.

import {
  LOADING_UI,
  STOP_LOADING_UI,
	SET_USER,
	SET_SNACKBAR
} from '../redux/types';


<<<<<<< HEAD
<<<<<<< HEAD
import { getRankColor } from '../redux/actions/dataActions'
=======
>>>>>>> parent of 167f5e0... add switch draft feature and update boss fight screen.
=======
>>>>>>> parent of 167f5e0... add switch draft feature and update boss fight screen.
import { logoutUser } from '../redux/actions/userActions'

//Component
import RankBackground from '../components/RankBackGround'

const chroma = require('chroma-js')
const { width, height } = Dimensions.get('window');


export default class Profile extends Component {
  constructor(props) {
    super();

    this.mounted = true;
    this.emailVal = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    var trades = _.cloneDeep(store.getState().data.trades);
<<<<<<< HEAD
    trades = trades.filter(x => x.from.husbandoId == store.getState().user.credentials.userId ||
      x.to.husbandoId == store.getState().user.credentials.userId)
      
=======
    trades = trades.filter(x => x.from.husbandoId == store.getState().user.creds.userId ||
      x.to.husbandoId == store.getState().user.creds.userId)

<<<<<<< HEAD
>>>>>>> parent of 167f5e0... add switch draft feature and update boss fight screen.
=======
>>>>>>> parent of 167f5e0... add switch draft feature and update boss fight screen.
    this.state = {
      navigation: props.navigation,
			loading: store.getState().data.loading,
      waifuList: store.getState().data.waifuList,
      userInfo: store.getState().user.credentials,
      waifus: _.cloneDeep(store.getState().user.waifus),
      users: [{...store.getState().user.credentials, waifus: store.getState().user.waifus }].concat(store.getState().user.otherUsers),
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
<<<<<<< HEAD
      size: {width,height}
=======
      dailyBonusRedeemed: true,
      showSwitchDraft: false,
      size: {width,height},
      otherDrafts: []
<<<<<<< HEAD
>>>>>>> parent of 167f5e0... add switch draft feature and update boss fight screen.
=======
>>>>>>> parent of 167f5e0... add switch draft feature and update boss fight screen.
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
    
    this.addNewDaily = this.addNewDaily.bind(this)
    this.addFavoritieSeries = this.addFavoritieSeries.bind(this)
    this.changeFabState = this.changeFabState.bind(this)
    this.openUserFavoritesScreen = this.openUserFavoritesScreen.bind(this)
  }
  
<<<<<<< HEAD
<<<<<<< HEAD
  setSubscribes(){
=======
=======
>>>>>>> parent of 167f5e0... add switch draft feature and update boss fight screen.
  async setSubscribes(){
    this.state.goBackFunc(this.state.navigation, false)

>>>>>>> parent of 167f5e0... add switch draft feature and update boss fight screen.
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

    this.userUnsubscribe = store.subscribe(userReducerWatch((newVal, oldVal, objectPath) => {
      var selectedWaifu = null;
      var users = [{...newVal.credentials, waifus: newVal.waifus }].concat(newVal.otherUsers);
      if(this.state.selectedWaifu != null){
        selectedWaifu = newVal.waifus.filter(x => x.waifuId == this.state.selectedWaifu.waifuId)[0]
      }

<<<<<<< HEAD
<<<<<<< HEAD
      this.setState({userInfo: newVal.credentials, waifus: newVal.waifus, selectedWaifu, users })
=======
      this.setState({userInfo: newVal.creds, waifus: newVal.waifus, selectedWaifu, users, dailyBonusRedeemed: newVal.creds.dailyBonusRedeemed })
>>>>>>> parent of 167f5e0... add switch draft feature and update boss fight screen.
=======
      this.setState({userInfo: newVal.creds, waifus: newVal.waifus, selectedWaifu, users, dailyBonusRedeemed: newVal.creds.dailyBonusRedeemed })
>>>>>>> parent of 167f5e0... add switch draft feature and update boss fight screen.
    }))
    
    var trades = _.cloneDeep(store.getState().data.trades);
    trades = trades.filter(x => x.from.husbandoId == this.state.userInfo.userId || x.to.husbandoId == this.state.userInfo.userId)
<<<<<<< HEAD
    var users = [{...store.getState().user.credentials, waifus: store.getState().user.waifus }].concat(store.getState().user.otherUsers);
=======
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
          name: x.data().settings.name,
          img: x.data().settings.img,
          code: x.data().settings.code,
          pass: x.data().settings.pass
        }
      })      
    });
>>>>>>> parent of 167f5e0... add switch draft feature and update boss fight screen.

    this.setState({
      users,
      trades,
      userInfo: store.getState().user.credentials,
      waifus: store.getState().user.waifus,
      waifuList: store.getState().data.waifuList
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
    await firebase.firestore().doc(`users/${this.state.userInfo.userId}`).update({userName: this.state.newUserName})
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

    // Prompt the user to re-provide their sign-in credentials
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

  async addNewDaily(){
<<<<<<< HEAD
<<<<<<< HEAD
    var compressSearchJson = require('../assets/SearchFile.json');
    var searchJson = JSON.parse(ls.decompress(compressSearchJson));

    var waifuLinks = await firebase.firestore().collection('waifus').get()
=======
    var searchItems = getSearchData();

    var waifuLinks = await firebase.firestore().collection(`${this.state.draftSettings.path}/waifus`).get()
>>>>>>> parent of 167f5e0... add switch draft feature and update boss fight screen.
=======
    var searchItems = getSearchData();

    var waifuLinks = await firebase.firestore().collection(`${this.state.draftSettings.path}/waifus`).get()
>>>>>>> parent of 167f5e0... add switch draft feature and update boss fight screen.
    .then((docs) => {
      var links = []
      docs.forEach(x => {
        links.push(x.data().link)
      })

      return links
    });

<<<<<<< HEAD
<<<<<<< HEAD
    const characters = searchJson.characters;
=======
    const characters = searchItems.characters;
>>>>>>> parent of 167f5e0... add switch draft feature and update boss fight screen.
=======
    const characters = searchItems.characters;
>>>>>>> parent of 167f5e0... add switch draft feature and update boss fight screen.
    characters['Anime-Manga'].items = characters['Anime-Manga'].items.filter(x => !waifuLinks.includes(x.link));
    characters['Marvel'].items = characters['Marvel'].items.filter(x => !waifuLinks.includes(x.link));
    characters['DC'].items = characters['DC'].items.filter(x => !waifuLinks.includes(x.link));

    var newWaifu = null;
    while (newWaifu == null) {
      var newWaifu = this.getRandWaifu(characters);
      if (newWaifu.publisher != null)
        newWaifu.type = newWaifu.publisher;
      else
        newWaifu.type = "Anime-Manga";

      newWaifu.rank = 1;
      newWaifu.attack = 3;
      newWaifu.defense = 1;
      newWaifu.husbandoId = "Daily";
      newWaifu.submittedBy = "System";
      newWaifu.votes = [];
    }

<<<<<<< HEAD
<<<<<<< HEAD
    await firebase.firestore().collection('waifus').add(newWaifu)
    .then(doc => {
      newWaifu.waifuId = doc.id
      return firebase.firestore().collection('waifuPoll').add(newWaifu);
=======
=======
>>>>>>> parent of 167f5e0... add switch draft feature and update boss fight screen.
    await firebase.firestore().collection(`${this.state.draftSettings.path}/waifus`).add(newWaifu)
    .then(doc => {
      newWaifu.waifuId = doc.id
      return firebase.firestore().collection(`${this.state.draftSettings.path}/waifuPoll`).add(newWaifu);
<<<<<<< HEAD
>>>>>>> parent of 167f5e0... add switch draft feature and update boss fight screen.
=======
>>>>>>> parent of 167f5e0... add switch draft feature and update boss fight screen.
    });
  }

  getRandWaifu(characters) {
    return _.shuffle(characters)[Math.floor(Math.random() * characters.length)];
  }

  async addFavoritieSeries(){
<<<<<<< HEAD
<<<<<<< HEAD
    // var dailies = await firebase.firestore().collection('waifuPoll').get()
    // dailies.forEach(x => {
    //   console.log(`Setting ${x.data().name}`)

    //   var id = x.data().waifuId;
    //   var waifu = x.data();

    //   delete waifu.waifuId;
    //   delete waifu.votes
    //   firebase.firestore().collection('waifus').doc(id).set(waifu)
    //   //x.ref.delete()
    // })
    var weeklies = await firebase.firestore().collection('waifus')
    .where("husbandoId","==","Weekly").get()
    weeklies.forEach(x => {
      if(x.data().name != "Aunt May"){
        console.log(`Deleting ${x.data().name}`)
        x.ref.delete()
      }

      // var waifu = x.data();
      // waifu.waifuId = x.ref.id;
      // waifu.votes = [];
      // firebase.firestore().collection('waifuPoll').add(waifu)
    })
    // .then(async (userDocs) => {
    //   userDocs.forEach(x => {
    //     x.ref.update({ favoriteSeries: [] })
    //   });
    // });
=======
=======
>>>>>>> parent of 167f5e0... add switch draft feature and update boss fight screen.
    var draft = store.getState().draft;
    (await firebase.firestore().collection(`users`).get()).docs.forEach(user => {
      user.ref.update({currentDraftId: "6FDG"})
    })
<<<<<<< HEAD
>>>>>>> parent of 167f5e0... add switch draft feature and update boss fight screen.
=======
>>>>>>> parent of 167f5e0... add switch draft feature and update boss fight screen.
  }
  
  recreateWeeklyPoll(){
    console.log("remake")
<<<<<<< HEAD
<<<<<<< HEAD
    // firebase.firestore().collection('waifus').where("husbandoId", "==", "Weekly").get()
    // .then(async (docs) => {
    //   docs.forEach(async x => {
    //     var waifu = {waifuId: x.id, ...x.data(), votes: []}

    //     await firebase.firestore().collection("waifuPoll").add(Object.assign({}, waifu))
    //   });
    // })
    
    // firebase.firestore().collection('waifus-bk').get()
    // .then(async (docs) => {
    //   docs.forEach(async x => {
    //     var waifuData = x.data();
    //     if(waifuData.husbandoId != "Weekly"){
    //       var waifu = waifuData;
    //       var id = _.cloneDeep(waifu).waifuId;

    //       delete waifu.waifuId
  
    //       await firebase.firestore().doc(`waifus/${id}`).set(waifu)
    //     }
      // });
    // })
  }

  createWaifuBackUp(){
    firebase.firestore().collection('waifus').get()
=======
=======
>>>>>>> parent of 167f5e0... add switch draft feature and update boss fight screen.
  }

  createWaifuBackUp(){
    firebase.firestore().collection(`${this.state.draftSettings.path}/waifus`).get()
<<<<<<< HEAD
>>>>>>> parent of 167f5e0... add switch draft feature and update boss fight screen.
=======
>>>>>>> parent of 167f5e0... add switch draft feature and update boss fight screen.
    .then(async (docs) => {
      var waifus = [];
      docs.forEach(x => {
        waifus.push({docId: x.id, ...x.data()})
      });
            
      waifus.forEach(async x => {
        var id = x.docId;
        var waifu = _.cloneDeep(x);
        delete waifu.docId;

<<<<<<< HEAD
<<<<<<< HEAD
        await firebase.firestore().collection('waifus-bk').doc(id).set(waifu);
=======
        await firebase.firestore().collection(`${this.state.draftSettings.path}/waifus-bk`).doc(id).set(waifu);
>>>>>>> parent of 167f5e0... add switch draft feature and update boss fight screen.
=======
        await firebase.firestore().collection(`${this.state.draftSettings.path}/waifus-bk`).doc(id).set(waifu);
>>>>>>> parent of 167f5e0... add switch draft feature and update boss fight screen.
      })
    })
  }

  openUserFavoritesScreen(){
    var userId = this.state.userInfo.userId
    this.state.navigation.navigate("UserWaifuFavorites", {userId})
  }
  
  async checkDailyBonus(){
    var user = this.state.userInfo;

    if(user.dailyBonusRedeemed){
      store.dispatch({
        type: SET_SNACKBAR,
        payload: {type: "warning", message: `You've Already Claimed Todays Bonus`}
      });
    }
    else if(!this.state.chestOpen){
      this.setState({chestOpen: true})

      await firebase.firestore().doc(`users/${user.userId}`).get()
      .then(doc => {
        var points = doc.data().points;

<<<<<<< HEAD
        return doc.ref.update({points: points + 5, dailyBonusRedeemed: true, streak: 0})
=======
        var streak = this.state.userInfo.streak || 0;

        return doc.ref.update({points: points + draft.deafultPoints, dailyBonusRedeemed: true, streak: streak + 1})
<<<<<<< HEAD
>>>>>>> parent of 167f5e0... add switch draft feature and update boss fight screen.
=======
>>>>>>> parent of 167f5e0... add switch draft feature and update boss fight screen.
      })
      
      setTimeout(function(){
        store.dispatch({
          type: SET_SNACKBAR,
          payload: {type: "info", message: `Daily Bonus Collected! (5 Points)`}
        });
        this.setState({chestOpen: false})
      }.bind(this), 1000)
    }
  }

  changeFabState(){
    var fabState = this.state.fabOpen;
    this.setState({fabOpen: !fabState})
  }

  render(){
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
<<<<<<< HEAD
<<<<<<< HEAD
=======
=======
>>>>>>> parent of 167f5e0... add switch draft feature and update boss fight screen.

    var userActions =
      [
        { icon: 'heart-box',
          label: 'Logout',
          onPress: () => logoutUser()
        },
        { 
          icon: 'plus-box-outline',
          label: 'Search For Draft',
          onPress: () => this.state.navigation.navigate("FindDraft")
        },
        // { 
        //   icon: 'plus-box-outline',
        //   label: 'Switch Draft',
        //   onPress: () => this.setState({ showSwitchDraft: true })
        // }
      ]

    if(this.state.userInfo.isAdmin){
      userActions = userActions.concat([
        { icon: 'heart-box',
          label: 'Add New Daily',
          onPress: () => this.addNewDaily()
        },
        { icon: 'heart-box',
          label: 'Add Favorite Series',
          onPress: () => this.addFavoritieSeries()
        },
        { icon: 'heart-box',
          label: 'Create Waifu Backup',
          onPress: () => this.createWaifuBackUp()
        }
      ])
    }

>>>>>>> parent of 167f5e0... add switch draft feature and update boss fight screen.
    return (
      <>
        {this.state.loading ?
          <></>
        :
<<<<<<< HEAD
          <Swiper
            index={0}
            showsPagination={false}
          >
            <View style={[styles.container]}>
              <UserProfileImg user={this.state.userInfo} img={this.state.userInfo.img}/>

              <View style={[styles.userInfoView]}>
                <View style={[styles.userInfo]}>
                  <TouchableOpacity activeOpacity={.25} onPress={() => this.setState({ showUpdateUserName: true })}  style={{flex: 1, flexDirection:"row", justifyContent:"center", alignItems:"center"}}>
                    <Text style={[styles.text]}>{this.state.userInfo.userName}</Text>
                    <MaterialIcons name="edit" size={24} color="black" />
                  </TouchableOpacity>
=======
          <>
            <SwipeIndicator horiSwipe={true} tintColor={"black"}/>
            <Swiper
              index={0}
              showsPagination={false}
            >
              <View style={[styles.container]}>
                <UserProfileImg user={this.state.userInfo} img={this.state.userInfo.img}/>

                <View style={[styles.userInfoView]}>
                  <View style={[styles.userInfo]}>
                    <TouchableOpacity activeOpacity={.25} onPress={() => this.setState({ showUpdateUserName: true })}  style={{flex: 1, flexDirection:"row", justifyContent:"center", alignItems:"center"}}>
                      <Text style={[styles.text]}>{this.state.userInfo.userName}</Text>
                      <MaterialIcons name="edit" size={24} color="black" />
                    </TouchableOpacity>
                    
                    <TouchableOpacity activeOpacity={.25} onPress={() => this.setState({ showEmailUpdate: true })} style={{flex: 1, flexDirection:"row", justifyContent:"center", alignItems:"center"}}>
                      <Text style={[styles.text, {fontSize: 20}]}>{this.state.userInfo.email}</Text>
                      <MaterialIcons name="edit" size={24} color="black"/>
                    </TouchableOpacity>
                    
                    <TouchableOpacity activeOpacity={.25} onPress={() => this.setState({ showPasswordUpdate: true })} style={{flex: 1, flexDirection:"row", justifyContent:"center", alignItems:"center"}}>
                      <Text style={[styles.text]}>Password</Text>
                      <MaterialIcons name="edit" size={24} color="black"/>
                    </TouchableOpacity>
                  </View>
>>>>>>> parent of 167f5e0... add switch draft feature and update boss fight screen.
                  
                  <TouchableOpacity activeOpacity={.25} onPress={() => this.setState({ showEmailUpdate: true })} style={{flex: 1, flexDirection:"row", justifyContent:"center", alignItems:"center"}}>
                    <Text style={[styles.text, {fontSize: 20}]}>{this.state.userInfo.email}</Text>
                    <MaterialIcons name="edit" size={24} color="black"/>
                  </TouchableOpacity>
                  
                  <TouchableOpacity activeOpacity={.25} onPress={() => this.setState({ showPasswordUpdate: true })} style={{flex: 1, flexDirection:"row", justifyContent:"center", alignItems:"center"}}>
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

<<<<<<< HEAD
              {!this.state.userInfo.dailyBonusRedeemed && !this.state.chestOpen ?
                <TouchableOpacity activeOpacity={.5} onPress={() => this.checkDailyBonus()}
                  style={{height: 150, width: width, alignItems:"center", justifyContent:"center"}}>
                  <Image source={this.state.chestOpen ? ChestOpen : ChestShake} style={{height: 150, width:150}} />
                </TouchableOpacity>
              :<></>}

              {
                this.state.chestOpen ?
                  <TouchableOpacity style={{height: 150, width: width, alignItems:"center", justifyContent:"center"}}>
                    <Image source={this.state.chestOpen ? ChestOpen : ChestShake} style={{height: 150, width:150}} />
                  </TouchableOpacity>
                :<></>
              }

              <View style={{height: 50, width: width}}>
                <Button
                  mode={"contained"} color={chroma('aqua').hex()} labelStyle={{fontSize: 20, fontFamily: "Edo"}}
                  onPress={logoutUser}
                >
                  LogOut
                </Button>
              </View>
              
              {
                this.state.userInfo.isAdmin ?
                  <View>
                    <View style={{height: 50, width: width}}>
                      <Button
                        mode={"contained"} color={chroma('aqua').hex()} labelStyle={{fontSize: 20, fontFamily: "Edo"}}
                        onPress={this.addNewDaily}
                      >
                        Add New Daily
                      </Button>
                    </View>
                    <View style={{height: 50, width: width}}>
                      <Button
                        mode={"contained"} color={chroma('aqua').hex()} labelStyle={{fontSize: 20, fontFamily: "Edo"}}
                        onPress={this.addFavoritieSeries}
                      >
                        Add Favorite Series
                      </Button>
                    </View>
                    <View style={{height: 50, width: width}}>
                      <Button
                        mode={"contained"} color={chroma('aqua').hex()} labelStyle={{fontSize: 20, fontFamily: "Edo"}}
                        onPress={this.createWaifuBackUp}
                      >
                        Create Waifu BackUp
                      </Button>
                    </View>
=======
                {!this.state.dailyBonusRedeemed && !this.state.chestOpen ?
                  <View style={{height: 150, width: width, alignItems:"center", justifyContent:"center"}}>
                    <TouchableOpacity activeOpacity={.5} onPress={() => this.setState({dailyBonusRedeemed: true}, this.checkDailyBonus())}
                      style={{height: 'auto', width: 'auto', alignItems:"center", justifyContent:"center"}}>
                      <Image source={this.state.chestOpen ? ChestOpen : ChestShake} style={{height: 125, width:125}} />
                    </TouchableOpacity>
>>>>>>> parent of 167f5e0... add switch draft feature and update boss fight screen.
                  </View>
                : <></>
              }
            </View>

<<<<<<< HEAD
            <View style={styles.waifuListView}>
              <View style={{width: width, height: 50, backgroundColor: chroma('white')}}>
                <Text style={styles.text}>TRADES</Text>
=======
                {
                  this.state.chestOpen ?
                    <View style={{height: 150, width: width, alignItems:"center", justifyContent:"center"}}>
                      <TouchableOpacity style={{height: 'auto', width: 'auto'}}>
                        <Image source={this.state.chestOpen ? ChestOpen : ChestShake} style={{height: 125, width:125}} />
                      </TouchableOpacity>
                    </View>
                  :<></>
                }
                
                <FAB.Group
                  fabStyle={{backgroundColor: chroma('aqua').hex()}}
                  open={this.state.settingsFabOpen}
                  icon={'settings'}
                  actions={userActions}
                  onStateChange={() => this.changeSettingsFabState()}
                />
<<<<<<< HEAD
>>>>>>> parent of 167f5e0... add switch draft feature and update boss fight screen.
=======
>>>>>>> parent of 167f5e0... add switch draft feature and update boss fight screen.
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
                  var rankColor = getRankColor(item.rank)

                  return(
                    <TouchableOpacity activeOpacity={.25} onPress={() => this.selectWaifu(item)} style={styles.itemContainer}>
                      <View style={styles.statView}>
                        <View style={styles.statRow}>
                          <Image style={[styles.statImg, {tintColor: chroma(rankColor)}]} source={atkIcon} />
                          <Text style={[ styles.statsText, {color: chroma(rankColor).brighten()}]}>{item.attack}</Text>
                        </View>
                        <View style={styles.statRow}>
                          <Image style={[styles.statImg, {tintColor: chroma(rankColor)}]} source={defIcon} />
                          <Text style={[ styles.statsText, {color: chroma(rankColor).brighten()}]}>{item.defense}</Text>
                        </View>
                      </View>

                      <Image
                        style={{
                          flex: 1,
                          aspectRatio: 1,
                          resizeMode: "cover",
                          borderRadius: 10,
                          ...StyleSheet.absoluteFillObject,
                          
                        }}
                        source={{uri: item.img}}
                      />
                      <RankBackground rank={item.rank} name={item.name} />
                    </TouchableOpacity>
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
                    onPress: () => this.setState({waifuType: "All"})
                  },
                  {
                    icon: ({ size, color }) =>
                       (
                        <Image
                          source={animeIcon}
                          style={{ width: size , height: size}}
                        />
                      ),
                    // icon: {marvelIcon},
                    label: 'Show Anime Waifus',
                    onPress: () => this.setState({waifuType: "Anime-Manga"})
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
                    onPress: () => this.setState({waifuType: "Marvel"})
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
                    onPress: () => this.setState({waifuType: "DC"})
                  },
                ]}
                onStateChange={() => this.changeFabState()}
              />
        
            </View>
          </Swiper>
        }

        {/* <BottomSheet isVisible={this.state.showSwitchDraft} modalProps={tra}>
          <FlatGrid
            itemDimension={50}
            items={this.state.otherDrafts}
            style={styles.gridView}
            // staticDimension={300}
            // fixed
            spacing={20}
            renderItem={({item, index}) => {
              console.log(item)
              return(
                <TouchableOpacity activeOpacity={.25}
                  style={[styles.itemContainer, {backgroundColor: index % 2 ? chroma('white').alpha(.75) : chroma('black').alpha(.75)}]}
                >
                </TouchableOpacity>
              )
            }}
          />
        </BottomSheet> */}

        {/* Update User Info Modal */}
        <Modal
          animationType="slide"
          visible={this.state.showUpdateUserName == true || this.state.showEmailUpdate == true || this.state.showPasswordUpdate == true }
          onDismiss={this.closeUserModal}
          onRequestClose={this.closeUserModal}
        >
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
    flex: 1,
    width: width,
    shadowColor: '#000',
    shadowOpacity: 1,
    elevation: 2,
  },
  userInfo: {
    height: 125,
    width: width,
    overflow: "hidden",
    shadowColor: '#000',
    shadowOpacity: 1,
    elevation: 1,
    backgroundColor: chroma('white').alpha(.85),
    alignItems:"center",
    justifyContent:"center"
  },
  userStatsView:{
    height:'auto',
    padding: 10,
    width: width,
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
import React, { Component, PureComponent, createRef, forwardRef } from 'react';
import { Platform, StatusBar, StyleSheet, View, TouchableOpacity, Image, ImageBackground, Dimensions, FlatList } from 'react-native';
import { Text, TouchableRipple, Card, Button, Modal, TextInput } from 'react-native-paper';
import { FlatGrid } from 'react-native-super-grid';

import _ from 'lodash'
import Swiper from 'react-native-swiper'

import UserProfileImg from '../components/UserProfileImg'
import { MaterialIcons } from '@expo/vector-icons';

//Firebase
import firebase from 'firebase/app'
import 'firebase/auth'

//Media
import defIcon from '../assets/images/defIcon.png'
import atkIcon from '../assets/images/atkIcon.png'

//Redux
import store from '../redux/store';
import watch from 'redux-watch'

import {
  LOADING_UI,
  STOP_LOADING_UI,
	SET_USER,
	SET_SNACKBAR
} from '../redux/types';


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
    trades = trades.filter(x => x.from.husbandoId == store.getState().user.credentials.userId ||
      x.to.husbandoId == store.getState().user.credentials.userId)
      
    this.state = {
      navigation: props.navigation,
			loading: store.getState().data.loading,
      userInfo: store.getState().user.credentials,
      waifus: store.getState().user.waifus,
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
      size: {width,height}
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
  }
  
  setSubscribes(){
    let dataReducerWatch = watch(store.getState, 'data')
    let userReducerWatch = watch(store.getState, 'user')

    this.dataUnsubscribe = store.subscribe(dataReducerWatch((newVal, oldVal, objectPath) => {
      var trades = _.cloneDeep(newVal.trades);
      trades = trades.filter(x => x.from.husbandoId == this.state.userInfo.userId || x.to.husbandoId == this.state.userInfo.userId)

      var userInfo = this.state.userInfo;
      userInfo.waifus = newVal.waifuList.filter(x => x.husbandoId == this.state.userInfo.userId);

      var selectedWaifu = null;
      if(this.state.selectedWaifu != null){
        selectedWaifu = newVal.waifuList.filter(x => x.waifuId == this.state.selectedWaifu.waifuId)[0]
      }

			this.setState({ userInfo, selectedWaifu, trades})
    }))

    this.userUnsubscribe = store.subscribe(userReducerWatch((newVal, oldVal, objectPath) => {
      var selectedWaifu = null;
      var users = [{...newVal.credentials, waifus: newVal.waifus }].concat(newVal.otherUsers);
      if(this.state.selectedWaifu != null){
        selectedWaifu = newVal.waifus.filter(x => x.waifuId == this.state.selectedWaifu.waifuId)[0]
      }

      this.setState({userInfo: newVal.credentials, waifus: newVal.waifus, selectedWaifu, users })
      // this.setState({userInfo: {...newVal.credentials, waifus: newVal.waifus }, selectedWaifu, users: newVal.otherUsers })
    }))
    
    var trades = _.cloneDeep(store.getState().data.trades);
    trades = trades.filter(x => x.from.husbandoId == this.state.userInfo.userId || x.to.husbandoId == this.state.userInfo.userId)
    var users = [{...store.getState().user.credentials, waifus: store.getState().user.waifus }].concat(store.getState().user.otherUsers);

    this.setState({
      users,
      trades,
      userInfo: store.getState().user.credentials,
      waifus: store.getState().user.waifus
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

  render(){
    var waifuGroups = _.chain(_.cloneDeep(this.state.waifus))
    .groupBy(waifu => Number(waifu.rank))
    .map((waifus, rank) => ({ rank: Number(rank), waifus }))
    .orderBy(group => Number(group.rank), ['desc'])
    .value()

    const waifus = waifuGroups.flatMap(x => x.waifus)

    return (
      <>
        {this.state.loading ?
          <></>
        :
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
                
                <View style={[styles.userStatsView]}>
                  <Text style={[styles.text]}>Points - {this.state.userInfo.points}</Text>
                  <Text style={[styles.text]}>Rank Coins - {this.state.userInfo.rankCoins}</Text>
                  <Text style={[styles.text]}>Stat Coins - {this.state.userInfo.statCoins}</Text>
                  <Text style={[styles.text]}>Submit Slots - {this.state.userInfo.submitSlots}</Text>
                </View>
              </View>

              <View style={{height: 50, width: width}}>
                <Button
                  mode={"contained"} color={chroma('aqua').hex()} labelStyle={{fontSize: 20, fontFamily: "Edo"}}
                  onPress={logoutUser}
                >
                  LogOut
                </Button>
              </View>
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
                      
                    </TouchableOpacity>
                  )
                }}
              />
            </View>
          
            <View style={styles.waifuListView}>
              <View style={{width: width, height: 50, backgroundColor: chroma('white')}}>
                <Text style={styles.text}>WAIFUS</Text>
              </View>
              <FlatGrid
                itemDimension={150}
                items={waifus}
                style={styles.gridView}
                // staticDimension={300}
                // fixed
                spacing={20}
                renderItem={({item, index}) => {
                  var rankColor = ""
                  switch(item.rank){
                    case 1:
                      rankColor = "#ff0000"
                      break;
                    case 2:
                      rankColor = "#835220"
                      break;
                    case 3:
                      rankColor = "#7b7979"
                      break;
                    case 4:
                      rankColor = "#b29600"
                      break;
                  }

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
            </View>
          </Swiper>
        }

        
        {/* UPdate User Info Modal */}
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
    flex: 1,
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
    flex: 3,
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
  }
})
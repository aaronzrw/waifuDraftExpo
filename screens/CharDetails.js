import React, { Component, createRef, forwardRef } from 'react';
import { Text, FAB, TextInput, Button, ActivityIndicator, Searchbar } from 'react-native-paper';
import { Platform, StatusBar, StyleSheet, View, TouchableOpacity, TouchableHighlight,
   Image, ImageBackground, Dimensions, FlatList, Modal } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import NumericInput from 'react-native-numeric-input'
import {
  SET_SNACKBAR,
} from '../redux/types';

import _ from 'lodash'
const chroma = require('chroma-js')

import Swiper from 'react-native-swiper'
import AMCharDetails from '../components/AMCharDetails'
import ComicCharDetails from '../components/ComicCharDetails'
import pointsIcon from '../assets/images/pointsIcon.png'
import rankCoinIcon from '../assets/images/rankCoinIcon.png'
import atkIcon from '../assets/images/atkIcon.png'
import defIcon from '../assets/images/defIcon.png'

import statCoinIcon from '../assets/images/statCoinIcon.png'
import {useRankCoin, useStatCoin, updateWaifuImg, getBaseStats, getRankColor} from '../redux/actions/dataActions'

import store from '../redux/store'
import watch from 'redux-watch'

const { width, height } = Dimensions.get('window');

export default class CharDetails extends Component {
  constructor(props){
    super();

    this.state = {
      navigation: props.navigation,
      poll: store.getState().data.poll.weekly,
      userInfo: store.getState().user.credentials,
      waifu: props.route.params.waifu,
      newImage: null,
      atkStatUp: 0,
      defStatUp: 0,
      showRankCoinConf: false,
      showStatCoinModal: false,
      showUpdateImg: false,
    };
    
    this.setSubscribes = this.setSubscribes.bind(this)
    this.unSetSubscribes = this.unSetSubscribes.bind(this)
    this.useRankCoinFunc = this.useRankCoinFunc.bind(this)
    this.useStatCoinFunc = this.useStatCoinFunc.bind(this)
    this.updateImg = this.updateImg.bind(this)
    this.updateImgText = this.updateImgText.bind(this)
  }

  setSubscribes(){
    let dataReducerWatch = watch(store.getState, 'data')
    let userReducerWatch = watch(store.getState, 'user')

    this.dataUnsubscribe = store.subscribe(dataReducerWatch((newVal, oldVal, objectPath) => {
      var newWaifu = newVal.waifuList.filter(x => x.waifuId == this.state.waifu.waifuId)[0]
      this.setState({waifu:newWaifu, poll:newVal.poll.weekly})
    }))

    this.userUnsubscribe = store.subscribe(userReducerWatch((newVal, oldVal, objectPath) => {
      this.setState({userInfo: newVal.credentials})
    }))
    

    this.setState({
      userInfo: store.getState().user.credentials,
      poll: store.getState().data.poll.weekly,
      waifu: store.getState().data.waifuList.filter(x => x.waifuId == this.state.waifu.waifuId)[0]
    })
  }

  unSetSubscribes(){
    if(this.dataUnsubscribe != null)
      this.dataUnsubscribe()
    
    if(this.userUnsubscribe != null)
      this.userUnsubscribe()
  }
  
  componentDidMount(){
    this._navFocusUnsubscribe = this.state.navigation.addListener('focus', () => this.setSubscribes());
    this._navBlurUnsubscribe = this.state.navigation.addListener('blur', () => this.unSetSubscribes());
  }

  componentWillUnmount(){
    this._navFocusUnsubscribe();
    this._navBlurUnsubscribe();
  }

  waifuLinkPress = async () => {
    WebBrowser.openBrowserAsync(this.state.waifu.link);
  };

  useRankCoinFunc(rankCoin = 0, points = 0, statCoins = 0){
    useRankCoin(this.state.waifu, rankCoin, points, statCoins)
    this.setState({ showRankCoinConf: false})
  }

  useStatCoinFunc(){
    console.log("use stat coin")
    var stats = {
      attack: this.state.atkStatUp,
      defense: this.state.defStatUp
    }

    useStatCoin(this.state.waifu, stats)
    this.setState({ showStatCoinModal: false, atkStatUp: 0, defStatUp: 0})
  }

  updateImgText(text){
    this.setState({newImage: text})
  }

  async updateImg(){
    if((this.state.newImage.match(/\.(jpeg|jpg|gif|png)$/) != null)){
      var success = await updateWaifuImg(this.state.waifu, this.state.newImage);
      
      if(success){
        this.setState({ newVal: null, showUpdateImg: false})
      }
    }
    else{
      store.dispatch({
        type: SET_SNACKBAR,
        payload: {type: "warning", message: `Image Url Must Be .jpeg, .jpg, .gif or .png`}
      });
      return;
    }
  }

  render(){
    const waifu = this.state.waifu;

    var attackNeeded = 0;
    var defenseNeeded = 0;
    var pointsNeededToRank = 0;
    var statCoinsNeededToRank = 0;
    var nextRankColor = getRankColor(waifu.rank);
    
    if(waifu.rank < 4){
      var baseStats = getBaseStats(waifu.rank + 1);
      nextRankColor = getRankColor(waifu.rank + 1);

      attackNeeded = baseStats.attack - waifu.attack < 0 ? 0 : baseStats.attack - waifu.attack;
      defenseNeeded = baseStats.defense - waifu.defense < 0 ? 0 : baseStats.defense - waifu.defense;

      statCoinsNeededToRank = attackNeeded + defenseNeeded;
      pointsNeededToRank = (waifu.rank + 1) * 5;
    }

    var displayName = waifu.name;
    if(waifu.type != 'Anime-Manga')
      displayName = `${waifu.name} ${waifu.currentAlias != "" && waifu.currentAlias != waifu.name && !waifu.name.includes(waifu.currentAlias) ? "- " + waifu.currentAlias : ""}`

    return (
      <View style={[styles.container]}>
        <ImageBackground blurRadius={1} style={[styles.imageContainer]} imageStyle={{resizeMode:"cover"}} source={{uri: waifu.img}}>
          <ImageBackground style={[styles.imageContainer]} imageStyle={{resizeMode:"contain"}} source={{uri: waifu.img}}>
            <View style={styles.bgView}>
              <Swiper
                index={0}
                bounces
                removeClippedSubviews
                showsPagination={false}
              >
                {/* Stats List */}
                <View style={{flex:1}}>
                  {/* Name */}
                  <View style={styles.nameView}>
                    <Text style={[styles.text,styles.nameText, styles.titleShadow,{fontSize: 45}]}>{displayName}</Text>

                    <FAB
                      small
                      color="white"
                      style={[styles.fab, {alignSelf: "center"}]}
                      icon="link-variant"
                      onPress={this.waifuLinkPress}
                    />
                    <FAB
                      small
                      color="white"
                      style={styles.imgUpdtFab}
                      icon="image"
                      onPress={() => this.setState({showUpdateImg: true})}
                    />
                  </View>

                  <View style={styles.statsView}>
                    <View style={styles.statsRow}>
                      <Text style={styles.statText}>ATK: {waifu.attack}</Text>
                      <Text style={styles.statText}>DEF: {waifu.defense}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.buttonRowView}>
                    <View style={styles.buttonItem}>
                      <Button onPress={() => this.setState({showRankCoinConf: true})}
                        disabled={waifu.rank >= 4 || (this.state.userInfo.rankCoins <= 0 && (pointsNeededToRank == 0 || statCoinsNeededToRank > this.state.userInfo.statCoins))}
                        mode={"contained"} color={chroma('aqua').hex()} 
                        labelStyle={{fontSize: 20, fontFamily: "Edo"}}
                      >
                        Upgrade Rank
                      </Button>
                    </View>

                    <View style={styles.buttonItem}>
                      <Button
                        mode={"contained"}
                        color={chroma('aqua').hex()}
                        disabled={this.state.userInfo.statCoins <= 0}
                        labelStyle={{fontSize: 20, fontFamily: "Edo"}}
                        onPress={() => this.setState({showStatCoinModal: true})}
                      >
                        Upgrade Stats
                      </Button>
                    </View>
                  </View>
                </View>
              
                {/* Details */}
                <View style={styles.detailsView}>
                  {waifu.type == "Anime-Manga" ? <AMCharDetails card={waifu}/> : <ComicCharDetails card={waifu} />}
                </View>
              </Swiper>
            </View>
          </ImageBackground>
        </ImageBackground>

        {/* Rank Modal */}
        <Modal
          animationType="slide"
          visible={this.state.showRankCoinConf}
          onRequestClose={() => this.setState({showRankCoinConf: false})}
        >
          <View style={{flex:1, width:width, justifyContent:"center", alignItems:"center"}}>
            <View style={{height:75, width: width, backgroundColor:chroma('black').alpha(.1), justifyContent:"center", alignItems:"center"}}>
              <Text style={[styles.text]}>
                Rank Up Your Waifu
              </Text>
            </View>
            
            <View style={{flex:1, justifyContent:"center", alignItems:"center"}}>
              <View style={{flexDirection:"row"}}>
                <View style={[{height: 100, width: 100, margin:8}]}>
                  <Image style={{tintColor: chroma("black"), height:'100%', width:'100%'}} resizeMode="contain" source={pointsIcon} />
                  <View style={{position:"absolute", zIndex: 1, height:'100%', width:'100%', justifyContent:"center", alignItems:"center"}}>
                    <Text style={{color: chroma(nextRankColor), fontFamily:"Edo", fontSize:50, textAlign:'center'}}>{pointsNeededToRank}</Text>
                  </View>
                </View>
                <View style={[{height: 100, width: 100, margin:8}]}>
                  <Image style={{tintColor: chroma("black"), height:'100%', width:'100%'}} resizeMode="contain" source={atkIcon} />
                  <View style={{position:"absolute", zIndex: 1, height:'100%', width:'100%', justifyContent:"center", alignItems:"center"}}>
                    <Text style={{color: chroma(nextRankColor), fontFamily:"Edo", fontSize:50, textAlign:'center'}}>{attackNeeded}</Text>
                  </View>
                </View>
                <View style={[{height: 100, width: 100, margin:8}]}>
                  <Image style={{tintColor: chroma("black"), height:'100%', width:'100%'}} resizeMode="contain" source={defIcon} />
                  <View style={{position:"absolute", zIndex: 1, height:'100%', width:'100%', justifyContent:"center", alignItems:"center"}}>
                    <Text style={{color: chroma(nextRankColor), fontFamily:"Edo", fontSize:50, textAlign:'center'}}>{defenseNeeded}</Text>
                  </View>
                </View>
              </View>
              
              <View style={{flex:1}}>
                <View style={styles.buttonRowView}>
                  <View style={styles.buttonItem}>
                    <Button onPress={() => this.useRankCoinFunc(0, pointsNeededToRank, statCoinsNeededToRank)}
                      disabled={pointsNeededToRank > this.state.userInfo.points || statCoinsNeededToRank > this.state.userInfo.statCoins}
                      mode={"contained"} color={chroma('aqua').hex()} 
                      labelStyle={{fontSize: 20, fontFamily: "Edo", height: 'auto'}}
                    >
                      Rank Up
                    </Button>
                  </View>
                </View>
              </View>
            </View>

            <View style={{flex:1, justifyContent:"center", alignItems:"center"}}>
              <Image style={[{height: 100, width: 100, margin:8, tintColor: chroma("black")}]} source={rankCoinIcon} />
              <View style={styles.buttonRowView}>
                <View style={styles.buttonItem}>
                  <Button onPress={() => this.useRankCoinFunc(1)}
                    disabled={this.state.userInfo.rankCoins == 0}
                    mode={"contained"} color={chroma('aqua').hex()} 
                    labelStyle={{fontSize: 20, fontFamily: "Edo"}}
                  >
                    Use Rank Coin
                  </Button>
                </View>
              </View>
            </View>

          </View>
        </Modal>
      
        {/* Stat Modal */}
        <Modal
          animationType="slide"
          visible={this.state.showStatCoinModal}
          onRequestClose={() => this.setState({showStatCoinModal: false, atkStatUp: 0, defStatUp: 0})}
        >
          <View style={{flex:1, width:width, marginTop: 22, justifyContent:"center", alignItems:"center"}}>
            <View style={{flex:1, width: width, backgroundColor: chroma("white"), borderRadius: 25, alignItems:"center", justifyContent: "center"}}>
              <View style={{height: 300, width: width/1.5, }}>
                <View style={{flex:1}}>
                  <Text style={[styles.statText, {color:"black"} ]}>ATK</Text>
                  <NumericInput value={this.state.atkStatUp}
                    onChange={value => {
                      this.setState({atkStatUp: value})
                    }}
                    rounded
                    minValue={0}
                    totalHeight={35}
                    maxValue={this.state.userInfo.statCoins - this.state.defStatUp}
                    leftButtonBackgroundColor={chroma('aqua').alpha(.85).hex()}
                    rightButtonBackgroundColor={chroma('aqua').alpha(.85).hex()}
                    separatorWidth={0}
                    inputStyle={{
                      fontFamily:"Edo",
                      fontSize: 25,
                    }}
                    containerStyle={{
                      width: '90%',
                      justifyContent:"center",
                      alignItems:"center",
                      alignSelf:"center",
                      backgroundColor: chroma('white').alpha(.5).hex(),
                      borderWidth: 1,
                      borderColor: chroma('black').alpha(.25).hex(),
                    }}
                  />
                </View>
                <View style={{flex:1}}>
                  <Text style={[styles.statText, {color:"black"} ]}>DEF</Text>
                  <NumericInput value={this.state.defStatUp}
                    onChange={(value) => {
                      this.setState({defStatUp: value})
                    }}
                    rounded
                    minValue={0}
                    maxValue={this.state.userInfo.statCoins - this.state.atkStatUp}
                    totalHeight={35}
                    leftButtonBackgroundColor={chroma('aqua').alpha(.85).hex()}
                    rightButtonBackgroundColor={chroma('aqua').alpha(.85).hex()}
                    separatorWidth={0}
                    inputStyle={{ 
                      fontFamily:"Edo",
                      fontSize: 25,
                    }}
                    containerStyle={{
                      width: '90%',
                      justifyContent:"center",
                      alignItems:"center",
                      alignSelf:"center",
                      backgroundColor: chroma('white').alpha(.5).hex(),
                      borderWidth: 1,
                      borderColor: chroma('black').alpha(.25).hex(),
                    }}
                  />
                </View>
              </View>
            </View>

            <View style={styles.buttonRowView}>
              <View style={styles.buttonItem}>
                <Button onPress={this.useStatCoinFunc}
                  disabled={this.state.atkStatUp == 0 && this.state.defStatUp == 0}
                  mode={"contained"} color={chroma('aqua').hex()} 
                  labelStyle={{fontSize: 20, fontFamily: "Edo"}}
                >
                  Confirm
                </Button>
              </View>

              <View style={styles.buttonItem}>
                <Button mode={"contained"}
                  onPress={() => this.setState({showStatCoinModal: false, atkStatUp: 0, defStatUp: 0})}
                  color={chroma('aqua').hex()}
                  labelStyle={{fontSize: 20, fontFamily: "Edo"}}>
                    Cancel
                </Button>
              </View>
            </View>
          </View>
        </Modal>
      
        {/* Update Image Modal */}
        <Modal
          animationType="slide"
          visible={this.state.showUpdateImg}
          onRequestClose={() => this.setState({showUpdateImg: false})}
        >
          <View style={{flex:1, width:width, marginTop: 22, justifyContent:"center", alignItems:"center"}}>
            <View style={styles.updtImgCon}>
              <View style={[styles.profileImg]}>
                <ImageBackground source={{uri: this.state.newImage ?? this.state.waifu.img}} style={[styles.profileImg]}>
                  <TextInput
                    label="img Url"
                    underlineColor= "teal"
                    style={styles.textField}
                    value={this.state.newImage}
                    mode="Outlined"
                    onChangeText={(text) => this.updateImgText(text)}
                  />
                </ImageBackground>
              </View>
              
              {
                this.state.newImage != null ?
                <>
                  <FAB
                    //small
                    color="white"
                    style={styles.cancelFab}
                    icon="cancel"
                    onPress={() => this.setState({newImage: null})}
                  />

                  <FAB
                    //small
                    color="white"
                    style={styles.submitFab}
                    icon="check"
                    onPress={this.updateImg}
                  />
                </>
                : <></>
              }
            </View>
          </View>
        </Modal>
      
      </View>
    );
  }
}

CharDetails.navigationOptions = {
  header: null,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  updtImgCon: {
    height: height,
    width: width,
    alignItems:"center",
    justifyContent:"center",
    position: 'relative',
  },
  imageContainer: {
    flex: 1,
  },
  bgView:{
    flex: 1,
    backgroundColor: "rgba(255,255,255,.25)"
  },
  profileImg:{
    height: height * .6,
    width: width * .8,
    borderRadius: 20,
    marginTop: 5,
    marginBottom: 5,
    resizeMode: "cover",
    overflow: "hidden",
    shadowColor: '#000',
    shadowOpacity: 1,
    elevation: 10,
    alignItems:"center",
    justifyContent:"center",
    position: 'absolute',
    zIndex: 1,
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
    height: 'auto',
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,.75)",
  },
  nameText:{
    color:"white"
  },
	textField: {
    position: "absolute",
    bottom: 15,
    width: '95%',
		backgroundColor: "white"
	},
  text:{
    fontFamily: "Edo",
    fontSize: 30,
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
    left: 50,
    bottom: 75,
    backgroundColor: chroma('red').hex()
  },
  submitFab: {
    position: 'absolute',
    zIndex: 2,
    right: 50,
    bottom: 75,
    backgroundColor: chroma('#80ff80').hex()
  },
});

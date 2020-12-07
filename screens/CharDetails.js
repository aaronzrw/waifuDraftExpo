import React, { Component, createRef, forwardRef } from 'react';
import { Text, FAB, TextInput, Button, ActivityIndicator, Searchbar } from 'react-native-paper';
import { Platform, StatusBar, StyleSheet, View, TouchableOpacity, TouchableHighlight,
   Image, ImageBackground, Dimensions, FlatList, Modal, KeyboardAvoidingView } from 'react-native';
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

//Media
import pointsIcon from '../assets/images/pointsIcon.png'
import rankCoinIcon from '../assets/images/rankCoinIcon.png'
import hofCoinIcon from '../assets/images/HOFCoin.png'
import hofCoinAnim from '../assets/images/HOF-Coin-Anim.gif'
import atkIcon from '../assets/images/atkIcon.png'
import defIcon from '../assets/images/defIcon.png'
import cancelIcon from '../assets/images/CancelIcon.png'
import backIcon from '../assets/images/BackIcon.png'

import SwipeIndicator from '../components/SwipeIndicator'


import statCoinIcon from '../assets/images/statCoinIcon.png'
import {useRankCoin, useStatCoin, useHOFCoin, updateWaifuImg, getBaseStats, getRankColor} from '../redux/actions/dataActions'

import store from '../redux/store'
import watch from 'redux-watch'

const { width, height } = Dimensions.get('window');

export default class CharDetails extends Component {
  constructor(props){
    super();

    this.state = {
      navigation: props.navigation,
      goBackFunc: props.route.params.goBackFunc,
      poll: store.getState().data.poll.weekly,
      userInfo: store.getState().user.creds,
      waifuSettingsOpen: false,
      waifu: props.route.params.waifu,
    };
    
    this.setSubscribes = this.setSubscribes.bind(this)
    this.unSetSubscribes = this.unSetSubscribes.bind(this)
    this.changeWaifusSettingsFabState = this.changeWaifusSettingsFabState.bind(this)
  }

  setSubscribes(){
    this.state.goBackFunc(this.state.navigation)

    let dataReducerWatch = watch(store.getState, 'data')
    let userReducerWatch = watch(store.getState, 'user')

    this.dataUnsubscribe = store.subscribe(dataReducerWatch((newVal, oldVal, objectPath) => {
      var newWaifu = newVal.waifuList.filter(x => x.waifuId == this.state.waifu.waifuId)[0]
      this.setState({waifu:newWaifu, poll:newVal.poll.weekly})
    }))

    this.userUnsubscribe = store.subscribe(userReducerWatch((newVal, oldVal, objectPath) => {
      this.setState({userInfo: newVal.creds})
    }))
    
    this.setState({
      userInfo: store.getState().user.creds,
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

  changeWaifusSettingsFabState(){
    var fabState = this.state.waifuSettingsOpen;
    this.setState({waifuSettingsOpen: !fabState})
  }

  render(){
    const waifu = this.state.waifu;

    var waifuActions =
    [
      { 
        label: 'Open Waifu Link',
        icon: "link-variant",
        onPress: () => this.waifuLinkPress()
      },
      {
        icon: "image",
        label: 'Change Waifu Image',
        onPress: () => this.state.navigation.navigate("CharUpdate", {selView: "Img", waifu})
      },
      {
        icon: ({ size, color }) =>
          (
          <Image
            source={statCoinIcon}
            style={{ width: size , height: size}}
          />
        ),
        label: 'Upgrade Stats',
        onPress: () => this.state.navigation.navigate("CharUpdate", {selView: "Stat", waifu})
      },
      {
        icon: ({ size, color }) =>
          (
          <Image
            source={rankCoinIcon}
            style={{ width: size , height: size}}
          />
        ),
        label: 'Upgrade Rank',
        onPress: () => this.state.navigation.navigate("CharUpdate", {selView: "Rank", waifu})
      }
    ]

    return (
      <View style={[styles.container]}>
        <ImageBackground blurRadius={1} style={[styles.imageContainer]} imageStyle={{resizeMode:"cover"}} source={{uri: waifu.img}}>
          <ImageBackground style={[styles.imageContainer]} imageStyle={{resizeMode:"contain"}} source={{uri: waifu.img}}>
            <SwipeIndicator horiSwipe={true} />
            
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
                    <Text style={[styles.text,styles.nameText,{fontSize: 45}]}>{waifu.name}</Text>
                  </View>

                  <View style={styles.statsView}>
                    {/* {
                      waifu.isHOF ?
                        <Image source={hofCoinIcon} style={[{ height: 100, width: 100, position: "absolute", top: 0, right: 0 }]} />
                      : <></>
                    } */}

                    <View style={styles.statsRow}>
                      <Text style={styles.statText}>ATK: {waifu.attack}</Text>
                      <Text style={styles.statText}>DEF: {waifu.defense}</Text>
                    </View>
                  </View>
                </View>
              
                {/* Details */}
                <View style={styles.detailsView}>
                  {waifu.type == "Anime-Manga" ? <AMCharDetails waifu={waifu}/> : <ComicCharDetails waifu={waifu} />}
                </View>
              </Swiper>
            </View>
          </ImageBackground>
        </ImageBackground>
        
        <FAB.Group
          fabStyle={{backgroundColor: chroma('aqua').hex()}}
          open={this.state.waifuSettingsOpen}
          icon={'settings'}
          actions={waifuActions}
          onStateChange={() => this.changeWaifusSettingsFabState()}
        />
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
    flex: 1,
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
    backgroundColor: "rgba(255,255,255,.25)",
    position: "relative"
  },
  profileImg:{
    height: '95%',
    width: '95%',
    borderRadius: 20,
    // marginTop: 5,
    // marginBottom: 5,
    resizeMode: "cover",
    overflow: "hidden",
    shadowColor: '#000',
    shadowOpacity: .5,
    elevation: 1,
    // position: 'absolute',
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
    height: "auto",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,.75)",
  },
  nameText:{
    color:"white"
  },
	textField: {
    height: 75,
    width: width * .95,
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

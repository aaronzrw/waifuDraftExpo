import React, { Component, createRef, forwardRef } from 'react';
import { Text, FAB, TextInput, Button, ActivityIndicator, Searchbar } from 'react-native-paper';
import { Platform, StatusBar, StyleSheet, View, TouchableOpacity, Image, ImageBackground, Dimensions, FlatList } from 'react-native';
import { FlatGrid } from 'react-native-super-grid';
import * as WebBrowser from 'expo-web-browser';

import _ from 'lodash'
const unfavoriteHeart = require('../assets/images/UnfavoriteHeart.png')
const favoriteHeart = require('../assets/images/FavoriteHeart.png')
const chroma = require('chroma-js')

import Swiper from 'react-native-swiper'
import SwipeIndicator from '../components/SwipeIndicator'

import AMCharDetails from '../components/AMCharDetails'
import ComicCharDetails from '../components/ComicCharDetails'

//icons
import hofCoinIcon from '../assets/images/HOFCoin.png'
import atkIcon from '../assets/images/atkIcon.png'
import defIcon from '../assets/images/defIcon.png'

import store from '../redux/store'
import watch from 'redux-watch'
import { submitWaifu, toggleWishListWaifu } from '../redux/actions/dataActions'

const { width, height } = Dimensions.get('window');

export default class SeachCharacterDetails extends Component {
  constructor(props){
    super();

    this.state = {
      navigation: props.navigation,
      goBackFunc: props.route.params.goBackFunc,
      poll: store.getState().data.poll.weekly,
      waifuList: store.getState().data.waifuList,
      otherUsers: store.getState().user.otherUsers,
      userInfo: store.getState().user.creds,
      waifu: props.route.params.item,
    };
    
    this.toggleWishList = this.toggleWishList.bind(this)
    this.setSubscribes = this.setSubscribes.bind(this)
    this.unSetSubscribes = this.unSetSubscribes.bind(this)
  }

  setSubscribes(){
    this.state.goBackFunc(this.state.navigation)
    
    let dataReducerWatch = watch(store.getState, 'data')
    let userReducerWatch = watch(store.getState, 'user')

    this.dataUnsubscribe = store.subscribe(dataReducerWatch((newVal, oldVal, objectPath) => {
      this.setState({waifuList: newVal.waifuList, poll:newVal.poll.weekly})
    }))

    this.userUnsubscribe = store.subscribe(userReducerWatch((newVal, oldVal, objectPath) => {
      this.setState({userInfo: newVal.creds, otherUsers: newVal.otherUsers})
    }))
    
    this.setState({
      userInfo: store.getState().user.creds,
      otherUsers: store.getState().user.otherUsers,
      poll: store.getState().data.poll.weekly,
      waifuList: store.getState().data.waifuList
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
  
  toggleWishList(){
    toggleWishListWaifu(this.state.waifu.link)
  }

  waifuLinkPress = async () => {
    WebBrowser.openBrowserAsync(this.state.waifu.link);
  };

  render(){
    const waifu = this.state.waifu;
    var isFav = this.state.userInfo.wishList.includes(waifu.link);

    var favoriteList = this.state.otherUsers.filter(x => x.wishList.includes(waifu.link))
    
    var isSubmitted = this.state.waifuList.map(x => x.link).includes(waifu.link);

    return (
      <View style={[styles.container]}>
        <ImageBackground blurRadius={1} style={[styles.imageContainer]} imageStyle={{resizeMode:"cover"}} source={{uri: waifu.img}}>
          <ImageBackground style={[styles.imageContainer]} imageStyle={{resizeMode:"contain"}} source={{uri: waifu.img}}>
            <View style={styles.bgView}>
              <SwipeIndicator horiSwipe={true} />
              <Swiper
                index={0}
                bounces
                removeClippedSubviews
                showsPagination={false}
              >
                <View style={styles.detailsView}>
                  {/* Name */}
                  <View style={styles.nameView}>
                    <Text style={[styles.text,styles.nameText, styles.titleShadow,{fontSize: 45}]}>{waifu.name}</Text>
                  </View>

                  {
                    favoriteList.length > 0 ?
                      <FlatGrid
                        itemDimension={100}
                        items={favoriteList}
                        style={styles.gridView}
                        spacing={10}
                        renderItem={({item, index}) =>
                          <View style={[ styles.userFavImg ], {position: "relative"}}>
                            <ImageBackground style={[styles.userFavImg]} source={{uri: item.img}}>
                              <Image style={{height: 25, width: 25, position:"absolute", top: 5, right: 5, zIndex: 1}} source={favoriteHeart} />
                            </ImageBackground>
                          </View>
                        }
                      />
                    :<></>
                  }

                  {
                    isSubmitted ?
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
                    : <></>
                  }

                  <TouchableOpacity style={{height:50, width: 50, position:"absolute", top:0, right:5}} onPress={() => this.toggleWishList()}>
                    <Image style={{height:50, width: 50}} source={isFav ? favoriteHeart : unfavoriteHeart} />
                  </TouchableOpacity>
                  
                  <FAB
                    small
                    color="white"
                    style={[styles.fab, {alignSelf: "center"}]}
                    icon="link-variant"
                    onPress={this.waifuLinkPress}
                  />
                </View>
              
                {/* Details */}
                <View style={styles.detailsView}>
                  {waifu.type == "Anime-Manga" ? <AMCharDetails waifu={waifu}/> : <ComicCharDetails waifu={waifu} />}
                </View>
              </Swiper>
            </View>
          </ImageBackground>
        </ImageBackground>
      </View>
    );
  }
}

SeachCharacterDetails.navigationOptions = {
  header: null,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  bgView:{
    flex: 1,
    backgroundColor: "rgba(255,255,255,.25)"
  },
  imageContainer: {
    flex: 1,
  },
  gridView: {
    flex: 1,
    width: '100%'
  },
  buttonRowView: {
    position:"absolute",
    bottom: 10,
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
  userFavImg:{
    height: 75,
    width: 75,
    borderRadius: 25,
    // padding: 10,
    overflow: "hidden",
    shadowColor: '#000',
    shadowOpacity: 1,
    elevation: 5
  },
  fab: {
    position: 'absolute',
    right: 5,
    bottom: 5,
    backgroundColor: chroma('aqua').hex()
  },
});

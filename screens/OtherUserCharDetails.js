import React, { Component, createRef, forwardRef } from 'react';
import { Text, FAB, TextInput, Button, ActivityIndicator, Searchbar } from 'react-native-paper';
import { Platform, StatusBar, StyleSheet, View, TouchableOpacity, TouchableHighlight,
   Image, ImageBackground, Dimensions, FlatList, Modal } from 'react-native';
import * as WebBrowser from 'expo-web-browser';

import _ from 'lodash'

import Swiper from 'react-native-swiper'
import SwipeIndicator from '../components/SwipeIndicator'

import AMCharDetails from '../components/AMCharDetails'
import ComicCharDetails from '../components/ComicCharDetails'

import store from '../redux/store'
import watch from 'redux-watch'
import favoriteHeart from '../assets/images/FavoriteHeart.png'
import unfavoriteHeart from '../assets/images/UnfavoriteHeart.png'

const chroma = require('chroma-js')
const { width, height } = Dimensions.get('window');

export default class OtherUserCharDetails extends Component {
  constructor(props){
    super();
    this.state = {
      navigation: props.navigation,
      goBackFunc: props.route.params.goBackFunc,
      waifu: props.route.params.waifu,
      fabOpen: false
    };
    
    this.changeFabState = this.changeFabState.bind(this)
    this.setSubscribes = this.setSubscribes.bind(this)
    this.unSetSubscribes = this.unSetSubscribes.bind(this)
  }

  setSubscribes(){
    this.state.goBackFunc(this.state.navigation)
    let dataReducerWatch = watch(store.getState, 'data')

    this.dataUnsubscribe = store.subscribe(dataReducerWatch((newVal, oldVal, objectPath) => {
      var newWaifu = newVal.waifuList.filter(x => x.waifuId == this.state.waifu.waifuId)[0]
      this.setState({waifu:newWaifu})
    }))
    
    this.setState({
      waifu: store.getState().data.waifuList.filter(x => x.waifuId == this.state.waifu.waifuId)[0]
    })
  }

  unSetSubscribes(){
    if(this.dataUnsubscribe != null)
      this.dataUnsubscribe()
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

  changeFabState(){
    var fabState = this.state.fabOpen;
    this.setState({fabOpen: !fabState})
  }

  render(){
    const waifu = this.state.waifu;
    const userInfo = store.getState().user.creds;

    const isFav = userInfo.wishList.includes(waifu.link);

    var waifuActions =
    [
      { 
        label: 'Open Waifu Link',
        icon: "link-variant",
        onPress: () => this.waifuLinkPress()
      },
      {
        icon: ({ size, color }) =>
          (
          <Image
            source={isFav ? unfavoriteHeart : favoriteHeart}
            style={{ width: size , height: size}}
          />
        ),
        label: isFav ? 'Remove From Favorite' : 'Add To Favorites',
        onPress: () => console.log('favorite')
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
              
              <FAB.Group
                fabStyle={{backgroundColor: chroma('aqua').hex()}}
                open={this.state.fabOpen}
                icon={'settings'}
                actions={waifuActions}
                onStateChange={() => this.changeFabState()}
              />

            </View>
          </ImageBackground>
        </ImageBackground>
      </View>
    );
  }
}

OtherUserCharDetails.navigationOptions = {
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
  fab: {
    position: 'absolute',
    right: 5,
    top: 5,
    backgroundColor: chroma('aqua').hex()
  },
});

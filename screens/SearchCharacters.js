import React, { Component, PureComponent } from "react";
import { Platform, StatusBar, StyleSheet, View, TouchableOpacity, Image, ImageBackground, Dimensions } from 'react-native';
import { Text, FAB, TextInput, Button, ActivityIndicator, Searchbar, Menu } from 'react-native-paper';
import Autocomplete from 'react-native-autocomplete-input';
import { FlatGrid } from 'react-native-super-grid';

import watch from "redux-watch";
import _ from "lodash";

import Swiper from 'react-native-swiper'
import { submitWaifu, toggleWishListWaifu, getRankColor } from '../redux/actions/dataActions'

// Redux stuff
import store from "../redux/store";
import {
  LOADING_UI,
  STOP_LOADING_UI,
  SET_SEARCH_DATA,
  SET_USER_CREDENTIALS
} from '../redux/types';

const { width, height } = Dimensions.get('window');
const chroma = require('chroma-js')
const favoriteHeart = require('../assets/images/FavoriteHeart.png')

class CharThumbNail extends PureComponent {
  constructor(props) {
    super(props);

    this.selectCharacter = props.selectCharacter;

    var char = props.char

    var isSubmitted = props.waifuList.map(x => x.link).includes(char.link);
    if(isSubmitted)
      char = props.waifuList.filter(x => x.link == char.link)[0]

    this.state = {
      char,
      isSubmitted,
      openMenu: false,
      popRank: char.popRank ?? null,
      rankColor: getRankColor(char.rank),
      userInfo: props.userInfo,
      waifuList: props.waifuList,
      users: props.users,
      isFav: props.userInfo == null ? false : props.userInfo.wishList.includes(char.link),
    }

    this.setOpenMenu = this.setOpenMenu.bind(this)
  }

  componentDidUpdate(props){
    this.selectCharacter = props.selectCharacter;

    var char = props.char

    var isSubmitted = props.waifuList.map(x => x.link).includes(char.link);
    if(isSubmitted)
      char = props.waifuList.filter(x => x.link == char.link)[0]

    this.state = {
      char,
      isSubmitted,
      openMenu: false,
      popRank: char.popRank ?? null,
      rankColor: getRankColor(char.rank),
      userInfo: props.userInfo,
      waifuList: props.waifuList,
      users: props.users,
      isFav: props.userInfo == null ? false : props.userInfo.wishList.includes(char.link),
    }
  }

  setOpenMenu(openMenu){
    this.setState({openMenu})
  }

  render(){
    var husbando = null;

    if(this.state.char.husbandoId){
      switch(this.state.char.husbandoId){
        case "Weekly":
        case "Daily":
          break;
        case "Shop":
          break;
        default:
          husbando = this.state.users.filter(x => x.userId == this.state.char.husbandoId)[0]
          break;
      }
    }

    return(
      <View style={{flex:1, position:"relative", marginTop: 10}}>
        <Menu
          visible={this.state.openMenu}
          onDismiss={() => this.setOpenMenu(false)}
          anchor={
            <TouchableOpacity
              activeOpacity={.25}
              onPress={() => this.selectCharacter(this.state.char)}
              delayLongPress={500}
              onLongPress={() => this.setOpenMenu(true)}
              style={[styles.itemContainer]}
            >
              {
                husbando != null ?
                  <View style={[styles.profileImg, { position:"absolute", zIndex: 3, top: 5, right: 5 }]}>
                    <Image style={[styles.profileImg]} source={{uri: husbando.img}} />
                  </View>
                : <></>
              }
  
              {
                this.state.isFav ?
                  <View style={{ height:25, width: 25, position:"absolute", zIndex: 3, top: 5, left: 5 }}>
                    <Image style={{height:25, width: 25}} source={favoriteHeart} />
                  </View>
                : <></>
              }
              
              <Image
                style={{
                  flex: 1,
                  resizeMode: "cover",
                  borderRadius: 10,
                  ...StyleSheet.absoluteFillObject,
                }}
                source={{uri: this.state.char.img}}
              />
              
              <View style={{minHeight: 50, height: 'auto',  padding: 2, backgroundColor: chroma(this.state.rankColor).alpha(.5), alignItems:"center", justifyContent:"center"}}>
                <Text style={{color: "white", fontFamily: "Edo", fontSize:22, textAlign: "center"}}>
                  {this.state.char.name.length > 15 ? this.state.char.name.slice(0,15) + '...' : this.state.char.name}
                </Text>
              </View>
            </TouchableOpacity>
          }
        >
          <Menu.Item titleStyle={{fontFamily:"Edo"}} onPress={() => this.toggleWishListWaifu(this.state.char.link)} title={this.state.isFav ? "Remove From WishList" : "Add To WishList"} />
  
          {/* {
            userInfo.submitSlots > 0  && !isSubmitted ?
              <Menu.Item titleStyle={{fontFamily:"Edo"}} onPress={() => submitWaifu(char)}
                title={"Submit"} />
            :<></>
          } */}
        </Menu>
      </View>
    )
  }
}

export default class SearchCharacters extends Component {
  constructor(props) {
    super(props);

    this.state = {
      navigation: props.navigation,
      goBackFunc: props.route.params.goBackFunc,
      type: props.route.params.type,
      origChars: props.route.params.chars,
      chars: _.cloneDeep(props.route.params.chars),
      userInfo: store.getState().user.creds,
      users : [{...store.getState().user.creds, waifus: store.getState().user.waifus }].concat(store.getState().user.otherUsers),
      waifuList: store.getState().data.waifuList,
      searchText: "",
      searchBarFocused: false
    };

    this.searchTextChange = this.searchTextChange.bind(this);
    this.selectCharacter = this.selectCharacter.bind(this)

    this.setSubscribes = this.setSubscribes.bind(this)
    this.unSetSubscribes = this.unSetSubscribes.bind(this)
  }

  setSubscribes(){
    this.state.goBackFunc(this.state.navigation)
    
    var navState = this.state.navigation.dangerouslyGetState().routes.filter(x => x.name == "SearchCharacters")[0].params;
    if(navState.autoLoad){
      navState.autoLoad = false
    }

    let dataReducerWatch = watch(store.getState, 'data')
    let userReducerWatch = watch(store.getState, 'user')

    this.dataUnsubscribe = store.subscribe(dataReducerWatch((newVal, oldVal, objectPath) => {
      this.setState({ waifuList: newVal.waifuList })
    }))

    this.userUnsubscribe = store.subscribe(userReducerWatch((newVal, oldVal, objectPath) => {
      this.setState({userInfo: newVal.creds})
    }))

    this.setState({
      waifuList: store.getState().data.waifuList,
      userInfo: store.getState().user.creds,
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

  searchTextChange(text){
    var items = _.cloneDeep(this.state.origChars);

    switch(this.state.type){
      case 'Anime-Manga':
        items = _.filter(items,function(item){
          return item.name.toLowerCase().includes(text.toLowerCase());
        });
        break;
      case 'Marvel':
      case 'DC':
        //check realnames, and aliases
        items = _.filter(items, function(item) {
          if(item.name.toLowerCase().includes(text.toLowerCase()) ||
            item.currentAlias.toLowerCase().includes(text.toLowerCase()) || 
            _.includes(item.realName.map(x => x.toLowerCase()), text) ||
            _.includes(item.aliases.map(x => x.toLowerCase()), text)) //check other alias name list
            return true
        });
        break;
    }

    this.setState({ searchText: text, chars: items })
  }

  selectCharacter(item){
    item.type = this.state.type;
    this.state.navigation.navigate("SeachCharacterDetails", {item})
  }

  render() {
    return (
      <>
        <View style={[styles.slideContainer,{backgroundColor: chroma('white').hex()}]}>
          <View style={{height: 50, width: width, backgroundColor: chroma('black').alpha(.15), justifyContent: "center", alignContent: "center"}}>
            <Text style={styles.text}>CHARACTERS</Text>
          </View>
          <View style={styles.slide}>
            <View style={styles.SeriesListView}>
              <FlatGrid
                itemDimension={100}
                items={this.state.chars}
                style={styles.gridView}
                spacing={10}
                renderItem={({item, index}) => 
                  <CharThumbNail waifuList={this.state.waifuList} users={this.state.users} char={item} userInfo={this.state.userInfo} selectCharacter={this.selectCharacter} />
                }
              />
            </View>
          </View>
        </View>

        <View style={[styles.searchBarView]}>
          <Searchbar
            placeholder="Search By Name"
            style={[styles.searchBar, {opacity: this.state.searchBarFocused ? 1 : .5}]}
            onBlur={() => this.setState({searchBarFocused: false})}
            onFocus={() => this.setState({searchBarFocused: true})}
            inputStyle={{fontFamily: "Edo", fontSize:15}}
            onChangeText={(text) => this.searchTextChange(text)}
            value={this.state.searchText}
          />
        </View>
      </>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:"black"
  },
  text: {
    color: "black",
    fontFamily: "Edo",
    fontSize: 40,
    textAlign: "center",
    alignSelf: "center",
    textShadowColor: chroma('teal').brighten().hex(),
    textShadowOffset: {width: -1, height: 1},
    textShadowRadius: 10,
  },
  image: {
    flex: 1,
    resizeMode: "cover",
    justifyContent: "center",
  },
  bgVideo:{
    position: "absolute",
    zIndex: 0
  },
  SeriesListView:{
    top: 0,
    bottom: 0,
    width: width,
    position:"absolute", zIndex: 1,
  },
  gridView: {
    flex: 1,
  },
  profileImg:{
    resizeMode: "cover",
    height: 45,
    width: 45,
    borderRadius: 50,
    overflow: "hidden",
    shadowColor: '#000',
    shadowOpacity: 1,
    elevation: 10,
  },
  itemContainer: {
    justifyContent: 'flex-end',
    borderRadius: 10,
    // padding: 10,
    height: 175,
    overflow: "hidden",
    shadowColor: '#000',
    shadowOpacity: 1,
    elevation: 5
  },
  slideContainer:{
    flex:1,
    alignItems: "center",
    justifyContent: "center"
  },
  slide: {
    flex: 1,
    width: width,
    position: "relative"
  },
  searchBarView:{
    width: width,
    position: 'absolute',
    zIndex: 10,
    left: 0,
    bottom: 12,
    justifyContent: "center",
    alignContent: "center"
  },
  searchBar:{
    width: width * .95,
    fontFamily: "Edo",
    fontSize: 15
  },
  fab: {
    position: 'absolute',
    zIndex: 10,
    margin: 8,
    right: 0,
    bottom: 0
  },
})

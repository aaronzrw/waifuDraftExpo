import React, { Component } from "react";
import { Platform, StatusBar, StyleSheet, View, TouchableOpacity, Image, ImageBackground, Dimensions } from 'react-native';
import { Text, FAB, TextInput, Button, ActivityIndicator, Searchbar, Menu } from 'react-native-paper';
import Autocomplete from 'react-native-autocomplete-input';
import { FlatGrid } from 'react-native-super-grid';

import _ from "lodash";
import ls from 'lz-string';

import Swiper from 'react-native-swiper'

//Expo
import { Video } from 'expo-av';

// Redux stuff
import store from '../redux/store';
import {
  LOADING_UI,
  STOP_LOADING_UI,
  SET_SEARCH_DATA,
} from '../redux/types';
import { toggleSeriesFavorite } from '../redux/actions/dataActions';

const AMImg = "https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/73b4b114-acd6-4484-9daf-599a5af85479/d2xp0po-60c4012a-a71f-48bf-a560-4d8f90c7f95d.png?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7InBhdGgiOiJcL2ZcLzczYjRiMTE0LWFjZDYtNDQ4NC05ZGFmLTU5OWE1YWY4NTQ3OVwvZDJ4cDBwby02MGM0MDEyYS1hNzFmLTQ4YmYtYTU2MC00ZDhmOTBjN2Y5NWQucG5nIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmZpbGUuZG93bmxvYWQiXX0.k24BMIyLR_76OgLMG_YL_TZV_IIHObYS8Kx4m5qq-Hk"
const MarvelImg = "https://firebasestorage.googleapis.com/v0/b/waifudraftunlimited.appspot.com/o/Marvel%20Covers%2FStorm.jpg?alt=media&token=0fed365b-921d-4cb9-922c-fd0beec2784b"
const DCImg = "https://firebasestorage.googleapis.com/v0/b/waifudraftunlimited.appspot.com/o/DC%20Covers%2Fwonderwoman.jpg?alt=media&token=dd8e28ea-c3b6-4b33-9382-96b67086e009"

const chroma = require('chroma-js');
const { width, height } = Dimensions.get('window');
const favoriteHeart = require('../assets/images/FavoriteHeart.png');

function SeriesThumbnail(props){
  const series = props.series;
  const selectSeries = props.selectSeries;

  const userInfo = store.getState().user.credentials;
  const isFav = userInfo.favoriteSeries.filter(x => x.type == props.seriesType).map(x => x.series).includes(series.name);

  const [isOpen, setOpen] = React.useState(false);

  return(
    <Menu
      visible={isOpen}
      onDismiss={() => setOpen(false)}
      anchor={
        <TouchableOpacity
          activeOpacity={.25}
          delayLongPress={500}
          onPress={() => selectSeries()}
          onLongPress={() => setOpen(true)}
          style={styles.itemContainer}
        >
          <Image
            style={{
              flex: 1,
              resizeMode: "cover",
              borderRadius: 10,
              opacity: 1,
              ...StyleSheet.absoluteFillObject,
              
            }}
            source={{uri: series.img}}
          />
          
          {
            isFav ?
              <View style={{ height:25, width: 25, position:"absolute", zIndex: 3, top: 5, left: 5 }}>
                <Image style={{height:25, width: 25}} source={favoriteHeart} />
              </View>
            : <></>
          }

          <View style={{height: 50,  padding: 2, backgroundColor: chroma('black').alpha(.75), alignItems:"center", justifyContent:"center"}}>
            <Text style={{color: "white", fontFamily: "Edo", fontSize:22, textAlign: "center"}}>{series.name.length > 15 ? series.name.slice(0,15) + '...' : series.name}</Text>
          </View>
        </TouchableOpacity>
      }
    >
      <Menu.Item titleStyle={{fontFamily:"Edo"}} onPress={() => toggleSeriesFavorite(props.seriesType, series.name).then(() => setOpen(false))} title={isFav ? "Remove From Favorites" : "Add To Favorites"} />
    </Menu>
  )
}

export default class Search extends Component {
  constructor(props) {
    super(props);

		store.dispatch({type: LOADING_UI})
    var searchItems = store.getState().data.searchItems;
    if(_.isEmpty(searchItems)){
      var compressSearchJson = require('../assets/SearchFile.json');
      searchItems = JSON.parse(ls.decompress(compressSearchJson));
      store.dispatch({ type: SET_SEARCH_DATA, payload: searchItems });
    }

    this.state = {
      navigation: props.navigation,
      origSearchItems: searchItems,
      searchItems: {
        'Anime-Manga': searchItems.views['Anime-Manga'].items,
        'Marvel': searchItems.views['Marvel'].items,
        'DC': searchItems.views['DC'].items,
      },
      searchText: {
        'Anime-Manga': "",
        Marvel: "",
        DC: ""
      },
      searchBarFocused: false,
      cards: [
        {
          id: 1,
          name: "Anime/Manga",
          view: "Anime-Manga",
          raised: false,
          img:
            "https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/73b4b114-acd6-4484-9daf-599a5af85479/d2xp0po-60c4012a-a71f-48bf-a560-4d8f90c7f95d.png?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7InBhdGgiOiJcL2ZcLzczYjRiMTE0LWFjZDYtNDQ4NC05ZGFmLTU5OWE1YWY4NTQ3OVwvZDJ4cDBwby02MGM0MDEyYS1hNzFmLTQ4YmYtYTU2MC00ZDhmOTBjN2Y5NWQucG5nIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmZpbGUuZG93bmxvYWQiXX0.k24BMIyLR_76OgLMG_YL_TZV_IIHObYS8Kx4m5qq-Hk",
        },
        {
          id: 2,
          name: "Marvel",
          view: "Marvel",
          raised: false,
          img:
            "https://firebasestorage.googleapis.com/v0/b/waifudraftunlimited.appspot.com/o/Marvel%20Covers%2FStorm.jpg?alt=media&token=0fed365b-921d-4cb9-922c-fd0beec2784b",
        },
        {
          id: 3,
          name: "DC",
          view: "DC",
          raised: false,
          img:
            "https://firebasestorage.googleapis.com/v0/b/waifudraftunlimited.appspot.com/o/DC%20Covers%2Fwonderwoman.jpg?alt=media&token=dd8e28ea-c3b6-4b33-9382-96b67086e009",
        },
      ],
    };
    
		store.dispatch({type: STOP_LOADING_UI})

    this.openDetails = this.openDetails.bind(this);
    this.searchTextChange = this.searchTextChange.bind(this);
    this.openWishListScreen = this.openWishListScreen.bind(this);
  }

  searchTextChange(view, text){
    var searchText = _.cloneDeep(this.state.searchText);
    var searchItems = _.cloneDeep(this.state.searchItems);
    var origSearchItems = _.cloneDeep(this.state.origSearchItems);
    var items = origSearchItems.views[view].items;

    if (text != "" && text != null) {
      switch(view){
        case 'Anime-Manga':
          items = _.filter(items, function (item) {
            return item.name.toLowerCase().includes(text.toLowerCase()) || item.items.map(x => x.name.toLowerCase()).includes(text.toLowerCase());
          });
          break;
        case 'Marvel':
        case 'DC':
          items = _.filter(items, function (item) {
            return item.name.toLowerCase().includes(text.toLowerCase());
          });
          break;
      }
    }

    searchText[view] = text;
    searchItems[view] = items;
    this.setState({ searchText, searchItems })
  }

  openDetails(view, item){
    var origChars = _.cloneDeep(this.state.origSearchItems.characters[view].items)

    switch(view){
      case 'Anime-Manga':
        var amNames = item.items.map(x => x.name.toLowerCase())
        var charData = _.filter(origChars, function (item) {
          if (item.animes.some(ele => amNames.includes(ele.toLowerCase())) ||
            item.mangas.some(ele => amNames.includes(ele.toLowerCase())))
            return true;
        })
        this.state.navigation.navigate("SearchSeries", { series: item.items, chars: charData})
        break;
      case 'Marvel':
      case 'DC':
        var charData = origChars.filter(x => x.teams.map(y => y.toLowerCase()).includes(item.name.toLowerCase()))        
        this.state.navigation.navigate("SearchCharacters", { chars: charData, type: view})
        break;
    }
  }

  loadCharacters(view){
    var chars = _.cloneDeep(this.state.origSearchItems.characters[view].items)
    this.state.navigation.navigate("SearchCharacters", {chars, type: view})
  }

  openWishListScreen(){
    this.state.navigation.navigate("ViewWishListCharacters", {})
  }

  render() {
    return (
      <View style={{flex: 1}}>
        <Swiper
          index={1}
          showsPagination={false}
          style={styles.container}
          bounces
        >
          <View style={styles.slideContainer}>
            <ImageBackground style={[styles.image,{backgroundColor: chroma.random().alpha(.15)}]} source={{uri: DCImg}}>
              <View style={styles.slide}>
                <Searchbar
                  placeholder="Search DC Team By Name"
                  style={[styles.searchBar, {width: width * .8, opacity: this.state.searchBarFocused ? 1 : .5}]}
                  onBlur={() => this.setState({searchBarFocused: false})}
                  onFocus={() => this.setState({searchBarFocused: true})}
                  inputStyle={{fontFamily: "Edo", fontSize:15}}
                  onChangeText={(text ) => this.searchTextChange('DC', text)}
                  value={this.state.searchText['DC']}
                />
                
                <View style={styles.SeriesListView}>
                  <FlatGrid
                    itemDimension={150}
                    items={this.state.searchItems['DC']}
                    style={styles.gridView}
                    spacing={20}
                    renderItem={({item, index}) => {
                      return(
                        <SeriesThumbnail series={item} seriesType={"DC"} selectSeries={() => this.openDetails('DC', item)} />
                      )
                    }}
                  />
                </View>
                
                <FAB
                  //small
                  color="white"
                  style={styles.fab}
                  icon="account-multiple"
                  onPress={() => this.loadCharacters('DC')}
                />
              </View>
            </ImageBackground>
          </View>
          <View style={styles.slideContainer}>
            <ImageBackground style={[styles.image,{backgroundColor: chroma.random().alpha(.95)}]} source={{uri: AMImg}}>
              <View style={styles.slide}>
                <Searchbar
                  placeholder="Search Anime/Manga By Name"
                  style={[styles.searchBar, {width: width * .8, opacity: this.state.searchBarFocused ? 1 : .5}]}
                  onBlur={() => this.setState({searchBarFocused: false})}
                  onFocus={() => this.setState({searchBarFocused: true})}
                  inputStyle={{fontFamily: "Edo", fontSize:15}}
                  onChangeText={(text ) => this.searchTextChange('Anime-Manga', text)}
                  value={this.state.searchText['Anime-Manga']}
                />
                
                <View style={styles.SeriesListView}>
                  <FlatGrid
                    itemDimension={150}
                    items={this.state.searchItems['Anime-Manga']}
                    style={styles.gridView}
                    spacing={20}
                    renderItem={({item, index}) => {
                      return(
                        <SeriesThumbnail series={item} seriesType={"Anime-Manga"} selectSeries={() => this.openDetails('Anime-Manga', item)} />
                      )
                    }}
                  />
                </View>
                
                <FAB
                  //small
                  color="white"
                  style={styles.fab}
                  icon="account-multiple"
                  onPress={() => this.loadCharacters('Anime-Manga')}
                />
              </View>
            </ImageBackground>
          </View>
          <View style={styles.slideContainer}>
            <ImageBackground style={[styles.image,{backgroundColor: chroma.random().alpha(.15)}]} source={{uri: MarvelImg}}>
              <View style={styles.slide}>
                <Searchbar
                  placeholder="Search Marvel Team By Name"
                  style={[styles.searchBar, {width: width * .8, opacity: this.state.searchBarFocused ? 1 : .5}]}
                  onBlur={() => this.setState({searchBarFocused: false})}
                  onFocus={() => this.setState({searchBarFocused: true})}
                  inputStyle={{fontFamily: "Edo", fontSize:15}}
                  onChangeText={(text ) => this.searchTextChange('Marvel', text)}
                  value={this.state.searchText['Marvel']}
                />
                
                <View style={styles.SeriesListView}>
                  <FlatGrid
                    itemDimension={150}
                    items={this.state.searchItems['Marvel']}
                    style={styles.gridView}
                    spacing={20}
                    renderItem={({item, index}) => {
                      return(
                        <SeriesThumbnail series={item} seriesType={"Marvel"} selectSeries={() => this.openDetails('Marvel', item)} />
                      )
                    }}
                  />
                </View>
                
                <FAB
                  //small
                  color="white"
                  style={styles.fab}
                  icon="account-multiple"
                  onPress={() => this.loadCharacters('Marvel')}
                />
              </View>
            </ImageBackground>
          </View>
        </Swiper>
        
        <FAB
          small
          color="white"
          style={styles.favFab}
          icon="heart-box"
          onPress={() => this.openWishListScreen()}
        />
      </View>
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
    color: "white",
    fontSize: 30,
    textAlign: "center"
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
    backgroundColor: chroma('black').alpha(.15),
  },
  gridView: {
    flex: 1,
  },
  itemContainer: {
    justifyContent: 'flex-end',
    borderRadius: 10,
    // padding: 10,
    height: 250,
    overflow: "hidden",
    shadowColor: '#000',
    shadowOpacity: 1,
    elevation: 10
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
  searchBar:{
    position: 'absolute',
    zIndex: 10,
    margin: 12,
    left: 0,
    bottom: 0,
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
  favFab: {
    position: 'absolute',
    zIndex: 10,
    margin: 8,
    right: 5,
    top: 5
  }
})

import React, { Component, PureComponent, createRef, forwardRef } from 'react';
import { Platform, StatusBar, StyleSheet, View, TouchableOpacity, Button, Image, ImageBackground, Dimensions, FlatList } from 'react-native';
import { Text, FAB, TouchableRipple } from 'react-native-paper';
import Swiper from 'react-native-swiper'

import { FlatGrid } from 'react-native-super-grid';
import { getSearchData } from '../redux/actions/dataActions';
import { useNavigation } from '@react-navigation/native';

import _ from 'lodash';
const chroma = require('chroma-js')

function Row({ item, index }) {
  var styleRow = index % 2 == 0 ? styles.rowEven : styles.rowOdd;

  return (
    <View style={[styleRow, {flex: 1}]}>
      <Text style={[styles.text, {fontSize: 25}]}>{item}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    margin: 8,
    right: 0,
    bottom: 4,
    backgroundColor: chroma('aqua').hex()
  },
  text:{
    textAlign:"center",
    fontFamily:"Edo",
  },
  rowOdd:{
    backgroundColor: "rgba(255,255,255,.025)",
    marginBottom: 5
  },
  rowEven:{
    backgroundColor: "rgba(0,0,0,.025)",
    marginBottom: 5
  },
  nameView:{
    height:'auto',
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,.75)",
  },
  titleView:{
    height: 50,
    backgroundColor: chroma('black').alpha(.05),
    shadowColor: '#000',
    shadowOpacity: 1,
    elevation: 1
  },
  titleShadow:{
    textShadowColor: chroma('red').brighten().hex(),
    textShadowOffset: {width: -1, height: 1},
    textShadowRadius: 10
  },
  nameText:{
    color:"white"
  },
  flatListView: {
    flex:1,
    backgroundColor: chroma('white').alpha(.05)
  },
  quoteView:{
    flex:1,
    backgroundColor:"rgba(255,255,255,.75)",
    justifyContent: "center",
    alignItems: "center"
  },
  quote:{
    flex: 1,
    textAlign:"center",
    fontFamily:"Edo",
    fontSize: 18,
    margin: 0,
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
  }
});

const { width, height } = Dimensions.get('window');
const ComicCharDetails = ({ waifu }) => {
  //Comic Variables
  const [detailViewHeight, setDetailViewHeight] = React.useState(height);
  const onLayout = (e) => {
    //setDetailViewHeight(e.nativeEvent.layout.height)
  }

  var aliases = [];
  if(waifu.currentAlias != null){
    aliases.push(waifu.currentAlias)
  }

  aliases = _.uniq(aliases.concat(waifu.aliases.filter(x => x != waifu.currentAlias && waifu.name)));

  var searchItems = getSearchData();
  var teams = searchItems.views[waifu.type].items.filter(x => waifu.teams.includes(x.name))
  teams = _.orderBy(teams, ["name"], ['asc'])

  const navigation = useNavigation();
  return(
    <View style={styles.container}>
      {/* <Swiper
        index={0}
        horizontal={false}
        showsPagination={false}
        removeClippedSubviews
        automaticallyAdjustContentInsets
        bounces
        loadMinimal
      > */}

        <View style={styles.container} onLayout={onLayout}>
          {/* Tags */}
          {/* <View style={{height: 150}}>
            <View  style={{height: 50}}>
              <Text style={{fontFamily:"Edo", fontSize: 30, textAlign:"center"}}>Characteristics</Text>
            </View>
            <View style={{height: 100, alignItems:"center", justifyContent:"center", flexDirection: "row"}}>
              {tags.map(x => {
                return(
                  <Text key={x} style={[styles.text]}>{x}</Text>
                )
              })}
            </View>
          </View> */}

          {/* Appearances */}
          <View style={{flex: 1}}>
            <View style={{flex:1}}>
              <View style={styles.titleView}>
                <Text style={[styles.text, styles.titleShadow, {fontSize: 40, color:"white"}]}>Aliases</Text>
              </View>
              <View style={styles.flatListView}>
                <FlatList
                  data={aliases}
                  renderItem={({ item, index }) => <Row item={item} index={index} />}
                  keyExtractor={item => item}
                />
              </View>
            </View>

            <View style={{flex:3}}>
              <View style={styles.titleView}>
                <Text style={[styles.text, styles.titleShadow, {fontSize: 40, color:"white"}]}>Teams</Text>
              </View>

              <View style={styles.flatListView}>
                <FlatGrid
                  itemDimension={150}
                  items={teams}
                  style={styles.container}
                  spacing={10}
                  renderItem={({item, index}) =>
                    <TouchableOpacity activeOpacity={.25}
                      style={[styles.itemContainer]}
                      onPress={() => {
                        var navState = navigation.dangerouslyGetState()
                        var chars = searchItems.characters[waifu.type].items.filter(x => x.teams.includes(item.name));

                        if(navState.routeNames.includes("Search")){
                          navigation.jumpTo("Search", {screen :"Search", params: { searchText: item.name, chars, type: waifu.type, autoLoad: true}})
                        }
                        else{
                          navigation.navigate("Search", {screen :"Search", params: { searchText: item.name, chars, type: waifu.type, autoLoad: true}})
                        }
                      }}
                    >
                      <Image
                        style={{
                          flex: 1,
                          resizeMode: "cover",
                          borderRadius: 10,
                          opacity: 1,
                          ...StyleSheet.absoluteFillObject,
                          
                        }}
                        source={{uri: item.img}}
                      />

                      <View style={{height: 50,  padding: 2, backgroundColor: chroma('black').alpha(.75), alignItems:"center", justifyContent:"center"}}>
                        <Text style={{color: "white", fontFamily: "Edo", fontSize:22, textAlign: "center"}}>{item.name.length > 15 ? item.name.slice(0,15) + '...' : item.name}</Text>
                      </View>
                    </TouchableOpacity>
                  }
                />
              </View>
            </View>
          </View>
        </View>
      
      {/*         
        {waifu.quote != "" ?
          <View style={styles.quoteView}>
            <Text style={styles.quote}>
              {waifu.desc}
            </Text>
          </View>
          :
          <></>
        }

      </Swiper> */}
    </View>
  );
}

export default ComicCharDetails;
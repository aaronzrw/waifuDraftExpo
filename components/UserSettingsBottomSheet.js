import React, { Component, PureComponent, createRef, forwardRef, useRef, useState } from 'react';
import { Platform, StatusBar, StyleSheet, View, TouchableOpacity, Button, Image, ImageBackground, Dimensions, FlatList, Animated } from 'react-native';
import { Text, FAB, TouchableRipple } from 'react-native-paper';
import Icon from 'react-native-vector-icons/FontAwesome';

import Swiper from 'react-native-swiper'
import { Modalize } from 'react-native-modalize';

import { FlatGrid } from 'react-native-super-grid';
import { useNavigation } from '@react-navigation/native';

import { logoutUser } from '../redux/actions/userActions'
import { getSearchData, switchDraft } from '../redux/actions/dataActions';


import _ from 'lodash';
import store from '../redux/store';
const chroma = require('chroma-js')

const HEADER_HEIGHT = 25
const { width, height } = Dimensions.get('window');


async function addNewDaily(){
  var draftPath = store.getState().draft.path
  var searchItems = getSearchData();

  var waifuLinks = await firebase.firestore().collection(`${draftPath}/waifus`).get()
  .then((docs) => {
    var links = []
    docs.forEach(x => {
      links.push(x.data().link)
    })

    return links
  });

  const characters = searchItems.characters;
  characters['Anime-Manga'].items = characters['Anime-Manga'].items.filter(x => !waifuLinks.includes(x.link));
  characters['Marvel'].items = characters['Marvel'].items.filter(x => !waifuLinks.includes(x.link));
  characters['DC'].items = characters['DC'].items.filter(x => !waifuLinks.includes(x.link));

  var newWaifu = null;
  while (newWaifu == null) {
    var newWaifu = getRandWaifu(characters);
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

  await firebase.firestore().collection(`${draftPath}/waifus`).add(newWaifu)
  .then(doc => {
    newWaifu.waifuId = doc.id
    return firebase.firestore().collection(`${draftPath}/waifus`).add(newWaifu);
  });
}

function getRandWaifu(characters) {
  return _.shuffle(characters)[Math.floor(Math.random() * characters.length)];
}

async function addFavoritieSeries(){
  var draft = store.getState().draft;
  (await firebase.firestore().collection(`users`).get()).docs.forEach(user => {
    user.ref.update({currentDraftId: "6FDG"})
  })
}

function recreateWeeklyPoll(){
  console.log("remake")
}

function createWaifuBackUp(){
  var draftPath = store.getState().draft.path
  firebase.firestore().collection(`${draftPath}/waifus`).get()
  .then(async (docs) => {
    var waifus = [];
    docs.forEach(x => {
      waifus.push({docId: x.id, ...x.data()})
    });
          
    waifus.forEach(async x => {
      var id = x.docId;
      var waifu = _.cloneDeep(x);
      delete waifu.docId;

      await firebase.firestore().collection(`${draftPath}/waifus-bk`).doc(id).set(waifu);
    })
  })
}

const UserSettingsBottomSheet = forwardRef(({ animated, drafts }, ref) => {
  animated = new Animated.Value(0);
  const navigation = useNavigation();
  
  const ssRef = useRef(null);
  const modalizeRef = useRef(null);

  const user = store.getState().user.creds;
  const [handle, setHandle] = useState(false);

  const handlePosition = position => {
    setHandle(position === 'top');
    if(position !== 'top')
      resetSwiper()
  };

  const resetSwiper = () => {
    ssRef.current.scrollBy(0 - ssRef.current.state.index)
  }
  
  var userActions =
  [
    { icon: 'sign-out',
      label: 'Logout',
      onPress: () => logoutUser()
    },
    { 
      icon: 'search-plus',
      label: 'Search For Draft',
      onPress: () => {
        navigation.navigate("FindDraft")
      }
    },
    { 
      icon: 'exchange',
      label: 'Switch Draft',
      onPress: () => {
        ssRef.current.scrollBy(1)
      }
    }
  ]

  if(user.isAdmin){
    userActions = userActions.concat([
      { icon: 'plus-square',
        label: 'Add New Daily',
        onPress: () => addNewDaily()
      },
      { icon: 'heart',
        label: 'Add Favorite Series',
        onPress: () => addFavoritieSeries()
      },
      { icon: 'archive',
        label: 'Create Waifu Backup',
        onPress: () => createWaifuBackUp()
      }
    ])
  }

  const renderContent = () => (
    <>
      <Animated.View
        style={
          {
            opacity: animated.interpolate({
              inputRange: [0, 0.75],
              outputRange: [1, 0],
            }),
            opacity: handle ? 0 : 1,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 10,
            borderTopLeftRadius: 10, borderTopRightRadius: 10,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: chroma('black').alpha(.05),
            height: 25,
          }
        }
      >
        <Text onPress={() => modalizeRef.current.open('top')} style={{fontSize: 18, textAlign: "center", fontFamily:"Edo"}}>Settings</Text>
      </Animated.View>
      
      <View style={{ height: 250, width: width, backgroundColor: 'white', padding: 16,
        // borderLeftWidth: 1, borderRightWidth: 1, borderTopWidth: 1, 
        borderTopLeftRadius: 20, borderTopRightRadius: 20
      }}>
        <Swiper
          index={0}
          ref={ssRef}
          scrollEnabled={false}
          horizontal={false}
          showsPagination={false}
        >
          <View style={{flex:1}}>
            <FlatGrid
              itemDimension={75}
              items={userActions}
              style={[styles.gridView]}
              renderItem={({item, index}) => {
                return(
                  <TouchableOpacity activeOpacity={.25}
                    onPress={() => item.onPress()} 
                    style={[styles.settingsContainer, {padding: 8, backgroundColor: chroma('white') }]}
                  >
                    <View style={{flex: 1}}>
                      <Icon
                        name={item.icon}
                        size={25}
                        color='black'
                      />
                    </View>
                    <Text style={{height: 'auto', textAlign: "center", fontFamily: "Edo", fontSize: 10}}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                )
              }}
            />
          </View>

          <View style={{flex:1}}>
            <FlatGrid
              itemDimension={100}
              items={drafts}
              style={styles.gridView}
              renderItem={({item, index}) => {
                return(
                  <TouchableOpacity activeOpacity={.25}
                    onPress={() => {
                      switchDraft(item.id)
                      resetSwiper()
                      modalizeRef.current.close('alwaysOpen')
                    }} 
                    style={[styles.draftContainer, {backgroundColor: index % 2 ? chroma('white').alpha(.75) : chroma('black').alpha(.75)}]}
                  >
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
                  </TouchableOpacity>
                )
              }}
            />
          </View>
        </Swiper>
      </View>
    </>
  );

  return (
    <Modalize
      ref={modalizeRef}
      panGestureAnimatedValue={animated}
      alwaysOpen={25}
      snapPoint={HEADER_HEIGHT}
      withHandle={handle}
      adjustToContentHeight={true}
      handlePosition="inside"
      handleStyle={{ top: 13, width: 40, height: handle ? 6 : 0, backgroundColor: '#bcc0c1' }}
      onPositionChange={handlePosition}
      onClosed={() => resetSwiper()}
      onOverlayPress={() => resetSwiper()}
    >
      {renderContent()}
    </Modalize>
  );
})


const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    alignItems:"center",
    justifyContent: "center",
    backgroundColor: chroma('white').alpha(.75),
  },
  content__header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    height: HEADER_HEIGHT,

    paddingHorizontal: 30,
    paddingBottom: 5,
  },

  content__cover: {
    zIndex: 100,

    marginTop: -132, // not the best
    marginLeft: -115, // not the best

    width: 360,
    height: 360,

    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
  },

  content__asset: {
    width: '100%',
    height: '100%',
  },

  content__title: {
    paddingLeft: 90,
    marginRight: 'auto',

    fontSize: 18,
  },

  content__inner: {
    top: 200,
    left: 30,
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
})

export default UserSettingsBottomSheet;
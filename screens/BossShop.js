import React, { Component, PureComponent, createRef, forwardRef } from 'react';
import { Platform, StatusBar, StyleSheet, View, TouchableOpacity, Image, ImageBackground, Dimensions, FlatList } from 'react-native';
import { Text, TouchableRipple, Card, Button } from 'react-native-paper';
import { FlatGrid } from 'react-native-super-grid';

import _ from 'lodash'
import Swiper from 'react-native-swiper'

//Media
import defIcon from '../assets/images/defIcon.png'
import atkIcon from '../assets/images/atkIcon.png'

//Redux
import store from '../redux/store';
import watch from 'redux-watch'

const chroma = require('chroma-js')
const { width, height } = Dimensions.get('window');

export default class BossShop extends Component {
  constructor(props) {
    super();

    this.mounted = true;
    this.state = {
      navigation: props.navigation,
			loading: store.getState().data.loading,
      userInfo: store.getState().user.creds,
      shopItems: store.getState().data.bossItems,
      size: {width,height}
    };

    this.selectItem = this.selectItem.bind(this)
    this.setSubscribes = this.setSubscribes.bind(this)
    this.unSetSubscribes = this.unSetSubscribes.bind(this)
  }
  
  setSubscribes(){
    let dataReducerWatch = watch(store.getState, 'data')
    let userReducerWatch = watch(store.getState, 'user')

    this.dataUnsubscribe = store.subscribe(dataReducerWatch((newVal, oldVal, objectPath) => {
			this.setState({ shopItems: newVal.bossItems })
    }))

    this.userUnsubscribe = store.subscribe(userReducerWatch((newVal, oldVal, objectPath) => {
      this.setState({ userInfo: newVal.creds })
    }))
    
    this.setState({ shopItems: store.getState().data.bossItems, userInfo: store.getState().user.creds })
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
    this.mounted = false;
  }

  selectItem(item){
    this.state.navigation.navigate("BuyWaifu", {waifu})
  }

  render(){
    return (
      <>
        {this.state.loading ?
          <></>
        :
          <View style={styles.waifuListView}>
            <View style={{width: width, height: 50, backgroundColor: chroma('white')}}>
              <Text style={styles.text}>BOSS SHOP</Text>
            </View>

            <FlatGrid
              itemDimension={250}
              items={this.state.shopItems}
              style={styles.gridView}
              // staticDimension={300}
              // fixed
              // spacing={20}
              renderItem={({item, index}) => {

                return(
                  <TouchableOpacity activeOpacity={.25} onPress={() => this.selectItem(item)} style={styles.itemContainer}>
                    <Image
                      style={{
                        flex: 1,
                        aspectRatio: 1,
                        resizeMode: "contain",
                        borderRadius: 10,
                        ...StyleSheet.absoluteFillObject,
                        
                      }}
                      source={{uri: item.img}}
                    />
                    <View style={{ padding: 2, backgroundColor: chroma('black').alpha(.75), alignItems:"center", justifyContent:"center"}}>
                      <Text style={{color: "white", fontFamily: "Edo", fontSize:30, textAlign: "center"}}>{item.userName}</Text>
                      
                      {/* <Text style={{color: "white", fontFamily: "Edo", fontSize:22, textAlign: "center"}}>POINTS - {item.points}</Text> */}
                      {/* <Text style={{color: "white", fontFamily: "Edo", fontSize:22, textAlign: "center"}}>SUBMIT SLOTS - {item.submitSlots}</Text> */}
                      <Text style={{color: "white", fontFamily: "Edo", fontSize:22, textAlign: "center"}}>{item.price} Boss Coins</Text>
                    </View>
                  </TouchableOpacity>
                )
              }}
            />
          </View>
        }
      </>
    );
  }
}

BossShop.navigationOptions = {
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
    backgroundColor: chroma('red').alpha(1),
  },
  gridView: {
    flex: 1,
  },
  itemContainer: {
    justifyContent: 'flex-end',
    borderRadius: 10,
    // padding: 10,
    height: 150,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 1,
    elevation: 10,
    backgroundColor: chroma("white")
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
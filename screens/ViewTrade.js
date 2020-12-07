import React, { Component, PureComponent, createRef, forwardRef } from 'react';
import { Platform, StatusBar, StyleSheet, View, TouchableOpacity, Image, ImageBackground, Dimensions, FlatList } from 'react-native';
import { Text, FAB, TouchableRipple, Card, Button, Avatar } from 'react-native-paper';
import { FlatGrid } from 'react-native-super-grid';

import _ from 'lodash'

//Media
import defIcon from '../assets/images/defIcon.png'
import atkIcon from '../assets/images/atkIcon.png'
import pointsIcon from '../assets/images/pointsIcon.png'
import rankCoinIcon from '../assets/images/rankCoinIcon.png'
import statCoinIcon from '../assets/images/statCoinIcon.png'

//Redux
import store from '../redux/store';
import watch from 'redux-watch'

//Component
import RankBackground from '../components/RankBackGround'
import { updateTrade, getRankColor } from '../redux/actions/dataActions';

const chroma = require('chroma-js')
const { width, height } = Dimensions.get('window');

const StatAvatar = (props) => {

  if(props.value == 0)
    return <></>

  return (
    <View style={{alignSelf:"center", justifyContent: 'center', height: 75, margin: 8}}>
      <Avatar.Icon size={50} icon={props.icon} color={'white'} style={{backgroundColor: 'transparent'}}/>
      <Text style={[ styles.statsText, {color: "white", textAlign: 'center'}]}>{props.value}</Text>
    </View>
  )
};

export default class ViewTrade extends Component {
  constructor(props) {
    super();
    this.mounted = true;

    var users = [{...store.getState().user.creds, waifus: store.getState().user.waifus }].concat(store.getState().user.otherUsers);
    this.state = {
      navigation: props.navigation,
      goBackFunc: props.route.params.goBackFunc,
      trade: props.route.params.trade,
			loading: store.getState().data.loading,
      waifuList: store.getState().data.waifuList,
      fromUser: users.filter(x => x.userId == props.route.params.trade.from.husbandoId)[0],
      toUser: users.filter(x => x.userId == props.route.params.trade.to.husbandoId)[0],
      userInfo: {...store.getState().user.creds, waifus: store.getState().user.waifus},
      size: {width,height},
    };

    this.setSubscribes = this.setSubscribes.bind(this)
    this.unSetSubscribes = this.unSetSubscribes.bind(this)
    this.updateTrade = this.updateTrade.bind(this)
  }
  
  setSubscribes(){
    this.state.goBackFunc(this.state.navigation)

    let dataReducerWatch = watch(store.getState, 'data')
    let userReducerWatch = watch(store.getState, 'user')

    this.dataUnsubscribe = store.subscribe(dataReducerWatch((newVal, oldVal, objectPath) => {
      var trade = newVal.trades.filter(x => x.id == this.state.trade.id);
      
      if(!_.isEmpty(trade)){
        this.setState({
          trade: trade[0],
        })
      }
      else{
        this.state.navigation.goBack()
      }
    }))

    this.userUnsubscribe = store.subscribe(userReducerWatch((newVal, oldVal, objectPath) => {
      var users = [{...newVal.creds, waifus: newVal.waifus }].concat(newVal.otherUsers)
      var fromUser = users.filter(x => x.userId == this.state.trade.from.husbandoId)[0];
      var toUser = users.filter(x => x.userId == this.state.trade.to.husbandoId)[0];

      this.setState({fromUser, toUser, userInfo: {...newVal.creds, waifus: newVal.waifus} })
    }))
    
    var users = [{...store.getState().user.creds, waifus: store.getState().user.waifus }].concat(store.getState().user.otherUsers);
    var trade = store.getState().data.trades.filter(x => x.id == this.state.trade.id);
    if(!_.isEmpty(trade)){
      this.setState({
        trade: trade[0],
        fromUser: users.filter(x => x.userId == this.state.trade.from.husbandoId)[0],
        toUser: users.filter(x => x.userId == this.state.trade.to.husbandoId)[0],
        userInfo: {...store.getState().user.creds, waifus: store.getState().user.waifus}
      })
    }
    else{
      this.state.navigation.goBack()
    }
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

  async updateTrade(status){

    this.state.navigation.goBack()
    await updateTrade(this.state.trade, status);
  }

  render(){
    var canAccept = false;
    const trade = this.state.trade;

    const fromWaifus = trade.from.waifus ?? [];
    const toWaifus = trade.to.waifus ?? [];
    if(trade.from.points <= this.state.fromUser.points && trade.to.points <= this.state.toUser.points &&
      trade.from.statCoins <= this.state.fromUser.statCoins && trade.to.statCoins <= this.state.toUser.statCoins &&
      trade.from.rankCoins <= this.state.fromUser.rankCoins && trade.to.rankCoins <= this.state.toUser.rankCoins){
				var tt = _.difference(fromWaifus.map(x => x.waifuId), this.state.fromUser.waifus.map(x => x.waifuId)).length;
				var te = _.difference(toWaifus.map(x => x.waifuId), this.state.toUser.waifus.map(x => x.waifuId)).length;
				canAccept = tt == 0 && te == 0;
    }
    
    return (
      <>
        {this.state.loading ?
          <></>
        :
          <View style={styles.waifuListView}>
            <View style={{flex: 1, width: width}}>
              {/* To Section */}
              <View style={{flex: 1, width: width}}>
                <View style={{backgroundColor: chroma('black').alpha(.35)}}>
                  <Text style={[styles.text, {color: "white", textAlign: "center"}]}>TO - {this.state.toUser.userName}</Text>
                </View>

                <ImageBackground style={{flex: 1, width: width, backgroundColor: chroma('black')}} imageStyle={{resizeMode:"cover", opacity: .5}} source={{uri: this.state.toUser.img}}>
                  <View style={{...StyleSheet.absoluteFillObject, zIndex: 20, marginLeft: width - 50, width: 50,
                      backgroundColor: chroma('silver').alpha(.15), justifyContent:"center", alignItems:"center"}}>
                    <StatAvatar icon={pointsIcon} value={this.state.trade.to.points} />
                    <StatAvatar icon={statCoinIcon} value={this.state.trade.to.statCoins} />
                    <StatAvatar icon={rankCoinIcon} value={this.state.trade.to.rankCoins} />
                  </View>

                  <FlatGrid
                    itemDimension={150}
                    items={this.state.waifuList.filter(x => this.state.trade.to.waifus.map(x => x.waifuId).includes(x.waifuId))}
                    style={styles.gridView}
                    spacing={20}
                    renderItem={({item, index}) => {
                      var rankColor = getRankColor(item.rank)

                      return(
                        <View style={[styles.itemContainer]}>
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
                        </View>
                      )
                    }}
                  />
                </ImageBackground>
              </View>
            
              {/* From Section */}
              <View style={{flex: 1, width: width}}>
                <View style={{backgroundColor: chroma('black').alpha(.35)}}>
                  <Text style={[styles.text, {color: "white", textAlign: "center"}]}>FROM - {this.state.fromUser.userName}</Text>
                </View>
                
                <ImageBackground style={{flex: 1, width: width, backgroundColor: chroma('black')}} imageStyle={{resizeMode:"cover", opacity: .5}} source={{uri: this.state.fromUser.img}}>
                  <View style={{...StyleSheet.absoluteFillObject, zIndex: 20, marginLeft: width - 50, width: 50,
                    backgroundColor: chroma('silver').alpha(.15), justifyContent:"center", alignItems:"center"}}>
                    <StatAvatar icon={pointsIcon} value={this.state.trade.from.points} />
                    <StatAvatar icon={statCoinIcon} value={this.state.trade.from.statCoins} />
                    <StatAvatar icon={rankCoinIcon} value={this.state.trade.from.rankCoins} />
                  </View>
                  
                  <FlatGrid
                    itemDimension={150}
                    items={this.state.waifuList.filter(x => this.state.trade.from.waifus.map(x => x.waifuId).includes(x.waifuId))}
                    style={styles.gridView}
                    spacing={20}
                    renderItem={({item, index}) => {
                      var rankColor = getRankColor(item.rank)

                      return(
                        <View style={[styles.itemContainer]}>
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
                        </View>
                      )
                    }}
                  />
                </ImageBackground>
              </View>
            </View>

            {/* if curr user is To User - Reject/Accept */}
            { 
              this.state.toUser.userId == this.state.userInfo.userId && this.state.trade.status == "Active" ?
                <View style={styles.buttonRowView}>
                  <View style={styles.buttonItem}>
                    <Button
                      onPress={() => this.updateTrade('Rejected')}
                      mode={"contained"} color={chroma('aqua').hex()} 
                      labelStyle={{fontSize: 20, fontFamily: "Edo"}}
                    >
                      Reject
                    </Button>
                  </View>
    
                  <View style={styles.buttonItem}>
                    <Button
                      onPress={() => this.updateTrade('Accepted')}
                      disabled={ this.state.pollIsActive }
                      mode={"contained"} color={chroma('aqua').hex()} 
                      labelStyle={{fontSize: 20, fontFamily: "Edo"}}
                    >
                      Accept
                    </Button>
                  </View>
                </View>
              : <></>
            }

            
            {/* if curr user is To User - Reject/Accept */}
            { 
              this.state.fromUser.userId == this.state.userInfo.userId && this.state.trade.status == "Active" ?
                <View style={styles.buttonRowView}>
                  <View style={styles.buttonItem}>
                    <Button
                      onPress={() => this.updateTrade('Cancelled')}
                      mode={"contained"} color={chroma('aqua').hex()} 
                      labelStyle={{fontSize: 20, fontFamily: "Edo"}}
                    >
                      Cancel
                    </Button>
                  </View>
                </View>
              : <></>
            }
          </View>
        }
      </>
    );
  }
}

ViewTrade.navigationOptions = {
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
  tradePointsView:{
    height: 175,
    width: width,
    backgroundColor: chroma('black').alpha(.25),
    padding: 8,
    alignItems: "center",
    justifyContent: "center"
  },
  text:{
    fontFamily: "Edo",
    fontSize: 35,
    // textAlign: "center"
  },
  titleView:{
    flex: 1,
    position: "absolute",
    bottom: 0,
  },
  waifuListView:{
    flex:1,
    width: width,
    backgroundColor: chroma('white').darken(),
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
  },
  pointsView:{
    height:30, flexDirection: "row",
    justifyContent: "center", alignItems:"center",
    // position: "absolute", top: 0, zIndex: 2,
    paddingTop: 10, paddingBottom: 10, paddingLeft: 10
  },
  pointsReviewRow:{
    flex: 1,
    flexDirection: "row",
    alignItems:"center",
    justifyContent: "center"
  },
  pointsRow:{
    height: 35,
    flex:1,
    flexDirection: "row",
    alignItems:"center",
    justifyContent: "center"
  },
  buttonRowView: {
    height: 50,
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
  fab: {
    position: 'absolute',
    right: 8,
    bottom: 60,
    backgroundColor: chroma('aqua').hex()
  },
})
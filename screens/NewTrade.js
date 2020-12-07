import React, { Component, PureComponent, createRef, forwardRef } from 'react';
import { Platform, StatusBar, StyleSheet, View, TouchableOpacity, Image, ImageBackground, Dimensions, FlatList } from 'react-native';
import { Text, FAB, TouchableRipple, Card, Button, Avatar } from 'react-native-paper';
import { FlatGrid } from 'react-native-super-grid';

import _ from 'lodash'
import Swiper from 'react-native-swiper'
import NumericInput from 'react-native-numeric-input'

//Media
import defIcon from '../assets/images/defIcon.png'
import atkIcon from '../assets/images/atkIcon.png'
import pointsIcon from '../assets/images/pointsIcon.png'
import submitSlotsIcon from '../assets/images/submitSlotIcon.png'
import rankCoinIcon from '../assets/images/rankCoinIcon.png'
import statCoinIcon from '../assets/images/statCoinIcon.png'

//Redux
import store from '../redux/store';
import watch from 'redux-watch';
import {
  SET_SNACKBAR,
} from '../redux/types';

//Component
import RankBackground from '../components/RankBackGround'
import { submitTrade, getRankColor } from '../redux/actions/dataActions';

const chroma = require('chroma-js')
const favoriteHeart = require('../assets/images/FavoriteHeart.png')
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

export default class NewTrade extends Component {
  constructor(props) {
    super();

    this.mounted = true;
    this.state = {
      navigation: props.navigation,
      goBackFunc: props.route.params.goBackFunc,
			loading: store.getState().data.loading,
      waifuList: store.getState().data.waifuList,
      pollIsActive: store.getState().data.poll.weekly.isActive,
      userInfo: {...store.getState().user.creds, waifus: store.getState().user.waifus},
      otherUser: props.route.params.otherUser,
      size: {width,height},
      tradeFrom: {
        points: 0,
        // submitSlots: 0,
        rankCoins: 0,
        statCoins: 0,
        waifus: []
      },
      tradeTo: {
        points: 0,
        // submitSlots: 0,
        rankCoins: 0,
        statCoins: 0,
        waifus: []
      },
      fromTradeIsValid: false,
      toTradeIsValid: false
    };

    this.setSubscribes = this.setSubscribes.bind(this)
    this.unSetSubscribes = this.unSetSubscribes.bind(this)

    this.handleSlideChange = this.handleSlideChange.bind(this)
    this.selectWaifu = this.selectWaifu.bind(this)
    this.submitTrade = this.submitTrade.bind(this)
  }
  
  setSubscribes(){
    this.state.goBackFunc(this.state.navigation)

    let dataReducerWatch = watch(store.getState, 'data')
    let userReducerWatch = watch(store.getState, 'user')

    this.dataUnsubscribe = store.subscribe(dataReducerWatch((newVal, oldVal, objectPath) => {
			this.setState({ pollIsActive: newVal.poll.weekly.isActive, waifuList: newVal.waifuList  })
    }))

    this.userUnsubscribe = store.subscribe(userReducerWatch((newVal, oldVal, objectPath) => {
      var otherUser = newVal.otherUsers.filter(x => x.userId == this.state.otherUser.userId)[0]
      this.setState({otherUser, userInfo: {...newVal.creds, waifus: newVal.waifus} })
    }))
    
    var otherUser = store.getState().user.otherUsers;
    this.setState({
      userInfo: {...store.getState().user.creds, waifus: store.getState().user.waifus},
      waifuList: store.getState().data.waifuList,
      otherUser: otherUser.filter(x => x.userId == this.state.otherUser.userId)[0],
      pollIsActive: store.getState().data.poll.weekly.isActive,
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
    
    store.dispatch({
      type: SET_SNACKBAR,
      payload: {type: "info", message: `10% Tax Will Be Applied To Any Traded Points`}
    });
  }

  componentWillUnmount(){
    this._navFocusUnsubscribe();
    this._navBlurUnsubscribe();
    this.mounted = false;
  }
  
  handleSlideChange(slide){
    switch(slide){
      case "back":
        this.refs.swiper.scrollBy(-1)
        break;
      case "next":
        this.refs.swiper.scrollBy(1)
        break;
    }
  }
  
  selectWaifu(tradeType,waifu){
    var fromTradeIsValid = false;
    var toTradeIsValid = false;
    var from = this.state.tradeFrom;
    var to = this.state.tradeTo;

    switch(tradeType){
      case "from":
          if(from.waifus.map(x => x).includes(waifu.waifuId))//if already selected then remove
            from.waifus = from.waifus.filter(x => x != waifu.waifuId);
          else
            from.waifus.push(waifu.waifuId)
        break;
      case "to":
        if(to.waifus.map(x => x).includes(waifu.waifuId))//if already selected then remove
          to.waifus = to.waifus.filter(x => x != waifu.waifuId);
        else
          to.waifus.push(waifu.waifuId)
        break;
    }

    // if(from.points != 0 || from.submitSlots != 0 || from.waifus.length != 0)
    if(from.points != 0 || from.rankCoins != 0 || from.statCoins != 0 || from.waifus.length != 0)
      fromTradeIsValid = true

    // if(to.points != 0 || to.submitSlots != 0 || to.waifus.length != 0)
    if(to.points != 0  || to.rankCoins != 0 || to.statCoins != 0 ||  to.waifus.length != 0)
      toTradeIsValid = true

    this.setState({tradeFrom: from, tradeTo: to, fromTradeIsValid, toTradeIsValid})
  }

  async submitTrade(){
    var from = this.state.tradeFrom;
    var to = this.state.tradeTo;

    from.husbandoId = this.state.userInfo.userId;
    to.husbandoId = this.state.otherUser.userId;

    var trade={
      from,
      to
    }

    await submitTrade(trade);
    this.setState({
      tradeFrom: {
        points: 0,
        // submitSlots: 0,
        rankCoins: 0,
        statCoins: 0,
        waifus: []
      },
      tradeTo: {
        points: 0,
        // submitSlots: 0,
        rankCoins: 0,
        statCoins: 0,
        waifus: []
      },
      fromTradeIsValid: false,
      toTradeIsValid: false
    })

    this.state.navigation.goBack()
  }

  render(){
    var userWaifus = _.cloneDeep(this.state.waifuList).filter(x => this.state.userInfo.waifus.includes(x.waifuId));
    var userWaifuGroups = _.chain(userWaifus).groupBy(waifu => Number(waifu.rank))
    .map((waifus, rank) => ({ rank: Number(rank), waifus })).orderBy(group => Number(group.rank), ['desc']).value()
    userWaifus = userWaifuGroups.flatMap(x => x.waifus)
    
    var otherUserWaifus = _.cloneDeep(this.state.waifuList).filter(x => this.state.otherUser.waifus.includes(x.waifuId));
    var otherUserWaifuGroups = _.chain(otherUserWaifus).groupBy(waifu => Number(waifu.rank))
    .map((waifus, rank) => ({ rank: Number(rank), waifus })).orderBy(group => Number(group.rank), ['desc']).value()
    otherUserWaifus = otherUserWaifuGroups.flatMap(x => x.waifus)

    return (
      <>
        {this.state.loading ?
          <></>
        :
          <>
            <Swiper
              index={0}
              scrollEnabled={false}
              showsPagination={false}
              style={{backgroundColor: "white"}}
              ref='swiper'
            >
              <ImageBackground style={styles.waifuListView} blurRadius={.25} imageStyle={{resizeMode:"cover", opacity: .5}} source={{uri: this.state.otherUser.img}}>
                {/* points/coins section */}
                <View style={styles.tradePointsView}>
                  {/* Points */}
                  <View style={{flexDirection: "row"}}>
                    <View style={{flex: .4}}>
                      <Text style={[styles.text, {color: "white"}]}>Points</Text>
                    </View>
                    <NumericInput value={this.state.tradeTo.points}
                      onChange={count => {
                        var to = this.state.tradeTo;
                        to.points = count;
                        
                        var toTradeIsValid = false;
                        // if(to.points > 0 || to.submitSlots > 0 || to.rankCoins > 0 || to.statCoins > 0 || to.waifus.length > 0)
                        if(to.points > 0 || to.rankCoins > 0 || to.statCoins > 0 || to.waifus.length > 0)
                          toTradeIsValid = true

                        this.setState({tradeTo: to, toTradeIsValid})
                      }}
                      rounded
                      minValue={0} 
                      maxValue={this.state.otherUser.points}
                      totalHeight={35}
                      leftButtonBackgroundColor={chroma('aqua').alpha(.85).hex()}
                      rightButtonBackgroundColor={chroma('aqua').alpha(.85).hex()}
                      separatorWidth={0}
                      inputStyle={{ 
                        fontFamily:"Edo",
                        fontSize: 25,
                      }}
                      containerStyle={{ 
                        flex:.6,
                        backgroundColor: chroma('white').alpha(.5).hex(),
                        borderWidth: 1,
                        borderColor: chroma('black').alpha(.25).hex(),
                      }}
                    />
                  </View>
                  
                  {/* Rank Coins */}
                  <View style={styles.pointsRow}>
                    <View style={{flex: .6}}>
                      <Text style={[styles.text, {color: "white"}]}>Rank Coins</Text>
                    </View>
                    <NumericInput value={this.state.tradeTo.rankCoins}
                      onChange={count => {
                        var to = this.state.tradeTo;
                        to.rankCoins = count;
                        
                        var toTradeIsValid = false;
                        // if(to.points > 0 || to.submitSlots > 0 || to.rankCoins > 0 || to.statCoins > 0 || to.waifus.length > 0)
                        if(to.points > 0 || to.rankCoins > 0 || to.statCoins > 0 || to.waifus.length > 0)
                          toTradeIsValid = true

                        this.setState({tradeTo: to, toTradeIsValid})
                      }}
                      rounded
                      minValue={0} 
                      maxValue={this.state.otherUser.rankCoins}
                      totalHeight={35}
                      leftButtonBackgroundColor={chroma('aqua').alpha(.85).hex()}
                      rightButtonBackgroundColor={chroma('aqua').alpha(.85).hex()}
                      separatorWidth={0}
                      inputStyle={{ 
                        fontFamily:"Edo",
                        fontSize: 25,
                      }}
                      containerStyle={{ 
                        flex:.4,
                        width: width/2.25,
                        backgroundColor: chroma('white').alpha(.5).hex(),
                        borderWidth: 1,
                        borderColor: chroma('black').alpha(.25).hex(),
                      }}
                    />
                  </View>
                  
                  {/* Stat Coins */}
                  <View style={styles.pointsRow}>
                    <View style={{flex: .6}}>
                      <Text style={[styles.text, {color: "white"}]}>Stat Coins</Text>
                    </View>
                    <NumericInput value={this.state.tradeTo.statCoins}
                      onChange={count => {
                        var to = this.state.tradeTo;
                        to.statCoins = count;
                        
                        var toTradeIsValid = false;
                        // if(to.points > 0 || to.submitSlots > 0 || to.rankCoins > 0 || to.statCoins > 0 || to.waifus.length > 0)
                        if(to.points > 0 || to.rankCoins > 0 || to.statCoins > 0 || to.waifus.length > 0)
                          toTradeIsValid = true

                        this.setState({tradeTo: to, toTradeIsValid})
                      }}
                      rounded
                      minValue={0} 
                      maxValue={this.state.otherUser.statCoins}
                      totalHeight={35}
                      leftButtonBackgroundColor={chroma('aqua').alpha(.85).hex()}
                      rightButtonBackgroundColor={chroma('aqua').alpha(.85).hex()}
                      separatorWidth={0}
                      inputStyle={{ 
                        fontFamily:"Edo",
                        fontSize: 25,
                      }}
                      containerStyle={{ 
                        flex:.4,
                        width: width/2.25,
                        backgroundColor: chroma('white').alpha(.5).hex(),
                        borderWidth: 1,
                        borderColor: chroma('black').alpha(.25).hex(),
                      }}
                    />
                  </View>
                </View>

                <FlatGrid
                  itemDimension={150}
                  items={otherUserWaifus}
                  style={styles.gridView}
                  // staticDimension={300}
                  // fixed
                  spacing={20}
                  renderItem={({item, index}) => {
                    var isFav = this.state.userInfo.wishList.includes(item.link)
                    var isSelected = this.state.tradeTo.waifus.includes(item.waifuId)
                    var rankColor = getRankColor(item.rank)

                    return(
                      <TouchableOpacity activeOpacity={.5}
                        onPress={() => this.selectWaifu('to', item)}
                        style={[styles.itemContainer]}
                      >
                        {
                          isFav ?
                            <View style={{ height:25, width: 25, position:"absolute", zIndex: 3, top: 5, right: 5 }}>
                              <Image style={{height:25, width: 25}} source={favoriteHeart} />
                            </View>
                          : <></>
                        }

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
                            opacity: isSelected ? 1 : .5,
                            backgroundColor: chroma('black'),
                            flex: 1,
                            aspectRatio: 1,
                            resizeMode: "cover",
                            borderRadius: 10,
                            ...StyleSheet.absoluteFillObject,
                            
                          }}
                          source={{uri: item.img}}
                        />
                        <RankBackground rank={item.rank} name={item.name} />
                      </TouchableOpacity>
                    )
                  }}
                />
                
                <View style={{height: 50, width: width}}>
                  <Button
                    disabled={!this.state.toTradeIsValid}
                    mode={"contained"} color={chroma('aqua').hex()}
                    labelStyle={{fontSize: 20, fontFamily: "Edo"}}
                    onPress={() => this.handleSlideChange('next')}
                  >Continue</Button>
                </View>
              </ImageBackground>
              
              <ImageBackground style={styles.waifuListView} blurRadius={.25} imageStyle={{resizeMode:"cover", opacity: .5}} source={{uri: this.state.userInfo.img}}>
                {/* points/coins section */}
                <View style={styles.tradePointsView}>
                  {/* Points */}
                  <View style={styles.pointsRow}>
                    <View style={{flex: .4}}>
                      <Text style={[styles.text, {color: "white"}]}>Points</Text>
                    </View>
                    <NumericInput value={this.state.tradeFrom.points}
                      onChange={count => {
                        var from = this.state.tradeFrom;
                        from.points = count;
                        
                        var fromTradeIsValid = false;
                        // if(from.points > 0 || from.submitSlots > 0 || from.rankCoins > 0 || from.statCoins > 0 || from.waifus.length > 0)
                        if(from.points > 0 || from.rankCoins > 0 || from.statCoins > 0 || from.waifus.length > 0)
                          fromTradeIsValid = true

                        this.setState({tradeFrom: from, fromTradeIsValid})
                      }}
                      rounded
                      minValue={0}
                      maxValue={this.state.userInfo.points}
                      totalHeight={35}
                      leftButtonBackgroundColor={chroma('aqua').alpha(.85).hex()}
                      rightButtonBackgroundColor={chroma('aqua').alpha(.85).hex()}
                      separatorWidth={0}
                      inputStyle={{ 
                        fontFamily:"Edo",
                        fontSize: 25,
                      }}
                      containerStyle={{ 
                        flex:.6,
                        backgroundColor: chroma('white').alpha(.5).hex(),
                        borderWidth: 1,
                        borderColor: chroma('black').alpha(.25).hex(),
                      }}
                    />
                  </View>
                  
                  {/* Submit Slots */}
                  {/* <View style={styles.pointsRow}>
                    <View style={{flex: .6}}>
                      <Text style={[styles.text, {color: "white"}]}>Submit Slots</Text>
                    </View>
                    <NumericInput value={this.state.tradeFrom.submitSlots}
                      onChange={count => {
                        var from = this.state.tradeFrom;
                        from.submitSlots = count;
                        
                        var fromTradeIsValid = false;
                        if(from.points > 0 || from.submitSlots > 0 || from.rankCoins > 0 || from.statCoins > 0 || from.waifus.length > 0)
                          fromTradeIsValid = true

                        this.setState({tradeFrom: from, fromTradeIsValid})
                      }}
                      rounded
                      minValue={0} 
                      maxValue={this.state.userInfo.submitSlots}
                      totalHeight={35}
                      leftButtonBackgroundColor={chroma('aqua').alpha(.85).hex()}
                      rightButtonBackgroundColor={chroma('aqua').alpha(.85).hex()}
                      separatorWidth={0}
                      inputStyle={{ 
                        fontFamily:"Edo",
                        fontSize: 25,
                      }}
                      containerStyle={{ 
                        flex:.4,
                        width: width/2.25,
                        backgroundColor: chroma('white').alpha(.5).hex(),
                        borderWidth: 1,
                        borderColor: chroma('black').alpha(.25).hex(),
                      }}
                    />
                  </View>
                    */}
                  {/* Rank Coins */}
                  <View style={styles.pointsRow}>
                    <View style={{flex: .6}}>
                      <Text style={[styles.text, {color: "white"}]}>Rank Coins</Text>
                    </View>
                    <NumericInput value={this.state.tradeFrom.rankCoins}
                      onChange={count => {
                        var from = this.state.tradeFrom;
                        from.rankCoins = count;
                        
                        var fromTradeIsValid = false;
                        // if(from.points > 0 || from.submitSlots > 0 || from.rankCoins > 0 || from.statCoins > 0 || from.waifus.length > 0)
                        if(from.points > 0 || from.rankCoins > 0 || from.statCoins > 0 || from.waifus.length > 0)
                          fromTradeIsValid = true

                        this.setState({tradeFrom: from, fromTradeIsValid})
                      }}
                      rounded
                      minValue={0} 
                      maxValue={this.state.userInfo.rankCoins}
                      totalHeight={35}
                      leftButtonBackgroundColor={chroma('aqua').alpha(.85).hex()}
                      rightButtonBackgroundColor={chroma('aqua').alpha(.85).hex()}
                      separatorWidth={0}
                      inputStyle={{ 
                        fontFamily:"Edo",
                        fontSize: 25,
                      }}
                      containerStyle={{ 
                        flex:.4,
                        width: width/2.25,
                        backgroundColor: chroma('white').alpha(.5).hex(),
                        borderWidth: 1,
                        borderColor: chroma('black').alpha(.25).hex(),
                      }}
                    />
                  </View>
                  
                  {/* Stat Coins */}
                  <View style={styles.pointsRow}>
                    <View style={{flex: .6}}>
                      <Text style={[styles.text, {color: "white"}]}>Stat Coins</Text>
                    </View>
                    <NumericInput value={this.state.tradeFrom.statCoins}
                      onChange={count => {
                        var from = this.state.tradeFrom;
                        from.statCoins = count;
                        
                        var fromTradeIsValid = false;
                        // if(from.points > 0 || from.submitSlots > 0 || from.rankCoins > 0 || from.statCoins > 0 || from.waifus.length > 0)
                        if(from.points > 0 || from.rankCoins > 0 || from.statCoins > 0 || from.waifus.length > 0)
                          fromTradeIsValid = true

                        this.setState({tradeFrom: from, fromTradeIsValid})
                      }}
                      rounded
                      minValue={0} 
                      maxValue={this.state.userInfo.statCoins}
                      totalHeight={35}
                      leftButtonBackgroundColor={chroma('aqua').alpha(.85).hex()}
                      rightButtonBackgroundColor={chroma('aqua').alpha(.85).hex()}
                      separatorWidth={0}
                      inputStyle={{ 
                        fontFamily:"Edo",
                        fontSize: 25,
                      }}
                      containerStyle={{ 
                        flex:.4,
                        width: width/2.25,
                        backgroundColor: chroma('white').alpha(.5).hex(),
                        borderWidth: 1,
                        borderColor: chroma('black').alpha(.25).hex(),
                      }}
                    />
                  </View>
                </View>

                <FlatGrid
                  itemDimension={150}
                  items={userWaifus}
                  style={styles.gridView}
                  // staticDimension={300}
                  // fixed
                  spacing={20}
                  renderItem={({item, index}) => {
                    var isSelected = this.state.tradeFrom.waifus.includes(item.waifuId)
                    var rankColor = getRankColor(item.rank)

                    return(
                      <TouchableOpacity activeOpacity={.5}
                        onPress={() => this.selectWaifu('from', item)}
                        style={[styles.itemContainer]}
                      >
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
                            opacity: isSelected ? 1 : .5,
                            backgroundColor: chroma('black'),
                            flex: 1,
                            aspectRatio: 1,
                            resizeMode: "cover",
                            borderRadius: 10,
                            ...StyleSheet.absoluteFillObject,
                            
                          }}
                          source={{uri: item.img}}
                        />
                        <RankBackground rank={item.rank} name={item.name} />
                      </TouchableOpacity>
                    )
                  }}
                />

                <View style={styles.buttonRowView}>
                  <View style={styles.buttonItem}>
                    <Button
                      onPress={() => this.handleSlideChange('back')}
                      mode={"contained"} color={chroma('aqua').hex()} 
                      labelStyle={{fontSize: 20, fontFamily: "Edo"}}
                    >
                      Back
                    </Button>
                  </View>

                  <View style={styles.buttonItem}>
                    <Button
                      onPress={() => this.handleSlideChange('next')}
                      disabled={!this.state.fromTradeIsValid}
                      mode={"contained"} color={chroma('aqua').hex()} 
                      labelStyle={{fontSize: 20, fontFamily: "Edo"}}
                    >
                      Continue
                    </Button>
                  </View>
                </View>
              </ImageBackground>
            
              <View style={styles.waifuListView} >
                <View style={{flex: 1, width: width}}>
                  {/* To Section */}
                  <View style={{flex: 1, width: width}}>
                    <View style={{backgroundColor: chroma('black').alpha(.35)}}>
                      <Text style={[styles.text, {color: "white", textAlign: "center"}]}>TO - {this.state.otherUser.userName}</Text>
                    </View>

                    <ImageBackground style={{flex: 1, width: width, backgroundColor: chroma('black')}} imageStyle={{resizeMode:"cover", opacity: .5}} source={{uri: this.state.otherUser.img}}>
                      <View style={{...StyleSheet.absoluteFillObject, zIndex: 20, marginLeft: width - 50, width: 50,
                          backgroundColor: chroma('silver').alpha(.15), justifyContent:"center", alignItems:"center"}}>
                        <StatAvatar icon={pointsIcon} value={this.state.tradeTo.points} />
                        <StatAvatar icon={statCoinIcon} value={this.state.tradeTo.statCoins} />
                        <StatAvatar icon={rankCoinIcon} value={this.state.tradeTo.rankCoins} />
                      </View>

                      <FlatGrid
                        itemDimension={150}
                        items={this.state.waifuList.filter(x => this.state.tradeTo.waifus.includes(x.waifuId))}
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
                      <Text style={[styles.text, {color: "white", textAlign: "center"}]}>FROM - {this.state.userInfo.userName}</Text>
                    </View>
                    
                    <ImageBackground style={{flex: 1, width: width, backgroundColor: chroma('black')}} imageStyle={{resizeMode:"cover", opacity: .5}} source={{uri: this.state.userInfo.img}}>
                      <View style={{...StyleSheet.absoluteFillObject, zIndex: 20, marginLeft: width - 50, width: 50,
                        backgroundColor: chroma('silver').alpha(.15), justifyContent:"center", alignItems:"center"}}>
                        <StatAvatar icon={pointsIcon} value={this.state.tradeFrom.points} />
                        <StatAvatar icon={statCoinIcon} value={this.state.tradeFrom.statCoins} />
                        <StatAvatar icon={rankCoinIcon} value={this.state.tradeFrom.rankCoins} />
                      </View>
                      
                      <FlatGrid
                        itemDimension={150}
                        items={this.state.waifuList.filter(x => this.state.tradeFrom.waifus.includes(x.waifuId))}
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

                <View style={styles.buttonRowView}>
                  <View style={styles.buttonItem}>
                    <Button
                      onPress={() => this.handleSlideChange('back')}
                      mode={"contained"} color={chroma('aqua').hex()} 
                      labelStyle={{fontSize: 20, fontFamily: "Edo"}}
                    >
                      Back
                    </Button>
                  </View>

                  <View style={styles.buttonItem}>
                    <Button
                      onPress={this.submitTrade}
                      disabled={ !this.state.fromTradeIsValid || !this.state.toTradeIsValid }
                      mode={"contained"} color={chroma('aqua').hex()} 
                      labelStyle={{fontSize: 20, fontFamily: "Edo"}}
                    >
                      Submit
                    </Button>
                  </View>
                </View>
              </View>
            </Swiper>
            
            <FAB
              small
              color="white"
              style={styles.fab}
              icon="close"
              onPress={() => this.state.navigation.goBack()}
            />
          </>
        }
      </>
    );
  }
}

NewTrade.navigationOptions = {
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
    backgroundColor: chroma('black').alpha(.75),
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
    marginLeft: 5
  },
  pointsView:{
    height:30, flexDirection: "row",
    justifyContent: "center", alignItems:"center",
    // position: "absolute", top: 0, zIndex: 2,
    paddingTop: 10, paddingBottom: 10, paddingLeft: 10
  },
  pointsReviewRow:{
    width:75,
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
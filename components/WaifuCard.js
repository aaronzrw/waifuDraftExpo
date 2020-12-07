import React, { Component, PureComponent, createRef, forwardRef, useState } from 'react';
import { Platform, StatusBar, StyleSheet, View, Text, Button, Image, TouchableOpacity, ImageBackground, Dimensions, Animated, Easing } from 'react-native';

import RankBackground from '../components/RankBackGround'

import waifuHOFBorder from '../assets/images/HOFWaifuBorder.png'
import defIcon from '../assets/images/defIcon.png'
import atkIcon from '../assets/images/atkIcon.png'
import { getRankColor } from '../redux/actions/dataActions'

const chroma = require('chroma-js')

const { width, height } = Dimensions.get('window');
export default class WaifuCard extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      waifu: props.waifu,
    }
    
    this.selectWaifu = props.selectWaifu
    this.selectLongPress = props.selectLongPress
  }
  
  componentDidMount(){
  }

  componentWillReceiveProps(props){
    this.selectWaifu = props.selectWaifu
    this.selectLongPress = props.selectLongPress
    
    this.setState({waifu: props.waifu})
  }

  render() {
    var waifu = this.state.waifu
    var rankColor = getRankColor(waifu.rank)

    return (
      <TouchableOpacity activeOpacity={.25} onPress={() => this.selectWaifu()} style={styles.itemContainer}>
        {/* {
          waifu.isHOF ?
            <Image source={waifuHOFBorder} style={{...StyleSheet.absoluteFill, height: "100%", width: "100%", zIndex: 10}} />
          : <></>
        } */}

        <View style={styles.statView}>
          <View style={styles.statRow}>
            <Image style={[styles.statImg, {tintColor: chroma(rankColor)}]} source={atkIcon} />
            <Text style={[ styles.statsText, {color: chroma(rankColor).brighten()}]}>{waifu.attack}</Text>
          </View>
          <View style={styles.statRow}>
            <Image style={[styles.statImg, {tintColor: chroma(rankColor)}]} source={defIcon} />
            <Text style={[ styles.statsText, {color: chroma(rankColor).brighten()}]}>{waifu.defense}</Text>
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
          source={{uri: waifu.img}}
        />
        <RankBackground rank={waifu.rank} name={waifu.name} />
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  bgContainer: {
    position: "relative",
    width: width * .8,
    height: 75,
    maxHeight: 75,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    opacity: .5
  },
  title:{
    color:"white",
    fontFamily: "Edo",
    fontSize: 30,
    textAlign: "center",
    position: "absolute"
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
    position: "absolute", top: 0, zIndex: 1,
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
});
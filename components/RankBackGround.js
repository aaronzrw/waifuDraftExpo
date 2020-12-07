import React, { Component, PureComponent, createRef, forwardRef, useState } from 'react';
import { Platform, StatusBar, StyleSheet, View, Text, Button, Image, ImageBackground, Dimensions, Animated, Easing } from 'react-native';

import {getRankColor} from '../redux/actions/dataActions'

const chroma = require('chroma-js')

const { Value, timing } = Animated;

const { width, height } = Dimensions.get('window');
export default class RankBackground extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      name: props.name,
      rank: props.rank,
      rankColor: "#ff0000",
    }
    this.fadeAnim = new Value(0);
  }
  
  componentDidMount(){
    var rankColor = getRankColor(this.state.rank);
    this.setState({ rankColor })
  }

  componentWillReceiveProps(props){
    var rankColor = getRankColor(props.rank);
    this.setState({rank: props.rank, name: props.name, rankColor})
  }

  render() {
    return (
      <View style={[styles.container]}>
        <View style={[styles.bgContainer, {backgroundColor: this.state.rankColor}]}/>
        <Text style={styles.title} numberOfLines={2}>
          { this.state.name.length > 15 ? this.state.name.slice(0,15) + '...' : this.state.name }
        </Text>
      </View>
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
});
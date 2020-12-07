import React, { Component, PureComponent, createRef, forwardRef, useState } from 'react';
import { Animated, Easing, Platform, StatusBar, StyleSheet, View, Text, Button, Image, TouchableOpacity, ImageBackground, Dimensions } from 'react-native';

import vertSwipe from '../assets/images/Vert-Swipe-Indi.png'
import horiSwipe from '../assets/images/Hori-Swipe-Indi.png'

const chroma = require('chroma-js')

const { width, height } = Dimensions.get('window');
export default class SwipeIndicator extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      vertSwipe: props.vertSwipe ?? false,
      horiSwipe: props.horiSwipe ?? false,
      tintColor: props.tintColor ?? "white"
    }
    
    this.fadeAnim = new Animated.Value(0);
    this.fade = this.fade.bind(this);
  }
  
  componentDidMount() {
    this.fade()// Starts the animation
  }

  componentWillReceiveProps(props) {
    this.setState({ tintColor: props.tintColor })
  }

  fade(){
    Animated.sequence([
      Animated.timing(this.fadeAnim, {
        toValue: .25,
        duration: 1500,
        easing: Easing.cubic,
        useNativeDriver: true
      }),
      Animated.timing(this.fadeAnim, {
        toValue: 0,
        duration: 1500,
        easing: Easing.cubic,
        useNativeDriver: true
      }),
      Animated.delay(5000)
    ]).start(() => this.fade())
  }

  render() {
    return (
      <>
        {
          this.state.horiSwipe ?
            <View style={styles.view} pointerEvents="none">
              <Animated.Image resizeMode="stretch" source={horiSwipe} style={[styles.img, { tintColor: this.state.tintColor, opacity: this.fadeAnim }]} />
            </View>
          : <></>
        }

        {
          this.state.vertSwipe ?
            <View style={styles.view} pointerEvents="none">
              <Animated.Image resizeMode="stretch" source={vertSwipe} style={[{ tintColor: this.state.tintColor, opacity: this.fadeAnim }, styles.img]} />
            </View>
          : <></>
        }
      </>
    );
  }
}

const styles = StyleSheet.create({
  view: {
    position: "absolute",
    zIndex: 9999,
    width: "100%",
    height: "100%"
    // flex: 1
  },
  img: {
    width: "100%",
    height: "100%"
  }
});
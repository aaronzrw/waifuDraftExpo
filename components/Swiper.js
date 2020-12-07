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
      tintColor: props.tint ?? "white",
      fadeAnim: new Animated.Value(0)
    }
    
    this.fade = this.fade.bind(this);
  }
  
  componentDidMount() {
    this.fade()// Starts the animation
  }

  fade(){
    Animated.sequence([
      Animated.timing(this.state.fadeAnim, {
        toValue: .5,
        duration: 1500,
        easing: Easing.cubic,
        useNativeDriver: true
      }),
      Animated.timing(this.state.fadeAnim, {
        toValue: 0,
        duration: 1500,
        easing: Easing.cubic,
        useNativeDriver: true
      })
      // ,Animated.delay(5000)
    ]).start(() => this.fade())
  }

  render() {
    return (
      <Animated.View
        pointerEvents={'none'}
        style={[
          styles.container,
          {
            opacity: this.state.fadeAnim,
            position: "absolute", top: 0, left: 0,
            zIndex: 9999
          }
        ]}
      >
        {
          this.state.horiSwipe ?
            <Image source={horiSwipe} style={{ height: "100%", width: "100%" }} />
          : <></>
        }

        {
          this.state.vertSwipe ?
            <Image source={vertSwipe} style={{...StyleSheet.absoluteFill, height: "100%", width: "100%", zIndex: 10, tintColor: this.state.tintColor}} />
          : <></>
        }
      </Animated.View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    // flex: 1
  }
});
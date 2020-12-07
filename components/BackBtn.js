import React, { useState, useEffect, Component, PureComponent, createRef, forwardRef } from 'react';
import { Animated, Easing, Platform, StatusBar, StyleSheet, View, TouchableOpacity, Button, Image, ImageBackground, Dimensions } from 'react-native';
import { Text, TouchableRipple, Snackbar, FAB } from 'react-native-paper';

import backIcon from '../assets/images/BackIcon.png'
import store from '../redux/store';
import watch from 'redux-watch'

const chroma = require('chroma-js')
const { width, height } = Dimensions.get('window');

export default class BackBtn extends React.Component {
  constructor(props){
    super(props);
    var visible = props.nav == null ? false : props.showOvr ?? props.nav.canGoBack();

    this.state={
      nav: props.nav,
      goBackOvr: props.goBackOvr,
      showOvr: props.showOvr,
      visible,
    };

    this.fadeAnim = new Animated.Value(0)
    this.endVal = visible ? 1: 0
    
    this.fade = this.fade.bind(this);
  }
  componentDidMount() {
    this.fade()// Starts the animation
  }

  componentWillReceiveProps(props){
    var visible = props.nav == null ? false : props.showOvr ?? props.nav.canGoBack();
    this.endVal = visible ? 1: 0;
    this.fadeAnim = new Animated.Value(this.state.visible ? 1 : 0);

    this.setState({
      nav: props.nav,
      showOvr: props.showOvr,
      goBackOvr: props.goBackOvr,
      visible
    }, this.fade())
  }

  fade(){
    if(this.fadeAnim._value != this.endVal){
      Animated.timing(          // Animate over time
        this.fadeAnim, // The animated value to drive
        {
          toValue: this.endVal,           // Animate to opacity: 1 (opaque)
          duration: 250,       // 2000ms
          easing: Easing.cubic,
          useNativeDriver: true
        }
      ).start();         // Starts the animation
    }
  }

  render(){
    //let { fadeAnim } = this.state;
    var onBackPress = 
      this.state.visible ?
        typeof this.state.goBackOvr === "function" ?
          this.state.goBackOvr
        :
          this.state.nav.goBack
      :
        () => console.log("button hidden")

    return(
      <>
        <Animated.View
          style={[
            styles.container,
            {
              opacity: this.fadeAnim,
              zIndex: 9999
            }
          ]}
        >
          <TouchableOpacity 
            activeOpacity={.25}
            style={{height: 'auto', width: 'auto'}}
            onPress={() => onBackPress()}
          >
            <Image
              source={backIcon}
              style={{ width: 35 , height: 35 }}
            />
          </TouchableOpacity>
        </Animated.View>

        {/*
          this.state.cancelIcon ?
            <Animated.View
            style={[
              styles.container,
              {
                opacity: this.fadeAnim,
                zIndex: 9999
              }
            ]}
          >
            <TouchableOpacity 
              activeOpacity={.25}
              style={{height: 'auto', width: 'auto'}}
              onPress={() => onPress()}
            >
              <Image
                source={backIcon}
                style={{ width: 35 , height: 35 }}
              />
            </TouchableOpacity>
          </Animated.View>
          : <></>
          */}
      </>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    height: 'auto',
    width: 'auto',
    justifyContent: 'space-between',
    position:"absolute",
    top: 5,
    left: 5
  },
});


import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore' // <- needed if using firestore
import "firebase/functions";
import firebaseConfig from './firebaseConfig.json'
import { ReactReduxFirebaseProvider, isLoaded } from 'react-redux-firebase'
import { createFirestoreInstance } from 'redux-firestore' // <- needed if using firestore

//Redux
import store from '../redux/store';

//react-redux-firebase config
const rrfConfig = {
    userProfile: 'users',
    useFirestoreForProfile: true, //Firestore for Profile instead of Realtime DB
    presence: 'presence', // where list of online users is stored in database
    sessions: 'sessions' // where list of user sessions is stored in database (presence must be enabled)
}
const rrfProps = {
    firebase,
    config: rrfConfig,
    dispatch: store.dispatch,
    createFirestoreInstance // <- needed if using firestore
}
  
//Initialize firebase instance
const db = firebase.initializeApp(firebaseConfig).firestore();
// firebase.firestore().settings({ experimentalForceLongPolling: true });

// uncomment this to test firestore locally w/ emulator 
// Uncomment the below line to use cloud functions with the emulator
firebase.functions().useFunctionsEmulator('http://10.0.2.2:5001')
  db.settings({
    host: "10.0.2.2:8080",
    ssl: false
  });

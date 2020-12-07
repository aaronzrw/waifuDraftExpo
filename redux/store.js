import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import { ReactReduxFirebaseProvider, firebaseReducer, isLoaded } from 'react-redux-firebase'
import { createFirestoreInstance, firestoreReducer } from 'redux-firestore' // <- needed if using firestore
import thunk from 'redux-thunk';

import draftReducer from './reducers/draftReducer';
import userReducer from './reducers/userReducer';
import dataReducer from './reducers/dataReducer';
import uiReducer from './reducers/uiReducer';
import chatReducer from './reducers/chatReducer';

const initialState = {};

const middleware = [thunk];

const reducers = combineReducers({
  draft: draftReducer,
  user: userReducer,
  data: dataReducer,
  UI: uiReducer,
  chat: chatReducer,
  firebase: firebaseReducer,
  firestore: firestoreReducer // <- needed if using firestore
});

const composeEnhancers =
  typeof window === 'object' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({})
    : compose;

const enhancer = composeEnhancers(applyMiddleware(...middleware));
const store = createStore(reducers, initialState, enhancer);

export default store;

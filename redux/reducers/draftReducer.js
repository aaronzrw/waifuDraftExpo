
import firebase from 'firebase/app'
import {
  SET_GAME_DATA,
  SET_FIND_GAME,
} from '../types';
  
  const initialState = {
    draftState: null,
  };
 
  export default function(state = initialState, action) {
    switch (action.type) {
      case SET_GAME_DATA:
        return {
          ...state,
          draftState: "DraftLoaded",
          ...action.payload
        };
        case SET_FIND_GAME:
          return {
            draftState: "FindDraft",
          };
      default:
        return {...state};
    }
  }
  
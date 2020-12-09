
import firebase from 'firebase/app'
import {
  SET_GAME_DATA,
  SET_FIND_GAME,
  CLEAR_GAME_DATA,
} from '../types';
  
  const initialState = {
    draftState: null,
  };
 
  export default function(state = initialState, action) {
    switch (action.type) {
      case CLEAR_GAME_DATA:
        return{
          draftState: null
        }
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
  
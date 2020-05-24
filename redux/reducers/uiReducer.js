import {
  SET_SNACKBAR,
  CLEAR_ERRORS,
  LOADING_UI,
  STOP_LOADING_UI
} from '../types';
  
  const initialState = {
    loading: true,
    snackBar: null,
  };
  
  export default function(state = initialState, action) {
    switch (action.type) {
      case SET_SNACKBAR:
        return {
          ...state,
          loading: false,
          snackBar: action.payload
        };
      case CLEAR_ERRORS:
        return {
          ...state,
          loading: false,
          snackBar: null
        };
      case LOADING_UI:
        return {
          ...state,
          loading: true,
          snackBar: null,
        };
      case STOP_LOADING_UI:
        return {
          ...state,
          loading: false,
          snackBar: null,
        };
      default:
        return {
          ...state,
          snackBar: null
        };
    }
  }
  
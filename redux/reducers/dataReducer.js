
import firebase from 'firebase/app'
<<<<<<< HEAD
<<<<<<< HEAD
=======
import * as dateFns from "date-fns"
import * as dateFnsTz from "date-fns-timezone"

>>>>>>> parent of 42883b1... add more optimized compressed search file,fix timezone issues
=======
>>>>>>> parent of f4d0e1b... Update app to handle multiple drafts and fix some usability issues
import {
  SET_WEEKLY_POLL,
  SET_DAILY_POLL,
  SET_POLL_WAIFUS,
  SET_POLL_VOTES,
  SET_SEARCH_DATA,
  SET_TRADES,
  LOADING_DATA,
  STOP_LOADING_DATA,
  SET_WAIFU_LIST,
  UNSUB_SNAPSHOTS,
  SUB_SNAPSHOTS,
  SET_GAUNTLET,
  SET_BOSS_ITEMS
} from '../types';
  
  const initialState = {
    loading: false,
    poll: {
      weekly: null,
      daily: null
    },
    trades: [],
    weeklyPollWaifus: [],
    dailyPollWaifus: [],
    waifuList: [],
    bosses: [],
    searchItems: {}
  };
 
  export default function(state = initialState, action) {
    switch (action.type) {
      case LOADING_DATA:
        return {
          ...state,
          loading: true
        };
      case STOP_LOADING_DATA:
        return {
          ...state,
          loading: false
        };
      case SET_WEEKLY_POLL:
<<<<<<< HEAD
<<<<<<< HEAD
        action.payload.activeTill = action.payload.activeTill.toDate();
=======
        var tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        action.payload.close = dateFnsTz.convertToTimeZone(action.payload.close.toDate(), {timeZone: tz});
        
>>>>>>> parent of 42883b1... add more optimized compressed search file,fix timezone issues
=======
        action.payload.activeTill = action.payload.activeTill.toDate();
>>>>>>> parent of f4d0e1b... Update app to handle multiple drafts and fix some usability issues
        var poll = state.poll;
        poll.weekly = action.payload;

        return{
          ...state,
          poll
        }
      case SET_DAILY_POLL:
<<<<<<< HEAD
<<<<<<< HEAD
        action.payload.activeTill = action.payload.activeTill.toDate();
=======
        var tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        action.payload.close = dateFnsTz.convertToTimeZone(action.payload.close.toDate(), {timeZone: tz});

>>>>>>> parent of 42883b1... add more optimized compressed search file,fix timezone issues
=======
        action.payload.activeTill = action.payload.activeTill.toDate();
>>>>>>> parent of f4d0e1b... Update app to handle multiple drafts and fix some usability issues
        var poll = state.poll;
        poll.daily = action.payload;

        return{
          ...state,
          poll
        }
      case SET_POLL_WAIFUS:
        /*action.payload.forEach(item => {
          item.showVote = false;
        }); */

        return {
          ...state,
          weeklyPollWaifus: action.payload.weekly,
          dailyPollWaifus:action.payload.daily,
        };
      case SET_SEARCH_DATA:
        state.searchItems = action.payload;
                
        return {
          ...state,
          loading: false
        };
        break;
      case SET_TRADES:
        return {
          ...state,
          trades: action.payload
        }
      case SET_WAIFU_LIST:
        return{
          ...state,
          waifuList: action.payload
        }
      case SET_GAUNTLET:
        return{
          ...state,
          bosses: action.payload
        }
      case SET_BOSS_ITEMS:
        return {
          ...state,
          bossItems: action.payload
        }
      case SUB_SNAPSHOTS:
        if (state.unSubUser != null){
          state.unSubUser()
          state.unSubOtherUsers()
          state.unSubWaifus()
          state.unSubPollWaifus()
          state.unSubWeeklyPoll()
          state.unSubDailyPoll()
          state.unSubTrades()
          state.unSubGauntlet()
          state.unSubChats()
          state.unSubBossItems()
        }

        return{
          ...state,
          ...action.payload,
        }
      case UNSUB_SNAPSHOTS:
        if (state.unSubUser != null){
          state.unSubUser()
          state.unSubOtherUsers()
          state.unSubWaifus()
          state.unSubPollWaifus()
          state.unSubWeeklyPoll()
          state.unSubDailyPoll()
          state.unSubTrades()
          state.unSubGauntlet()
          state.unSubChats()
          state.unSubBossItems()
        }

        return{
          ...state,
        }
      default:
        return {...state};
    }
  }
  
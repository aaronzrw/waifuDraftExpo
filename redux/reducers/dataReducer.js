
import firebase from 'firebase/app'
import * as dateFns from "date-fns"
import * as dateFnsTz from "date-fns-timezone"
import * as Localization from 'expo-localization';

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
  SET_BOSSES,
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
        var tz = Localization.timezone;
        action.payload.close = dateFnsTz.convertToTimeZone(action.payload.close.toDate(), {timeZone: tz});
        
        var poll = state.poll;
        poll.weekly = action.payload;

        return{
          ...state,
          poll
        }
      case SET_DAILY_POLL:
        var tz = Localization.timezone;
        action.payload.close = dateFnsTz.convertToTimeZone(action.payload.close.toDate(), {timeZone: tz});

        var poll = state.poll;
        poll.daily = action.payload;

        return{
          ...state,
          poll
        }
      case SET_POLL_WAIFUS:
        return {
          ...state,
          weeklyPollWaifus: action.payload.weekly,
          dailyPollWaifus:action.payload.daily,
        };
      case SET_SEARCH_DATA:
        return {
          ...state,
          searchItems: action.payload,
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
      case SET_BOSSES:
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
          state.unSubUserCred()
          state.unSubUserDraft()
          state.unSubOtherUsers()
          state.unSubWaifus()
          state.unSubPollWaifus()
          state.unSubWeeklyPoll()
          state.unSubDailyPoll()
          state.unSubTrades()
          state.unSubBosses()
          state.unSubChats()
          state.unSubBossItems()
          state.unSubDraft()
        }

        return{
          ...state,
          ...action.payload,
        }
      case UNSUB_SNAPSHOTS:
        if (state.unSubUser != null){
          state.unSubUserCred()
          state.unSubUserDraft()
          state.unSubOtherUsers()
          state.unSubWaifus()
          state.unSubPollWaifus()
          state.unSubWeeklyPoll()
          state.unSubDailyPoll()
          state.unSubTrades()
          state.unSubBosses()
          state.unSubChats()
          state.unSubBossItems()
          state.unSubDraft()
        }

        return{
          ...state,
        }
      default:
        return {...state};
    }
  }
  
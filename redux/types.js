<<<<<<< HEAD
<<<<<<< HEAD
=======
// Game reducer type
export const SET_GAME_DATA = 'SET_GAME_DATA'
export const SET_FIND_GAME = 'SET_FIND_GAME'

>>>>>>> parent of 167f5e0... add switch draft feature and update boss fight screen.
=======
>>>>>>> parent of f4d0e1b... Update app to handle multiple drafts and fix some usability issues
// User reducer types
export const SET_AUTHENTICATED = 'SET_AUTHENTICATED';
export const SET_UNAUTHENTICATED = 'SET_UNAUTHENTICATED';
export const SET_USER = 'SET_USER';
export const SET_OTHER_USERS = 'SET_OTHER_USERS';
export const SET_TOKEN = 'SET_TOKEN';
export const LOADING_USER = 'LOADING_USER';
export const UPDATE_SUBMIT_COUNT = 'UPDATE_SUBMIT_COUNT';
export const MARK_NOTIFICATIONS_READ = 'MARK_NOTIFICATIONS_READ';

// UI reducer types
export const SET_SNACKBAR = 'SET_SNACKBAR';
export const LOADING_UI = 'LOADING_UI';
export const CLEAR_ERRORS = 'CLEAR_ERRORS';
export const LOADING_DATA = 'LOADING_DATA';
export const STOP_LOADING_DATA = 'STOP_LOADING_DATA';
export const STOP_LOADING_UI = 'STOP_LOADING_UI';

// Data reducer types
export const SET_WEEKLY_POLL = 'SET_WEEKLY_POLL';
export const SET_DAILY_POLL = 'SET_DAILY_POLL';
export const SET_POLL_WAIFUS = 'SET_POLL_WAIFUS';
export const SET_SEARCH_DATA = 'SET_SEARCH_DATA';
export const SUBMIT_WAIFU = 'SUBMIT_WAIFU';
export const SET_WAIFU_LIST = 'SET_WAIFU_LIST';
export const SET_TRADES = 'SET_TRADES';
export const SET_GAUNTLET = 'SET_GAUNTLET';
export const SET_BOSS_ITEMS = 'SET_BOSS_ITEMS';

//Chat reducer types
export const SET_CHATS = 'SET_CHATS';
export const SET_LAST_VIEWED = 'SET_LAST_VIEWED';

//listeners
export const UNSUB_SNAPSHOTS = "UNSUB_SNAPSHOTS";
export const SUB_SNAPSHOTS = "SUB_SNAPSHOTS";
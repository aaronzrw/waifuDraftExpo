import {
  SET_WEEKLY_POLL,
  SET_DAILY_POLL,
  SET_POLL_WAIFUS,
  SET_SEARCH_DATA,
  SET_TRADES,
  SET_SNACKBAR,
  SUBMIT_WAIFU,
  CLEAR_ERRORS,
  LOADING_DATA,
  STOP_LOADING_DATA,
  LOADING_UI,
  STOP_LOADING_UI,
  SET_OTHER_USERS,
  SET_WAIFU_LIST,
  UNSUB_SNAPSHOTS,
  SUB_SNAPSHOTS,
  SET_BOSSES,
  SET_BOSS_ITEMS,
  SET_USER_CREDENTIALS,
  SET_CHATS,
  SET_GAME_DATA,
  SET_FIND_GAME,
  SET_USER_WAIFUS
} from '../types';

import * as Localization from 'expo-localization';
import * as firebase from 'firebase';
import 'firebase/auth';

import store from '../store';
import _ from 'lodash'
import ls from "lz-string";
import * as dateFns from "date-fns"
import * as dateFnsTz from "date-fns-timezone"

export var draftPath = null

export async function useRankCoin(waifu, rankCoins, points, statCoins){
  
  store.dispatch({ type: LOADING_UI });
  
  var user = store.getState().user.creds;
	await firebase.firestore().doc(`${draftPath}/waifus/${waifu.waifuId}`).get()
	.then(doc => {
		var stats = getBaseStats(doc.data().rank + 1);
		return doc.ref.update({ ...stats })
	})
	.then(() => {
		return firebase.firestore().doc(`${draftPath}/users/${user.userId}`).get()
	})
	.then(doc => {
    var user = doc.data();
    var newPoints = user.points - points;
    var newRankCoins = user.rankCoins - rankCoins;
    var newStatCoins = user.statCoins - statCoins;

		return doc.ref.update({ points: newPoints, statCoins: newStatCoins, rankCoins: newRankCoins });
	})
  .then(()=>{
    store.dispatch({
      type: SET_SNACKBAR,
      payload: {type: "success", message: `${waifu.name} Has Been Ranked Up`}
    });
  })
  .catch((error) => {
    store.dispatch({
      type: SET_SNACKBAR,
      payload: {type: "error", message: `Error Ranking Up Waifu`}
    });
  })

  store.dispatch({ type: STOP_LOADING_UI });
}

export async function useStatCoin(waifu, stats){
  
  store.dispatch({ type: LOADING_UI });
  
  var user = store.getState().user.creds;
	await firebase.firestore().doc(`${draftPath}/waifus/${waifu.waifuId}`).get()
	.then(doc => {
    var waifu = doc.data()
    waifu.attack = waifu.attack + stats.attack;
    waifu.defense = waifu.defense + stats.defense;
		
		return doc.ref.set(waifu)
	})
	.then(() => {
		return firebase.firestore().doc(`${draftPath}/users/${user.userId}`).get()
	})
	.then(doc => {
		return doc.ref.update({ statCoins: doc.data().statCoins - (stats.attack + stats.defense) });
	})
  .then(()=>{
    store.dispatch({
      type: SET_SNACKBAR,
      payload: {type: "success", message: `${waifu.name}'s stats have been updated`}
    });
  })
  .catch((error) => {
    store.dispatch({
      type: SET_SNACKBAR,
      payload: {type: "error", message: `Error Using Stat Coin(s)`}
    });
  })

  store.dispatch({ type: STOP_LOADING_UI });
}

export async function useHOFCoin(waifu){
  
  store.dispatch({ type: LOADING_UI });
  
  var user = store.getState().user.creds;
	await firebase.firestore().doc(`${draftPath}/waifus/${waifu.waifuId}`).get()
	.then(doc => {
    
		return doc.ref.update({ isHOF: true, HOFBy: user.userId })
	})
	.then(() => {
		return firebase.firestore().doc(`${draftPath}/users/${user.userId}`).get()
	})
	.then(doc => {
    var user = doc.data();
    var newHOFCoins = user.HOFCoins - 1;

		return doc.ref.update({ HOFCoins: newHOFCoins });
	})
  .then(()=>{
    store.dispatch({
      type: SET_SNACKBAR,
      payload: {type: "success", message: `${waifu.name} Has Entered The Hall Of Fame`}
    });
  })
  .catch((error) => {
    store.dispatch({
      type: SET_SNACKBAR,
      payload: {type: "error", message: `Error Adding Waifu To Hall Of Fame`}
    });
  })

  store.dispatch({ type: STOP_LOADING_UI });
}

export async function updateWaifuImg(waifu, imgUrl){
  var success = false;

  
  store.dispatch({ type: LOADING_UI });
  
  await firebase.firestore().doc(`${draftPath}/waifus/${waifu.waifuId}`).update({img : imgUrl})
  .then(() => {
    success = true;
    store.dispatch({
      type: SET_SNACKBAR,
      payload: {type: "success", message: `Updated Waifu Image`}
    });
  })
  .catch((err) => {
    success = false;
    store.dispatch({
      type: SET_SNACKBAR,
      payload: {type: "error", message: `Error Updating Waifu Image`}
    });
  })

  store.dispatch({ type: STOP_LOADING_UI });

  return success
}

export async function submitVote(voteCount, waifu){
  store.dispatch({ type: LOADING_UI });
  

  console.log(voteCount)

  var voteObj = {
    vote: voteCount,
    husbandoId: store.getState().user.creds.userId,
    img: store.getState().user.creds.img
  };

  await firebase.firestore().doc(`${draftPath}/waifus/${waifu.waifuId}`).get()
  .then(doc => {
    var votes = doc.data().votes;
    var newVoteObj = votes.filter(x => x.husbandoId == voteObj.husbandoId);
    if(_.isEmpty(newVoteObj)){        
      return doc.ref.update({ votes: firebase.firestore.FieldValue.arrayUnion(voteObj) })
    }
    else{
      newVoteObj = newVoteObj[0]
      newVoteObj.vote = newVoteObj.vote + voteObj.vote;
      return doc.ref.update({ votes })
    }
  })
  .then(() => {
    return firebase.firestore().doc(`${draftPath}/users/${voteObj.husbandoId}`).get()
  })
  .then(doc => {
    return doc.ref.update({points: doc.data().points - voteObj.vote})
  })
  .then(()=>{
    store.dispatch({
      type: SET_SNACKBAR,
      payload: {type: "success", message: `Vote Has Been Submitted`}
    });
  })
  .catch((err) => {
    store.dispatch({
      type: SET_SNACKBAR,
      payload: {type: "error", message: err.message}
    });
  })
  
  store.dispatch({ type: STOP_LOADING_UI });
}

export async function submitWaifu(waifuData){
  store.dispatch({ type: LOADING_UI });
  

  var user = store.getState().user.creds;
  await firebase.firestore().collection(`${draftPath}/waifus`).where("link", "==", waifuData.link).get()
  .then((data) => {

    if(data.length > 0)
      throw "Waifu Already Submitted";

    waifuData.husbandoId = "Weekly"
    waifuData.submittedBy = user.userName;
    waifuData.type = waifuData.publisher != null ? waifuData.publisher : waifuData.type = "Anime-Manga";
    
    waifuData.rank = 1;
    waifuData.attack = 3;
    waifuData.defense = 1;
    return firebase.firestore().collection(`${draftPath}/waifus`).add(waifuData)
  })
  .then(() => {
    return firebase.firestore().doc(`${draftPath}/users/${user.userId}`).get()
  })
  .then((doc) => {
    var updtUser = doc.data();
    updtUser.submitSlots = updtUser.submitSlots - 1;
    return firebase.firestore().doc(`${draftPath}/users/${user.userId}`).set(updtUser)
  })
  .then(() => {
    store.dispatch({
      type: SET_SNACKBAR,
      payload: {type: "success", message: `${waifuData.name} Was Submitted`}
    });
  })
  .catch((err) => {
    console.log(err)
    store.dispatch({
      type: SET_SNACKBAR,
      payload: {type: "error", message: "Error Submitting Waifu"}
    });
  })
  
  store.dispatch({ type: STOP_LOADING_UI });
}

export async function toggleWishListWaifu(link){
  store.dispatch({ type: LOADING_UI });
  

  var userId = store.getState().user.creds.userId;
  await firebase.firestore().doc(`${draftPath}/users/${userId}`).get()
  .then((doc) => {
    var user = doc.data();

    var wishList = user.wishList;
    if(wishList.includes(link)){
      wishList = wishList.filter(x => x != link);
    }
    else{
      wishList.push(link)
    }

    doc.ref.update({wishList})
  })
  
  store.dispatch({ type: STOP_LOADING_UI });
}

export async function toggleSeriesFavorite(type, name){
  store.dispatch({ type: LOADING_UI });
  

  var user = store.getState().user.creds;
  var favoriteSeries = user.favoriteSeries;

  var isFav = favoriteSeries.filter(x => x.type == type).map(x => x.series).includes(name);
  if(isFav){
    favoriteSeries = favoriteSeries.filter(x => x.type != type || x.series != name);
  }
  else{
    favoriteSeries.push({type, series: name})
  }

  firebase.firestore().doc(`${draftPath}/users/${user.userId}`).update({favoriteSeries: favoriteSeries})
  
  store.dispatch({ type: STOP_LOADING_UI });
}

export async function buyWaifu(waifu, price = 0){
  store.dispatch({ type: LOADING_UI });
  

  if(price == 0){ //default price will be 5* waifu rank
    price = waifu.rank * 5;
  }

  var user = store.getState().user.creds;
  var remPoints = user.points - price;

  var waifuCurrentHusbando = (await firebase.firestore().doc(`${draftPath}/waifus/${waifu.waifuId}`).get()).data().husbandoId
  if(waifuCurrentHusbando != "Shop"){
    store.dispatch({
      type: SET_SNACKBAR,
      payload: {type: "error", message: `Waifu Has Already Been Bought`}
    });

    return 
  }

  await firebase.firestore().doc(`${draftPath}/waifus/${waifu.waifuId}`).update({husbandoId: user.userId})
  .then(() => {
    return firebase.firestore().doc(`${draftPath}/users/${user.userId}`).update({points: remPoints});
  })
  .then(() => {
    store.dispatch({
      type: SET_SNACKBAR,
      payload: {type: "success", message: `${waifu.name} Was Purchased`}
    });
  })
  .catch((err) => {
    store.dispatch({
      type: SET_SNACKBAR,
      payload: {type: "error", message: `Error Buying Waifu From Shop`}
    });
  })
  
  store.dispatch({ type: STOP_LOADING_UI });
}

export async function submitTrade(trade){
  
  store.dispatch({ type: LOADING_UI });

  trade.status = "Active";
  trade.createdDate = new Date();

  await firebase.firestore().collection(`${draftPath}/trades`).add({...trade})
  .then(() => {
    store.dispatch({
      type: SET_SNACKBAR,
      payload: { type: "success", message: "Trade Successfully Submitted" }
    });
  })
  .catch((err) => {
    store.dispatch({
      type: SET_SNACKBAR,
      payload: { type: "error", message: "Error Submitting Trade" }
    });
  });
  
  store.dispatch({ type: STOP_LOADING_UI });
}

export async function updateTrade(trade, status){
  store.dispatch({ type: LOADING_UI });
  

  await firebase.firestore().doc(`${draftPath}/trades/${trade.id}`).update({status})
  .then(() => {
    store.dispatch({
      type: SET_SNACKBAR,
      payload: {type: "success", message: `Trade Was ${status}`}
    });
  })
  .catch((err) => {
    store.dispatch({
      type: SET_SNACKBAR,
      payload: {type: "error", message: `Error Updating Trade`}
    });
  })

  store.dispatch({ type: STOP_LOADING_UI });
}

export async function fightBoss(bossFightObj){
  store.dispatch({ type: LOADING_UI })
  
  var draft = store.getState().draft;
  var tz = draft.timeZone;
  var nowDt = dateFnsTz.convertToTimeZone(firebase.firestore.Timestamp.now().toDate(), {timeZone: tz})

  var uid = await firebase.auth().currentUser.uid;
  var userFights = store.getState().user.creds.bossFights || 
    {
      wins: [],
      losses: []
    };
  
  var waifuRef = (await firebase.firestore().doc(`${draftPath}/waifus/${bossFightObj.waifuId}`).get())
  var waifu = waifuRef.data()
  var bossFights = waifu.bossFights || 
    {
      restingTill: dateFns.addDays(nowDt, waifu.rank),
      wins: [], 
      losses: []
    };
  bossFights.restingTill = dateFns.addDays(nowDt, waifu.rank);
  
  var bossRef = (await firebase.firestore().doc(`${draftPath}/bosses/${bossFightObj.bossId}`).get())
  var boss = bossRef.data()

  var fights = _.cloneDeep(boss.fights);

  var userFightRec = fights.filter(x => x.husbandoId == uid)
  if(_.isEmpty(userFightRec)){
    userFightRec = {
      husbandoId: uid,
      waifusUsed: [],
      defeated: false
    }
    fights.push(userFightRec);
    userFightRec = fights.filter(x => x.husbandoId == uid)[0];
  }
  else{
    userFightRec = userFightRec[0]
  }

  var rolls = [];
  for(var i = 0; i < waifu.rank; i++){
    rolls.push(_.random(1, waifu.attack))
  }

  var totalDmg = rolls.reduce((a, b) => a + b, 0);

  var rewardResult = "";
  var fightResult = 0;

  //calculates final result
  if(totalDmg >= boss.hp){
    fightResult = 1;
    rewardResult = await buildBossRewardStr(boss.reward);
    userFightRec.waifusUsed.push(bossFightObj.waifuId)
    userFightRec.defeated = true;

    bossFights.wins.push({
      bossName: boss.name,
      bassRank: boss.rank,
      rewards: boss.rewards,
      date: firebase.firestore.Timestamp.now()
    })

    userFights.wins.push({
      bossName: boss.name,
      bassRank: boss.rank,
      rewards: boss.rewards,
      date: firebase.firestore.Timestamp.now()
    })
  }
  else{
    if((boss.hp - totalDmg) >= waifu.defense)
    {
      fightResult = 2;
      rewardResult = "Waifu Has Been Defeated And Was Sent To Shop";
      userFightRec.waifusUsed.push(bossFightObj.waifuId)
      await waifuRef.ref.update({husbandoId: "Shop"})
    }
    else
    {
      fightResult = 3;
      rewardResult = "Boss Not Defated. No Reward";
      userFightRec.waifusUsed.push(bossFightObj.waifuId)
    }
    
    bossFights.losses.push({
      bossName: boss.name,
      bassRank: boss.rank,
      rewards: boss.rewards,
      date: firebase.firestore.Timestamp.now()
    })
    userFights.losses.push({
      bossName: boss.name,
      bassRank: boss.rank,
      date: firebase.firestore.Timestamp.now()
    })
  }

  await firebase.firestore().doc(`${draftPath}/users/${uid}`).update({ userFights })
  await waifuRef.ref.update(bossFights)
  await bossRef.ref.update({fights})

  store.dispatch({ type: STOP_LOADING_UI })
  return {totalDmg, rolls, fightResult, rewardResult}
}

export const clearErrors = () => (dispatch) => {
  dispatch({ type: CLEAR_ERRORS });
}

export async function switchDraft(draftId){
  console.log(draftId)
  var userId = store.getState().user.creds.userId

  store.dispatch({type: LOADING_UI})

  await firebase.firestore().doc(`users/${userId}`).update({currentDraftId: draftId})
  await setRealTimeListeners(userId)

  store.dispatch({type: STOP_LOADING_UI})
}

export async function setRealTimeListeners(userId){
  var draftSettings = null;
  
  store.dispatch({ type: UNSUB_SNAPSHOTS });

  await firebase.firestore().doc(`users/${userId}`).get()
  .then(async (doc) => {
    var user  = doc.data();
    
    store.dispatch({
      type: SET_USER_CREDENTIALS,
      payload: {
        userId: doc.id,
        userName: user.userName,
        email: user.email,
        currentDraftId: user.currentDraftId,
        img: user.img
      }
    });

    var currentDraftId = user.currentDraftId;
    if(currentDraftId){
      draftSettings = {...(await firebase.firestore().doc(`drafts/${currentDraftId}`).get()).data().settings};
      draftSettings.draftId = currentDraftId;
      draftSettings.path = `drafts/${draftSettings.draftId}`;
      draftPath = draftSettings.path;
      
      store.dispatch({ type: SET_GAME_DATA, payload: draftSettings });
    }
  })

  if(draftSettings == null){
    store.dispatch({ type: SET_FIND_GAME });
    return
  }

  const userCredentialsPromise = new Promise((resolve, reject) => {
    try{
      var unSubUserCred = firebase.firestore().doc(`users/${userId}`).onSnapshot(function(doc) {
        if (!doc.exists) {
          store.dispatch({
            type: SET_SNACKBAR,
            payload: { type: "info", message: "No User" }
          });
          return;
        }
  
        var user = {
          userId: doc.id,
          email: doc.data().email,
          currentDraftId: doc.data().currentDraftId
        };

        store.dispatch({
          type: SET_USER_CREDENTIALS,
          payload: {...user}
        });
      });
      resolve({name: "unSubUserCred", func: unSubUserCred})
    }
    catch(ex){
      console.log(ex)
      reject()
    }
  });
  const userDraftPromise = new Promise((resolve, reject) => {
    try{
      var unSubUserDraft = firebase.firestore().doc(`${draftPath}/users/${userId}`).onSnapshot(async function(doc) {
        if (!doc.exists) {
          store.dispatch({
            type: SET_SNACKBAR,
            payload: { type: "info", message: "No User" }
          });
          return;
        }

        store.dispatch({
          type: SET_USER_CREDENTIALS,
          payload: {...doc.data()}
        });
  
        var waifus = (await firebase.firestore().collection(`${draftPath}/waifus`)
        .where('husbandoId', '==', userId).get()).docs.map(x => x.id);
        
        store.dispatch({
          type: SET_USER_WAIFUS,
          payload: waifus
        });
      });
      resolve({name: "unSubUserDraft", func: unSubUserDraft})
    }
    catch(ex){
      console.log(ex)
      reject()
    }
  });
  const otherUserPromise = new Promise((resolve, reject) => {
    try{
      var unSubOtherUsers = firebase.firestore().collection(`${draftPath}/users`).onSnapshot(async function(data) {
        var waifus = store.getState().data.waifuList;
        if(waifus.length == 0){
          waifus = (await firebase.firestore().collection(`${draftPath}/waifus`).get()).docs.map(x => { return {...x.data(), waifuId: x.id} })
        }
  
        var otherUsers = data.docs.filter(x => x.id != userId).map(x => {
          return {
            userId: x.id,
            userName: x.data().userName,
            points: x.data().points,
            rankCoins: x.data().rankCoins,
            statCoins: x.data().statCoins,
            HOFCoins: x.data().HOFCoins,
            wishList: x.data().wishList,
            favoriteSeries: x.data().favoriteSeries,
            img: x.data().img,
            waifus: waifus.filter(y => y.husbandoId == x.id).map(x => x.waifuId)
          }
        })
  
        store.dispatch({
          type: SET_OTHER_USERS,
          payload: {otherUsers}
        });
      });
      resolve({name: "unSubOtherUsers", func: unSubOtherUsers})
    }
    catch(ex){
      console.log(ex)
      reject()
    }
  });
  const tradesPromise = new Promise((resolve, reject) => {
    try{
      var unSubTrades = firebase.firestore().collection(`${draftPath}/trades`).onSnapshot(async function(data) {
        var trades = [];
  
        var waifus = store.getState().data.waifuList;
        if(waifus.length == 0){
          waifus = (await firebase.firestore().collection(`${draftPath}/waifus`).get()).docs.map(x => { return {...x.data(), waifuId: x.id} })
        }
  
        var trades = data.docs.map(x => {
          var trade = x.data();
          trade.id = x.id;
          trade.createdDate = trade.createdDate.toDate()
          var fromWaifus = waifus.filter(y => trade.from.waifus.includes(y.waifuId))
          var toWaifus = waifus.filter(y => trade.to.waifus.includes(y.waifuId))
  
          trade.from.waifus = fromWaifus;
          trade.to.waifus = toWaifus;
          
          return trade
        })
  
        store.dispatch({
          type: SET_TRADES,
          payload: trades
        });
      });
      resolve({name: "unSubTrades", func: unSubTrades})
    }
    catch(ex){
      console.log(ex)
      reject()
    }
  });
  const waifusPromise = new Promise((resolve, reject) => {
    try{
      var unSubWaifus = firebase.firestore().collection(`${draftPath}/waifus`).onSnapshot(async function(querySnapshot) {
        var waifus = [];
        querySnapshot.forEach(function(doc) {
          waifus.push({...doc.data(), waifuId: doc.id})
        });
  
        store.dispatch({ type: SET_WAIFU_LIST, payload: waifus });
  
        var userInfo = store.getState().user.creds;
        var userWaifus = waifus.filter(x => x.husbandoId == userInfo.userId).map(x => x.waifuId);
  
        store.dispatch({
          type: SET_USER_CREDENTIALS,
          payload: {creds: userInfo}
        });
        
        store.dispatch({
          type: SET_USER_WAIFUS,
          payload: userWaifus
        });
      });
      resolve({name: "unSubWaifus", func: unSubWaifus})
    }
    catch(ex){
      console.log(ex)
      reject()
    }
  });
  const pollWaifusPromise = new Promise((resolve, reject) => {
    try{
      var draft = store.getState().draft;
      var tz = draft.timeZone;

      var nowDt = dateFnsTz.convertToTimeZone(firebase.firestore.Timestamp.now().toDate(), {timeZone: tz})
      var weekOpen = dateFns.startOfWeek(nowDt, {weekStartsOn: 1})

      var pollOpen = draft.weeklyPoll.open.toDate();
      weekOpen = dateFns.set(weekOpen, {hours: pollOpen.getHours(), minutes: pollOpen.getMinutes(), seconds: pollOpen.getSeconds()})

      //monday
      var unSubPollWaifus = firebase.firestore().collection(`${draftPath}/waifus`)
      .where("appearDate", ">=", firebase.firestore.Timestamp.fromDate(weekOpen))
      .onSnapshot(async function(querySnapshot) {
        var poll = {
          weekly: [],
          daily: [],
        };

        try{
          var userList = (await firebase.firestore().collection(`${draftPath}/users`).get()).docs.map(x => {
            return {userId: x.id, userName: x.data().userName}
          })
          
          querySnapshot.forEach(function(doc) {
            var waifu = doc.data();
  
            waifu.votes.forEach((vote) => {
              var user = userList.filter(x => x.userId == vote.husbandoId)[0].userName
              vote.husbando = user;
            })
  
            if(waifu.isWeekly && waifu.appearDate.toDate() <= new Date())
              poll.weekly.push({...waifu, waifuId: doc.id})
              
            if(waifu.isDaily)
              poll.daily.push({...waifu, waifuId: doc.id})
            
            // switch(waifu.husbandoId){
            //   case "Weekly":
            //     if(waifu.appearDate.toDate() <= new Date())
            //     break;
            //   case "Daily":
            //     poll.daily.push({...waifu, waifuId: doc.id})
            //     break;
            // }
          });
          
          //order weeklies by appearDate
          poll.weekly = _.orderBy(poll.weekly,['appearDate'], ['asc'])
          store.dispatch({
            type: SET_POLL_WAIFUS,
            payload: poll
          });
        }
        catch(err){
          console.log(err);
          store.dispatch({
            type: SET_POLL_WAIFUS,
            payload: {}
          });
        }
      });
      resolve({name: "unSubPollWaifus", func: unSubPollWaifus})
    }
    catch(ex){
      console.log(ex)
      reject()
    }
  });
  const bossPromise = new Promise((resolve, reject) => {
    try{
      var unSubBosses = firebase.firestore().collection(`${draftPath}/bosses`).onSnapshot(function(querySnapshot) {
        try{
          var bosses = [];
          querySnapshot.forEach(function(doc) {
            var boss = doc.data();
            var now = firebase.firestore.Timestamp.now().toDate()
  
            if(boss.appearDate.toDate() <= now && now <= boss.leaveDate.toDate()){
              bosses.push({bossId: doc.id , ...boss});
            }
          });
  
          bosses = _.orderBy(bosses,['appearDate'], ['asc'])
          store.dispatch({
            type: SET_BOSSES,
            payload: bosses
          });
        }
        catch(err){
          console.log(err);
          store.dispatch({
            type: SET_BOSSES,
            payload: []
          });
        }
      });
      resolve({name: "unSubBosses", func: unSubBosses})
    }
    catch(ex){
      console.log(ex)
      reject()
    }
  });
  const chatsPromise = new Promise((resolve, reject) => {
    try{
      var unSubChats = firebase.firestore().collection(`${draftPath}/chats`).where("users", 'array-contains', userId).onSnapshot(function(querySnapshot) {
        try{
          var chats = [];
          querySnapshot.forEach(function(doc) {
            chats.push({chatId: doc.id , ...doc.data()});
          });
  
          chats.forEach(chat => {
            var messages = [];
            chat.messages.map(message => {
              var msg = _.cloneDeep(message)
              var decodedMsg = ls.decompressFromUTF16(msg);
              var parsedMsg = JSON.parse(decodedMsg)
              messages.push(parsedMsg)
            });
  
            chat.messages = messages;
          })
  
          store.dispatch({
            type: SET_CHATS,
            payload: chats
          });
        }
        catch(err){
          console.log(err);
          store.dispatch({
            type: SET_CHATS,
            payload: []
          });
        }
  
      });
      resolve({name: "unSubChats", func: unSubChats})
    }
    catch(ex){
      console.log(ex)
      reject()
    }
  });
  const bossItemsPromise = new Promise((resolve, reject) => {
    try{
      var unSubBossItems = firebase.firestore().collection(`${draftPath}/bossItems`).onSnapshot(function(querySnapshot) {
        try{
          var items = [];
          querySnapshot.forEach(function(doc) {
            items.push({...doc.data()});
          });
    
          store.dispatch({
            type: SET_BOSS_ITEMS,
            payload: items
          });
        }
        catch(err){
          console.log(err);
          store.dispatch({
            type: SET_BOSS_ITEMS,
            payload: []
          });
        }
      });
      resolve({name: "unSubBossItems", func: unSubBossItems})
    }
    catch(ex){
      console.log(ex)
      reject()
    }
  });
  const draftPromise = new Promise((resolve, reject) => {
    try{
      var unSubDraft = firebase.firestore().doc(`${draftPath}`).onSnapshot(function(doc) {
        try{
          draftSettings = doc.data().settings;
          draftSettings.draftId = doc.id;
          draftSettings.path = `drafts/${draftSettings.draftId}`;
          draftPath = draftSettings.path;
          
          store.dispatch({ type: SET_GAME_DATA, payload: draftSettings });
          
          store.dispatch({
            type: SET_DAILY_POLL,
            payload: draftSettings.dailyPoll
          });

          store.dispatch({
            type: SET_WEEKLY_POLL,
            payload: draftSettings.weeklyPoll
          });
        }
        catch(err){
          console.log(err);
        }
      });
      resolve({name: "unSubDraft", func: unSubDraft})
    }
    catch(ex){
      console.log(ex)
      reject()
    }
  });

  //call get search data async
  getSearchData()

  Promise.all([userCredentialsPromise,
    userDraftPromise, otherUserPromise,
    tradesPromise, waifusPromise,
    pollWaifusPromise, bossPromise,
    chatsPromise, bossItemsPromise, draftPromise])
  .then((values) => {
    var subscriptions = {}
    values.forEach(x => {
      subscriptions[x.name] = x.func
    })

    store.dispatch({
      type: SUB_SNAPSHOTS,
      payload: {...subscriptions}
    })
  });
  
}

//some places need to wait for search data instead of calling it async
export function getSearchData(){
  try{
    var searchItems = store.getState().data.searchItems;
    if(_.isEmpty(searchItems)){
      var compressSearchJson = require('../../assets/SearchFile.json');
      searchItems = JSON.parse(ls.decompressFromBase64(compressSearchJson));

      store.dispatch({ type: SET_SEARCH_DATA, payload: searchItems });
    }

    return searchItems
  }
  catch(ex){
    console.log(ex)

    return {}
  }
}

// export async function getSearchDataAsync(){
//   try{
//     var searchItems = store.getState().data.searchItems;
//     if(_.isEmpty(searchItems)){
//       var compressSearchJson = require('../../assets/SearchFile.json');
//       searchItems = JSON.parse(ls.decompress(compressSearchJson));
//       store.dispatch({ type: SET_SEARCH_DATA, payload: searchItems });
//     }
//     return searchItems
//   }
//   catch(ex){
//     console.log(ex)

//     return {}
//   }
// }

async function buildBossRewardStr(reward){

  var result = "Boss Defeated! Rewards Gained";
  var rewards = _.keys(reward);
  var uid = await firebase.auth().currentUser.uid;
  var user = await firebase.firestore().doc(`${draftPath}/users/${uid}`).get()

  rewards.forEach(async x => {
    await user.ref.update({points: user.data()[x] + reward[x]})
    // switch(x){
    //   case "points":
    //     // result += `\n ${reward[x]} Points`
    //     /*store.dispatch({
    //       type: SET_SNACKBAR,
    //       payload: [{ type: "info", message:  `${reward[x]} Points Added` }]
    //     }); */
    //     break;
    //   case "statCoins":
    //     // result += `\n ${reward[x]} Stat Coins`
    //     await user.ref.update({statCoins: user.data().statCoins + reward[x]})
    //     /*store.dispatch({
    //       type: SET_SNACKBAR,
    //       payload: [{ type: "info", message: `${reward[x]} Stat Coins Added` }]
    //     }); */
    //     break;
    //   case "rankCoins":
    //     // result += `\n ${reward[x]} Rank Coins`
    //     await user.ref.update({rankCoins: user.data().rankCoins + reward[x]})
    //     /*store.dispatch({
    //       type: SET_SNACKBAR,
    //       payload: [{ type: "info", message: `${reward[x]} Rank Coins Added` }]
    //     }); */
    //     break;
    //   case "bossCoins":
    //     // result += `\n ${reward[x]} Rank Coins`
    //     await user.ref.update({rankCoins: user.data().bossCoins + reward[x]})
    //     /*store.dispatch({
    //       type: SET_SNACKBAR,
    //       payload: [{ type: "info", message: `${reward[x]} Rank Coins Added` }]
    //     }); */
    //     break;
    //}
  })

  return result;
}
  
function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
  }

  return array;
}

function getRandWaifu(characters){
  let randChanceList = _.fill(Array(50), 1,).concat(_.fill(Array(25), 2)).concat(_.fill(Array(25), 3));
  let randItem = shuffle(randChanceList)[Math.floor(Math.random() * randChanceList.length)]

  let charSet = []
  switch(randItem){
    case 1:
      charSet = characters['Anime-Manga'].items
      break;
    case 2:
      charSet = characters['Marvel'].items
      break;
    case 3:
      charSet = characters['DC'].items
      break;
  }

  return shuffle(charSet)[Math.floor(Math.random() * charSet.length)]
}

export function getBaseStats(rank){
	var stats = { rank, attack: 1, defense: 1}
	switch (rank){
		case 1:
			stats.attack = 3;
			stats.defense = 1;
			break;
		case 2:
			stats.attack = 7;
			stats.defense = 5;
			break;
		case 3:
			stats.attack = 12;
			stats.defense = 10;
			break;
		case 4:
			stats.attack = 20;
			stats.defense = 15;
			break;
	}
	return stats;
}

export function getRankColor(rank){
  var rankColor = "#ff0000"
	switch (rank){
		case 2:
      rankColor = "#835220"
			break;
		case 3:
      rankColor = "#7b7979"
			break;
		case 4:
      rankColor = "#b29600"
			break;
	}
	return rankColor;
}

export function getZonedDate(date = new Date()){
  var tz = Localization.timezone;
  return dateFnsTz.convertToTimeZone(date, {timeZone: tz})
}
//TODO: refactor
const JSONops = {

  //Usage:
  //_getGlobalRankingVal
  //for getting vals from the Global Ranking json
  //_getUserValue
  // get details from a specific user's json in a given ranking list
  //_setUserValue
  //set a particular value for a given user in the json

//TODO: should be renamed to getJSONValWithUserName
  _getUserValue: function(jsonObj, currentUser, valueToLookup){

    let lookupCurrentUserValue = {
      jsonRS: jsonObj,
      lookupField: 'NAME',
      lookupKey: currentUser,
      targetField: valueToLookup,
      //targetData: "",
      checkAllRows: false
      };
      //console.log(lookupCurrentUserRank)
      const currentUserValue = this._getVal(lookupCurrentUserValue);

        return currentUserValue;
  },

  _setUserValue: function(jsonObj, userOrOppoName, valueToSet, newValue){

    let setNewUserValue = {
      jsonRS: jsonObj,
      lookupField: 'NAME',
      lookupKey: userOrOppoName,
      targetField: valueToSet,
      targetData: newValue,
      checkAllRows: false
      };
      const newUserValue = this._setVal(setNewUserValue);

      return newUserValue;
  },

  _getGlobalRankingVal: function(jsonObj, rankingID, valueToLookup){
    console.log('inside lookupGlobalRankingValue', jsonObj)
    let lookupGlobalRankingValue = {
      jsonRS: jsonObj,
      lookupField: 'RANKINGID',
      lookupKey: rankingID,
      targetField: valueToLookup,
      //targetData: "",
      checkAllRows: false
      };
      console.log('lookupGlobalRankingValue', lookupGlobalRankingValue)
      //const currentGlobalRankingVal = this._getVal(lookupGlobalRankingValue);

        return this._getVal(lookupGlobalRankingValue);
  },

//REVIEW: Not currently used, unsure if neceesary
  isNewRanking: function(jsonObj){

    let lookupRankStatus = {
      jsonRS: jsonObj,
      lookupField: 'STATUS',
      lookupKey: "NEW",
      targetField: "RANKING",
      //targetData: "",
      checkAllRows: false
      };
      //console.log(lookupCurrentUserRank)
      const currentUserValue = this._getVal(lookupCurrentUserValue);
      if(currentUserValue === "NEWRANKING"){
        return true;
      }else{
        return false;
      }
        //return currentUserValue;
  },

//for creating new users and corresponind new ranking need to use the acct number
//which is know before user created to set the user name in the json to match
//the account name
//TODO:lookupField could be made another param for simple _setUserValue
  _setUserNameValue: function(jsonObj, userAccountNo, valueToSet, newValue, rankingID){
console.log('inside _setUserNameValue')
    let setNewUserValue = {
      jsonRS: jsonObj,
      lookupField: 'ACCOUNT',
      lookupKey: userAccountNo,
      targetField: valueToSet,
      targetData: newValue,
      checkAllRows: false
      };
      const newUserValue = this._setVal(setNewUserValue);
      this._sendJSONDataWithRankingID(newUserValue, rankingID);

      return newUserValue;
  },

    //re-set user and opponent fields now that a result needs to be processed
    //NB:playerNameOnRowClicked is for when opponent row clicked
    _updateEnterResultJSON: function(rankingID, currentUser, currentUserRank, playerNameOnRowClicked, selectedOpponentRank, data){

      const opponentCurrentlyChallengingUser = this._getUserValue(data, currentUser, "CURRENTCHALLENGERNAME");
      let newUserRank, newOpponentRank = 0;
      //swap the ranks (we should only be here if there is a change to record)
        newUserRank = selectedOpponentRank;
        newOpponentRank = currentUserRank;

      let updatedUserJSON = this._setUserValue(data, currentUser, "RANK", newUserRank);
      //NB:cover cases of user clicking on result for self or clicking on his opponent
      //to enter the result
      updatedUserJSON = this._setUserValue(data, playerNameOnRowClicked, "RANK", newOpponentRank);
      updatedUserJSON = this._setUserValue(data, opponentCurrentlyChallengingUser, "CURRENTCHALLENGERNAME", "AVAILABLE");
      updatedUserJSON = this._setUserValue(data, currentUser, "CURRENTCHALLENGERNAME", "AVAILABLE");
      updatedUserJSON = this._setUserValue(data, currentUser, "CURRENTCHALLENGERID", 0);
      updatedUserJSON = this._setUserValue(data, opponentCurrentlyChallengingUser, "CURRENTCHALLENGERID", 0);

      //send after all the updates have been made
      //to the updatedUserJSON object
      //this._sendJSONData(updatedUserJSON);
      this._sendJSONDataWithRankingID(updatedUserJSON, rankingID);
    },

    _updateEnterResultUnchangedJSON: function(rankingID, currentUser, selectedOpponent, data){
        //set both player to AVAILABLE
        const opponentCurrentlyChallengingUser = this._getUserValue(data, currentUser, "CURRENTCHALLENGERNAME");
        console.log(opponentCurrentlyChallengingUser)
        let updatedUserJSON = this._setUserValue(data, opponentCurrentlyChallengingUser, "CURRENTCHALLENGERNAME", "AVAILABLE");
            updatedUserJSON = this._setUserValue(data, currentUser, "CURRENTCHALLENGERNAME", "AVAILABLE");
            updatedUserJSON = this._setUserValue(data, selectedOpponent, "CURRENTCHALLENGERNAME", "AVAILABLE");
            //case where opponent's row isn't the one clicked on (user clicks own row to enter result)
            updatedUserJSON = this._setUserValue(data, opponentCurrentlyChallengingUser, "CURRENTCHALLENGERNAME", "AVAILABLE");


        //this._sendJSONData(updatedUserJSON);
        this._sendJSONDataWithRankingID(updatedUserJSON, rankingID);
    },

    _updateDoChallengeJSON: function(rankingID, currentUser, selectedOpponent, data){
      //get the user's id number
      const userIDNumber = this._getUserValue(data, currentUser, "id");
      //NB: selectedOpponentIDNumber not currently used but possible it may be needed
      //const selectedOpponentIDNumber = this._getUserValue(data, selectedOpponent, "id");

      let updatedUserJSON = this._setUserValue(data, selectedOpponent, "CURRENTCHALLENGERID", userIDNumber);
      //set both names to be challenging eachother (no AVAILABLE) to ensure only 1 opponent at a time
      //to avoid validation problems with selecting opponents etc.
      updatedUserJSON = this._setUserValue(data, selectedOpponent, "CURRENTCHALLENGERNAME", currentUser);

      updatedUserJSON = this._setUserValue(data, currentUser, "CURRENTCHALLENGERNAME", selectedOpponent);

      //this._sendJSONData(updatedUserJSON);
      this._sendJSONDataWithRankingID(updatedUserJSON, rankingID);
    },

      _getVal: function(jsonObj){
      for (var i = 0; i < jsonObj.jsonRS.length; i++) {
          if (jsonObj.jsonRS[i][jsonObj.lookupField] === jsonObj.lookupKey || jsonObj.lookupKey === '*') {
              return jsonObj.jsonRS[i][jsonObj.targetField];
          }
       }
    },

    isJSONEmpty: function(originalData){
      let createNewJSONuserObj = {
        jsonRS: originalData
        };
      if(createNewJSONuserObj.jsonRS.length < 2){
        return true;
      }else{
        return false;
      }
},

//TODO: this is going to become createNewUserInExistingRankingJson
//NB: rankingID is at the end of the param list
    createNewUserInJSON: function(originalData, username, contactno, email, accountno, description, rankingID){

        let createNewJSONuserObj = {
          jsonRS: originalData
          };

        let nextIDandInitialRankObj = {
          jsonRS: originalData
          };

        nextIDandInitialRankObj.lookupField = "NAME";
        //TODO: this is 'currentuser' elasewhere
        nextIDandInitialRankObj.lookupKey = username;

        console.log('createNewJSONuserObj.jsonRS.length in createNewUserInJSON', createNewJSONuserObj.jsonRS.length)

        //REVIEW: Does this line correctly handle a reset?
        let nextIDandInitialRank = createNewJSONuserObj.jsonRS.length + 1;

        console.log('createNewJSONuserObj.jsonRS.length', createNewJSONuserObj.jsonRS.length)

        //if it's a completely new json length will be 0
        if(createNewJSONuserObj.jsonRS.length < 1){
          console.log('json was new and had no existing data')
          //ensure nextIDandInitialRank is correctly initialized to 1
          nextIDandInitialRank = 1;
        }

        //QUESTION: it appears the data needs to be sent in reverse order - why?
        const newData = {
                          "DATESTAMP": Date.now(),
                          "ACTIVE": true,
                          "DESCRIPTION": description,
                          "CURRENTCHALLENGERNAME": "AVAILABLE",
                          "CURRENTCHALLENGERID": 0,
                          "ACCOUNT": accountno,
                          "RANK": nextIDandInitialRank,
                          "EMAIL": email,
                          "CONTACTNO": contactno,
                          "NAME": username,
                          "id":nextIDandInitialRank
                        }

        createNewJSONuserObj.jsonRS.push(newData);
        console.log('rankingID in createNewUserInJSON', rankingID)
        //this._sendJSONData(createNewJSONuserObj.jsonRS);
        this._sendJSONDataWithRankingID(createNewJSONuserObj.jsonRS, rankingID);

    },

    createNewUserInNewJSON: function(username, contactno, email, accountno, description, rankingID){
      console.log('inside createNewUserInNewJSON')
        // let createNewJSONuserObj = {
        //   jsonRS: {}
        //   };
        const newData = {
                          "DATESTAMP": Date.now(),
                          "ACTIVE": true,
                          "DESCRIPTION": description,
                          "CURRENTCHALLENGERNAME": "AVAILABLE",
                          "CURRENTCHALLENGERID": 0,
                          "ACCOUNT": accountno,
                          "RANK": 1,
                          "EMAIL": email,
                          "CONTACTNO": contactno,
                          "NAME": username,
                          "id":1
                        }
        //createNewJSONuserObj.jsonRS.push(newData);
        //this._sendJSONData(createNewJSONuserObj.jsonRS);
        //this._sendJSONDataWithRankingID(createNewJSONuserObj.jsonRS, rankingID);
        return this._sendJSONDataWithRankingID(newData, rankingID);
    },

    updateDateStampsInJSON: function(rankingID, data, username, opponent){
      let updatedUserJSON = this._setUserValue(data, username, "DATESTAMP", Date.now());
      console.log(updatedUserJSON)
      updatedUserJSON = this._setUserValue(data, opponent, "DATESTAMP", Date.now());
      console.log(updatedUserJSON)
      //this._sendJSONData(updatedUserJSON);
      this._sendJSONDataWithRankingID(updatedUserJSON, rankingID);
    },

    updateUserInJSON: function(rankingID, data, username, contactno, email, description){

      //REVIEW: get the user's id number or should stick to username?
      //const userIDNumber = this._getUserValue(data, currentUser, "id");
      //NB: selectedOpponentIDNumber not currently used but possible it may be needed
      //const selectedOpponentIDNumber = this._getUserValue(data, selectedOpponent, "id");

      let updatedUserJSON = this._setUserValue(data, username, "CONTACTNO", contactno);
      //set both names to be challenging eachother (no AVAILABLE) to ensure only 1 opponent at a time
      //to avoid validation problems with selecting opponents etc.
      updatedUserJSON = this._setUserValue(data, username, "EMAIL", email);

      updatedUserJSON = this._setUserValue(data, username, "DESCRIPTION", description);

      //this._sendJSONData(updatedUserJSON);
        this._sendJSONDataWithRankingID(updatedUserJSON, rankingID);

    },


    reactivatePlayer: function(rankingID, data, currentUser, accountno){
      console.log('in reactivatePlayer', rankingID, data, currentUser, accountno)
      let updateUserRankToEndObj = {
        jsonRS: data
        };

      let updatedUserJSON = this._setUserValue(updateUserRankToEndObj.jsonRS, currentUser, "ACTIVE", true);

      const currentNumberOfActivePlayers = this.getCurrentNoOfActivePlayers(updateUserRankToEndObj.jsonRS)
      //Set rank to last of the ACTIVE players
      updatedUserJSON = this._setUserValue(updateUserRankToEndObj.jsonRS, currentUser, "RANK", currentNumberOfActivePlayers);

      //this._sendJSONData(updatedUserJSON);
      this._sendJSONDataWithRankingID(updatedUserJSON, rankingID);
    },

    _setVal: function(update){

          for (var i = 0; i < update.jsonRS.length; i++) {
            //REVIEW: what does update.lookupKey === '*' mean?
              if (update.jsonRS[i][update.lookupField] === update.lookupKey || update.lookupKey === '*') {
                  update.jsonRS[i][update.targetField] = update.targetData;

                  return update.jsonRS;
              }
          }
    },

    deactivatePlayer: function(rankingID, data, currentUser, accountno){
console.log('rankingID, data, currentUser, accountno in deactivatePlayer', rankingID, data, currentUser, accountno)
        let shiftUpRankingUpdateObj = {
          jsonRS: data,
          lookupField: "",
          lookupKey: 0,
          targetField: "",
          targetData: "",
          checkAllRows: false
          };

//need this one to get the opponenets name when user is the challenger
          let lookupCurrentUsersOppenentPlayerValue = {
            jsonRS: data,
            lookupField: 'CURRENTCHALLENGERNAME',
            lookupKey: currentUser,
            targetField: 'NAME',
            //targetData: "",
            checkAllRows: false
            };
            //console.log(lookupCurrentUserRank)

      let updatedUserJSON = this._setUserValue(data, currentUser, "ACTIVE", false);

      //const currentUserRank = this._getUserRank(originalData, currentUser);
      const currentUserRank = this._getUserValue(data, currentUser, "RANK");

      //re-set targetfield and targetData set to 1
      //leave as is (w/o _setUserValue)
      shiftUpRankingUpdateObj.lookupField = "RANK";
      shiftUpRankingUpdateObj.targetField = "RANK";
      shiftUpRankingUpdateObj.targetData = 1;

      updatedUserJSON = this.shiftAllOtherPlayersRankingUpByOne(shiftUpRankingUpdateObj, currentUserRank);

      //NB:using original _setVal here not _getUserValue
      //cos of shiftAllOtherPlayersRankingUpByOne
      updatedUserJSON = this._setVal(shiftUpRankingUpdateObj);

      //set the user's rank to the bottom  as well
      //REVIEW: it's possible this (below) could be part of shiftAllOtherPlayersRankingUpByOne code
      //but currently is necessary here
      updatedUserJSON = this._setUserValue(data, currentUser, "RANK", shiftUpRankingUpdateObj.jsonRS.length);
      //re-set my current opponent to AVAILABLE
      updatedUserJSON = this._setUserValue(data, currentUser, "CURRENTCHALLENGERNAME", "AVAILABLE");
      //get current opponent (who player is challenging) name
      //where current user is the challenger then we get the player name
      //const opponentsName = this._getUserValue(data, currentUser, "CURRENTCHALLENGERNAME");
      console.log('currentUsersOppenentPlayerValue', currentUsersOppenentPlayerValue)
      //re-set my opponents 'current opponent' to AVAILABLE if not already AVAILABLE
      // if(opponentsName != "AVAILABLE"){
      //   updatedUserJSON = this._setUserValue(data, opponentsName, "CURRENTCHALLENGERNAME", "AVAILABLE");
      // }
      //handle the opponent's display (if there is an opponenet)
      let currentUsersOppenentPlayerValue = this._getVal(lookupCurrentUsersOppenentPlayerValue);
      if(currentUsersOppenentPlayerValue != undefined){
        //re-set my opponents 'current opponent' to AVAILABLE
        updatedUserJSON = this._setUserValue(data, currentUsersOppenentPlayerValue, "CURRENTCHALLENGERNAME", "AVAILABLE");
      }
      //re-set my opponents 'current opponent' to AVAILABLE
      //updatedUserJSON = this._setUserValue(data, currentUsersOppenentPlayerValue, "CURRENTCHALLENGERNAME", "AVAILABLE");

      //console.log(updatedUserJSON)
      //this._sendJSONData(updatedUserJSON);
      this._sendJSONDataWithRankingID(updatedUserJSON, rankingID);
    },

    // getCurrentUsersOppenentPlayerValue: function((data, currentUser){
    //   let lookupCurrentUsersOppenentPlayerValue = {
    //     jsonRS: data,
    //     lookupField: 'CURRENTCHALLENGERNAME',
    //     lookupKey: currentUser,
    //     targetField: 'NAME',
    //     //targetData: "",
    //     checkAllRows: false
    //     };
    //     //console.log(lookupCurrentUserRank)
    //     this._getUserValue(data, currentUser, "CURRENTCHALLENGERNAMEANK");
    //     const currentUsersOppenentPlayerValue = this._getVal(lookupCurrentUsersOppenentPlayerValue);
    //     return currentUsersOppenentPlayerValue;
    // },

  shiftAllOtherPlayersRankingUpByOne: function(update, currentUserRank){
          let ranktobeupdated = 1;

          for (var i = 0; i < update.jsonRS.length; i++) {

            ranktobeupdated = update.jsonRS[i][update.lookupField];
            //make the change according to the current users relative position
            // if(currentUserRank === update.jsonRS[i][update.lookupField]){
            //   //this is the current user's rank which must now be set to the last rank
            //   update.jsonRS[i][update.targetField] = update.jsonRS.length;
            // }
            // else

            if(currentUserRank < update.jsonRS[i][update.lookupField]){
              ranktobeupdated -= 1;
              update.jsonRS[i][update.targetField] = ranktobeupdated;
            }
          }
          return update.jsonRS;
    },

    getCurrentNoOfActivePlayers: function(data){
            let currentNoOfActivePlayers = 0;

            let activePlayerJSONuserObj = {
              jsonRS: data,
              };

            activePlayerJSONuserObj.lookupField = "ACTIVE";

            for (var i = 0; i < activePlayerJSONuserObj.jsonRS.length; i++) {
              if(activePlayerJSONuserObj.jsonRS[i][activePlayerJSONuserObj.lookupField] === true){
                currentNoOfActivePlayers += 1;
              }
            }
            return currentNoOfActivePlayers;
      },

//NB:admin function - not used directly by app
//TODO: create a separate admin screen
    deletePlayer: function(originalData, currentUser, accountno){
      let deletePlayerJSONuserObj = {
        jsonRS: originalData,
        };
        deletePlayerJSONuserObj.lookupField = "NAME";
        deletePlayerJSONuserObj.lookupKey = currentUser;

          for (var i = 0; i < deletePlayerJSONuserObj.jsonRS.length; i++) {
              if (deletePlayerJSONuserObj.jsonRS[i][deletePlayerJSONuserObj.lookupField] === deletePlayerJSONuserObj.lookupKey || deletePlayerJSONuserObj.lookupKey === '*') {
              //  console.log(deletePlayerJSONuserObj.jsonRS[i]);
                  delete deletePlayerJSONuserObj.jsonRS[i];
              }
          }
          deletePlayerJSONuserObj.jsonRS = deletePlayerJSONuserObj.jsonRS.filter(function(x) { return x !== null });
      return deletePlayerJSONuserObj.jsonRS;
    },

      //add 1 to existing length of json obj array to obtain a new id number
      // getNextID: function(data){
      //   const add1toLengthtogetID = data.length + 1;
      //   return add1toLengthtogetID;
      // },

      // doesJSONContainRankingID: function(data){
      //   console.log('data')
      //   console.log(data)
      //   let doesJSONContainRankingIDObj = {
      //     jsonRS: data
      //     };
      //     //used for return value below
      //     let doesJSONContainRankingID = false;
      //     doesJSONContainRankingIDObj.lookupField = "RANKINGID";
      //     doesJSONContainRankingIDObj.lookupKey = currentUser;
      //       for (var i = 0; i < doesJSONContainRankingIDObj.jsonRS.length; i++) {
      //         //REVIEW: line below should only occur in dev with no RankingId assigned
      //         if(doesJSONContainRankingIDObj.jsonRS[i] === null){
      //           return false;
      //         }
      //           if (doesJSONContainRankingIDObj.jsonRS[i][doesJSONContainRankingIDObj.lookupField] === doesJSONContainRankingIDObj.lookupKey || doesJSONContainRankingIDObj.lookupKey === '*') {
      //             doesJSONContainRankingID = true;
      //           }
      //       }
      //       if (doesJSONContainRankingID === true){
      //         return true;
      //       }
      //       else {
      //         return false;
      //       }
      // },

      //apart from IN/ACTIVE is player listed at all?
      isPlayerListedInJSON: function(data, currentUser){
        console.log('data in isPlayerListedInJSON',data)
        console.log('currentUser in isPlayerListedInJSON', currentUser)

        //using ACCOUNT not NAME to test if user is listed in the json
        const result = this._getUserValue(data, currentUser, "ACCOUNT")

        console.log('result', result)

        if(result === undefined){return false}
        else
        //5 is arbitrary. if < 5 no account number was returned
        if(result.length < 5){return false}else{return true};

        // let isPlayerListedInJSONObj = {
        //   jsonRS: data
        //   };
        //   //used for return value below
        //   let isPlayerListed = false;
        //   isPlayerListedInJSONObj.lookupField = "NAME";
        //   isPlayerListedInJSONObj.lookupKey = currentUser;
        //     for (var i = 0; i < isPlayerListedInJSONObj.jsonRS.length; i++) {
        //       //REVIEW: line below should only occur in dev with no RankingId assigned
        //       if(isPlayerListedInJSONObj.jsonRS[i] === null){
        //         return false;
        //       }
        //         if (isPlayerListedInJSONObj.jsonRS[i][isPlayerListedInJSONObj.lookupField] === isPlayerListedInJSONObj.lookupKey || isPlayerListedInJSONObj.lookupKey === '*') {
        //           isPlayerListed = true;
        //         }
        //     }
        //     if (isPlayerListed === true){
        //       return true;
        //     }
        //     else {
        //       return false;
        //     }
        //     console.log('end of isPlayerListedInJSON', isPlayerListedInJSON)
      },

      //TODO: will have to separate isPlayerAvailableToChallengeObj.jsonRS[i].CURRENTCHALLENGERNAME === user
      //out to new function at some point cos otherwise pos of double challenge v same Player
      //update: think this has been done in isPlayerAlreadyChallengingThisOpp
      isPlayerAvailableToChallenge: function(data, opponentName, user){
        let isPlayerAvailableToChallengeObj = {
          jsonRS: data
          };
          //used for return value below
          let isPlayerAvailable = false;
          isPlayerAvailableToChallengeObj.lookupField = "NAME";
          isPlayerAvailableToChallengeObj.lookupKey = opponentName;
            for (var i = 0; i < isPlayerAvailableToChallengeObj.jsonRS.length; i++) {
                if (isPlayerAvailableToChallengeObj.jsonRS[i][isPlayerAvailableToChallengeObj.lookupField] === isPlayerAvailableToChallengeObj.lookupKey || isPlayerAvailableToChallengeObj.lookupKey === '*') {
                  if(isPlayerAvailableToChallengeObj.jsonRS[i].CURRENTCHALLENGERNAME === 'AVAILABLE'
                && !this.doesPlayerAlreadHaveAChallenge(data, opponentName, user)){
                    isPlayerAvailable = true;
                  }
                }
            }
            if (isPlayerAvailable === true){
              return true;
            }
            else {
              return false;
            }
      },

      doesPlayerAlreadHaveAChallenge: function(data, opponentName, user){
        let doesPlayerAlreadHaveAChallengeObj = {
          jsonRS: data
          };
          //used for return value below
          let doesPlayerAlreadHaveAChallenge = false;
          doesPlayerAlreadHaveAChallengeObj.lookupField = "CURRENTCHALLENGERNAME";
          //NB: using the opponentName to look this up against the user (as challenger) name
          doesPlayerAlreadHaveAChallengeObj.lookupKey = user;
            for (var i = 0; i < doesPlayerAlreadHaveAChallengeObj.jsonRS.length; i++) {
                  if(doesPlayerAlreadHaveAChallengeObj.jsonRS[i].CURRENTCHALLENGERNAME === opponentName
                    || doesPlayerAlreadHaveAChallengeObj.jsonRS[i].CURRENTCHALLENGERNAME === user)
                  {
                    //console.log(doesPlayerAlreadHaveAChallengeObj.jsonRS[i].CURRENTCHALLENGERNAME)
                    doesPlayerAlreadHaveAChallenge= true;
                  }
            }
            if (doesPlayerAlreadHaveAChallenge === true){
              return true;
            }
            else {
              return false;
            }
      },

      isPlayerAvailableToEnterResultAgainst: function(data, opponentName, user){
        let isPlayerAvailableToEnterResultAgainstObj = {
          jsonRS: data
          };
          //used for return value below
          let isPlayerAvailableToEnterResultAgainst = true;
          isPlayerAvailableToEnterResultAgainstObj.lookupField = "NAME";
          //opponentName comes from the row that is clicked (don't confuse with user)
          isPlayerAvailableToEnterResultAgainstObj.lookupKey = opponentName;
          //isPlayerAvailableToEnterResultAgainstObj.lookupKey = user;
          console.log(user)
          console.log(opponentName)

            for (var i = 0; i < isPlayerAvailableToEnterResultAgainstObj.jsonRS.length; i++) {
                if (isPlayerAvailableToEnterResultAgainstObj.jsonRS[i][isPlayerAvailableToEnterResultAgainstObj.lookupField]
                  === isPlayerAvailableToEnterResultAgainstObj.lookupKey || isPlayerAvailableToEnterResultAgainstObj.lookupKey
                  === '*') {
                    //NB. be careful editing this logic - save first!
                    if(  (isPlayerAvailableToEnterResultAgainstObj.jsonRS[i].NAME != user
                          && isPlayerAvailableToEnterResultAgainstObj.jsonRS[i].CURRENTCHALLENGERNAME != user)
                        ||
                          (isPlayerAvailableToEnterResultAgainstObj.jsonRS[i].NAME != opponentName
                          && isPlayerAvailableToEnterResultAgainstObj.jsonRS[i].CURRENTCHALLENGERNAME != opponentName)
                        ||
                          isPlayerAvailableToEnterResultAgainstObj.jsonRS[i].CURRENTCHALLENGERNAME === 'AVAILABLE'
                      ){
                      console.log(1)
                      isPlayerAvailableToEnterResultAgainst = false;
                    }
                    else{
                      //will default to true (modal will display)
                      console.log(2)
                    }
                }
            }

            if (isPlayerAvailableToEnterResultAgainst === true){
              return true;
            }
            else {
              return false;
            }
      },

        isRankingIDInvalid: function(data){
          console.log('data in isRankingIDInvalid')
          //var temp = JSON.parse(data);
          console.log(data)
          console.log(data.RANKINGID)
          if(data[0] === null || data.RANKINGID === ''){
            return true;
          }else{
            return false;
          }
        },

      isPlayerAlreadyChallengingThisOpp: function(data, opponentName, user){
        let isPlayerAlreadyChallengingThisOppObj = {
          jsonRS: data
          };
          //used for return value below
          let isPlayerAlreadyChallengingThisOpp = false;
          isPlayerAlreadyChallengingThisOppObj.lookupField = "NAME";
          isPlayerAlreadyChallengingThisOppObj.lookupKey = opponentName;

            for (var i = 0; i < isPlayerAlreadyChallengingThisOppObj.jsonRS.length; i++) {
                if (isPlayerAlreadyChallengingThisOppObj.jsonRS[i][isPlayerAlreadyChallengingThisOppObj.lookupField] === isPlayerAlreadyChallengingThisOppObj.lookupKey || isPlayerAlreadyChallengingThisOppObj.lookupKey === '*') {
                  if(isPlayerAlreadyChallengingThisOppObj.jsonRS[i].CURRENTCHALLENGERNAME === user){
                    isPlayerAlreadyChallengingThisOpp = true;
                  }
                }
            }

            if (isPlayerAlreadyChallengingThisOpp === true){
              return true;
            }
            else {
              return false;
            }
      },

      isPlayerLowerRankThanChallengeOpponent: function(data, opponentName, currentUser){
        const playerRank = this._getUserValue(data, currentUser, "RANK");
        const opponentRank = this._getUserValue(data, opponentName, "RANK");

        let isChallengerLowerRankThanPlayer = false;
      //NB: A lower number is a HIGHER rank, a HIGHER number is a LOWER rank
            if (playerRank > opponentRank){
              return true;
            }
            else {
              return false;
            }
      },

      getIdNoFromJsonbinResponse: function(data){
        console.log('data', data)
        let dataObj = {
          jsonRS: data
          };
            console.log('dataObj.jsonRS', dataObj.jsonRS)
          let jsonresult = JSON.parse(dataObj.jsonRS);
          console.log('jsonresult', jsonresult)
          // console.log(jsonresult)
          // console.log('jsonresult.RANKINGID')
          console.log(jsonresult.id)
          return jsonresult.id;
      },

//REVIEW: will be deprecated in favour of _sendJSONDataWithRankingID
  //   _sendJSONData: function(data){
  //     let req = new XMLHttpRequest();
  //
  //         req.onreadystatechange = () => {
  //           if (req.readyState == XMLHttpRequest.DONE) {
  //             //console.log(req.responseText);
  //           }
  //         };
  //         //NOTE: it is the api.jsonbin NOT the jsonbin.io!
  //         //JSON data can and should be in ANY order
  //         //bin id is: https://jsonbin.io/5bd82af2baccb064c0bdc92a/
  //         //use above to edit manually.
  //         //to view latest https://api.jsonbin.io/b/5bd82af2baccb064c0bdc92a/latest
  //
  //         req.open("PUT", "https://api.jsonbin.io/b/5bd82af2baccb064c0bdc92a", true);
  //         req.setRequestHeader("Content-type", "application/json");
  //         var myJsonString = JSON.stringify(data);
  //         //console.log(myJsonString);
  //         req.send(myJsonString);
  // },

//TODO: all functions using _sendJSONData will need to be updated to use this
//one that includes the rankingID
  _sendJSONDataWithRankingID: function(data, rankingID){
    console.log('rankingID inside _sendJSONDataWithRankingID',rankingID)
    //console.log('inside _sendJSONDataWithRankingID')
    let httpString = "https://api.jsonbin.io/b/";
    //httpString += rankingID + '"';
    httpString += rankingID;
    let req = new XMLHttpRequest();

        req.onreadystatechange = () => {
          if (req.readyState == XMLHttpRequest.DONE) {
            console.log('httpString in req.onreadystatechange', httpString);
            //NB. when checking on jsonbin.io e.g. https://jsonbin.io/5c340b667b31f426f8531274/1
            //ensure you include the version number to see that the array has been 'PUT'
            console.log('req.responseText in _sendJSONDataWithRankingID', req.responseText);
            //console.log(req.responseText);
            return req.responseText;
          }
        };
        //NOTE: it is the api.jsonbin NOT the jsonbin.io!
        //JSON data can and should be in ANY order
        //bin id is: https://jsonbin.io/5bd82af2baccb064c0bdc92a/
        //use above to edit manually.
        //to view latest https://api.jsonbin.io/b/5bd82af2baccb064c0bdc92a/latest

        req.open("PUT", httpString, true);
        req.setRequestHeader("Content-type", "application/json");
        let myJsonString = JSON.stringify(data);
        console.log('httpString, data, data.id in _sendJSONDataWithRankingID', httpString, data, data.id);

        //if this is a new ranking send an array, not just an object
        //if this is a new ranking id will be 1
        //HACK: there may be a better way to test that this is a new ranking and user
        //the first entry to jsonbin must have array brackets so that responseJson can be
        //correctly displayed in BootstrapTable
        if(data.id === 1){
        const myJsonStringAsArray = "[" + myJsonString + "]";
          req.send(myJsonStringAsArray);
        }else{
          req.send(myJsonString);
        }
        //return null;
},

//NB: currently this is sent to the hardcoded global ranking list at 5c36f5422c87fa27306acb52
  _sendCreateNewRankingJSONData:  function(origGlobalRankingData, rankingID, rankName, rankDescription){
    console.log('inside _sendCreateNewRankingJSONData', rankingID, rankName, rankDescription)
    let createNewJSONrankingObj = {
      jsonRS: origGlobalRankingData
      };
      const globalRankingsDefaultId = '5c36f5422c87fa27306acb52';
      const newData = {
                        "RANKINGID": rankingID,
                        "ACTIVE": true,
                        "RANKINGDESC": rankDescription,
                        "RANKINGNAME": rankName
                      }
      createNewJSONrankingObj.jsonRS.push(newData);
      return this._sendJSONDataWithRankingID(createNewJSONrankingObj.jsonRS, globalRankingsDefaultId);
    }
}

export default JSONops;

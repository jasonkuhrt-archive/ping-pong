'use strict';



function countdown(from){
  function countdownOne(by){
    return countdownOne.now += by;
  }
  countdownOne.from = from;
  countdownOne.now = from;
  countdownOne.reset = function(){
    countdownOne.now = from;
  };
  return countdownOne;
}



module.exports = countdown;
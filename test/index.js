/* global it, describe */
'use strict';
var util = require('util');
var a = require('assert');
var pp = require('../');



describe('ping-pong', function(){
  var edgeCases = [[0,0],[0,1],[1,0]];
  var fuzCases = accumulate(10, function(){ return [random(0, 1), random(0, 19)]; });

  it('start(bout) starts the bout', test_start());

  it('stop(bout) aborts the bout', test_stop());

  describe('catchPong(bout)', function(){
    it('keeps the bout going', test_catch(1, 6));

    it('after invocation the bout\'s current interval completes before doing another ping', function(done){
      function finish(spamInterval){
        clearInterval(spamInterval);
        pp.stop(bout);
        a.equal(roundCount.numNow, expectedRounds);
        done();
      }
      var roundCount = roundCounter(0);
      var intervalMs = 10;
      var expectedRounds = 2;
      var bout = pp(intervalMs, 3, roundCount);
      var spam = setInterval(pp.catchPong, 1, bout);
      setTimeout(finish, (intervalMs * expectedRounds), spam);
      pp.start(bout);
    });
  });

  describe('Before timeout, ping fires once plus retryLimit', function(){
    edgeCases.forEach(function(args){
      it(argsString(args), test_ping_times.apply(null, args));
    });
    fuzCases.forEach(function(args){
      it(argsString(args), test_ping_times.apply(null, args));
    });
  });

});



function test_stop(){
  return function(){
    var bout = pp(1, 2, function(){
      pp.stop(bout);
      a.equal(bout.state.retryCountdown, undefined);
    });
    pp.start(bout);
  };
}


function test_start(){
  return function(done){
    var bout = pp(1, 1, function(){});
    pp.start(bout);
    a(bout.state.retryCountdown);
    bout.on('error', function(){ done(); });
  };
}


function test_catch(intervalMs, retryLimit){
  return function(done){
    var doRoundsCount = 2;
    var expectedRoundsCount = roundCounter(0);
    var retryCountChecker = roundCounter(0);
    var bout = pp(intervalMs, retryLimit, function(retryCountNow){
      // Check the retry roundCounter
      a.equal(retryCountNow, retryCountChecker.numNow);
      retryCountChecker();
      if (retryCountNow === retryLimit) {
        // Catch pong at every retry limit
        // and reset the retry checker.
        retryCountChecker = roundCounter(0);
        pp.catchPong(bout);
        // Stop when we've reached specified round roundCount.
        if (expectedRoundsCount() === doRoundsCount) {
          pp.stop(bout);
          done();
        }
      }
    });
    pp.start(bout);
  };
}


function test_ping_times(intervalMs, retryLimit){
  return function(done){
    var roundCount = roundCounter(0);
    var bout = pp(intervalMs, retryLimit, roundCount);
    bout.once('error', function(){
      a.equal(roundCount.numNow, retryLimit + 1);
      done();
    });
    pp.start(bout);
  };
}






// Domain Helpers

function argsString(args){
  return util.format('intervalMs: %j, retryLimit: %j', args[0], args[1]);
}

function random(min, max){
  return min + Math.floor(Math.random() * (max - min + 1));
}

function accumulate(times, f){
  var acc = [], at = 0;
  while (++at <= times) acc.push(f());
  return acc;
}

function roundCounter(startingNum){
  function roundCount(){
    return roundCount.numNow += 1;
  }
  roundCount.startingNum = startingNum;
  roundCount.numNow = startingNum;
  return roundCount;
}
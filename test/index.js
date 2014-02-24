/* global it, describe */
'use strict';
var util = require('util');
var a = require('assert');
var pp = require('../');



describe('ping-pong', function(){
  var edgeCases = [[0,0],[0,1],[1,0]];
  var fuzCases = accumulate(10, function(){ return [random(0, 1), random(0, 19)]; });

  describe('catchPong keeps the bout going', function(){
    it(argsString([0,1]), test_catch(0,1));
    it(argsString([5,100]), test_catch(0,1));
  });

  it('start(bout) starts the bout', test_start());

  it('stop(bout) aborts the bout', test_stop());

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
    var bout = pp(1, 3, function(){
      pp.stop(bout);
      a.equal(bout.state.retryCountdown, undefined);
    });
    pp.start(bout);
  };
}


function test_start(){
  return function(done){
    var bout = pp(1, 3, function(){});
    pp.start(bout);
    a(bout.state.retryCountdown);
    bout.on('error', function(){ done(); });
  };
}


function test_catch(intervalMs, retryLimit){
  return function(done){
    var doRoundsCount = 3;
    var roundsCount = counter(0);
    var retryCountChecker = counter(0);
    var bout = pp(intervalMs, retryLimit, function(retryCountNow){
      // Check the retry counter
      a.equal(retryCountNow, retryCountChecker.numNow);
      retryCountChecker();
      if (retryCountNow === retryLimit) {
        // Catch pong at every retry limit
        // and reset the retry checker.
        retryCountChecker = counter(0);
        pp.catchPong(bout);
        // Stop when we've reached specified round count.
        if (roundsCount() === doRoundsCount) {
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
    var count = counter(0);
    var bout = pp(intervalMs, retryLimit, count);
    bout.once('error', function(){
      a.equal(count.numNow, retryLimit + 1);
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

function counter(startingNum){
  function count(){
    return count.numNow += 1;
  }
  count.startingNum = startingNum;
  count.numNow = startingNum;
  return count;
}
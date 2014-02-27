/* global it, describe */
'use strict';
var util = require('util');
var a = require('assert');
var Counter = require('jasonkuhrt-counter');
var pp = require('../');



describe('ping-pong', function(){
  var edgeCases = [[0,0],[0,1],[1,0]];
  var fuzCases = accumulate(10, function(){ return [random(0, 1), random(0, 19)]; });

  it('clear(timer) stops the timer', test_clear());

  describe('pong(timer)', function(){
    it('keeps the timer going', test_catch(1, 6));

    it('after invocation the timer\'s current interval completes before doing another ping', function(done){
      function onTimeout(ronudsCompleted){
        a.equal(ronudsCompleted, expectedRounds);
        // Counter should be 3 because after two rounds
        // invoked once more until failure.
        a.equal(count.value() - 1, expectedRounds);
        done();
      }
      var count = Counter(0);
      var intervalMs = 10;
      var expectedRounds = 2;
      var timer = pp(intervalMs, 0, count.inc, onTimeout);
      var spam = setInterval(pp.pong, 1, timer);
      setTimeout(clearInterval, (intervalMs * expectedRounds), spam);
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



function test_clear(){
  return function(){
    var timer = pp(1, 2, function(){
      pp.clear(timer);
      a.equal(timer.state.intervalTimer, undefined);
    });
  };
}


function test_catch(intervalMs, retryLimit){
  return function(done){
    var doRoundsCount = 2;
    var expectedRoundsCount = Counter(0);
    var timer = pp(intervalMs, retryLimit, function(retriesLeft){
      // Check the retry Counter
      //console.log(retriesLeft);
      a.equal(retriesLeft - 1, --retryLimit);
      if (!retriesLeft) {
        // Catch pong at every retry limit
        // and pong the retry checker.
        retryLimit = timer.conf.retryLimit;
        pp.pong(timer);
        // Stop when we've reached specified round count.
        if (expectedRoundsCount.inc().value() === doRoundsCount) {
          pp.clear(timer);
          done();
        }
      }
    }, function(){});
  };
}


function test_ping_times(intervalMs, retryLimit){
  return function(done){
    var count = Counter(0);
    function onTimeout(rounds, retryLimit){
      a.equal(count.value(), retryLimit + 1);
      done();
    }
    pp(intervalMs, retryLimit, count.inc, onTimeout);
  };
}






// Domain Helpers

function noargs(f){
  return function(){
    return f();
  };
}

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
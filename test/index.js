'use strict';
var tap = require('tap'),
    test = tap.test;
var pp = require('../');




test('ping fires once plus retry-count', function(t){
  var argss = accumulate(10, function(){ return [random(0, 1), random(0, 19)]; });
  argss.forEach(function(args){
    t.test(test_ping_times.apply(null, args));
  });
});

function test_ping_times(intervalMs, retryLimit){
  return function(t){
    t.plan(1);
    var count = counter(0);
    var bout = pp(intervalMs, retryLimit, count);
    bout.once('error', function(){
      t.equal(count.numNow, retryLimit + 1);
    });
    pp.start(bout);
  };
}



// Domain Helpers

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

// t.plan(1);
// var a = 0;
// var do_ping = function(){
//   a += 1;
// };
// function on_error(){
//   t.equal(a, 4, 'pinged 3 times');
// }
// var bout = pingpong(500, 3, do_ping);
// pingpong.start(bout);
// bout.once('error', on_error);
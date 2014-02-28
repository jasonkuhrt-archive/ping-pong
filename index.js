'use strict';
var log = require('debug')('ping-pong');
var Counter = require('jasonkuhrt-counter');



//  a, b, c, d, e Int: a, b, (c, d -> *), (e, d -> *) -> timer
//
//  @param  intervalMs  Int
//  The milliseconds between each sent ping.
//
//  @param  retryLimit  Int
//  The maximum number of allowed dropped pings.
//  As soon as this limit is surpassed an 'error'
//  will be emitted.
//
//  @param  ping  Int, Int -> *
//  A function that will be invoked once upon start
//  and then once at the end of each subsequent interval.
//
//  The function receives two arguments, the number
//  of retries left and the total number of retries to attempt.
//  It is invoked for your side-affect and accordingly
//  ping-pong ignores its return value.
//
//  @param  onTimeout  Int, Int -> *
//  A function that will be invoked once the maximum
//  allowed drops is surpassed.
//
//  The function receives two arguments, the number
//  of successful rounds prior to this failure, and the
//  total number of retries to attempt. It is
//  invoked for your side-affect and accordingly
//  ping-pong ignores its return value.
//
function PingPong(intervalMs, retryLimit, ping, onTimeout){
  if (typeof intervalMs !== 'number' || intervalMs < 0) throw new Error('intervalMs must be an integer >= 0 but was:' + intervalMs);
  if (typeof retryLimit !== 'number' || retryLimit < 0) throw new Error('retryLimit must be an integer >= 0 but was:' + retryLimit);
  // Create a timer object that will be
  // an event emitter with addition properties
  // for state and configuration settings.
  var timer = {};
  timer.conf = {
    ping: ping,
    onTimeout: onTimeout,
    intervalMs: intervalMs,
    retryLimit: retryLimit
  };
  timer.state = {
    intervalTimer: undefined,
    receivedPong: false,
    retryCounter: Counter(retryLimit),
    roundsCount: 0
  };
  // Its possible that given a very small
  // intervalMs (0 for example) that the
  // return timer will not be setup in time
  // for execution of ping.
  //
  // An example problem is that
  // ping would use the closure to
  // pingPong.clear(timer) only to find that timer
  // is, confusingly, still undefined.
  setImmediate(_start, timer);
  return timer;
}


//  a timer: a -> a
//
function clear(timer){
  log('stop');
  timer.state.intervalTimer = clearInterval(timer.state.intervalTimer);
  timer.state.retryCounter.clear();
  return timer;
}


//  a timer: a -> a
//
//  Notify ping that its pong has arrived.
//  This restarts the retry Counter thus
//  ensuring that the session continues on
//  the next interval. Calling pong
//  more than once per interval is noop.
//
function pong(timer){
  if (!timer.state.receivedPong) {
    log('< pong');
    timer.state.receivedPong = true;
    timer.state.retryCounter.reset();
    timer.state.roundsCount++;
  }
  return timer;
}



// Private Functions

function _start(timer){
  log('start %j', timer.conf);
  timer.state.intervalTimer = setInterval(_onInterval, timer.conf.intervalMs, timer);
  return _ping(timer);
}

function _onInterval(timer){
  return timer.state.receivedPong ? _ping(timer) : _pingRetry(timer) ;
}

function _ping(timer){
  log('> ping');
  timer.state.receivedPong = false;
  timer.conf.ping(timer.state.retryCounter.value(), timer.conf.retryLimit);
  return timer;
}

function _pingRetry(timer){
  log('drop');
  var retryCounter = timer.state.retryCounter;
  if (retryCounter.dec().value() === -1) {
    log('retry limit reached');
    timer.conf.onTimeout(timer.state.roundsCount, timer.conf.retryLimit);
    return clear(timer);
  } else {
    log('retry %d/%d', timer.conf.retryLimit - retryCounter.value(), timer.conf.retryLimit);
    return _ping(timer);
  }
}



module.exports = PingPong;
module.exports.clear = clear;
module.exports.pong = pong;
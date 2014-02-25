'use strict';
var log = require('debug')('ping-pong');
var EventEmitter = require('events').EventEmitter;



// a, b, c Int:  a, b, (c -> *) -> timer
//
//  @param  intervalMs  Int
//  The milliseconds between each sent ping.
//
//  @param  retryLimit  Int
//  The maximum number of allowed dropped pings.
//  As soon as this limit is surpassed an 'error'
//  will be emitted.
//
//  @param  doPing  Int -> *
//  A function that will be invoked once at the end
//  of each interval. This function should implement
//  whatever 'ping' logic you need.
//
//  The function receives one argument, the current
//  retryCount. Its value is zero on the first ping.
//  It is invoked for your side-affect and accordingly
//  ping-pong ignores its return value.
//
function PingPong(intervalMs, retryLimit, doPing){
  if (typeof intervalMs !== 'number' || intervalMs < 0) throw new Error('intervalMs must be an integer >= 0 but was:' + intervalMs);
  if (typeof retryLimit !== 'number' || retryLimit < 0) throw new Error('retryLimit must be an integer >= 0 but was:' + retryLimit);
  // Create a timer object that will be
  // an event emitter with addition properties
  // for state and configuration settings.
  var timer = Object.create(new EventEmitter());
  timer.doPing = doPing;
  timer.conf = {
    intervalMs: intervalMs,
    retryLimit: retryLimit
  };
  timer.state = {
    received_pong: false,
    retryCount: 0,
    retryCountdown: undefined
  };

  return timer;
}


//  a timer: a -> a
//
function start(timer){
  log('start %j', timer.conf);
  timer.state.retryCountdown = setInterval(_onInterval, timer.conf.intervalMs, timer);
  return _ping(timer);
}


//  a timer: a -> a
//
function stop(timer){
  log('stop');
  timer.state.retryCountdown = clearInterval(timer.state.retryCountdown);
  timer.state.retryCount = 0;
  return timer;
}


//  a timer: a -> a
//
//  Notify ping that its pong has arrived.
//  This restarts the retry counter thus
//  ensuring that the session continues on
//  the next interval. Calling catchPong
//  more than once per interval is noop.
//
function catchPong(timer){
  if (!timer.state.received_pong) {
    log('< pong (ping answered)');
    timer.state.received_pong = true;
    timer.state.retryCount = 0;
  }
  return timer;
}



// Private Functions

function _onInterval(timer){
  log('loop');
  return timer.state.received_pong ? _ping(timer) : _pingRetry(timer) ;
}

function _ping(timer){
  log('> ping');
  timer.state.received_pong = false;
  timer.doPing(timer.state.retryCount);
  return timer;
}

function _pingRetry(timer){
  log('... drop (ping not answered)');
  timer.state.retryCount += 1;
  if (timer.state.retryCount > timer.conf.retryLimit){
    log('retry limit reached');
    timer.emit('error', _errorRetryLimit(timer));
    return stop(timer);
  } else {
    log('retry %d/%d', timer.state.retryCount, timer.conf.retryLimit);
    return _ping(timer);
  }
}

function _errorRetryLimit(timer){
  return new Error('ping-pong retry limit of '+ timer.conf.retryLimit +' reached');
}



module.exports = PingPong;
module.exports.start = start;
module.exports.stop = stop;
module.exports.catchPong = catchPong;
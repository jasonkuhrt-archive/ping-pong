'use strict';
var log = require('debug')('ping-pong');
var EventEmitter = require('events').EventEmitter;



function PingPong(intervalMs, retryLimit, doPing){
  if (typeof intervalMs !== 'number' || intervalMs < 0) throw new Error('intervalMs must be an integer >= 0 but was:' + retryLimit);
  if (typeof retryLimit !== 'number' || retryLimit < 0) throw new Error('retryLimit must be an integer >= 0 but was:' + retryLimit);

  // Create a bout object that will be
  // an event emitter with addition properties
  // for state and configuration settings.
  var bout = Object.create(new EventEmitter());

  bout.doPing = doPing;

  bout.conf = {
    intervalMs: intervalMs,
    retryLimit: retryLimit
  };

  bout.state = {
    retryCount: 0,
    retryCountdown: undefined
  };

  return bout;
}


function start(bout){
  log('start %j', bout.conf);
  bout.state.retryCountdown = setInterval(function(){
    log('!< drop (ping not answered)');
    _retry(bout);
  }, bout.conf.intervalMs);
  return _ping(bout);
}


function catchPong(bout){
  log('< pong (ping answered)');
  return _reset(bout);
}


function stop(bout){
  log('stop');
  clearInterval(bout.state.retryCountdown);
  _reset(bout);
  return bout;
}



// Private Functions

function _reset(bout){
  bout.state.retryCount = 0;
  return bout;
}


function _retry(bout){
  bout.state.retryCount += 1;
  if (bout.state.retryCount > bout.conf.retryLimit){
    log('retry limit reached');
    bout.emit('error', _errorRetryLimit(bout));
    return stop(bout);
  } else {
    log('retry %d/%d', bout.state.retryCount, bout.conf.retryLimit);
    return _ping(bout);
  }
}


function _ping(bout){
  log('> ping');
  bout.doPing();
  return bout;
}

function _errorRetryLimit(bout){
  return new Error('ping-pong retry limit of '+bout.conf.retryLimit+' reached');
}



module.exports = PingPong;
module.exports.start = start;
module.exports.stop = stop;
module.exports.catchPong = catchPong;
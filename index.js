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
  return _start(bout);
}


function stop(bout){
  log('stop');
  return _stop(bout);
}


function catchPong(bout){
  log('< pong (ping answered)');
  _stop(bout);
  return _start(bout);
}






// Private Functions
function _stop(bout){
  bout.state.retryCountdown = clearInterval(bout.state.retryCountdown);
  bout.state.retryCount = 0;
  return bout;
}


function _start(bout){
  bout.state.retryCountdown = setInterval(
    _retry, bout.conf.intervalMs, bout);
  return _ping(bout);
}


function _retry(bout){
  log('... drop (ping not answered)');
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
  bout.doPing(bout.state.retryCount);
  return bout;
}

function _errorRetryLimit(bout){
  return new Error('ping-pong retry limit of '+bout.conf.retryLimit+' reached');
}



module.exports = PingPong;
module.exports.start = start;
module.exports.stop = stop;
module.exports.catchPong = catchPong;
exports.start = function ping_pong_start(socket, intervalMs_s, ping_max_trys){
  var is_externally_disconnected = false;
  var try_count = 1;
  function handle_external_disconnect(){
     log('external_disconnect');
     stop_ping_round();
     is_externally_disconnected = true;
  }
  function handle_ping_result(err, is_pong_catch){
    if (err) return socket.emit('error', err);
    if (is_externally_disconnected) return;

    if (is_pong_catch) {
       socket.emit('pong', try_count);
       try_count = 1;
       stop_ping_round = ping(intervalMs_s, socket, try_count, handle_ping_result);
     } else if (try_count === ping_max_trys) {
       socket.removeListener('close', handle_external_disconnect);
       max_trys_disconnect(socket, noop);
     } else {
       log('ping unanswered');
       socket.emit('pingMiss', try_count);
       try_count = try_count + 1;
       stop_ping_round = ping(intervalMs_s, socket, try_count, handle_ping_result);
     }
  }
  var stop_ping_round = ping(intervalMs_s, socket, try_count, handle_ping_result);
  socket.once('close', handle_external_disconnect);
};



function ping(intervalMs_s, socket, try_count, cb){
  var timer;
  socket.write({cmd:'ping', value:try_count}, function(err){
    if (err) return cb(err);
    timer = catch_pong(intervalMs_s, socket, try_count, cb);
  });
  // return a killswitch for the timer
  return function(){
    return clearTimeout(timer);
  };
}



// Listen to given socket's data for a
// specific pong until interval is reached.
// Callback with flag indicating if said pong
// occured.
function catch_pong(timeout_s, socket, try_count, cb){
  var is_pong_catch = false;
  function capture_match(msg){
    if (is_pings_pong(try_count, msg)) {
      log('ping answered');
      is_pong_catch = true;
      socket.removeListener('data', capture_match);
    }
  }
  function do_timeout(){
    do_end(is_pong_catch);
  }
  function do_end(is_catch){
    socket.removeListener('data', capture_match);
    clearTimeout(capture_match_timeout);
    cb(null, is_catch);
  }
  var capture_match_timeout = setTimeout(do_timeout, s_to_ms(timeout_s));
  socket.addListener('data', capture_match);
}

function max_trys_disconnect(socket, cb){
  log('max_trys_disconnect');
  socket.emit('pingMaxTrysReached');
  kill_socket(socket, cb);
}






// Domain Helpers

function s_to_ms(s){
  return s * 1000;
}

function is_pings_pong(try_count, o){
  return o['data'] === 'pong' && o['value'] === try_count;
}

function kill_socket(socket, cb){
  socket.once('close', returns_to_async(cb));
  socket.destroy();
}

function returns_to_async(cb){
  return 'function' !== typeof cb ?
    noop :
    function do_returns_to_async(){
      var cb_args = [null].concat(Array.prototype.slice.apply(arguments));
      return cb.apply(null, cb_args);
    } ;
}

function noop(){}
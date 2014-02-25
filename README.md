# ping-pong [![Build Status](https://travis-ci.org/jasonkuhrt/ping-pong.png?branch=master)](https://travis-ci.org/jasonkuhrt/ping-pong) [![Code Climate](https://codeclimate.com/github/jasonkuhrt/ping-pong.png)](https://codeclimate.com/github/jasonkuhrt/ping-pong) [![Dependency Status](https://gemnasium.com/jasonkuhrt/ping-pong.png)](https://gemnasium.com/jasonkuhrt/ping-pong)

Low level and abstract KeepAlive-like structure.


## Installation
```
npm install ping-pong
```

## API

See source code for more details and parameter explaination.

#### PingPong
```
a, b, c, d, e Int: a, b, (c, d -> *), (e, d -> *) -> timer
```

#### pong
```
a timer: a -> a
```

#### clear
```
a timer: a -> a
```


## Debug Mode

Uses [`debug`](https://github.com/visionmedia/debug), e.g.:

```
DEBUG=ping-pong node foo.js

ping-pong start {"intervalMs":10,"retryLimit":0} +1ms
ping-pong > ping +0ms
ping-pong < pong +1ms
ping-pong > ping +10ms
ping-pong < pong +0ms
ping-pong > ping +10ms
ping-pong drop +11ms
ping-pong retry limit reached +0ms
ping-pong stop +0ms
```
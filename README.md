# ping-pong [![Build Status](https://travis-ci.org/jasonkuhrt/ping-pong.png?branch=master)](https://travis-ci.org/jasonkuhrt/ping-pong) [![Code Climate](https://codeclimate.com/github/jasonkuhrt/ping-pong.png)](https://codeclimate.com/github/jasonkuhrt/ping-pong) [![Dependency Status](https://gemnasium.com/jasonkuhrt/ping-pong.png)](https://gemnasium.com/jasonkuhrt/ping-pong)


Low level KeepAlive-like structure exposed as an event emitter.

ping-pong is an application-layer KeepAlive-like system. Unlike
KeepAlive its activity can be logged, is locally configurable,
and exposes an api for applications to integrate as-needed.

## Installation
```
npm install ping-pong
```

## API

See source code for more details and parameter explaination.

#### PingPong
```
a, b, c Int: a, b, (c -> *) -> timer
```

#### start
```
a timer: a -> a
```

#### stop
```
a timer: a -> a
```

#### catchPong
```
a timer: a -> a
```

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
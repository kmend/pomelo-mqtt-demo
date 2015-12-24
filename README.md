## pomelo-mqtt-demo

A simple demo using [pomelo](https://github.com/NetEase/pomelo) and mqttconnector

## Test

In order to test this demo, you should install mqtt globally using following command

```sh
npm install -g mqtt
```

after start pomelo, on one terminal, run following command to subscribe

```
mqtt sub -t "AnyTopic" -h "localhost" -p 3010
```

on another, run following command to publish a message

```
mqtt pub -t "AnyTopic" -h "localhost" -p 3010 -m "Hello World"
```

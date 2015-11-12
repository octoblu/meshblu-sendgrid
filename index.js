'use strict';
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var debug = require('debug')('meshblu-sendgrid')
var sendgrid;


var MESSAGE_SCHEMA = {
  type: 'object',
  properties: {
    from: {
      type: 'string',
      required: true
    },
    to: {
      type: 'string',
      required: true
    },
    subject: {
      type: 'string',
      required: true
    },
    text: {
      type: 'string',
      required: true
    },
    html: {
      type: 'string',
      default: "<p></p>"
    },
    b64: {
      type: 'string'
    }
  }
};

var OPTIONS_SCHEMA = {
  type: 'object',
  properties: {
    api_user: {
      type: 'string',
      required: true,
      default: ''
    },
    api_password: {
      type: 'string',
      required: true,
      default: ''
    }
  }
};

function Plugin(){
  var self = this;
  self.options = {};
  self.messageSchema = MESSAGE_SCHEMA;
  self.optionsSchema = OPTIONS_SCHEMA;
  return self;
}
util.inherits(Plugin, EventEmitter);

Plugin.prototype.onMessage = function(message){
  var self = this;
  var payload = message.payload;
  var email     = new sendgrid.Email();

  email.to      = payload.to;
  email.subject = payload.subject;
  email.from    = payload.from;
  email.text    = payload.text;
  email.html    = payload.html;

  if(payload.b64){
    var img = payload.b64;
    var data = img.replace(/^data:image\/\w+;base64,/, "");
    var file = new Buffer(data, 'base64');
    var filename = 'octoblu.jpeg';
    email.addFile({
      filename: filename,
      content:  file
    });
  }

  sendgrid.send(email, function(err, json) {
    if (err) { return console.error(err); }
    console.log(json);
  });
};

Plugin.prototype.onConfig = function(device){
  var self = this;
  self.setOptions(device.options||{});
};

Plugin.prototype.setOptions = function(options){
  var self = this;
  self.options = options;
  sendgrid = require('sendgrid')(self.options.api_user, self.options.api_password);

};

module.exports = {
  messageSchema: MESSAGE_SCHEMA,
  optionsSchema: OPTIONS_SCHEMA,
  Plugin: Plugin
};

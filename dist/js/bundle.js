(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function() {
  var App, Main, Vue, VueRouter, main;

  Vue = require('vue');

  VueRouter = require('vue-router');

  Vue.use(VueRouter);

  App = Vue.extend({});

  window.electron = eRequire('electron').remote;

  window.fs = eRequire('fs');

  window.git = eRequire('simple-git');

  window.mkdir = eRequire('mkdirp');

  window.request = eRequire('request');

  window.os = eRequire('os');

  main = function() {
    this.after('initialize', function() {
      var openpgp;
      document.addEventListener('keydown', (function(_this) {
        return function(e) {
          if (e.which === 13) {
            return e.preventDefault();
          }
        };
      })(this));
      document.addEventListener('keyup', (function(_this) {
        return function(e) {
          if (e.altKey === true && e.which === 67) {
            _this.clear();
            return document.location.reload();
          }
        };
      })(this));
      openpgp = require('./openpgp.min.js');
      openpgp.initWorker({
        path: '/js/openpgp.worker.min.js'
      });
      this.pgp = openpgp;
      this.Vue = Vue;
      this.settings = $.extend({
        watchers: [],
        lastSync: 0,
        ready: false
      }, JSON.parse(localStorage.getItem('settings')));
      this.data = function() {
        return {
          appName: 'Trailbot',
          isElectron: 'electron' in window
        };
      };
      document.app = this;
      this.router = new VueRouter();
      this.router.map({
        '/': {
          component: require('../../src/vue/empty.vue')
        },
        '/unlock': {
          component: require('../../src/vue/unlock.vue')
        },
        '/wizard': {
          component: require('../../src/vue/wizard/main.vue'),
          subRoutes: {
            '/': {
              component: require('../../src/vue/wizard/welcome.vue')
            },
            '/generate': {
              component: require('../../src/vue/wizard/generate.vue')
            },
            '/export': {
              component: require('../../src/vue/wizard/export.vue')
            },
            '/preImport': {
              component: require('../../src/vue/wizard/preImport.vue')
            },
            '/watcherGuide': {
              component: require('../../src/vue/wizard/watcherGuide.vue')
            },
            '/import': {
              component: require('../../src/vue/wizard/import.vue')
            },
            '/congrats': {
              component: require('../../src/vue/wizard/congrats.vue')
            }
          }
        },
        '/dashboard': {
          component: require('../../src/vue/dashboard/main.vue')
        },
        '/dashboard/:watcher': {
          name: 'watcher',
          component: require('../../src/vue/dashboard/main.vue'),
          subRoutes: {
            '/fileAdd': {
              name: 'fileAdd',
              component: require('../../src/vue/dashboard/fileAdd.vue')
            },
            '/file/:file': {
              name: 'file',
              component: require('../../src/vue/dashboard/file.vue'),
              subRoutes: {
                '/policyAdd': {
                  name: 'policyAdd',
                  component: require('../../src/vue/dashboard/policyAdd.vue')
                },
                '/policy/:policy': {
                  name: 'policy',
                  component: require('../../src/vue/dashboard/policy.vue')
                },
                '/event/:event': {
                  name: 'event',
                  component: require('../../src/vue/dashboard/event.vue')
                }
              }
            }
          }
        }
      });
      this.router.afterEach((function(_this) {
        return function(transition) {
          var methods;
          methods = transition.to.matched.slice(-1)[0].handler.component.options.methods;
          if (methods != null ? methods.run : void 0) {
            return methods.run(_this.router.app.$route, transition);
          }
        };
      })(this));
      this.router.start(App, '#app');
      if (this.settings.keys != null) {
        this.privateKey = this.pgp.key.readArmored(document.app.settings.keys.priv).keys[0];
        return this.router.replace('/unlock');
      } else {
        return this.router.replace('/wizard');
      }
    });
    this.save = function() {
      console.log('SAVING APP');
      return localStorage.setItem('settings', JSON.stringify(this.settings));
    };
    this.copy = function(text) {
      var el, err;
      el = $('<input type="text"/>').val(text);
      $('body').append(el);
      el.select();
      try {
        return document.execCommand('copy');
      } catch (_error) {
        err = _error;
        return window.prompt('Please, select the text, copy it and paste it in a safe place', text);
      } finally {
        el.remove();
      }
    };
    this.paste = function(cb) {
      var err;
      try {
        return cb(electron.clipboard.readText());
      } catch (_error) {
        err = _error;
        return cb(window.prompt('Please, paste the text down below'));
      }
    };
    this.clear = function() {
      return localStorage.clear();
    };
    return this.fooEvent = {
      diff: [
        {
          type: 'fill',
          lines: ["This is the old content"]
        }, {
          type: 'add',
          lines: ["This is a new line"]
        }
      ],
      prev: {
        time: Date.now() - 86400000,
        content: "This is the old content"
      },
      cur: {
        time: Date.now(),
        content: "This is the old content\nThis is a new line"
      },
      path: '/example/path/to/a/file'
    };
  };

  Main = flight.component(main);

  Main.attachTo(document);

  module.exports = Main;

}).call(this);

(function() {
  var Vault, app, iced, vault, __iced_k, __iced_k_noop;

  iced = require('iced-runtime');
  __iced_k = __iced_k_noop = function() {};

  app = document.app;

  vault = function() {
    this.after('initialize', (function(_this) {
      return function() {
        _this.hz = new Horizon({
          authType: 'anonymous'
        });
        _this.hz.connect();
        _this.users = _this.hz('users');
        _this.settings = _this.hz('settings');
        _this.events = _this.hz('events');
        _this.exchange = _this.hz('exchange');
        console.log(JSON.stringify(_this.events));
        _this.hz.onReady(function() {
          return console.log('Connected to Horizon!');
        });
        _this.hz.onDisconnected(function(e) {});
        _this.hz.currentUser().fetch().subscribe(function(me) {
          var fingerprint, _ref;
          console.log(JSON.stringify(me));
          _this.me = me;
          if ((_ref = app.settings.keys) != null ? _ref.fingerprint : void 0) {
            fingerprint = app.settings.keys.fingerprint;
            _this.updateFingerprint(fingerprint);
            return _this.settings.findAll(_this.fromMe).fetch().subscribe(function(settings) {
              console.log('New settings');
              return console.log(settings);
            }, function(error) {
              return console.error(error);
            }, function() {
              return console.log('Settings completed!');
            });
          }
        });
        document.vault = _this;
        return app.save();
      };
    })(this));
    this.retrieveEvents = (function(_this) {
      return function() {
        if (_this.retrieving) {
          return;
        }
        _this.retrieving = true;
        console.log("Retrieving events newer than " + app.settings.lastSync);
        return _this.events.order('datetime', 'descending').above({
          datetime: new Date(app.settings.lastSync || 0)
        }).findAll(_this.toMe).watch({
          rawChanges: true
        }).subscribe(function(changes) {
          if (changes.new_val != null) {
            _this.eventProcess(changes.new_val);
            app.settings.lastSync = new Date();
            return setTimeout(function() {
              return app.save();
            });
          } else if (changes.type === 'state' && changes.state === 'synced') {
            console.log('Finished syncing!');
            app.settings.lastSync = new Date();
            return setTimeout(function() {
              return app.save();
            });
          } else {
            return console.log('There are other changes');
          }
        });
      };
    })(this);
    this.updateFingerprint = (function(_this) {
      return function(fingerprint) {
        _this.fromMe = {
          creator: fingerprint
        };
        _this.toMe = {
          reader: fingerprint
        };
        return _this.users.replace($.extend(_this.me, {
          data: {
            key: fingerprint
          }
        }));
      };
    })(this);
    this.store = (function(_this) {
      return function(col, obj, cb) {
        var ___iced_passed_deferral, __iced_deferrals, __iced_k;
        __iced_k = __iced_k_noop;
        ___iced_passed_deferral = iced.findDeferral(arguments);
        (function(__iced_k) {
          if (obj.encrypt) {
            delete obj.encrypt;
            (function(__iced_k) {
              __iced_deferrals = new iced.Deferrals(__iced_k, {
                parent: ___iced_passed_deferral,
                filename: "./src/iced/vault.iced",
                funcname: "store"
              });
              _this.encrypt(obj, __iced_deferrals.defer({
                assign_fn: (function() {
                  return function() {
                    return obj = arguments[0];
                  };
                })(),
                lineno: 70
              }));
              __iced_deferrals._fulfill();
            })(__iced_k);
          } else {
            return __iced_k();
          }
        })(function() {
          return _this[col].store(obj).subscribe(function(result) {
            return cb(result.id);
          }, function(error) {
            return console.error(error);
          });
        });
      };
    })(this);
    this.replace = (function(_this) {
      return function(col, obj, cb) {
        var ___iced_passed_deferral, __iced_deferrals, __iced_k;
        __iced_k = __iced_k_noop;
        ___iced_passed_deferral = iced.findDeferral(arguments);
        console.log('Replacing', col, obj);
        (function(__iced_k) {
          if (obj.encrypt) {
            delete obj.encrypt;
            (function(__iced_k) {
              __iced_deferrals = new iced.Deferrals(__iced_k, {
                parent: ___iced_passed_deferral,
                filename: "./src/iced/vault.iced",
                funcname: "replace"
              });
              _this.encrypt(obj, __iced_deferrals.defer({
                assign_fn: (function() {
                  return function() {
                    return obj = arguments[0];
                  };
                })(),
                lineno: 81
              }));
              __iced_deferrals._fulfill();
            })(__iced_k);
          } else {
            return __iced_k();
          }
        })(function() {
          return _this[col].upsert(obj).subscribe(function(result) {
            return cb && cb(result.id);
          }, function(error) {
            return console.error(error);
          });
        });
      };
    })(this);
    this.find = (function(_this) {
      return function(col, obj, cb) {
        console.log('Finding', col, obj);
        return _this[col].find(obj).fetch().defaultIfEmpty().subscribe(cb);
      };
    })(this);
    this.watch = (function(_this) {
      return function(col, obj, cb) {
        var _ref;
        return (_ref = _this[col]) != null ? _ref.find(obj).watch().subscribe(function(items) {
          return cb && cb(items);
        }) : void 0;
      };
    })(this);
    this.eventProcess = (function(_this) {
      return function(_arg) {
        var content, creator, id, message, pgp, reader;
        content = _arg.content, creator = _arg.creator, reader = _arg.reader, id = _arg.id;
        pgp = app.pgp;
        message = pgp.message.readArmored(content);
        return message.decrypt(app.privateKey).then(function(_arg1) {
          var Vue, data, date, event, events, filename, key, keyPacket, literal, packets, path, sig, watcher, _i, _len, _ref;
          packets = _arg1.packets;
          literal = packets.findPacket(pgp.enums.packet.literal);
          filename = literal.filename, date = literal.date, data = literal.data;
          data = JSON.parse(pgp.util.Uint8Array2str(data));
          console.log('There is a new event ' + JSON.stringify({
            filename: filename,
            date: date
          }));
          watcher = app.settings.watchers.find(function(e) {
            return e.fingerprint === creator;
          });
          if (watcher) {
            sig = packets.findPacket(pgp.enums.packet.signature);
            keyPacket = null;
            _ref = pgp.key.readArmored(watcher.key).keys;
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              key = _ref[_i];
              keyPacket = key.getSigningKeyPacket(sig.issuerKeyId);
              if (keyPacket) {
                break;
              }
            }
            if (!(keyPacket && sig.verify(keyPacket, literal))) {
              return console.error("[CRYPTO] Wrong signature");
            }
            Vue = app.Vue;
            path = filename;
            event = {
              ref: Date.now(),
              time: date,
              content: data
            };
            if (watcher.events == null) {
              Vue.set(watcher, 'events', {});
            }
            if (watcher.events[path] == null) {
              Vue.set(watcher.events, path, []);
            }
            events = watcher.events[path];
            events.push(event);
            return Vue.set(watcher.events, path, events);
          }
        })["catch"](function(error) {
          return console.error(error);
        });
      };
    })(this);
    return this.encrypt = (function(_this) {
      return function(object, cb) {
        var creator, data, id, pgp, reader, v, watcher;
        id = object.id, v = object.v, creator = object.creator, reader = object.reader;
        pgp = app.pgp;
        watcher = app.settings.watchers.find(function(e) {
          return e.fingerprint === object.reader;
        });
        data = $.extend({}, object);
        delete data.id;
        delete data.v;
        delete data.creator;
        delete data.reader;
        return pgp.encrypt({
          data: JSON.stringify(data),
          publicKeys: pgp.key.readArmored(watcher.key).keys,
          privateKeys: app.privateKey
        }).then(function(cyphertext) {
          var content;
          content = cyphertext.data;
          return cb({
            id: id,
            v: v,
            creator: creator,
            reader: reader,
            content: content
          });
        })["catch"](function(error) {
          return console.error(error);
        });
      };
    })(this);
  };

  Vault = flight.component(vault);

  Vault.attachTo(document);

  module.exports = Vault;

}).call(this);

},{"../../src/vue/dashboard/event.vue":15,"../../src/vue/dashboard/file.vue":16,"../../src/vue/dashboard/fileAdd.vue":17,"../../src/vue/dashboard/main.vue":18,"../../src/vue/dashboard/policy.vue":19,"../../src/vue/dashboard/policyAdd.vue":20,"../../src/vue/empty.vue":21,"../../src/vue/unlock.vue":22,"../../src/vue/wizard/congrats.vue":23,"../../src/vue/wizard/export.vue":24,"../../src/vue/wizard/generate.vue":25,"../../src/vue/wizard/import.vue":26,"../../src/vue/wizard/main.vue":27,"../../src/vue/wizard/preImport.vue":28,"../../src/vue/wizard/watcherGuide.vue":29,"../../src/vue/wizard/welcome.vue":30,"./openpgp.min.js":2,"iced-runtime":5,"vue":13,"vue-router":12}],2:[function(require,module,exports){
(function (global){
/*! OpenPGP.js v2.3.3 - 2016-08-17 - this is LGPL licensed code, see LICENSE/our website http://openpgpjs.org/ for more information. */!function(a){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=a();else if("function"==typeof define&&define.amd)define([],a);else{var b;b="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:this,b.openpgp=a()}}(function(){var a;return function b(a,c,d){function e(g,h){if(!c[g]){if(!a[g]){var i="function"==typeof require&&require;if(!h&&i)return i(g,!0);if(f)return f(g,!0);var j=new Error("Cannot find module '"+g+"'");throw j.code="MODULE_NOT_FOUND",j}var k=c[g]={exports:{}};a[g][0].call(k.exports,function(b){var c=a[g][1][b];return e(c?c:b)},k,k.exports,b,a,c,d)}return c[g].exports}for(var f="function"==typeof require&&require,g=0;g<d.length;g++)e(d[g]);return e}({1:[function(b,c,d){!function(b,d){function e(){var a=Error.apply(this,arguments);this.message=a.message,this.stack=a.stack}function f(){var a=Error.apply(this,arguments);this.message=a.message,this.stack=a.stack}function g(){var a=Error.apply(this,arguments);this.message=a.message,this.stack=a.stack}function h(a,b){b=!!b;for(var c=a.length,d=new Uint8Array(b?4*c:c),e=0,f=0;e<c;e++){var g=a.charCodeAt(e);if(b&&55296<=g&&g<=56319){if(++e>=c)throw new Error("Malformed string, low surrogate expected at position "+e);g=(55296^g)<<10|65536|56320^a.charCodeAt(e)}else if(!b&&g>>>8)throw new Error("Wide characters are not allowed.");!b||g<=127?d[f++]=g:g<=2047?(d[f++]=192|g>>6,d[f++]=128|63&g):g<=65535?(d[f++]=224|g>>12,d[f++]=128|g>>6&63,d[f++]=128|63&g):(d[f++]=240|g>>18,d[f++]=128|g>>12&63,d[f++]=128|g>>6&63,d[f++]=128|63&g)}return d.subarray(0,f)}function i(a,b){b=!!b;for(var c=a.length,d=new Array(c),e=0,f=0;e<c;e++){var g=a[e];if(!b||g<128)d[f++]=g;else if(g>=192&&g<224&&e+1<c)d[f++]=(31&g)<<6|63&a[++e];else if(g>=224&&g<240&&e+2<c)d[f++]=(15&g)<<12|(63&a[++e])<<6|63&a[++e];else{if(!(g>=240&&g<248&&e+3<c))throw new Error("Malformed UTF8 character at byte offset "+e);var h=(7&g)<<18|(63&a[++e])<<12|(63&a[++e])<<6|63&a[++e];h<=65535?d[f++]=h:(h^=65536,d[f++]=55296|h>>10,d[f++]=56320|1023&h)}}for(var i="",j=16384,e=0;e<f;e+=j)i+=String.fromCharCode.apply(String,d.slice(e,e+j<=f?e+j:f));return i}function j(a){for(var b="",c=0;c<a.length;c++){var d=(255&a[c]).toString(16);d.length<2&&(b+="0"),b+=d}return b}function k(a){return btoa(i(a))}function l(a){return"number"==typeof a}function m(a){return"string"==typeof a}function n(a){return a instanceof ArrayBuffer}function o(a){return a instanceof Uint8Array}function p(a,b){var c=b.heap,d=c?c.byteLength:b.heapSize||65536;if(4095&d||d<=0)throw new Error("heap size must be a positive integer and a multiple of 4096");return c=c||new a(new ArrayBuffer(d))}function q(a,b,c,d,e){var f=a.length-b,g=f<e?f:e;return a.set(c.subarray(d,d+g),b),g}function r(a){a=a||{},this.heap=p(Uint8Array,a).subarray(da.HEAP_DATA),this.asm=a.asm||da(d,null,this.heap.buffer),this.mode=null,this.key=null,this.reset(a)}function s(a){if(void 0!==a){if(n(a)||o(a))a=new Uint8Array(a);else{if(!m(a))throw new TypeError("unexpected key type");a=h(a)}var b=a.length;if(16!==b&&24!==b&&32!==b)throw new f("illegal key size");var c=new DataView(a.buffer,a.byteOffset,a.byteLength);this.asm.set_key(b>>2,c.getUint32(0),c.getUint32(4),c.getUint32(8),c.getUint32(12),b>16?c.getUint32(16):0,b>16?c.getUint32(20):0,b>24?c.getUint32(24):0,b>24?c.getUint32(28):0),this.key=a}else if(!this.key)throw new Error("key is required")}function t(a){if(void 0!==a){if(n(a)||o(a))a=new Uint8Array(a);else{if(!m(a))throw new TypeError("unexpected iv type");a=h(a)}if(16!==a.length)throw new f("illegal iv size");var b=new DataView(a.buffer,a.byteOffset,a.byteLength);this.iv=a,this.asm.set_iv(b.getUint32(0),b.getUint32(4),b.getUint32(8),b.getUint32(12))}else this.iv=null,this.asm.set_iv(0,0,0,0)}function u(a){void 0!==a?this.padding=!!a:this.padding=!0}function v(a){return a=a||{},this.result=null,this.pos=0,this.len=0,s.call(this,a.key),this.hasOwnProperty("iv")&&t.call(this,a.iv),this.hasOwnProperty("padding")&&u.call(this,a.padding),this}function w(a){if(m(a)&&(a=h(a)),n(a)&&(a=new Uint8Array(a)),!o(a))throw new TypeError("data isn't of expected type");for(var b=this.asm,c=this.heap,d=da.ENC[this.mode],e=da.HEAP_DATA,f=this.pos,g=this.len,i=0,j=a.length||0,k=0,l=g+j&-16,p=0,r=new Uint8Array(l);j>0;)p=q(c,f+g,a,i,j),g+=p,i+=p,j-=p,p=b.cipher(d,e+f,g),p&&r.set(c.subarray(f,f+p),k),k+=p,p<g?(f+=p,g-=p):(f=0,g=0);return this.result=r,this.pos=f,this.len=g,this}function x(a){var b=null,c=0;void 0!==a&&(b=w.call(this,a).result,c=b.length);var d=this.asm,e=this.heap,g=da.ENC[this.mode],h=da.HEAP_DATA,i=this.pos,j=this.len,k=16-j%16,l=j;if(this.hasOwnProperty("padding")){if(this.padding){for(var m=0;m<k;++m)e[i+j+m]=k;j+=k,l=j}else if(j%16)throw new f("data length must be a multiple of the block size")}else j+=k;var n=new Uint8Array(c+l);return c&&n.set(b),j&&d.cipher(g,h+i,j),l&&n.set(e.subarray(i,i+l),c),this.result=n,this.pos=0,this.len=0,this}function y(a){if(m(a)&&(a=h(a)),n(a)&&(a=new Uint8Array(a)),!o(a))throw new TypeError("data isn't of expected type");var b=this.asm,c=this.heap,d=da.DEC[this.mode],e=da.HEAP_DATA,f=this.pos,g=this.len,i=0,j=a.length||0,k=0,l=g+j&-16,p=0,r=0;this.hasOwnProperty("padding")&&this.padding&&(p=g+j-l||16,l-=p);for(var s=new Uint8Array(l);j>0;)r=q(c,f+g,a,i,j),g+=r,i+=r,j-=r,r=b.cipher(d,e+f,g-(j?0:p)),r&&s.set(c.subarray(f,f+r),k),k+=r,r<g?(f+=r,g-=r):(f=0,g=0);return this.result=s,this.pos=f,this.len=g,this}function z(a){var b=null,c=0;void 0!==a&&(b=y.call(this,a).result,c=b.length);var d=this.asm,e=this.heap,h=da.DEC[this.mode],i=da.HEAP_DATA,j=this.pos,k=this.len,l=k;if(k>0){if(k%16){if(this.hasOwnProperty("padding"))throw new f("data length must be a multiple of the block size");k+=16-k%16}if(d.cipher(h,i+j,k),this.hasOwnProperty("padding")&&this.padding){var m=e[j+l-1];if(m<1||m>16||m>l)throw new g("bad padding");for(var n=0,o=m;o>1;o--)n|=m^e[j+l-o];if(n)throw new g("bad padding");l-=m}}var p=new Uint8Array(c+l);return c>0&&p.set(b),l>0&&p.set(e.subarray(j,j+l),c),this.result=p,this.pos=0,this.len=0,this}function A(a){this.iv=null,r.call(this,a),this.mode="CFB"}function B(a){A.call(this,a)}function C(a){A.call(this,a)}function D(a){this.nonce=null,this.counter=0,this.counterSize=0,r.call(this,a),this.mode="CTR"}function E(a){D.call(this,a)}function F(a,b,c){if(void 0!==c){if(c<8||c>48)throw new f("illegal counter size");this.counterSize=c;var d=Math.pow(2,c)-1;this.asm.set_mask(0,0,d/4294967296|0,0|d)}else this.counterSize=c=48,this.asm.set_mask(0,0,65535,4294967295);if(void 0===a)throw new Error("nonce is required");if(n(a)||o(a))a=new Uint8Array(a);else{if(!m(a))throw new TypeError("unexpected nonce type");a=h(a)}var e=a.length;if(!e||e>16)throw new f("illegal nonce size");this.nonce=a;var g=new DataView(new ArrayBuffer(16));if(new Uint8Array(g.buffer).set(a),this.asm.set_nonce(g.getUint32(0),g.getUint32(4),g.getUint32(8),g.getUint32(12)),void 0!==b){if(!l(b))throw new TypeError("unexpected counter type");if(b<0||b>=Math.pow(2,c))throw new f("illegal counter value");this.counter=b,this.asm.set_counter(0,0,b/4294967296|0,0|b)}else this.counter=b=0}function G(a){return a=a||{},v.call(this,a),F.call(this,a.nonce,a.counter,a.counterSize),this}function H(a){for(var b=this.heap,c=this.asm,d=0,e=a.length||0,f=0;e>0;){for(f=q(b,0,a,d,e),d+=f,e-=f;15&f;)b[f++]=0;c.mac(da.MAC.GCM,da.HEAP_DATA,f)}}function I(a){this.nonce=null,this.adata=null,this.iv=null,this.counter=1,this.tagSize=16,r.call(this,a),this.mode="GCM"}function J(a){I.call(this,a)}function K(a){I.call(this,a)}function L(a){a=a||{},v.call(this,a);var b=this.asm,c=this.heap;b.gcm_init();var d=a.tagSize;if(void 0!==d){if(!l(d))throw new TypeError("tagSize must be a number");if(d<4||d>16)throw new f("illegal tagSize value");this.tagSize=d}else this.tagSize=16;var e=a.nonce;if(void 0===e)throw new Error("nonce is required");if(o(e)||n(e))e=new Uint8Array(e);else{if(!m(e))throw new TypeError("unexpected nonce type");e=h(e)}this.nonce=e;var g=e.length||0,i=new Uint8Array(16);12!==g?(H.call(this,e),c[0]=c[1]=c[2]=c[3]=c[4]=c[5]=c[6]=c[7]=c[8]=c[9]=c[10]=0,c[11]=g>>>29,c[12]=g>>>21&255,c[13]=g>>>13&255,c[14]=g>>>5&255,c[15]=g<<3&255,b.mac(da.MAC.GCM,da.HEAP_DATA,16),b.get_iv(da.HEAP_DATA),b.set_iv(),i.set(c.subarray(0,16))):(i.set(e),i[15]=1);var j=new DataView(i.buffer);this.gamma0=j.getUint32(12),b.set_nonce(j.getUint32(0),j.getUint32(4),j.getUint32(8),0),b.set_mask(0,0,0,4294967295);var k=a.adata;if(void 0!==k&&null!==k){if(o(k)||n(k))k=new Uint8Array(k);else{if(!m(k))throw new TypeError("unexpected adata type");k=h(k)}if(k.length>ja)throw new f("illegal adata length");k.length?(this.adata=k,H.call(this,k)):this.adata=null}else this.adata=null;var p=a.counter;if(void 0!==p){if(!l(p))throw new TypeError("counter must be a number");if(p<1||p>4294967295)throw new RangeError("counter must be a positive 32-bit integer");this.counter=p,b.set_counter(0,0,0,this.gamma0+p|0)}else this.counter=1,b.set_counter(0,0,0,this.gamma0+1|0);var q=a.iv;if(void 0!==q){if(!l(p))throw new TypeError("counter must be a number");this.iv=q,t.call(this,q)}return this}function M(a){if(m(a)&&(a=h(a)),n(a)&&(a=new Uint8Array(a)),!o(a))throw new TypeError("data isn't of expected type");var b=0,c=a.length||0,d=this.asm,e=this.heap,f=this.counter,g=this.pos,i=this.len,j=0,k=i+c&-16,l=0;if((f-1<<4)+i+c>ja)throw new RangeError("counter overflow");for(var p=new Uint8Array(k);c>0;)l=q(e,g+i,a,b,c),i+=l,b+=l,c-=l,l=d.cipher(da.ENC.CTR,da.HEAP_DATA+g,i),l=d.mac(da.MAC.GCM,da.HEAP_DATA+g,l),l&&p.set(e.subarray(g,g+l),j),f+=l>>>4,j+=l,l<i?(g+=l,i-=l):(g=0,i=0);return this.result=p,this.counter=f,this.pos=g,this.len=i,this}function N(){var a=this.asm,b=this.heap,c=this.counter,d=this.tagSize,e=this.adata,f=this.pos,g=this.len,h=new Uint8Array(g+d);a.cipher(da.ENC.CTR,da.HEAP_DATA+f,g+15&-16),g&&h.set(b.subarray(f,f+g));for(var i=g;15&i;i++)b[f+i]=0;a.mac(da.MAC.GCM,da.HEAP_DATA+f,i);var j=null!==e?e.length:0,k=(c-1<<4)+g;return b[0]=b[1]=b[2]=0,b[3]=j>>>29,b[4]=j>>>21,b[5]=j>>>13&255,b[6]=j>>>5&255,b[7]=j<<3&255,b[8]=b[9]=b[10]=0,b[11]=k>>>29,b[12]=k>>>21&255,b[13]=k>>>13&255,b[14]=k>>>5&255,b[15]=k<<3&255,a.mac(da.MAC.GCM,da.HEAP_DATA,16),a.get_iv(da.HEAP_DATA),a.set_counter(0,0,0,this.gamma0),a.cipher(da.ENC.CTR,da.HEAP_DATA,16),h.set(b.subarray(0,d),g),this.result=h,this.counter=1,this.pos=0,this.len=0,this}function O(a){var b=M.call(this,a).result,c=N.call(this).result,d=new Uint8Array(b.length+c.length);return b.length&&d.set(b),c.length&&d.set(c,b.length),this.result=d,this}function P(a){if(m(a)&&(a=h(a)),n(a)&&(a=new Uint8Array(a)),!o(a))throw new TypeError("data isn't of expected type");var b=0,c=a.length||0,d=this.asm,e=this.heap,f=this.counter,g=this.tagSize,i=this.pos,j=this.len,k=0,l=j+c>g?j+c-g&-16:0,p=j+c-l,r=0;if((f-1<<4)+j+c>ja)throw new RangeError("counter overflow");for(var s=new Uint8Array(l);c>p;)r=q(e,i+j,a,b,c-p),j+=r,b+=r,c-=r,r=d.mac(da.MAC.GCM,da.HEAP_DATA+i,r),r=d.cipher(da.DEC.CTR,da.HEAP_DATA+i,r),r&&s.set(e.subarray(i,i+r),k),f+=r>>>4,k+=r,i=0,j=0;return c>0&&(j+=q(e,0,a,b,c)),this.result=s,this.counter=f,this.pos=i,this.len=j,this}function Q(){var a=this.asm,b=this.heap,c=this.tagSize,d=this.adata,f=this.counter,h=this.pos,i=this.len,j=i-c,k=0;if(i<c)throw new e("authentication tag not found");for(var l=new Uint8Array(j),m=new Uint8Array(b.subarray(h+j,h+i)),n=j;15&n;n++)b[h+n]=0;k=a.mac(da.MAC.GCM,da.HEAP_DATA+h,n),k=a.cipher(da.DEC.CTR,da.HEAP_DATA+h,n),j&&l.set(b.subarray(h,h+j));var o=null!==d?d.length:0,p=(f-1<<4)+i-c;b[0]=b[1]=b[2]=0,b[3]=o>>>29,b[4]=o>>>21,b[5]=o>>>13&255,b[6]=o>>>5&255,b[7]=o<<3&255,b[8]=b[9]=b[10]=0,b[11]=p>>>29,b[12]=p>>>21&255,b[13]=p>>>13&255,b[14]=p>>>5&255,b[15]=p<<3&255,a.mac(da.MAC.GCM,da.HEAP_DATA,16),a.get_iv(da.HEAP_DATA),a.set_counter(0,0,0,this.gamma0),a.cipher(da.ENC.CTR,da.HEAP_DATA,16);for(var q=0,n=0;n<c;++n)q|=m[n]^b[n];if(q)throw new g("data integrity check failed");return this.result=l,this.counter=1,this.pos=0,this.len=0,this}function R(a){var b=P.call(this,a).result,c=Q.call(this).result,d=new Uint8Array(b.length+c.length);return b.length&&d.set(b),c.length&&d.set(c,b.length),this.result=d,this}function S(a,b,c){if(void 0===a)throw new SyntaxError("data required");if(void 0===b)throw new SyntaxError("key required");return new A({heap:na,asm:oa,key:b,iv:c}).encrypt(a).result}function T(a,b,c){if(void 0===a)throw new SyntaxError("data required");if(void 0===b)throw new SyntaxError("key required");return new A({heap:na,asm:oa,key:b,iv:c}).decrypt(a).result}function U(a,b,c,d,e){if(void 0===a)throw new SyntaxError("data required");if(void 0===b)throw new SyntaxError("key required");if(void 0===c)throw new SyntaxError("nonce required");return new I({heap:na,asm:oa,key:b,nonce:c,adata:d,tagSize:e}).encrypt(a).result}function V(a,b,c,d,e){if(void 0===a)throw new SyntaxError("data required");if(void 0===b)throw new SyntaxError("key required");if(void 0===c)throw new SyntaxError("nonce required");return new I({heap:na,asm:oa,key:b,nonce:c,adata:d,tagSize:e}).decrypt(a).result}function W(){return this.result=null,this.pos=0,this.len=0,this.asm.reset(),this}function X(a){if(null!==this.result)throw new e("state must be reset before processing new data");if(m(a)&&(a=h(a)),n(a)&&(a=new Uint8Array(a)),!o(a))throw new TypeError("data isn't of expected type");for(var b=this.asm,c=this.heap,d=this.pos,f=this.len,g=0,i=a.length,j=0;i>0;)j=q(c,d+f,a,g,i),f+=j,g+=j,i-=j,j=b.process(d,f),d+=j,f-=j,f||(d=0);return this.pos=d,this.len=f,this}function Y(){if(null!==this.result)throw new e("state must be reset before processing new data");return this.asm.finish(this.pos,this.len,0),this.result=new Uint8Array(this.HASH_SIZE),this.result.set(this.heap.subarray(0,this.HASH_SIZE)),this.pos=0,this.len=0,this}function Z(a,b,c){"use asm";var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0;var n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0;var D=new a.Uint8Array(c);function E(a,b,c,l,m,n,o,p,q,r,s,t,u,v,w,x){a=a|0;b=b|0;c=c|0;l=l|0;m=m|0;n=n|0;o=o|0;p=p|0;q=q|0;r=r|0;s=s|0;t=t|0;u=u|0;v=v|0;w=w|0;x=x|0;var y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0;y=d;z=e;A=f;B=g;C=h;D=i;E=j;F=k;G=a+F+(C>>>6^C>>>11^C>>>25^C<<26^C<<21^C<<7)+(E^C&(D^E))+0x428a2f98|0;F=E;E=D;D=C;C=B+G|0;B=A;A=z;z=y;y=G+(z&A^B&(z^A))+(z>>>2^z>>>13^z>>>22^z<<30^z<<19^z<<10)|0;G=b+F+(C>>>6^C>>>11^C>>>25^C<<26^C<<21^C<<7)+(E^C&(D^E))+0x71374491|0;F=E;E=D;D=C;C=B+G|0;B=A;A=z;z=y;y=G+(z&A^B&(z^A))+(z>>>2^z>>>13^z>>>22^z<<30^z<<19^z<<10)|0;G=c+F+(C>>>6^C>>>11^C>>>25^C<<26^C<<21^C<<7)+(E^C&(D^E))+0xb5c0fbcf|0;F=E;E=D;D=C;C=B+G|0;B=A;A=z;z=y;y=G+(z&A^B&(z^A))+(z>>>2^z>>>13^z>>>22^z<<30^z<<19^z<<10)|0;G=l+F+(C>>>6^C>>>11^C>>>25^C<<26^C<<21^C<<7)+(E^C&(D^E))+0xe9b5dba5|0;F=E;E=D;D=C;C=B+G|0;B=A;A=z;z=y;y=G+(z&A^B&(z^A))+(z>>>2^z>>>13^z>>>22^z<<30^z<<19^z<<10)|0;G=m+F+(C>>>6^C>>>11^C>>>25^C<<26^C<<21^C<<7)+(E^C&(D^E))+0x3956c25b|0;F=E;E=D;D=C;C=B+G|0;B=A;A=z;z=y;y=G+(z&A^B&(z^A))+(z>>>2^z>>>13^z>>>22^z<<30^z<<19^z<<10)|0;G=n+F+(C>>>6^C>>>11^C>>>25^C<<26^C<<21^C<<7)+(E^C&(D^E))+0x59f111f1|0;F=E;E=D;D=C;C=B+G|0;B=A;A=z;z=y;y=G+(z&A^B&(z^A))+(z>>>2^z>>>13^z>>>22^z<<30^z<<19^z<<10)|0;G=o+F+(C>>>6^C>>>11^C>>>25^C<<26^C<<21^C<<7)+(E^C&(D^E))+0x923f82a4|0;F=E;E=D;D=C;C=B+G|0;B=A;A=z;z=y;y=G+(z&A^B&(z^A))+(z>>>2^z>>>13^z>>>22^z<<30^z<<19^z<<10)|0;G=p+F+(C>>>6^C>>>11^C>>>25^C<<26^C<<21^C<<7)+(E^C&(D^E))+0xab1c5ed5|0;F=E;E=D;D=C;C=B+G|0;B=A;A=z;z=y;y=G+(z&A^B&(z^A))+(z>>>2^z>>>13^z>>>22^z<<30^z<<19^z<<10)|0;G=q+F+(C>>>6^C>>>11^C>>>25^C<<26^C<<21^C<<7)+(E^C&(D^E))+0xd807aa98|0;F=E;E=D;D=C;C=B+G|0;B=A;A=z;z=y;y=G+(z&A^B&(z^A))+(z>>>2^z>>>13^z>>>22^z<<30^z<<19^z<<10)|0;G=r+F+(C>>>6^C>>>11^C>>>25^C<<26^C<<21^C<<7)+(E^C&(D^E))+0x12835b01|0;F=E;E=D;D=C;C=B+G|0;B=A;A=z;z=y;y=G+(z&A^B&(z^A))+(z>>>2^z>>>13^z>>>22^z<<30^z<<19^z<<10)|0;G=s+F+(C>>>6^C>>>11^C>>>25^C<<26^C<<21^C<<7)+(E^C&(D^E))+0x243185be|0;F=E;E=D;D=C;C=B+G|0;B=A;A=z;z=y;y=G+(z&A^B&(z^A))+(z>>>2^z>>>13^z>>>22^z<<30^z<<19^z<<10)|0;G=t+F+(C>>>6^C>>>11^C>>>25^C<<26^C<<21^C<<7)+(E^C&(D^E))+0x550c7dc3|0;F=E;E=D;D=C;C=B+G|0;B=A;A=z;z=y;y=G+(z&A^B&(z^A))+(z>>>2^z>>>13^z>>>22^z<<30^z<<19^z<<10)|0;G=u+F+(C>>>6^C>>>11^C>>>25^C<<26^C<<21^C<<7)+(E^C&(D^E))+0x72be5d74|0;F=E;E=D;D=C;C=B+G|0;B=A;A=z;z=y;y=G+(z&A^B&(z^A))+(z>>>2^z>>>13^z>>>22^z<<30^z<<19^z<<10)|0;G=v+F+(C>>>6^C>>>11^C>>>25^C<<26^C<<21^C<<7)+(E^C&(D^E))+0x80deb1fe|0;F=E;E=D;D=C;C=B+G|0;B=A;A=z;z=y;y=G+(z&A^B&(z^A))+(z>>>2^z>>>13^z>>>22^z<<30^z<<19^z<<10)|0;G=w+F+(C>>>6^C>>>11^C>>>25^C<<26^C<<21^C<<7)+(E^C&(D^E))+0x9bdc06a7|0;F=E;E=D;D=C;C=B+G|0;B=A;A=z;z=y;y=G+(z&A^B&(z^A))+(z>>>2^z>>>13^z>>>22^z<<30^z<<19^z<<10)|0;G=x+F+(C>>>6^C>>>11^C>>>25^C<<26^C<<21^C<<7)+(E^C&(D^E))+0xc19bf174|0;F=E;E=D;D=C;C=B+G|0;B=A;A=z;z=y;y=G+(z&A^B&(z^A))+(z>>>2^z>>>13^z>>>22^z<<30^z<<19^z<<10)|0;a=G=(b>>>7^b>>>18^b>>>3^b<<25^b<<14)+(w>>>17^w>>>19^w>>>10^w<<15^w<<13)+a+r|0;G=G+F+(C>>>6^C>>>11^C>>>25^C<<26^C<<21^C<<7)+(E^C&(D^E))+0xe49b69c1|0;F=E;E=D;D=C;C=B+G|0;B=A;A=z;z=y;y=G+(z&A^B&(z^A))+(z>>>2^z>>>13^z>>>22^z<<30^z<<19^z<<10)|0;b=G=(c>>>7^c>>>18^c>>>3^c<<25^c<<14)+(x>>>17^x>>>19^x>>>10^x<<15^x<<13)+b+s|0;G=G+F+(C>>>6^C>>>11^C>>>25^C<<26^C<<21^C<<7)+(E^C&(D^E))+0xefbe4786|0;F=E;E=D;D=C;C=B+G|0;B=A;A=z;z=y;y=G+(z&A^B&(z^A))+(z>>>2^z>>>13^z>>>22^z<<30^z<<19^z<<10)|0;c=G=(l>>>7^l>>>18^l>>>3^l<<25^l<<14)+(a>>>17^a>>>19^a>>>10^a<<15^a<<13)+c+t|0;G=G+F+(C>>>6^C>>>11^C>>>25^C<<26^C<<21^C<<7)+(E^C&(D^E))+0x0fc19dc6|0;F=E;E=D;D=C;C=B+G|0;B=A;A=z;z=y;y=G+(z&A^B&(z^A))+(z>>>2^z>>>13^z>>>22^z<<30^z<<19^z<<10)|0;l=G=(m>>>7^m>>>18^m>>>3^m<<25^m<<14)+(b>>>17^b>>>19^b>>>10^b<<15^b<<13)+l+u|0;G=G+F+(C>>>6^C>>>11^C>>>25^C<<26^C<<21^C<<7)+(E^C&(D^E))+0x240ca1cc|0;F=E;E=D;D=C;C=B+G|0;B=A;A=z;z=y;y=G+(z&A^B&(z^A))+(z>>>2^z>>>13^z>>>22^z<<30^z<<19^z<<10)|0;m=G=(n>>>7^n>>>18^n>>>3^n<<25^n<<14)+(c>>>17^c>>>19^c>>>10^c<<15^c<<13)+m+v|0;G=G+F+(C>>>6^C>>>11^C>>>25^C<<26^C<<21^C<<7)+(E^C&(D^E))+0x2de92c6f|0;F=E;E=D;D=C;C=B+G|0;B=A;A=z;z=y;y=G+(z&A^B&(z^A))+(z>>>2^z>>>13^z>>>22^z<<30^z<<19^z<<10)|0;n=G=(o>>>7^o>>>18^o>>>3^o<<25^o<<14)+(l>>>17^l>>>19^l>>>10^l<<15^l<<13)+n+w|0;G=G+F+(C>>>6^C>>>11^C>>>25^C<<26^C<<21^C<<7)+(E^C&(D^E))+0x4a7484aa|0;F=E;E=D;D=C;C=B+G|0;B=A;A=z;z=y;y=G+(z&A^B&(z^A))+(z>>>2^z>>>13^z>>>22^z<<30^z<<19^z<<10)|0;o=G=(p>>>7^p>>>18^p>>>3^p<<25^p<<14)+(m>>>17^m>>>19^m>>>10^m<<15^m<<13)+o+x|0;G=G+F+(C>>>6^C>>>11^C>>>25^C<<26^C<<21^C<<7)+(E^C&(D^E))+0x5cb0a9dc|0;F=E;E=D;D=C;C=B+G|0;B=A;A=z;z=y;y=G+(z&A^B&(z^A))+(z>>>2^z>>>13^z>>>22^z<<30^z<<19^z<<10)|0;p=G=(q>>>7^q>>>18^q>>>3^q<<25^q<<14)+(n>>>17^n>>>19^n>>>10^n<<15^n<<13)+p+a|0;G=G+F+(C>>>6^C>>>11^C>>>25^C<<26^C<<21^C<<7)+(E^C&(D^E))+0x76f988da|0;F=E;E=D;D=C;C=B+G|0;B=A;A=z;z=y;y=G+(z&A^B&(z^A))+(z>>>2^z>>>13^z>>>22^z<<30^z<<19^z<<10)|0;q=G=(r>>>7^r>>>18^r>>>3^r<<25^r<<14)+(o>>>17^o>>>19^o>>>10^o<<15^o<<13)+q+b|0;G=G+F+(C>>>6^C>>>11^C>>>25^C<<26^C<<21^C<<7)+(E^C&(D^E))+0x983e5152|0;F=E;E=D;D=C;C=B+G|0;B=A;A=z;z=y;y=G+(z&A^B&(z^A))+(z>>>2^z>>>13^z>>>22^z<<30^z<<19^z<<10)|0;r=G=(s>>>7^s>>>18^s>>>3^s<<25^s<<14)+(p>>>17^p>>>19^p>>>10^p<<15^p<<13)+r+c|0;G=G+F+(C>>>6^C>>>11^C>>>25^C<<26^C<<21^C<<7)+(E^C&(D^E))+0xa831c66d|0;F=E;E=D;D=C;C=B+G|0;B=A;A=z;z=y;y=G+(z&A^B&(z^A))+(z>>>2^z>>>13^z>>>22^z<<30^z<<19^z<<10)|0;s=G=(t>>>7^t>>>18^t>>>3^t<<25^t<<14)+(q>>>17^q>>>19^q>>>10^q<<15^q<<13)+s+l|0;G=G+F+(C>>>6^C>>>11^C>>>25^C<<26^C<<21^C<<7)+(E^C&(D^E))+0xb00327c8|0;F=E;E=D;D=C;C=B+G|0;B=A;A=z;z=y;y=G+(z&A^B&(z^A))+(z>>>2^z>>>13^z>>>22^z<<30^z<<19^z<<10)|0;t=G=(u>>>7^u>>>18^u>>>3^u<<25^u<<14)+(r>>>17^r>>>19^r>>>10^r<<15^r<<13)+t+m|0;G=G+F+(C>>>6^C>>>11^C>>>25^C<<26^C<<21^C<<7)+(E^C&(D^E))+0xbf597fc7|0;F=E;E=D;D=C;C=B+G|0;B=A;A=z;z=y;y=G+(z&A^B&(z^A))+(z>>>2^z>>>13^z>>>22^z<<30^z<<19^z<<10)|0;u=G=(v>>>7^v>>>18^v>>>3^v<<25^v<<14)+(s>>>17^s>>>19^s>>>10^s<<15^s<<13)+u+n|0;G=G+F+(C>>>6^C>>>11^C>>>25^C<<26^C<<21^C<<7)+(E^C&(D^E))+0xc6e00bf3|0;F=E;E=D;D=C;C=B+G|0;B=A;A=z;z=y;y=G+(z&A^B&(z^A))+(z>>>2^z>>>13^z>>>22^z<<30^z<<19^z<<10)|0;v=G=(w>>>7^w>>>18^w>>>3^w<<25^w<<14)+(t>>>17^t>>>19^t>>>10^t<<15^t<<13)+v+o|0;G=G+F+(C>>>6^C>>>11^C>>>25^C<<26^C<<21^C<<7)+(E^C&(D^E))+0xd5a79147|0;F=E;E=D;D=C;C=B+G|0;B=A;A=z;z=y;y=G+(z&A^B&(z^A))+(z>>>2^z>>>13^z>>>22^z<<30^z<<19^z<<10)|0;w=G=(x>>>7^x>>>18^x>>>3^x<<25^x<<14)+(u>>>17^u>>>19^u>>>10^u<<15^u<<13)+w+p|0;G=G+F+(C>>>6^C>>>11^C>>>25^C<<26^C<<21^C<<7)+(E^C&(D^E))+0x06ca6351|0;F=E;E=D;D=C;C=B+G|0;B=A;A=z;z=y;y=G+(z&A^B&(z^A))+(z>>>2^z>>>13^z>>>22^z<<30^z<<19^z<<10)|0;x=G=(a>>>7^a>>>18^a>>>3^a<<25^a<<14)+(v>>>17^v>>>19^v>>>10^v<<15^v<<13)+x+q|0;G=G+F+(C>>>6^C>>>11^C>>>25^C<<26^C<<21^C<<7)+(E^C&(D^E))+0x14292967|0;F=E;E=D;D=C;C=B+G|0;B=A;A=z;z=y;y=G+(z&A^B&(z^A))+(z>>>2^z>>>13^z>>>22^z<<30^z<<19^z<<10)|0;a=G=(b>>>7^b>>>18^b>>>3^b<<25^b<<14)+(w>>>17^w>>>19^w>>>10^w<<15^w<<13)+a+r|0;G=G+F+(C>>>6^C>>>11^C>>>25^C<<26^C<<21^C<<7)+(E^C&(D^E))+0x27b70a85|0;F=E;E=D;D=C;C=B+G|0;B=A;A=z;z=y;y=G+(z&A^B&(z^A))+(z>>>2^z>>>13^z>>>22^z<<30^z<<19^z<<10)|0;b=G=(c>>>7^c>>>18^c>>>3^c<<25^c<<14)+(x>>>17^x>>>19^x>>>10^x<<15^x<<13)+b+s|0;G=G+F+(C>>>6^C>>>11^C>>>25^C<<26^C<<21^C<<7)+(E^C&(D^E))+0x2e1b2138|0;F=E;E=D;D=C;C=B+G|0;B=A;A=z;z=y;y=G+(z&A^B&(z^A))+(z>>>2^z>>>13^z>>>22^z<<30^z<<19^z<<10)|0;c=G=(l>>>7^l>>>18^l>>>3^l<<25^l<<14)+(a>>>17^a>>>19^a>>>10^a<<15^a<<13)+c+t|0;G=G+F+(C>>>6^C>>>11^C>>>25^C<<26^C<<21^C<<7)+(E^C&(D^E))+0x4d2c6dfc|0;F=E;E=D;D=C;C=B+G|0;B=A;A=z;z=y;y=G+(z&A^B&(z^A))+(z>>>2^z>>>13^z>>>22^z<<30^z<<19^z<<10)|0;l=G=(m>>>7^m>>>18^m>>>3^m<<25^m<<14)+(b>>>17^b>>>19^b>>>10^b<<15^b<<13)+l+u|0;G=G+F+(C>>>6^C>>>11^C>>>25^C<<26^C<<21^C<<7)+(E^C&(D^E))+0x53380d13|0;F=E;E=D;D=C;C=B+G|0;B=A;A=z;z=y;y=G+(z&A^B&(z^A))+(z>>>2^z>>>13^z>>>22^z<<30^z<<19^z<<10)|0;m=G=(n>>>7^n>>>18^n>>>3^n<<25^n<<14)+(c>>>17^c>>>19^c>>>10^c<<15^c<<13)+m+v|0;G=G+F+(C>>>6^C>>>11^C>>>25^C<<26^C<<21^C<<7)+(E^C&(D^E))+0x650a7354|0;F=E;E=D;D=C;C=B+G|0;B=A;A=z;z=y;y=G+(z&A^B&(z^A))+(z>>>2^z>>>13^z>>>22^z<<30^z<<19^z<<10)|0;n=G=(o>>>7^o>>>18^o>>>3^o<<25^o<<14)+(l>>>17^l>>>19^l>>>10^l<<15^l<<13)+n+w|0;G=G+F+(C>>>6^C>>>11^C>>>25^C<<26^C<<21^C<<7)+(E^C&(D^E))+0x766a0abb|0;F=E;E=D;D=C;C=B+G|0;B=A;A=z;z=y;y=G+(z&A^B&(z^A))+(z>>>2^z>>>13^z>>>22^z<<30^z<<19^z<<10)|0;o=G=(p>>>7^p>>>18^p>>>3^p<<25^p<<14)+(m>>>17^m>>>19^m>>>10^m<<15^m<<13)+o+x|0;G=G+F+(C>>>6^C>>>11^C>>>25^C<<26^C<<21^C<<7)+(E^C&(D^E))+0x81c2c92e|0;F=E;E=D;D=C;C=B+G|0;B=A;A=z;z=y;y=G+(z&A^B&(z^A))+(z>>>2^z>>>13^z>>>22^z<<30^z<<19^z<<10)|0;p=G=(q>>>7^q>>>18^q>>>3^q<<25^q<<14)+(n>>>17^n>>>19^n>>>10^n<<15^n<<13)+p+a|0;G=G+F+(C>>>6^C>>>11^C>>>25^C<<26^C<<21^C<<7)+(E^C&(D^E))+0x92722c85|0;F=E;E=D;D=C;C=B+G|0;B=A;A=z;z=y;y=G+(z&A^B&(z^A))+(z>>>2^z>>>13^z>>>22^z<<30^z<<19^z<<10)|0;q=G=(r>>>7^r>>>18^r>>>3^r<<25^r<<14)+(o>>>17^o>>>19^o>>>10^o<<15^o<<13)+q+b|0;G=G+F+(C>>>6^C>>>11^C>>>25^C<<26^C<<21^C<<7)+(E^C&(D^E))+0xa2bfe8a1|0;F=E;E=D;D=C;C=B+G|0;B=A;A=z;z=y;y=G+(z&A^B&(z^A))+(z>>>2^z>>>13^z>>>22^z<<30^z<<19^z<<10)|0;r=G=(s>>>7^s>>>18^s>>>3^s<<25^s<<14)+(p>>>17^p>>>19^p>>>10^p<<15^p<<13)+r+c|0;G=G+F+(C>>>6^C>>>11^C>>>25^C<<26^C<<21^C<<7)+(E^C&(D^E))+0xa81a664b|0;F=E;E=D;D=C;C=B+G|0;B=A;A=z;z=y;y=G+(z&A^B&(z^A))+(z>>>2^z>>>13^z>>>22^z<<30^z<<19^z<<10)|0;s=G=(t>>>7^t>>>18^t>>>3^t<<25^t<<14)+(q>>>17^q>>>19^q>>>10^q<<15^q<<13)+s+l|0;G=G+F+(C>>>6^C>>>11^C>>>25^C<<26^C<<21^C<<7)+(E^C&(D^E))+0xc24b8b70|0;F=E;E=D;D=C;C=B+G|0;B=A;A=z;z=y;y=G+(z&A^B&(z^A))+(z>>>2^z>>>13^z>>>22^z<<30^z<<19^z<<10)|0;t=G=(u>>>7^u>>>18^u>>>3^u<<25^u<<14)+(r>>>17^r>>>19^r>>>10^r<<15^r<<13)+t+m|0;G=G+F+(C>>>6^C>>>11^C>>>25^C<<26^C<<21^C<<7)+(E^C&(D^E))+0xc76c51a3|0;F=E;E=D;D=C;C=B+G|0;B=A;A=z;z=y;y=G+(z&A^B&(z^A))+(z>>>2^z>>>13^z>>>22^z<<30^z<<19^z<<10)|0;u=G=(v>>>7^v>>>18^v>>>3^v<<25^v<<14)+(s>>>17^s>>>19^s>>>10^s<<15^s<<13)+u+n|0;G=G+F+(C>>>6^C>>>11^C>>>25^C<<26^C<<21^C<<7)+(E^C&(D^E))+0xd192e819|0;F=E;E=D;D=C;C=B+G|0;B=A;A=z;z=y;y=G+(z&A^B&(z^A))+(z>>>2^z>>>13^z>>>22^z<<30^z<<19^z<<10)|0;v=G=(w>>>7^w>>>18^w>>>3^w<<25^w<<14)+(t>>>17^t>>>19^t>>>10^t<<15^t<<13)+v+o|0;G=G+F+(C>>>6^C>>>11^C>>>25^C<<26^C<<21^C<<7)+(E^C&(D^E))+0xd6990624|0;F=E;E=D;D=C;C=B+G|0;B=A;A=z;z=y;y=G+(z&A^B&(z^A))+(z>>>2^z>>>13^z>>>22^z<<30^z<<19^z<<10)|0;w=G=(x>>>7^x>>>18^x>>>3^x<<25^x<<14)+(u>>>17^u>>>19^u>>>10^u<<15^u<<13)+w+p|0;G=G+F+(C>>>6^C>>>11^C>>>25^C<<26^C<<21^C<<7)+(E^C&(D^E))+0xf40e3585|0;F=E;E=D;D=C;C=B+G|0;B=A;A=z;z=y;y=G+(z&A^B&(z^A))+(z>>>2^z>>>13^z>>>22^z<<30^z<<19^z<<10)|0;x=G=(a>>>7^a>>>18^a>>>3^a<<25^a<<14)+(v>>>17^v>>>19^v>>>10^v<<15^v<<13)+x+q|0;G=G+F+(C>>>6^C>>>11^C>>>25^C<<26^C<<21^C<<7)+(E^C&(D^E))+0x106aa070|0;F=E;E=D;D=C;C=B+G|0;B=A;A=z;z=y;y=G+(z&A^B&(z^A))+(z>>>2^z>>>13^z>>>22^z<<30^z<<19^z<<10)|0;a=G=(b>>>7^b>>>18^b>>>3^b<<25^b<<14)+(w>>>17^w>>>19^w>>>10^w<<15^w<<13)+a+r|0;G=G+F+(C>>>6^C>>>11^C>>>25^C<<26^C<<21^C<<7)+(E^C&(D^E))+0x19a4c116|0;F=E;E=D;D=C;C=B+G|0;B=A;A=z;z=y;y=G+(z&A^B&(z^A))+(z>>>2^z>>>13^z>>>22^z<<30^z<<19^z<<10)|0;b=G=(c>>>7^c>>>18^c>>>3^c<<25^c<<14)+(x>>>17^x>>>19^x>>>10^x<<15^x<<13)+b+s|0;G=G+F+(C>>>6^C>>>11^C>>>25^C<<26^C<<21^C<<7)+(E^C&(D^E))+0x1e376c08|0;F=E;E=D;D=C;C=B+G|0;B=A;A=z;z=y;y=G+(z&A^B&(z^A))+(z>>>2^z>>>13^z>>>22^z<<30^z<<19^z<<10)|0;c=G=(l>>>7^l>>>18^l>>>3^l<<25^l<<14)+(a>>>17^a>>>19^a>>>10^a<<15^a<<13)+c+t|0;G=G+F+(C>>>6^C>>>11^C>>>25^C<<26^C<<21^C<<7)+(E^C&(D^E))+0x2748774c|0;F=E;E=D;D=C;C=B+G|0;B=A;A=z;z=y;y=G+(z&A^B&(z^A))+(z>>>2^z>>>13^z>>>22^z<<30^z<<19^z<<10)|0;l=G=(m>>>7^m>>>18^m>>>3^m<<25^m<<14)+(b>>>17^b>>>19^b>>>10^b<<15^b<<13)+l+u|0;G=G+F+(C>>>6^C>>>11^C>>>25^C<<26^C<<21^C<<7)+(E^C&(D^E))+0x34b0bcb5|0;F=E;E=D;D=C;C=B+G|0;B=A;A=z;z=y;y=G+(z&A^B&(z^A))+(z>>>2^z>>>13^z>>>22^z<<30^z<<19^z<<10)|0;m=G=(n>>>7^n>>>18^n>>>3^n<<25^n<<14)+(c>>>17^c>>>19^c>>>10^c<<15^c<<13)+m+v|0;G=G+F+(C>>>6^C>>>11^C>>>25^C<<26^C<<21^C<<7)+(E^C&(D^E))+0x391c0cb3|0;F=E;E=D;D=C;C=B+G|0;B=A;A=z;z=y;y=G+(z&A^B&(z^A))+(z>>>2^z>>>13^z>>>22^z<<30^z<<19^z<<10)|0;n=G=(o>>>7^o>>>18^o>>>3^o<<25^o<<14)+(l>>>17^l>>>19^l>>>10^l<<15^l<<13)+n+w|0;G=G+F+(C>>>6^C>>>11^C>>>25^C<<26^C<<21^C<<7)+(E^C&(D^E))+0x4ed8aa4a|0;F=E;E=D;D=C;C=B+G|0;B=A;A=z;z=y;y=G+(z&A^B&(z^A))+(z>>>2^z>>>13^z>>>22^z<<30^z<<19^z<<10)|0;o=G=(p>>>7^p>>>18^p>>>3^p<<25^p<<14)+(m>>>17^m>>>19^m>>>10^m<<15^m<<13)+o+x|0;G=G+F+(C>>>6^C>>>11^C>>>25^C<<26^C<<21^C<<7)+(E^C&(D^E))+0x5b9cca4f|0;F=E;E=D;D=C;C=B+G|0;B=A;A=z;z=y;y=G+(z&A^B&(z^A))+(z>>>2^z>>>13^z>>>22^z<<30^z<<19^z<<10)|0;p=G=(q>>>7^q>>>18^q>>>3^q<<25^q<<14)+(n>>>17^n>>>19^n>>>10^n<<15^n<<13)+p+a|0;G=G+F+(C>>>6^C>>>11^C>>>25^C<<26^C<<21^C<<7)+(E^C&(D^E))+0x682e6ff3|0;F=E;E=D;D=C;C=B+G|0;B=A;A=z;z=y;y=G+(z&A^B&(z^A))+(z>>>2^z>>>13^z>>>22^z<<30^z<<19^z<<10)|0;q=G=(r>>>7^r>>>18^r>>>3^r<<25^r<<14)+(o>>>17^o>>>19^o>>>10^o<<15^o<<13)+q+b|0;G=G+F+(C>>>6^C>>>11^C>>>25^C<<26^C<<21^C<<7)+(E^C&(D^E))+0x748f82ee|0;F=E;E=D;D=C;C=B+G|0;B=A;A=z;z=y;y=G+(z&A^B&(z^A))+(z>>>2^z>>>13^z>>>22^z<<30^z<<19^z<<10)|0;r=G=(s>>>7^s>>>18^s>>>3^s<<25^s<<14)+(p>>>17^p>>>19^p>>>10^p<<15^p<<13)+r+c|0;G=G+F+(C>>>6^C>>>11^C>>>25^C<<26^C<<21^C<<7)+(E^C&(D^E))+0x78a5636f|0;F=E;E=D;D=C;C=B+G|0;B=A;A=z;z=y;y=G+(z&A^B&(z^A))+(z>>>2^z>>>13^z>>>22^z<<30^z<<19^z<<10)|0;s=G=(t>>>7^t>>>18^t>>>3^t<<25^t<<14)+(q>>>17^q>>>19^q>>>10^q<<15^q<<13)+s+l|0;G=G+F+(C>>>6^C>>>11^C>>>25^C<<26^C<<21^C<<7)+(E^C&(D^E))+0x84c87814|0;F=E;E=D;D=C;C=B+G|0;B=A;A=z;z=y;y=G+(z&A^B&(z^A))+(z>>>2^z>>>13^z>>>22^z<<30^z<<19^z<<10)|0;t=G=(u>>>7^u>>>18^u>>>3^u<<25^u<<14)+(r>>>17^r>>>19^r>>>10^r<<15^r<<13)+t+m|0;G=G+F+(C>>>6^C>>>11^C>>>25^C<<26^C<<21^C<<7)+(E^C&(D^E))+0x8cc70208|0;F=E;E=D;D=C;C=B+G|0;B=A;A=z;z=y;y=G+(z&A^B&(z^A))+(z>>>2^z>>>13^z>>>22^z<<30^z<<19^z<<10)|0;u=G=(v>>>7^v>>>18^v>>>3^v<<25^v<<14)+(s>>>17^s>>>19^s>>>10^s<<15^s<<13)+u+n|0;G=G+F+(C>>>6^C>>>11^C>>>25^C<<26^C<<21^C<<7)+(E^C&(D^E))+0x90befffa|0;F=E;E=D;D=C;C=B+G|0;B=A;A=z;z=y;y=G+(z&A^B&(z^A))+(z>>>2^z>>>13^z>>>22^z<<30^z<<19^z<<10)|0;v=G=(w>>>7^w>>>18^w>>>3^w<<25^w<<14)+(t>>>17^t>>>19^t>>>10^t<<15^t<<13)+v+o|0;G=G+F+(C>>>6^C>>>11^C>>>25^C<<26^C<<21^C<<7)+(E^C&(D^E))+0xa4506ceb|0;F=E;E=D;D=C;C=B+G|0;B=A;A=z;z=y;y=G+(z&A^B&(z^A))+(z>>>2^z>>>13^z>>>22^z<<30^z<<19^z<<10)|0;w=G=(x>>>7^x>>>18^x>>>3^x<<25^x<<14)+(u>>>17^u>>>19^u>>>10^u<<15^u<<13)+w+p|0;G=G+F+(C>>>6^C>>>11^C>>>25^C<<26^C<<21^C<<7)+(E^C&(D^E))+0xbef9a3f7|0;F=E;E=D;D=C;C=B+G|0;B=A;A=z;z=y;y=G+(z&A^B&(z^A))+(z>>>2^z>>>13^z>>>22^z<<30^z<<19^z<<10)|0;x=G=(a>>>7^a>>>18^a>>>3^a<<25^a<<14)+(v>>>17^v>>>19^v>>>10^v<<15^v<<13)+x+q|0;G=G+F+(C>>>6^C>>>11^C>>>25^C<<26^C<<21^C<<7)+(E^C&(D^E))+0xc67178f2|0;F=E;E=D;D=C;C=B+G|0;B=A;A=z;z=y;y=G+(z&A^B&(z^A))+(z>>>2^z>>>13^z>>>22^z<<30^z<<19^z<<10)|0;d=d+y|0;e=e+z|0;f=f+A|0;g=g+B|0;h=h+C|0;i=i+D|0;j=j+E|0;k=k+F|0}function F(a){a=a|0;E(D[a|0]<<24|D[a|1]<<16|D[a|2]<<8|D[a|3],D[a|4]<<24|D[a|5]<<16|D[a|6]<<8|D[a|7],D[a|8]<<24|D[a|9]<<16|D[a|10]<<8|D[a|11],D[a|12]<<24|D[a|13]<<16|D[a|14]<<8|D[a|15],D[a|16]<<24|D[a|17]<<16|D[a|18]<<8|D[a|19],D[a|20]<<24|D[a|21]<<16|D[a|22]<<8|D[a|23],D[a|24]<<24|D[a|25]<<16|D[a|26]<<8|D[a|27],D[a|28]<<24|D[a|29]<<16|D[a|30]<<8|D[a|31],D[a|32]<<24|D[a|33]<<16|D[a|34]<<8|D[a|35],D[a|36]<<24|D[a|37]<<16|D[a|38]<<8|D[a|39],D[a|40]<<24|D[a|41]<<16|D[a|42]<<8|D[a|43],D[a|44]<<24|D[a|45]<<16|D[a|46]<<8|D[a|47],D[a|48]<<24|D[a|49]<<16|D[a|50]<<8|D[a|51],D[a|52]<<24|D[a|53]<<16|D[a|54]<<8|D[a|55],D[a|56]<<24|D[a|57]<<16|D[a|58]<<8|D[a|59],D[a|60]<<24|D[a|61]<<16|D[a|62]<<8|D[a|63])}function G(a){a=a|0;D[a|0]=d>>>24;D[a|1]=d>>>16&255;D[a|2]=d>>>8&255;D[a|3]=d&255;D[a|4]=e>>>24;D[a|5]=e>>>16&255;D[a|6]=e>>>8&255;D[a|7]=e&255;D[a|8]=f>>>24;D[a|9]=f>>>16&255;D[a|10]=f>>>8&255;D[a|11]=f&255;D[a|12]=g>>>24;D[a|13]=g>>>16&255;D[a|14]=g>>>8&255;D[a|15]=g&255;D[a|16]=h>>>24;D[a|17]=h>>>16&255;D[a|18]=h>>>8&255;D[a|19]=h&255;D[a|20]=i>>>24;D[a|21]=i>>>16&255;D[a|22]=i>>>8&255;D[a|23]=i&255;D[a|24]=j>>>24;D[a|25]=j>>>16&255;D[a|26]=j>>>8&255;D[a|27]=j&255;D[a|28]=k>>>24;D[a|29]=k>>>16&255;D[a|30]=k>>>8&255;D[a|31]=k&255}function H(){d=0x6a09e667;e=0xbb67ae85;f=0x3c6ef372;g=0xa54ff53a;h=0x510e527f;i=0x9b05688c;j=0x1f83d9ab;k=0x5be0cd19;l=m=0}function I(a,b,c,n,o,p,q,r,s,t){a=a|0;b=b|0;c=c|0;n=n|0;o=o|0;p=p|0;q=q|0;r=r|0;s=s|0;t=t|0;d=a;e=b;f=c;g=n;h=o;i=p;j=q;k=r;l=s;m=t}function J(a,b){a=a|0;b=b|0;var c=0;if(a&63)return-1;while((b|0)>=64){F(a);a=a+64|0;b=b-64|0;c=c+64|0}l=l+c|0;if(l>>>0<c>>>0)m=m+1|0;return c|0}function K(a,b,c){a=a|0;b=b|0;c=c|0;var d=0,e=0;if(a&63)return-1;if(~c)if(c&31)return-1;if((b|0)>=64){d=J(a,b)|0;if((d|0)==-1)return-1;a=a+d|0;b=b-d|0}d=d+b|0;l=l+b|0;if(l>>>0<b>>>0)m=m+1|0;D[a|b]=0x80;if((b|0)>=56){for(e=b+1|0;(e|0)<64;e=e+1|0)D[a|e]=0x00;F(a);b=0;D[a|0]=0}for(e=b+1|0;(e|0)<59;e=e+1|0)D[a|e]=0;D[a|56]=m>>>21&255;D[a|57]=m>>>13&255;D[a|58]=m>>>5&255;D[a|59]=m<<3&255|l>>>29;D[a|60]=l>>>21&255;D[a|61]=l>>>13&255;D[a|62]=l>>>5&255;D[a|63]=l<<3&255;F(a);if(~c)G(c);return d|0}function L(){d=n;e=o;f=p;g=q;h=r;i=s;j=t;k=u;l=64;m=0}function M(){d=v;e=w;f=x;g=y;h=z;i=A;j=B;k=C;l=64;m=0}function N(a,b,c,D,F,G,I,J,K,L,M,N,O,P,Q,R){a=a|0;b=b|0;c=c|0;D=D|0;F=F|0;G=G|0;I=I|0;J=J|0;K=K|0;L=L|0;M=M|0;N=N|0;O=O|0;P=P|0;Q=Q|0;R=R|0;H();E(a^0x5c5c5c5c,b^0x5c5c5c5c,c^0x5c5c5c5c,D^0x5c5c5c5c,F^0x5c5c5c5c,G^0x5c5c5c5c,I^0x5c5c5c5c,J^0x5c5c5c5c,K^0x5c5c5c5c,L^0x5c5c5c5c,M^0x5c5c5c5c,N^0x5c5c5c5c,O^0x5c5c5c5c,P^0x5c5c5c5c,Q^0x5c5c5c5c,R^0x5c5c5c5c);v=d;w=e;x=f;y=g;z=h;A=i;B=j;C=k;H();E(a^0x36363636,b^0x36363636,c^0x36363636,D^0x36363636,F^0x36363636,G^0x36363636,I^0x36363636,J^0x36363636,K^0x36363636,L^0x36363636,M^0x36363636,N^0x36363636,O^0x36363636,P^0x36363636,Q^0x36363636,R^0x36363636);n=d;o=e;p=f;q=g;r=h;s=i;t=j;u=k;l=64;m=0}function O(a,b,c){a=a|0;b=b|0;c=c|0;var l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0;if(a&63)return-1;if(~c)if(c&31)return-1;t=K(a,b,-1)|0;l=d,m=e,n=f,o=g,p=h,q=i,r=j,s=k;M();E(l,m,n,o,p,q,r,s,0x80000000,0,0,0,0,0,0,768);if(~c)G(c);return t|0}function P(a,b,c,l,m){a=a|0;b=b|0;c=c|0;l=l|0;m=m|0;var n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0;if(a&63)return-1;if(~m)if(m&31)return-1;D[a+b|0]=c>>>24;D[a+b+1|0]=c>>>16&255;D[a+b+2|0]=c>>>8&255;D[a+b+3|0]=c&255;O(a,b+4|0,-1)|0;n=v=d,o=w=e,p=x=f,q=y=g,r=z=h,s=A=i,t=B=j,u=C=k;l=l-1|0;while((l|0)>0){L();E(v,w,x,y,z,A,B,C,0x80000000,0,0,0,0,0,0,768);v=d,w=e,x=f,y=g,z=h,A=i,B=j,C=k;M();E(v,w,x,y,z,A,B,C,0x80000000,0,0,0,0,0,0,768);v=d,w=e,x=f,y=g,z=h,A=i,B=j,C=k;n=n^d;o=o^e;p=p^f;q=q^g;r=r^h;s=s^i;t=t^j;u=u^k;l=l-1|0}d=n;e=o;f=p;g=q;h=r;i=s;j=t;
k=u;if(~m)G(m);return 0}return{reset:H,init:I,process:J,finish:K,hmac_reset:L,hmac_init:N,hmac_finish:O,pbkdf2_generate_block:P}}function $(a){a=a||{},this.heap=p(Uint8Array,a),this.asm=a.asm||Z(d,null,this.heap.buffer),this.BLOCK_SIZE=pa,this.HASH_SIZE=qa,this.reset()}function _(){return null===sa&&(sa=new $({heapSize:1048576})),sa}function aa(a){if(void 0===a)throw new SyntaxError("data required");return _().reset().process(a).finish().result}function ba(a){var b=aa(a);return j(b)}function ca(a){var b=aa(a);return k(b)}e.prototype=Object.create(Error.prototype,{name:{value:"IllegalStateError"}}),f.prototype=Object.create(Error.prototype,{name:{value:"IllegalArgumentError"}}),g.prototype=Object.create(Error.prototype,{name:{value:"SecurityError"}});d.Float64Array||d.Float32Array;d.IllegalStateError=e,d.IllegalArgumentError=f,d.SecurityError=g;var da=function(){"use strict";function a(){e=[],f=[];var a,b,c=1;for(a=0;a<255;a++)e[a]=c,b=128&c,c<<=1,c&=255,128===b&&(c^=27),c^=e[a],f[e[a]]=a;e[255]=e[0],f[0]=0,k=!0}function b(a,b){var c=e[(f[a]+f[b])%255];return 0!==a&&0!==b||(c=0),c}function c(a){var b=e[255-f[a]];return 0===a&&(b=0),b}function d(){function d(a){var b,d,e;for(d=e=c(a),b=0;b<4;b++)d=255&(d<<1|d>>>7),e^=d;return e^=99}k||a(),g=[],h=[],i=[[],[],[],[]],j=[[],[],[],[]];for(var e=0;e<256;e++){var f=d(e);g[e]=f,h[f]=e,i[0][e]=b(2,f)<<24|f<<16|f<<8|b(3,f),j[0][f]=b(14,e)<<24|b(9,e)<<16|b(13,e)<<8|b(11,e);for(var l=1;l<4;l++)i[l][e]=i[l-1][e]>>>8|i[l-1][e]<<24,j[l][f]=j[l-1][f]>>>8|j[l-1][f]<<24}}var e,f,g,h,i,j,k=!1,l=!1,m=function(a,b,c){function e(a,b,c,d,e,h,i,k,l){var n=f.subarray(0,60),o=f.subarray(256,316);n.set([b,c,d,e,h,i,k,l]);for(var p=a,q=1;p<4*a+28;p++){var r=n[p-1];(p%a===0||8===a&&p%a===4)&&(r=g[r>>>24]<<24^g[r>>>16&255]<<16^g[r>>>8&255]<<8^g[255&r]),p%a===0&&(r=r<<8^r>>>24^q<<24,q=q<<1^(128&q?27:0)),n[p]=n[p-a]^r}for(var s=0;s<p;s+=4)for(var t=0;t<4;t++){var r=n[p-(4+s)+(4-t)%4];s<4||s>=p-4?o[s+t]=r:o[s+t]=j[0][g[r>>>24]]^j[1][g[r>>>16&255]]^j[2][g[r>>>8&255]]^j[3][g[255&r]]}m.set_rounds(a+5)}l||d();var f=new Uint32Array(c);f.set(g,512),f.set(h,768);for(var k=0;k<4;k++)f.set(i[k],4096+1024*k>>2),f.set(j[k],8192+1024*k>>2);var m=function(a,b,c){"use asm";var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0;var y=new a.Uint32Array(c),z=new a.Uint8Array(c);function A(a,b,c,h,i,j,k,l){a=a|0;b=b|0;c=c|0;h=h|0;i=i|0;j=j|0;k=k|0;l=l|0;var m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0;m=c|1024,n=c|2048,o=c|3072;i=i^y[(a|0)>>2],j=j^y[(a|4)>>2],k=k^y[(a|8)>>2],l=l^y[(a|12)>>2];for(t=16;(t|0)<=h<<4;t=t+16|0){p=y[(c|i>>22&1020)>>2]^y[(m|j>>14&1020)>>2]^y[(n|k>>6&1020)>>2]^y[(o|l<<2&1020)>>2]^y[(a|t|0)>>2],q=y[(c|j>>22&1020)>>2]^y[(m|k>>14&1020)>>2]^y[(n|l>>6&1020)>>2]^y[(o|i<<2&1020)>>2]^y[(a|t|4)>>2],r=y[(c|k>>22&1020)>>2]^y[(m|l>>14&1020)>>2]^y[(n|i>>6&1020)>>2]^y[(o|j<<2&1020)>>2]^y[(a|t|8)>>2],s=y[(c|l>>22&1020)>>2]^y[(m|i>>14&1020)>>2]^y[(n|j>>6&1020)>>2]^y[(o|k<<2&1020)>>2]^y[(a|t|12)>>2];i=p,j=q,k=r,l=s}d=y[(b|i>>22&1020)>>2]<<24^y[(b|j>>14&1020)>>2]<<16^y[(b|k>>6&1020)>>2]<<8^y[(b|l<<2&1020)>>2]^y[(a|t|0)>>2],e=y[(b|j>>22&1020)>>2]<<24^y[(b|k>>14&1020)>>2]<<16^y[(b|l>>6&1020)>>2]<<8^y[(b|i<<2&1020)>>2]^y[(a|t|4)>>2],f=y[(b|k>>22&1020)>>2]<<24^y[(b|l>>14&1020)>>2]<<16^y[(b|i>>6&1020)>>2]<<8^y[(b|j<<2&1020)>>2]^y[(a|t|8)>>2],g=y[(b|l>>22&1020)>>2]<<24^y[(b|i>>14&1020)>>2]<<16^y[(b|j>>6&1020)>>2]<<8^y[(b|k<<2&1020)>>2]^y[(a|t|12)>>2]}function B(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;A(0,2048,4096,x,a,b,c,d)}function C(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var f=0;A(1024,3072,8192,x,a,d,c,b);f=e,e=g,g=f}function D(a,b,c,l){a=a|0;b=b|0;c=c|0;l=l|0;A(0,2048,4096,x,h^a,i^b,j^c,k^l);h=d,i=e,j=f,k=g}function E(a,b,c,l){a=a|0;b=b|0;c=c|0;l=l|0;var m=0;A(1024,3072,8192,x,a,l,c,b);m=e,e=g,g=m;d=d^h,e=e^i,f=f^j,g=g^k;h=a,i=b,j=c,k=l}function F(a,b,c,l){a=a|0;b=b|0;c=c|0;l=l|0;A(0,2048,4096,x,h,i,j,k);h=d=d^a,i=e=e^b,j=f=f^c,k=g=g^l}function G(a,b,c,l){a=a|0;b=b|0;c=c|0;l=l|0;A(0,2048,4096,x,h,i,j,k);d=d^a,e=e^b,f=f^c,g=g^l;h=a,i=b,j=c,k=l}function H(a,b,c,l){a=a|0;b=b|0;c=c|0;l=l|0;A(0,2048,4096,x,h,i,j,k);h=d,i=e,j=f,k=g;d=d^a,e=e^b,f=f^c,g=g^l}function I(a,b,c,h){a=a|0;b=b|0;c=c|0;h=h|0;A(0,2048,4096,x,l,m,n,o);o=~s&o|s&o+1,n=~r&n|r&n+((o|0)==0),m=~q&m|q&m+((n|0)==0),l=~p&l|p&l+((m|0)==0);d=d^a,e=e^b,f=f^c,g=g^h}function J(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;var e=0,f=0,g=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;a=a^h,b=b^i,c=c^j,d=d^k;e=t|0,f=u|0,g=v|0,l=w|0;for(;(q|0)<128;q=q+1|0){if(e>>>31){m=m^a,n=n^b,o=o^c,p=p^d}e=e<<1|f>>>31,f=f<<1|g>>>31,g=g<<1|l>>>31,l=l<<1;r=d&1;d=d>>>1|c<<31,c=c>>>1|b<<31,b=b>>>1|a<<31,a=a>>>1;if(r)a=a^3774873600}h=m,i=n,j=o,k=p}function K(a){a=a|0;x=a}function L(a,b,c,h){a=a|0;b=b|0;c=c|0;h=h|0;d=a,e=b,f=c,g=h}function M(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;h=a,i=b,j=c,k=d}function N(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;l=a,m=b,n=c,o=d}function O(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;p=a,q=b,r=c,s=d}function P(a,b,c,d){a=a|0;b=b|0;c=c|0;d=d|0;o=~s&o|s&d,n=~r&n|r&c,m=~q&m|q&b,l=~p&l|p&a}function Q(a){a=a|0;if(a&15)return-1;z[a|0]=d>>>24,z[a|1]=d>>>16&255,z[a|2]=d>>>8&255,z[a|3]=d&255,z[a|4]=e>>>24,z[a|5]=e>>>16&255,z[a|6]=e>>>8&255,z[a|7]=e&255,z[a|8]=f>>>24,z[a|9]=f>>>16&255,z[a|10]=f>>>8&255,z[a|11]=f&255,z[a|12]=g>>>24,z[a|13]=g>>>16&255,z[a|14]=g>>>8&255,z[a|15]=g&255;return 16}function R(a){a=a|0;if(a&15)return-1;z[a|0]=h>>>24,z[a|1]=h>>>16&255,z[a|2]=h>>>8&255,z[a|3]=h&255,z[a|4]=i>>>24,z[a|5]=i>>>16&255,z[a|6]=i>>>8&255,z[a|7]=i&255,z[a|8]=j>>>24,z[a|9]=j>>>16&255,z[a|10]=j>>>8&255,z[a|11]=j&255,z[a|12]=k>>>24,z[a|13]=k>>>16&255,z[a|14]=k>>>8&255,z[a|15]=k&255;return 16}function S(){B(0,0,0,0);t=d,u=e,v=f,w=g}function T(a,b,c){a=a|0;b=b|0;c=c|0;var h=0;if(b&15)return-1;while((c|0)>=16){V[a&7](z[b|0]<<24|z[b|1]<<16|z[b|2]<<8|z[b|3],z[b|4]<<24|z[b|5]<<16|z[b|6]<<8|z[b|7],z[b|8]<<24|z[b|9]<<16|z[b|10]<<8|z[b|11],z[b|12]<<24|z[b|13]<<16|z[b|14]<<8|z[b|15]);z[b|0]=d>>>24,z[b|1]=d>>>16&255,z[b|2]=d>>>8&255,z[b|3]=d&255,z[b|4]=e>>>24,z[b|5]=e>>>16&255,z[b|6]=e>>>8&255,z[b|7]=e&255,z[b|8]=f>>>24,z[b|9]=f>>>16&255,z[b|10]=f>>>8&255,z[b|11]=f&255,z[b|12]=g>>>24,z[b|13]=g>>>16&255,z[b|14]=g>>>8&255,z[b|15]=g&255;h=h+16|0,b=b+16|0,c=c-16|0}return h|0}function U(a,b,c){a=a|0;b=b|0;c=c|0;var d=0;if(b&15)return-1;while((c|0)>=16){W[a&1](z[b|0]<<24|z[b|1]<<16|z[b|2]<<8|z[b|3],z[b|4]<<24|z[b|5]<<16|z[b|6]<<8|z[b|7],z[b|8]<<24|z[b|9]<<16|z[b|10]<<8|z[b|11],z[b|12]<<24|z[b|13]<<16|z[b|14]<<8|z[b|15]);d=d+16|0,b=b+16|0,c=c-16|0}return d|0}var V=[B,C,D,E,F,G,H,I];var W=[D,J];return{set_rounds:K,set_state:L,set_iv:M,set_nonce:N,set_mask:O,set_counter:P,get_state:Q,get_iv:R,gcm_init:S,cipher:T,mac:U}}(a,b,c);return m.set_key=e,m};return m.ENC={ECB:0,CBC:2,CFB:4,OFB:6,CTR:7},m.DEC={ECB:1,CBC:3,CFB:5,OFB:6,CTR:7},m.MAC={CBC:0,GCM:1},m.HEAP_DATA=16384,m}(),ea=A.prototype;ea.BLOCK_SIZE=16,ea.reset=v,ea.encrypt=x,ea.decrypt=z;var fa=B.prototype;fa.BLOCK_SIZE=16,fa.reset=v,fa.process=w,fa.finish=x;var ga=C.prototype;ga.BLOCK_SIZE=16,ga.reset=v,ga.process=y,ga.finish=z;var ha=D.prototype;ha.BLOCK_SIZE=16,ha.reset=G,ha.encrypt=x,ha.decrypt=x;var ia=E.prototype;ia.BLOCK_SIZE=16,ia.reset=G,ia.process=w,ia.finish=x;var ja=68719476704,ka=I.prototype;ka.BLOCK_SIZE=16,ka.reset=L,ka.encrypt=O,ka.decrypt=R;var la=J.prototype;la.BLOCK_SIZE=16,la.reset=L,la.process=M,la.finish=N;var ma=K.prototype;ma.BLOCK_SIZE=16,ma.reset=L,ma.process=P,ma.finish=Q;var na=new Uint8Array(1048576),oa=da(d,null,na.buffer);b.AES_CFB=A,b.AES_CFB.encrypt=S,b.AES_CFB.decrypt=T,b.AES_CFB.Encrypt=B,b.AES_CFB.Decrypt=C,b.AES_GCM=I,b.AES_GCM.encrypt=U,b.AES_GCM.decrypt=V,b.AES_GCM.Encrypt=J,b.AES_GCM.Decrypt=K;var pa=64,qa=32;$.BLOCK_SIZE=pa,$.HASH_SIZE=qa;var ra=$.prototype;ra.reset=W,ra.process=X,ra.finish=Y;var sa=null;return $.bytes=aa,$.hex=ba,$.base64=ca,b.SHA256=$,"function"==typeof a&&a.amd?a([],function(){return b}):"object"==typeof c&&c.exports?c.exports=b:d.asmCrypto=b,b}({},function(){return this}())},{}],2:[function(b,c,d){(function(d,e){(function(){"use strict";function f(a){return"function"==typeof a||"object"==typeof a&&null!==a}function g(a){return"function"==typeof a}function h(a){X=a}function i(a){_=a}function j(){return function(){d.nextTick(o)}}function k(){return function(){W(o)}}function l(){var a=0,b=new ca(o),c=document.createTextNode("");return b.observe(c,{characterData:!0}),function(){c.data=a=++a%2}}function m(){var a=new MessageChannel;return a.port1.onmessage=o,function(){a.port2.postMessage(0)}}function n(){return function(){setTimeout(o,1)}}function o(){for(var a=0;a<$;a+=2){var b=fa[a],c=fa[a+1];b(c),fa[a]=void 0,fa[a+1]=void 0}$=0}function p(){try{var a=b,c=a("vertx");return W=c.runOnLoop||c.runOnContext,k()}catch(d){return n()}}function q(a,b){var c=this,d=new this.constructor(s);void 0===d[ia]&&L(d);var e=c._state;if(e){var f=arguments[e-1];_(function(){I(e,d,f,c._result)})}else E(c,d,a,b);return d}function r(a){var b=this;if(a&&"object"==typeof a&&a.constructor===b)return a;var c=new b(s);return A(c,a),c}function s(){}function t(){return new TypeError("You cannot resolve a promise with itself")}function u(){return new TypeError("A promises callback cannot return that same promise.")}function v(a){try{return a.then}catch(b){return ma.error=b,ma}}function w(a,b,c,d){try{a.call(b,c,d)}catch(e){return e}}function x(a,b,c){_(function(a){var d=!1,e=w(c,b,function(c){d||(d=!0,b!==c?A(a,c):C(a,c))},function(b){d||(d=!0,D(a,b))},"Settle: "+(a._label||" unknown promise"));!d&&e&&(d=!0,D(a,e))},a)}function y(a,b){b._state===ka?C(a,b._result):b._state===la?D(a,b._result):E(b,void 0,function(b){A(a,b)},function(b){D(a,b)})}function z(a,b,c){b.constructor===a.constructor&&c===ga&&constructor.resolve===ha?y(a,b):c===ma?D(a,ma.error):void 0===c?C(a,b):g(c)?x(a,b,c):C(a,b)}function A(a,b){a===b?D(a,t()):f(b)?z(a,b,v(b)):C(a,b)}function B(a){a._onerror&&a._onerror(a._result),F(a)}function C(a,b){a._state===ja&&(a._result=b,a._state=ka,0!==a._subscribers.length&&_(F,a))}function D(a,b){a._state===ja&&(a._state=la,a._result=b,_(B,a))}function E(a,b,c,d){var e=a._subscribers,f=e.length;a._onerror=null,e[f]=b,e[f+ka]=c,e[f+la]=d,0===f&&a._state&&_(F,a)}function F(a){var b=a._subscribers,c=a._state;if(0!==b.length){for(var d,e,f=a._result,g=0;g<b.length;g+=3)d=b[g],e=b[g+c],d?I(c,d,e,f):e(f);a._subscribers.length=0}}function G(){this.error=null}function H(a,b){try{return a(b)}catch(c){return na.error=c,na}}function I(a,b,c,d){var e,f,h,i,j=g(c);if(j){if(e=H(c,d),e===na?(i=!0,f=e.error,e=null):h=!0,b===e)return void D(b,u())}else e=d,h=!0;b._state!==ja||(j&&h?A(b,e):i?D(b,f):a===ka?C(b,e):a===la&&D(b,e))}function J(a,b){try{b(function(b){A(a,b)},function(b){D(a,b)})}catch(c){D(a,c)}}function K(){return oa++}function L(a){a[ia]=oa++,a._state=void 0,a._result=void 0,a._subscribers=[]}function M(a){return new ta(this,a).promise}function N(a){var b=this;return new b(Z(a)?function(c,d){for(var e=a.length,f=0;f<e;f++)b.resolve(a[f]).then(c,d)}:function(a,b){b(new TypeError("You must pass an array to race."))})}function O(a){var b=this,c=new b(s);return D(c,a),c}function P(){throw new TypeError("You must pass a resolver function as the first argument to the promise constructor")}function Q(){throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.")}function R(a){this[ia]=K(),this._result=this._state=void 0,this._subscribers=[],s!==a&&("function"!=typeof a&&P(),this instanceof R?J(this,a):Q())}function S(a,b){this._instanceConstructor=a,this.promise=new a(s),this.promise[ia]||L(this.promise),Z(b)?(this._input=b,this.length=b.length,this._remaining=b.length,this._result=new Array(this.length),0===this.length?C(this.promise,this._result):(this.length=this.length||0,this._enumerate(),0===this._remaining&&C(this.promise,this._result))):D(this.promise,T())}function T(){return new Error("Array Methods must be provided an Array")}function U(){var a;if("undefined"!=typeof e)a=e;else if("undefined"!=typeof self)a=self;else try{a=Function("return this")()}catch(b){throw new Error("polyfill failed because global object is unavailable in this environment")}var c=a.Promise;c&&"[object Promise]"===Object.prototype.toString.call(c.resolve())&&!c.cast||(a.Promise=sa)}var V;V=Array.isArray?Array.isArray:function(a){return"[object Array]"===Object.prototype.toString.call(a)};var W,X,Y,Z=V,$=0,_=function(a,b){fa[$]=a,fa[$+1]=b,$+=2,2===$&&(X?X(o):Y())},aa="undefined"!=typeof window?window:void 0,ba=aa||{},ca=ba.MutationObserver||ba.WebKitMutationObserver,da="undefined"==typeof self&&"undefined"!=typeof d&&"[object process]"==={}.toString.call(d),ea="undefined"!=typeof Uint8ClampedArray&&"undefined"!=typeof importScripts&&"undefined"!=typeof MessageChannel,fa=new Array(1e3);Y=da?j():ca?l():ea?m():void 0===aa&&"function"==typeof b?p():n();var ga=q,ha=r,ia=Math.random().toString(36).substring(16),ja=void 0,ka=1,la=2,ma=new G,na=new G,oa=0,pa=M,qa=N,ra=O,sa=R;R.all=pa,R.race=qa,R.resolve=ha,R.reject=ra,R._setScheduler=h,R._setAsap=i,R._asap=_,R.prototype={constructor:R,then:ga,"catch":function(a){return this.then(null,a)}};var ta=S;S.prototype._enumerate=function(){for(var a=this.length,b=this._input,c=0;this._state===ja&&c<a;c++)this._eachEntry(b[c],c)},S.prototype._eachEntry=function(a,b){var c=this._instanceConstructor,d=c.resolve;if(d===ha){var e=v(a);if(e===ga&&a._state!==ja)this._settledAt(a._state,b,a._result);else if("function"!=typeof e)this._remaining--,this._result[b]=a;else if(c===sa){var f=new c(s);z(f,a,e),this._willSettleAt(f,b)}else this._willSettleAt(new c(function(b){b(a)}),b)}else this._willSettleAt(d(a),b)},S.prototype._settledAt=function(a,b,c){var d=this.promise;d._state===ja&&(this._remaining--,a===la?D(d,c):this._result[b]=c),0===this._remaining&&C(d,this._result)},S.prototype._willSettleAt=function(a,b){var c=this;E(a,void 0,function(a){c._settledAt(ka,b,a)},function(a){c._settledAt(la,b,a)})};var ua=U,va={Promise:sa,polyfill:ua};"function"==typeof a&&a.amd?a(function(){return va}):"undefined"!=typeof c&&c.exports?c.exports=va:"undefined"!=typeof this&&(this.ES6Promise=va),ua()}).call(this)}).call(this,b("_process"),"undefined"!=typeof global?global:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{_process:3}],3:[function(a,b,c){function d(){m&&k&&(m=!1,k.length?l=k.concat(l):n=-1,l.length&&e())}function e(){if(!m){var a=h(d);m=!0;for(var b=l.length;b;){for(k=l,l=[];++n<b;)k&&k[n].run();n=-1,b=l.length}k=null,m=!1,i(a)}}function f(a,b){this.fun=a,this.array=b}function g(){}var h,i,j=b.exports={};!function(){try{h=setTimeout}catch(a){h=function(){throw new Error("setTimeout is not defined")}}try{i=clearTimeout}catch(a){i=function(){throw new Error("clearTimeout is not defined")}}}();var k,l=[],m=!1,n=-1;j.nextTick=function(a){var b=new Array(arguments.length-1);if(arguments.length>1)for(var c=1;c<arguments.length;c++)b[c-1]=arguments[c];l.push(new f(a,b)),1!==l.length||m||h(e,0)},f.prototype.run=function(){this.fun.apply(null,this.array)},j.title="browser",j.browser=!0,j.env={},j.argv=[],j.version="",j.versions={},j.on=g,j.addListener=g,j.once=g,j.off=g,j.removeListener=g,j.removeAllListeners=g,j.emit=g,j.binding=function(a){throw new Error("process.binding is not supported")},j.cwd=function(){return"/"},j.chdir=function(a){throw new Error("process.chdir is not supported")},j.umask=function(){return 0}},{}],4:[function(a,b,c){(function(a){!function(){function c(a){"use strict";var b={fill:0},f=function(a){for(a+=9;a%64>0;a+=1);return a},g=function(a,b){for(var c=b>>2;c<a.length;c++)a[c]=0},h=function(a,b,c){a[b>>2]|=128<<24-(b%4<<3),a[((b>>2)+2&-16)+14]=c>>29,a[((b>>2)+2&-16)+15]=c<<3},i=function(a,b,c,d,e){var f,g=this,h=e%4,i=d%4,j=d-i;if(j>0)switch(h){case 0:a[e+3|0]=g.charCodeAt(c);case 1:a[e+2|0]=g.charCodeAt(c+1);case 2:a[e+1|0]=g.charCodeAt(c+2);case 3:a[0|e]=g.charCodeAt(c+3)}for(f=h;f<j;f=f+4|0)b[e+f>>2]=g.charCodeAt(c+f)<<24|g.charCodeAt(c+f+1)<<16|g.charCodeAt(c+f+2)<<8|g.charCodeAt(c+f+3);switch(i){case 3:a[e+j+1|0]=g.charCodeAt(c+j+2);case 2:a[e+j+2|0]=g.charCodeAt(c+j+1);case 1:a[e+j+3|0]=g.charCodeAt(c+j)}},j=function(a,b,c,d,e){var f,g=this,h=e%4,i=d%4,j=d-i;if(j>0)switch(h){case 0:a[e+3|0]=g[c];case 1:a[e+2|0]=g[c+1];case 2:a[e+1|0]=g[c+2];case 3:a[0|e]=g[c+3]}for(f=4-h;f<j;f=f+=4)b[e+f>>2]=g[c+f]<<24|g[c+f+1]<<16|g[c+f+2]<<8|g[c+f+3];switch(i){case 3:a[e+j+1|0]=g[c+j+2];case 2:a[e+j+2|0]=g[c+j+1];case 1:a[e+j+3|0]=g[c+j]}},k=function(a,b,c,d,f){var g,h=this,i=f%4,j=d%4,k=d-j,l=new Uint8Array(e.readAsArrayBuffer(h.slice(c,c+d)));if(k>0)switch(i){case 0:a[f+3|0]=l[0];case 1:a[f+2|0]=l[1];case 2:a[f+1|0]=l[2];case 3:a[0|f]=l[3]}for(g=4-i;g<k;g=g+=4)b[f+g>>2]=l[g]<<24|l[g+1]<<16|l[g+2]<<8|l[g+3];switch(j){case 3:a[f+k+1|0]=l[k+2];case 2:a[f+k+2|0]=l[k+1];case 1:a[f+k+3|0]=l[k]}},l=function(a){switch(d.getDataType(a)){case"string":return i.bind(a);case"array":return j.bind(a);case"buffer":return j.bind(a);case"arraybuffer":return j.bind(new Uint8Array(a));case"view":return j.bind(new Uint8Array(a.buffer,a.byteOffset,a.byteLength));case"blob":return k.bind(a)}},m=function(a){var b,c,d="0123456789abcdef",e=[],f=new Uint8Array(a);for(b=0;b<f.length;b++)c=f[b],e[b]=d.charAt(c>>4&15)+d.charAt(c>>0&15);return e.join("")},n=function(a){var b;if(a<=65536)return 65536;if(a<16777216)for(b=1;b<a;b<<=1);else for(b=16777216;b<a;b+=16777216);return b},o=function(a){if(a%64>0)throw new Error("Chunk size must be a multiple of 128 bit");b.maxChunkLen=a,b.padMaxChunkLen=f(a),b.heap=new ArrayBuffer(n(b.padMaxChunkLen+320+20)),b.h32=new Int32Array(b.heap),b.h8=new Int8Array(b.heap),b.core=new c._core({Int32Array:Int32Array,DataView:DataView},{},b.heap),b.buffer=null};o(a||65536);var p=function(a,b){var c=new Int32Array(a,b+320,5);c[0]=1732584193,c[1]=-271733879,c[2]=-1732584194,c[3]=271733878,c[4]=-1009589776},q=function(a,c){var d=f(a),e=new Int32Array(b.heap,0,d>>2);return g(e,a),h(e,a,c),d},r=function(a,c,d){l(a)(b.h8,b.h32,c,d,0)},s=function(a,c,d,e,f){var g=d;f&&(g=q(d,e)),r(a,c,d),b.core.hash(g,b.padMaxChunkLen)},t=function(a,b){var c=new Int32Array(a,b+320,5),d=new Int32Array(5),e=new DataView(d.buffer);return e.setInt32(0,c[0],!1),e.setInt32(4,c[1],!1),e.setInt32(8,c[2],!1),e.setInt32(12,c[3],!1),e.setInt32(16,c[4],!1),d},u=this.rawDigest=function(a){var c=a.byteLength||a.length||a.size||0;p(b.heap,b.padMaxChunkLen);var d=0,e=b.maxChunkLen;for(d=0;c>d+e;d+=e)s(a,d,e,c,!1);return s(a,d,c-d,c,!0),t(b.heap,b.padMaxChunkLen)};this.digest=this.digestFromString=this.digestFromBuffer=this.digestFromArrayBuffer=function(a){return m(u(a).buffer)}}var d={getDataType:function(b){if("string"==typeof b)return"string";if(b instanceof Array)return"array";if("undefined"!=typeof a&&a.Buffer&&a.Buffer.isBuffer(b))return"buffer";if(b instanceof ArrayBuffer)return"arraybuffer";if(b.buffer instanceof ArrayBuffer)return"view";if(b instanceof Blob)return"blob";throw new Error("Unsupported data type.")}};if(c._core=function g(a,b,c){"use asm";var d=new a.Int32Array(c);function e(a,b){a=a|0;b=b|0;var c=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;f=d[b+320>>2]|0;h=d[b+324>>2]|0;j=d[b+328>>2]|0;l=d[b+332>>2]|0;n=d[b+336>>2]|0;for(c=0;(c|0)<(a|0);c=c+64|0){g=f;i=h;k=j;m=l;o=n;for(e=0;(e|0)<64;e=e+4|0){q=d[c+e>>2]|0;p=((f<<5|f>>>27)+(h&j|~h&l)|0)+((q+n|0)+1518500249|0)|0;n=l;l=j;j=h<<30|h>>>2;h=f;f=p;d[a+e>>2]=q}for(e=a+64|0;(e|0)<(a+80|0);e=e+4|0){q=(d[e-12>>2]^d[e-32>>2]^d[e-56>>2]^d[e-64>>2])<<1|(d[e-12>>2]^d[e-32>>2]^d[e-56>>2]^d[e-64>>2])>>>31;p=((f<<5|f>>>27)+(h&j|~h&l)|0)+((q+n|0)+1518500249|0)|0;n=l;l=j;j=h<<30|h>>>2;h=f;f=p;d[e>>2]=q}for(e=a+80|0;(e|0)<(a+160|0);e=e+4|0){q=(d[e-12>>2]^d[e-32>>2]^d[e-56>>2]^d[e-64>>2])<<1|(d[e-12>>2]^d[e-32>>2]^d[e-56>>2]^d[e-64>>2])>>>31;p=((f<<5|f>>>27)+(h^j^l)|0)+((q+n|0)+1859775393|0)|0;n=l;l=j;j=h<<30|h>>>2;h=f;f=p;d[e>>2]=q}for(e=a+160|0;(e|0)<(a+240|0);e=e+4|0){q=(d[e-12>>2]^d[e-32>>2]^d[e-56>>2]^d[e-64>>2])<<1|(d[e-12>>2]^d[e-32>>2]^d[e-56>>2]^d[e-64>>2])>>>31;p=((f<<5|f>>>27)+(h&j|h&l|j&l)|0)+((q+n|0)-1894007588|0)|0;n=l;l=j;j=h<<30|h>>>2;h=f;f=p;d[e>>2]=q}for(e=a+240|0;(e|0)<(a+320|0);e=e+4|0){q=(d[e-12>>2]^d[e-32>>2]^d[e-56>>2]^d[e-64>>2])<<1|(d[e-12>>2]^d[e-32>>2]^d[e-56>>2]^d[e-64>>2])>>>31;p=((f<<5|f>>>27)+(h^j^l)|0)+((q+n|0)-899497514|0)|0;n=l;l=j;j=h<<30|h>>>2;h=f;f=p;d[e>>2]=q}f=f+g|0;h=h+i|0;j=j+k|0;l=l+m|0;n=n+o|0}d[b+320>>2]=f;d[b+324>>2]=h;d[b+328>>2]=j;d[b+332>>2]=l;d[b+336>>2]=n}return{hash:e}},"undefined"!=typeof b?b.exports=c:"undefined"!=typeof window&&(window.Rusha=c),"undefined"!=typeof FileReaderSync){var e=new FileReaderSync,f=new c(4194304);self.onmessage=function(a){var b,c=a.data.data;try{b=f.digest(c),self.postMessage({id:a.data.id,hash:b})}catch(d){self.postMessage({id:a.data.id,error:d.name})}}}}()}).call(this,"undefined"!=typeof global?global:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{}],5:[function(a,b,c){"use strict";function d(a){return a&&a.__esModule?a:{"default":a}}function e(a,b){return this instanceof e?(this.text=a.replace(/\r/g,"").replace(/[\t ]+\n/g,"\n").replace(/\n/g,"\r\n"),void(this.packets=b||new k["default"].List)):new e(a,b)}function f(a){var b=o["default"].decode(a);if(b.type!==m["default"].armor.signed)throw new Error("No cleartext signed message.");var c=new k["default"].List;c.read(b.data),g(b.headers,c);var d=new e(b.text,c);return d}function g(a,b){var c=function(a){function c(a){return b[d].hashAlgorithm===a}for(var d=0;d<b.length;d++)if(b[d].tag===m["default"].packet.signature&&!a.some(c))return!1;return!0},d=null,e=[];if(a.forEach(function(a){if(d=a.match(/Hash: (.+)/),!d)throw new Error('Only "Hash" header allowed in cleartext signed message');d=d[1].replace(/\s/g,""),d=d.split(","),d=d.map(function(a){a=a.toLowerCase();try{return m["default"].write(m["default"].hash,a)}catch(b){throw new Error("Unknown hash algorithm in armor header: "+a)}}),e=e.concat(d)}),!e.length&&!c([m["default"].hash.md5]))throw new Error('If no "Hash" header in cleartext signed message, then only MD5 signatures allowed');if(!c(e))throw new Error("Hash algorithm mismatch in armor header and signature")}Object.defineProperty(c,"__esModule",{value:!0}),c.CleartextMessage=e,c.readArmored=f;var h=a("./config"),i=d(h),j=a("./packet"),k=d(j),l=a("./enums.js"),m=d(l),n=a("./encoding/armor.js"),o=d(n);e.prototype.getSigningKeyIds=function(){var a=[],b=this.packets.filterByTag(m["default"].packet.signature);return b.forEach(function(b){a.push(b.issuerKeyId)}),a},e.prototype.sign=function(a){var b=new k["default"].List,c=new k["default"].Literal;c.setText(this.text);for(var d=0;d<a.length;d++){if(a[d].isPublic())throw new Error("Need private key for signing");var e=new k["default"].Signature;e.signatureType=m["default"].signature.text,e.hashAlgorithm=i["default"].prefer_hash_algorithm;var f=a[d].getSigningKeyPacket();if(e.publicKeyAlgorithm=f.algorithm,!f.isDecrypted)throw new Error("Private key is not decrypted.");e.sign(f,c),b.push(e)}this.packets=b},e.prototype.verify=function(a){var b=[],c=this.packets.filterByTag(m["default"].packet.signature),d=new k["default"].Literal;d.setText(this.text);for(var e=0;e<c.length;e++){for(var f=null,g=0;g<a.length&&!(f=a[g].getSigningKeyPacket(c[e].issuerKeyId));g++);var h={};f?(h.keyid=c[e].issuerKeyId,h.valid=c[e].verify(f,d)):(h.keyid=c[e].issuerKeyId,h.valid=null),b.push(h)}return b},e.prototype.getText=function(){return this.text.replace(/\r\n/g,"\n")},e.prototype.armor=function(){var a={hash:m["default"].read(m["default"].hash,i["default"].prefer_hash_algorithm).toUpperCase(),text:this.text,data:this.packets.write()};return o["default"].encode(m["default"].armor.signed,a)}},{"./config":10,"./encoding/armor.js":33,"./enums.js":35,"./packet":47}],6:[function(a,b,c){(function(){"use strict";function a(a,b){var c=a.split("."),d=n;!(c[0]in d)&&d.execScript&&d.execScript("var "+c[0]);for(var e;c.length&&(e=c.shift());)c.length||b===l?d=d[e]?d[e]:d[e]={}:d[e]=b}function b(a,b){if(this.index="number"==typeof b?b:0,this.d=0,this.buffer=a instanceof(o?Uint8Array:Array)?a:new(o?Uint8Array:Array)(32768),2*this.buffer.length<=this.index)throw Error("invalid index");this.buffer.length<=this.index&&c(this)}function c(a){var b,c=a.buffer,d=c.length,e=new(o?Uint8Array:Array)(d<<1);if(o)e.set(c);else for(b=0;b<d;++b)e[b]=c[b];return a.buffer=e}function d(a){this.buffer=new(o?Uint16Array:Array)(2*a),this.length=0}function e(a,b){this.e=w,this.f=0,this.input=o&&a instanceof Array?new Uint8Array(a):a,this.c=0,b&&(b.lazy&&(this.f=b.lazy),"number"==typeof b.compressionType&&(this.e=b.compressionType),b.outputBuffer&&(this.b=o&&b.outputBuffer instanceof Array?new Uint8Array(b.outputBuffer):b.outputBuffer),"number"==typeof b.outputIndex&&(this.c=b.outputIndex)),this.b||(this.b=new(o?Uint8Array:Array)(32768))}function f(a,b){this.length=a,this.g=b}function g(a,b){function c(a,b){var c,d=a.g,e=[],f=0;c=z[a.length],e[f++]=65535&c,e[f++]=c>>16&255,e[f++]=c>>24;var g;switch(m){case 1===d:g=[0,d-1,0];break;case 2===d:g=[1,d-2,0];break;case 3===d:g=[2,d-3,0];break;case 4===d:g=[3,d-4,0];break;case 6>=d:g=[4,d-5,1];break;case 8>=d:g=[5,d-7,1];break;case 12>=d:g=[6,d-9,2];break;case 16>=d:g=[7,d-13,2];break;case 24>=d:g=[8,d-17,3];break;case 32>=d:g=[9,d-25,3];break;case 48>=d:g=[10,d-33,4];break;case 64>=d:g=[11,d-49,4];break;case 96>=d:g=[12,d-65,5];break;case 128>=d:g=[13,d-97,5];break;case 192>=d:g=[14,d-129,6];break;case 256>=d:g=[15,d-193,6];break;case 384>=d:g=[16,d-257,7];break;case 512>=d:g=[17,d-385,7];break;case 768>=d:g=[18,d-513,8];break;case 1024>=d:g=[19,d-769,8];break;case 1536>=d:g=[20,d-1025,9];break;case 2048>=d:g=[21,d-1537,9];break;case 3072>=d:g=[22,d-2049,10];break;case 4096>=d:g=[23,d-3073,10];break;case 6144>=d:g=[24,d-4097,11];break;case 8192>=d:g=[25,d-6145,11];break;case 12288>=d:g=[26,d-8193,12];break;case 16384>=d:g=[27,d-12289,12];break;case 24576>=d:g=[28,d-16385,13];break;case 32768>=d:g=[29,d-24577,13];break;default:throw"invalid distance"}c=g,e[f++]=c[0],e[f++]=c[1],e[f++]=c[2];var h,i;for(h=0,i=e.length;h<i;++h)r[s++]=e[h];u[e[0]]++,v[e[3]]++,t=a.length+b-1,n=null}var d,e,f,g,i,j,k,n,p,q={},r=o?new Uint16Array(2*b.length):[],s=0,t=0,u=new(o?Uint32Array:Array)(286),v=new(o?Uint32Array:Array)(30),w=a.f;if(!o){for(f=0;285>=f;)u[f++]=0;for(f=0;29>=f;)v[f++]=0}for(u[256]=1,d=0,e=b.length;d<e;++d){for(f=i=0,g=3;f<g&&d+f!==e;++f)i=i<<8|b[d+f];if(q[i]===l&&(q[i]=[]),j=q[i],!(0<t--)){for(;0<j.length&&32768<d-j[0];)j.shift();if(d+3>=e){for(n&&c(n,-1),f=0,g=e-d;f<g;++f)p=b[d+f],r[s++]=p,++u[p];break}0<j.length?(k=h(b,d,j),n?n.length<k.length?(p=b[d-1],r[s++]=p,++u[p],c(k,0)):c(n,-1):k.length<w?n=k:c(k,0)):n?c(n,-1):(p=b[d],r[s++]=p,++u[p])}j.push(d)}return r[s++]=256,u[256]++,a.j=u,a.i=v,o?r.subarray(0,s):r}function h(a,b,c){var d,e,g,h,i,j,k=0,l=a.length;h=0,j=c.length;a:for(;h<j;h++){if(d=c[j-h-1],g=3,3<k){for(i=k;3<i;i--)if(a[d+i-1]!==a[b+i-1])continue a;g=k}for(;258>g&&b+g<l&&a[d+g]===a[b+g];)++g;if(g>k&&(e=d,k=g),258===g)break}return new f(k,b-e)}function i(a,b){var c,e,f,g,h,i=a.length,k=new d(572),l=new(o?Uint8Array:Array)(i);if(!o)for(g=0;g<i;g++)l[g]=0;for(g=0;g<i;++g)0<a[g]&&k.push(g,a[g]);if(c=Array(k.length/2),e=new(o?Uint32Array:Array)(k.length/2),1===c.length)return l[k.pop().index]=1,l;for(g=0,h=k.length/2;g<h;++g)c[g]=k.pop(),e[g]=c[g].value;for(f=j(e,e.length,b),g=0,h=c.length;g<h;++g)l[c[g].index]=f[g];return l}function j(a,b,c){function d(a){var c=n[a][p[a]];c===b?(d(a+1),d(a+1)):--l[c],++p[a]}var e,f,g,h,i,j=new(o?Uint16Array:Array)(c),k=new(o?Uint8Array:Array)(c),l=new(o?Uint8Array:Array)(b),m=Array(c),n=Array(c),p=Array(c),q=(1<<c)-b,r=1<<c-1;for(j[c-1]=b,f=0;f<c;++f)q<r?k[f]=0:(k[f]=1,q-=r),q<<=1,j[c-2-f]=(j[c-1-f]/2|0)+b;for(j[0]=k[0],m[0]=Array(j[0]),n[0]=Array(j[0]),f=1;f<c;++f)j[f]>2*j[f-1]+k[f]&&(j[f]=2*j[f-1]+k[f]),m[f]=Array(j[f]),n[f]=Array(j[f]);for(e=0;e<b;++e)l[e]=c;for(g=0;g<j[c-1];++g)m[c-1][g]=a[g],n[c-1][g]=g;for(e=0;e<c;++e)p[e]=0;for(1===k[c-1]&&(--l[0],++p[c-1]),f=c-2;0<=f;--f){for(h=e=0,i=p[f+1],g=0;g<j[f];g++)h=m[f+1][i]+m[f+1][i+1],h>a[e]?(m[f][g]=h,n[f][g]=b,i+=2):(m[f][g]=a[e],n[f][g]=e,++e);p[f]=0,1===k[f]&&d(f)}return l}function k(a){var b,c,d,e,f=new(o?Uint16Array:Array)(a.length),g=[],h=[],i=0;for(b=0,c=a.length;b<c;b++)g[a[b]]=(0|g[a[b]])+1;for(b=1,c=16;b<=c;b++)h[b]=i,i+=0|g[b],i<<=1;for(b=0,c=a.length;b<c;b++)for(i=h[a[b]],h[a[b]]+=1,d=f[b]=0,e=a[b];d<e;d++)f[b]=f[b]<<1|1&i,i>>>=1;return f}var l=void 0,m=!0,n=this,o="undefined"!=typeof Uint8Array&&"undefined"!=typeof Uint16Array&&"undefined"!=typeof Uint32Array&&"undefined"!=typeof DataView;b.prototype.a=function(a,b,d){var e,f=this.buffer,g=this.index,h=this.d,i=f[g];if(d&&1<b&&(a=8<b?(u[255&a]<<24|u[a>>>8&255]<<16|u[a>>>16&255]<<8|u[a>>>24&255])>>32-b:u[a]>>8-b),8>b+h)i=i<<b|a,h+=b;else for(e=0;e<b;++e)i=i<<1|a>>b-e-1&1,8===++h&&(h=0,f[g++]=u[i],i=0,g===f.length&&(f=c(this)));f[g]=i,this.buffer=f,this.d=h,this.index=g},b.prototype.finish=function(){var a,b=this.buffer,c=this.index;return 0<this.d&&(b[c]<<=8-this.d,b[c]=u[b[c]],c++),o?a=b.subarray(0,c):(b.length=c,a=b),a};var p,q=new(o?Uint8Array:Array)(256);for(p=0;256>p;++p){for(var r=p,s=r,t=7,r=r>>>1;r;r>>>=1)s<<=1,s|=1&r,--t;q[p]=(s<<t&255)>>>0}var u=q;d.prototype.getParent=function(a){return 2*((a-2)/4|0)},d.prototype.push=function(a,b){var c,d,e,f=this.buffer;for(c=this.length,f[this.length++]=b,f[this.length++]=a;0<c&&(d=this.getParent(c),f[c]>f[d]);)e=f[c],f[c]=f[d],f[d]=e,e=f[c+1],f[c+1]=f[d+1],f[d+1]=e,c=d;return this.length},d.prototype.pop=function(){var a,b,c,d,e,f=this.buffer;for(b=f[0],a=f[1],this.length-=2,f[0]=f[this.length],f[1]=f[this.length+1],e=0;(d=2*e+2,!(d>=this.length))&&(d+2<this.length&&f[d+2]>f[d]&&(d+=2),f[d]>f[e]);)c=f[e],f[e]=f[d],f[d]=c,c=f[e+1],f[e+1]=f[d+1],f[d+1]=c,e=d;return{index:a,value:b,length:this.length}};var v,w=2,x=[];for(v=0;288>v;v++)switch(m){case 143>=v:x.push([v+48,8]);break;case 255>=v:x.push([v-144+400,9]);break;case 279>=v:x.push([v-256+0,7]);break;case 287>=v:x.push([v-280+192,8]);break;default:throw"invalid literal: "+v}e.prototype.h=function(){var a,c,d,e,f=this.input;switch(this.e){case 0:for(d=0,e=f.length;d<e;){c=o?f.subarray(d,d+65535):f.slice(d,d+65535),d+=c.length;var h=c,j=d===e,n=l,p=l,q=l,r=l,s=l,t=this.b,u=this.c;if(o){for(t=new Uint8Array(this.b.buffer);t.length<=u+h.length+5;)t=new Uint8Array(t.length<<1);t.set(this.b)}if(n=j?1:0,t[u++]=0|n,p=h.length,q=~p+65536&65535,t[u++]=255&p,t[u++]=p>>>8&255,t[u++]=255&q,t[u++]=q>>>8&255,o)t.set(h,u),u+=h.length,t=t.subarray(0,u);else{for(r=0,s=h.length;r<s;++r)t[u++]=h[r];t.length=u}this.c=u,this.b=t}break;case 1:var v=new b(o?new Uint8Array(this.b.buffer):this.b,this.c);v.a(1,1,m),v.a(1,2,m);var y,z,A,B=g(this,f);for(y=0,z=B.length;y<z;y++)if(A=B[y],b.prototype.a.apply(v,x[A]),256<A)v.a(B[++y],B[++y],m),v.a(B[++y],5),v.a(B[++y],B[++y],m);else if(256===A)break;this.b=v.finish(),this.c=this.b.length;break;case w:var C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R=new b(o?new Uint8Array(this.b.buffer):this.b,this.c),S=[16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15],T=Array(19);for(C=w,R.a(1,1,m),R.a(C,2,m),D=g(this,f),H=i(this.j,15),I=k(H),J=i(this.i,7),K=k(J),E=286;257<E&&0===H[E-1];E--);for(F=30;1<F&&0===J[F-1];F--);var U,V,W,X,Y,Z,$=E,_=F,aa=new(o?Uint32Array:Array)($+_),ba=new(o?Uint32Array:Array)(316),ca=new(o?Uint8Array:Array)(19);for(U=V=0;U<$;U++)aa[V++]=H[U];for(U=0;U<_;U++)aa[V++]=J[U];if(!o)for(U=0,X=ca.length;U<X;++U)ca[U]=0;for(U=Y=0,X=aa.length;U<X;U+=V){for(V=1;U+V<X&&aa[U+V]===aa[U];++V);if(W=V,0===aa[U])if(3>W)for(;0<W--;)ba[Y++]=0,ca[0]++;else for(;0<W;)Z=138>W?W:138,Z>W-3&&Z<W&&(Z=W-3),10>=Z?(ba[Y++]=17,ba[Y++]=Z-3,ca[17]++):(ba[Y++]=18,ba[Y++]=Z-11,ca[18]++),W-=Z;else if(ba[Y++]=aa[U],ca[aa[U]]++,W--,3>W)for(;0<W--;)ba[Y++]=aa[U],ca[aa[U]]++;else for(;0<W;)Z=6>W?W:6,Z>W-3&&Z<W&&(Z=W-3),ba[Y++]=16,ba[Y++]=Z-3,ca[16]++,W-=Z}for(a=o?ba.subarray(0,Y):ba.slice(0,Y),L=i(ca,7),P=0;19>P;P++)T[P]=L[S[P]];for(G=19;4<G&&0===T[G-1];G--);for(M=k(L),R.a(E-257,5,m),R.a(F-1,5,m),R.a(G-4,4,m),P=0;P<G;P++)R.a(T[P],3,m);for(P=0,Q=a.length;P<Q;P++)if(N=a[P],
R.a(M[N],L[N],m),16<=N){switch(P++,N){case 16:O=2;break;case 17:O=3;break;case 18:O=7;break;default:throw"invalid code: "+N}R.a(a[P],O,m)}var da,ea,fa,ga,ha,ia,ja,ka,la=[I,H],ma=[K,J];for(ha=la[0],ia=la[1],ja=ma[0],ka=ma[1],da=0,ea=D.length;da<ea;++da)if(fa=D[da],R.a(ha[fa],ia[fa],m),256<fa)R.a(D[++da],D[++da],m),ga=D[++da],R.a(ja[ga],ka[ga],m),R.a(D[++da],D[++da],m);else if(256===fa)break;this.b=R.finish(),this.c=this.b.length;break;default:throw"invalid compression type"}return this.b};var y=function(){function a(a){switch(m){case 3===a:return[257,a-3,0];case 4===a:return[258,a-4,0];case 5===a:return[259,a-5,0];case 6===a:return[260,a-6,0];case 7===a:return[261,a-7,0];case 8===a:return[262,a-8,0];case 9===a:return[263,a-9,0];case 10===a:return[264,a-10,0];case 12>=a:return[265,a-11,1];case 14>=a:return[266,a-13,1];case 16>=a:return[267,a-15,1];case 18>=a:return[268,a-17,1];case 22>=a:return[269,a-19,2];case 26>=a:return[270,a-23,2];case 30>=a:return[271,a-27,2];case 34>=a:return[272,a-31,2];case 42>=a:return[273,a-35,3];case 50>=a:return[274,a-43,3];case 58>=a:return[275,a-51,3];case 66>=a:return[276,a-59,3];case 82>=a:return[277,a-67,4];case 98>=a:return[278,a-83,4];case 114>=a:return[279,a-99,4];case 130>=a:return[280,a-115,4];case 162>=a:return[281,a-131,5];case 194>=a:return[282,a-163,5];case 226>=a:return[283,a-195,5];case 257>=a:return[284,a-227,5];case 258===a:return[285,a-258,0];default:throw"invalid length: "+a}}var b,c,d=[];for(b=3;258>=b;b++)c=a(b),d[b]=c[2]<<24|c[1]<<16|c[0];return d}(),z=o?new Uint32Array(y):y;a("Zlib.RawDeflate",e),a("Zlib.RawDeflate.prototype.compress",e.prototype.h);var A,B,C,D,E={NONE:0,FIXED:1,DYNAMIC:w};if(Object.keys)A=Object.keys(E);else for(B in A=[],C=0,E)A[C++]=B;for(C=0,D=A.length;C<D;++C)B=A[C],a("Zlib.RawDeflate.CompressionType."+B,E[B])}).call(this)},{}],7:[function(a,b,c){(function(){"use strict";function a(a,b){var c=a.split("."),d=g;!(c[0]in d)&&d.execScript&&d.execScript("var "+c[0]);for(var e;c.length&&(e=c.shift());)c.length||void 0===b?d=d[e]?d[e]:d[e]={}:d[e]=b}function b(a){var b,c,d,e,f,g,i,j,k,l,m=a.length,n=0,o=Number.POSITIVE_INFINITY;for(j=0;j<m;++j)a[j]>n&&(n=a[j]),a[j]<o&&(o=a[j]);for(b=1<<n,c=new(h?Uint32Array:Array)(b),d=1,e=0,f=2;d<=n;){for(j=0;j<m;++j)if(a[j]===d){for(g=0,i=e,k=0;k<d;++k)g=g<<1|1&i,i>>=1;for(l=d<<16|j,k=g;k<b;k+=f)c[k]=l;++e}++d,e<<=1,f<<=1}return[c,n,o]}function c(a,b){switch(this.g=[],this.h=32768,this.c=this.f=this.d=this.k=0,this.input=h?new Uint8Array(a):a,this.l=!1,this.i=j,this.q=!1,!b&&(b={})||(b.index&&(this.d=b.index),b.bufferSize&&(this.h=b.bufferSize),b.bufferType&&(this.i=b.bufferType),b.resize&&(this.q=b.resize)),this.i){case i:this.a=32768,this.b=new(h?Uint8Array:Array)(32768+this.h+258);break;case j:this.a=0,this.b=new(h?Uint8Array:Array)(this.h),this.e=this.v,this.m=this.s,this.j=this.t;break;default:throw Error("invalid inflate mode")}}function d(a,b){for(var c,d=a.f,e=a.c,f=a.input,g=a.d,h=f.length;e<b;){if(g>=h)throw Error("input buffer is broken");d|=f[g++]<<e,e+=8}return c=d&(1<<b)-1,a.f=d>>>b,a.c=e-b,a.d=g,c}function e(a,b){for(var c,d,e=a.f,f=a.c,g=a.input,h=a.d,i=g.length,j=b[0],k=b[1];f<k&&!(h>=i);)e|=g[h++]<<f,f+=8;return c=j[e&(1<<k)-1],d=c>>>16,a.f=e>>d,a.c=f-d,a.d=h,65535&c}function f(a){function c(a,b,c){var f,g,h,i=this.p;for(h=0;h<a;)switch(f=e(this,b)){case 16:for(g=3+d(this,2);g--;)c[h++]=i;break;case 17:for(g=3+d(this,3);g--;)c[h++]=0;i=0;break;case 18:for(g=11+d(this,7);g--;)c[h++]=0;i=0;break;default:i=c[h++]=f}return this.p=i,c}var f,g,i,j,k=d(a,5)+257,l=d(a,5)+1,m=d(a,4)+4,o=new(h?Uint8Array:Array)(n.length);for(j=0;j<m;++j)o[n[j]]=d(a,3);if(!h)for(j=m,m=o.length;j<m;++j)o[n[j]]=0;f=b(o),g=new(h?Uint8Array:Array)(k),i=new(h?Uint8Array:Array)(l),a.p=0,a.j(b(c.call(a,k,f,g)),b(c.call(a,l,f,i)))}var g=this,h="undefined"!=typeof Uint8Array&&"undefined"!=typeof Uint16Array&&"undefined"!=typeof Uint32Array&&"undefined"!=typeof DataView,i=0,j=1;c.prototype.u=function(){for(;!this.l;){var a=d(this,3);switch(1&a&&(this.l=!0),a>>>=1){case 0:var b=this.input,c=this.d,e=this.b,g=this.a,k=b.length,l=void 0,m=void 0,n=e.length,o=void 0;if(this.c=this.f=0,c+1>=k)throw Error("invalid uncompressed block header: LEN");if(l=b[c++]|b[c++]<<8,c+1>=k)throw Error("invalid uncompressed block header: NLEN");if(m=b[c++]|b[c++]<<8,l===~m)throw Error("invalid uncompressed block header: length verify");if(c+l>b.length)throw Error("input buffer is broken");switch(this.i){case i:for(;g+l>e.length;){if(o=n-g,l-=o,h)e.set(b.subarray(c,c+o),g),g+=o,c+=o;else for(;o--;)e[g++]=b[c++];this.a=g,e=this.e(),g=this.a}break;case j:for(;g+l>e.length;)e=this.e({o:2});break;default:throw Error("invalid inflate mode")}if(h)e.set(b.subarray(c,c+l),g),g+=l,c+=l;else for(;l--;)e[g++]=b[c++];this.d=c,this.a=g,this.b=e;break;case 1:this.j(z,B);break;case 2:f(this);break;default:throw Error("unknown BTYPE: "+a)}}return this.m()};var k,l,m=[16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15],n=h?new Uint16Array(m):m,o=[3,4,5,6,7,8,9,10,11,13,15,17,19,23,27,31,35,43,51,59,67,83,99,115,131,163,195,227,258,258,258],p=h?new Uint16Array(o):o,q=[0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0,0,0],r=h?new Uint8Array(q):q,s=[1,2,3,4,5,7,9,13,17,25,33,49,65,97,129,193,257,385,513,769,1025,1537,2049,3073,4097,6145,8193,12289,16385,24577],t=h?new Uint16Array(s):s,u=[0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13],v=h?new Uint8Array(u):u,w=new(h?Uint8Array:Array)(288);for(k=0,l=w.length;k<l;++k)w[k]=143>=k?8:255>=k?9:279>=k?7:8;var x,y,z=b(w),A=new(h?Uint8Array:Array)(30);for(x=0,y=A.length;x<y;++x)A[x]=5;var B=b(A);c.prototype.j=function(a,b){var c=this.b,f=this.a;this.n=a;for(var g,h,i,j,k=c.length-258;256!==(g=e(this,a));)if(256>g)f>=k&&(this.a=f,c=this.e(),f=this.a),c[f++]=g;else for(h=g-257,j=p[h],0<r[h]&&(j+=d(this,r[h])),g=e(this,b),i=t[g],0<v[g]&&(i+=d(this,v[g])),f>=k&&(this.a=f,c=this.e(),f=this.a);j--;)c[f]=c[f++-i];for(;8<=this.c;)this.c-=8,this.d--;this.a=f},c.prototype.t=function(a,b){var c=this.b,f=this.a;this.n=a;for(var g,h,i,j,k=c.length;256!==(g=e(this,a));)if(256>g)f>=k&&(c=this.e(),k=c.length),c[f++]=g;else for(h=g-257,j=p[h],0<r[h]&&(j+=d(this,r[h])),g=e(this,b),i=t[g],0<v[g]&&(i+=d(this,v[g])),f+j>k&&(c=this.e(),k=c.length);j--;)c[f]=c[f++-i];for(;8<=this.c;)this.c-=8,this.d--;this.a=f},c.prototype.e=function(){var a,b,c=new(h?Uint8Array:Array)(this.a-32768),d=this.a-32768,e=this.b;if(h)c.set(e.subarray(32768,c.length));else for(a=0,b=c.length;a<b;++a)c[a]=e[a+32768];if(this.g.push(c),this.k+=c.length,h)e.set(e.subarray(d,d+32768));else for(a=0;32768>a;++a)e[a]=e[d+a];return this.a=32768,e},c.prototype.v=function(a){var b,c,d,e,f=this.input.length/this.d+1|0,g=this.input,i=this.b;return a&&("number"==typeof a.o&&(f=a.o),"number"==typeof a.r&&(f+=a.r)),2>f?(c=(g.length-this.d)/this.n[2],e=258*(c/2)|0,d=e<i.length?i.length+e:i.length<<1):d=i.length*f,h?(b=new Uint8Array(d),b.set(i)):b=i,this.b=b},c.prototype.m=function(){var a,b,c,d,e,f=0,g=this.b,i=this.g,j=new(h?Uint8Array:Array)(this.k+(this.a-32768));if(0===i.length)return h?this.b.subarray(32768,this.a):this.b.slice(32768,this.a);for(b=0,c=i.length;b<c;++b)for(a=i[b],d=0,e=a.length;d<e;++d)j[f++]=a[d];for(b=32768,c=this.a;b<c;++b)j[f++]=g[b];return this.g=[],this.buffer=j},c.prototype.s=function(){var a,b=this.a;return h?this.q?(a=new Uint8Array(b),a.set(this.b.subarray(0,b))):a=this.b.subarray(0,b):(this.b.length>b&&(this.b.length=b),a=this.b),this.buffer=a},a("Zlib.RawInflate",c),a("Zlib.RawInflate.prototype.decompress",c.prototype.u);var C,D,E,F,G={ADAPTIVE:j,BLOCK:i};if(Object.keys)C=Object.keys(G);else for(D in C=[],E=0,G)C[E++]=D;for(E=0,F=C.length;E<F;++E)D=C[E],a("Zlib.RawInflate.BufferType."+D,G[D])}).call(this)},{}],8:[function(a,b,c){(function(){"use strict";function a(a){throw a}function b(a,b){var c=a.split("."),d=w;!(c[0]in d)&&d.execScript&&d.execScript("var "+c[0]);for(var e;c.length&&(e=c.shift());)c.length||b===u?d=d[e]?d[e]:d[e]={}:d[e]=b}function c(b,c){this.index="number"==typeof c?c:0,this.i=0,this.buffer=b instanceof(x?Uint8Array:Array)?b:new(x?Uint8Array:Array)(32768),2*this.buffer.length<=this.index&&a(Error("invalid index")),this.buffer.length<=this.index&&this.f()}function d(a){this.buffer=new(x?Uint16Array:Array)(2*a),this.length=0}function e(a){var b,c,d,e,f,g,h,i,j,k,l=a.length,m=0,n=Number.POSITIVE_INFINITY;for(i=0;i<l;++i)a[i]>m&&(m=a[i]),a[i]<n&&(n=a[i]);for(b=1<<m,c=new(x?Uint32Array:Array)(b),d=1,e=0,f=2;d<=m;){for(i=0;i<l;++i)if(a[i]===d){for(g=0,h=e,j=0;j<d;++j)g=g<<1|1&h,h>>=1;for(k=d<<16|i,j=g;j<b;j+=f)c[j]=k;++e}++d,e<<=1,f<<=1}return[c,m,n]}function f(a,b){this.h=F,this.w=0,this.input=x&&a instanceof Array?new Uint8Array(a):a,this.b=0,b&&(b.lazy&&(this.w=b.lazy),"number"==typeof b.compressionType&&(this.h=b.compressionType),b.outputBuffer&&(this.a=x&&b.outputBuffer instanceof Array?new Uint8Array(b.outputBuffer):b.outputBuffer),"number"==typeof b.outputIndex&&(this.b=b.outputIndex)),this.a||(this.a=new(x?Uint8Array:Array)(32768))}function g(a,b){this.length=a,this.H=b}function h(b,c){function d(b,c){var d,e=b.H,f=[],g=0;d=J[b.length],f[g++]=65535&d,f[g++]=d>>16&255,f[g++]=d>>24;var h;switch(v){case 1===e:h=[0,e-1,0];break;case 2===e:h=[1,e-2,0];break;case 3===e:h=[2,e-3,0];break;case 4===e:h=[3,e-4,0];break;case 6>=e:h=[4,e-5,1];break;case 8>=e:h=[5,e-7,1];break;case 12>=e:h=[6,e-9,2];break;case 16>=e:h=[7,e-13,2];break;case 24>=e:h=[8,e-17,3];break;case 32>=e:h=[9,e-25,3];break;case 48>=e:h=[10,e-33,4];break;case 64>=e:h=[11,e-49,4];break;case 96>=e:h=[12,e-65,5];break;case 128>=e:h=[13,e-97,5];break;case 192>=e:h=[14,e-129,6];break;case 256>=e:h=[15,e-193,6];break;case 384>=e:h=[16,e-257,7];break;case 512>=e:h=[17,e-385,7];break;case 768>=e:h=[18,e-513,8];break;case 1024>=e:h=[19,e-769,8];break;case 1536>=e:h=[20,e-1025,9];break;case 2048>=e:h=[21,e-1537,9];break;case 3072>=e:h=[22,e-2049,10];break;case 4096>=e:h=[23,e-3073,10];break;case 6144>=e:h=[24,e-4097,11];break;case 8192>=e:h=[25,e-6145,11];break;case 12288>=e:h=[26,e-8193,12];break;case 16384>=e:h=[27,e-12289,12];break;case 24576>=e:h=[28,e-16385,13];break;case 32768>=e:h=[29,e-24577,13];break;default:a("invalid distance")}d=h,f[g++]=d[0],f[g++]=d[1],f[g++]=d[2];var i,j;for(i=0,j=f.length;i<j;++i)p[q++]=f[i];s[f[0]]++,t[f[3]]++,r=b.length+c-1,m=null}var e,f,g,h,j,k,l,m,n,o={},p=x?new Uint16Array(2*c.length):[],q=0,r=0,s=new(x?Uint32Array:Array)(286),t=new(x?Uint32Array:Array)(30),w=b.w;if(!x){for(g=0;285>=g;)s[g++]=0;for(g=0;29>=g;)t[g++]=0}for(s[256]=1,e=0,f=c.length;e<f;++e){for(g=j=0,h=3;g<h&&e+g!==f;++g)j=j<<8|c[e+g];if(o[j]===u&&(o[j]=[]),k=o[j],!(0<r--)){for(;0<k.length&&32768<e-k[0];)k.shift();if(e+3>=f){for(m&&d(m,-1),g=0,h=f-e;g<h;++g)n=c[e+g],p[q++]=n,++s[n];break}0<k.length?(l=i(c,e,k),m?m.length<l.length?(n=c[e-1],p[q++]=n,++s[n],d(l,0)):d(m,-1):l.length<w?m=l:d(l,0)):m?d(m,-1):(n=c[e],p[q++]=n,++s[n])}k.push(e)}return p[q++]=256,s[256]++,b.M=s,b.L=t,x?p.subarray(0,q):p}function i(a,b,c){var d,e,f,h,i,j,k=0,l=a.length;h=0,j=c.length;a:for(;h<j;h++){if(d=c[j-h-1],f=3,3<k){for(i=k;3<i;i--)if(a[d+i-1]!==a[b+i-1])continue a;f=k}for(;258>f&&b+f<l&&a[d+f]===a[b+f];)++f;if(f>k&&(e=d,k=f),258===f)break}return new g(k,b-e)}function j(a,b){var c,e,f,g,h,i=a.length,j=new d(572),l=new(x?Uint8Array:Array)(i);if(!x)for(g=0;g<i;g++)l[g]=0;for(g=0;g<i;++g)0<a[g]&&j.push(g,a[g]);if(c=Array(j.length/2),e=new(x?Uint32Array:Array)(j.length/2),1===c.length)return l[j.pop().index]=1,l;for(g=0,h=j.length/2;g<h;++g)c[g]=j.pop(),e[g]=c[g].value;for(f=k(e,e.length,b),g=0,h=c.length;g<h;++g)l[c[g].index]=f[g];return l}function k(a,b,c){function d(a){var c=n[a][o[a]];c===b?(d(a+1),d(a+1)):--l[c],++o[a]}var e,f,g,h,i,j=new(x?Uint16Array:Array)(c),k=new(x?Uint8Array:Array)(c),l=new(x?Uint8Array:Array)(b),m=Array(c),n=Array(c),o=Array(c),p=(1<<c)-b,q=1<<c-1;for(j[c-1]=b,f=0;f<c;++f)p<q?k[f]=0:(k[f]=1,p-=q),p<<=1,j[c-2-f]=(j[c-1-f]/2|0)+b;for(j[0]=k[0],m[0]=Array(j[0]),n[0]=Array(j[0]),f=1;f<c;++f)j[f]>2*j[f-1]+k[f]&&(j[f]=2*j[f-1]+k[f]),m[f]=Array(j[f]),n[f]=Array(j[f]);for(e=0;e<b;++e)l[e]=c;for(g=0;g<j[c-1];++g)m[c-1][g]=a[g],n[c-1][g]=g;for(e=0;e<c;++e)o[e]=0;for(1===k[c-1]&&(--l[0],++o[c-1]),f=c-2;0<=f;--f){for(h=e=0,i=o[f+1],g=0;g<j[f];g++)h=m[f+1][i]+m[f+1][i+1],h>a[e]?(m[f][g]=h,n[f][g]=b,i+=2):(m[f][g]=a[e],n[f][g]=e,++e);o[f]=0,1===k[f]&&d(f)}return l}function l(a){var b,c,d,e,f=new(x?Uint16Array:Array)(a.length),g=[],h=[],i=0;for(b=0,c=a.length;b<c;b++)g[a[b]]=(0|g[a[b]])+1;for(b=1,c=16;b<=c;b++)h[b]=i,i+=0|g[b],i<<=1;for(b=0,c=a.length;b<c;b++)for(i=h[a[b]],h[a[b]]+=1,d=f[b]=0,e=a[b];d<e;d++)f[b]=f[b]<<1|1&i,i>>>=1;return f}function m(b,c){switch(this.l=[],this.m=32768,this.e=this.g=this.c=this.q=0,this.input=x?new Uint8Array(b):b,this.s=!1,this.n=L,this.C=!1,!c&&(c={})||(c.index&&(this.c=c.index),c.bufferSize&&(this.m=c.bufferSize),c.bufferType&&(this.n=c.bufferType),c.resize&&(this.C=c.resize)),this.n){case K:this.b=32768,this.a=new(x?Uint8Array:Array)(32768+this.m+258);break;case L:this.b=0,this.a=new(x?Uint8Array:Array)(this.m),this.f=this.K,this.t=this.I,this.o=this.J;break;default:a(Error("invalid inflate mode"))}}function n(b,c){for(var d,e=b.g,f=b.e,g=b.input,h=b.c,i=g.length;f<c;)h>=i&&a(Error("input buffer is broken")),e|=g[h++]<<f,f+=8;return d=e&(1<<c)-1,b.g=e>>>c,b.e=f-c,b.c=h,d}function o(a,b){for(var c,d,e=a.g,f=a.e,g=a.input,h=a.c,i=g.length,j=b[0],k=b[1];f<k&&!(h>=i);)e|=g[h++]<<f,f+=8;return c=j[e&(1<<k)-1],d=c>>>16,a.g=e>>d,a.e=f-d,a.c=h,65535&c}function p(a){function b(a,b,c){var d,e,f,g=this.z;for(f=0;f<a;)switch(d=o(this,b)){case 16:for(e=3+n(this,2);e--;)c[f++]=g;break;case 17:for(e=3+n(this,3);e--;)c[f++]=0;g=0;break;case 18:for(e=11+n(this,7);e--;)c[f++]=0;g=0;break;default:g=c[f++]=d}return this.z=g,c}var c,d,f,g,h=n(a,5)+257,i=n(a,5)+1,j=n(a,4)+4,k=new(x?Uint8Array:Array)(Q.length);for(g=0;g<j;++g)k[Q[g]]=n(a,3);if(!x)for(g=j,j=k.length;g<j;++g)k[Q[g]]=0;c=e(k),d=new(x?Uint8Array:Array)(h),f=new(x?Uint8Array:Array)(i),a.z=0,a.o(e(b.call(a,h,c,d)),e(b.call(a,i,c,f)))}function q(a){if("string"==typeof a){var b,c,d=a.split("");for(b=0,c=d.length;b<c;b++)d[b]=(255&d[b].charCodeAt(0))>>>0;a=d}for(var e,f=1,g=0,h=a.length,i=0;0<h;){e=1024<h?1024:h,h-=e;do f+=a[i++],g+=f;while(--e);f%=65521,g%=65521}return(g<<16|f)>>>0}function r(b,c){var d,e;switch(this.input=b,this.c=0,!c&&(c={})||(c.index&&(this.c=c.index),c.verify&&(this.N=c.verify)),d=b[this.c++],e=b[this.c++],15&d){case da:this.method=da;break;default:a(Error("unsupported compression method"))}0!==((d<<8)+e)%31&&a(Error("invalid fcheck flag:"+((d<<8)+e)%31)),32&e&&a(Error("fdict flag is not supported")),this.B=new m(b,{index:this.c,bufferSize:c.bufferSize,bufferType:c.bufferType,resize:c.resize})}function s(a,b){this.input=a,this.a=new(x?Uint8Array:Array)(32768),this.h=ea.k;var c,d={};!b&&(b={})||"number"!=typeof b.compressionType||(this.h=b.compressionType);for(c in b)d[c]=b[c];d.outputBuffer=this.a,this.A=new f(this.input,d)}function t(a,c){var d,e,f,g;if(Object.keys)d=Object.keys(c);else for(e in d=[],f=0,c)d[f++]=e;for(f=0,g=d.length;f<g;++f)e=d[f],b(a+"."+e,c[e])}var u=void 0,v=!0,w=this,x="undefined"!=typeof Uint8Array&&"undefined"!=typeof Uint16Array&&"undefined"!=typeof Uint32Array&&"undefined"!=typeof DataView;c.prototype.f=function(){var a,b=this.buffer,c=b.length,d=new(x?Uint8Array:Array)(c<<1);if(x)d.set(b);else for(a=0;a<c;++a)d[a]=b[a];return this.buffer=d},c.prototype.d=function(a,b,c){var d,e=this.buffer,f=this.index,g=this.i,h=e[f];if(c&&1<b&&(a=8<b?(D[255&a]<<24|D[a>>>8&255]<<16|D[a>>>16&255]<<8|D[a>>>24&255])>>32-b:D[a]>>8-b),8>b+g)h=h<<b|a,g+=b;else for(d=0;d<b;++d)h=h<<1|a>>b-d-1&1,8===++g&&(g=0,e[f++]=D[h],h=0,f===e.length&&(e=this.f()));e[f]=h,this.buffer=e,this.i=g,this.index=f},c.prototype.finish=function(){var a,b=this.buffer,c=this.index;return 0<this.i&&(b[c]<<=8-this.i,b[c]=D[b[c]],c++),x?a=b.subarray(0,c):(b.length=c,a=b),a};var y,z=new(x?Uint8Array:Array)(256);for(y=0;256>y;++y){for(var A=y,B=A,C=7,A=A>>>1;A;A>>>=1)B<<=1,B|=1&A,--C;z[y]=(B<<C&255)>>>0}var D=z;d.prototype.getParent=function(a){return 2*((a-2)/4|0)},d.prototype.push=function(a,b){var c,d,e,f=this.buffer;for(c=this.length,f[this.length++]=b,f[this.length++]=a;0<c&&(d=this.getParent(c),f[c]>f[d]);)e=f[c],f[c]=f[d],f[d]=e,e=f[c+1],f[c+1]=f[d+1],f[d+1]=e,c=d;return this.length},d.prototype.pop=function(){var a,b,c,d,e,f=this.buffer;for(b=f[0],a=f[1],this.length-=2,f[0]=f[this.length],f[1]=f[this.length+1],e=0;(d=2*e+2,!(d>=this.length))&&(d+2<this.length&&f[d+2]>f[d]&&(d+=2),f[d]>f[e]);)c=f[e],f[e]=f[d],f[d]=c,c=f[e+1],f[e+1]=f[d+1],f[d+1]=c,e=d;return{index:a,value:b,length:this.length}};var E,F=2,G={NONE:0,r:1,k:F,O:3},H=[];for(E=0;288>E;E++)switch(v){case 143>=E:H.push([E+48,8]);break;case 255>=E:H.push([E-144+400,9]);break;case 279>=E:H.push([E-256+0,7]);break;case 287>=E:H.push([E-280+192,8]);break;default:a("invalid literal: "+E)}f.prototype.j=function(){var b,d,e,f,g=this.input;switch(this.h){case 0:for(e=0,f=g.length;e<f;){d=x?g.subarray(e,e+65535):g.slice(e,e+65535),e+=d.length;var i=d,k=e===f,m=u,n=u,o=u,p=u,q=u,r=this.a,s=this.b;if(x){for(r=new Uint8Array(this.a.buffer);r.length<=s+i.length+5;)r=new Uint8Array(r.length<<1);r.set(this.a)}if(m=k?1:0,r[s++]=0|m,n=i.length,o=~n+65536&65535,r[s++]=255&n,r[s++]=n>>>8&255,r[s++]=255&o,r[s++]=o>>>8&255,x)r.set(i,s),s+=i.length,r=r.subarray(0,s);else{for(p=0,q=i.length;p<q;++p)r[s++]=i[p];r.length=s}this.b=s,this.a=r}break;case 1:var t=new c(x?new Uint8Array(this.a.buffer):this.a,this.b);t.d(1,1,v),t.d(1,2,v);var w,y,z,A=h(this,g);for(w=0,y=A.length;w<y;w++)if(z=A[w],c.prototype.d.apply(t,H[z]),256<z)t.d(A[++w],A[++w],v),t.d(A[++w],5),t.d(A[++w],A[++w],v);else if(256===z)break;this.a=t.finish(),this.b=this.a.length;break;case F:var B,C,D,E,G,I,J,K,L,M,N,O,P,Q,R,S=new c(x?new Uint8Array(this.a.buffer):this.a,this.b),T=[16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15],U=Array(19);for(B=F,S.d(1,1,v),S.d(B,2,v),C=h(this,g),I=j(this.M,15),J=l(I),K=j(this.L,7),L=l(K),D=286;257<D&&0===I[D-1];D--);for(E=30;1<E&&0===K[E-1];E--);var V,W,X,Y,Z,$,_=D,aa=E,ba=new(x?Uint32Array:Array)(_+aa),ca=new(x?Uint32Array:Array)(316),da=new(x?Uint8Array:Array)(19);for(V=W=0;V<_;V++)ba[W++]=I[V];for(V=0;V<aa;V++)ba[W++]=K[V];if(!x)for(V=0,Y=da.length;V<Y;++V)da[V]=0;for(V=Z=0,Y=ba.length;V<Y;V+=W){for(W=1;V+W<Y&&ba[V+W]===ba[V];++W);if(X=W,0===ba[V])if(3>X)for(;0<X--;)ca[Z++]=0,da[0]++;else for(;0<X;)$=138>X?X:138,$>X-3&&$<X&&($=X-3),10>=$?(ca[Z++]=17,ca[Z++]=$-3,da[17]++):(ca[Z++]=18,ca[Z++]=$-11,da[18]++),X-=$;else if(ca[Z++]=ba[V],da[ba[V]]++,X--,3>X)for(;0<X--;)ca[Z++]=ba[V],da[ba[V]]++;else for(;0<X;)$=6>X?X:6,$>X-3&&$<X&&($=X-3),ca[Z++]=16,ca[Z++]=$-3,da[16]++,X-=$}for(b=x?ca.subarray(0,Z):ca.slice(0,Z),M=j(da,7),Q=0;19>Q;Q++)U[Q]=M[T[Q]];for(G=19;4<G&&0===U[G-1];G--);for(N=l(M),S.d(D-257,5,v),S.d(E-1,5,v),S.d(G-4,4,v),Q=0;Q<G;Q++)S.d(U[Q],3,v);for(Q=0,R=b.length;Q<R;Q++)if(O=b[Q],S.d(N[O],M[O],v),16<=O){switch(Q++,O){case 16:P=2;break;case 17:P=3;break;case 18:P=7;break;default:a("invalid code: "+O)}S.d(b[Q],P,v)}var ea,fa,ga,ha,ia,ja,ka,la,ma=[J,I],na=[L,K];for(ia=ma[0],ja=ma[1],ka=na[0],la=na[1],ea=0,fa=C.length;ea<fa;++ea)if(ga=C[ea],S.d(ia[ga],ja[ga],v),256<ga)S.d(C[++ea],C[++ea],v),ha=C[++ea],S.d(ka[ha],la[ha],v),S.d(C[++ea],C[++ea],v);else if(256===ga)break;this.a=S.finish(),this.b=this.a.length;break;default:a("invalid compression type")}return this.a};var I=function(){function b(b){switch(v){case 3===b:return[257,b-3,0];case 4===b:return[258,b-4,0];case 5===b:return[259,b-5,0];case 6===b:return[260,b-6,0];case 7===b:return[261,b-7,0];case 8===b:return[262,b-8,0];case 9===b:return[263,b-9,0];case 10===b:return[264,b-10,0];case 12>=b:return[265,b-11,1];case 14>=b:return[266,b-13,1];case 16>=b:return[267,b-15,1];case 18>=b:return[268,b-17,1];case 22>=b:return[269,b-19,2];case 26>=b:return[270,b-23,2];case 30>=b:return[271,b-27,2];case 34>=b:return[272,b-31,2];case 42>=b:return[273,b-35,3];case 50>=b:return[274,b-43,3];case 58>=b:return[275,b-51,3];case 66>=b:return[276,b-59,3];case 82>=b:return[277,b-67,4];case 98>=b:return[278,b-83,4];case 114>=b:return[279,b-99,4];case 130>=b:return[280,b-115,4];case 162>=b:return[281,b-131,5];case 194>=b:return[282,b-163,5];case 226>=b:return[283,b-195,5];case 257>=b:return[284,b-227,5];case 258===b:return[285,b-258,0];default:a("invalid length: "+b)}}var c,d,e=[];for(c=3;258>=c;c++)d=b(c),e[c]=d[2]<<24|d[1]<<16|d[0];return e}(),J=x?new Uint32Array(I):I,K=0,L=1,M={F:K,D:L};m.prototype.p=function(){for(;!this.s;){var b=n(this,3);switch(1&b&&(this.s=v),b>>>=1){case 0:var c=this.input,d=this.c,e=this.a,f=this.b,g=c.length,h=u,i=u,j=e.length,k=u;switch(this.e=this.g=0,d+1>=g&&a(Error("invalid uncompressed block header: LEN")),h=c[d++]|c[d++]<<8,d+1>=g&&a(Error("invalid uncompressed block header: NLEN")),i=c[d++]|c[d++]<<8,h===~i&&a(Error("invalid uncompressed block header: length verify")),d+h>c.length&&a(Error("input buffer is broken")),this.n){case K:for(;f+h>e.length;){if(k=j-f,h-=k,x)e.set(c.subarray(d,d+k),f),f+=k,d+=k;else for(;k--;)e[f++]=c[d++];this.b=f,e=this.f(),f=this.b}break;case L:for(;f+h>e.length;)e=this.f({v:2});break;default:a(Error("invalid inflate mode"))}if(x)e.set(c.subarray(d,d+h),f),f+=h,d+=h;else for(;h--;)e[f++]=c[d++];this.c=d,this.b=f,this.a=e;break;case 1:this.o(aa,ca);break;case 2:p(this);break;default:a(Error("unknown BTYPE: "+b))}}return this.t()};var N,O,P=[16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15],Q=x?new Uint16Array(P):P,R=[3,4,5,6,7,8,9,10,11,13,15,17,19,23,27,31,35,43,51,59,67,83,99,115,131,163,195,227,258,258,258],S=x?new Uint16Array(R):R,T=[0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0,0,0],U=x?new Uint8Array(T):T,V=[1,2,3,4,5,7,9,13,17,25,33,49,65,97,129,193,257,385,513,769,1025,1537,2049,3073,4097,6145,8193,12289,16385,24577],W=x?new Uint16Array(V):V,X=[0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13],Y=x?new Uint8Array(X):X,Z=new(x?Uint8Array:Array)(288);for(N=0,O=Z.length;N<O;++N)Z[N]=143>=N?8:255>=N?9:279>=N?7:8;var $,_,aa=e(Z),ba=new(x?Uint8Array:Array)(30);for($=0,_=ba.length;$<_;++$)ba[$]=5;var ca=e(ba);m.prototype.o=function(a,b){var c=this.a,d=this.b;this.u=a;for(var e,f,g,h,i=c.length-258;256!==(e=o(this,a));)if(256>e)d>=i&&(this.b=d,c=this.f(),d=this.b),c[d++]=e;else for(f=e-257,h=S[f],0<U[f]&&(h+=n(this,U[f])),e=o(this,b),g=W[e],0<Y[e]&&(g+=n(this,Y[e])),d>=i&&(this.b=d,c=this.f(),d=this.b);h--;)c[d]=c[d++-g];for(;8<=this.e;)this.e-=8,this.c--;this.b=d},m.prototype.J=function(a,b){var c=this.a,d=this.b;this.u=a;for(var e,f,g,h,i=c.length;256!==(e=o(this,a));)if(256>e)d>=i&&(c=this.f(),i=c.length),c[d++]=e;else for(f=e-257,h=S[f],0<U[f]&&(h+=n(this,U[f])),e=o(this,b),g=W[e],0<Y[e]&&(g+=n(this,Y[e])),d+h>i&&(c=this.f(),i=c.length);h--;)c[d]=c[d++-g];for(;8<=this.e;)this.e-=8,this.c--;this.b=d},m.prototype.f=function(){var a,b,c=new(x?Uint8Array:Array)(this.b-32768),d=this.b-32768,e=this.a;if(x)c.set(e.subarray(32768,c.length));else for(a=0,b=c.length;a<b;++a)c[a]=e[a+32768];if(this.l.push(c),this.q+=c.length,x)e.set(e.subarray(d,d+32768));else for(a=0;32768>a;++a)e[a]=e[d+a];return this.b=32768,e},m.prototype.K=function(a){var b,c,d,e,f=this.input.length/this.c+1|0,g=this.input,h=this.a;return a&&("number"==typeof a.v&&(f=a.v),"number"==typeof a.G&&(f+=a.G)),2>f?(c=(g.length-this.c)/this.u[2],e=258*(c/2)|0,d=e<h.length?h.length+e:h.length<<1):d=h.length*f,x?(b=new Uint8Array(d),b.set(h)):b=h,this.a=b},m.prototype.t=function(){var a,b,c,d,e,f=0,g=this.a,h=this.l,i=new(x?Uint8Array:Array)(this.q+(this.b-32768));if(0===h.length)return x?this.a.subarray(32768,this.b):this.a.slice(32768,this.b);for(b=0,c=h.length;b<c;++b)for(a=h[b],d=0,e=a.length;d<e;++d)i[f++]=a[d];for(b=32768,c=this.b;b<c;++b)i[f++]=g[b];return this.l=[],this.buffer=i},m.prototype.I=function(){var a,b=this.b;return x?this.C?(a=new Uint8Array(b),a.set(this.a.subarray(0,b))):a=this.a.subarray(0,b):(this.a.length>b&&(this.a.length=b),a=this.a),this.buffer=a},r.prototype.p=function(){var b,c,d=this.input;return b=this.B.p(),this.c=this.B.c,this.N&&(c=(d[this.c++]<<24|d[this.c++]<<16|d[this.c++]<<8|d[this.c++])>>>0,c!==q(b)&&a(Error("invalid adler-32 checksum"))),b};var da=8,ea=G;s.prototype.j=function(){var b,c,d,e,f,g,h,i=0;switch(h=this.a,b=da){case da:c=Math.LOG2E*Math.log(32768)-8;break;default:a(Error("invalid compression method"))}switch(d=c<<4|b,h[i++]=d,b){case da:switch(this.h){case ea.NONE:f=0;break;case ea.r:f=1;break;case ea.k:f=2;break;default:a(Error("unsupported compression type"))}break;default:a(Error("invalid compression method"))}return e=f<<6|0,h[i++]=e|31-(256*d+e)%31,g=q(this.input),this.A.b=i,h=this.A.j(),i=h.length,x&&(h=new Uint8Array(h.buffer),h.length<=i+4&&(this.a=new Uint8Array(h.length+4),this.a.set(h),h=this.a),h=h.subarray(0,i+4)),h[i++]=g>>24&255,h[i++]=g>>16&255,h[i++]=g>>8&255,h[i++]=255&g,h},b("Zlib.Inflate",r),b("Zlib.Inflate.prototype.decompress",r.prototype.p),t("Zlib.Inflate.BufferType",{ADAPTIVE:M.D,BLOCK:M.F}),b("Zlib.Deflate",s),b("Zlib.Deflate.compress",function(a,b){return new s(a,b).j()}),b("Zlib.Deflate.prototype.compress",s.prototype.j),t("Zlib.Deflate.CompressionType",{NONE:ea.NONE,FIXED:ea.r,DYNAMIC:ea.k})}).call(this)},{}],9:[function(a,b,c){"use strict";function d(a){return a&&a.__esModule?a:{"default":a}}Object.defineProperty(c,"__esModule",{value:!0});var e=a("../enums.js"),f=d(e);c["default"]={prefer_hash_algorithm:f["default"].hash.sha256,encryption_cipher:f["default"].symmetric.aes256,compression:f["default"].compression.zip,aead_protect:!1,integrity_protect:!0,ignore_mdc_error:!1,rsa_blinding:!0,use_native:!0,zero_copy:!1,debug:!1,show_version:!0,show_comment:!0,versionstring:"OpenPGP.js v2.3.3",commentstring:"http://openpgpjs.org",keyserver:"https://keyserver.ubuntu.com",node_store:"./openpgp.store"}},{"../enums.js":35}],10:[function(a,b,c){"use strict";function d(a){return a&&a.__esModule?a:{"default":a}}Object.defineProperty(c,"__esModule",{value:!0});var e=a("./config.js");Object.defineProperty(c,"default",{enumerable:!0,get:function(){return d(e)["default"]}})},{"./config.js":9}],11:[function(a,b,c){"use strict";function d(a){return a&&a.__esModule?a:{"default":a}}Object.defineProperty(c,"__esModule",{value:!0});var e=a("./cipher"),f=d(e);c["default"]={encrypt:function(a,b,c,d,e){b=new f["default"][b](d);var g=b.blockSize,h=new Uint8Array(g),i=new Uint8Array(g),j=new Uint8Array(a.length+2);j.set(a),j[a.length]=a[g-2],j[a.length+1]=a[g-1],a=j;var k,l,m,n=new Uint8Array(c.length+2+2*g),o=e?0:2;for(k=0;k<g;k++)h[k]=0;for(i=b.encrypt(h),k=0;k<g;k++)n[k]=i[k]^a[k];for(h.set(n.subarray(0,g)),i=b.encrypt(h),n[g]=i[0]^a[g],n[g+1]=i[1]^a[g+1],e?h.set(n.subarray(2,g+2)):h.set(n.subarray(0,g)),i=b.encrypt(h),k=0;k<g;k++)n[g+2+k]=i[k+o]^c[k];for(l=g;l<c.length+o;l+=g)for(m=l+2-o,h.set(n.subarray(m,m+g)),i=b.encrypt(h),k=0;k<g;k++)n[g+m+k]=i[k]^c[l+k-o];return n=n.subarray(0,c.length+2+g)},mdc:function(a,b,c){a=new f["default"][a](b);var d,e=a.blockSize,g=new Uint8Array(e),h=new Uint8Array(e);for(d=0;d<e;d++)g[d]=0;for(g=a.encrypt(g),d=0;d<e;d++)h[d]=c[d],g[d]^=h[d];h=a.encrypt(h);var i=new Uint8Array(g.length+2);return i.set(g),i[g.length]=h[0]^c[e],i[g.length+1]=h[1]^c[e+1],i},decrypt:function(a,b,c,d){a=new f["default"][a](b);var e,g,h,i=a.blockSize,j=new Uint8Array(i),k=new Uint8Array(i),l=new Uint8Array(c.length-i);for(e=0;e<i;e++)j[e]=0;for(j=a.encrypt(j),e=0;e<i;e++)k[e]=c[e],j[e]^=k[e];if(k=a.encrypt(k),j[i-2]!==(k[0]^c[i])||j[i-1]!==(k[1]^c[i+1]))throw new Error("CFB decrypt: invalid key");if(g=0,d){for(e=0;e<i;e++)j[e]=c[e+2];for(h=i+2;h<c.length;h+=i)for(k=a.encrypt(j),e=0;e<i&&e+h<c.length;e++)j[e]=c[h+e],g<l.length&&(l[g]=k[e]^j[e],g++)}else{for(e=0;e<i;e++)j[e]=c[e];for(h=i;h<c.length;h+=i)for(k=a.encrypt(j),e=0;e<i&&e+h<c.length;e++)j[e]=c[h+e],g<l.length&&(l[g]=k[e]^j[e],g++)}return h=d?0:2,l=l.subarray(h,c.length-i-2+h)},normalEncrypt:function(a,b,c,d){a=new f["default"][a](b);var e,g=a.blockSize,h=new Uint8Array(g),i=new Uint8Array(g),j=0,k=new Uint8Array(c.length),l=0;if(null===d)for(e=0;e<g;e++)i[e]=0;else for(e=0;e<g;e++)i[e]=d[e];for(;c.length>g*j;){var m=a.encrypt(i);for(h=c.subarray(j*g,j*g+g),e=0;e<h.length;e++)i[e]=h[e]^m[e],k[l++]=i[e];j++}return k},normalDecrypt:function(a,b,c,d){a=new f["default"][a](b);var e,g,h=a.blockSize,i=0,j=new Uint8Array(c.length),k=0,l=0;if(null===d)for(e=new Uint8Array(h),g=0;g<h;g++)e[g]=0;else e=d.subarray(0,h);for(;c.length>h*i;){var m=a.encrypt(e);for(e=c.subarray(i*h+k,i*h+h+k),g=0;g<e.length;g++)j[l++]=e[g]^m[g];i++}return j}}},{"./cipher":16}],12:[function(a,b,c){"use strict";function d(a){return 255&a}function e(a){return a>>8&255}function f(a){return a>>16&255}function g(a){return a>>24&255}function h(a,b,c,d){return e(p[255&a])|e(p[b>>8&255])<<8|e(p[c>>16&255])<<16|e(p[d>>>24])<<24}function i(a){var b,c,d=a.length,e=new Array(d/4);if(a&&!(d%4)){for(b=0,c=0;c<d;c+=4)e[b++]=a[c]|a[c+1]<<8|a[c+2]<<16|a[c+3]<<24;return e}}function j(a){var b,c=0,h=a.length,i=new Array(4*h);for(b=0;b<h;b++)i[c++]=d(a[b]),i[c++]=e(a[b]),i[c++]=f(a[b]),i[c++]=g(a[b]);return i}function k(a){var b,c,h,i,j,k,l=new Array(u+1),m=a.length,p=new Array(t),q=new Array(t),r=0;if(16===m)k=10,b=4;else if(24===m)k=12,b=6;else{if(32!==m)throw new Error("Invalid key-length for AES key:"+m);k=14,b=8}for(c=0;c<u+1;c++)l[c]=new Uint32Array(4);for(c=0,h=0;h<m;h++,c+=4)p[h]=a[c]|a[c+1]<<8|a[c+2]<<16|a[c+3]<<24;for(h=b-1;h>=0;h--)q[h]=p[h];for(i=0,j=0,h=0;h<b&&i<k+1;){for(;h<b&&j<4;h++,j++)l[i][j]=q[h];4===j&&(i++,j=0)}for(;i<k+1;){var s=q[b-1];if(q[0]^=o[e(s)]|o[f(s)]<<8|o[g(s)]<<16|o[d(s)]<<24,q[0]^=n[r++],8!==b)for(h=1;h<b;h++)q[h]^=q[h-1];else{for(h=1;h<b/2;h++)q[h]^=q[h-1];for(s=q[b/2-1],q[b/2]^=o[d(s)]|o[e(s)]<<8|o[f(s)]<<16|o[g(s)]<<24,h=b/2+1;h<b;h++)q[h]^=q[h-1]}for(h=0;h<b&&i<k+1;){for(;h<b&&j<4;h++,j++)l[i][j]=q[h];4===j&&(i++,j=0)}}return{rounds:k,rk:l}}function l(a,b,c){var d,e,f;for(f=i(a),e=b.rounds,d=0;d<e-1;d++)c[0]=f[0]^b.rk[d][0],c[1]=f[1]^b.rk[d][1],c[2]=f[2]^b.rk[d][2],c[3]=f[3]^b.rk[d][3],f[0]=p[255&c[0]]^q[c[1]>>8&255]^r[c[2]>>16&255]^s[c[3]>>>24],f[1]=p[255&c[1]]^q[c[2]>>8&255]^r[c[3]>>16&255]^s[c[0]>>>24],f[2]=p[255&c[2]]^q[c[3]>>8&255]^r[c[0]>>16&255]^s[c[1]>>>24],f[3]=p[255&c[3]]^q[c[0]>>8&255]^r[c[1]>>16&255]^s[c[2]>>>24];return d=e-1,c[0]=f[0]^b.rk[d][0],c[1]=f[1]^b.rk[d][1],c[2]=f[2]^b.rk[d][2],c[3]=f[3]^b.rk[d][3],f[0]=h(c[0],c[1],c[2],c[3])^b.rk[e][0],f[1]=h(c[1],c[2],c[3],c[0])^b.rk[e][1],f[2]=h(c[2],c[3],c[0],c[1])^b.rk[e][2],f[3]=h(c[3],c[0],c[1],c[2])^b.rk[e][3],j(f)}function m(a){var b=function(a){this.key=k(a),this._temp=new Uint32Array(this.blockSize/4),this.encrypt=function(a){return l(a,this.key,this._temp)}};return b.blockSize=b.prototype.blockSize=16,b.keySize=b.prototype.keySize=a/8,b}Object.defineProperty(c,"__esModule",{value:!0});var n=new Uint8Array([1,2,4,8,16,32,64,128,27,54,108,216,171,77,154,47,94,188,99,198,151,53,106,212,179,125,250,239,197,145]),o=new Uint8Array([99,124,119,123,242,107,111,197,48,1,103,43,254,215,171,118,202,130,201,125,250,89,71,240,173,212,162,175,156,164,114,192,183,253,147,38,54,63,247,204,52,165,229,241,113,216,49,21,4,199,35,195,24,150,5,154,7,18,128,226,235,39,178,117,9,131,44,26,27,110,90,160,82,59,214,179,41,227,47,132,83,209,0,237,32,252,177,91,106,203,190,57,74,76,88,207,208,239,170,251,67,77,51,133,69,249,2,127,80,60,159,168,81,163,64,143,146,157,56,245,188,182,218,33,16,255,243,210,205,12,19,236,95,151,68,23,196,167,126,61,100,93,25,115,96,129,79,220,34,42,144,136,70,238,184,20,222,94,11,219,224,50,58,10,73,6,36,92,194,211,172,98,145,149,228,121,231,200,55,109,141,213,78,169,108,86,244,234,101,122,174,8,186,120,37,46,28,166,180,198,232,221,116,31,75,189,139,138,112,62,181,102,72,3,246,14,97,53,87,185,134,193,29,158,225,248,152,17,105,217,142,148,155,30,135,233,206,85,40,223,140,161,137,13,191,230,66,104,65,153,45,15,176,84,187,22]),p=new Uint32Array([2774754246,2222750968,2574743534,2373680118,234025727,3177933782,2976870366,1422247313,1345335392,50397442,2842126286,2099981142,436141799,1658312629,3870010189,2591454956,1170918031,2642575903,1086966153,2273148410,368769775,3948501426,3376891790,200339707,3970805057,1742001331,4255294047,3937382213,3214711843,4154762323,2524082916,1539358875,3266819957,486407649,2928907069,1780885068,1513502316,1094664062,49805301,1338821763,1546925160,4104496465,887481809,150073849,2473685474,1943591083,1395732834,1058346282,201589768,1388824469,1696801606,1589887901,672667696,2711000631,251987210,3046808111,151455502,907153956,2608889883,1038279391,652995533,1764173646,3451040383,2675275242,453576978,2659418909,1949051992,773462580,756751158,2993581788,3998898868,4221608027,4132590244,1295727478,1641469623,3467883389,2066295122,1055122397,1898917726,2542044179,4115878822,1758581177,0,753790401,1612718144,536673507,3367088505,3982187446,3194645204,1187761037,3653156455,1262041458,3729410708,3561770136,3898103984,1255133061,1808847035,720367557,3853167183,385612781,3309519750,3612167578,1429418854,2491778321,3477423498,284817897,100794884,2172616702,4031795360,1144798328,3131023141,3819481163,4082192802,4272137053,3225436288,2324664069,2912064063,3164445985,1211644016,83228145,3753688163,3249976951,1977277103,1663115586,806359072,452984805,250868733,1842533055,1288555905,336333848,890442534,804056259,3781124030,2727843637,3427026056,957814574,1472513171,4071073621,2189328124,1195195770,2892260552,3881655738,723065138,2507371494,2690670784,2558624025,3511635870,2145180835,1713513028,2116692564,2878378043,2206763019,3393603212,703524551,3552098411,1007948840,2044649127,3797835452,487262998,1994120109,1004593371,1446130276,1312438900,503974420,3679013266,168166924,1814307912,3831258296,1573044895,1859376061,4021070915,2791465668,2828112185,2761266481,937747667,2339994098,854058965,1137232011,1496790894,3077402074,2358086913,1691735473,3528347292,3769215305,3027004632,4199962284,133494003,636152527,2942657994,2390391540,3920539207,403179536,3585784431,2289596656,1864705354,1915629148,605822008,4054230615,3350508659,1371981463,602466507,2094914977,2624877800,555687742,3712699286,3703422305,2257292045,2240449039,2423288032,1111375484,3300242801,2858837708,3628615824,84083462,32962295,302911004,2741068226,1597322602,4183250862,3501832553,2441512471,1489093017,656219450,3114180135,954327513,335083755,3013122091,856756514,3144247762,1893325225,2307821063,2811532339,3063651117,572399164,2458355477,552200649,1238290055,4283782570,2015897680,2061492133,2408352771,4171342169,2156497161,386731290,3669999461,837215959,3326231172,3093850320,3275833730,2962856233,1999449434,286199582,3417354363,4233385128,3602627437,974525996]),q=new Uint32Array([1667483301,2088564868,2004348569,2071721613,4076011277,1802229437,1869602481,3318059348,808476752,16843267,1734856361,724260477,4278118169,3621238114,2880130534,1987505306,3402272581,2189565853,3385428288,2105408135,4210749205,1499050731,1195871945,4042324747,2913812972,3570709351,2728550397,2947499498,2627478463,2762232823,1920132246,3233848155,3082253762,4261273884,2475900334,640044138,909536346,1061125697,4160222466,3435955023,875849820,2779075060,3857043764,4059166984,1903288979,3638078323,825320019,353708607,67373068,3351745874,589514341,3284376926,404238376,2526427041,84216335,2593796021,117902857,303178806,2155879323,3806519101,3958099238,656887401,2998042573,1970662047,151589403,2206408094,741103732,437924910,454768173,1852759218,1515893998,2694863867,1381147894,993752653,3604395873,3014884814,690573947,3823361342,791633521,2223248279,1397991157,3520182632,0,3991781676,538984544,4244431647,2981198280,1532737261,1785386174,3419114822,3200149465,960066123,1246401758,1280088276,1482207464,3486483786,3503340395,4025468202,2863288293,4227591446,1128498885,1296931543,859006549,2240090516,1162185423,4193904912,33686534,2139094657,1347461360,1010595908,2678007226,2829601763,1364304627,2745392638,1077969088,2408514954,2459058093,2644320700,943222856,4126535940,3166462943,3065411521,3671764853,555827811,269492272,4294960410,4092853518,3537026925,3452797260,202119188,320022069,3974939439,1600110305,2543269282,1145342156,387395129,3301217111,2812761586,2122251394,1027439175,1684326572,1566423783,421081643,1936975509,1616953504,2172721560,1330618065,3705447295,572671078,707417214,2425371563,2290617219,1179028682,4008625961,3099093971,336865340,3739133817,1583267042,185275933,3688607094,3772832571,842163286,976909390,168432670,1229558491,101059594,606357612,1549580516,3267534685,3553869166,2896970735,1650640038,2442213800,2509582756,3840201527,2038035083,3890730290,3368586051,926379609,1835915959,2374828428,3587551588,1313774802,2846444e3,1819072692,1448520954,4109693703,3941256997,1701169839,2054878350,2930657257,134746136,3132780501,2021191816,623200879,774790258,471611428,2795919345,3031724999,3334903633,3907570467,3722289532,1953818780,522141217,1263245021,3183305180,2341145990,2324303749,1886445712,1044282434,3048567236,1718013098,1212715224,50529797,4143380225,235805714,1633796771,892693087,1465364217,3115936208,2256934801,3250690392,488454695,2661164985,3789674808,4177062675,2560109491,286335539,1768542907,3654920560,2391672713,2492740519,2610638262,505297954,2273777042,3924412704,3469641545,1431677695,673730680,3755976058,2357986191,2711706104,2307459456,218962455,3216991706,3873888049,1111655622,1751699640,1094812355,2576951728,757946999,252648977,2964356043,1414834428,3149622742,370551866]),r=new Uint32Array([1673962851,2096661628,2012125559,2079755643,4076801522,1809235307,1876865391,3314635973,811618352,16909057,1741597031,727088427,4276558334,3618988759,2874009259,1995217526,3398387146,2183110018,3381215433,2113570685,4209972730,1504897881,1200539975,4042984432,2906778797,3568527316,2724199842,2940594863,2619588508,2756966308,1927583346,3231407040,3077948087,4259388669,2470293139,642542118,913070646,1065238847,4160029431,3431157708,879254580,2773611685,3855693029,4059629809,1910674289,3635114968,828527409,355090197,67636228,3348452039,591815971,3281870531,405809176,2520228246,84545285,2586817946,118360327,304363026,2149292928,3806281186,3956090603,659450151,2994720178,1978310517,152181513,2199756419,743994412,439627290,456535323,1859957358,1521806938,2690382752,1386542674,997608763,3602342358,3011366579,693271337,3822927587,794718511,2215876484,1403450707,3518589137,0,3988860141,541089824,4242743292,2977548465,1538714971,1792327274,3415033547,3194476990,963791673,1251270218,1285084236,1487988824,3481619151,3501943760,4022676207,2857362858,4226619131,1132905795,1301993293,862344499,2232521861,1166724933,4192801017,33818114,2147385727,1352724560,1014514748,2670049951,2823545768,1369633617,2740846243,1082179648,2399505039,2453646738,2636233885,946882616,4126213365,3160661948,3061301686,3668932058,557998881,270544912,4293204735,4093447923,3535760850,3447803085,202904588,321271059,3972214764,1606345055,2536874647,1149815876,388905239,3297990596,2807427751,2130477694,1031423805,1690872932,1572530013,422718233,1944491379,1623236704,2165938305,1335808335,3701702620,574907938,710180394,2419829648,2282455944,1183631942,4006029806,3094074296,338181140,3735517662,1589437022,185998603,3685578459,3772464096,845436466,980700730,169090570,1234361161,101452294,608726052,1555620956,3265224130,3552407251,2890133420,1657054818,2436475025,2503058581,3839047652,2045938553,3889509095,3364570056,929978679,1843050349,2365688973,3585172693,1318900302,2840191145,1826141292,1454176854,4109567988,3939444202,1707781989,2062847610,2923948462,135272456,3127891386,2029029496,625635109,777810478,473441308,2790781350,3027486644,3331805638,3905627112,3718347997,1961401460,524165407,1268178251,3177307325,2332919435,2316273034,1893765232,1048330814,3044132021,1724688998,1217452104,50726147,4143383030,236720654,1640145761,896163637,1471084887,3110719673,2249691526,3248052417,490350365,2653403550,3789109473,4176155640,2553000856,287453969,1775418217,3651760345,2382858638,2486413204,2603464347,507257374,2266337927,3922272489,3464972750,1437269845,676362280,3752164063,2349043596,2707028129,2299101321,219813645,3211123391,3872862694,1115997762,1758509160,1099088705,2569646233,760903469,253628687,2960903088,1420360788,3144537787,371997206]),s=new Uint32Array([3332727651,4169432188,4003034999,4136467323,4279104242,3602738027,3736170351,2438251973,1615867952,33751297,3467208551,1451043627,3877240574,3043153879,1306962859,3969545846,2403715786,530416258,2302724553,4203183485,4011195130,3001768281,2395555655,4211863792,1106029997,3009926356,1610457762,1173008303,599760028,1408738468,3835064946,2606481600,1975695287,3776773629,1034851219,1282024998,1817851446,2118205247,4110612471,2203045068,1750873140,1374987685,3509904869,4178113009,3801313649,2876496088,1649619249,708777237,135005188,2505230279,1181033251,2640233411,807933976,933336726,168756485,800430746,235472647,607523346,463175808,3745374946,3441880043,1315514151,2144187058,3936318837,303761673,496927619,1484008492,875436570,908925723,3702681198,3035519578,1543217312,2767606354,1984772923,3076642518,2110698419,1383803177,3711886307,1584475951,328696964,2801095507,3110654417,0,3240947181,1080041504,3810524412,2043195825,3069008731,3569248874,2370227147,1742323390,1917532473,2497595978,2564049996,2968016984,2236272591,3144405200,3307925487,1340451498,3977706491,2261074755,2597801293,1716859699,294946181,2328839493,3910203897,67502594,4269899647,2700103760,2017737788,632987551,1273211048,2733855057,1576969123,2160083008,92966799,1068339858,566009245,1883781176,4043634165,1675607228,2009183926,2943736538,1113792801,540020752,3843751935,4245615603,3211645650,2169294285,403966988,641012499,3274697964,3202441055,899848087,2295088196,775493399,2472002756,1441965991,4236410494,2051489085,3366741092,3135724893,841685273,3868554099,3231735904,429425025,2664517455,2743065820,1147544098,1417554474,1001099408,193169544,2362066502,3341414126,1809037496,675025940,2809781982,3168951902,371002123,2910247899,3678134496,1683370546,1951283770,337512970,2463844681,201983494,1215046692,3101973596,2673722050,3178157011,1139780780,3299238498,967348625,832869781,3543655652,4069226873,3576883175,2336475336,1851340599,3669454189,25988493,2976175573,2631028302,1239460265,3635702892,2902087254,4077384948,3475368682,3400492389,4102978170,1206496942,270010376,1876277946,4035475576,1248797989,1550986798,941890588,1475454630,1942467764,2538718918,3408128232,2709315037,3902567540,1042358047,2531085131,1641856445,226921355,260409994,3767562352,2084716094,1908716981,3433719398,2430093384,100991747,4144101110,470945294,3265487201,1784624437,2935576407,1775286713,395413126,2572730817,975641885,666476190,3644383713,3943954680,733190296,573772049,3535497577,2842745305,126455438,866620564,766942107,1008868894,361924487,3374377449,2269761230,2868860245,1350051880,2776293343,59739276,1509466529,159418761,437718285,1708834751,3610371814,2227585602,3501746280,2193834305,699439513,1517759789,504434447,2076946608,2835108948,1842789307,742004246]),t=8,u=14;
c["default"]={128:m(128),192:m(192),256:m(256)}},{}],13:[function(a,b,c){"use strict";function d(){}function e(a){this.bf=new d,this.bf.init(a),this.encrypt=function(a){return this.bf.encrypt_block(a)}}Object.defineProperty(c,"__esModule",{value:!0}),c["default"]=e,d.prototype.BLOCKSIZE=8,d.prototype.SBOXES=[[3509652390,2564797868,805139163,3491422135,3101798381,1780907670,3128725573,4046225305,614570311,3012652279,134345442,2240740374,1667834072,1901547113,2757295779,4103290238,227898511,1921955416,1904987480,2182433518,2069144605,3260701109,2620446009,720527379,3318853667,677414384,3393288472,3101374703,2390351024,1614419982,1822297739,2954791486,3608508353,3174124327,2024746970,1432378464,3864339955,2857741204,1464375394,1676153920,1439316330,715854006,3033291828,289532110,2706671279,2087905683,3018724369,1668267050,732546397,1947742710,3462151702,2609353502,2950085171,1814351708,2050118529,680887927,999245976,1800124847,3300911131,1713906067,1641548236,4213287313,1216130144,1575780402,4018429277,3917837745,3693486850,3949271944,596196993,3549867205,258830323,2213823033,772490370,2760122372,1774776394,2652871518,566650946,4142492826,1728879713,2882767088,1783734482,3629395816,2517608232,2874225571,1861159788,326777828,3124490320,2130389656,2716951837,967770486,1724537150,2185432712,2364442137,1164943284,2105845187,998989502,3765401048,2244026483,1075463327,1455516326,1322494562,910128902,469688178,1117454909,936433444,3490320968,3675253459,1240580251,122909385,2157517691,634681816,4142456567,3825094682,3061402683,2540495037,79693498,3249098678,1084186820,1583128258,426386531,1761308591,1047286709,322548459,995290223,1845252383,2603652396,3431023940,2942221577,3202600964,3727903485,1712269319,422464435,3234572375,1170764815,3523960633,3117677531,1434042557,442511882,3600875718,1076654713,1738483198,4213154764,2393238008,3677496056,1014306527,4251020053,793779912,2902807211,842905082,4246964064,1395751752,1040244610,2656851899,3396308128,445077038,3742853595,3577915638,679411651,2892444358,2354009459,1767581616,3150600392,3791627101,3102740896,284835224,4246832056,1258075500,768725851,2589189241,3069724005,3532540348,1274779536,3789419226,2764799539,1660621633,3471099624,4011903706,913787905,3497959166,737222580,2514213453,2928710040,3937242737,1804850592,3499020752,2949064160,2386320175,2390070455,2415321851,4061277028,2290661394,2416832540,1336762016,1754252060,3520065937,3014181293,791618072,3188594551,3933548030,2332172193,3852520463,3043980520,413987798,3465142937,3030929376,4245938359,2093235073,3534596313,375366246,2157278981,2479649556,555357303,3870105701,2008414854,3344188149,4221384143,3956125452,2067696032,3594591187,2921233993,2428461,544322398,577241275,1471733935,610547355,4027169054,1432588573,1507829418,2025931657,3646575487,545086370,48609733,2200306550,1653985193,298326376,1316178497,3007786442,2064951626,458293330,2589141269,3591329599,3164325604,727753846,2179363840,146436021,1461446943,4069977195,705550613,3059967265,3887724982,4281599278,3313849956,1404054877,2845806497,146425753,1854211946],[1266315497,3048417604,3681880366,3289982499,290971e4,1235738493,2632868024,2414719590,3970600049,1771706367,1449415276,3266420449,422970021,1963543593,2690192192,3826793022,1062508698,1531092325,1804592342,2583117782,2714934279,4024971509,1294809318,4028980673,1289560198,2221992742,1669523910,35572830,157838143,1052438473,1016535060,1802137761,1753167236,1386275462,3080475397,2857371447,1040679964,2145300060,2390574316,1461121720,2956646967,4031777805,4028374788,33600511,2920084762,1018524850,629373528,3691585981,3515945977,2091462646,2486323059,586499841,988145025,935516892,3367335476,2599673255,2839830854,265290510,3972581182,2759138881,3795373465,1005194799,847297441,406762289,1314163512,1332590856,1866599683,4127851711,750260880,613907577,1450815602,3165620655,3734664991,3650291728,3012275730,3704569646,1427272223,778793252,1343938022,2676280711,2052605720,1946737175,3164576444,3914038668,3967478842,3682934266,1661551462,3294938066,4011595847,840292616,3712170807,616741398,312560963,711312465,1351876610,322626781,1910503582,271666773,2175563734,1594956187,70604529,3617834859,1007753275,1495573769,4069517037,2549218298,2663038764,504708206,2263041392,3941167025,2249088522,1514023603,1998579484,1312622330,694541497,2582060303,2151582166,1382467621,776784248,2618340202,3323268794,2497899128,2784771155,503983604,4076293799,907881277,423175695,432175456,1378068232,4145222326,3954048622,3938656102,3820766613,2793130115,2977904593,26017576,3274890735,3194772133,1700274565,1756076034,4006520079,3677328699,720338349,1533947780,354530856,688349552,3973924725,1637815568,332179504,3949051286,53804574,2852348879,3044236432,1282449977,3583942155,3416972820,4006381244,1617046695,2628476075,3002303598,1686838959,431878346,2686675385,1700445008,1080580658,1009431731,832498133,3223435511,2605976345,2271191193,2516031870,1648197032,4164389018,2548247927,300782431,375919233,238389289,3353747414,2531188641,2019080857,1475708069,455242339,2609103871,448939670,3451063019,1395535956,2413381860,1841049896,1491858159,885456874,4264095073,4001119347,1565136089,3898914787,1108368660,540939232,1173283510,2745871338,3681308437,4207628240,3343053890,4016749493,1699691293,1103962373,3625875870,2256883143,3830138730,1031889488,3479347698,1535977030,4236805024,3251091107,2132092099,1774941330,1199868427,1452454533,157007616,2904115357,342012276,595725824,1480756522,206960106,497939518,591360097,863170706,2375253569,3596610801,1814182875,2094937945,3421402208,1082520231,3463918190,2785509508,435703966,3908032597,1641649973,2842273706,3305899714,1510255612,2148256476,2655287854,3276092548,4258621189,236887753,3681803219,274041037,1734335097,3815195456,3317970021,1899903192,1026095262,4050517792,356393447,2410691914,3873677099,3682840055],[3913112168,2491498743,4132185628,2489919796,1091903735,1979897079,3170134830,3567386728,3557303409,857797738,1136121015,1342202287,507115054,2535736646,337727348,3213592640,1301675037,2528481711,1895095763,1721773893,3216771564,62756741,2142006736,835421444,2531993523,1442658625,3659876326,2882144922,676362277,1392781812,170690266,3921047035,1759253602,3611846912,1745797284,664899054,1329594018,3901205900,3045908486,2062866102,2865634940,3543621612,3464012697,1080764994,553557557,3656615353,3996768171,991055499,499776247,1265440854,648242737,3940784050,980351604,3713745714,1749149687,3396870395,4211799374,3640570775,1161844396,3125318951,1431517754,545492359,4268468663,3499529547,1437099964,2702547544,3433638243,2581715763,2787789398,1060185593,1593081372,2418618748,4260947970,69676912,2159744348,86519011,2512459080,3838209314,1220612927,3339683548,133810670,1090789135,1078426020,1569222167,845107691,3583754449,4072456591,1091646820,628848692,1613405280,3757631651,526609435,236106946,48312990,2942717905,3402727701,1797494240,859738849,992217954,4005476642,2243076622,3870952857,3732016268,765654824,3490871365,2511836413,1685915746,3888969200,1414112111,2273134842,3281911079,4080962846,172450625,2569994100,980381355,4109958455,2819808352,2716589560,2568741196,3681446669,3329971472,1835478071,660984891,3704678404,4045999559,3422617507,3040415634,1762651403,1719377915,3470491036,2693910283,3642056355,3138596744,1364962596,2073328063,1983633131,926494387,3423689081,2150032023,4096667949,1749200295,3328846651,309677260,2016342300,1779581495,3079819751,111262694,1274766160,443224088,298511866,1025883608,3806446537,1145181785,168956806,3641502830,3584813610,1689216846,3666258015,3200248200,1692713982,2646376535,4042768518,1618508792,1610833997,3523052358,4130873264,2001055236,3610705100,2202168115,4028541809,2961195399,1006657119,2006996926,3186142756,1430667929,3210227297,1314452623,4074634658,4101304120,2273951170,1399257539,3367210612,3027628629,1190975929,2062231137,2333990788,2221543033,2438960610,1181637006,548689776,2362791313,3372408396,3104550113,3145860560,296247880,1970579870,3078560182,3769228297,1714227617,3291629107,3898220290,166772364,1251581989,493813264,448347421,195405023,2709975567,677966185,3703036547,1463355134,2715995803,1338867538,1343315457,2802222074,2684532164,233230375,2599980071,2000651841,3277868038,1638401717,4028070440,3237316320,6314154,819756386,300326615,590932579,1405279636,3267499572,3150704214,2428286686,3959192993,3461946742,1862657033,1266418056,963775037,2089974820,2263052895,1917689273,448879540,3550394620,3981727096,150775221,3627908307,1303187396,508620638,2975983352,2726630617,1817252668,1876281319,1457606340,908771278,3720792119,3617206836,2455994898,1729034894,1080033504],[976866871,3556439503,2881648439,1522871579,1555064734,1336096578,3548522304,2579274686,3574697629,3205460757,3593280638,3338716283,3079412587,564236357,2993598910,1781952180,1464380207,3163844217,3332601554,1699332808,1393555694,1183702653,3581086237,1288719814,691649499,2847557200,2895455976,3193889540,2717570544,1781354906,1676643554,2592534050,3230253752,1126444790,2770207658,2633158820,2210423226,2615765581,2414155088,3127139286,673620729,2805611233,1269405062,4015350505,3341807571,4149409754,1057255273,2012875353,2162469141,2276492801,2601117357,993977747,3918593370,2654263191,753973209,36408145,2530585658,25011837,3520020182,2088578344,530523599,2918365339,1524020338,1518925132,3760827505,3759777254,1202760957,3985898139,3906192525,674977740,4174734889,2031300136,2019492241,3983892565,4153806404,3822280332,352677332,2297720250,60907813,90501309,3286998549,1016092578,2535922412,2839152426,457141659,509813237,4120667899,652014361,1966332200,2975202805,55981186,2327461051,676427537,3255491064,2882294119,3433927263,1307055953,942726286,933058658,2468411793,3933900994,4215176142,1361170020,2001714738,2830558078,3274259782,1222529897,1679025792,2729314320,3714953764,1770335741,151462246,3013232138,1682292957,1483529935,471910574,1539241949,458788160,3436315007,1807016891,3718408830,978976581,1043663428,3165965781,1927990952,4200891579,2372276910,3208408903,3533431907,1412390302,2931980059,4132332400,1947078029,3881505623,4168226417,2941484381,1077988104,1320477388,886195818,18198404,3786409e3,2509781533,112762804,3463356488,1866414978,891333506,18488651,661792760,1628790961,3885187036,3141171499,876946877,2693282273,1372485963,791857591,2686433993,3759982718,3167212022,3472953795,2716379847,445679433,3561995674,3504004811,3574258232,54117162,3331405415,2381918588,3769707343,4154350007,1140177722,4074052095,668550556,3214352940,367459370,261225585,2610173221,4209349473,3468074219,3265815641,314222801,3066103646,3808782860,282218597,3406013506,3773591054,379116347,1285071038,846784868,2669647154,3771962079,3550491691,2305946142,453669953,1268987020,3317592352,3279303384,3744833421,2610507566,3859509063,266596637,3847019092,517658769,3462560207,3443424879,370717030,4247526661,2224018117,4143653529,4112773975,2788324899,2477274417,1456262402,2901442914,1517677493,1846949527,2295493580,3734397586,2176403920,1280348187,1908823572,3871786941,846861322,1172426758,3287448474,3383383037,1655181056,3139813346,901632758,1897031941,2986607138,3066810236,3447102507,1393639104,373351379,950779232,625454576,3124240540,4148612726,2007998917,544563296,2244738638,2330496472,2058025392,1291430526,424198748,50039436,29584100,3605783033,2429876329,2791104160,1057563949,3255363231,3075367218,3463963227,1469046755,985887462]],d.prototype.PARRAY=[608135816,2242054355,320440878,57701188,2752067618,698298832,137296536,3964562569,1160258022,953160567,3193202383,887688300,3232508343,3380367581,1065670069,3041331479,2450970073,2306472731],d.prototype.NN=16,d.prototype._clean=function(a){if(a<0){var b=2147483647&a;a=b+2147483648}return a},d.prototype._F=function(a){var b,c,d,e,f;return e=255&a,a>>>=8,d=255&a,a>>>=8,c=255&a,a>>>=8,b=255&a,f=this.sboxes[0][b]+this.sboxes[1][c],f^=this.sboxes[2][d],f+=this.sboxes[3][e]},d.prototype._encrypt_block=function(a){var b,c=a[0],d=a[1];for(b=0;b<this.NN;++b){c^=this.parray[b],d=this._F(c)^d;var e=c;c=d,d=e}c^=this.parray[this.NN+0],d^=this.parray[this.NN+1],a[0]=this._clean(d),a[1]=this._clean(c)},d.prototype.encrypt_block=function(a){var b,c=[0,0],d=this.BLOCKSIZE/2;for(b=0;b<this.BLOCKSIZE/2;++b)c[0]=c[0]<<8|255&a[b+0],c[1]=c[1]<<8|255&a[b+d];this._encrypt_block(c);var e=[];for(b=0;b<this.BLOCKSIZE/2;++b)e[b+0]=c[0]>>>24-8*b&255,e[b+d]=c[1]>>>24-8*b&255;return e},d.prototype._decrypt_block=function(a){var b,c=a[0],d=a[1];for(b=this.NN+1;b>1;--b){c^=this.parray[b],d=this._F(c)^d;var e=c;c=d,d=e}c^=this.parray[1],d^=this.parray[0],a[0]=this._clean(d),a[1]=this._clean(c)},d.prototype.init=function(a){var b,c=0;for(this.parray=[],b=0;b<this.NN+2;++b){var d,e=0;for(d=0;d<4;++d)e=e<<8|255&a[c],++c>=a.length&&(c=0);this.parray[b]=this.PARRAY[b]^e}for(this.sboxes=[],b=0;b<4;++b)for(this.sboxes[b]=[],c=0;c<256;++c)this.sboxes[b][c]=this.SBOXES[b][c];var f=[0,0];for(b=0;b<this.NN+2;b+=2)this._encrypt_block(f),this.parray[b+0]=f[0],this.parray[b+1]=f[1];for(b=0;b<4;++b)for(c=0;c<256;c+=2)this._encrypt_block(f),this.sboxes[b][c+0]=f[0],this.sboxes[b][c+1]=f[1]},e.keySize=e.prototype.keySize=16,e.blockSize=e.prototype.blockSize=16},{}],14:[function(a,b,c){"use strict";function d(){function a(a,b,c){var d=b+a,e=d<<c|d>>>32-c;return(f[0][e>>>24]^f[1][e>>>16&255])-f[2][e>>>8&255]+f[3][255&e]}function b(a,b,c){var d=b^a,e=d<<c|d>>>32-c;return f[0][e>>>24]-f[1][e>>>16&255]+f[2][e>>>8&255]^f[3][255&e]}function c(a,b,c){var d=b-a,e=d<<c|d>>>32-c;return(f[0][e>>>24]+f[1][e>>>16&255]^f[2][e>>>8&255])-f[3][255&e]}this.BlockSize=8,this.KeySize=16,this.setKey=function(a){if(this.masking=new Array(16),this.rotate=new Array(16),this.reset(),a.length!==this.KeySize)throw new Error("CAST-128: keys must be 16 bytes");return this.keySchedule(a),!0},this.reset=function(){for(var a=0;a<16;a++)this.masking[a]=0,this.rotate[a]=0},this.getBlockSize=function(){return this.BlockSize},this.encrypt=function(d){for(var e=new Array(d.length),f=0;f<d.length;f+=8){var g,h=d[f]<<24|d[f+1]<<16|d[f+2]<<8|d[f+3],i=d[f+4]<<24|d[f+5]<<16|d[f+6]<<8|d[f+7];g=i,i=h^a(i,this.masking[0],this.rotate[0]),h=g,g=i,i=h^b(i,this.masking[1],this.rotate[1]),h=g,g=i,i=h^c(i,this.masking[2],this.rotate[2]),h=g,g=i,i=h^a(i,this.masking[3],this.rotate[3]),h=g,g=i,i=h^b(i,this.masking[4],this.rotate[4]),h=g,g=i,i=h^c(i,this.masking[5],this.rotate[5]),h=g,g=i,i=h^a(i,this.masking[6],this.rotate[6]),h=g,g=i,i=h^b(i,this.masking[7],this.rotate[7]),h=g,g=i,i=h^c(i,this.masking[8],this.rotate[8]),h=g,g=i,i=h^a(i,this.masking[9],this.rotate[9]),h=g,g=i,i=h^b(i,this.masking[10],this.rotate[10]),h=g,g=i,i=h^c(i,this.masking[11],this.rotate[11]),h=g,g=i,i=h^a(i,this.masking[12],this.rotate[12]),h=g,g=i,i=h^b(i,this.masking[13],this.rotate[13]),h=g,g=i,i=h^c(i,this.masking[14],this.rotate[14]),h=g,g=i,i=h^a(i,this.masking[15],this.rotate[15]),h=g,e[f]=i>>>24&255,e[f+1]=i>>>16&255,e[f+2]=i>>>8&255,e[f+3]=255&i,e[f+4]=h>>>24&255,e[f+5]=h>>>16&255,e[f+6]=h>>>8&255,e[f+7]=255&h}return e},this.decrypt=function(d){for(var e=new Array(d.length),f=0;f<d.length;f+=8){var g,h=d[f]<<24|d[f+1]<<16|d[f+2]<<8|d[f+3],i=d[f+4]<<24|d[f+5]<<16|d[f+6]<<8|d[f+7];g=i,i=h^a(i,this.masking[15],this.rotate[15]),h=g,g=i,i=h^c(i,this.masking[14],this.rotate[14]),h=g,g=i,i=h^b(i,this.masking[13],this.rotate[13]),h=g,g=i,i=h^a(i,this.masking[12],this.rotate[12]),h=g,g=i,i=h^c(i,this.masking[11],this.rotate[11]),h=g,g=i,i=h^b(i,this.masking[10],this.rotate[10]),h=g,g=i,i=h^a(i,this.masking[9],this.rotate[9]),h=g,g=i,i=h^c(i,this.masking[8],this.rotate[8]),h=g,g=i,i=h^b(i,this.masking[7],this.rotate[7]),h=g,g=i,i=h^a(i,this.masking[6],this.rotate[6]),h=g,g=i,i=h^c(i,this.masking[5],this.rotate[5]),h=g,g=i,i=h^b(i,this.masking[4],this.rotate[4]),h=g,g=i,i=h^a(i,this.masking[3],this.rotate[3]),h=g,g=i,i=h^c(i,this.masking[2],this.rotate[2]),h=g,g=i,i=h^b(i,this.masking[1],this.rotate[1]),h=g,g=i,i=h^a(i,this.masking[0],this.rotate[0]),h=g,e[f]=i>>>24&255,e[f+1]=i>>>16&255,e[f+2]=i>>>8&255,e[f+3]=255&i,e[f+4]=h>>>24&255,e[f+5]=h>>16&255,e[f+6]=h>>8&255,e[f+7]=255&h}return e};var d=new Array(4);d[0]=new Array(4),d[0][0]=new Array(4,0,13,15,12,14,8),d[0][1]=new Array(5,2,16,18,17,19,10),d[0][2]=new Array(6,3,23,22,21,20,9),d[0][3]=new Array(7,1,26,25,27,24,11),d[1]=new Array(4),d[1][0]=new Array(0,6,21,23,20,22,16),d[1][1]=new Array(1,4,0,2,1,3,18),d[1][2]=new Array(2,5,7,6,5,4,17),d[1][3]=new Array(3,7,10,9,11,8,19),d[2]=new Array(4),d[2][0]=new Array(4,0,13,15,12,14,8),d[2][1]=new Array(5,2,16,18,17,19,10),d[2][2]=new Array(6,3,23,22,21,20,9),d[2][3]=new Array(7,1,26,25,27,24,11),d[3]=new Array(4),d[3][0]=new Array(0,6,21,23,20,22,16),d[3][1]=new Array(1,4,0,2,1,3,18),d[3][2]=new Array(2,5,7,6,5,4,17),d[3][3]=new Array(3,7,10,9,11,8,19);var e=new Array(4);e[0]=new Array(4),e[0][0]=new Array(24,25,23,22,18),e[0][1]=new Array(26,27,21,20,22),e[0][2]=new Array(28,29,19,18,25),e[0][3]=new Array(30,31,17,16,28),e[1]=new Array(4),e[1][0]=new Array(3,2,12,13,8),e[1][1]=new Array(1,0,14,15,13),e[1][2]=new Array(7,6,8,9,3),e[1][3]=new Array(5,4,10,11,7),e[2]=new Array(4),e[2][0]=new Array(19,18,28,29,25),e[2][1]=new Array(17,16,30,31,28),e[2][2]=new Array(23,22,24,25,18),e[2][3]=new Array(21,20,26,27,22),e[3]=new Array(4),e[3][0]=new Array(8,9,7,6,3),e[3][1]=new Array(10,11,5,4,7),e[3][2]=new Array(12,13,3,2,8),e[3][3]=new Array(14,15,1,0,13),this.keySchedule=function(a){var b,c,g=new Array(8),h=new Array(32);for(b=0;b<4;b++)c=4*b,g[b]=a[c]<<24|a[c+1]<<16|a[c+2]<<8|a[c+3];for(var i,j=[6,7,4,5],k=0,l=0;l<2;l++)for(var m=0;m<4;m++){for(c=0;c<4;c++){var n=d[m][c];i=g[n[1]],i^=f[4][g[n[2]>>>2]>>>24-8*(3&n[2])&255],i^=f[5][g[n[3]>>>2]>>>24-8*(3&n[3])&255],i^=f[6][g[n[4]>>>2]>>>24-8*(3&n[4])&255],i^=f[7][g[n[5]>>>2]>>>24-8*(3&n[5])&255],i^=f[j[c]][g[n[6]>>>2]>>>24-8*(3&n[6])&255],g[n[0]]=i}for(c=0;c<4;c++){var o=e[m][c];i=f[4][g[o[0]>>>2]>>>24-8*(3&o[0])&255],i^=f[5][g[o[1]>>>2]>>>24-8*(3&o[1])&255],i^=f[6][g[o[2]>>>2]>>>24-8*(3&o[2])&255],i^=f[7][g[o[3]>>>2]>>>24-8*(3&o[3])&255],i^=f[4+c][g[o[4]>>>2]>>>24-8*(3&o[4])&255],h[k]=i,k++}}for(b=0;b<16;b++)this.masking[b]=h[b],this.rotate[b]=31&h[16+b]};var f=new Array(8);f[0]=new Array(821772500,2678128395,1810681135,1059425402,505495343,2617265619,1610868032,3483355465,3218386727,2294005173,3791863952,2563806837,1852023008,365126098,3269944861,584384398,677919599,3229601881,4280515016,2002735330,1136869587,3744433750,2289869850,2731719981,2714362070,879511577,1639411079,575934255,717107937,2857637483,576097850,2731753936,1725645e3,2810460463,5111599,767152862,2543075244,1251459544,1383482551,3052681127,3089939183,3612463449,1878520045,1510570527,2189125840,2431448366,582008916,3163445557,1265446783,1354458274,3529918736,3202711853,3073581712,3912963487,3029263377,1275016285,4249207360,2905708351,3304509486,1442611557,3585198765,2712415662,2731849581,3248163920,2283946226,208555832,2766454743,1331405426,1447828783,3315356441,3108627284,2957404670,2981538698,3339933917,1669711173,286233437,1465092821,1782121619,3862771680,710211251,980974943,1651941557,430374111,2051154026,704238805,4128970897,3144820574,2857402727,948965521,3333752299,2227686284,718756367,2269778983,2731643755,718440111,2857816721,3616097120,1113355533,2478022182,410092745,1811985197,1944238868,2696854588,1415722873,1682284203,1060277122,1998114690,1503841958,82706478,2315155686,1068173648,845149890,2167947013,1768146376,1993038550,3566826697,3390574031,940016341,3355073782,2328040721,904371731,1205506512,4094660742,2816623006,825647681,85914773,2857843460,1249926541,1417871568,3287612,3211054559,3126306446,1975924523,1353700161,2814456437,2438597621,1800716203,722146342,2873936343,1151126914,4160483941,2877670899,458611604,2866078500,3483680063,770352098,2652916994,3367839148,3940505011,3585973912,3809620402,718646636,2504206814,2914927912,3631288169,2857486607,2860018678,575749918,2857478043,718488780,2069512688,3548183469,453416197,1106044049,3032691430,52586708,3378514636,3459808877,3211506028,1785789304,218356169,3571399134,3759170522,1194783844,1523787992,3007827094,1975193539,2555452411,1341901877,3045838698,3776907964,3217423946,2802510864,2889438986,1057244207,1636348243,3761863214,1462225785,2632663439,481089165,718503062,24497053,3332243209,3344655856,3655024856,3960371065,1195698900,2971415156,3710176158,2115785917,4027663609,3525578417,2524296189,2745972565,3564906415,1372086093,1452307862,2780501478,1476592880,3389271281,18495466,2378148571,901398090,891748256,3279637769,3157290713,2560960102,1447622437,4284372637,216884176,2086908623,1879786977,3588903153,2242455666,2938092967,3559082096,2810645491,758861177,1121993112,215018983,642190776,4169236812,1196255959,2081185372,3508738393,941322904,4124243163,2877523539,1848581667,2205260958,3180453958,2589345134,3694731276,550028657,2519456284,3789985535,2973870856,2093648313,443148163,46942275,2734146937,1117713533,1115362972,1523183689,3717140224,1551984063),f[1]=new Array(522195092,4010518363,1776537470,960447360,4267822970,4005896314,1435016340,1929119313,2913464185,1310552629,3579470798,3724818106,2579771631,1594623892,417127293,2715217907,2696228731,1508390405,3994398868,3925858569,3695444102,4019471449,3129199795,3770928635,3520741761,990456497,4187484609,2783367035,21106139,3840405339,631373633,3783325702,532942976,396095098,3548038825,4267192484,2564721535,2011709262,2039648873,620404603,3776170075,2898526339,3612357925,4159332703,1645490516,223693667,1567101217,3362177881,1029951347,3470931136,3570957959,1550265121,119497089,972513919,907948164,3840628539,1613718692,3594177948,465323573,2659255085,654439692,2575596212,2699288441,3127702412,277098644,624404830,4100943870,2717858591,546110314,2403699828,3655377447,1321679412,4236791657,1045293279,4010672264,895050893,2319792268,494945126,1914543101,2777056443,3894764339,2219737618,311263384,4275257268,3458730721,669096869,3584475730,3835122877,3319158237,3949359204,2005142349,2713102337,2228954793,3769984788,569394103,3855636576,1425027204,108000370,2736431443,3671869269,3043122623,1750473702,2211081108,762237499,3972989403,2798899386,3061857628,2943854345,867476300,964413654,1591880597,1594774276,2179821409,552026980,3026064248,3726140315,2283577634,3110545105,2152310760,582474363,1582640421,1383256631,2043843868,3322775884,1217180674,463797851,2763038571,480777679,2718707717,2289164131,3118346187,214354409,200212307,3810608407,3025414197,2674075964,3997296425,1847405948,1342460550,510035443,4080271814,815934613,833030224,1620250387,1945732119,2703661145,3966000196,1388869545,3456054182,2687178561,2092620194,562037615,1356438536,3409922145,3261847397,1688467115,2150901366,631725691,3840332284,549916902,3455104640,394546491,837744717,2114462948,751520235,2221554606,2415360136,3999097078,2063029875,803036379,2702586305,821456707,3019566164,360699898,4018502092,3511869016,3677355358,2402471449,812317050,49299192,2570164949,3259169295,2816732080,3331213574,3101303564,2156015656,3705598920,3546263921,143268808,3200304480,1638124008,3165189453,3341807610,578956953,2193977524,3638120073,2333881532,807278310,658237817,2969561766,1641658566,11683945,3086995007,148645947,1138423386,4158756760,1981396783,2401016740,3699783584,380097457,2680394679,2803068651,3334260286,441530178,4016580796,1375954390,761952171,891809099,2183123478,157052462,3683840763,1592404427,341349109,2438483839,1417898363,644327628,2233032776,2353769706,2201510100,220455161,1815641738,182899273,2995019788,3627381533,3702638151,2890684138,1052606899,588164016,1681439879,4038439418,2405343923,4229449282,167996282,1336969661,1688053129,2739224926,1543734051,1046297529,1138201970,2121126012,115334942,1819067631,1902159161,1941945968,2206692869,1159982321),f[2]=new Array(2381300288,637164959,3952098751,3893414151,1197506559,916448331,2350892612,2932787856,3199334847,4009478890,3905886544,1373570990,2450425862,4037870920,3778841987,2456817877,286293407,124026297,3001279700,1028597854,3115296800,4208886496,2691114635,2188540206,1430237888,1218109995,3572471700,308166588,570424558,2187009021,2455094765,307733056,1310360322,3135275007,1384269543,2388071438,863238079,2359263624,2801553128,3380786597,2831162807,1470087780,1728663345,4072488799,1090516929,532123132,2389430977,1132193179,2578464191,3051079243,1670234342,1434557849,2711078940,1241591150,3314043432,3435360113,3091448339,1812415473,2198440252,267246943,796911696,3619716990,38830015,1526438404,2806502096,374413614,2943401790,1489179520,1603809326,1920779204,168801282,260042626,2358705581,1563175598,2397674057,1356499128,2217211040,514611088,2037363785,2186468373,4022173083,2792511869,2913485016,1173701892,4200428547,3896427269,1334932762,2455136706,602925377,2835607854,1613172210,41346230,2499634548,2457437618,2188827595,41386358,4172255629,1313404830,2405527007,3801973774,2217704835,873260488,2528884354,2478092616,4012915883,2555359016,2006953883,2463913485,575479328,2218240648,2099895446,660001756,2341502190,3038761536,3888151779,3848713377,3286851934,1022894237,1620365795,3449594689,1551255054,15374395,3570825345,4249311020,4151111129,3181912732,310226346,1133119310,530038928,136043402,2476768958,3107506709,2544909567,1036173560,2367337196,1681395281,1758231547,3641649032,306774401,1575354324,3716085866,1990386196,3114533736,2455606671,1262092282,3124342505,2768229131,4210529083,1833535011,423410938,660763973,2187129978,1639812e3,3508421329,3467445492,310289298,272797111,2188552562,2456863912,310240523,677093832,1013118031,901835429,3892695601,1116285435,3036471170,1337354835,243122523,520626091,277223598,4244441197,4194248841,1766575121,594173102,316590669,742362309,3536858622,4176435350,3838792410,2501204839,1229605004,3115755532,1552908988,2312334149,979407927,3959474601,1148277331,176638793,3614686272,2083809052,40992502,1340822838,2731552767,3535757508,3560899520,1354035053,122129617,7215240,2732932949,3118912700,2718203926,2539075635,3609230695,3725561661,1928887091,2882293555,1988674909,2063640240,2491088897,1459647954,4189817080,2302804382,1113892351,2237858528,1927010603,4002880361,1856122846,1594404395,2944033133,3855189863,3474975698,1643104450,4054590833,3431086530,1730235576,2984608721,3084664418,2131803598,4178205752,267404349,1617849798,1616132681,1462223176,736725533,2327058232,551665188,2945899023,1749386277,2575514597,1611482493,674206544,2201269090,3642560800,728599968,1680547377,2620414464,1388111496,453204106,4156223445,1094905244,2754698257,2201108165,3757000246,2704524545,3922940700,3996465027),f[3]=new Array(2645754912,532081118,2814278639,3530793624,1246723035,1689095255,2236679235,4194438865,2116582143,3859789411,157234593,2045505824,4245003587,1687664561,4083425123,605965023,672431967,1336064205,3376611392,214114848,4258466608,3232053071,489488601,605322005,3998028058,264917351,1912574028,756637694,436560991,202637054,135989450,85393697,2152923392,3896401662,2895836408,2145855233,3535335007,115294817,3147733898,1922296357,3464822751,4117858305,1037454084,2725193275,2127856640,1417604070,1148013728,1827919605,642362335,2929772533,909348033,1346338451,3547799649,297154785,1917849091,4161712827,2883604526,3968694238,1469521537,3780077382,3375584256,1763717519,136166297,4290970789,1295325189,2134727907,2798151366,1566297257,3672928234,2677174161,2672173615,965822077,2780786062,289653839,1133871874,3491843819,35685304,1068898316,418943774,672553190,642281022,2346158704,1954014401,3037126780,4079815205,2030668546,3840588673,672283427,1776201016,359975446,3750173538,555499703,2769985273,1324923,69110472,152125443,3176785106,3822147285,1340634837,798073664,1434183902,15393959,216384236,1303690150,3881221631,3711134124,3960975413,106373927,2578434224,1455997841,1801814300,1578393881,1854262133,3188178946,3258078583,2302670060,1539295533,3505142565,3078625975,2372746020,549938159,3278284284,2620926080,181285381,2865321098,3970029511,68876850,488006234,1728155692,2608167508,836007927,2435231793,919367643,3339422534,3655756360,1457871481,40520939,1380155135,797931188,234455205,2255801827,3990488299,397000196,739833055,3077865373,2871719860,4022553888,772369276,390177364,3853951029,557662966,740064294,1640166671,1699928825,3535942136,622006121,3625353122,68743880,1742502,219489963,1664179233,1577743084,1236991741,410585305,2366487942,823226535,1050371084,3426619607,3586839478,212779912,4147118561,1819446015,1911218849,530248558,3486241071,3252585495,2886188651,3410272728,2342195030,20547779,2982490058,3032363469,3631753222,312714466,1870521650,1493008054,3491686656,615382978,4103671749,2534517445,1932181,2196105170,278426614,6369430,3274544417,2913018367,697336853,2143000447,2946413531,701099306,1558357093,2805003052,3500818408,2321334417,3567135975,216290473,3591032198,23009561,1996984579,3735042806,2024298078,3739440863,569400510,2339758983,3016033873,3097871343,3639523026,3844324983,3256173865,795471839,2951117563,4101031090,4091603803,3603732598,971261452,534414648,428311343,3389027175,2844869880,694888862,1227866773,2456207019,3043454569,2614353370,3749578031,3676663836,459166190,4132644070,1794958188,51825668,2252611902,3084671440,2036672799,3436641603,1099053433,2469121526,3059204941,1323291266,2061838604,1018778475,2233344254,2553501054,334295216,3556750194,1065731521,183467730),f[4]=new Array(2127105028,745436345,2601412319,2788391185,3093987327,500390133,1155374404,389092991,150729210,3891597772,3523549952,1935325696,716645080,946045387,2901812282,1774124410,3869435775,4039581901,3293136918,3438657920,948246080,363898952,3867875531,1286266623,1598556673,68334250,630723836,1104211938,1312863373,613332731,2377784574,1101634306,441780740,3129959883,1917973735,2510624549,3238456535,2544211978,3308894634,1299840618,4076074851,1756332096,3977027158,297047435,3790297736,2265573040,3621810518,1311375015,1667687725,47300608,3299642885,2474112369,201668394,1468347890,576830978,3594690761,3742605952,1958042578,1747032512,3558991340,1408974056,3366841779,682131401,1033214337,1545599232,4265137049,206503691,103024618,2855227313,1337551222,2428998917,2963842932,4015366655,3852247746,2796956967,3865723491,3747938335,247794022,3755824572,702416469,2434691994,397379957,851939612,2314769512,218229120,1380406772,62274761,214451378,3170103466,2276210409,3845813286,28563499,446592073,1693330814,3453727194,29968656,3093872512,220656637,2470637031,77972100,1667708854,1358280214,4064765667,2395616961,325977563,4277240721,4220025399,3605526484,3355147721,811859167,3069544926,3962126810,652502677,3075892249,4132761541,3498924215,1217549313,3250244479,3858715919,3053989961,1538642152,2279026266,2875879137,574252750,3324769229,2651358713,1758150215,141295887,2719868960,3515574750,4093007735,4194485238,1082055363,3417560400,395511885,2966884026,179534037,3646028556,3738688086,1092926436,2496269142,257381841,3772900718,1636087230,1477059743,2499234752,3811018894,2675660129,3285975680,90732309,1684827095,1150307763,1723134115,3237045386,1769919919,1240018934,815675215,750138730,2239792499,1234303040,1995484674,138143821,675421338,1145607174,1936608440,3238603024,2345230278,2105974004,323969391,779555213,3004902369,2861610098,1017501463,2098600890,2628620304,2940611490,2682542546,1171473753,3656571411,3687208071,4091869518,393037935,159126506,1662887367,1147106178,391545844,3452332695,1891500680,3016609650,1851642611,546529401,1167818917,3194020571,2848076033,3953471836,575554290,475796850,4134673196,450035699,2351251534,844027695,1080539133,86184846,1554234488,3692025454,1972511363,2018339607,1491841390,1141460869,1061690759,4244549243,2008416118,2351104703,2868147542,1598468138,722020353,1027143159,212344630,1387219594,1725294528,3745187956,2500153616,458938280,4129215917,1828119673,544571780,3503225445,2297937496,1241802790,267843827,2694610800,1397140384,1558801448,3782667683,1806446719,929573330,2234912681,400817706,616011623,4121520928,3603768725,1761550015,1968522284,4053731006,4192232858,4005120285,872482584,3140537016,3894607381,2287405443,1963876937,3663887957,1584857e3,2975024454,1833426440,4025083860),f[5]=new Array(4143615901,749497569,1285769319,3795025788,2514159847,23610292,3974978748,844452780,3214870880,3751928557,2213566365,1676510905,448177848,3730751033,4086298418,2307502392,871450977,3222878141,4110862042,3831651966,2735270553,1310974780,2043402188,1218528103,2736035353,4274605013,2702448458,3936360550,2693061421,162023535,2827510090,687910808,23484817,3784910947,3371371616,779677500,3503626546,3473927188,4157212626,3500679282,4248902014,2466621104,3899384794,1958663117,925738300,1283408968,3669349440,1840910019,137959847,2679828185,1239142320,1315376211,1547541505,1690155329,739140458,3128809933,3933172616,3876308834,905091803,1548541325,4040461708,3095483362,144808038,451078856,676114313,2861728291,2469707347,993665471,373509091,2599041286,4025009006,4170239449,2149739950,3275793571,3749616649,2794760199,1534877388,572371878,2590613551,1753320020,3467782511,1405125690,4270405205,633333386,3026356924,3475123903,632057672,2846462855,1404951397,3882875879,3915906424,195638627,2385783745,3902872553,1233155085,3355999740,2380578713,2702246304,2144565621,3663341248,3894384975,2502479241,4248018925,3094885567,1594115437,572884632,3385116731,767645374,1331858858,1475698373,3793881790,3532746431,1321687957,619889600,1121017241,3440213920,2070816767,2833025776,1933951238,4095615791,890643334,3874130214,859025556,360630002,925594799,1764062180,3920222280,4078305929,979562269,2810700344,4087740022,1949714515,546639971,1165388173,3069891591,1495988560,922170659,1291546247,2107952832,1813327274,3406010024,3306028637,4241950635,153207855,2313154747,1608695416,1150242611,1967526857,721801357,1220138373,3691287617,3356069787,2112743302,3281662835,1111556101,1778980689,250857638,2298507990,673216130,2846488510,3207751581,3562756981,3008625920,3417367384,2198807050,529510932,3547516680,3426503187,2364944742,102533054,2294910856,1617093527,1204784762,3066581635,1019391227,1069574518,1317995090,1691889997,3661132003,510022745,3238594800,1362108837,1817929911,2184153760,805817662,1953603311,3699844737,120799444,2118332377,207536705,2282301548,4120041617,145305846,2508124933,3086745533,3261524335,1877257368,2977164480,3160454186,2503252186,4221677074,759945014,254147243,2767453419,3801518371,629083197,2471014217,907280572,3900796746,940896768,2751021123,2625262786,3161476951,3661752313,3260732218,1425318020,2977912069,1496677566,3988592072,2140652971,3126511541,3069632175,977771578,1392695845,1698528874,1411812681,1369733098,1343739227,3620887944,1142123638,67414216,3102056737,3088749194,1626167401,2546293654,3941374235,697522451,33404913,143560186,2595682037,994885535,1247667115,3859094837,2699155541,3547024625,4114935275,2968073508,3199963069,2732024527,1237921620,951448369,1898488916,1211705605,2790989240,2233243581,3598044975),
f[6]=new Array(2246066201,858518887,1714274303,3485882003,713916271,2879113490,3730835617,539548191,36158695,1298409750,419087104,1358007170,749914897,2989680476,1261868530,2995193822,2690628854,3443622377,3780124940,3796824509,2976433025,4259637129,1551479e3,512490819,1296650241,951993153,2436689437,2460458047,144139966,3136204276,310820559,3068840729,643875328,1969602020,1680088954,2185813161,3283332454,672358534,198762408,896343282,276269502,3014846926,84060815,197145886,376173866,3943890818,3813173521,3545068822,1316698879,1598252827,2633424951,1233235075,859989710,2358460855,3503838400,3409603720,1203513385,1193654839,2792018475,2060853022,207403770,1144516871,3068631394,1121114134,177607304,3785736302,326409831,1929119770,2983279095,4183308101,3474579288,3200513878,3228482096,119610148,1170376745,3378393471,3163473169,951863017,3337026068,3135789130,2907618374,1183797387,2015970143,4045674555,2182986399,2952138740,3928772205,384012900,2454997643,10178499,2879818989,2596892536,111523738,2995089006,451689641,3196290696,235406569,1441906262,3890558523,3013735005,4158569349,1644036924,376726067,1006849064,3664579700,2041234796,1021632941,1374734338,2566452058,371631263,4007144233,490221539,206551450,3140638584,1053219195,1853335209,3412429660,3562156231,735133835,1623211703,3104214392,2738312436,4096837757,3366392578,3110964274,3956598718,3196820781,2038037254,3877786376,2339753847,300912036,3766732888,2372630639,1516443558,4200396704,1574567987,4069441456,4122592016,2699739776,146372218,2748961456,2043888151,35287437,2596680554,655490400,1132482787,110692520,1031794116,2188192751,1324057718,1217253157,919197030,686247489,3261139658,1028237775,3135486431,3059715558,2460921700,986174950,2661811465,4062904701,2752986992,3709736643,367056889,1353824391,731860949,1650113154,1778481506,784341916,357075625,3608602432,1074092588,2480052770,3811426202,92751289,877911070,3600361838,1231880047,480201094,3756190983,3094495953,434011822,87971354,363687820,1717726236,1901380172,3926403882,2481662265,400339184,1490350766,2661455099,1389319756,2558787174,784598401,1983468483,30828846,3550527752,2716276238,3841122214,1765724805,1955612312,1277890269,1333098070,1564029816,2704417615,1026694237,3287671188,1260819201,3349086767,1016692350,1582273796,1073413053,1995943182,694588404,1025494639,3323872702,3551898420,4146854327,453260480,1316140391,1435673405,3038941953,3486689407,1622062951,403978347,817677117,950059133,4246079218,3278066075,1486738320,1417279718,481875527,2549965225,3933690356,760697757,1452955855,3897451437,1177426808,1702951038,4085348628,2447005172,1084371187,3516436277,3068336338,1073369276,1027665953,3284188590,1230553676,1368340146,2226246512,267243139,2274220762,4070734279,2497715176,2423353163,2504755875),f[7]=new Array(3793104909,3151888380,2817252029,895778965,2005530807,3871412763,237245952,86829237,296341424,3851759377,3974600970,2475086196,709006108,1994621201,2972577594,937287164,3734691505,168608556,3189338153,2225080640,3139713551,3033610191,3025041904,77524477,185966941,1208824168,2344345178,1721625922,3354191921,1066374631,1927223579,1971335949,2483503697,1551748602,2881383779,2856329572,3003241482,48746954,1398218158,2050065058,313056748,4255789917,393167848,1912293076,940740642,3465845460,3091687853,2522601570,2197016661,1727764327,364383054,492521376,1291706479,3264136376,1474851438,1685747964,2575719748,1619776915,1814040067,970743798,1561002147,2925768690,2123093554,1880132620,3151188041,697884420,2550985770,2607674513,2659114323,110200136,1489731079,997519150,1378877361,3527870668,478029773,2766872923,1022481122,431258168,1112503832,897933369,2635587303,669726182,3383752315,918222264,163866573,3246985393,3776823163,114105080,1903216136,761148244,3571337562,1690750982,3166750252,1037045171,1888456500,2010454850,642736655,616092351,365016990,1185228132,4174898510,1043824992,2023083429,2241598885,3863320456,3279669087,3674716684,108438443,2132974366,830746235,606445527,4173263986,2204105912,1844756978,2532684181,4245352700,2969441100,3796921661,1335562986,4061524517,2720232303,2679424040,634407289,885462008,3294724487,3933892248,2094100220,339117932,4048830727,3202280980,1458155303,2689246273,1022871705,2464987878,3714515309,353796843,2822958815,4256850100,4052777845,551748367,618185374,3778635579,4020649912,1904685140,3069366075,2670879810,3407193292,2954511620,4058283405,2219449317,3135758300,1120655984,3447565834,1474845562,3577699062,550456716,3466908712,2043752612,881257467,869518812,2005220179,938474677,3305539448,3850417126,1315485940,3318264702,226533026,965733244,321539988,1136104718,804158748,573969341,3708209826,937399083,3290727049,2901666755,1461057207,4013193437,4066861423,3242773476,2421326174,1581322155,3028952165,786071460,3900391652,3918438532,1485433313,4023619836,3708277595,3678951060,953673138,1467089153,1930354364,1533292819,2492563023,1346121658,1685000834,1965281866,3765933717,4190206607,2052792609,3515332758,690371149,3125873887,2180283551,2903598061,3933952357,436236910,289419410,14314871,1242357089,2904507907,1616633776,2666382180,585885352,3471299210,2699507360,1432659641,277164553,3354103607,770115018,2303809295,3741942315,3177781868,2853364978,2269453327,3774259834,987383833,1290892879,225909803,1741533526,890078084,1496906255,1111072499,916028167,243534141,1252605537,2204162171,531204876,290011180,3916834213,102027703,237315147,209093447,1486785922,220223953,2758195998,4175039106,82940208,3127791296,2569425252,518464269,1353887104,3941492737,2377294467,3935040926)}function e(a){this.cast5=new d,this.cast5.setKey(a),this.encrypt=function(a){return this.cast5.encrypt(a)}}Object.defineProperty(c,"__esModule",{value:!0}),c["default"]=e,e.blockSize=e.prototype.blockSize=8,e.keySize=e.prototype.keySize=16},{}],15:[function(a,b,c){"use strict";function d(a,b,c,d,e,h){var i,j,k,l,m,n,o,p,q,r,s,t,u,v,w=new Array(16843776,0,65536,16843780,16842756,66564,4,65536,1024,16843776,16843780,1024,16778244,16842756,16777216,4,1028,16778240,16778240,66560,66560,16842752,16842752,16778244,65540,16777220,16777220,65540,0,1028,66564,16777216,65536,16843780,4,16842752,16843776,16777216,16777216,1024,16842756,65536,66560,16777220,1024,4,16778244,66564,16843780,65540,16842752,16778244,16777220,1028,66564,16843776,1028,16778240,16778240,0,65540,66560,0,16842756),x=new Array((-2146402272),(-2147450880),32768,1081376,1048576,32,(-2146435040),(-2147450848),(-2147483616),(-2146402272),(-2146402304),(-2147483648),(-2147450880),1048576,32,(-2146435040),1081344,1048608,(-2147450848),0,(-2147483648),32768,1081376,(-2146435072),1048608,(-2147483616),0,1081344,32800,(-2146402304),(-2146435072),32800,0,1081376,(-2146435040),1048576,(-2147450848),(-2146435072),(-2146402304),32768,(-2146435072),(-2147450880),32,(-2146402272),1081376,32,32768,(-2147483648),32800,(-2146402304),1048576,(-2147483616),1048608,(-2147450848),(-2147483616),1048608,1081344,0,(-2147450880),32800,(-2147483648),(-2146435040),(-2146402272),1081344),y=new Array(520,134349312,0,134348808,134218240,0,131592,134218240,131080,134217736,134217736,131072,134349320,131080,134348800,520,134217728,8,134349312,512,131584,134348800,134348808,131592,134218248,131584,131072,134218248,8,134349320,512,134217728,134349312,134217728,131080,520,131072,134349312,134218240,0,512,131080,134349320,134218240,134217736,512,0,134348808,134218248,131072,134217728,134349320,8,131592,131584,134217736,134348800,134218248,520,134348800,131592,8,134348808,131584),z=new Array(8396801,8321,8321,128,8396928,8388737,8388609,8193,0,8396800,8396800,8396929,129,0,8388736,8388609,1,8192,8388608,8396801,128,8388608,8193,8320,8388737,1,8320,8388736,8192,8396928,8396929,129,8388736,8388609,8396800,8396929,129,0,0,8396800,8320,8388736,8388737,1,8396801,8321,8321,128,8396929,129,1,8192,8388609,8193,8396928,8388737,8193,8320,8388608,8396801,128,8388608,8192,8396928),A=new Array(256,34078976,34078720,1107296512,524288,256,1073741824,34078720,1074266368,524288,33554688,1074266368,1107296512,1107820544,524544,1073741824,33554432,1074266112,1074266112,0,1073742080,1107820800,1107820800,33554688,1107820544,1073742080,0,1107296256,34078976,33554432,1107296256,524544,524288,1107296512,256,33554432,1073741824,34078720,1107296512,1074266368,33554688,1073741824,1107820544,34078976,1074266368,256,33554432,1107820544,1107820800,524544,1107296256,1107820800,34078720,0,1074266112,1107296256,524544,33554688,1073742080,524288,0,1074266112,34078976,1073742080),B=new Array(536870928,541065216,16384,541081616,541065216,16,541081616,4194304,536887296,4210704,4194304,536870928,4194320,536887296,536870912,16400,0,4194320,536887312,16384,4210688,536887312,16,541065232,541065232,0,4210704,541081600,16400,4210688,541081600,536870912,536887296,16,541065232,4210688,541081616,4194304,16400,536870928,4194304,536887296,536870912,16400,536870928,541081616,4210688,541065216,4210704,541081600,0,541065232,16,16384,541065216,4210704,16384,4194320,536887312,0,541081600,536870912,4194320,536887312),C=new Array(2097152,69206018,67110914,0,2048,67110914,2099202,69208064,69208066,2097152,0,67108866,2,67108864,69206018,2050,67110912,2099202,2097154,67110912,67108866,69206016,69208064,2097154,69206016,2048,2050,69208066,2099200,2,67108864,2099200,67108864,2099200,2097152,67110914,67110914,69206018,69206018,2,2097154,67108864,67110912,2097152,69208064,2050,2099202,69208064,2050,67108866,69208066,69206016,2099200,0,2,69208066,0,2099202,69206016,2048,67108866,67110912,2048,2097154),D=new Array(268439616,4096,262144,268701760,268435456,268439616,64,268435456,262208,268697600,268701760,266240,268701696,266304,4096,64,268697600,268435520,268439552,4160,266240,262208,268697664,268701696,4160,0,0,268697664,268435520,268439552,266304,262144,266304,262144,268701696,4096,64,268697664,4096,266304,268439552,64,268435520,268697600,268697664,268435456,262144,268439616,0,268701760,262208,268435520,268697600,268439552,268439616,0,268701760,266240,266240,4160,4160,262208,268435456,268701696),E=0,F=b.length,G=32===a.length?3:9;p=3===G?c?new Array(0,32,2):new Array(30,(-2),(-2)):c?new Array(0,32,2,62,30,(-2),64,96,2):new Array(94,62,(-2),32,64,2,30,(-2),(-2)),c&&(b=f(b,h),F=b.length);var H=new Uint8Array(F),I=0;for(1===d&&(q=e[E++]<<24|e[E++]<<16|e[E++]<<8|e[E++],s=e[E++]<<24|e[E++]<<16|e[E++]<<8|e[E++],E=0);E<F;){for(n=b[E++]<<24|b[E++]<<16|b[E++]<<8|b[E++],o=b[E++]<<24|b[E++]<<16|b[E++]<<8|b[E++],1===d&&(c?(n^=q,o^=s):(r=q,t=s,q=n,s=o)),k=252645135&(n>>>4^o),o^=k,n^=k<<4,k=65535&(n>>>16^o),o^=k,n^=k<<16,k=858993459&(o>>>2^n),n^=k,o^=k<<2,k=16711935&(o>>>8^n),n^=k,o^=k<<8,k=1431655765&(n>>>1^o),o^=k,n^=k<<1,n=n<<1|n>>>31,o=o<<1|o>>>31,j=0;j<G;j+=3){for(u=p[j+1],v=p[j+2],i=p[j];i!==u;i+=v)l=o^a[i],m=(o>>>4|o<<28)^a[i+1],k=n,n=o,o=k^(x[l>>>24&63]|z[l>>>16&63]|B[l>>>8&63]|D[63&l]|w[m>>>24&63]|y[m>>>16&63]|A[m>>>8&63]|C[63&m]);k=n,n=o,o=k}n=n>>>1|n<<31,o=o>>>1|o<<31,k=1431655765&(n>>>1^o),o^=k,n^=k<<1,k=16711935&(o>>>8^n),n^=k,o^=k<<8,k=858993459&(o>>>2^n),n^=k,o^=k<<2,k=65535&(n>>>16^o),o^=k,n^=k<<16,k=252645135&(n>>>4^o),o^=k,n^=k<<4,1===d&&(c?(q=n,s=o):(n^=r,o^=t)),H[I++]=n>>>24,H[I++]=n>>>16&255,H[I++]=n>>>8&255,H[I++]=255&n,H[I++]=o>>>24,H[I++]=o>>>16&255,H[I++]=o>>>8&255,H[I++]=255&o}return c||(H=g(H,h)),H}function e(a){for(var b,c,d,e=new Array(0,4,536870912,536870916,65536,65540,536936448,536936452,512,516,536871424,536871428,66048,66052,536936960,536936964),f=new Array(0,1,1048576,1048577,67108864,67108865,68157440,68157441,256,257,1048832,1048833,67109120,67109121,68157696,68157697),g=new Array(0,8,2048,2056,16777216,16777224,16779264,16779272,0,8,2048,2056,16777216,16777224,16779264,16779272),h=new Array(0,2097152,134217728,136314880,8192,2105344,134225920,136323072,131072,2228224,134348800,136445952,139264,2236416,134356992,136454144),i=new Array(0,262144,16,262160,0,262144,16,262160,4096,266240,4112,266256,4096,266240,4112,266256),j=new Array(0,1024,32,1056,0,1024,32,1056,33554432,33555456,33554464,33555488,33554432,33555456,33554464,33555488),k=new Array(0,268435456,524288,268959744,2,268435458,524290,268959746,0,268435456,524288,268959744,2,268435458,524290,268959746),l=new Array(0,65536,2048,67584,536870912,536936448,536872960,536938496,131072,196608,133120,198656,537001984,537067520,537004032,537069568),m=new Array(0,262144,0,262144,2,262146,2,262146,33554432,33816576,33554432,33816576,33554434,33816578,33554434,33816578),n=new Array(0,268435456,8,268435464,0,268435456,8,268435464,1024,268436480,1032,268436488,1024,268436480,1032,268436488),o=new Array(0,32,0,32,1048576,1048608,1048576,1048608,8192,8224,8192,8224,1056768,1056800,1056768,1056800),p=new Array(0,16777216,512,16777728,2097152,18874368,2097664,18874880,67108864,83886080,67109376,83886592,69206016,85983232,69206528,85983744),q=new Array(0,4096,134217728,134221824,524288,528384,134742016,134746112,16,4112,134217744,134221840,524304,528400,134742032,134746128),r=new Array(0,4,256,260,0,4,256,260,1,5,257,261,1,5,257,261),s=a.length>8?3:1,t=new Array(32*s),u=new Array(0,0,1,1,1,1,1,1,0,1,1,1,1,1,1,0),v=0,w=0,x=0;x<s;x++){var y=a[v++]<<24|a[v++]<<16|a[v++]<<8|a[v++],z=a[v++]<<24|a[v++]<<16|a[v++]<<8|a[v++];d=252645135&(y>>>4^z),z^=d,y^=d<<4,d=65535&(z>>>-16^y),y^=d,z^=d<<-16,d=858993459&(y>>>2^z),z^=d,y^=d<<2,d=65535&(z>>>-16^y),y^=d,z^=d<<-16,d=1431655765&(y>>>1^z),z^=d,y^=d<<1,d=16711935&(z>>>8^y),y^=d,z^=d<<8,d=1431655765&(y>>>1^z),z^=d,y^=d<<1,d=y<<8|z>>>20&240,y=z<<24|z<<8&16711680|z>>>8&65280|z>>>24&240,z=d;for(var A=0;A<u.length;A++)u[A]?(y=y<<2|y>>>26,z=z<<2|z>>>26):(y=y<<1|y>>>27,z=z<<1|z>>>27),y&=-15,z&=-15,b=e[y>>>28]|f[y>>>24&15]|g[y>>>20&15]|h[y>>>16&15]|i[y>>>12&15]|j[y>>>8&15]|k[y>>>4&15],c=l[z>>>28]|m[z>>>24&15]|n[z>>>20&15]|o[z>>>16&15]|p[z>>>12&15]|q[z>>>8&15]|r[z>>>4&15],d=65535&(c>>>16^b),t[w++]=b^d,t[w++]=c^d<<16}return t}function f(a,b){var c,d=8-a.length%8;if(2===b&&d<8)c=" ".charCodeAt(0);else if(1===b)c=d;else{if(b||!(d<8)){if(8===d)return a;throw new Error("des: invalid padding")}c=0}for(var e=new Uint8Array(a.length+d),f=0;f<a.length;f++)e[f]=a[f];for(var g=0;g<d;g++)e[a.length+g]=c;return e}function g(a,b){var c,d=null;if(2===b)c=" ".charCodeAt(0);else if(1===b)d=a[a.length-1];else{if(b)throw new Error("des: invalid padding");c=0}if(!d){for(d=1;a[a.length-d]===c;)d++;d--}return a.subarray(0,a.length-d)}function h(a){this.key=[];for(var b=0;b<3;b++)this.key.push(new Uint8Array(a.subarray(8*b,8*b+8)));this.encrypt=function(a){return d(e(this.key[2]),d(e(this.key[1]),d(e(this.key[0]),a,!0,0,null,null),!1,0,null,null),!0,0,null,null)}}function i(a){this.key=a,this.encrypt=function(a,b){var c=e(this.key);return d(c,a,!0,0,null,b)},this.decrypt=function(a,b){var c=e(this.key);return d(c,a,!1,0,null,b)}}Object.defineProperty(c,"__esModule",{value:!0}),h.keySize=h.prototype.keySize=24,h.blockSize=h.prototype.blockSize=8,c["default"]={des:h,originalDes:i}},{}],16:[function(a,b,c){"use strict";function d(a){return a&&a.__esModule?a:{"default":a}}Object.defineProperty(c,"__esModule",{value:!0});var e=a("./aes.js"),f=d(e),g=a("./des.js"),h=d(g),i=a("./cast5.js"),j=d(i),k=a("./twofish.js"),l=d(k),m=a("./blowfish.js"),n=d(m);c["default"]={aes128:f["default"][128],aes192:f["default"][192],aes256:f["default"][256],des:h["default"].originalDes,tripledes:h["default"].des,cast5:j["default"],twofish:l["default"],blowfish:n["default"],idea:function(){throw new Error("IDEA symmetric-key algorithm not implemented")}}},{"./aes.js":12,"./blowfish.js":13,"./cast5.js":14,"./des.js":15,"./twofish.js":17}],17:[function(a,b,c){"use strict";function d(a,b){return(a<<b|a>>>32-b)&k}function e(a,b){return a[b]|a[b+1]<<8|a[b+2]<<16|a[b+3]<<24}function f(a,b,c){a.splice(b,4,255&c,c>>>8&255,c>>>16&255,c>>>24&255)}function g(a,b){return a>>>8*b&255}function h(){function a(a){function b(a){return a^a>>2^[0,90,180,238][3&a]}function c(a){return a^a>>1^a>>2^[0,238,180,90][3&a]}function f(a,b){var c,d,e;for(c=0;c<8;c++)d=b>>>24,b=b<<8&k|a>>>24,a=a<<8&k,e=d<<1,128&d&&(e^=333),b^=d^e<<16,e^=d>>>1,1&d&&(e^=166),b^=e<<24|e<<8;return b}function h(a,b){var c,d,e,f;return c=b>>4,d=15&b,e=A[a][c^d],f=B[a][E[d]^F[c]],D[a][E[f]^F[e]]<<4|C[a][e^f]}function i(a,b){var c=g(a,0),d=g(a,1),e=g(a,2),f=g(a,3);switch(q){case 4:c=G[1][c]^g(b[3],0),d=G[0][d]^g(b[3],1),e=G[0][e]^g(b[3],2),f=G[1][f]^g(b[3],3);case 3:c=G[1][c]^g(b[2],0),d=G[1][d]^g(b[2],1),e=G[0][e]^g(b[2],2),f=G[0][f]^g(b[2],3);case 2:c=G[0][G[0][c]^g(b[1],0)]^g(b[0],0),d=G[0][G[1][d]^g(b[1],1)]^g(b[0],1),e=G[1][G[0][e]^g(b[1],2)]^g(b[0],2),f=G[1][G[1][f]^g(b[1],3)]^g(b[0],3)}return H[0][c]^H[1][d]^H[2][e]^H[3][f]}o=a;var j,l,m,n,p,q,r,u,v,w=[],x=[],y=[],z=[],A=[[8,1,7,13,6,15,3,2,0,11,5,9,14,12,10,4],[2,8,11,13,15,7,6,14,3,1,9,4,0,10,12,5]],B=[[14,12,11,8,1,2,3,5,15,4,10,6,7,0,9,13],[1,14,2,11,4,12,3,7,6,13,10,5,15,9,0,8]],C=[[11,10,5,14,6,13,9,0,12,8,15,3,2,4,7,1],[4,12,7,5,1,6,9,10,0,14,13,8,2,11,3,15]],D=[[13,7,15,4,1,2,6,14,9,11,3,0,8,5,12,10],[11,9,5,1,12,3,13,14,6,4,7,15,2,0,8,10]],E=[0,8,1,9,2,10,3,11,4,12,5,13,6,14,7,15],F=[0,9,2,11,4,13,6,15,8,1,10,3,12,5,14,7],G=[[],[]],H=[[],[],[],[]];for(o=o.slice(0,32),j=o.length;16!==j&&24!==j&&32!==j;)o[j++]=0;for(j=0;j<o.length;j+=4)y[j>>2]=e(o,j);for(j=0;j<256;j++)G[0][j]=h(0,j),G[1][j]=h(1,j);for(j=0;j<256;j++)r=G[1][j],u=b(r),v=c(r),H[0][j]=r+(u<<8)+(v<<16)+(v<<24),H[2][j]=u+(v<<8)+(r<<16)+(v<<24),r=G[0][j],u=b(r),v=c(r),H[1][j]=v+(v<<8)+(u<<16)+(r<<24),H[3][j]=u+(r<<8)+(v<<16)+(u<<24);for(q=y.length/2,j=0;j<q;j++)l=y[j+j],w[j]=l,m=y[j+j+1],x[j]=m,z[q-j-1]=f(l,m);for(j=0;j<40;j+=2)l=16843009*j,m=l+16843009,l=i(l,w),m=d(i(m,x),8),s[j]=l+m&k,s[j+1]=d(l+2*m,9);for(j=0;j<256;j++)switch(l=m=n=p=j,q){case 4:l=G[1][l]^g(z[3],0),m=G[0][m]^g(z[3],1),n=G[0][n]^g(z[3],2),p=G[1][p]^g(z[3],3);case 3:l=G[1][l]^g(z[2],0),m=G[1][m]^g(z[2],1),n=G[0][n]^g(z[2],2),p=G[0][p]^g(z[2],3);case 2:t[0][j]=H[0][G[0][G[0][l]^g(z[1],0)]^g(z[0],0)],t[1][j]=H[1][G[0][G[1][m]^g(z[1],1)]^g(z[0],1)],t[2][j]=H[2][G[1][G[0][n]^g(z[1],2)]^g(z[0],2)],t[3][j]=H[3][G[1][G[1][p]^g(z[1],3)]^g(z[0],3)]}}function b(a){return t[0][g(a,0)]^t[1][g(a,1)]^t[2][g(a,2)]^t[3][g(a,3)]}function c(a){return t[0][g(a,3)]^t[1][g(a,0)]^t[2][g(a,1)]^t[3][g(a,2)]}function h(a,e){var f=b(e[0]),g=c(e[1]);e[2]=d(e[2]^f+g+s[4*a+8]&k,31),e[3]=d(e[3],1)^f+2*g+s[4*a+9]&k,f=b(e[2]),g=c(e[3]),e[0]=d(e[0]^f+g+s[4*a+10]&k,31),e[1]=d(e[1],1)^f+2*g+s[4*a+11]&k}function i(a,e){var f=b(e[0]),g=c(e[1]);e[2]=d(e[2],1)^f+g+s[4*a+10]&k,e[3]=d(e[3]^f+2*g+s[4*a+11]&k,31),f=b(e[2]),g=c(e[3]),e[0]=d(e[0],1)^f+g+s[4*a+8]&k,e[1]=d(e[1]^f+2*g+s[4*a+9]&k,31)}function j(){s=[],t=[[],[],[],[]]}function l(a,b){p=a,q=b;for(var c=[e(p,q)^s[0],e(p,q+4)^s[1],e(p,q+8)^s[2],e(p,q+12)^s[3]],d=0;d<8;d++)h(d,c);return f(p,q,c[2]^s[4]),f(p,q+4,c[3]^s[5]),f(p,q+8,c[0]^s[6]),f(p,q+12,c[1]^s[7]),q+=16,p}function m(a,b){p=a,q=b;for(var c=[e(p,q)^s[4],e(p,q+4)^s[5],e(p,q+8)^s[6],e(p,q+12)^s[7]],d=7;d>=0;d--)i(d,c);f(p,q,c[2]^s[0]),f(p,q+4,c[3]^s[1]),f(p,q+8,c[0]^s[2]),f(p,q+12,c[1]^s[3]),q+=16}function n(){return p}var o=null,p=null,q=-1,r=null;r="twofish";var s=[],t=[[],[],[],[]];return{name:"twofish",blocksize:16,open:a,close:j,encrypt:l,decrypt:m,finalize:n}}function i(a){this.tf=h(),this.tf.open(j(a),0),this.encrypt=function(a){return this.tf.encrypt(j(a),0)}}function j(a){for(var b=[],c=0;c<a.length;c++)b[c]=a[c];return b}Object.defineProperty(c,"__esModule",{value:!0}),c["default"]=i;var k=4294967295;i.keySize=i.prototype.keySize=32,i.blockSize=i.prototype.blockSize=16},{}],18:[function(a,b,c){"use strict";function d(a){return a&&a.__esModule?a:{"default":a}}Object.defineProperty(c,"__esModule",{value:!0});var e=a("./random.js"),f=d(e),g=a("./cipher"),h=d(g),i=a("./public_key"),j=d(i),k=a("../type/mpi.js"),l=d(k);c["default"]={publicKeyEncrypt:function(a,b,c){var d=function(){var d;switch(a){case"rsa_encrypt":case"rsa_encrypt_sign":var e=new j["default"].rsa,f=b[0].toBigInteger(),g=b[1].toBigInteger();return d=c.toBigInteger(),[e.encrypt(d,g,f)];case"elgamal":var h=new j["default"].elgamal,i=b[0].toBigInteger(),k=b[1].toBigInteger(),l=b[2].toBigInteger();return d=c.toBigInteger(),h.encrypt(d,k,i,l);default:return[]}}();return d.map(function(a){var b=new l["default"];return b.fromBigInteger(a),b})},publicKeyDecrypt:function(a,b,c){var d,e=function(){switch(a){case"rsa_encrypt_sign":case"rsa_encrypt":var e=new j["default"].rsa,f=b[0].toBigInteger(),g=b[1].toBigInteger(),h=b[2].toBigInteger();d=b[3].toBigInteger();var i=b[4].toBigInteger(),k=b[5].toBigInteger(),l=c[0].toBigInteger();return e.decrypt(l,f,g,h,d,i,k);case"elgamal":var m=new j["default"].elgamal,n=b[3].toBigInteger(),o=c[0].toBigInteger(),p=c[1].toBigInteger();return d=b[0].toBigInteger(),m.decrypt(o,p,d,n);default:return null}}(),f=new l["default"];return f.fromBigInteger(e),f},getPrivateMpiCount:function(a){switch(a){case"rsa_encrypt":case"rsa_encrypt_sign":case"rsa_sign":return 4;case"elgamal":return 1;case"dsa":return 1;default:throw new Error("Unknown algorithm")}},getPublicMpiCount:function(a){switch(a){case"rsa_encrypt":case"rsa_encrypt_sign":case"rsa_sign":return 2;case"elgamal":return 3;case"dsa":return 4;default:throw new Error("Unknown algorithm.")}},generateMpi:function(a,b){function c(a){return a.map(function(a){var b=new l["default"];return b.fromBigInteger(a),b})}switch(a){case"rsa_encrypt":case"rsa_encrypt_sign":case"rsa_sign":var d=new j["default"].rsa;return d.generate(b,"10001").then(function(a){var b=[];return b.push(a.n),b.push(a.ee),b.push(a.d),b.push(a.p),b.push(a.q),b.push(a.u),c(b)});default:throw new Error("Unsupported algorithm for key generation.")}},getPrefixRandom:function(a){return f["default"].getRandomBytes(h["default"][a].blockSize)},generateSessionKey:function(a){return f["default"].getRandomBytes(h["default"][a].keySize)}}},{"../type/mpi.js":67,"./cipher":16,"./public_key":28,"./random.js":31}],19:[function(a,b,c){"use strict";function d(a){return a&&a.__esModule?a:{"default":a}}function e(a,b,c,d){return"aes"!==a.substr(0,3)?Promise.reject(new Error("GCM mode supports only AES cipher")):q&&n["default"].use_native&&24!==c.length?g(b,c,d):r&&n["default"].use_native?i(b,c,d):Promise.resolve(p["default"].AES_GCM.encrypt(b,c,d))}function f(a,b,c,d){return"aes"!==a.substr(0,3)?Promise.reject(new Error("GCM mode supports only AES cipher")):q&&n["default"].use_native&&24!==c.length?h(b,c,d):r&&n["default"].use_native?j(b,c,d):Promise.resolve(p["default"].AES_GCM.decrypt(b,c,d))}function g(a,b,c){return q.importKey("raw",b,{name:u},!1,["encrypt"]).then(function(b){return q.encrypt({name:u,iv:c},b,a)}).then(function(a){return new Uint8Array(a)})}function h(a,b,c){return q.importKey("raw",b,{name:u},!1,["decrypt"]).then(function(b){return q.decrypt({name:u,iv:c},b,a)}).then(function(a){return new Uint8Array(a)})}function i(a,b,c){a=new s(a),b=new s(b),c=new s(c);var d=new r.createCipheriv("aes-"+8*b.length+"-gcm",b,c),e=s.concat([d.update(a),d["final"](),d.getAuthTag()]);return Promise.resolve(new Uint8Array(e))}function j(a,b,c){a=new s(a),b=new s(b),c=new s(c);var d=new r.createDecipheriv("aes-"+8*b.length+"-gcm",b,c);d.setAuthTag(a.slice(a.length-t,a.length));var e=s.concat([d.update(a.slice(0,a.length-t)),d["final"]()]);return Promise.resolve(new Uint8Array(e))}Object.defineProperty(c,"__esModule",{value:!0}),c.ivLength=void 0,c.encrypt=e,c.decrypt=f;var k=a("../util.js"),l=d(k),m=a("../config"),n=d(m),o=a("asmcrypto-lite"),p=d(o),q=l["default"].getWebCrypto(),r=l["default"].getNodeCrypto(),s=l["default"].getNodeBuffer(),t=(c.ivLength=12,16),u="AES-GCM"},{"../config":10,"../util.js":69,"asmcrypto-lite":1}],20:[function(a,b,c){"use strict";function d(a){return a&&a.__esModule?a:{"default":a}}function e(a){return function(b){var c=t.createHash(a);return c.update(new u(b)),new Uint8Array(c.digest())}}Object.defineProperty(c,"__esModule",{value:!0});var f,g=a("./sha.js"),h=d(g),i=a("asmcrypto-lite"),j=d(i),k=a("rusha"),l=d(k),m=a("./md5.js"),n=d(m),o=a("./ripe-md.js"),p=d(o),q=a("../../util.js"),r=d(q),s=new l["default"],t=r["default"].getNodeCrypto(),u=r["default"].getNodeBuffer();f=t?{md5:e("md5"),sha1:e("sha1"),sha224:e("sha224"),sha256:e("sha256"),sha384:e("sha384"),sha512:e("sha512"),ripemd:e("ripemd160")}:{md5:n["default"],sha1:function(a){return r["default"].str2Uint8Array(r["default"].hex2bin(s.digest(a)))},sha224:h["default"].sha224,sha256:j["default"].SHA256.bytes,sha384:h["default"].sha384,sha512:h["default"].sha512,ripemd:p["default"]},c["default"]={md5:f.md5,sha1:f.sha1,sha224:f.sha224,sha256:f.sha256,sha384:f.sha384,sha512:f.sha512,ripemd:f.ripemd,digest:function(a,b){switch(a){case 1:return this.md5(b);case 2:return this.sha1(b);case 3:return this.ripemd(b);case 8:return this.sha256(b);case 9:return this.sha384(b);case 10:return this.sha512(b);case 11:return this.sha224(b);default:throw new Error("Invalid hash function.")}},getHashByteLength:function(a){switch(a){case 1:return 16;case 2:case 3:return 20;case 8:return 32;case 9:return 48;case 10:return 64;case 11:return 28;default:throw new Error("Invalid hash algorithm.")}}}},{"../../util.js":69,"./md5.js":21,"./ripe-md.js":22,"./sha.js":23,"asmcrypto-lite":1,rusha:4}],21:[function(a,b,c){"use strict";function d(a){return a&&a.__esModule?a:{"default":a}}function e(a,b){var c=a[0],d=a[1],e=a[2],f=a[3];c=g(c,d,e,f,b[0],7,-680876936),f=g(f,c,d,e,b[1],12,-389564586),e=g(e,f,c,d,b[2],17,606105819),d=g(d,e,f,c,b[3],22,-1044525330),c=g(c,d,e,f,b[4],7,-176418897),f=g(f,c,d,e,b[5],12,1200080426),e=g(e,f,c,d,b[6],17,-1473231341),d=g(d,e,f,c,b[7],22,-45705983),c=g(c,d,e,f,b[8],7,1770035416),f=g(f,c,d,e,b[9],12,-1958414417),e=g(e,f,c,d,b[10],17,-42063),d=g(d,e,f,c,b[11],22,-1990404162),c=g(c,d,e,f,b[12],7,1804603682),f=g(f,c,d,e,b[13],12,-40341101),e=g(e,f,c,d,b[14],17,-1502002290),d=g(d,e,f,c,b[15],22,1236535329),c=h(c,d,e,f,b[1],5,-165796510),f=h(f,c,d,e,b[6],9,-1069501632),e=h(e,f,c,d,b[11],14,643717713),d=h(d,e,f,c,b[0],20,-373897302),c=h(c,d,e,f,b[5],5,-701558691),f=h(f,c,d,e,b[10],9,38016083),e=h(e,f,c,d,b[15],14,-660478335),d=h(d,e,f,c,b[4],20,-405537848),c=h(c,d,e,f,b[9],5,568446438),f=h(f,c,d,e,b[14],9,-1019803690),e=h(e,f,c,d,b[3],14,-187363961),d=h(d,e,f,c,b[8],20,1163531501),c=h(c,d,e,f,b[13],5,-1444681467),f=h(f,c,d,e,b[2],9,-51403784),e=h(e,f,c,d,b[7],14,1735328473),d=h(d,e,f,c,b[12],20,-1926607734),c=i(c,d,e,f,b[5],4,-378558),f=i(f,c,d,e,b[8],11,-2022574463),e=i(e,f,c,d,b[11],16,1839030562),d=i(d,e,f,c,b[14],23,-35309556),c=i(c,d,e,f,b[1],4,-1530992060),f=i(f,c,d,e,b[4],11,1272893353),e=i(e,f,c,d,b[7],16,-155497632),d=i(d,e,f,c,b[10],23,-1094730640),c=i(c,d,e,f,b[13],4,681279174),f=i(f,c,d,e,b[0],11,-358537222),e=i(e,f,c,d,b[3],16,-722521979),d=i(d,e,f,c,b[6],23,76029189),c=i(c,d,e,f,b[9],4,-640364487),f=i(f,c,d,e,b[12],11,-421815835),e=i(e,f,c,d,b[15],16,530742520),d=i(d,e,f,c,b[2],23,-995338651),c=j(c,d,e,f,b[0],6,-198630844),f=j(f,c,d,e,b[7],10,1126891415),e=j(e,f,c,d,b[14],15,-1416354905),d=j(d,e,f,c,b[5],21,-57434055),c=j(c,d,e,f,b[12],6,1700485571),f=j(f,c,d,e,b[3],10,-1894986606),e=j(e,f,c,d,b[10],15,-1051523),d=j(d,e,f,c,b[1],21,-2054922799),c=j(c,d,e,f,b[8],6,1873313359),f=j(f,c,d,e,b[15],10,-30611744),e=j(e,f,c,d,b[6],15,-1560198380),d=j(d,e,f,c,b[13],21,1309151649),c=j(c,d,e,f,b[4],6,-145523070),f=j(f,c,d,e,b[11],10,-1120210379),e=j(e,f,c,d,b[2],15,718787259),d=j(d,e,f,c,b[9],21,-343485551),a[0]=p(c,a[0]),a[1]=p(d,a[1]),a[2]=p(e,a[2]),a[3]=p(f,a[3])}function f(a,b,c,d,e,f){return b=p(p(b,a),p(d,f)),p(b<<e|b>>>32-e,c)}function g(a,b,c,d,e,g,h){return f(b&c|~b&d,a,b,e,g,h)}function h(a,b,c,d,e,g,h){return f(b&d|c&~d,a,b,e,g,h)}function i(a,b,c,d,e,g,h){return f(b^c^d,a,b,e,g,h)}function j(a,b,c,d,e,g,h){return f(c^(b|~d),a,b,e,g,h)}function k(a){var b,c=a.length,d=[1732584193,-271733879,-1732584194,271733878];for(b=64;b<=a.length;b+=64)e(d,l(a.substring(b-64,b)));a=a.substring(b-64);var f=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];for(b=0;b<a.length;b++)f[b>>2]|=a.charCodeAt(b)<<(b%4<<3);if(f[b>>2]|=128<<(b%4<<3),b>55)for(e(d,f),b=0;b<16;b++)f[b]=0;return f[14]=8*c,e(d,f),d}function l(a){var b,c=[];for(b=0;b<64;b+=4)c[b>>2]=a.charCodeAt(b)+(a.charCodeAt(b+1)<<8)+(a.charCodeAt(b+2)<<16)+(a.charCodeAt(b+3)<<24);return c}function m(a){for(var b="",c=0;c<4;c++)b+=s[a>>8*c+4&15]+s[a>>8*c&15];return b}function n(a){for(var b=0;b<a.length;b++)a[b]=m(a[b]);return a.join("")}function o(a){return n(k(a))}function p(a,b){return a+b&4294967295}Object.defineProperty(c,"__esModule",{value:!0}),c["default"]=function(a){var b=o(r["default"].Uint8Array2str(a)),c=r["default"].str2Uint8Array(r["default"].hex2bin(b));return c};var q=a("../../util.js"),r=d(q),s="0123456789abcdef".split("")},{"../../util.js":69}],22:[function(a,b,c){"use strict";function d(a){return a&&a.__esModule?a:{"default":a}}function e(a,b){return new Number(a<<b|a>>>32-b)}function f(a,b,c){return new Number(a^b^c)}function g(a,b,c){return new Number(a&b|~a&c)}function h(a,b,c){return new Number((a|~b)^c)}function i(a,b,c){return new Number(a&c|b&~c)}function j(a,b,c){return new Number(a^(b|~c))}function k(a,b,c,d,k,l,m,n){switch(n){case 0:a+=f(b,c,d)+l+0;break;case 1:a+=g(b,c,d)+l+1518500249;break;case 2:a+=h(b,c,d)+l+1859775393;break;case 3:a+=i(b,c,d)+l+2400959708;break;case 4:a+=j(b,c,d)+l+2840853838;break;case 5:a+=j(b,c,d)+l+1352829926;break;case 6:a+=i(b,c,d)+l+1548603684;break;case 7:a+=h(b,c,d)+l+1836072691;break;case 8:a+=g(b,c,d)+l+2053994217;break;case 9:a+=f(b,c,d)+l+0;break;default:throw new Error("Bogus round number")}a=e(a,m)+k,c=e(c,10),a&=4294967295,b&=4294967295,c&=4294967295,d&=4294967295,k&=4294967295;var o=[];return o[0]=a,o[1]=b,o[2]=c,o[3]=d,o[4]=k,o[5]=l,o[6]=m,o}function l(a){a[0]=1732584193,a[1]=4023233417,a[2]=2562383102,a[3]=271733878,a[4]=3285377520}function m(a,b){var c,d,e,f=[],g=[];for(d=0;d<5;d++)f[d]=new Number(a[d]),g[d]=new Number(a[d]);var h=0;for(e=0;e<5;e++)for(d=0;d<16;d++)c=k(f[(h+0)%5],f[(h+1)%5],f[(h+2)%5],f[(h+3)%5],f[(h+4)%5],b[w[e][d]],v[e][d],e),f[(h+0)%5]=c[0],f[(h+1)%5]=c[1],f[(h+2)%5]=c[2],f[(h+3)%5]=c[3],f[(h+4)%5]=c[4],h+=4;for(h=0,e=5;e<10;e++)for(d=0;d<16;d++)c=k(g[(h+0)%5],g[(h+1)%5],g[(h+2)%5],g[(h+3)%5],g[(h+4)%5],b[w[e][d]],v[e][d],e),g[(h+0)%5]=c[0],g[(h+1)%5]=c[1],g[(h+2)%5]=c[2],g[(h+3)%5]=c[3],g[(h+4)%5]=c[4],h+=4;g[3]+=f[2]+a[1],a[1]=a[2]+f[3]+g[4],a[2]=a[3]+f[4]+g[0],a[3]=a[4]+f[0]+g[1],a[4]=a[0]+f[1]+g[2],a[0]=g[3]}function n(a){for(var b=0;b<16;b++)a[b]=0}function o(a,b,c,d){var e=new Array(16);n(e);for(var f=0,g=0;g<(63&c);g++)e[g>>>2]^=(255&b.charCodeAt(f++))<<8*(3&g);e[c>>>2&15]^=1<<8*(3&c)+7,(63&c)>55&&(m(a,e),e=new Array(16),n(e)),e[14]=c<<3,e[15]=c>>>29|d<<3,m(a,e)}function p(a){var b=(255&a.charCodeAt(3))<<24;return b|=(255&a.charCodeAt(2))<<16,b|=(255&a.charCodeAt(1))<<8,b|=255&a.charCodeAt(0)}function q(a){var b,c,d=new Array(u/32),e=new Array(u/8);l(d),b=a.length;var f=new Array(16);n(f);var g,h=0;for(c=b;c>63;c-=64){for(g=0;g<16;g++)f[g]=p(a.substr(h,4)),h+=4;m(d,f)}for(o(d,a.substr(h),b,0),g=0;g<u/8;g+=4)e[g]=255&d[g>>>2],e[g+1]=d[g>>>2]>>>8&255,e[g+2]=d[g>>>2]>>>16&255,e[g+3]=d[g>>>2]>>>24&255;return e}function r(a){for(var b=q(t["default"].Uint8Array2str(a)),c="",d=0;d<u/8;d++)c+=String.fromCharCode(b[d]);return t["default"].str2Uint8Array(c)}Object.defineProperty(c,"__esModule",{value:!0}),c["default"]=r;var s=a("../../util.js"),t=d(s),u=160,v=[[11,14,15,12,5,8,7,9,11,13,14,15,6,7,9,8],[7,6,8,13,11,9,7,15,7,12,15,9,11,7,13,12],[11,13,6,7,14,9,13,15,14,8,13,6,5,12,7,5],[11,12,14,15,14,15,9,8,9,14,5,6,8,6,5,12],[9,15,5,11,6,8,13,12,5,12,13,14,11,8,5,6],[8,9,9,11,13,15,15,5,7,7,8,11,14,14,12,6],[9,13,15,7,12,8,9,11,7,7,12,7,6,15,13,11],[9,7,15,11,8,6,6,14,12,13,5,14,13,13,7,5],[15,5,8,11,14,14,6,14,6,9,12,9,12,5,15,8],[8,5,12,9,12,5,14,6,8,13,6,5,15,13,11,11]],w=[[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15],[7,4,13,1,10,6,15,3,12,0,9,5,2,14,11,8],[3,10,14,4,9,15,8,1,2,7,0,6,13,11,5,12],[1,9,11,10,0,8,12,4,13,3,7,15,14,5,6,2],[4,0,5,9,7,12,2,10,14,1,3,8,11,6,15,13],[5,14,7,0,9,2,11,4,13,6,15,8,1,10,3,12],[6,11,3,7,0,13,5,10,14,15,8,12,4,9,1,2],[15,5,1,3,7,14,6,9,11,8,12,2,10,0,4,13],[8,6,4,1,3,11,15,0,5,12,2,13,9,7,10,14],[12,15,10,4,1,5,8,7,6,2,13,14,0,3,9,11]]},{"../../util.js":69
}],23:[function(a,b,c){"use strict";function d(a,b){this.highOrder=a,this.lowOrder=b}function e(a,b){var c,d,e,f,g=[],h=[],i=0;if("UTF8"===b)for(d=0;d<a.length;d+=1)for(c=a.charCodeAt(d),h=[],128>c?h.push(c):2048>c?(h.push(192|c>>>6),h.push(128|63&c)):55296>c||57344<=c?h.push(224|c>>>12,128|c>>>6&63,128|63&c):(d+=1,c=65536+((1023&c)<<10|1023&a.charCodeAt(d)),h.push(240|c>>>18,128|c>>>12&63,128|c>>>6&63,128|63&c)),e=0;e<h.length;e+=1){for(f=i>>>2;g.length<=f;)g.push(0);g[f]|=h[e]<<24-8*(i%4),i+=1}else if("UTF16BE"===b||"UTF16LE"===b)for(d=0;d<a.length;d+=1){for(c=a.charCodeAt(d),"UTF16LE"===b&&(e=255&c,c=e<<8|c>>8),f=i>>>2;g.length<=f;)g.push(0);g[f]|=c<<16-8*(i%4),i+=2}return{value:g,binLen:8*i}}function f(a){var b,c,d,e=[],f=a.length;if(0!==f%2)throw"String of HEX type must be in byte increments";for(b=0;b<f;b+=2){if(c=parseInt(a.substr(b,2),16),isNaN(c))throw"String of HEX type contains invalid characters";for(d=b>>>3;e.length<=d;)e.push(0);e[b>>>3]|=c<<24-4*(b%8)}return{value:e,binLen:4*f}}function g(a){var b,c,d,e=[];for(c=0;c<a.length;c+=1)b=a.charCodeAt(c),d=c>>>2,e.length<=d&&e.push(0),e[d]|=b<<24-8*(c%4);return{value:e,binLen:8*a.length}}function h(a){var b,c,d,e=[];for(c=0;c<a.length;c+=1)b=a[c],d=c>>>2,e.length<=d&&e.push(0),e[d]|=b<<24-8*(c%4);return{value:e,binLen:8*a.length}}function i(a){var b,c,d,e,f,g,h,i=[],j=0,k="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";if(-1===a.search(/^[a-zA-Z0-9=+\/]+$/))throw"Invalid character in base-64 string";if(g=a.indexOf("="),a=a.replace(/\=/g,""),-1!==g&&g<a.length)throw"Invalid '=' found in base-64 string";for(c=0;c<a.length;c+=4){for(f=a.substr(c,4),e=0,d=0;d<f.length;d+=1)b=k.indexOf(f[d]),e|=b<<18-6*d;for(d=0;d<f.length-1;d+=1){for(h=j>>>2;i.length<=h;)i.push(0);i[h]|=(e>>>16-8*d&255)<<24-8*(j%4),j+=1}}return{value:i,binLen:8*j}}function j(a,b){var c,d,e="0123456789abcdef",f="",g=4*a.length;for(c=0;c<g;c+=1)d=a[c>>>2]>>>8*(3-c%4),f+=e.charAt(d>>>4&15)+e.charAt(15&d);return b.outputUpper?f.toUpperCase():f}function k(a,b){var c,d,e,f,g,h,i="",j=4*a.length,k="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";for(c=0;c<j;c+=3)for(f=c+1>>>2,g=a.length<=f?0:a[f],f=c+2>>>2,h=a.length<=f?0:a[f],e=(a[c>>>2]>>>8*(3-c%4)&255)<<16|(g>>>8*(3-(c+1)%4)&255)<<8|h>>>8*(3-(c+2)%4)&255,d=0;d<4;d+=1)i+=8*c+6*d<=32*a.length?k.charAt(e>>>6*(3-d)&63):b.b64Pad;return i}function l(a,b){var c,d,e="",f=4*a.length;for(c=0;c<f;c+=1)d=a[c>>>2]>>>8*(3-c%4)&255,e+=String.fromCharCode(d);return e}function m(a,b){var c,d=4*a.length,e=new Uint8Array(d);for(c=0;c<d;c+=1)e[c]=a[c>>>2]>>>8*(3-c%4)&255;return e}function n(a){var b={outputUpper:!1,b64Pad:"="};try{a.hasOwnProperty("outputUpper")&&(b.outputUpper=a.outputUpper),a.hasOwnProperty("b64Pad")&&(b.b64Pad=a.b64Pad)}catch(c){}if("boolean"!=typeof b.outputUpper)throw"Invalid outputUpper formatting option";if("string"!=typeof b.b64Pad)throw"Invalid b64Pad formatting option";return b}function o(a,b){return a<<b|a>>>32-b}function p(a,b){return a>>>b|a<<32-b}function q(a,b){var c=null,e=new d(a.highOrder,a.lowOrder);return c=32>=b?new d(e.highOrder>>>b|e.lowOrder<<32-b&4294967295,e.lowOrder>>>b|e.highOrder<<32-b&4294967295):new d(e.lowOrder>>>b-32|e.highOrder<<64-b&4294967295,e.highOrder>>>b-32|e.lowOrder<<64-b&4294967295)}function r(a,b){return a>>>b}function s(a,b){var c=null;return c=32>=b?new d(a.highOrder>>>b,a.lowOrder>>>b|a.highOrder<<32-b&4294967295):new d(0,a.highOrder>>>b-32)}function t(a,b,c){return a^b^c}function u(a,b,c){return a&b^~a&c}function v(a,b,c){return new d(a.highOrder&b.highOrder^~a.highOrder&c.highOrder,a.lowOrder&b.lowOrder^~a.lowOrder&c.lowOrder)}function w(a,b,c){return a&b^a&c^b&c}function x(a,b,c){return new d(a.highOrder&b.highOrder^a.highOrder&c.highOrder^b.highOrder&c.highOrder,a.lowOrder&b.lowOrder^a.lowOrder&c.lowOrder^b.lowOrder&c.lowOrder)}function y(a){return p(a,2)^p(a,13)^p(a,22)}function z(a){var b=q(a,28),c=q(a,34),e=q(a,39);return new d(b.highOrder^c.highOrder^e.highOrder,b.lowOrder^c.lowOrder^e.lowOrder)}function A(a){return p(a,6)^p(a,11)^p(a,25)}function B(a){var b=q(a,14),c=q(a,18),e=q(a,41);return new d(b.highOrder^c.highOrder^e.highOrder,b.lowOrder^c.lowOrder^e.lowOrder)}function C(a){return p(a,7)^p(a,18)^r(a,3)}function D(a){var b=q(a,1),c=q(a,8),e=s(a,7);return new d(b.highOrder^c.highOrder^e.highOrder,b.lowOrder^c.lowOrder^e.lowOrder)}function E(a){return p(a,17)^p(a,19)^r(a,10)}function F(a){var b=q(a,19),c=q(a,61),e=s(a,6);return new d(b.highOrder^c.highOrder^e.highOrder,b.lowOrder^c.lowOrder^e.lowOrder)}function G(a,b){var c=(65535&a)+(65535&b),d=(a>>>16)+(b>>>16)+(c>>>16);return(65535&d)<<16|65535&c}function H(a,b,c,d){var e=(65535&a)+(65535&b)+(65535&c)+(65535&d),f=(a>>>16)+(b>>>16)+(c>>>16)+(d>>>16)+(e>>>16);return(65535&f)<<16|65535&e}function I(a,b,c,d,e){var f=(65535&a)+(65535&b)+(65535&c)+(65535&d)+(65535&e),g=(a>>>16)+(b>>>16)+(c>>>16)+(d>>>16)+(e>>>16)+(f>>>16);return(65535&g)<<16|65535&f}function J(a,b){var c,e,f,g;return c=(65535&a.lowOrder)+(65535&b.lowOrder),e=(a.lowOrder>>>16)+(b.lowOrder>>>16)+(c>>>16),f=(65535&e)<<16|65535&c,c=(65535&a.highOrder)+(65535&b.highOrder)+(e>>>16),e=(a.highOrder>>>16)+(b.highOrder>>>16)+(c>>>16),g=(65535&e)<<16|65535&c,new d(g,f)}function K(a,b,c,e){var f,g,h,i;return f=(65535&a.lowOrder)+(65535&b.lowOrder)+(65535&c.lowOrder)+(65535&e.lowOrder),g=(a.lowOrder>>>16)+(b.lowOrder>>>16)+(c.lowOrder>>>16)+(e.lowOrder>>>16)+(f>>>16),h=(65535&g)<<16|65535&f,f=(65535&a.highOrder)+(65535&b.highOrder)+(65535&c.highOrder)+(65535&e.highOrder)+(g>>>16),g=(a.highOrder>>>16)+(b.highOrder>>>16)+(c.highOrder>>>16)+(e.highOrder>>>16)+(f>>>16),i=(65535&g)<<16|65535&f,new d(i,h)}function L(a,b,c,e,f){var g,h,i,j;return g=(65535&a.lowOrder)+(65535&b.lowOrder)+(65535&c.lowOrder)+(65535&e.lowOrder)+(65535&f.lowOrder),h=(a.lowOrder>>>16)+(b.lowOrder>>>16)+(c.lowOrder>>>16)+(e.lowOrder>>>16)+(f.lowOrder>>>16)+(g>>>16),i=(65535&h)<<16|65535&g,g=(65535&a.highOrder)+(65535&b.highOrder)+(65535&c.highOrder)+(65535&e.highOrder)+(65535&f.highOrder)+(h>>>16),h=(a.highOrder>>>16)+(b.highOrder>>>16)+(c.highOrder>>>16)+(e.highOrder>>>16)+(f.highOrder>>>16)+(g>>>16),j=(65535&h)<<16|65535&g,new d(j,i)}function M(a,b){var c,d,e,f,g,h,i,j,k,l,m=[],n=u,p=t,q=w,r=o,s=G,v=I,x=[1732584193,4023233417,2562383102,271733878,3285377520];for(l=(b+65>>>9<<4)+15;a.length<=l;)a.push(0);for(a[b>>>5]|=128<<24-b%32,a[l]=b,k=a.length,i=0;i<k;i+=16){for(c=x[0],d=x[1],e=x[2],f=x[3],g=x[4],j=0;j<80;j+=1)j<16?m[j]=a[j+i]:m[j]=r(m[j-3]^m[j-8]^m[j-14]^m[j-16],1),h=j<20?v(r(c,5),n(d,e,f),g,1518500249,m[j]):j<40?v(r(c,5),p(d,e,f),g,1859775393,m[j]):j<60?v(r(c,5),q(d,e,f),g,2400959708,m[j]):v(r(c,5),p(d,e,f),g,3395469782,m[j]),g=f,f=e,e=r(d,30),d=c,c=h;x[0]=s(c,x[0]),x[1]=s(d,x[1]),x[2]=s(e,x[2]),x[3]=s(f,x[3]),x[4]=s(g,x[4])}return x}function N(a,b,c){var e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,M,N,P,Q,R,S,T,U,V,W,X,Y,Z,$,_,aa,ba=[],ca=[1116352408,1899447441,3049323471,3921009573,961987163,1508970993,2453635748,2870763221,3624381080,310598401,607225278,1426881987,1925078388,2162078206,2614888103,3248222580,3835390401,4022224774,264347078,604807628,770255983,1249150122,1555081692,1996064986,2554220882,2821834349,2952996808,3210313671,3336571891,3584528711,113926993,338241895,666307205,773529912,1294757372,1396182291,1695183700,1986661051,2177026350,2456956037,2730485921,2820302411,3259730800,3345764771,3516065817,3600352804,4094571909,275423344,430227734,506948616,659060556,883997877,958139571,1322822218,1537002063,1747873779,1955562222,2024104815,2227730452,2361852424,2428436474,2756734187,3204031479,3329325298],da=[3238371032,914150663,812702999,4144912697,4290775857,1750603025,1694076839,3204075428],ea=[1779033703,3144134277,1013904242,2773480762,1359893119,2600822924,528734635,1541459225];if(("SHA-224"===c||"SHA-256"===c)&&2&O)p=64,q=(b+65>>>9<<4)+15,t=16,M=1,X=Number,N=G,P=H,Q=I,R=C,S=E,T=y,U=A,W=w,V=u,o="SHA-224"===c?da:ea;else{if("SHA-384"!==c&&"SHA-512"!==c||!(4&O))throw"Unexpected error in SHA-2 implementation";p=80,q=(b+128>>>10<<5)+31,t=32,M=2,X=d,N=J,P=K,Q=L,R=D,S=F,T=z,U=B,W=x,V=v,ca=[new X(ca[0],3609767458),new X(ca[1],602891725),new X(ca[2],3964484399),new X(ca[3],2173295548),new X(ca[4],4081628472),new X(ca[5],3053834265),new X(ca[6],2937671579),new X(ca[7],3664609560),new X(ca[8],2734883394),new X(ca[9],1164996542),new X(ca[10],1323610764),new X(ca[11],3590304994),new X(ca[12],4068182383),new X(ca[13],991336113),new X(ca[14],633803317),new X(ca[15],3479774868),new X(ca[16],2666613458),new X(ca[17],944711139),new X(ca[18],2341262773),new X(ca[19],2007800933),new X(ca[20],1495990901),new X(ca[21],1856431235),new X(ca[22],3175218132),new X(ca[23],2198950837),new X(ca[24],3999719339),new X(ca[25],766784016),new X(ca[26],2566594879),new X(ca[27],3203337956),new X(ca[28],1034457026),new X(ca[29],2466948901),new X(ca[30],3758326383),new X(ca[31],168717936),new X(ca[32],1188179964),new X(ca[33],1546045734),new X(ca[34],1522805485),new X(ca[35],2643833823),new X(ca[36],2343527390),new X(ca[37],1014477480),new X(ca[38],1206759142),new X(ca[39],344077627),new X(ca[40],1290863460),new X(ca[41],3158454273),new X(ca[42],3505952657),new X(ca[43],106217008),new X(ca[44],3606008344),new X(ca[45],1432725776),new X(ca[46],1467031594),new X(ca[47],851169720),new X(ca[48],3100823752),new X(ca[49],1363258195),new X(ca[50],3750685593),new X(ca[51],3785050280),new X(ca[52],3318307427),new X(ca[53],3812723403),new X(ca[54],2003034995),new X(ca[55],3602036899),new X(ca[56],1575990012),new X(ca[57],1125592928),new X(ca[58],2716904306),new X(ca[59],442776044),new X(ca[60],593698344),new X(ca[61],3733110249),new X(ca[62],2999351573),new X(ca[63],3815920427),new X(3391569614,3928383900),new X(3515267271,566280711),new X(3940187606,3454069534),new X(4118630271,4000239992),new X(116418474,1914138554),new X(174292421,2731055270),new X(289380356,3203993006),new X(460393269,320620315),new X(685471733,587496836),new X(852142971,1086792851),new X(1017036298,365543100),new X(1126000580,2618297676),new X(1288033470,3409855158),new X(1501505948,4234509866),new X(1607167915,987167468),new X(1816402316,1246189591)],o="SHA-384"===c?[new X(3418070365,da[0]),new X(1654270250,da[1]),new X(2438529370,da[2]),new X(355462360,da[3]),new X(1731405415,da[4]),new X(41048885895,da[5]),new X(3675008525,da[6]),new X(1203062813,da[7])]:[new X(ea[0],4089235720),new X(ea[1],2227873595),new X(ea[2],4271175723),new X(ea[3],1595750129),new X(ea[4],2917565137),new X(ea[5],725511199),new X(ea[6],4215389547),new X(ea[7],327033209)]}for(;a.length<=q;)a.push(0);for(a[b>>>5]|=128<<24-b%32,a[q]=b,_=a.length,r=0;r<_;r+=t){for(e=o[0],f=o[1],g=o[2],h=o[3],i=o[4],j=o[5],k=o[6],l=o[7],s=0;s<p;s+=1)s<16?($=s*M+r,Y=a.length<=$?0:a[$],Z=a.length<=$+1?0:a[$+1],ba[s]=new X(Y,Z)):ba[s]=P(S(ba[s-2]),ba[s-7],R(ba[s-15]),ba[s-16]),m=Q(l,U(i),V(i,j,k),ca[s],ba[s]),n=N(T(e),W(e,f,g)),l=k,k=j,j=i,i=N(h,m),h=g,g=f,f=e,e=N(m,n);o[0]=N(e,o[0]),o[1]=N(f,o[1]),o[2]=N(g,o[2]),o[3]=N(h,o[3]),o[4]=N(i,o[4]),o[5]=N(j,o[5]),o[6]=N(k,o[6]),o[7]=N(l,o[7])}if("SHA-224"===c&&2&O)aa=[o[0],o[1],o[2],o[3],o[4],o[5],o[6]];else if("SHA-256"===c&&2&O)aa=o;else if("SHA-384"===c&&4&O)aa=[o[0].highOrder,o[0].lowOrder,o[1].highOrder,o[1].lowOrder,o[2].highOrder,o[2].lowOrder,o[3].highOrder,o[3].lowOrder,o[4].highOrder,o[4].lowOrder,o[5].highOrder,o[5].lowOrder];else{if(!("SHA-512"===c&&4&O))throw"Unexpected error in SHA-2 implementation";aa=[o[0].highOrder,o[0].lowOrder,o[1].highOrder,o[1].lowOrder,o[2].highOrder,o[2].lowOrder,o[3].highOrder,o[3].lowOrder,o[4].highOrder,o[4].lowOrder,o[5].highOrder,o[5].lowOrder,o[6].highOrder,o[6].lowOrder,o[7].highOrder,o[7].lowOrder]}return aa}Object.defineProperty(c,"__esModule",{value:!0});var O=7,P=function(a,b,c){var d=0,o=[0],p="",q=null;if(p=c||"UTF8","UTF8"!==p&&"UTF16BE"!==p&&"UTF16LE"!==p)throw"encoding must be UTF8, UTF16BE, or UTF16LE";if("HEX"===b){if(0!==a.length%2)throw"srcString of HEX type must be in byte increments";q=f(a),d=q.binLen,o=q.value}else if("TEXT"===b||"ASCII"===b)q=e(a,p),d=q.binLen,o=q.value;else if("B64"===b)q=i(a),d=q.binLen,o=q.value;else if("BYTES"===b)q=g(a),d=q.binLen,o=q.value;else{if("TYPED"!==b)throw"inputFormat must be HEX, TEXT, ASCII, B64, BYTES, or TYPED";q=h(a),d=q.binLen,o=q.value}this.getHash=function(a,b,c,e){var f,g=null,h=o.slice(),i=d;if(3===arguments.length?"number"!=typeof c&&(e=c,c=1):2===arguments.length&&(c=1),c!==parseInt(c,10)||1>c)throw"numRounds must a integer >= 1";switch(b){case"HEX":g=j;break;case"B64":g=k;break;case"BYTES":g=l;break;case"TYPED":g=m;break;default:throw"format must be HEX, B64, or BYTES"}if("SHA-1"===a&&1&O)for(f=0;f<c;f+=1)h=M(h,i),i=160;else if("SHA-224"===a&&2&O)for(f=0;f<c;f+=1)h=N(h,i,a),i=224;else if("SHA-256"===a&&2&O)for(f=0;f<c;f+=1)h=N(h,i,a),i=256;else if("SHA-384"===a&&4&O)for(f=0;f<c;f+=1)h=N(h,i,a),i=384;else{if(!("SHA-512"===a&&4&O))throw"Chosen SHA variant is not supported";for(f=0;f<c;f+=1)h=N(h,i,a),i=512}return g(h,n(e))},this.getHMAC=function(a,b,c,h,m){var q,r,s,t,u,v,w,x,y,z=[],A=[],B=null;switch(h){case"HEX":q=j;break;case"B64":q=k;break;case"BYTES":q=l;break;default:throw"outputFormat must be HEX, B64, or BYTES"}if("SHA-1"===c&&1&O)s=64,y=160;else if("SHA-224"===c&&2&O)s=64,y=224;else if("SHA-256"===c&&2&O)s=64,y=256;else if("SHA-384"===c&&4&O)s=128,y=384;else{if(!("SHA-512"===c&&4&O))throw"Chosen SHA variant is not supported";s=128,y=512}if("HEX"===b)B=f(a),x=B.binLen,r=B.value;else if("TEXT"===b||"ASCII"===b)B=e(a,p),x=B.binLen,r=B.value;else if("B64"===b)B=i(a),x=B.binLen,r=B.value;else{if("BYTES"!==b)throw"inputFormat must be HEX, TEXT, ASCII, B64, or BYTES";B=g(a),x=B.binLen,r=B.value}if(t=8*s,w=s/4-1,s<x/8){if("SHA-1"===c&&1&O)r=M(r,x);else{if(!(6&O))throw"Unexpected error in HMAC implementation";r=N(r,x,c)}for(;r.length<=w;)r.push(0);r[w]&=4294967040}else if(s>x/8){for(;r.length<=w;)r.push(0);r[w]&=4294967040}for(u=0;u<=w;u+=1)z[u]=909522486^r[u],A[u]=1549556828^r[u];if("SHA-1"===c&&1&O)v=M(A.concat(M(z.concat(o),t+d)),t+y);else{if(!(6&O))throw"Unexpected error in HMAC implementation";v=N(A.concat(N(z.concat(o),t+d,c)),t+y,c)}return q(v,n(m))}};c["default"]={sha1:function(a){var b=new P(a,"TYPED","UTF8");return b.getHash("SHA-1","TYPED")},sha224:function(a){var b=new P(a,"TYPED","UTF8");return b.getHash("SHA-224","TYPED")},sha256:function(a){var b=new P(a,"TYPED","UTF8");return b.getHash("SHA-256","TYPED")},sha384:function(a){var b=new P(a,"TYPED","UTF8");return b.getHash("SHA-384","TYPED")},sha512:function(a){var b=new P(a,"TYPED","UTF8");return b.getHash("SHA-512","TYPED")}}},{}],24:[function(a,b,c){"use strict";function d(a){if(a&&a.__esModule)return a;var b={};if(null!=a)for(var c in a)Object.prototype.hasOwnProperty.call(a,c)&&(b[c]=a[c]);return b["default"]=a,b}function e(a){return a&&a.__esModule?a:{"default":a}}Object.defineProperty(c,"__esModule",{value:!0});var f=a("./cipher"),g=e(f),h=a("./hash"),i=e(h),j=a("./cfb"),k=e(j),l=a("./gcm"),m=d(l),n=a("./public_key"),o=e(n),p=a("./signature"),q=e(p),r=a("./random"),s=e(r),t=a("./pkcs1"),u=e(t),v=a("./crypto.js"),w=e(v),x={cipher:g["default"],hash:i["default"],cfb:k["default"],gcm:m,publicKey:o["default"],signature:q["default"],random:s["default"],pkcs1:u["default"]};for(var y in w["default"])x[y]=w["default"][y];c["default"]=x},{"./cfb":11,"./cipher":16,"./crypto.js":18,"./gcm":19,"./hash":20,"./pkcs1":25,"./public_key":28,"./random":31,"./signature":32}],25:[function(a,b,c){"use strict";function d(a){return a&&a.__esModule?a:{"default":a}}function e(a){for(var b,c="";c.length<a;)b=g["default"].getSecureRandomOctet(),0!==b&&(c+=String.fromCharCode(b));return c}Object.defineProperty(c,"__esModule",{value:!0});var f=a("./random.js"),g=d(f),h=a("../util.js"),i=d(h),j=a("./public_key/jsbn.js"),k=d(j),l=a("./hash"),m=d(l),n=[];n[1]=[48,32,48,12,6,8,42,134,72,134,247,13,2,5,5,0,4,16],n[2]=[48,33,48,9,6,5,43,14,3,2,26,5,0,4,20],n[3]=[48,33,48,9,6,5,43,36,3,2,1,5,0,4,20],n[8]=[48,49,48,13,6,9,96,134,72,1,101,3,4,2,1,5,0,4,32],n[9]=[48,65,48,13,6,9,96,134,72,1,101,3,4,2,2,5,0,4,48],n[10]=[48,81,48,13,6,9,96,134,72,1,101,3,4,2,3,5,0,4,64],n[11]=[48,45,48,13,6,9,96,134,72,1,101,3,4,2,4,5,0,4,28],c["default"]={eme:{encode:function(a,b){var c=a.length;if(c>b-11)throw new Error("Message too long");var d=e(b-c-3),f=String.fromCharCode(0)+String.fromCharCode(2)+d+String.fromCharCode(0)+a;return f},decode:function(a){0!==a.charCodeAt(0)&&(a=String.fromCharCode(0)+a);for(var b=a.charCodeAt(0),c=a.charCodeAt(1),d=2;0!==a.charCodeAt(d)&&d<a.length;)d++;var e=d-2,f=a.charCodeAt(d++);if(0===b&&2===c&&e>=8&&0===f)return a.substr(d);throw new Error("Decryption error")}},emsa:{encode:function(a,b,c){var d,e=i["default"].Uint8Array2str(m["default"].digest(a,i["default"].str2Uint8Array(b)));if(e.length!==m["default"].getHashByteLength(a))throw new Error("Invalid hash length");var f="";for(d=0;d<n[a].length;d++)f+=String.fromCharCode(n[a][d]);f+=e;var g=f.length;if(c<g+11)throw new Error("Intended encoded message length too short");var h="";for(d=0;d<c-g-3;d++)h+=String.fromCharCode(255);var j=String.fromCharCode(0)+String.fromCharCode(1)+h+String.fromCharCode(0)+f;return new k["default"](i["default"].hexstrdump(j),16)}}}},{"../util.js":69,"./hash":20,"./public_key/jsbn.js":29,"./random.js":31}],26:[function(a,b,c){"use strict";function d(a){return a&&a.__esModule?a:{"default":a}}function e(){function a(a,b,c,d,e,f){for(var h,j,l,n=m["default"].getLeftNBits(m["default"].Uint8Array2str(k["default"].digest(a,m["default"].str2Uint8Array(b))),e.bitLength()),o=new g["default"](m["default"].hexstrdump(n),16);;)if(h=i["default"].getRandomBigIntegerInRange(g["default"].ONE,e.subtract(g["default"].ONE)),j=c.modPow(h,d).mod(e),l=h.modInverse(e).multiply(o.add(f.multiply(j))).mod(e),0!==j&&0!==l)break;var p=[];return p[0]=j.toMPI(),p[1]=l.toMPI(),p}function b(a){var b=o["default"].prefer_hash_algorithm;switch(Math.round(a.bitLength()/8)){case 20:return 2!==b&&b>11&&10!==b&&b<8?2:b;case 28:return b>11&&b<8?11:b;case 32:return b>10&&b<8?8:b;default:return m["default"].print_debug("DSA select hash algorithm: returning null for an unknown length of q"),null}}function c(a,b,c,d,e,f,h,i){var j=m["default"].getLeftNBits(m["default"].Uint8Array2str(k["default"].digest(a,m["default"].str2Uint8Array(d))),f.bitLength()),l=new g["default"](m["default"].hexstrdump(j),16);if(g["default"].ZERO.compareTo(b)>=0||b.compareTo(f)>=0||g["default"].ZERO.compareTo(c)>=0||c.compareTo(f)>=0)return m["default"].print_debug("invalid DSA Signature"),null;var n=c.modInverse(f);if(0===g["default"].ZERO.compareTo(n))return m["default"].print_debug("invalid DSA Signature"),null;var o=l.multiply(n).mod(f),p=b.multiply(n).mod(f);return h.modPow(o,e).multiply(i.modPow(p,e)).mod(e).mod(f)}this.select_hash_algorithm=b,this.sign=a,this.verify=c}Object.defineProperty(c,"__esModule",{value:!0}),c["default"]=e;var f=a("./jsbn.js"),g=d(f),h=a("../random.js"),i=d(h),j=a("../hash"),k=d(j),l=a("../../util.js"),m=d(l),n=a("../../config"),o=d(n)},{"../../config":10,"../../util.js":69,"../hash":20,"../random.js":31,"./jsbn.js":29}],27:[function(a,b,c){"use strict";function d(a){return a&&a.__esModule?a:{"default":a}}function e(){function a(a,b,c,d){var e=c.subtract(g["default"].TWO),f=i["default"].getRandomBigIntegerInRange(g["default"].ONE,e);f=f.mod(e).add(g["default"].ONE);var h=[];return h[0]=b.modPow(f,c),h[1]=d.modPow(f,c).multiply(a).mod(c),h}function b(a,b,c,d){return k["default"].print_debug("Elgamal Decrypt:\nc1:"+k["default"].hexstrdump(a.toMPI())+"\nc2:"+k["default"].hexstrdump(b.toMPI())+"\np:"+k["default"].hexstrdump(c.toMPI())+"\nx:"+k["default"].hexstrdump(d.toMPI())),a.modPow(d,c).modInverse(c).multiply(b).mod(c)}this.encrypt=a,this.decrypt=b}Object.defineProperty(c,"__esModule",{value:!0}),c["default"]=e;var f=a("./jsbn.js"),g=d(f),h=a("../random.js"),i=d(h),j=a("../../util.js"),k=d(j)},{"../../util.js":69,"../random.js":31,"./jsbn.js":29}],28:[function(a,b,c){"use strict";function d(a){return a&&a.__esModule?a:{"default":a}}Object.defineProperty(c,"__esModule",{value:!0});var e=a("./rsa.js"),f=d(e),g=a("./elgamal.js"),h=d(g),i=a("./dsa.js"),j=d(i);c["default"]={rsa:f["default"],elgamal:h["default"],dsa:j["default"]}},{"./dsa.js":26,"./elgamal.js":27,"./rsa.js":30}],29:[function(a,b,c){"use strict";function d(a){return a&&a.__esModule?a:{"default":a}}function e(a,b,c){null!=a&&("number"==typeof a?this.fromNumber(a,b,c):null==b&&"string"!=typeof a?this.fromString(a,256):this.fromString(a,b))}function f(){return new e(null)}function g(a,b,c,d,e,f){for(;--f>=0;){var g=b*this[a++]+c[d]+e;e=Math.floor(g/67108864),c[d++]=67108863&g}return e}function h(a){return hb.charAt(a)}function i(a,b){var c=ib[a.charCodeAt(b)];return null==c?-1:c}function j(a){for(var b=this.t-1;b>=0;--b)a[b]=this[b];a.t=this.t,a.s=this.s}function k(a){this.t=1,this.s=a<0?-1:0,a>0?this[0]=a:a<-1?this[0]=a+this.DV:this.t=0}function l(a){var b=f();return b.fromInt(a),b}function m(a,b){var c;if(16==b)c=4;else if(8==b)c=3;else if(256==b)c=8;else if(2==b)c=1;else if(32==b)c=5;else{if(4!=b)return void this.fromRadix(a,b);c=2}this.t=0,this.s=0;for(var d=a.length,f=!1,g=0;--d>=0;){var h=8==c?255&a[d]:i(a,d);h<0?"-"==a.charAt(d)&&(f=!0):(f=!1,0==g?this[this.t++]=h:g+c>this.DB?(this[this.t-1]|=(h&(1<<this.DB-g)-1)<<g,this[this.t++]=h>>this.DB-g):this[this.t-1]|=h<<g,g+=c,g>=this.DB&&(g-=this.DB))}8==c&&0!=(128&a[0])&&(this.s=-1,g>0&&(this[this.t-1]|=(1<<this.DB-g)-1<<g)),this.clamp(),f&&e.ZERO.subTo(this,this)}function n(){for(var a=this.s&this.DM;this.t>0&&this[this.t-1]==a;)--this.t}function o(a){if(this.s<0)return"-"+this.negate().toString(a);var b;if(16==a)b=4;else if(8==a)b=3;else if(2==a)b=1;else if(32==a)b=5;else{if(4!=a)return this.toRadix(a);b=2}var c,d=(1<<b)-1,e=!1,f="",g=this.t,i=this.DB-g*this.DB%b;if(g-- >0)for(i<this.DB&&(c=this[g]>>i)>0&&(e=!0,f=h(c));g>=0;)i<b?(c=(this[g]&(1<<i)-1)<<b-i,c|=this[--g]>>(i+=this.DB-b)):(c=this[g]>>(i-=b)&d,i<=0&&(i+=this.DB,--g)),c>0&&(e=!0),e&&(f+=h(c));return e?f:"0"}function p(){var a=f();return e.ZERO.subTo(this,a),a}function q(){return this.s<0?this.negate():this}function r(a){var b=this.s-a.s;if(0!=b)return b;var c=this.t;if(b=c-a.t,0!=b)return this.s<0?-b:b;for(;--c>=0;)if(0!=(b=this[c]-a[c]))return b;return 0}function s(a){var b,c=1;return 0!=(b=a>>>16)&&(a=b,c+=16),0!=(b=a>>8)&&(a=b,c+=8),0!=(b=a>>4)&&(a=b,c+=4),0!=(b=a>>2)&&(a=b,c+=2),0!=(b=a>>1)&&(a=b,c+=1),c}function t(){return this.t<=0?0:this.DB*(this.t-1)+s(this[this.t-1]^this.s&this.DM)}function u(a,b){var c;for(c=this.t-1;c>=0;--c)b[c+a]=this[c];for(c=a-1;c>=0;--c)b[c]=0;b.t=this.t+a,b.s=this.s}function v(a,b){for(var c=a;c<this.t;++c)b[c-a]=this[c];b.t=Math.max(this.t-a,0),b.s=this.s}function w(a,b){var c,d=a%this.DB,e=this.DB-d,f=(1<<e)-1,g=Math.floor(a/this.DB),h=this.s<<d&this.DM;for(c=this.t-1;c>=0;--c)b[c+g+1]=this[c]>>e|h,h=(this[c]&f)<<d;for(c=g-1;c>=0;--c)b[c]=0;b[g]=h,b.t=this.t+g+1,b.s=this.s,b.clamp()}function x(a,b){b.s=this.s;var c=Math.floor(a/this.DB);if(c>=this.t)return void(b.t=0);var d=a%this.DB,e=this.DB-d,f=(1<<d)-1;b[0]=this[c]>>d;for(var g=c+1;g<this.t;++g)b[g-c-1]|=(this[g]&f)<<e,b[g-c]=this[g]>>d;d>0&&(b[this.t-c-1]|=(this.s&f)<<e),b.t=this.t-c,b.clamp()}function y(a,b){for(var c=0,d=0,e=Math.min(a.t,this.t);c<e;)d+=this[c]-a[c],b[c++]=d&this.DM,d>>=this.DB;if(a.t<this.t){for(d-=a.s;c<this.t;)d+=this[c],b[c++]=d&this.DM,d>>=this.DB;d+=this.s}else{for(d+=this.s;c<a.t;)d-=a[c],b[c++]=d&this.DM,d>>=this.DB;d-=a.s}b.s=d<0?-1:0,d<-1?b[c++]=this.DV+d:d>0&&(b[c++]=d),b.t=c,b.clamp()}function z(a,b){var c=this.abs(),d=a.abs(),f=c.t;for(b.t=f+d.t;--f>=0;)b[f]=0;for(f=0;f<d.t;++f)b[f+c.t]=c.am(0,d[f],b,f,0,c.t);b.s=0,b.clamp(),this.s!=a.s&&e.ZERO.subTo(b,b)}function A(a){for(var b=this.abs(),c=a.t=2*b.t;--c>=0;)a[c]=0;for(c=0;c<b.t-1;++c){var d=b.am(c,b[c],a,2*c,0,1);(a[c+b.t]+=b.am(c+1,2*b[c],a,2*c+1,d,b.t-c-1))>=b.DV&&(a[c+b.t]-=b.DV,a[c+b.t+1]=1)}a.t>0&&(a[a.t-1]+=b.am(c,b[c],a,2*c,0,1)),a.s=0,a.clamp()}function B(a,b,c){var d=a.abs();if(!(d.t<=0)){var g=this.abs();if(g.t<d.t)return null!=b&&b.fromInt(0),void(null!=c&&this.copyTo(c));null==c&&(c=f());var h=f(),i=this.s,j=a.s,k=this.DB-s(d[d.t-1]);k>0?(d.lShiftTo(k,h),g.lShiftTo(k,c)):(d.copyTo(h),g.copyTo(c));var l=h.t,m=h[l-1];if(0!=m){var n=m*(1<<this.F1)+(l>1?h[l-2]>>this.F2:0),o=this.FV/n,p=(1<<this.F1)/n,q=1<<this.F2,r=c.t,t=r-l,u=null==b?f():b;for(h.dlShiftTo(t,u),c.compareTo(u)>=0&&(c[c.t++]=1,c.subTo(u,c)),e.ONE.dlShiftTo(l,u),u.subTo(h,h);h.t<l;)h[h.t++]=0;for(;--t>=0;){var v=c[--r]==m?this.DM:Math.floor(c[r]*o+(c[r-1]+q)*p);if((c[r]+=h.am(0,v,c,t,0,l))<v)for(h.dlShiftTo(t,u),c.subTo(u,c);c[r]<--v;)c.subTo(u,c)}null!=b&&(c.drShiftTo(l,b),i!=j&&e.ZERO.subTo(b,b)),c.t=l,c.clamp(),k>0&&c.rShiftTo(k,c),i<0&&e.ZERO.subTo(c,c)}}}function C(a){var b=f();return this.abs().divRemTo(a,null,b),this.s<0&&b.compareTo(e.ZERO)>0&&a.subTo(b,b),b}function D(a){this.m=a}function E(a){return a.s<0||a.compareTo(this.m)>=0?a.mod(this.m):a}function F(a){return a}function G(a){a.divRemTo(this.m,null,a)}function H(a,b,c){a.multiplyTo(b,c),this.reduce(c)}function I(a,b){a.squareTo(b),this.reduce(b)}function J(){if(this.t<1)return 0;var a=this[0];if(0==(1&a))return 0;var b=3&a;return b=b*(2-(15&a)*b)&15,b=b*(2-(255&a)*b)&255,b=b*(2-((65535&a)*b&65535))&65535,b=b*(2-a*b%this.DV)%this.DV,b>0?this.DV-b:-b}function K(a){this.m=a,this.mp=a.invDigit(),this.mpl=32767&this.mp,this.mph=this.mp>>15,this.um=(1<<a.DB-15)-1,this.mt2=2*a.t}function L(a){var b=f();return a.abs().dlShiftTo(this.m.t,b),b.divRemTo(this.m,null,b),a.s<0&&b.compareTo(e.ZERO)>0&&this.m.subTo(b,b),b}function M(a){var b=f();return a.copyTo(b),this.reduce(b),b}function N(a){for(;a.t<=this.mt2;)a[a.t++]=0;for(var b=0;b<this.m.t;++b){var c=32767&a[b],d=c*this.mpl+((c*this.mph+(a[b]>>15)*this.mpl&this.um)<<15)&a.DM;for(c=b+this.m.t,a[c]+=this.m.am(0,d,a,b,0,this.m.t);a[c]>=a.DV;)a[c]-=a.DV,a[++c]++}a.clamp(),a.drShiftTo(this.m.t,a),a.compareTo(this.m)>=0&&a.subTo(this.m,a)}function O(a,b){a.squareTo(b),this.reduce(b)}function P(a,b,c){a.multiplyTo(b,c),this.reduce(c)}function Q(){return 0==(this.t>0?1&this[0]:this.s)}function R(a,b){if(a>4294967295||a<1)return e.ONE;var c=f(),d=f(),g=b.convert(this),h=s(a)-1;for(g.copyTo(c);--h>=0;)if(b.sqrTo(c,d),(a&1<<h)>0)b.mulTo(d,g,c);else{var i=c;c=d,d=i}return b.revert(c)}function S(a,b){var c;return c=a<256||b.isEven()?new D(b):new K(b),this.exp(a,c)}function T(){var a=f();return this.copyTo(a),a}function U(){if(this.s<0){if(1==this.t)return this[0]-this.DV;if(0==this.t)return-1}else{if(1==this.t)return this[0];if(0==this.t)return 0}return(this[1]&(1<<32-this.DB)-1)<<this.DB|this[0]}function V(){return 0==this.t?this.s:this[0]<<24>>24}function W(){return 0==this.t?this.s:this[0]<<16>>16}function X(a){return Math.floor(Math.LN2*this.DB/Math.log(a))}function Y(){return this.s<0?-1:this.t<=0||1==this.t&&this[0]<=0?0:1}function Z(a){if(null==a&&(a=10),0==this.signum()||a<2||a>36)return"0";var b=this.chunkSize(a),c=Math.pow(a,b),d=l(c),e=f(),g=f(),h="";for(this.divRemTo(d,e,g);e.signum()>0;)h=(c+g.intValue()).toString(a).substr(1)+h,e.divRemTo(d,e,g);return g.intValue().toString(a)+h}function $(a,b){this.fromInt(0),null==b&&(b=10);for(var c=this.chunkSize(b),d=Math.pow(b,c),f=!1,g=0,h=0,j=0;j<a.length;++j){var k=i(a,j);k<0?"-"==a.charAt(j)&&0==this.signum()&&(f=!0):(h=b*h+k,++g>=c&&(this.dMultiply(d),this.dAddOffset(h,0),g=0,h=0))}g>0&&(this.dMultiply(Math.pow(b,g)),this.dAddOffset(h,0)),f&&e.ZERO.subTo(this,this)}function _(a,b,c){if("number"==typeof b)if(a<2)this.fromInt(1);else for(this.fromNumber(a,c),this.testBit(a-1)||this.bitwiseTo(e.ONE.shiftLeft(a-1),ha,this),this.isEven()&&this.dAddOffset(1,0);!this.isProbablePrime(b);)this.dAddOffset(2,0),this.bitLength()>a&&this.subTo(e.ONE.shiftLeft(a-1),this);else{var d=new Array,f=7&a;d.length=(a>>3)+1,b.nextBytes(d),f>0?d[0]&=(1<<f)-1:d[0]=0,this.fromString(d,256)}}function aa(){var a=this.t,b=new Array;b[0]=this.s;var c,d=this.DB-a*this.DB%8,e=0;if(a-- >0)for(d<this.DB&&(c=this[a]>>d)!=(this.s&this.DM)>>d&&(b[e++]=c|this.s<<this.DB-d);a>=0;)d<8?(c=(this[a]&(1<<d)-1)<<8-d,c|=this[--a]>>(d+=this.DB-8)):(c=this[a]>>(d-=8)&255,d<=0&&(d+=this.DB,--a)),(e>0||c!=this.s)&&(b[e++]=c);return b}function ba(a){return 0==this.compareTo(a)}function ca(a){return this.compareTo(a)<0?this:a}function da(a){return this.compareTo(a)>0?this:a}function ea(a,b,c){var d,e,f=Math.min(a.t,this.t);for(d=0;d<f;++d)c[d]=b(this[d],a[d]);if(a.t<this.t){for(e=a.s&this.DM,d=f;d<this.t;++d)c[d]=b(this[d],e);c.t=this.t}else{for(e=this.s&this.DM,d=f;d<a.t;++d)c[d]=b(e,a[d]);c.t=a.t}c.s=b(this.s,a.s),c.clamp()}function fa(a,b){return a&b}function ga(a){var b=f();return this.bitwiseTo(a,fa,b),b}function ha(a,b){return a|b}function ia(a){var b=f();return this.bitwiseTo(a,ha,b),b}function ja(a,b){return a^b}function ka(a){var b=f();return this.bitwiseTo(a,ja,b),b}function la(a,b){return a&~b}function ma(a){var b=f();return this.bitwiseTo(a,la,b),b}function na(){for(var a=f(),b=0;b<this.t;++b)a[b]=this.DM&~this[b];return a.t=this.t,a.s=~this.s,a}function oa(a){var b=f();return a<0?this.rShiftTo(-a,b):this.lShiftTo(a,b),b}function pa(a){var b=f();return a<0?this.lShiftTo(-a,b):this.rShiftTo(a,b),b}function qa(a){if(0==a)return-1;var b=0;return 0==(65535&a)&&(a>>=16,b+=16),0==(255&a)&&(a>>=8,b+=8),0==(15&a)&&(a>>=4,b+=4),0==(3&a)&&(a>>=2,b+=2),0==(1&a)&&++b,b}function ra(){for(var a=0;a<this.t;++a)if(0!=this[a])return a*this.DB+qa(this[a]);return this.s<0?this.t*this.DB:-1}function sa(a){for(var b=0;0!=a;)a&=a-1,++b;return b}function ta(){for(var a=0,b=this.s&this.DM,c=0;c<this.t;++c)a+=sa(this[c]^b);return a}function ua(a){var b=Math.floor(a/this.DB);return b>=this.t?0!=this.s:0!=(this[b]&1<<a%this.DB)}function va(a,b){var c=e.ONE.shiftLeft(a);return this.bitwiseTo(c,b,c),c}function wa(a){return this.changeBit(a,ha)}function xa(a){return this.changeBit(a,la)}function ya(a){return this.changeBit(a,ja)}function za(a,b){for(var c=0,d=0,e=Math.min(a.t,this.t);c<e;)d+=this[c]+a[c],b[c++]=d&this.DM,d>>=this.DB;if(a.t<this.t){for(d+=a.s;c<this.t;)d+=this[c],b[c++]=d&this.DM,d>>=this.DB;d+=this.s}else{for(d+=this.s;c<a.t;)d+=a[c],b[c++]=d&this.DM,d>>=this.DB;d+=a.s}b.s=d<0?-1:0,d>0?b[c++]=d:d<-1&&(b[c++]=this.DV+d),b.t=c,b.clamp()}function Aa(a){var b=f();return this.addTo(a,b),b}function Ba(a){var b=f();return this.subTo(a,b),b}function Ca(a){var b=f();return this.multiplyTo(a,b),b}function Da(){var a=f();return this.squareTo(a),a}function Ea(a){var b=f();return this.divRemTo(a,b,null),b}function Fa(a){var b=f();return this.divRemTo(a,null,b),b}function Ga(a){var b=f(),c=f();return this.divRemTo(a,b,c),new Array(b,c)}function Ha(a){this[this.t]=this.am(0,a-1,this,0,0,this.t),++this.t,this.clamp()}function Ia(a,b){if(0!=a){for(;this.t<=b;)this[this.t++]=0;for(this[b]+=a;this[b]>=this.DV;)this[b]-=this.DV,++b>=this.t&&(this[this.t++]=0),++this[b]}}function Ja(){}function Ka(a){return a}function La(a,b,c){a.multiplyTo(b,c)}function Ma(a,b){a.squareTo(b)}function Na(a){return this.exp(a,new Ja)}function Oa(a,b,c){var d=Math.min(this.t+a.t,b);for(c.s=0,c.t=d;d>0;)c[--d]=0;var e;for(e=c.t-this.t;d<e;++d)c[d+this.t]=this.am(0,a[d],c,d,0,this.t);for(e=Math.min(a.t,b);d<e;++d)this.am(0,a[d],c,d,0,b-d);c.clamp()}function Pa(a,b,c){--b;var d=c.t=this.t+a.t-b;for(c.s=0;--d>=0;)c[d]=0;for(d=Math.max(b-this.t,0);d<a.t;++d)c[this.t+d-b]=this.am(b-d,a[d],c,0,0,this.t+d-b);c.clamp(),c.drShiftTo(1,c)}function Qa(a){this.r2=f(),this.q3=f(),e.ONE.dlShiftTo(2*a.t,this.r2),this.mu=this.r2.divide(a),this.m=a}function Ra(a){if(a.s<0||a.t>2*this.m.t)return a.mod(this.m);if(a.compareTo(this.m)<0)return a;var b=f();return a.copyTo(b),this.reduce(b),b}function Sa(a){return a}function Ta(a){for(a.drShiftTo(this.m.t-1,this.r2),a.t>this.m.t+1&&(a.t=this.m.t+1,a.clamp()),this.mu.multiplyUpperTo(this.r2,this.m.t+1,this.q3),this.m.multiplyLowerTo(this.q3,this.m.t+1,this.r2);a.compareTo(this.r2)<0;)a.dAddOffset(1,this.m.t+1);for(a.subTo(this.r2,a);a.compareTo(this.m)>=0;)a.subTo(this.m,a)}function Ua(a,b){a.squareTo(b),this.reduce(b);
}function Va(a,b,c){a.multiplyTo(b,c),this.reduce(c)}function Wa(a,b){var c,d,e=a.bitLength(),g=l(1);if(e<=0)return g;c=e<18?1:e<48?3:e<144?4:e<768?5:6,d=e<8?new D(b):b.isEven()?new Qa(b):new K(b);var h=new Array,i=3,j=c-1,k=(1<<c)-1;if(h[1]=d.convert(this),c>1){var m=f();for(d.sqrTo(h[1],m);i<=k;)h[i]=f(),d.mulTo(m,h[i-2],h[i]),i+=2}var n,o,p=a.t-1,q=!0,r=f();for(e=s(a[p])-1;p>=0;){for(e>=j?n=a[p]>>e-j&k:(n=(a[p]&(1<<e+1)-1)<<j-e,p>0&&(n|=a[p-1]>>this.DB+e-j)),i=c;0==(1&n);)n>>=1,--i;if((e-=i)<0&&(e+=this.DB,--p),q)h[n].copyTo(g),q=!1;else{for(;i>1;)d.sqrTo(g,r),d.sqrTo(r,g),i-=2;i>0?d.sqrTo(g,r):(o=g,g=r,r=o),d.mulTo(r,h[n],g)}for(;p>=0&&0==(a[p]&1<<e);)d.sqrTo(g,r),o=g,g=r,r=o,--e<0&&(e=this.DB-1,--p)}return d.revert(g)}function Xa(a){var b=this.s<0?this.negate():this.clone(),c=a.s<0?a.negate():a.clone();if(b.compareTo(c)<0){var d=b;b=c,c=d}var e=b.getLowestSetBit(),f=c.getLowestSetBit();if(f<0)return b;for(e<f&&(f=e),f>0&&(b.rShiftTo(f,b),c.rShiftTo(f,c));b.signum()>0;)(e=b.getLowestSetBit())>0&&b.rShiftTo(e,b),(e=c.getLowestSetBit())>0&&c.rShiftTo(e,c),b.compareTo(c)>=0?(b.subTo(c,b),b.rShiftTo(1,b)):(c.subTo(b,c),c.rShiftTo(1,c));return f>0&&c.lShiftTo(f,c),c}function Ya(a){if(a<=0)return 0;var b=this.DV%a,c=this.s<0?a-1:0;if(this.t>0)if(0==b)c=this[0]%a;else for(var d=this.t-1;d>=0;--d)c=(b*c+this[d])%a;return c}function Za(a){var b=a.isEven();if(this.isEven()&&b||0==a.signum())return e.ZERO;for(var c=a.clone(),d=this.clone(),f=l(1),g=l(0),h=l(0),i=l(1);0!=c.signum();){for(;c.isEven();)c.rShiftTo(1,c),b?(f.isEven()&&g.isEven()||(f.addTo(this,f),g.subTo(a,g)),f.rShiftTo(1,f)):g.isEven()||g.subTo(a,g),g.rShiftTo(1,g);for(;d.isEven();)d.rShiftTo(1,d),b?(h.isEven()&&i.isEven()||(h.addTo(this,h),i.subTo(a,i)),h.rShiftTo(1,h)):i.isEven()||i.subTo(a,i),i.rShiftTo(1,i);c.compareTo(d)>=0?(c.subTo(d,c),b&&f.subTo(h,f),g.subTo(i,g)):(d.subTo(c,d),b&&h.subTo(f,h),i.subTo(g,i))}return 0!=d.compareTo(e.ONE)?e.ZERO:i.compareTo(a)>=0?i.subtract(a):i.signum()<0?(i.addTo(a,i),i.signum()<0?i.add(a):i):i}function $a(a){var b,c=this.abs();if(1==c.t&&c[0]<=jb[jb.length-1]){for(b=0;b<jb.length;++b)if(c[0]==jb[b])return!0;return!1}if(c.isEven())return!1;for(b=1;b<jb.length;){for(var d=jb[b],e=b+1;e<jb.length&&d<kb;)d*=jb[e++];for(d=c.modInt(d);b<e;)if(d%jb[b++]==0)return!1}return c.millerRabin(a)}function s(a){var b,c=1;return 0!=(b=a>>>16)&&(a=b,c+=16),0!=(b=a>>8)&&(a=b,c+=8),0!=(b=a>>4)&&(a=b,c+=4),0!=(b=a>>2)&&(a=b,c+=2),0!=(b=a>>1)&&(a=b,c+=1),c}function _a(){var a=this.toByteArray(),b=8*(a.length-1)+s(a[0]),c="";return c+=String.fromCharCode((65280&b)>>8),c+=String.fromCharCode(255&b),c+=db["default"].bin2str(a)}function ab(a){var b=this.subtract(e.ONE),c=b.getLowestSetBit();if(c<=0)return!1;var d=b.shiftRight(c);a=a+1>>1,a>jb.length&&(a=jb.length);for(var g,h=f(),i=[],j=0;j<a;++j){for(;g=jb[Math.floor(Math.random()*jb.length)],i.indexOf(g)!=-1;);i.push(g),h.fromInt(g);var k=h.modPow(d,this);if(0!=k.compareTo(e.ONE)&&0!=k.compareTo(b)){for(var g=1;g++<c&&0!=k.compareTo(b);)if(k=k.modPowInt(2,this),0==k.compareTo(e.ONE))return!1;if(0!=k.compareTo(b))return!1}}return!0}Object.defineProperty(c,"__esModule",{value:!0}),c["default"]=e;var bb,cb=a("../../util.js"),db=d(cb);e.prototype.am=g,bb=26,e.prototype.DB=bb,e.prototype.DM=(1<<bb)-1,e.prototype.DV=1<<bb;var eb=52;e.prototype.FV=Math.pow(2,eb),e.prototype.F1=eb-bb,e.prototype.F2=2*bb-eb;var fb,gb,hb="0123456789abcdefghijklmnopqrstuvwxyz",ib=new Array;for(fb="0".charCodeAt(0),gb=0;gb<=9;++gb)ib[fb++]=gb;for(fb="a".charCodeAt(0),gb=10;gb<36;++gb)ib[fb++]=gb;for(fb="A".charCodeAt(0),gb=10;gb<36;++gb)ib[fb++]=gb;D.prototype.convert=E,D.prototype.revert=F,D.prototype.reduce=G,D.prototype.mulTo=H,D.prototype.sqrTo=I,K.prototype.convert=L,K.prototype.revert=M,K.prototype.reduce=N,K.prototype.mulTo=P,K.prototype.sqrTo=O,e.prototype.copyTo=j,e.prototype.fromInt=k,e.prototype.fromString=m,e.prototype.clamp=n,e.prototype.dlShiftTo=u,e.prototype.drShiftTo=v,e.prototype.lShiftTo=w,e.prototype.rShiftTo=x,e.prototype.subTo=y,e.prototype.multiplyTo=z,e.prototype.squareTo=A,e.prototype.divRemTo=B,e.prototype.invDigit=J,e.prototype.isEven=Q,e.prototype.exp=R,e.prototype.toString=o,e.prototype.negate=p,e.prototype.abs=q,e.prototype.compareTo=r,e.prototype.bitLength=t,e.prototype.mod=C,e.prototype.modPowInt=S,e.ZERO=l(0),e.ONE=l(1),e.TWO=l(2),Ja.prototype.convert=Ka,Ja.prototype.revert=Ka,Ja.prototype.mulTo=La,Ja.prototype.sqrTo=Ma,Qa.prototype.convert=Ra,Qa.prototype.revert=Sa,Qa.prototype.reduce=Ta,Qa.prototype.mulTo=Va,Qa.prototype.sqrTo=Ua;var jb=[2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97,101,103,107,109,113,127,131,137,139,149,151,157,163,167,173,179,181,191,193,197,199,211,223,227,229,233,239,241,251,257,263,269,271,277,281,283,293,307,311,313,317,331,337,347,349,353,359,367,373,379,383,389,397,401,409,419,421,431,433,439,443,449,457,461,463,467,479,487,491,499,503,509,521,523,541,547,557,563,569,571,577,587,593,599,601,607,613,617,619,631,641,643,647,653,659,661,673,677,683,691,701,709,719,727,733,739,743,751,757,761,769,773,787,797,809,811,821,823,827,829,839,853,857,859,863,877,881,883,887,907,911,919,929,937,941,947,953,967,971,977,983,991,997],kb=(1<<26)/jb[jb.length-1];e.prototype.chunkSize=X,e.prototype.toRadix=Z,e.prototype.fromRadix=$,e.prototype.fromNumber=_,e.prototype.bitwiseTo=ea,e.prototype.changeBit=va,e.prototype.addTo=za,e.prototype.dMultiply=Ha,e.prototype.dAddOffset=Ia,e.prototype.multiplyLowerTo=Oa,e.prototype.multiplyUpperTo=Pa,e.prototype.modInt=Ya,e.prototype.millerRabin=ab,e.prototype.clone=T,e.prototype.intValue=U,e.prototype.byteValue=V,e.prototype.shortValue=W,e.prototype.signum=Y,e.prototype.toByteArray=aa,e.prototype.equals=ba,e.prototype.min=ca,e.prototype.max=da,e.prototype.and=ga,e.prototype.or=ia,e.prototype.xor=ka,e.prototype.andNot=ma,e.prototype.not=na,e.prototype.shiftLeft=oa,e.prototype.shiftRight=pa,e.prototype.getLowestSetBit=ra,e.prototype.bitCount=ta,e.prototype.testBit=ua,e.prototype.setBit=wa,e.prototype.clearBit=xa,e.prototype.flipBit=ya,e.prototype.add=Aa,e.prototype.subtract=Ba,e.prototype.multiply=Ca,e.prototype.divide=Ea,e.prototype.remainder=Fa,e.prototype.divideAndRemainder=Ga,e.prototype.modPow=Wa,e.prototype.modInverse=Za,e.prototype.pow=Na,e.prototype.gcd=Xa,e.prototype.isProbablePrime=$a,e.prototype.toMPI=_a,e.prototype.square=Da},{"../../util.js":69}],30:[function(a,b,c){"use strict";function d(a){return a&&a.__esModule?a:{"default":a}}function e(){function a(a){for(var b=0;b<a.length;b++)a[b]=n["default"].getSecureRandomOctet()}this.nextBytes=a}function f(a,b,c){return r=r.bitLength()===b.bitLength()?r.square().mod(b):n["default"].getRandomBigIntegerInRange(j["default"].TWO,b),q=r.modInverse(b).modPow(c,b),a.multiply(q).mod(b)}function g(a,b){return a.multiply(r).mod(b)}function h(){function a(a,b,c,d,e,h,i){p["default"].rsa_blinding&&(a=f(a,b,c));var k=a.mod(e).modPow(d.mod(e.subtract(j["default"].ONE)),e),m=a.mod(h).modPow(d.mod(h.subtract(j["default"].ONE)),h);l["default"].print_debug("rsa.js decrypt\nxpn:"+l["default"].hexstrdump(k.toMPI())+"\nxqn:"+l["default"].hexstrdump(m.toMPI()));var n=m.subtract(k);return 0===n[0]?(n=k.subtract(m),n=n.multiply(i).mod(h),n=h.subtract(n)):n=n.multiply(i).mod(h),n=n.multiply(e).add(k),p["default"].rsa_blinding&&(n=g(n,b)),n}function b(a,b,c){return a.modPowInt(b,c)}function c(a,b,c){return a.modPow(b,c)}function d(a,b,c){return a.modPowInt(b,c)}function h(){this.n=null,this.e=0,this.ee=null,this.d=null,this.p=null,this.q=null,this.dmp1=null,this.dmq1=null,this.u=null}function i(a,b){function c(a){var b=f.exportKey("jwk",a.privateKey);return"function"!=typeof b.then&&(b=l["default"].promisifyIE11Op(b,"Error exporting RSA key pair.")),b}function d(a){function c(a){var b=a.replace(/\-/g,"+").replace(/_/g,"/"),c=l["default"].hexstrdump(atob(b));return new j["default"](c,16)}var d=new h;return d.n=c(a.n),d.ee=new j["default"](b,16),d.d=c(a.d),d.p=c(a.p),d.q=c(a.q),d.u=d.p.modInverse(d.q),d}var f=l["default"].getWebCryptoAll();if(f){var g,i,k=new Uint32Array([parseInt(b,16)]),m=new Uint8Array(k.buffer);return window.crypto&&window.crypto.webkitSubtle?(g={name:"RSA-OAEP",modulusLength:a,publicExponent:m.subarray(0,3)},i=f.generateKey(g,!0,["encrypt","decrypt"])):(g={name:"RSASSA-PKCS1-v1_5",modulusLength:a,publicExponent:m.subarray(0,3),hash:{name:"SHA-1"}},i=f.generateKey(g,!0,["sign","verify"]),"function"!=typeof i.then&&(i=l["default"].promisifyIE11Op(i,"Error generating RSA key pair."))),i.then(c).then(function(a){return d(a instanceof ArrayBuffer?JSON.parse(String.fromCharCode.apply(null,new Uint8Array(a))):a)})}return new Promise(function(c){var d=new h,f=new e,g=a>>1;for(d.e=parseInt(b,16),d.ee=new j["default"](b,16);;){for(;d.p=new j["default"](a-g,1,f),0!==d.p.subtract(j["default"].ONE).gcd(d.ee).compareTo(j["default"].ONE)||!d.p.isProbablePrime(10););for(;d.q=new j["default"](g,1,f),0!==d.q.subtract(j["default"].ONE).gcd(d.ee).compareTo(j["default"].ONE)||!d.q.isProbablePrime(10););if(d.p.compareTo(d.q)<=0){var i=d.p;d.p=d.q,d.q=i}var k=d.p.subtract(j["default"].ONE),l=d.q.subtract(j["default"].ONE),m=k.multiply(l);if(0===m.gcd(d.ee).compareTo(j["default"].ONE)){d.n=d.p.multiply(d.q),d.d=d.ee.modInverse(m),d.dmp1=d.d.mod(k),d.dmq1=d.d.mod(l),d.u=d.p.modInverse(d.q);break}}c(d)})}this.encrypt=b,this.decrypt=a,this.verify=d,this.sign=c,this.generate=i,this.keyObject=h}Object.defineProperty(c,"__esModule",{value:!0}),c["default"]=h;var i=a("./jsbn.js"),j=d(i),k=a("../../util.js"),l=d(k),m=a("../random.js"),n=d(m),o=a("../../config"),p=d(o),q=j["default"].ZERO,r=j["default"].ZERO},{"../../config":10,"../../util.js":69,"../random.js":31,"./jsbn.js":29}],31:[function(a,b,c){"use strict";function d(a){return a&&a.__esModule?a:{"default":a}}function e(){this.buffer=null,this.size=null}Object.defineProperty(c,"__esModule",{value:!0});var f="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(a){return typeof a}:function(a){return a&&"function"==typeof Symbol&&a.constructor===Symbol?"symbol":typeof a},g=a("../type/mpi.js"),h=d(g),i=a("../util.js"),j=d(i),k=j["default"].detectNode()&&a("crypto");c["default"]={getRandomBytes:function(a){for(var b=new Uint8Array(a),c=0;c<a;c++)b[c]=this.getSecureRandomOctet();return b},getSecureRandom:function(a,b){for(var c=this.getSecureRandomUint(),d=(b-a).toString(2).length;(c&Math.pow(2,d)-1)>b-a;)c=this.getSecureRandomUint();return a+Math.abs(c&Math.pow(2,d)-1)},getSecureRandomOctet:function(){var a=new Uint8Array(1);return this.getRandomValues(a),a[0]},getSecureRandomUint:function(){var a=new Uint8Array(4),b=new DataView(a.buffer);return this.getRandomValues(a),b.getUint32(0)},getRandomValues:function(a){if(!(a instanceof Uint8Array))throw new Error("Invalid type: buf not an Uint8Array");if("undefined"!=typeof window&&window.crypto&&window.crypto.getRandomValues)window.crypto.getRandomValues(a);else if("undefined"!=typeof window&&"object"===f(window.msCrypto)&&"function"==typeof window.msCrypto.getRandomValues)window.msCrypto.getRandomValues(a);else if(k){var b=k.randomBytes(a.length);a.set(b)}else{if(!this.randomBuffer.buffer)throw new Error("No secure random number generator available.");this.randomBuffer.get(a)}return a},getRandomBigInteger:function(a){if(a<1)throw new Error("Illegal parameter value: bits < 1");var b=Math.floor((a+7)/8),c=j["default"].Uint8Array2str(this.getRandomBytes(b));a%8>0&&(c=String.fromCharCode(Math.pow(2,a%8)-1&c.charCodeAt(0))+c.substring(1));var d=new h["default"];return d.fromBytes(c),d.toBigInteger()},getRandomBigIntegerInRange:function(a,b){if(b.compareTo(a)<=0)throw new Error("Illegal parameter value: max <= min");for(var c=b.subtract(a),d=this.getRandomBigInteger(c.bitLength());d.compareTo(c)>0;)d=this.getRandomBigInteger(c.bitLength());return a.add(d)},randomBuffer:new e},e.prototype.init=function(a){this.buffer=new Uint8Array(a),this.size=0},e.prototype.set=function(a){if(!this.buffer)throw new Error("RandomBuffer is not initialized");if(!(a instanceof Uint8Array))throw new Error("Invalid type: buf not an Uint8Array");var b=this.buffer.length-this.size;a.length>b&&(a=a.subarray(0,b)),this.buffer.set(a,this.size),this.size+=a.length},e.prototype.get=function(a){if(!this.buffer)throw new Error("RandomBuffer is not initialized");if(!(a instanceof Uint8Array))throw new Error("Invalid type: buf not an Uint8Array");if(this.size<a.length)throw new Error("Random number buffer depleted");for(var b=0;b<a.length;b++)a[b]=this.buffer[--this.size],this.buffer[this.size]=0}},{"../type/mpi.js":67,"../util.js":69,crypto:"crypto"}],32:[function(a,b,c){"use strict";function d(a){return a&&a.__esModule?a:{"default":a}}Object.defineProperty(c,"__esModule",{value:!0});var e=a("../util"),f=d(e),g=a("./public_key"),h=d(g),i=a("./pkcs1.js"),j=d(i);c["default"]={verify:function(a,b,c,d,e){var g;switch(e=f["default"].Uint8Array2str(e),a){case 1:case 2:case 3:var i=new h["default"].rsa,k=d[0].toBigInteger(),l=d[0].byteLength(),m=d[1].toBigInteger();g=c[0].toBigInteger();var n=i.verify(g,m,k),o=j["default"].emsa.encode(b,e,l);return 0===n.compareTo(o);case 16:throw new Error("signing with Elgamal is not defined in the OpenPGP standard.");case 17:var p=new h["default"].dsa,q=c[0].toBigInteger(),r=c[1].toBigInteger(),s=d[0].toBigInteger(),t=d[1].toBigInteger(),u=d[2].toBigInteger(),v=d[3].toBigInteger();g=e;var w=p.verify(b,q,r,g,s,t,u,v);return 0===w.compareTo(q);default:throw new Error("Invalid signature algorithm.")}},sign:function(a,b,c,d){d=f["default"].Uint8Array2str(d);var e;switch(b){case 1:case 2:case 3:var g=new h["default"].rsa,i=c[2].toBigInteger(),k=c[0].toBigInteger();return e=j["default"].emsa.encode(a,d,c[0].byteLength()),f["default"].str2Uint8Array(g.sign(e,i,k).toMPI());case 17:var l=new h["default"].dsa,m=c[0].toBigInteger(),n=c[1].toBigInteger(),o=c[2].toBigInteger(),p=c[4].toBigInteger();e=d;var q=l.sign(a,e,o,m,n,p);return f["default"].str2Uint8Array(q[0].toString()+q[1].toString());case 16:throw new Error("Signing with Elgamal is not defined in the OpenPGP standard.");default:throw new Error("Invalid signature algorithm.")}}}},{"../util":69,"./pkcs1.js":25,"./public_key":28}],33:[function(a,b,c){"use strict";function d(a){return a&&a.__esModule?a:{"default":a}}function e(a){var b=/^-----BEGIN PGP (MESSAGE, PART \d+\/\d+|MESSAGE, PART \d+|SIGNED MESSAGE|MESSAGE|PUBLIC KEY BLOCK|PRIVATE KEY BLOCK|SIGNATURE)-----$\n/m,c=a.match(b);if(!c)throw new Error("Unknown ASCII armor type");return/MESSAGE, PART \d+\/\d+/.test(c[1])?r["default"].armor.multipart_section:/MESSAGE, PART \d+/.test(c[1])?r["default"].armor.multipart_last:/SIGNED MESSAGE/.test(c[1])?r["default"].armor.signed:/MESSAGE/.test(c[1])?r["default"].armor.message:/PUBLIC KEY BLOCK/.test(c[1])?r["default"].armor.public_key:/PRIVATE KEY BLOCK/.test(c[1])?r["default"].armor.private_key:void 0}function f(){var a="";return t["default"].show_version&&(a+="Version: "+t["default"].versionstring+"\r\n"),t["default"].show_comment&&(a+="Comment: "+t["default"].commentstring+"\r\n"),a+="\r\n"}function g(a){var b=i(a),c=new Uint8Array([b>>16,b>>8&255,255&b]);return p["default"].encode(c)}function h(a,b){var c=g(a),d=b;return c[0]===d[0]&&c[1]===d[1]&&c[2]===d[2]&&c[3]===d[3]}function i(a){for(var b=11994318,c=0;a.length-c>16;)b=b<<8^u[255&(b>>16^a[c])],b=b<<8^u[255&(b>>16^a[c+1])],b=b<<8^u[255&(b>>16^a[c+2])],b=b<<8^u[255&(b>>16^a[c+3])],b=b<<8^u[255&(b>>16^a[c+4])],b=b<<8^u[255&(b>>16^a[c+5])],b=b<<8^u[255&(b>>16^a[c+6])],b=b<<8^u[255&(b>>16^a[c+7])],b=b<<8^u[255&(b>>16^a[c+8])],b=b<<8^u[255&(b>>16^a[c+9])],b=b<<8^u[255&(b>>16^a[c+10])],b=b<<8^u[255&(b>>16^a[c+11])],b=b<<8^u[255&(b>>16^a[c+12])],b=b<<8^u[255&(b>>16^a[c+13])],b=b<<8^u[255&(b>>16^a[c+14])],b=b<<8^u[255&(b>>16^a[c+15])],c+=16;for(var d=c;d<a.length;d++)b=b<<8^u[255&(b>>16^a[c++])];return 16777215&b}function j(a){var b=/^[ \f\r\t\u00a0\u2000-\u200a\u202f\u205f\u3000]*\n/m,c="",d=a,e=b.exec(a);if(null===e)throw new Error("Mandatory blank line missing between armor headers and armor data");return c=a.slice(0,e.index),d=a.slice(e.index+e[0].length),c=c.split("\n"),c.pop(),{headers:c,body:d}}function k(a){for(var b=0;b<a.length;b++)if(!/^(Version|Comment|MessageID|Hash|Charset): .+$/.test(a[b]))throw new Error("Improperly formatted armor header: "+a[b])}function l(a){var b=/^=/m,c=a,d="",e=b.exec(a);return null!==e&&(c=a.slice(0,e.index),d=a.slice(e.index+1)),{body:c,checksum:d}}function m(a){var b=/^-----[^-]+-----$\n/m;a=a.replace(/[\t\r ]+\n/g,"\n");var c,d,f,i=e(a),m=a.split(b),n=1;if(a.search(b)!==m[0].length&&(n=0),2!==i){f=j(m[n]);var o=l(f.body);c={data:p["default"].decode(o.body),headers:f.headers,type:i},d=o.checksum}else{f=j(m[n].replace(/^- /gm,""));var q=j(m[n+1].replace(/^- /gm,""));k(q.headers);var r=l(q.body);c={text:f.body.replace(/\n$/,"").replace(/\n/g,"\r\n"),data:p["default"].decode(r.body),headers:f.headers,type:i},d=r.checksum}if(d=d.substr(0,4),!h(c.data,d))throw new Error("Ascii armor integrity check on message failed: '"+d+"' should be '"+g(c.data)+"'");return k(c.headers),c}function n(a,b,c,d){var e=[];switch(a){case r["default"].armor.multipart_section:e.push("-----BEGIN PGP MESSAGE, PART "+c+"/"+d+"-----\r\n"),e.push(f()),e.push(p["default"].encode(b)),e.push("\r\n="+g(b)+"\r\n"),e.push("-----END PGP MESSAGE, PART "+c+"/"+d+"-----\r\n");break;case r["default"].armor.multipart_last:e.push("-----BEGIN PGP MESSAGE, PART "+c+"-----\r\n"),e.push(f()),e.push(p["default"].encode(b)),e.push("\r\n="+g(b)+"\r\n"),e.push("-----END PGP MESSAGE, PART "+c+"-----\r\n");break;case r["default"].armor.signed:e.push("\r\n-----BEGIN PGP SIGNED MESSAGE-----\r\n"),e.push("Hash: "+b.hash+"\r\n\r\n"),e.push(b.text.replace(/\n-/g,"\n- -")),e.push("\r\n-----BEGIN PGP SIGNATURE-----\r\n"),e.push(f()),e.push(p["default"].encode(b.data)),e.push("\r\n="+g(b.data)+"\r\n"),e.push("-----END PGP SIGNATURE-----\r\n");break;case r["default"].armor.message:e.push("-----BEGIN PGP MESSAGE-----\r\n"),e.push(f()),e.push(p["default"].encode(b)),e.push("\r\n="+g(b)+"\r\n"),e.push("-----END PGP MESSAGE-----\r\n");break;case r["default"].armor.public_key:e.push("-----BEGIN PGP PUBLIC KEY BLOCK-----\r\n"),e.push(f()),e.push(p["default"].encode(b)),e.push("\r\n="+g(b)+"\r\n"),e.push("-----END PGP PUBLIC KEY BLOCK-----\r\n\r\n");break;case r["default"].armor.private_key:e.push("-----BEGIN PGP PRIVATE KEY BLOCK-----\r\n"),e.push(f()),e.push(p["default"].encode(b)),e.push("\r\n="+g(b)+"\r\n"),e.push("-----END PGP PRIVATE KEY BLOCK-----\r\n")}return e.join("")}Object.defineProperty(c,"__esModule",{value:!0});var o=a("./base64.js"),p=d(o),q=a("../enums.js"),r=d(q),s=a("../config"),t=d(s),u=[0,8801531,25875725,17603062,60024545,51751450,35206124,44007191,128024889,120049090,103502900,112007375,70412248,78916387,95990485,88014382,264588937,256049778,240098180,248108927,207005800,215016595,232553829,224014750,140824496,149062475,166599357,157832774,200747345,191980970,176028764,184266919,520933865,529177874,512099556,503334943,480196360,471432179,487973381,496217854,414011600,405478443,422020573,430033190,457094705,465107658,448029500,439496647,281648992,273666971,289622637,298124950,324696449,333198714,315665548,307683447,392699481,401494690,383961940,375687087,352057528,343782467,359738805,368533838,1041867730,1050668841,1066628831,1058355748,1032471859,1024199112,1006669886,1015471301,968368875,960392720,942864358,951368477,975946762,984451313,1000411399,992435708,836562267,828023200,810956886,818967725,844041146,852051777,868605623,860066380,914189410,922427545,938981743,930215316,904825475,896059e3,878993294,887231349,555053627,563297984,547333942,538569677,579245274,570480673,588005847,596249900,649392898,640860153,658384399,666397428,623318499,631331096,615366894,606833685,785398962,777416777,794487231,802989380,759421523,767923880,751374174,743392165,695319947,704115056,687564934,679289981,719477610,711202705,728272487,737067676,2083735460,2092239711,2109313705,2101337682,2141233477,2133257662,2116711496,2125215923,2073216669,2064943718,2048398224,2057199467,2013339772,2022141063,2039215473,2030942602,1945504045,1936737750,1920785440,1929023707,1885728716,1893966647,1911503553,1902736954,1951893524,1959904495,1977441561,1968902626,2009362165,2000822798,1984871416,1992881923,1665111629,1673124534,1656046400,1647513531,1621913772,1613380695,1629922721,1637935450,1688082292,1679317903,1695859321,1704103554,1728967061,1737211246,1720132760,1711368291,1828378820,1820103743,1836060105,1844855090,1869168165,1877963486,1860430632,1852155859,1801148925,1809650950,1792118e3,1784135691,1757986588,1750004711,1765960209,1774462698,1110107254,1118611597,1134571899,1126595968,1102643863,1094667884,1077139354,1085643617,1166763343,1158490548,1140961346,1149762745,1176011694,1184812885,1200772771,1192499800,1307552511,1298785796,1281720306,1289958153,1316768798,1325007077,1341561107,1332794856,1246636998,1254647613,1271201483,1262662192,1239272743,1230733788,1213667370,1221678289,1562785183,1570797924,1554833554,1546300521,1588974462,1580441477,1597965939,1605978760,1518843046,1510078557,1527603627,1535847760,1494504007,1502748348,1486784330,1478020017,1390639894,1382365165,1399434779,1408230112,1366334967,1375129868,1358579962,1350304769,1430452783,1438955220,1422405410,1414423513,1456544974,1448562741,1465633219,1474135352];c["default"]={encode:n,decode:m}},{"../config":10,"../enums.js":35,"./base64.js":34}],34:[function(a,b,c){"use strict";function d(a,b){var c,d,e,g=b?b:[],h=0,i=0,j=a.length;for(e=0;e<j;e++)d=a[e],0===i?(g.push(f.charAt(d>>2&63)),c=(3&d)<<4):1===i?(g.push(f.charAt(c|d>>4&15)),c=(15&d)<<2):2===i&&(g.push(f.charAt(c|d>>6&3)),h+=1,h%60===0&&g.push("\n"),g.push(f.charAt(63&d))),h+=1,h%60===0&&g.push("\n"),i+=1,3===i&&(i=0);if(i>0&&(g.push(f.charAt(c)),h+=1,h%60===0&&g.push("\n"),g.push("="),h+=1),1===i&&(h%60===0&&g.push("\n"),g.push("=")),!b)return g.join("")}function e(a){var b,c,d=[],e=0,g=0,h=a.length;for(c=0;c<h;c++)b=f.indexOf(a.charAt(c)),b>=0&&(e&&d.push(g|b>>6-e&255),e=e+2&7,g=b<<e&255);return new Uint8Array(d)}Object.defineProperty(c,"__esModule",{value:!0});var f="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";c["default"]={encode:d,decode:e}},{}],35:[function(a,b,c){"use strict";Object.defineProperty(c,"__esModule",{value:!0}),c["default"]={s2k:{simple:0,salted:1,iterated:3,gnu:101},publicKey:{rsa_encrypt_sign:1,rsa_encrypt:2,rsa_sign:3,elgamal:16,dsa:17},symmetric:{plaintext:0,idea:1,tripledes:2,cast5:3,blowfish:4,aes128:7,aes192:8,aes256:9,twofish:10},compression:{uncompressed:0,zip:1,zlib:2,bzip2:3},hash:{md5:1,sha1:2,ripemd:3,sha256:8,sha384:9,sha512:10,sha224:11},packet:{publicKeyEncryptedSessionKey:1,signature:2,symEncryptedSessionKey:3,onePassSignature:4,secretKey:5,publicKey:6,secretSubkey:7,compressed:8,symmetricallyEncrypted:9,marker:10,literal:11,trust:12,userid:13,publicSubkey:14,userAttribute:17,symEncryptedIntegrityProtected:18,modificationDetectionCode:19,symEncryptedAEADProtected:20},literal:{binary:"b".charCodeAt(),text:"t".charCodeAt(),utf8:"u".charCodeAt()},signature:{binary:0,text:1,standalone:2,cert_generic:16,cert_persona:17,cert_casual:18,cert_positive:19,cert_revocation:48,subkey_binding:24,key_binding:25,key:31,key_revocation:32,subkey_revocation:40,timestamp:64,third_party:80},signatureSubpacket:{signature_creation_time:2,signature_expiration_time:3,exportable_certification:4,trust_signature:5,regular_expression:6,revocable:7,key_expiration_time:9,placeholder_backwards_compatibility:10,preferred_symmetric_algorithms:11,revocation_key:12,issuer:16,notation_data:20,preferred_hash_algorithms:21,preferred_compression_algorithms:22,key_server_preferences:23,preferred_key_server:24,primary_user_id:25,policy_uri:26,key_flags:27,signers_user_id:28,reason_for_revocation:29,features:30,signature_target:31,embedded_signature:32},keyFlags:{certify_keys:1,sign_data:2,encrypt_communication:4,encrypt_storage:8,split_private_key:16,authentication:32,shared_private_key:128},keyStatus:{invalid:0,expired:1,revoked:2,valid:3,no_self_cert:4},armor:{multipart_section:0,multipart_last:1,signed:2,message:3,public_key:4,private_key:5},write:function(a,b){if("number"==typeof b&&(b=this.read(a,b)),void 0!==a[b])return a[b];throw new Error("Invalid enum value.")},read:function(a,b){for(var c in a)if(a[c]===parseInt(b))return c;throw new Error("Invalid enum value.")}}},{}],36:[function(a,b,c){"use strict";function d(a){return a&&a.__esModule?a:{"default":a}}function e(b){this._baseUrl=b?b:g["default"].keyserver,this._fetch="undefined"!=typeof window?window.fetch:a("node-fetch")}Object.defineProperty(c,"__esModule",{value:!0}),c["default"]=e;var f=a("./config"),g=d(f);e.prototype.lookup=function(a){var b=this._baseUrl+"/pks/lookup?op=get&options=mr&search=",c=this._fetch;if(a.keyId)b+="0x"+encodeURIComponent(a.keyId);else{if(!a.query)throw new Error("You must provide a query parameter!");b+=encodeURIComponent(a.query)}return c(b).then(function(a){if(200===a.status)return a.text()}).then(function(a){if(a&&!(a.indexOf("-----END PGP PUBLIC KEY BLOCK-----")<0))return a.trim()})},e.prototype.upload=function(a){var b=this._baseUrl+"/pks/add",c=this._fetch;return c(b,{method:"post",headers:{"Content-Type":"application/x-www-form-urlencoded; charset=UTF-8"},body:"keytext="+encodeURIComponent(a)})}},{"./config":10,"node-fetch":"node-fetch"}],37:[function(a,b,c){"use strict";function d(a){if(a&&a.__esModule)return a;var b={};if(null!=a)for(var c in a)Object.prototype.hasOwnProperty.call(a,c)&&(b[c]=a[c]);return b["default"]=a,b}function e(a){return a&&a.__esModule?a:{"default":a}}Object.defineProperty(c,"__esModule",{value:!0}),c.HKP=c.AsyncProxy=c.Keyring=c.crypto=c.config=c.enums=c.armor=c.Keyid=c.S2K=c.MPI=c.packet=c.util=c.cleartext=c.message=c.key=void 0;var f=a("./openpgp");Object.keys(f).forEach(function(a){"default"!==a&&Object.defineProperty(c,a,{enumerable:!0,get:function(){return f[a]}})});var g=a("./util");Object.defineProperty(c,"util",{enumerable:!0,get:function(){return e(g)["default"]}});var h=a("./packet");Object.defineProperty(c,"packet",{enumerable:!0,get:function(){return e(h)["default"]}});var i=a("./type/mpi");Object.defineProperty(c,"MPI",{enumerable:!0,get:function(){return e(i)["default"]}});var j=a("./type/s2k");Object.defineProperty(c,"S2K",{enumerable:!0,get:function(){return e(j)["default"]}});var k=a("./type/keyid");Object.defineProperty(c,"Keyid",{enumerable:!0,get:function(){return e(k)["default"]}});var l=a("./encoding/armor");Object.defineProperty(c,"armor",{enumerable:!0,get:function(){return e(l)["default"]}});var m=a("./enums");Object.defineProperty(c,"enums",{enumerable:!0,get:function(){return e(m)["default"]}});var n=a("./config/config");Object.defineProperty(c,"config",{enumerable:!0,get:function(){return e(n)["default"]}});var o=a("./crypto");Object.defineProperty(c,"crypto",{enumerable:!0,get:function(){return e(o)["default"]}});var p=a("./keyring");Object.defineProperty(c,"Keyring",{enumerable:!0,get:function(){return e(p)["default"]}});var q=a("./worker/async_proxy");Object.defineProperty(c,"AsyncProxy",{enumerable:!0,get:function(){return e(q)["default"]}});var r=a("./hkp");Object.defineProperty(c,"HKP",{enumerable:!0,get:function(){return e(r)["default"]}});var s=d(f),t=a("./key"),u=d(t),v=a("./message"),w=d(v),x=a("./cleartext"),y=d(x);c["default"]=s;c.key=u,c.message=w,c.cleartext=y},{"./cleartext":5,"./config/config":9,"./crypto":24,"./encoding/armor":33,"./enums":35,"./hkp":36,"./key":38,"./keyring":39,"./message":42,"./openpgp":43,"./packet":47,"./type/keyid":66,"./type/mpi":67,"./type/s2k":68,"./util":69,"./worker/async_proxy":70}],38:[function(a,b,c){"use strict";function d(a){return a&&a.__esModule?a:{"default":a}}function e(a){if(!(this instanceof e))return new e(a);if(this.primaryKey=null,this.revocationSignature=null,this.directSignatures=null,this.users=null,this.subKeys=null,this.packetlist2structure(a),!this.primaryKey||!this.users)throw new Error("Invalid key: need at least key and user ID packet")}function f(a,b){return a.algorithm!==r["default"].read(r["default"].publicKey,r["default"].publicKey.dsa)&&a.algorithm!==r["default"].read(r["default"].publicKey,r["default"].publicKey.rsa_sign)&&(!b.keyFlags||0!==(b.keyFlags[0]&r["default"].keyFlags.encrypt_communication)||0!==(b.keyFlags[0]&r["default"].keyFlags.encrypt_storage))}function g(a,b){return!(a.algorithm!==r["default"].read(r["default"].publicKey,r["default"].publicKey.dsa)&&a.algorithm!==r["default"].read(r["default"].publicKey,r["default"].publicKey.rsa_sign)&&a.algorithm!==r["default"].read(r["default"].publicKey,r["default"].publicKey.rsa_encrypt_sign)||b.keyFlags&&0===(b.keyFlags[0]&r["default"].keyFlags.sign_data))}function h(a,b){return 3===a.version&&0!==a.expirationTimeV3?new Date(a.created.getTime()+24*a.expirationTimeV3*3600*1e3):4===a.version&&b.keyNeverExpires===!1?new Date(a.created.getTime()+1e3*b.keyExpirationTime):null}function i(a,b,c,d){a=a[c],a&&(b[c]?a.forEach(function(a){a.isExpired()||d&&!d(a)||b[c].some(function(b){return x["default"].equalsUint8Array(b.signature,a.signature)})||b[c].push(a)}):b[c]=a)}function j(a){return this instanceof j?(this.userId=a.tag===r["default"].packet.userid?a:null,this.userAttribute=a.tag===r["default"].packet.userAttribute?a:null,this.selfCertifications=null,this.otherCertifications=null,void(this.revocationCertifications=null)):new j(a)}function k(a){return this instanceof k?(this.subKey=a,this.bindingSignature=null,void(this.revocationSignature=null)):new k(a)}function l(a){var b={};b.keys=[];try{var c=t["default"].decode(a);if(c.type!==r["default"].armor.public_key&&c.type!==r["default"].armor.private_key)throw new Error("Armored text not of type key");var d=new p["default"].List;d.read(c.data);var f=d.indexOfTag(r["default"].packet.publicKey,r["default"].packet.secretKey);if(0===f.length)throw new Error("No key packet found in armored text");for(var g=0;g<f.length;g++){var h=d.slice(f[g],f[g+1]);try{var i=new e(h);b.keys.push(i)}catch(j){b.err=b.err||[],b.err.push(j)}}}catch(j){b.err=b.err||[],b.err.push(j)}return b}function m(a){function b(){return g=new p["default"].SecretKey,g.algorithm=r["default"].read(r["default"].publicKey,a.keyType),g.generate(a.numBits)}function c(){return k=new p["default"].SecretSubkey,k.algorithm=r["default"].read(r["default"].publicKey,a.keyType),k.generate(a.numBits)}function d(){return a.passphrase&&(g.encrypt(a.passphrase),k.encrypt(a.passphrase)),f=new p["default"].List,f.push(g),a.userIds.forEach(function(b,c){h=new p["default"].Userid,h.read(x["default"].str2Uint8Array(b)),i={},i.userid=h,i.key=g,j=new p["default"].Signature,j.signatureType=r["default"].signature.cert_generic,j.publicKeyAlgorithm=a.keyType,j.hashAlgorithm=v["default"].prefer_hash_algorithm,j.keyFlags=[r["default"].keyFlags.certify_keys|r["default"].keyFlags.sign_data],j.preferredSymmetricAlgorithms=[],j.preferredSymmetricAlgorithms.push(r["default"].symmetric.aes256),j.preferredSymmetricAlgorithms.push(r["default"].symmetric.aes128),j.preferredSymmetricAlgorithms.push(r["default"].symmetric.aes192),j.preferredSymmetricAlgorithms.push(r["default"].symmetric.cast5),j.preferredSymmetricAlgorithms.push(r["default"].symmetric.tripledes),j.preferredHashAlgorithms=[],j.preferredHashAlgorithms.push(r["default"].hash.sha256),j.preferredHashAlgorithms.push(r["default"].hash.sha1),j.preferredHashAlgorithms.push(r["default"].hash.sha512),j.preferredCompressionAlgorithms=[],j.preferredCompressionAlgorithms.push(r["default"].compression.zlib),j.preferredCompressionAlgorithms.push(r["default"].compression.zip),0===c&&(j.isPrimaryUserID=!0),v["default"].integrity_protect&&(j.features=[],j.features.push(1)),j.sign(g,i),f.push(h),f.push(j)}),i={},i.key=g,i.bind=k,l=new p["default"].Signature,l.signatureType=r["default"].signature.subkey_binding,l.publicKeyAlgorithm=a.keyType,l.hashAlgorithm=v["default"].prefer_hash_algorithm,l.keyFlags=[r["default"].keyFlags.encrypt_communication|r["default"].keyFlags.encrypt_storage],
l.sign(g,i),f.push(k),f.push(l),a.unlocked||(g.clearPrivateMPIs(),k.clearPrivateMPIs()),new e(f)}var f,g,h,i,j,k,l;return Promise.resolve().then(function(){if(a.keyType=a.keyType||r["default"].publicKey.rsa_encrypt_sign,a.keyType!==r["default"].publicKey.rsa_encrypt_sign)throw new Error("Only RSA Encrypt or Sign supported");return a.passphrase||(a.unlocked=!0),(String.prototype.isPrototypeOf(a.userIds)||"string"==typeof a.userIds)&&(a.userIds=[a.userIds]),Promise.all([b(),c()]).then(d)})}function n(a){var b={};a.forEach(function(a){var c=a.getPrimaryUser();return c&&c.selfCertificate.preferredSymmetricAlgorithms?void c.selfCertificate.preferredSymmetricAlgorithms.forEach(function(a,c){var d=b[a]||(b[a]={prio:0,count:0,algo:a});d.prio+=64>>c,d.count++}):v["default"].encryption_cipher});var c={prio:0,algo:v["default"].encryption_cipher};for(var d in b)try{d!==r["default"].symmetric.plaintext&&d!==r["default"].symmetric.idea&&r["default"].read(r["default"].symmetric,d)&&b[d].count===a.length&&b[d].prio>c.prio&&(c=b[d])}catch(e){}return c.algo}Object.defineProperty(c,"__esModule",{value:!0}),c.Key=e,c.readArmored=l,c.generate=m,c.getPreferredSymAlgo=n;var o=a("./packet"),p=d(o),q=a("./enums.js"),r=d(q),s=a("./encoding/armor.js"),t=d(s),u=a("./config"),v=d(u),w=a("./util"),x=d(w);e.prototype.packetlist2structure=function(a){for(var b,c,d,e=0;e<a.length;e++)switch(a[e].tag){case r["default"].packet.publicKey:case r["default"].packet.secretKey:this.primaryKey=a[e],c=this.primaryKey.getKeyId();break;case r["default"].packet.userid:case r["default"].packet.userAttribute:b=new j(a[e]),this.users||(this.users=[]),this.users.push(b);break;case r["default"].packet.publicSubkey:case r["default"].packet.secretSubkey:b=null,this.subKeys||(this.subKeys=[]),d=new k(a[e]),this.subKeys.push(d);break;case r["default"].packet.signature:switch(a[e].signatureType){case r["default"].signature.cert_generic:case r["default"].signature.cert_persona:case r["default"].signature.cert_casual:case r["default"].signature.cert_positive:if(!b){x["default"].print_debug("Dropping certification signatures without preceding user packet");continue}a[e].issuerKeyId.equals(c)?(b.selfCertifications||(b.selfCertifications=[]),b.selfCertifications.push(a[e])):(b.otherCertifications||(b.otherCertifications=[]),b.otherCertifications.push(a[e]));break;case r["default"].signature.cert_revocation:b?(b.revocationCertifications||(b.revocationCertifications=[]),b.revocationCertifications.push(a[e])):(this.directSignatures||(this.directSignatures=[]),this.directSignatures.push(a[e]));break;case r["default"].signature.key:this.directSignatures||(this.directSignatures=[]),this.directSignatures.push(a[e]);break;case r["default"].signature.subkey_binding:if(!d){x["default"].print_debug("Dropping subkey binding signature without preceding subkey packet");continue}d.bindingSignature=a[e];break;case r["default"].signature.key_revocation:this.revocationSignature=a[e];break;case r["default"].signature.subkey_revocation:if(!d){x["default"].print_debug("Dropping subkey revocation signature without preceding subkey packet");continue}d.revocationSignature=a[e]}}},e.prototype.toPacketlist=function(){var a=new p["default"].List;a.push(this.primaryKey),a.push(this.revocationSignature),a.concat(this.directSignatures);var b;for(b=0;b<this.users.length;b++)a.concat(this.users[b].toPacketlist());if(this.subKeys)for(b=0;b<this.subKeys.length;b++)a.concat(this.subKeys[b].toPacketlist());return a},e.prototype.getSubkeyPackets=function(){var a=[];if(this.subKeys)for(var b=0;b<this.subKeys.length;b++)a.push(this.subKeys[b].subKey);return a},e.prototype.getAllKeyPackets=function(){return[this.primaryKey].concat(this.getSubkeyPackets())},e.prototype.getKeyIds=function(){for(var a=[],b=this.getAllKeyPackets(),c=0;c<b.length;c++)a.push(b[c].getKeyId());return a},e.prototype.getKeyPacket=function(a){for(var b=this.getAllKeyPackets(),c=0;c<b.length;c++)for(var d=b[c].getKeyId(),e=0;e<a.length;e++)if(d.equals(a[e]))return b[c];return null},e.prototype.getUserIds=function(){for(var a=[],b=0;b<this.users.length;b++)this.users[b].userId&&a.push(x["default"].Uint8Array2str(this.users[b].userId.write()));return a},e.prototype.isPublic=function(){return this.primaryKey.tag===r["default"].packet.publicKey},e.prototype.isPrivate=function(){return this.primaryKey.tag===r["default"].packet.secretKey},e.prototype.toPublic=function(){for(var a,b=new p["default"].List,c=this.toPacketlist(),d=0;d<c.length;d++)switch(c[d].tag){case r["default"].packet.secretKey:a=c[d].writePublicKey();var f=new p["default"].PublicKey;f.read(a),b.push(f);break;case r["default"].packet.secretSubkey:a=c[d].writePublicKey();var g=new p["default"].PublicSubkey;g.read(a),b.push(g);break;default:b.push(c[d])}return new e(b)},e.prototype.armor=function(){var a=this.isPublic()?r["default"].armor.public_key:r["default"].armor.private_key;return t["default"].encode(a,this.toPacketlist().write())},e.prototype.getSigningKeyPacket=function(a){var b=this.getPrimaryUser();if(b&&g(this.primaryKey,b.selfCertificate)&&(!a||this.primaryKey.getKeyId().equals(a)))return this.primaryKey;if(this.subKeys)for(var c=0;c<this.subKeys.length;c++)if(this.subKeys[c].isValidSigningKey(this.primaryKey)&&(!a||this.subKeys[c].subKey.getKeyId().equals(a)))return this.subKeys[c].subKey;return null},e.prototype.getPreferredHashAlgorithm=function(){var a=this.getPrimaryUser();return a&&a.selfCertificate.preferredHashAlgorithms?a.selfCertificate.preferredHashAlgorithms[0]:v["default"].prefer_hash_algorithm},e.prototype.getEncryptionKeyPacket=function(){if(this.subKeys)for(var a=0;a<this.subKeys.length;a++)if(this.subKeys[a].isValidEncryptionKey(this.primaryKey))return this.subKeys[a].subKey;var b=this.getPrimaryUser();return b&&f(this.primaryKey,b.selfCertificate)?this.primaryKey:null},e.prototype.encrypt=function(a){if(!this.isPrivate())throw new Error("Nothing to encrypt in a public key");for(var b=this.getAllKeyPackets(),c=0;c<b.length;c++)b[c].encrypt(a),b[c].clearPrivateMPIs()},e.prototype.decrypt=function(a){if(!this.isPrivate())throw new Error("Nothing to decrypt in a public key");for(var b=this.getAllKeyPackets(),c=0;c<b.length;c++){var d=b[c].decrypt(a);if(!d)return!1}return!0},e.prototype.decryptKeyPacket=function(a,b){if(!this.isPrivate())throw new Error("Nothing to decrypt in a public key");for(var c=this.getAllKeyPackets(),d=0;d<c.length;d++)for(var e=c[d].getKeyId(),f=0;f<a.length;f++)if(e.equals(a[f])){var g=c[d].decrypt(b);if(!g)return!1}return!0},e.prototype.verifyPrimaryKey=function(){if(this.revocationSignature&&!this.revocationSignature.isExpired()&&(this.revocationSignature.verified||this.revocationSignature.verify(this.primaryKey,{key:this.primaryKey})))return r["default"].keyStatus.revoked;if(3===this.primaryKey.version&&0!==this.primaryKey.expirationTimeV3&&Date.now()>this.primaryKey.created.getTime()+24*this.primaryKey.expirationTimeV3*3600*1e3)return r["default"].keyStatus.expired;for(var a=!1,b=0;b<this.users.length;b++)this.users[b].userId&&this.users[b].selfCertifications&&(a=!0);if(!a)return r["default"].keyStatus.no_self_cert;var c=this.getPrimaryUser();return c?4===this.primaryKey.version&&c.selfCertificate.keyNeverExpires===!1&&Date.now()>this.primaryKey.created.getTime()+1e3*c.selfCertificate.keyExpirationTime?r["default"].keyStatus.expired:r["default"].keyStatus.valid:r["default"].keyStatus.invalid},e.prototype.getExpirationTime=function(){if(3===this.primaryKey.version)return h(this.primaryKey);if(4===this.primaryKey.version){var a=this.getPrimaryUser();return a?h(this.primaryKey,a.selfCertificate):null}},e.prototype.getPrimaryUser=function(){for(var a=[],b=0;b<this.users.length;b++)if(this.users[b].userId&&this.users[b].selfCertifications)for(var c=0;c<this.users[b].selfCertifications.length;c++)a.push({user:this.users[b],selfCertificate:this.users[b].selfCertifications[c]});a=a.sort(function(a,b){return a.selfCertificate.isPrimaryUserID>b.selfCertificate.isPrimaryUserID?-1:a.selfCertificate.isPrimaryUserID<b.selfCertificate.isPrimaryUserID?1:a.selfCertificate.created>b.selfCertificate.created?-1:a.selfCertificate.created<b.selfCertificate.created?1:0});for(var d=0;d<a.length;d++)if(a[d].user.isValidSelfCertificate(this.primaryKey,a[d].selfCertificate))return a[d];return null},e.prototype.update=function(a){var b=this;if(a.verifyPrimaryKey()!==r["default"].keyStatus.invalid){if(this.primaryKey.getFingerprint()!==a.primaryKey.getFingerprint())throw new Error("Key update method: fingerprints of keys not equal");if(this.isPublic()&&a.isPrivate()){var c=(this.subKeys&&this.subKeys.length)===(a.subKeys&&a.subKeys.length)&&(!this.subKeys||this.subKeys.every(function(b){return a.subKeys.some(function(a){return b.subKey.getFingerprint()===a.subKey.getFingerprint()})}));if(!c)throw new Error("Cannot update public key with private key if subkey mismatch");this.primaryKey=a.primaryKey}this.revocationSignature||!a.revocationSignature||a.revocationSignature.isExpired()||!a.revocationSignature.verified&&!a.revocationSignature.verify(a.primaryKey,{key:a.primaryKey})||(this.revocationSignature=a.revocationSignature),i(a,this,"directSignatures"),a.users.forEach(function(a){for(var c=!1,d=0;d<b.users.length;d++)if(a.userId&&a.userId.userid===b.users[d].userId.userid||a.userAttribute&&a.userAttribute.equals(b.users[d].userAttribute)){b.users[d].update(a,b.primaryKey),c=!0;break}c||b.users.push(a)}),a.subKeys&&a.subKeys.forEach(function(a){for(var c=!1,d=0;d<b.subKeys.length;d++)if(a.subKey.getFingerprint()===b.subKeys[d].subKey.getFingerprint()){b.subKeys[d].update(a,b.primaryKey),c=!0;break}c||b.subKeys.push(a)})}},e.prototype.revoke=function(){},j.prototype.toPacketlist=function(){var a=new p["default"].List;return a.push(this.userId||this.userAttribute),a.concat(this.revocationCertifications),a.concat(this.selfCertifications),a.concat(this.otherCertifications),a},j.prototype.isRevoked=function(a,b){if(this.revocationCertifications){var c=this;return this.revocationCertifications.some(function(d){return d.issuerKeyId.equals(a.issuerKeyId)&&!d.isExpired()&&(d.verified||d.verify(b,{userid:c.userId||c.userAttribute,key:b}))})}return!1},j.prototype.getValidSelfCertificate=function(a){if(!this.selfCertifications)return null;for(var b=this.selfCertifications.sort(function(a,b){return a=a.created,b=b.created,a>b?-1:a<b?1:0}),c=0;c<b.length;c++)if(this.isValidSelfCertificate(a,b[c]))return b[c];return null},j.prototype.isValidSelfCertificate=function(a,b){return!this.isRevoked(b,a)&&!(b.isExpired()||!b.verified&&!b.verify(a,{userid:this.userId||this.userAttribute,key:a}))},j.prototype.verify=function(a){if(!this.selfCertifications)return r["default"].keyStatus.no_self_cert;for(var b,c=0;c<this.selfCertifications.length;c++)if(this.isRevoked(this.selfCertifications[c],a))b=r["default"].keyStatus.revoked;else if(this.selfCertifications[c].verified||this.selfCertifications[c].verify(a,{userid:this.userId||this.userAttribute,key:a})){if(!this.selfCertifications[c].isExpired()){b=r["default"].keyStatus.valid;break}b=r["default"].keyStatus.expired}else b=r["default"].keyStatus.invalid;return b},j.prototype.update=function(a,b){var c=this;i(a,this,"selfCertifications",function(a){return a.verified||a.verify(b,{userid:c.userId||c.userAttribute,key:b})}),i(a,this,"otherCertifications"),i(a,this,"revocationCertifications")},k.prototype.toPacketlist=function(){var a=new p["default"].List;return a.push(this.subKey),a.push(this.revocationSignature),a.push(this.bindingSignature),a},k.prototype.isValidEncryptionKey=function(a){return this.verify(a)===r["default"].keyStatus.valid&&f(this.subKey,this.bindingSignature)},k.prototype.isValidSigningKey=function(a){return this.verify(a)===r["default"].keyStatus.valid&&g(this.subKey,this.bindingSignature)},k.prototype.verify=function(a){return this.revocationSignature&&!this.revocationSignature.isExpired()&&(this.revocationSignature.verified||this.revocationSignature.verify(a,{key:a,bind:this.subKey}))?r["default"].keyStatus.revoked:3===this.subKey.version&&0!==this.subKey.expirationTimeV3&&Date.now()>this.subKey.created.getTime()+24*this.subKey.expirationTimeV3*3600*1e3?r["default"].keyStatus.expired:this.bindingSignature?this.bindingSignature.isExpired()?r["default"].keyStatus.expired:this.bindingSignature.verified||this.bindingSignature.verify(a,{key:a,bind:this.subKey})?4===this.subKey.version&&this.bindingSignature.keyNeverExpires===!1&&Date.now()>this.subKey.created.getTime()+1e3*this.bindingSignature.keyExpirationTime?r["default"].keyStatus.expired:r["default"].keyStatus.valid:r["default"].keyStatus.invalid:r["default"].keyStatus.invalid},k.prototype.getExpirationTime=function(){return h(this.subKey,this.bindingSignature)},k.prototype.update=function(a,b){if(a.verify(b)!==r["default"].keyStatus.invalid){if(this.subKey.getFingerprint()!==a.subKey.getFingerprint())throw new Error("SubKey update method: fingerprints of subkeys not equal");this.subKey.tag===r["default"].packet.publicSubkey&&a.subKey.tag===r["default"].packet.secretSubkey&&(this.subKey=a.subKey),!this.bindingSignature&&a.bindingSignature&&(a.bindingSignature.verified||a.bindingSignature.verify(b,{key:b,bind:this.subKey}))&&(this.bindingSignature=a.bindingSignature),this.revocationSignature||!a.revocationSignature||a.revocationSignature.isExpired()||!a.revocationSignature.verified&&!a.revocationSignature.verify(b,{key:b,bind:this.subKey})||(this.revocationSignature=a.revocationSignature)}}},{"./config":10,"./encoding/armor.js":33,"./enums.js":35,"./packet":47,"./util":69}],39:[function(a,b,c){"use strict";function d(a){return a&&a.__esModule?a:{"default":a}}Object.defineProperty(c,"__esModule",{value:!0});var e=a("./keyring.js"),f=d(e),g=a("./localstore.js"),h=d(g);f["default"].localstore=h["default"],c["default"]=f["default"]},{"./keyring.js":40,"./localstore.js":41}],40:[function(a,b,c){"use strict";function d(a){return a&&a.__esModule?a:{"default":a}}function e(a){if(a&&a.__esModule)return a;var b={};if(null!=a)for(var c in a)Object.prototype.hasOwnProperty.call(a,c)&&(b[c]=a[c]);return b["default"]=a,b}function f(a){this.storeHandler=a||new m["default"],this.publicKeys=new g(this.storeHandler.loadPublic()),this.privateKeys=new g(this.storeHandler.loadPrivate())}function g(a){this.keys=a}function h(a,b){a=a.toLowerCase();for(var c=a.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"),d=new RegExp("<"+c+">"),e=b.getUserIds(),f=0;f<e.length;f++){var g=e[f].toLowerCase();if(a===g||d.test(g))return!0}return!1}function i(a,b){return 16===a.length?a===b.getKeyId().toHex():a===b.getFingerprint()}Object.defineProperty(c,"__esModule",{value:!0}),c["default"]=f;var j=a("../key.js"),k=e(j),l=a("./localstore.js"),m=d(l);f.prototype.store=function(){this.storeHandler.storePublic(this.publicKeys.keys),this.storeHandler.storePrivate(this.privateKeys.keys)},f.prototype.clear=function(){this.publicKeys.keys=[],this.privateKeys.keys=[]},f.prototype.getKeysForId=function(a,b){var c=[];return c=c.concat(this.publicKeys.getForId(a,b)||[]),c=c.concat(this.privateKeys.getForId(a,b)||[]),c.length?c:null},f.prototype.removeKeysForId=function(a){var b=[];return b=b.concat(this.publicKeys.removeForId(a)||[]),b=b.concat(this.privateKeys.removeForId(a)||[]),b.length?b:null},f.prototype.getAllKeys=function(){return this.publicKeys.keys.concat(this.privateKeys.keys)},g.prototype.getForAddress=function(a){for(var b=[],c=0;c<this.keys.length;c++)h(a,this.keys[c])&&b.push(this.keys[c]);return b},g.prototype.getForId=function(a,b){for(var c=0;c<this.keys.length;c++){if(i(a,this.keys[c].primaryKey))return this.keys[c];if(b&&this.keys[c].subKeys)for(var d=0;d<this.keys[c].subKeys.length;d++)if(i(a,this.keys[c].subKeys[d].subKey))return this.keys[c]}return null},g.prototype.importKey=function(a){var b=k.readArmored(a),c=this;return b.keys.forEach(function(a){var b=a.primaryKey.getKeyId().toHex(),d=c.getForId(b);d?d.update(a):c.push(a)}),b.err?b.err:null},g.prototype.push=function(a){return this.keys.push(a)},g.prototype.removeForId=function(a){for(var b=0;b<this.keys.length;b++)if(i(a,this.keys[b].primaryKey))return this.keys.splice(b,1)[0];return null}},{"../key.js":38,"./localstore.js":41}],41:[function(a,b,c){"use strict";function d(a){if(a&&a.__esModule)return a;var b={};if(null!=a)for(var c in a)Object.prototype.hasOwnProperty.call(a,c)&&(b[c]=a[c]);return b["default"]=a,b}function e(a){return a&&a.__esModule?a:{"default":a}}function f(b){b=b||"openpgp-",this.publicKeysItem=b+this.publicKeysItem,this.privateKeysItem=b+this.privateKeysItem,"undefined"!=typeof window&&window.localStorage?this.storage=window.localStorage:this.storage=new(a("node-localstorage").LocalStorage)(j["default"].node_store)}function g(a,b){var c=JSON.parse(a.getItem(b)),d=[];if(null!==c&&0!==c.length)for(var e,f=0;f<c.length;f++)e=l.readArmored(c[f]),e.err?n["default"].print_debug("Error reading armored key from keyring index: "+f):d.push(e.keys[0]);return d}function h(a,b,c){var d=[];if(c.length){for(var e=0;e<c.length;e++)d.push(c[e].armor());a.setItem(b,JSON.stringify(d))}else a.removeItem(b)}Object.defineProperty(c,"__esModule",{value:!0}),c["default"]=f;var i=a("../config"),j=e(i),k=a("../key.js"),l=d(k),m=a("../util.js"),n=e(m);f.prototype.publicKeysItem="public-keys",f.prototype.privateKeysItem="private-keys",f.prototype.loadPublic=function(){return g(this.storage,this.publicKeysItem)},f.prototype.loadPrivate=function(){return g(this.storage,this.privateKeysItem)},f.prototype.storePublic=function(a){h(this.storage,this.publicKeysItem,a)},f.prototype.storePrivate=function(a){h(this.storage,this.privateKeysItem,a)}},{"../config":10,"../key.js":38,"../util.js":69,"node-localstorage":"node-localstorage"}],42:[function(a,b,c){"use strict";function d(a){if(a&&a.__esModule)return a;var b={};if(null!=a)for(var c in a)Object.prototype.hasOwnProperty.call(a,c)&&(b[c]=a[c]);return b["default"]=a,b}function e(a){return a&&a.__esModule?a:{"default":a}}function f(a){return this instanceof f?void(this.packets=a||new p["default"].List):new f(a)}function g(a,b,c,d){var e=new p["default"].List;return c&&c.forEach(function(c){var d=c.getEncryptionKeyPacket();if(!d)throw new Error("Could not find valid key packet for encryption in key "+c.primaryKey.getKeyId().toHex());var f=new p["default"].PublicKeyEncryptedSessionKey;f.publicKeyId=d.getKeyId(),f.publicKeyAlgorithm=d.algorithm,f.sessionKey=a,f.sessionKeyAlgorithm=b,f.encrypt(d),delete f.sessionKey,e.push(f)}),d&&d.forEach(function(c){var d=new p["default"].SymEncryptedSessionKey;d.sessionKey=a,d.sessionKeyAlgorithm=b,d.encrypt(c),delete d.sessionKey,e.push(d)}),new f(e)}function h(a){var b=t["default"].decode(a).data;return i(b)}function i(a){var b=new p["default"].List;return b.read(a),new f(b)}function j(a,b){var c=new p["default"].Literal;c.setBytes(n["default"].str2Uint8Array(a),r["default"].read(r["default"].literal,r["default"].literal.binary));var d=new p["default"].List;d.push(c);var e=t["default"].decode(b).data;return d.read(e),new f(d)}function k(a,b){var c=new p["default"].Literal;c.setText(a),void 0!==b&&c.setFilename(b);var d=new p["default"].List;return d.push(c),new f(d)}function l(a,b){if(!n["default"].isUint8Array(a))throw new Error("Data must be in the form of a Uint8Array");var c=new p["default"].Literal;b&&c.setFilename(b),c.setBytes(a,r["default"].read(r["default"].literal,r["default"].literal.binary)),void 0!==b&&c.setFilename(b);var d=new p["default"].List;return d.push(c),new f(d)}Object.defineProperty(c,"__esModule",{value:!0}),c.Message=f,c.encryptSessionKey=g,c.readArmored=h,c.read=i,c.readSignedContent=j,c.fromText=k,c.fromBinary=l;var m=a("./util.js"),n=e(m),o=a("./packet"),p=e(o),q=a("./enums.js"),r=e(q),s=a("./encoding/armor.js"),t=e(s),u=a("./config"),v=e(u),w=a("./crypto"),x=e(w),y=a("./key.js"),z=d(y);f.prototype.getEncryptionKeyIds=function(){var a=[],b=this.packets.filterByTag(r["default"].packet.publicKeyEncryptedSessionKey);return b.forEach(function(b){a.push(b.publicKeyId)}),a},f.prototype.getSigningKeyIds=function(){var a=[],b=this.unwrapCompressed(),c=b.packets.filterByTag(r["default"].packet.onePassSignature);if(c.forEach(function(b){a.push(b.signingKeyId)}),!a.length){var d=b.packets.filterByTag(r["default"].packet.signature);d.forEach(function(b){a.push(b.issuerKeyId)})}return a},f.prototype.decrypt=function(a,b,c){var d=this;return Promise.resolve().then(function(){var e=b||d.decryptSessionKey(a,c);if(!e||!n["default"].isUint8Array(e.data)||!n["default"].isString(e.algorithm))throw new Error("Invalid session key for decryption.");var g=d.packets.filterByTag(r["default"].packet.symmetricallyEncrypted,r["default"].packet.symEncryptedIntegrityProtected,r["default"].packet.symEncryptedAEADProtected);if(0!==g.length){var h=g[0];return h.decrypt(e.algorithm,e.data).then(function(){var a=new f(h.packets);return h.packets=new p["default"].List,a})}})},f.prototype.decryptSessionKey=function(a,b){var c;if(b){for(var d=this.packets.filterByTag(r["default"].packet.symEncryptedSessionKey),e=d.length,f=0;f<e;f++){c=d[f];try{c.decrypt(b);break}catch(g){if(f===e-1)throw g}}if(!c)throw new Error("No symmetrically encrypted session key packet found.")}else{if(!a)throw new Error("No key or password specified.");var h=this.getEncryptionKeyIds();if(!h.length)return;var i=a.getKeyPacket(h);if(!i.isDecrypted)throw new Error("Private key is not decrypted.");for(var j=this.packets.filterByTag(r["default"].packet.publicKeyEncryptedSessionKey),k=0;k<j.length;k++)if(j[k].publicKeyId.equals(i.getKeyId())){c=j[k],c.decrypt(i);break}}if(c)return{data:c.sessionKey,algorithm:c.sessionKeyAlgorithm}},f.prototype.getLiteralData=function(){var a=this.packets.findPacket(r["default"].packet.literal);return a&&a.data||null},f.prototype.getFilename=function(){var a=this.packets.findPacket(r["default"].packet.literal);return a&&a.getFilename()||null},f.prototype.getText=function(){var a=this.packets.findPacket(r["default"].packet.literal);return a?a.getText():null},f.prototype.encrypt=function(a,b){var c=this,d=void 0,e=void 0,f=void 0;return Promise.resolve().then(function(){if(a)d=z.getPreferredSymAlgo(a);else{if(!b)throw new Error("No keys or passwords");d=v["default"].encryption_cipher}var h=x["default"].generateSessionKey(r["default"].read(r["default"].symmetric,d));return e=g(h,r["default"].read(r["default"].symmetric,d),a,b),f=v["default"].aead_protect?new p["default"].SymEncryptedAEADProtected:v["default"].integrity_protect?new p["default"].SymEncryptedIntegrityProtected:new p["default"].SymmetricallyEncrypted,f.packets=c.packets,f.encrypt(r["default"].read(r["default"].symmetric,d),h)}).then(function(){return e.packets.push(f),f.packets=new p["default"].List,e})},f.prototype.sign=function(a){var b=new p["default"].List,c=this.packets.findPacket(r["default"].packet.literal);if(!c)throw new Error("No literal data packet to sign.");var d,e,g=r["default"].write(r["default"].literal,c.format),h=g===r["default"].literal.binary?r["default"].signature.binary:r["default"].signature.text;for(d=0;d<a.length;d++){if(a[d].isPublic())throw new Error("Need private key for signing");var i=new p["default"].OnePassSignature;if(i.type=h,i.hashAlgorithm=v["default"].prefer_hash_algorithm,e=a[d].getSigningKeyPacket(),!e)throw new Error("Could not find valid key packet for signing in key "+a[d].primaryKey.getKeyId().toHex());i.publicKeyAlgorithm=e.algorithm,i.signingKeyId=e.getKeyId(),d===a.length-1&&(i.flags=1),b.push(i)}for(b.push(c),d=a.length-1;d>=0;d--){var j=new p["default"].Signature;if(j.signatureType=h,j.hashAlgorithm=v["default"].prefer_hash_algorithm,j.publicKeyAlgorithm=e.algorithm,!e.isDecrypted)throw new Error("Private key is not decrypted.");j.sign(e,c),b.push(j)}return new f(b)},f.prototype.verify=function(a){var b=[],c=this.unwrapCompressed(),d=c.packets.filterByTag(r["default"].packet.literal);if(1!==d.length)throw new Error("Can only verify message with one literal data packet.");for(var e=c.packets.filterByTag(r["default"].packet.signature),f=0;f<e.length;f++){for(var g=null,h=0;h<a.length&&!(g=a[h].getSigningKeyPacket(e[f].issuerKeyId));h++);var i={};g?(i.keyid=e[f].issuerKeyId,i.valid=e[f].verify(g,d[0])):(i.keyid=e[f].issuerKeyId,i.valid=null),b.push(i)}return b},f.prototype.unwrapCompressed=function(){var a=this.packets.filterByTag(r["default"].packet.compressed);return a.length?new f(a[0].packets):this},f.prototype.armor=function(){return t["default"].encode(r["default"].armor.message,this.packets.write())}},{"./config":10,"./crypto":24,"./encoding/armor.js":33,"./enums.js":35,"./key.js":38,"./packet":47,"./util.js":69}],43:[function(a,b,c){"use strict";function d(a){return a&&a.__esModule?a:{"default":a}}function e(a){if(a&&a.__esModule)return a;var b={};if(null!=a)for(var c in a)Object.prototype.hasOwnProperty.call(a,c)&&(b[c]=a[c]);return b["default"]=a,b}function f(){var a=arguments.length<=0||void 0===arguments[0]?{}:arguments[0],b=a.path,c=void 0===b?"openpgp.worker.js":b,d=a.worker;if(d||"undefined"!=typeof window&&window.Worker)return Q=new N["default"]({path:c,worker:d,config:J["default"]}),!0}function g(){return Q}function h(){Q=void 0}function i(){var a=arguments.length<=0||void 0===arguments[0]?{}:arguments[0],b=a.userIds,c=void 0===b?[]:b,d=a.passphrase,e=a.numBits,f=void 0===e?2048:e,g=a.unlocked,h=void 0!==g&&g,i=v({userIds:c,passphrase:d,numBits:f,unlocked:h});return!L["default"].getWebCryptoAll()&&Q?Q.delegate("generateKey",i):H.generate(i).then(function(a){return{key:a,privateKeyArmored:a.armor(),publicKeyArmored:a.toPublic().armor()}})["catch"](A.bind(null,"Error generating keypair"))}function j(a){var b=a.privateKey,c=a.passphrase;return Q?Q.delegate("decryptKey",{privateKey:b,passphrase:c}):z(function(){if(!b.decrypt(c))throw new Error("Invalid passphrase");return{key:b}},"Error decrypting private key")}function k(a){var b=a.data,c=a.publicKeys,d=a.privateKeys,e=a.passwords,f=a.filename,g=a.armor,h=void 0===g||g;return s(b),c=w(c),d=w(d),e=w(e),!B()&&Q?Q.delegate("encrypt",{data:b,publicKeys:c,privateKeys:d,passwords:e,filename:f,armor:h}):Promise.resolve().then(function(){var a=x(b,f);return d&&(a=a.sign(d)),a.encrypt(c,e)}).then(function(a){return h?{data:a.armor()}:{message:a}})["catch"](A.bind(null,"Error encrypting message"))}function l(a){var b=a.message,c=a.privateKey,d=a.publicKeys,e=a.sessionKey,f=a.password,g=a.format,h=void 0===g?"utf8":g;return t(b),d=w(d),!B()&&Q?Q.delegate("decrypt",{message:b,privateKey:c,publicKeys:d,sessionKey:e,password:f,format:h}):b.decrypt(c,e,f).then(function(a){var b=y(a,h);return d&&b.data&&(b.signatures=a.verify(d)),b})["catch"](A.bind(null,"Error decrypting message"))}function m(a){var b=a.data,c=a.privateKeys,d=a.armor,e=void 0===d||d;return q(b),c=w(c),Q?Q.delegate("sign",{data:b,privateKeys:c,armor:e}):z(function(){var a=new F.CleartextMessage(b);return a.sign(c),e?{data:a.armor()}:{message:a}},"Error signing cleartext message")}function n(a){var b=a.message,c=a.publicKeys;return u(b),c=w(c),Q?Q.delegate("verify",{message:b,publicKeys:c}):z(function(){return{data:b.getText(),signatures:b.verify(c)}},"Error verifying cleartext signed message")}function o(a){var b=a.data,c=a.algorithm,d=a.publicKeys,e=a.passwords;return r(b),q(c,"algorithm"),d=w(d),e=w(e),Q?Q.delegate("encryptSessionKey",{data:b,algorithm:c,publicKeys:d,passwords:e}):z(function(){return{message:D.encryptSessionKey(b,c,d,e)}},"Error encrypting session key")}function p(a){var b=a.message,c=a.privateKey,d=a.password;return t(b),Q?Q.delegate("decryptSessionKey",{message:b,privateKey:c,password:d}):z(function(){return b.decryptSessionKey(c,d)},"Error decrypting session key")}function q(a,b){if(!L["default"].isString(a))throw new Error("Parameter ["+(b||"data")+"] must be of type String")}function r(a,b){if(!L["default"].isUint8Array(a))throw new Error("Parameter ["+(b||"data")+"] must be of type Uint8Array")}function s(a,b){if(!L["default"].isUint8Array(a)&&!L["default"].isString(a))throw new Error("Parameter ["+(b||"data")+"] must be of type String or Uint8Array")}function t(a){if(!D.Message.prototype.isPrototypeOf(a))throw new Error("Parameter [message] needs to be of type Message")}function u(a){if(!F.CleartextMessage.prototype.isPrototypeOf(a))throw new Error("Parameter [message] needs to be of type CleartextMessage")}function v(a){return a.userIds?(a.userIds=w(a.userIds),a.userIds=a.userIds.map(function(a){if(L["default"].isString(a)&&!L["default"].isUserId(a))throw new Error("Invalid user id format");if(L["default"].isUserId(a))return a;if(a.name=a.name||"",a.email=a.email||"",!L["default"].isString(a.name)||a.email&&!L["default"].isEmailAddress(a.email))throw new Error("Invalid user id format");return a.name+" <"+a.email+">"}),a):a}function w(a){return a&&!L["default"].isArray(a)&&(a=[a]),a}function x(a,b){var c=void 0;if(L["default"].isUint8Array(a))c=D.fromBinary(a,b);else{if(!L["default"].isString(a))throw new Error("Data must be of type String or Uint8Array");c=D.fromText(a,b)}return c}function y(a,b){if("binary"===b)return{data:a.getLiteralData(),filename:a.getFilename()};if("utf8"===b)return{data:a.getText(),filename:a.getFilename()};throw new Error("Invalid format")}function z(a,b){var c=new Promise(function(b){return b(a())});return c["catch"](A.bind(null,b))}function A(a,b){throw J["default"].debug&&console.error(b.stack),new Error(a+": "+b.message)}function B(){return L["default"].getWebCrypto()&&J["default"].aead_protect}Object.defineProperty(c,"__esModule",{value:!0}),c.initWorker=f,c.getWorker=g,c.destroyWorker=h,c.generateKey=i,c.decryptKey=j,c.encrypt=k,c.decrypt=l,c.sign=m,c.verify=n,c.encryptSessionKey=o,c.decryptSessionKey=p;var C=a("./message.js"),D=e(C),E=a("./cleartext.js"),F=e(E),G=a("./key.js"),H=e(G),I=a("./config/config.js"),J=d(I),K=a("./util"),L=d(K),M=a("./worker/async_proxy.js"),N=d(M),O=a("es6-promise"),P=d(O);P["default"].polyfill();var Q=void 0},{"./cleartext.js":5,"./config/config.js":9,"./key.js":38,"./message.js":42,"./util":69,"./worker/async_proxy.js":70,"es6-promise":2}],44:[function(a,b,c){"use strict";function d(a){if(a&&a.__esModule)return a;var b={};if(null!=a)for(var c in a)Object.prototype.hasOwnProperty.call(a,c)&&(b[c]=a[c]);return b["default"]=a,b}function e(a){return a&&a.__esModule?a:{"default":a}}function f(a){return new(C[h(a)])}function g(a){var b=A["default"].read(A["default"].packet,a.tag),c=f(b);for(var d in a)a.hasOwnProperty(d)&&(c[d]=a[d]);return c.postCloneTypeFix&&c.postCloneTypeFix(),c}function h(a){return a.substr(0,1).toUpperCase()+a.substr(1)}Object.defineProperty(c,"__esModule",{value:!0}),c.Trust=c.Signature=c.SecretSubkey=c.Userid=c.SecretKey=c.OnePassSignature=c.UserAttribute=c.PublicSubkey=c.Marker=c.SymmetricallyEncrypted=c.PublicKey=c.Literal=c.SymEncryptedSessionKey=c.PublicKeyEncryptedSessionKey=c.SymEncryptedAEADProtected=c.SymEncryptedIntegrityProtected=c.Compressed=void 0;var i=a("./compressed.js");Object.defineProperty(c,"Compressed",{enumerable:!0,get:function(){return e(i)["default"]}});var j=a("./sym_encrypted_integrity_protected.js");Object.defineProperty(c,"SymEncryptedIntegrityProtected",{enumerable:!0,get:function(){return e(j)["default"]}});var k=a("./sym_encrypted_aead_protected.js");Object.defineProperty(c,"SymEncryptedAEADProtected",{enumerable:!0,get:function(){return e(k)["default"]}});var l=a("./public_key_encrypted_session_key.js");Object.defineProperty(c,"PublicKeyEncryptedSessionKey",{enumerable:!0,get:function(){return e(l)["default"]}});var m=a("./sym_encrypted_session_key.js");Object.defineProperty(c,"SymEncryptedSessionKey",{enumerable:!0,get:function(){return e(m)["default"]}});var n=a("./literal.js");Object.defineProperty(c,"Literal",{enumerable:!0,get:function(){return e(n)["default"]}});var o=a("./public_key.js");Object.defineProperty(c,"PublicKey",{enumerable:!0,get:function(){return e(o)["default"]}});var p=a("./symmetrically_encrypted.js");Object.defineProperty(c,"SymmetricallyEncrypted",{enumerable:!0,get:function(){
return e(p)["default"]}});var q=a("./marker.js");Object.defineProperty(c,"Marker",{enumerable:!0,get:function(){return e(q)["default"]}});var r=a("./public_subkey.js");Object.defineProperty(c,"PublicSubkey",{enumerable:!0,get:function(){return e(r)["default"]}});var s=a("./user_attribute.js");Object.defineProperty(c,"UserAttribute",{enumerable:!0,get:function(){return e(s)["default"]}});var t=a("./one_pass_signature.js");Object.defineProperty(c,"OnePassSignature",{enumerable:!0,get:function(){return e(t)["default"]}});var u=a("./secret_key.js");Object.defineProperty(c,"SecretKey",{enumerable:!0,get:function(){return e(u)["default"]}});var v=a("./userid.js");Object.defineProperty(c,"Userid",{enumerable:!0,get:function(){return e(v)["default"]}});var w=a("./secret_subkey.js");Object.defineProperty(c,"SecretSubkey",{enumerable:!0,get:function(){return e(w)["default"]}});var x=a("./signature.js");Object.defineProperty(c,"Signature",{enumerable:!0,get:function(){return e(x)["default"]}});var y=a("./trust.js");Object.defineProperty(c,"Trust",{enumerable:!0,get:function(){return e(y)["default"]}}),c.newPacketFromTag=f,c.fromStructuredClone=g;var z=a("../enums.js"),A=e(z),B=a("./all_packets.js"),C=d(B)},{"../enums.js":35,"./all_packets.js":44,"./compressed.js":46,"./literal.js":48,"./marker.js":49,"./one_pass_signature.js":50,"./public_key.js":53,"./public_key_encrypted_session_key.js":54,"./public_subkey.js":55,"./secret_key.js":56,"./secret_subkey.js":57,"./signature.js":58,"./sym_encrypted_aead_protected.js":59,"./sym_encrypted_integrity_protected.js":60,"./sym_encrypted_session_key.js":61,"./symmetrically_encrypted.js":62,"./trust.js":63,"./user_attribute.js":64,"./userid.js":65}],45:[function(a,b,c){"use strict";function d(a){return a&&a.__esModule?a:{"default":a}}function e(a){if(a&&a.__esModule)return a;var b={};if(null!=a)for(var c in a)Object.prototype.hasOwnProperty.call(a,c)&&(b[c]=a[c]);return b["default"]=a,b}function f(a){return a.publicKeys&&(a.publicKeys=a.publicKeys.map(function(a){return a.toPacketlist()})),a.privateKeys&&(a.privateKeys=a.privateKeys.map(function(a){return a.toPacketlist()})),a.privateKey&&(a.privateKey=a.privateKey.toPacketlist()),a.key&&(a.key=a.key.toPacketlist()),a}function g(a,b){return a.publicKeys&&(a.publicKeys=a.publicKeys.map(h)),a.privateKeys&&(a.privateKeys=a.privateKeys.map(h)),a.privateKey&&(a.privateKey=h(a.privateKey)),a.key&&(a.key=h(a.key)),!a.message||"sign"!==b&&"verify"!==b?a.message&&(a.message=i(a.message)):a.message=j(a.message),a.signatures&&(a.signatures=a.signatures.map(k)),a}function h(a){var b=s["default"].fromStructuredClone(a);return new m.Key(b)}function i(a){var b=s["default"].fromStructuredClone(a.packets);return new o.Message(b)}function j(a){var b=s["default"].fromStructuredClone(a.packets);return new q.CleartextMessage(a.text,b)}function k(a){return a.keyid=u["default"].fromClone(a.keyid),a}Object.defineProperty(c,"__esModule",{value:!0}),c.clonePackets=f,c.parseClonedPackets=g;var l=a("../key.js"),m=e(l),n=a("../message.js"),o=e(n),p=a("../cleartext.js"),q=e(p),r=a("./packetlist.js"),s=d(r),t=a("../type/keyid.js"),u=d(t)},{"../cleartext.js":5,"../key.js":38,"../message.js":42,"../type/keyid.js":66,"./packetlist.js":52}],46:[function(a,b,c){"use strict";function d(a){return a&&a.__esModule?a:{"default":a}}function e(){this.tag=g["default"].packet.compressed,this.packets=null,this.algorithm="zip",this.compressed=null}Object.defineProperty(c,"__esModule",{value:!0}),c["default"]=e;var f=a("../enums.js"),g=d(f),h=a("../util.js"),i=d(h),j=a("../compression/zlib.min.js"),k=d(j),l=a("../compression/rawinflate.min.js"),m=d(l),n=a("../compression/rawdeflate.min.js"),o=d(n);e.prototype.read=function(a){this.algorithm=g["default"].read(g["default"].compression,a[0]),this.compressed=a.subarray(1,a.length),this.decompress()},e.prototype.write=function(){return null===this.compressed&&this.compress(),i["default"].concatUint8Array(new Uint8Array([g["default"].write(g["default"].compression,this.algorithm)]),this.compressed)},e.prototype.decompress=function(){var a,b;switch(this.algorithm){case"uncompressed":a=this.compressed;break;case"zip":b=new m["default"].Zlib.RawInflate(this.compressed),a=b.decompress();break;case"zlib":b=new k["default"].Zlib.Inflate(this.compressed),a=b.decompress();break;case"bzip2":throw new Error("Compression algorithm BZip2 [BZ2] is not implemented.");default:throw new Error("Compression algorithm unknown :"+this.alogrithm)}this.packets.read(a)},e.prototype.compress=function(){var a,b;switch(a=this.packets.write(),this.algorithm){case"uncompressed":this.compressed=a;break;case"zip":b=new o["default"].Zlib.RawDeflate(a),this.compressed=b.compress();break;case"zlib":b=new k["default"].Zlib.Deflate(a),this.compressed=b.compress();break;case"bzip2":throw new Error("Compression algorithm BZip2 [BZ2] is not implemented.");default:throw new Error("Compression algorithm unknown :"+this.type)}}},{"../compression/rawdeflate.min.js":6,"../compression/rawinflate.min.js":7,"../compression/zlib.min.js":8,"../enums.js":35,"../util.js":69}],47:[function(a,b,c){"use strict";function d(a){return a&&a.__esModule?a:{"default":a}}function e(a){if(a&&a.__esModule)return a;var b={};if(null!=a)for(var c in a)Object.prototype.hasOwnProperty.call(a,c)&&(b[c]=a[c]);return b["default"]=a,b}Object.defineProperty(c,"__esModule",{value:!0});var f=a("./all_packets.js"),g=e(f),h=a("./clone.js"),i=e(h),j=a("./packetlist.js"),k=d(j),l={List:k["default"],clone:i};for(var m in g)l[m]=g[m];c["default"]=l},{"./all_packets.js":44,"./clone.js":45,"./packetlist.js":52}],48:[function(a,b,c){"use strict";function d(a){return a&&a.__esModule?a:{"default":a}}function e(){this.tag=i["default"].packet.literal,this.format="utf8",this.date=new Date,this.data=new Uint8Array(0),this.filename="msg.txt"}Object.defineProperty(c,"__esModule",{value:!0}),c["default"]=e;var f=a("../util.js"),g=d(f),h=a("../enums.js"),i=d(h);e.prototype.setText=function(a){a=a.replace(/\r\n/g,"\n").replace(/\r/g,"\n").replace(/\n/g,"\r\n"),this.data="utf8"===this.format?g["default"].str2Uint8Array(g["default"].encode_utf8(a)):g["default"].str2Uint8Array(a)},e.prototype.getText=function(){var a=g["default"].decode_utf8(g["default"].Uint8Array2str(this.data));return a.replace(/\r\n/g,"\n")},e.prototype.setBytes=function(a,b){this.format=b,this.data=a},e.prototype.getBytes=function(){return this.data},e.prototype.setFilename=function(a){this.filename=a},e.prototype.getFilename=function(){return this.filename},e.prototype.read=function(a){var b=i["default"].read(i["default"].literal,a[0]),c=a[1];this.filename=g["default"].decode_utf8(g["default"].Uint8Array2str(a.subarray(2,2+c))),this.date=g["default"].readDate(a.subarray(2+c,2+c+4));var d=a.subarray(6+c,a.length);this.setBytes(d,b)},e.prototype.write=function(){var a=g["default"].str2Uint8Array(g["default"].encode_utf8(this.filename)),b=new Uint8Array([a.length]),c=new Uint8Array([i["default"].write(i["default"].literal,this.format)]),d=g["default"].writeDate(this.date),e=this.getBytes();return g["default"].concatUint8Array([c,b,a,d,e])}},{"../enums.js":35,"../util.js":69}],49:[function(a,b,c){"use strict";function d(a){return a&&a.__esModule?a:{"default":a}}function e(){this.tag=g["default"].packet.marker}Object.defineProperty(c,"__esModule",{value:!0}),c["default"]=e;var f=a("../enums.js"),g=d(f);e.prototype.read=function(a){return 80===a[0]&&71===a[1]&&80===a[2]}},{"../enums.js":35}],50:[function(a,b,c){"use strict";function d(a){return a&&a.__esModule?a:{"default":a}}function e(){this.tag=i["default"].packet.onePassSignature,this.version=null,this.type=null,this.hashAlgorithm=null,this.publicKeyAlgorithm=null,this.signingKeyId=null,this.flags=null}Object.defineProperty(c,"__esModule",{value:!0}),c["default"]=e;var f=a("../util.js"),g=d(f),h=a("../enums.js"),i=d(h),j=a("../type/keyid.js"),k=d(j);e.prototype.read=function(a){var b=0;return this.version=a[b++],this.type=i["default"].read(i["default"].signature,a[b++]),this.hashAlgorithm=i["default"].read(i["default"].hash,a[b++]),this.publicKeyAlgorithm=i["default"].read(i["default"].publicKey,a[b++]),this.signingKeyId=new k["default"],this.signingKeyId.read(a.subarray(b,b+8)),b+=8,this.flags=a[b++],this},e.prototype.write=function(){var a=new Uint8Array([3,i["default"].write(i["default"].signature,this.type),i["default"].write(i["default"].hash,this.hashAlgorithm),i["default"].write(i["default"].publicKey,this.publicKeyAlgorithm)]),b=new Uint8Array([this.flags]);return g["default"].concatUint8Array([a,this.signingKeyId.write(),b])},e.prototype.postCloneTypeFix=function(){this.signingKeyId=k["default"].fromClone(this.signingKeyId)}},{"../enums.js":35,"../type/keyid.js":66,"../util.js":69}],51:[function(a,b,c){"use strict";function d(a){return a&&a.__esModule?a:{"default":a}}Object.defineProperty(c,"__esModule",{value:!0});var e=a("../util.js"),f=d(e);c["default"]={readSimpleLength:function(a){var b,c=0,d=a[0];return d<192?(c=a[0],b=1):d<255?(c=(a[0]-192<<8)+a[1]+192,b=2):255===d&&(c=f["default"].readNumber(a.subarray(1,5)),b=5),{len:c,offset:b}},writeSimpleLength:function(a){return a<192?new Uint8Array([a]):a>191&&a<8384?new Uint8Array([(a-192>>8)+192,a-192&255]):f["default"].concatUint8Array([new Uint8Array([255]),f["default"].writeNumber(a,4)])},writeHeader:function(a,b){return f["default"].concatUint8Array([new Uint8Array([192|a]),this.writeSimpleLength(b)])},writeOldHeader:function(a,b){return b<256?new Uint8Array([128|a<<2,b]):b<65536?f["default"].concatUint8Array([128|a<<2|1,f["default"].writeNumber(b,2)]):f["default"].concatUint8Array([128|a<<2|2,f["default"].writeNumber(b,4)])},read:function(a,b,c){if(null===a||a.length<=b||a.subarray(b,a.length).length<2||0===(128&a[b]))throw new Error("Error during parsing. This message / key probably does not conform to a valid OpenPGP format.");var d,e=b,g=-1,h=-1;h=0,0!==(64&a[e])&&(h=1);var i;h?g=63&a[e]:(g=(63&a[e])>>2,i=3&a[e]),e++;var j=null,k=-1;if(h)if(a[e]<192)d=a[e++],f["default"].print_debug("1 byte length:"+d);else if(a[e]>=192&&a[e]<224)d=(a[e++]-192<<8)+a[e++]+192,f["default"].print_debug("2 byte length:"+d);else if(a[e]>223&&a[e]<255){d=1<<(31&a[e++]),f["default"].print_debug("4 byte length:"+d);var l=e+d;j=[a.subarray(e,e+d)];for(var m;;){if(a[l]<192){m=a[l++],d+=m,j.push(a.subarray(l,l+m)),l+=m;break}if(a[l]>=192&&a[l]<224){m=(a[l++]-192<<8)+a[l++]+192,d+=m,j.push(a.subarray(l,l+m)),l+=m;break}if(!(a[l]>223&&a[l]<255)){l++,m=a[l++]<<24|a[l++]<<16|a[l++]<<8|a[l++],j.push(a.subarray(l,l+m)),d+=m,l+=m;break}m=1<<(31&a[l++]),d+=m,j.push(a.subarray(l,l+m)),l+=m}k=l-e}else e++,d=a[e++]<<24|a[e++]<<16|a[e++]<<8|a[e++];else switch(i){case 0:d=a[e++];break;case 1:d=a[e++]<<8|a[e++];break;case 2:d=a[e++]<<24|a[e++]<<16|a[e++]<<8|a[e++];break;default:d=c}return k===-1&&(k=d),null===j?j=a.subarray(e,e+k):j instanceof Array&&(j=f["default"].concatUint8Array(j)),{tag:g,packet:j,offset:e+k}}}},{"../util.js":69}],52:[function(a,b,c){"use strict";function d(a){if(a&&a.__esModule)return a;var b={};if(null!=a)for(var c in a)Object.prototype.hasOwnProperty.call(a,c)&&(b[c]=a[c]);return b["default"]=a,b}function e(a){return a&&a.__esModule?a:{"default":a}}function f(){this.length=0}Object.defineProperty(c,"__esModule",{value:!0}),c["default"]=f;var g=a("../util"),h=e(g),i=a("./packet.js"),j=e(i),k=a("./all_packets.js"),l=d(k),m=a("../enums.js"),n=e(m);f.prototype.read=function(a){for(var b=0;b<a.length;){var c=j["default"].read(a,b,a.length-b);b=c.offset;var d=!1;try{var e=n["default"].read(n["default"].packet,c.tag),f=l.newPacketFromTag(e);this.push(f),d=!0,f.read(c.packet)}catch(g){d&&this.pop()}}},f.prototype.write=function(){for(var a=[],b=0;b<this.length;b++){var c=this[b].write();a.push(j["default"].writeHeader(this[b].tag,c.length)),a.push(c)}return h["default"].concatUint8Array(a)},f.prototype.push=function(a){a&&(a.packets=a.packets||new f,this[this.length]=a,this.length++)},f.prototype.pop=function(){if(0!==this.length){var a=this[this.length-1];return delete this[this.length-1],this.length--,a}},f.prototype.filter=function(a){for(var b=new f,c=0;c<this.length;c++)a(this[c],c,this)&&b.push(this[c]);return b},f.prototype.filterByTag=function(){function a(a){return d[e].tag===a}for(var b=Array.prototype.slice.call(arguments),c=new f,d=this,e=0;e<this.length;e++)b.some(a)&&c.push(this[e]);return c},f.prototype.forEach=function(a){for(var b=0;b<this.length;b++)a(this[b])},f.prototype.findPacket=function(a){var b=this.filterByTag(a);if(b.length)return b[0];for(var c=null,d=0;d<this.length;d++)if(this[d].packets.length&&(c=this[d].packets.findPacket(a)))return c;return null},f.prototype.indexOfTag=function(){function a(a){return d[e].tag===a}for(var b=Array.prototype.slice.call(arguments),c=[],d=this,e=0;e<this.length;e++)b.some(a)&&c.push(e);return c},f.prototype.slice=function(a,b){b||(b=this.length);for(var c=new f,d=a;d<b;d++)c.push(this[d]);return c},f.prototype.concat=function(a){if(a)for(var b=0;b<a.length;b++)this.push(a[b])},f.fromStructuredClone=function(a){for(var b=new f,c=0;c<a.length;c++)b.push(l.fromStructuredClone(a[c])),0!==b[c].packets.length?b[c].packets=this.fromStructuredClone(b[c].packets):b[c].packets=new f;return b}},{"../enums.js":35,"../util":69,"./all_packets.js":44,"./packet.js":51}],53:[function(a,b,c){"use strict";function d(a){return a&&a.__esModule?a:{"default":a}}function e(){this.tag=m["default"].packet.publicKey,this.version=4,this.created=new Date,this.mpi=[],this.algorithm="rsa_sign",this.expirationTimeV3=0,this.fingerprint=null,this.keyid=null}Object.defineProperty(c,"__esModule",{value:!0}),c["default"]=e;var f=a("../util.js"),g=d(f),h=a("../type/mpi.js"),i=d(h),j=a("../type/keyid.js"),k=d(j),l=a("../enums.js"),m=d(l),n=a("../crypto"),o=d(n);e.prototype.read=function(a){var b=0;if(this.version=a[b++],3===this.version||4===this.version){this.created=g["default"].readDate(a.subarray(b,b+4)),b+=4,3===this.version&&(this.expirationTimeV3=g["default"].readNumber(a.subarray(b,b+2)),b+=2),this.algorithm=m["default"].read(m["default"].publicKey,a[b++]);var c=o["default"].getPublicMpiCount(this.algorithm);this.mpi=[];for(var d=a.subarray(b,a.length),e=0,f=0;f<c&&e<d.length;f++)if(this.mpi[f]=new i["default"],e+=this.mpi[f].read(d.subarray(e,d.length)),e>d.length)throw new Error("Error reading MPI @:"+e);return e+6}throw new Error("Version "+this.version+" of the key packet is unsupported.")},e.prototype.readPublicKey=e.prototype.read,e.prototype.write=function(){var a=[];a.push(new Uint8Array([this.version])),a.push(g["default"].writeDate(this.created)),3===this.version&&a.push(g["default"].writeNumber(this.expirationTimeV3,2)),a.push(new Uint8Array([m["default"].write(m["default"].publicKey,this.algorithm)]));for(var b=o["default"].getPublicMpiCount(this.algorithm),c=0;c<b;c++)a.push(this.mpi[c].write());return g["default"].concatUint8Array(a)},e.prototype.writePublicKey=e.prototype.write,e.prototype.writeOld=function(){var a=this.writePublicKey();return g["default"].concatUint8Array([new Uint8Array([153]),g["default"].writeNumber(a.length,2),a])},e.prototype.getKeyId=function(){if(this.keyid)return this.keyid;if(this.keyid=new k["default"],4===this.version)this.keyid.read(g["default"].str2Uint8Array(g["default"].hex2bin(this.getFingerprint()).substr(12,8)));else if(3===this.version){var a=this.mpi[0].write();this.keyid.read(a.subarray(a.length-8,a.length))}return this.keyid},e.prototype.getFingerprint=function(){if(this.fingerprint)return this.fingerprint;var a="";if(4===this.version)a=this.writeOld(),this.fingerprint=g["default"].Uint8Array2str(o["default"].hash.sha1(a));else if(3===this.version){for(var b=o["default"].getPublicMpiCount(this.algorithm),c=0;c<b;c++)a+=this.mpi[c].toBytes();this.fingerprint=g["default"].Uint8Array2str(o["default"].hash.md5(g["default"].str2Uint8Array(a)))}return this.fingerprint=g["default"].hexstrdump(this.fingerprint),this.fingerprint},e.prototype.getBitSize=function(){return 8*this.mpi[0].byteLength()},e.prototype.postCloneTypeFix=function(){for(var a=0;a<this.mpi.length;a++)this.mpi[a]=i["default"].fromClone(this.mpi[a]);this.keyid&&(this.keyid=k["default"].fromClone(this.keyid))}},{"../crypto":24,"../enums.js":35,"../type/keyid.js":66,"../type/mpi.js":67,"../util.js":69}],54:[function(a,b,c){"use strict";function d(a){return a&&a.__esModule?a:{"default":a}}function e(){this.tag=m["default"].packet.publicKeyEncryptedSessionKey,this.version=3,this.publicKeyId=new g["default"],this.publicKeyAlgorithm="rsa_encrypt",this.sessionKey=null,this.sessionKeyAlgorithm="aes256",this.encrypted=[]}Object.defineProperty(c,"__esModule",{value:!0}),c["default"]=e;var f=a("../type/keyid.js"),g=d(f),h=a("../util.js"),i=d(h),j=a("../type/mpi.js"),k=d(j),l=a("../enums.js"),m=d(l),n=a("../crypto"),o=d(n);e.prototype.read=function(a){this.version=a[0],this.publicKeyId.read(a.subarray(1,a.length)),this.publicKeyAlgorithm=m["default"].read(m["default"].publicKey,a[9]);var b=10,c=function(a){switch(a){case"rsa_encrypt":case"rsa_encrypt_sign":return 1;case"elgamal":return 2;default:throw new Error("Invalid algorithm.")}}(this.publicKeyAlgorithm);this.encrypted=[];for(var d=0;d<c;d++){var e=new k["default"];b+=e.read(a.subarray(b,a.length)),this.encrypted.push(e)}},e.prototype.write=function(){for(var a=[new Uint8Array([this.version]),this.publicKeyId.write(),new Uint8Array([m["default"].write(m["default"].publicKey,this.publicKeyAlgorithm)])],b=0;b<this.encrypted.length;b++)a.push(this.encrypted[b].write());return i["default"].concatUint8Array(a)},e.prototype.encrypt=function(a){var b=String.fromCharCode(m["default"].write(m["default"].symmetric,this.sessionKeyAlgorithm));b+=i["default"].Uint8Array2str(this.sessionKey);var c=i["default"].calc_checksum(this.sessionKey);b+=i["default"].Uint8Array2str(i["default"].writeNumber(c,2));var d=new k["default"];d.fromBytes(o["default"].pkcs1.eme.encode(b,a.mpi[0].byteLength())),this.encrypted=o["default"].publicKeyEncrypt(this.publicKeyAlgorithm,a.mpi,d)},e.prototype.decrypt=function(a){var b=o["default"].publicKeyDecrypt(this.publicKeyAlgorithm,a.mpi,this.encrypted).toBytes(),c=i["default"].readNumber(i["default"].str2Uint8Array(b.substr(b.length-2))),d=o["default"].pkcs1.eme.decode(b);if(a=i["default"].str2Uint8Array(d.substring(1,d.length-2)),c!==i["default"].calc_checksum(a))throw new Error("Checksum mismatch");this.sessionKey=a,this.sessionKeyAlgorithm=m["default"].read(m["default"].symmetric,d.charCodeAt(0))},e.prototype.postCloneTypeFix=function(){this.publicKeyId=g["default"].fromClone(this.publicKeyId);for(var a=0;a<this.encrypted.length;a++)this.encrypted[a]=k["default"].fromClone(this.encrypted[a])}},{"../crypto":24,"../enums.js":35,"../type/keyid.js":66,"../type/mpi.js":67,"../util.js":69}],55:[function(a,b,c){"use strict";function d(a){return a&&a.__esModule?a:{"default":a}}function e(){g["default"].call(this),this.tag=i["default"].packet.publicSubkey}Object.defineProperty(c,"__esModule",{value:!0}),c["default"]=e;var f=a("./public_key.js"),g=d(f),h=a("../enums.js"),i=d(h);e.prototype=new g["default"],e.prototype.constructor=e},{"../enums.js":35,"./public_key.js":53}],56:[function(a,b,c){"use strict";function d(a){return a&&a.__esModule?a:{"default":a}}function e(){l["default"].call(this),this.tag=n["default"].packet.secretKey,this.encrypted=null,this.isDecrypted=!1}function f(a){return"sha1"===a?20:2}function g(a){return"sha1"===a?r["default"].hash.sha1:function(a){return p["default"].writeNumber(p["default"].calc_checksum(a),2)}}function h(a,b,c){var d=f(a),e=g(a),h=p["default"].Uint8Array2str(b.subarray(b.length-d,b.length));b=b.subarray(0,b.length-d);var i=p["default"].Uint8Array2str(e(b));if(i!==h)return new Error("Hash mismatch.");for(var j=r["default"].getPrivateMpiCount(c),k=0,l=[],m=0;m<j&&k<b.length;m++)l[m]=new t["default"],k+=l[m].read(b.subarray(k,b.length));return l}function i(a,b,c){for(var d=[],e=r["default"].getPublicMpiCount(b),f=e;f<c.length;f++)d.push(c[f].write());var h=p["default"].concatUint8Array(d),i=g(a)(h);return p["default"].concatUint8Array([h,i])}function j(a,b,c){return a.produce_key(b,r["default"].cipher[c].keySize)}Object.defineProperty(c,"__esModule",{value:!0}),c["default"]=e;var k=a("./public_key.js"),l=d(k),m=a("../enums.js"),n=d(m),o=a("../util.js"),p=d(o),q=a("../crypto"),r=d(q),s=a("../type/mpi.js"),t=d(s),u=a("../type/s2k.js"),v=d(u);e.prototype=new l["default"],e.prototype.constructor=e,e.prototype.read=function(a){var b=this.readPublicKey(a);a=a.subarray(b,a.length);var c=a[0];if(c)this.encrypted=a;else{var d=h("mod",a.subarray(1,a.length),this.algorithm);if(d instanceof Error)throw d;this.mpi=this.mpi.concat(d),this.isDecrypted=!0}},e.prototype.write=function(){var a=[this.writePublicKey()];return this.encrypted?a.push(this.encrypted):(a.push(new Uint8Array([0])),a.push(i("mod",this.algorithm,this.mpi))),p["default"].concatUint8Array(a)},e.prototype.encrypt=function(a){if(this.isDecrypted&&!a)return void(this.encrypted=null);if(!a)throw new Error("The key must be decrypted before removing passphrase protection.");var b=new v["default"],c="aes256",d=i("sha1",this.algorithm,this.mpi),e=j(b,a,c),f=r["default"].cipher[c].blockSize,g=r["default"].random.getRandomBytes(f),h=[new Uint8Array([254,n["default"].write(n["default"].symmetric,c)])];h.push(b.write()),h.push(g),h.push(r["default"].cfb.normalEncrypt(c,e,d,g)),this.encrypted=p["default"].concatUint8Array(h)},e.prototype.decrypt=function(a){if(this.isDecrypted)return!0;var b,c,d=0,e=this.encrypted[d++];if(255===e||254===e){b=this.encrypted[d++],b=n["default"].read(n["default"].symmetric,b);var f=new v["default"];d+=f.read(this.encrypted.subarray(d,this.encrypted.length)),c=j(f,a,b)}else b=e,b=n["default"].read(n["default"].symmetric,b),c=r["default"].hash.md5(a);var g=this.encrypted.subarray(d,d+r["default"].cipher[b].blockSize);d+=g.length;var i,k=this.encrypted.subarray(d,this.encrypted.length);i=r["default"].cfb.normalDecrypt(b,c,k,g);var l=254===e?"sha1":"mod",m=h(l,i,this.algorithm);return!(m instanceof Error)&&(this.mpi=this.mpi.concat(m),this.isDecrypted=!0,!0)},e.prototype.generate=function(a){var b=this;return r["default"].generateMpi(b.algorithm,a).then(function(a){b.mpi=a,b.isDecrypted=!0})},e.prototype.clearPrivateMPIs=function(){if(!this.encrypted)throw new Error("If secret key is not encrypted, clearing private MPIs is irreversible.");this.mpi=this.mpi.slice(0,r["default"].getPublicMpiCount(this.algorithm)),this.isDecrypted=!1}},{"../crypto":24,"../enums.js":35,"../type/mpi.js":67,"../type/s2k.js":68,"../util.js":69,"./public_key.js":53}],57:[function(a,b,c){"use strict";function d(a){return a&&a.__esModule?a:{"default":a}}function e(){g["default"].call(this),this.tag=i["default"].packet.secretSubkey}Object.defineProperty(c,"__esModule",{value:!0}),c["default"]=e;var f=a("./secret_key.js"),g=d(f),h=a("../enums.js"),i=d(h);e.prototype=new g["default"],e.prototype.constructor=e},{"../enums.js":35,"./secret_key.js":56}],58:[function(a,b,c){"use strict";function d(a){return a&&a.__esModule?a:{"default":a}}function e(){this.tag=l["default"].packet.signature,this.version=4,this.signatureType=null,this.hashAlgorithm=null,this.publicKeyAlgorithm=null,this.signatureData=null,this.unhashedSubpackets=null,this.signedHashValue=null,this.created=new Date,this.signatureExpirationTime=null,this.signatureNeverExpires=!0,this.exportable=null,this.trustLevel=null,this.trustAmount=null,this.regularExpression=null,this.revocable=null,this.keyExpirationTime=null,this.keyNeverExpires=null,this.preferredSymmetricAlgorithms=null,this.revocationKeyClass=null,this.revocationKeyAlgorithm=null,this.revocationKeyFingerprint=null,this.issuerKeyId=new r["default"],this.notation=null,this.preferredHashAlgorithms=null,this.preferredCompressionAlgorithms=null,this.keyServerPreferences=null,this.preferredKeyServer=null,this.isPrimaryUserID=null,this.policyURI=null,this.keyFlags=null,this.signersUserId=null,this.reasonForRevocationFlag=null,this.reasonForRevocationString=null,this.features=null,this.signatureTargetPublicKeyAlgorithm=null,this.signatureTargetHashAlgorithm=null,this.signatureTargetHash=null,this.embeddedSignature=null,this.verified=!1}function f(a,b){var c=[];return c.push(j["default"].writeSimpleLength(b.length+1)),c.push(new Uint8Array([a])),c.push(b),h["default"].concatUint8Array(c)}Object.defineProperty(c,"__esModule",{value:!0}),c["default"]=e;var g=a("../util.js"),h=d(g),i=a("./packet.js"),j=d(i),k=a("../enums.js"),l=d(k),m=a("../crypto"),n=d(m),o=a("../type/mpi.js"),p=d(o),q=a("../type/keyid.js"),r=d(q);e.prototype.read=function(a){var b=this,c=0;this.version=a[c++];var d,e;!function(){switch(b.version){case 3:5!==a[c++]&&h["default"].print_debug("packet/signature.js\ninvalid One-octet length of following hashed material.MUST be 5. @:"+(c-1)),d=c,b.signatureType=a[c++],b.created=h["default"].readDate(a.subarray(c,c+4)),c+=4,b.signatureData=a.subarray(d,c),b.issuerKeyId.read(a.subarray(c,c+8)),c+=8,b.publicKeyAlgorithm=a[c++],b.hashAlgorithm=a[c++];break;case 4:b.signatureType=a[c++],b.publicKeyAlgorithm=a[c++],b.hashAlgorithm=a[c++];var f=function(a){for(var b=h["default"].readNumber(a.subarray(0,2)),c=2;c<2+b;){var d=j["default"].readSimpleLength(a.subarray(c,a.length));c+=d.offset,this.read_sub_packet(a.subarray(c,c+d.len)),c+=d.len}return c};c+=f.call(b,a.subarray(c,a.length),!0),b.signatureData=a.subarray(0,c),e=c,c+=f.call(b,a.subarray(c,a.length),!1),b.unhashedSubpackets=a.subarray(e,c);break;default:throw new Error("Version "+b.version+" of the signature is unsupported.")}}(),this.signedHashValue=a.subarray(c,c+2),c+=2,this.signature=a.subarray(c,a.length)},e.prototype.write=function(){var a=[];switch(this.version){case 3:a.push(new Uint8Array([3,5])),a.push(this.signatureData),a.push(this.issuerKeyId.write()),a.push(new Uint8Array([this.publicKeyAlgorithm,this.hashAlgorithm]));break;case 4:a.push(this.signatureData),a.push(this.unhashedSubpackets?this.unhashedSubpackets:h["default"].writeNumber(0,2))}return a.push(this.signedHashValue),a.push(this.signature),h["default"].concatUint8Array(a)},e.prototype.sign=function(a,b){var c=l["default"].write(l["default"].signature,this.signatureType),d=l["default"].write(l["default"].publicKey,this.publicKeyAlgorithm),e=l["default"].write(l["default"].hash,this.hashAlgorithm),f=[new Uint8Array([4,c,d,e])];this.issuerKeyId=a.getKeyId(),f.push(this.write_all_sub_packets()),this.signatureData=h["default"].concatUint8Array(f);var g=this.calculateTrailer(),i=h["default"].concatUint8Array([this.toSign(c,b),this.signatureData,g]),j=n["default"].hash.digest(e,i);this.signedHashValue=j.subarray(0,2),this.signature=n["default"].signature.sign(e,d,a.mpi,i)},e.prototype.write_all_sub_packets=function(){var a,b=l["default"].signatureSubpacket,c=[];if(null!==this.created&&c.push(f(b.signature_creation_time,h["default"].writeDate(this.created))),null!==this.signatureExpirationTime&&c.push(f(b.signature_expiration_time,h["default"].writeNumber(this.signatureExpirationTime,4))),null!==this.exportable&&c.push(f(b.exportable_certification,new Uint8Array([this.exportable?1:0]))),null!==this.trustLevel&&(a=new Uint8Array([this.trustLevel,this.trustAmount]),c.push(f(b.trust_signature,a))),null!==this.regularExpression&&c.push(f(b.regular_expression,this.regularExpression)),null!==this.revocable&&c.push(f(b.revocable,new Uint8Array([this.revocable?1:0]))),null!==this.keyExpirationTime&&c.push(f(b.key_expiration_time,h["default"].writeNumber(this.keyExpirationTime,4))),null!==this.preferredSymmetricAlgorithms&&(a=h["default"].str2Uint8Array(h["default"].bin2str(this.preferredSymmetricAlgorithms)),c.push(f(b.preferred_symmetric_algorithms,a))),null!==this.revocationKeyClass&&(a=new Uint8Array([this.revocationKeyClass,this.revocationKeyAlgorithm]),a=h["default"].concatUint8Array([a,this.revocationKeyFingerprint]),c.push(f(b.revocation_key,a))),this.issuerKeyId.isNull()||c.push(f(b.issuer,this.issuerKeyId.write())),null!==this.notation)for(var d in this.notation)if(this.notation.hasOwnProperty(d)){var e=this.notation[d];a=[new Uint8Array([128,0,0,0])],a.push(h["default"].writeNumber(d.length,2)),a.push(h["default"].writeNumber(e.length,2)),a.push(h["default"].str2Uint8Array(d+e)),a=h["default"].concatUint8Array(a),c.push(f(b.notation_data,a))}null!==this.preferredHashAlgorithms&&(a=h["default"].str2Uint8Array(h["default"].bin2str(this.preferredHashAlgorithms)),c.push(f(b.preferred_hash_algorithms,a))),null!==this.preferredCompressionAlgorithms&&(a=h["default"].str2Uint8Array(h["default"].bin2str(this.preferredCompressionAlgorithms)),c.push(f(b.preferred_compression_algorithms,a))),null!==this.keyServerPreferences&&(a=h["default"].str2Uint8Array(h["default"].bin2str(this.keyServerPreferences)),c.push(f(b.key_server_preferences,a))),null!==this.preferredKeyServer&&c.push(f(b.preferred_key_server,h["default"].str2Uint8Array(this.preferredKeyServer))),null!==this.isPrimaryUserID&&c.push(f(b.primary_user_id,new Uint8Array([this.isPrimaryUserID?1:0]))),null!==this.policyURI&&c.push(f(b.policy_uri,h["default"].str2Uint8Array(this.policyURI))),null!==this.keyFlags&&(a=h["default"].str2Uint8Array(h["default"].bin2str(this.keyFlags)),c.push(f(b.key_flags,a))),null!==this.signersUserId&&c.push(f(b.signers_user_id,h["default"].str2Uint8Array(this.signersUserId))),null!==this.reasonForRevocationFlag&&(a=h["default"].str2Uint8Array(String.fromCharCode(this.reasonForRevocationFlag)+this.reasonForRevocationString),c.push(f(b.reason_for_revocation,a))),null!==this.features&&(a=h["default"].str2Uint8Array(h["default"].bin2str(this.features)),c.push(f(b.features,a))),null!==this.signatureTargetPublicKeyAlgorithm&&(a=[new Uint8Array([this.signatureTargetPublicKeyAlgorithm,this.signatureTargetHashAlgorithm])],a.push(h["default"].str2Uint8Array(this.signatureTargetHash)),a=h["default"].concatUint8Array(a),c.push(f(b.signature_target,a))),null!==this.embeddedSignature&&c.push(f(b.embedded_signature,this.embeddedSignature.write()));var g=h["default"].concatUint8Array(c),i=h["default"].writeNumber(g.length,2);return h["default"].concatUint8Array([i,g])},e.prototype.read_sub_packet=function(a){function b(a,b){this[a]=[];for(var c=0;c<b.length;c++)this[a].push(b[c])}var c,d=0,f=127&a[d++];switch(f){case 2:this.created=h["default"].readDate(a.subarray(d,a.length));break;case 3:c=h["default"].readNumber(a.subarray(d,a.length)),this.signatureNeverExpires=0===c,this.signatureExpirationTime=c;break;case 4:this.exportable=1===a[d++];break;case 5:this.trustLevel=a[d++],this.trustAmount=a[d++];break;case 6:this.regularExpression=a[d];break;case 7:this.revocable=1===a[d++];break;case 9:c=h["default"].readNumber(a.subarray(d,a.length)),this.keyExpirationTime=c,this.keyNeverExpires=0===c;break;case 11:b.call(this,"preferredSymmetricAlgorithms",a.subarray(d,a.length));break;case 12:this.revocationKeyClass=a[d++],this.revocationKeyAlgorithm=a[d++],this.revocationKeyFingerprint=a.subarray(d,20);break;case 16:this.issuerKeyId.read(a.subarray(d,a.length));break;case 20:if(128===a[d]){d+=4;var g=h["default"].readNumber(a.subarray(d,d+2));d+=2;var i=h["default"].readNumber(a.subarray(d,d+2));d+=2;var j=h["default"].Uint8Array2str(a.subarray(d,d+g)),k=h["default"].Uint8Array2str(a.subarray(d+g,d+g+i));this.notation=this.notation||{},this.notation[j]=k}else h["default"].print_debug("Unsupported notation flag "+a[d]);break;case 21:b.call(this,"preferredHashAlgorithms",a.subarray(d,a.length));break;case 22:b.call(this,"preferredCompressionAlgorithms",a.subarray(d,a.length));break;case 23:b.call(this,"keyServerPreferencess",a.subarray(d,a.length));break;case 24:this.preferredKeyServer=h["default"].Uint8Array2str(a.subarray(d,a.length));break;case 25:this.isPrimaryUserID=0!==a[d++];break;case 26:this.policyURI=h["default"].Uint8Array2str(a.subarray(d,a.length));break;case 27:b.call(this,"keyFlags",a.subarray(d,a.length));break;case 28:this.signersUserId+=h["default"].Uint8Array2str(a.subarray(d,a.length));
break;case 29:this.reasonForRevocationFlag=a[d++],this.reasonForRevocationString=h["default"].Uint8Array2str(a.subarray(d,a.length));break;case 30:b.call(this,"features",a.subarray(d,a.length));break;case 31:this.signatureTargetPublicKeyAlgorithm=a[d++],this.signatureTargetHashAlgorithm=a[d++];var l=n["default"].getHashByteLength(this.signatureTargetHashAlgorithm);this.signatureTargetHash=h["default"].Uint8Array2str(a.subarray(d,d+l));break;case 32:this.embeddedSignature=new e,this.embeddedSignature.read(a.subarray(d,a.length));break;default:h["default"].print_debug("Unknown signature subpacket type "+f+" @:"+d)}},e.prototype.toSign=function(a,b){var c=l["default"].signature;switch(a){case c.binary:case c.text:return b.getBytes();case c.standalone:return new Uint8Array(0);case c.cert_generic:case c.cert_persona:case c.cert_casual:case c.cert_positive:case c.cert_revocation:var d,e;if(void 0!==b.userid)e=180,d=b.userid;else{if(void 0===b.userattribute)throw new Error("Either a userid or userattribute packet needs to be supplied for certification.");e=209,d=b.userattribute}var f=d.write();if(4===this.version)return h["default"].concatUint8Array([this.toSign(c.key,b),new Uint8Array([e]),h["default"].writeNumber(f.length,4),f]);if(3===this.version)return h["default"].concatUint8Array([this.toSign(c.key,b),f]);break;case c.subkey_binding:case c.subkey_revocation:case c.key_binding:return h["default"].concatUint8Array([this.toSign(c.key,b),this.toSign(c.key,{key:b.bind})]);case c.key:if(void 0===b.key)throw new Error("Key packet is required for this signature.");return b.key.writeOld();case c.key_revocation:return this.toSign(c.key,b);case c.timestamp:return new Uint8Array(0);case c.third_party:throw new Error("Not implemented");default:throw new Error("Unknown signature type.")}},e.prototype.calculateTrailer=function(){if(3===this.version)return new Uint8Array(0);var a=new Uint8Array([4,255]);return h["default"].concatUint8Array([a,h["default"].writeNumber(this.signatureData.length,4)])},e.prototype.verify=function(a,b){var c=l["default"].write(l["default"].signature,this.signatureType),d=l["default"].write(l["default"].publicKey,this.publicKeyAlgorithm),e=l["default"].write(l["default"].hash,this.hashAlgorithm),f=this.toSign(c,b),g=this.calculateTrailer(),i=0;d>0&&d<4?i=1:17===d&&(i=2);for(var j=[],k=0,m=0;m<i;m++)j[m]=new p["default"],k+=j[m].read(this.signature.subarray(k,this.signature.length));return this.verified=n["default"].signature.verify(d,e,j,a.mpi,h["default"].concatUint8Array([f,this.signatureData,g])),this.verified},e.prototype.isExpired=function(){return!this.signatureNeverExpires&&Date.now()>this.created.getTime()+1e3*this.signatureExpirationTime},e.prototype.postCloneTypeFix=function(){this.issuerKeyId=r["default"].fromClone(this.issuerKeyId)}},{"../crypto":24,"../enums.js":35,"../type/keyid.js":66,"../type/mpi.js":67,"../util.js":69,"./packet.js":51}],59:[function(a,b,c){"use strict";function d(a){return a&&a.__esModule?a:{"default":a}}function e(){this.tag=k["default"].packet.symEncryptedAEADProtected,this.version=l,this.iv=null,this.encrypted=null,this.packets=null}Object.defineProperty(c,"__esModule",{value:!0}),c["default"]=e;var f=a("../util.js"),g=d(f),h=a("../crypto"),i=d(h),j=a("../enums.js"),k=d(j),l=1,m=i["default"].gcm.ivLength;e.prototype.read=function(a){var b=0;if(a[b]!==l)throw new Error("Invalid packet version.");b++,this.iv=a.subarray(b,m+b),b+=m,this.encrypted=a.subarray(b,a.length)},e.prototype.write=function(){return g["default"].concatUint8Array([new Uint8Array([this.version]),this.iv,this.encrypted])},e.prototype.decrypt=function(a,b){var c=this;return i["default"].gcm.decrypt(a,this.encrypted,b,this.iv).then(function(a){c.packets.read(a)})},e.prototype.encrypt=function(a,b){var c=this;return this.iv=i["default"].random.getRandomValues(new Uint8Array(m)),i["default"].gcm.encrypt(a,this.packets.write(),b,this.iv).then(function(a){c.encrypted=a})}},{"../crypto":24,"../enums.js":35,"../util.js":69}],60:[function(a,b,c){"use strict";function d(a){return a&&a.__esModule?a:{"default":a}}function e(){this.tag=o["default"].packet.symEncryptedIntegrityProtected,this.version=t,this.encrypted=null,this.modification=!1,this.packets=null}function f(a,b,c,d){return r?h(a,b,c,d):q["default"].AES_CFB.encrypt(k["default"].concatUint8Array([b,c]),d)}function g(a,b,c){var d=void 0;return d=r?i(a,b,c):q["default"].AES_CFB.decrypt(b,c),d.subarray(m["default"].cipher[a].blockSize+2,d.length)}function h(a,b,c,d){d=new s(d);var e=new s(new Uint8Array(m["default"].cipher[a].blockSize)),f=new r.createCipheriv("aes-"+a.substr(3,3)+"-cfb",d,e),g=f.update(new s(k["default"].concatUint8Array([b,c])));return new Uint8Array(g)}function i(a,b,c){b=new s(b),c=new s(c);var d=new s(new Uint8Array(m["default"].cipher[a].blockSize)),e=new r.createDecipheriv("aes-"+a.substr(3,3)+"-cfb",c,d),f=e.update(b);return new Uint8Array(f)}Object.defineProperty(c,"__esModule",{value:!0}),c["default"]=e;var j=a("../util.js"),k=d(j),l=a("../crypto"),m=d(l),n=a("../enums.js"),o=d(n),p=a("asmcrypto-lite"),q=d(p),r=k["default"].getNodeCrypto(),s=k["default"].getNodeBuffer(),t=1;e.prototype.read=function(a){if(a[0]!==t)throw new Error("Invalid packet version.");this.encrypted=a.subarray(1,a.length)},e.prototype.write=function(){return k["default"].concatUint8Array([new Uint8Array([t]),this.encrypted])},e.prototype.encrypt=function(a,b){var c=this.packets.write(),d=m["default"].getPrefixRandom(a),e=new Uint8Array([d[d.length-2],d[d.length-1]]),g=k["default"].concatUint8Array([d,e]),h=new Uint8Array([211,20]),i=k["default"].concatUint8Array([c,h]),j=m["default"].hash.sha1(k["default"].concatUint8Array([g,i]));return i=k["default"].concatUint8Array([i,j]),"aes"===a.substr(0,3)?this.encrypted=f(a,g,i,b):(this.encrypted=m["default"].cfb.encrypt(d,a,i,b,!1),this.encrypted=this.encrypted.subarray(0,g.length+i.length)),Promise.resolve()},e.prototype.decrypt=function(a,b){var c=void 0;c="aes"===a.substr(0,3)?g(a,this.encrypted,b):m["default"].cfb.decrypt(a,b,this.encrypted,!1);var d=m["default"].cfb.mdc(a,b,this.encrypted),e=c.subarray(0,c.length-20),f=k["default"].concatUint8Array([d,e]);this.hash=k["default"].Uint8Array2str(m["default"].hash.sha1(f));var h=k["default"].Uint8Array2str(c.subarray(c.length-20,c.length));if(this.hash!==h)throw new Error("Modification detected.");return this.packets.read(c.subarray(0,c.length-22)),Promise.resolve()}},{"../crypto":24,"../enums.js":35,"../util.js":69,"asmcrypto-lite":1}],61:[function(a,b,c){"use strict";function d(a){return a&&a.__esModule?a:{"default":a}}function e(){this.tag=k["default"].packet.symEncryptedSessionKey,this.version=4,this.sessionKey=null,this.sessionKeyEncryptionAlgorithm=null,this.sessionKeyAlgorithm="aes256",this.encrypted=null,this.s2k=new i["default"]}Object.defineProperty(c,"__esModule",{value:!0}),c["default"]=e;var f=a("../util.js"),g=d(f),h=a("../type/s2k.js"),i=d(h),j=a("../enums.js"),k=d(j),l=a("../crypto"),m=d(l);e.prototype.read=function(a){this.version=a[0];var b=k["default"].read(k["default"].symmetric,a[1]),c=this.s2k.read(a.subarray(2,a.length)),d=c+2;d<a.length?(this.encrypted=a.subarray(d,a.length),this.sessionKeyEncryptionAlgorithm=b):this.sessionKeyAlgorithm=b},e.prototype.write=function(){var a=null===this.encrypted?this.sessionKeyAlgorithm:this.sessionKeyEncryptionAlgorithm,b=g["default"].concatUint8Array([new Uint8Array([this.version,k["default"].write(k["default"].symmetric,a)]),this.s2k.write()]);return null!==this.encrypted&&(b=g["default"].concatUint8Array([b,this.encrypted])),b},e.prototype.decrypt=function(a){var b=null!==this.sessionKeyEncryptionAlgorithm?this.sessionKeyEncryptionAlgorithm:this.sessionKeyAlgorithm,c=m["default"].cipher[b].keySize,d=this.s2k.produce_key(a,c);if(null===this.encrypted)this.sessionKey=d;else{var e=m["default"].cfb.normalDecrypt(b,d,this.encrypted,null);this.sessionKeyAlgorithm=k["default"].read(k["default"].symmetric,e[0]),this.sessionKey=e.subarray(1,e.length)}},e.prototype.encrypt=function(a){var b=null!==this.sessionKeyEncryptionAlgorithm?this.sessionKeyEncryptionAlgorithm:this.sessionKeyAlgorithm;this.sessionKeyEncryptionAlgorithm=b;var c,d=m["default"].cipher[b].keySize,e=this.s2k.produce_key(a,d),f=new Uint8Array([k["default"].write(k["default"].symmetric,this.sessionKeyAlgorithm)]);null===this.sessionKey&&(this.sessionKey=m["default"].getRandomBytes(m["default"].cipher[this.sessionKeyAlgorithm].keySize)),c=g["default"].concatUint8Array([f,this.sessionKey]),this.encrypted=m["default"].cfb.normalEncrypt(b,e,c,null)},e.prototype.postCloneTypeFix=function(){this.s2k=i["default"].fromClone(this.s2k)}},{"../crypto":24,"../enums.js":35,"../type/s2k.js":68,"../util.js":69}],62:[function(a,b,c){"use strict";function d(a){return a&&a.__esModule?a:{"default":a}}function e(){this.tag=i["default"].packet.symmetricallyEncrypted,this.encrypted=null,this.packets=null,this.ignore_mdc_error=k["default"].ignore_mdc_error}Object.defineProperty(c,"__esModule",{value:!0}),c["default"]=e;var f=a("../crypto"),g=d(f),h=a("../enums.js"),i=d(h),j=a("../config"),k=d(j);e.prototype.read=function(a){this.encrypted=a},e.prototype.write=function(){return this.encrypted},e.prototype.decrypt=function(a,b){var c=g["default"].cfb.decrypt(a,b,this.encrypted,!0);if(!this.ignore_mdc_error&&("aes128"===a||"aes192"===a||"aes256"===a))throw new Error("Decryption failed due to missing MDC in combination with modern cipher.");return this.packets.read(c),Promise.resolve()},e.prototype.encrypt=function(a,b){var c=this.packets.write();return this.encrypted=g["default"].cfb.encrypt(g["default"].getPrefixRandom(a),a,c,b,!0),Promise.resolve()}},{"../config":10,"../crypto":24,"../enums.js":35}],63:[function(a,b,c){"use strict";function d(a){return a&&a.__esModule?a:{"default":a}}function e(){this.tag=g["default"].packet.trust}Object.defineProperty(c,"__esModule",{value:!0}),c["default"]=e;var f=a("../enums.js"),g=d(f);e.prototype.read=function(){}},{"../enums.js":35}],64:[function(a,b,c){"use strict";function d(a){return a&&a.__esModule?a:{"default":a}}function e(){this.tag=k["default"].packet.userAttribute,this.attributes=[]}Object.defineProperty(c,"__esModule",{value:!0}),c["default"]=e;var f=a("../util.js"),g=d(f),h=a("./packet.js"),i=d(h),j=a("../enums.js"),k=d(j);e.prototype.read=function(a){for(var b=0;b<a.length;){var c=i["default"].readSimpleLength(a.subarray(b,a.length));b+=c.offset,this.attributes.push(g["default"].Uint8Array2str(a.subarray(b,b+c.len))),b+=c.len}},e.prototype.write=function(){for(var a=[],b=0;b<this.attributes.length;b++)a.push(i["default"].writeSimpleLength(this.attributes[b].length)),a.push(g["default"].str2Uint8Array(this.attributes[b]));return g["default"].concatUint8Array(a)},e.prototype.equals=function(a){return!!(a&&a instanceof e)&&this.attributes.every(function(b,c){return b===a.attributes[c]})}},{"../enums.js":35,"../util.js":69,"./packet.js":51}],65:[function(a,b,c){"use strict";function d(a){return a&&a.__esModule?a:{"default":a}}function e(){this.tag=i["default"].packet.userid,this.userid=""}Object.defineProperty(c,"__esModule",{value:!0}),c["default"]=e;var f=a("../util.js"),g=d(f),h=a("../enums.js"),i=d(h);e.prototype.read=function(a){this.userid=g["default"].decode_utf8(g["default"].Uint8Array2str(a))},e.prototype.write=function(){return g["default"].str2Uint8Array(g["default"].encode_utf8(this.userid))}},{"../enums.js":35,"../util.js":69}],66:[function(a,b,c){"use strict";function d(a){return a&&a.__esModule?a:{"default":a}}function e(){this.bytes=""}Object.defineProperty(c,"__esModule",{value:!0}),c["default"]=e;var f=a("../util.js"),g=d(f);e.prototype.read=function(a){this.bytes=g["default"].Uint8Array2str(a.subarray(0,8))},e.prototype.write=function(){return g["default"].str2Uint8Array(this.bytes)},e.prototype.toHex=function(){return g["default"].hexstrdump(this.bytes)},e.prototype.equals=function(a){return this.bytes===a.bytes},e.prototype.isNull=function(){return""===this.bytes},e.mapToHex=function(a){return a.toHex()},e.fromClone=function(a){var b=new e;return b.bytes=a.bytes,b},e.fromId=function(a){var b=new e;return b.read(g["default"].str2Uint8Array(g["default"].hex2bin(a))),b}},{"../util.js":69}],67:[function(a,b,c){"use strict";function d(a){return a&&a.__esModule?a:{"default":a}}function e(){this.data=null}Object.defineProperty(c,"__esModule",{value:!0}),c["default"]=e;var f=a("../crypto/public_key/jsbn.js"),g=d(f),h=a("../util.js"),i=d(h);e.prototype.read=function(a){("string"==typeof a||String.prototype.isPrototypeOf(a))&&(a=i["default"].str2Uint8Array(a));var b=a[0]<<8|a[1],c=Math.ceil(b/8),d=i["default"].Uint8Array2str(a.subarray(2,2+c));return this.fromBytes(d),2+c},e.prototype.fromBytes=function(a){this.data=new g["default"](i["default"].hexstrdump(a),16)},e.prototype.toBytes=function(){var a=i["default"].Uint8Array2str(this.write());return a.substr(2)},e.prototype.byteLength=function(){return this.toBytes().length},e.prototype.write=function(){return i["default"].str2Uint8Array(this.data.toMPI())},e.prototype.toBigInteger=function(){return this.data.clone()},e.prototype.fromBigInteger=function(a){this.data=a.clone()},e.fromClone=function(a){a.data.copyTo=g["default"].prototype.copyTo;var b=new g["default"];a.data.copyTo(b);var c=new e;return c.data=b,c}},{"../crypto/public_key/jsbn.js":29,"../util.js":69}],68:[function(a,b,c){"use strict";function d(a){return a&&a.__esModule?a:{"default":a}}function e(){this.algorithm="sha256",this.type="iterated",this.c=96,this.salt=k["default"].random.getRandomBytes(8)}Object.defineProperty(c,"__esModule",{value:!0}),c["default"]=e;var f=a("../enums.js"),g=d(f),h=a("../util.js"),i=d(h),j=a("../crypto"),k=d(j);e.prototype.get_count=function(){var a=6;return 16+(15&this.c)<<(this.c>>4)+a},e.prototype.read=function(a){var b=0;switch(this.type=g["default"].read(g["default"].s2k,a[b++]),this.algorithm=g["default"].read(g["default"].hash,a[b++]),this.type){case"simple":break;case"salted":this.salt=a.subarray(b,b+8),b+=8;break;case"iterated":this.salt=a.subarray(b,b+8),b+=8,this.c=a[b++];break;case"gnu":if("GNU"!==i["default"].Uint8Array2str(a.subarray(b,3)))throw new Error("Unknown s2k type.");b+=3;var c=1e3+a[b++];if(1001!==c)throw new Error("Unknown s2k gnu protection mode.");this.type=c;break;default:throw new Error("Unknown s2k type.")}return b},e.prototype.write=function(){var a=[new Uint8Array([g["default"].write(g["default"].s2k,this.type),g["default"].write(g["default"].hash,this.algorithm)])];switch(this.type){case"simple":break;case"salted":a.push(this.salt);break;case"iterated":a.push(this.salt),a.push(new Uint8Array([this.c]));break;case"gnu":throw new Error("GNU s2k type not supported.");default:throw new Error("Unknown s2k type.")}return i["default"].concatUint8Array(a)},e.prototype.produce_key=function(a,b){function c(b,c){var d=g["default"].write(g["default"].hash,c.algorithm);switch(c.type){case"simple":return k["default"].hash.digest(d,i["default"].concatUint8Array([b,a]));case"salted":return k["default"].hash.digest(d,i["default"].concatUint8Array([b,c.salt,a]));case"iterated":for(var e=[],f=c.get_count(),h=i["default"].concatUint8Array([c.salt,a]);e.length*h.length<f;)e.push(h);return e=i["default"].concatUint8Array(e),e.length>f&&(e=e.subarray(0,f)),k["default"].hash.digest(d,i["default"].concatUint8Array([b,e]));case"gnu":throw new Error("GNU s2k type not supported.");default:throw new Error("Unknown s2k type.")}}a=i["default"].str2Uint8Array(i["default"].encode_utf8(a));for(var d=[],e=0,f=new Uint8Array(b),h=0;h<b;h++)f[h]=0;for(h=0;e<=b;){var j=c(f.subarray(0,h),this);d.push(j),e+=j.length,h++}return i["default"].concatUint8Array(d).subarray(0,b)},e.fromClone=function(a){var b=new e;return b.algorithm=a.algorithm,b.type=a.type,b.c=a.c,b.salt=a.salt,b}},{"../crypto":24,"../enums.js":35,"../util.js":69}],69:[function(a,b,c){"use strict";function d(a){return a&&a.__esModule?a:{"default":a}}Object.defineProperty(c,"__esModule",{value:!0});var e=a("./config"),f=d(e);c["default"]={isString:function(a){return"string"==typeof a||String.prototype.isPrototypeOf(a)},isArray:function(a){return Array.prototype.isPrototypeOf(a)},isUint8Array:function(a){return Uint8Array.prototype.isPrototypeOf(a)},isEmailAddress:function(a){if(!this.isString(a))return!1;var b=/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;return b.test(a)},isUserId:function(a){return!!this.isString(a)&&(/ </.test(a)&&/>$/.test(a))},getTransferables:function(a){if(f["default"].zero_copy&&Object.prototype.isPrototypeOf(a)){var b=[];return this.collectBuffers(a,b),b.length?b:void 0}},collectBuffers:function(a,b){if(a){if(this.isUint8Array(a)&&b.indexOf(a.buffer)===-1)return void b.push(a.buffer);if(Object.prototype.isPrototypeOf(a))for(var c in a)this.collectBuffers(a[c],b)}},readNumber:function(a){for(var b=0,c=0;c<a.length;c++)b<<=8,b+=a[c];return b},writeNumber:function(a,b){for(var c=new Uint8Array(b),d=0;d<b;d++)c[d]=a>>8*(b-d-1)&255;return c},readDate:function(a){var b=this.readNumber(a),c=new Date;return c.setTime(1e3*b),c},writeDate:function(a){var b=Math.round(a.getTime()/1e3);return this.writeNumber(b,4)},hexdump:function(a){for(var b,c=[],d=a.length,e=0,f=0;e<d;){for(b=a.charCodeAt(e++).toString(16);b.length<2;)b="0"+b;c.push(" "+b),f++,f%32===0&&c.push("\n           ")}return c.join("")},hexstrdump:function(a){if(null===a)return"";for(var b,c=[],d=a.length,e=0;e<d;){for(b=a.charCodeAt(e++).toString(16);b.length<2;)b="0"+b;c.push(""+b)}return c.join("")},hex2bin:function(a){for(var b="",c=0;c<a.length;c+=2)b+=String.fromCharCode(parseInt(a.substr(c,2),16));return b},hexidump:function(a){for(var b,c=[],d=a.length,e=0;e<d;){for(b=a[e++].toString(16);b.length<2;)b="0"+b;c.push(""+b)}return c.join("")},encode_utf8:function(a){return unescape(encodeURIComponent(a))},decode_utf8:function(a){if("string"!=typeof a)throw new Error('Parameter "utf8" is not of type string');try{return decodeURIComponent(escape(a))}catch(b){return a}},bin2str:function(a){for(var b=[],c=0;c<a.length;c++)b[c]=String.fromCharCode(a[c]);return b.join("")},str2bin:function(a){for(var b=[],c=0;c<a.length;c++)b[c]=a.charCodeAt(c);return b},str2Uint8Array:function(a){if("string"!=typeof a&&!String.prototype.isPrototypeOf(a))throw new Error("str2Uint8Array: Data must be in the form of a string");for(var b=new Uint8Array(a.length),c=0;c<a.length;c++)b[c]=a.charCodeAt(c);return b},Uint8Array2str:function(a){if(!Uint8Array.prototype.isPrototypeOf(a))throw new Error("Uint8Array2str: Data must be in the form of a Uint8Array");for(var b=[],c=0;c<a.length;c++)b[c]=String.fromCharCode(a[c]);return b.join("")},concatUint8Array:function(a){var b=0;a.forEach(function(a){if(!Uint8Array.prototype.isPrototypeOf(a))throw new Error("concatUint8Array: Data must be in the form of a Uint8Array");b+=a.length});var c=new Uint8Array(b),d=0;return a.forEach(function(a){c.set(a,d),d+=a.length}),c},copyUint8Array:function(a){if(!Uint8Array.prototype.isPrototypeOf(a))throw new Error("Data must be in the form of a Uint8Array");var b=new Uint8Array(a.length);return b.set(a),b},equalsUint8Array:function(a,b){if(!Uint8Array.prototype.isPrototypeOf(a)||!Uint8Array.prototype.isPrototypeOf(b))throw new Error("Data must be in the form of a Uint8Array");if(a.length!==b.length)return!1;for(var c=0;c<a.length;c++)if(a[c]!==b[c])return!1;return!0},calc_checksum:function(a){for(var b={s:0,add:function(a){this.s=(this.s+a)%65536}},c=0;c<a.length;c++)b.add(a[c]);return b.s},print_debug:function(a){f["default"].debug&&console.log(a)},print_debug_hexstr_dump:function(a,b){f["default"].debug&&(a+=this.hexstrdump(b),console.log(a))},getLeftNBits:function(a,b){var c=b%8;if(0===c)return a.substring(0,b/8);var d=(b-c)/8+1,e=a.substring(0,d);return this.shiftRight(e,8-c)},shiftRight:function(a,b){var c=this.str2bin(a);if(b%8===0)return a;for(var d=c.length-1;d>=0;d--)c[d]>>=b%8,d>0&&(c[d]|=c[d-1]<<8-b%8&255);return this.bin2str(c)},get_hashAlgorithmString:function(a){switch(a){case 1:return"MD5";case 2:return"SHA1";case 3:return"RIPEMD160";case 8:return"SHA256";case 9:return"SHA384";case 10:return"SHA512";case 11:return"SHA224"}return"unknown"},getWebCrypto:function(){if(f["default"].use_native)return"undefined"!=typeof window&&window.crypto&&window.crypto.subtle},getWebCryptoAll:function(){if(f["default"].use_native&&"undefined"!=typeof window){if(window.crypto)return window.crypto.subtle||window.crypto.webkitSubtle;if(window.msCrypto)return window.msCrypto.subtle}},promisify:function(a){return function(){var b=arguments;return new Promise(function(c){var d=a.apply(null,b);c(d)})}},promisifyIE11Op:function(a,b){return new Promise(function(c,d){a.onerror=function(){d(new Error(b))},a.oncomplete=function(a){c(a.target.result)}})},detectNode:function(){return"undefined"==typeof window},getNodeCrypto:function(){if(this.detectNode()&&f["default"].use_native)return a("crypto")},getNodeBuffer:function(){if(this.detectNode())return a("buffer").Buffer}}},{"./config":10,buffer:"buffer",crypto:"crypto"}],70:[function(a,b,c){"use strict";function d(a){return a&&a.__esModule?a:{"default":a}}function e(){var a=arguments.length<=0||void 0===arguments[0]?{}:arguments[0],b=a.path,c=void 0===b?"openpgp.worker.js":b,d=a.worker,e=a.config;this.worker=d||new Worker(c),this.worker.onmessage=this.onMessage.bind(this),this.worker.onerror=function(a){throw new Error("Unhandled error in openpgp worker: "+a.message+" ("+a.filename+":"+a.lineno+")")},this.seedRandom(l),this.tasks=[],e&&this.worker.postMessage({event:"configure",config:e})}Object.defineProperty(c,"__esModule",{value:!0}),c["default"]=e;var f=a("../util.js"),g=d(f),h=a("../crypto"),i=d(h),j=a("../packet"),k=d(j),l=5e4,m=2e4;e.prototype.onMessage=function(a){var b=a.data;switch(b.event){case"method-return":b.err?this.tasks.shift().reject(new Error(b.err)):this.tasks.shift().resolve(b.data);break;case"request-seed":this.seedRandom(m);break;default:throw new Error("Unknown Worker Event.")}},e.prototype.seedRandom=function(a){var b=this.getRandomBuffer(a);this.worker.postMessage({event:"seed-random",buf:b},g["default"].getTransferables.call(g["default"],b))},e.prototype.getRandomBuffer=function(a){if(!a)return null;var b=new Uint8Array(a);return i["default"].random.getRandomValues(b),b},e.prototype.terminate=function(){this.worker.terminate()},e.prototype.delegate=function(a,b){var c=this;return new Promise(function(d,e){c.worker.postMessage({event:a,options:k["default"].clone.clonePackets(b)},g["default"].getTransferables.call(g["default"],b)),c.tasks.push({resolve:function(b){return d(k["default"].clone.parseClonedPackets(b,a))},reject:e})})}},{"../crypto":24,"../packet":47,"../util.js":69}]},{},[37])(37)});
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],3:[function(require,module,exports){
// Generated by IcedCoffeeScript 108.0.8
(function() {
  module.exports = {
    k: "__iced_k",
    k_noop: "__iced_k_noop",
    param: "__iced_p_",
    ns: "iced",
    runtime: "runtime",
    Deferrals: "Deferrals",
    deferrals: "__iced_deferrals",
    fulfill: "_fulfill",
    b_while: "_break",
    t_while: "_while",
    c_while: "_continue",
    n_while: "_next",
    n_arg: "__iced_next_arg",
    defer_method: "defer",
    slot: "__slot",
    assign_fn: "assign_fn",
    autocb: "autocb",
    retslot: "ret",
    trace: "__iced_trace",
    passed_deferral: "__iced_passed_deferral",
    findDeferral: "findDeferral",
    lineno: "lineno",
    parent: "parent",
    filename: "filename",
    funcname: "funcname",
    catchExceptions: 'catchExceptions',
    runtime_modes: ["node", "inline", "window", "none", "browserify", "interp"],
    trampoline: "trampoline",
    context: "context",
    defer_arg: "__iced_defer_"
  };

}).call(this);

},{}],4:[function(require,module,exports){
// Generated by IcedCoffeeScript 108.0.8
(function() {
  var C, Pipeliner, iced, __iced_k, __iced_k_noop, _iand, _ior, _timeout,
    __slice = [].slice;

  __iced_k = __iced_k_noop = function() {};

  C = require('./const');

  exports.iced = iced = require('./runtime');

  _timeout = function(cb, t, res, tmp) {
    var arr, rv, which, ___iced_passed_deferral, __iced_deferrals, __iced_k;
    __iced_k = __iced_k_noop;
    ___iced_passed_deferral = iced.findDeferral(arguments);
    rv = new iced.Rendezvous;
    tmp[0] = rv.id(true).defer({
      assign_fn: (function(_this) {
        return function() {
          return function() {
            return arr = __slice.call(arguments, 0);
          };
        };
      })(this)(),
      lineno: 20,
      context: __iced_deferrals
    });
    setTimeout(rv.id(false).defer({
      lineno: 21,
      context: __iced_deferrals
    }), t);
    (function(_this) {
      return (function(__iced_k) {
        __iced_deferrals = new iced.Deferrals(__iced_k, {
          parent: ___iced_passed_deferral,
          filename: "/Users/max/src/iced/iced-runtime/src/library.iced"
        });
        rv.wait(__iced_deferrals.defer({
          assign_fn: (function() {
            return function() {
              return which = arguments[0];
            };
          })(),
          lineno: 22
        }));
        __iced_deferrals._fulfill();
      });
    })(this)((function(_this) {
      return function() {
        if (res) {
          res[0] = which;
        }
        return cb.apply(null, arr);
      };
    })(this));
  };

  exports.timeout = function(cb, t, res) {
    var tmp;
    tmp = [];
    _timeout(cb, t, res, tmp);
    return tmp[0];
  };

  _iand = function(cb, res, tmp) {
    var ok, ___iced_passed_deferral, __iced_deferrals, __iced_k;
    __iced_k = __iced_k_noop;
    ___iced_passed_deferral = iced.findDeferral(arguments);
    (function(_this) {
      return (function(__iced_k) {
        __iced_deferrals = new iced.Deferrals(__iced_k, {
          parent: ___iced_passed_deferral,
          filename: "/Users/max/src/iced/iced-runtime/src/library.iced"
        });
        tmp[0] = __iced_deferrals.defer({
          assign_fn: (function() {
            return function() {
              return ok = arguments[0];
            };
          })(),
          lineno: 39
        });
        __iced_deferrals._fulfill();
      });
    })(this)((function(_this) {
      return function() {
        if (!ok) {
          res[0] = false;
        }
        return cb();
      };
    })(this));
  };

  exports.iand = function(cb, res) {
    var tmp;
    tmp = [];
    _iand(cb, res, tmp);
    return tmp[0];
  };

  _ior = function(cb, res, tmp) {
    var ok, ___iced_passed_deferral, __iced_deferrals, __iced_k;
    __iced_k = __iced_k_noop;
    ___iced_passed_deferral = iced.findDeferral(arguments);
    (function(_this) {
      return (function(__iced_k) {
        __iced_deferrals = new iced.Deferrals(__iced_k, {
          parent: ___iced_passed_deferral,
          filename: "/Users/max/src/iced/iced-runtime/src/library.iced"
        });
        tmp[0] = __iced_deferrals.defer({
          assign_fn: (function() {
            return function() {
              return ok = arguments[0];
            };
          })(),
          lineno: 58
        });
        __iced_deferrals._fulfill();
      });
    })(this)((function(_this) {
      return function() {
        if (ok) {
          res[0] = true;
        }
        return cb();
      };
    })(this));
  };

  exports.ior = function(cb, res) {
    var tmp;
    tmp = [];
    _ior(cb, res, tmp);
    return tmp[0];
  };

  exports.Pipeliner = Pipeliner = (function() {
    function Pipeliner(window, delay) {
      this.window = window || 1;
      this.delay = delay || 0;
      this.queue = [];
      this.n_out = 0;
      this.cb = null;
      this[C.deferrals] = this;
      this["defer"] = this._defer;
    }

    Pipeliner.prototype.waitInQueue = function(cb) {
      var ___iced_passed_deferral, __iced_deferrals, __iced_k;
      __iced_k = __iced_k_noop;
      ___iced_passed_deferral = iced.findDeferral(arguments);
      (function(_this) {
        return (function(__iced_k) {
          var _while;
          _while = function(__iced_k) {
            var _break, _continue, _next;
            _break = __iced_k;
            _continue = function() {
              return iced.trampoline(function() {
                return _while(__iced_k);
              });
            };
            _next = _continue;
            if (!(_this.n_out >= _this.window)) {
              return _break();
            } else {
              (function(__iced_k) {
                __iced_deferrals = new iced.Deferrals(__iced_k, {
                  parent: ___iced_passed_deferral,
                  filename: "/Users/max/src/iced/iced-runtime/src/library.iced",
                  funcname: "Pipeliner.waitInQueue"
                });
                _this.cb = __iced_deferrals.defer({
                  lineno: 100
                });
                __iced_deferrals._fulfill();
              })(_next);
            }
          };
          _while(__iced_k);
        });
      })(this)((function(_this) {
        return function() {
          _this.n_out++;
          (function(__iced_k) {
            if (_this.delay) {
              (function(__iced_k) {
                __iced_deferrals = new iced.Deferrals(__iced_k, {
                  parent: ___iced_passed_deferral,
                  filename: "/Users/max/src/iced/iced-runtime/src/library.iced",
                  funcname: "Pipeliner.waitInQueue"
                });
                setTimeout(__iced_deferrals.defer({
                  lineno: 108
                }), _this.delay);
                __iced_deferrals._fulfill();
              })(__iced_k);
            } else {
              return __iced_k();
            }
          })(function() {
            return cb();
          });
        };
      })(this));
    };

    Pipeliner.prototype.__defer = function(out, deferArgs) {
      var tmp, voidCb, ___iced_passed_deferral, __iced_deferrals, __iced_k;
      __iced_k = __iced_k_noop;
      ___iced_passed_deferral = iced.findDeferral(arguments);
      (function(_this) {
        return (function(__iced_k) {
          __iced_deferrals = new iced.Deferrals(__iced_k, {
            parent: ___iced_passed_deferral,
            filename: "/Users/max/src/iced/iced-runtime/src/library.iced",
            funcname: "Pipeliner.__defer"
          });
          voidCb = __iced_deferrals.defer({
            lineno: 122
          });
          out[0] = function() {
            var args, _ref;
            args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
            if ((_ref = deferArgs.assign_fn) != null) {
              _ref.apply(null, args);
            }
            return voidCb();
          };
          __iced_deferrals._fulfill();
        });
      })(this)((function(_this) {
        return function() {
          _this.n_out--;
          if (_this.cb) {
            tmp = _this.cb;
            _this.cb = null;
            return tmp();
          }
        };
      })(this));
    };

    Pipeliner.prototype._defer = function(deferArgs) {
      var tmp;
      tmp = [];
      this.__defer(tmp, deferArgs);
      return tmp[0];
    };

    Pipeliner.prototype.flush = function(autocb) {
      var ___iced_passed_deferral, __iced_k, _while;
      __iced_k = autocb;
      ___iced_passed_deferral = iced.findDeferral(arguments);
      _while = (function(_this) {
        var __iced_deferrals;
        return function(__iced_k) {
          var _break, _continue, _next;
          _break = __iced_k;
          _continue = function() {
            return iced.trampoline(function() {
              return _while(__iced_k);
            });
          };
          _next = _continue;
          if (!_this.n_out) {
            return _break();
          } else {
            (function(__iced_k) {
              __iced_deferrals = new iced.Deferrals(__iced_k, {
                parent: ___iced_passed_deferral,
                filename: "/Users/max/src/iced/iced-runtime/src/library.iced",
                funcname: "Pipeliner.flush"
              });
              _this.cb = __iced_deferrals.defer({
                lineno: 151
              });
              __iced_deferrals._fulfill();
            })(_next);
          }
        };
      })(this);
      _while(__iced_k);
    };

    return Pipeliner;

  })();

}).call(this);

},{"./const":3,"./runtime":6}],5:[function(require,module,exports){
// Generated by IcedCoffeeScript 108.0.8
(function() {
  var k, mod, mods, v, _i, _len;

  exports["const"] = require('./const');

  mods = [require('./runtime'), require('./library')];

  for (_i = 0, _len = mods.length; _i < _len; _i++) {
    mod = mods[_i];
    for (k in mod) {
      v = mod[k];
      exports[k] = v;
    }
  }

}).call(this);

},{"./const":3,"./library":4,"./runtime":6}],6:[function(require,module,exports){
(function (process){
// Generated by IcedCoffeeScript 108.0.8
(function() {
  var C, Deferrals, Rendezvous, exceptionHandler, findDeferral, make_defer_return, stackWalk, tick_counter, trampoline, warn, __active_trace, __c, _trace_to_string,
    __slice = [].slice;

  C = require('./const');

  make_defer_return = function(obj, defer_args, id, trace_template, multi) {
    var k, ret, trace, v;
    trace = {};
    for (k in trace_template) {
      v = trace_template[k];
      trace[k] = v;
    }
    trace[C.lineno] = defer_args != null ? defer_args[C.lineno] : void 0;
    ret = function() {
      var inner_args, o, _ref;
      inner_args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      if (defer_args != null) {
        if ((_ref = defer_args.assign_fn) != null) {
          _ref.apply(null, inner_args);
        }
      }
      if (obj) {
        o = obj;
        if (!multi) {
          obj = null;
        }
        return o._fulfill(id, trace);
      } else {
        return warn("overused deferral at " + (_trace_to_string(trace)));
      }
    };
    ret[C.trace] = trace;
    return ret;
  };

  __c = 0;

  tick_counter = function(mod) {
    __c++;
    if ((__c % mod) === 0) {
      __c = 0;
      return true;
    } else {
      return false;
    }
  };

  __active_trace = null;

  _trace_to_string = function(tr) {
    var fn;
    fn = tr[C.funcname] || "<anonymous>";
    return "" + fn + " (" + tr[C.filename] + ":" + (tr[C.lineno] + 1) + ")";
  };

  warn = function(m) {
    return typeof console !== "undefined" && console !== null ? console.error("ICED warning: " + m) : void 0;
  };

  exports.trampoline = trampoline = function(fn) {
    if (!tick_counter(500)) {
      return fn();
    } else if ((typeof process !== "undefined" && process !== null ? process.nextTick : void 0) != null) {
      return process.nextTick(fn);
    } else {
      return setTimeout(fn);
    }
  };

  exports.Deferrals = Deferrals = (function() {
    function Deferrals(k, trace) {
      this.trace = trace;
      this.continuation = k;
      this.count = 1;
      this.ret = null;
    }

    Deferrals.prototype._call = function(trace) {
      var c;
      if (this.continuation) {
        __active_trace = trace;
        c = this.continuation;
        this.continuation = null;
        return c(this.ret);
      } else {
        return warn("Entered dead await at " + (_trace_to_string(trace)));
      }
    };

    Deferrals.prototype._fulfill = function(id, trace) {
      if (--this.count > 0) {

      } else {
        return trampoline(((function(_this) {
          return function() {
            return _this._call(trace);
          };
        })(this)));
      }
    };

    Deferrals.prototype.defer = function(args) {
      var self;
      this.count++;
      self = this;
      return make_defer_return(self, args, null, this.trace);
    };

    return Deferrals;

  })();

  exports.findDeferral = findDeferral = function(args) {
    var a, _i, _len;
    for (_i = 0, _len = args.length; _i < _len; _i++) {
      a = args[_i];
      if (a != null ? a[C.trace] : void 0) {
        return a;
      }
    }
    return null;
  };

  exports.Rendezvous = Rendezvous = (function() {
    var RvId;

    function Rendezvous() {
      this.completed = [];
      this.waiters = [];
      this.defer_id = 0;
    }

    RvId = (function() {
      function RvId(rv, id, multi) {
        this.rv = rv;
        this.id = id;
        this.multi = multi;
      }

      RvId.prototype.defer = function(defer_args) {
        return this.rv._defer_with_id(this.id, defer_args, this.multi);
      };

      return RvId;

    })();

    Rendezvous.prototype.wait = function(cb) {
      var x;
      if (this.completed.length) {
        x = this.completed.shift();
        return cb(x);
      } else {
        return this.waiters.push(cb);
      }
    };

    Rendezvous.prototype.defer = function(defer_args) {
      var id;
      id = this.defer_id++;
      return this._defer_with_id(id, defer_args);
    };

    Rendezvous.prototype.id = function(i, multi) {
      multi = !!multi;
      return new RvId(this, i, multi);
    };

    Rendezvous.prototype._fulfill = function(id, trace) {
      var cb;
      if (this.waiters.length) {
        cb = this.waiters.shift();
        return cb(id);
      } else {
        return this.completed.push(id);
      }
    };

    Rendezvous.prototype._defer_with_id = function(id, defer_args, multi) {
      this.count++;
      return make_defer_return(this, defer_args, id, {}, multi);
    };

    return Rendezvous;

  })();

  exports.stackWalk = stackWalk = function(cb) {
    var line, ret, tr, _ref;
    ret = [];
    tr = cb ? cb[C.trace] : __active_trace;
    while (tr) {
      line = "   at " + (_trace_to_string(tr));
      ret.push(line);
      tr = tr != null ? (_ref = tr[C.parent]) != null ? _ref[C.trace] : void 0 : void 0;
    }
    return ret;
  };

  exports.exceptionHandler = exceptionHandler = function(err, logger) {
    var stack;
    if (!logger) {
      logger = console.error;
    }
    logger(err.stack);
    stack = stackWalk();
    if (stack.length) {
      logger("Iced 'stack' trace (w/ real line numbers):");
      return logger(stack.join("\n"));
    }
  };

  exports.catchExceptions = function(logger) {
    return typeof process !== "undefined" && process !== null ? process.on('uncaughtException', function(err) {
      exceptionHandler(err, logger);
      return process.exit(1);
    }) : void 0;
  };

}).call(this);

}).call(this,require('_process'))
},{"./const":3,"_process":9}],7:[function(require,module,exports){
'strict';
wordList = require('./pgpWordList')

var pgpWordConvert = () => {
  var hexToWord = (hex, position) =>
    wordList[hex][position % 2];

  var hexToWords = (hexs) => {
    return hexs.map((hex, index) =>
      hexToWord(hex.toUpperCase(), index)
    );
  }

  var wordToHex = (word) => {
    var contains = (a, w) => {
      var i = a.length;
      while (i--) {
        if (a[i].toUpperCase() === w.toUpperCase())
          return true;
      }
      return false;
    }

    for (var index in pgpWordList) {
      if (contains(pgpWordList[index], word))
        return index;
    };
  }

  var wordsToHex = (words) => {
    return words.map((word) =>
      wordToHex(word)
    );
  }

  var toHex = (words) => {
    if (typeof words === 'string')
      words = words.trim().split(/[ ,]+/);
    return wordsToHex(words);
  }

  var toWords = function(hex) {
    if (typeof hex === 'string')
      hex = hex.toUpperCase().replace(/[^0-9A-F]/g, '').match(/.{1,2}/g)
    return hexToWords(hex);
  }

  return {
    toHex: toHex,
    toWords: toWords
  }
}
module.exports = pgpWordConvert();

},{"./pgpWordList":8}],8:[function(require,module,exports){
module.exports = pgpWordList = {
  '00': ['aardvark', 'adroitness'],
  '01': ['absurd', 'adviser'],
  '02': ['accrue', 'aftermath'],
  '03': ['acme', 'aggregate'],
  '04': ['adrift', 'alkali'],
  '05': ['adult', 'almighty'],
  '06': ['afflict', 'amulet'],
  '07': ['ahead', 'amusement'],
  '08': ['aimless', 'antenna'],
  '09': ['Algol', 'applicant'],
  '0A': ['allow', 'Apollo'],
  '0B': ['alone', 'armistice'],
  '0C': ['ammo', 'article'],
  '0D': ['ancient', 'asteroid'],
  '0E': ['apple', 'Atlantic'],
  '0F': ['artist', 'atmosphere'],
  '10': ['assume', 'autopsy'],
  '11': ['Athens', 'Babylon'],
  '12': ['atlas', 'backwater'],
  '13': ['Aztec', 'barbecue'],
  '14': ['baboon', 'belowground'],
  '15': ['backfield', 'bifocals'],
  '16': ['backward', 'bodyguard'],
  '17': ['banjo', 'bookseller'],
  '18': ['beaming', 'borderline'],
  '19': ['bedlamp', 'bottomless'],
  '1A': ['beehive', 'Bradbury'],
  '1B': ['beeswax', 'bravado'],
  '1C': ['befriend', 'Brazilian'],
  '1D': ['Belfast', 'breakaway'],
  '1E': ['berserk', 'Burlington'],
  '1F': ['billiard', 'businessman'],
  '20': ['bison', 'butterfat'],
  '21': ['blackjack', 'Camelot'],
  '22': ['blockade', 'candidate'],
  '23': ['blowtorch', 'cannonball'],
  '24': ['bluebird', 'Capricorn'],
  '25': ['bombast', 'caravan'],
  '26': ['bookshelf', 'caretaker'],
  '27': ['brackish', 'celebrate'],
  '28': ['breadline', 'cellulose'],
  '29': ['breakup', 'certify'],
  '2A': ['brickyard', 'chambermaid'],
  '2B': ['briefcase', 'Cherokee'],
  '2C': ['Burbank', 'Chicago'],
  '2D': ['button', 'clergyman'],
  '2E': ['buzzard', 'coherence'],
  '2F': ['cement', 'combustion'],
  '30': ['chairlift', 'commando'],
  '31': ['chatter', 'company'],
  '32': ['checkup', 'component'],
  '33': ['chisel', 'concurrent'],
  '34': ['choking', 'confidence'],
  '35': ['chopper', 'conformist'],
  '36': ['Christmas', 'congregate'],
  '37': ['clamshell', 'consensus'],
  '38': ['classic', 'consulting'],
  '39': ['classroom', 'corporate'],
  '3A': ['cleanup', 'corrosion'],
  '3B': ['clockwork', 'councilman'],
  '3C': ['cobra', 'crossover'],
  '3D': ['commence', 'crucifix'],
  '3E': ['concert', 'cumbersome'],
  '3F': ['cowbell', 'customer'],
  '40': ['crackdown', 'Dakota'],
  '41': ['cranky', 'decadence'],
  '42': ['crowfoot', 'December'],
  '43': ['crucial', 'decimal'],
  '44': ['crumpled', 'designing'],
  '45': ['crusade', 'detector'],
  '46': ['cubic', 'detergent'],
  '47': ['dashboard', 'determine'],
  '48': ['deadbolt', 'dictator'],
  '49': ['deckhand', 'dinosaur'],
  '4A': ['dogsled', 'direction'],
  '4B': ['dragnet', 'disable'],
  '4C': ['drainage', 'disbelief'],
  '4D': ['dreadful', 'disruptive'],
  '4E': ['drifter', 'distortion'],
  '4F': ['dropper', 'document'],
  '50': ['drumbeat', 'embezzle'],
  '51': ['drunken', 'enchanting'],
  '52': ['Dupont', 'enrollment'],
  '53': ['dwelling', 'enterprise'],
  '54': ['eating', 'equation'],
  '55': ['edict', 'equipment'],
  '56': ['egghead', 'escapade'],
  '57': ['eightball', 'Eskimo'],
  '58': ['endorse', 'everyday'],
  '59': ['endow', 'examine'],
  '5A': ['enlist', 'existence'],
  '5B': ['erase', 'exodus'],
  '5C': ['escape', 'fascinate'],
  '5D': ['exceed', 'filament'],
  '5E': ['eyeglass', 'finicky'],
  '5F': ['eyetooth', 'forever'],
  '60': ['facial', 'fortitude'],
  '61': ['fallout', 'frequency'],
  '62': ['flagpole', 'gadgetry'],
  '63': ['flatfoot', 'Galveston'],
  '64': ['flytrap', 'getaway'],
  '65': ['fracture', 'glossary'],
  '66': ['framework', 'gossamer'],
  '67': ['freedom', 'graduate'],
  '68': ['frighten', 'gravity'],
  '69': ['gazelle', 'guitarist'],
  '6A': ['Geiger', 'hamburger'],
  '6B': ['glitter', 'Hamilton'],
  '6C': ['glucose', 'handiwork'],
  '6D': ['goggles', 'hazardous'],
  '6E': ['goldfish', 'headwaters'],
  '6F': ['gremlin', 'hemisphere'],
  '70': ['guidance', 'hesitate'],
  '71': ['hamlet', 'hideaway'],
  '72': ['highchair', 'holiness'],
  '73': ['hockey', 'hurricane'],
  '74': ['indoors', 'hydraulic'],
  '75': ['indulge', 'impartial'],
  '76': ['inverse', 'impetus'],
  '77': ['involve', 'inception'],
  '78': ['island', 'indigo'],
  '79': ['jawbone', 'inertia'],
  '7A': ['keyboard', 'infancy'],
  '7B': ['kickoff', 'inferno'],
  '7C': ['kiwi', 'informant'],
  '7D': ['klaxon', 'insincere'],
  '7E': ['locale', 'insurgent'],
  '7F': ['lockup', 'integrate'],
  '80': ['merit', 'intention'],
  '81': ['minnow', 'inventive'],
  '82': ['miser', 'Istanbul'],
  '83': ['Mohawk', 'Jamaica'],
  '84': ['mural', 'Jupiter'],
  '85': ['music', 'leprosy'],
  '86': ['necklace', 'letterhead'],
  '87': ['Neptune', 'liberty'],
  '88': ['newborn', 'maritime'],
  '89': ['nightbird', 'matchmaker'],
  '8A': ['Oakland', 'maverick'],
  '8B': ['obtuse', 'Medusa'],
  '8C': ['offload', 'megaton'],
  '8D': ['optic', 'microscope'],
  '8E': ['orca', 'microwave'],
  '8F': ['payday', 'midsummer'],
  '90': ['peachy', 'millionaire'],
  '91': ['pheasant', 'miracle'],
  '92': ['physique', 'misnomer'],
  '93': ['playhouse', 'molasses'],
  '94': ['Pluto', 'molecule'],
  '95': ['preclude', 'Montana'],
  '96': ['prefer', 'monument'],
  '97': ['preshrunk', 'mosquito'],
  '98': ['printer', 'narrative'],
  '99': ['prowler', 'nebula'],
  '9A': ['pupil', 'newsletter'],
  '9B': ['puppy', 'Norwegian'],
  '9C': ['python', 'October'],
  '9D': ['quadrant', 'Ohio'],
  '9E': ['quiver', 'onlooker'],
  '9F': ['quota', 'opulent'],
  'A0': ['ragtime', 'Orlando'],
  'A1': ['ratchet', 'outfielder'],
  'A2': ['rebirth', 'Pacific'],
  'A3': ['reform', 'pandemic'],
  'A4': ['regain', 'Pandora'],
  'A5': ['reindeer', 'paperweight'],
  'A6': ['rematch', 'paragon'],
  'A7': ['repay', 'paragraph'],
  'A8': ['retouch', 'paramount'],
  'A9': ['revenge', 'passenger'],
  'AA': ['reward', 'pedigree'],
  'AB': ['rhythm', 'Pegasus'],
  'AC': ['ribcage', 'penetrate'],
  'AD': ['ringbolt', 'perceptive'],
  'AE': ['robust', 'performance'],
  'AF': ['rocker', 'pharmacy'],
  'B0': ['ruffled', 'phonetic'],
  'B1': ['sailboat', 'photograph'],
  'B2': ['sawdust', 'pioneer'],
  'B3': ['scallion', 'pocketful'],
  'B4': ['scenic', 'politeness'],
  'B5': ['scorecard', 'positive'],
  'B6': ['Scotland', 'potato'],
  'B7': ['seabird', 'processor'],
  'B8': ['select', 'provincial'],
  'B9': ['sentence', 'proximate'],
  'BA': ['shadow', 'puberty'],
  'BB': ['shamrock', 'publisher'],
  'BC': ['showgirl', 'pyramid'],
  'BD': ['skullcap', 'quantity'],
  'BE': ['skydive', 'racketeer'],
  'BF': ['slingshot', 'rebellion'],
  'C0': ['slowdown', 'recipe'],
  'C1': ['snapline', 'recover'],
  'C2': ['snapshot', 'repellent'],
  'C3': ['snowcap', 'replica'],
  'C4': ['snowslide', 'reproduce'],
  'C5': ['solo', 'resistor'],
  'C6': ['southward', 'responsive'],
  'C7': ['soybean', 'retraction'],
  'C8': ['spaniel', 'retrieval'],
  'C9': ['spearhead', 'retrospect'],
  'CA': ['spellbind', 'revenue'],
  'CB': ['spheroid', 'revival'],
  'CC': ['spigot', 'revolver'],
  'CD': ['spindle', 'sandalwood'],
  'CE': ['spyglass', 'sardonic'],
  'CF': ['stagehand', 'Saturday'],
  'D0': ['stagnate', 'savagery'],
  'D1': ['stairway', 'scavenger'],
  'D2': ['standard', 'sensation'],
  'D3': ['stapler', 'sociable'],
  'D4': ['steamship', 'souvenir'],
  'D5': ['sterling', 'specialist'],
  'D6': ['stockman', 'speculate'],
  'D7': ['stopwatch', 'stethoscope'],
  'D8': ['stormy', 'stupendous'],
  'D9': ['sugar', 'supportive'],
  'DA': ['surmount', 'surrender'],
  'DB': ['suspense', 'suspicious'],
  'DC': ['sweatband', 'sympathy'],
  'DD': ['swelter', 'tambourine'],
  'DE': ['tactics', 'telephone'],
  'DF': ['talon', 'therapist'],
  'E0': ['tapeworm', 'tobacco'],
  'E1': ['tempest', 'tolerance'],
  'E2': ['tiger', 'tomorrow'],
  'E3': ['tissue', 'torpedo'],
  'E4': ['tonic', 'tradition'],
  'E5': ['topmost', 'travesty'],
  'E6': ['tracker', 'trombonist'],
  'E7': ['transit', 'truncated'],
  'E8': ['trauma', 'typewriter'],
  'E9': ['treadmill', 'ultimate'],
  'EA': ['Trojan', 'undaunted'],
  'EB': ['trouble', 'underfoot'],
  'EC': ['tumor', 'unicorn'],
  'ED': ['tunnel', 'unify'],
  'EE': ['tycoon', 'universe'],
  'EF': ['uncut', 'unravel'],
  'F0': ['unearth', 'upcoming'],
  'F1': ['unwind', 'vacancy'],
  'F2': ['uproot', 'vagabond'],
  'F3': ['upset', 'vertigo'],
  'F4': ['upshot', 'Virginia'],
  'F5': ['vapor', 'visitor'],
  'F6': ['village', 'vocalist'],
  'F7': ['virus', 'voyager'],
  'F8': ['Vulcan', 'warranty'],
  'F9': ['waffle', 'Waterloo'],
  'FA': ['wallet', 'whimsical'],
  'FB': ['watchword', 'Wichita'],
  'FC': ['wayside', 'Wilmington'],
  'FD': ['willow', 'Wyoming'],
  'FE': ['woodlark', 'yesteryear'],
  'FF': ['Zulu', 'Yucatan']
};

},{}],9:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

(function () {
    try {
        cachedSetTimeout = setTimeout;
    } catch (e) {
        cachedSetTimeout = function () {
            throw new Error('setTimeout is not defined');
        }
    }
    try {
        cachedClearTimeout = clearTimeout;
    } catch (e) {
        cachedClearTimeout = function () {
            throw new Error('clearTimeout is not defined');
        }
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],10:[function(require,module,exports){
(function (process){
'use strict';

var Vue = require('vue');
var Vue__default = 'default' in Vue ? Vue['default'] : Vue;

// @NOTE: We have to use Vue.nextTick because the element might not be
//        present at the time model changes, but will be in the next batch.
//        But because we use Vue.nextTick, the directive may already be unbound
//        by the time the callback executes, so we have to make sure it was not.

var focus = {
  priority: 1000,

  bind: function() {
    var self = this;
    this.bound = true;

    this.focus = function() {
      if (self.bound === true) {
        self.el.focus();
      }
    };

    this.blur = function() {
      if (self.bound === true) {
        self.el.blur();
      }
    };
  },

  update: function(value) {
    if (value) {
      Vue__default.nextTick(this.focus);
    } else {
      Vue__default.nextTick(this.blur);
    }
  },

  unbind: function() {
    this.bound = false;
  },
};

var focusModel = {
  twoWay: true,
  priority: 1000,

  bind: function() {
    var self = this;
    this.bound = true;

    this.focus = function() {
      if (self.bound === true) {
        self.el.focus();
      }
    };

    this.blur = function() {
      if (self.bound === true) {
        self.el.blur();
      }
    };

    this.focusHandler = function() {
      self.set(true);
    };

    this.blurHandler = function() {
      self.set(false);
    };

    Vue.util.on(this.el, 'focus', this.focusHandler);
    Vue.util.on(this.el, 'blur', this.blurHandler);
  },

  update: function(value) {
    if (value === true) {
      Vue__default.nextTick(this.focus);
    } else if (value === false) {
      Vue__default.nextTick(this.blur);
    } else {
      if (process.env.NODE_ENV !== 'production') {
        Vue.util.warn(
          this.name + '="' +
          this.expression + '" expects a boolean value, ' +
          'got ' + JSON.stringify(value)
        );
      }
    }
  },

  unbind: function() {
    Vue.util.off(this.el, 'focus', this.focusHandler);
    Vue.util.off(this.el, 'blur', this.blurHandler);
    this.bound = false;
  },
};

var focusAuto = {
  priority: 100,
  bind: function() {
    var self = this;
    this.bound = true;

    Vue__default.nextTick(function() {
      if (self.bound === true) {
        self.el.focus();
      }
    });
  },
  unbind: function(){
    this.bound = false;
  },
};

var mixin = {
  directives: {
    focus: focus,
    focusModel: focusModel,
    focusAuto: focusAuto,
  },
};

exports.focus = focus;
exports.focusModel = focusModel;
exports.focusAuto = focusAuto;
exports.mixin = mixin;
}).call(this,require('_process'))
},{"_process":9,"vue":13}],11:[function(require,module,exports){
var Vue // late bind
var map = Object.create(null)
var shimmed = false
var isBrowserify = false

/**
 * Determine compatibility and apply patch.
 *
 * @param {Function} vue
 * @param {Boolean} browserify
 */

exports.install = function (vue, browserify) {
  if (shimmed) return
  shimmed = true

  Vue = vue
  isBrowserify = browserify

  exports.compatible = !!Vue.internalDirectives
  if (!exports.compatible) {
    console.warn(
      '[HMR] vue-loader hot reload is only compatible with ' +
      'Vue.js 1.0.0+.'
    )
    return
  }

  // patch view directive
  patchView(Vue.internalDirectives.component)
  console.log('[HMR] Vue component hot reload shim applied.')
  // shim router-view if present
  var routerView = Vue.elementDirective('router-view')
  if (routerView) {
    patchView(routerView)
    console.log('[HMR] vue-router <router-view> hot reload shim applied.')
  }
}

/**
 * Shim the view directive (component or router-view).
 *
 * @param {Object} View
 */

function patchView (View) {
  var unbuild = View.unbuild
  View.unbuild = function (defer) {
    if (!this.hotUpdating) {
      var prevComponent = this.childVM && this.childVM.constructor
      removeView(prevComponent, this)
      // defer = true means we are transitioning to a new
      // Component. Register this new component to the list.
      if (defer) {
        addView(this.Component, this)
      }
    }
    // call original
    return unbuild.call(this, defer)
  }
}

/**
 * Add a component view to a Component's hot list
 *
 * @param {Function} Component
 * @param {Directive} view - view directive instance
 */

function addView (Component, view) {
  var id = Component && Component.options.hotID
  if (id) {
    if (!map[id]) {
      map[id] = {
        Component: Component,
        views: [],
        instances: []
      }
    }
    map[id].views.push(view)
  }
}

/**
 * Remove a component view from a Component's hot list
 *
 * @param {Function} Component
 * @param {Directive} view - view directive instance
 */

function removeView (Component, view) {
  var id = Component && Component.options.hotID
  if (id) {
    map[id].views.$remove(view)
  }
}

/**
 * Create a record for a hot module, which keeps track of its construcotr,
 * instnaces and views (component directives or router-views).
 *
 * @param {String} id
 * @param {Object} options
 */

exports.createRecord = function (id, options) {
  if (typeof options === 'function') {
    options = options.options
  }
  if (typeof options.el !== 'string' && typeof options.data !== 'object') {
    makeOptionsHot(id, options)
    map[id] = {
      Component: null,
      views: [],
      instances: []
    }
  }
}

/**
 * Make a Component options object hot.
 *
 * @param {String} id
 * @param {Object} options
 */

function makeOptionsHot (id, options) {
  options.hotID = id
  injectHook(options, 'created', function () {
    var record = map[id]
    if (!record.Component) {
      record.Component = this.constructor
    }
    record.instances.push(this)
  })
  injectHook(options, 'beforeDestroy', function () {
    map[id].instances.$remove(this)
  })
}

/**
 * Inject a hook to a hot reloadable component so that
 * we can keep track of it.
 *
 * @param {Object} options
 * @param {String} name
 * @param {Function} hook
 */

function injectHook (options, name, hook) {
  var existing = options[name]
  options[name] = existing
    ? Array.isArray(existing)
      ? existing.concat(hook)
      : [existing, hook]
    : [hook]
}

/**
 * Update a hot component.
 *
 * @param {String} id
 * @param {Object|null} newOptions
 * @param {String|null} newTemplate
 */

exports.update = function (id, newOptions, newTemplate) {
  var record = map[id]
  // force full-reload if an instance of the component is active but is not
  // managed by a view
  if (!record || (record.instances.length && !record.views.length)) {
    console.log('[HMR] Root or manually-mounted instance modified. Full reload may be required.')
    if (!isBrowserify) {
      window.location.reload()
    } else {
      // browserify-hmr somehow sends incomplete bundle if we reload here
      return
    }
  }
  if (!isBrowserify) {
    // browserify-hmr already logs this
    console.log('[HMR] Updating component: ' + format(id))
  }
  var Component = record.Component
  // update constructor
  if (newOptions) {
    // in case the user exports a constructor
    Component = record.Component = typeof newOptions === 'function'
      ? newOptions
      : Vue.extend(newOptions)
    makeOptionsHot(id, Component.options)
  }
  if (newTemplate) {
    Component.options.template = newTemplate
  }
  // handle recursive lookup
  if (Component.options.name) {
    Component.options.components[Component.options.name] = Component
  }
  // reset constructor cached linker
  Component.linker = null
  // reload all views
  record.views.forEach(function (view) {
    updateView(view, Component)
  })
  // flush devtools
  if (window.__VUE_DEVTOOLS_GLOBAL_HOOK__) {
    window.__VUE_DEVTOOLS_GLOBAL_HOOK__.emit('flush')
  }
}

/**
 * Update a component view instance
 *
 * @param {Directive} view
 * @param {Function} Component
 */

function updateView (view, Component) {
  if (!view._bound) {
    return
  }
  view.Component = Component
  view.hotUpdating = true
  // disable transitions
  view.vm._isCompiled = false
  // save state
  var state = extractState(view.childVM)
  // remount, make sure to disable keep-alive
  var keepAlive = view.keepAlive
  view.keepAlive = false
  view.mountComponent()
  view.keepAlive = keepAlive
  // restore state
  restoreState(view.childVM, state, true)
  // re-eanble transitions
  view.vm._isCompiled = true
  view.hotUpdating = false
}

/**
 * Extract state from a Vue instance.
 *
 * @param {Vue} vm
 * @return {Object}
 */

function extractState (vm) {
  return {
    cid: vm.constructor.cid,
    data: vm.$data,
    children: vm.$children.map(extractState)
  }
}

/**
 * Restore state to a reloaded Vue instance.
 *
 * @param {Vue} vm
 * @param {Object} state
 */

function restoreState (vm, state, isRoot) {
  var oldAsyncConfig
  if (isRoot) {
    // set Vue into sync mode during state rehydration
    oldAsyncConfig = Vue.config.async
    Vue.config.async = false
  }
  // actual restore
  if (isRoot || !vm._props) {
    vm.$data = state.data
  } else {
    Object.keys(state.data).forEach(function (key) {
      if (!vm._props[key]) {
        // for non-root, only restore non-props fields
        vm.$data[key] = state.data[key]
      }
    })
  }
  // verify child consistency
  var hasSameChildren = vm.$children.every(function (c, i) {
    return state.children[i] && state.children[i].cid === c.constructor.cid
  })
  if (hasSameChildren) {
    // rehydrate children
    vm.$children.forEach(function (c, i) {
      restoreState(c, state.children[i])
    })
  }
  if (isRoot) {
    Vue.config.async = oldAsyncConfig
  }
}

function format (id) {
  var match = id.match(/[^\/]+\.vue$/)
  return match ? match[0] : id
}

},{}],12:[function(require,module,exports){
/*!
 * vue-router v0.7.13
 * (c) 2016 Evan You
 * Released under the MIT License.
 */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  global.VueRouter = factory();
}(this, function () { 'use strict';

  var babelHelpers = {};

  babelHelpers.classCallCheck = function (instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  };
  function Target(path, matcher, delegate) {
    this.path = path;
    this.matcher = matcher;
    this.delegate = delegate;
  }

  Target.prototype = {
    to: function to(target, callback) {
      var delegate = this.delegate;

      if (delegate && delegate.willAddRoute) {
        target = delegate.willAddRoute(this.matcher.target, target);
      }

      this.matcher.add(this.path, target);

      if (callback) {
        if (callback.length === 0) {
          throw new Error("You must have an argument in the function passed to `to`");
        }
        this.matcher.addChild(this.path, target, callback, this.delegate);
      }
      return this;
    }
  };

  function Matcher(target) {
    this.routes = {};
    this.children = {};
    this.target = target;
  }

  Matcher.prototype = {
    add: function add(path, handler) {
      this.routes[path] = handler;
    },

    addChild: function addChild(path, target, callback, delegate) {
      var matcher = new Matcher(target);
      this.children[path] = matcher;

      var match = generateMatch(path, matcher, delegate);

      if (delegate && delegate.contextEntered) {
        delegate.contextEntered(target, match);
      }

      callback(match);
    }
  };

  function generateMatch(startingPath, matcher, delegate) {
    return function (path, nestedCallback) {
      var fullPath = startingPath + path;

      if (nestedCallback) {
        nestedCallback(generateMatch(fullPath, matcher, delegate));
      } else {
        return new Target(startingPath + path, matcher, delegate);
      }
    };
  }

  function addRoute(routeArray, path, handler) {
    var len = 0;
    for (var i = 0, l = routeArray.length; i < l; i++) {
      len += routeArray[i].path.length;
    }

    path = path.substr(len);
    var route = { path: path, handler: handler };
    routeArray.push(route);
  }

  function eachRoute(baseRoute, matcher, callback, binding) {
    var routes = matcher.routes;

    for (var path in routes) {
      if (routes.hasOwnProperty(path)) {
        var routeArray = baseRoute.slice();
        addRoute(routeArray, path, routes[path]);

        if (matcher.children[path]) {
          eachRoute(routeArray, matcher.children[path], callback, binding);
        } else {
          callback.call(binding, routeArray);
        }
      }
    }
  }

  function map (callback, addRouteCallback) {
    var matcher = new Matcher();

    callback(generateMatch("", matcher, this.delegate));

    eachRoute([], matcher, function (route) {
      if (addRouteCallback) {
        addRouteCallback(this, route);
      } else {
        this.add(route);
      }
    }, this);
  }

  var specials = ['/', '.', '*', '+', '?', '|', '(', ')', '[', ']', '{', '}', '\\'];

  var escapeRegex = new RegExp('(\\' + specials.join('|\\') + ')', 'g');

  var noWarning = false;
  function warn(msg) {
    if (!noWarning && typeof console !== 'undefined') {
      console.error('[vue-router] ' + msg);
    }
  }

  function tryDecode(uri, asComponent) {
    try {
      return asComponent ? decodeURIComponent(uri) : decodeURI(uri);
    } catch (e) {
      warn('malformed URI' + (asComponent ? ' component: ' : ': ') + uri);
    }
  }

  function isArray(test) {
    return Object.prototype.toString.call(test) === "[object Array]";
  }

  // A Segment represents a segment in the original route description.
  // Each Segment type provides an `eachChar` and `regex` method.
  //
  // The `eachChar` method invokes the callback with one or more character
  // specifications. A character specification consumes one or more input
  // characters.
  //
  // The `regex` method returns a regex fragment for the segment. If the
  // segment is a dynamic of star segment, the regex fragment also includes
  // a capture.
  //
  // A character specification contains:
  //
  // * `validChars`: a String with a list of all valid characters, or
  // * `invalidChars`: a String with a list of all invalid characters
  // * `repeat`: true if the character specification can repeat

  function StaticSegment(string) {
    this.string = string;
  }
  StaticSegment.prototype = {
    eachChar: function eachChar(callback) {
      var string = this.string,
          ch;

      for (var i = 0, l = string.length; i < l; i++) {
        ch = string.charAt(i);
        callback({ validChars: ch });
      }
    },

    regex: function regex() {
      return this.string.replace(escapeRegex, '\\$1');
    },

    generate: function generate() {
      return this.string;
    }
  };

  function DynamicSegment(name) {
    this.name = name;
  }
  DynamicSegment.prototype = {
    eachChar: function eachChar(callback) {
      callback({ invalidChars: "/", repeat: true });
    },

    regex: function regex() {
      return "([^/]+)";
    },

    generate: function generate(params) {
      var val = params[this.name];
      return val == null ? ":" + this.name : val;
    }
  };

  function StarSegment(name) {
    this.name = name;
  }
  StarSegment.prototype = {
    eachChar: function eachChar(callback) {
      callback({ invalidChars: "", repeat: true });
    },

    regex: function regex() {
      return "(.+)";
    },

    generate: function generate(params) {
      var val = params[this.name];
      return val == null ? ":" + this.name : val;
    }
  };

  function EpsilonSegment() {}
  EpsilonSegment.prototype = {
    eachChar: function eachChar() {},
    regex: function regex() {
      return "";
    },
    generate: function generate() {
      return "";
    }
  };

  function parse(route, names, specificity) {
    // normalize route as not starting with a "/". Recognition will
    // also normalize.
    if (route.charAt(0) === "/") {
      route = route.substr(1);
    }

    var segments = route.split("/"),
        results = [];

    // A routes has specificity determined by the order that its different segments
    // appear in. This system mirrors how the magnitude of numbers written as strings
    // works.
    // Consider a number written as: "abc". An example would be "200". Any other number written
    // "xyz" will be smaller than "abc" so long as `a > z`. For instance, "199" is smaller
    // then "200", even though "y" and "z" (which are both 9) are larger than "0" (the value
    // of (`b` and `c`). This is because the leading symbol, "2", is larger than the other
    // leading symbol, "1".
    // The rule is that symbols to the left carry more weight than symbols to the right
    // when a number is written out as a string. In the above strings, the leading digit
    // represents how many 100's are in the number, and it carries more weight than the middle
    // number which represents how many 10's are in the number.
    // This system of number magnitude works well for route specificity, too. A route written as
    // `a/b/c` will be more specific than `x/y/z` as long as `a` is more specific than
    // `x`, irrespective of the other parts.
    // Because of this similarity, we assign each type of segment a number value written as a
    // string. We can find the specificity of compound routes by concatenating these strings
    // together, from left to right. After we have looped through all of the segments,
    // we convert the string to a number.
    specificity.val = '';

    for (var i = 0, l = segments.length; i < l; i++) {
      var segment = segments[i],
          match;

      if (match = segment.match(/^:([^\/]+)$/)) {
        results.push(new DynamicSegment(match[1]));
        names.push(match[1]);
        specificity.val += '3';
      } else if (match = segment.match(/^\*([^\/]+)$/)) {
        results.push(new StarSegment(match[1]));
        specificity.val += '2';
        names.push(match[1]);
      } else if (segment === "") {
        results.push(new EpsilonSegment());
        specificity.val += '1';
      } else {
        results.push(new StaticSegment(segment));
        specificity.val += '4';
      }
    }

    specificity.val = +specificity.val;

    return results;
  }

  // A State has a character specification and (`charSpec`) and a list of possible
  // subsequent states (`nextStates`).
  //
  // If a State is an accepting state, it will also have several additional
  // properties:
  //
  // * `regex`: A regular expression that is used to extract parameters from paths
  //   that reached this accepting state.
  // * `handlers`: Information on how to convert the list of captures into calls
  //   to registered handlers with the specified parameters
  // * `types`: How many static, dynamic or star segments in this route. Used to
  //   decide which route to use if multiple registered routes match a path.
  //
  // Currently, State is implemented naively by looping over `nextStates` and
  // comparing a character specification against a character. A more efficient
  // implementation would use a hash of keys pointing at one or more next states.

  function State(charSpec) {
    this.charSpec = charSpec;
    this.nextStates = [];
  }

  State.prototype = {
    get: function get(charSpec) {
      var nextStates = this.nextStates;

      for (var i = 0, l = nextStates.length; i < l; i++) {
        var child = nextStates[i];

        var isEqual = child.charSpec.validChars === charSpec.validChars;
        isEqual = isEqual && child.charSpec.invalidChars === charSpec.invalidChars;

        if (isEqual) {
          return child;
        }
      }
    },

    put: function put(charSpec) {
      var state;

      // If the character specification already exists in a child of the current
      // state, just return that state.
      if (state = this.get(charSpec)) {
        return state;
      }

      // Make a new state for the character spec
      state = new State(charSpec);

      // Insert the new state as a child of the current state
      this.nextStates.push(state);

      // If this character specification repeats, insert the new state as a child
      // of itself. Note that this will not trigger an infinite loop because each
      // transition during recognition consumes a character.
      if (charSpec.repeat) {
        state.nextStates.push(state);
      }

      // Return the new state
      return state;
    },

    // Find a list of child states matching the next character
    match: function match(ch) {
      // DEBUG "Processing `" + ch + "`:"
      var nextStates = this.nextStates,
          child,
          charSpec,
          chars;

      // DEBUG "  " + debugState(this)
      var returned = [];

      for (var i = 0, l = nextStates.length; i < l; i++) {
        child = nextStates[i];

        charSpec = child.charSpec;

        if (typeof (chars = charSpec.validChars) !== 'undefined') {
          if (chars.indexOf(ch) !== -1) {
            returned.push(child);
          }
        } else if (typeof (chars = charSpec.invalidChars) !== 'undefined') {
          if (chars.indexOf(ch) === -1) {
            returned.push(child);
          }
        }
      }

      return returned;
    }

    /** IF DEBUG
    , debug: function() {
      var charSpec = this.charSpec,
          debug = "[",
          chars = charSpec.validChars || charSpec.invalidChars;
       if (charSpec.invalidChars) { debug += "^"; }
      debug += chars;
      debug += "]";
       if (charSpec.repeat) { debug += "+"; }
       return debug;
    }
    END IF **/
  };

  /** IF DEBUG
  function debug(log) {
    console.log(log);
  }

  function debugState(state) {
    return state.nextStates.map(function(n) {
      if (n.nextStates.length === 0) { return "( " + n.debug() + " [accepting] )"; }
      return "( " + n.debug() + " <then> " + n.nextStates.map(function(s) { return s.debug() }).join(" or ") + " )";
    }).join(", ")
  }
  END IF **/

  // Sort the routes by specificity
  function sortSolutions(states) {
    return states.sort(function (a, b) {
      return b.specificity.val - a.specificity.val;
    });
  }

  function recognizeChar(states, ch) {
    var nextStates = [];

    for (var i = 0, l = states.length; i < l; i++) {
      var state = states[i];

      nextStates = nextStates.concat(state.match(ch));
    }

    return nextStates;
  }

  var oCreate = Object.create || function (proto) {
    function F() {}
    F.prototype = proto;
    return new F();
  };

  function RecognizeResults(queryParams) {
    this.queryParams = queryParams || {};
  }
  RecognizeResults.prototype = oCreate({
    splice: Array.prototype.splice,
    slice: Array.prototype.slice,
    push: Array.prototype.push,
    length: 0,
    queryParams: null
  });

  function findHandler(state, path, queryParams) {
    var handlers = state.handlers,
        regex = state.regex;
    var captures = path.match(regex),
        currentCapture = 1;
    var result = new RecognizeResults(queryParams);

    for (var i = 0, l = handlers.length; i < l; i++) {
      var handler = handlers[i],
          names = handler.names,
          params = {};

      for (var j = 0, m = names.length; j < m; j++) {
        params[names[j]] = captures[currentCapture++];
      }

      result.push({ handler: handler.handler, params: params, isDynamic: !!names.length });
    }

    return result;
  }

  function addSegment(currentState, segment) {
    segment.eachChar(function (ch) {
      var state;

      currentState = currentState.put(ch);
    });

    return currentState;
  }

  function decodeQueryParamPart(part) {
    // http://www.w3.org/TR/html401/interact/forms.html#h-17.13.4.1
    part = part.replace(/\+/gm, '%20');
    return tryDecode(part, true);
  }

  // The main interface

  var RouteRecognizer = function RouteRecognizer() {
    this.rootState = new State();
    this.names = {};
  };

  RouteRecognizer.prototype = {
    add: function add(routes, options) {
      var currentState = this.rootState,
          regex = "^",
          specificity = {},
          handlers = [],
          allSegments = [],
          name;

      var isEmpty = true;

      for (var i = 0, l = routes.length; i < l; i++) {
        var route = routes[i],
            names = [];

        var segments = parse(route.path, names, specificity);

        allSegments = allSegments.concat(segments);

        for (var j = 0, m = segments.length; j < m; j++) {
          var segment = segments[j];

          if (segment instanceof EpsilonSegment) {
            continue;
          }

          isEmpty = false;

          // Add a "/" for the new segment
          currentState = currentState.put({ validChars: "/" });
          regex += "/";

          // Add a representation of the segment to the NFA and regex
          currentState = addSegment(currentState, segment);
          regex += segment.regex();
        }

        var handler = { handler: route.handler, names: names };
        handlers.push(handler);
      }

      if (isEmpty) {
        currentState = currentState.put({ validChars: "/" });
        regex += "/";
      }

      currentState.handlers = handlers;
      currentState.regex = new RegExp(regex + "$");
      currentState.specificity = specificity;

      if (name = options && options.as) {
        this.names[name] = {
          segments: allSegments,
          handlers: handlers
        };
      }
    },

    handlersFor: function handlersFor(name) {
      var route = this.names[name],
          result = [];
      if (!route) {
        throw new Error("There is no route named " + name);
      }

      for (var i = 0, l = route.handlers.length; i < l; i++) {
        result.push(route.handlers[i]);
      }

      return result;
    },

    hasRoute: function hasRoute(name) {
      return !!this.names[name];
    },

    generate: function generate(name, params) {
      var route = this.names[name],
          output = "";
      if (!route) {
        throw new Error("There is no route named " + name);
      }

      var segments = route.segments;

      for (var i = 0, l = segments.length; i < l; i++) {
        var segment = segments[i];

        if (segment instanceof EpsilonSegment) {
          continue;
        }

        output += "/";
        output += segment.generate(params);
      }

      if (output.charAt(0) !== '/') {
        output = '/' + output;
      }

      if (params && params.queryParams) {
        output += this.generateQueryString(params.queryParams);
      }

      return output;
    },

    generateQueryString: function generateQueryString(params) {
      var pairs = [];
      var keys = [];
      for (var key in params) {
        if (params.hasOwnProperty(key)) {
          keys.push(key);
        }
      }
      keys.sort();
      for (var i = 0, len = keys.length; i < len; i++) {
        key = keys[i];
        var value = params[key];
        if (value == null) {
          continue;
        }
        var pair = encodeURIComponent(key);
        if (isArray(value)) {
          for (var j = 0, l = value.length; j < l; j++) {
            var arrayPair = key + '[]' + '=' + encodeURIComponent(value[j]);
            pairs.push(arrayPair);
          }
        } else {
          pair += "=" + encodeURIComponent(value);
          pairs.push(pair);
        }
      }

      if (pairs.length === 0) {
        return '';
      }

      return "?" + pairs.join("&");
    },

    parseQueryString: function parseQueryString(queryString) {
      var pairs = queryString.split("&"),
          queryParams = {};
      for (var i = 0; i < pairs.length; i++) {
        var pair = pairs[i].split('='),
            key = decodeQueryParamPart(pair[0]),
            keyLength = key.length,
            isArray = false,
            value;
        if (pair.length === 1) {
          value = 'true';
        } else {
          //Handle arrays
          if (keyLength > 2 && key.slice(keyLength - 2) === '[]') {
            isArray = true;
            key = key.slice(0, keyLength - 2);
            if (!queryParams[key]) {
              queryParams[key] = [];
            }
          }
          value = pair[1] ? decodeQueryParamPart(pair[1]) : '';
        }
        if (isArray) {
          queryParams[key].push(value);
        } else {
          queryParams[key] = value;
        }
      }
      return queryParams;
    },

    recognize: function recognize(path, silent) {
      noWarning = silent;
      var states = [this.rootState],
          pathLen,
          i,
          l,
          queryStart,
          queryParams = {},
          isSlashDropped = false;

      queryStart = path.indexOf('?');
      if (queryStart !== -1) {
        var queryString = path.substr(queryStart + 1, path.length);
        path = path.substr(0, queryStart);
        if (queryString) {
          queryParams = this.parseQueryString(queryString);
        }
      }

      path = tryDecode(path);
      if (!path) return;

      // DEBUG GROUP path

      if (path.charAt(0) !== "/") {
        path = "/" + path;
      }

      pathLen = path.length;
      if (pathLen > 1 && path.charAt(pathLen - 1) === "/") {
        path = path.substr(0, pathLen - 1);
        isSlashDropped = true;
      }

      for (i = 0, l = path.length; i < l; i++) {
        states = recognizeChar(states, path.charAt(i));
        if (!states.length) {
          break;
        }
      }

      // END DEBUG GROUP

      var solutions = [];
      for (i = 0, l = states.length; i < l; i++) {
        if (states[i].handlers) {
          solutions.push(states[i]);
        }
      }

      states = sortSolutions(solutions);

      var state = solutions[0];

      if (state && state.handlers) {
        // if a trailing slash was dropped and a star segment is the last segment
        // specified, put the trailing slash back
        if (isSlashDropped && state.regex.source.slice(-5) === "(.+)$") {
          path = path + "/";
        }
        return findHandler(state, path, queryParams);
      }
    }
  };

  RouteRecognizer.prototype.map = map;

  var genQuery = RouteRecognizer.prototype.generateQueryString;

  // export default for holding the Vue reference
  var exports$1 = {};
  /**
   * Warn stuff.
   *
   * @param {String} msg
   */

  function warn$1(msg) {
    /* istanbul ignore next */
    if (typeof console !== 'undefined') {
      console.error('[vue-router] ' + msg);
    }
  }

  /**
   * Resolve a relative path.
   *
   * @param {String} base
   * @param {String} relative
   * @param {Boolean} append
   * @return {String}
   */

  function resolvePath(base, relative, append) {
    var query = base.match(/(\?.*)$/);
    if (query) {
      query = query[1];
      base = base.slice(0, -query.length);
    }
    // a query!
    if (relative.charAt(0) === '?') {
      return base + relative;
    }
    var stack = base.split('/');
    // remove trailing segment if:
    // - not appending
    // - appending to trailing slash (last segment is empty)
    if (!append || !stack[stack.length - 1]) {
      stack.pop();
    }
    // resolve relative path
    var segments = relative.replace(/^\//, '').split('/');
    for (var i = 0; i < segments.length; i++) {
      var segment = segments[i];
      if (segment === '.') {
        continue;
      } else if (segment === '..') {
        stack.pop();
      } else {
        stack.push(segment);
      }
    }
    // ensure leading slash
    if (stack[0] !== '') {
      stack.unshift('');
    }
    return stack.join('/');
  }

  /**
   * Forgiving check for a promise
   *
   * @param {Object} p
   * @return {Boolean}
   */

  function isPromise(p) {
    return p && typeof p.then === 'function';
  }

  /**
   * Retrive a route config field from a component instance
   * OR a component contructor.
   *
   * @param {Function|Vue} component
   * @param {String} name
   * @return {*}
   */

  function getRouteConfig(component, name) {
    var options = component && (component.$options || component.options);
    return options && options.route && options.route[name];
  }

  /**
   * Resolve an async component factory. Have to do a dirty
   * mock here because of Vue core's internal API depends on
   * an ID check.
   *
   * @param {Object} handler
   * @param {Function} cb
   */

  var resolver = undefined;

  function resolveAsyncComponent(handler, cb) {
    if (!resolver) {
      resolver = {
        resolve: exports$1.Vue.prototype._resolveComponent,
        $options: {
          components: {
            _: handler.component
          }
        }
      };
    } else {
      resolver.$options.components._ = handler.component;
    }
    resolver.resolve('_', function (Component) {
      handler.component = Component;
      cb(Component);
    });
  }

  /**
   * Map the dynamic segments in a path to params.
   *
   * @param {String} path
   * @param {Object} params
   * @param {Object} query
   */

  function mapParams(path, params, query) {
    if (params === undefined) params = {};

    path = path.replace(/:([^\/]+)/g, function (_, key) {
      var val = params[key];
      /* istanbul ignore if */
      if (!val) {
        warn$1('param "' + key + '" not found when generating ' + 'path for "' + path + '" with params ' + JSON.stringify(params));
      }
      return val || '';
    });
    if (query) {
      path += genQuery(query);
    }
    return path;
  }

  var hashRE = /#.*$/;

  var HTML5History = (function () {
    function HTML5History(_ref) {
      var root = _ref.root;
      var onChange = _ref.onChange;
      babelHelpers.classCallCheck(this, HTML5History);

      if (root && root !== '/') {
        // make sure there's the starting slash
        if (root.charAt(0) !== '/') {
          root = '/' + root;
        }
        // remove trailing slash
        this.root = root.replace(/\/$/, '');
        this.rootRE = new RegExp('^\\' + this.root);
      } else {
        this.root = null;
      }
      this.onChange = onChange;
      // check base tag
      var baseEl = document.querySelector('base');
      this.base = baseEl && baseEl.getAttribute('href');
    }

    HTML5History.prototype.start = function start() {
      var _this = this;

      this.listener = function (e) {
        var url = location.pathname + location.search;
        if (_this.root) {
          url = url.replace(_this.rootRE, '');
        }
        _this.onChange(url, e && e.state, location.hash);
      };
      window.addEventListener('popstate', this.listener);
      this.listener();
    };

    HTML5History.prototype.stop = function stop() {
      window.removeEventListener('popstate', this.listener);
    };

    HTML5History.prototype.go = function go(path, replace, append) {
      var url = this.formatPath(path, append);
      if (replace) {
        history.replaceState({}, '', url);
      } else {
        // record scroll position by replacing current state
        history.replaceState({
          pos: {
            x: window.pageXOffset,
            y: window.pageYOffset
          }
        }, '', location.href);
        // then push new state
        history.pushState({}, '', url);
      }
      var hashMatch = path.match(hashRE);
      var hash = hashMatch && hashMatch[0];
      path = url
      // strip hash so it doesn't mess up params
      .replace(hashRE, '')
      // remove root before matching
      .replace(this.rootRE, '');
      this.onChange(path, null, hash);
    };

    HTML5History.prototype.formatPath = function formatPath(path, append) {
      return path.charAt(0) === '/'
      // absolute path
      ? this.root ? this.root + '/' + path.replace(/^\//, '') : path : resolvePath(this.base || location.pathname, path, append);
    };

    return HTML5History;
  })();

  var HashHistory = (function () {
    function HashHistory(_ref) {
      var hashbang = _ref.hashbang;
      var onChange = _ref.onChange;
      babelHelpers.classCallCheck(this, HashHistory);

      this.hashbang = hashbang;
      this.onChange = onChange;
    }

    HashHistory.prototype.start = function start() {
      var self = this;
      this.listener = function () {
        var path = location.hash;
        var raw = path.replace(/^#!?/, '');
        // always
        if (raw.charAt(0) !== '/') {
          raw = '/' + raw;
        }
        var formattedPath = self.formatPath(raw);
        if (formattedPath !== path) {
          location.replace(formattedPath);
          return;
        }
        // determine query
        // note it's possible to have queries in both the actual URL
        // and the hash fragment itself.
        var query = location.search && path.indexOf('?') > -1 ? '&' + location.search.slice(1) : location.search;
        self.onChange(path.replace(/^#!?/, '') + query);
      };
      window.addEventListener('hashchange', this.listener);
      this.listener();
    };

    HashHistory.prototype.stop = function stop() {
      window.removeEventListener('hashchange', this.listener);
    };

    HashHistory.prototype.go = function go(path, replace, append) {
      path = this.formatPath(path, append);
      if (replace) {
        location.replace(path);
      } else {
        location.hash = path;
      }
    };

    HashHistory.prototype.formatPath = function formatPath(path, append) {
      var isAbsoloute = path.charAt(0) === '/';
      var prefix = '#' + (this.hashbang ? '!' : '');
      return isAbsoloute ? prefix + path : prefix + resolvePath(location.hash.replace(/^#!?/, ''), path, append);
    };

    return HashHistory;
  })();

  var AbstractHistory = (function () {
    function AbstractHistory(_ref) {
      var onChange = _ref.onChange;
      babelHelpers.classCallCheck(this, AbstractHistory);

      this.onChange = onChange;
      this.currentPath = '/';
    }

    AbstractHistory.prototype.start = function start() {
      this.onChange('/');
    };

    AbstractHistory.prototype.stop = function stop() {
      // noop
    };

    AbstractHistory.prototype.go = function go(path, replace, append) {
      path = this.currentPath = this.formatPath(path, append);
      this.onChange(path);
    };

    AbstractHistory.prototype.formatPath = function formatPath(path, append) {
      return path.charAt(0) === '/' ? path : resolvePath(this.currentPath, path, append);
    };

    return AbstractHistory;
  })();

  /**
   * Determine the reusability of an existing router view.
   *
   * @param {Directive} view
   * @param {Object} handler
   * @param {Transition} transition
   */

  function canReuse(view, handler, transition) {
    var component = view.childVM;
    if (!component || !handler) {
      return false;
    }
    // important: check view.Component here because it may
    // have been changed in activate hook
    if (view.Component !== handler.component) {
      return false;
    }
    var canReuseFn = getRouteConfig(component, 'canReuse');
    return typeof canReuseFn === 'boolean' ? canReuseFn : canReuseFn ? canReuseFn.call(component, {
      to: transition.to,
      from: transition.from
    }) : true; // defaults to true
  }

  /**
   * Check if a component can deactivate.
   *
   * @param {Directive} view
   * @param {Transition} transition
   * @param {Function} next
   */

  function canDeactivate(view, transition, next) {
    var fromComponent = view.childVM;
    var hook = getRouteConfig(fromComponent, 'canDeactivate');
    if (!hook) {
      next();
    } else {
      transition.callHook(hook, fromComponent, next, {
        expectBoolean: true
      });
    }
  }

  /**
   * Check if a component can activate.
   *
   * @param {Object} handler
   * @param {Transition} transition
   * @param {Function} next
   */

  function canActivate(handler, transition, next) {
    resolveAsyncComponent(handler, function (Component) {
      // have to check due to async-ness
      if (transition.aborted) {
        return;
      }
      // determine if this component can be activated
      var hook = getRouteConfig(Component, 'canActivate');
      if (!hook) {
        next();
      } else {
        transition.callHook(hook, null, next, {
          expectBoolean: true
        });
      }
    });
  }

  /**
   * Call deactivate hooks for existing router-views.
   *
   * @param {Directive} view
   * @param {Transition} transition
   * @param {Function} next
   */

  function deactivate(view, transition, next) {
    var component = view.childVM;
    var hook = getRouteConfig(component, 'deactivate');
    if (!hook) {
      next();
    } else {
      transition.callHooks(hook, component, next);
    }
  }

  /**
   * Activate / switch component for a router-view.
   *
   * @param {Directive} view
   * @param {Transition} transition
   * @param {Number} depth
   * @param {Function} [cb]
   */

  function activate(view, transition, depth, cb, reuse) {
    var handler = transition.activateQueue[depth];
    if (!handler) {
      saveChildView(view);
      if (view._bound) {
        view.setComponent(null);
      }
      cb && cb();
      return;
    }

    var Component = view.Component = handler.component;
    var activateHook = getRouteConfig(Component, 'activate');
    var dataHook = getRouteConfig(Component, 'data');
    var waitForData = getRouteConfig(Component, 'waitForData');

    view.depth = depth;
    view.activated = false;

    var component = undefined;
    var loading = !!(dataHook && !waitForData);

    // "reuse" is a flag passed down when the parent view is
    // either reused via keep-alive or as a child of a kept-alive view.
    // of course we can only reuse if the current kept-alive instance
    // is of the correct type.
    reuse = reuse && view.childVM && view.childVM.constructor === Component;

    if (reuse) {
      // just reuse
      component = view.childVM;
      component.$loadingRouteData = loading;
    } else {
      saveChildView(view);

      // unbuild current component. this step also destroys
      // and removes all nested child views.
      view.unbuild(true);

      // build the new component. this will also create the
      // direct child view of the current one. it will register
      // itself as view.childView.
      component = view.build({
        _meta: {
          $loadingRouteData: loading
        },
        created: function created() {
          this._routerView = view;
        }
      });

      // handle keep-alive.
      // when a kept-alive child vm is restored, we need to
      // add its cached child views into the router's view list,
      // and also properly update current view's child view.
      if (view.keepAlive) {
        component.$loadingRouteData = loading;
        var cachedChildView = component._keepAliveRouterView;
        if (cachedChildView) {
          view.childView = cachedChildView;
          component._keepAliveRouterView = null;
        }
      }
    }

    // cleanup the component in case the transition is aborted
    // before the component is ever inserted.
    var cleanup = function cleanup() {
      component.$destroy();
    };

    // actually insert the component and trigger transition
    var insert = function insert() {
      if (reuse) {
        cb && cb();
        return;
      }
      var router = transition.router;
      if (router._rendered || router._transitionOnLoad) {
        view.transition(component);
      } else {
        // no transition on first render, manual transition
        /* istanbul ignore if */
        if (view.setCurrent) {
          // 0.12 compat
          view.setCurrent(component);
        } else {
          // 1.0
          view.childVM = component;
        }
        component.$before(view.anchor, null, false);
      }
      cb && cb();
    };

    var afterData = function afterData() {
      // activate the child view
      if (view.childView) {
        activate(view.childView, transition, depth + 1, null, reuse || view.keepAlive);
      }
      insert();
    };

    // called after activation hook is resolved
    var afterActivate = function afterActivate() {
      view.activated = true;
      if (dataHook && waitForData) {
        // wait until data loaded to insert
        loadData(component, transition, dataHook, afterData, cleanup);
      } else {
        // load data and insert at the same time
        if (dataHook) {
          loadData(component, transition, dataHook);
        }
        afterData();
      }
    };

    if (activateHook) {
      transition.callHooks(activateHook, component, afterActivate, {
        cleanup: cleanup,
        postActivate: true
      });
    } else {
      afterActivate();
    }
  }

  /**
   * Reuse a view, just reload data if necessary.
   *
   * @param {Directive} view
   * @param {Transition} transition
   */

  function reuse(view, transition) {
    var component = view.childVM;
    var dataHook = getRouteConfig(component, 'data');
    if (dataHook) {
      loadData(component, transition, dataHook);
    }
  }

  /**
   * Asynchronously load and apply data to component.
   *
   * @param {Vue} component
   * @param {Transition} transition
   * @param {Function} hook
   * @param {Function} cb
   * @param {Function} cleanup
   */

  function loadData(component, transition, hook, cb, cleanup) {
    component.$loadingRouteData = true;
    transition.callHooks(hook, component, function () {
      component.$loadingRouteData = false;
      component.$emit('route-data-loaded', component);
      cb && cb();
    }, {
      cleanup: cleanup,
      postActivate: true,
      processData: function processData(data) {
        // handle promise sugar syntax
        var promises = [];
        if (isPlainObject(data)) {
          Object.keys(data).forEach(function (key) {
            var val = data[key];
            if (isPromise(val)) {
              promises.push(val.then(function (resolvedVal) {
                component.$set(key, resolvedVal);
              }));
            } else {
              component.$set(key, val);
            }
          });
        }
        if (promises.length) {
          return promises[0].constructor.all(promises);
        }
      }
    });
  }

  /**
   * Save the child view for a kept-alive view so that
   * we can restore it when it is switched back to.
   *
   * @param {Directive} view
   */

  function saveChildView(view) {
    if (view.keepAlive && view.childVM && view.childView) {
      view.childVM._keepAliveRouterView = view.childView;
    }
    view.childView = null;
  }

  /**
   * Check plain object.
   *
   * @param {*} val
   */

  function isPlainObject(val) {
    return Object.prototype.toString.call(val) === '[object Object]';
  }

  /**
   * A RouteTransition object manages the pipeline of a
   * router-view switching process. This is also the object
   * passed into user route hooks.
   *
   * @param {Router} router
   * @param {Route} to
   * @param {Route} from
   */

  var RouteTransition = (function () {
    function RouteTransition(router, to, from) {
      babelHelpers.classCallCheck(this, RouteTransition);

      this.router = router;
      this.to = to;
      this.from = from;
      this.next = null;
      this.aborted = false;
      this.done = false;
    }

    /**
     * Abort current transition and return to previous location.
     */

    RouteTransition.prototype.abort = function abort() {
      if (!this.aborted) {
        this.aborted = true;
        // if the root path throws an error during validation
        // on initial load, it gets caught in an infinite loop.
        var abortingOnLoad = !this.from.path && this.to.path === '/';
        if (!abortingOnLoad) {
          this.router.replace(this.from.path || '/');
        }
      }
    };

    /**
     * Abort current transition and redirect to a new location.
     *
     * @param {String} path
     */

    RouteTransition.prototype.redirect = function redirect(path) {
      if (!this.aborted) {
        this.aborted = true;
        if (typeof path === 'string') {
          path = mapParams(path, this.to.params, this.to.query);
        } else {
          path.params = path.params || this.to.params;
          path.query = path.query || this.to.query;
        }
        this.router.replace(path);
      }
    };

    /**
     * A router view transition's pipeline can be described as
     * follows, assuming we are transitioning from an existing
     * <router-view> chain [Component A, Component B] to a new
     * chain [Component A, Component C]:
     *
     *  A    A
     *  | => |
     *  B    C
     *
     * 1. Reusablity phase:
     *   -> canReuse(A, A)
     *   -> canReuse(B, C)
     *   -> determine new queues:
     *      - deactivation: [B]
     *      - activation: [C]
     *
     * 2. Validation phase:
     *   -> canDeactivate(B)
     *   -> canActivate(C)
     *
     * 3. Activation phase:
     *   -> deactivate(B)
     *   -> activate(C)
     *
     * Each of these steps can be asynchronous, and any
     * step can potentially abort the transition.
     *
     * @param {Function} cb
     */

    RouteTransition.prototype.start = function start(cb) {
      var transition = this;

      // determine the queue of views to deactivate
      var deactivateQueue = [];
      var view = this.router._rootView;
      while (view) {
        deactivateQueue.unshift(view);
        view = view.childView;
      }
      var reverseDeactivateQueue = deactivateQueue.slice().reverse();

      // determine the queue of route handlers to activate
      var activateQueue = this.activateQueue = toArray(this.to.matched).map(function (match) {
        return match.handler;
      });

      // 1. Reusability phase
      var i = undefined,
          reuseQueue = undefined;
      for (i = 0; i < reverseDeactivateQueue.length; i++) {
        if (!canReuse(reverseDeactivateQueue[i], activateQueue[i], transition)) {
          break;
        }
      }
      if (i > 0) {
        reuseQueue = reverseDeactivateQueue.slice(0, i);
        deactivateQueue = reverseDeactivateQueue.slice(i).reverse();
        activateQueue = activateQueue.slice(i);
      }

      // 2. Validation phase
      transition.runQueue(deactivateQueue, canDeactivate, function () {
        transition.runQueue(activateQueue, canActivate, function () {
          transition.runQueue(deactivateQueue, deactivate, function () {
            // 3. Activation phase

            // Update router current route
            transition.router._onTransitionValidated(transition);

            // trigger reuse for all reused views
            reuseQueue && reuseQueue.forEach(function (view) {
              return reuse(view, transition);
            });

            // the root of the chain that needs to be replaced
            // is the top-most non-reusable view.
            if (deactivateQueue.length) {
              var _view = deactivateQueue[deactivateQueue.length - 1];
              var depth = reuseQueue ? reuseQueue.length : 0;
              activate(_view, transition, depth, cb);
            } else {
              cb();
            }
          });
        });
      });
    };

    /**
     * Asynchronously and sequentially apply a function to a
     * queue.
     *
     * @param {Array} queue
     * @param {Function} fn
     * @param {Function} cb
     */

    RouteTransition.prototype.runQueue = function runQueue(queue, fn, cb) {
      var transition = this;
      step(0);
      function step(index) {
        if (index >= queue.length) {
          cb();
        } else {
          fn(queue[index], transition, function () {
            step(index + 1);
          });
        }
      }
    };

    /**
     * Call a user provided route transition hook and handle
     * the response (e.g. if the user returns a promise).
     *
     * If the user neither expects an argument nor returns a
     * promise, the hook is assumed to be synchronous.
     *
     * @param {Function} hook
     * @param {*} [context]
     * @param {Function} [cb]
     * @param {Object} [options]
     *                 - {Boolean} expectBoolean
     *                 - {Boolean} postActive
     *                 - {Function} processData
     *                 - {Function} cleanup
     */

    RouteTransition.prototype.callHook = function callHook(hook, context, cb) {
      var _ref = arguments.length <= 3 || arguments[3] === undefined ? {} : arguments[3];

      var _ref$expectBoolean = _ref.expectBoolean;
      var expectBoolean = _ref$expectBoolean === undefined ? false : _ref$expectBoolean;
      var _ref$postActivate = _ref.postActivate;
      var postActivate = _ref$postActivate === undefined ? false : _ref$postActivate;
      var processData = _ref.processData;
      var cleanup = _ref.cleanup;

      var transition = this;
      var nextCalled = false;

      // abort the transition
      var abort = function abort() {
        cleanup && cleanup();
        transition.abort();
      };

      // handle errors
      var onError = function onError(err) {
        postActivate ? next() : abort();
        if (err && !transition.router._suppress) {
          warn$1('Uncaught error during transition: ');
          throw err instanceof Error ? err : new Error(err);
        }
      };

      // since promise swallows errors, we have to
      // throw it in the next tick...
      var onPromiseError = function onPromiseError(err) {
        try {
          onError(err);
        } catch (e) {
          setTimeout(function () {
            throw e;
          }, 0);
        }
      };

      // advance the transition to the next step
      var next = function next() {
        if (nextCalled) {
          warn$1('transition.next() should be called only once.');
          return;
        }
        nextCalled = true;
        if (transition.aborted) {
          cleanup && cleanup();
          return;
        }
        cb && cb();
      };

      var nextWithBoolean = function nextWithBoolean(res) {
        if (typeof res === 'boolean') {
          res ? next() : abort();
        } else if (isPromise(res)) {
          res.then(function (ok) {
            ok ? next() : abort();
          }, onPromiseError);
        } else if (!hook.length) {
          next();
        }
      };

      var nextWithData = function nextWithData(data) {
        var res = undefined;
        try {
          res = processData(data);
        } catch (err) {
          return onError(err);
        }
        if (isPromise(res)) {
          res.then(next, onPromiseError);
        } else {
          next();
        }
      };

      // expose a clone of the transition object, so that each
      // hook gets a clean copy and prevent the user from
      // messing with the internals.
      var exposed = {
        to: transition.to,
        from: transition.from,
        abort: abort,
        next: processData ? nextWithData : next,
        redirect: function redirect() {
          transition.redirect.apply(transition, arguments);
        }
      };

      // actually call the hook
      var res = undefined;
      try {
        res = hook.call(context, exposed);
      } catch (err) {
        return onError(err);
      }

      if (expectBoolean) {
        // boolean hooks
        nextWithBoolean(res);
      } else if (isPromise(res)) {
        // promise
        if (processData) {
          res.then(nextWithData, onPromiseError);
        } else {
          res.then(next, onPromiseError);
        }
      } else if (processData && isPlainOjbect(res)) {
        // data promise sugar
        nextWithData(res);
      } else if (!hook.length) {
        next();
      }
    };

    /**
     * Call a single hook or an array of async hooks in series.
     *
     * @param {Array} hooks
     * @param {*} context
     * @param {Function} cb
     * @param {Object} [options]
     */

    RouteTransition.prototype.callHooks = function callHooks(hooks, context, cb, options) {
      var _this = this;

      if (Array.isArray(hooks)) {
        this.runQueue(hooks, function (hook, _, next) {
          if (!_this.aborted) {
            _this.callHook(hook, context, next, options);
          }
        }, cb);
      } else {
        this.callHook(hooks, context, cb, options);
      }
    };

    return RouteTransition;
  })();

  function isPlainOjbect(val) {
    return Object.prototype.toString.call(val) === '[object Object]';
  }

  function toArray(val) {
    return val ? Array.prototype.slice.call(val) : [];
  }

  var internalKeysRE = /^(component|subRoutes|fullPath)$/;

  /**
   * Route Context Object
   *
   * @param {String} path
   * @param {Router} router
   */

  var Route = function Route(path, router) {
    var _this = this;

    babelHelpers.classCallCheck(this, Route);

    var matched = router._recognizer.recognize(path);
    if (matched) {
      // copy all custom fields from route configs
      [].forEach.call(matched, function (match) {
        for (var key in match.handler) {
          if (!internalKeysRE.test(key)) {
            _this[key] = match.handler[key];
          }
        }
      });
      // set query and params
      this.query = matched.queryParams;
      this.params = [].reduce.call(matched, function (prev, cur) {
        if (cur.params) {
          for (var key in cur.params) {
            prev[key] = cur.params[key];
          }
        }
        return prev;
      }, {});
    }
    // expose path and router
    this.path = path;
    // for internal use
    this.matched = matched || router._notFoundHandler;
    // internal reference to router
    Object.defineProperty(this, 'router', {
      enumerable: false,
      value: router
    });
    // Important: freeze self to prevent observation
    Object.freeze(this);
  };

  function applyOverride (Vue) {
    var _Vue$util = Vue.util;
    var extend = _Vue$util.extend;
    var isArray = _Vue$util.isArray;
    var defineReactive = _Vue$util.defineReactive;

    // override Vue's init and destroy process to keep track of router instances
    var init = Vue.prototype._init;
    Vue.prototype._init = function (options) {
      options = options || {};
      var root = options._parent || options.parent || this;
      var router = root.$router;
      var route = root.$route;
      if (router) {
        // expose router
        this.$router = router;
        router._children.push(this);
        /* istanbul ignore if */
        if (this._defineMeta) {
          // 0.12
          this._defineMeta('$route', route);
        } else {
          // 1.0
          defineReactive(this, '$route', route);
        }
      }
      init.call(this, options);
    };

    var destroy = Vue.prototype._destroy;
    Vue.prototype._destroy = function () {
      if (!this._isBeingDestroyed && this.$router) {
        this.$router._children.$remove(this);
      }
      destroy.apply(this, arguments);
    };

    // 1.0 only: enable route mixins
    var strats = Vue.config.optionMergeStrategies;
    var hooksToMergeRE = /^(data|activate|deactivate)$/;

    if (strats) {
      strats.route = function (parentVal, childVal) {
        if (!childVal) return parentVal;
        if (!parentVal) return childVal;
        var ret = {};
        extend(ret, parentVal);
        for (var key in childVal) {
          var a = ret[key];
          var b = childVal[key];
          // for data, activate and deactivate, we need to merge them into
          // arrays similar to lifecycle hooks.
          if (a && hooksToMergeRE.test(key)) {
            ret[key] = (isArray(a) ? a : [a]).concat(b);
          } else {
            ret[key] = b;
          }
        }
        return ret;
      };
    }
  }

  function View (Vue) {

    var _ = Vue.util;
    var componentDef =
    // 0.12
    Vue.directive('_component') ||
    // 1.0
    Vue.internalDirectives.component;
    // <router-view> extends the internal component directive
    var viewDef = _.extend({}, componentDef);

    // with some overrides
    _.extend(viewDef, {

      _isRouterView: true,

      bind: function bind() {
        var route = this.vm.$route;
        /* istanbul ignore if */
        if (!route) {
          warn$1('<router-view> can only be used inside a ' + 'router-enabled app.');
          return;
        }
        // force dynamic directive so v-component doesn't
        // attempt to build right now
        this._isDynamicLiteral = true;
        // finally, init by delegating to v-component
        componentDef.bind.call(this);

        // locate the parent view
        var parentView = undefined;
        var parent = this.vm;
        while (parent) {
          if (parent._routerView) {
            parentView = parent._routerView;
            break;
          }
          parent = parent.$parent;
        }
        if (parentView) {
          // register self as a child of the parent view,
          // instead of activating now. This is so that the
          // child's activate hook is called after the
          // parent's has resolved.
          this.parentView = parentView;
          parentView.childView = this;
        } else {
          // this is the root view!
          var router = route.router;
          router._rootView = this;
        }

        // handle late-rendered view
        // two possibilities:
        // 1. root view rendered after transition has been
        //    validated;
        // 2. child view rendered after parent view has been
        //    activated.
        var transition = route.router._currentTransition;
        if (!parentView && transition.done || parentView && parentView.activated) {
          var depth = parentView ? parentView.depth + 1 : 0;
          activate(this, transition, depth);
        }
      },

      unbind: function unbind() {
        if (this.parentView) {
          this.parentView.childView = null;
        }
        componentDef.unbind.call(this);
      }
    });

    Vue.elementDirective('router-view', viewDef);
  }

  var trailingSlashRE = /\/$/;
  var regexEscapeRE = /[-.*+?^${}()|[\]\/\\]/g;
  var queryStringRE = /\?.*$/;

  // install v-link, which provides navigation support for
  // HTML5 history mode
  function Link (Vue) {
    var _Vue$util = Vue.util;
    var _bind = _Vue$util.bind;
    var isObject = _Vue$util.isObject;
    var addClass = _Vue$util.addClass;
    var removeClass = _Vue$util.removeClass;

    var onPriority = Vue.directive('on').priority;
    var LINK_UPDATE = '__vue-router-link-update__';

    var activeId = 0;

    Vue.directive('link-active', {
      priority: 9999,
      bind: function bind() {
        var _this = this;

        var id = String(activeId++);
        // collect v-links contained within this element.
        // we need do this here before the parent-child relationship
        // gets messed up by terminal directives (if, for, components)
        var childLinks = this.el.querySelectorAll('[v-link]');
        for (var i = 0, l = childLinks.length; i < l; i++) {
          var link = childLinks[i];
          var existingId = link.getAttribute(LINK_UPDATE);
          var value = existingId ? existingId + ',' + id : id;
          // leave a mark on the link element which can be persisted
          // through fragment clones.
          link.setAttribute(LINK_UPDATE, value);
        }
        this.vm.$on(LINK_UPDATE, this.cb = function (link, path) {
          if (link.activeIds.indexOf(id) > -1) {
            link.updateClasses(path, _this.el);
          }
        });
      },
      unbind: function unbind() {
        this.vm.$off(LINK_UPDATE, this.cb);
      }
    });

    Vue.directive('link', {
      priority: onPriority - 2,

      bind: function bind() {
        var vm = this.vm;
        /* istanbul ignore if */
        if (!vm.$route) {
          warn$1('v-link can only be used inside a router-enabled app.');
          return;
        }
        this.router = vm.$route.router;
        // update things when the route changes
        this.unwatch = vm.$watch('$route', _bind(this.onRouteUpdate, this));
        // check v-link-active ids
        var activeIds = this.el.getAttribute(LINK_UPDATE);
        if (activeIds) {
          this.el.removeAttribute(LINK_UPDATE);
          this.activeIds = activeIds.split(',');
        }
        // no need to handle click if link expects to be opened
        // in a new window/tab.
        /* istanbul ignore if */
        if (this.el.tagName === 'A' && this.el.getAttribute('target') === '_blank') {
          return;
        }
        // handle click
        this.handler = _bind(this.onClick, this);
        this.el.addEventListener('click', this.handler);
      },

      update: function update(target) {
        this.target = target;
        if (isObject(target)) {
          this.append = target.append;
          this.exact = target.exact;
          this.prevActiveClass = this.activeClass;
          this.activeClass = target.activeClass;
        }
        this.onRouteUpdate(this.vm.$route);
      },

      onClick: function onClick(e) {
        // don't redirect with control keys
        /* istanbul ignore if */
        if (e.metaKey || e.ctrlKey || e.shiftKey) return;
        // don't redirect when preventDefault called
        /* istanbul ignore if */
        if (e.defaultPrevented) return;
        // don't redirect on right click
        /* istanbul ignore if */
        if (e.button !== 0) return;

        var target = this.target;
        if (target) {
          // v-link with expression, just go
          e.preventDefault();
          this.router.go(target);
        } else {
          // no expression, delegate for an <a> inside
          var el = e.target;
          while (el.tagName !== 'A' && el !== this.el) {
            el = el.parentNode;
          }
          if (el.tagName === 'A' && sameOrigin(el)) {
            e.preventDefault();
            var path = el.pathname;
            if (this.router.history.root) {
              path = path.replace(this.router.history.rootRE, '');
            }
            this.router.go({
              path: path,
              replace: target && target.replace,
              append: target && target.append
            });
          }
        }
      },

      onRouteUpdate: function onRouteUpdate(route) {
        // router.stringifyPath is dependent on current route
        // and needs to be called again whenver route changes.
        var newPath = this.router.stringifyPath(this.target);
        if (this.path !== newPath) {
          this.path = newPath;
          this.updateActiveMatch();
          this.updateHref();
        }
        if (this.activeIds) {
          this.vm.$emit(LINK_UPDATE, this, route.path);
        } else {
          this.updateClasses(route.path, this.el);
        }
      },

      updateActiveMatch: function updateActiveMatch() {
        this.activeRE = this.path && !this.exact ? new RegExp('^' + this.path.replace(/\/$/, '').replace(queryStringRE, '').replace(regexEscapeRE, '\\$&') + '(\\/|$)') : null;
      },

      updateHref: function updateHref() {
        if (this.el.tagName !== 'A') {
          return;
        }
        var path = this.path;
        var router = this.router;
        var isAbsolute = path.charAt(0) === '/';
        // do not format non-hash relative paths
        var href = path && (router.mode === 'hash' || isAbsolute) ? router.history.formatPath(path, this.append) : path;
        if (href) {
          this.el.href = href;
        } else {
          this.el.removeAttribute('href');
        }
      },

      updateClasses: function updateClasses(path, el) {
        var activeClass = this.activeClass || this.router._linkActiveClass;
        // clear old class
        if (this.prevActiveClass && this.prevActiveClass !== activeClass) {
          toggleClasses(el, this.prevActiveClass, removeClass);
        }
        // remove query string before matching
        var dest = this.path.replace(queryStringRE, '');
        path = path.replace(queryStringRE, '');
        // add new class
        if (this.exact) {
          if (dest === path ||
          // also allow additional trailing slash
          dest.charAt(dest.length - 1) !== '/' && dest === path.replace(trailingSlashRE, '')) {
            toggleClasses(el, activeClass, addClass);
          } else {
            toggleClasses(el, activeClass, removeClass);
          }
        } else {
          if (this.activeRE && this.activeRE.test(path)) {
            toggleClasses(el, activeClass, addClass);
          } else {
            toggleClasses(el, activeClass, removeClass);
          }
        }
      },

      unbind: function unbind() {
        this.el.removeEventListener('click', this.handler);
        this.unwatch && this.unwatch();
      }
    });

    function sameOrigin(link) {
      return link.protocol === location.protocol && link.hostname === location.hostname && link.port === location.port;
    }

    // this function is copied from v-bind:class implementation until
    // we properly expose it...
    function toggleClasses(el, key, fn) {
      key = key.trim();
      if (key.indexOf(' ') === -1) {
        fn(el, key);
        return;
      }
      var keys = key.split(/\s+/);
      for (var i = 0, l = keys.length; i < l; i++) {
        fn(el, keys[i]);
      }
    }
  }

  var historyBackends = {
    abstract: AbstractHistory,
    hash: HashHistory,
    html5: HTML5History
  };

  // late bind during install
  var Vue = undefined;

  /**
   * Router constructor
   *
   * @param {Object} [options]
   */

  var Router = (function () {
    function Router() {
      var _this = this;

      var _ref = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      var _ref$hashbang = _ref.hashbang;
      var hashbang = _ref$hashbang === undefined ? true : _ref$hashbang;
      var _ref$abstract = _ref.abstract;
      var abstract = _ref$abstract === undefined ? false : _ref$abstract;
      var _ref$history = _ref.history;
      var history = _ref$history === undefined ? false : _ref$history;
      var _ref$saveScrollPosition = _ref.saveScrollPosition;
      var saveScrollPosition = _ref$saveScrollPosition === undefined ? false : _ref$saveScrollPosition;
      var _ref$transitionOnLoad = _ref.transitionOnLoad;
      var transitionOnLoad = _ref$transitionOnLoad === undefined ? false : _ref$transitionOnLoad;
      var _ref$suppressTransitionError = _ref.suppressTransitionError;
      var suppressTransitionError = _ref$suppressTransitionError === undefined ? false : _ref$suppressTransitionError;
      var _ref$root = _ref.root;
      var root = _ref$root === undefined ? null : _ref$root;
      var _ref$linkActiveClass = _ref.linkActiveClass;
      var linkActiveClass = _ref$linkActiveClass === undefined ? 'v-link-active' : _ref$linkActiveClass;
      babelHelpers.classCallCheck(this, Router);

      /* istanbul ignore if */
      if (!Router.installed) {
        throw new Error('Please install the Router with Vue.use() before ' + 'creating an instance.');
      }

      // Vue instances
      this.app = null;
      this._children = [];

      // route recognizer
      this._recognizer = new RouteRecognizer();
      this._guardRecognizer = new RouteRecognizer();

      // state
      this._started = false;
      this._startCb = null;
      this._currentRoute = {};
      this._currentTransition = null;
      this._previousTransition = null;
      this._notFoundHandler = null;
      this._notFoundRedirect = null;
      this._beforeEachHooks = [];
      this._afterEachHooks = [];

      // trigger transition on initial render?
      this._rendered = false;
      this._transitionOnLoad = transitionOnLoad;

      // history mode
      this._root = root;
      this._abstract = abstract;
      this._hashbang = hashbang;

      // check if HTML5 history is available
      var hasPushState = typeof window !== 'undefined' && window.history && window.history.pushState;
      this._history = history && hasPushState;
      this._historyFallback = history && !hasPushState;

      // create history object
      var inBrowser = Vue.util.inBrowser;
      this.mode = !inBrowser || this._abstract ? 'abstract' : this._history ? 'html5' : 'hash';

      var History = historyBackends[this.mode];
      this.history = new History({
        root: root,
        hashbang: this._hashbang,
        onChange: function onChange(path, state, anchor) {
          _this._match(path, state, anchor);
        }
      });

      // other options
      this._saveScrollPosition = saveScrollPosition;
      this._linkActiveClass = linkActiveClass;
      this._suppress = suppressTransitionError;
    }

    /**
     * Allow directly passing components to a route
     * definition.
     *
     * @param {String} path
     * @param {Object} handler
     */

    // API ===================================================

    /**
    * Register a map of top-level paths.
    *
    * @param {Object} map
    */

    Router.prototype.map = function map(_map) {
      for (var route in _map) {
        this.on(route, _map[route]);
      }
      return this;
    };

    /**
     * Register a single root-level path
     *
     * @param {String} rootPath
     * @param {Object} handler
     *                 - {String} component
     *                 - {Object} [subRoutes]
     *                 - {Boolean} [forceRefresh]
     *                 - {Function} [before]
     *                 - {Function} [after]
     */

    Router.prototype.on = function on(rootPath, handler) {
      if (rootPath === '*') {
        this._notFound(handler);
      } else {
        this._addRoute(rootPath, handler, []);
      }
      return this;
    };

    /**
     * Set redirects.
     *
     * @param {Object} map
     */

    Router.prototype.redirect = function redirect(map) {
      for (var path in map) {
        this._addRedirect(path, map[path]);
      }
      return this;
    };

    /**
     * Set aliases.
     *
     * @param {Object} map
     */

    Router.prototype.alias = function alias(map) {
      for (var path in map) {
        this._addAlias(path, map[path]);
      }
      return this;
    };

    /**
     * Set global before hook.
     *
     * @param {Function} fn
     */

    Router.prototype.beforeEach = function beforeEach(fn) {
      this._beforeEachHooks.push(fn);
      return this;
    };

    /**
     * Set global after hook.
     *
     * @param {Function} fn
     */

    Router.prototype.afterEach = function afterEach(fn) {
      this._afterEachHooks.push(fn);
      return this;
    };

    /**
     * Navigate to a given path.
     * The path can be an object describing a named path in
     * the format of { name: '...', params: {}, query: {}}
     * The path is assumed to be already decoded, and will
     * be resolved against root (if provided)
     *
     * @param {String|Object} path
     * @param {Boolean} [replace]
     */

    Router.prototype.go = function go(path) {
      var replace = false;
      var append = false;
      if (Vue.util.isObject(path)) {
        replace = path.replace;
        append = path.append;
      }
      path = this.stringifyPath(path);
      if (path) {
        this.history.go(path, replace, append);
      }
    };

    /**
     * Short hand for replacing current path
     *
     * @param {String} path
     */

    Router.prototype.replace = function replace(path) {
      if (typeof path === 'string') {
        path = { path: path };
      }
      path.replace = true;
      this.go(path);
    };

    /**
     * Start the router.
     *
     * @param {VueConstructor} App
     * @param {String|Element} container
     * @param {Function} [cb]
     */

    Router.prototype.start = function start(App, container, cb) {
      /* istanbul ignore if */
      if (this._started) {
        warn$1('already started.');
        return;
      }
      this._started = true;
      this._startCb = cb;
      if (!this.app) {
        /* istanbul ignore if */
        if (!App || !container) {
          throw new Error('Must start vue-router with a component and a ' + 'root container.');
        }
        /* istanbul ignore if */
        if (App instanceof Vue) {
          throw new Error('Must start vue-router with a component, not a ' + 'Vue instance.');
        }
        this._appContainer = container;
        var Ctor = this._appConstructor = typeof App === 'function' ? App : Vue.extend(App);
        // give it a name for better debugging
        Ctor.options.name = Ctor.options.name || 'RouterApp';
      }

      // handle history fallback in browsers that do not
      // support HTML5 history API
      if (this._historyFallback) {
        var _location = window.location;
        var _history = new HTML5History({ root: this._root });
        var path = _history.root ? _location.pathname.replace(_history.rootRE, '') : _location.pathname;
        if (path && path !== '/') {
          _location.assign((_history.root || '') + '/' + this.history.formatPath(path) + _location.search);
          return;
        }
      }

      this.history.start();
    };

    /**
     * Stop listening to route changes.
     */

    Router.prototype.stop = function stop() {
      this.history.stop();
      this._started = false;
    };

    /**
     * Normalize named route object / string paths into
     * a string.
     *
     * @param {Object|String|Number} path
     * @return {String}
     */

    Router.prototype.stringifyPath = function stringifyPath(path) {
      var generatedPath = '';
      if (path && typeof path === 'object') {
        if (path.name) {
          var extend = Vue.util.extend;
          var currentParams = this._currentTransition && this._currentTransition.to.params;
          var targetParams = path.params || {};
          var params = currentParams ? extend(extend({}, currentParams), targetParams) : targetParams;
          generatedPath = encodeURI(this._recognizer.generate(path.name, params));
        } else if (path.path) {
          generatedPath = encodeURI(path.path);
        }
        if (path.query) {
          // note: the generated query string is pre-URL-encoded by the recognizer
          var query = this._recognizer.generateQueryString(path.query);
          if (generatedPath.indexOf('?') > -1) {
            generatedPath += '&' + query.slice(1);
          } else {
            generatedPath += query;
          }
        }
      } else {
        generatedPath = encodeURI(path ? path + '' : '');
      }
      return generatedPath;
    };

    // Internal methods ======================================

    /**
    * Add a route containing a list of segments to the internal
    * route recognizer. Will be called recursively to add all
    * possible sub-routes.
    *
    * @param {String} path
    * @param {Object} handler
    * @param {Array} segments
    */

    Router.prototype._addRoute = function _addRoute(path, handler, segments) {
      guardComponent(path, handler);
      handler.path = path;
      handler.fullPath = (segments.reduce(function (path, segment) {
        return path + segment.path;
      }, '') + path).replace('//', '/');
      segments.push({
        path: path,
        handler: handler
      });
      this._recognizer.add(segments, {
        as: handler.name
      });
      // add sub routes
      if (handler.subRoutes) {
        for (var subPath in handler.subRoutes) {
          // recursively walk all sub routes
          this._addRoute(subPath, handler.subRoutes[subPath],
          // pass a copy in recursion to avoid mutating
          // across branches
          segments.slice());
        }
      }
    };

    /**
     * Set the notFound route handler.
     *
     * @param {Object} handler
     */

    Router.prototype._notFound = function _notFound(handler) {
      guardComponent('*', handler);
      this._notFoundHandler = [{ handler: handler }];
    };

    /**
     * Add a redirect record.
     *
     * @param {String} path
     * @param {String} redirectPath
     */

    Router.prototype._addRedirect = function _addRedirect(path, redirectPath) {
      if (path === '*') {
        this._notFoundRedirect = redirectPath;
      } else {
        this._addGuard(path, redirectPath, this.replace);
      }
    };

    /**
     * Add an alias record.
     *
     * @param {String} path
     * @param {String} aliasPath
     */

    Router.prototype._addAlias = function _addAlias(path, aliasPath) {
      this._addGuard(path, aliasPath, this._match);
    };

    /**
     * Add a path guard.
     *
     * @param {String} path
     * @param {String} mappedPath
     * @param {Function} handler
     */

    Router.prototype._addGuard = function _addGuard(path, mappedPath, _handler) {
      var _this2 = this;

      this._guardRecognizer.add([{
        path: path,
        handler: function handler(match, query) {
          var realPath = mapParams(mappedPath, match.params, query);
          _handler.call(_this2, realPath);
        }
      }]);
    };

    /**
     * Check if a path matches any redirect records.
     *
     * @param {String} path
     * @return {Boolean} - if true, will skip normal match.
     */

    Router.prototype._checkGuard = function _checkGuard(path) {
      var matched = this._guardRecognizer.recognize(path, true);
      if (matched) {
        matched[0].handler(matched[0], matched.queryParams);
        return true;
      } else if (this._notFoundRedirect) {
        matched = this._recognizer.recognize(path);
        if (!matched) {
          this.replace(this._notFoundRedirect);
          return true;
        }
      }
    };

    /**
     * Match a URL path and set the route context on vm,
     * triggering view updates.
     *
     * @param {String} path
     * @param {Object} [state]
     * @param {String} [anchor]
     */

    Router.prototype._match = function _match(path, state, anchor) {
      var _this3 = this;

      if (this._checkGuard(path)) {
        return;
      }

      var currentRoute = this._currentRoute;
      var currentTransition = this._currentTransition;

      if (currentTransition) {
        if (currentTransition.to.path === path) {
          // do nothing if we have an active transition going to the same path
          return;
        } else if (currentRoute.path === path) {
          // We are going to the same path, but we also have an ongoing but
          // not-yet-validated transition. Abort that transition and reset to
          // prev transition.
          currentTransition.aborted = true;
          this._currentTransition = this._prevTransition;
          return;
        } else {
          // going to a totally different path. abort ongoing transition.
          currentTransition.aborted = true;
        }
      }

      // construct new route and transition context
      var route = new Route(path, this);
      var transition = new RouteTransition(this, route, currentRoute);

      // current transition is updated right now.
      // however, current route will only be updated after the transition has
      // been validated.
      this._prevTransition = currentTransition;
      this._currentTransition = transition;

      if (!this.app) {
        (function () {
          // initial render
          var router = _this3;
          _this3.app = new _this3._appConstructor({
            el: _this3._appContainer,
            created: function created() {
              this.$router = router;
            },
            _meta: {
              $route: route
            }
          });
        })();
      }

      // check global before hook
      var beforeHooks = this._beforeEachHooks;
      var startTransition = function startTransition() {
        transition.start(function () {
          _this3._postTransition(route, state, anchor);
        });
      };

      if (beforeHooks.length) {
        transition.runQueue(beforeHooks, function (hook, _, next) {
          if (transition === _this3._currentTransition) {
            transition.callHook(hook, null, next, {
              expectBoolean: true
            });
          }
        }, startTransition);
      } else {
        startTransition();
      }

      if (!this._rendered && this._startCb) {
        this._startCb.call(null);
      }

      // HACK:
      // set rendered to true after the transition start, so
      // that components that are acitvated synchronously know
      // whether it is the initial render.
      this._rendered = true;
    };

    /**
     * Set current to the new transition.
     * This is called by the transition object when the
     * validation of a route has succeeded.
     *
     * @param {Transition} transition
     */

    Router.prototype._onTransitionValidated = function _onTransitionValidated(transition) {
      // set current route
      var route = this._currentRoute = transition.to;
      // update route context for all children
      if (this.app.$route !== route) {
        this.app.$route = route;
        this._children.forEach(function (child) {
          child.$route = route;
        });
      }
      // call global after hook
      if (this._afterEachHooks.length) {
        this._afterEachHooks.forEach(function (hook) {
          return hook.call(null, {
            to: transition.to,
            from: transition.from
          });
        });
      }
      this._currentTransition.done = true;
    };

    /**
     * Handle stuff after the transition.
     *
     * @param {Route} route
     * @param {Object} [state]
     * @param {String} [anchor]
     */

    Router.prototype._postTransition = function _postTransition(route, state, anchor) {
      // handle scroll positions
      // saved scroll positions take priority
      // then we check if the path has an anchor
      var pos = state && state.pos;
      if (pos && this._saveScrollPosition) {
        Vue.nextTick(function () {
          window.scrollTo(pos.x, pos.y);
        });
      } else if (anchor) {
        Vue.nextTick(function () {
          var el = document.getElementById(anchor.slice(1));
          if (el) {
            window.scrollTo(window.scrollX, el.offsetTop);
          }
        });
      }
    };

    return Router;
  })();

  function guardComponent(path, handler) {
    var comp = handler.component;
    if (Vue.util.isPlainObject(comp)) {
      comp = handler.component = Vue.extend(comp);
    }
    /* istanbul ignore if */
    if (typeof comp !== 'function') {
      handler.component = null;
      warn$1('invalid component for route "' + path + '".');
    }
  }

  /* Installation */

  Router.installed = false;

  /**
   * Installation interface.
   * Install the necessary directives.
   */

  Router.install = function (externalVue) {
    /* istanbul ignore if */
    if (Router.installed) {
      warn$1('already installed.');
      return;
    }
    Vue = externalVue;
    applyOverride(Vue);
    View(Vue);
    Link(Vue);
    exports$1.Vue = Vue;
    Router.installed = true;
  };

  // auto install
  /* istanbul ignore if */
  if (typeof window !== 'undefined' && window.Vue) {
    window.Vue.use(Router);
  }

  return Router;

}));
},{}],13:[function(require,module,exports){
(function (process,global){
/*!
 * Vue.js v1.0.26
 * (c) 2016 Evan You
 * Released under the MIT License.
 */
'use strict';

function set(obj, key, val) {
  if (hasOwn(obj, key)) {
    obj[key] = val;
    return;
  }
  if (obj._isVue) {
    set(obj._data, key, val);
    return;
  }
  var ob = obj.__ob__;
  if (!ob) {
    obj[key] = val;
    return;
  }
  ob.convert(key, val);
  ob.dep.notify();
  if (ob.vms) {
    var i = ob.vms.length;
    while (i--) {
      var vm = ob.vms[i];
      vm._proxy(key);
      vm._digest();
    }
  }
  return val;
}

/**
 * Delete a property and trigger change if necessary.
 *
 * @param {Object} obj
 * @param {String} key
 */

function del(obj, key) {
  if (!hasOwn(obj, key)) {
    return;
  }
  delete obj[key];
  var ob = obj.__ob__;
  if (!ob) {
    if (obj._isVue) {
      delete obj._data[key];
      obj._digest();
    }
    return;
  }
  ob.dep.notify();
  if (ob.vms) {
    var i = ob.vms.length;
    while (i--) {
      var vm = ob.vms[i];
      vm._unproxy(key);
      vm._digest();
    }
  }
}

var hasOwnProperty = Object.prototype.hasOwnProperty;
/**
 * Check whether the object has the property.
 *
 * @param {Object} obj
 * @param {String} key
 * @return {Boolean}
 */

function hasOwn(obj, key) {
  return hasOwnProperty.call(obj, key);
}

/**
 * Check if an expression is a literal value.
 *
 * @param {String} exp
 * @return {Boolean}
 */

var literalValueRE = /^\s?(true|false|-?[\d\.]+|'[^']*'|"[^"]*")\s?$/;

function isLiteral(exp) {
  return literalValueRE.test(exp);
}

/**
 * Check if a string starts with $ or _
 *
 * @param {String} str
 * @return {Boolean}
 */

function isReserved(str) {
  var c = (str + '').charCodeAt(0);
  return c === 0x24 || c === 0x5F;
}

/**
 * Guard text output, make sure undefined outputs
 * empty string
 *
 * @param {*} value
 * @return {String}
 */

function _toString(value) {
  return value == null ? '' : value.toString();
}

/**
 * Check and convert possible numeric strings to numbers
 * before setting back to data
 *
 * @param {*} value
 * @return {*|Number}
 */

function toNumber(value) {
  if (typeof value !== 'string') {
    return value;
  } else {
    var parsed = Number(value);
    return isNaN(parsed) ? value : parsed;
  }
}

/**
 * Convert string boolean literals into real booleans.
 *
 * @param {*} value
 * @return {*|Boolean}
 */

function toBoolean(value) {
  return value === 'true' ? true : value === 'false' ? false : value;
}

/**
 * Strip quotes from a string
 *
 * @param {String} str
 * @return {String | false}
 */

function stripQuotes(str) {
  var a = str.charCodeAt(0);
  var b = str.charCodeAt(str.length - 1);
  return a === b && (a === 0x22 || a === 0x27) ? str.slice(1, -1) : str;
}

/**
 * Camelize a hyphen-delmited string.
 *
 * @param {String} str
 * @return {String}
 */

var camelizeRE = /-(\w)/g;

function camelize(str) {
  return str.replace(camelizeRE, toUpper);
}

function toUpper(_, c) {
  return c ? c.toUpperCase() : '';
}

/**
 * Hyphenate a camelCase string.
 *
 * @param {String} str
 * @return {String}
 */

var hyphenateRE = /([a-z\d])([A-Z])/g;

function hyphenate(str) {
  return str.replace(hyphenateRE, '$1-$2').toLowerCase();
}

/**
 * Converts hyphen/underscore/slash delimitered names into
 * camelized classNames.
 *
 * e.g. my-component => MyComponent
 *      some_else    => SomeElse
 *      some/comp    => SomeComp
 *
 * @param {String} str
 * @return {String}
 */

var classifyRE = /(?:^|[-_\/])(\w)/g;

function classify(str) {
  return str.replace(classifyRE, toUpper);
}

/**
 * Simple bind, faster than native
 *
 * @param {Function} fn
 * @param {Object} ctx
 * @return {Function}
 */

function bind(fn, ctx) {
  return function (a) {
    var l = arguments.length;
    return l ? l > 1 ? fn.apply(ctx, arguments) : fn.call(ctx, a) : fn.call(ctx);
  };
}

/**
 * Convert an Array-like object to a real Array.
 *
 * @param {Array-like} list
 * @param {Number} [start] - start index
 * @return {Array}
 */

function toArray(list, start) {
  start = start || 0;
  var i = list.length - start;
  var ret = new Array(i);
  while (i--) {
    ret[i] = list[i + start];
  }
  return ret;
}

/**
 * Mix properties into target object.
 *
 * @param {Object} to
 * @param {Object} from
 */

function extend(to, from) {
  var keys = Object.keys(from);
  var i = keys.length;
  while (i--) {
    to[keys[i]] = from[keys[i]];
  }
  return to;
}

/**
 * Quick object check - this is primarily used to tell
 * Objects from primitive values when we know the value
 * is a JSON-compliant type.
 *
 * @param {*} obj
 * @return {Boolean}
 */

function isObject(obj) {
  return obj !== null && typeof obj === 'object';
}

/**
 * Strict object type check. Only returns true
 * for plain JavaScript objects.
 *
 * @param {*} obj
 * @return {Boolean}
 */

var toString = Object.prototype.toString;
var OBJECT_STRING = '[object Object]';

function isPlainObject(obj) {
  return toString.call(obj) === OBJECT_STRING;
}

/**
 * Array type check.
 *
 * @param {*} obj
 * @return {Boolean}
 */

var isArray = Array.isArray;

/**
 * Define a property.
 *
 * @param {Object} obj
 * @param {String} key
 * @param {*} val
 * @param {Boolean} [enumerable]
 */

function def(obj, key, val, enumerable) {
  Object.defineProperty(obj, key, {
    value: val,
    enumerable: !!enumerable,
    writable: true,
    configurable: true
  });
}

/**
 * Debounce a function so it only gets called after the
 * input stops arriving after the given wait period.
 *
 * @param {Function} func
 * @param {Number} wait
 * @return {Function} - the debounced function
 */

function _debounce(func, wait) {
  var timeout, args, context, timestamp, result;
  var later = function later() {
    var last = Date.now() - timestamp;
    if (last < wait && last >= 0) {
      timeout = setTimeout(later, wait - last);
    } else {
      timeout = null;
      result = func.apply(context, args);
      if (!timeout) context = args = null;
    }
  };
  return function () {
    context = this;
    args = arguments;
    timestamp = Date.now();
    if (!timeout) {
      timeout = setTimeout(later, wait);
    }
    return result;
  };
}

/**
 * Manual indexOf because it's slightly faster than
 * native.
 *
 * @param {Array} arr
 * @param {*} obj
 */

function indexOf(arr, obj) {
  var i = arr.length;
  while (i--) {
    if (arr[i] === obj) return i;
  }
  return -1;
}

/**
 * Make a cancellable version of an async callback.
 *
 * @param {Function} fn
 * @return {Function}
 */

function cancellable(fn) {
  var cb = function cb() {
    if (!cb.cancelled) {
      return fn.apply(this, arguments);
    }
  };
  cb.cancel = function () {
    cb.cancelled = true;
  };
  return cb;
}

/**
 * Check if two values are loosely equal - that is,
 * if they are plain objects, do they have the same shape?
 *
 * @param {*} a
 * @param {*} b
 * @return {Boolean}
 */

function looseEqual(a, b) {
  /* eslint-disable eqeqeq */
  return a == b || (isObject(a) && isObject(b) ? JSON.stringify(a) === JSON.stringify(b) : false);
  /* eslint-enable eqeqeq */
}

var hasProto = ('__proto__' in {});

// Browser environment sniffing
var inBrowser = typeof window !== 'undefined' && Object.prototype.toString.call(window) !== '[object Object]';

// detect devtools
var devtools = inBrowser && window.__VUE_DEVTOOLS_GLOBAL_HOOK__;

// UA sniffing for working around browser-specific quirks
var UA = inBrowser && window.navigator.userAgent.toLowerCase();
var isIE = UA && UA.indexOf('trident') > 0;
var isIE9 = UA && UA.indexOf('msie 9.0') > 0;
var isAndroid = UA && UA.indexOf('android') > 0;
var isIos = UA && /(iphone|ipad|ipod|ios)/i.test(UA);
var iosVersionMatch = isIos && UA.match(/os ([\d_]+)/);
var iosVersion = iosVersionMatch && iosVersionMatch[1].split('_');

// detecting iOS UIWebView by indexedDB
var hasMutationObserverBug = iosVersion && Number(iosVersion[0]) >= 9 && Number(iosVersion[1]) >= 3 && !window.indexedDB;

var transitionProp = undefined;
var transitionEndEvent = undefined;
var animationProp = undefined;
var animationEndEvent = undefined;

// Transition property/event sniffing
if (inBrowser && !isIE9) {
  var isWebkitTrans = window.ontransitionend === undefined && window.onwebkittransitionend !== undefined;
  var isWebkitAnim = window.onanimationend === undefined && window.onwebkitanimationend !== undefined;
  transitionProp = isWebkitTrans ? 'WebkitTransition' : 'transition';
  transitionEndEvent = isWebkitTrans ? 'webkitTransitionEnd' : 'transitionend';
  animationProp = isWebkitAnim ? 'WebkitAnimation' : 'animation';
  animationEndEvent = isWebkitAnim ? 'webkitAnimationEnd' : 'animationend';
}

/**
 * Defer a task to execute it asynchronously. Ideally this
 * should be executed as a microtask, so we leverage
 * MutationObserver if it's available, and fallback to
 * setTimeout(0).
 *
 * @param {Function} cb
 * @param {Object} ctx
 */

var nextTick = (function () {
  var callbacks = [];
  var pending = false;
  var timerFunc;
  function nextTickHandler() {
    pending = false;
    var copies = callbacks.slice(0);
    callbacks = [];
    for (var i = 0; i < copies.length; i++) {
      copies[i]();
    }
  }

  /* istanbul ignore if */
  if (typeof MutationObserver !== 'undefined' && !hasMutationObserverBug) {
    var counter = 1;
    var observer = new MutationObserver(nextTickHandler);
    var textNode = document.createTextNode(counter);
    observer.observe(textNode, {
      characterData: true
    });
    timerFunc = function () {
      counter = (counter + 1) % 2;
      textNode.data = counter;
    };
  } else {
    // webpack attempts to inject a shim for setImmediate
    // if it is used as a global, so we have to work around that to
    // avoid bundling unnecessary code.
    var context = inBrowser ? window : typeof global !== 'undefined' ? global : {};
    timerFunc = context.setImmediate || setTimeout;
  }
  return function (cb, ctx) {
    var func = ctx ? function () {
      cb.call(ctx);
    } : cb;
    callbacks.push(func);
    if (pending) return;
    pending = true;
    timerFunc(nextTickHandler, 0);
  };
})();

var _Set = undefined;
/* istanbul ignore if */
if (typeof Set !== 'undefined' && Set.toString().match(/native code/)) {
  // use native Set when available.
  _Set = Set;
} else {
  // a non-standard Set polyfill that only works with primitive keys.
  _Set = function () {
    this.set = Object.create(null);
  };
  _Set.prototype.has = function (key) {
    return this.set[key] !== undefined;
  };
  _Set.prototype.add = function (key) {
    this.set[key] = 1;
  };
  _Set.prototype.clear = function () {
    this.set = Object.create(null);
  };
}

function Cache(limit) {
  this.size = 0;
  this.limit = limit;
  this.head = this.tail = undefined;
  this._keymap = Object.create(null);
}

var p = Cache.prototype;

/**
 * Put <value> into the cache associated with <key>.
 * Returns the entry which was removed to make room for
 * the new entry. Otherwise undefined is returned.
 * (i.e. if there was enough room already).
 *
 * @param {String} key
 * @param {*} value
 * @return {Entry|undefined}
 */

p.put = function (key, value) {
  var removed;

  var entry = this.get(key, true);
  if (!entry) {
    if (this.size === this.limit) {
      removed = this.shift();
    }
    entry = {
      key: key
    };
    this._keymap[key] = entry;
    if (this.tail) {
      this.tail.newer = entry;
      entry.older = this.tail;
    } else {
      this.head = entry;
    }
    this.tail = entry;
    this.size++;
  }
  entry.value = value;

  return removed;
};

/**
 * Purge the least recently used (oldest) entry from the
 * cache. Returns the removed entry or undefined if the
 * cache was empty.
 */

p.shift = function () {
  var entry = this.head;
  if (entry) {
    this.head = this.head.newer;
    this.head.older = undefined;
    entry.newer = entry.older = undefined;
    this._keymap[entry.key] = undefined;
    this.size--;
  }
  return entry;
};

/**
 * Get and register recent use of <key>. Returns the value
 * associated with <key> or undefined if not in cache.
 *
 * @param {String} key
 * @param {Boolean} returnEntry
 * @return {Entry|*}
 */

p.get = function (key, returnEntry) {
  var entry = this._keymap[key];
  if (entry === undefined) return;
  if (entry === this.tail) {
    return returnEntry ? entry : entry.value;
  }
  // HEAD--------------TAIL
  //   <.older   .newer>
  //  <--- add direction --
  //   A  B  C  <D>  E
  if (entry.newer) {
    if (entry === this.head) {
      this.head = entry.newer;
    }
    entry.newer.older = entry.older; // C <-- E.
  }
  if (entry.older) {
    entry.older.newer = entry.newer; // C. --> E
  }
  entry.newer = undefined; // D --x
  entry.older = this.tail; // D. --> E
  if (this.tail) {
    this.tail.newer = entry; // E. <-- D
  }
  this.tail = entry;
  return returnEntry ? entry : entry.value;
};

var cache$1 = new Cache(1000);
var filterTokenRE = /[^\s'"]+|'[^']*'|"[^"]*"/g;
var reservedArgRE = /^in$|^-?\d+/;

/**
 * Parser state
 */

var str;
var dir;
var c;
var prev;
var i;
var l;
var lastFilterIndex;
var inSingle;
var inDouble;
var curly;
var square;
var paren;
/**
 * Push a filter to the current directive object
 */

function pushFilter() {
  var exp = str.slice(lastFilterIndex, i).trim();
  var filter;
  if (exp) {
    filter = {};
    var tokens = exp.match(filterTokenRE);
    filter.name = tokens[0];
    if (tokens.length > 1) {
      filter.args = tokens.slice(1).map(processFilterArg);
    }
  }
  if (filter) {
    (dir.filters = dir.filters || []).push(filter);
  }
  lastFilterIndex = i + 1;
}

/**
 * Check if an argument is dynamic and strip quotes.
 *
 * @param {String} arg
 * @return {Object}
 */

function processFilterArg(arg) {
  if (reservedArgRE.test(arg)) {
    return {
      value: toNumber(arg),
      dynamic: false
    };
  } else {
    var stripped = stripQuotes(arg);
    var dynamic = stripped === arg;
    return {
      value: dynamic ? arg : stripped,
      dynamic: dynamic
    };
  }
}

/**
 * Parse a directive value and extract the expression
 * and its filters into a descriptor.
 *
 * Example:
 *
 * "a + 1 | uppercase" will yield:
 * {
 *   expression: 'a + 1',
 *   filters: [
 *     { name: 'uppercase', args: null }
 *   ]
 * }
 *
 * @param {String} s
 * @return {Object}
 */

function parseDirective(s) {
  var hit = cache$1.get(s);
  if (hit) {
    return hit;
  }

  // reset parser state
  str = s;
  inSingle = inDouble = false;
  curly = square = paren = 0;
  lastFilterIndex = 0;
  dir = {};

  for (i = 0, l = str.length; i < l; i++) {
    prev = c;
    c = str.charCodeAt(i);
    if (inSingle) {
      // check single quote
      if (c === 0x27 && prev !== 0x5C) inSingle = !inSingle;
    } else if (inDouble) {
      // check double quote
      if (c === 0x22 && prev !== 0x5C) inDouble = !inDouble;
    } else if (c === 0x7C && // pipe
    str.charCodeAt(i + 1) !== 0x7C && str.charCodeAt(i - 1) !== 0x7C) {
      if (dir.expression == null) {
        // first filter, end of expression
        lastFilterIndex = i + 1;
        dir.expression = str.slice(0, i).trim();
      } else {
        // already has filter
        pushFilter();
      }
    } else {
      switch (c) {
        case 0x22:
          inDouble = true;break; // "
        case 0x27:
          inSingle = true;break; // '
        case 0x28:
          paren++;break; // (
        case 0x29:
          paren--;break; // )
        case 0x5B:
          square++;break; // [
        case 0x5D:
          square--;break; // ]
        case 0x7B:
          curly++;break; // {
        case 0x7D:
          curly--;break; // }
      }
    }
  }

  if (dir.expression == null) {
    dir.expression = str.slice(0, i).trim();
  } else if (lastFilterIndex !== 0) {
    pushFilter();
  }

  cache$1.put(s, dir);
  return dir;
}

var directive = Object.freeze({
  parseDirective: parseDirective
});

var regexEscapeRE = /[-.*+?^${}()|[\]\/\\]/g;
var cache = undefined;
var tagRE = undefined;
var htmlRE = undefined;
/**
 * Escape a string so it can be used in a RegExp
 * constructor.
 *
 * @param {String} str
 */

function escapeRegex(str) {
  return str.replace(regexEscapeRE, '\\$&');
}

function compileRegex() {
  var open = escapeRegex(config.delimiters[0]);
  var close = escapeRegex(config.delimiters[1]);
  var unsafeOpen = escapeRegex(config.unsafeDelimiters[0]);
  var unsafeClose = escapeRegex(config.unsafeDelimiters[1]);
  tagRE = new RegExp(unsafeOpen + '((?:.|\\n)+?)' + unsafeClose + '|' + open + '((?:.|\\n)+?)' + close, 'g');
  htmlRE = new RegExp('^' + unsafeOpen + '((?:.|\\n)+?)' + unsafeClose + '$');
  // reset cache
  cache = new Cache(1000);
}

/**
 * Parse a template text string into an array of tokens.
 *
 * @param {String} text
 * @return {Array<Object> | null}
 *               - {String} type
 *               - {String} value
 *               - {Boolean} [html]
 *               - {Boolean} [oneTime]
 */

function parseText(text) {
  if (!cache) {
    compileRegex();
  }
  var hit = cache.get(text);
  if (hit) {
    return hit;
  }
  if (!tagRE.test(text)) {
    return null;
  }
  var tokens = [];
  var lastIndex = tagRE.lastIndex = 0;
  var match, index, html, value, first, oneTime;
  /* eslint-disable no-cond-assign */
  while (match = tagRE.exec(text)) {
    /* eslint-enable no-cond-assign */
    index = match.index;
    // push text token
    if (index > lastIndex) {
      tokens.push({
        value: text.slice(lastIndex, index)
      });
    }
    // tag token
    html = htmlRE.test(match[0]);
    value = html ? match[1] : match[2];
    first = value.charCodeAt(0);
    oneTime = first === 42; // *
    value = oneTime ? value.slice(1) : value;
    tokens.push({
      tag: true,
      value: value.trim(),
      html: html,
      oneTime: oneTime
    });
    lastIndex = index + match[0].length;
  }
  if (lastIndex < text.length) {
    tokens.push({
      value: text.slice(lastIndex)
    });
  }
  cache.put(text, tokens);
  return tokens;
}

/**
 * Format a list of tokens into an expression.
 * e.g. tokens parsed from 'a {{b}} c' can be serialized
 * into one single expression as '"a " + b + " c"'.
 *
 * @param {Array} tokens
 * @param {Vue} [vm]
 * @return {String}
 */

function tokensToExp(tokens, vm) {
  if (tokens.length > 1) {
    return tokens.map(function (token) {
      return formatToken(token, vm);
    }).join('+');
  } else {
    return formatToken(tokens[0], vm, true);
  }
}

/**
 * Format a single token.
 *
 * @param {Object} token
 * @param {Vue} [vm]
 * @param {Boolean} [single]
 * @return {String}
 */

function formatToken(token, vm, single) {
  return token.tag ? token.oneTime && vm ? '"' + vm.$eval(token.value) + '"' : inlineFilters(token.value, single) : '"' + token.value + '"';
}

/**
 * For an attribute with multiple interpolation tags,
 * e.g. attr="some-{{thing | filter}}", in order to combine
 * the whole thing into a single watchable expression, we
 * have to inline those filters. This function does exactly
 * that. This is a bit hacky but it avoids heavy changes
 * to directive parser and watcher mechanism.
 *
 * @param {String} exp
 * @param {Boolean} single
 * @return {String}
 */

var filterRE = /[^|]\|[^|]/;
function inlineFilters(exp, single) {
  if (!filterRE.test(exp)) {
    return single ? exp : '(' + exp + ')';
  } else {
    var dir = parseDirective(exp);
    if (!dir.filters) {
      return '(' + exp + ')';
    } else {
      return 'this._applyFilters(' + dir.expression + // value
      ',null,' + // oldValue (null for read)
      JSON.stringify(dir.filters) + // filter descriptors
      ',false)'; // write?
    }
  }
}

var text = Object.freeze({
  compileRegex: compileRegex,
  parseText: parseText,
  tokensToExp: tokensToExp
});

var delimiters = ['{{', '}}'];
var unsafeDelimiters = ['{{{', '}}}'];

var config = Object.defineProperties({

  /**
   * Whether to print debug messages.
   * Also enables stack trace for warnings.
   *
   * @type {Boolean}
   */

  debug: false,

  /**
   * Whether to suppress warnings.
   *
   * @type {Boolean}
   */

  silent: false,

  /**
   * Whether to use async rendering.
   */

  async: true,

  /**
   * Whether to warn against errors caught when evaluating
   * expressions.
   */

  warnExpressionErrors: true,

  /**
   * Whether to allow devtools inspection.
   * Disabled by default in production builds.
   */

  devtools: process.env.NODE_ENV !== 'production',

  /**
   * Internal flag to indicate the delimiters have been
   * changed.
   *
   * @type {Boolean}
   */

  _delimitersChanged: true,

  /**
   * List of asset types that a component can own.
   *
   * @type {Array}
   */

  _assetTypes: ['component', 'directive', 'elementDirective', 'filter', 'transition', 'partial'],

  /**
   * prop binding modes
   */

  _propBindingModes: {
    ONE_WAY: 0,
    TWO_WAY: 1,
    ONE_TIME: 2
  },

  /**
   * Max circular updates allowed in a batcher flush cycle.
   */

  _maxUpdateCount: 100

}, {
  delimiters: { /**
                 * Interpolation delimiters. Changing these would trigger
                 * the text parser to re-compile the regular expressions.
                 *
                 * @type {Array<String>}
                 */

    get: function get() {
      return delimiters;
    },
    set: function set(val) {
      delimiters = val;
      compileRegex();
    },
    configurable: true,
    enumerable: true
  },
  unsafeDelimiters: {
    get: function get() {
      return unsafeDelimiters;
    },
    set: function set(val) {
      unsafeDelimiters = val;
      compileRegex();
    },
    configurable: true,
    enumerable: true
  }
});

var warn = undefined;
var formatComponentName = undefined;

if (process.env.NODE_ENV !== 'production') {
  (function () {
    var hasConsole = typeof console !== 'undefined';

    warn = function (msg, vm) {
      if (hasConsole && !config.silent) {
        console.error('[Vue warn]: ' + msg + (vm ? formatComponentName(vm) : ''));
      }
    };

    formatComponentName = function (vm) {
      var name = vm._isVue ? vm.$options.name : vm.name;
      return name ? ' (found in component: <' + hyphenate(name) + '>)' : '';
    };
  })();
}

/**
 * Append with transition.
 *
 * @param {Element} el
 * @param {Element} target
 * @param {Vue} vm
 * @param {Function} [cb]
 */

function appendWithTransition(el, target, vm, cb) {
  applyTransition(el, 1, function () {
    target.appendChild(el);
  }, vm, cb);
}

/**
 * InsertBefore with transition.
 *
 * @param {Element} el
 * @param {Element} target
 * @param {Vue} vm
 * @param {Function} [cb]
 */

function beforeWithTransition(el, target, vm, cb) {
  applyTransition(el, 1, function () {
    before(el, target);
  }, vm, cb);
}

/**
 * Remove with transition.
 *
 * @param {Element} el
 * @param {Vue} vm
 * @param {Function} [cb]
 */

function removeWithTransition(el, vm, cb) {
  applyTransition(el, -1, function () {
    remove(el);
  }, vm, cb);
}

/**
 * Apply transitions with an operation callback.
 *
 * @param {Element} el
 * @param {Number} direction
 *                  1: enter
 *                 -1: leave
 * @param {Function} op - the actual DOM operation
 * @param {Vue} vm
 * @param {Function} [cb]
 */

function applyTransition(el, direction, op, vm, cb) {
  var transition = el.__v_trans;
  if (!transition ||
  // skip if there are no js hooks and CSS transition is
  // not supported
  !transition.hooks && !transitionEndEvent ||
  // skip transitions for initial compile
  !vm._isCompiled ||
  // if the vm is being manipulated by a parent directive
  // during the parent's compilation phase, skip the
  // animation.
  vm.$parent && !vm.$parent._isCompiled) {
    op();
    if (cb) cb();
    return;
  }
  var action = direction > 0 ? 'enter' : 'leave';
  transition[action](op, cb);
}

var transition = Object.freeze({
  appendWithTransition: appendWithTransition,
  beforeWithTransition: beforeWithTransition,
  removeWithTransition: removeWithTransition,
  applyTransition: applyTransition
});

/**
 * Query an element selector if it's not an element already.
 *
 * @param {String|Element} el
 * @return {Element}
 */

function query(el) {
  if (typeof el === 'string') {
    var selector = el;
    el = document.querySelector(el);
    if (!el) {
      process.env.NODE_ENV !== 'production' && warn('Cannot find element: ' + selector);
    }
  }
  return el;
}

/**
 * Check if a node is in the document.
 * Note: document.documentElement.contains should work here
 * but always returns false for comment nodes in phantomjs,
 * making unit tests difficult. This is fixed by doing the
 * contains() check on the node's parentNode instead of
 * the node itself.
 *
 * @param {Node} node
 * @return {Boolean}
 */

function inDoc(node) {
  if (!node) return false;
  var doc = node.ownerDocument.documentElement;
  var parent = node.parentNode;
  return doc === node || doc === parent || !!(parent && parent.nodeType === 1 && doc.contains(parent));
}

/**
 * Get and remove an attribute from a node.
 *
 * @param {Node} node
 * @param {String} _attr
 */

function getAttr(node, _attr) {
  var val = node.getAttribute(_attr);
  if (val !== null) {
    node.removeAttribute(_attr);
  }
  return val;
}

/**
 * Get an attribute with colon or v-bind: prefix.
 *
 * @param {Node} node
 * @param {String} name
 * @return {String|null}
 */

function getBindAttr(node, name) {
  var val = getAttr(node, ':' + name);
  if (val === null) {
    val = getAttr(node, 'v-bind:' + name);
  }
  return val;
}

/**
 * Check the presence of a bind attribute.
 *
 * @param {Node} node
 * @param {String} name
 * @return {Boolean}
 */

function hasBindAttr(node, name) {
  return node.hasAttribute(name) || node.hasAttribute(':' + name) || node.hasAttribute('v-bind:' + name);
}

/**
 * Insert el before target
 *
 * @param {Element} el
 * @param {Element} target
 */

function before(el, target) {
  target.parentNode.insertBefore(el, target);
}

/**
 * Insert el after target
 *
 * @param {Element} el
 * @param {Element} target
 */

function after(el, target) {
  if (target.nextSibling) {
    before(el, target.nextSibling);
  } else {
    target.parentNode.appendChild(el);
  }
}

/**
 * Remove el from DOM
 *
 * @param {Element} el
 */

function remove(el) {
  el.parentNode.removeChild(el);
}

/**
 * Prepend el to target
 *
 * @param {Element} el
 * @param {Element} target
 */

function prepend(el, target) {
  if (target.firstChild) {
    before(el, target.firstChild);
  } else {
    target.appendChild(el);
  }
}

/**
 * Replace target with el
 *
 * @param {Element} target
 * @param {Element} el
 */

function replace(target, el) {
  var parent = target.parentNode;
  if (parent) {
    parent.replaceChild(el, target);
  }
}

/**
 * Add event listener shorthand.
 *
 * @param {Element} el
 * @param {String} event
 * @param {Function} cb
 * @param {Boolean} [useCapture]
 */

function on(el, event, cb, useCapture) {
  el.addEventListener(event, cb, useCapture);
}

/**
 * Remove event listener shorthand.
 *
 * @param {Element} el
 * @param {String} event
 * @param {Function} cb
 */

function off(el, event, cb) {
  el.removeEventListener(event, cb);
}

/**
 * For IE9 compat: when both class and :class are present
 * getAttribute('class') returns wrong value...
 *
 * @param {Element} el
 * @return {String}
 */

function getClass(el) {
  var classname = el.className;
  if (typeof classname === 'object') {
    classname = classname.baseVal || '';
  }
  return classname;
}

/**
 * In IE9, setAttribute('class') will result in empty class
 * if the element also has the :class attribute; However in
 * PhantomJS, setting `className` does not work on SVG elements...
 * So we have to do a conditional check here.
 *
 * @param {Element} el
 * @param {String} cls
 */

function setClass(el, cls) {
  /* istanbul ignore if */
  if (isIE9 && !/svg$/.test(el.namespaceURI)) {
    el.className = cls;
  } else {
    el.setAttribute('class', cls);
  }
}

/**
 * Add class with compatibility for IE & SVG
 *
 * @param {Element} el
 * @param {String} cls
 */

function addClass(el, cls) {
  if (el.classList) {
    el.classList.add(cls);
  } else {
    var cur = ' ' + getClass(el) + ' ';
    if (cur.indexOf(' ' + cls + ' ') < 0) {
      setClass(el, (cur + cls).trim());
    }
  }
}

/**
 * Remove class with compatibility for IE & SVG
 *
 * @param {Element} el
 * @param {String} cls
 */

function removeClass(el, cls) {
  if (el.classList) {
    el.classList.remove(cls);
  } else {
    var cur = ' ' + getClass(el) + ' ';
    var tar = ' ' + cls + ' ';
    while (cur.indexOf(tar) >= 0) {
      cur = cur.replace(tar, ' ');
    }
    setClass(el, cur.trim());
  }
  if (!el.className) {
    el.removeAttribute('class');
  }
}

/**
 * Extract raw content inside an element into a temporary
 * container div
 *
 * @param {Element} el
 * @param {Boolean} asFragment
 * @return {Element|DocumentFragment}
 */

function extractContent(el, asFragment) {
  var child;
  var rawContent;
  /* istanbul ignore if */
  if (isTemplate(el) && isFragment(el.content)) {
    el = el.content;
  }
  if (el.hasChildNodes()) {
    trimNode(el);
    rawContent = asFragment ? document.createDocumentFragment() : document.createElement('div');
    /* eslint-disable no-cond-assign */
    while (child = el.firstChild) {
      /* eslint-enable no-cond-assign */
      rawContent.appendChild(child);
    }
  }
  return rawContent;
}

/**
 * Trim possible empty head/tail text and comment
 * nodes inside a parent.
 *
 * @param {Node} node
 */

function trimNode(node) {
  var child;
  /* eslint-disable no-sequences */
  while ((child = node.firstChild, isTrimmable(child))) {
    node.removeChild(child);
  }
  while ((child = node.lastChild, isTrimmable(child))) {
    node.removeChild(child);
  }
  /* eslint-enable no-sequences */
}

function isTrimmable(node) {
  return node && (node.nodeType === 3 && !node.data.trim() || node.nodeType === 8);
}

/**
 * Check if an element is a template tag.
 * Note if the template appears inside an SVG its tagName
 * will be in lowercase.
 *
 * @param {Element} el
 */

function isTemplate(el) {
  return el.tagName && el.tagName.toLowerCase() === 'template';
}

/**
 * Create an "anchor" for performing dom insertion/removals.
 * This is used in a number of scenarios:
 * - fragment instance
 * - v-html
 * - v-if
 * - v-for
 * - component
 *
 * @param {String} content
 * @param {Boolean} persist - IE trashes empty textNodes on
 *                            cloneNode(true), so in certain
 *                            cases the anchor needs to be
 *                            non-empty to be persisted in
 *                            templates.
 * @return {Comment|Text}
 */

function createAnchor(content, persist) {
  var anchor = config.debug ? document.createComment(content) : document.createTextNode(persist ? ' ' : '');
  anchor.__v_anchor = true;
  return anchor;
}

/**
 * Find a component ref attribute that starts with $.
 *
 * @param {Element} node
 * @return {String|undefined}
 */

var refRE = /^v-ref:/;

function findRef(node) {
  if (node.hasAttributes()) {
    var attrs = node.attributes;
    for (var i = 0, l = attrs.length; i < l; i++) {
      var name = attrs[i].name;
      if (refRE.test(name)) {
        return camelize(name.replace(refRE, ''));
      }
    }
  }
}

/**
 * Map a function to a range of nodes .
 *
 * @param {Node} node
 * @param {Node} end
 * @param {Function} op
 */

function mapNodeRange(node, end, op) {
  var next;
  while (node !== end) {
    next = node.nextSibling;
    op(node);
    node = next;
  }
  op(end);
}

/**
 * Remove a range of nodes with transition, store
 * the nodes in a fragment with correct ordering,
 * and call callback when done.
 *
 * @param {Node} start
 * @param {Node} end
 * @param {Vue} vm
 * @param {DocumentFragment} frag
 * @param {Function} cb
 */

function removeNodeRange(start, end, vm, frag, cb) {
  var done = false;
  var removed = 0;
  var nodes = [];
  mapNodeRange(start, end, function (node) {
    if (node === end) done = true;
    nodes.push(node);
    removeWithTransition(node, vm, onRemoved);
  });
  function onRemoved() {
    removed++;
    if (done && removed >= nodes.length) {
      for (var i = 0; i < nodes.length; i++) {
        frag.appendChild(nodes[i]);
      }
      cb && cb();
    }
  }
}

/**
 * Check if a node is a DocumentFragment.
 *
 * @param {Node} node
 * @return {Boolean}
 */

function isFragment(node) {
  return node && node.nodeType === 11;
}

/**
 * Get outerHTML of elements, taking care
 * of SVG elements in IE as well.
 *
 * @param {Element} el
 * @return {String}
 */

function getOuterHTML(el) {
  if (el.outerHTML) {
    return el.outerHTML;
  } else {
    var container = document.createElement('div');
    container.appendChild(el.cloneNode(true));
    return container.innerHTML;
  }
}

var commonTagRE = /^(div|p|span|img|a|b|i|br|ul|ol|li|h1|h2|h3|h4|h5|h6|code|pre|table|th|td|tr|form|label|input|select|option|nav|article|section|header|footer)$/i;
var reservedTagRE = /^(slot|partial|component)$/i;

var isUnknownElement = undefined;
if (process.env.NODE_ENV !== 'production') {
  isUnknownElement = function (el, tag) {
    if (tag.indexOf('-') > -1) {
      // http://stackoverflow.com/a/28210364/1070244
      return el.constructor === window.HTMLUnknownElement || el.constructor === window.HTMLElement;
    } else {
      return (/HTMLUnknownElement/.test(el.toString()) &&
        // Chrome returns unknown for several HTML5 elements.
        // https://code.google.com/p/chromium/issues/detail?id=540526
        // Firefox returns unknown for some "Interactive elements."
        !/^(data|time|rtc|rb|details|dialog|summary)$/.test(tag)
      );
    }
  };
}

/**
 * Check if an element is a component, if yes return its
 * component id.
 *
 * @param {Element} el
 * @param {Object} options
 * @return {Object|undefined}
 */

function checkComponentAttr(el, options) {
  var tag = el.tagName.toLowerCase();
  var hasAttrs = el.hasAttributes();
  if (!commonTagRE.test(tag) && !reservedTagRE.test(tag)) {
    if (resolveAsset(options, 'components', tag)) {
      return { id: tag };
    } else {
      var is = hasAttrs && getIsBinding(el, options);
      if (is) {
        return is;
      } else if (process.env.NODE_ENV !== 'production') {
        var expectedTag = options._componentNameMap && options._componentNameMap[tag];
        if (expectedTag) {
          warn('Unknown custom element: <' + tag + '> - ' + 'did you mean <' + expectedTag + '>? ' + 'HTML is case-insensitive, remember to use kebab-case in templates.');
        } else if (isUnknownElement(el, tag)) {
          warn('Unknown custom element: <' + tag + '> - did you ' + 'register the component correctly? For recursive components, ' + 'make sure to provide the "name" option.');
        }
      }
    }
  } else if (hasAttrs) {
    return getIsBinding(el, options);
  }
}

/**
 * Get "is" binding from an element.
 *
 * @param {Element} el
 * @param {Object} options
 * @return {Object|undefined}
 */

function getIsBinding(el, options) {
  // dynamic syntax
  var exp = el.getAttribute('is');
  if (exp != null) {
    if (resolveAsset(options, 'components', exp)) {
      el.removeAttribute('is');
      return { id: exp };
    }
  } else {
    exp = getBindAttr(el, 'is');
    if (exp != null) {
      return { id: exp, dynamic: true };
    }
  }
}

/**
 * Option overwriting strategies are functions that handle
 * how to merge a parent option value and a child option
 * value into the final value.
 *
 * All strategy functions follow the same signature:
 *
 * @param {*} parentVal
 * @param {*} childVal
 * @param {Vue} [vm]
 */

var strats = config.optionMergeStrategies = Object.create(null);

/**
 * Helper that recursively merges two data objects together.
 */

function mergeData(to, from) {
  var key, toVal, fromVal;
  for (key in from) {
    toVal = to[key];
    fromVal = from[key];
    if (!hasOwn(to, key)) {
      set(to, key, fromVal);
    } else if (isObject(toVal) && isObject(fromVal)) {
      mergeData(toVal, fromVal);
    }
  }
  return to;
}

/**
 * Data
 */

strats.data = function (parentVal, childVal, vm) {
  if (!vm) {
    // in a Vue.extend merge, both should be functions
    if (!childVal) {
      return parentVal;
    }
    if (typeof childVal !== 'function') {
      process.env.NODE_ENV !== 'production' && warn('The "data" option should be a function ' + 'that returns a per-instance value in component ' + 'definitions.', vm);
      return parentVal;
    }
    if (!parentVal) {
      return childVal;
    }
    // when parentVal & childVal are both present,
    // we need to return a function that returns the
    // merged result of both functions... no need to
    // check if parentVal is a function here because
    // it has to be a function to pass previous merges.
    return function mergedDataFn() {
      return mergeData(childVal.call(this), parentVal.call(this));
    };
  } else if (parentVal || childVal) {
    return function mergedInstanceDataFn() {
      // instance merge
      var instanceData = typeof childVal === 'function' ? childVal.call(vm) : childVal;
      var defaultData = typeof parentVal === 'function' ? parentVal.call(vm) : undefined;
      if (instanceData) {
        return mergeData(instanceData, defaultData);
      } else {
        return defaultData;
      }
    };
  }
};

/**
 * El
 */

strats.el = function (parentVal, childVal, vm) {
  if (!vm && childVal && typeof childVal !== 'function') {
    process.env.NODE_ENV !== 'production' && warn('The "el" option should be a function ' + 'that returns a per-instance value in component ' + 'definitions.', vm);
    return;
  }
  var ret = childVal || parentVal;
  // invoke the element factory if this is instance merge
  return vm && typeof ret === 'function' ? ret.call(vm) : ret;
};

/**
 * Hooks and param attributes are merged as arrays.
 */

strats.init = strats.created = strats.ready = strats.attached = strats.detached = strats.beforeCompile = strats.compiled = strats.beforeDestroy = strats.destroyed = strats.activate = function (parentVal, childVal) {
  return childVal ? parentVal ? parentVal.concat(childVal) : isArray(childVal) ? childVal : [childVal] : parentVal;
};

/**
 * Assets
 *
 * When a vm is present (instance creation), we need to do
 * a three-way merge between constructor options, instance
 * options and parent options.
 */

function mergeAssets(parentVal, childVal) {
  var res = Object.create(parentVal || null);
  return childVal ? extend(res, guardArrayAssets(childVal)) : res;
}

config._assetTypes.forEach(function (type) {
  strats[type + 's'] = mergeAssets;
});

/**
 * Events & Watchers.
 *
 * Events & watchers hashes should not overwrite one
 * another, so we merge them as arrays.
 */

strats.watch = strats.events = function (parentVal, childVal) {
  if (!childVal) return parentVal;
  if (!parentVal) return childVal;
  var ret = {};
  extend(ret, parentVal);
  for (var key in childVal) {
    var parent = ret[key];
    var child = childVal[key];
    if (parent && !isArray(parent)) {
      parent = [parent];
    }
    ret[key] = parent ? parent.concat(child) : [child];
  }
  return ret;
};

/**
 * Other object hashes.
 */

strats.props = strats.methods = strats.computed = function (parentVal, childVal) {
  if (!childVal) return parentVal;
  if (!parentVal) return childVal;
  var ret = Object.create(null);
  extend(ret, parentVal);
  extend(ret, childVal);
  return ret;
};

/**
 * Default strategy.
 */

var defaultStrat = function defaultStrat(parentVal, childVal) {
  return childVal === undefined ? parentVal : childVal;
};

/**
 * Make sure component options get converted to actual
 * constructors.
 *
 * @param {Object} options
 */

function guardComponents(options) {
  if (options.components) {
    var components = options.components = guardArrayAssets(options.components);
    var ids = Object.keys(components);
    var def;
    if (process.env.NODE_ENV !== 'production') {
      var map = options._componentNameMap = {};
    }
    for (var i = 0, l = ids.length; i < l; i++) {
      var key = ids[i];
      if (commonTagRE.test(key) || reservedTagRE.test(key)) {
        process.env.NODE_ENV !== 'production' && warn('Do not use built-in or reserved HTML elements as component ' + 'id: ' + key);
        continue;
      }
      // record a all lowercase <-> kebab-case mapping for
      // possible custom element case error warning
      if (process.env.NODE_ENV !== 'production') {
        map[key.replace(/-/g, '').toLowerCase()] = hyphenate(key);
      }
      def = components[key];
      if (isPlainObject(def)) {
        components[key] = Vue.extend(def);
      }
    }
  }
}

/**
 * Ensure all props option syntax are normalized into the
 * Object-based format.
 *
 * @param {Object} options
 */

function guardProps(options) {
  var props = options.props;
  var i, val;
  if (isArray(props)) {
    options.props = {};
    i = props.length;
    while (i--) {
      val = props[i];
      if (typeof val === 'string') {
        options.props[val] = null;
      } else if (val.name) {
        options.props[val.name] = val;
      }
    }
  } else if (isPlainObject(props)) {
    var keys = Object.keys(props);
    i = keys.length;
    while (i--) {
      val = props[keys[i]];
      if (typeof val === 'function') {
        props[keys[i]] = { type: val };
      }
    }
  }
}

/**
 * Guard an Array-format assets option and converted it
 * into the key-value Object format.
 *
 * @param {Object|Array} assets
 * @return {Object}
 */

function guardArrayAssets(assets) {
  if (isArray(assets)) {
    var res = {};
    var i = assets.length;
    var asset;
    while (i--) {
      asset = assets[i];
      var id = typeof asset === 'function' ? asset.options && asset.options.name || asset.id : asset.name || asset.id;
      if (!id) {
        process.env.NODE_ENV !== 'production' && warn('Array-syntax assets must provide a "name" or "id" field.');
      } else {
        res[id] = asset;
      }
    }
    return res;
  }
  return assets;
}

/**
 * Merge two option objects into a new one.
 * Core utility used in both instantiation and inheritance.
 *
 * @param {Object} parent
 * @param {Object} child
 * @param {Vue} [vm] - if vm is present, indicates this is
 *                     an instantiation merge.
 */

function mergeOptions(parent, child, vm) {
  guardComponents(child);
  guardProps(child);
  if (process.env.NODE_ENV !== 'production') {
    if (child.propsData && !vm) {
      warn('propsData can only be used as an instantiation option.');
    }
  }
  var options = {};
  var key;
  if (child['extends']) {
    parent = typeof child['extends'] === 'function' ? mergeOptions(parent, child['extends'].options, vm) : mergeOptions(parent, child['extends'], vm);
  }
  if (child.mixins) {
    for (var i = 0, l = child.mixins.length; i < l; i++) {
      var mixin = child.mixins[i];
      var mixinOptions = mixin.prototype instanceof Vue ? mixin.options : mixin;
      parent = mergeOptions(parent, mixinOptions, vm);
    }
  }
  for (key in parent) {
    mergeField(key);
  }
  for (key in child) {
    if (!hasOwn(parent, key)) {
      mergeField(key);
    }
  }
  function mergeField(key) {
    var strat = strats[key] || defaultStrat;
    options[key] = strat(parent[key], child[key], vm, key);
  }
  return options;
}

/**
 * Resolve an asset.
 * This function is used because child instances need access
 * to assets defined in its ancestor chain.
 *
 * @param {Object} options
 * @param {String} type
 * @param {String} id
 * @param {Boolean} warnMissing
 * @return {Object|Function}
 */

function resolveAsset(options, type, id, warnMissing) {
  /* istanbul ignore if */
  if (typeof id !== 'string') {
    return;
  }
  var assets = options[type];
  var camelizedId;
  var res = assets[id] ||
  // camelCase ID
  assets[camelizedId = camelize(id)] ||
  // Pascal Case ID
  assets[camelizedId.charAt(0).toUpperCase() + camelizedId.slice(1)];
  if (process.env.NODE_ENV !== 'production' && warnMissing && !res) {
    warn('Failed to resolve ' + type.slice(0, -1) + ': ' + id, options);
  }
  return res;
}

var uid$1 = 0;

/**
 * A dep is an observable that can have multiple
 * directives subscribing to it.
 *
 * @constructor
 */
function Dep() {
  this.id = uid$1++;
  this.subs = [];
}

// the current target watcher being evaluated.
// this is globally unique because there could be only one
// watcher being evaluated at any time.
Dep.target = null;

/**
 * Add a directive subscriber.
 *
 * @param {Directive} sub
 */

Dep.prototype.addSub = function (sub) {
  this.subs.push(sub);
};

/**
 * Remove a directive subscriber.
 *
 * @param {Directive} sub
 */

Dep.prototype.removeSub = function (sub) {
  this.subs.$remove(sub);
};

/**
 * Add self as a dependency to the target watcher.
 */

Dep.prototype.depend = function () {
  Dep.target.addDep(this);
};

/**
 * Notify all subscribers of a new value.
 */

Dep.prototype.notify = function () {
  // stablize the subscriber list first
  var subs = toArray(this.subs);
  for (var i = 0, l = subs.length; i < l; i++) {
    subs[i].update();
  }
};

var arrayProto = Array.prototype;
var arrayMethods = Object.create(arrayProto)

/**
 * Intercept mutating methods and emit events
 */

;['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse'].forEach(function (method) {
  // cache original method
  var original = arrayProto[method];
  def(arrayMethods, method, function mutator() {
    // avoid leaking arguments:
    // http://jsperf.com/closure-with-arguments
    var i = arguments.length;
    var args = new Array(i);
    while (i--) {
      args[i] = arguments[i];
    }
    var result = original.apply(this, args);
    var ob = this.__ob__;
    var inserted;
    switch (method) {
      case 'push':
        inserted = args;
        break;
      case 'unshift':
        inserted = args;
        break;
      case 'splice':
        inserted = args.slice(2);
        break;
    }
    if (inserted) ob.observeArray(inserted);
    // notify change
    ob.dep.notify();
    return result;
  });
});

/**
 * Swap the element at the given index with a new value
 * and emits corresponding event.
 *
 * @param {Number} index
 * @param {*} val
 * @return {*} - replaced element
 */

def(arrayProto, '$set', function $set(index, val) {
  if (index >= this.length) {
    this.length = Number(index) + 1;
  }
  return this.splice(index, 1, val)[0];
});

/**
 * Convenience method to remove the element at given index or target element reference.
 *
 * @param {*} item
 */

def(arrayProto, '$remove', function $remove(item) {
  /* istanbul ignore if */
  if (!this.length) return;
  var index = indexOf(this, item);
  if (index > -1) {
    return this.splice(index, 1);
  }
});

var arrayKeys = Object.getOwnPropertyNames(arrayMethods);

/**
 * By default, when a reactive property is set, the new value is
 * also converted to become reactive. However in certain cases, e.g.
 * v-for scope alias and props, we don't want to force conversion
 * because the value may be a nested value under a frozen data structure.
 *
 * So whenever we want to set a reactive property without forcing
 * conversion on the new value, we wrap that call inside this function.
 */

var shouldConvert = true;

function withoutConversion(fn) {
  shouldConvert = false;
  fn();
  shouldConvert = true;
}

/**
 * Observer class that are attached to each observed
 * object. Once attached, the observer converts target
 * object's property keys into getter/setters that
 * collect dependencies and dispatches updates.
 *
 * @param {Array|Object} value
 * @constructor
 */

function Observer(value) {
  this.value = value;
  this.dep = new Dep();
  def(value, '__ob__', this);
  if (isArray(value)) {
    var augment = hasProto ? protoAugment : copyAugment;
    augment(value, arrayMethods, arrayKeys);
    this.observeArray(value);
  } else {
    this.walk(value);
  }
}

// Instance methods

/**
 * Walk through each property and convert them into
 * getter/setters. This method should only be called when
 * value type is Object.
 *
 * @param {Object} obj
 */

Observer.prototype.walk = function (obj) {
  var keys = Object.keys(obj);
  for (var i = 0, l = keys.length; i < l; i++) {
    this.convert(keys[i], obj[keys[i]]);
  }
};

/**
 * Observe a list of Array items.
 *
 * @param {Array} items
 */

Observer.prototype.observeArray = function (items) {
  for (var i = 0, l = items.length; i < l; i++) {
    observe(items[i]);
  }
};

/**
 * Convert a property into getter/setter so we can emit
 * the events when the property is accessed/changed.
 *
 * @param {String} key
 * @param {*} val
 */

Observer.prototype.convert = function (key, val) {
  defineReactive(this.value, key, val);
};

/**
 * Add an owner vm, so that when $set/$delete mutations
 * happen we can notify owner vms to proxy the keys and
 * digest the watchers. This is only called when the object
 * is observed as an instance's root $data.
 *
 * @param {Vue} vm
 */

Observer.prototype.addVm = function (vm) {
  (this.vms || (this.vms = [])).push(vm);
};

/**
 * Remove an owner vm. This is called when the object is
 * swapped out as an instance's $data object.
 *
 * @param {Vue} vm
 */

Observer.prototype.removeVm = function (vm) {
  this.vms.$remove(vm);
};

// helpers

/**
 * Augment an target Object or Array by intercepting
 * the prototype chain using __proto__
 *
 * @param {Object|Array} target
 * @param {Object} src
 */

function protoAugment(target, src) {
  /* eslint-disable no-proto */
  target.__proto__ = src;
  /* eslint-enable no-proto */
}

/**
 * Augment an target Object or Array by defining
 * hidden properties.
 *
 * @param {Object|Array} target
 * @param {Object} proto
 */

function copyAugment(target, src, keys) {
  for (var i = 0, l = keys.length; i < l; i++) {
    var key = keys[i];
    def(target, key, src[key]);
  }
}

/**
 * Attempt to create an observer instance for a value,
 * returns the new observer if successfully observed,
 * or the existing observer if the value already has one.
 *
 * @param {*} value
 * @param {Vue} [vm]
 * @return {Observer|undefined}
 * @static
 */

function observe(value, vm) {
  if (!value || typeof value !== 'object') {
    return;
  }
  var ob;
  if (hasOwn(value, '__ob__') && value.__ob__ instanceof Observer) {
    ob = value.__ob__;
  } else if (shouldConvert && (isArray(value) || isPlainObject(value)) && Object.isExtensible(value) && !value._isVue) {
    ob = new Observer(value);
  }
  if (ob && vm) {
    ob.addVm(vm);
  }
  return ob;
}

/**
 * Define a reactive property on an Object.
 *
 * @param {Object} obj
 * @param {String} key
 * @param {*} val
 */

function defineReactive(obj, key, val) {
  var dep = new Dep();

  var property = Object.getOwnPropertyDescriptor(obj, key);
  if (property && property.configurable === false) {
    return;
  }

  // cater for pre-defined getter/setters
  var getter = property && property.get;
  var setter = property && property.set;

  var childOb = observe(val);
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get: function reactiveGetter() {
      var value = getter ? getter.call(obj) : val;
      if (Dep.target) {
        dep.depend();
        if (childOb) {
          childOb.dep.depend();
        }
        if (isArray(value)) {
          for (var e, i = 0, l = value.length; i < l; i++) {
            e = value[i];
            e && e.__ob__ && e.__ob__.dep.depend();
          }
        }
      }
      return value;
    },
    set: function reactiveSetter(newVal) {
      var value = getter ? getter.call(obj) : val;
      if (newVal === value) {
        return;
      }
      if (setter) {
        setter.call(obj, newVal);
      } else {
        val = newVal;
      }
      childOb = observe(newVal);
      dep.notify();
    }
  });
}



var util = Object.freeze({
	defineReactive: defineReactive,
	set: set,
	del: del,
	hasOwn: hasOwn,
	isLiteral: isLiteral,
	isReserved: isReserved,
	_toString: _toString,
	toNumber: toNumber,
	toBoolean: toBoolean,
	stripQuotes: stripQuotes,
	camelize: camelize,
	hyphenate: hyphenate,
	classify: classify,
	bind: bind,
	toArray: toArray,
	extend: extend,
	isObject: isObject,
	isPlainObject: isPlainObject,
	def: def,
	debounce: _debounce,
	indexOf: indexOf,
	cancellable: cancellable,
	looseEqual: looseEqual,
	isArray: isArray,
	hasProto: hasProto,
	inBrowser: inBrowser,
	devtools: devtools,
	isIE: isIE,
	isIE9: isIE9,
	isAndroid: isAndroid,
	isIos: isIos,
	iosVersionMatch: iosVersionMatch,
	iosVersion: iosVersion,
	hasMutationObserverBug: hasMutationObserverBug,
	get transitionProp () { return transitionProp; },
	get transitionEndEvent () { return transitionEndEvent; },
	get animationProp () { return animationProp; },
	get animationEndEvent () { return animationEndEvent; },
	nextTick: nextTick,
	get _Set () { return _Set; },
	query: query,
	inDoc: inDoc,
	getAttr: getAttr,
	getBindAttr: getBindAttr,
	hasBindAttr: hasBindAttr,
	before: before,
	after: after,
	remove: remove,
	prepend: prepend,
	replace: replace,
	on: on,
	off: off,
	setClass: setClass,
	addClass: addClass,
	removeClass: removeClass,
	extractContent: extractContent,
	trimNode: trimNode,
	isTemplate: isTemplate,
	createAnchor: createAnchor,
	findRef: findRef,
	mapNodeRange: mapNodeRange,
	removeNodeRange: removeNodeRange,
	isFragment: isFragment,
	getOuterHTML: getOuterHTML,
	mergeOptions: mergeOptions,
	resolveAsset: resolveAsset,
	checkComponentAttr: checkComponentAttr,
	commonTagRE: commonTagRE,
	reservedTagRE: reservedTagRE,
	get warn () { return warn; }
});

var uid = 0;

function initMixin (Vue) {
  /**
   * The main init sequence. This is called for every
   * instance, including ones that are created from extended
   * constructors.
   *
   * @param {Object} options - this options object should be
   *                           the result of merging class
   *                           options and the options passed
   *                           in to the constructor.
   */

  Vue.prototype._init = function (options) {
    options = options || {};

    this.$el = null;
    this.$parent = options.parent;
    this.$root = this.$parent ? this.$parent.$root : this;
    this.$children = [];
    this.$refs = {}; // child vm references
    this.$els = {}; // element references
    this._watchers = []; // all watchers as an array
    this._directives = []; // all directives

    // a uid
    this._uid = uid++;

    // a flag to avoid this being observed
    this._isVue = true;

    // events bookkeeping
    this._events = {}; // registered callbacks
    this._eventsCount = {}; // for $broadcast optimization

    // fragment instance properties
    this._isFragment = false;
    this._fragment = // @type {DocumentFragment}
    this._fragmentStart = // @type {Text|Comment}
    this._fragmentEnd = null; // @type {Text|Comment}

    // lifecycle state
    this._isCompiled = this._isDestroyed = this._isReady = this._isAttached = this._isBeingDestroyed = this._vForRemoving = false;
    this._unlinkFn = null;

    // context:
    // if this is a transcluded component, context
    // will be the common parent vm of this instance
    // and its host.
    this._context = options._context || this.$parent;

    // scope:
    // if this is inside an inline v-for, the scope
    // will be the intermediate scope created for this
    // repeat fragment. this is used for linking props
    // and container directives.
    this._scope = options._scope;

    // fragment:
    // if this instance is compiled inside a Fragment, it
    // needs to reigster itself as a child of that fragment
    // for attach/detach to work properly.
    this._frag = options._frag;
    if (this._frag) {
      this._frag.children.push(this);
    }

    // push self into parent / transclusion host
    if (this.$parent) {
      this.$parent.$children.push(this);
    }

    // merge options.
    options = this.$options = mergeOptions(this.constructor.options, options, this);

    // set ref
    this._updateRef();

    // initialize data as empty object.
    // it will be filled up in _initData().
    this._data = {};

    // call init hook
    this._callHook('init');

    // initialize data observation and scope inheritance.
    this._initState();

    // setup event system and option events.
    this._initEvents();

    // call created hook
    this._callHook('created');

    // if `el` option is passed, start compilation.
    if (options.el) {
      this.$mount(options.el);
    }
  };
}

var pathCache = new Cache(1000);

// actions
var APPEND = 0;
var PUSH = 1;
var INC_SUB_PATH_DEPTH = 2;
var PUSH_SUB_PATH = 3;

// states
var BEFORE_PATH = 0;
var IN_PATH = 1;
var BEFORE_IDENT = 2;
var IN_IDENT = 3;
var IN_SUB_PATH = 4;
var IN_SINGLE_QUOTE = 5;
var IN_DOUBLE_QUOTE = 6;
var AFTER_PATH = 7;
var ERROR = 8;

var pathStateMachine = [];

pathStateMachine[BEFORE_PATH] = {
  'ws': [BEFORE_PATH],
  'ident': [IN_IDENT, APPEND],
  '[': [IN_SUB_PATH],
  'eof': [AFTER_PATH]
};

pathStateMachine[IN_PATH] = {
  'ws': [IN_PATH],
  '.': [BEFORE_IDENT],
  '[': [IN_SUB_PATH],
  'eof': [AFTER_PATH]
};

pathStateMachine[BEFORE_IDENT] = {
  'ws': [BEFORE_IDENT],
  'ident': [IN_IDENT, APPEND]
};

pathStateMachine[IN_IDENT] = {
  'ident': [IN_IDENT, APPEND],
  '0': [IN_IDENT, APPEND],
  'number': [IN_IDENT, APPEND],
  'ws': [IN_PATH, PUSH],
  '.': [BEFORE_IDENT, PUSH],
  '[': [IN_SUB_PATH, PUSH],
  'eof': [AFTER_PATH, PUSH]
};

pathStateMachine[IN_SUB_PATH] = {
  "'": [IN_SINGLE_QUOTE, APPEND],
  '"': [IN_DOUBLE_QUOTE, APPEND],
  '[': [IN_SUB_PATH, INC_SUB_PATH_DEPTH],
  ']': [IN_PATH, PUSH_SUB_PATH],
  'eof': ERROR,
  'else': [IN_SUB_PATH, APPEND]
};

pathStateMachine[IN_SINGLE_QUOTE] = {
  "'": [IN_SUB_PATH, APPEND],
  'eof': ERROR,
  'else': [IN_SINGLE_QUOTE, APPEND]
};

pathStateMachine[IN_DOUBLE_QUOTE] = {
  '"': [IN_SUB_PATH, APPEND],
  'eof': ERROR,
  'else': [IN_DOUBLE_QUOTE, APPEND]
};

/**
 * Determine the type of a character in a keypath.
 *
 * @param {Char} ch
 * @return {String} type
 */

function getPathCharType(ch) {
  if (ch === undefined) {
    return 'eof';
  }

  var code = ch.charCodeAt(0);

  switch (code) {
    case 0x5B: // [
    case 0x5D: // ]
    case 0x2E: // .
    case 0x22: // "
    case 0x27: // '
    case 0x30:
      // 0
      return ch;

    case 0x5F: // _
    case 0x24:
      // $
      return 'ident';

    case 0x20: // Space
    case 0x09: // Tab
    case 0x0A: // Newline
    case 0x0D: // Return
    case 0xA0: // No-break space
    case 0xFEFF: // Byte Order Mark
    case 0x2028: // Line Separator
    case 0x2029:
      // Paragraph Separator
      return 'ws';
  }

  // a-z, A-Z
  if (code >= 0x61 && code <= 0x7A || code >= 0x41 && code <= 0x5A) {
    return 'ident';
  }

  // 1-9
  if (code >= 0x31 && code <= 0x39) {
    return 'number';
  }

  return 'else';
}

/**
 * Format a subPath, return its plain form if it is
 * a literal string or number. Otherwise prepend the
 * dynamic indicator (*).
 *
 * @param {String} path
 * @return {String}
 */

function formatSubPath(path) {
  var trimmed = path.trim();
  // invalid leading 0
  if (path.charAt(0) === '0' && isNaN(path)) {
    return false;
  }
  return isLiteral(trimmed) ? stripQuotes(trimmed) : '*' + trimmed;
}

/**
 * Parse a string path into an array of segments
 *
 * @param {String} path
 * @return {Array|undefined}
 */

function parse(path) {
  var keys = [];
  var index = -1;
  var mode = BEFORE_PATH;
  var subPathDepth = 0;
  var c, newChar, key, type, transition, action, typeMap;

  var actions = [];

  actions[PUSH] = function () {
    if (key !== undefined) {
      keys.push(key);
      key = undefined;
    }
  };

  actions[APPEND] = function () {
    if (key === undefined) {
      key = newChar;
    } else {
      key += newChar;
    }
  };

  actions[INC_SUB_PATH_DEPTH] = function () {
    actions[APPEND]();
    subPathDepth++;
  };

  actions[PUSH_SUB_PATH] = function () {
    if (subPathDepth > 0) {
      subPathDepth--;
      mode = IN_SUB_PATH;
      actions[APPEND]();
    } else {
      subPathDepth = 0;
      key = formatSubPath(key);
      if (key === false) {
        return false;
      } else {
        actions[PUSH]();
      }
    }
  };

  function maybeUnescapeQuote() {
    var nextChar = path[index + 1];
    if (mode === IN_SINGLE_QUOTE && nextChar === "'" || mode === IN_DOUBLE_QUOTE && nextChar === '"') {
      index++;
      newChar = '\\' + nextChar;
      actions[APPEND]();
      return true;
    }
  }

  while (mode != null) {
    index++;
    c = path[index];

    if (c === '\\' && maybeUnescapeQuote()) {
      continue;
    }

    type = getPathCharType(c);
    typeMap = pathStateMachine[mode];
    transition = typeMap[type] || typeMap['else'] || ERROR;

    if (transition === ERROR) {
      return; // parse error
    }

    mode = transition[0];
    action = actions[transition[1]];
    if (action) {
      newChar = transition[2];
      newChar = newChar === undefined ? c : newChar;
      if (action() === false) {
        return;
      }
    }

    if (mode === AFTER_PATH) {
      keys.raw = path;
      return keys;
    }
  }
}

/**
 * External parse that check for a cache hit first
 *
 * @param {String} path
 * @return {Array|undefined}
 */

function parsePath(path) {
  var hit = pathCache.get(path);
  if (!hit) {
    hit = parse(path);
    if (hit) {
      pathCache.put(path, hit);
    }
  }
  return hit;
}

/**
 * Get from an object from a path string
 *
 * @param {Object} obj
 * @param {String} path
 */

function getPath(obj, path) {
  return parseExpression(path).get(obj);
}

/**
 * Warn against setting non-existent root path on a vm.
 */

var warnNonExistent;
if (process.env.NODE_ENV !== 'production') {
  warnNonExistent = function (path, vm) {
    warn('You are setting a non-existent path "' + path.raw + '" ' + 'on a vm instance. Consider pre-initializing the property ' + 'with the "data" option for more reliable reactivity ' + 'and better performance.', vm);
  };
}

/**
 * Set on an object from a path
 *
 * @param {Object} obj
 * @param {String | Array} path
 * @param {*} val
 */

function setPath(obj, path, val) {
  var original = obj;
  if (typeof path === 'string') {
    path = parse(path);
  }
  if (!path || !isObject(obj)) {
    return false;
  }
  var last, key;
  for (var i = 0, l = path.length; i < l; i++) {
    last = obj;
    key = path[i];
    if (key.charAt(0) === '*') {
      key = parseExpression(key.slice(1)).get.call(original, original);
    }
    if (i < l - 1) {
      obj = obj[key];
      if (!isObject(obj)) {
        obj = {};
        if (process.env.NODE_ENV !== 'production' && last._isVue) {
          warnNonExistent(path, last);
        }
        set(last, key, obj);
      }
    } else {
      if (isArray(obj)) {
        obj.$set(key, val);
      } else if (key in obj) {
        obj[key] = val;
      } else {
        if (process.env.NODE_ENV !== 'production' && obj._isVue) {
          warnNonExistent(path, obj);
        }
        set(obj, key, val);
      }
    }
  }
  return true;
}

var path = Object.freeze({
  parsePath: parsePath,
  getPath: getPath,
  setPath: setPath
});

var expressionCache = new Cache(1000);

var allowedKeywords = 'Math,Date,this,true,false,null,undefined,Infinity,NaN,' + 'isNaN,isFinite,decodeURI,decodeURIComponent,encodeURI,' + 'encodeURIComponent,parseInt,parseFloat';
var allowedKeywordsRE = new RegExp('^(' + allowedKeywords.replace(/,/g, '\\b|') + '\\b)');

// keywords that don't make sense inside expressions
var improperKeywords = 'break,case,class,catch,const,continue,debugger,default,' + 'delete,do,else,export,extends,finally,for,function,if,' + 'import,in,instanceof,let,return,super,switch,throw,try,' + 'var,while,with,yield,enum,await,implements,package,' + 'protected,static,interface,private,public';
var improperKeywordsRE = new RegExp('^(' + improperKeywords.replace(/,/g, '\\b|') + '\\b)');

var wsRE = /\s/g;
var newlineRE = /\n/g;
var saveRE = /[\{,]\s*[\w\$_]+\s*:|('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|`(?:[^`\\]|\\.)*\$\{|\}(?:[^`\\]|\\.)*`|`(?:[^`\\]|\\.)*`)|new |typeof |void /g;
var restoreRE = /"(\d+)"/g;
var pathTestRE = /^[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*|\['.*?'\]|\[".*?"\]|\[\d+\]|\[[A-Za-z_$][\w$]*\])*$/;
var identRE = /[^\w$\.](?:[A-Za-z_$][\w$]*)/g;
var literalValueRE$1 = /^(?:true|false|null|undefined|Infinity|NaN)$/;

function noop() {}

/**
 * Save / Rewrite / Restore
 *
 * When rewriting paths found in an expression, it is
 * possible for the same letter sequences to be found in
 * strings and Object literal property keys. Therefore we
 * remove and store these parts in a temporary array, and
 * restore them after the path rewrite.
 */

var saved = [];

/**
 * Save replacer
 *
 * The save regex can match two possible cases:
 * 1. An opening object literal
 * 2. A string
 * If matched as a plain string, we need to escape its
 * newlines, since the string needs to be preserved when
 * generating the function body.
 *
 * @param {String} str
 * @param {String} isString - str if matched as a string
 * @return {String} - placeholder with index
 */

function save(str, isString) {
  var i = saved.length;
  saved[i] = isString ? str.replace(newlineRE, '\\n') : str;
  return '"' + i + '"';
}

/**
 * Path rewrite replacer
 *
 * @param {String} raw
 * @return {String}
 */

function rewrite(raw) {
  var c = raw.charAt(0);
  var path = raw.slice(1);
  if (allowedKeywordsRE.test(path)) {
    return raw;
  } else {
    path = path.indexOf('"') > -1 ? path.replace(restoreRE, restore) : path;
    return c + 'scope.' + path;
  }
}

/**
 * Restore replacer
 *
 * @param {String} str
 * @param {String} i - matched save index
 * @return {String}
 */

function restore(str, i) {
  return saved[i];
}

/**
 * Rewrite an expression, prefixing all path accessors with
 * `scope.` and generate getter/setter functions.
 *
 * @param {String} exp
 * @return {Function}
 */

function compileGetter(exp) {
  if (improperKeywordsRE.test(exp)) {
    process.env.NODE_ENV !== 'production' && warn('Avoid using reserved keywords in expression: ' + exp);
  }
  // reset state
  saved.length = 0;
  // save strings and object literal keys
  var body = exp.replace(saveRE, save).replace(wsRE, '');
  // rewrite all paths
  // pad 1 space here because the regex matches 1 extra char
  body = (' ' + body).replace(identRE, rewrite).replace(restoreRE, restore);
  return makeGetterFn(body);
}

/**
 * Build a getter function. Requires eval.
 *
 * We isolate the try/catch so it doesn't affect the
 * optimization of the parse function when it is not called.
 *
 * @param {String} body
 * @return {Function|undefined}
 */

function makeGetterFn(body) {
  try {
    /* eslint-disable no-new-func */
    return new Function('scope', 'return ' + body + ';');
    /* eslint-enable no-new-func */
  } catch (e) {
    if (process.env.NODE_ENV !== 'production') {
      /* istanbul ignore if */
      if (e.toString().match(/unsafe-eval|CSP/)) {
        warn('It seems you are using the default build of Vue.js in an environment ' + 'with Content Security Policy that prohibits unsafe-eval. ' + 'Use the CSP-compliant build instead: ' + 'http://vuejs.org/guide/installation.html#CSP-compliant-build');
      } else {
        warn('Invalid expression. ' + 'Generated function body: ' + body);
      }
    }
    return noop;
  }
}

/**
 * Compile a setter function for the expression.
 *
 * @param {String} exp
 * @return {Function|undefined}
 */

function compileSetter(exp) {
  var path = parsePath(exp);
  if (path) {
    return function (scope, val) {
      setPath(scope, path, val);
    };
  } else {
    process.env.NODE_ENV !== 'production' && warn('Invalid setter expression: ' + exp);
  }
}

/**
 * Parse an expression into re-written getter/setters.
 *
 * @param {String} exp
 * @param {Boolean} needSet
 * @return {Function}
 */

function parseExpression(exp, needSet) {
  exp = exp.trim();
  // try cache
  var hit = expressionCache.get(exp);
  if (hit) {
    if (needSet && !hit.set) {
      hit.set = compileSetter(hit.exp);
    }
    return hit;
  }
  var res = { exp: exp };
  res.get = isSimplePath(exp) && exp.indexOf('[') < 0
  // optimized super simple getter
  ? makeGetterFn('scope.' + exp)
  // dynamic getter
  : compileGetter(exp);
  if (needSet) {
    res.set = compileSetter(exp);
  }
  expressionCache.put(exp, res);
  return res;
}

/**
 * Check if an expression is a simple path.
 *
 * @param {String} exp
 * @return {Boolean}
 */

function isSimplePath(exp) {
  return pathTestRE.test(exp) &&
  // don't treat literal values as paths
  !literalValueRE$1.test(exp) &&
  // Math constants e.g. Math.PI, Math.E etc.
  exp.slice(0, 5) !== 'Math.';
}

var expression = Object.freeze({
  parseExpression: parseExpression,
  isSimplePath: isSimplePath
});

// we have two separate queues: one for directive updates
// and one for user watcher registered via $watch().
// we want to guarantee directive updates to be called
// before user watchers so that when user watchers are
// triggered, the DOM would have already been in updated
// state.

var queue = [];
var userQueue = [];
var has = {};
var circular = {};
var waiting = false;

/**
 * Reset the batcher's state.
 */

function resetBatcherState() {
  queue.length = 0;
  userQueue.length = 0;
  has = {};
  circular = {};
  waiting = false;
}

/**
 * Flush both queues and run the watchers.
 */

function flushBatcherQueue() {
  var _again = true;

  _function: while (_again) {
    _again = false;

    runBatcherQueue(queue);
    runBatcherQueue(userQueue);
    // user watchers triggered more watchers,
    // keep flushing until it depletes
    if (queue.length) {
      _again = true;
      continue _function;
    }
    // dev tool hook
    /* istanbul ignore if */
    if (devtools && config.devtools) {
      devtools.emit('flush');
    }
    resetBatcherState();
  }
}

/**
 * Run the watchers in a single queue.
 *
 * @param {Array} queue
 */

function runBatcherQueue(queue) {
  // do not cache length because more watchers might be pushed
  // as we run existing watchers
  for (var i = 0; i < queue.length; i++) {
    var watcher = queue[i];
    var id = watcher.id;
    has[id] = null;
    watcher.run();
    // in dev build, check and stop circular updates.
    if (process.env.NODE_ENV !== 'production' && has[id] != null) {
      circular[id] = (circular[id] || 0) + 1;
      if (circular[id] > config._maxUpdateCount) {
        warn('You may have an infinite update loop for watcher ' + 'with expression "' + watcher.expression + '"', watcher.vm);
        break;
      }
    }
  }
  queue.length = 0;
}

/**
 * Push a watcher into the watcher queue.
 * Jobs with duplicate IDs will be skipped unless it's
 * pushed when the queue is being flushed.
 *
 * @param {Watcher} watcher
 *   properties:
 *   - {Number} id
 *   - {Function} run
 */

function pushWatcher(watcher) {
  var id = watcher.id;
  if (has[id] == null) {
    // push watcher into appropriate queue
    var q = watcher.user ? userQueue : queue;
    has[id] = q.length;
    q.push(watcher);
    // queue the flush
    if (!waiting) {
      waiting = true;
      nextTick(flushBatcherQueue);
    }
  }
}

var uid$2 = 0;

/**
 * A watcher parses an expression, collects dependencies,
 * and fires callback when the expression value changes.
 * This is used for both the $watch() api and directives.
 *
 * @param {Vue} vm
 * @param {String|Function} expOrFn
 * @param {Function} cb
 * @param {Object} options
 *                 - {Array} filters
 *                 - {Boolean} twoWay
 *                 - {Boolean} deep
 *                 - {Boolean} user
 *                 - {Boolean} sync
 *                 - {Boolean} lazy
 *                 - {Function} [preProcess]
 *                 - {Function} [postProcess]
 * @constructor
 */
function Watcher(vm, expOrFn, cb, options) {
  // mix in options
  if (options) {
    extend(this, options);
  }
  var isFn = typeof expOrFn === 'function';
  this.vm = vm;
  vm._watchers.push(this);
  this.expression = expOrFn;
  this.cb = cb;
  this.id = ++uid$2; // uid for batching
  this.active = true;
  this.dirty = this.lazy; // for lazy watchers
  this.deps = [];
  this.newDeps = [];
  this.depIds = new _Set();
  this.newDepIds = new _Set();
  this.prevError = null; // for async error stacks
  // parse expression for getter/setter
  if (isFn) {
    this.getter = expOrFn;
    this.setter = undefined;
  } else {
    var res = parseExpression(expOrFn, this.twoWay);
    this.getter = res.get;
    this.setter = res.set;
  }
  this.value = this.lazy ? undefined : this.get();
  // state for avoiding false triggers for deep and Array
  // watchers during vm._digest()
  this.queued = this.shallow = false;
}

/**
 * Evaluate the getter, and re-collect dependencies.
 */

Watcher.prototype.get = function () {
  this.beforeGet();
  var scope = this.scope || this.vm;
  var value;
  try {
    value = this.getter.call(scope, scope);
  } catch (e) {
    if (process.env.NODE_ENV !== 'production' && config.warnExpressionErrors) {
      warn('Error when evaluating expression ' + '"' + this.expression + '": ' + e.toString(), this.vm);
    }
  }
  // "touch" every property so they are all tracked as
  // dependencies for deep watching
  if (this.deep) {
    traverse(value);
  }
  if (this.preProcess) {
    value = this.preProcess(value);
  }
  if (this.filters) {
    value = scope._applyFilters(value, null, this.filters, false);
  }
  if (this.postProcess) {
    value = this.postProcess(value);
  }
  this.afterGet();
  return value;
};

/**
 * Set the corresponding value with the setter.
 *
 * @param {*} value
 */

Watcher.prototype.set = function (value) {
  var scope = this.scope || this.vm;
  if (this.filters) {
    value = scope._applyFilters(value, this.value, this.filters, true);
  }
  try {
    this.setter.call(scope, scope, value);
  } catch (e) {
    if (process.env.NODE_ENV !== 'production' && config.warnExpressionErrors) {
      warn('Error when evaluating setter ' + '"' + this.expression + '": ' + e.toString(), this.vm);
    }
  }
  // two-way sync for v-for alias
  var forContext = scope.$forContext;
  if (forContext && forContext.alias === this.expression) {
    if (forContext.filters) {
      process.env.NODE_ENV !== 'production' && warn('It seems you are using two-way binding on ' + 'a v-for alias (' + this.expression + '), and the ' + 'v-for has filters. This will not work properly. ' + 'Either remove the filters or use an array of ' + 'objects and bind to object properties instead.', this.vm);
      return;
    }
    forContext._withLock(function () {
      if (scope.$key) {
        // original is an object
        forContext.rawValue[scope.$key] = value;
      } else {
        forContext.rawValue.$set(scope.$index, value);
      }
    });
  }
};

/**
 * Prepare for dependency collection.
 */

Watcher.prototype.beforeGet = function () {
  Dep.target = this;
};

/**
 * Add a dependency to this directive.
 *
 * @param {Dep} dep
 */

Watcher.prototype.addDep = function (dep) {
  var id = dep.id;
  if (!this.newDepIds.has(id)) {
    this.newDepIds.add(id);
    this.newDeps.push(dep);
    if (!this.depIds.has(id)) {
      dep.addSub(this);
    }
  }
};

/**
 * Clean up for dependency collection.
 */

Watcher.prototype.afterGet = function () {
  Dep.target = null;
  var i = this.deps.length;
  while (i--) {
    var dep = this.deps[i];
    if (!this.newDepIds.has(dep.id)) {
      dep.removeSub(this);
    }
  }
  var tmp = this.depIds;
  this.depIds = this.newDepIds;
  this.newDepIds = tmp;
  this.newDepIds.clear();
  tmp = this.deps;
  this.deps = this.newDeps;
  this.newDeps = tmp;
  this.newDeps.length = 0;
};

/**
 * Subscriber interface.
 * Will be called when a dependency changes.
 *
 * @param {Boolean} shallow
 */

Watcher.prototype.update = function (shallow) {
  if (this.lazy) {
    this.dirty = true;
  } else if (this.sync || !config.async) {
    this.run();
  } else {
    // if queued, only overwrite shallow with non-shallow,
    // but not the other way around.
    this.shallow = this.queued ? shallow ? this.shallow : false : !!shallow;
    this.queued = true;
    // record before-push error stack in debug mode
    /* istanbul ignore if */
    if (process.env.NODE_ENV !== 'production' && config.debug) {
      this.prevError = new Error('[vue] async stack trace');
    }
    pushWatcher(this);
  }
};

/**
 * Batcher job interface.
 * Will be called by the batcher.
 */

Watcher.prototype.run = function () {
  if (this.active) {
    var value = this.get();
    if (value !== this.value ||
    // Deep watchers and watchers on Object/Arrays should fire even
    // when the value is the same, because the value may
    // have mutated; but only do so if this is a
    // non-shallow update (caused by a vm digest).
    (isObject(value) || this.deep) && !this.shallow) {
      // set new value
      var oldValue = this.value;
      this.value = value;
      // in debug + async mode, when a watcher callbacks
      // throws, we also throw the saved before-push error
      // so the full cross-tick stack trace is available.
      var prevError = this.prevError;
      /* istanbul ignore if */
      if (process.env.NODE_ENV !== 'production' && config.debug && prevError) {
        this.prevError = null;
        try {
          this.cb.call(this.vm, value, oldValue);
        } catch (e) {
          nextTick(function () {
            throw prevError;
          }, 0);
          throw e;
        }
      } else {
        this.cb.call(this.vm, value, oldValue);
      }
    }
    this.queued = this.shallow = false;
  }
};

/**
 * Evaluate the value of the watcher.
 * This only gets called for lazy watchers.
 */

Watcher.prototype.evaluate = function () {
  // avoid overwriting another watcher that is being
  // collected.
  var current = Dep.target;
  this.value = this.get();
  this.dirty = false;
  Dep.target = current;
};

/**
 * Depend on all deps collected by this watcher.
 */

Watcher.prototype.depend = function () {
  var i = this.deps.length;
  while (i--) {
    this.deps[i].depend();
  }
};

/**
 * Remove self from all dependencies' subcriber list.
 */

Watcher.prototype.teardown = function () {
  if (this.active) {
    // remove self from vm's watcher list
    // this is a somewhat expensive operation so we skip it
    // if the vm is being destroyed or is performing a v-for
    // re-render (the watcher list is then filtered by v-for).
    if (!this.vm._isBeingDestroyed && !this.vm._vForRemoving) {
      this.vm._watchers.$remove(this);
    }
    var i = this.deps.length;
    while (i--) {
      this.deps[i].removeSub(this);
    }
    this.active = false;
    this.vm = this.cb = this.value = null;
  }
};

/**
 * Recrusively traverse an object to evoke all converted
 * getters, so that every nested property inside the object
 * is collected as a "deep" dependency.
 *
 * @param {*} val
 */

var seenObjects = new _Set();
function traverse(val, seen) {
  var i = undefined,
      keys = undefined;
  if (!seen) {
    seen = seenObjects;
    seen.clear();
  }
  var isA = isArray(val);
  var isO = isObject(val);
  if ((isA || isO) && Object.isExtensible(val)) {
    if (val.__ob__) {
      var depId = val.__ob__.dep.id;
      if (seen.has(depId)) {
        return;
      } else {
        seen.add(depId);
      }
    }
    if (isA) {
      i = val.length;
      while (i--) traverse(val[i], seen);
    } else if (isO) {
      keys = Object.keys(val);
      i = keys.length;
      while (i--) traverse(val[keys[i]], seen);
    }
  }
}

var text$1 = {

  bind: function bind() {
    this.attr = this.el.nodeType === 3 ? 'data' : 'textContent';
  },

  update: function update(value) {
    this.el[this.attr] = _toString(value);
  }
};

var templateCache = new Cache(1000);
var idSelectorCache = new Cache(1000);

var map = {
  efault: [0, '', ''],
  legend: [1, '<fieldset>', '</fieldset>'],
  tr: [2, '<table><tbody>', '</tbody></table>'],
  col: [2, '<table><tbody></tbody><colgroup>', '</colgroup></table>']
};

map.td = map.th = [3, '<table><tbody><tr>', '</tr></tbody></table>'];

map.option = map.optgroup = [1, '<select multiple="multiple">', '</select>'];

map.thead = map.tbody = map.colgroup = map.caption = map.tfoot = [1, '<table>', '</table>'];

map.g = map.defs = map.symbol = map.use = map.image = map.text = map.circle = map.ellipse = map.line = map.path = map.polygon = map.polyline = map.rect = [1, '<svg ' + 'xmlns="http://www.w3.org/2000/svg" ' + 'xmlns:xlink="http://www.w3.org/1999/xlink" ' + 'xmlns:ev="http://www.w3.org/2001/xml-events"' + 'version="1.1">', '</svg>'];

/**
 * Check if a node is a supported template node with a
 * DocumentFragment content.
 *
 * @param {Node} node
 * @return {Boolean}
 */

function isRealTemplate(node) {
  return isTemplate(node) && isFragment(node.content);
}

var tagRE$1 = /<([\w:-]+)/;
var entityRE = /&#?\w+?;/;
var commentRE = /<!--/;

/**
 * Convert a string template to a DocumentFragment.
 * Determines correct wrapping by tag types. Wrapping
 * strategy found in jQuery & component/domify.
 *
 * @param {String} templateString
 * @param {Boolean} raw
 * @return {DocumentFragment}
 */

function stringToFragment(templateString, raw) {
  // try a cache hit first
  var cacheKey = raw ? templateString : templateString.trim();
  var hit = templateCache.get(cacheKey);
  if (hit) {
    return hit;
  }

  var frag = document.createDocumentFragment();
  var tagMatch = templateString.match(tagRE$1);
  var entityMatch = entityRE.test(templateString);
  var commentMatch = commentRE.test(templateString);

  if (!tagMatch && !entityMatch && !commentMatch) {
    // text only, return a single text node.
    frag.appendChild(document.createTextNode(templateString));
  } else {
    var tag = tagMatch && tagMatch[1];
    var wrap = map[tag] || map.efault;
    var depth = wrap[0];
    var prefix = wrap[1];
    var suffix = wrap[2];
    var node = document.createElement('div');

    node.innerHTML = prefix + templateString + suffix;
    while (depth--) {
      node = node.lastChild;
    }

    var child;
    /* eslint-disable no-cond-assign */
    while (child = node.firstChild) {
      /* eslint-enable no-cond-assign */
      frag.appendChild(child);
    }
  }
  if (!raw) {
    trimNode(frag);
  }
  templateCache.put(cacheKey, frag);
  return frag;
}

/**
 * Convert a template node to a DocumentFragment.
 *
 * @param {Node} node
 * @return {DocumentFragment}
 */

function nodeToFragment(node) {
  // if its a template tag and the browser supports it,
  // its content is already a document fragment. However, iOS Safari has
  // bug when using directly cloned template content with touch
  // events and can cause crashes when the nodes are removed from DOM, so we
  // have to treat template elements as string templates. (#2805)
  /* istanbul ignore if */
  if (isRealTemplate(node)) {
    return stringToFragment(node.innerHTML);
  }
  // script template
  if (node.tagName === 'SCRIPT') {
    return stringToFragment(node.textContent);
  }
  // normal node, clone it to avoid mutating the original
  var clonedNode = cloneNode(node);
  var frag = document.createDocumentFragment();
  var child;
  /* eslint-disable no-cond-assign */
  while (child = clonedNode.firstChild) {
    /* eslint-enable no-cond-assign */
    frag.appendChild(child);
  }
  trimNode(frag);
  return frag;
}

// Test for the presence of the Safari template cloning bug
// https://bugs.webkit.org/showug.cgi?id=137755
var hasBrokenTemplate = (function () {
  /* istanbul ignore else */
  if (inBrowser) {
    var a = document.createElement('div');
    a.innerHTML = '<template>1</template>';
    return !a.cloneNode(true).firstChild.innerHTML;
  } else {
    return false;
  }
})();

// Test for IE10/11 textarea placeholder clone bug
var hasTextareaCloneBug = (function () {
  /* istanbul ignore else */
  if (inBrowser) {
    var t = document.createElement('textarea');
    t.placeholder = 't';
    return t.cloneNode(true).value === 't';
  } else {
    return false;
  }
})();

/**
 * 1. Deal with Safari cloning nested <template> bug by
 *    manually cloning all template instances.
 * 2. Deal with IE10/11 textarea placeholder bug by setting
 *    the correct value after cloning.
 *
 * @param {Element|DocumentFragment} node
 * @return {Element|DocumentFragment}
 */

function cloneNode(node) {
  /* istanbul ignore if */
  if (!node.querySelectorAll) {
    return node.cloneNode();
  }
  var res = node.cloneNode(true);
  var i, original, cloned;
  /* istanbul ignore if */
  if (hasBrokenTemplate) {
    var tempClone = res;
    if (isRealTemplate(node)) {
      node = node.content;
      tempClone = res.content;
    }
    original = node.querySelectorAll('template');
    if (original.length) {
      cloned = tempClone.querySelectorAll('template');
      i = cloned.length;
      while (i--) {
        cloned[i].parentNode.replaceChild(cloneNode(original[i]), cloned[i]);
      }
    }
  }
  /* istanbul ignore if */
  if (hasTextareaCloneBug) {
    if (node.tagName === 'TEXTAREA') {
      res.value = node.value;
    } else {
      original = node.querySelectorAll('textarea');
      if (original.length) {
        cloned = res.querySelectorAll('textarea');
        i = cloned.length;
        while (i--) {
          cloned[i].value = original[i].value;
        }
      }
    }
  }
  return res;
}

/**
 * Process the template option and normalizes it into a
 * a DocumentFragment that can be used as a partial or a
 * instance template.
 *
 * @param {*} template
 *        Possible values include:
 *        - DocumentFragment object
 *        - Node object of type Template
 *        - id selector: '#some-template-id'
 *        - template string: '<div><span>{{msg}}</span></div>'
 * @param {Boolean} shouldClone
 * @param {Boolean} raw
 *        inline HTML interpolation. Do not check for id
 *        selector and keep whitespace in the string.
 * @return {DocumentFragment|undefined}
 */

function parseTemplate(template, shouldClone, raw) {
  var node, frag;

  // if the template is already a document fragment,
  // do nothing
  if (isFragment(template)) {
    trimNode(template);
    return shouldClone ? cloneNode(template) : template;
  }

  if (typeof template === 'string') {
    // id selector
    if (!raw && template.charAt(0) === '#') {
      // id selector can be cached too
      frag = idSelectorCache.get(template);
      if (!frag) {
        node = document.getElementById(template.slice(1));
        if (node) {
          frag = nodeToFragment(node);
          // save selector to cache
          idSelectorCache.put(template, frag);
        }
      }
    } else {
      // normal string template
      frag = stringToFragment(template, raw);
    }
  } else if (template.nodeType) {
    // a direct node
    frag = nodeToFragment(template);
  }

  return frag && shouldClone ? cloneNode(frag) : frag;
}

var template = Object.freeze({
  cloneNode: cloneNode,
  parseTemplate: parseTemplate
});

var html = {

  bind: function bind() {
    // a comment node means this is a binding for
    // {{{ inline unescaped html }}}
    if (this.el.nodeType === 8) {
      // hold nodes
      this.nodes = [];
      // replace the placeholder with proper anchor
      this.anchor = createAnchor('v-html');
      replace(this.el, this.anchor);
    }
  },

  update: function update(value) {
    value = _toString(value);
    if (this.nodes) {
      this.swap(value);
    } else {
      this.el.innerHTML = value;
    }
  },

  swap: function swap(value) {
    // remove old nodes
    var i = this.nodes.length;
    while (i--) {
      remove(this.nodes[i]);
    }
    // convert new value to a fragment
    // do not attempt to retrieve from id selector
    var frag = parseTemplate(value, true, true);
    // save a reference to these nodes so we can remove later
    this.nodes = toArray(frag.childNodes);
    before(frag, this.anchor);
  }
};

/**
 * Abstraction for a partially-compiled fragment.
 * Can optionally compile content with a child scope.
 *
 * @param {Function} linker
 * @param {Vue} vm
 * @param {DocumentFragment} frag
 * @param {Vue} [host]
 * @param {Object} [scope]
 * @param {Fragment} [parentFrag]
 */
function Fragment(linker, vm, frag, host, scope, parentFrag) {
  this.children = [];
  this.childFrags = [];
  this.vm = vm;
  this.scope = scope;
  this.inserted = false;
  this.parentFrag = parentFrag;
  if (parentFrag) {
    parentFrag.childFrags.push(this);
  }
  this.unlink = linker(vm, frag, host, scope, this);
  var single = this.single = frag.childNodes.length === 1 &&
  // do not go single mode if the only node is an anchor
  !frag.childNodes[0].__v_anchor;
  if (single) {
    this.node = frag.childNodes[0];
    this.before = singleBefore;
    this.remove = singleRemove;
  } else {
    this.node = createAnchor('fragment-start');
    this.end = createAnchor('fragment-end');
    this.frag = frag;
    prepend(this.node, frag);
    frag.appendChild(this.end);
    this.before = multiBefore;
    this.remove = multiRemove;
  }
  this.node.__v_frag = this;
}

/**
 * Call attach/detach for all components contained within
 * this fragment. Also do so recursively for all child
 * fragments.
 *
 * @param {Function} hook
 */

Fragment.prototype.callHook = function (hook) {
  var i, l;
  for (i = 0, l = this.childFrags.length; i < l; i++) {
    this.childFrags[i].callHook(hook);
  }
  for (i = 0, l = this.children.length; i < l; i++) {
    hook(this.children[i]);
  }
};

/**
 * Insert fragment before target, single node version
 *
 * @param {Node} target
 * @param {Boolean} withTransition
 */

function singleBefore(target, withTransition) {
  this.inserted = true;
  var method = withTransition !== false ? beforeWithTransition : before;
  method(this.node, target, this.vm);
  if (inDoc(this.node)) {
    this.callHook(attach);
  }
}

/**
 * Remove fragment, single node version
 */

function singleRemove() {
  this.inserted = false;
  var shouldCallRemove = inDoc(this.node);
  var self = this;
  this.beforeRemove();
  removeWithTransition(this.node, this.vm, function () {
    if (shouldCallRemove) {
      self.callHook(detach);
    }
    self.destroy();
  });
}

/**
 * Insert fragment before target, multi-nodes version
 *
 * @param {Node} target
 * @param {Boolean} withTransition
 */

function multiBefore(target, withTransition) {
  this.inserted = true;
  var vm = this.vm;
  var method = withTransition !== false ? beforeWithTransition : before;
  mapNodeRange(this.node, this.end, function (node) {
    method(node, target, vm);
  });
  if (inDoc(this.node)) {
    this.callHook(attach);
  }
}

/**
 * Remove fragment, multi-nodes version
 */

function multiRemove() {
  this.inserted = false;
  var self = this;
  var shouldCallRemove = inDoc(this.node);
  this.beforeRemove();
  removeNodeRange(this.node, this.end, this.vm, this.frag, function () {
    if (shouldCallRemove) {
      self.callHook(detach);
    }
    self.destroy();
  });
}

/**
 * Prepare the fragment for removal.
 */

Fragment.prototype.beforeRemove = function () {
  var i, l;
  for (i = 0, l = this.childFrags.length; i < l; i++) {
    // call the same method recursively on child
    // fragments, depth-first
    this.childFrags[i].beforeRemove(false);
  }
  for (i = 0, l = this.children.length; i < l; i++) {
    // Call destroy for all contained instances,
    // with remove:false and defer:true.
    // Defer is necessary because we need to
    // keep the children to call detach hooks
    // on them.
    this.children[i].$destroy(false, true);
  }
  var dirs = this.unlink.dirs;
  for (i = 0, l = dirs.length; i < l; i++) {
    // disable the watchers on all the directives
    // so that the rendered content stays the same
    // during removal.
    dirs[i]._watcher && dirs[i]._watcher.teardown();
  }
};

/**
 * Destroy the fragment.
 */

Fragment.prototype.destroy = function () {
  if (this.parentFrag) {
    this.parentFrag.childFrags.$remove(this);
  }
  this.node.__v_frag = null;
  this.unlink();
};

/**
 * Call attach hook for a Vue instance.
 *
 * @param {Vue} child
 */

function attach(child) {
  if (!child._isAttached && inDoc(child.$el)) {
    child._callHook('attached');
  }
}

/**
 * Call detach hook for a Vue instance.
 *
 * @param {Vue} child
 */

function detach(child) {
  if (child._isAttached && !inDoc(child.$el)) {
    child._callHook('detached');
  }
}

var linkerCache = new Cache(5000);

/**
 * A factory that can be used to create instances of a
 * fragment. Caches the compiled linker if possible.
 *
 * @param {Vue} vm
 * @param {Element|String} el
 */
function FragmentFactory(vm, el) {
  this.vm = vm;
  var template;
  var isString = typeof el === 'string';
  if (isString || isTemplate(el) && !el.hasAttribute('v-if')) {
    template = parseTemplate(el, true);
  } else {
    template = document.createDocumentFragment();
    template.appendChild(el);
  }
  this.template = template;
  // linker can be cached, but only for components
  var linker;
  var cid = vm.constructor.cid;
  if (cid > 0) {
    var cacheId = cid + (isString ? el : getOuterHTML(el));
    linker = linkerCache.get(cacheId);
    if (!linker) {
      linker = compile(template, vm.$options, true);
      linkerCache.put(cacheId, linker);
    }
  } else {
    linker = compile(template, vm.$options, true);
  }
  this.linker = linker;
}

/**
 * Create a fragment instance with given host and scope.
 *
 * @param {Vue} host
 * @param {Object} scope
 * @param {Fragment} parentFrag
 */

FragmentFactory.prototype.create = function (host, scope, parentFrag) {
  var frag = cloneNode(this.template);
  return new Fragment(this.linker, this.vm, frag, host, scope, parentFrag);
};

var ON = 700;
var MODEL = 800;
var BIND = 850;
var TRANSITION = 1100;
var EL = 1500;
var COMPONENT = 1500;
var PARTIAL = 1750;
var IF = 2100;
var FOR = 2200;
var SLOT = 2300;

var uid$3 = 0;

var vFor = {

  priority: FOR,
  terminal: true,

  params: ['track-by', 'stagger', 'enter-stagger', 'leave-stagger'],

  bind: function bind() {
    // support "item in/of items" syntax
    var inMatch = this.expression.match(/(.*) (?:in|of) (.*)/);
    if (inMatch) {
      var itMatch = inMatch[1].match(/\((.*),(.*)\)/);
      if (itMatch) {
        this.iterator = itMatch[1].trim();
        this.alias = itMatch[2].trim();
      } else {
        this.alias = inMatch[1].trim();
      }
      this.expression = inMatch[2];
    }

    if (!this.alias) {
      process.env.NODE_ENV !== 'production' && warn('Invalid v-for expression "' + this.descriptor.raw + '": ' + 'alias is required.', this.vm);
      return;
    }

    // uid as a cache identifier
    this.id = '__v-for__' + ++uid$3;

    // check if this is an option list,
    // so that we know if we need to update the <select>'s
    // v-model when the option list has changed.
    // because v-model has a lower priority than v-for,
    // the v-model is not bound here yet, so we have to
    // retrive it in the actual updateModel() function.
    var tag = this.el.tagName;
    this.isOption = (tag === 'OPTION' || tag === 'OPTGROUP') && this.el.parentNode.tagName === 'SELECT';

    // setup anchor nodes
    this.start = createAnchor('v-for-start');
    this.end = createAnchor('v-for-end');
    replace(this.el, this.end);
    before(this.start, this.end);

    // cache
    this.cache = Object.create(null);

    // fragment factory
    this.factory = new FragmentFactory(this.vm, this.el);
  },

  update: function update(data) {
    this.diff(data);
    this.updateRef();
    this.updateModel();
  },

  /**
   * Diff, based on new data and old data, determine the
   * minimum amount of DOM manipulations needed to make the
   * DOM reflect the new data Array.
   *
   * The algorithm diffs the new data Array by storing a
   * hidden reference to an owner vm instance on previously
   * seen data. This allows us to achieve O(n) which is
   * better than a levenshtein distance based algorithm,
   * which is O(m * n).
   *
   * @param {Array} data
   */

  diff: function diff(data) {
    // check if the Array was converted from an Object
    var item = data[0];
    var convertedFromObject = this.fromObject = isObject(item) && hasOwn(item, '$key') && hasOwn(item, '$value');

    var trackByKey = this.params.trackBy;
    var oldFrags = this.frags;
    var frags = this.frags = new Array(data.length);
    var alias = this.alias;
    var iterator = this.iterator;
    var start = this.start;
    var end = this.end;
    var inDocument = inDoc(start);
    var init = !oldFrags;
    var i, l, frag, key, value, primitive;

    // First pass, go through the new Array and fill up
    // the new frags array. If a piece of data has a cached
    // instance for it, we reuse it. Otherwise build a new
    // instance.
    for (i = 0, l = data.length; i < l; i++) {
      item = data[i];
      key = convertedFromObject ? item.$key : null;
      value = convertedFromObject ? item.$value : item;
      primitive = !isObject(value);
      frag = !init && this.getCachedFrag(value, i, key);
      if (frag) {
        // reusable fragment
        frag.reused = true;
        // update $index
        frag.scope.$index = i;
        // update $key
        if (key) {
          frag.scope.$key = key;
        }
        // update iterator
        if (iterator) {
          frag.scope[iterator] = key !== null ? key : i;
        }
        // update data for track-by, object repeat &
        // primitive values.
        if (trackByKey || convertedFromObject || primitive) {
          withoutConversion(function () {
            frag.scope[alias] = value;
          });
        }
      } else {
        // new isntance
        frag = this.create(value, alias, i, key);
        frag.fresh = !init;
      }
      frags[i] = frag;
      if (init) {
        frag.before(end);
      }
    }

    // we're done for the initial render.
    if (init) {
      return;
    }

    // Second pass, go through the old fragments and
    // destroy those who are not reused (and remove them
    // from cache)
    var removalIndex = 0;
    var totalRemoved = oldFrags.length - frags.length;
    // when removing a large number of fragments, watcher removal
    // turns out to be a perf bottleneck, so we batch the watcher
    // removals into a single filter call!
    this.vm._vForRemoving = true;
    for (i = 0, l = oldFrags.length; i < l; i++) {
      frag = oldFrags[i];
      if (!frag.reused) {
        this.deleteCachedFrag(frag);
        this.remove(frag, removalIndex++, totalRemoved, inDocument);
      }
    }
    this.vm._vForRemoving = false;
    if (removalIndex) {
      this.vm._watchers = this.vm._watchers.filter(function (w) {
        return w.active;
      });
    }

    // Final pass, move/insert new fragments into the
    // right place.
    var targetPrev, prevEl, currentPrev;
    var insertionIndex = 0;
    for (i = 0, l = frags.length; i < l; i++) {
      frag = frags[i];
      // this is the frag that we should be after
      targetPrev = frags[i - 1];
      prevEl = targetPrev ? targetPrev.staggerCb ? targetPrev.staggerAnchor : targetPrev.end || targetPrev.node : start;
      if (frag.reused && !frag.staggerCb) {
        currentPrev = findPrevFrag(frag, start, this.id);
        if (currentPrev !== targetPrev && (!currentPrev ||
        // optimization for moving a single item.
        // thanks to suggestions by @livoras in #1807
        findPrevFrag(currentPrev, start, this.id) !== targetPrev)) {
          this.move(frag, prevEl);
        }
      } else {
        // new instance, or still in stagger.
        // insert with updated stagger index.
        this.insert(frag, insertionIndex++, prevEl, inDocument);
      }
      frag.reused = frag.fresh = false;
    }
  },

  /**
   * Create a new fragment instance.
   *
   * @param {*} value
   * @param {String} alias
   * @param {Number} index
   * @param {String} [key]
   * @return {Fragment}
   */

  create: function create(value, alias, index, key) {
    var host = this._host;
    // create iteration scope
    var parentScope = this._scope || this.vm;
    var scope = Object.create(parentScope);
    // ref holder for the scope
    scope.$refs = Object.create(parentScope.$refs);
    scope.$els = Object.create(parentScope.$els);
    // make sure point $parent to parent scope
    scope.$parent = parentScope;
    // for two-way binding on alias
    scope.$forContext = this;
    // define scope properties
    // important: define the scope alias without forced conversion
    // so that frozen data structures remain non-reactive.
    withoutConversion(function () {
      defineReactive(scope, alias, value);
    });
    defineReactive(scope, '$index', index);
    if (key) {
      defineReactive(scope, '$key', key);
    } else if (scope.$key) {
      // avoid accidental fallback
      def(scope, '$key', null);
    }
    if (this.iterator) {
      defineReactive(scope, this.iterator, key !== null ? key : index);
    }
    var frag = this.factory.create(host, scope, this._frag);
    frag.forId = this.id;
    this.cacheFrag(value, frag, index, key);
    return frag;
  },

  /**
   * Update the v-ref on owner vm.
   */

  updateRef: function updateRef() {
    var ref = this.descriptor.ref;
    if (!ref) return;
    var hash = (this._scope || this.vm).$refs;
    var refs;
    if (!this.fromObject) {
      refs = this.frags.map(findVmFromFrag);
    } else {
      refs = {};
      this.frags.forEach(function (frag) {
        refs[frag.scope.$key] = findVmFromFrag(frag);
      });
    }
    hash[ref] = refs;
  },

  /**
   * For option lists, update the containing v-model on
   * parent <select>.
   */

  updateModel: function updateModel() {
    if (this.isOption) {
      var parent = this.start.parentNode;
      var model = parent && parent.__v_model;
      if (model) {
        model.forceUpdate();
      }
    }
  },

  /**
   * Insert a fragment. Handles staggering.
   *
   * @param {Fragment} frag
   * @param {Number} index
   * @param {Node} prevEl
   * @param {Boolean} inDocument
   */

  insert: function insert(frag, index, prevEl, inDocument) {
    if (frag.staggerCb) {
      frag.staggerCb.cancel();
      frag.staggerCb = null;
    }
    var staggerAmount = this.getStagger(frag, index, null, 'enter');
    if (inDocument && staggerAmount) {
      // create an anchor and insert it synchronously,
      // so that we can resolve the correct order without
      // worrying about some elements not inserted yet
      var anchor = frag.staggerAnchor;
      if (!anchor) {
        anchor = frag.staggerAnchor = createAnchor('stagger-anchor');
        anchor.__v_frag = frag;
      }
      after(anchor, prevEl);
      var op = frag.staggerCb = cancellable(function () {
        frag.staggerCb = null;
        frag.before(anchor);
        remove(anchor);
      });
      setTimeout(op, staggerAmount);
    } else {
      var target = prevEl.nextSibling;
      /* istanbul ignore if */
      if (!target) {
        // reset end anchor position in case the position was messed up
        // by an external drag-n-drop library.
        after(this.end, prevEl);
        target = this.end;
      }
      frag.before(target);
    }
  },

  /**
   * Remove a fragment. Handles staggering.
   *
   * @param {Fragment} frag
   * @param {Number} index
   * @param {Number} total
   * @param {Boolean} inDocument
   */

  remove: function remove(frag, index, total, inDocument) {
    if (frag.staggerCb) {
      frag.staggerCb.cancel();
      frag.staggerCb = null;
      // it's not possible for the same frag to be removed
      // twice, so if we have a pending stagger callback,
      // it means this frag is queued for enter but removed
      // before its transition started. Since it is already
      // destroyed, we can just leave it in detached state.
      return;
    }
    var staggerAmount = this.getStagger(frag, index, total, 'leave');
    if (inDocument && staggerAmount) {
      var op = frag.staggerCb = cancellable(function () {
        frag.staggerCb = null;
        frag.remove();
      });
      setTimeout(op, staggerAmount);
    } else {
      frag.remove();
    }
  },

  /**
   * Move a fragment to a new position.
   * Force no transition.
   *
   * @param {Fragment} frag
   * @param {Node} prevEl
   */

  move: function move(frag, prevEl) {
    // fix a common issue with Sortable:
    // if prevEl doesn't have nextSibling, this means it's
    // been dragged after the end anchor. Just re-position
    // the end anchor to the end of the container.
    /* istanbul ignore if */
    if (!prevEl.nextSibling) {
      this.end.parentNode.appendChild(this.end);
    }
    frag.before(prevEl.nextSibling, false);
  },

  /**
   * Cache a fragment using track-by or the object key.
   *
   * @param {*} value
   * @param {Fragment} frag
   * @param {Number} index
   * @param {String} [key]
   */

  cacheFrag: function cacheFrag(value, frag, index, key) {
    var trackByKey = this.params.trackBy;
    var cache = this.cache;
    var primitive = !isObject(value);
    var id;
    if (key || trackByKey || primitive) {
      id = getTrackByKey(index, key, value, trackByKey);
      if (!cache[id]) {
        cache[id] = frag;
      } else if (trackByKey !== '$index') {
        process.env.NODE_ENV !== 'production' && this.warnDuplicate(value);
      }
    } else {
      id = this.id;
      if (hasOwn(value, id)) {
        if (value[id] === null) {
          value[id] = frag;
        } else {
          process.env.NODE_ENV !== 'production' && this.warnDuplicate(value);
        }
      } else if (Object.isExtensible(value)) {
        def(value, id, frag);
      } else if (process.env.NODE_ENV !== 'production') {
        warn('Frozen v-for objects cannot be automatically tracked, make sure to ' + 'provide a track-by key.');
      }
    }
    frag.raw = value;
  },

  /**
   * Get a cached fragment from the value/index/key
   *
   * @param {*} value
   * @param {Number} index
   * @param {String} key
   * @return {Fragment}
   */

  getCachedFrag: function getCachedFrag(value, index, key) {
    var trackByKey = this.params.trackBy;
    var primitive = !isObject(value);
    var frag;
    if (key || trackByKey || primitive) {
      var id = getTrackByKey(index, key, value, trackByKey);
      frag = this.cache[id];
    } else {
      frag = value[this.id];
    }
    if (frag && (frag.reused || frag.fresh)) {
      process.env.NODE_ENV !== 'production' && this.warnDuplicate(value);
    }
    return frag;
  },

  /**
   * Delete a fragment from cache.
   *
   * @param {Fragment} frag
   */

  deleteCachedFrag: function deleteCachedFrag(frag) {
    var value = frag.raw;
    var trackByKey = this.params.trackBy;
    var scope = frag.scope;
    var index = scope.$index;
    // fix #948: avoid accidentally fall through to
    // a parent repeater which happens to have $key.
    var key = hasOwn(scope, '$key') && scope.$key;
    var primitive = !isObject(value);
    if (trackByKey || key || primitive) {
      var id = getTrackByKey(index, key, value, trackByKey);
      this.cache[id] = null;
    } else {
      value[this.id] = null;
      frag.raw = null;
    }
  },

  /**
   * Get the stagger amount for an insertion/removal.
   *
   * @param {Fragment} frag
   * @param {Number} index
   * @param {Number} total
   * @param {String} type
   */

  getStagger: function getStagger(frag, index, total, type) {
    type = type + 'Stagger';
    var trans = frag.node.__v_trans;
    var hooks = trans && trans.hooks;
    var hook = hooks && (hooks[type] || hooks.stagger);
    return hook ? hook.call(frag, index, total) : index * parseInt(this.params[type] || this.params.stagger, 10);
  },

  /**
   * Pre-process the value before piping it through the
   * filters. This is passed to and called by the watcher.
   */

  _preProcess: function _preProcess(value) {
    // regardless of type, store the un-filtered raw value.
    this.rawValue = value;
    return value;
  },

  /**
   * Post-process the value after it has been piped through
   * the filters. This is passed to and called by the watcher.
   *
   * It is necessary for this to be called during the
   * watcher's dependency collection phase because we want
   * the v-for to update when the source Object is mutated.
   */

  _postProcess: function _postProcess(value) {
    if (isArray(value)) {
      return value;
    } else if (isPlainObject(value)) {
      // convert plain object to array.
      var keys = Object.keys(value);
      var i = keys.length;
      var res = new Array(i);
      var key;
      while (i--) {
        key = keys[i];
        res[i] = {
          $key: key,
          $value: value[key]
        };
      }
      return res;
    } else {
      if (typeof value === 'number' && !isNaN(value)) {
        value = range(value);
      }
      return value || [];
    }
  },

  unbind: function unbind() {
    if (this.descriptor.ref) {
      (this._scope || this.vm).$refs[this.descriptor.ref] = null;
    }
    if (this.frags) {
      var i = this.frags.length;
      var frag;
      while (i--) {
        frag = this.frags[i];
        this.deleteCachedFrag(frag);
        frag.destroy();
      }
    }
  }
};

/**
 * Helper to find the previous element that is a fragment
 * anchor. This is necessary because a destroyed frag's
 * element could still be lingering in the DOM before its
 * leaving transition finishes, but its inserted flag
 * should have been set to false so we can skip them.
 *
 * If this is a block repeat, we want to make sure we only
 * return frag that is bound to this v-for. (see #929)
 *
 * @param {Fragment} frag
 * @param {Comment|Text} anchor
 * @param {String} id
 * @return {Fragment}
 */

function findPrevFrag(frag, anchor, id) {
  var el = frag.node.previousSibling;
  /* istanbul ignore if */
  if (!el) return;
  frag = el.__v_frag;
  while ((!frag || frag.forId !== id || !frag.inserted) && el !== anchor) {
    el = el.previousSibling;
    /* istanbul ignore if */
    if (!el) return;
    frag = el.__v_frag;
  }
  return frag;
}

/**
 * Find a vm from a fragment.
 *
 * @param {Fragment} frag
 * @return {Vue|undefined}
 */

function findVmFromFrag(frag) {
  var node = frag.node;
  // handle multi-node frag
  if (frag.end) {
    while (!node.__vue__ && node !== frag.end && node.nextSibling) {
      node = node.nextSibling;
    }
  }
  return node.__vue__;
}

/**
 * Create a range array from given number.
 *
 * @param {Number} n
 * @return {Array}
 */

function range(n) {
  var i = -1;
  var ret = new Array(Math.floor(n));
  while (++i < n) {
    ret[i] = i;
  }
  return ret;
}

/**
 * Get the track by key for an item.
 *
 * @param {Number} index
 * @param {String} key
 * @param {*} value
 * @param {String} [trackByKey]
 */

function getTrackByKey(index, key, value, trackByKey) {
  return trackByKey ? trackByKey === '$index' ? index : trackByKey.charAt(0).match(/\w/) ? getPath(value, trackByKey) : value[trackByKey] : key || value;
}

if (process.env.NODE_ENV !== 'production') {
  vFor.warnDuplicate = function (value) {
    warn('Duplicate value found in v-for="' + this.descriptor.raw + '": ' + JSON.stringify(value) + '. Use track-by="$index" if ' + 'you are expecting duplicate values.', this.vm);
  };
}

var vIf = {

  priority: IF,
  terminal: true,

  bind: function bind() {
    var el = this.el;
    if (!el.__vue__) {
      // check else block
      var next = el.nextElementSibling;
      if (next && getAttr(next, 'v-else') !== null) {
        remove(next);
        this.elseEl = next;
      }
      // check main block
      this.anchor = createAnchor('v-if');
      replace(el, this.anchor);
    } else {
      process.env.NODE_ENV !== 'production' && warn('v-if="' + this.expression + '" cannot be ' + 'used on an instance root element.', this.vm);
      this.invalid = true;
    }
  },

  update: function update(value) {
    if (this.invalid) return;
    if (value) {
      if (!this.frag) {
        this.insert();
      }
    } else {
      this.remove();
    }
  },

  insert: function insert() {
    if (this.elseFrag) {
      this.elseFrag.remove();
      this.elseFrag = null;
    }
    // lazy init factory
    if (!this.factory) {
      this.factory = new FragmentFactory(this.vm, this.el);
    }
    this.frag = this.factory.create(this._host, this._scope, this._frag);
    this.frag.before(this.anchor);
  },

  remove: function remove() {
    if (this.frag) {
      this.frag.remove();
      this.frag = null;
    }
    if (this.elseEl && !this.elseFrag) {
      if (!this.elseFactory) {
        this.elseFactory = new FragmentFactory(this.elseEl._context || this.vm, this.elseEl);
      }
      this.elseFrag = this.elseFactory.create(this._host, this._scope, this._frag);
      this.elseFrag.before(this.anchor);
    }
  },

  unbind: function unbind() {
    if (this.frag) {
      this.frag.destroy();
    }
    if (this.elseFrag) {
      this.elseFrag.destroy();
    }
  }
};

var show = {

  bind: function bind() {
    // check else block
    var next = this.el.nextElementSibling;
    if (next && getAttr(next, 'v-else') !== null) {
      this.elseEl = next;
    }
  },

  update: function update(value) {
    this.apply(this.el, value);
    if (this.elseEl) {
      this.apply(this.elseEl, !value);
    }
  },

  apply: function apply(el, value) {
    if (inDoc(el)) {
      applyTransition(el, value ? 1 : -1, toggle, this.vm);
    } else {
      toggle();
    }
    function toggle() {
      el.style.display = value ? '' : 'none';
    }
  }
};

var text$2 = {

  bind: function bind() {
    var self = this;
    var el = this.el;
    var isRange = el.type === 'range';
    var lazy = this.params.lazy;
    var number = this.params.number;
    var debounce = this.params.debounce;

    // handle composition events.
    //   http://blog.evanyou.me/2014/01/03/composition-event/
    // skip this for Android because it handles composition
    // events quite differently. Android doesn't trigger
    // composition events for language input methods e.g.
    // Chinese, but instead triggers them for spelling
    // suggestions... (see Discussion/#162)
    var composing = false;
    if (!isAndroid && !isRange) {
      this.on('compositionstart', function () {
        composing = true;
      });
      this.on('compositionend', function () {
        composing = false;
        // in IE11 the "compositionend" event fires AFTER
        // the "input" event, so the input handler is blocked
        // at the end... have to call it here.
        //
        // #1327: in lazy mode this is unecessary.
        if (!lazy) {
          self.listener();
        }
      });
    }

    // prevent messing with the input when user is typing,
    // and force update on blur.
    this.focused = false;
    if (!isRange && !lazy) {
      this.on('focus', function () {
        self.focused = true;
      });
      this.on('blur', function () {
        self.focused = false;
        // do not sync value after fragment removal (#2017)
        if (!self._frag || self._frag.inserted) {
          self.rawListener();
        }
      });
    }

    // Now attach the main listener
    this.listener = this.rawListener = function () {
      if (composing || !self._bound) {
        return;
      }
      var val = number || isRange ? toNumber(el.value) : el.value;
      self.set(val);
      // force update on next tick to avoid lock & same value
      // also only update when user is not typing
      nextTick(function () {
        if (self._bound && !self.focused) {
          self.update(self._watcher.value);
        }
      });
    };

    // apply debounce
    if (debounce) {
      this.listener = _debounce(this.listener, debounce);
    }

    // Support jQuery events, since jQuery.trigger() doesn't
    // trigger native events in some cases and some plugins
    // rely on $.trigger()
    //
    // We want to make sure if a listener is attached using
    // jQuery, it is also removed with jQuery, that's why
    // we do the check for each directive instance and
    // store that check result on itself. This also allows
    // easier test coverage control by unsetting the global
    // jQuery variable in tests.
    this.hasjQuery = typeof jQuery === 'function';
    if (this.hasjQuery) {
      var method = jQuery.fn.on ? 'on' : 'bind';
      jQuery(el)[method]('change', this.rawListener);
      if (!lazy) {
        jQuery(el)[method]('input', this.listener);
      }
    } else {
      this.on('change', this.rawListener);
      if (!lazy) {
        this.on('input', this.listener);
      }
    }

    // IE9 doesn't fire input event on backspace/del/cut
    if (!lazy && isIE9) {
      this.on('cut', function () {
        nextTick(self.listener);
      });
      this.on('keyup', function (e) {
        if (e.keyCode === 46 || e.keyCode === 8) {
          self.listener();
        }
      });
    }

    // set initial value if present
    if (el.hasAttribute('value') || el.tagName === 'TEXTAREA' && el.value.trim()) {
      this.afterBind = this.listener;
    }
  },

  update: function update(value) {
    // #3029 only update when the value changes. This prevent
    // browsers from overwriting values like selectionStart
    value = _toString(value);
    if (value !== this.el.value) this.el.value = value;
  },

  unbind: function unbind() {
    var el = this.el;
    if (this.hasjQuery) {
      var method = jQuery.fn.off ? 'off' : 'unbind';
      jQuery(el)[method]('change', this.listener);
      jQuery(el)[method]('input', this.listener);
    }
  }
};

var radio = {

  bind: function bind() {
    var self = this;
    var el = this.el;

    this.getValue = function () {
      // value overwrite via v-bind:value
      if (el.hasOwnProperty('_value')) {
        return el._value;
      }
      var val = el.value;
      if (self.params.number) {
        val = toNumber(val);
      }
      return val;
    };

    this.listener = function () {
      self.set(self.getValue());
    };
    this.on('change', this.listener);

    if (el.hasAttribute('checked')) {
      this.afterBind = this.listener;
    }
  },

  update: function update(value) {
    this.el.checked = looseEqual(value, this.getValue());
  }
};

var select = {

  bind: function bind() {
    var _this = this;

    var self = this;
    var el = this.el;

    // method to force update DOM using latest value.
    this.forceUpdate = function () {
      if (self._watcher) {
        self.update(self._watcher.get());
      }
    };

    // check if this is a multiple select
    var multiple = this.multiple = el.hasAttribute('multiple');

    // attach listener
    this.listener = function () {
      var value = getValue(el, multiple);
      value = self.params.number ? isArray(value) ? value.map(toNumber) : toNumber(value) : value;
      self.set(value);
    };
    this.on('change', this.listener);

    // if has initial value, set afterBind
    var initValue = getValue(el, multiple, true);
    if (multiple && initValue.length || !multiple && initValue !== null) {
      this.afterBind = this.listener;
    }

    // All major browsers except Firefox resets
    // selectedIndex with value -1 to 0 when the element
    // is appended to a new parent, therefore we have to
    // force a DOM update whenever that happens...
    this.vm.$on('hook:attached', function () {
      nextTick(_this.forceUpdate);
    });
    if (!inDoc(el)) {
      nextTick(this.forceUpdate);
    }
  },

  update: function update(value) {
    var el = this.el;
    el.selectedIndex = -1;
    var multi = this.multiple && isArray(value);
    var options = el.options;
    var i = options.length;
    var op, val;
    while (i--) {
      op = options[i];
      val = op.hasOwnProperty('_value') ? op._value : op.value;
      /* eslint-disable eqeqeq */
      op.selected = multi ? indexOf$1(value, val) > -1 : looseEqual(value, val);
      /* eslint-enable eqeqeq */
    }
  },

  unbind: function unbind() {
    /* istanbul ignore next */
    this.vm.$off('hook:attached', this.forceUpdate);
  }
};

/**
 * Get select value
 *
 * @param {SelectElement} el
 * @param {Boolean} multi
 * @param {Boolean} init
 * @return {Array|*}
 */

function getValue(el, multi, init) {
  var res = multi ? [] : null;
  var op, val, selected;
  for (var i = 0, l = el.options.length; i < l; i++) {
    op = el.options[i];
    selected = init ? op.hasAttribute('selected') : op.selected;
    if (selected) {
      val = op.hasOwnProperty('_value') ? op._value : op.value;
      if (multi) {
        res.push(val);
      } else {
        return val;
      }
    }
  }
  return res;
}

/**
 * Native Array.indexOf uses strict equal, but in this
 * case we need to match string/numbers with custom equal.
 *
 * @param {Array} arr
 * @param {*} val
 */

function indexOf$1(arr, val) {
  var i = arr.length;
  while (i--) {
    if (looseEqual(arr[i], val)) {
      return i;
    }
  }
  return -1;
}

var checkbox = {

  bind: function bind() {
    var self = this;
    var el = this.el;

    this.getValue = function () {
      return el.hasOwnProperty('_value') ? el._value : self.params.number ? toNumber(el.value) : el.value;
    };

    function getBooleanValue() {
      var val = el.checked;
      if (val && el.hasOwnProperty('_trueValue')) {
        return el._trueValue;
      }
      if (!val && el.hasOwnProperty('_falseValue')) {
        return el._falseValue;
      }
      return val;
    }

    this.listener = function () {
      var model = self._watcher.value;
      if (isArray(model)) {
        var val = self.getValue();
        if (el.checked) {
          if (indexOf(model, val) < 0) {
            model.push(val);
          }
        } else {
          model.$remove(val);
        }
      } else {
        self.set(getBooleanValue());
      }
    };

    this.on('change', this.listener);
    if (el.hasAttribute('checked')) {
      this.afterBind = this.listener;
    }
  },

  update: function update(value) {
    var el = this.el;
    if (isArray(value)) {
      el.checked = indexOf(value, this.getValue()) > -1;
    } else {
      if (el.hasOwnProperty('_trueValue')) {
        el.checked = looseEqual(value, el._trueValue);
      } else {
        el.checked = !!value;
      }
    }
  }
};

var handlers = {
  text: text$2,
  radio: radio,
  select: select,
  checkbox: checkbox
};

var model = {

  priority: MODEL,
  twoWay: true,
  handlers: handlers,
  params: ['lazy', 'number', 'debounce'],

  /**
   * Possible elements:
   *   <select>
   *   <textarea>
   *   <input type="*">
   *     - text
   *     - checkbox
   *     - radio
   *     - number
   */

  bind: function bind() {
    // friendly warning...
    this.checkFilters();
    if (this.hasRead && !this.hasWrite) {
      process.env.NODE_ENV !== 'production' && warn('It seems you are using a read-only filter with ' + 'v-model="' + this.descriptor.raw + '". ' + 'You might want to use a two-way filter to ensure correct behavior.', this.vm);
    }
    var el = this.el;
    var tag = el.tagName;
    var handler;
    if (tag === 'INPUT') {
      handler = handlers[el.type] || handlers.text;
    } else if (tag === 'SELECT') {
      handler = handlers.select;
    } else if (tag === 'TEXTAREA') {
      handler = handlers.text;
    } else {
      process.env.NODE_ENV !== 'production' && warn('v-model does not support element type: ' + tag, this.vm);
      return;
    }
    el.__v_model = this;
    handler.bind.call(this);
    this.update = handler.update;
    this._unbind = handler.unbind;
  },

  /**
   * Check read/write filter stats.
   */

  checkFilters: function checkFilters() {
    var filters = this.filters;
    if (!filters) return;
    var i = filters.length;
    while (i--) {
      var filter = resolveAsset(this.vm.$options, 'filters', filters[i].name);
      if (typeof filter === 'function' || filter.read) {
        this.hasRead = true;
      }
      if (filter.write) {
        this.hasWrite = true;
      }
    }
  },

  unbind: function unbind() {
    this.el.__v_model = null;
    this._unbind && this._unbind();
  }
};

// keyCode aliases
var keyCodes = {
  esc: 27,
  tab: 9,
  enter: 13,
  space: 32,
  'delete': [8, 46],
  up: 38,
  left: 37,
  right: 39,
  down: 40
};

function keyFilter(handler, keys) {
  var codes = keys.map(function (key) {
    var charCode = key.charCodeAt(0);
    if (charCode > 47 && charCode < 58) {
      return parseInt(key, 10);
    }
    if (key.length === 1) {
      charCode = key.toUpperCase().charCodeAt(0);
      if (charCode > 64 && charCode < 91) {
        return charCode;
      }
    }
    return keyCodes[key];
  });
  codes = [].concat.apply([], codes);
  return function keyHandler(e) {
    if (codes.indexOf(e.keyCode) > -1) {
      return handler.call(this, e);
    }
  };
}

function stopFilter(handler) {
  return function stopHandler(e) {
    e.stopPropagation();
    return handler.call(this, e);
  };
}

function preventFilter(handler) {
  return function preventHandler(e) {
    e.preventDefault();
    return handler.call(this, e);
  };
}

function selfFilter(handler) {
  return function selfHandler(e) {
    if (e.target === e.currentTarget) {
      return handler.call(this, e);
    }
  };
}

var on$1 = {

  priority: ON,
  acceptStatement: true,
  keyCodes: keyCodes,

  bind: function bind() {
    // deal with iframes
    if (this.el.tagName === 'IFRAME' && this.arg !== 'load') {
      var self = this;
      this.iframeBind = function () {
        on(self.el.contentWindow, self.arg, self.handler, self.modifiers.capture);
      };
      this.on('load', this.iframeBind);
    }
  },

  update: function update(handler) {
    // stub a noop for v-on with no value,
    // e.g. @mousedown.prevent
    if (!this.descriptor.raw) {
      handler = function () {};
    }

    if (typeof handler !== 'function') {
      process.env.NODE_ENV !== 'production' && warn('v-on:' + this.arg + '="' + this.expression + '" expects a function value, ' + 'got ' + handler, this.vm);
      return;
    }

    // apply modifiers
    if (this.modifiers.stop) {
      handler = stopFilter(handler);
    }
    if (this.modifiers.prevent) {
      handler = preventFilter(handler);
    }
    if (this.modifiers.self) {
      handler = selfFilter(handler);
    }
    // key filter
    var keys = Object.keys(this.modifiers).filter(function (key) {
      return key !== 'stop' && key !== 'prevent' && key !== 'self' && key !== 'capture';
    });
    if (keys.length) {
      handler = keyFilter(handler, keys);
    }

    this.reset();
    this.handler = handler;

    if (this.iframeBind) {
      this.iframeBind();
    } else {
      on(this.el, this.arg, this.handler, this.modifiers.capture);
    }
  },

  reset: function reset() {
    var el = this.iframeBind ? this.el.contentWindow : this.el;
    if (this.handler) {
      off(el, this.arg, this.handler);
    }
  },

  unbind: function unbind() {
    this.reset();
  }
};

var prefixes = ['-webkit-', '-moz-', '-ms-'];
var camelPrefixes = ['Webkit', 'Moz', 'ms'];
var importantRE = /!important;?$/;
var propCache = Object.create(null);

var testEl = null;

var style = {

  deep: true,

  update: function update(value) {
    if (typeof value === 'string') {
      this.el.style.cssText = value;
    } else if (isArray(value)) {
      this.handleObject(value.reduce(extend, {}));
    } else {
      this.handleObject(value || {});
    }
  },

  handleObject: function handleObject(value) {
    // cache object styles so that only changed props
    // are actually updated.
    var cache = this.cache || (this.cache = {});
    var name, val;
    for (name in cache) {
      if (!(name in value)) {
        this.handleSingle(name, null);
        delete cache[name];
      }
    }
    for (name in value) {
      val = value[name];
      if (val !== cache[name]) {
        cache[name] = val;
        this.handleSingle(name, val);
      }
    }
  },

  handleSingle: function handleSingle(prop, value) {
    prop = normalize(prop);
    if (!prop) return; // unsupported prop
    // cast possible numbers/booleans into strings
    if (value != null) value += '';
    if (value) {
      var isImportant = importantRE.test(value) ? 'important' : '';
      if (isImportant) {
        /* istanbul ignore if */
        if (process.env.NODE_ENV !== 'production') {
          warn('It\'s probably a bad idea to use !important with inline rules. ' + 'This feature will be deprecated in a future version of Vue.');
        }
        value = value.replace(importantRE, '').trim();
        this.el.style.setProperty(prop.kebab, value, isImportant);
      } else {
        this.el.style[prop.camel] = value;
      }
    } else {
      this.el.style[prop.camel] = '';
    }
  }

};

/**
 * Normalize a CSS property name.
 * - cache result
 * - auto prefix
 * - camelCase -> dash-case
 *
 * @param {String} prop
 * @return {String}
 */

function normalize(prop) {
  if (propCache[prop]) {
    return propCache[prop];
  }
  var res = prefix(prop);
  propCache[prop] = propCache[res] = res;
  return res;
}

/**
 * Auto detect the appropriate prefix for a CSS property.
 * https://gist.github.com/paulirish/523692
 *
 * @param {String} prop
 * @return {String}
 */

function prefix(prop) {
  prop = hyphenate(prop);
  var camel = camelize(prop);
  var upper = camel.charAt(0).toUpperCase() + camel.slice(1);
  if (!testEl) {
    testEl = document.createElement('div');
  }
  var i = prefixes.length;
  var prefixed;
  if (camel !== 'filter' && camel in testEl.style) {
    return {
      kebab: prop,
      camel: camel
    };
  }
  while (i--) {
    prefixed = camelPrefixes[i] + upper;
    if (prefixed in testEl.style) {
      return {
        kebab: prefixes[i] + prop,
        camel: prefixed
      };
    }
  }
}

// xlink
var xlinkNS = 'http://www.w3.org/1999/xlink';
var xlinkRE = /^xlink:/;

// check for attributes that prohibit interpolations
var disallowedInterpAttrRE = /^v-|^:|^@|^(?:is|transition|transition-mode|debounce|track-by|stagger|enter-stagger|leave-stagger)$/;
// these attributes should also set their corresponding properties
// because they only affect the initial state of the element
var attrWithPropsRE = /^(?:value|checked|selected|muted)$/;
// these attributes expect enumrated values of "true" or "false"
// but are not boolean attributes
var enumeratedAttrRE = /^(?:draggable|contenteditable|spellcheck)$/;

// these attributes should set a hidden property for
// binding v-model to object values
var modelProps = {
  value: '_value',
  'true-value': '_trueValue',
  'false-value': '_falseValue'
};

var bind$1 = {

  priority: BIND,

  bind: function bind() {
    var attr = this.arg;
    var tag = this.el.tagName;
    // should be deep watch on object mode
    if (!attr) {
      this.deep = true;
    }
    // handle interpolation bindings
    var descriptor = this.descriptor;
    var tokens = descriptor.interp;
    if (tokens) {
      // handle interpolations with one-time tokens
      if (descriptor.hasOneTime) {
        this.expression = tokensToExp(tokens, this._scope || this.vm);
      }

      // only allow binding on native attributes
      if (disallowedInterpAttrRE.test(attr) || attr === 'name' && (tag === 'PARTIAL' || tag === 'SLOT')) {
        process.env.NODE_ENV !== 'production' && warn(attr + '="' + descriptor.raw + '": ' + 'attribute interpolation is not allowed in Vue.js ' + 'directives and special attributes.', this.vm);
        this.el.removeAttribute(attr);
        this.invalid = true;
      }

      /* istanbul ignore if */
      if (process.env.NODE_ENV !== 'production') {
        var raw = attr + '="' + descriptor.raw + '": ';
        // warn src
        if (attr === 'src') {
          warn(raw + 'interpolation in "src" attribute will cause ' + 'a 404 request. Use v-bind:src instead.', this.vm);
        }

        // warn style
        if (attr === 'style') {
          warn(raw + 'interpolation in "style" attribute will cause ' + 'the attribute to be discarded in Internet Explorer. ' + 'Use v-bind:style instead.', this.vm);
        }
      }
    }
  },

  update: function update(value) {
    if (this.invalid) {
      return;
    }
    var attr = this.arg;
    if (this.arg) {
      this.handleSingle(attr, value);
    } else {
      this.handleObject(value || {});
    }
  },

  // share object handler with v-bind:class
  handleObject: style.handleObject,

  handleSingle: function handleSingle(attr, value) {
    var el = this.el;
    var interp = this.descriptor.interp;
    if (this.modifiers.camel) {
      attr = camelize(attr);
    }
    if (!interp && attrWithPropsRE.test(attr) && attr in el) {
      var attrValue = attr === 'value' ? value == null // IE9 will set input.value to "null" for null...
      ? '' : value : value;

      if (el[attr] !== attrValue) {
        el[attr] = attrValue;
      }
    }
    // set model props
    var modelProp = modelProps[attr];
    if (!interp && modelProp) {
      el[modelProp] = value;
      // update v-model if present
      var model = el.__v_model;
      if (model) {
        model.listener();
      }
    }
    // do not set value attribute for textarea
    if (attr === 'value' && el.tagName === 'TEXTAREA') {
      el.removeAttribute(attr);
      return;
    }
    // update attribute
    if (enumeratedAttrRE.test(attr)) {
      el.setAttribute(attr, value ? 'true' : 'false');
    } else if (value != null && value !== false) {
      if (attr === 'class') {
        // handle edge case #1960:
        // class interpolation should not overwrite Vue transition class
        if (el.__v_trans) {
          value += ' ' + el.__v_trans.id + '-transition';
        }
        setClass(el, value);
      } else if (xlinkRE.test(attr)) {
        el.setAttributeNS(xlinkNS, attr, value === true ? '' : value);
      } else {
        el.setAttribute(attr, value === true ? '' : value);
      }
    } else {
      el.removeAttribute(attr);
    }
  }
};

var el = {

  priority: EL,

  bind: function bind() {
    /* istanbul ignore if */
    if (!this.arg) {
      return;
    }
    var id = this.id = camelize(this.arg);
    var refs = (this._scope || this.vm).$els;
    if (hasOwn(refs, id)) {
      refs[id] = this.el;
    } else {
      defineReactive(refs, id, this.el);
    }
  },

  unbind: function unbind() {
    var refs = (this._scope || this.vm).$els;
    if (refs[this.id] === this.el) {
      refs[this.id] = null;
    }
  }
};

var ref = {
  bind: function bind() {
    process.env.NODE_ENV !== 'production' && warn('v-ref:' + this.arg + ' must be used on a child ' + 'component. Found on <' + this.el.tagName.toLowerCase() + '>.', this.vm);
  }
};

var cloak = {
  bind: function bind() {
    var el = this.el;
    this.vm.$once('pre-hook:compiled', function () {
      el.removeAttribute('v-cloak');
    });
  }
};

// must export plain object
var directives = {
  text: text$1,
  html: html,
  'for': vFor,
  'if': vIf,
  show: show,
  model: model,
  on: on$1,
  bind: bind$1,
  el: el,
  ref: ref,
  cloak: cloak
};

var vClass = {

  deep: true,

  update: function update(value) {
    if (!value) {
      this.cleanup();
    } else if (typeof value === 'string') {
      this.setClass(value.trim().split(/\s+/));
    } else {
      this.setClass(normalize$1(value));
    }
  },

  setClass: function setClass(value) {
    this.cleanup(value);
    for (var i = 0, l = value.length; i < l; i++) {
      var val = value[i];
      if (val) {
        apply(this.el, val, addClass);
      }
    }
    this.prevKeys = value;
  },

  cleanup: function cleanup(value) {
    var prevKeys = this.prevKeys;
    if (!prevKeys) return;
    var i = prevKeys.length;
    while (i--) {
      var key = prevKeys[i];
      if (!value || value.indexOf(key) < 0) {
        apply(this.el, key, removeClass);
      }
    }
  }
};

/**
 * Normalize objects and arrays (potentially containing objects)
 * into array of strings.
 *
 * @param {Object|Array<String|Object>} value
 * @return {Array<String>}
 */

function normalize$1(value) {
  var res = [];
  if (isArray(value)) {
    for (var i = 0, l = value.length; i < l; i++) {
      var _key = value[i];
      if (_key) {
        if (typeof _key === 'string') {
          res.push(_key);
        } else {
          for (var k in _key) {
            if (_key[k]) res.push(k);
          }
        }
      }
    }
  } else if (isObject(value)) {
    for (var key in value) {
      if (value[key]) res.push(key);
    }
  }
  return res;
}

/**
 * Add or remove a class/classes on an element
 *
 * @param {Element} el
 * @param {String} key The class name. This may or may not
 *                     contain a space character, in such a
 *                     case we'll deal with multiple class
 *                     names at once.
 * @param {Function} fn
 */

function apply(el, key, fn) {
  key = key.trim();
  if (key.indexOf(' ') === -1) {
    fn(el, key);
    return;
  }
  // The key contains one or more space characters.
  // Since a class name doesn't accept such characters, we
  // treat it as multiple classes.
  var keys = key.split(/\s+/);
  for (var i = 0, l = keys.length; i < l; i++) {
    fn(el, keys[i]);
  }
}

var component = {

  priority: COMPONENT,

  params: ['keep-alive', 'transition-mode', 'inline-template'],

  /**
   * Setup. Two possible usages:
   *
   * - static:
   *   <comp> or <div v-component="comp">
   *
   * - dynamic:
   *   <component :is="view">
   */

  bind: function bind() {
    if (!this.el.__vue__) {
      // keep-alive cache
      this.keepAlive = this.params.keepAlive;
      if (this.keepAlive) {
        this.cache = {};
      }
      // check inline-template
      if (this.params.inlineTemplate) {
        // extract inline template as a DocumentFragment
        this.inlineTemplate = extractContent(this.el, true);
      }
      // component resolution related state
      this.pendingComponentCb = this.Component = null;
      // transition related state
      this.pendingRemovals = 0;
      this.pendingRemovalCb = null;
      // create a ref anchor
      this.anchor = createAnchor('v-component');
      replace(this.el, this.anchor);
      // remove is attribute.
      // this is removed during compilation, but because compilation is
      // cached, when the component is used elsewhere this attribute
      // will remain at link time.
      this.el.removeAttribute('is');
      this.el.removeAttribute(':is');
      // remove ref, same as above
      if (this.descriptor.ref) {
        this.el.removeAttribute('v-ref:' + hyphenate(this.descriptor.ref));
      }
      // if static, build right now.
      if (this.literal) {
        this.setComponent(this.expression);
      }
    } else {
      process.env.NODE_ENV !== 'production' && warn('cannot mount component "' + this.expression + '" ' + 'on already mounted element: ' + this.el);
    }
  },

  /**
   * Public update, called by the watcher in the dynamic
   * literal scenario, e.g. <component :is="view">
   */

  update: function update(value) {
    if (!this.literal) {
      this.setComponent(value);
    }
  },

  /**
   * Switch dynamic components. May resolve the component
   * asynchronously, and perform transition based on
   * specified transition mode. Accepts a few additional
   * arguments specifically for vue-router.
   *
   * The callback is called when the full transition is
   * finished.
   *
   * @param {String} value
   * @param {Function} [cb]
   */

  setComponent: function setComponent(value, cb) {
    this.invalidatePending();
    if (!value) {
      // just remove current
      this.unbuild(true);
      this.remove(this.childVM, cb);
      this.childVM = null;
    } else {
      var self = this;
      this.resolveComponent(value, function () {
        self.mountComponent(cb);
      });
    }
  },

  /**
   * Resolve the component constructor to use when creating
   * the child vm.
   *
   * @param {String|Function} value
   * @param {Function} cb
   */

  resolveComponent: function resolveComponent(value, cb) {
    var self = this;
    this.pendingComponentCb = cancellable(function (Component) {
      self.ComponentName = Component.options.name || (typeof value === 'string' ? value : null);
      self.Component = Component;
      cb();
    });
    this.vm._resolveComponent(value, this.pendingComponentCb);
  },

  /**
   * Create a new instance using the current constructor and
   * replace the existing instance. This method doesn't care
   * whether the new component and the old one are actually
   * the same.
   *
   * @param {Function} [cb]
   */

  mountComponent: function mountComponent(cb) {
    // actual mount
    this.unbuild(true);
    var self = this;
    var activateHooks = this.Component.options.activate;
    var cached = this.getCached();
    var newComponent = this.build();
    if (activateHooks && !cached) {
      this.waitingFor = newComponent;
      callActivateHooks(activateHooks, newComponent, function () {
        if (self.waitingFor !== newComponent) {
          return;
        }
        self.waitingFor = null;
        self.transition(newComponent, cb);
      });
    } else {
      // update ref for kept-alive component
      if (cached) {
        newComponent._updateRef();
      }
      this.transition(newComponent, cb);
    }
  },

  /**
   * When the component changes or unbinds before an async
   * constructor is resolved, we need to invalidate its
   * pending callback.
   */

  invalidatePending: function invalidatePending() {
    if (this.pendingComponentCb) {
      this.pendingComponentCb.cancel();
      this.pendingComponentCb = null;
    }
  },

  /**
   * Instantiate/insert a new child vm.
   * If keep alive and has cached instance, insert that
   * instance; otherwise build a new one and cache it.
   *
   * @param {Object} [extraOptions]
   * @return {Vue} - the created instance
   */

  build: function build(extraOptions) {
    var cached = this.getCached();
    if (cached) {
      return cached;
    }
    if (this.Component) {
      // default options
      var options = {
        name: this.ComponentName,
        el: cloneNode(this.el),
        template: this.inlineTemplate,
        // make sure to add the child with correct parent
        // if this is a transcluded component, its parent
        // should be the transclusion host.
        parent: this._host || this.vm,
        // if no inline-template, then the compiled
        // linker can be cached for better performance.
        _linkerCachable: !this.inlineTemplate,
        _ref: this.descriptor.ref,
        _asComponent: true,
        _isRouterView: this._isRouterView,
        // if this is a transcluded component, context
        // will be the common parent vm of this instance
        // and its host.
        _context: this.vm,
        // if this is inside an inline v-for, the scope
        // will be the intermediate scope created for this
        // repeat fragment. this is used for linking props
        // and container directives.
        _scope: this._scope,
        // pass in the owner fragment of this component.
        // this is necessary so that the fragment can keep
        // track of its contained components in order to
        // call attach/detach hooks for them.
        _frag: this._frag
      };
      // extra options
      // in 1.0.0 this is used by vue-router only
      /* istanbul ignore if */
      if (extraOptions) {
        extend(options, extraOptions);
      }
      var child = new this.Component(options);
      if (this.keepAlive) {
        this.cache[this.Component.cid] = child;
      }
      /* istanbul ignore if */
      if (process.env.NODE_ENV !== 'production' && this.el.hasAttribute('transition') && child._isFragment) {
        warn('Transitions will not work on a fragment instance. ' + 'Template: ' + child.$options.template, child);
      }
      return child;
    }
  },

  /**
   * Try to get a cached instance of the current component.
   *
   * @return {Vue|undefined}
   */

  getCached: function getCached() {
    return this.keepAlive && this.cache[this.Component.cid];
  },

  /**
   * Teardown the current child, but defers cleanup so
   * that we can separate the destroy and removal steps.
   *
   * @param {Boolean} defer
   */

  unbuild: function unbuild(defer) {
    if (this.waitingFor) {
      if (!this.keepAlive) {
        this.waitingFor.$destroy();
      }
      this.waitingFor = null;
    }
    var child = this.childVM;
    if (!child || this.keepAlive) {
      if (child) {
        // remove ref
        child._inactive = true;
        child._updateRef(true);
      }
      return;
    }
    // the sole purpose of `deferCleanup` is so that we can
    // "deactivate" the vm right now and perform DOM removal
    // later.
    child.$destroy(false, defer);
  },

  /**
   * Remove current destroyed child and manually do
   * the cleanup after removal.
   *
   * @param {Function} cb
   */

  remove: function remove(child, cb) {
    var keepAlive = this.keepAlive;
    if (child) {
      // we may have a component switch when a previous
      // component is still being transitioned out.
      // we want to trigger only one lastest insertion cb
      // when the existing transition finishes. (#1119)
      this.pendingRemovals++;
      this.pendingRemovalCb = cb;
      var self = this;
      child.$remove(function () {
        self.pendingRemovals--;
        if (!keepAlive) child._cleanup();
        if (!self.pendingRemovals && self.pendingRemovalCb) {
          self.pendingRemovalCb();
          self.pendingRemovalCb = null;
        }
      });
    } else if (cb) {
      cb();
    }
  },

  /**
   * Actually swap the components, depending on the
   * transition mode. Defaults to simultaneous.
   *
   * @param {Vue} target
   * @param {Function} [cb]
   */

  transition: function transition(target, cb) {
    var self = this;
    var current = this.childVM;
    // for devtool inspection
    if (current) current._inactive = true;
    target._inactive = false;
    this.childVM = target;
    switch (self.params.transitionMode) {
      case 'in-out':
        target.$before(self.anchor, function () {
          self.remove(current, cb);
        });
        break;
      case 'out-in':
        self.remove(current, function () {
          target.$before(self.anchor, cb);
        });
        break;
      default:
        self.remove(current);
        target.$before(self.anchor, cb);
    }
  },

  /**
   * Unbind.
   */

  unbind: function unbind() {
    this.invalidatePending();
    // Do not defer cleanup when unbinding
    this.unbuild();
    // destroy all keep-alive cached instances
    if (this.cache) {
      for (var key in this.cache) {
        this.cache[key].$destroy();
      }
      this.cache = null;
    }
  }
};

/**
 * Call activate hooks in order (asynchronous)
 *
 * @param {Array} hooks
 * @param {Vue} vm
 * @param {Function} cb
 */

function callActivateHooks(hooks, vm, cb) {
  var total = hooks.length;
  var called = 0;
  hooks[0].call(vm, next);
  function next() {
    if (++called >= total) {
      cb();
    } else {
      hooks[called].call(vm, next);
    }
  }
}

var propBindingModes = config._propBindingModes;
var empty = {};

// regexes
var identRE$1 = /^[$_a-zA-Z]+[\w$]*$/;
var settablePathRE = /^[A-Za-z_$][\w$]*(\.[A-Za-z_$][\w$]*|\[[^\[\]]+\])*$/;

/**
 * Compile props on a root element and return
 * a props link function.
 *
 * @param {Element|DocumentFragment} el
 * @param {Array} propOptions
 * @param {Vue} vm
 * @return {Function} propsLinkFn
 */

function compileProps(el, propOptions, vm) {
  var props = [];
  var names = Object.keys(propOptions);
  var i = names.length;
  var options, name, attr, value, path, parsed, prop;
  while (i--) {
    name = names[i];
    options = propOptions[name] || empty;

    if (process.env.NODE_ENV !== 'production' && name === '$data') {
      warn('Do not use $data as prop.', vm);
      continue;
    }

    // props could contain dashes, which will be
    // interpreted as minus calculations by the parser
    // so we need to camelize the path here
    path = camelize(name);
    if (!identRE$1.test(path)) {
      process.env.NODE_ENV !== 'production' && warn('Invalid prop key: "' + name + '". Prop keys ' + 'must be valid identifiers.', vm);
      continue;
    }

    prop = {
      name: name,
      path: path,
      options: options,
      mode: propBindingModes.ONE_WAY,
      raw: null
    };

    attr = hyphenate(name);
    // first check dynamic version
    if ((value = getBindAttr(el, attr)) === null) {
      if ((value = getBindAttr(el, attr + '.sync')) !== null) {
        prop.mode = propBindingModes.TWO_WAY;
      } else if ((value = getBindAttr(el, attr + '.once')) !== null) {
        prop.mode = propBindingModes.ONE_TIME;
      }
    }
    if (value !== null) {
      // has dynamic binding!
      prop.raw = value;
      parsed = parseDirective(value);
      value = parsed.expression;
      prop.filters = parsed.filters;
      // check binding type
      if (isLiteral(value) && !parsed.filters) {
        // for expressions containing literal numbers and
        // booleans, there's no need to setup a prop binding,
        // so we can optimize them as a one-time set.
        prop.optimizedLiteral = true;
      } else {
        prop.dynamic = true;
        // check non-settable path for two-way bindings
        if (process.env.NODE_ENV !== 'production' && prop.mode === propBindingModes.TWO_WAY && !settablePathRE.test(value)) {
          prop.mode = propBindingModes.ONE_WAY;
          warn('Cannot bind two-way prop with non-settable ' + 'parent path: ' + value, vm);
        }
      }
      prop.parentPath = value;

      // warn required two-way
      if (process.env.NODE_ENV !== 'production' && options.twoWay && prop.mode !== propBindingModes.TWO_WAY) {
        warn('Prop "' + name + '" expects a two-way binding type.', vm);
      }
    } else if ((value = getAttr(el, attr)) !== null) {
      // has literal binding!
      prop.raw = value;
    } else if (process.env.NODE_ENV !== 'production') {
      // check possible camelCase prop usage
      var lowerCaseName = path.toLowerCase();
      value = /[A-Z\-]/.test(name) && (el.getAttribute(lowerCaseName) || el.getAttribute(':' + lowerCaseName) || el.getAttribute('v-bind:' + lowerCaseName) || el.getAttribute(':' + lowerCaseName + '.once') || el.getAttribute('v-bind:' + lowerCaseName + '.once') || el.getAttribute(':' + lowerCaseName + '.sync') || el.getAttribute('v-bind:' + lowerCaseName + '.sync'));
      if (value) {
        warn('Possible usage error for prop `' + lowerCaseName + '` - ' + 'did you mean `' + attr + '`? HTML is case-insensitive, remember to use ' + 'kebab-case for props in templates.', vm);
      } else if (options.required) {
        // warn missing required
        warn('Missing required prop: ' + name, vm);
      }
    }
    // push prop
    props.push(prop);
  }
  return makePropsLinkFn(props);
}

/**
 * Build a function that applies props to a vm.
 *
 * @param {Array} props
 * @return {Function} propsLinkFn
 */

function makePropsLinkFn(props) {
  return function propsLinkFn(vm, scope) {
    // store resolved props info
    vm._props = {};
    var inlineProps = vm.$options.propsData;
    var i = props.length;
    var prop, path, options, value, raw;
    while (i--) {
      prop = props[i];
      raw = prop.raw;
      path = prop.path;
      options = prop.options;
      vm._props[path] = prop;
      if (inlineProps && hasOwn(inlineProps, path)) {
        initProp(vm, prop, inlineProps[path]);
      }if (raw === null) {
        // initialize absent prop
        initProp(vm, prop, undefined);
      } else if (prop.dynamic) {
        // dynamic prop
        if (prop.mode === propBindingModes.ONE_TIME) {
          // one time binding
          value = (scope || vm._context || vm).$get(prop.parentPath);
          initProp(vm, prop, value);
        } else {
          if (vm._context) {
            // dynamic binding
            vm._bindDir({
              name: 'prop',
              def: propDef,
              prop: prop
            }, null, null, scope); // el, host, scope
          } else {
              // root instance
              initProp(vm, prop, vm.$get(prop.parentPath));
            }
        }
      } else if (prop.optimizedLiteral) {
        // optimized literal, cast it and just set once
        var stripped = stripQuotes(raw);
        value = stripped === raw ? toBoolean(toNumber(raw)) : stripped;
        initProp(vm, prop, value);
      } else {
        // string literal, but we need to cater for
        // Boolean props with no value, or with same
        // literal value (e.g. disabled="disabled")
        // see https://github.com/vuejs/vue-loader/issues/182
        value = options.type === Boolean && (raw === '' || raw === hyphenate(prop.name)) ? true : raw;
        initProp(vm, prop, value);
      }
    }
  };
}

/**
 * Process a prop with a rawValue, applying necessary coersions,
 * default values & assertions and call the given callback with
 * processed value.
 *
 * @param {Vue} vm
 * @param {Object} prop
 * @param {*} rawValue
 * @param {Function} fn
 */

function processPropValue(vm, prop, rawValue, fn) {
  var isSimple = prop.dynamic && isSimplePath(prop.parentPath);
  var value = rawValue;
  if (value === undefined) {
    value = getPropDefaultValue(vm, prop);
  }
  value = coerceProp(prop, value, vm);
  var coerced = value !== rawValue;
  if (!assertProp(prop, value, vm)) {
    value = undefined;
  }
  if (isSimple && !coerced) {
    withoutConversion(function () {
      fn(value);
    });
  } else {
    fn(value);
  }
}

/**
 * Set a prop's initial value on a vm and its data object.
 *
 * @param {Vue} vm
 * @param {Object} prop
 * @param {*} value
 */

function initProp(vm, prop, value) {
  processPropValue(vm, prop, value, function (value) {
    defineReactive(vm, prop.path, value);
  });
}

/**
 * Update a prop's value on a vm.
 *
 * @param {Vue} vm
 * @param {Object} prop
 * @param {*} value
 */

function updateProp(vm, prop, value) {
  processPropValue(vm, prop, value, function (value) {
    vm[prop.path] = value;
  });
}

/**
 * Get the default value of a prop.
 *
 * @param {Vue} vm
 * @param {Object} prop
 * @return {*}
 */

function getPropDefaultValue(vm, prop) {
  // no default, return undefined
  var options = prop.options;
  if (!hasOwn(options, 'default')) {
    // absent boolean value defaults to false
    return options.type === Boolean ? false : undefined;
  }
  var def = options['default'];
  // warn against non-factory defaults for Object & Array
  if (isObject(def)) {
    process.env.NODE_ENV !== 'production' && warn('Invalid default value for prop "' + prop.name + '": ' + 'Props with type Object/Array must use a factory function ' + 'to return the default value.', vm);
  }
  // call factory function for non-Function types
  return typeof def === 'function' && options.type !== Function ? def.call(vm) : def;
}

/**
 * Assert whether a prop is valid.
 *
 * @param {Object} prop
 * @param {*} value
 * @param {Vue} vm
 */

function assertProp(prop, value, vm) {
  if (!prop.options.required && ( // non-required
  prop.raw === null || // abscent
  value == null) // null or undefined
  ) {
      return true;
    }
  var options = prop.options;
  var type = options.type;
  var valid = !type;
  var expectedTypes = [];
  if (type) {
    if (!isArray(type)) {
      type = [type];
    }
    for (var i = 0; i < type.length && !valid; i++) {
      var assertedType = assertType(value, type[i]);
      expectedTypes.push(assertedType.expectedType);
      valid = assertedType.valid;
    }
  }
  if (!valid) {
    if (process.env.NODE_ENV !== 'production') {
      warn('Invalid prop: type check failed for prop "' + prop.name + '".' + ' Expected ' + expectedTypes.map(formatType).join(', ') + ', got ' + formatValue(value) + '.', vm);
    }
    return false;
  }
  var validator = options.validator;
  if (validator) {
    if (!validator(value)) {
      process.env.NODE_ENV !== 'production' && warn('Invalid prop: custom validator check failed for prop "' + prop.name + '".', vm);
      return false;
    }
  }
  return true;
}

/**
 * Force parsing value with coerce option.
 *
 * @param {*} value
 * @param {Object} options
 * @return {*}
 */

function coerceProp(prop, value, vm) {
  var coerce = prop.options.coerce;
  if (!coerce) {
    return value;
  }
  if (typeof coerce === 'function') {
    return coerce(value);
  } else {
    process.env.NODE_ENV !== 'production' && warn('Invalid coerce for prop "' + prop.name + '": expected function, got ' + typeof coerce + '.', vm);
    return value;
  }
}

/**
 * Assert the type of a value
 *
 * @param {*} value
 * @param {Function} type
 * @return {Object}
 */

function assertType(value, type) {
  var valid;
  var expectedType;
  if (type === String) {
    expectedType = 'string';
    valid = typeof value === expectedType;
  } else if (type === Number) {
    expectedType = 'number';
    valid = typeof value === expectedType;
  } else if (type === Boolean) {
    expectedType = 'boolean';
    valid = typeof value === expectedType;
  } else if (type === Function) {
    expectedType = 'function';
    valid = typeof value === expectedType;
  } else if (type === Object) {
    expectedType = 'object';
    valid = isPlainObject(value);
  } else if (type === Array) {
    expectedType = 'array';
    valid = isArray(value);
  } else {
    valid = value instanceof type;
  }
  return {
    valid: valid,
    expectedType: expectedType
  };
}

/**
 * Format type for output
 *
 * @param {String} type
 * @return {String}
 */

function formatType(type) {
  return type ? type.charAt(0).toUpperCase() + type.slice(1) : 'custom type';
}

/**
 * Format value
 *
 * @param {*} value
 * @return {String}
 */

function formatValue(val) {
  return Object.prototype.toString.call(val).slice(8, -1);
}

var bindingModes = config._propBindingModes;

var propDef = {

  bind: function bind() {
    var child = this.vm;
    var parent = child._context;
    // passed in from compiler directly
    var prop = this.descriptor.prop;
    var childKey = prop.path;
    var parentKey = prop.parentPath;
    var twoWay = prop.mode === bindingModes.TWO_WAY;

    var parentWatcher = this.parentWatcher = new Watcher(parent, parentKey, function (val) {
      updateProp(child, prop, val);
    }, {
      twoWay: twoWay,
      filters: prop.filters,
      // important: props need to be observed on the
      // v-for scope if present
      scope: this._scope
    });

    // set the child initial value.
    initProp(child, prop, parentWatcher.value);

    // setup two-way binding
    if (twoWay) {
      // important: defer the child watcher creation until
      // the created hook (after data observation)
      var self = this;
      child.$once('pre-hook:created', function () {
        self.childWatcher = new Watcher(child, childKey, function (val) {
          parentWatcher.set(val);
        }, {
          // ensure sync upward before parent sync down.
          // this is necessary in cases e.g. the child
          // mutates a prop array, then replaces it. (#1683)
          sync: true
        });
      });
    }
  },

  unbind: function unbind() {
    this.parentWatcher.teardown();
    if (this.childWatcher) {
      this.childWatcher.teardown();
    }
  }
};

var queue$1 = [];
var queued = false;

/**
 * Push a job into the queue.
 *
 * @param {Function} job
 */

function pushJob(job) {
  queue$1.push(job);
  if (!queued) {
    queued = true;
    nextTick(flush);
  }
}

/**
 * Flush the queue, and do one forced reflow before
 * triggering transitions.
 */

function flush() {
  // Force layout
  var f = document.documentElement.offsetHeight;
  for (var i = 0; i < queue$1.length; i++) {
    queue$1[i]();
  }
  queue$1 = [];
  queued = false;
  // dummy return, so js linters don't complain about
  // unused variable f
  return f;
}

var TYPE_TRANSITION = 'transition';
var TYPE_ANIMATION = 'animation';
var transDurationProp = transitionProp + 'Duration';
var animDurationProp = animationProp + 'Duration';

/**
 * If a just-entered element is applied the
 * leave class while its enter transition hasn't started yet,
 * and the transitioned property has the same value for both
 * enter/leave, then the leave transition will be skipped and
 * the transitionend event never fires. This function ensures
 * its callback to be called after a transition has started
 * by waiting for double raf.
 *
 * It falls back to setTimeout on devices that support CSS
 * transitions but not raf (e.g. Android 4.2 browser) - since
 * these environments are usually slow, we are giving it a
 * relatively large timeout.
 */

var raf = inBrowser && window.requestAnimationFrame;
var waitForTransitionStart = raf
/* istanbul ignore next */
? function (fn) {
  raf(function () {
    raf(fn);
  });
} : function (fn) {
  setTimeout(fn, 50);
};

/**
 * A Transition object that encapsulates the state and logic
 * of the transition.
 *
 * @param {Element} el
 * @param {String} id
 * @param {Object} hooks
 * @param {Vue} vm
 */
function Transition(el, id, hooks, vm) {
  this.id = id;
  this.el = el;
  this.enterClass = hooks && hooks.enterClass || id + '-enter';
  this.leaveClass = hooks && hooks.leaveClass || id + '-leave';
  this.hooks = hooks;
  this.vm = vm;
  // async state
  this.pendingCssEvent = this.pendingCssCb = this.cancel = this.pendingJsCb = this.op = this.cb = null;
  this.justEntered = false;
  this.entered = this.left = false;
  this.typeCache = {};
  // check css transition type
  this.type = hooks && hooks.type;
  /* istanbul ignore if */
  if (process.env.NODE_ENV !== 'production') {
    if (this.type && this.type !== TYPE_TRANSITION && this.type !== TYPE_ANIMATION) {
      warn('invalid CSS transition type for transition="' + this.id + '": ' + this.type, vm);
    }
  }
  // bind
  var self = this;['enterNextTick', 'enterDone', 'leaveNextTick', 'leaveDone'].forEach(function (m) {
    self[m] = bind(self[m], self);
  });
}

var p$1 = Transition.prototype;

/**
 * Start an entering transition.
 *
 * 1. enter transition triggered
 * 2. call beforeEnter hook
 * 3. add enter class
 * 4. insert/show element
 * 5. call enter hook (with possible explicit js callback)
 * 6. reflow
 * 7. based on transition type:
 *    - transition:
 *        remove class now, wait for transitionend,
 *        then done if there's no explicit js callback.
 *    - animation:
 *        wait for animationend, remove class,
 *        then done if there's no explicit js callback.
 *    - no css transition:
 *        done now if there's no explicit js callback.
 * 8. wait for either done or js callback, then call
 *    afterEnter hook.
 *
 * @param {Function} op - insert/show the element
 * @param {Function} [cb]
 */

p$1.enter = function (op, cb) {
  this.cancelPending();
  this.callHook('beforeEnter');
  this.cb = cb;
  addClass(this.el, this.enterClass);
  op();
  this.entered = false;
  this.callHookWithCb('enter');
  if (this.entered) {
    return; // user called done synchronously.
  }
  this.cancel = this.hooks && this.hooks.enterCancelled;
  pushJob(this.enterNextTick);
};

/**
 * The "nextTick" phase of an entering transition, which is
 * to be pushed into a queue and executed after a reflow so
 * that removing the class can trigger a CSS transition.
 */

p$1.enterNextTick = function () {
  var _this = this;

  // prevent transition skipping
  this.justEntered = true;
  waitForTransitionStart(function () {
    _this.justEntered = false;
  });
  var enterDone = this.enterDone;
  var type = this.getCssTransitionType(this.enterClass);
  if (!this.pendingJsCb) {
    if (type === TYPE_TRANSITION) {
      // trigger transition by removing enter class now
      removeClass(this.el, this.enterClass);
      this.setupCssCb(transitionEndEvent, enterDone);
    } else if (type === TYPE_ANIMATION) {
      this.setupCssCb(animationEndEvent, enterDone);
    } else {
      enterDone();
    }
  } else if (type === TYPE_TRANSITION) {
    removeClass(this.el, this.enterClass);
  }
};

/**
 * The "cleanup" phase of an entering transition.
 */

p$1.enterDone = function () {
  this.entered = true;
  this.cancel = this.pendingJsCb = null;
  removeClass(this.el, this.enterClass);
  this.callHook('afterEnter');
  if (this.cb) this.cb();
};

/**
 * Start a leaving transition.
 *
 * 1. leave transition triggered.
 * 2. call beforeLeave hook
 * 3. add leave class (trigger css transition)
 * 4. call leave hook (with possible explicit js callback)
 * 5. reflow if no explicit js callback is provided
 * 6. based on transition type:
 *    - transition or animation:
 *        wait for end event, remove class, then done if
 *        there's no explicit js callback.
 *    - no css transition:
 *        done if there's no explicit js callback.
 * 7. wait for either done or js callback, then call
 *    afterLeave hook.
 *
 * @param {Function} op - remove/hide the element
 * @param {Function} [cb]
 */

p$1.leave = function (op, cb) {
  this.cancelPending();
  this.callHook('beforeLeave');
  this.op = op;
  this.cb = cb;
  addClass(this.el, this.leaveClass);
  this.left = false;
  this.callHookWithCb('leave');
  if (this.left) {
    return; // user called done synchronously.
  }
  this.cancel = this.hooks && this.hooks.leaveCancelled;
  // only need to handle leaveDone if
  // 1. the transition is already done (synchronously called
  //    by the user, which causes this.op set to null)
  // 2. there's no explicit js callback
  if (this.op && !this.pendingJsCb) {
    // if a CSS transition leaves immediately after enter,
    // the transitionend event never fires. therefore we
    // detect such cases and end the leave immediately.
    if (this.justEntered) {
      this.leaveDone();
    } else {
      pushJob(this.leaveNextTick);
    }
  }
};

/**
 * The "nextTick" phase of a leaving transition.
 */

p$1.leaveNextTick = function () {
  var type = this.getCssTransitionType(this.leaveClass);
  if (type) {
    var event = type === TYPE_TRANSITION ? transitionEndEvent : animationEndEvent;
    this.setupCssCb(event, this.leaveDone);
  } else {
    this.leaveDone();
  }
};

/**
 * The "cleanup" phase of a leaving transition.
 */

p$1.leaveDone = function () {
  this.left = true;
  this.cancel = this.pendingJsCb = null;
  this.op();
  removeClass(this.el, this.leaveClass);
  this.callHook('afterLeave');
  if (this.cb) this.cb();
  this.op = null;
};

/**
 * Cancel any pending callbacks from a previously running
 * but not finished transition.
 */

p$1.cancelPending = function () {
  this.op = this.cb = null;
  var hasPending = false;
  if (this.pendingCssCb) {
    hasPending = true;
    off(this.el, this.pendingCssEvent, this.pendingCssCb);
    this.pendingCssEvent = this.pendingCssCb = null;
  }
  if (this.pendingJsCb) {
    hasPending = true;
    this.pendingJsCb.cancel();
    this.pendingJsCb = null;
  }
  if (hasPending) {
    removeClass(this.el, this.enterClass);
    removeClass(this.el, this.leaveClass);
  }
  if (this.cancel) {
    this.cancel.call(this.vm, this.el);
    this.cancel = null;
  }
};

/**
 * Call a user-provided synchronous hook function.
 *
 * @param {String} type
 */

p$1.callHook = function (type) {
  if (this.hooks && this.hooks[type]) {
    this.hooks[type].call(this.vm, this.el);
  }
};

/**
 * Call a user-provided, potentially-async hook function.
 * We check for the length of arguments to see if the hook
 * expects a `done` callback. If true, the transition's end
 * will be determined by when the user calls that callback;
 * otherwise, the end is determined by the CSS transition or
 * animation.
 *
 * @param {String} type
 */

p$1.callHookWithCb = function (type) {
  var hook = this.hooks && this.hooks[type];
  if (hook) {
    if (hook.length > 1) {
      this.pendingJsCb = cancellable(this[type + 'Done']);
    }
    hook.call(this.vm, this.el, this.pendingJsCb);
  }
};

/**
 * Get an element's transition type based on the
 * calculated styles.
 *
 * @param {String} className
 * @return {Number}
 */

p$1.getCssTransitionType = function (className) {
  /* istanbul ignore if */
  if (!transitionEndEvent ||
  // skip CSS transitions if page is not visible -
  // this solves the issue of transitionend events not
  // firing until the page is visible again.
  // pageVisibility API is supported in IE10+, same as
  // CSS transitions.
  document.hidden ||
  // explicit js-only transition
  this.hooks && this.hooks.css === false ||
  // element is hidden
  isHidden(this.el)) {
    return;
  }
  var type = this.type || this.typeCache[className];
  if (type) return type;
  var inlineStyles = this.el.style;
  var computedStyles = window.getComputedStyle(this.el);
  var transDuration = inlineStyles[transDurationProp] || computedStyles[transDurationProp];
  if (transDuration && transDuration !== '0s') {
    type = TYPE_TRANSITION;
  } else {
    var animDuration = inlineStyles[animDurationProp] || computedStyles[animDurationProp];
    if (animDuration && animDuration !== '0s') {
      type = TYPE_ANIMATION;
    }
  }
  if (type) {
    this.typeCache[className] = type;
  }
  return type;
};

/**
 * Setup a CSS transitionend/animationend callback.
 *
 * @param {String} event
 * @param {Function} cb
 */

p$1.setupCssCb = function (event, cb) {
  this.pendingCssEvent = event;
  var self = this;
  var el = this.el;
  var onEnd = this.pendingCssCb = function (e) {
    if (e.target === el) {
      off(el, event, onEnd);
      self.pendingCssEvent = self.pendingCssCb = null;
      if (!self.pendingJsCb && cb) {
        cb();
      }
    }
  };
  on(el, event, onEnd);
};

/**
 * Check if an element is hidden - in that case we can just
 * skip the transition alltogether.
 *
 * @param {Element} el
 * @return {Boolean}
 */

function isHidden(el) {
  if (/svg$/.test(el.namespaceURI)) {
    // SVG elements do not have offset(Width|Height)
    // so we need to check the client rect
    var rect = el.getBoundingClientRect();
    return !(rect.width || rect.height);
  } else {
    return !(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
  }
}

var transition$1 = {

  priority: TRANSITION,

  update: function update(id, oldId) {
    var el = this.el;
    // resolve on owner vm
    var hooks = resolveAsset(this.vm.$options, 'transitions', id);
    id = id || 'v';
    oldId = oldId || 'v';
    el.__v_trans = new Transition(el, id, hooks, this.vm);
    removeClass(el, oldId + '-transition');
    addClass(el, id + '-transition');
  }
};

var internalDirectives = {
  style: style,
  'class': vClass,
  component: component,
  prop: propDef,
  transition: transition$1
};

// special binding prefixes
var bindRE = /^v-bind:|^:/;
var onRE = /^v-on:|^@/;
var dirAttrRE = /^v-([^:]+)(?:$|:(.*)$)/;
var modifierRE = /\.[^\.]+/g;
var transitionRE = /^(v-bind:|:)?transition$/;

// default directive priority
var DEFAULT_PRIORITY = 1000;
var DEFAULT_TERMINAL_PRIORITY = 2000;

/**
 * Compile a template and return a reusable composite link
 * function, which recursively contains more link functions
 * inside. This top level compile function would normally
 * be called on instance root nodes, but can also be used
 * for partial compilation if the partial argument is true.
 *
 * The returned composite link function, when called, will
 * return an unlink function that tearsdown all directives
 * created during the linking phase.
 *
 * @param {Element|DocumentFragment} el
 * @param {Object} options
 * @param {Boolean} partial
 * @return {Function}
 */

function compile(el, options, partial) {
  // link function for the node itself.
  var nodeLinkFn = partial || !options._asComponent ? compileNode(el, options) : null;
  // link function for the childNodes
  var childLinkFn = !(nodeLinkFn && nodeLinkFn.terminal) && !isScript(el) && el.hasChildNodes() ? compileNodeList(el.childNodes, options) : null;

  /**
   * A composite linker function to be called on a already
   * compiled piece of DOM, which instantiates all directive
   * instances.
   *
   * @param {Vue} vm
   * @param {Element|DocumentFragment} el
   * @param {Vue} [host] - host vm of transcluded content
   * @param {Object} [scope] - v-for scope
   * @param {Fragment} [frag] - link context fragment
   * @return {Function|undefined}
   */

  return function compositeLinkFn(vm, el, host, scope, frag) {
    // cache childNodes before linking parent, fix #657
    var childNodes = toArray(el.childNodes);
    // link
    var dirs = linkAndCapture(function compositeLinkCapturer() {
      if (nodeLinkFn) nodeLinkFn(vm, el, host, scope, frag);
      if (childLinkFn) childLinkFn(vm, childNodes, host, scope, frag);
    }, vm);
    return makeUnlinkFn(vm, dirs);
  };
}

/**
 * Apply a linker to a vm/element pair and capture the
 * directives created during the process.
 *
 * @param {Function} linker
 * @param {Vue} vm
 */

function linkAndCapture(linker, vm) {
  /* istanbul ignore if */
  if (process.env.NODE_ENV === 'production') {
    // reset directives before every capture in production
    // mode, so that when unlinking we don't need to splice
    // them out (which turns out to be a perf hit).
    // they are kept in development mode because they are
    // useful for Vue's own tests.
    vm._directives = [];
  }
  var originalDirCount = vm._directives.length;
  linker();
  var dirs = vm._directives.slice(originalDirCount);
  dirs.sort(directiveComparator);
  for (var i = 0, l = dirs.length; i < l; i++) {
    dirs[i]._bind();
  }
  return dirs;
}

/**
 * Directive priority sort comparator
 *
 * @param {Object} a
 * @param {Object} b
 */

function directiveComparator(a, b) {
  a = a.descriptor.def.priority || DEFAULT_PRIORITY;
  b = b.descriptor.def.priority || DEFAULT_PRIORITY;
  return a > b ? -1 : a === b ? 0 : 1;
}

/**
 * Linker functions return an unlink function that
 * tearsdown all directives instances generated during
 * the process.
 *
 * We create unlink functions with only the necessary
 * information to avoid retaining additional closures.
 *
 * @param {Vue} vm
 * @param {Array} dirs
 * @param {Vue} [context]
 * @param {Array} [contextDirs]
 * @return {Function}
 */

function makeUnlinkFn(vm, dirs, context, contextDirs) {
  function unlink(destroying) {
    teardownDirs(vm, dirs, destroying);
    if (context && contextDirs) {
      teardownDirs(context, contextDirs);
    }
  }
  // expose linked directives
  unlink.dirs = dirs;
  return unlink;
}

/**
 * Teardown partial linked directives.
 *
 * @param {Vue} vm
 * @param {Array} dirs
 * @param {Boolean} destroying
 */

function teardownDirs(vm, dirs, destroying) {
  var i = dirs.length;
  while (i--) {
    dirs[i]._teardown();
    if (process.env.NODE_ENV !== 'production' && !destroying) {
      vm._directives.$remove(dirs[i]);
    }
  }
}

/**
 * Compile link props on an instance.
 *
 * @param {Vue} vm
 * @param {Element} el
 * @param {Object} props
 * @param {Object} [scope]
 * @return {Function}
 */

function compileAndLinkProps(vm, el, props, scope) {
  var propsLinkFn = compileProps(el, props, vm);
  var propDirs = linkAndCapture(function () {
    propsLinkFn(vm, scope);
  }, vm);
  return makeUnlinkFn(vm, propDirs);
}

/**
 * Compile the root element of an instance.
 *
 * 1. attrs on context container (context scope)
 * 2. attrs on the component template root node, if
 *    replace:true (child scope)
 *
 * If this is a fragment instance, we only need to compile 1.
 *
 * @param {Element} el
 * @param {Object} options
 * @param {Object} contextOptions
 * @return {Function}
 */

function compileRoot(el, options, contextOptions) {
  var containerAttrs = options._containerAttrs;
  var replacerAttrs = options._replacerAttrs;
  var contextLinkFn, replacerLinkFn;

  // only need to compile other attributes for
  // non-fragment instances
  if (el.nodeType !== 11) {
    // for components, container and replacer need to be
    // compiled separately and linked in different scopes.
    if (options._asComponent) {
      // 2. container attributes
      if (containerAttrs && contextOptions) {
        contextLinkFn = compileDirectives(containerAttrs, contextOptions);
      }
      if (replacerAttrs) {
        // 3. replacer attributes
        replacerLinkFn = compileDirectives(replacerAttrs, options);
      }
    } else {
      // non-component, just compile as a normal element.
      replacerLinkFn = compileDirectives(el.attributes, options);
    }
  } else if (process.env.NODE_ENV !== 'production' && containerAttrs) {
    // warn container directives for fragment instances
    var names = containerAttrs.filter(function (attr) {
      // allow vue-loader/vueify scoped css attributes
      return attr.name.indexOf('_v-') < 0 &&
      // allow event listeners
      !onRE.test(attr.name) &&
      // allow slots
      attr.name !== 'slot';
    }).map(function (attr) {
      return '"' + attr.name + '"';
    });
    if (names.length) {
      var plural = names.length > 1;
      warn('Attribute' + (plural ? 's ' : ' ') + names.join(', ') + (plural ? ' are' : ' is') + ' ignored on component ' + '<' + options.el.tagName.toLowerCase() + '> because ' + 'the component is a fragment instance: ' + 'http://vuejs.org/guide/components.html#Fragment-Instance');
    }
  }

  options._containerAttrs = options._replacerAttrs = null;
  return function rootLinkFn(vm, el, scope) {
    // link context scope dirs
    var context = vm._context;
    var contextDirs;
    if (context && contextLinkFn) {
      contextDirs = linkAndCapture(function () {
        contextLinkFn(context, el, null, scope);
      }, context);
    }

    // link self
    var selfDirs = linkAndCapture(function () {
      if (replacerLinkFn) replacerLinkFn(vm, el);
    }, vm);

    // return the unlink function that tearsdown context
    // container directives.
    return makeUnlinkFn(vm, selfDirs, context, contextDirs);
  };
}

/**
 * Compile a node and return a nodeLinkFn based on the
 * node type.
 *
 * @param {Node} node
 * @param {Object} options
 * @return {Function|null}
 */

function compileNode(node, options) {
  var type = node.nodeType;
  if (type === 1 && !isScript(node)) {
    return compileElement(node, options);
  } else if (type === 3 && node.data.trim()) {
    return compileTextNode(node, options);
  } else {
    return null;
  }
}

/**
 * Compile an element and return a nodeLinkFn.
 *
 * @param {Element} el
 * @param {Object} options
 * @return {Function|null}
 */

function compileElement(el, options) {
  // preprocess textareas.
  // textarea treats its text content as the initial value.
  // just bind it as an attr directive for value.
  if (el.tagName === 'TEXTAREA') {
    var tokens = parseText(el.value);
    if (tokens) {
      el.setAttribute(':value', tokensToExp(tokens));
      el.value = '';
    }
  }
  var linkFn;
  var hasAttrs = el.hasAttributes();
  var attrs = hasAttrs && toArray(el.attributes);
  // check terminal directives (for & if)
  if (hasAttrs) {
    linkFn = checkTerminalDirectives(el, attrs, options);
  }
  // check element directives
  if (!linkFn) {
    linkFn = checkElementDirectives(el, options);
  }
  // check component
  if (!linkFn) {
    linkFn = checkComponent(el, options);
  }
  // normal directives
  if (!linkFn && hasAttrs) {
    linkFn = compileDirectives(attrs, options);
  }
  return linkFn;
}

/**
 * Compile a textNode and return a nodeLinkFn.
 *
 * @param {TextNode} node
 * @param {Object} options
 * @return {Function|null} textNodeLinkFn
 */

function compileTextNode(node, options) {
  // skip marked text nodes
  if (node._skip) {
    return removeText;
  }

  var tokens = parseText(node.wholeText);
  if (!tokens) {
    return null;
  }

  // mark adjacent text nodes as skipped,
  // because we are using node.wholeText to compile
  // all adjacent text nodes together. This fixes
  // issues in IE where sometimes it splits up a single
  // text node into multiple ones.
  var next = node.nextSibling;
  while (next && next.nodeType === 3) {
    next._skip = true;
    next = next.nextSibling;
  }

  var frag = document.createDocumentFragment();
  var el, token;
  for (var i = 0, l = tokens.length; i < l; i++) {
    token = tokens[i];
    el = token.tag ? processTextToken(token, options) : document.createTextNode(token.value);
    frag.appendChild(el);
  }
  return makeTextNodeLinkFn(tokens, frag, options);
}

/**
 * Linker for an skipped text node.
 *
 * @param {Vue} vm
 * @param {Text} node
 */

function removeText(vm, node) {
  remove(node);
}

/**
 * Process a single text token.
 *
 * @param {Object} token
 * @param {Object} options
 * @return {Node}
 */

function processTextToken(token, options) {
  var el;
  if (token.oneTime) {
    el = document.createTextNode(token.value);
  } else {
    if (token.html) {
      el = document.createComment('v-html');
      setTokenType('html');
    } else {
      // IE will clean up empty textNodes during
      // frag.cloneNode(true), so we have to give it
      // something here...
      el = document.createTextNode(' ');
      setTokenType('text');
    }
  }
  function setTokenType(type) {
    if (token.descriptor) return;
    var parsed = parseDirective(token.value);
    token.descriptor = {
      name: type,
      def: directives[type],
      expression: parsed.expression,
      filters: parsed.filters
    };
  }
  return el;
}

/**
 * Build a function that processes a textNode.
 *
 * @param {Array<Object>} tokens
 * @param {DocumentFragment} frag
 */

function makeTextNodeLinkFn(tokens, frag) {
  return function textNodeLinkFn(vm, el, host, scope) {
    var fragClone = frag.cloneNode(true);
    var childNodes = toArray(fragClone.childNodes);
    var token, value, node;
    for (var i = 0, l = tokens.length; i < l; i++) {
      token = tokens[i];
      value = token.value;
      if (token.tag) {
        node = childNodes[i];
        if (token.oneTime) {
          value = (scope || vm).$eval(value);
          if (token.html) {
            replace(node, parseTemplate(value, true));
          } else {
            node.data = _toString(value);
          }
        } else {
          vm._bindDir(token.descriptor, node, host, scope);
        }
      }
    }
    replace(el, fragClone);
  };
}

/**
 * Compile a node list and return a childLinkFn.
 *
 * @param {NodeList} nodeList
 * @param {Object} options
 * @return {Function|undefined}
 */

function compileNodeList(nodeList, options) {
  var linkFns = [];
  var nodeLinkFn, childLinkFn, node;
  for (var i = 0, l = nodeList.length; i < l; i++) {
    node = nodeList[i];
    nodeLinkFn = compileNode(node, options);
    childLinkFn = !(nodeLinkFn && nodeLinkFn.terminal) && node.tagName !== 'SCRIPT' && node.hasChildNodes() ? compileNodeList(node.childNodes, options) : null;
    linkFns.push(nodeLinkFn, childLinkFn);
  }
  return linkFns.length ? makeChildLinkFn(linkFns) : null;
}

/**
 * Make a child link function for a node's childNodes.
 *
 * @param {Array<Function>} linkFns
 * @return {Function} childLinkFn
 */

function makeChildLinkFn(linkFns) {
  return function childLinkFn(vm, nodes, host, scope, frag) {
    var node, nodeLinkFn, childrenLinkFn;
    for (var i = 0, n = 0, l = linkFns.length; i < l; n++) {
      node = nodes[n];
      nodeLinkFn = linkFns[i++];
      childrenLinkFn = linkFns[i++];
      // cache childNodes before linking parent, fix #657
      var childNodes = toArray(node.childNodes);
      if (nodeLinkFn) {
        nodeLinkFn(vm, node, host, scope, frag);
      }
      if (childrenLinkFn) {
        childrenLinkFn(vm, childNodes, host, scope, frag);
      }
    }
  };
}

/**
 * Check for element directives (custom elements that should
 * be resovled as terminal directives).
 *
 * @param {Element} el
 * @param {Object} options
 */

function checkElementDirectives(el, options) {
  var tag = el.tagName.toLowerCase();
  if (commonTagRE.test(tag)) {
    return;
  }
  var def = resolveAsset(options, 'elementDirectives', tag);
  if (def) {
    return makeTerminalNodeLinkFn(el, tag, '', options, def);
  }
}

/**
 * Check if an element is a component. If yes, return
 * a component link function.
 *
 * @param {Element} el
 * @param {Object} options
 * @return {Function|undefined}
 */

function checkComponent(el, options) {
  var component = checkComponentAttr(el, options);
  if (component) {
    var ref = findRef(el);
    var descriptor = {
      name: 'component',
      ref: ref,
      expression: component.id,
      def: internalDirectives.component,
      modifiers: {
        literal: !component.dynamic
      }
    };
    var componentLinkFn = function componentLinkFn(vm, el, host, scope, frag) {
      if (ref) {
        defineReactive((scope || vm).$refs, ref, null);
      }
      vm._bindDir(descriptor, el, host, scope, frag);
    };
    componentLinkFn.terminal = true;
    return componentLinkFn;
  }
}

/**
 * Check an element for terminal directives in fixed order.
 * If it finds one, return a terminal link function.
 *
 * @param {Element} el
 * @param {Array} attrs
 * @param {Object} options
 * @return {Function} terminalLinkFn
 */

function checkTerminalDirectives(el, attrs, options) {
  // skip v-pre
  if (getAttr(el, 'v-pre') !== null) {
    return skip;
  }
  // skip v-else block, but only if following v-if
  if (el.hasAttribute('v-else')) {
    var prev = el.previousElementSibling;
    if (prev && prev.hasAttribute('v-if')) {
      return skip;
    }
  }

  var attr, name, value, modifiers, matched, dirName, rawName, arg, def, termDef;
  for (var i = 0, j = attrs.length; i < j; i++) {
    attr = attrs[i];
    name = attr.name.replace(modifierRE, '');
    if (matched = name.match(dirAttrRE)) {
      def = resolveAsset(options, 'directives', matched[1]);
      if (def && def.terminal) {
        if (!termDef || (def.priority || DEFAULT_TERMINAL_PRIORITY) > termDef.priority) {
          termDef = def;
          rawName = attr.name;
          modifiers = parseModifiers(attr.name);
          value = attr.value;
          dirName = matched[1];
          arg = matched[2];
        }
      }
    }
  }

  if (termDef) {
    return makeTerminalNodeLinkFn(el, dirName, value, options, termDef, rawName, arg, modifiers);
  }
}

function skip() {}
skip.terminal = true;

/**
 * Build a node link function for a terminal directive.
 * A terminal link function terminates the current
 * compilation recursion and handles compilation of the
 * subtree in the directive.
 *
 * @param {Element} el
 * @param {String} dirName
 * @param {String} value
 * @param {Object} options
 * @param {Object} def
 * @param {String} [rawName]
 * @param {String} [arg]
 * @param {Object} [modifiers]
 * @return {Function} terminalLinkFn
 */

function makeTerminalNodeLinkFn(el, dirName, value, options, def, rawName, arg, modifiers) {
  var parsed = parseDirective(value);
  var descriptor = {
    name: dirName,
    arg: arg,
    expression: parsed.expression,
    filters: parsed.filters,
    raw: value,
    attr: rawName,
    modifiers: modifiers,
    def: def
  };
  // check ref for v-for and router-view
  if (dirName === 'for' || dirName === 'router-view') {
    descriptor.ref = findRef(el);
  }
  var fn = function terminalNodeLinkFn(vm, el, host, scope, frag) {
    if (descriptor.ref) {
      defineReactive((scope || vm).$refs, descriptor.ref, null);
    }
    vm._bindDir(descriptor, el, host, scope, frag);
  };
  fn.terminal = true;
  return fn;
}

/**
 * Compile the directives on an element and return a linker.
 *
 * @param {Array|NamedNodeMap} attrs
 * @param {Object} options
 * @return {Function}
 */

function compileDirectives(attrs, options) {
  var i = attrs.length;
  var dirs = [];
  var attr, name, value, rawName, rawValue, dirName, arg, modifiers, dirDef, tokens, matched;
  while (i--) {
    attr = attrs[i];
    name = rawName = attr.name;
    value = rawValue = attr.value;
    tokens = parseText(value);
    // reset arg
    arg = null;
    // check modifiers
    modifiers = parseModifiers(name);
    name = name.replace(modifierRE, '');

    // attribute interpolations
    if (tokens) {
      value = tokensToExp(tokens);
      arg = name;
      pushDir('bind', directives.bind, tokens);
      // warn against mixing mustaches with v-bind
      if (process.env.NODE_ENV !== 'production') {
        if (name === 'class' && Array.prototype.some.call(attrs, function (attr) {
          return attr.name === ':class' || attr.name === 'v-bind:class';
        })) {
          warn('class="' + rawValue + '": Do not mix mustache interpolation ' + 'and v-bind for "class" on the same element. Use one or the other.', options);
        }
      }
    } else

      // special attribute: transition
      if (transitionRE.test(name)) {
        modifiers.literal = !bindRE.test(name);
        pushDir('transition', internalDirectives.transition);
      } else

        // event handlers
        if (onRE.test(name)) {
          arg = name.replace(onRE, '');
          pushDir('on', directives.on);
        } else

          // attribute bindings
          if (bindRE.test(name)) {
            dirName = name.replace(bindRE, '');
            if (dirName === 'style' || dirName === 'class') {
              pushDir(dirName, internalDirectives[dirName]);
            } else {
              arg = dirName;
              pushDir('bind', directives.bind);
            }
          } else

            // normal directives
            if (matched = name.match(dirAttrRE)) {
              dirName = matched[1];
              arg = matched[2];

              // skip v-else (when used with v-show)
              if (dirName === 'else') {
                continue;
              }

              dirDef = resolveAsset(options, 'directives', dirName, true);
              if (dirDef) {
                pushDir(dirName, dirDef);
              }
            }
  }

  /**
   * Push a directive.
   *
   * @param {String} dirName
   * @param {Object|Function} def
   * @param {Array} [interpTokens]
   */

  function pushDir(dirName, def, interpTokens) {
    var hasOneTimeToken = interpTokens && hasOneTime(interpTokens);
    var parsed = !hasOneTimeToken && parseDirective(value);
    dirs.push({
      name: dirName,
      attr: rawName,
      raw: rawValue,
      def: def,
      arg: arg,
      modifiers: modifiers,
      // conversion from interpolation strings with one-time token
      // to expression is differed until directive bind time so that we
      // have access to the actual vm context for one-time bindings.
      expression: parsed && parsed.expression,
      filters: parsed && parsed.filters,
      interp: interpTokens,
      hasOneTime: hasOneTimeToken
    });
  }

  if (dirs.length) {
    return makeNodeLinkFn(dirs);
  }
}

/**
 * Parse modifiers from directive attribute name.
 *
 * @param {String} name
 * @return {Object}
 */

function parseModifiers(name) {
  var res = Object.create(null);
  var match = name.match(modifierRE);
  if (match) {
    var i = match.length;
    while (i--) {
      res[match[i].slice(1)] = true;
    }
  }
  return res;
}

/**
 * Build a link function for all directives on a single node.
 *
 * @param {Array} directives
 * @return {Function} directivesLinkFn
 */

function makeNodeLinkFn(directives) {
  return function nodeLinkFn(vm, el, host, scope, frag) {
    // reverse apply because it's sorted low to high
    var i = directives.length;
    while (i--) {
      vm._bindDir(directives[i], el, host, scope, frag);
    }
  };
}

/**
 * Check if an interpolation string contains one-time tokens.
 *
 * @param {Array} tokens
 * @return {Boolean}
 */

function hasOneTime(tokens) {
  var i = tokens.length;
  while (i--) {
    if (tokens[i].oneTime) return true;
  }
}

function isScript(el) {
  return el.tagName === 'SCRIPT' && (!el.hasAttribute('type') || el.getAttribute('type') === 'text/javascript');
}

var specialCharRE = /[^\w\-:\.]/;

/**
 * Process an element or a DocumentFragment based on a
 * instance option object. This allows us to transclude
 * a template node/fragment before the instance is created,
 * so the processed fragment can then be cloned and reused
 * in v-for.
 *
 * @param {Element} el
 * @param {Object} options
 * @return {Element|DocumentFragment}
 */

function transclude(el, options) {
  // extract container attributes to pass them down
  // to compiler, because they need to be compiled in
  // parent scope. we are mutating the options object here
  // assuming the same object will be used for compile
  // right after this.
  if (options) {
    options._containerAttrs = extractAttrs(el);
  }
  // for template tags, what we want is its content as
  // a documentFragment (for fragment instances)
  if (isTemplate(el)) {
    el = parseTemplate(el);
  }
  if (options) {
    if (options._asComponent && !options.template) {
      options.template = '<slot></slot>';
    }
    if (options.template) {
      options._content = extractContent(el);
      el = transcludeTemplate(el, options);
    }
  }
  if (isFragment(el)) {
    // anchors for fragment instance
    // passing in `persist: true` to avoid them being
    // discarded by IE during template cloning
    prepend(createAnchor('v-start', true), el);
    el.appendChild(createAnchor('v-end', true));
  }
  return el;
}

/**
 * Process the template option.
 * If the replace option is true this will swap the $el.
 *
 * @param {Element} el
 * @param {Object} options
 * @return {Element|DocumentFragment}
 */

function transcludeTemplate(el, options) {
  var template = options.template;
  var frag = parseTemplate(template, true);
  if (frag) {
    var replacer = frag.firstChild;
    var tag = replacer.tagName && replacer.tagName.toLowerCase();
    if (options.replace) {
      /* istanbul ignore if */
      if (el === document.body) {
        process.env.NODE_ENV !== 'production' && warn('You are mounting an instance with a template to ' + '<body>. This will replace <body> entirely. You ' + 'should probably use `replace: false` here.');
      }
      // there are many cases where the instance must
      // become a fragment instance: basically anything that
      // can create more than 1 root nodes.
      if (
      // multi-children template
      frag.childNodes.length > 1 ||
      // non-element template
      replacer.nodeType !== 1 ||
      // single nested component
      tag === 'component' || resolveAsset(options, 'components', tag) || hasBindAttr(replacer, 'is') ||
      // element directive
      resolveAsset(options, 'elementDirectives', tag) ||
      // for block
      replacer.hasAttribute('v-for') ||
      // if block
      replacer.hasAttribute('v-if')) {
        return frag;
      } else {
        options._replacerAttrs = extractAttrs(replacer);
        mergeAttrs(el, replacer);
        return replacer;
      }
    } else {
      el.appendChild(frag);
      return el;
    }
  } else {
    process.env.NODE_ENV !== 'production' && warn('Invalid template option: ' + template);
  }
}

/**
 * Helper to extract a component container's attributes
 * into a plain object array.
 *
 * @param {Element} el
 * @return {Array}
 */

function extractAttrs(el) {
  if (el.nodeType === 1 && el.hasAttributes()) {
    return toArray(el.attributes);
  }
}

/**
 * Merge the attributes of two elements, and make sure
 * the class names are merged properly.
 *
 * @param {Element} from
 * @param {Element} to
 */

function mergeAttrs(from, to) {
  var attrs = from.attributes;
  var i = attrs.length;
  var name, value;
  while (i--) {
    name = attrs[i].name;
    value = attrs[i].value;
    if (!to.hasAttribute(name) && !specialCharRE.test(name)) {
      to.setAttribute(name, value);
    } else if (name === 'class' && !parseText(value) && (value = value.trim())) {
      value.split(/\s+/).forEach(function (cls) {
        addClass(to, cls);
      });
    }
  }
}

/**
 * Scan and determine slot content distribution.
 * We do this during transclusion instead at compile time so that
 * the distribution is decoupled from the compilation order of
 * the slots.
 *
 * @param {Element|DocumentFragment} template
 * @param {Element} content
 * @param {Vue} vm
 */

function resolveSlots(vm, content) {
  if (!content) {
    return;
  }
  var contents = vm._slotContents = Object.create(null);
  var el, name;
  for (var i = 0, l = content.children.length; i < l; i++) {
    el = content.children[i];
    /* eslint-disable no-cond-assign */
    if (name = el.getAttribute('slot')) {
      (contents[name] || (contents[name] = [])).push(el);
    }
    /* eslint-enable no-cond-assign */
    if (process.env.NODE_ENV !== 'production' && getBindAttr(el, 'slot')) {
      warn('The "slot" attribute must be static.', vm.$parent);
    }
  }
  for (name in contents) {
    contents[name] = extractFragment(contents[name], content);
  }
  if (content.hasChildNodes()) {
    var nodes = content.childNodes;
    if (nodes.length === 1 && nodes[0].nodeType === 3 && !nodes[0].data.trim()) {
      return;
    }
    contents['default'] = extractFragment(content.childNodes, content);
  }
}

/**
 * Extract qualified content nodes from a node list.
 *
 * @param {NodeList} nodes
 * @return {DocumentFragment}
 */

function extractFragment(nodes, parent) {
  var frag = document.createDocumentFragment();
  nodes = toArray(nodes);
  for (var i = 0, l = nodes.length; i < l; i++) {
    var node = nodes[i];
    if (isTemplate(node) && !node.hasAttribute('v-if') && !node.hasAttribute('v-for')) {
      parent.removeChild(node);
      node = parseTemplate(node, true);
    }
    frag.appendChild(node);
  }
  return frag;
}



var compiler = Object.freeze({
	compile: compile,
	compileAndLinkProps: compileAndLinkProps,
	compileRoot: compileRoot,
	transclude: transclude,
	resolveSlots: resolveSlots
});

function stateMixin (Vue) {
  /**
   * Accessor for `$data` property, since setting $data
   * requires observing the new object and updating
   * proxied properties.
   */

  Object.defineProperty(Vue.prototype, '$data', {
    get: function get() {
      return this._data;
    },
    set: function set(newData) {
      if (newData !== this._data) {
        this._setData(newData);
      }
    }
  });

  /**
   * Setup the scope of an instance, which contains:
   * - observed data
   * - computed properties
   * - user methods
   * - meta properties
   */

  Vue.prototype._initState = function () {
    this._initProps();
    this._initMeta();
    this._initMethods();
    this._initData();
    this._initComputed();
  };

  /**
   * Initialize props.
   */

  Vue.prototype._initProps = function () {
    var options = this.$options;
    var el = options.el;
    var props = options.props;
    if (props && !el) {
      process.env.NODE_ENV !== 'production' && warn('Props will not be compiled if no `el` option is ' + 'provided at instantiation.', this);
    }
    // make sure to convert string selectors into element now
    el = options.el = query(el);
    this._propsUnlinkFn = el && el.nodeType === 1 && props
    // props must be linked in proper scope if inside v-for
    ? compileAndLinkProps(this, el, props, this._scope) : null;
  };

  /**
   * Initialize the data.
   */

  Vue.prototype._initData = function () {
    var dataFn = this.$options.data;
    var data = this._data = dataFn ? dataFn() : {};
    if (!isPlainObject(data)) {
      data = {};
      process.env.NODE_ENV !== 'production' && warn('data functions should return an object.', this);
    }
    var props = this._props;
    // proxy data on instance
    var keys = Object.keys(data);
    var i, key;
    i = keys.length;
    while (i--) {
      key = keys[i];
      // there are two scenarios where we can proxy a data key:
      // 1. it's not already defined as a prop
      // 2. it's provided via a instantiation option AND there are no
      //    template prop present
      if (!props || !hasOwn(props, key)) {
        this._proxy(key);
      } else if (process.env.NODE_ENV !== 'production') {
        warn('Data field "' + key + '" is already defined ' + 'as a prop. To provide default value for a prop, use the "default" ' + 'prop option; if you want to pass prop values to an instantiation ' + 'call, use the "propsData" option.', this);
      }
    }
    // observe data
    observe(data, this);
  };

  /**
   * Swap the instance's $data. Called in $data's setter.
   *
   * @param {Object} newData
   */

  Vue.prototype._setData = function (newData) {
    newData = newData || {};
    var oldData = this._data;
    this._data = newData;
    var keys, key, i;
    // unproxy keys not present in new data
    keys = Object.keys(oldData);
    i = keys.length;
    while (i--) {
      key = keys[i];
      if (!(key in newData)) {
        this._unproxy(key);
      }
    }
    // proxy keys not already proxied,
    // and trigger change for changed values
    keys = Object.keys(newData);
    i = keys.length;
    while (i--) {
      key = keys[i];
      if (!hasOwn(this, key)) {
        // new property
        this._proxy(key);
      }
    }
    oldData.__ob__.removeVm(this);
    observe(newData, this);
    this._digest();
  };

  /**
   * Proxy a property, so that
   * vm.prop === vm._data.prop
   *
   * @param {String} key
   */

  Vue.prototype._proxy = function (key) {
    if (!isReserved(key)) {
      // need to store ref to self here
      // because these getter/setters might
      // be called by child scopes via
      // prototype inheritance.
      var self = this;
      Object.defineProperty(self, key, {
        configurable: true,
        enumerable: true,
        get: function proxyGetter() {
          return self._data[key];
        },
        set: function proxySetter(val) {
          self._data[key] = val;
        }
      });
    }
  };

  /**
   * Unproxy a property.
   *
   * @param {String} key
   */

  Vue.prototype._unproxy = function (key) {
    if (!isReserved(key)) {
      delete this[key];
    }
  };

  /**
   * Force update on every watcher in scope.
   */

  Vue.prototype._digest = function () {
    for (var i = 0, l = this._watchers.length; i < l; i++) {
      this._watchers[i].update(true); // shallow updates
    }
  };

  /**
   * Setup computed properties. They are essentially
   * special getter/setters
   */

  function noop() {}
  Vue.prototype._initComputed = function () {
    var computed = this.$options.computed;
    if (computed) {
      for (var key in computed) {
        var userDef = computed[key];
        var def = {
          enumerable: true,
          configurable: true
        };
        if (typeof userDef === 'function') {
          def.get = makeComputedGetter(userDef, this);
          def.set = noop;
        } else {
          def.get = userDef.get ? userDef.cache !== false ? makeComputedGetter(userDef.get, this) : bind(userDef.get, this) : noop;
          def.set = userDef.set ? bind(userDef.set, this) : noop;
        }
        Object.defineProperty(this, key, def);
      }
    }
  };

  function makeComputedGetter(getter, owner) {
    var watcher = new Watcher(owner, getter, null, {
      lazy: true
    });
    return function computedGetter() {
      if (watcher.dirty) {
        watcher.evaluate();
      }
      if (Dep.target) {
        watcher.depend();
      }
      return watcher.value;
    };
  }

  /**
   * Setup instance methods. Methods must be bound to the
   * instance since they might be passed down as a prop to
   * child components.
   */

  Vue.prototype._initMethods = function () {
    var methods = this.$options.methods;
    if (methods) {
      for (var key in methods) {
        this[key] = bind(methods[key], this);
      }
    }
  };

  /**
   * Initialize meta information like $index, $key & $value.
   */

  Vue.prototype._initMeta = function () {
    var metas = this.$options._meta;
    if (metas) {
      for (var key in metas) {
        defineReactive(this, key, metas[key]);
      }
    }
  };
}

var eventRE = /^v-on:|^@/;

function eventsMixin (Vue) {
  /**
   * Setup the instance's option events & watchers.
   * If the value is a string, we pull it from the
   * instance's methods by name.
   */

  Vue.prototype._initEvents = function () {
    var options = this.$options;
    if (options._asComponent) {
      registerComponentEvents(this, options.el);
    }
    registerCallbacks(this, '$on', options.events);
    registerCallbacks(this, '$watch', options.watch);
  };

  /**
   * Register v-on events on a child component
   *
   * @param {Vue} vm
   * @param {Element} el
   */

  function registerComponentEvents(vm, el) {
    var attrs = el.attributes;
    var name, value, handler;
    for (var i = 0, l = attrs.length; i < l; i++) {
      name = attrs[i].name;
      if (eventRE.test(name)) {
        name = name.replace(eventRE, '');
        // force the expression into a statement so that
        // it always dynamically resolves the method to call (#2670)
        // kinda ugly hack, but does the job.
        value = attrs[i].value;
        if (isSimplePath(value)) {
          value += '.apply(this, $arguments)';
        }
        handler = (vm._scope || vm._context).$eval(value, true);
        handler._fromParent = true;
        vm.$on(name.replace(eventRE), handler);
      }
    }
  }

  /**
   * Register callbacks for option events and watchers.
   *
   * @param {Vue} vm
   * @param {String} action
   * @param {Object} hash
   */

  function registerCallbacks(vm, action, hash) {
    if (!hash) return;
    var handlers, key, i, j;
    for (key in hash) {
      handlers = hash[key];
      if (isArray(handlers)) {
        for (i = 0, j = handlers.length; i < j; i++) {
          register(vm, action, key, handlers[i]);
        }
      } else {
        register(vm, action, key, handlers);
      }
    }
  }

  /**
   * Helper to register an event/watch callback.
   *
   * @param {Vue} vm
   * @param {String} action
   * @param {String} key
   * @param {Function|String|Object} handler
   * @param {Object} [options]
   */

  function register(vm, action, key, handler, options) {
    var type = typeof handler;
    if (type === 'function') {
      vm[action](key, handler, options);
    } else if (type === 'string') {
      var methods = vm.$options.methods;
      var method = methods && methods[handler];
      if (method) {
        vm[action](key, method, options);
      } else {
        process.env.NODE_ENV !== 'production' && warn('Unknown method: "' + handler + '" when ' + 'registering callback for ' + action + ': "' + key + '".', vm);
      }
    } else if (handler && type === 'object') {
      register(vm, action, key, handler.handler, handler);
    }
  }

  /**
   * Setup recursive attached/detached calls
   */

  Vue.prototype._initDOMHooks = function () {
    this.$on('hook:attached', onAttached);
    this.$on('hook:detached', onDetached);
  };

  /**
   * Callback to recursively call attached hook on children
   */

  function onAttached() {
    if (!this._isAttached) {
      this._isAttached = true;
      this.$children.forEach(callAttach);
    }
  }

  /**
   * Iterator to call attached hook
   *
   * @param {Vue} child
   */

  function callAttach(child) {
    if (!child._isAttached && inDoc(child.$el)) {
      child._callHook('attached');
    }
  }

  /**
   * Callback to recursively call detached hook on children
   */

  function onDetached() {
    if (this._isAttached) {
      this._isAttached = false;
      this.$children.forEach(callDetach);
    }
  }

  /**
   * Iterator to call detached hook
   *
   * @param {Vue} child
   */

  function callDetach(child) {
    if (child._isAttached && !inDoc(child.$el)) {
      child._callHook('detached');
    }
  }

  /**
   * Trigger all handlers for a hook
   *
   * @param {String} hook
   */

  Vue.prototype._callHook = function (hook) {
    this.$emit('pre-hook:' + hook);
    var handlers = this.$options[hook];
    if (handlers) {
      for (var i = 0, j = handlers.length; i < j; i++) {
        handlers[i].call(this);
      }
    }
    this.$emit('hook:' + hook);
  };
}

function noop$1() {}

/**
 * A directive links a DOM element with a piece of data,
 * which is the result of evaluating an expression.
 * It registers a watcher with the expression and calls
 * the DOM update function when a change is triggered.
 *
 * @param {Object} descriptor
 *                 - {String} name
 *                 - {Object} def
 *                 - {String} expression
 *                 - {Array<Object>} [filters]
 *                 - {Object} [modifiers]
 *                 - {Boolean} literal
 *                 - {String} attr
 *                 - {String} arg
 *                 - {String} raw
 *                 - {String} [ref]
 *                 - {Array<Object>} [interp]
 *                 - {Boolean} [hasOneTime]
 * @param {Vue} vm
 * @param {Node} el
 * @param {Vue} [host] - transclusion host component
 * @param {Object} [scope] - v-for scope
 * @param {Fragment} [frag] - owner fragment
 * @constructor
 */
function Directive(descriptor, vm, el, host, scope, frag) {
  this.vm = vm;
  this.el = el;
  // copy descriptor properties
  this.descriptor = descriptor;
  this.name = descriptor.name;
  this.expression = descriptor.expression;
  this.arg = descriptor.arg;
  this.modifiers = descriptor.modifiers;
  this.filters = descriptor.filters;
  this.literal = this.modifiers && this.modifiers.literal;
  // private
  this._locked = false;
  this._bound = false;
  this._listeners = null;
  // link context
  this._host = host;
  this._scope = scope;
  this._frag = frag;
  // store directives on node in dev mode
  if (process.env.NODE_ENV !== 'production' && this.el) {
    this.el._vue_directives = this.el._vue_directives || [];
    this.el._vue_directives.push(this);
  }
}

/**
 * Initialize the directive, mixin definition properties,
 * setup the watcher, call definition bind() and update()
 * if present.
 */

Directive.prototype._bind = function () {
  var name = this.name;
  var descriptor = this.descriptor;

  // remove attribute
  if ((name !== 'cloak' || this.vm._isCompiled) && this.el && this.el.removeAttribute) {
    var attr = descriptor.attr || 'v-' + name;
    this.el.removeAttribute(attr);
  }

  // copy def properties
  var def = descriptor.def;
  if (typeof def === 'function') {
    this.update = def;
  } else {
    extend(this, def);
  }

  // setup directive params
  this._setupParams();

  // initial bind
  if (this.bind) {
    this.bind();
  }
  this._bound = true;

  if (this.literal) {
    this.update && this.update(descriptor.raw);
  } else if ((this.expression || this.modifiers) && (this.update || this.twoWay) && !this._checkStatement()) {
    // wrapped updater for context
    var dir = this;
    if (this.update) {
      this._update = function (val, oldVal) {
        if (!dir._locked) {
          dir.update(val, oldVal);
        }
      };
    } else {
      this._update = noop$1;
    }
    var preProcess = this._preProcess ? bind(this._preProcess, this) : null;
    var postProcess = this._postProcess ? bind(this._postProcess, this) : null;
    var watcher = this._watcher = new Watcher(this.vm, this.expression, this._update, // callback
    {
      filters: this.filters,
      twoWay: this.twoWay,
      deep: this.deep,
      preProcess: preProcess,
      postProcess: postProcess,
      scope: this._scope
    });
    // v-model with inital inline value need to sync back to
    // model instead of update to DOM on init. They would
    // set the afterBind hook to indicate that.
    if (this.afterBind) {
      this.afterBind();
    } else if (this.update) {
      this.update(watcher.value);
    }
  }
};

/**
 * Setup all param attributes, e.g. track-by,
 * transition-mode, etc...
 */

Directive.prototype._setupParams = function () {
  if (!this.params) {
    return;
  }
  var params = this.params;
  // swap the params array with a fresh object.
  this.params = Object.create(null);
  var i = params.length;
  var key, val, mappedKey;
  while (i--) {
    key = hyphenate(params[i]);
    mappedKey = camelize(key);
    val = getBindAttr(this.el, key);
    if (val != null) {
      // dynamic
      this._setupParamWatcher(mappedKey, val);
    } else {
      // static
      val = getAttr(this.el, key);
      if (val != null) {
        this.params[mappedKey] = val === '' ? true : val;
      }
    }
  }
};

/**
 * Setup a watcher for a dynamic param.
 *
 * @param {String} key
 * @param {String} expression
 */

Directive.prototype._setupParamWatcher = function (key, expression) {
  var self = this;
  var called = false;
  var unwatch = (this._scope || this.vm).$watch(expression, function (val, oldVal) {
    self.params[key] = val;
    // since we are in immediate mode,
    // only call the param change callbacks if this is not the first update.
    if (called) {
      var cb = self.paramWatchers && self.paramWatchers[key];
      if (cb) {
        cb.call(self, val, oldVal);
      }
    } else {
      called = true;
    }
  }, {
    immediate: true,
    user: false
  });(this._paramUnwatchFns || (this._paramUnwatchFns = [])).push(unwatch);
};

/**
 * Check if the directive is a function caller
 * and if the expression is a callable one. If both true,
 * we wrap up the expression and use it as the event
 * handler.
 *
 * e.g. on-click="a++"
 *
 * @return {Boolean}
 */

Directive.prototype._checkStatement = function () {
  var expression = this.expression;
  if (expression && this.acceptStatement && !isSimplePath(expression)) {
    var fn = parseExpression(expression).get;
    var scope = this._scope || this.vm;
    var handler = function handler(e) {
      scope.$event = e;
      fn.call(scope, scope);
      scope.$event = null;
    };
    if (this.filters) {
      handler = scope._applyFilters(handler, null, this.filters);
    }
    this.update(handler);
    return true;
  }
};

/**
 * Set the corresponding value with the setter.
 * This should only be used in two-way directives
 * e.g. v-model.
 *
 * @param {*} value
 * @public
 */

Directive.prototype.set = function (value) {
  /* istanbul ignore else */
  if (this.twoWay) {
    this._withLock(function () {
      this._watcher.set(value);
    });
  } else if (process.env.NODE_ENV !== 'production') {
    warn('Directive.set() can only be used inside twoWay' + 'directives.');
  }
};

/**
 * Execute a function while preventing that function from
 * triggering updates on this directive instance.
 *
 * @param {Function} fn
 */

Directive.prototype._withLock = function (fn) {
  var self = this;
  self._locked = true;
  fn.call(self);
  nextTick(function () {
    self._locked = false;
  });
};

/**
 * Convenience method that attaches a DOM event listener
 * to the directive element and autometically tears it down
 * during unbind.
 *
 * @param {String} event
 * @param {Function} handler
 * @param {Boolean} [useCapture]
 */

Directive.prototype.on = function (event, handler, useCapture) {
  on(this.el, event, handler, useCapture);(this._listeners || (this._listeners = [])).push([event, handler]);
};

/**
 * Teardown the watcher and call unbind.
 */

Directive.prototype._teardown = function () {
  if (this._bound) {
    this._bound = false;
    if (this.unbind) {
      this.unbind();
    }
    if (this._watcher) {
      this._watcher.teardown();
    }
    var listeners = this._listeners;
    var i;
    if (listeners) {
      i = listeners.length;
      while (i--) {
        off(this.el, listeners[i][0], listeners[i][1]);
      }
    }
    var unwatchFns = this._paramUnwatchFns;
    if (unwatchFns) {
      i = unwatchFns.length;
      while (i--) {
        unwatchFns[i]();
      }
    }
    if (process.env.NODE_ENV !== 'production' && this.el) {
      this.el._vue_directives.$remove(this);
    }
    this.vm = this.el = this._watcher = this._listeners = null;
  }
};

function lifecycleMixin (Vue) {
  /**
   * Update v-ref for component.
   *
   * @param {Boolean} remove
   */

  Vue.prototype._updateRef = function (remove) {
    var ref = this.$options._ref;
    if (ref) {
      var refs = (this._scope || this._context).$refs;
      if (remove) {
        if (refs[ref] === this) {
          refs[ref] = null;
        }
      } else {
        refs[ref] = this;
      }
    }
  };

  /**
   * Transclude, compile and link element.
   *
   * If a pre-compiled linker is available, that means the
   * passed in element will be pre-transcluded and compiled
   * as well - all we need to do is to call the linker.
   *
   * Otherwise we need to call transclude/compile/link here.
   *
   * @param {Element} el
   */

  Vue.prototype._compile = function (el) {
    var options = this.$options;

    // transclude and init element
    // transclude can potentially replace original
    // so we need to keep reference; this step also injects
    // the template and caches the original attributes
    // on the container node and replacer node.
    var original = el;
    el = transclude(el, options);
    this._initElement(el);

    // handle v-pre on root node (#2026)
    if (el.nodeType === 1 && getAttr(el, 'v-pre') !== null) {
      return;
    }

    // root is always compiled per-instance, because
    // container attrs and props can be different every time.
    var contextOptions = this._context && this._context.$options;
    var rootLinker = compileRoot(el, options, contextOptions);

    // resolve slot distribution
    resolveSlots(this, options._content);

    // compile and link the rest
    var contentLinkFn;
    var ctor = this.constructor;
    // component compilation can be cached
    // as long as it's not using inline-template
    if (options._linkerCachable) {
      contentLinkFn = ctor.linker;
      if (!contentLinkFn) {
        contentLinkFn = ctor.linker = compile(el, options);
      }
    }

    // link phase
    // make sure to link root with prop scope!
    var rootUnlinkFn = rootLinker(this, el, this._scope);
    var contentUnlinkFn = contentLinkFn ? contentLinkFn(this, el) : compile(el, options)(this, el);

    // register composite unlink function
    // to be called during instance destruction
    this._unlinkFn = function () {
      rootUnlinkFn();
      // passing destroying: true to avoid searching and
      // splicing the directives
      contentUnlinkFn(true);
    };

    // finally replace original
    if (options.replace) {
      replace(original, el);
    }

    this._isCompiled = true;
    this._callHook('compiled');
  };

  /**
   * Initialize instance element. Called in the public
   * $mount() method.
   *
   * @param {Element} el
   */

  Vue.prototype._initElement = function (el) {
    if (isFragment(el)) {
      this._isFragment = true;
      this.$el = this._fragmentStart = el.firstChild;
      this._fragmentEnd = el.lastChild;
      // set persisted text anchors to empty
      if (this._fragmentStart.nodeType === 3) {
        this._fragmentStart.data = this._fragmentEnd.data = '';
      }
      this._fragment = el;
    } else {
      this.$el = el;
    }
    this.$el.__vue__ = this;
    this._callHook('beforeCompile');
  };

  /**
   * Create and bind a directive to an element.
   *
   * @param {Object} descriptor - parsed directive descriptor
   * @param {Node} node   - target node
   * @param {Vue} [host] - transclusion host component
   * @param {Object} [scope] - v-for scope
   * @param {Fragment} [frag] - owner fragment
   */

  Vue.prototype._bindDir = function (descriptor, node, host, scope, frag) {
    this._directives.push(new Directive(descriptor, this, node, host, scope, frag));
  };

  /**
   * Teardown an instance, unobserves the data, unbind all the
   * directives, turn off all the event listeners, etc.
   *
   * @param {Boolean} remove - whether to remove the DOM node.
   * @param {Boolean} deferCleanup - if true, defer cleanup to
   *                                 be called later
   */

  Vue.prototype._destroy = function (remove, deferCleanup) {
    if (this._isBeingDestroyed) {
      if (!deferCleanup) {
        this._cleanup();
      }
      return;
    }

    var destroyReady;
    var pendingRemoval;

    var self = this;
    // Cleanup should be called either synchronously or asynchronoysly as
    // callback of this.$remove(), or if remove and deferCleanup are false.
    // In any case it should be called after all other removing, unbinding and
    // turning of is done
    var cleanupIfPossible = function cleanupIfPossible() {
      if (destroyReady && !pendingRemoval && !deferCleanup) {
        self._cleanup();
      }
    };

    // remove DOM element
    if (remove && this.$el) {
      pendingRemoval = true;
      this.$remove(function () {
        pendingRemoval = false;
        cleanupIfPossible();
      });
    }

    this._callHook('beforeDestroy');
    this._isBeingDestroyed = true;
    var i;
    // remove self from parent. only necessary
    // if parent is not being destroyed as well.
    var parent = this.$parent;
    if (parent && !parent._isBeingDestroyed) {
      parent.$children.$remove(this);
      // unregister ref (remove: true)
      this._updateRef(true);
    }
    // destroy all children.
    i = this.$children.length;
    while (i--) {
      this.$children[i].$destroy();
    }
    // teardown props
    if (this._propsUnlinkFn) {
      this._propsUnlinkFn();
    }
    // teardown all directives. this also tearsdown all
    // directive-owned watchers.
    if (this._unlinkFn) {
      this._unlinkFn();
    }
    i = this._watchers.length;
    while (i--) {
      this._watchers[i].teardown();
    }
    // remove reference to self on $el
    if (this.$el) {
      this.$el.__vue__ = null;
    }

    destroyReady = true;
    cleanupIfPossible();
  };

  /**
   * Clean up to ensure garbage collection.
   * This is called after the leave transition if there
   * is any.
   */

  Vue.prototype._cleanup = function () {
    if (this._isDestroyed) {
      return;
    }
    // remove self from owner fragment
    // do it in cleanup so that we can call $destroy with
    // defer right when a fragment is about to be removed.
    if (this._frag) {
      this._frag.children.$remove(this);
    }
    // remove reference from data ob
    // frozen object may not have observer.
    if (this._data && this._data.__ob__) {
      this._data.__ob__.removeVm(this);
    }
    // Clean up references to private properties and other
    // instances. preserve reference to _data so that proxy
    // accessors still work. The only potential side effect
    // here is that mutating the instance after it's destroyed
    // may affect the state of other components that are still
    // observing the same object, but that seems to be a
    // reasonable responsibility for the user rather than
    // always throwing an error on them.
    this.$el = this.$parent = this.$root = this.$children = this._watchers = this._context = this._scope = this._directives = null;
    // call the last hook...
    this._isDestroyed = true;
    this._callHook('destroyed');
    // turn off all instance listeners.
    this.$off();
  };
}

function miscMixin (Vue) {
  /**
   * Apply a list of filter (descriptors) to a value.
   * Using plain for loops here because this will be called in
   * the getter of any watcher with filters so it is very
   * performance sensitive.
   *
   * @param {*} value
   * @param {*} [oldValue]
   * @param {Array} filters
   * @param {Boolean} write
   * @return {*}
   */

  Vue.prototype._applyFilters = function (value, oldValue, filters, write) {
    var filter, fn, args, arg, offset, i, l, j, k;
    for (i = 0, l = filters.length; i < l; i++) {
      filter = filters[write ? l - i - 1 : i];
      fn = resolveAsset(this.$options, 'filters', filter.name, true);
      if (!fn) continue;
      fn = write ? fn.write : fn.read || fn;
      if (typeof fn !== 'function') continue;
      args = write ? [value, oldValue] : [value];
      offset = write ? 2 : 1;
      if (filter.args) {
        for (j = 0, k = filter.args.length; j < k; j++) {
          arg = filter.args[j];
          args[j + offset] = arg.dynamic ? this.$get(arg.value) : arg.value;
        }
      }
      value = fn.apply(this, args);
    }
    return value;
  };

  /**
   * Resolve a component, depending on whether the component
   * is defined normally or using an async factory function.
   * Resolves synchronously if already resolved, otherwise
   * resolves asynchronously and caches the resolved
   * constructor on the factory.
   *
   * @param {String|Function} value
   * @param {Function} cb
   */

  Vue.prototype._resolveComponent = function (value, cb) {
    var factory;
    if (typeof value === 'function') {
      factory = value;
    } else {
      factory = resolveAsset(this.$options, 'components', value, true);
    }
    /* istanbul ignore if */
    if (!factory) {
      return;
    }
    // async component factory
    if (!factory.options) {
      if (factory.resolved) {
        // cached
        cb(factory.resolved);
      } else if (factory.requested) {
        // pool callbacks
        factory.pendingCallbacks.push(cb);
      } else {
        factory.requested = true;
        var cbs = factory.pendingCallbacks = [cb];
        factory.call(this, function resolve(res) {
          if (isPlainObject(res)) {
            res = Vue.extend(res);
          }
          // cache resolved
          factory.resolved = res;
          // invoke callbacks
          for (var i = 0, l = cbs.length; i < l; i++) {
            cbs[i](res);
          }
        }, function reject(reason) {
          process.env.NODE_ENV !== 'production' && warn('Failed to resolve async component' + (typeof value === 'string' ? ': ' + value : '') + '. ' + (reason ? '\nReason: ' + reason : ''));
        });
      }
    } else {
      // normal component
      cb(factory);
    }
  };
}

var filterRE$1 = /[^|]\|[^|]/;

function dataAPI (Vue) {
  /**
   * Get the value from an expression on this vm.
   *
   * @param {String} exp
   * @param {Boolean} [asStatement]
   * @return {*}
   */

  Vue.prototype.$get = function (exp, asStatement) {
    var res = parseExpression(exp);
    if (res) {
      if (asStatement) {
        var self = this;
        return function statementHandler() {
          self.$arguments = toArray(arguments);
          var result = res.get.call(self, self);
          self.$arguments = null;
          return result;
        };
      } else {
        try {
          return res.get.call(this, this);
        } catch (e) {}
      }
    }
  };

  /**
   * Set the value from an expression on this vm.
   * The expression must be a valid left-hand
   * expression in an assignment.
   *
   * @param {String} exp
   * @param {*} val
   */

  Vue.prototype.$set = function (exp, val) {
    var res = parseExpression(exp, true);
    if (res && res.set) {
      res.set.call(this, this, val);
    }
  };

  /**
   * Delete a property on the VM
   *
   * @param {String} key
   */

  Vue.prototype.$delete = function (key) {
    del(this._data, key);
  };

  /**
   * Watch an expression, trigger callback when its
   * value changes.
   *
   * @param {String|Function} expOrFn
   * @param {Function} cb
   * @param {Object} [options]
   *                 - {Boolean} deep
   *                 - {Boolean} immediate
   * @return {Function} - unwatchFn
   */

  Vue.prototype.$watch = function (expOrFn, cb, options) {
    var vm = this;
    var parsed;
    if (typeof expOrFn === 'string') {
      parsed = parseDirective(expOrFn);
      expOrFn = parsed.expression;
    }
    var watcher = new Watcher(vm, expOrFn, cb, {
      deep: options && options.deep,
      sync: options && options.sync,
      filters: parsed && parsed.filters,
      user: !options || options.user !== false
    });
    if (options && options.immediate) {
      cb.call(vm, watcher.value);
    }
    return function unwatchFn() {
      watcher.teardown();
    };
  };

  /**
   * Evaluate a text directive, including filters.
   *
   * @param {String} text
   * @param {Boolean} [asStatement]
   * @return {String}
   */

  Vue.prototype.$eval = function (text, asStatement) {
    // check for filters.
    if (filterRE$1.test(text)) {
      var dir = parseDirective(text);
      // the filter regex check might give false positive
      // for pipes inside strings, so it's possible that
      // we don't get any filters here
      var val = this.$get(dir.expression, asStatement);
      return dir.filters ? this._applyFilters(val, null, dir.filters) : val;
    } else {
      // no filter
      return this.$get(text, asStatement);
    }
  };

  /**
   * Interpolate a piece of template text.
   *
   * @param {String} text
   * @return {String}
   */

  Vue.prototype.$interpolate = function (text) {
    var tokens = parseText(text);
    var vm = this;
    if (tokens) {
      if (tokens.length === 1) {
        return vm.$eval(tokens[0].value) + '';
      } else {
        return tokens.map(function (token) {
          return token.tag ? vm.$eval(token.value) : token.value;
        }).join('');
      }
    } else {
      return text;
    }
  };

  /**
   * Log instance data as a plain JS object
   * so that it is easier to inspect in console.
   * This method assumes console is available.
   *
   * @param {String} [path]
   */

  Vue.prototype.$log = function (path) {
    var data = path ? getPath(this._data, path) : this._data;
    if (data) {
      data = clean(data);
    }
    // include computed fields
    if (!path) {
      var key;
      for (key in this.$options.computed) {
        data[key] = clean(this[key]);
      }
      if (this._props) {
        for (key in this._props) {
          data[key] = clean(this[key]);
        }
      }
    }
    console.log(data);
  };

  /**
   * "clean" a getter/setter converted object into a plain
   * object copy.
   *
   * @param {Object} - obj
   * @return {Object}
   */

  function clean(obj) {
    return JSON.parse(JSON.stringify(obj));
  }
}

function domAPI (Vue) {
  /**
   * Convenience on-instance nextTick. The callback is
   * auto-bound to the instance, and this avoids component
   * modules having to rely on the global Vue.
   *
   * @param {Function} fn
   */

  Vue.prototype.$nextTick = function (fn) {
    nextTick(fn, this);
  };

  /**
   * Append instance to target
   *
   * @param {Node} target
   * @param {Function} [cb]
   * @param {Boolean} [withTransition] - defaults to true
   */

  Vue.prototype.$appendTo = function (target, cb, withTransition) {
    return insert(this, target, cb, withTransition, append, appendWithTransition);
  };

  /**
   * Prepend instance to target
   *
   * @param {Node} target
   * @param {Function} [cb]
   * @param {Boolean} [withTransition] - defaults to true
   */

  Vue.prototype.$prependTo = function (target, cb, withTransition) {
    target = query(target);
    if (target.hasChildNodes()) {
      this.$before(target.firstChild, cb, withTransition);
    } else {
      this.$appendTo(target, cb, withTransition);
    }
    return this;
  };

  /**
   * Insert instance before target
   *
   * @param {Node} target
   * @param {Function} [cb]
   * @param {Boolean} [withTransition] - defaults to true
   */

  Vue.prototype.$before = function (target, cb, withTransition) {
    return insert(this, target, cb, withTransition, beforeWithCb, beforeWithTransition);
  };

  /**
   * Insert instance after target
   *
   * @param {Node} target
   * @param {Function} [cb]
   * @param {Boolean} [withTransition] - defaults to true
   */

  Vue.prototype.$after = function (target, cb, withTransition) {
    target = query(target);
    if (target.nextSibling) {
      this.$before(target.nextSibling, cb, withTransition);
    } else {
      this.$appendTo(target.parentNode, cb, withTransition);
    }
    return this;
  };

  /**
   * Remove instance from DOM
   *
   * @param {Function} [cb]
   * @param {Boolean} [withTransition] - defaults to true
   */

  Vue.prototype.$remove = function (cb, withTransition) {
    if (!this.$el.parentNode) {
      return cb && cb();
    }
    var inDocument = this._isAttached && inDoc(this.$el);
    // if we are not in document, no need to check
    // for transitions
    if (!inDocument) withTransition = false;
    var self = this;
    var realCb = function realCb() {
      if (inDocument) self._callHook('detached');
      if (cb) cb();
    };
    if (this._isFragment) {
      removeNodeRange(this._fragmentStart, this._fragmentEnd, this, this._fragment, realCb);
    } else {
      var op = withTransition === false ? removeWithCb : removeWithTransition;
      op(this.$el, this, realCb);
    }
    return this;
  };

  /**
   * Shared DOM insertion function.
   *
   * @param {Vue} vm
   * @param {Element} target
   * @param {Function} [cb]
   * @param {Boolean} [withTransition]
   * @param {Function} op1 - op for non-transition insert
   * @param {Function} op2 - op for transition insert
   * @return vm
   */

  function insert(vm, target, cb, withTransition, op1, op2) {
    target = query(target);
    var targetIsDetached = !inDoc(target);
    var op = withTransition === false || targetIsDetached ? op1 : op2;
    var shouldCallHook = !targetIsDetached && !vm._isAttached && !inDoc(vm.$el);
    if (vm._isFragment) {
      mapNodeRange(vm._fragmentStart, vm._fragmentEnd, function (node) {
        op(node, target, vm);
      });
      cb && cb();
    } else {
      op(vm.$el, target, vm, cb);
    }
    if (shouldCallHook) {
      vm._callHook('attached');
    }
    return vm;
  }

  /**
   * Check for selectors
   *
   * @param {String|Element} el
   */

  function query(el) {
    return typeof el === 'string' ? document.querySelector(el) : el;
  }

  /**
   * Append operation that takes a callback.
   *
   * @param {Node} el
   * @param {Node} target
   * @param {Vue} vm - unused
   * @param {Function} [cb]
   */

  function append(el, target, vm, cb) {
    target.appendChild(el);
    if (cb) cb();
  }

  /**
   * InsertBefore operation that takes a callback.
   *
   * @param {Node} el
   * @param {Node} target
   * @param {Vue} vm - unused
   * @param {Function} [cb]
   */

  function beforeWithCb(el, target, vm, cb) {
    before(el, target);
    if (cb) cb();
  }

  /**
   * Remove operation that takes a callback.
   *
   * @param {Node} el
   * @param {Vue} vm - unused
   * @param {Function} [cb]
   */

  function removeWithCb(el, vm, cb) {
    remove(el);
    if (cb) cb();
  }
}

function eventsAPI (Vue) {
  /**
   * Listen on the given `event` with `fn`.
   *
   * @param {String} event
   * @param {Function} fn
   */

  Vue.prototype.$on = function (event, fn) {
    (this._events[event] || (this._events[event] = [])).push(fn);
    modifyListenerCount(this, event, 1);
    return this;
  };

  /**
   * Adds an `event` listener that will be invoked a single
   * time then automatically removed.
   *
   * @param {String} event
   * @param {Function} fn
   */

  Vue.prototype.$once = function (event, fn) {
    var self = this;
    function on() {
      self.$off(event, on);
      fn.apply(this, arguments);
    }
    on.fn = fn;
    this.$on(event, on);
    return this;
  };

  /**
   * Remove the given callback for `event` or all
   * registered callbacks.
   *
   * @param {String} event
   * @param {Function} fn
   */

  Vue.prototype.$off = function (event, fn) {
    var cbs;
    // all
    if (!arguments.length) {
      if (this.$parent) {
        for (event in this._events) {
          cbs = this._events[event];
          if (cbs) {
            modifyListenerCount(this, event, -cbs.length);
          }
        }
      }
      this._events = {};
      return this;
    }
    // specific event
    cbs = this._events[event];
    if (!cbs) {
      return this;
    }
    if (arguments.length === 1) {
      modifyListenerCount(this, event, -cbs.length);
      this._events[event] = null;
      return this;
    }
    // specific handler
    var cb;
    var i = cbs.length;
    while (i--) {
      cb = cbs[i];
      if (cb === fn || cb.fn === fn) {
        modifyListenerCount(this, event, -1);
        cbs.splice(i, 1);
        break;
      }
    }
    return this;
  };

  /**
   * Trigger an event on self.
   *
   * @param {String|Object} event
   * @return {Boolean} shouldPropagate
   */

  Vue.prototype.$emit = function (event) {
    var isSource = typeof event === 'string';
    event = isSource ? event : event.name;
    var cbs = this._events[event];
    var shouldPropagate = isSource || !cbs;
    if (cbs) {
      cbs = cbs.length > 1 ? toArray(cbs) : cbs;
      // this is a somewhat hacky solution to the question raised
      // in #2102: for an inline component listener like <comp @test="doThis">,
      // the propagation handling is somewhat broken. Therefore we
      // need to treat these inline callbacks differently.
      var hasParentCbs = isSource && cbs.some(function (cb) {
        return cb._fromParent;
      });
      if (hasParentCbs) {
        shouldPropagate = false;
      }
      var args = toArray(arguments, 1);
      for (var i = 0, l = cbs.length; i < l; i++) {
        var cb = cbs[i];
        var res = cb.apply(this, args);
        if (res === true && (!hasParentCbs || cb._fromParent)) {
          shouldPropagate = true;
        }
      }
    }
    return shouldPropagate;
  };

  /**
   * Recursively broadcast an event to all children instances.
   *
   * @param {String|Object} event
   * @param {...*} additional arguments
   */

  Vue.prototype.$broadcast = function (event) {
    var isSource = typeof event === 'string';
    event = isSource ? event : event.name;
    // if no child has registered for this event,
    // then there's no need to broadcast.
    if (!this._eventsCount[event]) return;
    var children = this.$children;
    var args = toArray(arguments);
    if (isSource) {
      // use object event to indicate non-source emit
      // on children
      args[0] = { name: event, source: this };
    }
    for (var i = 0, l = children.length; i < l; i++) {
      var child = children[i];
      var shouldPropagate = child.$emit.apply(child, args);
      if (shouldPropagate) {
        child.$broadcast.apply(child, args);
      }
    }
    return this;
  };

  /**
   * Recursively propagate an event up the parent chain.
   *
   * @param {String} event
   * @param {...*} additional arguments
   */

  Vue.prototype.$dispatch = function (event) {
    var shouldPropagate = this.$emit.apply(this, arguments);
    if (!shouldPropagate) return;
    var parent = this.$parent;
    var args = toArray(arguments);
    // use object event to indicate non-source emit
    // on parents
    args[0] = { name: event, source: this };
    while (parent) {
      shouldPropagate = parent.$emit.apply(parent, args);
      parent = shouldPropagate ? parent.$parent : null;
    }
    return this;
  };

  /**
   * Modify the listener counts on all parents.
   * This bookkeeping allows $broadcast to return early when
   * no child has listened to a certain event.
   *
   * @param {Vue} vm
   * @param {String} event
   * @param {Number} count
   */

  var hookRE = /^hook:/;
  function modifyListenerCount(vm, event, count) {
    var parent = vm.$parent;
    // hooks do not get broadcasted so no need
    // to do bookkeeping for them
    if (!parent || !count || hookRE.test(event)) return;
    while (parent) {
      parent._eventsCount[event] = (parent._eventsCount[event] || 0) + count;
      parent = parent.$parent;
    }
  }
}

function lifecycleAPI (Vue) {
  /**
   * Set instance target element and kick off the compilation
   * process. The passed in `el` can be a selector string, an
   * existing Element, or a DocumentFragment (for block
   * instances).
   *
   * @param {Element|DocumentFragment|string} el
   * @public
   */

  Vue.prototype.$mount = function (el) {
    if (this._isCompiled) {
      process.env.NODE_ENV !== 'production' && warn('$mount() should be called only once.', this);
      return;
    }
    el = query(el);
    if (!el) {
      el = document.createElement('div');
    }
    this._compile(el);
    this._initDOMHooks();
    if (inDoc(this.$el)) {
      this._callHook('attached');
      ready.call(this);
    } else {
      this.$once('hook:attached', ready);
    }
    return this;
  };

  /**
   * Mark an instance as ready.
   */

  function ready() {
    this._isAttached = true;
    this._isReady = true;
    this._callHook('ready');
  }

  /**
   * Teardown the instance, simply delegate to the internal
   * _destroy.
   *
   * @param {Boolean} remove
   * @param {Boolean} deferCleanup
   */

  Vue.prototype.$destroy = function (remove, deferCleanup) {
    this._destroy(remove, deferCleanup);
  };

  /**
   * Partially compile a piece of DOM and return a
   * decompile function.
   *
   * @param {Element|DocumentFragment} el
   * @param {Vue} [host]
   * @param {Object} [scope]
   * @param {Fragment} [frag]
   * @return {Function}
   */

  Vue.prototype.$compile = function (el, host, scope, frag) {
    return compile(el, this.$options, true)(this, el, host, scope, frag);
  };
}

/**
 * The exposed Vue constructor.
 *
 * API conventions:
 * - public API methods/properties are prefixed with `$`
 * - internal methods/properties are prefixed with `_`
 * - non-prefixed properties are assumed to be proxied user
 *   data.
 *
 * @constructor
 * @param {Object} [options]
 * @public
 */

function Vue(options) {
  this._init(options);
}

// install internals
initMixin(Vue);
stateMixin(Vue);
eventsMixin(Vue);
lifecycleMixin(Vue);
miscMixin(Vue);

// install instance APIs
dataAPI(Vue);
domAPI(Vue);
eventsAPI(Vue);
lifecycleAPI(Vue);

var slot = {

  priority: SLOT,
  params: ['name'],

  bind: function bind() {
    // this was resolved during component transclusion
    var name = this.params.name || 'default';
    var content = this.vm._slotContents && this.vm._slotContents[name];
    if (!content || !content.hasChildNodes()) {
      this.fallback();
    } else {
      this.compile(content.cloneNode(true), this.vm._context, this.vm);
    }
  },

  compile: function compile(content, context, host) {
    if (content && context) {
      if (this.el.hasChildNodes() && content.childNodes.length === 1 && content.childNodes[0].nodeType === 1 && content.childNodes[0].hasAttribute('v-if')) {
        // if the inserted slot has v-if
        // inject fallback content as the v-else
        var elseBlock = document.createElement('template');
        elseBlock.setAttribute('v-else', '');
        elseBlock.innerHTML = this.el.innerHTML;
        // the else block should be compiled in child scope
        elseBlock._context = this.vm;
        content.appendChild(elseBlock);
      }
      var scope = host ? host._scope : this._scope;
      this.unlink = context.$compile(content, host, scope, this._frag);
    }
    if (content) {
      replace(this.el, content);
    } else {
      remove(this.el);
    }
  },

  fallback: function fallback() {
    this.compile(extractContent(this.el, true), this.vm);
  },

  unbind: function unbind() {
    if (this.unlink) {
      this.unlink();
    }
  }
};

var partial = {

  priority: PARTIAL,

  params: ['name'],

  // watch changes to name for dynamic partials
  paramWatchers: {
    name: function name(value) {
      vIf.remove.call(this);
      if (value) {
        this.insert(value);
      }
    }
  },

  bind: function bind() {
    this.anchor = createAnchor('v-partial');
    replace(this.el, this.anchor);
    this.insert(this.params.name);
  },

  insert: function insert(id) {
    var partial = resolveAsset(this.vm.$options, 'partials', id, true);
    if (partial) {
      this.factory = new FragmentFactory(this.vm, partial);
      vIf.insert.call(this);
    }
  },

  unbind: function unbind() {
    if (this.frag) {
      this.frag.destroy();
    }
  }
};

var elementDirectives = {
  slot: slot,
  partial: partial
};

var convertArray = vFor._postProcess;

/**
 * Limit filter for arrays
 *
 * @param {Number} n
 * @param {Number} offset (Decimal expected)
 */

function limitBy(arr, n, offset) {
  offset = offset ? parseInt(offset, 10) : 0;
  n = toNumber(n);
  return typeof n === 'number' ? arr.slice(offset, offset + n) : arr;
}

/**
 * Filter filter for arrays
 *
 * @param {String} search
 * @param {String} [delimiter]
 * @param {String} ...dataKeys
 */

function filterBy(arr, search, delimiter) {
  arr = convertArray(arr);
  if (search == null) {
    return arr;
  }
  if (typeof search === 'function') {
    return arr.filter(search);
  }
  // cast to lowercase string
  search = ('' + search).toLowerCase();
  // allow optional `in` delimiter
  // because why not
  var n = delimiter === 'in' ? 3 : 2;
  // extract and flatten keys
  var keys = Array.prototype.concat.apply([], toArray(arguments, n));
  var res = [];
  var item, key, val, j;
  for (var i = 0, l = arr.length; i < l; i++) {
    item = arr[i];
    val = item && item.$value || item;
    j = keys.length;
    if (j) {
      while (j--) {
        key = keys[j];
        if (key === '$key' && contains(item.$key, search) || contains(getPath(val, key), search)) {
          res.push(item);
          break;
        }
      }
    } else if (contains(item, search)) {
      res.push(item);
    }
  }
  return res;
}

/**
 * Filter filter for arrays
 *
 * @param {String|Array<String>|Function} ...sortKeys
 * @param {Number} [order]
 */

function orderBy(arr) {
  var comparator = null;
  var sortKeys = undefined;
  arr = convertArray(arr);

  // determine order (last argument)
  var args = toArray(arguments, 1);
  var order = args[args.length - 1];
  if (typeof order === 'number') {
    order = order < 0 ? -1 : 1;
    args = args.length > 1 ? args.slice(0, -1) : args;
  } else {
    order = 1;
  }

  // determine sortKeys & comparator
  var firstArg = args[0];
  if (!firstArg) {
    return arr;
  } else if (typeof firstArg === 'function') {
    // custom comparator
    comparator = function (a, b) {
      return firstArg(a, b) * order;
    };
  } else {
    // string keys. flatten first
    sortKeys = Array.prototype.concat.apply([], args);
    comparator = function (a, b, i) {
      i = i || 0;
      return i >= sortKeys.length - 1 ? baseCompare(a, b, i) : baseCompare(a, b, i) || comparator(a, b, i + 1);
    };
  }

  function baseCompare(a, b, sortKeyIndex) {
    var sortKey = sortKeys[sortKeyIndex];
    if (sortKey) {
      if (sortKey !== '$key') {
        if (isObject(a) && '$value' in a) a = a.$value;
        if (isObject(b) && '$value' in b) b = b.$value;
      }
      a = isObject(a) ? getPath(a, sortKey) : a;
      b = isObject(b) ? getPath(b, sortKey) : b;
    }
    return a === b ? 0 : a > b ? order : -order;
  }

  // sort on a copy to avoid mutating original array
  return arr.slice().sort(comparator);
}

/**
 * String contain helper
 *
 * @param {*} val
 * @param {String} search
 */

function contains(val, search) {
  var i;
  if (isPlainObject(val)) {
    var keys = Object.keys(val);
    i = keys.length;
    while (i--) {
      if (contains(val[keys[i]], search)) {
        return true;
      }
    }
  } else if (isArray(val)) {
    i = val.length;
    while (i--) {
      if (contains(val[i], search)) {
        return true;
      }
    }
  } else if (val != null) {
    return val.toString().toLowerCase().indexOf(search) > -1;
  }
}

var digitsRE = /(\d{3})(?=\d)/g;

// asset collections must be a plain object.
var filters = {

  orderBy: orderBy,
  filterBy: filterBy,
  limitBy: limitBy,

  /**
   * Stringify value.
   *
   * @param {Number} indent
   */

  json: {
    read: function read(value, indent) {
      return typeof value === 'string' ? value : JSON.stringify(value, null, arguments.length > 1 ? indent : 2);
    },
    write: function write(value) {
      try {
        return JSON.parse(value);
      } catch (e) {
        return value;
      }
    }
  },

  /**
   * 'abc' => 'Abc'
   */

  capitalize: function capitalize(value) {
    if (!value && value !== 0) return '';
    value = value.toString();
    return value.charAt(0).toUpperCase() + value.slice(1);
  },

  /**
   * 'abc' => 'ABC'
   */

  uppercase: function uppercase(value) {
    return value || value === 0 ? value.toString().toUpperCase() : '';
  },

  /**
   * 'AbC' => 'abc'
   */

  lowercase: function lowercase(value) {
    return value || value === 0 ? value.toString().toLowerCase() : '';
  },

  /**
   * 12345 => $12,345.00
   *
   * @param {String} sign
   * @param {Number} decimals Decimal places
   */

  currency: function currency(value, _currency, decimals) {
    value = parseFloat(value);
    if (!isFinite(value) || !value && value !== 0) return '';
    _currency = _currency != null ? _currency : '$';
    decimals = decimals != null ? decimals : 2;
    var stringified = Math.abs(value).toFixed(decimals);
    var _int = decimals ? stringified.slice(0, -1 - decimals) : stringified;
    var i = _int.length % 3;
    var head = i > 0 ? _int.slice(0, i) + (_int.length > 3 ? ',' : '') : '';
    var _float = decimals ? stringified.slice(-1 - decimals) : '';
    var sign = value < 0 ? '-' : '';
    return sign + _currency + head + _int.slice(i).replace(digitsRE, '$1,') + _float;
  },

  /**
   * 'item' => 'items'
   *
   * @params
   *  an array of strings corresponding to
   *  the single, double, triple ... forms of the word to
   *  be pluralized. When the number to be pluralized
   *  exceeds the length of the args, it will use the last
   *  entry in the array.
   *
   *  e.g. ['single', 'double', 'triple', 'multiple']
   */

  pluralize: function pluralize(value) {
    var args = toArray(arguments, 1);
    var length = args.length;
    if (length > 1) {
      var index = value % 10 - 1;
      return index in args ? args[index] : args[length - 1];
    } else {
      return args[0] + (value === 1 ? '' : 's');
    }
  },

  /**
   * Debounce a handler function.
   *
   * @param {Function} handler
   * @param {Number} delay = 300
   * @return {Function}
   */

  debounce: function debounce(handler, delay) {
    if (!handler) return;
    if (!delay) {
      delay = 300;
    }
    return _debounce(handler, delay);
  }
};

function installGlobalAPI (Vue) {
  /**
   * Vue and every constructor that extends Vue has an
   * associated options object, which can be accessed during
   * compilation steps as `this.constructor.options`.
   *
   * These can be seen as the default options of every
   * Vue instance.
   */

  Vue.options = {
    directives: directives,
    elementDirectives: elementDirectives,
    filters: filters,
    transitions: {},
    components: {},
    partials: {},
    replace: true
  };

  /**
   * Expose useful internals
   */

  Vue.util = util;
  Vue.config = config;
  Vue.set = set;
  Vue['delete'] = del;
  Vue.nextTick = nextTick;

  /**
   * The following are exposed for advanced usage / plugins
   */

  Vue.compiler = compiler;
  Vue.FragmentFactory = FragmentFactory;
  Vue.internalDirectives = internalDirectives;
  Vue.parsers = {
    path: path,
    text: text,
    template: template,
    directive: directive,
    expression: expression
  };

  /**
   * Each instance constructor, including Vue, has a unique
   * cid. This enables us to create wrapped "child
   * constructors" for prototypal inheritance and cache them.
   */

  Vue.cid = 0;
  var cid = 1;

  /**
   * Class inheritance
   *
   * @param {Object} extendOptions
   */

  Vue.extend = function (extendOptions) {
    extendOptions = extendOptions || {};
    var Super = this;
    var isFirstExtend = Super.cid === 0;
    if (isFirstExtend && extendOptions._Ctor) {
      return extendOptions._Ctor;
    }
    var name = extendOptions.name || Super.options.name;
    if (process.env.NODE_ENV !== 'production') {
      if (!/^[a-zA-Z][\w-]*$/.test(name)) {
        warn('Invalid component name: "' + name + '". Component names ' + 'can only contain alphanumeric characaters and the hyphen.');
        name = null;
      }
    }
    var Sub = createClass(name || 'VueComponent');
    Sub.prototype = Object.create(Super.prototype);
    Sub.prototype.constructor = Sub;
    Sub.cid = cid++;
    Sub.options = mergeOptions(Super.options, extendOptions);
    Sub['super'] = Super;
    // allow further extension
    Sub.extend = Super.extend;
    // create asset registers, so extended classes
    // can have their private assets too.
    config._assetTypes.forEach(function (type) {
      Sub[type] = Super[type];
    });
    // enable recursive self-lookup
    if (name) {
      Sub.options.components[name] = Sub;
    }
    // cache constructor
    if (isFirstExtend) {
      extendOptions._Ctor = Sub;
    }
    return Sub;
  };

  /**
   * A function that returns a sub-class constructor with the
   * given name. This gives us much nicer output when
   * logging instances in the console.
   *
   * @param {String} name
   * @return {Function}
   */

  function createClass(name) {
    /* eslint-disable no-new-func */
    return new Function('return function ' + classify(name) + ' (options) { this._init(options) }')();
    /* eslint-enable no-new-func */
  }

  /**
   * Plugin system
   *
   * @param {Object} plugin
   */

  Vue.use = function (plugin) {
    /* istanbul ignore if */
    if (plugin.installed) {
      return;
    }
    // additional parameters
    var args = toArray(arguments, 1);
    args.unshift(this);
    if (typeof plugin.install === 'function') {
      plugin.install.apply(plugin, args);
    } else {
      plugin.apply(null, args);
    }
    plugin.installed = true;
    return this;
  };

  /**
   * Apply a global mixin by merging it into the default
   * options.
   */

  Vue.mixin = function (mixin) {
    Vue.options = mergeOptions(Vue.options, mixin);
  };

  /**
   * Create asset registration methods with the following
   * signature:
   *
   * @param {String} id
   * @param {*} definition
   */

  config._assetTypes.forEach(function (type) {
    Vue[type] = function (id, definition) {
      if (!definition) {
        return this.options[type + 's'][id];
      } else {
        /* istanbul ignore if */
        if (process.env.NODE_ENV !== 'production') {
          if (type === 'component' && (commonTagRE.test(id) || reservedTagRE.test(id))) {
            warn('Do not use built-in or reserved HTML elements as component ' + 'id: ' + id);
          }
        }
        if (type === 'component' && isPlainObject(definition)) {
          if (!definition.name) {
            definition.name = id;
          }
          definition = Vue.extend(definition);
        }
        this.options[type + 's'][id] = definition;
        return definition;
      }
    };
  });

  // expose internal transition API
  extend(Vue.transition, transition);
}

installGlobalAPI(Vue);

Vue.version = '1.0.26';

// devtools global hook
/* istanbul ignore next */
setTimeout(function () {
  if (config.devtools) {
    if (devtools) {
      devtools.emit('init', Vue);
    } else if (process.env.NODE_ENV !== 'production' && inBrowser && /Chrome\/\d+/.test(window.navigator.userAgent)) {
      console.log('Download the Vue Devtools for a better development experience:\n' + 'https://github.com/vuejs/vue-devtools');
    }
  }
}, 0);

module.exports = Vue;
}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"_process":9}],14:[function(require,module,exports){
var inserted = exports.cache = {}

exports.insert = function (css) {
  if (inserted[css]) return
  inserted[css] = true

  var elem = document.createElement('style')
  elem.setAttribute('type', 'text/css')

  if ('textContent' in elem) {
    elem.textContent = css
  } else {
    elem.styleSheet.cssText = css
  }

  document.getElementsByTagName('head')[0].appendChild(elem)
  return elem
}

},{}],15:[function(require,module,exports){
var __vueify_insert__ = require("vueify/lib/insert-css")
var __vueify_style__ = __vueify_insert__.insert("article[_v-1cd79741] {\n  padding: 0 !important;\n  overflow: auto;\n}\narticle table.diff[_v-1cd79741] {\n  display: block;\n  width: 100%;\n  background: #fff;\n  border-collapse: collapse;\n  overflow: hidden;\n}\narticle table.diff tr[_v-1cd79741] {\n  position: relative;\n}\narticle table.diff tr td.index[_v-1cd79741] {\n  padding: 0 8px;\n  background: #f2f2f2;\n  border-right: 1px solid #ccc;\n  font-size: 0.7em;\n  text-align: center;\n  color: #999;\n}\narticle table.diff tr td.type span[_v-1cd79741] {\n  display: block;\n  width: 20px;\n  text-align: center;\n}\narticle table.diff tr td.text[_v-1cd79741] {\n  width: 100%;\n  padding-right: 15px;\n}\narticle table.diff tr td.ellipsis[_v-1cd79741] {\n  padding-right: 15px;\n  text-align: center;\n  font-size: 0.7em;\n  color: #999;\n}\narticle table.diff tr td.ellipsis span[_v-1cd79741] {\n  display: block;\n  width: 100%;\n  padding: 10px 0;\n}\narticle table.diff tr.add td[_v-1cd79741] {\n  background: #e3f4d7;\n  color: #5aa02c;\n  font-weight: 700;\n}\narticle table.diff tr.rem td[_v-1cd79741] {\n  background: #f5dad7;\n  color: #d40000;\n  font-weight: 700;\n}\narticle hr.eof[_v-1cd79741] {\n  margin: 0;\n  border: none;\n}\narticle hr.eof[_v-1cd79741]:after {\n  content: 'EOF';\n  display: block;\n  padding: 10px 0 10px 70px;\n  background: #f2f2f2;\n  text-align: center;\n  font-size: 0.7em;\n  color: #999;\n  border-top: 1px solid #ccc;\n  border-bottom: 1px solid #ccc;\n}\n")
var app;

app = document.app;

module.exports = {
  data: function() {
    return $.extend(app.data(), {
      events: this.$parent.events
    });
  },
  computed: {
    ref: function() {
      return parseInt(this.$route.params.event);
    },
    event: function() {
      return this.events.find((function(_this) {
        return function(e) {
          return e.ref === _this.ref;
        };
      })(this));
    }
  },
  filters: {
    stringify: JSON.stringify,
    flatten: function(event) {
      var offsetA, offsetB;
      offsetA = 0;
      offsetB = 0;
      return event.content.payload.reduce((function(_this) {
        return function(acc, e, i, a) {
          if (e.lines) {
            if (e.type === 'add') {
              offsetA += e.lines.length;
            }
            if (e.type === 'rem') {
              offsetB += e.lines.length;
            }
            acc = acc.concat(e.lines.map(function(text, i) {
              return {
                indexA: e.type !== 'add' ? e.start - offsetA + i : void 0,
                indexB: e.type !== 'rem' ? e.start - offsetB + i : void 0,
                type: e.type,
                text: text
              };
            }));
          } else {
            acc.push({
              type: 'ellipsis',
              size: e.size
            });
          }
          return acc;
        };
      })(this), []);
    }
  },
  methods: {
    run: function() {
      return setTimeout(function() {
        var article, tr;
        article = $('article.event')[0];
        tr = $(article).find('tr.add, tr.rem')[0];
        if (article && tr) {
          return article.scrollTop = tr.offsetTop - (article.clientHeight / 2) + 80;
        }
      });
    },
    guessChangeType: function(change) {
      if (change.added != null) {
        return 'add';
      } else if (change.removed != null) {
        return 'rem';
      } else {
        return null;
      }
    }
  }
};

if (module.exports.__esModule) module.exports = module.exports.default
;(typeof module.exports === "function"? module.exports.options: module.exports).template = "<article transition=\"driftFade\" class=\"form event\" _v-1cd79741=\"\"><div v-if=\"event.content.type == 'change'\" _v-1cd79741=\"\"><table class=\"diff\" _v-1cd79741=\"\"><tbody _v-1cd79741=\"\"><tr v-for=\"line in event | flatten\" v-bind:class=\"line.type\" _v-1cd79741=\"\"><td class=\"index\" _v-1cd79741=\"\">{{line.indexA}}</td><td class=\"index\" _v-1cd79741=\"\">{{line.indexB}}</td><td class=\"type\" _v-1cd79741=\"\"><span v-if=\"line.type == 'add'\" _v-1cd79741=\"\">+</span><span v-if=\"line.type == 'rem'\" _v-1cd79741=\"\">-</span></td><td v-if=\"line.type != 'ellipsis'\" class=\"text\" _v-1cd79741=\"\"><code _v-1cd79741=\"\">{{line.text}}</code></td><td v-else=\"v-else\" class=\"ellipsis\" _v-1cd79741=\"\"><span _v-1cd79741=\"\">{{line.size}} omitted lines</span></td></tr></tbody></table><hr class=\"eof\" _v-1cd79741=\"\"></div><div v-else=\"v-else\" _v-1cd79741=\"\"><pre _v-1cd79741=\"\">{{event | stringify null '  '}}</pre></div></article>"
if (module.hot) {(function () {  module.hot.accept()
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), true)
  if (!hotAPI.compatible) return
  module.hot.dispose(function () {
    __vueify_insert__.cache["article[_v-1cd79741] {\n  padding: 0 !important;\n  overflow: auto;\n}\narticle table.diff[_v-1cd79741] {\n  display: block;\n  width: 100%;\n  background: #fff;\n  border-collapse: collapse;\n  overflow: hidden;\n}\narticle table.diff tr[_v-1cd79741] {\n  position: relative;\n}\narticle table.diff tr td.index[_v-1cd79741] {\n  padding: 0 8px;\n  background: #f2f2f2;\n  border-right: 1px solid #ccc;\n  font-size: 0.7em;\n  text-align: center;\n  color: #999;\n}\narticle table.diff tr td.type span[_v-1cd79741] {\n  display: block;\n  width: 20px;\n  text-align: center;\n}\narticle table.diff tr td.text[_v-1cd79741] {\n  width: 100%;\n  padding-right: 15px;\n}\narticle table.diff tr td.ellipsis[_v-1cd79741] {\n  padding-right: 15px;\n  text-align: center;\n  font-size: 0.7em;\n  color: #999;\n}\narticle table.diff tr td.ellipsis span[_v-1cd79741] {\n  display: block;\n  width: 100%;\n  padding: 10px 0;\n}\narticle table.diff tr.add td[_v-1cd79741] {\n  background: #e3f4d7;\n  color: #5aa02c;\n  font-weight: 700;\n}\narticle table.diff tr.rem td[_v-1cd79741] {\n  background: #f5dad7;\n  color: #d40000;\n  font-weight: 700;\n}\narticle hr.eof[_v-1cd79741] {\n  margin: 0;\n  border: none;\n}\narticle hr.eof[_v-1cd79741]:after {\n  content: 'EOF';\n  display: block;\n  padding: 10px 0 10px 70px;\n  background: #f2f2f2;\n  text-align: center;\n  font-size: 0.7em;\n  color: #999;\n  border-top: 1px solid #ccc;\n  border-bottom: 1px solid #ccc;\n}\n"] = false
    document.head.removeChild(__vueify_style__)
  })
  if (!module.hot.data) {
    hotAPI.createRecord("_v-1cd79741", module.exports)
  } else {
    hotAPI.update("_v-1cd79741", module.exports, (typeof module.exports === "function" ? module.exports.options : module.exports).template)
  }
})()}
},{"vue":13,"vue-hot-reload-api":11,"vueify/lib/insert-css":14}],16:[function(require,module,exports){
var __vueify_insert__ = require("vueify/lib/insert-css")
var __vueify_style__ = __vueify_insert__.insert("nav[_v-879ec5b6] {\n  background: #44586d;\n  color: #fff;\n}\nnav div + header[_v-879ec5b6] {\n  border-top: 1px solid rgba(255,255,255,0.08);\n}\nnav ul + header[_v-879ec5b6] {\n  border-top: 1px solid rgba(255,255,255,0.08);\n}\nnav li[_v-879ec5b6] {\n  position: relative;\n  overflow: hidden;\n}\nnav li time[_v-879ec5b6] {\n  font-weight: normal;\n  font-size: 0.8em;\n}\nnav li p.stats[_v-879ec5b6] {\n  margin: 5px 0 0 0;\n}\nnav li p.stats span[_v-879ec5b6] {\n  font-weight: bold;\n  font-size: 0.8em;\n  margin-right: 5px;\n}\nnav li p.stats span.add[_v-879ec5b6] {\n  color: #b8e986;\n}\nnav li p.stats span.rem[_v-879ec5b6] {\n  color: #f37e83;\n}\nnav li[_v-879ec5b6]:after {\n  content: '';\n  display: block;\n  position: absolute;\n  top: 50%;\n  margin-top: -7px;\n  right: -10px;\n  width: 0;\n  height: 0;\n  border-style: solid;\n  border-width: 7px 7px 7px 0;\n  border-color: transparent #fff transparent transparent;\n  -webkit-transition: right 0.2s ease;\n  transition: right 0.2s ease;\n}\nnav li.policy span[_v-879ec5b6] {\n  color: #fff;\n}\nnav li.selected[_v-879ec5b6]:after {\n  right: 0;\n}\narticle article[_v-879ec5b6] {\n  position: absolute;\n  top: 0;\n  left: 275px;\n}\n")
var app;

app = document.app;

module.exports = {
  data: function() {
    return $.extend(app.data(), {
      watcher: this.$parent.currentWatcher
    });
  },
  computed: {
    path: function() {
      return decodeURIComponent(this.$route.params.file);
    },
    fileName: function() {
      return this.path.split('/').pop();
    },
    file: function() {
      return this.watcher.settings.files[this.path];
    },
    policies: function() {
      return this.file.policies;
    },
    events: function() {
      return this.watcher.events && this.watcher.events[this.path] || [];
    },
    thereAreEvents: function() {
      return Object.keys(this.events).length > 0;
    }
  },
  filters: {
    prettyDate: function(zulu) {
      var d;
      d = new Date(zulu || Date.now());
      return (d.toLocaleDateString()) + " @ " + (d.toLocaleTimeString());
    },
    countByType: function(changes, type) {
      if (!changes) {
        return;
      }
      return changes.reduce(function(acc, change, i, a) {
        if ((change.type != null) && change.type === type) {
          return acc + change.lines.length;
        } else {
          return acc;
        }
      }, 0);
    },
    stringify: function(o) {
      return JSON.stringify(o);
    }
  },
  methods: {
    contextMenu: function(e) {
      var MenuItem, error, index, menu, name;
      name = $(e.target).closest('li').data('name');
      index = $(e.target).closest('li').data('index');
      try {
        MenuItem = window.electron.MenuItem;
        menu = new window.electron.Menu();
        menu.append(new MenuItem({
          label: "Options for \"" + name + "\"",
          enabled: false
        }));
        menu.append(new MenuItem({
          type: 'separator'
        }));
        menu.append(new MenuItem({
          label: 'Remove policy',
          accelerator: 's',
          click: (function(_this) {
            return function() {
              return _this.removePolicy(index, name);
            };
          })(this)
        }));
        return menu.popup(window.electron.getCurrentWindow());
      } catch (error) {
        e = error;
        return console.error(e);
      }
    },
    removePolicy: function(index, name) {
      var e, error;
      try {
        return window.electron.dialog.showMessageBox({
          type: 'question',
          message: "Do you want to remove policy \"" + name + "\" from file \"" + this.path + "\"?",
          buttons: ['cancel', 'ok']
        }, (function(_this) {
          return function(res) {
            if (!res) {
              return;
            }
            _this.file.policies.splice(index, 1);
            document.vault.replace('settings', $.extend(_this.watcher.settings, {
              encrypt: true
            }));
            app.save();
            return app.router.go({
              name: 'file'
            });
          };
        })(this));
      } catch (error) {
        e = error;
        return console.error(e);
      }
    }
  }
};

if (module.exports.__esModule) module.exports = module.exports.default
;(typeof module.exports === "function"? module.exports.options: module.exports).template = "<article transition=\"driftFade\" class=\"file\" _v-879ec5b6=\"\"><nav _v-879ec5b6=\"\"><header _v-879ec5b6=\"\"><button v-link=\"{ name: 'policyAdd'}\" class=\"add\" _v-879ec5b6=\"\"><img src=\"/img/add.svg\" _v-879ec5b6=\"\"></button><h1 _v-879ec5b6=\"\">Smart Policies</h1></header><ul v-if=\"policies &amp;&amp; policies.length > 0\" _v-879ec5b6=\"\"><li v-for=\"(i, policy) of policies\" v-link=\"{ name: 'policy', params: { policy: i }, activeClass: 'selected' }\" @contextmenu=\"contextMenu\" data-name=\"{{policy.name}}\" data-index=\"{{i}}\" class=\"policy\" _v-879ec5b6=\"\"><span _v-879ec5b6=\"\">{{policy.name}}</span></li></ul><div v-else=\"v-else\" class=\"empty\" _v-879ec5b6=\"\">No policies have been defined yet.\n<p _v-879ec5b6=\"\"><b _v-879ec5b6=\"\"><a v-link=\"{ name: 'policyAdd'}\" class=\"cool\" _v-879ec5b6=\"\">Click here</a></b> to add a policy.</p></div><header _v-879ec5b6=\"\"><h1 _v-879ec5b6=\"\">Events</h1></header><ul v-if=\"thereAreEvents\" _v-879ec5b6=\"\"><li v-for=\"event in events | orderBy 'time' -1\" v-link=\"{ name: 'event', params: { event: event.ref }, activeClass: 'selected' }\" _v-879ec5b6=\"\"><time datetime=\"event.time\" _v-879ec5b6=\"\">{{event.time | prettyDate}}</time><p v-if=\"event.content.type == &quot;change&quot;\" class=\"stats\" _v-879ec5b6=\"\"><span v-if=\"event.content.payload | countByType 'add'\" class=\"add\" _v-879ec5b6=\"\">+{{event.content.payload | countByType 'add'}}</span><span v-if=\"event.content.payload | countByType 'rem'\" class=\"rem\" _v-879ec5b6=\"\">-{{event.content.payload | countByType 'rem'}}</span></p></li></ul><div v-else=\"v-else\" class=\"empty\" _v-879ec5b6=\"\">No events have been received yet.</div></nav><router-view _v-879ec5b6=\"\"></router-view></article>"
if (module.hot) {(function () {  module.hot.accept()
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), true)
  if (!hotAPI.compatible) return
  module.hot.dispose(function () {
    __vueify_insert__.cache["nav[_v-879ec5b6] {\n  background: #44586d;\n  color: #fff;\n}\nnav div + header[_v-879ec5b6] {\n  border-top: 1px solid rgba(255,255,255,0.08);\n}\nnav ul + header[_v-879ec5b6] {\n  border-top: 1px solid rgba(255,255,255,0.08);\n}\nnav li[_v-879ec5b6] {\n  position: relative;\n  overflow: hidden;\n}\nnav li time[_v-879ec5b6] {\n  font-weight: normal;\n  font-size: 0.8em;\n}\nnav li p.stats[_v-879ec5b6] {\n  margin: 5px 0 0 0;\n}\nnav li p.stats span[_v-879ec5b6] {\n  font-weight: bold;\n  font-size: 0.8em;\n  margin-right: 5px;\n}\nnav li p.stats span.add[_v-879ec5b6] {\n  color: #b8e986;\n}\nnav li p.stats span.rem[_v-879ec5b6] {\n  color: #f37e83;\n}\nnav li[_v-879ec5b6]:after {\n  content: '';\n  display: block;\n  position: absolute;\n  top: 50%;\n  margin-top: -7px;\n  right: -10px;\n  width: 0;\n  height: 0;\n  border-style: solid;\n  border-width: 7px 7px 7px 0;\n  border-color: transparent #fff transparent transparent;\n  -webkit-transition: right 0.2s ease;\n  transition: right 0.2s ease;\n}\nnav li.policy span[_v-879ec5b6] {\n  color: #fff;\n}\nnav li.selected[_v-879ec5b6]:after {\n  right: 0;\n}\narticle article[_v-879ec5b6] {\n  position: absolute;\n  top: 0;\n  left: 275px;\n}\n"] = false
    document.head.removeChild(__vueify_style__)
  })
  if (!module.hot.data) {
    hotAPI.createRecord("_v-879ec5b6", module.exports)
  } else {
    hotAPI.update("_v-879ec5b6", module.exports, (typeof module.exports === "function" ? module.exports.options : module.exports).template)
  }
})()}
},{"vue":13,"vue-hot-reload-api":11,"vueify/lib/insert-css":14}],17:[function(require,module,exports){
var __vueify_insert__ = require("vueify/lib/insert-css")
var __vueify_style__ = __vueify_insert__.insert("input[name='path'][_v-aad10e28] {\n  box-sizing: border-box;\n  width: 100%;\n}\n")
var app;

app = document.app;

module.exports = {
  mixins: [(require('vue-focus')).mixin],
  data: function() {
    return $.extend(app.data(), {
      path: '',
      index: this.$parent.index
    });
  },
  computed: {
    watcher: function() {
      return this.$parent.currentWatcher;
    }
  },
  methods: {
    watchMe: function(e) {
      return this.path = e.target.innerText;
    },
    submit: function(e) {
      var settings;
      e.preventDefault();
      settings = this.watcher.settings;
      settings.files[this.path] = {
        policies: []
      };
      this.$parent.$set('currentWatcher.settings', settings);
      document.vault.replace('settings', $.extend(settings, {
        encrypt: true
      }));
      app.save();
      return app.router.go({
        name: 'file',
        params: {
          watcher: this.index,
          file: encodeURIComponent(this.path)
        }
      });
    }
  }
};

if (module.exports.__esModule) module.exports = module.exports.default
;(typeof module.exports === "function"? module.exports.options: module.exports).template = "<article transition=\"driftFade\" class=\"form fileAdd\" _v-aad10e28=\"\"><form @keyup.enter=\"submit\" _v-aad10e28=\"\"><header _v-aad10e28=\"\"><h1 _v-aad10e28=\"\">Start watching a file in <strong _v-aad10e28=\"\">{{watcher.name}}</strong></h1></header><p _v-aad10e28=\"\">{{appName}} can watch an track all the files in your server that need to be monitored to ensure system intigrity.</p><p _v-aad10e28=\"\">Recommended files to watch are those containing the system and access logs, such as <code @click=\"watchMe\" class=\"clickable\" _v-aad10e28=\"\">/var/log/syslog</code> and <code @click=\"watchMe\" class=\"clickable\" _v-aad10e28=\"\">/var/log/auth.log</code>.</p><fieldset _v-aad10e28=\"\"><label for=\"path\" _v-aad10e28=\"\">File path</label><input type=\"text\" name=\"path\" placeholder=\"/var/log/syslog\" v-model=\"path\" v-focus-auto=\"v-focus-auto\" _v-aad10e28=\"\"><span class=\"tip\" _v-aad10e28=\"\">Please consign the <strong _v-aad10e28=\"\">absolute path</strong> of the file to watch.</span></fieldset><footer _v-aad10e28=\"\"><button @click=\"submit\" v-if=\"path.split('/').pop()\" class=\"ok\" _v-aad10e28=\"\">Start watching <i _v-aad10e28=\"\">{{path.split('/').pop()}}</i></button></footer></form></article>"
if (module.hot) {(function () {  module.hot.accept()
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), true)
  if (!hotAPI.compatible) return
  module.hot.dispose(function () {
    __vueify_insert__.cache["input[name='path'][_v-aad10e28] {\n  box-sizing: border-box;\n  width: 100%;\n}\n"] = false
    document.head.removeChild(__vueify_style__)
  })
  if (!module.hot.data) {
    hotAPI.createRecord("_v-aad10e28", module.exports)
  } else {
    hotAPI.update("_v-aad10e28", module.exports, (typeof module.exports === "function" ? module.exports.options : module.exports).template)
  }
})()}
},{"vue":13,"vue-focus":10,"vue-hot-reload-api":11,"vueify/lib/insert-css":14}],18:[function(require,module,exports){
var __vueify_insert__ = require("vueify/lib/insert-css")
var __vueify_style__ = __vueify_insert__.insert("section.dashboard > nav,\nsection.dashboard > article nav {\n  width: 275px;\n  position: fixed;\n  top: 0;\n  bottom: 0;\n  overflow: auto;\n}\nsection.dashboard > nav button.add,\nsection.dashboard > article nav button.add {\n  position: absolute;\n  top: 23px;\n  right: 16px;\n  min-width: auto;\n  min-height: auto;\n  margin: 0;\n  border: none;\n  padding: 0 4px;\n  background: none;\n  opacity: 0.7;\n}\nsection.dashboard > nav button.add:hover,\nsection.dashboard > article nav button.add:hover {\n  box-shadow: none;\n  opacity: 1;\n}\nsection.dashboard > nav > div,\nsection.dashboard > article nav > div {\n  position: relative;\n}\nsection.dashboard > nav > div.watchers,\nsection.dashboard > article nav > div.watchers {\n  background: #2c3e50;\n}\nsection.dashboard > nav > div.watchers header,\nsection.dashboard > article nav > div.watchers header {\n  padding: 30px 20px 25px 20px;\n  border-bottom: 1px solid #34495e;\n}\nsection.dashboard > nav > div.watchers header h1,\nsection.dashboard > article nav > div.watchers header h1 {\n  font-weight: 900;\n}\nsection.dashboard > nav > div.watchers header button.menu,\nsection.dashboard > article nav > div.watchers header button.menu {\n  position: absolute;\n  top: 30px;\n  right: 20px;\n  padding-left: 15px;\n  -webkit-transition: all 0.2s ease;\n  transition: all 0.2s ease;\n  background: #2c3e50;\n}\nsection.dashboard > nav > div.watchers header button.menu img,\nsection.dashboard > article nav > div.watchers header button.menu img {\n  opacity: 0.7;\n  height: 14px;\n}\nsection.dashboard > nav > div.watchers header button.menu:hover img,\nsection.dashboard > article nav > div.watchers header button.menu:hover img {\n  opacity: 1;\n}\nsection.dashboard > nav > div.watchers header button.menu:before,\nsection.dashboard > article nav > div.watchers header button.menu:before {\n  content: '';\n  display: block;\n  position: absolute;\n  left: -28px;\n  width: 30px;\n  height: 100%;\n  background: -webkit-linear-gradient(left, rgba(44,62,80,0) 0%, #2c3e50 100%);\n  background: linear-gradient(90deg, rgba(44,62,80,0) 0%, #2c3e50 100%);\n}\nsection.dashboard > nav > div.watchers header .tools,\nsection.dashboard > article nav > div.watchers header .tools {\n  position: absolute;\n  top: -1px;\n  right: 50px;\n  display: block;\n  height: 75px;\n  background: #2c3e50;\n  -webkit-animation: fade-in 0.2s;\n          animation: fade-in 0.2s;\n}\nsection.dashboard > nav > div.watchers header .tools *,\nsection.dashboard > article nav > div.watchers header .tools * {\n  position: relative;\n  float: right;\n  right: 0;\n  margin-left: 15px;\n}\nsection.dashboard > nav > div.watchers header .tools:before,\nsection.dashboard > article nav > div.watchers header .tools:before {\n  content: '';\n  display: block;\n  position: absolute;\n  left: -30px;\n  width: 30px;\n  height: 100%;\n  background: -webkit-linear-gradient(left, rgba(44,62,80,0) 0%, #2c3e50 100%);\n  background: linear-gradient(90deg, rgba(44,62,80,0) 0%, #2c3e50 100%);\n}\nsection.dashboard > nav > div.watchers header .tools button.add,\nsection.dashboard > article nav > div.watchers header .tools button.add {\n  top: 31px;\n}\nsection.dashboard > nav > div.watchers ul,\nsection.dashboard > article nav > div.watchers ul {\n  margin: 0;\n  -webkit-animation: pop-in 0.2s;\n          animation: pop-in 0.2s;\n}\nsection.dashboard > nav > div.watchers ul li a,\nsection.dashboard > article nav > div.watchers ul li a {\n  display: block;\n  padding: 8px 0 5px 0;\n  color: #fff;\n  font-size: 0.9em;\n  font-weight: bold;\n  text-decoration: none;\n  text-transform: uppercase;\n  opacity: 0.7;\n}\nsection.dashboard > nav header,\nsection.dashboard > article nav header {\n  padding: 23px 20px 19px 20px;\n}\nsection.dashboard > nav header h1,\nsection.dashboard > article nav header h1 {\n  display: inline-block;\n  margin: 0;\n  font-size: 0.9em;\n  font-weight: 700;\n  text-transform: uppercase;\n  color: #fff;\n}\nsection.dashboard > nav.main,\nsection.dashboard > article nav.main {\n  color: #fff;\n  left: 0;\n  background: #34495e;\n}\nsection.dashboard > nav.main ul,\nsection.dashboard > article nav.main ul {\n  margin: 0;\n}\nsection.dashboard > nav.main ul li,\nsection.dashboard > article nav.main ul li {\n  overflow: hidden;\n}\nsection.dashboard > nav.main ul li:after,\nsection.dashboard > article nav.main ul li:after {\n  content: '';\n  display: block;\n  position: absolute;\n  top: 12px;\n  right: -10px;\n  width: 0;\n  height: 0;\n  border-style: solid;\n  border-width: 7px 7px 7px 0;\n  border-color: transparent #44586d transparent transparent;\n  -webkit-transition: right 0.2s ease;\n  transition: right 0.2s ease;\n}\nsection.dashboard > nav.main ul li.selected,\nsection.dashboard > article nav.main ul li.selected {\n  border-left: 3px solid #fff;\n  padding-left: 17px;\n}\nsection.dashboard > nav.main ul li.selected:after,\nsection.dashboard > article nav.main ul li.selected:after {\n  right: 0;\n}\nsection.dashboard > nav.main ul li .path,\nsection.dashboard > article nav.main ul li .path {\n  color: rgba(255,255,255,0.7);\n}\nsection.dashboard > nav.main ul li .path strong,\nsection.dashboard > article nav.main ul li .path strong {\n  color: #fff;\n}\nsection.dashboard > nav ul,\nsection.dashboard > article nav ul {\n  list-style-type: none;\n  padding: 0;\n  margin: 0 0 20px 0;\n}\nsection.dashboard > nav ul li,\nsection.dashboard > article nav ul li {\n  position: relative;\n  padding: 10px 20px;\n  cursor: pointer;\n}\nsection.dashboard > nav .empty,\nsection.dashboard > article nav .empty {\n  display: block;\n  margin: 0;\n  padding: 15px 20px;\n  color: #fff;\n  font-style: italic;\n  opacity: 0.7;\n}\nsection.dashboard a.cool {\n  text-decoration: none;\n  font-weight: bold;\n  color: #fff;\n}\nsection.dashboard article {\n  position: fixed;\n  top: 0;\n  right: 0;\n  bottom: 0;\n  left: 275px;\n  background: #fff;\n  z-index: 1;\n}\nsection.dashboard article.form {\n  padding: 30px;\n  color: #444;\n}\nsection.dashboard article.form a.cool {\n  color: #f37e83;\n}\nsection.dashboard article.form header {\n  margin-bottom: 20px;\n}\nsection.dashboard article.form header h1 {\n  margin: 0;\n  font-size: 2em;\n  font-weight: 300;\n  color: #777;\n}\nsection.dashboard article.form p {\n  line-height: 1.6em;\n}\nsection.dashboard article.form p code {\n  position: relative;\n  top: -1px;\n  padding: 4px 5px 4px 5px;\n  background: #555;\n  color: #fff;\n  border-radius: 2px;\n}\nsection.dashboard article.form form {\n  padding: 30px;\n  position: absolute;\n  top: 0;\n  left: 0;\n  right: 0;\n  bottom: 0;\n  overflow: auto;\n}\nsection.dashboard article.form form fieldset {\n  margin-bottom: 10px;\n  padding: 0;\n  border: none;\n}\nsection.dashboard article.form form fieldset label,\nsection.dashboard article.form form fieldset .label-alike {\n  display: block;\n  position: relative;\n  top: 1px;\n  width: 200px;\n  margin-right: 30px;\n  margin-bottom: 5px;\n  font-size: 0.9em;\n  font-weight: 600;\n  color: #888;\n  text-transform: uppercase;\n}\nsection.dashboard article.form form fieldset input,\nsection.dashboard article.form form fieldset select {\n  display: block;\n  margin-bottom: 10px;\n  padding: 10px;\n  background: #fff;\n  border: 0;\n  border-bottom: 1px solid #ccc;\n}\nsection.dashboard article.form form fieldset input:focus,\nsection.dashboard article.form form fieldset select:focus {\n  border-color: #999;\n}\nsection.dashboard article.form form fieldset .tip {\n  display: block;\n  padding: 5px;\n  font-style: italic;\n  color: #999;\n}\nsection.dashboard article.form form :last-child {\n  margin-bottom: 15px;\n}\nsection.dashboard article.form footer {\n  text-align: center;\n}\n.logoWatermark {\n  position: fixed;\n  top: 0;\n  right: 30px;\n  width: 70vh;\n  opacity: 0.3;\n  -webkit-transform: rotateZ(-90deg);\n          transform: rotateZ(-90deg);\n  -webkit-transform-origin: 100% 100% 0;\n          transform-origin: 100% 100% 0;\n}\n")
var app;

app = document.app;

module.exports = {
  data: function() {
    return $.extend(app.data(), {
      settings: app.settings,
      watchers: app.settings.watchers,
      isOpen: false
    });
  },
  computed: {
    index: function() {
      var ref;
      return ((ref = this.$route.params) != null ? ref.watcher : void 0) || 0;
    },
    fingerprint: function() {
      return app.settings.watchers[this.index].fingerprint;
    },
    currentWatcher: function() {
      return app.settings.watchers[this.index];
    },
    hasFiles: function() {
      return Object.keys(this.currentWatcher.settings.files).length > 0;
    }
  },
  filters: {
    other: function(watcher) {
      return watcher.fingerprint !== this.currentWatcher.fingerprint;
    },
    decoratePath: function(path) {
      var chunked, filename, room;
      chunked = path.split('/');
      filename = chunked.slice(-1);
      path = chunked.slice(0, -1).join('/');
      room = 14 - filename.length;
      if (path.length > room) {
        path = path.slice(0, room);
        path += "<small>...</small>";
      }
      return path + "/<strong>" + filename + "</strong>";
    }
  },
  methods: {
    open: function() {
      return this.isOpen = !this.isOpen;
    },
    contextMenu: function(e) {
      var MenuItem, error, menu, path;
      path = $(e.target).closest('li').data('path');
      try {
        MenuItem = window.electron.MenuItem;
        menu = new window.electron.Menu();
        menu.append(new MenuItem({
          label: "Options for " + path,
          enabled: false
        }));
        menu.append(new MenuItem({
          type: 'separator'
        }));
        menu.append(new MenuItem({
          label: 'Add a policy',
          accelerator: 'p',
          click: (function(_this) {
            return function() {
              return app.router.go({
                name: 'policyAdd',
                params: {
                  watcher: _this.index,
                  file: encodeURIComponent(path)
                }
              });
            };
          })(this)
        }));
        menu.append(new MenuItem({
          label: 'Stop watching',
          accelerator: 's',
          click: (function(_this) {
            return function() {
              return _this.stopWatching(path);
            };
          })(this)
        }));
        return menu.popup(window.electron.getCurrentWindow());
      } catch (error) {
        e = error;
        return console.error(e);
      }
    },
    stopWatching: function(path) {
      var e, error;
      try {
        return window.electron.dialog.showMessageBox({
          type: 'question',
          message: "Do you want to stop watching '" + path + "' and completely remove all trace of it from " + this.appName + "?",
          buttons: ['cancel', 'ok']
        }, (function(_this) {
          return function(res) {
            var events, files;
            if (!res) {
              return;
            }
            files = $.extend({}, _this.currentWatcher.settings.files);
            events = $.extend({}, _this.currentWatcher.events);
            delete files[path];
            delete events[path];
            _this.$set('currentWatcher.settings.files', files);
            _this.$set('currentWatcher.events', events);
            document.vault.replace('settings', $.extend(_this.currentWatcher.settings, {
              encrypt: true
            }));
            app.save();
            return app.router.go('/dashboard');
          };
        })(this));
      } catch (error) {
        e = error;
        return console.error(e);
      }
    }
  }
};

if (module.exports.__esModule) module.exports = module.exports.default
;(typeof module.exports === "function"? module.exports.options: module.exports).template = "<section transition=\"fade\" class=\"dashboard\"><nav class=\"main\"><div class=\"watchers\"><header><button @click=\"open\" class=\"plain menu\"><img src=\"/img/menu.svg\"/></button><div v-if=\"isOpen\" class=\"tools\"><button v-link=\"{ path : '/wizard/import' }\" class=\"add\"><img src=\"/img/add.svg\"/></button></div><h1>{{currentWatcher.name}}</h1></header><ul v-if=\"isOpen\"><li v-for=\"(index, watcher) of watchers\" v-if=\"watcher | other\"><a v-link=\"{ name: 'watcher', params: { watcher: index }}\">{{watcher.name}}</a></li></ul></div><div v-if=\"currentWatcher\" class=\"files\"><header><button v-link=\"{ path: '/dashboard/' + index + '/fileAdd' }\" class=\"add\"><img src=\"/img/add.svg\"/></button><h1>Watched files</h1></header></div><ul v-if=\"hasFiles\"><li v-for=\"(path, file) of currentWatcher.settings.files\" v-link=\"{ name: 'file', params: { watcher: index, file: encodeURIComponent(path) }, activeClass: 'selected'}\" @contextmenu=\"contextMenu\" data-path=\"{{path}}\"><span class=\"path\">{{{path | decoratePath}}}</span></li></ul><div v-else=\"v-else\" class=\"empty\">No files are being watched.\n<p><b><a v-link=\"{ path: '/dashboard/' + index + '/fileAdd' }\" class=\"cool\">Click here</a></b> to start watching a file.</p></div></nav><router-view></router-view><img src=\"/img/logo.svg\" class=\"logoWatermark\"/></section>"
if (module.hot) {(function () {  module.hot.accept()
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), true)
  if (!hotAPI.compatible) return
  module.hot.dispose(function () {
    __vueify_insert__.cache["section.dashboard > nav,\nsection.dashboard > article nav {\n  width: 275px;\n  position: fixed;\n  top: 0;\n  bottom: 0;\n  overflow: auto;\n}\nsection.dashboard > nav button.add,\nsection.dashboard > article nav button.add {\n  position: absolute;\n  top: 23px;\n  right: 16px;\n  min-width: auto;\n  min-height: auto;\n  margin: 0;\n  border: none;\n  padding: 0 4px;\n  background: none;\n  opacity: 0.7;\n}\nsection.dashboard > nav button.add:hover,\nsection.dashboard > article nav button.add:hover {\n  box-shadow: none;\n  opacity: 1;\n}\nsection.dashboard > nav > div,\nsection.dashboard > article nav > div {\n  position: relative;\n}\nsection.dashboard > nav > div.watchers,\nsection.dashboard > article nav > div.watchers {\n  background: #2c3e50;\n}\nsection.dashboard > nav > div.watchers header,\nsection.dashboard > article nav > div.watchers header {\n  padding: 30px 20px 25px 20px;\n  border-bottom: 1px solid #34495e;\n}\nsection.dashboard > nav > div.watchers header h1,\nsection.dashboard > article nav > div.watchers header h1 {\n  font-weight: 900;\n}\nsection.dashboard > nav > div.watchers header button.menu,\nsection.dashboard > article nav > div.watchers header button.menu {\n  position: absolute;\n  top: 30px;\n  right: 20px;\n  padding-left: 15px;\n  -webkit-transition: all 0.2s ease;\n  transition: all 0.2s ease;\n  background: #2c3e50;\n}\nsection.dashboard > nav > div.watchers header button.menu img,\nsection.dashboard > article nav > div.watchers header button.menu img {\n  opacity: 0.7;\n  height: 14px;\n}\nsection.dashboard > nav > div.watchers header button.menu:hover img,\nsection.dashboard > article nav > div.watchers header button.menu:hover img {\n  opacity: 1;\n}\nsection.dashboard > nav > div.watchers header button.menu:before,\nsection.dashboard > article nav > div.watchers header button.menu:before {\n  content: '';\n  display: block;\n  position: absolute;\n  left: -28px;\n  width: 30px;\n  height: 100%;\n  background: -webkit-linear-gradient(left, rgba(44,62,80,0) 0%, #2c3e50 100%);\n  background: linear-gradient(90deg, rgba(44,62,80,0) 0%, #2c3e50 100%);\n}\nsection.dashboard > nav > div.watchers header .tools,\nsection.dashboard > article nav > div.watchers header .tools {\n  position: absolute;\n  top: -1px;\n  right: 50px;\n  display: block;\n  height: 75px;\n  background: #2c3e50;\n  -webkit-animation: fade-in 0.2s;\n          animation: fade-in 0.2s;\n}\nsection.dashboard > nav > div.watchers header .tools *,\nsection.dashboard > article nav > div.watchers header .tools * {\n  position: relative;\n  float: right;\n  right: 0;\n  margin-left: 15px;\n}\nsection.dashboard > nav > div.watchers header .tools:before,\nsection.dashboard > article nav > div.watchers header .tools:before {\n  content: '';\n  display: block;\n  position: absolute;\n  left: -30px;\n  width: 30px;\n  height: 100%;\n  background: -webkit-linear-gradient(left, rgba(44,62,80,0) 0%, #2c3e50 100%);\n  background: linear-gradient(90deg, rgba(44,62,80,0) 0%, #2c3e50 100%);\n}\nsection.dashboard > nav > div.watchers header .tools button.add,\nsection.dashboard > article nav > div.watchers header .tools button.add {\n  top: 31px;\n}\nsection.dashboard > nav > div.watchers ul,\nsection.dashboard > article nav > div.watchers ul {\n  margin: 0;\n  -webkit-animation: pop-in 0.2s;\n          animation: pop-in 0.2s;\n}\nsection.dashboard > nav > div.watchers ul li a,\nsection.dashboard > article nav > div.watchers ul li a {\n  display: block;\n  padding: 8px 0 5px 0;\n  color: #fff;\n  font-size: 0.9em;\n  font-weight: bold;\n  text-decoration: none;\n  text-transform: uppercase;\n  opacity: 0.7;\n}\nsection.dashboard > nav header,\nsection.dashboard > article nav header {\n  padding: 23px 20px 19px 20px;\n}\nsection.dashboard > nav header h1,\nsection.dashboard > article nav header h1 {\n  display: inline-block;\n  margin: 0;\n  font-size: 0.9em;\n  font-weight: 700;\n  text-transform: uppercase;\n  color: #fff;\n}\nsection.dashboard > nav.main,\nsection.dashboard > article nav.main {\n  color: #fff;\n  left: 0;\n  background: #34495e;\n}\nsection.dashboard > nav.main ul,\nsection.dashboard > article nav.main ul {\n  margin: 0;\n}\nsection.dashboard > nav.main ul li,\nsection.dashboard > article nav.main ul li {\n  overflow: hidden;\n}\nsection.dashboard > nav.main ul li:after,\nsection.dashboard > article nav.main ul li:after {\n  content: '';\n  display: block;\n  position: absolute;\n  top: 12px;\n  right: -10px;\n  width: 0;\n  height: 0;\n  border-style: solid;\n  border-width: 7px 7px 7px 0;\n  border-color: transparent #44586d transparent transparent;\n  -webkit-transition: right 0.2s ease;\n  transition: right 0.2s ease;\n}\nsection.dashboard > nav.main ul li.selected,\nsection.dashboard > article nav.main ul li.selected {\n  border-left: 3px solid #fff;\n  padding-left: 17px;\n}\nsection.dashboard > nav.main ul li.selected:after,\nsection.dashboard > article nav.main ul li.selected:after {\n  right: 0;\n}\nsection.dashboard > nav.main ul li .path,\nsection.dashboard > article nav.main ul li .path {\n  color: rgba(255,255,255,0.7);\n}\nsection.dashboard > nav.main ul li .path strong,\nsection.dashboard > article nav.main ul li .path strong {\n  color: #fff;\n}\nsection.dashboard > nav ul,\nsection.dashboard > article nav ul {\n  list-style-type: none;\n  padding: 0;\n  margin: 0 0 20px 0;\n}\nsection.dashboard > nav ul li,\nsection.dashboard > article nav ul li {\n  position: relative;\n  padding: 10px 20px;\n  cursor: pointer;\n}\nsection.dashboard > nav .empty,\nsection.dashboard > article nav .empty {\n  display: block;\n  margin: 0;\n  padding: 15px 20px;\n  color: #fff;\n  font-style: italic;\n  opacity: 0.7;\n}\nsection.dashboard a.cool {\n  text-decoration: none;\n  font-weight: bold;\n  color: #fff;\n}\nsection.dashboard article {\n  position: fixed;\n  top: 0;\n  right: 0;\n  bottom: 0;\n  left: 275px;\n  background: #fff;\n  z-index: 1;\n}\nsection.dashboard article.form {\n  padding: 30px;\n  color: #444;\n}\nsection.dashboard article.form a.cool {\n  color: #f37e83;\n}\nsection.dashboard article.form header {\n  margin-bottom: 20px;\n}\nsection.dashboard article.form header h1 {\n  margin: 0;\n  font-size: 2em;\n  font-weight: 300;\n  color: #777;\n}\nsection.dashboard article.form p {\n  line-height: 1.6em;\n}\nsection.dashboard article.form p code {\n  position: relative;\n  top: -1px;\n  padding: 4px 5px 4px 5px;\n  background: #555;\n  color: #fff;\n  border-radius: 2px;\n}\nsection.dashboard article.form form {\n  padding: 30px;\n  position: absolute;\n  top: 0;\n  left: 0;\n  right: 0;\n  bottom: 0;\n  overflow: auto;\n}\nsection.dashboard article.form form fieldset {\n  margin-bottom: 10px;\n  padding: 0;\n  border: none;\n}\nsection.dashboard article.form form fieldset label,\nsection.dashboard article.form form fieldset .label-alike {\n  display: block;\n  position: relative;\n  top: 1px;\n  width: 200px;\n  margin-right: 30px;\n  margin-bottom: 5px;\n  font-size: 0.9em;\n  font-weight: 600;\n  color: #888;\n  text-transform: uppercase;\n}\nsection.dashboard article.form form fieldset input,\nsection.dashboard article.form form fieldset select {\n  display: block;\n  margin-bottom: 10px;\n  padding: 10px;\n  background: #fff;\n  border: 0;\n  border-bottom: 1px solid #ccc;\n}\nsection.dashboard article.form form fieldset input:focus,\nsection.dashboard article.form form fieldset select:focus {\n  border-color: #999;\n}\nsection.dashboard article.form form fieldset .tip {\n  display: block;\n  padding: 5px;\n  font-style: italic;\n  color: #999;\n}\nsection.dashboard article.form form :last-child {\n  margin-bottom: 15px;\n}\nsection.dashboard article.form footer {\n  text-align: center;\n}\n.logoWatermark {\n  position: fixed;\n  top: 0;\n  right: 30px;\n  width: 70vh;\n  opacity: 0.3;\n  -webkit-transform: rotateZ(-90deg);\n          transform: rotateZ(-90deg);\n  -webkit-transform-origin: 100% 100% 0;\n          transform-origin: 100% 100% 0;\n}\n"] = false
    document.head.removeChild(__vueify_style__)
  })
  if (!module.hot.data) {
    hotAPI.createRecord("_v-30f1723c", module.exports)
  } else {
    hotAPI.update("_v-30f1723c", module.exports, (typeof module.exports === "function" ? module.exports.options : module.exports).template)
  }
})()}
},{"vue":13,"vue-hot-reload-api":11,"vueify/lib/insert-css":14}],19:[function(require,module,exports){
var __vueify_insert__ = require("vueify/lib/insert-css")
var __vueify_style__ = __vueify_insert__.insert("article header h2[_v-b5e9fcca] {\n  font-weight: 100;\n  font-size: 1em;\n  color: #666;\n}\narticle table[_v-b5e9fcca] {\n  display: table;\n  width: 100%;\n  background: #fefefe;\n  border-collapse: collapse;\n}\narticle table tr[_v-b5e9fcca] {\n  border-bottom: 1px solid #eee;\n}\narticle table tr td[_v-b5e9fcca] {\n  padding: 24px 2px 20px 2px;\n  vertical-align: top;\n  color: #666;\n}\narticle table tr td.key[_v-b5e9fcca] {\n  color: #777;\n  font-size: 0.9em;\n  font-weight: bold;\n}\narticle table tr td.val[_v-b5e9fcca] {\n  text-align: right;\n}\narticle h3[_v-b5e9fcca] {\n  margin-bottom: 10px;\n  font-size: 0.9em;\n  font-weight: 600;\n  color: #888;\n  text-transform: uppercase;\n}\n")
var app;

app = document.app;

module.exports = {
  data: function() {
    return app.data();
  },
  computed: {
    index: function() {
      return decodeURIComponent(this.$route.params.policy);
    },
    events: function() {
      return this.$parent.events;
    },
    policy: function() {
      return this.$parent.policies[this.index];
    }
  },
  methods: {
    openExternal: function(e) {
      var url;
      e.preventDefault();
      url = $(e.target).attr('href');
      return window.electron.shell.openExternal(url);
    }
  }
};

if (module.exports.__esModule) module.exports = module.exports.default
;(typeof module.exports === "function"? module.exports.options: module.exports).template = "<article transition=\"driftFade\" class=\"form policy\" _v-b5e9fcca=\"\"><header _v-b5e9fcca=\"\"><h1 _v-b5e9fcca=\"\"><strong _v-b5e9fcca=\"\"><em _v-b5e9fcca=\"\">\"{{policy.name}}\"</em></strong> policy stats</h1><h2 _v-b5e9fcca=\"\">Instance of <a @click=\"openExternal\" href=\"{{policy.uri}}\" class=\"cool\" _v-b5e9fcca=\"\">{{policy.uri}}</a></h2></header><table v-if=\"policy.params\" _v-b5e9fcca=\"\"><tbody _v-b5e9fcca=\"\"><tr v-for=\"(key, val) of policy.params\" _v-b5e9fcca=\"\"><td class=\"key\" _v-b5e9fcca=\"\">{{key}}</td><td class=\"val\" _v-b5e9fcca=\"\">{{val}}</td></tr></tbody></table></article>"
if (module.hot) {(function () {  module.hot.accept()
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), true)
  if (!hotAPI.compatible) return
  module.hot.dispose(function () {
    __vueify_insert__.cache["article header h2[_v-b5e9fcca] {\n  font-weight: 100;\n  font-size: 1em;\n  color: #666;\n}\narticle table[_v-b5e9fcca] {\n  display: table;\n  width: 100%;\n  background: #fefefe;\n  border-collapse: collapse;\n}\narticle table tr[_v-b5e9fcca] {\n  border-bottom: 1px solid #eee;\n}\narticle table tr td[_v-b5e9fcca] {\n  padding: 24px 2px 20px 2px;\n  vertical-align: top;\n  color: #666;\n}\narticle table tr td.key[_v-b5e9fcca] {\n  color: #777;\n  font-size: 0.9em;\n  font-weight: bold;\n}\narticle table tr td.val[_v-b5e9fcca] {\n  text-align: right;\n}\narticle h3[_v-b5e9fcca] {\n  margin-bottom: 10px;\n  font-size: 0.9em;\n  font-weight: 600;\n  color: #888;\n  text-transform: uppercase;\n}\n"] = false
    document.head.removeChild(__vueify_style__)
  })
  if (!module.hot.data) {
    hotAPI.createRecord("_v-b5e9fcca", module.exports)
  } else {
    hotAPI.update("_v-b5e9fcca", module.exports, (typeof module.exports === "function" ? module.exports.options : module.exports).template)
  }
})()}
},{"vue":13,"vue-hot-reload-api":11,"vueify/lib/insert-css":14}],20:[function(require,module,exports){
var __vueify_insert__ = require("vueify/lib/insert-css")
var __vueify_style__ = __vueify_insert__.insert("input[_v-092838b6],\nselect[_v-092838b6] {\n  box-sizing: border-box;\n  width: 100%;\n}\ninput[type=checkbox][_v-092838b6],\nselect[type=checkbox][_v-092838b6] {\n  width: auto;\n  margin-top: 15px;\n}\nfieldset.git[_v-092838b6] {\n  position: relative;\n}\nfieldset.git[_v-092838b6]:after {\n  display: block;\n  position: absolute;\n  top: 28px;\n  right: 10px;\n  padding: 3px 5px 1px 5px;\n  border-radius: 100%;\n  color: #fff;\n  font-size: 0.8em;\n  opacity: 0.7;\n}\nfieldset.git[data-valid][_v-092838b6]:after {\n  content: '✔';\n  background: #5aa02c;\n}\nfieldset.git[_v-092838b6]:not([data-valid]):after {\n  content: '✖';\n  background: #d40000;\n}\n")
var app;

app = document.app;

module.exports = {
  mixins: [(require('vue-focus')).mixin],
  data: function() {
    return $.extend(app.data(), {
      fileName: this.$parent.fileName,
      name: null,
      git: null,
      branches: null,
      gitURL: null,
      gitBranch: 'remotes/origin/master',
      fields: null,
      params: {},
      path: null,
      manifest: null,
      valid: null
    });
  },
  methods: {
    openExternal: function(e) {
      var url;
      e.preventDefault();
      url = $(e.target).attr('href');
      return window.electron.shell.openExternal(url);
    },
    getBranches: function(e) {
      if (!this.gitURL.match(new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&\/\/=]*)/))) {
        return;
      }
      this.path = "/tmp/git_" + (this.gitURL.split('/').pop().replace('.', '_'));
      window.mkdir(this.path);
      this.git = window.git(this.path).init();
      return this.git.getRemotes('origin', (function(_this) {
        return function(err, remotes) {
          var i, len, remote;
          for (i = 0, len = remotes.length; i < len; i++) {
            remote = remotes[i];
            if (remote.name.length > 0) {
              _this.git.removeRemote(remote.name);
            }
          }
          return _this.git.addRemote('origin', _this.gitURL).fetch().branch(function(err, arg) {
            var branches;
            branches = arg.branches;
            console.log(JSON.stringify(branches));
            _this.branches = Object.keys(branches).filter(function(branch) {
              return branch !== '(HEAD';
            });
            return _this.pullBranch();
          });
        };
      })(this));
    },
    pullBranch: function() {
      console.log("PULLING " + this.gitBranch);
      return this.git.checkout(this.gitBranch, (function(_this) {
        return function() {
          var field, key, ref, results;
          _this.manifest = JSON.parse(window.fs.readFileSync(_this.path + "/package.json"));
          if (_this.manifest.policy) {
            if (_this.manifest.policy.params) {
              _this.fields = _this.manifest.policy.params;
            }
            _this.valid = true;
            _this.name = _this.manifest.policy.defaultName;
            ref = _this.fields;
            results = [];
            for (key in ref) {
              field = ref[key];
              if (field["default"] != null) {
                results.push(_this.params[key] = field["default"]);
              }
            }
            return results;
          } else {
            return alert("This repository does not look like a Trailbot Smart Policy :(");
          }
        };
      })(this));
    },
    submit: function(e) {
      var field, key, ref;
      e.preventDefault();
      console.log(JSON.stringify(this.params));
      ref = this.fields;
      for (key in ref) {
        field = ref[key];
        if (!(field.type === 'url' && field.test)) {
          continue;
        }
        console.log("Testing " + this.params[key]);
        window.request({
          method: field.test,
          body: app.fooEvent,
          json: true,
          url: this.params[key]
        });
      }
      this.$parent.file.policies.push({
        name: this.name,
        uri: this.gitURL,
        ref: this.gitBranch.split('/').pop(),
        lang: this.manifest.policy.language,
        params: this.params
      });
      document.vault.replace('settings', $.extend(this.$parent.watcher.settings, {
        encrypt: true
      }));
      app.save();
      return app.router.go({
        name: 'policy',
        params: {
          policy: this.$parent.file.policies.length - 1
        }
      });
    }
  }
};

if (module.exports.__esModule) module.exports = module.exports.default
;(typeof module.exports === "function"? module.exports.options: module.exports).template = "<article transition=\"driftFade\" class=\"form policyAdd\" _v-092838b6=\"\"><form @keyup.enter=\"submit\" _v-092838b6=\"\"><header _v-092838b6=\"\"><h1 _v-092838b6=\"\">Add a new policy for <strong _v-092838b6=\"\">{{fileName}}</strong></h1></header><p _v-092838b6=\"\">Smart Policies are scripts that receive notifications every time a watched file changes. Policies trigger actions such as emailing someone, reverting changes or shutting the system down.</p><p _v-092838b6=\"\">Policies are Node.js packages downloaded from public git repositories. Anyone can take any available policy, fork it and improve it.</p><p _v-092838b6=\"\">Policies are parameterizable. Each policy package can define customizable \"fields\" to suit different monitoring needs.</p><p _v-092838b6=\"\">You can find some <a @click=\"openExternal\" href=\"https://github.com/trailbot/client/wiki/Smart-Policies#ready-to-use-policies\" class=\"cool\" _v-092838b6=\"\">ready-to-use policies</a> in GitHub and also <a @click=\"openExternal\" href=\"https://github.com/stampery/watcher/wiki/Smart-Policies\" class=\"cool\" _v-092838b6=\"\">learn how to write your own policies</a>.</p><fieldset data-valid=\"{{branches}}\" class=\"git\" _v-092838b6=\"\"><label for=\"gitURL\" _v-092838b6=\"\">Git HTTPS URL</label><input type=\"url\" name=\"gitURL\" v-model=\"gitURL\" @keyup=\"getBranches\" disabled=\"{{branches}}\" _v-092838b6=\"\"><span v-if=\"!branches\" class=\"tip\" _v-092838b6=\"\">Please consign the <strong _v-092838b6=\"\">HTTPS URL</strong> for the git repository of the policy package to be added.</span></fieldset><fieldset v-if=\"branches\" _v-092838b6=\"\"><label for=\"gitBranch\" _v-092838b6=\"\">Git Branch</label><select name=\"gitBranch\" v-model=\"gitBranch\" @change=\"pullBranch\" @blur=\"pullBranch\" _v-092838b6=\"\"><option v-for=\"branch of branches\" value=\"{{branch}}\" _v-092838b6=\"\">{{branch.split('/').pop()}}</option></select></fieldset><fieldset v-if=\"fields\" v-for=\"(key, field) of fields\" _v-092838b6=\"\"><label v-if=\"field.label\" for=\"{{key}}\" _v-092838b6=\"\">{{field.label}}</label><select v-if=\"field.type == &quot;select&quot;\" v-model=\"params[key]\" v-bind:required=\"field.required\" _v-092838b6=\"\"><option v-for=\"(val, label) of field.options\" value=\"{{val}}\" _v-092838b6=\"\">{{label}}</option></select><input v-else=\"v-else\" name=\"{{key}}\" type=\"{{field.type}}\" v-model=\"params[key]\" v-bind:required=\"field.required\" _v-092838b6=\"\"><p v-if=\"field.tip\" class=\"tip\" _v-092838b6=\"\">{{field.tip}}</p></fieldset><fieldset v-if=\"valid\" _v-092838b6=\"\"><label for=\"name\" _v-092838b6=\"\">Policy name</label><input name=\"name\" v-model=\"name\" placeholder=\"e.g.: Mail me when syslog is modified\" _v-092838b6=\"\"></fieldset><footer _v-092838b6=\"\"><button v-if=\"valid &amp;&amp; name\" @click=\"submit\" class=\"ok\" _v-092838b6=\"\">Add policy <i _v-092838b6=\"\">{{name}}</i></button></footer></form></article>"
if (module.hot) {(function () {  module.hot.accept()
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), true)
  if (!hotAPI.compatible) return
  module.hot.dispose(function () {
    __vueify_insert__.cache["input[_v-092838b6],\nselect[_v-092838b6] {\n  box-sizing: border-box;\n  width: 100%;\n}\ninput[type=checkbox][_v-092838b6],\nselect[type=checkbox][_v-092838b6] {\n  width: auto;\n  margin-top: 15px;\n}\nfieldset.git[_v-092838b6] {\n  position: relative;\n}\nfieldset.git[_v-092838b6]:after {\n  display: block;\n  position: absolute;\n  top: 28px;\n  right: 10px;\n  padding: 3px 5px 1px 5px;\n  border-radius: 100%;\n  color: #fff;\n  font-size: 0.8em;\n  opacity: 0.7;\n}\nfieldset.git[data-valid][_v-092838b6]:after {\n  content: '✔';\n  background: #5aa02c;\n}\nfieldset.git[_v-092838b6]:not([data-valid]):after {\n  content: '✖';\n  background: #d40000;\n}\n"] = false
    document.head.removeChild(__vueify_style__)
  })
  if (!module.hot.data) {
    hotAPI.createRecord("_v-092838b6", module.exports)
  } else {
    hotAPI.update("_v-092838b6", module.exports, (typeof module.exports === "function" ? module.exports.options : module.exports).template)
  }
})()}
},{"vue":13,"vue-focus":10,"vue-hot-reload-api":11,"vueify/lib/insert-css":14}],21:[function(require,module,exports){
var __vueify_insert__ = require("vueify/lib/insert-css")
var __vueify_style__ = __vueify_insert__.insert("\n")
"use strict";
if (module.exports.__esModule) module.exports = module.exports.default
;(typeof module.exports === "function"? module.exports.options: module.exports).template = "\nrouter-view\n"
if (module.hot) {(function () {  module.hot.accept()
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), true)
  if (!hotAPI.compatible) return
  module.hot.dispose(function () {
    __vueify_insert__.cache["\n"] = false
    document.head.removeChild(__vueify_style__)
  })
  if (!module.hot.data) {
    hotAPI.createRecord("_v-342826af", module.exports)
  } else {
    hotAPI.update("_v-342826af", module.exports, (typeof module.exports === "function" ? module.exports.options : module.exports).template)
  }
})()}
},{"vue":13,"vue-hot-reload-api":11,"vueify/lib/insert-css":14}],22:[function(require,module,exports){
var __vueify_insert__ = require("vueify/lib/insert-css")
var __vueify_style__ = __vueify_insert__.insert("section.unlock[_v-5f649bd2] {\n  background: -webkit-linear-gradient(45deg, #34495e 0%, #44586d 100%);\n  background: linear-gradient(45deg, #34495e 0%, #44586d 100%);\n  -webkit-animation: fade-in 1s;\n          animation: fade-in 1s;\n}\nsection.unlock .logo[_v-5f649bd2] {\n  text-align: center;\n  padding: 30px 0;\n}\nsection.unlock article[_v-5f649bd2] {\n  background: #fff;\n  color: #777;\n  position: absolute;\n  margin: 0 auto;\n  border-radius: 2px;\n  box-shadow: 0 10px 20px rgba(0,0,0,0.2);\n  overflow: hidden;\n}\nsection.unlock article.form[_v-5f649bd2] {\n  min-width: 440px;\n  max-width: 65vw;\n  top: 150px;\n  right: 50px;\n  left: 50px;\n}\nsection.unlock article.form header[_v-5f649bd2] {\n  padding: 21px 30px 20px 30px;\n  background: #f6f6f6;\n}\nsection.unlock article.form header h1[_v-5f649bd2] {\n  margin: 0;\n  font-size: 1.2em;\n  color: #777;\n  font-weight: regular;\n}\nsection.unlock article.form form[_v-5f649bd2] {\n  padding: 30px 30px 10px 30px;\n  max-height: calc(100vh - 250px);\n  overflow: auto;\n}\nsection.unlock article.form form fieldset[_v-5f649bd2] {\n  position: relative;\n  padding: 5px 0;\n  border: none;\n}\nsection.unlock article.form form fieldset *[_v-5f649bd2] {\n  box-sizing: border-box;\n}\nsection.unlock article.form form fieldset label[_v-5f649bd2] {\n  display: block;\n  width: 100%;\n  margin-bottom: 5px;\n  color: #666;\n  font-weight: bold;\n  font-size: 0.8em;\n  text-transform: uppercase;\n}\nsection.unlock article.form form fieldset input[_v-5f649bd2] {\n  padding: 10px;\n  width: 100%;\n  border: none;\n  border-bottom: 1px solid #ddd;\n}\nsection.unlock article.form form fieldset input[_v-5f649bd2]:focus {\n  border-color: #999;\n}\nsection.unlock article.form form fieldset[_v-5f649bd2]:last-of-type {\n  padding-bottom: 30px;\n}\nsection.unlock article.form form p[_v-5f649bd2] {\n  margin: 0 0 20px 0;\n  font-weight: 300;\n  color: #666;\n}\nsection.unlock article.form form p.error[_v-5f649bd2] {\n  position: block;\n  color: #f00;\n}\nsection.unlock article.form form p.error[_v-5f649bd2]:before {\n  content: 'ERROR:';\n  margin-right: 10px;\n  font-size: 0.7em;\n  font-weight: bold;\n}\nsection.unlock article.form footer[_v-5f649bd2] {\n  display: block;\n  padding-bottom: 30px;\n}\nsection.unlock article.form footer button[_v-5f649bd2] {\n  display: block;\n  min-height: 50px;\n  min-width: 200px;\n  margin: 0 auto;\n  opacity: 1;\n  border: none;\n  border-radius: 30px;\n  background: #f37e84;\n  color: #fff;\n  text-transform: uppercase;\n  font-weight: bold;\n  font-size: 0.8em;\n}\nsection.unlock article.form footer button[_v-5f649bd2]:hover {\n  background: #fff;\n  color: #f37e84;\n  box-shadow: 0 0 5px #f37e84;\n}\nsection.unlock article.form footer div.half button[_v-5f649bd2] {\n  display: inline;\n  width: 45%;\n  border-radius: 30px 0 0 30px;\n}\nsection.unlock article.form footer div.half button[_v-5f649bd2]:not(:first-child) {\n  border-radius: 0 30px 30px 0;\n}\n")
var app;

app = document.app;

module.exports = {
  mixins: [(require('vue-focus')).mixin],
  data: function() {
    return $.extend(app.data(), {
      pass: null,
      error: null
    });
  },
  methods: {
    submit: function(e) {
      if (app.privateKey.decrypt(this.pass)) {
        app.router.go('/dashboard');
        return setTimeout(document.vault.retrieveEvents, 1000);
      } else {
        return this.error = 'Wrong passphrase';
      }
    }
  }
};

if (module.exports.__esModule) module.exports = module.exports.default
;(typeof module.exports === "function"? module.exports.options: module.exports).template = "<section transition=\"fade\" class=\"unlock\" _v-5f649bd2=\"\"><h1 class=\"logo\" _v-5f649bd2=\"\"><img src=\"/img/logo_dark.svg\" _v-5f649bd2=\"\"></h1><article class=\"form\" _v-5f649bd2=\"\"><header _v-5f649bd2=\"\"><h1 _v-5f649bd2=\"\">Unlock your keypar</h1></header><form @keyup.enter=\"submit\" _v-5f649bd2=\"\"><p _v-5f649bd2=\"\">All data collected by {{appName}} is encrypted with a keypar whose passphrase is only known by you.</p><p _v-5f649bd2=\"\">In order to decrypt such data, please introduce your passphrase .</p><p v-if=\"error\" class=\"error\" _v-5f649bd2=\"\">{{error}}</p><fieldset class=\"pass\" _v-5f649bd2=\"\"><label for=\"pass\" _v-5f649bd2=\"\">Passphrase</label><input name=\"pass\" type=\"password\" v-model=\"pass\" v-focus-auto=\"v-focus-auto\" _v-5f649bd2=\"\"></fieldset></form><footer _v-5f649bd2=\"\"><button v-show=\"pass\" @click=\"submit\" class=\"next\" _v-5f649bd2=\"\">Unlock</button></footer></article></section>"
if (module.hot) {(function () {  module.hot.accept()
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), true)
  if (!hotAPI.compatible) return
  module.hot.dispose(function () {
    __vueify_insert__.cache["section.unlock[_v-5f649bd2] {\n  background: -webkit-linear-gradient(45deg, #34495e 0%, #44586d 100%);\n  background: linear-gradient(45deg, #34495e 0%, #44586d 100%);\n  -webkit-animation: fade-in 1s;\n          animation: fade-in 1s;\n}\nsection.unlock .logo[_v-5f649bd2] {\n  text-align: center;\n  padding: 30px 0;\n}\nsection.unlock article[_v-5f649bd2] {\n  background: #fff;\n  color: #777;\n  position: absolute;\n  margin: 0 auto;\n  border-radius: 2px;\n  box-shadow: 0 10px 20px rgba(0,0,0,0.2);\n  overflow: hidden;\n}\nsection.unlock article.form[_v-5f649bd2] {\n  min-width: 440px;\n  max-width: 65vw;\n  top: 150px;\n  right: 50px;\n  left: 50px;\n}\nsection.unlock article.form header[_v-5f649bd2] {\n  padding: 21px 30px 20px 30px;\n  background: #f6f6f6;\n}\nsection.unlock article.form header h1[_v-5f649bd2] {\n  margin: 0;\n  font-size: 1.2em;\n  color: #777;\n  font-weight: regular;\n}\nsection.unlock article.form form[_v-5f649bd2] {\n  padding: 30px 30px 10px 30px;\n  max-height: calc(100vh - 250px);\n  overflow: auto;\n}\nsection.unlock article.form form fieldset[_v-5f649bd2] {\n  position: relative;\n  padding: 5px 0;\n  border: none;\n}\nsection.unlock article.form form fieldset *[_v-5f649bd2] {\n  box-sizing: border-box;\n}\nsection.unlock article.form form fieldset label[_v-5f649bd2] {\n  display: block;\n  width: 100%;\n  margin-bottom: 5px;\n  color: #666;\n  font-weight: bold;\n  font-size: 0.8em;\n  text-transform: uppercase;\n}\nsection.unlock article.form form fieldset input[_v-5f649bd2] {\n  padding: 10px;\n  width: 100%;\n  border: none;\n  border-bottom: 1px solid #ddd;\n}\nsection.unlock article.form form fieldset input[_v-5f649bd2]:focus {\n  border-color: #999;\n}\nsection.unlock article.form form fieldset[_v-5f649bd2]:last-of-type {\n  padding-bottom: 30px;\n}\nsection.unlock article.form form p[_v-5f649bd2] {\n  margin: 0 0 20px 0;\n  font-weight: 300;\n  color: #666;\n}\nsection.unlock article.form form p.error[_v-5f649bd2] {\n  position: block;\n  color: #f00;\n}\nsection.unlock article.form form p.error[_v-5f649bd2]:before {\n  content: 'ERROR:';\n  margin-right: 10px;\n  font-size: 0.7em;\n  font-weight: bold;\n}\nsection.unlock article.form footer[_v-5f649bd2] {\n  display: block;\n  padding-bottom: 30px;\n}\nsection.unlock article.form footer button[_v-5f649bd2] {\n  display: block;\n  min-height: 50px;\n  min-width: 200px;\n  margin: 0 auto;\n  opacity: 1;\n  border: none;\n  border-radius: 30px;\n  background: #f37e84;\n  color: #fff;\n  text-transform: uppercase;\n  font-weight: bold;\n  font-size: 0.8em;\n}\nsection.unlock article.form footer button[_v-5f649bd2]:hover {\n  background: #fff;\n  color: #f37e84;\n  box-shadow: 0 0 5px #f37e84;\n}\nsection.unlock article.form footer div.half button[_v-5f649bd2] {\n  display: inline;\n  width: 45%;\n  border-radius: 30px 0 0 30px;\n}\nsection.unlock article.form footer div.half button[_v-5f649bd2]:not(:first-child) {\n  border-radius: 0 30px 30px 0;\n}\n"] = false
    document.head.removeChild(__vueify_style__)
  })
  if (!module.hot.data) {
    hotAPI.createRecord("_v-5f649bd2", module.exports)
  } else {
    hotAPI.update("_v-5f649bd2", module.exports, (typeof module.exports === "function" ? module.exports.options : module.exports).template)
  }
})()}
},{"vue":13,"vue-focus":10,"vue-hot-reload-api":11,"vueify/lib/insert-css":14}],23:[function(require,module,exports){
var __vueify_insert__ = require("vueify/lib/insert-css")
var __vueify_style__ = __vueify_insert__.insert("figure[_v-9b38a4ce] {\n  margin-top: calc(50vh - 130px);\n  text-align: center;\n}\nfigure img[_v-9b38a4ce] {\n  height: 100px;\n}\nfigure label[_v-9b38a4ce] {\n  color: #fff;\n}\n.textBody[_v-9b38a4ce] {\n  padding: 0 50px;\n  text-align: center;\n  color: #fff;\n}\n.textBody .button[_v-9b38a4ce] {\n  display: inline-block;\n  margin-top: 30px;\n}\n")
var app;

app = document.app;

module.exports = {
  data: app.data,
  methods: {
    run: function() {
      return setTimeout(document.vault.retrieveEvents, 1000);
    }
  }
};

if (module.exports.__esModule) module.exports = module.exports.default
;(typeof module.exports === "function"? module.exports.options: module.exports).template = "<div transition=\"slide\" class=\"welcome\" _v-9b38a4ce=\"\"><figure _v-9b38a4ce=\"\"><img src=\"/img/rocket.svg\" _v-9b38a4ce=\"\"><label _v-9b38a4ce=\"\"><h1 _v-9b38a4ce=\"\">Congratulations!</h1></label></figure><div class=\"textBody\" _v-9b38a4ce=\"\"><p _v-9b38a4ce=\"\">{{appName}} is now completely set up.</p><p _v-9b38a4ce=\"\">You can go now to your dashboard and choose which files to monitor and what policies to apply.</p><a v-link=\"{ path: '/dashboard' }\" class=\"button\" _v-9b38a4ce=\"\">Go to my dashboard</a></div></div>"
if (module.hot) {(function () {  module.hot.accept()
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), true)
  if (!hotAPI.compatible) return
  module.hot.dispose(function () {
    __vueify_insert__.cache["figure[_v-9b38a4ce] {\n  margin-top: calc(50vh - 130px);\n  text-align: center;\n}\nfigure img[_v-9b38a4ce] {\n  height: 100px;\n}\nfigure label[_v-9b38a4ce] {\n  color: #fff;\n}\n.textBody[_v-9b38a4ce] {\n  padding: 0 50px;\n  text-align: center;\n  color: #fff;\n}\n.textBody .button[_v-9b38a4ce] {\n  display: inline-block;\n  margin-top: 30px;\n}\n"] = false
    document.head.removeChild(__vueify_style__)
  })
  if (!module.hot.data) {
    hotAPI.createRecord("_v-9b38a4ce", module.exports)
  } else {
    hotAPI.update("_v-9b38a4ce", module.exports, (typeof module.exports === "function" ? module.exports.options : module.exports).template)
  }
})()}
},{"vue":13,"vue-hot-reload-api":11,"vueify/lib/insert-css":14}],24:[function(require,module,exports){
var __vueify_insert__ = require("vueify/lib/insert-css")
var __vueify_style__ = __vueify_insert__.insert("div.or[_v-ab066a8c] {\n  text-align: center;\n}\ndiv.or button[_v-ab066a8c]:first-child {\n  padding-right: 30px;\n}\ndiv.or button[_v-ab066a8c]:last-child {\n  position: relative;\n  padding-left: 30px;\n}\ndiv.or button[_v-ab066a8c]:last-child:after {\n  content: 'or';\n  display: block;\n  position: absolute;\n  left: -21px;\n  top: 6px;\n  background: #f7f7f7;\n  border: 1px solid #ddd;\n  border-radius: 50%;\n  padding: 12px 11px 11px 11px;\n  text-transform: uppercase;\n  font-size: 0.8em;\n  color: #808080;\n}\n")
var app;

app = document.app;

module.exports = {
  data: function() {
    return $.extend(app.data(), {
      settings: app.settings
    });
  },
  methods: {
    next: function() {
      return app.router.go('/wizard/preImport');
    },
    copy: function(e) {
      e.preventDefault();
      app.copy(this.settings.keys.pub);
      return this.next();
    },
    "export": function(e) {
      e.preventDefault();
      return electron.dialog.showSaveDialog({
        title: 'Exporting client public key',
        defaultPath: "./" + (this.appName.toLowerCase()) + "_client.pub.asc",
        buttonLabel: 'Export'
      }, (function(_this) {
        return function(path) {
          if (path) {
            fs.writeFileSync(path, _this.settings.keys.pub);
            _this.$parent.exported = path.split('/').pop();
            return _this.next();
          }
        };
      })(this));
    }
  }
};

if (module.exports.__esModule) module.exports = module.exports.default
;(typeof module.exports === "function"? module.exports.options: module.exports).template = "<article transition=\"slide\" class=\"form\" _v-ab066a8c=\"\"><header _v-ab066a8c=\"\"><h1 _v-ab066a8c=\"\">Public key export</h1></header><form _v-ab066a8c=\"\"><p _v-ab066a8c=\"\">It is very important to export the public key now so that you can later import it in every server you want to monitor.</p></form><footer _v-ab066a8c=\"\"><button @click=\"export\" class=\"or\" _v-ab066a8c=\"\">Export to filesystem</button></footer></article>"
if (module.hot) {(function () {  module.hot.accept()
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), true)
  if (!hotAPI.compatible) return
  module.hot.dispose(function () {
    __vueify_insert__.cache["div.or[_v-ab066a8c] {\n  text-align: center;\n}\ndiv.or button[_v-ab066a8c]:first-child {\n  padding-right: 30px;\n}\ndiv.or button[_v-ab066a8c]:last-child {\n  position: relative;\n  padding-left: 30px;\n}\ndiv.or button[_v-ab066a8c]:last-child:after {\n  content: 'or';\n  display: block;\n  position: absolute;\n  left: -21px;\n  top: 6px;\n  background: #f7f7f7;\n  border: 1px solid #ddd;\n  border-radius: 50%;\n  padding: 12px 11px 11px 11px;\n  text-transform: uppercase;\n  font-size: 0.8em;\n  color: #808080;\n}\n"] = false
    document.head.removeChild(__vueify_style__)
  })
  if (!module.hot.data) {
    hotAPI.createRecord("_v-ab066a8c", module.exports)
  } else {
    hotAPI.update("_v-ab066a8c", module.exports, (typeof module.exports === "function" ? module.exports.options : module.exports).template)
  }
})()}
},{"vue":13,"vue-hot-reload-api":11,"vueify/lib/insert-css":14}],25:[function(require,module,exports){
var __vueify_insert__ = require("vueify/lib/insert-css")
var __vueify_style__ = __vueify_insert__.insert("article.generating[_v-5225bf0a] {\n  width: 300px;\n  height: 300px;\n  top: 50vh;\n  left: 50vw;\n  margin: -150px;\n}\narticle.generating p[_v-5225bf0a] {\n  margin: 0;\n  text-align: center;\n}\narticle input[name=pass][_v-5225bf0a] {\n  width: calc(100% - 170px);\n}\narticle button.unhide[_v-5225bf0a] {\n  float: right;\n  position: absolute;\n  top: 35px;\n  right: 10px;\n  opacity: 0.5;\n}\narticle button.unhide.show[_v-5225bf0a] {\n  opacity: 1;\n}\n")
var app;

app = document.app;

module.exports = {
  data: function() {
    return $.extend(app.data(), {
      generating: false,
      pass: null,
      show: false,
      error: false
    });
  },
  methods: {
    run: function() {
      if (app.settings.keys) {
        return this.next();
      }
    },
    submit: function(e) {
      e.preventDefault();
      if (this.pass) {
        this.generating = true;
        return this.genKeys();
      } else {
        return this.error = 'Please make sure you set a passphrase';
      }
    },
    genKeys: function() {
      return app.pgp.generateKey({
        userIds: [this.identikit()],
        numBits: 4096,
        passphrase: this.pass
      }).then((function(_this) {
        return function(keys) {
          app.settings.keys = {
            priv: keys.privateKeyArmored,
            pub: keys.publicKeyArmored,
            fingerprint: keys.key.primaryKey.fingerprint
          };
          document.vault.updateFingerprint(app.settings.keys.fingerprint);
          app.privateKey = keys.key;
          app.privateKey.decrypt(_this.pass);
          app.save();
          return _this.next();
        };
      })(this));
    },
    identikit: function() {
      var e, error, host, user;
      try {
        user = os.userInfo().username;
        host = os.hostname();
      } catch (error) {
        e = error;
        user = 'webuser';
        host = (navigator.appCodeName + "." + navigator.appName).toLowerCase();
      }
      console.log(user + "@" + host + ".local");
      return {
        name: user,
        email: user + "@" + host + ".local"
      };
    },
    unhide: function(e) {
      e.preventDefault();
      return this.show = !this.show;
    },
    next: function() {
      this.generating = false;
      console.log(app.settings.keys);
      return app.router.replace('/wizard/export');
    }
  }
};

if (module.exports.__esModule) module.exports = module.exports.default
;(typeof module.exports === "function"? module.exports.options: module.exports).template = "<article v-if=\"generating\" transition=\"pop\" class=\"generating\" _v-5225bf0a=\"\"><div class=\"loader\" _v-5225bf0a=\"\">Loading...</div><p _v-5225bf0a=\"\"><strong _v-5225bf0a=\"\">Generating keypair...</strong></p><p _v-5225bf0a=\"\"><small _v-5225bf0a=\"\">(It may take up to 1 minute)</small></p></article><article v-else=\"v-else\" transition=\"slide\" class=\"form\" _v-5225bf0a=\"\"><header _v-5225bf0a=\"\"><h1 _v-5225bf0a=\"\">PGP keypar generation</h1></header><form @keyup.enter=\"submit\" _v-5225bf0a=\"\"><p _v-5225bf0a=\"\">Please choose a safe password or passphrase for protecting your keys:</p><p v-if=\"error\" class=\"error\" _v-5225bf0a=\"\">{{error}}</p><fieldset class=\"pass\" _v-5225bf0a=\"\"><label for=\"pass\" _v-5225bf0a=\"\">Passphrase</label><input v-if=\"show\" type=\"text\" v-model=\"pass\" _v-5225bf0a=\"\"><input v-else=\"v-else\" name=\"pass\" type=\"password\" v-model=\"pass\" _v-5225bf0a=\"\"><button @click=\"unhide\" v-bind:class=\"{'show': show}\" class=\"plain unhide\" _v-5225bf0a=\"\"><img src=\"/img/eye.svg\" _v-5225bf0a=\"\"></button></fieldset></form><footer _v-5225bf0a=\"\"><button v-show=\"pass\" @click=\"submit\" class=\"next\" _v-5225bf0a=\"\">Next</button></footer></article>"
if (module.hot) {(function () {  module.hot.accept()
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), true)
  if (!hotAPI.compatible) return
  module.hot.dispose(function () {
    __vueify_insert__.cache["article.generating[_v-5225bf0a] {\n  width: 300px;\n  height: 300px;\n  top: 50vh;\n  left: 50vw;\n  margin: -150px;\n}\narticle.generating p[_v-5225bf0a] {\n  margin: 0;\n  text-align: center;\n}\narticle input[name=pass][_v-5225bf0a] {\n  width: calc(100% - 170px);\n}\narticle button.unhide[_v-5225bf0a] {\n  float: right;\n  position: absolute;\n  top: 35px;\n  right: 10px;\n  opacity: 0.5;\n}\narticle button.unhide.show[_v-5225bf0a] {\n  opacity: 1;\n}\n"] = false
    document.head.removeChild(__vueify_style__)
  })
  if (!module.hot.data) {
    hotAPI.createRecord("_v-5225bf0a", module.exports)
  } else {
    hotAPI.update("_v-5225bf0a", module.exports, (typeof module.exports === "function" ? module.exports.options : module.exports).template)
  }
})()}
},{"vue":13,"vue-hot-reload-api":11,"vueify/lib/insert-css":14}],26:[function(require,module,exports){
var __vueify_insert__ = require("vueify/lib/insert-css")
var __vueify_style__ = __vueify_insert__.insert("div.or[_v-1cb1ca2b] {\n  text-align: center;\n}\ndiv.or button[_v-1cb1ca2b]:first-child {\n  padding-right: 30px;\n}\ndiv.or button[_v-1cb1ca2b]:last-child {\n  position: relative;\n  padding-left: 30px;\n}\ndiv.or button[_v-1cb1ca2b]:last-child:after {\n  content: 'or';\n  display: block;\n  position: absolute;\n  left: -21px;\n  top: 6px;\n  background: #f7f7f7;\n  border: 1px solid #ddd;\n  border-radius: 50%;\n  padding: 12px 11px 11px 11px;\n  text-transform: uppercase;\n  font-size: 0.8em;\n  color: #808080;\n}\n")
var app;

app = document.app;

module.exports = {
  data: function() {
    return $.extend(app.data(), {
      error: false,
      settings: app.settings
    });
  },
  methods: {
    next: function() {
      return app.router.go('/wizard/congrats');
    },
    back: function() {
      return app.router.go('/wizard/preImport');
    },
    newWatcher: function(key) {
      var err, error, fingerprint, keys, name, settings, watcher;
      try {
        keys = app.pgp.key.readArmored(key).keys;
        console.log(JSON.stringify(keys));
        name = keys[0].users[0].userId.userid.split('@')[1].slice(0, -1);
        fingerprint = keys[0].primaryKey.fingerprint;
        settings = {
          creator: this.settings.keys.fingerprint,
          reader: fingerprint,
          files: {}
        };
        watcher = {
          key: key,
          name: name,
          fingerprint: fingerprint,
          settings: settings
        };
        return document.vault.store('settings', settings, (function(_this) {
          return function(id) {
            watcher.settings.id = id;
            _this.settings.watchers.push(watcher);
            _this.settings.ready = true;
            app.save();
            return _this.next();
          };
        })(this));
      } catch (error) {
        err = error;
        return console.error("[CRYPTO] " + err);
      }
    },
    paste: function(e) {
      e.preventDefault();
      return app.paste((function(_this) {
        return function(key) {
          return _this.newWatcher(key);
        };
      })(this));
    },
    "import": function(e) {
      var err, error;
      e.preventDefault();
      try {
        return electron.dialog.showOpenDialog({
          title: 'Importing watcher public key',
          defaultPath: "./" + (this.appName.toLowerCase()) + "_watcher.pub.asc",
          buttonLabel: 'Import',
          filters: [
            {
              name: 'PGP keys',
              extensions: ['pub', 'key', 'pgp', 'gpg', 'asc']
            }, {
              name: 'All files',
              extensions: ['*']
            }
          ]
        }, (function(_this) {
          return function(path) {
            var key;
            if (path) {
              key = fs.readFileSync(path[0], 'utf8');
              return _this.newWatcher(key);
            }
          };
        })(this));
      } catch (error) {
        err = error;
        return console.error('This is not Electron');
      }
    },
    validate: function(e) {
      var channel, pgpWordList;
      e.preventDefault();
      pgpWordList = require('pgp-word-list-converter');
      channel = pgpWordList.toHex(this.sentence).join('').toLowerCase();
      return document.vault.find('exchange', {
        channel: channel
      }, (function(_this) {
        return function(exchange) {
          if (exchange) {
            exchange.client = _this.settings.keys.pub;
            return document.vault.replace('exchange', exchange, function() {
              return document.vault.watch('exchange', exchange, function(change) {
                if (!change) {
                  return _this.newWatcher(exchange.watcher);
                }
              });
            });
          } else {
            return _this.error = "Wrong words please verify that you are typing the words from the Trailbot Watcher ...";
          }
        };
      })(this));
    }
  }
};

if (module.exports.__esModule) module.exports = module.exports.default
;(typeof module.exports === "function"? module.exports.options: module.exports).template = "<article transition=\"slide\" class=\"form\" _v-1cb1ca2b=\"\"><header _v-1cb1ca2b=\"\"><button @click=\"back\" class=\"plain back\" _v-1cb1ca2b=\"\">&lt; BACK</button><h1 _v-1cb1ca2b=\"\">Watcher public key import</h1></header><form _v-1cb1ca2b=\"\"><p _v-1cb1ca2b=\"\">In order to verify the authenticity of the information coming from your servers, this desktop app needs to ??? your server's {{appName}} watcher ???.</p><p v-if=\"error\" class=\"error\" _v-1cb1ca2b=\"\">{{error}}</p><fieldset _v-1cb1ca2b=\"\"><label for=\"sentence\" _v-1cb1ca2b=\"\">Sentence</label><input type=\"text\" name=\"sentence\" v-model=\"sentence\" _v-1cb1ca2b=\"\"></fieldset></form><footer _v-1cb1ca2b=\"\"><button @click=\"validate\" class=\"or\" _v-1cb1ca2b=\"\">Validate sentence</button></footer></article>"
if (module.hot) {(function () {  module.hot.accept()
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), true)
  if (!hotAPI.compatible) return
  module.hot.dispose(function () {
    __vueify_insert__.cache["div.or[_v-1cb1ca2b] {\n  text-align: center;\n}\ndiv.or button[_v-1cb1ca2b]:first-child {\n  padding-right: 30px;\n}\ndiv.or button[_v-1cb1ca2b]:last-child {\n  position: relative;\n  padding-left: 30px;\n}\ndiv.or button[_v-1cb1ca2b]:last-child:after {\n  content: 'or';\n  display: block;\n  position: absolute;\n  left: -21px;\n  top: 6px;\n  background: #f7f7f7;\n  border: 1px solid #ddd;\n  border-radius: 50%;\n  padding: 12px 11px 11px 11px;\n  text-transform: uppercase;\n  font-size: 0.8em;\n  color: #808080;\n}\n"] = false
    document.head.removeChild(__vueify_style__)
  })
  if (!module.hot.data) {
    hotAPI.createRecord("_v-1cb1ca2b", module.exports)
  } else {
    hotAPI.update("_v-1cb1ca2b", module.exports, (typeof module.exports === "function" ? module.exports.options : module.exports).template)
  }
})()}
},{"pgp-word-list-converter":7,"vue":13,"vue-hot-reload-api":11,"vueify/lib/insert-css":14}],27:[function(require,module,exports){
var __vueify_insert__ = require("vueify/lib/insert-css")
var __vueify_style__ = __vueify_insert__.insert("section.wizard {\n  background: -webkit-linear-gradient(45deg, #34495e 0%, #44586d 100%);\n  background: linear-gradient(45deg, #34495e 0%, #44586d 100%);\n  -webkit-animation: fade-in 1s;\n          animation: fade-in 1s;\n}\nsection.wizard article {\n  background: #fff;\n  color: #777;\n  position: absolute;\n  margin: 0 auto;\n  border-radius: 2px;\n  box-shadow: 0 10px 20px rgba(0,0,0,0.2);\n  overflow: hidden;\n}\nsection.wizard article.form {\n  min-width: 440px;\n  max-width: 65vw;\n  top: 50px;\n  right: 50px;\n  left: 50px;\n}\nsection.wizard article.form header {\n  padding: 21px 30px 20px 30px;\n  background: #f6f6f6;\n}\nsection.wizard article.form header h1 {\n  margin: 0;\n  font-size: 1.2em;\n  color: #777;\n  font-weight: regular;\n}\nsection.wizard article.form header button.back {\n  float: right;\n  width: auto;\n  margin-top: -5px;\n  margin-right: -10px;\n  padding: 10px 15px;\n  width: auto;\n  background: #eee;\n  color: #aaa;\n  font-size: 0.7em;\n}\nsection.wizard article.form header button.back:hover {\n  background: #44586d;\n  color: #fff;\n}\nsection.wizard article.form form {\n  padding: 30px 30px 10px 30px;\n  max-height: calc(100vh - 250px);\n  overflow: auto;\n}\nsection.wizard article.form form fieldset {\n  position: relative;\n  padding: 5px 0;\n  border: none;\n}\nsection.wizard article.form form fieldset * {\n  box-sizing: border-box;\n}\nsection.wizard article.form form fieldset label {\n  display: block;\n  width: 100%;\n  margin-bottom: 5px;\n  color: #666;\n  font-weight: bold;\n  font-size: 0.8em;\n  text-transform: uppercase;\n}\nsection.wizard article.form form fieldset input {\n  padding: 10px;\n  width: 100%;\n  border: none;\n  border-bottom: 1px solid #ddd;\n}\nsection.wizard article.form form fieldset input:focus {\n  border-color: #999;\n}\nsection.wizard article.form form fieldset:last-of-type {\n  padding-bottom: 30px;\n}\nsection.wizard article.form form p {\n  margin: 0 0 20px 0;\n  font-weight: 300;\n  color: #666;\n}\nsection.wizard article.form form p.error {\n  position: block;\n  color: #f00;\n}\nsection.wizard article.form form p.error:before {\n  content: 'ERROR:';\n  margin-right: 10px;\n  font-size: 0.7em;\n  font-weight: bold;\n}\nsection.wizard article.form footer {\n  display: block;\n  padding-bottom: 30px;\n}\nsection.wizard article.form footer button {\n  display: block;\n  min-height: 50px;\n  min-width: 200px;\n  margin: 0 auto;\n  opacity: 1;\n  border: none;\n  border-radius: 30px;\n  background: #f37e84;\n  color: #fff;\n  text-transform: uppercase;\n  font-weight: 700;\n  font-size: 0.8em;\n}\nsection.wizard article.form footer button:hover {\n  background: #fff;\n  color: #f37e84;\n  box-shadow: 0 0 5px #f37e84;\n}\nsection.wizard article.form footer div.half button {\n  display: inline;\n  width: 45%;\n  border-radius: 30px 0 0 30px;\n}\nsection.wizard article.form footer div.half button:not(:first-child) {\n  border-radius: 0 30px 30px 0;\n}\n")
module.exports = {
  data: function() {
    return $.extend(document.app.data(), {
      exported: null
    });
  }
};

if (module.exports.__esModule) module.exports = module.exports.default
;(typeof module.exports === "function"? module.exports.options: module.exports).template = "<section class=\"wizard\"><router-view></router-view></section>"
if (module.hot) {(function () {  module.hot.accept()
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), true)
  if (!hotAPI.compatible) return
  module.hot.dispose(function () {
    __vueify_insert__.cache["section.wizard {\n  background: -webkit-linear-gradient(45deg, #34495e 0%, #44586d 100%);\n  background: linear-gradient(45deg, #34495e 0%, #44586d 100%);\n  -webkit-animation: fade-in 1s;\n          animation: fade-in 1s;\n}\nsection.wizard article {\n  background: #fff;\n  color: #777;\n  position: absolute;\n  margin: 0 auto;\n  border-radius: 2px;\n  box-shadow: 0 10px 20px rgba(0,0,0,0.2);\n  overflow: hidden;\n}\nsection.wizard article.form {\n  min-width: 440px;\n  max-width: 65vw;\n  top: 50px;\n  right: 50px;\n  left: 50px;\n}\nsection.wizard article.form header {\n  padding: 21px 30px 20px 30px;\n  background: #f6f6f6;\n}\nsection.wizard article.form header h1 {\n  margin: 0;\n  font-size: 1.2em;\n  color: #777;\n  font-weight: regular;\n}\nsection.wizard article.form header button.back {\n  float: right;\n  width: auto;\n  margin-top: -5px;\n  margin-right: -10px;\n  padding: 10px 15px;\n  width: auto;\n  background: #eee;\n  color: #aaa;\n  font-size: 0.7em;\n}\nsection.wizard article.form header button.back:hover {\n  background: #44586d;\n  color: #fff;\n}\nsection.wizard article.form form {\n  padding: 30px 30px 10px 30px;\n  max-height: calc(100vh - 250px);\n  overflow: auto;\n}\nsection.wizard article.form form fieldset {\n  position: relative;\n  padding: 5px 0;\n  border: none;\n}\nsection.wizard article.form form fieldset * {\n  box-sizing: border-box;\n}\nsection.wizard article.form form fieldset label {\n  display: block;\n  width: 100%;\n  margin-bottom: 5px;\n  color: #666;\n  font-weight: bold;\n  font-size: 0.8em;\n  text-transform: uppercase;\n}\nsection.wizard article.form form fieldset input {\n  padding: 10px;\n  width: 100%;\n  border: none;\n  border-bottom: 1px solid #ddd;\n}\nsection.wizard article.form form fieldset input:focus {\n  border-color: #999;\n}\nsection.wizard article.form form fieldset:last-of-type {\n  padding-bottom: 30px;\n}\nsection.wizard article.form form p {\n  margin: 0 0 20px 0;\n  font-weight: 300;\n  color: #666;\n}\nsection.wizard article.form form p.error {\n  position: block;\n  color: #f00;\n}\nsection.wizard article.form form p.error:before {\n  content: 'ERROR:';\n  margin-right: 10px;\n  font-size: 0.7em;\n  font-weight: bold;\n}\nsection.wizard article.form footer {\n  display: block;\n  padding-bottom: 30px;\n}\nsection.wizard article.form footer button {\n  display: block;\n  min-height: 50px;\n  min-width: 200px;\n  margin: 0 auto;\n  opacity: 1;\n  border: none;\n  border-radius: 30px;\n  background: #f37e84;\n  color: #fff;\n  text-transform: uppercase;\n  font-weight: 700;\n  font-size: 0.8em;\n}\nsection.wizard article.form footer button:hover {\n  background: #fff;\n  color: #f37e84;\n  box-shadow: 0 0 5px #f37e84;\n}\nsection.wizard article.form footer div.half button {\n  display: inline;\n  width: 45%;\n  border-radius: 30px 0 0 30px;\n}\nsection.wizard article.form footer div.half button:not(:first-child) {\n  border-radius: 0 30px 30px 0;\n}\n"] = false
    document.head.removeChild(__vueify_style__)
  })
  if (!module.hot.data) {
    hotAPI.createRecord("_v-522cf5bf", module.exports)
  } else {
    hotAPI.update("_v-522cf5bf", module.exports, (typeof module.exports === "function" ? module.exports.options : module.exports).template)
  }
})()}
},{"vue":13,"vue-hot-reload-api":11,"vueify/lib/insert-css":14}],28:[function(require,module,exports){
var __vueify_insert__ = require("vueify/lib/insert-css")
var __vueify_style__ = __vueify_insert__.insert("hr[_v-1b89ed92] {\n  border: none;\n  border-top: 1px solid #ddd;\n  padding-bottom: 15px;\n}\nfooter[_v-1b89ed92] {\n  text-align: center;\n}\nfooter a[_v-1b89ed92] {\n  display: block;\n  margin: 0 auto;\n  padding: 20px 0 0 0;\n  color: #666;\n  font-weight: bold;\n  font-decoration: none;\n}\nfooter a[_v-1b89ed92]:hover {\n  font-decoration: underline;\n}\n")
var app;

app = document.app;

module.exports = {
  data: app.data,
  methods: {
    back: function() {
      return app.router.go('/wizard/export');
    }
  }
};

if (module.exports.__esModule) module.exports = module.exports.default
;(typeof module.exports === "function"? module.exports.options: module.exports).template = "<article transition=\"slide\" class=\"form\" _v-1b89ed92=\"\"><header _v-1b89ed92=\"\"><button @click=\"back\" class=\"plain back\" _v-1b89ed92=\"\">&lt; BACK</button><h1 _v-1b89ed92=\"\">Watcher configuration</h1></header><form _v-1b89ed92=\"\"><p _v-1b89ed92=\"\">{{appName}} uses a special daemon called <strong _v-1b89ed92=\"\">Watcher</strong> to monitor your servers, send alerts and enforce smart policies.</p><hr _v-1b89ed92=\"\"><p _v-1b89ed92=\"\"><strong _v-1b89ed92=\"\">Have you already installed and set up {{appName}} Watcher in your server?</strong></p></form><footer _v-1b89ed92=\"\"><button v-link=\"{ path: '/wizard/watcherGuide' }\" _v-1b89ed92=\"\">Not yet, please show me how</button><a v-link=\"{ path: '/wizard/import' }\" _v-1b89ed92=\"\">Yes, I have</a></footer></article>"
if (module.hot) {(function () {  module.hot.accept()
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), true)
  if (!hotAPI.compatible) return
  module.hot.dispose(function () {
    __vueify_insert__.cache["hr[_v-1b89ed92] {\n  border: none;\n  border-top: 1px solid #ddd;\n  padding-bottom: 15px;\n}\nfooter[_v-1b89ed92] {\n  text-align: center;\n}\nfooter a[_v-1b89ed92] {\n  display: block;\n  margin: 0 auto;\n  padding: 20px 0 0 0;\n  color: #666;\n  font-weight: bold;\n  font-decoration: none;\n}\nfooter a[_v-1b89ed92]:hover {\n  font-decoration: underline;\n}\n"] = false
    document.head.removeChild(__vueify_style__)
  })
  if (!module.hot.data) {
    hotAPI.createRecord("_v-1b89ed92", module.exports)
  } else {
    hotAPI.update("_v-1b89ed92", module.exports, (typeof module.exports === "function" ? module.exports.options : module.exports).template)
  }
})()}
},{"vue":13,"vue-hot-reload-api":11,"vueify/lib/insert-css":14}],29:[function(require,module,exports){
var __vueify_insert__ = require("vueify/lib/insert-css")
var __vueify_style__ = __vueify_insert__.insert("article.form[_v-42e07d26] {\n  max-width: 90vw !important;\n  width: 840px;\n}\ndiv.or[_v-42e07d26] {\n  text-align: center;\n}\ndiv.or button[_v-42e07d26]:first-child {\n  padding-right: 30px;\n}\ndiv.or button[_v-42e07d26]:last-child {\n  position: relative;\n  padding-left: 30px;\n}\ndiv.or button[_v-42e07d26]:last-child:after {\n  content: 'or';\n  display: block;\n  position: absolute;\n  left: -21px;\n  top: 6px;\n  background: #f7f7f7;\n  border: 1px solid #ddd;\n  border-radius: 50%;\n  padding: 12px 11px 11px 11px;\n  text-transform: uppercase;\n  font-size: 0.8em;\n  color: #808080;\n}\nol[_v-42e07d26] {\n  padding-left: 30px;\n}\nol li[_v-42e07d26] {\n  margin-bottom: 15px;\n  padding-left: 10px;\n  line-height: 1.5em;\n}\nol li code[_v-42e07d26],\nol li pre[_v-42e07d26] {\n  margin-left: 2px;\n  margin-right: 2px;\n  padding: 5px;\n  border-radius: 2px;\n  background: #555;\n  color: #fff;\n  font-weight: bold;\n}\nol li pre[_v-42e07d26] {\n  position: relative;\n  top: -5px;\n}\n")
var app;

app = document.app;

module.exports = {
  data: function() {
    return $.extend(app.data(), {
      settings: app.settings,
      exported: this.$parent.exported
    });
  },
  methods: {
    next: function() {
      return app.router.go('/wizard/congrats');
    },
    back: function() {
      return app.router.go('/wizard/preImport');
    },
    newWatcher: function(key) {
      var err, error, fingerprint, keys, name, settings, watcher;
      try {
        keys = app.pgp.key.readArmored(key).keys;
        console.log(JSON.stringify(keys));
        name = keys[0].users[0].userId.userid.split('@')[1].slice(0, -1);
        fingerprint = keys[0].primaryKey.fingerprint;
        settings = {
          creator: this.settings.keys.fingerprint,
          reader: fingerprint,
          files: {}
        };
        watcher = {
          key: key,
          name: name,
          fingerprint: fingerprint,
          settings: settings
        };
        return document.vault.store('settings', settings, (function(_this) {
          return function(id) {
            watcher.settings.id = id;
            _this.settings.watchers.push(watcher);
            _this.settings.ready = true;
            app.save();
            return _this.next();
          };
        })(this));
      } catch (error) {
        err = error;
        return console.error("[CRYPTO] " + err);
      }
    },
    paste: function(e) {
      e.preventDefault();
      return app.paste((function(_this) {
        return function(key) {
          return _this.newWatcher(key);
        };
      })(this));
    },
    "import": function(e) {
      var err, error;
      e.preventDefault();
      try {
        return electron.dialog.showOpenDialog({
          title: 'Importing watcher public key',
          defaultPath: "./" + (this.appName.toLowerCase()) + "_watcher.pub.asc",
          buttonLabel: 'Import',
          filters: [
            {
              name: 'PGP keys',
              extensions: ['pub', 'key', 'pgp', 'gpg', 'asc']
            }, {
              name: 'All files',
              extensions: ['*']
            }
          ]
        }, (function(_this) {
          return function(path) {
            var key;
            if (path) {
              key = fs.readFileSync(path[0], 'utf8');
              return _this.newWatcher(key);
            }
          };
        })(this));
      } catch (error) {
        err = error;
        return console.error('This is not Electron');
      }
    }
  }
};

if (module.exports.__esModule) module.exports = module.exports.default
;(typeof module.exports === "function"? module.exports.options: module.exports).template = "<article transition=\"slide\" class=\"form\" _v-42e07d26=\"\"><header _v-42e07d26=\"\"><button @click=\"back\" class=\"plain back\" _v-42e07d26=\"\">&lt; BACK</button><h1 _v-42e07d26=\"\">Watcher setup</h1></header><form @keyup.enter=\"submit\" _v-42e07d26=\"\"><p _v-42e07d26=\"\">Setting up a watcher is pretty simple:</p><ol _v-42e07d26=\"\"><li _v-42e07d26=\"\">Log into your server and become <strong _v-42e07d26=\"\">root</strong> (using <code _v-42e07d26=\"\">sudo su</code>, <code _v-42e07d26=\"\">su</code> or similar).</li><li _v-42e07d26=\"\"><span _v-42e07d26=\"\">Install git and nodejs 6.x:</span><pre _v-42e07d26=\"\">curl -sL https://deb.nodesource.com/setup_6.x | bash -\napt-get install -y git nodejs || yum -y install git nodejs || pacman -S git nodejs npm</pre></li><li _v-42e07d26=\"\"><span _v-42e07d26=\"\">Clone the repository and install the nodejs dependencies:</span><pre _v-42e07d26=\"\">git clone https://github.com/trailbot/watcher\ncd watcher\nnpm install</pre></li><li v-if=\"exported\" _v-42e07d26=\"\">Copy the <code _v-42e07d26=\"\">{{exported}}</code> client public key file that you just exported from this wizard and copy it into your server using <code _v-42e07d26=\"\">scp</code>, <code _v-42e07d26=\"\">rsync</code>, <code _v-42e07d26=\"\">ftp</code> or similar.</li><li v-else=\"v-else\" _v-42e07d26=\"\">Take the <strong _v-42e07d26=\"\">client</strong> public key that you copied from the previous step in this wizard and paste it into a file in your server.</li><li _v-42e07d26=\"\">Run the setup script:\n<code _v-42e07d26=\"\">npm run setup</code></li><li _v-42e07d26=\"\">Finally, choose an option below to import the watcher key:</li></ol></form><footer _v-42e07d26=\"\"><div class=\"half or\" _v-42e07d26=\"\"><button @click=\"paste\" class=\"or\" _v-42e07d26=\"\">Take from clipboard</button><button @click=\"import\" class=\"or\" _v-42e07d26=\"\">Import from filesystem</button></div></footer></article>"
if (module.hot) {(function () {  module.hot.accept()
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), true)
  if (!hotAPI.compatible) return
  module.hot.dispose(function () {
    __vueify_insert__.cache["article.form[_v-42e07d26] {\n  max-width: 90vw !important;\n  width: 840px;\n}\ndiv.or[_v-42e07d26] {\n  text-align: center;\n}\ndiv.or button[_v-42e07d26]:first-child {\n  padding-right: 30px;\n}\ndiv.or button[_v-42e07d26]:last-child {\n  position: relative;\n  padding-left: 30px;\n}\ndiv.or button[_v-42e07d26]:last-child:after {\n  content: 'or';\n  display: block;\n  position: absolute;\n  left: -21px;\n  top: 6px;\n  background: #f7f7f7;\n  border: 1px solid #ddd;\n  border-radius: 50%;\n  padding: 12px 11px 11px 11px;\n  text-transform: uppercase;\n  font-size: 0.8em;\n  color: #808080;\n}\nol[_v-42e07d26] {\n  padding-left: 30px;\n}\nol li[_v-42e07d26] {\n  margin-bottom: 15px;\n  padding-left: 10px;\n  line-height: 1.5em;\n}\nol li code[_v-42e07d26],\nol li pre[_v-42e07d26] {\n  margin-left: 2px;\n  margin-right: 2px;\n  padding: 5px;\n  border-radius: 2px;\n  background: #555;\n  color: #fff;\n  font-weight: bold;\n}\nol li pre[_v-42e07d26] {\n  position: relative;\n  top: -5px;\n}\n"] = false
    document.head.removeChild(__vueify_style__)
  })
  if (!module.hot.data) {
    hotAPI.createRecord("_v-42e07d26", module.exports)
  } else {
    hotAPI.update("_v-42e07d26", module.exports, (typeof module.exports === "function" ? module.exports.options : module.exports).template)
  }
})()}
},{"vue":13,"vue-hot-reload-api":11,"vueify/lib/insert-css":14}],30:[function(require,module,exports){
var __vueify_insert__ = require("vueify/lib/insert-css")
var __vueify_style__ = __vueify_insert__.insert("figure[_v-245f9c4c] {\n  margin-top: calc(50vh - 130px);\n  text-align: center;\n}\nfigure img[_v-245f9c4c] {\n  height: 100px;\n}\nfigure label[_v-245f9c4c] {\n  color: #fff;\n}\n.textBody[_v-245f9c4c] {\n  padding: 0 50px;\n  text-align: center;\n  color: #fff;\n}\n.textBody .button[_v-245f9c4c] {\n  display: inline-block;\n  margin-top: 30px;\n}\n")
var app;

app = document.app;

module.exports = {
  data: app.data
};

if (module.exports.__esModule) module.exports = module.exports.default
;(typeof module.exports === "function"? module.exports.options: module.exports).template = "<div transition=\"slide\" class=\"welcome\" _v-245f9c4c=\"\"><figure _v-245f9c4c=\"\"><div id=\"img\" src=\"/img/icon.svg\" _v-245f9c4c=\"\"></div><label _v-245f9c4c=\"\"><h1 _v-245f9c4c=\"\">Welcome to {{appName}}!</h1></label></figure><div class=\"textBody\" _v-245f9c4c=\"\"><p _v-245f9c4c=\"\">This wizard will guide you through the process of setting up {{appName}}</p><a v-link=\"{ path: '/wizard/generate' }\" class=\"button\" _v-245f9c4c=\"\">Start setup</a></div></div>"
if (module.hot) {(function () {  module.hot.accept()
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), true)
  if (!hotAPI.compatible) return
  module.hot.dispose(function () {
    __vueify_insert__.cache["figure[_v-245f9c4c] {\n  margin-top: calc(50vh - 130px);\n  text-align: center;\n}\nfigure img[_v-245f9c4c] {\n  height: 100px;\n}\nfigure label[_v-245f9c4c] {\n  color: #fff;\n}\n.textBody[_v-245f9c4c] {\n  padding: 0 50px;\n  text-align: center;\n  color: #fff;\n}\n.textBody .button[_v-245f9c4c] {\n  display: inline-block;\n  margin-top: 30px;\n}\n"] = false
    document.head.removeChild(__vueify_style__)
  })
  if (!module.hot.data) {
    hotAPI.createRecord("_v-245f9c4c", module.exports)
  } else {
    hotAPI.update("_v-245f9c4c", module.exports, (typeof module.exports === "function" ? module.exports.options : module.exports).template)
  }
})()}
},{"vue":13,"vue-hot-reload-api":11,"vueify/lib/insert-css":14}]},{},[1]);

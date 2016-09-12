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
          name: 'dashboard',
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
      window.Intercom('boot', {
        app_id: 'pzfj55kn'
      });
      if (this.settings.keys != null) {
        this.privateKey = this.pgp.key.readArmored(document.app.settings.keys.priv).keys[0];
        this.user = this.privateKey.users[0].userId.userid.split(/[<>]/g)[1].split('.')[0];
        this.router.replace('/unlock');
        return this.intercomReport();
      } else {
        return this.router.replace('/wizard');
      }
    });
    this.save = function() {
      console.log('SAVING APP');
      localStorage.setItem('settings', JSON.stringify(this.settings));
      return this.intercomReport();
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
    this.fooEvent = {
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
    return this.intercomReport = function() {
      return window.Intercom('update', {
        email: this.user,
        watchers: this.settings.watchers.length,
        files: this.settings.watchers.reduce(function(acc, watcher) {
          return acc + (Object.keys(watcher.settings.files)).length;
        }, 0),
        policies: this.settings.watchers.reduce(function(acc, watcher) {
          return acc + (Object.keys(watcher.settings.files)).reduce(function(acc, path) {
            return acc + watcher.settings.files[path].policies.length;
          }, 0);
        }, 0),
        events: this.settings.watchers.reduce(function(acc, watcher) {
          return acc + (Object.keys(watcher.settings.files)).reduce(function(acc, path) {
            var _ref, _ref1;
            return acc + ((_ref = watcher.events) != null ? (_ref1 = _ref[path]) != null ? _ref1.length : void 0 : void 0) || 0;
          }, 0);
        }, 0)
      });
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

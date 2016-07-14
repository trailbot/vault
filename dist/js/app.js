(function() {
  var App, Main, Vue, VueRouter, main;

  Vue = require('vue');

  VueRouter = require('vue-router');

  Vue.use(VueRouter);

  App = Vue.extend({});

  main = function() {
    this.after('initialize', function() {
      var openpgp;
      openpgp = require('./openpgp.min.js');
      openpgp.initWorker({
        path: '/js/openpgp.worker.min.js'
      });
      openpgp.config.aead_protect = true;
      this.pgp = openpgp;
      this.Vue = Vue;
      this.settings = $.extend({
        watchers: [],
        ready: false
      }, JSON.parse(localStorage.getItem('settings')));
      this.data = function() {
        return {
          appName: 'SEMPER',
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
        this.router.replace('/unlock');
      } else {
        this.router.replace('/wizard');
      }
      document.onkeyup = (function(_this) {
        return function(e) {
          if (e.altKey === true && e.key === 'c') {
            _this.clear();
            return document.location.reload();
          }
        };
      })(this);
      return document.onkeydown = (function(_this) {
        return function(e) {
          if (e.key === 'Enter') {
            return e.preventDefault();
          }
        };
      })(this);
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
    return this.clear = function() {
      return localStorage.clear();
    };
  };

  Main = flight.component(main);

  Main.attachTo(document);

  module.exports = Main;

}).call(this);

(function() {
  var Vault, app, vault;

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
        _this.diffs = _this.hz('diffs');
        _this.hz.onReady(function() {
          return console.log('Connected to Horizon!');
        });
        _this.hz.onDisconnected(function(e) {
          return location.reload();
        });
        _this.hz.currentUser().fetch().subscribe(function(me) {
          var fingerprint, _ref;
          console.log(JSON.stringify(me));
          _this.me = me;
          if ((_ref = app.settings.keys) != null ? _ref.fingerprint : void 0) {
            fingerprint = app.settings.keys.fingerprint;
            _this.updateFingerprint(fingerprint);
            return _this.settings.findAll(_this.fromMe).fetch().subscribe(function(settings) {
              return console.log('New settings', settings);
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
        console.log("Retrieving events newer than " + app.settings.lastSync);
        return _this.diffs.order('datetime', 'descending').above({
          datetime: new Date(app.settings.lastSync || 0)
        }).findAll(_this.toMe).watch({
          rawChanges: true
        }).subscribe(function(changes) {
          if (changes.new_val != null) {
            _this.eventAdd(changes.new_val);
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
        return _this[col].store(obj).subscribe(function(result) {
          return cb(result.id);
        }, function(error) {
          return console.error(error);
        });
      };
    })(this);
    this.replace = (function(_this) {
      return function(col, obj, cb) {
        console.log('Replacing', col, obj);
        return _this[col].replace(obj).subscribe(function(result) {
          return cb && cb(result.id);
        }, function(error) {
          return console.error(error);
        });
      };
    })(this);
    return this.eventAdd = (function(_this) {
      return function(_arg) {
        var content, creator, id, message, pgp, privateKey, reader;
        content = _arg.content, creator = _arg.creator, reader = _arg.reader, id = _arg.id;
        pgp = app.pgp;
        message = pgp.message.readArmored(content);
        privateKey = app.privateKey;
        return message.decrypt(privateKey).then(function(_arg1) {
          var Vue, data, date, event, events, filename, packets, path, watcher, _ref;
          packets = _arg1.packets;
          _ref = packets.findPacket(pgp.enums.packet.literal), filename = _ref.filename, date = _ref.date, data = _ref.data;
          data = pgp.util.Uint8Array2str(data);
          console.log('There is a new diff ' + JSON.stringify({
            filename: filename,
            date: date,
            data: data
          }));
          watcher = app.settings.watchers.find(function(e) {
            return e.fingerprint === creator;
          });
          if (watcher) {
            Vue = app.Vue;
            path = filename;
            event = {
              ref: Date.now(),
              time: date,
              changes: JSON.parse(data)
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
  };

  Vault = flight.component(vault);

  Vault.attachTo(document);

  module.exports = Vault;

}).call(this);

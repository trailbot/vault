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
      this.on('keydown', (function(_this) {
        return function(e) {
          if (e.which === 13) {
            return e.preventDefault();
          }
        };
      })(this));
      this.on('keyup', (function(_this) {
        return function(e) {
          if (e.altKey === true && e.which === 67) {
            _this.clear();
            return document.location.reload();
          }
        };
      })(this));
      this.on('decrypting', (function(_this) {
        return function(e) {
          return _this.status.decrypting++;
        };
      })(this));
      this.on('decrypted', (function(_this) {
        return function(e) {
          return _this.status.decrypting--;
        };
      })(this));
      this.on('unlocked', function() {
        var unlock;
        unlock = document.querySelector('.unlock');
        return unlock.parentElement.removeChild(unlock);
      });
      openpgp = require('./openpgp.min.js');
      openpgp.initWorker({
        path: '/js/openpgp.worker.min.js'
      });
      this.pgp = openpgp;
      this.Vue = Vue;
      this.settings = $.extend({
        watchers: [],
        lastArchive: Date.now(),
        lastSync: 0,
        ready: false
      }, JSON.parse(localStorage.getItem('settings')));
      this.data = function() {
        return {
          appName: 'Trailbot',
          isElectron: 'electron' in window
        };
      };
      this.status = {
        decrypting: 0
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
            '/fileEdit/:path': {
              name: 'fileEdit',
              component: require('../../src/vue/dashboard/fileEdit.vue')
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
                },
                '/policyEdit/:index': {
                  name: 'policyEdit',
                  component: require('../../src/vue/dashboard/policyEdit.vue')
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
        if (this.user === 'webuser@mozilla') {
          this.user = void 0;
        }
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
    return this.after('initialize', function() {
      this.hz = new Horizon({
        authType: 'anonymous'
      });
      this.users = this.hz('users');
      this.settings = this.hz('settings');
      this.events = this.hz('events');
      this.exchange = this.hz('exchange');
      this.hz.onReady((function(_this) {
        return function() {
          return _this.subscribe();
        };
      })(this));
      app.on('ready', (function(_this) {
        return function() {
          return _this.hz.connect();
        };
      })(this));
      app.on('unlocked', (function(_this) {
        return function() {
          return _this.retrieveEvents();
        };
      })(this));
      document.vault = this;
      this.subscribe = function() {
        return this.hz.currentUser().fetch().subscribe((function(_this) {
          return function(me) {
            var _ref;
            _this.me = me;
            console.log(JSON.stringify(_this.me));
            if ((_ref = app.settings.keys) != null ? _ref.fingerprint : void 0) {
              _this.updateFingerprint(app.settings.keys.fingerprint);
              return _this.settings.findAll(_this.fromMe).fetch().subscribe(function(settings) {
                return console.log(JSON.stringify(settings));
              }, console.error);
            }
          };
        })(this));
      };
      this.retrieveEvents = function() {
        if (this.retrieving) {
          return;
        }
        this.retrieving = true;
        console.log("Retrieving events newer than " + (new Date(app.settings.lastSync)));
        return this.events.order('ref', 'descending').above({
          ref: app.settings.lastSync || 0
        }).findAll(this.toMe).watch({
          rawChanges: true
        }).subscribe({
          next: (function(_this) {
            return function(changes) {
              if (changes.new_val != null) {
                app.trigger('decrypting');
                return setTimeout(function() {
                  _this.eventProcess(changes.new_val);
                  app.settings.lastSync = Date.now();
                  return app.save();
                });
              } else if (changes.type === 'state' && changes.state === 'synced') {
                app.settings.lastSync = Date.now();
                _this.events.below({
                  ref: app.settings.lastSync || 0
                }).findAll(_this.toMe).fetch().mergeMap(function(messageList) {
                  return _this.events.removeAll(messageList);
                }).subscribe({
                  error: function(err) {
                    return console.error(err);
                  },
                  complete: function() {
                    console.log('Finished syncing!');
                    return _this.trigger('synced');
                  }
                });
                return setTimeout(function() {
                  return app.save();
                });
              } else {
                return console.log('There are other changes');
              }
            };
          })(this)
        });
      };
      this.updateFingerprint = function(fingerprint) {
        this.fromMe = {
          creator: fingerprint
        };
        this.toMe = {
          reader: fingerprint
        };
        return this.users.replace($.extend(this.me, {
          data: {
            key: fingerprint
          }
        }));
      };
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
                  lineno: 75
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
                  lineno: 86
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
            var data, date, event, filename, key, keyPacket, literal, packets, path, sig, watcher, _i, _len, _ref;
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
              path = filename;
              event = {
                ref: Date.now(),
                time: date,
                content: data
              };
              watcher.events[path].push(event);
              return app.trigger('decrypted');
            }
          })["catch"](function(error) {
            console.error(error);
            return app.trigger('decrypted');
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
    });
  };

  Vault = flight.component(vault);

  Vault.attachTo(document);

  module.exports = Vault;

}).call(this);

(function() {
  var Archivist, app, archivist, vault;

  app = document.app;

  vault = document.vault;

  archivist = function() {
    this.after('initialize', function() {
      return vault.on('synced', this.globalArchive);
    });
    this.globalArchive = (function(_this) {
      return function() {
        window.mkdir("archive");
        return app.settings.watchers.forEach(_this.watcherArchive);
      };
    })(this);
    this.watcherArchive = (function(_this) {
      return function(watcher) {
        var file, path, _ref, _results;
        _ref = watcher.settings.files;
        _results = [];
        for (path in _ref) {
          file = _ref[path];
          _results.push(_this.fileArchive(path, file, watcher.events));
        }
        return _results;
      };
    })(this);
    this.fileArchive = (function(_this) {
      return function(path, file, events) {
        var archivable, date, ev, i, indexOlder, limit, lines, _ref, _results;
        if (events[path]) {
          events[path].sort(_this.sortBy);
          limit = _this.getLimit(file.archive || 30);
          indexOlder = void 0;
          _ref = events[path];
          for (i in _ref) {
            ev = _ref[i];
            if (ev.ref < limit) {
              indexOlder = i;
              break;
            }
          }
          if (indexOlder) {
            archivable = events[path].slice(indexOlder);
            events[path] = events[path].slice(0, indexOlder);
            app.save();
            archivable = archivable.reduce(_this.groupByDay, []);
            _results = [];
            for (date in archivable) {
              lines = archivable[date];
              _results.push(_this.writeToFile("" + (_this.getBaseName(path)) + "-" + date, lines.join("\n")));
            }
            return _results;
          }
        }
      };
    })(this);
    this.groupByDay = function(arr, value) {
      var d, key;
      d = new Date(value.time);
      key = "" + (d.getFullYear()) + "-" + (d.getMonth() + 1) + "-" + (d.getDate());
      if (!arr[key]) {
        arr[key] = [];
      }
      arr[key].push(JSON.stringify(value));
      return arr;
    };
    this.writeToFile = function(prefix, txt) {
      return window.fs.writeFile("archive/" + prefix + "-archive", txt, function(err) {
        if (err) {
          return console.log("Error creating the archiving file " + prefix + " " + err);
        } else {
          return console.log("Archive for date " + prefix + " succesfully saved");
        }
      });
    };
    this.sortBy = function(a, b, field) {
      if (field == null) {
        field = "ref";
      }
      if (a[field] < b[field]) {
        return 1;
      }
      if (a[field] > b[field]) {
        return -1;
      }
      return 0;
    };
    this.getLimit = function(days) {
      var limit, now;
      now = new Date();
      limit = new Date();
      limit.setDate(now.getDate() - days);
      limit.setHours(23);
      limit.setMinutes(59);
      limit.setSeconds(59);
      return Date.parse(limit);
    };
    return this.getBaseName = function(path) {
      return path.split(/[\\/]/).reverse()[0].split(".")[0];
    };
  };

  Archivist = flight.component(archivist);

  Archivist.attachTo(document);

  module.exports = Archivist;

}).call(this);

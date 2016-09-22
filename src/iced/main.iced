Vue = require 'vue'
VueRouter = require 'vue-router'
Vue.use VueRouter
App = Vue.extend({})

window.electron = eRequire('electron').remote
window.fs = eRequire 'fs'
window.git = eRequire 'simple-git'
window.mkdir = eRequire 'mkdirp'
window.request = eRequire 'request'
window.os = eRequire 'os'

main = ->

  @after 'initialize', ->

    @on 'keydown', (e) =>
      if e.which is 13
        e.preventDefault()
    @on 'keyup', (e) =>
      if e.altKey is true and e.which is 67
        @clear()
        document.location.reload()

    @on 'decrypting', (e) =>
      @status.decrypting++
    @on 'decrypted', (e) =>
      @status.decrypting--

    openpgp = require './openpgp.min.js'
    openpgp.initWorker
      path: '/js/openpgp.worker.min.js'
    @pgp = openpgp

    @Vue = Vue

    @settings =
      $.extend {
        watchers: []
        lastArchive: Date.now()
        lastSync: 0
        ready: false
      }, JSON.parse localStorage.getItem 'settings'
    @data = ->
      appName: 'Trailbot'
      isElectron: 'electron' of window
    @status =
      decrypting: 0
    document.app = this

    @router = new VueRouter()
    @router.map
      '/':
        component: require '../../src/vue/empty.vue'
      '/unlock':
        component: require '../../src/vue/unlock.vue'
      '/wizard':
        component: require '../../src/vue/wizard/main.vue'
        subRoutes:
          '/':
            component: require '../../src/vue/wizard/welcome.vue'
          '/generate':
            component: require '../../src/vue/wizard/generate.vue'
          '/export':
            component: require '../../src/vue/wizard/export.vue'
          '/preImport':
            component: require '../../src/vue/wizard/preImport.vue'
          '/watcherGuide':
            component: require '../../src/vue/wizard/watcherGuide.vue'
          '/import':
            component: require '../../src/vue/wizard/import.vue'
          '/congrats':
            component: require '../../src/vue/wizard/congrats.vue'
      '/dashboard':
        name: 'dashboard'
        component: require '../../src/vue/dashboard/main.vue'
      '/dashboard/:watcher':
        name: 'watcher'
        component: require '../../src/vue/dashboard/main.vue'
        subRoutes:
          '/fileAdd':
            name: 'fileAdd'
            component: require '../../src/vue/dashboard/fileAdd.vue'
          '/file/:file':
            name: 'file'
            component: require '../../src/vue/dashboard/file.vue'
            subRoutes:
              '/policyAdd':
                name: 'policyAdd'
                component: require '../../src/vue/dashboard/policyAdd.vue'
              '/policy/:policy':
                name: 'policy'
                component: require '../../src/vue/dashboard/policy.vue'
              '/event/:event':
                name: 'event'
                component: require '../../src/vue/dashboard/event.vue'
              '/policyEdit/:index':
                name: 'policyEdit'
                component: require '../../src/vue/dashboard/policyEdit.vue'

    @router.afterEach (transition) =>
      methods = transition.to.matched.slice(-1)[0].handler.component.options.methods
      if methods?.run
        methods.run this.router.app.$route, transition
    @router.start App, '#app'

    window.Intercom 'boot',
      app_id: 'pzfj55kn'

    if @settings.keys?
      @privateKey = @pgp.key.readArmored(document.app.settings.keys.priv).keys[0]
      @user = @privateKey.users[0].userId.userid.split(/[<>]/g)[1].split('.')[0]
      if @user is 'webuser@mozilla'
        @user = undefined
      @router.replace '/unlock'
      @intercomReport()
    else
      @router.replace '/wizard'

  @save = ->
    console.log 'SAVING APP'
    localStorage.setItem 'settings', JSON.stringify @settings
    @intercomReport()

  @copy = (text) ->
    el = $ '<input type="text"/>'
      .val text
    $('body')
      .append el
    el.select()
    try
      document.execCommand 'copy'
    catch err
      window.prompt 'Please, select the text, copy it and paste it in a safe place', text
    finally
      el.remove()

  @paste = (cb) ->
    try
      cb electron.clipboard.readText()
    catch err
      cb window.prompt 'Please, paste the text down below'

  @clear = ->
    localStorage.clear()

  @fooEvent =
    diff: [
      type: 'fill'
      lines: ["This is the old content"]
    ,
      type: 'add'
      lines: ["This is a new line"]
    ]
    prev:
      time: Date.now() - 86400000
      content: "This is the old content"
    cur:
      time: Date.now()
      content: "This is the old content\nThis is a new line"
    path: '/example/path/to/a/file'

  @intercomReport = ->
    window.Intercom 'update',
      email: @user
      watchers: @settings.watchers.length
      files: @settings.watchers.reduce (acc, watcher) ->
        acc + (Object.keys watcher.settings.files).length
      , 0
      policies: @settings.watchers.reduce (acc, watcher) ->
        acc + (Object.keys watcher.settings.files).reduce (acc, path) ->
          acc + watcher.settings.files[path].policies.length
        , 0
      , 0
      events: @settings.watchers.reduce (acc, watcher) ->
        acc + (Object.keys watcher.settings.files).reduce (acc, path) ->
          acc + watcher.events?[path]?.length or 0
        , 0
      , 0

Main = flight.component main
Main.attachTo document
module.exports = Main

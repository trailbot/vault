Vue = require 'vue'
VueRouter = require 'vue-router'
Vue.use VueRouter
App = Vue.extend({})

electron = eRequire('electron').remote
fs = eRequire 'fs'
git = eRequire 'simple-git'
mkdir = eRequire 'mkdirp'
request = eRequire 'request'
os = eRequire 'os'

main = ->

  @after 'initialize', ->

    document.onkeyup = (e) =>
      if e.altKey is true and e.key is 'c'
        @clear()
        document.location.reload()
    document.onkeydown = (e) =>
      if e.key is 'Enter'
        e.preventDefault()

    openpgp = require './openpgp.min.js'
    openpgp.initWorker
      path: '/js/openpgp.worker.min.js'
    @pgp = openpgp

    @Vue = Vue

    @settings =
      $.extend {
        watchers: []
        lastSync: 0
        ready: false
      }, JSON.parse(localStorage.getItem('settings'))
    @data = ->
      appName: 'Trailbot'
      isElectron: 'electron' of window
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

    @router.afterEach (transition) =>
      methods = transition.to.matched.slice(-1)[0].handler.component.options.methods
      if methods?.run
        methods.run this.router.app.$route, transition
    @router.start App, '#app'

    if @settings.keys?
      @privateKey = @pgp.key.readArmored(document.app.settings.keys.priv).keys[0]
      @router.replace '/unlock'
    else
      @router.replace '/wizard'

  @save = ->
    console.log 'SAVING APP'
    localStorage.setItem 'settings', JSON.stringify @settings

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

Main = flight.component main
Main.attachTo document
module.exports = Main

Vue = require 'vue'
VueRouter = require 'vue-router'
Vue.use VueRouter
App = Vue.extend({})

main = ->

  @after 'initialize', ->
    openpgp = require './openpgp.min.js'
    openpgp.initWorker
      path: '/js/openpgp.worker.min.js'
    openpgp.config.aead_protect = true
    @pgp = openpgp
    @settings =
      $.extend {watchers: [], ready: false}, JSON.parse(localStorage.getItem('settings'))
    @data = ->
      appName: 'SEMPER'
      isElectron: 'electron' of window
    document.app = this

    document.onkeyup = (e) =>
      if e.altKey is true and e.key is 'c'
        @clear()
        document.location.reload()

    @router = new VueRouter()
    @router.map
      '/':
        component: require '../../src/vue/empty.vue'
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

    @router.afterEach (transition) =>
      methods = transition.to.matched.slice(-1)[0].handler.component.options.methods
      if methods?.run
        methods.run this.router.app.$route, transition
    @router.start App, '#app'

    if @settings.ready
      @router.replace '/dashboard'
    else
      @router.replace '/wizard'

  @save = ->
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

Main = flight.component main
Main.attachTo document
module.exports = Main

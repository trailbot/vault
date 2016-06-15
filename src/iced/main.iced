Vue = require 'vue'
VueRouter = require 'vue-router'
Vue.use VueRouter
App = Vue.extend({})

main = () ->

  @after 'initialize', () ->
    openpgp = require './openpgp.min.js'
    openpgp.initWorker
      path: '/js/openpgp.worker.min.js'
    openpgp.config.aead_protect = true
    @pgp = openpgp
    @settings = JSON.parse(localStorage.getItem('settings') || '{}')
    @data = ->
      appName: 'SEMPER'
    document.app = this

    @router = new VueRouter()
    @router.map
      '/':
        component: require '../../src/vue/home.vue'
      '/wizard':
        component: require '../../src/vue/wizard/main.vue'
        subRoutes:
          '/':
            component: require '../../src/vue/wizard/welcome.vue'
          '/generate':
            component: require '../../src/vue/wizard/generate.vue'
          '/export':
            component: require '../../src/vue/wizard/export.vue'
          '/import':
            component: require '../../src/vue/wizard/import.vue'
    @router.afterEach (transition) =>
      methods = transition.to.matched['1'].handler.component.options.methods
      if methods?.run
        methods.run app
    @router.start App, '#app'

    unless @settings.ready
      @router.replace '/wizard'

  @save = () ->
    localStorage.setItem 'settings', JSON.stringify @settings

Main = flight.component main
Main.attachTo document
module.exports = Main

vault = ->

  @after 'initialize', ->
    @hz = new Horizon
      authType: 'anonymous'
    @hz.connect()

    @users = @hz 'users'
    @settings = @hz 'settings'
    @diffs = @hz 'diffs'

    @hz.onReady ->
      console.log 'Connected to Horizon!'

    @hz.currentUser().fetch().subscribe (me) ->
      console.log 'Me:', me

Vault = flight.component vault
Vault.attachTo document
module.exports = Vault

vault = ->

  @after 'initialize', =>
    @hz = new Horizon
      authType: 'anonymous'
    @hz.connect()

    @users = @hz 'users'
    @settings = @hz 'settings'
    @diffs = @hz 'diffs'

    @hz.onReady ->
      console.log 'Connected to Horizon!'

    @hz.currentUser().fetch().subscribe (me) =>
      console.log JSON.stringify me
      @me = me

      if document.app.settings.keys?.fingerprint
        fingerprint = document.app.settings.keys.fingerprint
        @updateFingerprint fingerprint

        @settings.find(@fromMe).fetch().subscribe (settings) =>
          console.log 'New settings', settings
        , (error) =>
          console.error error
        , () =>
          console.log 'Completed!'

    document.vault = this

  @updateFingerprint = (fingerprint) =>
    @fromMe =
      creator: fingerprint
    @toMe =
      reader: fingerprint
    @users.replace $.extend @me,
      data:
        key: fingerprint

  @store = (col, obj, cb) =>
    this[col].store(obj)
      .subscribe (result) =>
        cb result.id
      , (error) =>
        console.error error

  @replace = (col, obj, cb) =>
    console.log 'Replacing', col, obj
    this[col].replace(obj)
      .subscribe (result) =>
        cb && cb result.id
      , (error) =>
        console.error error

Vault = flight.component vault
Vault.attachTo document
module.exports = Vault

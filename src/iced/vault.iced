app = document.app

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

    @hz.onDisconnected (e) ->
      location.reload()

    @hz.currentUser().fetch().subscribe (me) =>
      console.log JSON.stringify me
      @me = me

      if app.settings.keys?.fingerprint
        fingerprint = app.settings.keys.fingerprint
        @updateFingerprint fingerprint

        @settings.findAll(@fromMe).fetch().subscribe (settings) =>
          console.log 'New settings', settings
        , (error) =>
          console.error error
        , () =>
          console.log 'Settings completed!'

        console.log "Retrieving events newer than #{app.settings.lastSync}"
        @diffs.order('datetime', 'descending').above({datetime: new Date(app.settings.lastSync || 0)}).findAll(@toMe).watch({rawChanges: true}).subscribe (changes) =>
          if changes.new_val?
            @eventAdd changes.new_val
            app.settings.lastSync = new Date()
            app.save()
          else if changes.type is 'state' and changes.state is 'synced'
            console.log 'Finished syncing!'
            app.settings.lastSync = new Date()
            app.save()
          else
            console.log 'There are other changes'

    app.save()
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

  @eventAdd = ({content, creator, reader, id}) =>
    console.log 'There is a new diff'
    pgp = app.pgp
    message = pgp.message.readArmored content
    privateKey = app.privateKey
    message.decrypt(privateKey)
      .then ({packets}) ->
        {filename, date, data} = packets.findPacket(pgp.enums.packet.literal)
        data = pgp.util.Uint8Array2str data
        watcher = app.settings.watchers.find (e) ->
          e.fingerprint == creator
        if watcher
          Vue = app.Vue
          path = filename
          event =
            ref: Date.now()
            time: date
            changes: JSON.parse data
          Vue.set watcher, 'events', {} unless watcher.events?
          Vue.set watcher.events, path, [] unless watcher.events[path]?
          events = watcher.events[path]
          events.push event
          Vue.set watcher.events, path, events
      .catch (error) ->
        console.error error

Vault = flight.component vault
Vault.attachTo document
module.exports = Vault

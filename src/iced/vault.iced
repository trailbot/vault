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

    document.vault = this
    app.save()

  @retrieveEvents = () =>
    return if @retrieving
    @retrieving = true
    console.log "Retrieving events newer than #{app.settings.lastSync}"
    @diffs.order('datetime', 'descending').above({datetime: new Date(app.settings.lastSync || 0)}).findAll(@toMe).watch({rawChanges: true}).subscribe (changes) =>
      if changes.new_val?
        @eventProcess changes.new_val
        app.settings.lastSync = new Date()
        setTimeout ->
          app.save()
      else if changes.type is 'state' and changes.state is 'synced'
        console.log 'Finished syncing!'
        app.settings.lastSync = new Date()
        setTimeout ->
          app.save()
      else
        console.log 'There are other changes'

  @updateFingerprint = (fingerprint) =>
    @fromMe =
      creator: fingerprint
    @toMe =
      reader: fingerprint
    @users.replace $.extend @me,
      data:
        key: fingerprint

  @store = (col, obj, cb) =>
    if obj.encrypt
      delete obj.encrypt
      await @encrypt obj, defer obj
    this[col].store(obj)
      .subscribe (result) =>
        cb result.id
      , (error) =>
        console.error error

  @replace = (col, obj, cb) =>
    console.log 'Replacing', col, obj
    if obj.encrypt
      delete obj.encrypt
      await @encrypt obj, defer obj
    this[col].replace(obj)
      .subscribe (result) =>
        cb && cb result.id
      , (error) =>
        console.error error

  @eventProcess = ({content, creator, reader, id}) =>
    pgp = app.pgp
    message = pgp.message.readArmored content
    message.decrypt(app.privateKey)
    .then ({packets}) ->
      literal = packets.findPacket pgp.enums.packet.literal
      # Data extraction
      {filename, date, data} = literal
      data = pgp.util.Uint8Array2str data
      console.log 'There is a new diff ' + JSON.stringify {filename, date, data}
      watcher = app.settings.watchers.find (e) ->
        e.fingerprint == creator

      if watcher
        # Signature verification
        sig = packets.findPacket pgp.enums.packet.signature
        keyPacket = null
        for key in pgp.key.readArmored(watcher.key).keys
          keyPacket = key.getSigningKeyPacket sig.issuerKeyId
          break if keyPacket
        unless keyPacket and sig.verify keyPacket, literal
          return console.error "[CRYPTO] Wrong signature"

        # Event saving and rendering
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

  @encrypt = (object, cb) =>
    {id, v, creator, reader} = object
    pgp = app.pgp
    watcher = app.settings.watchers.find (e) ->
      e.fingerprint == object.reader
    data = $.extend {}, object

    delete data.id
    delete data.v
    delete data.creator
    delete data.reader

    pgp.encrypt
      data: JSON.stringify data
      publicKeys: pgp.key.readArmored(watcher.key).keys
      privateKeys: app.privateKey
    .then (cyphertext) ->
      content = cyphertext.data
      cb {id, v, creator, reader, content}
    .catch (error) ->
      console.error error

Vault = flight.component vault
Vault.attachTo document
module.exports = Vault

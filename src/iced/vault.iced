app = document.app

vault = ->

  @after 'initialize', =>

    @hz = new Horizon
      authType: 'anonymous'
    @users = @hz 'users'
    @settings = @hz 'settings'
    @events = @hz 'events'
    @exchange = @hz 'exchange'

    @hz.onReady =>
      @subscribe()

    app.on 'ready', =>
      @hz.connect()

    app.on 'unlocked', =>
      @retrieveEvents()

    document.vault = this

  @subscribe = ->
    @hz.currentUser().fetch().subscribe (@me) =>
      console.log JSON.stringify @me

      if app.settings.keys?.fingerprint
        @updateFingerprint app.settings.keys.fingerprint
        @settings.findAll(@fromMe).fetch().subscribe (settings) =>
          console.log JSON.stringify settings
        , console.error

  @retrieveEvents = ->
    return if @retrieving
    @retrieving = true
    console.log "Retrieving events newer than #{app.settings.lastSync}"
    @events?.order('datetime', 'descending').above({datetime: new Date(app.settings.lastSync || 0)}).findAll(@toMe).watch({rawChanges: true}).subscribe
      next : (changes) =>
        if changes.new_val?
          @eventProcess changes.new_val
          app.settings.lastSync = new Date()
          setTimeout ->
            app.save()
        else if changes.type is 'state' and changes.state is 'synced'
          app.settings.lastSync = new Date()
          @events.below({datetime: new Date(app.settings.lastSync || 0)})
            .findAll(@toMe)
            .fetch()
            .mergeMap((messageList) => @events.removeAll(messageList))
            .subscribe
              error : (err) ->  console.error(err)
              complete : () =>
                console.log 'Finished syncing!'
                @trigger 'synced'

          setTimeout ->
            app.save()
        else
          console.log 'There are other changes'

  @updateFingerprint = (fingerprint) ->
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
    this[col].upsert(obj)
      .subscribe (result) =>
        cb && cb result.id
      , (error) =>
        console.error error

  @find = (col, obj, cb) =>
    console.log 'Finding', col, obj
    this[col].find(obj).fetch().defaultIfEmpty().subscribe(cb)

  @watch = (col, obj, cb) =>
    this[col]?.find(obj).watch().subscribe (items) ->
      cb and cb items

  @eventProcess = ({content, creator, reader, id}) =>
    pgp = app.pgp
    message = pgp.message.readArmored content
    message.decrypt(app.privateKey)
    .then ({packets}) ->
      literal = packets.findPacket pgp.enums.packet.literal
      # Payload extraction
      {filename, date, data} = literal
      data = JSON.parse pgp.util.Uint8Array2str data
      console.log 'There is a new event ' + JSON.stringify {filename, date}
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
          content: data
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

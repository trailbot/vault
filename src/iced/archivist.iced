app = document.app
vault = document.vault

archivist = ->

  @after 'initialize', ->
    vault.on 'synced', @globalArchive

  @globalArchive = =>
    window.mkdir "archive"
    app.settings.watchers.forEach @watcherArchive

  @watcherArchive = (watcher) =>
    for path, file of watcher.settings.files
      @fileArchive path, file, watcher.events

  @fileArchive = (path, file, events) =>
    if events[path]
      events[path].sort @sortBy

      limit = @getLimit file.archive || 30
      # index of the first event older than the limit
      indexOlder = undefined
      for i, ev of events[path]
        if ev.ref < limit
          indexOlder = i
          break

      if indexOlder
        archivable = events[path].slice indexOlder
        events[path] = events[path].slice 0, indexOlder
        app.save()
        archivable = archivable.reduce @groupByDay, []
        for date, lines  of archivable
          @writeToFile "#{@getBaseName path}-#{date}", lines.join "\n"



  @groupByDay = (arr, value) ->
    d = new Date(value.time)
    key = "#{d.getFullYear()}-#{d.getMonth() + 1}-#{d.getDate()}"
    arr[key] = [] unless arr[key]
    arr[key].push JSON.stringify value
    arr

  @writeToFile = (prefix, txt) ->
    window.fs.writeFile "archive/#{prefix}-archive", txt, (err) ->
      if err
        console.log "Error creating the archiving file #{prefix} #{err}"
      else
        console.log "Archive for date #{prefix} succesfully saved"

  @sortBy = (a, b, field = "ref") ->
    if a[field] < b[field]
      return 1
    if a[field] > b[field]
      return -1
    return 0

  # current date minus the number of days , return epoch
  @getLimit = (days) ->
    now = new Date()
    limit = new Date()
    limit.setDate(now.getDate() - (days))
    limit.setHours(23)
    limit.setMinutes(59)
    limit.setSeconds(59)
    Date.parse limit

  @getBaseName = (path) ->
    path.split(/[\\/]/).reverse()[0].split(".")[0]

Archivist = flight.component archivist
Archivist.attachTo document
module.exports = Archivist

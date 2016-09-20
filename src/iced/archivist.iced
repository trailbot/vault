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
#    return unless file.archive
    # sort by recent first
    events[path].sort @sortByDate

    limit = @getLimit file.archive || 3
    index = undefined
    for i, ev of events[path]
      if new Date(ev.time) < limit
        index = i
        break

    if index
      archivable = events[path].slice index
      events[path] = events[path].slice 0, index
      app.save()

      archivable = archivable.reduce @groupByDay, []
      for date, lines  of archivable
        @writeToFile date, lines.join "\n"



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

  @sortByDate = (a, b) ->
    if a.time < b.time
      return 1
    if a.time > b.time
      return -1
    return 0

  @getLimit = (days) ->
    now = new Date()
    limit = new Date()
    limit.setDate(now.getDate() - (days))
    limit.setHours(23)
    limit.setMinutes(59)
    limit.setSeconds(59)
    limit

Archivist = flight.component archivist
Archivist.attachTo document
module.exports = Archivist

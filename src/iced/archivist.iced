app = document.app
vault = document.vault

archivist = ->

  @after 'initialize', ->
    vault.on 'synced', @globalArchive

  @globalArchive = =>
    app.settings.watchers.forEach @watcherArchive

  @watcherArchive = (watcher) =>
    for path, file of watcher.settings.files
      @fileArchive path, file, watcher.events[path]

  @fileArchive = (path, file, events) =>
#    return unless file.archive
    now = new Date()
    limit = file.archive or 4*60*60*1000
    archivable = events.filter (event) ->
      now - new Date(event.time) > limit
    lines = archivable.map JSON.stringify
    text = lines.join "\n"

Archivist = flight.component archivist
Archivist.attachTo document
module.exports = Archivist

vault = document.vault

archivist = ->

  @after 'initialize', ->
    vault.on 'synced', @archive

  @archive = ->


Archivist = flight.component archivist
Archivist.attachTo document
module.exports = Archivist

<style lang="stylus" scoped>
  .close
    float: right
    width: auto
    margin-top: -5px
    margin-right: -10px
    margin-left: 12px
    padding: 10px 15px
    width: auto
    background: #EEE
    color: #AAA
    font-size: .7em
    &:hover
      background: #44586d
      color: white
</style>

<template lang="jade">
article.form(transition='slide')
  header
    button.plain.close(v-if='settings.watchers.length', v-link="{ path: '/dashboard' }") X
    button.plain.back(@click='back') < BACK
    h1 Public keys exchange
  form
    p Please enter here the biometric sentence provided by Trailbot Watcher.
    p Take in to account that the sentences are renewed every 5 minutes for security reasons.
    p.error(v-if='error') {{error}}
    fieldset
      label(for='sentence') Biometric sentence
      input(type='text', name='sentence' v-model="sentence")
  footer(v-if='sentence')
      button.or(@click='validate') Validate sentence
</template>

<script lang="coffee">
app = document.app
module.exports =
  data: ->
    $.extend app.data(),
      error: false
      settings:
        app.settings
      sentence: null
  methods:
    next: ->
      app.router.go '/wizard/congrats'
    back: ->
      app.router.go '/wizard/preImport'
    newWatcher: (key) ->
      try
        keys = app.pgp.key.readArmored(key).keys
        console.log JSON.stringify keys
        name = keys[0].users[0].userId.userid.split('@')[1].slice(0, -1)
        fingerprint = keys[0].primaryKey.fingerprint
        settings =
          creator: @settings.keys.fingerprint
          reader: fingerprint
          files: {}
        watcher = {key, name, fingerprint, settings}
        watcher.events = {}
        # Encryption is not enabled the first time
        document.vault.store 'settings', settings, (id) =>
          watcher.settings.id = id
          @settings.watchers.push watcher
          @settings.ready = true
          app.save()
          @next()
      catch err
        console.error "[CRYPTO] #{err}"

    validate: (e) ->
      e.preventDefault()
      pgpWordList = require('pgp-word-list-converter')()
      channel = pgpWordList.toHex(@sentence).join('').toLowerCase()
      document.vault.find 'exchange', {channel: channel}, (exchange) =>
        if exchange and (new Date(exchange.expires)) > new Date()
          exchange.client = @settings.keys.pub
          document.vault.replace 'exchange', exchange, () =>
            document.vault.watch 'exchange', exchange, (change) =>
              # if change is null then the document was deleted
              @newWatcher exchange.watcher unless change
        else if exchange
          @error = "Sentence has expired!"
        else
          @error = "Wrong sentence. Please verify that you entered the words currently showed in Trailbot Watcher..."
    close: ->

</script>

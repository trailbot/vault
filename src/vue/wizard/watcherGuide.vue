<style lang="stylus" scoped>
article.form
  max-width: 90vw!important
  width: 840px
div.or
  text-align: center
  button
    &:first-child
      padding-right: 30px
    &:last-child
      position: relative
      padding-left: 30px
      &:after
        content: 'or'
        display: block
        position: absolute
        left: -21px
        top: 6px
        background: #f7
        border: 1px solid #dd
        border-radius: 50%
        padding: 12px 11px 11px 11px
        text-transform: uppercase
        font-size: .8em
        color: gray
ol
  padding-left: 30px
  li
    margin-bottom: 15px
    padding-left: 10px
    line-height: 1.5em
    code
    pre
      margin-left: 2px
      margin-right: 2px
      padding: 5px
      border-radius: 2px
      background: #55
      color: white
      font-weight: bold
    pre
      position: relative
      top: -5px

</style>

<template lang="jade">
article.form(transition='slide')
  header
    button.plain.back(@click='back') < BACK
    h1 Watcher setup
  form(@keyup.enter='submit')
    p Setting up a watcher is pretty simple:
    ol
      li.
        Log into your server and become #[strong root] (using #[code sudo su], #[code su] or similar).
      li
        span Install git and nodejs 6.x:
        pre.
          curl -sL https://deb.nodesource.com/setup_6.x | bash -
          apt-get install -y git nodejs build-essential || yum -y install git nodejs gcc gcc-c++ make
      li
        span Clone the repository and install the nodejs dependencies:
        pre.
          git clone https://github.com/trailbot/watcher
          cd watcher
          npm install
      li.
        Run the setup script:
        #[code npm run setup]
      li.
        Finally, type in the field below the biometric sentence provided by Trailbot Watcher.
        Take in to account that the sentences are renewed every 5 minutes for security reasons.
      footer
        form
          p.error(v-if='error') {{error}}
          fieldset
            label(for='sentence') Biometric sentence
            input(type='text', name='sentence' v-model="sentence")
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
      sentence: undefined
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
          @error = "Sentense has expired!"
        else
          @error = "Wrong sentence please verify that you are typing the words from the Trailbot Watcher ..."
</script>

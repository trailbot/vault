<style lang="stylus" scoped>
article
  &.generating
    width: 300px
    height: 300px
    top: 50vh
    left: 50vw
    margin: -150px
    p
      margin: 0
      text-align: center

  input[name=pass]
    width: calc(100% - 170px)
</style>

<template lang="jade">
article.generating(v-if='generating', transition='pop')
  div.sk-cube-grid
    div.sk-cube.sk-cube1
    div.sk-cube.sk-cube2
    div.sk-cube.sk-cube3
    div.sk-cube.sk-cube4
    div.sk-cube.sk-cube5
    div.sk-cube.sk-cube6
    div.sk-cube.sk-cube7
    div.sk-cube.sk-cube8
    div.sk-cube.sk-cube9
  p
    strong Generating keypair...
  p
    small (It may take up to 1 minute)

article.form(v-else, transition='slide')
  header
    h1 PGP keypar generation
  form(@keyup.enter='submit')
    p First of all, we need to generate the keys that {{appName}} will use to cypher all the data going between your server and this desktop app.
    p Your keys will be kept locally in a secure storage. Please never share your private key with anyone so you are the only one who can access the system.
    p Please choose a safe password or passphrase for protecting your keys:
    p.error(v-if='error') {{error}}
    fieldset.pass
      label(for='pass') Passphrase
      input(name='pass', type='password', v-model='pass')
  footer
    button.next(v-show='pass', @click='submit') Next
</template>

<script lang="coffee">
app = document.app
module.exports =
  data: ->
    $.extend app.data(),
      generating: false
      pass: null
      error: false
  methods:
    run: ->
      if app.settings.keys
        @next()
    submit: (e) ->
      e.preventDefault()
      if @pass
        @generating = true
        @genKeys()
      else
        @error = 'Please make sure you set a passphrase'
    genKeys: ->
      app.pgp.generateKey(
        userIds: [
          name: @email
          email: @identikit()
        ]
        numBits: 4096
        passphrase: @pass
      ).then (keys) =>
        app.settings.keys =
          priv: keys.privateKeyArmored
          pub: keys.publicKeyArmored
          fingerprint: keys.key.primaryKey.fingerprint
        document.vault.updateFingerprint app.settings.keys.fingerprint
        app.privateKey = keys.key
        app.privateKey.decrypt @pass
        app.save()
        @next()
    identikit: ->
      try
        user = electron.os.homedir().split('/').pop()
        host = electron.os.hostname()
      catch e
        user = 'webuser'
        host = "#{navigator.appCodeName}.#{navigator.appName}".toLowerCase()
      console.log "#{user}@#{host}.local"
      "#{user}@#{host}.local"
    next: ->
      @generating = false
      console.log app.settings.keys
      app.router.replace '/wizard/export'
</script>

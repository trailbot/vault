<style lang="stylus" scoped>
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

</style>

<template lang="jade">
article.form(transition='slide')
  header
      h1 Watcher public key import
  form
    p In order to verify the authenticity of the information coming from your servers, this desktop app needs to import your server's {{appName}} watcher public key.
  footer
    div.half.or
      button.or(@click='paste') Take from clipboard
      button.or(@click='import') Import from filesystem
</template>

<script lang="coffee">
app = document.app
module.exports =
  data: () ->
    $.extend app.data(),
      settings:
        app.settings
  methods:
    next: ->
      app.router.go '/wizard/congrats'
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
    paste: (e) ->
      e.preventDefault()
      app.paste (key) =>
        @newWatcher key
    import: (e) ->
      e.preventDefault()
      try
        electron.dialog.showOpenDialog
          title: 'Importing watcher public key'
          defaultPath: "./#{@appName}_watcher.pub"
          buttonLabel: 'Import'
          filters: [
            name: 'PGP keys', extensions: ['pub', 'key', 'pgp', 'gpg', 'asc']
          ,
            name: 'All files', extensions: ['*']
          ]
        , (path) =>
          if path
            key = fs.readFileSync(path[0], 'utf8')
            @newWatcher key
      catch err
        console.error 'This is not Electron'
</script>

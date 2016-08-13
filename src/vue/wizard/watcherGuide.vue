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
    h1 Watcher setup
  form(@keyup.enter='submit')
    p Setting up a watcher is pretty simple:
    ol
      li Log into you server.
      li.
        Become #[strong root] (using #[code sudo su], #[code su] or similar).
      li
        span Install git and nodejs 6.x:
        pre.
          curl -sL https://deb.nodesource.com/setup_6.x | bash -
          apt-get install -y git nodejs || yum -y install git nodejs || pacman -S git nodejs npm
      li
        span Clone the repository and install the nodejs dependencies:
        pre.
          git clone https://github.com/trailbot/watcher
          cd watcher
          npm install
      li(v-if='exported').
        Copy the #[code {{exported}}] client public key file that you just exported from this wizard and copy it into your server using #[code scp], #[code rsync], #[code ftp] or similar.
      li(v-else).
        Take the #[strong client] public key that you copied from the previous step in this wizard and paste it into a file in your server.
      li.
        Run the setup script:
        #[code npm run setup]
      li.
        Finally, choose an option below to import the watcher key:
  footer
    div.half.or
      button.or(@click='paste') Take from clipboard
      button.or(@click='import') Import from filesystem
</template>

<script lang="coffee">
app = document.app
module.exports =
  data: ->
    $.extend app.data(),
      settings:
        app.settings
      exported:
        @$parent.exported
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
          defaultPath: "./#{@appName.toLowerCase()}_watcher.pub.asc"
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

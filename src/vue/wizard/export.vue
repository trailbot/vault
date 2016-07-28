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
      h1 Public key export
  form
    p It is very important to export the public key now so that you can later import it in every server you want to monitor.
  footer
    div.half.or
      button.or(@click='copy') Copy to clipboard
      button.or(@click='export') Export to filesystem
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
      app.router.go '/wizard/preImport'
    copy: (e) ->
      e.preventDefault()
      app.copy @settings.keys.pub
      @next()
    export: (e) ->
      e.preventDefault()
      try
        electron.dialog.showSaveDialog
          title: 'Exporting client public key'
          defaultPath: "./#{@appName.toLowerCase()}_client.pub.asc"
          buttonLabel: 'Export'
        , (path) =>
          if path
            fs.writeFileSync(path, @settings.keys.pub)
            @next()
      catch err
        console.log 'This is not Electron'
</script>

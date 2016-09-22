<style lang="stylus" scoped>
input[name='path']
  box-sizing: border-box
  width: 100%
input[name='archive']
  display: inline-block !important
  margin-right: 1em
</style>

<template lang="jade">
article.form.fileAdd(transition='driftFade')
  form(@keyup.enter='submit')
    header
      h1.
        Edit watched file in #[strong {{watcher.name}}]
    p {{appName}} can watch an track all the files in your server that need to be monitored to ensure system intigrity.

    fieldset
      label(for='path') File path
      input(type='text', name='path', placeholder='/var/log/syslog', v-model='path', v-focus-auto)
      span.tip.
        Please consign the #[strong absolute path] of the file to watch.
    fieldset
      label(for='archive') Archive events older than
      input(type='number', name='archive', placeholder='5', v-model='archive')
      | days
    footer
      button.ok(@click='submit', v-if="path.split('/').pop()").
        Save changes to #[i {{path.split('/').pop()}}]
</template>

<script lang="coffee">
app = document.app
module.exports =
  mixins: [ (require 'vue-focus').mixin ]
  init: ->
    @oldPath = decodeURIComponent @$route.params?.path
  data: ->
    console.log @oldPath
    $.extend app.data(),
      watcher: @$parent.currentWatcher
      path: @oldPath
      index: @$parent.index
  computed:
    archive:
      get: ->
        @$parent.currentWatcher.settings.files[@oldPath].archive
      set: (newVal) ->
        @$parent.currentWatcher.settings.files[@oldPath].archive = newVal
  methods:
    watchMe: (e) ->
      @path = e.target.innerText
    submit: (e) ->
      e.preventDefault()
      if @path != @oldPath
        settings = @watcher.settings
        settings.files[@path] =
          policies: @watcher.settings.files[@oldPath].policies
          archive: @archive

        @$parent.$set 'currentWatcher', @watcher
        currentEvents = "currentWatcher.events['#{@path}']"

        temp = @watcher.events[@oldPath]
        @$parent.removeFile @oldPath

        temp.push
          ref: Date.now()
          time: new Date().toISOString()
          content:
            type: "Path changed"
            payload:
              previousPath: @oldPath
              newPath: @path

        @$parent.$set currentEvents, temp


        document.vault.replace 'settings', $.extend(settings, {encrypt: true})

      app.save()
      app.router.go
        name: 'file'
        params:
          watcher: @index
          file: encodeURIComponent @path

</script>

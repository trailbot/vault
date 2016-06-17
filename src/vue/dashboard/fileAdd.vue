<style lang="stylus" scoped>
input[name='path']
  box-sizing: border-box
  width: 100%
</style>

<template lang="jade">
article.form.fileAdd
  header
    h1 Start watching a file
  p {{appName}} can watch an track all the files in your server that need to be monitored to ensure system intigrity.
  p.
    Recommended files to watch are those containing the system and access logs, such as #[code /var/log/syslog] and #[code /var/log/auth.log].
  form
    fieldset
      label(for='path') File path
      input(type='text', name='path', placeholder='/var/log/syslog', v-model='path', lazy)
      span.tip.
        Please consign the #[b absolute path] of the file to watch.
  footer
    button.ok(v-if='path', @click='submit').
      Start watching #[i {{path.split('/').pop()}}]
</template>

<script lang="coffee">
app = document.app
module.exports =
  data: ->
    $.extend app.data(),
      settings: app.settings
      watcher: null
      path: null
  methods:
    run: (route) ->
      watcherId = route.params.watcher || 0
      watcher = app.watchers?[watcherId]
      if watcher
        @data.watcher = watcher
    submit: (e) ->
      e.preventDefault()
</script>

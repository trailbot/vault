<style lang="stylus" scoped>
input[name='path']
  box-sizing: border-box
  width: 100%
</style>

<template lang="jade">
article.form.policyAdd
  form
    header
      h1.
        Add a new policy for #[strong {{fileName}}]
    p {{appName}} can watch an track all the files in your server that need to be monitored to ensure system intigrity.
    p.
      Recommended files to watch are those containing the system and access logs, such as #[code /var/log/syslog] and #[code /var/log/auth.log].
    fieldset
      label(for='path') File path
      input(type='text', name='path', placeholder='/var/log/syslog', v-model='path', lazy)
      span.tip.
        Please consign the #[strong absolute path] of the file to watch.
  footer
    button.ok().
      Start watching #[i {{path.split('/').pop()}}]
</template>

<script lang="coffee">
app = document.app
vault = document.vault
module.exports =
  data: ->
    $.extend app.data(),
      path: @$parent.path
      fileName: @$parent.fileName
</script>

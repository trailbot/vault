<style lang="stylus" scoped>

</style>

<template lang="jade">
article.form(transition='slide')
  header
    h1 Watcher configuration
  form
    p {{appName}} uses a special daemon called "watcher" to monitor your servers, send alerts and apply policies.
    p Have you already installed {{appName}}'s watcher in your server?
  footer
    div.half
      button(v-link="{ path: '/wizard/watcherGuide' }") No, I have not
      button(v-link="{ path: '/wizard/import' }") Yes, I have
</template>

<script lang="coffee">
app = document.app
module.exports =
  data: app.data
  methods:
    run: ->
</script>

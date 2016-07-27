<style lang="stylus" scoped>
hr
  border: none
  border-top: 1px solid #dd
  padding-bottom: 15px

footer
  text-align: center
  a
    display: block
    margin: 0 auto
    padding: 20px 0 0 0
    color: #666
    font-weight: bold
    font-decoration: none
    &:hover
      font-decoration: underline
</style>

<template lang="jade">
article.form(transition='slide')
  header
    h1 Watcher configuration
  form
    p {{appName}} uses a special daemon called "watcher" to monitor your servers, send alerts and enforce smart policies.
    hr
    p
      strong Have you already installed {{appName}}'s watcher in your server?
  footer
    button(v-link="{ path: '/wizard/import' }") Yes, I have
    a(v-link="{ path: '/wizard/watcherGuide' }") No, I have not
</template>

<script lang="coffee">
app = document.app
module.exports =
  data: app.data
  methods:
    run: ->
</script>

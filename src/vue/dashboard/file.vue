<style lang="stylus" scoped>
nav
  background: #f9
  div + header
    border-top: 1px solid #cc
article
  article
    position: absolute
    top: 0
    left: 251px
</style>

<template lang="jade">
article.file
  nav
    header
      button.add(v-link="{ name: 'policyAdd'}") +
      h1 Policies
    ul(v-if='file.policies && file.policies.length > 0')
      li(v-for='policy of file.policies') Policy
    div.empty(v-else).
      No policies have been defined yet.
      #[p #[b #[a.cool(v-link="{ name: 'policyAdd'}") Click here]] to add a policy.]
    header
      h1 Events
    ul(v-if='file.events && file.events.length > 0')
      li(v-for='event of file.events') Event
    div.empty(v-else).
      No events have been received yet.
  router-view
</template>

<script lang="coffee">
app = document.app
vault = document.vault
module.exports =
  data: ->
    $.extend app.data(),
      watcher: @$parent.currentWatcher
  computed:
    path: ->
      decodeURIComponent @$route.params.file
    fileName: ->
      @path.split('/').pop()
    file: ->
      @watcher.settings.files[@path]
</script>

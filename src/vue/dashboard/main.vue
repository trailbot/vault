<style lang="stylus">
</style>

<template lang="jade">
h1 BA BOOM!
router-view
</template>

<script lang="coffee">
module.exports =
  data: document.app.data
  methods:
    run: ->
      console.log 'This is the dashboard!'
</script>

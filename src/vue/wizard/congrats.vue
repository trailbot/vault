<style lang="stylus" scoped>
figure
  margin-top: calc(50vh - 130px)
  text-align: center

  img
    height: 100px

  label
    color: white

.textBody
  padding: 0 50px
  text-align: center
  color: white

  .button
    display: inline-block
    margin-top: 30px
</style>

<template lang="jade">
div.welcome(transition='slide')
  head
    figure
      img(src='/img/rocket.svg')
      label
        h1 Congratulations!
  div.textBody
    p {{appName}} is now completely set up.
    p You can go now to your dashboard and choose which files to monitor and what policies to apply.
    a.button(v-link="{ path: '/dashboard' }") Go to my dashboard
</template>

<script lang="coffee">
app = document.app
module.exports =
  data: app.data
  methods:
    run: ->
      setTimeout document.vault.retrieveEvents, 1000
</script>

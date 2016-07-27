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
    text-transform: uppercase
    font-weight: bold
    padding: 15px 50px
</style>

<template lang="jade">
div.welcome(transition='slide')
  head
    figure
      #img(src='/img/icon.svg')
      label
        h1 Welcome to {{appName}}!
  div.textBody
    p This wizard will guide you through the process of setting up {{appName}}
    a.button(v-link="{ path: '/wizard/generate' }") Start setup
</template>

<script lang="coffee">
app = document.app
module.exports =
  data: app.data
</script>

<style lang="stylus" scoped>
p
  margin-bottom: 0!important
div.or
  text-align: center
  button
    opacity: 1
    &:hover
      background: #642b6e
      color: white
    &:first-child
      padding-right: 35px
      border-radius: 4px 0 0 4px
    &:last-child
      position: relative
      padding-left: 35px
      border-radius: 0 4px 4px 0
      &:before
        content: ''
        display: block
        position: absolute
        top: 0
        bottom: 0
        left: -25px
        width: 50px
      &:after
        content: 'or'
        display: block
        position: absolute
        left: -22px
        top: -1px
        background: white
        border: 1px solid #642b6e
        border-radius: 50%
        padding: 14.5px 14px
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
    div.or
      button.or(@click='copy') Copy to clipboard
      button.or(@click='export') Export to my filesystem
  footer
    button.next(v-if='exported', @click='next') Next
</template>

<script lang="coffee">
app = document.app
module.exports =
  data: () ->
    $.extend app.data(),
      exported: false
      settings:
        app.settings
  methods:
    next: ->
    copy: ->
    export: ->
</script>

<style lang="stylus" scoped>
section.unlock
  background: linear-gradient(45deg, #34495e 0%, #44586d 100%)
  animation: fade-in 1s

  .logo
    text-align: center
    padding: 30px 0

  article
    background: white
    color: #777;
    position: absolute
    margin: 0 auto
    border-radius: 2px
    box-shadow: 0 10px 20px rgba(0, 0, 0, .2)
    overflow: hidden

    &.form
      min-width: 440px
      max-width: 65vw
      top: 150px
      right: 50px
      left: 50px

      header
        padding: 21px 30px 20px 30px
        background: #f6

        h1
          margin: 0
          font-size: 1.2em
          color: #77
          font-weight: regular

      form
        padding: 30px 30px 10px 30px
        max-height: calc(100vh - 250px)
        overflow: auto

        fieldset
          position: relative
          padding: 5px 0
          border: none

          *
            box-sizing: border-box

          label
            display: block
            width: 100%
            margin-bottom: 5px
            color: #666
            font-weight: bold
            font-size: .8em
            text-transform: uppercase

          input
            padding: 10px
            width: 100%
            border: none
            border-bottom: 1px solid #d

            &:focus
              border-color: #9

          &:last-of-type
            padding-bottom: 30px

        p
          margin: 0 0 20px 0
          font-weight: 300
          color: #66

          &.error
            position: block
            color: red

            &:before
              content: 'ERROR:'
              margin-right: 10px
              font-size: .7em
              font-weight: bold

      footer
        display: block
        padding-bottom: 30px
        button
          display: block
          min-height: 50px
          min-width: 200px
          margin: 0 auto
          opacity: 1
          border: none
          border-radius: 30px
          background: #f37e84
          color: white
          text-transform: uppercase
          font-weight: bold
          font-size: .8em
          &:hover
            background: white
            color: #f37e84
            box-shadow: 0 0 5px #f37e84

        div.half
          button
            display: inline
            width: 45%
            border-radius: 30px 0 0 30px
            &:not(:first-child)
              border-radius: 0 30px 30px 0
</style>

<template lang="jade">
section.unlock(transition='fade')
  h1.logo
    img(src='/img/logo_dark.svg')
  article.form
    header
      h1 Unlock your keypar
    form(@keyup.enter='submit')
      p All data collected by {{appName}} is encrypted with a keypar whose passphrase is only known by you.
      p In order to decrypt such data, please introduce your passphrase .
      p.error(v-if='error') {{error}}
      fieldset.pass
        label(for='pass') Passphrase
        input(name='pass', type='password', v-model='pass', v-focus-auto)
    footer
      button.next(v-show='pass', @click='submit') Unlock
</template>

<script lang="coffee">
app = document.app
module.exports =
  mixins: [ (require 'vue-focus').mixin ]
  data: ->
    $.extend app.data(),
      pass: null
      error: null
  methods:
    submit: (e) ->
      if app.privateKey.decrypt @pass
        app.router.go '/dashboard'
        setTimeout document.vault.retrieveEvents, 1000
      else
        @error = 'Wrong passphrase'
</script>

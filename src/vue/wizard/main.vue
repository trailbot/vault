<style lang="stylus">
section.wizard
  background: linear-gradient(45deg, #eb517a 0%, #f9b581 100%)

  article
    background: white
    color: #777;
    position: absolute
    margin: 0 auto
    border: 1px solid #eb517a
    border-radius: 4px
    box-shadow: 0 5px 10px rgba(0, 0, 0, .2)
    overflow: hidden

    &.form
      min-width: 400px
      max-width: 60vw
      top: 50px
      right: 50px
      left: 50px

      header
        padding: 15px 20px 15px 20px
        border-bottom: 1px solid #d
        background: #f0

        h1
          margin: 0
          font-size: .9em
          color: #777
          font-weight: 500

      form
        padding: 30px
        max-height: calc(100vh - 250px)
        overflow: auto

        fieldset
          padding: 5px 0
          border: none

          label
            display: inline-block
            width: 140px
            margin-bottom: 5px
            text-transform: uppercase
            font-size: .8em

          input
            padding: 10px
            border: 1px solid #d
            border-radius: 4px

          &:last-of-type
            padding-bottom: 30px

        p
          margin: 0 0 25px 0
          font-weight: 300
          color: black

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
        background: #f0
        border-top: 1px solid #d
        overflow: auto

        button
          margin: 0
          opacity: 1

          &:hover
            background: #eb517a
            color: white

          &.next
            float: right
            border: none
            border-left: 1px solid #d
            border-radius: 0
</style>

<template lang="jade">
section.wizard
  router-view
</template>

<script lang="coffee">
module.exports =
  data: document.app.data
</script>

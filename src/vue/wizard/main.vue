<style lang="stylus">
section.wizard
  background: linear-gradient(45deg, #eb517a 0%, #f9b581 100%)
  animation: fade-in 1s

  article
    background: white
    color: #777;
    position: absolute
    margin: 0 auto
    border-radius: 2px
    box-shadow: 0 10px 20px rgba(0, 0, 0, .2)
    overflow: hidden

    &.form
      min-width: 400px
      max-width: 60vw
      top: 50px
      right: 50px
      left: 50px

      header
        padding: 21px 30px 20px 30px
        background: #642b6e

        h1
          margin: 0
          font-size: 1.2em
          color: white
          font-weight: regular

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
          margin: 0 0 20px 0
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
        height: 50px
        background: #f0
        border-top: 1px solid #d
        overflow: auto
        button
          min-height: 50px
          margin: 0
          opacity: 1
          border: none
          border-radius: 0
          background: #ee
          text-transform: uppercase
          font-weight: 700
          font-size: .8em
          color: #99
          &:hover
            background: #ff
            color: #642b6e
          &.next
            float: right
            border: none
            border-left: 1px solid #d

        div.half
          button
            width: 50%
            &:not(:first-child)
              border-left: 1px solid #dd
</style>

<template lang="jade">
section.wizard
  router-view
</template>

<script lang="coffee">
module.exports =
  data: document.app.data
</script>

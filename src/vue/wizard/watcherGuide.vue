<style lang="stylus" scoped>
div.or
  text-align: center
  button
    &:first-child
      padding-right: 30px
    &:last-child
      position: relative
      padding-left: 30px
      &:after
        content: 'or'
        display: block
        position: absolute
        left: -21px
        top: 6px
        background: #f7
        border: 1px solid #dd
        border-radius: 50%
        padding: 12px 11px 11px 11px
        text-transform: uppercase
        font-size: .8em
        color: gray
ol
  padding-left: 30px
  li
    margin-bottom: 15px
    padding-left: 10px
    line-height: 1.5em
    code
    pre
      margin-left: 2px
      margin-right: 2px
      padding: 5px
      border-radius: 2px
      background: #55
      color: white
      font-weight: bold
    pre
      position: relative
      top: -5px

</style>

<template lang="jade">
article.form(transition='slide')
  header
    h1 Watcher setup
  form(@keyup.enter='submit')
    p Setting up a watcher is pretty simple:
    ol
      li Log into you server.
      li.
        Become #[strong root] (using #[code sudo su], #[code su] or similar).
      li
        span Clone the repository and install the dependencies:
        pre.
          git clone https://github.com/trailbot/watcher
          cd watcher
          npm install
      li.
        Take the public key that you just exported or copied and paste it into #[code trailbot_client.pub.asc]
      li.
        Run the setup script:
        #[code npm run setup]
      li.
        Export the watcher public key to the clipboard or a local file by running:
        #[code npm run export]
    p Choose an option below:
  footer
    div.half.or
      button.or(@click='paste') Take from clipboard
      button.or(@click='import') Import from filesystem
</template>

<script lang="coffee">
app = document.app
module.exports =
  data: app.data
  methods:
    run: ->
</script>

<style lang="stylus" scoped>
article
  header
    h2
      font-weight: 100
      font-size: 1em
      color: #66
  table
    display: table
    width: 100%
    background: #fefefe
    border-collapse: collapse
    tr
      border-bottom: 1px solid #ee
      td
        padding: 24px 2px 20px 2px
        vertical-align: top
        color: #66
        &.key
          color: #77
          font-size: .9em
          font-weight: bold
          text-transform: uppercase
        &.val
          text-align: right
  h3
    margin-bottom: 10px
    font-size: .9em
    font-weight: 600
    color: #88
    text-transform: uppercase
</style>

<template lang="jade">
article.form.policy(transition="driftFade")
  header
    h1.
      #[strong #[em "{{policy.name}}"]] policy stats
    h2.
      Instance of #[a.cool(@click='openExternal', href='{{policy.uri}}') {{policy.uri}}]
  table(v-if='policy.params')
    tr(v-for='(key, val) of policy.params')
      td.key {{key}}
      td.val {{val}}
</template>

<script lang="coffee">
app = document.app
module.exports =
  data: ->
    app.data()
  computed:
    index: -> decodeURIComponent @$route.params.policy
    events: -> @$parent.events
    policy: -> @$parent.policies[@index]
  methods:
    openExternal: (e) ->
      e.preventDefault()
      url = $(e.target).attr 'href'
      window.electron.shell.openExternal url
</script>

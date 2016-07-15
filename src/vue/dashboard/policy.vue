<style lang="stylus" scoped>
article
  header
    h2
      font-weight: 100
      font-size: 1em
      color: #66
  table
    display: block
    width: 100%
    background: #fefefe
    border-collapse: collapse
    border: 1px solid #cc
    border-radius: 2px
    overflow: hidden
    tr
      width: 100%
      td
        padding: 15px
        vertical-align: top
        color: #66
        &.key
          background: #ee
          border-right: 1px solid #cc
          font-weight: 600
          color: #99
          text-align: right
    tr + tr
      td
        padding-top: 0
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
      Instance of #[strong {{policy.uri}}]
  h3 Parameters
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
</script>

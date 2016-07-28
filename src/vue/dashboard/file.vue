<style lang="stylus" scoped>
nav
  background: #44586d
  color: white
  div + header
    border-top: 1px solid rgba(255, 255, 255, .08)
  ul + header
    border-top: 1px solid rgba(255, 255, 255, .08)
  li
    position: relative
    overflow: hidden
    time
      font-weight: normal
      font-size: .8em
    p.stats
      margin: 5px 0 0 0
      span
        font-weight: bold
        font-size: .8em
        margin-right: 5px
        &.add
          color: #b8e986
        &.rem
          color: #f37e83
    &:after
      content: ''
      display: block
      position: absolute
      top: 50%
      margin-top: -7px
      right: -10px
      width: 0
      height: 0
      border-style: solid
      border-width: 7px 7px 7px 0
      border-color: transparent #ff transparent transparent
      transition: right .2s ease
    &.policy
      span
        color: white
    &.selected
      &:after
        right: 0
article
  article
    position: absolute
    top: 0
    left: 275px
</style>

<template lang="jade">
article.file(transition='driftFade')
  nav
    header
      button.add(v-link="{ name: 'policyAdd'}") +
      h1 Smart Policies
    ul(v-if='policies && policies.length > 0')
      li(v-for='(i, policy) of policies', v-link="{ name: 'policy', params: { policy: i }, activeClass: 'selected' }", @contextmenu='contextMenu', data-name='{{policy.name}}', data-index='{{i}}').policy
        span {{policy.name}}
    div.empty(v-else).
      No policies have been defined yet.
      #[p #[b #[a.cool(v-link="{ name: 'policyAdd'}") Click here]] to add a policy.]
    header
      h1 Events
    ul(v-if='thereAreEvents')
      li(v-for="event in events | orderBy 'time' -1", v-link="{ name: 'event', params: { event: event.ref }, activeClass: 'selected' }")
        time(datetime='event.time') {{event.time | prettyDate}}
        p.stats
          span.add(v-if="event.changes | countByType 'add'") +{{event.changes | countByType 'add'}}
          span.rem(v-if="event.changes | countByType 'rem'") -{{event.changes | countByType 'rem'}}
    div.empty(v-else).
      No events have been received yet.
  router-view
</template>

<script lang="coffee">
app = document.app
module.exports =
  data: ->
    $.extend app.data(),
      watcher: @$parent.currentWatcher
  computed:
    path: ->
      decodeURIComponent @$route.params.file
    fileName: ->
      @path.split('/').pop()
    file: ->
      @watcher.settings.files[@path]
    policies: ->
      @file.policies
    events: ->
      @watcher.events && @watcher.events[@path] || []
    thereAreEvents: ->
      Object.keys(@events).length > 0
  filters:
    prettyDate: (zulu) ->
      d = new Date(zulu || Date.now())
      "#{d.toLocaleDateString()} @ #{d.toLocaleTimeString()}"
    countByType: (changes, type) ->
      return unless changes
      changes.reduce (acc, change, i, a) ->
        if change.type? and change.type is type
          acc + change.lines.length
        else
          acc
      , 0
  methods:
    contextMenu: (e) ->
      name = $(e.target).closest('li').data 'name'
      index = $(e.target).closest('li').data 'index'
      try
        MenuItem = window.electron.MenuItem
        menu = new window.electron.Menu()
        menu.append new MenuItem
          label: "Options for \"#{name}\""
          enabled: false
        menu.append new MenuItem
          type: 'separator'
        menu.append new MenuItem
          label: 'Remove policy'
          accelerator: 's'
          click: =>
            @removePolicy index, name
        menu.popup window.electron.getCurrentWindow()
      catch e
        console.error e
    removePolicy: (index, name) ->
      try
        window.electron.dialog.showMessageBox
          type: 'question'
          message: "Do you want to remove policy \"#{name}\" from file \"#{@path}\"?"
          buttons: ['cancel', 'ok']
        , (res) =>
          return unless res
          @file.policies.splice index, 1
          document.vault.replace 'settings', $.extend(@watcher.settings, {encrypt: true})
          app.save()
          app.router.go
            name: 'file'
      catch e
        console.error e
</script>

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
    background: #44586d
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
    .strike
      text-decoration: line-through
    &:not(.dragging):after
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
    &.policy span
      color: white
    &.selected:after
      right: 0
    &:hover .handle
      opacity: 1
  .handle
    opacity: .3
    cursor: move
    transition: opacity .2s ease





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
      button.add(v-link="{ name: 'policyAdd'}")
        img(src='/img/add.svg')
      h1 Smart Policies
    ul(v-if='policies && policies.length > 0', @dragstart="dragstart_handler" @dragover="dragover_handler" @dragend="dragend_handler")
      li(v-for='(i, policy) of policies', draggable="{{policies.length > 1}}", v-link="{ name: 'policy', params: { policy: i }, activeClass: 'selected' }", @contextmenu='contextMenu', data-name='{{policy.name}}', data-index='{{i}}').policy
        span.fontello.handle(v-if='policies.length > 1', @mousedown='mousedown_handler' @mouseup='mouseup_handler') &#x25FC
        span(v-bind:class="[policy.paused ? 'strike':'']") {{policy.name}}
    div.empty(v-else).
      No policies have been defined yet.
      #[p #[b #[a.cool(v-link="{ name: 'policyAdd'}") Click here]] to add a policy.]
    header
      h1 Events
    ul(v-if='thereAreEvents')
      li(v-for="event in events | orderBy 'ref' -1", v-link="{ name: 'event', params: { event: event.ref }, activeClass: 'selected' }")
        time(datetime='event.time') {{event.time | prettyDate}}
        p.stats(v-if='event.content.type == "change"')
          span.add(v-if="event.content.payload | countByType 'add'") +{{event.content.payload | countByType 'add'}}
          span.rem(v-if="event.content.payload | countByType 'rem'") -{{event.content.payload | countByType 'rem'}}
        p.stats(v-else)
          span.add(v-if='event.content.type == "add"') CREATED
          span.rem(v-if='event.content.type == "unlink"') REMOVED
          span(v-else) {{event.content.type.toUpperCase()}}
    div.empty(v-else).
      No events have been received yet.
  router-view
</template>

<script lang="coffee">

app = document.app
module.exports =
  data: ->
    drag_element: undefined
    handle : undefined
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
    stringify: (o) ->
      JSON.stringify o
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

    #drag policy for priority
    dragstart_handler: (ev) ->
      @drag_element = ev.target
      # ev.target.style.backgroundColor= "#44586d"
      @drag_element.classList.add('dragging')
      ev.dataTransfer.dropEffect = "move"

      unless @handle
        ev.preventDefault()

    dragover_handler: (ev) ->
      ev.dataTransfer.dropEffect = 'move'
      target = ev.target

      if target && target != @drag_element && target.nodeName == 'LI'
        app.router.go
          name: 'policy'
          params:
            policy: target.dataset.index
        # Change the order
        temp = @policies[target.dataset.index]
        @policies[target.dataset.index] = @policies[ @drag_element.dataset.index]
        # here we trigger an array change detection in Vue
        @policies.splice @drag_element.dataset.index, 1, temp


    mousedown_handler: (ev) ->
      @handle = ev.target

    mouseup_handler: (ev) ->
      @handle = undefined

    dragend_handler: (ev) ->
      @drag_element.classList.remove('dragging')
      @handle = undefined
      app.save()

</script>

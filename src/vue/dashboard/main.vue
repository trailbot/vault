<style lang="stylus">
section.dashboard
  > nav
  > article nav
    width: 275px
    position: fixed
    top: 0
    bottom: 0
    overflow: auto
    button.add
      position: absolute
      top: 14px
      right: 16px
      min-width: auto
      min-height: auto
      margin: 0
      border: none
      border-radius: 100%
      font-size: 15px
      font-weight: normal
      padding: 0 4px
      background: none
      color: white
      border: 2px solid white
      opacity: .7
      &:hover
        box-shadow: 0 0 10px white
        transform: rotateZ(90deg)
        opacity: 1
    > div
      position: relative
      &.watchers
        background: #2c3e50
        header
          padding: 30px 20px 25px 20px
          border-bottom: 1px solid #34495e
          h1
            font-weight: 900
          button.menu
            position: absolute
            top: 30px
            right: 20px
            opacity: .7
            transition: all .2s ease
            img
              height: 14px
            &:hover
              opacity: 1
          .tools
            position: absolute
            top: -1px
            right: 55px
            display: block
            height: 100%
            background: #2c3e50
            animation: fade-in .2s
            *
              position: relative
              float: right
              right: 0
              margin-left: 15px
            button.add
              top: 27px
            &:before
              content: ''
              display: block
              position: absolute
              left: -30px
              width: 30px
              height: 100%
              background: linear-gradient(90deg, rgba(44, 62, 80, 0) 0%, rgba(44, 62, 80, 1) 100%)
        ul
          animation: pop-in .2s
          li a
            display: block
            padding: 8px 0 5px 0
            color: white
            font-size: .9em
            font-weight: bold
            text-decoration: none
            text-transform: uppercase
            opacity: .7
    header
      padding: 18px 20px 14px 20px
      h1
        display: inline-block
        margin: 0
        font-size: .9em
        font-weight: 700
        text-transform: uppercase
        color: white
    &.main
      color: white
      left: 0
      background: #34495e
      ul
        li
          overflow: hidden
          &:after
            content: ''
            display: block
            position: absolute
            top: 12px
            right: -10px
            width: 0
            height: 0
            border-style: solid
            border-width: 7px 7px 7px 0
            border-color: transparent #44586d transparent transparent
            transition: right .2s ease
          &.selected
            &:after
              right: 0
          .path
            color: rgba(255, 255, 255, .7)
            strong
              color: white
    ul
      list-style-type: none
      padding: 0
      margin: 0
      li
        position: relative
        padding: 10px 20px
        cursor: pointer
        transition: all .2s ease
    .empty
      display: block
      margin: 0
      padding: 15px 20px
      color: white
      font-style: italic
      opacity: .7
  a.cool
    text-decoration: none
    font-weight: bold
    color: white
  article
    position: fixed
    top: 0
    right: 0
    bottom: 0
    left: 275px
    background: white
    &.form
      padding: 30px
      color: #44
      a.cool
        color: #f37e83
      header
        margin-bottom: 20px
        h1
          margin: 0
          font-size: 2em
          font-weight: 300
          color: #77
      p
        line-height: 1.6em
        code
          position: relative
          top: -1px
          padding: 4px 5px 4px 5px
          background: #555
          color: white
          border-radius: 2px
      form
        padding: 30px
        position: absolute
        top: 0
        left: 0
        right: 0
        bottom: 0
        overflow: auto
        fieldset
          margin-bottom: 10px
          padding: 0
          border: none
          label
          .label-alike
            display: block
            position: relative
            top: 1px
            width: 200px
            margin-right: 30px
            margin-bottom: 5px
            font-size: .9em
            font-weight: 600
            color: #88
            text-transform: uppercase
          input
          select
            display: block
            margin-bottom: 10px
            padding: 10px
            background: white
            border: 0
            border-bottom: 1px solid #cc
            &:focus
              border-color: #9
          .tip
            display: block
            padding: 5px
            font-style: italic
            color: #999
        :last-child
          margin-bottom: 15px
      footer
        text-align: center
</style>

<template lang="jade">
section.dashboard(transition='fade')
  nav.main
    div.watchers
      header
        button.plain.menu(@click='open')
          img(src="/img/menu.svg")
        div.tools(v-if='isOpen')
          button.add(v-link="{ path : '/wizard/import' }") +
        h1 {{currentWatcher.name}}
      ul(v-if='isOpen')
        li(v-for='(index, watcher) of watchers', v-if="watcher | other")
          a(v-link="{ name: 'watcher', params: { watcher: index }}") {{watcher.name}}
    div.files
      header
        button.add(v-link="{ path: '/dashboard/' + index + '/fileAdd' }") +
        h1 Watched files
    ul(v-if="hasFiles")
      li(v-for="(path, file) of currentWatcher.settings.files", v-link="{ name: 'file', params: { watcher: index, file: encodeURIComponent(path) }, activeClass: 'selected'}", @contextmenu='contextMenu', data-path='{{path}}')
        span.path
          {{{path | decoratePath}}}
    div.empty(v-else).
      No files are being watched.
      #[p #[b #[a.cool(v-link="{ path: '/dashboard/' + index + '/fileAdd' }") Click here]] to start watching a file.]
  router-view
</template>

<script lang="coffee">
app = document.app
module.exports =
  data: ->
    $.extend app.data(),
      settings: app.settings
      watchers: app.settings.watchers
      isOpen: false
  computed:
    index: ->
      @$route.params?.watcher || 0
    fingerprint: ->
      app.settings.watchers[@index].fingerprint
    currentWatcher: ->
      app.settings.watchers[@index]
    hasFiles: ->
      Object.keys(@currentWatcher.settings.files).length > 0
  filters:
    other: (watcher) ->
      watcher.fingerprint isnt @currentWatcher.fingerprint
    decoratePath: (path) ->
      chunked = path.split('/')
      filename = chunked.slice(-1)
      path = chunked.slice(0, -1).join('/')
      room = 14 - filename.length
      if path.length > room
        path = path.slice(0, room)
        path += "<small>...</small>"
      "#{path}/<strong>#{filename}</strong>"
  methods:
    open: ->
      @isOpen = !@isOpen
    contextMenu: (e) ->
      path = $(e.target).closest('li').data 'path'
      try
        MenuItem = window.electron.MenuItem
        menu = new window.electron.Menu()
        menu.append new MenuItem
          label: "Options for #{path}"
          enabled: false
        menu.append new MenuItem
          type: 'separator'
        menu.append new MenuItem
          label: 'Add a policy'
          accelerator: 'p'
          click: =>
            app.router.go
              name: 'policyAdd'
              params:
                watcher: @index
                file: encodeURIComponent path
        menu.append new MenuItem
          label: 'Stop watching'
          accelerator: 's'
          click: =>
            @stopWatching path
        menu.popup window.electron.getCurrentWindow()
      catch e
        console.error e
    stopWatching: (path) ->
      try
        window.electron.dialog.showMessageBox
          type: 'question'
          message: "Do you want to stop watching '#{path}' and completely remove all trace of it from #{@appName}?"
          buttons: ['cancel', 'ok']
        , (res) =>
          return unless res
          files = $.extend {}, @currentWatcher.settings.files
          events = $.extend {}, @currentWatcher.events
          delete files[path]
          delete events[path]
          @$set 'currentWatcher.settings.files', files
          @$set 'currentWatcher.events', events
          document.vault.replace 'settings', $.extend(@currentWatcher.settings, {encrypt: true})
          app.save()
          app.router.go '/dashboard'
      catch e
        console.error e
</script>

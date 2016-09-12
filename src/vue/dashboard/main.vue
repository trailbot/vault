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
      top: 23px
      right: 16px
      min-width: auto
      min-height: auto
      margin: 0
      border: none
      padding: 0 4px
      background: none
      opacity: .7
      &:hover
        box-shadow: none
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
            padding-left: 15px
            transition: all .2s ease
            background: #2c3e50
            img
              opacity: .7
              height: 14px
            &:hover
              img
                opacity: 1
            &:before
              content: ''
              display: block
              position: absolute
              left: -28px
              width: 30px
              height: 100%
              background: linear-gradient(90deg, rgba(44, 62, 80, 0) 0%, rgba(44, 62, 80, 1) 100%)
          .tools
            position: absolute
            top: -1px
            right: 50px
            display: block
            height: 75px
            background: #2c3e50
            animation: fade-in .2s
            *
              position: relative
              float: right
              right: 0
              margin-left: 15px
            &:before
              content: ''
              display: block
              position: absolute
              left: -30px
              width: 30px
              height: 100%
              background: linear-gradient(90deg, rgba(44, 62, 80, 0) 0%, rgba(44, 62, 80, 1) 100%)
            button.add
              top: 31px
        ul
          margin: 0
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
      padding: 23px 20px 19px 20px
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
        margin: 0
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
            border-left: 3px solid white
            padding-left: 17px
            &:after
              right: 0
          .path
            color: rgba(255, 255, 255, .7)
            strong
              color: white
    ul
      list-style-type: none
      padding: 0
      margin: 0 0 20px 0
      li
        position: relative
        padding: 10px 20px
        cursor: pointer
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
    z-index: 1
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
.logoWatermark
  position: fixed
  top: 0
  right: 30px
  width: 70vh
  opacity: .3
  transform: rotateZ(-90deg)
  transform-origin: 100% 100% 0
</style>

<template lang="jade">
section.dashboard(transition='fade')
  nav.main
    div.watchers
      header
        button.plain.menu(@click='open')
          img(src="/img/menu.svg")
        div.tools(v-if='isOpen')
          button.add(v-link="{ path : '/wizard/import' }")
            img(src='/img/add.svg')
        h1(@contextmenu='watcherContextMenu', data-index='{{index}}')
          span(v-if='currentWatcher') {{currentWatcher.name}}
      ul(v-if='isOpen')
        li(v-for='(i, watcher) of watchers', v-if="watcher | other", @contextmenu='watcherContextMenu', data-index='{{i}}')
          a(v-link="{ name: 'watcher', params: { watcher: i }}") {{watcher.name}}
    div.files(v-if='currentWatcher')
      header
        button.add(v-link="{ name:'fileAdd', params: {watcher: index} }")
          img(src='/img/add.svg')
        h1 Watched files
      ul(v-if="hasFiles")
        li(v-for="(path, file) of currentWatcher.settings.files", v-link="{ name: 'file', params: { watcher: index, file: encodeURIComponent(path) }, activeClass: 'selected'}", @contextmenu='fileContextMenu', data-path='{{path}}')
          span.path
            {{{path | decoratePath}}}
      div.empty(v-else).
        No files are being watched.
        #[p #[b #[a.cool(v-link="{ name:'fileAdd', params: {watcher: index} }") Click here]] to start watching a file.]
  router-view
  img.logoWatermark(src='/img/logo.svg')
</template>

<script lang="coffee">
app = document.app
module.exports =
  data: ->
    $.extend app.data(),
      settings: app.settings
      isOpen: false
  computed:
    watchers: ->
      app.settings.watchers
    index: ->
      @$route.params?.watcher || 0
    fingerprint: ->
      app.settings.watchers?[@index]?.fingerprint
    currentWatcher: ->
      app.settings.watchers?[@index]
    hasFiles: ->
      @watchers.length > 0 && Object.keys(@currentWatcher.settings.files).length > 0
  filters:
    other: (watcher) ->
      watcher? and watcher.fingerprint isnt @currentWatcher.fingerprint
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
    fileContextMenu: (e) ->
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
    watcherContextMenu: (e) ->
      try
        index = $(e.target).closest('[data-index]').data 'index'
        watcher = @watchers[index]
        MenuItem = window.electron.MenuItem
        menu = new window.electron.Menu()
        menu.append new MenuItem
          label: "Options for #{watcher.name}"
          enabled: false
        menu.append new MenuItem
          type: 'separator'
        menu.append new MenuItem
          label: 'Start watching a file'
          accelerator: 'f'
          click: =>
            app.router.go
              name: 'fileAdd'
              params:
                watcher: index
        menu.append new MenuItem
          label: 'Unlink this watcher'
          accelerator: 's'
          click: =>
            @watcherUnlink index
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
          app.router.go
            name: 'dashboard'
      catch e
        console.error e
    watcherUnlink: (index) ->
      name = @watchers[index].name
      window.electron.dialog.showMessageBox
          type: 'question'
          message: "Do you want to unlink watcher '#{name}' and completely remove all trace of it from #{@appName}?"
          buttons: ['cancel', 'ok']
        , (res) =>
          if res
            @watchers.splice index, 1
            app.save()
            app.router.go
              name: 'dashboard'
              watcher: 0
</script>

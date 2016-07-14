<style lang="stylus">
section.dashboard
  > header
    display: block
    border-bottom: 1px solid #cc
    height: 60px
    background: white
    overflow: hidden
    h1
      float: right
      margin: 16px 15px 0 0
      img
        height: 30px
    nav
      padding-left: 15px
      .tab
        position: relative
        bottom: -14px
        float: left
        padding: 12px 20px 15px 20px
        border: 1px solid #cc
        border-bottom: none
        font-weight: 700
        color: #66
        text-decoration: none
        transition: all .2s ease
        &:not(:first-child)
          border-left: none
        &:first-child
          border-radius: 4px 0 0 0
        &:last-child
          border-radius: 0 4px 0 0
        &:hover
          background: #fa
          color: #642b6e
          cursor: pointer
        &.selected
          background: linear-gradient(135deg, #d22e69 0%, #642b6e 100%)
          color: white
        &.add
          font-size: 1.5em
          padding-top: 7px
          &:hover
            background: #aadd88
            color: white
  > nav
  > article nav
    width: 250px
    position: fixed
    top: 61px
    bottom: 0
    border-right: 1px solid #cc
    overflow: auto
    header
      padding: 15px 20px
      background: white
      border-bottom: 1px solid #cc
      h1
        display: inline-block
        margin: 0
        font-size: .9em
        font-weight: 700
        text-transform: uppercase
        color: #642b6e
      button
        position: absolute
        top: 6px
        right: 5px
        margin: 0
        border: none
        border-radius: 100%
        font-size: 15px
        font-weight: 700
        padding: 10px 15px
    &.files
      left: 0
      background: #f2
      ul
        li
          overflow: hidden
          &:after
            content: ''
            display: block
            position: absolute
            top: 23px
            right: -10px
            width: 0
            height: 0
            border-style: solid
            border-width: 7px 7px 7px 0
            border-color: transparent #cc transparent transparent
            transition: right .2s ease
          &.selected
            background: #f9
            &:after
              right: 0
          .path
            color: #99
            strong
              color: #642b6e
    ul
      list-style-type: none
      padding: 0
      margin: 0
      li
        position: relative
        padding: 20px
        border-bottom: 1px solid #cc
        cursor: pointer
        transition: all .2s ease
    &:after
      content: ''
      display: block
      background: linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 200%)
      position: absolute
      top: 0
      right: 0
      bottom: 0
      width: 30px
      opacity: .08
      pointer-events: none
    .empty
      display: block
      margin: 0
      padding: 15px 20px
      color: #99
      font-style: italic
  a.cool
    text-decoration: none
    color: #642b6e
  article
    position: fixed
    top: 61px
    right: 0
    bottom: 0
    left: 251px
    background: white
    &.form
      padding: 30px
      color: #44
      header
        margin-bottom: 20px
        h1
          margin: 0
          font-size: 2em
          font-weight: 300
          color: #642b6e
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
        bottom: 50px
        overflow: auto
        fieldset
          padding: 0
          border: none
          label
          .label-alike
            display: block
            position: relative
            top: 1px
            width: 200px
            margin-right: 30px
            margin-bottom: 10px
            font-size: .9em
            font-weight: 600
            color: #88
            text-transform: uppercase
          input
          select
            padding: 10px
            background: white
            border: 1px solid #cc
            border-radius: 4px
            &:focus
              border-color: #642b6e
          .tip
            display: block
            padding: 5px
            font-style: italic
            color: #999
        :last-child
          margin-bottom: 15px
      footer
        position: absolute
        bottom: 0
        right: 0
        left: 0
        height: 50px
        background: #f9
        border-top: 1px solid #cc
        button
          margin: 0
          padding: 0 30px
          height: 100%
          border: none
          border-radius: 0
          font-weight: 600
          font-size: .8em
          text-transform: uppercase
          &.ok
            float: right
            border-left: 1px solid #cc
</style>

<template lang="jade">
section.dashboard(transition='fade')
  header
    h1
      img(src='/img/logo.svg', alt='{{appName}}')
    nav
      a.tab(v-for='(index, watcher) in watchers', v-link="{ name: 'watcher', params: { watcher: index }}", v-bind:class="{ 'selected': index == ($route.params.watcher || 0) }") {{watcher.name}}
      a.tab.add(v-link="{ path : '/wizard/import' }") +
  nav.files
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
          document.vault.replace 'settings', @currentWatcher.settings
          app.save()
          app.router.go '/dashboard'
      catch e
        console.error e
</script>

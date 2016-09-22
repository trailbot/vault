<style lang="stylus" scoped>
input
select
  box-sizing: border-box
  width: 100%
  &[type=checkbox]
    width: auto
    margin-top: 15px

fieldset.git
  position: relative
  &:after
    display: block
    position: absolute
    top: 28px
    right: 10px
    padding: 3px 5px 1px 5px
    border-radius: 100%
    color: white
    font-size: .8em
    opacity: .7
  &[data-valid]:after
    content: '✔'
    background: #5aa02c
  &:not([data-valid]):after
    content: '✖'
    background: #d40000
</style>

<template lang="jade">
article.form.policyAdd(transition='driftFade')
  form(@keyup.enter='submit')
    header
      h1.
        Edit #[strong {{name}}] policy for #[strong {{fileName}}]
    fieldset(data-valid='{{branches}}').git
      label(for='gitURL') Git HTTPS URL
      input(type='url', name='gitURL', v-model='gitURL', @keyup='getBranches', disabled='{{branches}}')
      span.tip(v-if='!branches').
        Please consign the #[strong HTTPS URL] for the git repository of the policy package to be added.
    fieldset(v-if='branches')
      label(for='gitBranch') Git Branch
      select(name='gitBranch', v-model='gitBranch', @change='pullBranch', @blur='pullBranch')
        option(v-for='branch of branches', value='{{branch}}') {{branch.split('/').pop()}}
    fieldset(v-if='fields', v-for='(key, field) of fields')
      label(v-if='field.label', for='{{key}}') {{field.label}}
      select(v-if='field.type == "select"', v-model='params[key]', v-bind:required='field.required')
        option(v-for='(val, label) of field.options', value='{{val}}') {{label}}
      input(v-else, name='{{key}}', type='{{field.type}}', v-model='params[key]', v-bind:required='field.required')
      p.tip(v-if='field.tip') {{field.tip}}
    fieldset(v-if='valid')
      label(for='name') Policy name
      input(name='name', v-model='name', placeholder='e.g.: Mail me when syslog is modified')
    footer
      button.ok(v-if='valid && name', @click='submit').
        Save policy #[i {{name}}]
</template>

<script lang="coffee">
app = document.app

module.exports =
  mixins: [ (require 'vue-focus').mixin ]
  data: ->
    @index = @$route.params?.index
    $.extend app.data(),
      fileName: @$parent.fileName
      git: null
      branches: null
      gitBranch: 'remotes/origin/master'
      fields: null
      path: null
      manifest: null
      valid: false
      name : @$parent.policies[@index].name
      gitURL : @$parent.policies[@index].uri
      paused : @$parent.policies[@index].paused || false
  computed:
    params: ->
      @$parent.policies[@index].params || {}
  methods:
    openExternal: (e) ->
      e.preventDefault()
      url = $(e.target).attr 'href'
      window.electron.shell.openExternal url
    getBranches: (e) ->
      return unless @gitURL.match new RegExp /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/
      @path = "/tmp/git_#{@gitURL.split('/').pop().replace('.', '_')}"
      window.mkdir @path
      @git = window.git(@path).init()
      @git.getRemotes 'origin', (err, remotes) =>
        for remote in remotes
          @git.removeRemote(remote.name) if remote.name.length > 0
        @git
          .addRemote('origin', @gitURL)
          .fetch()
          .branch (err, {branches}) =>
            console.log JSON.stringify branches
            @branches = Object.keys(branches).filter (branch) -> branch isnt '(HEAD'
            @pullBranch()
    pullBranch: () ->
      console.log "PULLING #{@gitBranch}"
      @git
        .checkout @gitBranch, () =>
          @manifest = JSON.parse window.fs.readFileSync "#{@path}/package.json"
          if @manifest.policy
            if @manifest.policy.params
              @fields = @manifest.policy.params
            @valid = true
            for key, field of @fields when field.default?
              @params[key] = field.default unless @params[key]
          else
            alert "This repository does not look like a Trailbot Smart Policy :("
    submit: (e) ->
      e.preventDefault()

      # Send test request for URL fields
      for key, field of @fields when field.type is 'url' and field.test
        console.log "Testing #{@params[key]}"
        window.request
          method: field.test
          body: app.fooEvent
          json: true
          url: @params[key]

      policy =
        name: @name
        uri: @gitURL
        ref: @gitBranch.split('/').pop()
        lang: @manifest.policy.language
        params: @params
        paused: @paused

      @$parent.$set "policies[#{@index}]", policy
      document.vault.replace 'settings', $.extend(@$parent.watcher.settings, {encrypt: true})
      app.save()
      app.router.go
        name: 'policy'
        params:
          policy: @index
  ready: ->
    @getBranches()
</script>

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
        Add a new policy for #[strong {{fileName}}]
    p Policies are scripts that receive every change happening to watched files and trigger different actions.
    p Policies are Node.js packages downloaded from public git repositories.
    p.
      You can find some #[a(@click='openExternal', href='https://github.com/trailbot').cool ready-to-use policies] in our GitHub account or #[a(@click='openExternal', href='https://github.com/stampery/watcher/wiki/Smart-Policies').cool learn how to write your own policies].
    fieldset(data-valid='{{branches}}').git
      label(for='gitURL') Git HTTPS URL
      input(type='text', name='gitURL', v-model='gitURL', @keyup='getBranches', disabled='{{branches}}')
      span.tip(v-if='!branches').
        Please consign the #[strong HTTPS URL] for the git repository of the policy package to be added.
    fieldset(v-if='branches')
      label(for='gitBranch') Git Branch
      select(name='gitBranch', v-model='gitBranch', @change='pullBranch')
        option(v-for='branch of branches', value='{{branch}}') {{branch.split('/').pop()}}
    fieldset(v-if='fields', v-for='(key, field) of fields')
      label(v-if='field.label', for='{{key}}') {{field.label}}
      select(v-if='field.type == "select"', v-model='params[key]', v-bind:required='field.required')
        option(v-for='(val, option) of field.options', value='{{val}}') {{option.label}}
      input(v-else, name='{{key}}', type='{{field.type}}', v-model='params[key]', v-bind:required='field.required')
      p.tip(v-if='field.tip') {{field.tip}}
    fieldset(v-if='valid')
      label(for='name') Policy name
      input(name='name', v-model='name', placeholder='e.g.: Mail me when syslog is modified')
    footer
      button.ok(v-if='valid && name', @click='submit').
        Add policy #[i {{name}}]
</template>

<script lang="coffee">
app = document.app
module.exports =
  mixins: [ (require 'vue-focus').mixin ]
  data: ->
    $.extend app.data(),
      fileName: @$parent.fileName
      name: null
      git: null
      branches: null
      gitURL: null
      gitBranch: null
      fields: null
      params: {}
      path: null
      manifest: null
      valid: null
  methods:
    openExternal: (e) ->
      e.preventDefault()
      url = $(e.target).attr 'href'
      window.electron.shell.openExternal url
    getBranches: (e) ->
      if @valid
        alert 'Ready to submit'
      else
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
    pullBranch: (e) ->
      console.log "PULLING #{@gitBranch}"
      @git
        .checkout @gitBranch, () =>
          @manifest = JSON.parse window.fs.readFileSync "#{@path}/package.json"
          if @manifest.policy
            if @manifest.policy.params
              @fields = @manifest.policy.params
            @valid = true
            @name = @manifest.policy.defaultName
            for key, field of @fields when field.default?
              @params[key] = field.default
          else
            # TODO error
    submit: (e) ->
      e.preventDefault()
      console.log JSON.stringify @params
      @$parent.file.policies.push
        name: @name
        uri: @gitURL
        ref: @gitBranch.split('/').pop()
        lang: @manifest.policy.language
        params: @params
      document.vault.replace 'settings', $.extend(@$parent.watcher.settings, {encrypt: true})
      app.save()
      app.router.go
        name: 'policy'
        params:
          policy: @$parent.file.policies.length - 1
</script>

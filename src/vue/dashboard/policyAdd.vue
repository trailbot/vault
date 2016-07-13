<style lang="stylus" scoped>
input
select
  box-sizing: border-box
  width: 100%
</style>

<template lang="jade">
article.form.policyAdd(transition='driftFade')
  form
    header
      h1.
        Add a new policy for #[strong {{fileName}}]
    p Policies are scripts that receive every change happening to watched files and trigger different actions.
    p Policies are Node.js packages and are downloaded from public git repositories.
    p.
      #[a(@click='openExternal', href='https://github.com/stampery/watcher/wiki/Policies').cool Click here] to learn how to write your own policies.
    fieldset
      label(for='name') Policy name
      input(name='name', v-model='name', placeholder='e.g.: Mail me when syslog is modified')
    fieldset
      label(for='gitURL') Git HTTPS URL
      input(type='text', name='gitURL', v-model='gitURL', @blur='getBranches', disabled='{{branches}}', lazy)
      span.tip.
        Please consign the #[strong HTTPS URL] for the git repository of the policy package to be added.
    fieldset(v-if='branches')
      label(for='gitBranch') Git Branch
      select(name='gitBranch', v-model='gitBranch', @change='pullBranch')
        option(v-for='branch of branches', value='{{branch}}') {{branch.split('/').pop()}}
    fieldset(v-if='fields', v-for='(key, field) of fields')
      label(if='{{field.label}}', for='{{key}}') {{field.label}}
      input(name='{{key}}', type='{{field.type}}', v-model='params[key]', v-bind:required='field.required')
  footer
    button.ok(v-if='valid && name', @click='submit').
      Add policy #[i {{policyName}}]
</template>

<script lang="coffee">
app = document.app
module.exports =
  data: ->
    $.extend app.data(),
      fileName: @$parent.fileName
      policyName: null
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
          else
            # TODO error
    submit: (e) ->
      console.log JSON.stringify @params
      @$parent.file.policies.push
        name: @name
        uri: @gitURL
        ref: @gitBranch.split('/').pop()
        lang: @manifest.policy.language
        params: @params
      document.vault.replace 'settings', @$parent.watcher.settings
      app.save()
</script>

<style lang="stylus" scoped>
article
  padding: 0!important
  overflow: auto
  table.diff
    display: block
    width: 100%
    background: white
    border-collapse: collapse
    overflow: hidden
    tr
      position: relative
      td
        &.index
          padding: 0 8px
          background: #f2
          border-right: 1px solid #cc
          font-size: .7em
          text-align: center
          color: #99
        &.type span
          display: block
          width: 20px
          text-align: center
        &.text
          width: 100%
          padding-right: 15px
        &.ellipsis
          padding-right: 15px
          text-align: center
          font-size: .7em
          color: #99
          span
            display: block
            width: 100%
            padding: 10px 0
      &.add td
        background: #e3f4d7
        color: #5aa02c
        font-weight:700
      &.rem td
        background: #f5dad7
        color: #d40000
        font-weight: 700
  hr.eof
    margin: 0
    border: none
    &:after
      content: 'EOF'
      display: block
      padding: 10px 0 10px 70px
      background: #f2
      text-align: center
      font-size: .7em
      color: #99
      border-top: 1px solid #cc
      border-bottom: 1px solid #cc
</style>

<template lang="jade">
article.form.event(transition="driftFade")
  //pre {{event | stringify null '  '}}
  //pre {{event | flatten | stringify null '  '}}
  table.diff
    tbody
      tr(v-for="line in event | flatten", v-bind:class="line.type")
        td.index {{line.indexA}}
        td.index {{line.indexB}}
        td.type
          span(v-if="line.type == 'add'") +
          span(v-if="line.type == 'rem'") -
        td.text(v-if="line.type != 'ellipsis'")
          code {{line.text}}
        td.ellipsis(v-else)
          span {{line.size}} omitted lines
  hr.eof
</template>

<script lang="coffee">
app = document.app
module.exports =
  data: ->
    $.extend app.data(),
      events: @$parent.events
  computed:
    ref: ->
      parseInt @$route.params.event
    event: ->
      @events.find (e) =>
        e.ref is @ref
  filters:
    stringify: JSON.stringify
    flatten: (event) ->
      offsetA = 0
      offsetB = 0
      event.changes.reduce (acc, e, i, a) =>
        if e.lines
          if e.type is 'add'
            offsetA++
          if e.type is 'rem'
            offsetB++
          acc = acc.concat e.lines.map (text, i) =>
            indexA: if e.type isnt 'add' then e.start - offsetA + i
            indexB: if e.type isnt 'rem' then e.start - offsetB + i
            type: e.type
            text: text
        else
          acc.push
            type: 'ellipsis'
            size: e.size
        acc
      , []
  methods:
    run: ->
      setTimeout ->
        article = $('article.event')[0]
        tr = $(article).find('tr.add, tr.rem')[0]
        if article && tr
          article.scrollTop = tr.offsetTop - (article.clientHeight / 2) + 80
    guessChangeType: (change) ->
      if change.added?
        'add'
      else if change.removed?
        'rem'
      else
        null
</script>

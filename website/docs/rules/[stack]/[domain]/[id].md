---
layout: doc
---

<script setup>
import { useData } from 'vitepress'

const { frontmatter } = useData()
const rule = frontmatter.rule
</script>

<RuleStatusBanner v-if="rule" :rule="rule" />
<RuleHeader v-if="rule" :rule="rule" />

<!--@content-->

<RuleResources v-if="rule?.resources" v-bind="rule.resources" />
<RuleVersion v-if="rule" :since="rule.since" />
<RulePageFooter v-if="rule?.resources" :edit-url="rule.resources.suggestChange" />

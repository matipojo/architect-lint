---
layout: doc
---

<script setup lang="ts">
import { computed } from 'vue'
import { useData } from 'vitepress'
import type { RulePageMeta } from '../.vitepress/rule-data'

const { page } = useData()
const rule = computed(() => page.value.frontmatter.rule as (RulePageMeta | undefined))
</script>

<RuleStatusBanner v-if="rule" :rule="rule" />
<RuleHeader v-if="rule" :rule="rule" />
<WhyItMatters v-if="rule?.why_it_matters" :content="rule.why_it_matters" :items="rule.why" />

<RuleContentStart />

<!--@content-->

<RuleRelated v-if="rule?.related?.length" :related="rule.related" />
<RuleMeta v-if="rule?.resources" :resources="rule.resources" />

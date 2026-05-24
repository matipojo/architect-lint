import {
  buildRuleContentMarkdown,
  findRuleJsonFiles,
  loadRule,
  RULES_ROOT,
} from '../../../.vitepress/rule-data.ts';

export default {
  watch: [`${RULES_ROOT}/**/*.json`],
  paths() {
    return findRuleJsonFiles(RULES_ROOT).map((filePath) => {
      const rule = loadRule(filePath);
      return {
        params: {
          stack: rule.stack,
          domain: rule.domain,
          id: rule.id,
        },
        content: buildRuleContentMarkdown(rule),
      };
    });
  },
};

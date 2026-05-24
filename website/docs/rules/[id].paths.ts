import {
  buildRuleContentMarkdown,
  findRuleJsonFiles,
  loadRule,
  RULES_ROOT,
} from '../.vitepress/rule-data.ts';

const pathsWatch = [`${RULES_ROOT}/**/*.json`, '../.vitepress/rule-data.ts'];

export default {
  watch: pathsWatch,
  paths() {
    return findRuleJsonFiles(RULES_ROOT).map((filePath) => {
      const rule = loadRule(filePath);
      return {
        params: {
          id: rule.id,
        },
        content: buildRuleContentMarkdown(rule),
      };
    });
  },
};

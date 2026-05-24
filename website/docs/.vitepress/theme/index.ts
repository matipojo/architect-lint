import DefaultTheme from 'vitepress/theme';
import { applyTheme, getStoredTheme } from './theme';
import Layout from './Layout.vue';
import RuleHeader from './components/RuleHeader.vue';
import RuleStatusBanner from './components/RuleStatusBanner.vue';
import RuleResources from './components/RuleResources.vue';
import RuleVersion from './components/RuleVersion.vue';
import RulePageFooter from './components/RulePageFooter.vue';
import IssueList from './components/IssueList.vue';
import TerminalDemo from './components/TerminalDemo.vue';
import FeaturesSection from './components/FeaturesSection.vue';
import RulesOverview from './components/RulesOverview.vue';
import './custom.css';

export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app }) {
    app.component('RuleHeader', RuleHeader);
    app.component('RuleStatusBanner', RuleStatusBanner);
    app.component('RuleResources', RuleResources);
    app.component('RuleVersion', RuleVersion);
    app.component('RulePageFooter', RulePageFooter);
    app.component('IssueList', IssueList);
    app.component('TerminalDemo', TerminalDemo);
    app.component('FeaturesSection', FeaturesSection);
    app.component('RulesOverview', RulesOverview);

    if (typeof window !== 'undefined') {
      applyTheme(getStoredTheme());
    }
  },
};

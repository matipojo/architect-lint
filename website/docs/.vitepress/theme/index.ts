import DefaultTheme from 'vitepress/theme';
import Layout from './Layout.vue';
import RuleHeader from './components/RuleHeader.vue';
import RuleStatusBanner from './components/RuleStatusBanner.vue';
import RuleVersion from './components/RuleVersion.vue';
import WhyItMatters from './components/WhyItMatters.vue';
import RuleRelated from './components/RuleRelated.vue';
import TerminalDemo from './components/TerminalDemo.vue';
import FeaturesSection from './components/FeaturesSection.vue';
import RulesOverview from './components/RulesOverview.vue';
import RuleMeta from './components/RuleMeta.vue';
import RuleContentStart from './components/RuleContentStart.vue';
import HomeBelow from './components/HomeBelow.vue';
import './custom.css';

export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app }) {
    app.component('RuleHeader', RuleHeader);
    app.component('RuleStatusBanner', RuleStatusBanner);
    app.component('RuleVersion', RuleVersion);
    app.component('RuleRelated', RuleRelated);
    app.component('RuleMeta', RuleMeta);
    app.component('RuleContentStart', RuleContentStart);
    app.component('WhyItMatters', WhyItMatters);
    app.component('TerminalDemo', TerminalDemo);
    app.component('FeaturesSection', FeaturesSection);
    app.component('RulesOverview', RulesOverview);
    app.component('HomeBelow', HomeBelow);
  },
};

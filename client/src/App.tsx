import { Switch, Route, Router } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import AppLayout from "@/components/layout/app-layout";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import Integrations from "@/pages/integrations";
import NotFound from "@/pages/not-found";

// Value Tool Dashboards
import RecoveryDashboard from "@/pages/recovery/index";
import PreventionDashboard from "@/pages/prevention/index";
import VisibilityDashboard from "@/pages/visibility/index";
import FinancingDashboard from "@/pages/financing/index";
import IntelligenceDashboard from "@/pages/intelligence/index";

// Recovery sub-pages
import FourWayMatch from "@/pages/recovery/four-way-match";
import SettlementAudit from "@/pages/recovery/settlement-audit";
import ClaimRecovery from "@/pages/recovery/claim-recovery";
import UnappliedCash from "@/pages/recovery/unapplied-cash";

// Prevention sub-pages
import ExpectedCreditEngine from "@/pages/prevention/expected-credit-engine";
import ClaimStudio from "@/pages/prevention/claim-studio";
import Accruals from "@/pages/prevention/accruals";
import PricingAudit from "@/pages/prevention/pricing-audit";

// Visibility sub-pages
import CashFlowForecast from "@/pages/visibility/cash-flow-forecast";
import MarginAttribution from "@/pages/visibility/margin-attribution";
import SettlementPipeline from "@/pages/visibility/settlement-pipeline";

// Financing sub-pages
import RecoveryAdvancePage from "@/pages/financing/recovery-advance";
import PaymentTermExtension from "@/pages/payment-term-extension";
import ApBnpl from "@/pages/financing/ap-bnpl";

// Intelligence sub-pages
import RebateKnowledgeGraph from "@/pages/intelligence/rebate-knowledge-graph";
import Benchmarks from "@/pages/intelligence/benchmarks";
import ContractLibrary from "@/pages/intelligence/contract-library";

// 4-Way Invoice Match demo
import ApInbox from "@/pages/ap-inbox";
import MatchWorkspace from "@/pages/matching-engine/workspace";
import VarianceEvidence from "@/pages/matching-engine/variance";
import RecoveryQueue from "@/pages/recovery/queue";

// Cross-cutting admin pages
import AgreementsPage from "@/pages/agreements";
import MasterDataPage from "@/pages/master-data";
import TransactionsPage from "@/pages/transactions";
import SupplierPortfolio from "@/pages/supplier-portfolio";
import AcmeDetail from "@/pages/supplier-portfolio/acme";

function AppRouter() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route>
        <AppLayout>
          <Switch>
            <Route path="/dashboard" component={Dashboard} />
            <Route path="/integrations" component={Integrations} />

            {/* Value Tool Dashboards */}
            <Route path="/recovery" component={RecoveryDashboard} />
            <Route path="/prevention" component={PreventionDashboard} />
            <Route path="/visibility" component={VisibilityDashboard} />
            <Route path="/financing" component={FinancingDashboard} />
            <Route path="/intelligence" component={IntelligenceDashboard} />

            {/* 4-Way Invoice Match demo */}
            <Route path="/ap-inbox" component={ApInbox} />
            <Route path="/matching-engine/:invoiceId/variance/:lineId" component={VarianceEvidence} />
            <Route path="/matching-engine/:invoiceId" component={MatchWorkspace} />
            <Route path="/recovery/queue" component={RecoveryQueue} />

            {/* Recovery sub-pages */}
            <Route path="/recovery/4-way-match" component={FourWayMatch} />
            <Route path="/recovery/settlement-audit" component={SettlementAudit} />
            <Route path="/recovery/claim-recovery" component={ClaimRecovery} />
            <Route path="/recovery/unapplied-cash" component={UnappliedCash} />

            {/* Prevention sub-pages */}
            <Route path="/prevention/expected-credit-engine" component={ExpectedCreditEngine} />
            <Route path="/prevention/claim-studio" component={ClaimStudio} />
            <Route path="/prevention/accruals" component={Accruals} />
            <Route path="/prevention/pricing-audit" component={PricingAudit} />

            {/* Visibility sub-pages */}
            <Route path="/visibility/cash-flow-forecast" component={CashFlowForecast} />
            <Route path="/visibility/margin-attribution" component={MarginAttribution} />
            <Route path="/visibility/settlement-pipeline" component={SettlementPipeline} />

            {/* Financing sub-pages */}
            <Route path="/financing/recovery-advance" component={RecoveryAdvancePage} />
            <Route path="/financing/payment-term-extension" component={PaymentTermExtension} />
            <Route path="/financing/ap-bnpl" component={ApBnpl} />

            {/* Intelligence sub-pages */}
            <Route path="/intelligence/rebate-knowledge-graph" component={RebateKnowledgeGraph} />
            <Route path="/intelligence/benchmarks" component={Benchmarks} />
            <Route path="/intelligence/contract-library" component={ContractLibrary} />

            {/* Supplier Portfolio */}
            <Route path="/supplier-portfolio" component={SupplierPortfolio} />
            <Route path="/supplier-portfolio/acme" component={AcmeDetail} />

            {/* Cross-cutting admin */}
            <Route path="/agreements" component={AgreementsPage} />
            <Route path="/master-data" component={MasterDataPage} />
            <Route path="/transactions" component={TransactionsPage} />

            <Route component={NotFound} />
          </Switch>
        </AppLayout>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router>
          <AppRouter />
        </Router>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

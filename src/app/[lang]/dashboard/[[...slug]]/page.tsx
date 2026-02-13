
'use client';

import { useTeam } from '@/hooks/use-team';
import { CoachDashboard } from '@/components/dashboards/CoachDashboard';
import { PlayerDashboard } from '@/components/dashboards/PlayerDashboard';
import { ParentDashboard } from '@/components/dashboards/ParentDashboard';
import { ClubManagerDashboard } from '@/components/dashboards/ClubManagerDashboard';
import { SuperAdminDashboard } from '@/components/dashboards/SuperAdminDashboard';
import { SponsorDashboard } from '@/components/dashboards/SponsorDashboard';
import { ScoutDashboard } from '@/components/dashboards/ScoutDashboard';
import ProviderDashboard from '@/components/dashboards/pages/ProviderDashboard';
import MarketingDashboard from '@/components/dashboards/MarketingDashboard';
import BoardDashboard from '@/components/dashboards/BoardDashboard';
import { Loader2 } from 'lucide-react';
import { useParams } from 'next/navigation';

import AllPagesOverview from '@/components/dashboards/pages/AllPagesOverview';
import AddClubPage from '@/components/dashboards/pages/AddClubPage';
import BrandingPage from '@/components/dashboards/pages/BrandingPage';
import CategoriesPage from '@/components/dashboards/pages/CategoriesPage';
import ChatPage from '@/components/dashboards/pages/ChatPage';
import ClubProfilePage from '@/components/dashboards/pages/ClubProfilePage';
import ClubsPage from '@/components/dashboards/pages/ClubsPage';
import CoachesPage from '@/components/dashboards/pages/CoachesPage';
import ComponentsOverviewPage from '@/components/dashboards/pages/ComponentsOverviewPage';
import ContractManagementPage from '@/components/dashboards/pages/ContractManagementPage';
import CouponsPage from '@/components/dashboards/pages/CouponsPage';
import DunningPage from '@/app/dashboard/dunning/page';
import EventsPage from '@/components/dashboards/pages/EventsPage';
import FaqManagementPage from '@/components/dashboards/pages/FaqManagementPage';
import ChartOfAccountsPage from '@/app/dashboard/chart-of-accounts/page';
import ClubStrategyPage from '@/app/dashboard/club-strategy/page';
import DocumentsPage from '@/components/dashboards/pages/DocumentsPage';
import DownloadAppPage from '@/components/dashboards/pages/DownloadAppPage';
import ExpensesPage from '@/app/dashboard/expenses/page';
import FacilityPage from '@/app/dashboard/facility/page';
import GetHelpPage from '@/app/dashboard/get-help/page';
import HighlightsManagementPage from '@/components/dashboards/pages/HighlightsManagementPage';
import ImageSphereDemo from '@/app/dashboard/image-sphere-demo/page';
import InventoryPage from '@/components/dashboards/pages/InventoryPage';
import InvestorLeadsPage from '@/components/dashboards/pages/InvestorLeadsPage';
import InvestorsPage from '@/app/dashboard/investors/page';
import InvoicesPage from '@/components/dashboards/pages/InvoicesPage';
import JsVerbandPage from '@/app/dashboard/js-verband/page';
import LanguageSettingsPage from '@/app/[lang]/dashboard/language-settings/page';
import LeadsPage from '@/components/dashboards/pages/LeadsPage';
import LeagueStructuresPage from '@/components/dashboards/pages/LeagueStructuresPage';
import LiveTickerPage from '@/components/dashboards/pages/LiveTickerPage';
import LocationsPage from '@/components/dashboards/pages/LocationsPage';
import MatchPrepPage from '@/components/dashboards/pages/MatchPrepPage';
import MatchesPage from '@/components/dashboards/pages/MatchesPage';
import MedicalCenterPage from '@/components/dashboards/pages/MedicalCenterPage';
import MembersPage from '@/components/dashboards/pages/MembersPage';
import NewsletterPage from '@/components/dashboards/pages/NewsletterPage';
import PlayerPlacementPage from '@/app/dashboard/player-placement/page';
import PlayersPage from '@/app/dashboard/players/page';
import PollsPage from '@/components/dashboards/pages/PollsPage';
import ProfilePage from '@/app/dashboard/profile/page';
import ReferralsPage from '@/components/dashboards/pages/ReferralsPage';
import RolesMatrixPage from '@/components/dashboards/pages/RolesMatrixPage';
import RulesAndDisciplinePage from '@/components/dashboards/pages/RulesAndDisciplinePage';
import SaasContractsPage from '@/app/dashboard/saas-contracts/page';
import SaasInvoicesPage from '@/app/dashboard/saas-invoices/page';
import SaasProfilePage from '@/app/dashboard/saas-profile/page';
import SaasWebsiteBuilderPage from '@/app/dashboard/saas-website-builder/page';
import ScoutingReportsPage from '@/components/dashboards/pages/ScoutingReportsPage';
import WatchlistPage from '@/components/dashboards/pages/WatchlistPage';
import SearchPage from '@/app/dashboard/search/page';
import SeasonTransitionPage from '@/app/dashboard/season-transition/page';
import SettingsPage from '@/app/dashboard/settings/page';
import ShopPage from '@/app/dashboard/shop/page';
import SponsoringPage from '@/components/dashboards/pages/SponsoringPage';
import SponsoringSettingsPage from '@/components/dashboards/pages/SponsoringSettingsPage';
import StaffPage from '@/components/dashboards/pages/AmigoalStaffpage';
import StatisticsPage from '@/app/dashboard/statistics/page';
import StatusPage from '@/components/dashboards/pages/StatusPage';
import TeamCashPage from '@/app/dashboard/team-cash/page';
import TeamsPage from '@/components/dashboards/pages/TeamsPage';
import TestDbPage from '@/components/dashboards/pages/TestDbPage';
import TicketingPage from '@/app/dashboard/ticketing/page';
import TokenCatalogPage from '@/app/dashboard/token-catalog/page';
import TokenizationPage from '@/components/dashboards/pages/TokenizationPage';
import TournamentsPage from '@/components/dashboards/pages/TournamentsPage';
import TrainingPage from '@/app/dashboard/training/page';
import TrainingCampPage from '@/app/dashboard/training-camp/page';
import TrainingPrepPage from '@/components/dashboards/pages/TrainingPrepPage';
import UsersPage from '@/components/dashboards/pages/UsersPage';
import WallOfFamePage from '@/components/dashboards/pages/WallOfFamePage';
import WhatsNewPage from '@/components/dashboards/pages/WhatsNewPage';
import SaasSponsoringPackagesPage from '@/app/dashboard/settings/saas-sponsoring-packages/page';
import SaasBrandingPage from '@/app/dashboard/settings/saas-branding/page';
import ModulesSettingsPage from '@/app/dashboard/settings/modules/page';
import SaasBootcampPage from '@/app/dashboard/saas-bootcamp/page';
import BootcampPage from '@/app/dashboard/bootcamp/page';
import NotificationsSettingsPage from '@/app/dashboard/settings/notifications/page';
import SaasWebsitePage from '@/app/dashboard/saas-website/page';
import ProviderBillingPage from '@/app/dashboard/provider/billing/page';
import ProviderFacilitiesPage from '@/app/dashboard/provider/facilities/page';
import ProviderRequestsPage from '@/components/dashboards/pages/ProviderRequestsPage';
import WebsitePage from '@/app/dashboard/website/page';
import WebsiteBuilderPage from '@/app/dashboard/website/builder/page';
import ProviderProfilePage from '@/components/dashboards/pages/ProviderProfilePage';
import ProviderSettingsPage from '@/components/dashboards/pages/ProviderSettingsPage';

const componentMap: { [key: string]: React.ComponentType<any> } = {
    'all-pages': AllPagesOverview,
    'clubs': ClubsPage,
    'add-club': AddClubPage,
    'coaches': CoachesPage,
    'components-overview': ComponentsOverviewPage,
    'contract': ContractManagementPage,
    'coupons': CouponsPage,
    'dunning': DunningPage,
    'events': EventsPage,
    'faq': FaqManagementPage,
    'chart-of-accounts': ChartOfAccountsPage,
    'club-strategy': ClubStrategyPage,
    'documents': DocumentsPage,
    'download-app': DownloadAppPage,
    'expenses': ExpensesPage,
    'facility': FacilityPage,
    'get-help': GetHelpPage,
    'highlights': HighlightsManagementPage,
    'image-sphere-demo': ImageSphereDemo,
    'inventory': InventoryPage,
    'investor-leads': InvestorLeadsPage,
    'investors': InvestorsPage,
    'invoices': InvoicesPage,
    'js-verband': JsVerbandPage,
    'language-settings': LanguageSettingsPage,
    'leads': LeadsPage,
    'leaguestructures': LeagueStructuresPage,
    'live-ticker': LiveTickerPage,
    'locations': LocationsPage,
    'match-prep': MatchPrepPage,
    'matches': MatchesPage,
    'medical-center': MedicalCenterPage,
    'members': MembersPage,
    'newsletter': NewsletterPage,
    'player-placement': PlayerPlacementPage,
    'players': PlayersPage,
    'polls': PollsPage,
    'profile': ProfilePage,
    'referrals': ReferralsPage,
    'roles-matrix': RolesMatrixPage,
    'rules': RulesAndDisciplinePage,
    'saas-contracts': SaasContractsPage,
    'saas-invoices': SaasInvoicesPage,
    'saas-profile': SaasProfilePage,
    'saas-website-builder': SaasWebsiteBuilderPage,
    'scouting/reports': ScoutingReportsPage,
    'scouting/watchlist': WatchlistPage,
    'search': SearchPage,
    'season-transition': SeasonTransitionPage,
    'settings': SettingsPage,
    'settings/branding': SaasBrandingPage,
    'settings/roles-matrix': RolesMatrixPage,
    'settings/categories': CategoriesPage,
    'settings/notifications': NotificationsSettingsPage,
    'settings/leaguestructures': LeagueStructuresPage,
    'settings/evaluation-attributes': ProviderSettingsPage,
    'shop': ShopPage,
    'sponsoring': SponsoringPage,
    'sponsoring/marketplace': SponsoringPage,
    'sponsoring/settings': SponsoringSettingsPage,
    'staff': StaffPage,
    'statistics': StatisticsPage,
    'status': StatusPage,
    'team-cash': TeamCashPage,
    'teams': TeamsPage,
    'test-db': TestDbPage,
    'ticketing': TicketingPage,
    'token-catalog': TokenCatalogPage,
    'tokenization': TokenizationPage,
    'tournaments': TournamentsPage,
    'training': TrainingPage,
    'training-camp': TrainingCampPage,
    'training-prep': TrainingPrepPage,
    'users': UsersPage,
    'wall-of-fame': WallOfFamePage,
    'whats-new': WhatsNewPage,
    'club-profile': ClubProfilePage,
    'branding': BrandingPage,
    'categories': CategoriesPage,
    'chat': ChatPage,
    'settings/saas-sponsoring-packages': SaasSponsoringPackagesPage,
    'settings/saas-branding': SaasBrandingPage,
    'settings/modules': ModulesSettingsPage,
    'saas-bootcamp': SaasBootcampPage,
    'bootcamp': BootcampPage,
    'saas-website': SaasWebsitePage,
    'provider/requests': ProviderRequestsPage,
    'provider/facilities': ProviderFacilitiesPage,
    'provider/billing': ProviderBillingPage,
    'website': WebsitePage,
    'website/builder': WebsiteBuilderPage,
};

const roleToDashboard: Record<string, React.ComponentType<any>> = {
    'Super-Admin': SuperAdminDashboard,
    'Club-Admin': ClubManagerDashboard,
    'Manager': ClubManagerDashboard,
    'Board': BoardDashboard,
    'Coach': CoachDashboard,
    'Player': PlayerDashboard,
    'Parent': ParentDashboard,
    'Sponsor': SponsorDashboard,
    'Scouting': ScoutDashboard,
    'Bootcamp-Anbieter': ProviderDashboard,
    'Trainingslager-Anbieter': ProviderDashboard,
    'Turnieranbieter': ProviderDashboard,
    'Marketing': MarketingDashboard,
};


export default function DashboardSubPage() {
    const params = useParams();
    const { currentUserRole, activeTeam, isLoading } = useTeam();
    const slug = params.slug?.join('/') || '';

    if (isLoading) {
        return (
            <div className="flex h-full w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }
    
    // If there is no slug, we are on the main /dashboard route.
    // Render the correct dashboard based on the user's role.
    if (!slug) {
        const DashboardComponent = currentUserRole ? roleToDashboard[currentUserRole] : ClubManagerDashboard;
        
        if (!DashboardComponent) {
            // Fallback for roles without a specific dashboard
            return <ClubManagerDashboard />;
        }
        
        // Pass activeTeam to components that need it
        if (currentUserRole === 'Coach' || currentUserRole === 'Player') {
            return <DashboardComponent activeTeam={activeTeam} />;
        }
    
        return <DashboardComponent />;
    }

    // If there is a slug, render the corresponding sub-page component.
    const PageComponent = componentMap[slug];

    if (!PageComponent) {
        return <div>Seite nicht gefunden: {slug}</div>;
    }

    return <PageComponent />;
}

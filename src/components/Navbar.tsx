import React, { useState } from 'react';
import { ViewTab, BackendStatus } from '../types';
import { ScoutMascot } from './ScoutMascot';
import { ScoutSignalControl } from './ScoutSignalControl';
import { 
  Compass, 
  Users, 
  Kanban, 
  Send, 
  FlaskConical, 
  Settings, 
  Sparkles, 
  RotateCcw,
  ShieldCheck,
  HelpCircle,
  Menu,
  X,
  ChevronRight,
  Info
} from 'lucide-react';

interface NavbarProps {
  currentTab: ViewTab;
  onSelectTab: (tab: ViewTab) => void;
  onOpenDiscovery: () => void;
  onOpenGuide: () => void;
  onResetData: () => void;
  prospectsCount?: number;
  unreadSignalsCount?: number;
  activeProvenance?: string;
  backendStatus?: BackendStatus;
}

interface NavGroupItem {
  id: ViewTab;
  label: string;
  shortDesc: string;
  icon: React.ReactNode;
  badge?: string;
}

interface NavGroup {
  groupName: string;
  items: NavGroupItem[];
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  onOpenDiscovery,
  onOpenGuide,
  onResetData,
  prospectsCount = 8,
  unreadSignalsCount = 3,
  activeProvenance = 'demo',
  backendStatus = 'connected',
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [hoveredTab, setHoveredTab] = useState<ViewTab | null>(null);

  const navGroups: NavGroup[] = [
    {
      groupName: "WORKSPACE",
      items: [
        {
          id: 'dashboard',
          label: 'Overview',
          shortDesc: 'Overall progress, activity log & recommended next actions',
          icon: <Compass className="w-4 h-4" />
        },
        {
          id: 'prospects',
          label: 'Find Leads',
          shortDesc: 'Search, filter, inspect source facts & import CSVs',
          icon: <Users className="w-4 h-4" />,
          badge: `${prospectsCount}`
        },
        {
          id: 'pipeline',
          label: 'Pipeline',
          shortDesc: 'Kanban stages from review to outreach and closed deals',
          icon: <Kanban className="w-4 h-4" />
        }
      ]
    },
    {
      groupName: "OUTREACH",
      items: [
        {
          id: 'campaigns',
          label: 'Sequences',
          shortDesc: 'Multi-touch follow-up email templates & evidence hooks',
          icon: <Send className="w-4 h-4" />
        }
      ]
    },
    {
      groupName: "INTELLIGENCE",
      items: [
        {
          id: 'settings',
          label: 'Target ICP',
          shortDesc: 'Define your ICP: target roles, company size & exclusions',
          icon: <Settings className="w-4 h-4" />
        },
        {
          id: 'eval-lab',
          label: 'Accuracy Lab',
          shortDesc: 'Hallucination defense metrics & 12 automated test cases',
          icon: <FlaskConical className="w-4 h-4" />,
          badge: '12'
        }
      ]
    }
  ];

  const isLive = activeProvenance === 'researched';
  const isMixed = activeProvenance === 'mixed';
  const isCsv = activeProvenance === 'csv';

  const bannerText = isLive 
    ? "LIVE RESEARCH · Public web findings · No messages are sent"
    : isMixed
    ? "WORKSPACE · Live web research & practice data · No messages are sent"
    : isCsv
    ? "IMPORTED LIST · Uploaded records · No messages are sent"
    : "DEMO MODE · Sample companies and practice data · No messages are sent";

  const handleTabClick = (tab: ViewTab) => {
    onSelectTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FAF7F0] border-b-2 border-[#17271F]">
      {/* Top Banner */}
      <div className="bg-[#17271F] text-[#D8FF65] px-4 py-1.5 text-[11px] font-mono flex items-center justify-between border-b border-[#2A4034]">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-[#9DE3D0]' : 'bg-[#D8FF65]'} animate-pulse`} />
          <span className="font-bold tracking-wider">{bannerText}</span>
        </div>
        <div className="flex items-center gap-3">
          {backendStatus === 'connecting' && (
            <span className="hidden sm:inline bg-[#D8FF65]/10 text-[#D8FF65] border border-[#D8FF65]/30 px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D8FF65] animate-ping" />
              <span>Connecting...</span>
            </span>
          )}
          {backendStatus === 'waking_up' && (
            <span className="bg-[#FF7054] text-white px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1.5 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-white" />
              <span>Cloud Server Waking (~20s)</span>
            </span>
          )}
          {backendStatus === 'connected' && (
            <span className="hidden sm:inline bg-[#9DE3D0]/20 text-[#9DE3D0] border border-[#9DE3D0]/40 px-2 py-0.5 rounded text-[10px] font-semibold">
              ● Cloud Connected
            </span>
          )}
          {backendStatus === 'disconnected' && (
            <span className="hidden sm:inline bg-[#FF7054]/20 text-[#FF7054] border border-[#FF7054]/40 px-2 py-0.5 rounded text-[10px] font-semibold">
              Server Offline
            </span>
          )}
          {backendStatus === 'local_demo' && (
            <span className="hidden sm:inline bg-[#F7F2E8]/20 text-[#F7F2E8] border border-[#F7F2E8]/30 px-2 py-0.5 rounded text-[10px] font-semibold">
              Practice Mode
            </span>
          )}
          <span className="text-[#9DE3D0] hidden md:inline text-[10px]">
            You're in control of every message
          </span>
          <button
            onClick={onResetData}
            title="Reset sample data back to beginning"
            className="flex items-center gap-1 text-[10px] text-[#F7F2E8]/70 hover:text-[#D8FF65] transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" /> Reset sample data
          </button>
          <div className="h-3 w-[1px] bg-[#2A4034] hidden sm:block" aria-hidden="true" />
          <ScoutSignalControl variant="banner" />
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo & Brand */}
          <div 
            className="flex items-center gap-2.5 cursor-pointer select-none shrink-0" 
            onClick={() => handleTabClick('dashboard')}
          >
            <ScoutMascot expression="idle" size="sm" animate={true} />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-editorial text-xl font-bold tracking-tight text-[#17271F]">
                  ScoutSpark
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 bg-[#D8FF65] text-[#17271F] font-bold rounded border border-[#17271F]">
                  v0.9
                </span>
              </div>
              <p className="text-[11px] text-[#4A5E52] font-medium leading-none -mt-0.5">
                Find your next yes.
              </p>
            </div>
          </div>

          {/* Grouped Desktop Navigation */}
          <nav data-scout-target="nav-menu" className="hidden xl:flex items-center gap-1.5 2xl:gap-2.5">
            {navGroups.map((group, groupIdx) => (
              <div key={group.groupName} className="flex items-center gap-1">
                {groupIdx > 0 && (
                  <div className="h-4 w-[1px] bg-[#E2D9C8] mx-0.5" aria-hidden="true" />
                )}
                
                <div className="flex items-center gap-0.5 2xl:gap-1">
                  {group.items.map(item => {
                    const isActive = currentTab === item.id;
                    return (
                      <div key={item.id} className="relative group">
                        <button
                          onClick={() => handleTabClick(item.id)}
                          onMouseEnter={() => setHoveredTab(item.id)}
                          onMouseLeave={() => setHoveredTab(null)}
                          className={`flex items-center gap-1.5 px-2 py-1.5 2xl:px-3 2xl:py-2 rounded-xl text-xs 2xl:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
                            isActive
                              ? 'bg-[#17271F] text-[#F7F2E8] shadow-[2px_2px_0px_#FF7054]'
                              : 'text-[#17271F] hover:bg-white hover:text-[#17271F]'
                          }`}
                        >
                          {item.icon}
                          <span>{item.label}</span>
                          {item.badge && (
                            <span className={`text-[11px] font-mono px-1.5 py-0.2 rounded-full font-bold ${
                              isActive ? 'bg-[#D8FF65] text-[#17271F]' : 'bg-[#E2D9C8] text-[#17271F]'
                            }`}>
                              {item.badge}
                            </span>
                          )}
                        </button>

                        {/* Hover Tooltip explaining purpose */}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 hidden group-hover:block z-50 pointer-events-none min-w-[200px] max-w-xs animate-in fade-in duration-150">
                          <div className="bg-[#17271F] text-[#F7F2E8] text-xs rounded-lg px-3 py-2 shadow-lg border border-[#2A4034]">
                            <div className="text-[10px] font-mono text-[#D8FF65] uppercase font-bold tracking-wider mb-0.5">
                              {group.groupName}
                            </div>
                            <p className="leading-snug text-[#F7F2E8]/90 font-normal">
                              {item.shortDesc}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* Medium Desktop Compact Nav (for screens between lg and xl) */}
          <nav className="hidden lg:flex xl:hidden items-center gap-1">
            {navGroups.flatMap(g => g.items).slice(0, 5).map(item => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  title={item.shortDesc}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-[#17271F] text-[#F7F2E8] shadow-[2px_2px_0px_#FF7054]'
                      : 'text-[#17271F] hover:bg-white'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className={`text-[10px] font-mono px-1 py-0.2 rounded-full font-bold ${
                      isActive ? 'bg-[#D8FF65] text-[#17271F]' : 'bg-[#E2D9C8] text-[#17271F]'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Primary Action Buttons (Signal Toggle, Guide & Find My Next Customer) */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 z-10">
            {/* Dark / Light Mode Toggle */}
            <ScoutSignalControl />

            {/* Scout Guide Button */}
            <button
              onClick={onOpenGuide}
              className="btn-tactile-secondary px-2.5 sm:px-3.5 py-2 rounded-xl text-xs sm:text-sm flex items-center gap-1.5 font-semibold text-[#17271F] cursor-pointer whitespace-nowrap shrink-0"
              title="Open interactive guide, tour and workflow map"
            >
              <HelpCircle className="w-4 h-4 text-[#FF7054]" />
              <span className="hidden sm:inline">Guide</span>
            </button>

            {/* Find My Next Customer Primary CTA */}
            <button
              data-scout-target="nav-discovery-btn"
              onClick={onOpenDiscovery}
              className="btn-tactile-coral px-3.5 sm:px-4 2xl:px-5 py-2 rounded-xl text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 font-bold cursor-pointer whitespace-nowrap shrink-0 shadow-[2px_2px_0px_#17271F] hover:shadow-[3px_3px_0px_#17271F] transition-all"
              title="Launch AI research to find your next customers"
            >
              <Sparkles className="w-4 h-4 text-white shrink-0" />
              <span>Find My Next Customer →</span>
            </button>

            {/* Mobile menu hamburger button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-[#17271F] hover:bg-white border border-[#E2D9C8] transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Grouped Drawer / Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#FAF7F0] border-t border-[#17271F] p-4 space-y-4 max-h-[80vh] overflow-y-auto animate-in slide-in-from-top duration-200">
          <div className="p-3 bg-white border border-[#17271F] rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ScoutMascot expression="curious" size="xs" animate={true} />
              <div>
                <div className="text-xs font-bold text-[#17271F]">New to ScoutSpark?</div>
                <div className="text-[11px] text-[#4A5E52]">Take a 60-second guided tour</div>
              </div>
            </div>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenGuide();
              }}
              className="btn-tactile-coral px-2.5 py-1 rounded text-xs font-bold"
            >
              Open Tour
            </button>
          </div>

          {/* Mobile Dark/Light Mode Atmosphere Toggle */}
          <div className="p-3 bg-white border border-[#17271F] rounded-xl flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-[#17271F]">Workspace Atmosphere</div>
              <div className="text-[11px] text-[#4A5E52]">Toggle Daybreak or Night Ops</div>
            </div>
            <ScoutSignalControl showLabel={true} />
          </div>

          {navGroups.map(group => (
            <div key={group.groupName} className="space-y-1.5">
              <div className="text-[10px] font-mono font-bold tracking-wider text-[#4A5E52] uppercase px-1">
                {group.groupName}
              </div>
              <div className="grid grid-cols-1 gap-1">
                {group.items.map(item => {
                  const isActive = currentTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleTabClick(item.id)}
                      className={`flex items-start justify-between p-2.5 rounded-xl text-left transition-colors border ${
                        isActive
                          ? 'bg-[#17271F] text-[#F7F2E8] border-[#17271F]'
                          : 'bg-white text-[#17271F] border-[#E2D9C8] hover:border-[#17271F]'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <div className="mt-0.5">{item.icon}</div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold">{item.label}</span>
                            {item.badge && (
                              <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold ${
                                isActive ? 'bg-[#D8FF65] text-[#17271F]' : 'bg-[#E2D9C8] text-[#17271F]'
                              }`}>
                                {item.badge}
                              </span>
                            )}
                          </div>
                          <p className={`text-[11px] mt-0.5 ${isActive ? 'text-[#F7F2E8]/80' : 'text-[#4A5E52]'}`}>
                            {item.shortDesc}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className={`w-4 h-4 shrink-0 mt-1 ${isActive ? 'text-[#D8FF65]' : 'text-[#4A5E52]'}`} />
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </header>
  );
};

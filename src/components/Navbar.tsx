import React from 'react';
import { ViewTab } from '../types';
import { ScoutMascot } from './ScoutMascot';
import { 
  Compass, 
  Users, 
  Kanban, 
  Send, 
  FlaskConical, 
  Settings, 
  Sparkles, 
  RotateCcw,
  ShieldCheck
} from 'lucide-react';

interface NavbarProps {
  currentTab: ViewTab;
  onSelectTab: (tab: ViewTab) => void;
  onOpenDiscovery: () => void;
  onResetData: () => void;
  unreadSignalsCount?: number;
  activeProvenance?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  onOpenDiscovery,
  onResetData,
  unreadSignalsCount = 3,
  activeProvenance = 'demo',
}) => {
  const navItems: { id: ViewTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'dashboard', label: 'Overview', icon: <Compass className="w-4 h-4" /> },
    { id: 'prospects', label: 'Find Leads', icon: <Users className="w-4 h-4" />, badge: '8' },
    { id: 'pipeline', label: 'Pipeline', icon: <Kanban className="w-4 h-4" /> },
    { id: 'campaigns', label: 'Message Sequences', icon: <Send className="w-4 h-4" /> },
    { id: 'eval-lab', label: 'Accuracy Lab', icon: <FlaskConical className="w-4 h-4" />, badge: 'Tests' },
    { id: 'settings', label: 'Target Customer', icon: <Settings className="w-4 h-4" /> },
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

  return (
    <header className="sticky top-0 z-40 bg-[#FAF7F0] border-b-2 border-[#17271F]">
      {/* Top Banner */}
      <div className="bg-[#17271F] text-[#D8FF65] px-4 py-1.5 text-[11px] font-mono flex items-center justify-between border-b border-[#2A4034]">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-[#9DE3D0]' : 'bg-[#D8FF65]'} animate-pulse`} />
          <span className="font-bold tracking-wider">{bannerText}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[#9DE3D0] hidden sm:inline text-[10px]">
            You're in control of every message
          </span>
          <button
            onClick={onResetData}
            title="Reset sample data back to beginning"
            className="flex items-center gap-1 text-[10px] text-[#F7F2E8]/70 hover:text-[#D8FF65] transition-colors"
          >
            <RotateCcw className="w-3 h-3" /> Reset sample data
          </button>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer select-none" onClick={() => onSelectTab('dashboard')}>
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

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map(item => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all relative ${
                    isActive
                      ? 'bg-[#17271F] text-[#F7F2E8] shadow-[2px_2px_0px_#FF7054]'
                      : 'text-[#17271F] hover:bg-[#F7F2E8] hover:text-[#17271F]'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                      isActive ? 'bg-[#D8FF65] text-[#17271F]' : 'bg-[#E2D9C8] text-[#17271F]'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Primary CTA */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={onOpenDiscovery}
              className="btn-tactile-coral px-4 py-2 rounded-xl text-xs flex items-center gap-2 font-bold cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Find my next customers</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav Bar */}
      <div className="lg:hidden flex overflow-x-auto px-4 py-2 gap-1.5 bg-[#F7F2E8] border-t border-[#17271F]/10">
        {navItems.map(item => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${
                isActive
                  ? 'bg-[#17271F] text-[#F7F2E8]'
                  : 'text-[#17271F] bg-white border border-[#E2D9C8]'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};

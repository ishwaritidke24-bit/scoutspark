import React, { useState, useMemo } from 'react';
import { Prospect, PipelineStage } from '../types';
import { ScoutMascot } from '../components/ScoutMascot';
import { prospectService } from '../services/prospectService';
import { 
  Search, 
  Filter, 
  SlidersHorizontal, 
  LayoutGrid, 
  Table as TableIcon, 
  Building2, 
  Users, 
  ShieldCheck, 
  ArrowUpDown, 
  Sparkles, 
  ExternalLink,
  ChevronRight,
  Target,
  Clock,
  RotateCcw,
  Upload,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
  X,
  Download
} from 'lucide-react';

interface ProspectsViewProps {
  prospects: Prospect[];
  onSelectProspect: (prospect: Prospect) => void;
  onUpdateStage: (id: string, stage: PipelineStage) => void;
  onRefresh?: () => void;
}

export const ProspectsView: React.FC<ProspectsViewProps> = ({
  prospects,
  onSelectProspect,
  onUpdateStage,
  onRefresh,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedIndustry, setSelectedIndustry] = useState<string>('all');
  const [selectedStage, setSelectedStage] = useState<string>('all');
  const [minScore, setMinScore] = useState<number>(0);
  const [sortBy, setSortBy] = useState<'score_desc' | 'score_asc' | 'name_asc' | 'facts_desc'>('score_desc');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // CSV Import Modal state
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const [importResult, setImportResult] = useState<{
    importedCount: number;
    errorCount: number;
    errors: Array<{ row: number; error: string }>;
  } | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  // Filter industries list
  const industries = useMemo(() => {
    const list = Array.from(new Set(prospects.map(p => p.industry)));
    return ['all', ...list];
  }, [prospects]);

  // Filtered and sorted prospects
  const filteredProspects = useMemo(() => {
    return prospects
      .filter(p => {
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesName = p.companyName.toLowerCase().includes(q);
          const matchesBuyer = p.targetBuyer.name.toLowerCase().includes(q) || p.targetBuyer.title.toLowerCase().includes(q);
          const matchesTags = p.tags.some(t => t.toLowerCase().includes(q));
          const matchesIndustry = p.subIndustry.toLowerCase().includes(q) || p.industry.toLowerCase().includes(q);
          if (!matchesName && !matchesBuyer && !matchesTags && !matchesIndustry) return false;
        }

        // Industry filter
        if (selectedIndustry !== 'all' && p.industry !== selectedIndustry) {
          return false;
        }

        // Pipeline stage filter
        if (selectedStage !== 'all' && p.pipelineStage !== selectedStage) {
          return false;
        }

        // Min score
        if (p.fitScore < minScore) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'score_desc') return b.fitScore - a.fitScore;
        if (sortBy === 'score_asc') return a.fitScore - b.fitScore;
        if (sortBy === 'name_asc') return a.companyName.localeCompare(b.companyName);
        if (sortBy === 'facts_desc') return b.observedFacts.length - a.observedFacts.length;
        return 0;
      });
  }, [prospects, searchQuery, selectedIndustry, selectedStage, minScore, sortBy]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedIndustry('all');
    setSelectedStage('all');
    setMinScore(0);
    setSortBy('score_desc');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.name.toLowerCase().endsWith('.csv')) {
        setImportError('Please select a valid .csv file.');
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
      setImportError(null);
      setImportResult(null);
    }
  };

  const handleUploadCSV = async () => {
    if (!selectedFile) return;
    setIsImporting(true);
    setImportError(null);
    setImportResult(null);

    try {
      const res = await prospectService.importCSV(selectedFile);
      setImportResult({
        importedCount: res.importedCount,
        errorCount: res.errorCount,
        errors: res.errors,
      });
      if (res.importedCount > 0 && onRefresh) {
        onRefresh();
      }
    } catch (err: any) {
      setImportError(err.detail || err.message || 'CSV import failed. Ensure backend is running.');
    } finally {
      setIsImporting(false);
    }
  };

  const handleDownloadSampleCSV = () => {
    const csvContent = `company_name,domain,industry,sub_industry,employee_count,headquarters,buyer_name,buyer_title
SynapseCloud,synapsecloud.internal,Developer Tools & Infrastructure,Edge Routing,38 employees,San Francisco CA,Marcus Brody,VP of Platform
CardioMetrics,cardiometrics.internal,HealthTech & Digital Health,Remote Cardiac Telemetry,52 employees,Boston MA,Dr. Sarah Lin,Chief Clinical Officer
`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'scoutspark_prospects_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getScoreBadge = (score: number) => {
    if (score >= 90) return 'bg-[#D8FF65] text-[#17271F] border-[#17271F]';
    if (score >= 75) return 'bg-[#9DE3D0] text-[#17271F] border-[#17271F]';
    if (score >= 60) return 'bg-[#FFEAE5] text-[#FF7054] border-[#FF7054]';
    return 'bg-[#E2D9C8] text-[#17271F] border-[#4A5E52]';
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Filter Controls */}
      <div className="bg-white border-2 border-[#17271F] rounded-2xl p-5 shadow-[4px_4px_0px_#17271F] space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-editorial font-bold text-[#17271F]">
                Find Prospects
              </h1>
              <span className="sticker-badge bg-[#FAF7F0] text-[#17271F] border-[#17271F] text-[10px]">
                {filteredProspects.length} of {prospects.length} Accounts
              </span>
            </div>
            <p className="text-xs text-[#4A5E52] mt-0.5">
              Evidence-backed accounts evaluated against your ideal customer criteria.
            </p>
          </div>

          {/* View toggle, CSV Import & Sort */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => {
                setIsImportModalOpen(true);
                setImportResult(null);
                setImportError(null);
                setSelectedFile(null);
              }}
              className="btn-tactile-secondary px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-[#FF7054]" />
              <span>Import CSV</span>
            </button>

            <div className="flex items-center bg-[#FAF7F0] border border-[#17271F] rounded-lg p-0.5">
              <button
                onClick={() => setViewMode('cards')}
                className={`p-1.5 rounded text-xs font-semibold flex items-center gap-1 cursor-pointer ${
                  viewMode === 'cards' ? 'bg-[#17271F] text-white shadow-xs' : 'text-[#4A5E52] hover:text-[#17271F]'
                }`}
                title="Grid cards view"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded text-xs font-semibold flex items-center gap-1 cursor-pointer ${
                  viewMode === 'table' ? 'bg-[#17271F] text-white shadow-xs' : 'text-[#4A5E52] hover:text-[#17271F]'
                }`}
                title="Dense table view"
              >
                <TableIcon className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-[#17271F]">
              <ArrowUpDown className="w-3.5 h-3.5 text-[#4A5E52]" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-[#FAF7F0] border border-[#17271F] rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:outline-none"
              >
                <option value="score_desc">Fit Score (High to Low)</option>
                <option value="score_asc">Fit Score (Low to High)</option>
                <option value="name_asc">Company Name (A-Z)</option>
                <option value="facts_desc">Most Verified Facts</option>
              </select>
            </div>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2 border-t border-[#E2D9C8]">
          {/* Search Bar */}
          <div className="sm:col-span-5 relative">
            <Search className="w-4 h-4 text-[#4A5E52] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by company, buyer name, or tech tag..."
              className="w-full bg-[#FAF7F0] border border-[#17271F] rounded-lg pl-9 pr-3 py-1.5 text-xs text-[#17271F] placeholder-[#4A5E52]/60 focus:outline-none focus:ring-1 focus:ring-[#D8FF65]"
            />
          </div>

          {/* Industry Filter */}
          <div className="sm:col-span-3">
            <select
              value={selectedIndustry}
              onChange={(e) => setSelectedIndustry(e.target.value)}
              className="w-full bg-[#FAF7F0] border border-[#17271F] rounded-lg px-2.5 py-1.5 text-xs font-medium text-[#17271F] focus:outline-none"
            >
              <option value="all">All Industries ({industries.length - 1})</option>
              {industries.filter(i => i !== 'all').map(ind => (
                <option key={ind} value={ind}>{ind}</option>
              ))}
            </select>
          </div>

          {/* Stage Filter */}
          <div className="sm:col-span-2">
            <select
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value)}
              className="w-full bg-[#FAF7F0] border border-[#17271F] rounded-lg px-2.5 py-1.5 text-xs font-medium text-[#17271F] focus:outline-none"
            >
              <option value="all">All Stages</option>
              <option value="ready_to_review">Ready to Review</option>
              <option value="approved">Approved</option>
              <option value="contacted">Contacted</option>
              <option value="to_research">To Research</option>
              <option value="not_a_fit">Not a Fit</option>
            </select>
          </div>

          {/* Min Score Filter */}
          <div className="sm:col-span-2 flex items-center justify-between gap-2 bg-[#FAF7F0] border border-[#17271F] rounded-lg px-2.5 py-1.5 text-xs">
            <span className="text-[#4A5E52] shrink-0 font-medium">Min: {minScore}%</span>
            <input
              type="range"
              min="0"
              max="95"
              step="5"
              value={minScore}
              onChange={(e) => setMinScore(Number(e.target.value))}
              className="w-16 accent-[#FF7054] cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Main Results View */}
      {filteredProspects.length === 0 ? (
        /* Empty State with Scout Mascot */
        <div className="bg-white border-2 border-[#17271F] rounded-2xl p-12 text-center shadow-[4px_4px_0px_#17271F] space-y-4 max-w-lg mx-auto my-8">
          <ScoutMascot expression="thinking" size="xl" animate={true} />
          <div className="space-y-1">
            <h3 className="text-xl font-editorial font-bold text-[#17271F]">
              No accounts match these filters
            </h3>
            <p className="text-xs text-[#4A5E52]">
              Scout searched the workspace, but didn't find any accounts matching "{searchQuery}" with minimum score {minScore}%.
            </p>
          </div>
          <button
            onClick={handleResetFilters}
            className="btn-tactile-coral px-4 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset Filters
          </button>
        </div>
      ) : viewMode === 'cards' ? (
        /* Grid Cards View */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredProspects.map(prospect => (
            <div
              key={prospect.id}
              onClick={() => onSelectProspect(prospect)}
              className="card-tactile rounded-2xl p-5 cursor-pointer hover:border-[#17271F] flex flex-col justify-between group relative overflow-hidden"
            >
              {/* Card Header */}
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl border-1.5 font-mono font-bold flex flex-col items-center justify-center shrink-0 shadow-[2px_2px_0px_#17271F] ${getScoreBadge(prospect.fitScore)}`}>
                      <span className="text-lg leading-none">{prospect.fitScore}</span>
                      <span className="text-[8px] uppercase tracking-tighter">SCORE</span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-base font-editorial font-bold text-[#17271F] group-hover:text-[#FF7054] transition-colors">
                          {prospect.companyName}
                        </h2>
                        <span className="sticker-badge bg-[#FAF7F0] text-[#17271F] border-[#17271F] text-[9px]">
                          {prospect.fitLevel}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-[#4A5E52] mt-0.5">
                        <span>{prospect.subIndustry || prospect.industry}</span>
                        <span>•</span>
                        <span>{prospect.employeeCount}</span>
                      </div>
                    </div>
                  </div>

                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border shrink-0 ${
                    prospect.pipelineStage === 'approved' 
                      ? 'bg-[#9DE3D0] text-[#17271F] border-[#17271F]' 
                      : prospect.pipelineStage === 'ready_to_review'
                      ? 'bg-[#FFEAE5] text-[#FF7054] border-[#FF7054]'
                      : 'bg-[#FAF7F0] text-[#4A5E52] border-[#E2D9C8]'
                  }`}>
                    {prospect.pipelineStage.replace('_', ' ')}
                  </span>
                </div>

                {/* Company summary */}
                <p className="text-xs text-[#17271F] mt-3 line-clamp-2 leading-relaxed">
                  {prospect.summary}
                </p>

                {/* Target buyer pill */}
                <div className="mt-3 p-2 bg-[#FAF7F0] rounded-lg border border-[#E2D9C8] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-[#FF7054]" />
                    <span className="font-semibold text-[#17271F]">{prospect.targetBuyer.name || 'Decision Maker'}</span>
                    <span className="text-[#4A5E52] text-[11px]">({prospect.targetBuyer.title || 'Executive'})</span>
                  </div>
                  <span className="text-[10px] text-[#FF7054] font-medium">
                    {prospect.targetBuyer.roleType?.split(' ')[0] || 'Lead'}
                  </span>
                </div>

                {/* Evidence count tags */}
                <div className="mt-3 flex items-center gap-2 text-[10px] font-mono">
                  <span className="bg-[#9DE3D0]/30 text-[#17271F] border border-[#17271F]/30 px-2 py-0.5 rounded flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-[#17271F]" />
                    {prospect.observedFacts?.length || 0} Verified Facts
                  </span>
                  <span className="bg-[#D8FF65]/30 text-[#17271F] border border-[#17271F]/30 px-2 py-0.5 rounded">
                    ⚡ {prospect.hypotheses?.length || 0} Hypotheses
                  </span>
                  {prospect.emailDraft?.isApproved && (
                    <span className="bg-[#9DE3D0] text-[#17271F] font-bold px-2 py-0.5 rounded">
                      ✓ Draft Approved
                    </span>
                  )}
                </div>
              </div>

              {/* Card Footer */}
              <div className="mt-4 pt-3 border-t border-[#E2D9C8] flex items-center justify-between text-xs">
                <span className="text-[#4A5E52] text-[11px]">
                  {prospect.stage?.split(' •')[0] || prospect.headquarters}
                </span>
                <span className="text-[#FF7054] font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  View Dossier & Draft <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* High-Density Table View */
        <div className="bg-white border-2 border-[#17271F] rounded-2xl overflow-hidden shadow-[4px_4px_0px_#17271F]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF7F0] border-b-2 border-[#17271F] text-[#17271F] font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Fit</th>
                  <th className="py-3 px-4">Company</th>
                  <th className="py-3 px-4">Target Buyer</th>
                  <th className="py-3 px-4">Evidence Status</th>
                  <th className="py-3 px-4">Stage</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2D9C8]">
                {filteredProspects.map(prospect => (
                  <tr
                    key={prospect.id}
                    onClick={() => onSelectProspect(prospect)}
                    className="hover:bg-[#FAF7F0] cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <span className={`font-mono font-bold px-2 py-1 rounded border text-xs ${getScoreBadge(prospect.fitScore)}`}>
                        {prospect.fitScore}%
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-editorial font-bold text-sm text-[#17271F]">
                        {prospect.companyName}
                      </div>
                      <div className="text-[11px] text-[#4A5E52]">
                        {prospect.subIndustry || prospect.industry} • {prospect.employeeCount}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-[#17271F]">
                        {prospect.targetBuyer.name || 'Decision Maker'}
                      </div>
                      <div className="text-[11px] text-[#4A5E52]">
                        {prospect.targetBuyer.title || 'Executive'}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 text-[11px] font-mono">
                        <span className="text-green-700 font-semibold">{prospect.observedFacts?.length || 0} Facts</span>
                        <span>•</span>
                        <span className="text-amber-700">{prospect.hypotheses?.length || 0} Hypotheses</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                        prospect.pipelineStage === 'approved' 
                          ? 'bg-[#9DE3D0] text-[#17271F] border-[#17271F]' 
                          : prospect.pipelineStage === 'ready_to_review'
                          ? 'bg-[#FFEAE5] text-[#FF7054] border-[#FF7054]'
                          : 'bg-[#FAF7F0] text-[#4A5E52] border-[#E2D9C8]'
                      }`}>
                        {prospect.pipelineStage.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectProspect(prospect);
                        }}
                        className="btn-tactile-secondary px-2.5 py-1 rounded text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
                      >
                        Inspect <ChevronRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CSV Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#17271F]/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-[#FAF7F0] border-2 border-[#17271F] rounded-2xl shadow-[6px_6px_0px_#17271F] overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#17271F]/15">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-[#FF7054]" />
                <h3 className="text-base font-editorial font-bold text-[#17271F]">
                  Import Prospects from CSV
                </h3>
              </div>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="p-1 rounded text-[#4A5E52] hover:text-[#17271F]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#4A5E52] leading-relaxed">
              Upload a CSV file containing potential prospect accounts. Required columns: <strong className="text-[#17271F]">company_name</strong>, <strong className="text-[#17271F]">domain</strong>, <strong className="text-[#17271F]">industry</strong>.
            </p>

            {/* Template Download Link */}
            <div className="flex items-center justify-between p-2.5 bg-white border border-[#17271F]/20 rounded-xl text-xs">
              <span className="text-[#4A5E52]">Need a template format?</span>
              <button
                onClick={handleDownloadSampleCSV}
                className="text-[#FF7054] font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" /> Download Sample CSV
              </button>
            </div>

            {/* File Input Box */}
            <div className="p-5 border-2 border-dashed border-[#17271F]/30 bg-white rounded-xl text-center space-y-2">
              <input
                type="file"
                id="csvFileInput"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
              />
              <label
                htmlFor="csvFileInput"
                className="btn-tactile-secondary px-4 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-2 cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                <span>{selectedFile ? selectedFile.name : 'Choose CSV File'}</span>
              </label>
              {selectedFile && (
                <p className="text-[11px] text-[#4A5E52] mt-1">
                  {(selectedFile.size / 1024).toFixed(1)} KB • Ready for upload
                </p>
              )}
            </div>

            {/* Error Message */}
            {importError && (
              <div className="p-3 bg-[#FFEAE5] border border-[#FF7054] rounded-xl text-xs text-[#FF7054] flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{importError}</span>
              </div>
            )}

            {/* Success Result */}
            {importResult && (
              <div className="p-3.5 bg-[#9DE3D0]/30 border border-[#17271F] rounded-xl text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-[#17271F]">
                  <CheckCircle2 className="w-4 h-4 text-green-700" />
                  <span>Import Completed!</span>
                </div>
                <div className="text-[11px] text-[#17271F]">
                  Successfully imported: <strong>{importResult.importedCount}</strong> accounts.
                  {importResult.errorCount > 0 && (
                    <span className="text-red-700 ml-2">Errors: {importResult.errorCount} rows.</span>
                  )}
                </div>
                {importResult.errors.length > 0 && (
                  <div className="mt-2 p-2 bg-white rounded border border-red-200 text-[10px] text-red-700 space-y-1 max-h-24 overflow-y-auto">
                    {importResult.errors.map((err, idx) => (
                      <div key={idx}>Row {err.row}: {err.error}</div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Modal Actions */}
            <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#17271F]/15">
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="btn-tactile-secondary px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={handleUploadCSV}
                disabled={!selectedFile || isImporting}
                className="btn-tactile-coral px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isImporting ? (
                  <span>Importing...</span>
                ) : (
                  <>
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload & Process</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

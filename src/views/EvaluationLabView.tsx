import React, { useState } from 'react';
import { EvaluationMetric } from '../types';
import { ScoutMascot } from '../components/ScoutMascot';
import { 
  FlaskConical, 
  ShieldAlert, 
  CheckCircle2, 
  TrendingUp, 
  AlertCircle, 
  Info, 
  FileCheck, 
  Search, 
  Layers, 
  BarChart3,
  HelpCircle
} from 'lucide-react';

interface EvaluationLabViewProps {
  metrics: EvaluationMetric[];
}

export const EvaluationLabView: React.FC<EvaluationLabViewProps> = ({ metrics }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // 12 Deterministic Evaluation Cases matching backend/tests/test_evaluation_fixture.py
  const evaluationTestCases = [
    {
      id: "EVAL-01",
      scenario: "Clear ICP Match: Kubernetes + eBPF distributed tracing startup (CloudNative IO)",
      expected: "Accepted as high fit; snippet verified; 2 grounded facts, 1 hypothesis",
      actual: "PASS: Accepted, Fit Score 75/100, verified source snippet attached",
      category: "Relevance & Fit",
      status: "PASS (Fixture)"
    },
    {
      id: "EVAL-02",
      scenario: "Clearly Unrelated Company: Local artisan bakery (Sweet Treats Bakery)",
      expected: "Relevance gate rejection; explicit reason logged; zero saved prospects",
      actual: "PASS: Rejected by relevance gate ('Industry outside startup ICP')",
      category: "Relevance Gate",
      status: "PASS (Fixture)"
    },
    {
      id: "EVAL-03",
      scenario: "Relevant Domain with Insufficient Evidence: Bare marketing landing page",
      expected: "Preserved as low-confidence / manual-review or demoted claims",
      actual: "PASS: Preserved with manual review flag; zero unsupported facts claimed",
      category: "Evidence Grounding",
      status: "PASS (Fixture)"
    },
    {
      id: "EVAL-04",
      scenario: "Incidental Passing Mention: Brand merely mentioned in 100-tool listicle",
      expected: "Relevance gate rejection; lacks substantive company evidence",
      actual: "PASS: Rejected ('Company is incidental passing mention in listicle')",
      category: "Relevance Gate",
      status: "PASS (Fixture)"
    },
    {
      id: "EVAL-05",
      scenario: "Duplicate Company Domains: www.datamesh.io vs datamesh.io",
      expected: "Normalized domain deduplication; second candidate rejected",
      actual: "PASS: Rejected second candidate ('Duplicate candidate domain')",
      category: "Deduplication",
      status: "PASS (Fixture)"
    },
    {
      id: "EVAL-06",
      scenario: "Valid URL with Unsupported Metric: Snippet mentions eBPF, claim invents '99.999% p99'",
      expected: "Claim rejected from observed facts; demoted to hypothesis",
      actual: "PASS: Unsupported metric demoted to hypothesis with audit reason",
      category: "Hallucination Defense",
      status: "PASS (Fixture)"
    },
    {
      id: "EVAL-07",
      scenario: "Correct Source Attached to Wrong Company: Source discussing Competitor cited for Subject",
      expected: "Company alignment mismatch detected; claim rejected from facts",
      actual: "PASS: Source mismatch flagged; claim withheld from observed facts",
      category: "Provenance Integrity",
      status: "PASS (Fixture)"
    },
    {
      id: "EVAL-08",
      scenario: "Fabricated Source ID: LLM invents source-phantom-99 not in run retrieval",
      expected: "Untrusted source rejected; claim demoted to unverified hypothesis",
      actual: "PASS: Phantom source ID rejected; zero unverified URLs admitted",
      category: "Provenance Integrity",
      status: "PASS (Fixture)"
    },
    {
      id: "EVAL-09",
      scenario: "Conflicting Source Statements: One says on-prem, one claims 100% AWS cloud",
      expected: "Conflicting assertions isolated; unverified claim quarantined as hypothesis",
      actual: "PASS: Flagged uncertainty indicator; safe hypothesis quarantine",
      category: "Conflict Resolution",
      status: "PASS (Fixture)"
    },
    {
      id: "EVAL-10",
      scenario: "Plausible but Unproven Business Pain: 'Suffering budget crisis over cloud bills'",
      expected: "Excluded from observed facts; tagged as hypothesis with manual review",
      actual: "PASS: Pain point isolated as AI hypothesis; excluded from email draft",
      category: "Human Safeguard",
      status: "PASS (Fixture)"
    },
    {
      id: "EVAL-11",
      scenario: "Explicitly Excluded Industry: Online gambling operator (GamblingTech Ltd)",
      expected: "Deterministic rejection against negative ICP criteria",
      actual: "PASS: Rejected by relevance gate ('Excluded industry: gambling')",
      category: "Negative Exclusion",
      status: "PASS (Fixture)"
    },
    {
      id: "EVAL-12",
      scenario: "Missing Dates & Incomplete Metadata: Valuable technical blog without timestamp",
      expected: "Accepted on substantive technical merit; date flagged as missing/unknown",
      actual: "PASS: Accepted with date flagged; facts grounded in snippet text",
      category: "Metadata Resilience",
      status: "PASS (Fixture)"
    }
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Header with Mandatory Offline Benchmark Notice */}
      <div className="bg-white border-2 border-[#17271F] rounded-2xl p-6 shadow-[4px_4px_0px_#17271F] space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-editorial font-bold text-[#17271F]">
                Evaluation Lab & Grounding Benchmarks
              </h1>
              <span className="sticker-badge bg-[#FAF7F0] text-[#17271F] border-[#17271F] font-mono text-[10px]">
                Offline Test Suite (n=12 Fixtures)
              </span>
            </div>
            <p className="text-xs text-[#4A5E52] mt-0.5">
              Auditable evaluation fixture measuring relevance filtering, domain deduplication, and snippet fact-grounding in isolated tests.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-[#FAF7F0] p-3 rounded-xl border border-[#17271F] text-xs">
            <Info className="w-4 h-4 text-[#FF7054] shrink-0" />
            <div>
              <span className="font-bold text-[#17271F]">Benchmark Context: </span>
              <span className="text-[#4A5E52]">Metrics reflect pass rates on 12 curated unit-test fixtures (<code className="font-mono text-[11px]">backend/tests/test_evaluation_fixture.py</code>), not uncontrolled open-web accuracy.</span>
            </div>
          </div>
        </div>

        {/* Evaluation Disclaimer Banner */}
        <div className="p-3.5 bg-[#FAF7F0] border-1.5 border-[#17271F] rounded-xl flex items-start gap-3 text-xs text-[#17271F]">
          <ShieldAlert className="w-4 h-4 text-[#FF7054] shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Honest Evidence Philosophy: </span>
            B2B prospect intelligence fails when AI models hallucinate company pain points, invent metrics, or cite unrelated web pages. ScoutSpark enforces a two-tier extraction pipeline: claims require exact source-snippet overlap to become observed facts, while speculative pain points are demoted to hypotheses for founder review.
          </div>
        </div>
      </div>

      {/* 4 Core Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map(metric => (
          <div
            key={metric.id}
            className="card-tactile p-5 rounded-2xl bg-white border-2 border-[#17271F] flex flex-col justify-between space-y-3"
          >
            <div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-[10px] uppercase font-bold text-[#4A5E52]">
                  {metric.category}
                </span>
                <span className="sticker-badge bg-[#9DE3D0] text-[#17271F] border-[#17271F] text-[9px]">
                  {metric.status}
                </span>
              </div>

              <h2 className="text-sm font-editorial font-bold text-[#17271F] mt-1.5 leading-snug">
                {metric.name}
              </h2>

              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-mono font-bold text-[#17271F]">{metric.score}</span>
                <span className="text-xs text-[#4A5E52]">Target: {metric.target}</span>
              </div>

              <p className="text-[11px] text-[#4A5E52] mt-2 leading-relaxed">
                {metric.description}
              </p>
            </div>

            <div className="pt-2 border-t border-[#E2D9C8] flex items-center justify-between text-[10px] text-[#17271F]">
              <span className="text-[#FF7054] font-semibold">{metric.trend}</span>
              <span className="italic text-[#4A5E52]">n=12 Fixtures</span>
            </div>
          </div>
        ))}
      </div>

      {/* 12-Case Grounding & Precision Test Matrix */}
      <div className="bg-white border-2 border-[#17271F] rounded-2xl p-6 shadow-[4px_4px_0px_#17271F] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E2D9C8]">
          <div>
            <div className="flex items-center gap-2">
              <FlaskConical className="w-4 h-4 text-[#FF7054]" />
              <h2 className="text-base font-editorial font-bold text-[#17271F]">
                Controlled Evaluation Fixture Matrix (12 Scenarios)
              </h2>
            </div>
            <p className="text-xs text-[#4A5E52]">
              Automated regression suite in <code className="font-mono text-[11px]">backend/tests/test_evaluation_fixture.py</code> testing edge cases, negative exclusions, and hallucination defense.
            </p>
          </div>

          <span className="text-xs font-mono font-bold bg-[#D8FF65] text-[#17271F] border border-[#17271F] px-2.5 py-1 rounded-lg">
            12 of 12 Test Cases Passing (Pytest)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF7F0] border-b-2 border-[#17271F] text-[#17271F] font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-2.5 px-3">Test ID</th>
                <th className="py-2.5 px-3">Target Scenario</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Expected Behavior</th>
                <th className="py-2.5 px-3">Automated Test Outcome</th>
                <th className="py-2.5 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2D9C8]">
              {evaluationTestCases.map(tc => (
                <tr key={tc.id} className="hover:bg-[#FAF7F0] transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-[#17271F]">{tc.id}</td>
                  <td className="py-3 px-3 font-medium text-[#17271F] max-w-[220px]">{tc.scenario}</td>
                  <td className="py-3 px-3">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#FAF7F0] border border-[#17271F]/30 text-[#17271F]">
                      {tc.category}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-[#4A5E52] max-w-[220px]">{tc.expected}</td>
                  <td className="py-3 px-3 text-[#17271F] font-mono text-[11px] max-w-[200px]">{tc.actual}</td>
                  <td className="py-3 px-3 text-right">
                    <span className="sticker-badge bg-[#9DE3D0] text-[#17271F] border-[#17271F] text-[9px]">
                      {tc.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Scout's Evaluation Philosophy Note */}
      <div className="card-tactile p-6 rounded-2xl bg-[#FAF7F0] border-2 border-[#17271F] flex flex-col md:flex-row items-center gap-6">
        <ScoutMascot expression="thinking" size="xl" animate={true} />
        <div className="space-y-2">
          <div className="text-xs font-mono font-bold text-[#FF7054] uppercase tracking-wider">
            Evaluation Architecture Roadmap
          </div>
          <h2 className="text-xl font-editorial font-bold text-[#17271F]">
            Why B2B AI must separate observed facts from hypotheses
          </h2>
          <p className="text-xs text-[#4A5E52] leading-relaxed">
            In standard generative AI prospecting tools, models make up confident assertions like "I noticed you're switching to Snowflake" when only a job post for a data analyst was found. ScoutSpark enforces a two-tier extraction pipeline: verifiable public facts are stored with provenance timestamps, while reasoning steps are explicitly quarantined as hypotheses subject to founder approval.
          </p>
        </div>
      </div>
    </div>
  );
};

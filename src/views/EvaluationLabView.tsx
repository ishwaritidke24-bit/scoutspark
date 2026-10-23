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
      scenario: "Good Match: Kubernetes and tracing software startup (CloudNative IO)",
      expected: "Accepted as a strong match; attached real website snippet; 2 facts, 1 guess",
      actual: "PASS: Accepted, 75/100 score, verified source snippet attached",
      category: "Relevance & Fit",
      status: "PASS (Fixture)"
    },
    {
      id: "EVAL-02",
      scenario: "Completely Unrelated Business: Local bakery shop (Sweet Treats Bakery)",
      expected: "Rejected right away with a clear reason; never saved as a lead",
      actual: "PASS: Skipped ('Industry outside what you are looking for')",
      category: "Relevance Gate",
      status: "PASS (Fixture)"
    },
    {
      id: "EVAL-03",
      scenario: "Relevant Business with Very Little Information: Empty landing page",
      expected: "Saved with a note to double check; no fake facts created",
      actual: "PASS: Marked for your review; zero unsupported facts claimed",
      category: "Evidence Grounding",
      status: "PASS (Fixture)"
    },
    {
      id: "EVAL-04",
      scenario: "Casual Mention: Company just mentioned in a list of 100 tools",
      expected: "Skipped because there isn't enough real information",
      actual: "PASS: Skipped ('Company only briefly mentioned in a list article')",
      category: "Relevance Gate",
      status: "PASS (Fixture)"
    },
    {
      id: "EVAL-05",
      scenario: "Duplicate Web Addresses: www.datamesh.io vs datamesh.io",
      expected: "Recognized as the same company; second copy skipped",
      actual: "PASS: Skipped second copy ('Duplicate company domain')",
      category: "Deduplication",
      status: "PASS (Fixture)"
    },
    {
      id: "EVAL-06",
      scenario: "Real Website with Made-Up Metric: Snippet mentions eBPF, but claim invents '99.999% uptime'",
      expected: "Made-up metric removed from facts and marked as an unproven guess",
      actual: "PASS: Unproven metric labeled as a guess with an explanation",
      category: "Hallucination Defense",
      status: "PASS (Fixture)"
    },
    {
      id: "EVAL-07",
      scenario: "Right Source Attached to Wrong Company: Source talks about a competitor",
      expected: "Mismatch spotted; claim not counted as a fact",
      actual: "PASS: Mismatch flagged; claim kept out of verified facts",
      category: "Provenance Integrity",
      status: "PASS (Fixture)"
    },
    {
      id: "EVAL-08",
      scenario: "Made-Up Source ID: AI invents a source link that was never retrieved",
      expected: "Untrusted source rejected; claim treated as an unverified guess",
      actual: "PASS: Fake source rejected; no unverified links allowed",
      category: "Provenance Integrity",
      status: "PASS (Fixture)"
    },
    {
      id: "EVAL-09",
      scenario: "Conflicting Information: One source says on-premise, another says cloud",
      expected: "Disagreement noticed; treated as an educated guess to check",
      actual: "PASS: Flagged as uncertain; kept in safe guesses",
      category: "Conflict Resolution",
      status: "PASS (Fixture)"
    },
    {
      id: "EVAL-10",
      scenario: "Plausible but Unproven Business Problem: 'Struggling with huge cloud bills'",
      expected: "Kept out of facts; marked as a guess for you to check",
      actual: "PASS: Kept as an educated guess; not included in email draft",
      category: "Human Safeguard",
      status: "PASS (Fixture)"
    },
    {
      id: "EVAL-11",
      scenario: "Company on Excluded List: Online casino (GamblingTech Ltd)",
      expected: "Skipped automatically because of negative rules",
      actual: "PASS: Skipped ('Industry is on your excluded list: gambling')",
      category: "Negative Exclusion",
      status: "PASS (Fixture)"
    },
    {
      id: "EVAL-12",
      scenario: "Missing Dates: Great technical blog post without an exact date",
      expected: "Accepted because information is genuine; date marked as unknown",
      actual: "PASS: Accepted with date noted as missing; facts verified",
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
                Accuracy Lab & Quality Checks
              </h1>
              <span className="sticker-badge bg-[#FAF7F0] text-[#17271F] border-[#17271F] font-mono text-[10px]">
                Automated Quality Tests (12 Test Cases)
              </span>
            </div>
            <p className="text-xs text-[#4A5E52] mt-0.5">
              We run automated tests to make sure ScoutSpark only finds relevant businesses, skips duplicates, and backs up every claim with real evidence.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-[#FAF7F0] p-3 rounded-xl border border-[#17271F] text-xs">
            <Info className="w-4 h-4 text-[#FF7054] shrink-0" />
            <div>
              <span className="font-bold text-[#17271F]">How we test: </span>
              <span className="text-[#4A5E52]">These scores show pass rates across our 12 automated test cases in <code className="font-mono text-[11px]">backend/tests/test_evaluation_fixture.py</code>, checking for accuracy and honesty.</span>
            </div>
          </div>
        </div>

        {/* Evaluation Disclaimer Banner */}
        <div className="p-3.5 bg-[#FAF7F0] border-1.5 border-[#17271F] rounded-xl flex items-start gap-3 text-xs text-[#17271F]">
          <ShieldAlert className="w-4 h-4 text-[#FF7054] shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Our Honesty Promise: </span>
            Sales tools fail when AI makes things up, invents metrics, or links to unrelated websites. ScoutSpark requires direct proof from real websites before calling anything a fact. Any educated guess is clearly labeled so you can review it first.
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
              <span className="italic text-[#4A5E52]">12 Test Cases</span>
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
                12 Automated Quality Test Scenarios
              </h2>
            </div>
            <p className="text-xs text-[#4A5E52]">
              Automated tests in <code className="font-mono text-[11px]">backend/tests/test_evaluation_fixture.py</code> checking tricky situations, rules for skipping companies, and preventing made-up claims.
            </p>
          </div>

          <span className="text-xs font-mono font-bold bg-[#D8FF65] text-[#17271F] border border-[#17271F] px-2.5 py-1 rounded-lg">
            All 12 Quality Tests Passing
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF7F0] border-b-2 border-[#17271F] text-[#17271F] font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-2.5 px-3">Test ID</th>
                <th className="py-2.5 px-3">Test Scenario</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">What Should Happen</th>
                <th className="py-2.5 px-3">What Actually Happened</th>
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
            Quality & Honesty
          </div>
          <h2 className="text-xl font-editorial font-bold text-[#17271F]">
            Why sales AI must separate proven facts from guesses
          </h2>
          <p className="text-xs text-[#4A5E52] leading-relaxed">
            Most AI tools guess and write things like "I noticed you're switching to Snowflake" when they only found a generic job post. ScoutSpark keeps real, proven facts separate from educated guesses, so you always know what is verified before reaching out.
          </p>
        </div>
      </div>
    </div>
  );
};

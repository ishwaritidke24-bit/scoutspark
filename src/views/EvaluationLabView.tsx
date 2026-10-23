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

  // Simulated test cases
  const sampleTestCases = [
    {
      id: "TC-101",
      scenario: "Observability postmortem with mixed metrics & speculative cost claims",
      expected: "Ground incident facts; isolate cloud billing assumptions as hypothesis",
      actual: "Passed: 3 facts verified with URL citations, 2 hypotheses tagged",
      status: "PASS",
      latency: "1.2s",
      groundingScore: "100%"
    },
    {
      id: "TC-102",
      scenario: "Clinic network with unverified EHR migration timeline",
      expected: "Identify AthenaHealth integration fact; flag EHR migration as unknown",
      actual: "Passed: Missing information correctly placed in uncertainty block",
      status: "PASS",
      latency: "1.4s",
      groundingScore: "98.5%"
    },
    {
      id: "TC-103",
      scenario: "Air-gapped GovCloud cybersecurity startup with strict no-SaaS policy",
      expected: "Lower ICP fit score to <60%; flag air-gapped blocker in pipeline",
      actual: "Passed: Correctly classified as Not a Fit; prevent outbound email",
      status: "PASS",
      latency: "0.9s",
      groundingScore: "99.0%"
    },
    {
      id: "TC-104",
      scenario: "Pre-seed OSS project with 4k GitHub stars but zero enterprise revenue",
      expected: "Dampen fit score to unlikely (42%); highlight budget constraint",
      actual: "Passed: Flagged low willingness to pay; moved to nurture queue",
      status: "PASS",
      latency: "1.1s",
      groundingScore: "97.8%"
    }
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Header with Mandatory Illustrative Notice */}
      <div className="bg-white border-2 border-[#17271F] rounded-2xl p-6 shadow-[4px_4px_0px_#17271F] space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-editorial font-bold text-[#17271F]">
                Evaluation Lab & Grounding Benchmarks
              </h1>
              <span className="sticker-badge bg-[#FFEAE5] text-[#FF7054] border-[#FF7054] text-[10px]">
                Illustrative Demo Data
              </span>
            </div>
            <p className="text-xs text-[#4A5E52] mt-0.5">
              Demonstrates our planned framework for continuous factual grounding, hallucination prevention, and qualification precision.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-[#FAF7F0] p-3 rounded-xl border border-[#17271F] text-xs">
            <Info className="w-4 h-4 text-[#FF7054] shrink-0" />
            <div>
              <span className="font-bold text-[#17271F]">Factual Disclosure: </span>
              <span className="text-[#4A5E52]">All benchmark figures are illustrative prototype mocks for architecture evaluation.</span>
            </div>
          </div>
        </div>

        {/* Big Alert Banner */}
        <div className="p-3.5 bg-[#FAF7F0] border-1.5 border-[#17271F] rounded-xl flex items-start gap-3 text-xs text-[#17271F]">
          <ShieldAlert className="w-4 h-4 text-[#FF7054] shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Evaluation Methodology Design: </span>
            B2B prospect intelligence fails when AI models hallucinate company pain points, cite fabricated URLs, or claim executive quotes that never occurred. Our evaluation harness measures strict fact-to-source traceability before an email draft can ever reach a human founder's screen.
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
              <span className="italic text-[#4A5E52]">Demo Benchmark</span>
            </div>
          </div>
        ))}
      </div>

      {/* Simulated Automated Test Suite Matrix */}
      <div className="bg-white border-2 border-[#17271F] rounded-2xl p-6 shadow-[4px_4px_0px_#17271F] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E2D9C8]">
          <div>
            <div className="flex items-center gap-2">
              <FlaskConical className="w-4 h-4 text-[#FF7054]" />
              <h2 className="text-base font-editorial font-bold text-[#17271F]">
                Grounding & Precision Test Matrix
              </h2>
            </div>
            <p className="text-xs text-[#4A5E52]">
              Automated regression suite validating claim extraction and hallucination mitigation against curated B2B scenarios.
            </p>
          </div>

          <span className="text-xs font-mono font-bold bg-[#D8FF65] text-[#17271F] border border-[#17271F] px-2.5 py-1 rounded-lg">
            4 of 4 Tests Passing (Illustrative)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF7F0] border-b-2 border-[#17271F] text-[#17271F] font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-2.5 px-3">Test ID</th>
                <th className="py-2.5 px-3">Target Scenario</th>
                <th className="py-2.5 px-3">Expected Grounding Behavior</th>
                <th className="py-2.5 px-3">Actual Result</th>
                <th className="py-2.5 px-3">Score</th>
                <th className="py-2.5 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2D9C8]">
              {sampleTestCases.map(tc => (
                <tr key={tc.id} className="hover:bg-[#FAF7F0] transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-[#17271F]">{tc.id}</td>
                  <td className="py-3 px-3 font-medium text-[#17271F]">{tc.scenario}</td>
                  <td className="py-3 px-3 text-[#4A5E52]">{tc.expected}</td>
                  <td className="py-3 px-3 text-[#17271F] font-mono text-[11px]">{tc.actual}</td>
                  <td className="py-3 px-3 font-mono font-bold text-green-700">{tc.groundingScore}</td>
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

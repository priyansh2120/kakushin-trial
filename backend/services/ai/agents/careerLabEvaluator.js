import { generateStructuredResponse } from "../geminiClient.js";

const MODULE_RUBRICS = {
  "itr-filing": {
    title: "ITR Filing Mock",
    rubric: [
      "document readiness",
      "return type and regime reasoning",
      "tax-credit and prefill verification",
      "submission and e-verification awareness",
    ],
  },
  "tds-check": {
    title: "TDS & Form 16 Reconciliation",
    rubric: [
      "Form 16 understanding",
      "26AS / AIS mismatch detection",
      "salary-component review",
      "correct escalation before filing",
    ],
  },
  "epf-lab": {
    title: "EPF / UAN Service Lab",
    rubric: [
      "UAN/KYC readiness",
      "EPF passbook interpretation",
      "transfer vs withdrawal judgment",
      "status tracking and next action",
    ],
  },
  "regime-decoder": {
    title: "Old vs New Regime Decoder",
    rubric: [
      "deduction awareness",
      "regime comparison logic",
      "switching-rule awareness",
      "final recommendation quality",
    ],
  },
};

const SYSTEM_INSTRUCTION = `You are SmartLit's Career Finance Lab evaluator for Indian salaried professionals.

You evaluate mock attempts against a rubric and return only valid JSON.

Return this exact structure:
{
  "overallScore": number,
  "grade": "A+" | "A" | "B+" | "B" | "C" | "D" | "F",
  "summary": string,
  "strengths": [string],
  "mistakes": [string],
  "recommendedNextSteps": [string],
  "rubricBreakdown": [
    {
      "criterion": string,
      "score": number,
      "comment": string
    }
  ]
}

Scoring rules:
- score from 0 to 100
- be encouraging but honest
- do not invent facts outside the attempt
- prioritize procedural correctness over style
- recommendedNextSteps must be concrete`;

export const evaluateCareerLabAttempt = async ({
  moduleId,
  attemptData,
  userProfile,
}) => {
  const moduleConfig = MODULE_RUBRICS[moduleId];
  if (!moduleConfig) {
    throw new Error("Unsupported career lab module");
  }

  const prompt = `Evaluate this mock attempt for the module "${moduleConfig.title}".

User profile:
- Name: ${userProfile?.name || "Unknown"}
- Age: ${userProfile?.age || "Unknown"}
- Profession: ${userProfile?.profession || "Job"}
- Monthly income: ₹${userProfile?.income || "Not specified"}

Rubric criteria:
${moduleConfig.rubric.map((item, index) => `${index + 1}. ${item}`).join("\n")}

Submitted attempt:
- Scenario summary: ${attemptData.scenarioSummary}
- Chosen actions: ${attemptData.chosenActions}
- Checks performed: ${attemptData.checksPerformed}
- Final decision: ${attemptData.finalDecision}

Grade this attempt using the rubric.`;

  return await generateStructuredResponse(prompt, SYSTEM_INSTRUCTION);
};

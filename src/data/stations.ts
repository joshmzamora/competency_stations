import type { CompetencyPrompt, CompetencyStation } from "../types";

const chestTubePrompts: CompetencyPrompt[] = [
  {
    id: "chest-tube-clamping",
    stationId: "chest-tube",
    type: "verbal-response",
    title: "Safe Clamping",
    scenario: "The learner is asked whether it is acceptable to clamp a chest tube during routine care.",
    instructions: [
      "Explain when a chest tube may be clamped.",
      "State the safety concern with unnecessary clamping.",
      "Name the limited circumstances when brief clamping may occur."
    ],
    expectedResponse:
      "A chest tube should not be clamped unless specifically ordered by a physician. Brief clamping may be used when changing the Pleur-evac system or when assessing for air leaks.",
    explanation:
      "Unnecessary clamping can prevent air or fluid from escaping and may worsen the patient's condition. Brief clamping is reserved for specific troubleshooting or system-change situations.",
    evaluationCriteria: [
      "States that clamping requires a physician order unless in a brief approved circumstance.",
      "Identifies Pleur-evac system change as an appropriate brief-clamp scenario.",
      "Identifies air leak assessment as an appropriate brief-clamp scenario.",
      "Avoids describing routine or prolonged clamping as acceptable."
    ],
    criticalActions: ["Escalates uncertainty before clamping.", "Keeps clamping brief when used for troubleshooting."]
  },
  {
    id: "chest-tube-subcutaneous-emphysema",
    stationId: "chest-tube",
    type: "practical-assessment",
    title: "Palpation Finding",
    scenario: "During site assessment, the learner palpates around the insertion site and feels a crackling sensation.",
    instructions: [
      "Identify the expected abnormal finding.",
      "Describe where assessment should extend.",
      "Explain documentation and escalation steps."
    ],
    expectedResponse:
      "This is subcutaneous emphysema, often felt as crepitus or a Rice Krispies sensation. Assess around the insertion site, neck, and upper chest. Mark or document progression and notify the physician if it is a new finding.",
    explanation:
      "Subcutaneous emphysema can indicate air tracking into tissue. Progression matters, so the nurse should assess extent, document clearly, and escalate new findings.",
    evaluationCriteria: [
      "Correctly identifies subcutaneous emphysema or crepitus.",
      "Assesses insertion site, neck, and upper chest.",
      "Documents or marks progression.",
      "States that a new finding should be reported to the physician."
    ],
    notifyProviderWhen: ["New subcutaneous emphysema is found.", "Crepitus expands or progresses."]
  },
  {
    id: "chest-tube-stat-transport",
    stationId: "chest-tube",
    type: "scenario-walkthrough",
    title: "STAT CT Transport",
    scenario: "The patient is ordered continuous -20 cmH2O suction and needs a STAT CT Chest.",
    instructions: [
      "Describe how the patient should be transported.",
      "Maintain ordered suction during transport.",
      "Verbalize what equipment is needed before leaving the unit."
    ],
    expectedResponse: "Transport the patient with portable suction so the ordered continuous -20 cmH2O suction is maintained.",
    explanation:
      "A patient ordered to continuous suction should not be taken off suction for transport unless directed by the provider or facility policy. Portable suction maintains the prescribed therapy.",
    evaluationCriteria: [
      "States that portable suction is required.",
      "Maintains ordered -20 cmH2O suction during transport.",
      "Checks the drainage system and tubing before departure."
    ],
    criticalActions: ["Uses portable suction for STAT CT transport."]
  },
  {
    id: "chest-tube-adequate-suction",
    stationId: "chest-tube",
    type: "practical-assessment",
    title: "Adequate Suction Check",
    scenario: "The learner is at the bedside and must verify that the prescribed suction level has been achieved.",
    instructions: [
      "Point to the correct suction indicator.",
      "Explain what confirms adequate suction.",
      "Avoid relying only on wall regulator appearance."
    ],
    expectedResponse: "The orange float in the suction indicator window confirms the prescribed suction level has been achieved.",
    explanation:
      "The drainage system's suction indicator gives bedside confirmation that the ordered suction is active at the device.",
    evaluationCriteria: [
      "Identifies the orange float in the suction indicator window.",
      "States that the float confirms prescribed suction.",
      "Does not rely only on the wall suction dial."
    ]
  },
  {
    id: "chest-tube-output-notification",
    stationId: "chest-tube",
    type: "timed-emergency",
    title: "Output Escalation Threshold",
    scenario: "The drainage chamber shows a sudden increase in bright red, free-flowing blood.",
    instructions: [
      "State when the physician must be notified for chest tube output.",
      "Identify hemorrhage warning signs.",
      "Prioritize the immediate escalation."
    ],
    expectedResponse:
      "Notify the physician for output greater than 200-300 mL/hr for 2 consecutive hours, sudden unexpected increase, bright red free-flowing blood, or concern for possible hemorrhage.",
    explanation:
      "High-volume or bright red output can indicate active bleeding. Trend output and escalate promptly according to policy and provider expectations.",
    evaluationCriteria: [
      "States the 200-300 mL/hr for 2 consecutive hours threshold.",
      "Recognizes sudden unexpected increase as reportable.",
      "Recognizes bright red free-flowing blood as urgent.",
      "Names possible hemorrhage as the safety concern."
    ],
    notifyProviderWhen: [
      "Output is greater than 200-300 mL/hr for 2 consecutive hours.",
      "There is a sudden unexpected output increase.",
      "Drainage is bright red and free-flowing.",
      "Hemorrhage is suspected."
    ],
    timerSeconds: 60
  },
  {
    id: "chest-tube-air-leak",
    stationId: "chest-tube",
    type: "troubleshooting",
    title: "Air Leak Investigation",
    scenario: "The water seal chamber is bubbling. The learner must determine whether this is expected or requires troubleshooting.",
    instructions: [
      "Assess the water seal chamber.",
      "Differentiate intermittent and continuous bubbling.",
      "Describe how brief clamping helps locate the leak."
    ],
    expectedResponse:
      "Assess the water seal chamber. Intermittent bubbling with cough or exhalation is usually from the lung itself. Continuous bubbling suggests a leak in the system, tubing, or chest. Briefly clamp near the insertion site: if bubbling stops, it suggests an internal leak. If it stops farther down the tubing, it suggests a tubing leak. If bubbling continues near the drainage unit, suspect a defective drainage unit.",
    explanation:
      "Air leak troubleshooting is systematic. The water seal chamber shows bubbling patterns, and brief sequential clamping can help localize the source while minimizing risk.",
    evaluationCriteria: [
      "Uses the water seal chamber to assess bubbling.",
      "Differentiates intermittent bubbling from continuous bubbling.",
      "Correctly explains brief clamping near insertion site.",
      "Correctly explains tubing leak localization.",
      "Identifies possible defective drainage unit if bubbling persists near the unit."
    ],
    criticalActions: ["Keeps clamping brief.", "Escalates persistent or unexplained air leak."]
  },
  {
    id: "chest-tube-site-assessment",
    stationId: "chest-tube",
    type: "practical-assessment",
    title: "Insertion Site Assessment",
    scenario: "The learner performs a complete chest tube insertion-site assessment.",
    instructions: [
      "Assess the dressing.",
      "Assess the surrounding tissue.",
      "Assess tube security and anchoring."
    ],
    expectedResponse:
      "The dressing should be clean, dry, and intact. The occlusive dressing should be secure. Assess for redness, swelling, and discharge. Ensure the tubing is anchored securely.",
    explanation:
      "Site assessment looks for infection, dressing failure, drainage concerns, and tube movement risk.",
    evaluationCriteria: [
      "Checks that dressing is clean, dry, and intact.",
      "Checks that occlusive dressing is secure.",
      "Assesses for redness, swelling, and discharge.",
      "Ensures tubing is anchored securely."
    ]
  },
  {
    id: "chest-tube-dislodgement",
    stationId: "chest-tube",
    type: "timed-emergency",
    title: "Dislodged Chest Tube",
    scenario: "The chest tube becomes dislodged while the patient is being repositioned.",
    instructions: [
      "Call for help.",
      "Protect the insertion site.",
      "Describe the emergency dressing technique.",
      "Notify the provider."
    ],
    expectedResponse:
      "Call for help, notify the provider, apply an occlusive dressing with 4x4 gauze, and tape on 3 sides only to create a flutter valve.",
    explanation:
      "A three-sided dressing allows air to escape while reducing air entry. This is an emergency response and requires immediate help and provider notification.",
    evaluationCriteria: [
      "Calls for help immediately.",
      "Notifies the provider.",
      "Applies an occlusive dressing with 4x4 gauze.",
      "Tapes on 3 sides only.",
      "States that this creates a flutter valve."
    ],
    criticalActions: ["Calls for help.", "Uses three-sided occlusive dressing.", "Notifies provider."],
    timerSeconds: 45
  }
];

function placeholderPrompts(stationId: string, stationTitle: string): CompetencyPrompt[] {
  return [
    {
      id: `${stationId}-readiness`,
      stationId,
      type: "scenario-walkthrough",
      title: "Readiness Check",
      scenario: `The learner is beginning the ${stationTitle}.`,
      instructions: [
        "State the immediate safety checks.",
        "Describe patient identification and preparation.",
        "Explain what finding would require escalation."
      ],
      expectedResponse: "Use this placeholder until the real competency prompts are added.",
      explanation: "This station is scaffolded so the flow can be tested before final content is entered.",
      evaluationCriteria: ["Verifies patient and order context.", "Uses safe technique.", "Escalates abnormal findings."]
    }
  ];
}

export const stations: CompetencyStation[] = [
  {
    id: "chest-tube",
    title: "Chest Tube Competency",
    shortTitle: "Chest Tube",
    description: "Assessment, suction verification, output escalation, air leak troubleshooting, transport, and dislodgement response.",
    estimatedMinutes: 18,
    competencyType: "Practical assessment and emergency troubleshooting",
    accent: "scrub",
    prompts: chestTubePrompts
  },
  {
    id: "tracheostomy",
    title: "Tracheostomy Station",
    shortTitle: "Tracheostomy",
    description: "Airway safety, suctioning readiness, emergency equipment, and respiratory assessment.",
    estimatedMinutes: 15,
    competencyType: "Airway skills checkoff",
    accent: "monitor",
    prompts: placeholderPrompts("tracheostomy", "Tracheostomy Station")
  },
  {
    id: "foley-catheter",
    title: "Foley Catheter Station",
    shortTitle: "Foley",
    description: "Sterile insertion principles, maintenance care, securement, and CAUTI prevention.",
    estimatedMinutes: 14,
    competencyType: "Infection prevention checkoff",
    accent: "amber",
    prompts: placeholderPrompts("foley-catheter", "Foley Catheter Station")
  },
  {
    id: "central-line",
    title: "Central Line Station",
    shortTitle: "Central Line",
    description: "Line access, dressing concerns, hub scrub, blood return, and CLABSI prevention.",
    estimatedMinutes: 16,
    competencyType: "Line maintenance assessment",
    accent: "scrub",
    prompts: placeholderPrompts("central-line", "Central Line Station")
  },
  {
    id: "wound-vac",
    title: "Wound Vac Station",
    shortTitle: "Wound Vac",
    description: "Seal assessment, alarms, drainage monitoring, dressing integrity, and escalation.",
    estimatedMinutes: 12,
    competencyType: "Device troubleshooting",
    accent: "monitor",
    prompts: placeholderPrompts("wound-vac", "Wound Vac Station")
  },
  {
    id: "emergency-response",
    title: "Emergency Response Station",
    shortTitle: "Emergency",
    description: "Rapid assessment, communication, role clarity, escalation, and timed safety decisions.",
    estimatedMinutes: 20,
    competencyType: "Timed scenario response",
    accent: "trauma",
    prompts: placeholderPrompts("emergency-response", "Emergency Response Station")
  }
];

export function findStation(id: string) {
  return stations.find((station) => station.id === id);
}

export function allPrompts() {
  return stations.flatMap((station) => station.prompts);
}

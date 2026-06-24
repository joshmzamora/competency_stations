import type { CompetencyPrompt, CompetencyStation } from "../types";

const patientContext =
  "Emma Gonnadye is a 67-year-old female admitted with acute exacerbation of congestive heart failure, EF 20%, COPD, chronic atrial fibrillation, hypertension, diabetes, CAD with stent, and CKD stage III. She presented with worsening shortness of breath and cough. Report findings include atrial fibrillation, bilateral crackles, 3+ pitting edema to both lower extremities, and blood glucose 460 mg/dL.";

function prompt(prompt: CompetencyPrompt): CompetencyPrompt {
  return prompt;
}

const codeBluePrompts: CompetencyPrompt[] = [
  prompt({
    id: "code-blue-reversible-causes",
    stationId: "code-blue",
    type: "verbal-response",
    title: "",
    scenario: "What are some reversible causes of pulseless VTACH? Give examples of the H's and T's.",
    instructions: [
      "Give examples of H's.",
      "Give examples of T's.",
      "Connect them to reversible causes during pulseless VTACH."
    ],
    expectedResponse:
      "H's include hypovolemia, hypoxia, hydrogen ions or acidosis, and hypo/hyperkalemia. T's include tension pneumothorax, cardiac tamponade, toxins, pulmonary thrombosis, and coronary thrombosis.",
    explanation:
      "The H's and T's are reversible causes to consider during pulseless VTACH and cardiac arrest.",
  }),
  prompt({
    id: "code-blue-atropine-max-dose",
    stationId: "code-blue",
    type: "verbal-response",
    title: "",
    scenario: "What is the maximum dose of Atropine?",
    instructions: ["Answer verbally.", "State the maximum total dose."],
    expectedResponse: "The maximum dose of Atropine is 3 mg.",
  }),
  prompt({
    id: "code-blue-advanced-airway-breathing",
    stationId: "code-blue",
    type: "verbal-response",
    title: "",
    scenario: "Once an advanced airway is in place, how often should you give breaths? Give 1 breath every ___ seconds.",
    instructions: ["Answer verbally.", "State the seconds between breaths."],
    expectedResponse: "Once an advanced airway is in place, give 1 breath every 6 seconds.",
  }),
  prompt({
    id: "code-blue-pulseless-vtach-drug-therapy",
    stationId: "code-blue",
    type: "verbal-response",
    title: "",
    scenario: "What is the drug therapy for pulseless VTACH?",
    instructions: ["Answer verbally.", "Name the medication options."],
    expectedResponse: "Drug therapy for pulseless VTACH includes epinephrine, amiodarone, and lidocaine.",
  })
];

const hemodynamicsPrompts: CompetencyPrompt[] = [
  prompt({
    id: "hemodynamics-cvp-waveform-normal",
    stationId: "hemodynamics",
    type: "verbal-response",
    title: "",
    scenario: "What is the normal CVP for a healthy individual without valve dysfunction?",
    instructions: ["Answer verbally."],
    expectedResponse: "Normal CVP is 2-6 mmHg, with 0-8 mmHg accepted as a common variation.",
  }),
  prompt({
    id: "hemodynamics-a-wave-pr-interval",
    stationId: "hemodynamics",
    type: "verbal-response",
    title: "",
    scenario: "How much air is used to fully inflate the balloon on a standard adult PA/Swan-Ganz catheter, and how long should the PA catheter balloon be inflated?",
    instructions: ["Answer verbally."],
    expectedResponse: "A standard adult PA catheter balloon usually requires a maximum of 1.5 mL/cc of air to fully inflate. The balloon should be inflated for no more than 10 seconds or 2 respiratory cycles.",
  }),
  prompt({
    id: "hemodynamics-rv-vtach-pressure",
    stationId: "hemodynamics",
    type: "troubleshooting",
    title: "",
    scenario: "When calibrating the hemodynamic monitor and the catheter is already inserted in the patient, which calibration method is used?",
    instructions: ["Answer verbally."],
    expectedResponse: "Use in vivo calibration because the catheter is already inside the patient.",
  }),
  prompt({
    id: "hemodynamics-pa-dicrotic-wedge",
    stationId: "hemodynamics",
    type: "timed-emergency",
    title: "",
    scenario: "Where is the phlebostatic axis located?",
    instructions: ["Answer verbally."],
    expectedResponse:
      "The phlebostatic axis is located at the 4th intercostal space and the mid-anterior-posterior diameter of the chest, which is about halfway between the front and back of the chest.",
    timerSeconds: 60
  })
];

const chestTubePrompts: CompetencyPrompt[] = [
  prompt({
    id: "chest-tube-clamping",
    stationId: "chest-tube",
    type: "verbal-response",
    title: "",
    scenario: "Under what circumstance can you clamp a chest tube?",
    instructions: [
      "Answer verbally.",
      "Include the general rule and the brief exceptions."
    ],
    expectedResponse:
      "A chest tube should not be clamped unless specifically ordered by a physician. It may be briefly clamped when changing the Pleur-evac system or assessing for air leaks.",
    explanation: "Routine or prolonged clamping can create patient risk. Brief clamping is only for specific ordered or troubleshooting situations.",
  }),
  prompt({
    id: "chest-tube-subcutaneous-emphysema",
    stationId: "chest-tube",
    type: "verbal-response",
    title: "",
    scenario: "Give an example of an abnormal assessment finding when palpating around a chest tube site.",
    instructions: ["Answer verbally.", "Include what it feels like, where to assess, and what to do if new."],
    expectedResponse:
      "Assess for subcutaneous emphysema. Physical findings include crepitus, often described as a Rice Krispies sensation. Gently palpate around the insertion site and extend assessment to the neck and upper chest. Mark and document the extent to monitor progression, and notify the physician if this is a new finding.",
    explanation: "Subcutaneous emphysema can indicate air tracking through tissue and should be trended and escalated if new or progressing.",
    notifyProviderWhen: ["New subcutaneous emphysema is found.", "Crepitus expands or progresses."]
  }),
  prompt({
    id: "chest-tube-transport-suction",
    stationId: "chest-tube",
    type: "verbal-response",
    title: "",
    scenario: "What lethal complication is indicated by sudden tracheal deviation, severe dyspnea, and absent breath sounds on the affected side after a chest tube is clamped?",
    instructions: ["Answer verbally."],
    expectedResponse: "Tension pneumothorax.",
  }),
  prompt({
    id: "chest-tube-suction-indicator",
    stationId: "chest-tube",
    type: "verbal-response",
    title: "",
    scenario: "How do you assess that the chest tube is providing adequate suction to the prescribed rate?",
    instructions: ["Answer verbally.", "Name the visual indicator."],
    expectedResponse: "The orange float in the suction indicator window confirms that the desired suction has been achieved.",
    explanation: "The suction indicator confirms that prescribed suction is present at the drainage system.",
  }),
  prompt({
    id: "chest-tube-output-notification",
    stationId: "chest-tube",
    type: "verbal-response",
    title: "",
    scenario: "In what situation would you notify a physician regarding chest tube output?",
    instructions: ["Answer verbally.", "Include volume, sudden changes, and drainage character."],
    expectedResponse:
      "Notify the physician for output greater than 200-300 mL per hour for two consecutive hours, a sudden unexpected surge in output, bright red free-flowing blood, or concern for hemorrhage.",
    explanation: "High volume, sudden changes, and bright red free-flowing blood can indicate hemorrhage or another acute complication.",
    notifyProviderWhen: [
      "Output is greater than 200-300 mL/hr for 2 consecutive hours.",
      "There is a sudden unexpected output increase.",
      "Drainage is bright red and free-flowing.",
      "Hemorrhage is suspected."
    ]
  }),
  prompt({
    id: "chest-tube-air-leak",
    stationId: "chest-tube",
    type: "troubleshooting",
    title: "",
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
    criticalActions: ["Keeps clamping brief.", "Escalates persistent or unexplained air leak."]
  }),
  prompt({
    id: "chest-tube-site-assessment",
    stationId: "chest-tube",
    type: "practical-assessment",
    title: "",
    scenario: "How do you properly assess a chest tube site?",
    instructions: [
      "Answer verbally.",
      "Include dressing, infection signs, and tubing securement."
    ],
    expectedResponse:
      "Assess that the dressing is clean, dry, and intact and that the occlusive dressing is securely adhered to the skin. Assess for redness, swelling, or discharge at the insertion site. Check that tubing is anchored securely to prevent accidental pulling or dislodgement, using appropriate securement such as silk tape or Medipore tape per policy.",
    explanation: "Site assessment focuses on dressing integrity, infection signs, and secure tubing to reduce accidental dislodgement.",
  }),
  prompt({
    id: "chest-tube-dislodgement",
    stationId: "chest-tube",
    type: "timed-emergency",
    title: "",
    scenario: "The chest tube becomes dislodged while the patient is being repositioned. What do you do?",
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
    criticalActions: ["Calls for help.", "Uses three-sided occlusive dressing.", "Notifies provider."],
    timerSeconds: 45
  })
];

const codeBertPrompts: CompetencyPrompt[] = [
  prompt({
    id: "code-bert-violent-restraints-code-rush",
    stationId: "code-bert",
    type: "verbal-response",
    title: "",
    scenario: "Which code do you call if violent restraints are applied?",
    instructions: [
      "Answer verbally.",
      "Name the correct code."
    ],
    expectedResponse: "Call Code RUSH.",
    criticalActions: ["Identifies Code RUSH."]
  }),
  prompt({
    id: "code-bert-restraint-face-to-face",
    stationId: "code-bert",
    type: "verbal-response",
    title: "",
    scenario: "How long does the provider have to see the patient face-to-face once violent restraints are applied?",
    instructions: [
      "Answer verbally.",
      "State the time requirement."
    ],
    expectedResponse: "The provider must see the patient face-to-face within one hour.",
    criticalActions: ["States one hour."]
  }),
  prompt({
    id: "code-bert-acronym",
    stationId: "code-bert",
    type: "verbal-response",
    title: "",
    scenario: "What does BERT stand for?",
    instructions: [
      "Answer verbally.",
      "State the full phrase."
    ],
    expectedResponse: "BERT stands for Behavioral Emergency Response Team.",
  }),
  prompt({
    id: "code-bert-cancelled-documentation",
    stationId: "code-bert",
    type: "verbal-response",
    title: "",
    scenario: "Do you document anything on the BERT flow sheet if the BERT is cancelled?",
    instructions: [
      "Answer yes or no.",
      "State whether documentation is still required."
    ],
    expectedResponse: "Yes. Documentation is still completed on the BERT flow sheet if the BERT is cancelled.",
  }),
  prompt({
    id: "code-bert-family-member",
    stationId: "code-bert",
    type: "verbal-response",
    title: "",
    scenario: "You can call a Code BERT on a family member. True or false?",
    instructions: [
      "Answer true or false.",
      "Clarify who Code BERT applies to."
    ],
    expectedResponse: "False. Code BERT is not called on a family member.",
  }),
  prompt({
    id: "code-bert-debrief-form",
    stationId: "code-bert",
    type: "verbal-response",
    title: "",
    scenario: "When does the debriefing occur and where do you find the form?",
    instructions: [
      "State when the debrief occurs.",
      "State where the form is located."
    ],
    expectedResponse: "The debriefing occurs when the BERT has ended. The form is on the Hub.",
  }),
  prompt({
    id: "code-bert-call-number",
    stationId: "code-bert",
    type: "verbal-response",
    title: "",
    scenario: "How do you call a Code BERT?",
    instructions: [
      "Answer verbally.",
      "State the number to call."
    ],
    expectedResponse: "Call 3333.",
    criticalActions: ["States 3333."]
  }),
  prompt({
    id: "code-bert-activation-triggers",
    stationId: "code-bert",
    type: "scenario-walkthrough",
    title: "",
    scenario: "What are the primary criteria or triggers for activating a Code BERT?",
    instructions: [
      "Answer verbally.",
      "Name behavioral signs that create immediate safety concern."
    ],
    expectedResponse:
      "Activate Code BERT for a patient exhibiting escalating verbal aggression, physical threats, acute disorientation with combativeness, or behaviors that pose an immediate safety risk to themselves or staff.",
    explanation:
      "Code BERT is intended for behavioral emergencies where escalation creates a safety risk for the patient or staff.",
    criticalActions: ["Recognizes immediate safety risk."]
  })
];

const strokePrompts: CompetencyPrompt[] = [
  prompt({
    id: "stroke-activity-safe-unsafe",
    stationId: "stroke",
    type: "activity",
    title: "",
    scenario: "Sort each post-Tenecteplase action into Safe or Unsafe.",
    instructions: [
      "Review each card on the learner screen.",
      "Sort the action into Safe or Unsafe.",
      "Explain any item that could increase bleeding or procedural risk."
    ],
    activity: {
      question: "Sort each post-Tenecteplase action into Safe or Unsafe.",
      itemBankLabel: "Action cards",
      itemBank: [
        "Stool softener",
        "NGT insertion",
        "Accuchek",
        "Blood draw",
        "Tylenol",
        "Foley catheter insertion",
        "Physical therapy / 14 hours post TNK",
        "Heparin"
      ],
      columns: [
        { title: "Safe", items: [] },
        { title: "Unsafe", items: [] }
      ]
    },
    answerKey: [
      {
        title: "Safe",
        items: ["Stool softener", "Accuchek", "Tylenol", "Physical therapy / 14 hours post TNK"]
      },
      {
        title: "Unsafe",
        items: ["NGT insertion", "Blood draw", "Foley catheter insertion", "Heparin"]
      }
    ],
    expectedResponse:
      "Safe: stool softener, Accuchek, Tylenol, and physical therapy / 14 hours post TNK. Unsafe: NGT insertion, blood draw, Foley catheter insertion, and heparin.",
    explanation:
      "This activity reinforces post-Tenecteplase restrictions and the need to avoid unnecessary invasive procedures or anticoagulant exposure during the restricted period.",
    criticalActions: ["Does not identify heparin or invasive tube insertion as safe during the restricted period."]
  }),
  prompt({
    id: "stroke-activity-eligibility",
    stationId: "stroke",
    type: "activity",
    title: "",
    scenario: "Sort each patient factor into Eligible or Ineligible for Tenecteplase consideration.",
    instructions: [
      "Review each eligibility card on the learner screen.",
      "Sort the factor into Eligible or Ineligible.",
      "Explain any contraindication or exclusion factor."
    ],
    activity: {
      question: "Sort each patient factor into Eligible or Ineligible for Tenecteplase consideration.",
      itemBankLabel: "Eligibility cards",
      itemBank: [
        "Last known well 3 hours ago",
        "Ischemic stroke",
        "No signs of intracranial hemorrhage",
        "BP 150/60",
        "16 y/o",
        "Major surgery within 2 months",
        "Active GI bleeding",
        "INR 4.5"
      ],
      columns: [
        { title: "Eligible", items: [] },
        { title: "Ineligible", items: [] }
      ]
    },
    answerKey: [
      {
        title: "Eligible",
        items: ["Last known well 3 hours ago", "Ischemic stroke", "No signs of intracranial hemorrhage", "BP 150/60"]
      },
      {
        title: "Ineligible",
        items: ["16 y/o", "Major surgery within 2 months", "Active GI bleeding", "INR 4.5"]
      }
    ],
    expectedResponse:
      "Eligible: last known well 3 hours ago, ischemic stroke, no signs of intracranial hemorrhage, and BP 150/60. Ineligible: 16 years old, major surgery within 2 months, active GI bleeding, and INR 4.5.",
    explanation:
      "This activity reinforces common inclusion and exclusion cues before Tenecteplase administration.",
    criticalActions: ["Does not miss active bleeding, high INR, or age exclusion cues."]
  }),
  prompt({
    id: "stroke-activity-risk-factors",
    stationId: "stroke",
    type: "activity",
    title: "",
    scenario: "Review Emma Gonnadye's case file and select the stroke risk factors that specifically apply to her.",
    instructions: [
      "Review the full risk-factor checklist on the learner screen.",
      "Select only the items supported by Emma's case file.",
      "Leave anything not documented in the case unselected."
    ],
    activity: {
      mode: "select",
      question: "Which stroke risk factors apply to Emma Gonnadye?",
      itemBankLabel: "Patient-specific stroke risk checklist",
      itemBank: [
        "You have high blood pressure.",
        "You're overweight.",
        "You have unhealthy cholesterol levels.",
        "You have atrial fibrillation.",
        "You have atrial flutter.",
        "You've had a heart attack.",
        "You have narrowed arteries.",
        "You have diabetes.",
        "You are a man.",
        "You are an African American.",
        "You are an Alaska Native.",
        "You are an American Indian.",
        "You rarely exercise.",
        "You often eat salty, fried, or greasy foods.",
        "You smoke.",
        "You have more than 2 alcoholic drinks per day.",
        "You're over age 60.",
        "A parent, brother, or sister has had a stroke."
      ],
      columns: [
        { title: "Applies to Emma", items: [] }
      ]
    },
    answerKey: [
      {
        title: "Applies to Emma",
        items: [
          "You have high blood pressure.",
          "You're overweight.",
          "You have atrial fibrillation.",
          "You have narrowed arteries.",
          "You have diabetes.",
          "You're over age 60."
        ]
      },
      {
        title: "Not supported by case file",
        items: [
          "You have unhealthy cholesterol levels.",
          "You have atrial flutter.",
          "You've had a heart attack.",
          "You are a man.",
          "You are an African American.",
          "You are an Alaska Native.",
          "You are an American Indian.",
          "You rarely exercise.",
          "You often eat salty, fried, or greasy foods.",
          "You smoke.",
          "You have more than 2 alcoholic drinks per day.",
          "A parent, brother, or sister has had a stroke."
        ]
      }
    ],
    expectedResponse:
      "Emma's documented stroke risk factors are hypertension, overweight/obesity, chronic atrial fibrillation, narrowed arteries/CAD with stent, diabetes, and age over 60.",
    explanation:
      "Emma is 67, weighs 90 kg, and has hypertension, diabetes, CAD with stent, and chronic atrial fibrillation documented in the case file. Other listed risk factors are not documented in the provided case.",
    criticalActions: [
      "Selects only risk factors supported by Emma's case file.",
      "Recognizes atrial fibrillation, diabetes, hypertension, age over 60, overweight/obesity, and CAD/narrowed arteries as patient-specific stroke risks."
    ]
  }),
  prompt({
    id: "stroke-pre-tenecteplase-bp-limit",
    stationId: "stroke",
    type: "verbal-response",
    title: "",
    scenario: "What is the upper limit of blood pressure allowed prior to Tenecteplase administration?",
    instructions: [
      "Answer verbally.",
      "State both the systolic and diastolic limit."
    ],
    expectedResponse:
      "Blood pressure must be less than 185/110 mmHg before Tenecteplase can be administered.",
    explanation:
      "Tenecteplase should not be administered until blood pressure is below the pre-treatment threshold.",
    criticalActions: ["Does not administer Tenecteplase above the pre-treatment BP limit."]
  }),
  prompt({
    id: "stroke-post-tenecteplase-bp-limit",
    stationId: "stroke",
    type: "verbal-response",
    title: "",
    scenario: "What is the upper limit of blood pressure allowed after Tenecteplase administration?",
    instructions: [
      "Answer verbally.",
      "State both the systolic and diastolic limit."
    ],
    expectedResponse:
      "Blood pressure must remain less than 180/105 mmHg after Tenecteplase administration.",
    explanation:
      "Post-Tenecteplase blood pressure must remain below the stricter post-treatment threshold.",
    criticalActions: ["Escalates post-treatment BP above threshold."]
  }),
  prompt({
    id: "stroke-vital-signs-neuro-assessment-frequency",
    stationId: "stroke",
    type: "verbal-response",
    title: "",
    scenario: "How often should vital signs and neurological assessments be completed following Tenecteplase administration?",
    instructions: [
      "Answer verbally.",
      "Include the pre-administration check.",
      "State all post-administration intervals.",
      "State the 24-hour NIHSS requirement."
    ],
    expectedResponse:
      "Complete vital signs and neurological assessment once within 15 minutes prior to administration, every 15 minutes for the first 2 hours, every 30 minutes for the next 6 hours, and every 1 hour for the next 16 hours for 24 hours total. A full NIHSS must be completed 24 hours after Tenecteplase initiation and documented in the EMR.",
    explanation:
      "The post-Tenecteplase monitoring schedule covers 24 hours and includes a full NIHSS at the 24-hour mark.",
    criticalActions: ["Does not miss the 24-hour NIHSS requirement."]
  }),
  prompt({
    id: "stroke-tenecteplase-adverse-reactions",
    stationId: "stroke",
    type: "verbal-response",
    title: "",
    scenario: "What adverse reactions should be monitored for following Tenecteplase administration?",
    instructions: [
      "Answer verbally.",
      "Name the major adverse reactions."
    ],
    expectedResponse:
      "Monitor for bleeding, neurological changes, angioedema, and anaphylaxis.",
    explanation:
      "These are the priority complications to monitor for after Tenecteplase administration.",
    criticalActions: ["Recognizes neurological change or bleeding as urgent."]
  }),
  prompt({
    id: "stroke-rn-transfer-requirement",
    stationId: "stroke",
    type: "verbal-response",
    title: "",
    scenario: "What is the time to treatment window for Tenecteplase?",
    instructions: [
      "Answer verbally.",
      "State the time window in hours."
    ],
    expectedResponse:
      "The time to treatment window for Tenecteplase is up to 4.5 hours from the last known well time.",
    explanation:
      "Tenecteplase can be administered up to 4.5 hours after the patient was last known to be at their baseline.",
    criticalActions: ["Recognizes the 4.5-hour treatment window."]
  }),
  prompt({
    id: "stroke-education-documentation",
    stationId: "stroke",
    type: "verbal-response",
    title: "",
    scenario: "What education and documentation is required for stroke patients?",
    instructions: [
      "Answer verbally.",
      "Include education, care plan, and patient-specific risk factors."
    ],
    expectedResponse:
      "Document individualized stroke education and the plan of care, including the patient's personal stroke risk factors.",
    explanation:
      "Stroke education and care planning should be individualized and documented with patient-specific risk factors.",
  }),
  prompt({
    id: "stroke-dysphagia-before-po",
    stationId: "stroke",
    type: "verbal-response",
    title: "",
    scenario: "What must be completed before giving a stroke patient anything by mouth?",
    instructions: [
      "Answer verbally.",
      "Apply this to food, fluids, and oral medications."
    ],
    expectedResponse:
      "A dysphagia screen must be completed before administering food, fluids, or oral medications.",
    explanation:
      "Stroke patients must be screened for swallowing safety before anything is given by mouth.",
    criticalActions: ["Does not give anything by mouth before dysphagia screening."]
  }),
  prompt({
    id: "stroke-antithrombotic-timing",
    stationId: "stroke",
    type: "verbal-response",
    title: "",
    scenario: "When can antithrombotic medications be administered after Tenecteplase administration?",
    instructions: [
      "Answer verbally.",
      "State the minimum time after Tenecteplase."
    ],
    expectedResponse:
      "Do not administer antithrombotic medications until 24 hours after Tenecteplase administration.",
    explanation:
      "Antithrombotic medications are held until 24 hours after Tenecteplase administration.",
    criticalActions: ["Does not administer antithrombotics before 24 hours."]
  })
];

const cautiClabsiPrompts: CompetencyPrompt[] = [
  prompt({
    id: "cauti-foley-care-frequency",
    stationId: "cauti-clabsi-prevention",
    type: "verbal-response",
    title: "",
    scenario: "How often do you do peri care/foley care?",
    instructions: ["Answer verbally.", "State the routine frequency."],
    expectedResponse: "Peri care/foley care is done once a shift.",
  }),
  prompt({
    id: "cauti-clabsi-chg-bath-frequency",
    stationId: "cauti-clabsi-prevention",
    type: "verbal-response",
    title: "",
    scenario: "How often should you do a CHG bath if the patient has a central line or a Foley?",
    instructions: ["Answer verbally.", "State the routine CHG bath frequency."],
    expectedResponse: "CHG bath should be done every 24 hours if the patient has a central line or a Foley.",
  }),
  prompt({
    id: "clabsi-scrub-the-hub-time",
    stationId: "cauti-clabsi-prevention",
    type: "verbal-response",
    title: "",
    scenario: "How long do you scrub the hub when accessing the central line?",
    instructions: ["Answer verbally.", "State the minimum scrub time."],
    expectedResponse: "Scrub the hub for 15 seconds when accessing the central line.",
  }),
  prompt({
    id: "clabsi-central-line-dressing-change",
    stationId: "cauti-clabsi-prevention",
    type: "verbal-response",
    title: "",
    scenario: "How often do you change the central line dressing?",
    instructions: ["Answer verbally.", "State the routine interval and as-needed condition."],
    expectedResponse: "Change the central line dressing every 7 days or as needed.",
  })
];

const pressureInjuryPrompts: CompetencyPrompt[] = [
  prompt({
    id: "pressure-injury-two-rn-skin-assessment",
    stationId: "pressure-injury-station",
    type: "verbal-response",
    title: "",
    scenario: "When do you perform 2 RN skin assessments?",
    instructions: [
      "Answer verbally.",
      "Name each situation that requires a 2 RN skin assessment."
    ],
    expectedResponse:
      "Perform 2 RN skin assessments on admission, transfer, and post-procedure when the procedure is longer than 2 hours."
  }),
  prompt({
    id: "pressure-injury-wound-photography",
    stationId: "pressure-injury-station",
    type: "verbal-response",
    title: "",
    scenario: "When do you perform wound photography?",
    instructions: [
      "Answer verbally.",
      "State event-based wound photography timing.",
      "State frequency for acute wounds.",
      "State frequency for chronic wounds."
    ],
    expectedResponse:
      "Photograph wounds on admission/presentation, with a change in wound condition such as deterioration or improvement, pre and post debridement, and at discharge or transfer. Photograph acute wounds at least weekly. Photograph chronic wounds at least monthly."
  })
];

const glycemicControlPrompts: CompetencyPrompt[] = [
  prompt({
    id: "glycemic-control-tpn-tube-feed-interruption",
    stationId: "glycemic-control",
    type: "verbal-response",
    title: "",
    scenario: "If TPN or tube feeds are interrupted, what is the correct action per protocol?",
    instructions: [
      "Answer verbally.",
      "Name the IV fluid.",
      "State the rate and maximum rate."
    ],
    expectedResponse:
      "Start D10 IV at the previous tube-feed rate or TPN rate, with a maximum rate of 40 mL/hr."
  }),
  prompt({
    id: "glycemic-control-insulin-drip-checks",
    stationId: "glycemic-control",
    type: "verbal-response",
    title: "",
    scenario: "When the patient is on an insulin drip, how often should the blood sugar be checked?",
    instructions: ["Answer verbally.", "State the monitoring frequency."],
    expectedResponse: "Blood sugar should be checked every hour while the patient is on an insulin drip."
  }),
  prompt({
    id: "glycemic-control-provider-notification",
    stationId: "glycemic-control",
    type: "verbal-response",
    title: "",
    scenario: "What blood sugar result would prompt you to notify the provider?",
    instructions: [
      "Answer verbally.",
      "State the high blood sugar threshold.",
      "State the low blood sugar threshold."
    ],
    expectedResponse: "Notify the provider for blood sugar 180 or higher, or less than 70."
  }),
  prompt({
    id: "glycemic-control-lantus-npo",
    stationId: "glycemic-control",
    type: "verbal-response",
    title: "",
    scenario: "If the patient has Lantus ordered at bedtime and is NPO after midnight, per protocol what should the nurse do?",
    instructions: [
      "Answer verbally.",
      "State what to do with the Lantus.",
      "State who to contact for the next recommendation."
    ],
    expectedResponse:
      "Hold Lantus and ask the provider for a recommendation because the patient is NPO."
  }),
  prompt({
    id: "glycemic-control-capillary-testing-inaccurate",
    stationId: "glycemic-control",
    type: "group-response",
    title: "",
    scenario: "Each person should name one reason the patient's finger-stick capillary blood testing may be inaccurate.",
    instructions: [
      "Everyone answers this prompt.",
      "Each participant names one reason.",
      "Do not repeat the same reason if another participant has already named it."
    ],
    expectedResponse:
      "Reasons include hypotension, severe dehydration, shock, peripheral vascular disease, edema, and the patient being on pressors."
  })
];

export const stations: CompetencyStation[] = [
  {
    id: "code-blue",
    title: "Code Blue",
    shortTitle: "Code Blue",
    description: "Unstable atrial fibrillation, pulseless VT, CPR, defibrillation, ACLS medications, ROSC, bradycardia, and reversible causes.",
    estimatedMinutes: 10,
    competencyType: "Timed emergency response",
    accent: "trauma",
    prompts: codeBluePrompts
  },
  {
    id: "hemodynamics",
    title: "Hemodynamics",
    shortTitle: "Hemodynamics",
    description: "Post-arrest hypotension flow with timed pressure tubing setup, PA catheter waveform progression, wedge safety, square wave testing, and HemoSphere monitoring.",
    estimatedMinutes: 20,
    competencyType: "PA catheter and arterial line simulation",
    accent: "monitor",
    prompts: hemodynamicsPrompts
  },
  {
    id: "chest-tube",
    title: "Chest tube",
    shortTitle: "Chest tube",
    description: "Clamping rules, site assessment, suction checks, transport with suction, output escalation, air leak troubleshooting, and emergency dislodgement response.",
    estimatedMinutes: 10,
    competencyType: "Chest tube safety checkoff",
    accent: "scrub",
    prompts: chestTubePrompts
  },
  {
    id: "code-bert",
    title: "Code BERT",
    shortTitle: "Code BERT",
    description: "Behavioral emergency activation, violent restraint escalation, documentation, debriefing, call process, and safety triggers.",
    estimatedMinutes: 8,
    competencyType: "Behavioral emergency response",
    accent: "trauma",
    prompts: codeBertPrompts
  },
  {
    id: "stroke",
    title: "Stroke",
    shortTitle: "Stroke",
    description: "BEFAST, Code CVA, Tenecteplase preparation, BP thresholds, neuro checks, post-TNK restrictions, dysphagia screening, and education.",
    estimatedMinutes: 10,
    competencyType: "Stroke response and thrombolytic safety",
    accent: "monitor",
    prompts: strokePrompts
  },
  {
    id: "cauti-clabsi-prevention",
    title: "CAUTI/CLABSI prevention",
    shortTitle: "CAUTI/CLABSI",
    description: "Foley and central line maintenance checks focused on infection-prevention details staged at the bedside.",
    estimatedMinutes: 5,
    competencyType: "Infection prevention checkoff",
    accent: "scrub",
    prompts: cautiClabsiPrompts
  },
  {
    id: "pressure-injury-station",
    title: "Pressure Injury Station",
    shortTitle: "Pressure Injury",
    description: "Return-from-procedure skin assessment, 4-eyes assessment, DTI identification, dressing review, and wound staging.",
    estimatedMinutes: 10,
    competencyType: "Pressure injury assessment",
    accent: "amber",
    prompts: pressureInjuryPrompts
  },
  {
    id: "glycemic-control",
    title: "Glycemic Control",
    shortTitle: "Glycemic Control",
    description: "TPN and tube-feed interruptions, insulin drip monitoring, glucose escalation thresholds, NPO basal insulin safety, and capillary testing accuracy.",
    estimatedMinutes: 8,
    competencyType: "Glycemic management protocol",
    accent: "scrub",
    prompts: glycemicControlPrompts
  }
];

export const scenarioPatientContext = patientContext;

export function findStation(id: string) {
  return stations.find((station) => station.id === id);
}

export function allPrompts() {
  return stations.flatMap((station) => station.prompts);
}

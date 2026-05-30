import type { CompetencyPrompt, CompetencyStation } from "../types";

const patientContext =
  "Emma Gonnadye is a 67-year-old female admitted with acute exacerbation of congestive heart failure, EF 20%, COPD, chronic atrial fibrillation, hypertension, diabetes, CAD with stent, and CKD stage III. She presented with worsening shortness of breath and cough. Report findings include atrial fibrillation, bilateral crackles, 3+ pitting edema to both lower extremities, and blood glucose 460 mg/dL.";

function prompt(prompt: CompetencyPrompt): CompetencyPrompt {
  return prompt;
}

const codeBluePrompts: CompetencyPrompt[] = [
  prompt({
    id: "code-blue-unstable-afib",
    stationId: "code-blue",
    type: "timed-emergency",
    title: "",
    scenario:
      "Emma is pale, cool, mildly diaphoretic, anxious, and in atrial fibrillation with HR 160, BP 78/50, RR 26, and SpO2 on 2 L nasal cannula. What rhythm and instability do you recognize, and what cardioversion preparation is required?",
    instructions: [
      "Recognize the rhythm and hemodynamic instability.",
      "Prepare for synchronized cardioversion.",
      "Gather immediate safety and airway supplies.",
      "Verbalize pad placement, Zoll setup, sedation considerations, and all-clear process."
    ],
    expectedResponse:
      "Recognize unstable atrial fibrillation and prepare synchronized cardioversion. Gather crash cart, suction, oxygen or nasal cannula, and sedation per provider direction. Place pads correctly, select synchronized cardioversion on the Zoll, choose ordered joules, verify everyone is clear, and deliver therapy safely.",
    explanation:
      "The document frames unstable atrial fibrillation as the initial rhythm that progresses into a code situation. The expected intervention is rapid recognition and preparation for cardioversion using correct Zoll function and safety workflow.",
    evaluationCriteria: [
      "Identifies unstable atrial fibrillation with hypotension as requiring urgent synchronized cardioversion.",
      "Gets crash cart, suction, oxygen support, pads, and sedation materials.",
      "Uses correct pad placement and Zoll synchronized cardioversion function.",
      "Selects joules per order or protocol and performs an all-clear before shock."
    ],
    criticalActions: ["Recognizes instability.", "Uses synchronized cardioversion workflow.", "Maintains shock safety."],
    timerSeconds: 90
  }),
  prompt({
    id: "code-blue-pulseless-vtach",
    stationId: "code-blue",
    type: "timed-emergency",
    title: "",
    scenario: "Emma becomes unresponsive and the rhythm changes to pulseless ventricular tachycardia. What are your immediate assessment, CPR, ventilation, defibrillation, and medication actions?",
    instructions: [
      "Assess pulse and breathing.",
      "Start CPR immediately if pulseless.",
      "Verbalize defibrillation sequence and CPR timing.",
      "Identify medications used during the shockable rhythm algorithm."
    ],
    expectedResponse:
      "Assess pulse and breathing. With no pulse, start CPR and provide bag-mask ventilation. Defibrillate at 120 J, resume CPR for 2 minutes, repeat defibrillation at 150 J, give epinephrine 1 mg every 3-5 minutes after the second shock, defibrillate at 200 J, and give amiodarone 300 mg then 150 mg or lidocaine 1-1.5 mg/kg then 0.5-0.75 mg/kg.",
    explanation:
      "The scenario expects learners to move from rhythm recognition to high-quality CPR, defibrillation, airway support, and ACLS medication sequencing.",
    evaluationCriteria: [
      "Checks pulse and breathing before declaring pulseless arrest.",
      "Starts CPR immediately and uses bag-mask ventilation.",
      "Verbalizes defibrillation at 120 J, 150 J, then 200 J as written in the scenario.",
      "Administers epinephrine 1 mg every 3-5 minutes after the second shock.",
      "Identifies amiodarone or lidocaine dosing options."
    ],
    criticalActions: ["Starts CPR without delay.", "Defibrillates shockable rhythm.", "Uses correct medication sequence."],
    timerSeconds: 120
  }),
  prompt({
    id: "code-blue-shock-sequence",
    stationId: "code-blue",
    type: "verbal-response",
    title: "",
    scenario: "Emma is in pulseless VTACH. What defibrillation energy sequence and CPR timing are listed in the scenario?",
    instructions: [
      "Start at first shock.",
      "Include CPR timing.",
      "State the second and third shock energies."
    ],
    expectedResponse:
      "Defibrillate at 120 J, resume CPR for 2 minutes, repeat defibrillation at 150 J, continue CPR, then defibrillate at 200 J.",
    explanation:
      "The DOCX gives a staged defibrillation sequence of 120 J, CPR for 2 minutes, 150 J, then 200 J.",
    evaluationCriteria: [
      "States first defibrillation at 120 J.",
      "States CPR for 2 minutes.",
      "States repeat defibrillation at 150 J.",
      "States defibrillation at 200 J."
    ],
    criticalActions: ["Does not delay CPR between shocks."]
  }),
  prompt({
    id: "code-blue-shockable-rhythm-meds",
    stationId: "code-blue",
    type: "verbal-response",
    title: "",
    scenario:
      "During the pulseless VTACH algorithm, what medications, timing, and doses are expected in this station?",
    instructions: [
      "State when epinephrine is given.",
      "State epinephrine dose and interval.",
      "State amiodarone or lidocaine options."
    ],
    expectedResponse:
      "Administer epinephrine 1 mg every 3-5 minutes only after the second shock. Administer amiodarone 300 mg then 150 mg, or lidocaine 1-1.5 mg/kg followed by 0.5-0.75 mg/kg.",
    explanation:
      "The DOCX specifies epinephrine only after the second shock and gives amiodarone and lidocaine dosing options.",
    evaluationCriteria: [
      "States epinephrine 1 mg.",
      "States every 3-5 minutes.",
      "States epinephrine is given only after the second shock.",
      "States amiodarone 300 mg then 150 mg.",
      "States lidocaine 1-1.5 mg/kg then 0.5-0.75 mg/kg as an option."
    ],
    criticalActions: ["Does not give epinephrine before the second shock."]
  }),
  prompt({
    id: "code-blue-reversible-causes",
    stationId: "code-blue",
    type: "verbal-response",
    title: "",
    scenario: "During the code, what H's and T's should the team consider as reversible causes?",
    instructions: [
      "Name the H's and T's from memory.",
      "Prioritize causes relevant to Emma's clinical picture.",
      "Explain how the team should use reversible causes during the code."
    ],
    expectedResponse:
      "Consider hypovolemia, hypoxia, hydrogen ion or acidosis, hypo/hyperkalemia, tension pneumothorax, cardiac tamponade, toxins, pulmonary thrombosis, and coronary thrombosis.",
    explanation:
      "The document lists H's and T's as part of the Code Blue card workflow and suggests using cards with distractors.",
    evaluationCriteria: [
      "Names hypovolemia, hypoxia, hydrogen ion/acidosis, and potassium abnormality.",
      "Names tension pneumothorax, tamponade, toxins, pulmonary thrombosis, and coronary thrombosis.",
      "Uses the list to guide team assessment rather than reciting without action."
    ]
  }),
  prompt({
    id: "code-blue-rosc-bradycardia",
    stationId: "code-blue",
    type: "timed-emergency",
    title: "",
    scenario: "After ROSC, Emma has HR 42, BP 80/50, SpO2 99%, RR 12, and an ETT in place with 100% FiO2. What first-line medication, dose, repeat interval, maximum dose, and next escalation are expected?",
    instructions: [
      "Recognize symptomatic bradycardia after ROSC.",
      "Select the appropriate first-line medication and dose.",
      "Verbalize maximum dose and next escalation."
    ],
    expectedResponse:
      "Recognize symptomatic bradycardia. Give atropine 1 mg every 3-5 minutes to a maximum of 3 mg. Prepare for transcutaneous pacing if unstable. Additional medical management may include epinephrine infusion at 2-10 mcg/min or dopamine at 5-20 mcg/kg/min.",
    explanation:
      "The scenario expects learners to choose correct medication from distractors, identify dosing, and recognize need for transcutaneous pacing.",
    evaluationCriteria: [
      "Recognizes symptomatic bradycardia with hypotension.",
      "Selects atropine 1 mg as first-line medication.",
      "States repeat interval every 3-5 minutes and maximum 3 mg.",
      "Identifies epinephrine or dopamine infusion as additional management.",
      "Prepares for transcutaneous pacing if instability persists."
    ],
    criticalActions: ["Does not choose incorrect medication or incorrect dose.", "Escalates to pacing."],
    timerSeconds: 90
  }),
  prompt({
    id: "code-blue-transcutaneous-pacing",
    stationId: "code-blue",
    type: "practical-assessment",
    title: "",
    scenario:
      "Emma remains symptomatically bradycardic after ROSC. What transcutaneous pacing setup must you verbalize on the Zoll?",
    instructions: [
      "Recognize the need for transcutaneous pacemaker.",
      "Select output and rate.",
      "Verbalize 100% capture.",
      "Explain the 4:1 button on the Zoll machine."
    ],
    expectedResponse:
      "Recognize the need for transcutaneous pacing. Select the output in milliamps and the rate, verbalize 100% capture, and be knowledgeable about the 4:1 button on the Zoll machine.",
    explanation:
      "The DOCX specifically expects learners to recognize TCP need, select output and rate, verbalize 100% capture, and know the 4:1 button.",
    evaluationCriteria: [
      "Recognizes need for transcutaneous pacing.",
      "Selects output in mA.",
      "Selects pacing rate.",
      "Verbalizes 100% capture.",
      "Explains or identifies the 4:1 Zoll function."
    ],
    criticalActions: ["Recognizes pacing need.", "Confirms capture."]
  }),
  prompt({
    id: "code-blue-bradycardia-infusion-options",
    stationId: "code-blue",
    type: "verbal-response",
    title: "",
    scenario:
      "What other medical management may be used for symptomatic bradycardia after atropine and while preparing pacing?",
    instructions: [
      "State epinephrine infusion dose range.",
      "State dopamine infusion dose range.",
      "Connect both options to symptomatic bradycardia management."
    ],
    expectedResponse:
      "Additional medical management for symptomatic bradycardia includes epinephrine infusion at 2-10 mcg/min and dopamine infusion at 5-20 mcg/kg/min.",
    explanation:
      "The DOCX lists epinephrine 2-10 mcg/min and dopamine 5-20 mcg/kg/min as other medical management for symptomatic bradycardia.",
    evaluationCriteria: [
      "States epinephrine infusion 2-10 mcg/min.",
      "States dopamine infusion 5-20 mcg/kg/min.",
      "Identifies these as symptomatic bradycardia management options."
    ]
  })
];

const hemodynamicsPrompts: CompetencyPrompt[] = [
  prompt({
    id: "hemodynamics-cvp-waveform-normal",
    stationId: "hemodynamics",
    type: "verbal-response",
    title: "",
    scenario:
      "As the PA catheter is inserted through the right IJ and passes into the right atrium at approximately 15 cm, the CVP waveform appears with A, C, and V waves. What is the normal CVP for a healthy individual without valve dysfunction?",
    instructions: [
      "Identify the right atrium/CVP waveform location.",
      "Recognize A, C, and V waves.",
      "State the normal CVP range."
    ],
    expectedResponse:
      "At approximately 15 cm in the right atrium, the learner should identify the CVP waveform with A, C, and V waves. Normal CVP is 2-6 mmHg, with 0-8 mmHg accepted as a common variation.",
    explanation: "The script states that at about 15 cm in the right atrium, the CVP waveform appears. The listed normal CVP answer is 2-6 mmHg, with some variation up to 0-8 mmHg.",
    evaluationCriteria: [
      "Identifies that the waveform is seen in the right atrium at approximately 15 cm.",
      "Recognizes the CVP waveform and A, C, and V waves.",
      "States normal CVP as 2-6 mmHg.",
      "Accepts 0-8 mmHg as a stated variation."
    ]
  }),
  prompt({
    id: "hemodynamics-a-wave-pr-interval",
    stationId: "hemodynamics",
    type: "verbal-response",
    title: "",
    scenario: "The CVP waveform includes an A wave. If the A wave represents atrial contraction, where does the A wave align with the EKG?",
    instructions: ["Answer verbally.", "Connect atrial contraction to the correct EKG interval."],
    expectedResponse: "The A wave aligns with the PR interval.",
    explanation: "The script states that the A wave stands for atrial contraction and asks where it aligns with the EKG. The answer is the PR interval.",
    evaluationCriteria: [
      "States PR interval.",
      "Connects the A wave with atrial contraction.",
      "Does not confuse the A wave with ventricular depolarization or the QRS complex."
    ]
  }),
  prompt({
    id: "hemodynamics-rv-vtach-pressure",
    stationId: "hemodynamics",
    type: "troubleshooting",
    title: "",
    scenario:
      "At approximately 15 cm, the advanced provider instructs you to inflate the balloon and lock it into place to help float the catheter. As the catheter passes the tricuspid valve into the right ventricle, the pressure and waveform change. What waveform/rhythm appears, and what RV pressure pattern should be recognized?",
    instructions: [
      "State when and why the balloon is inflated.",
      "Identify the waveform/rhythm change as the catheter enters the RV.",
      "State the RV pressure pattern from the script."
    ],
    expectedResponse:
      "At approximately 15 cm, under advanced provider direction, inflate and lock the balloon to float the catheter. As the catheter passes through the tricuspid valve into the RV, the waveform/rhythm appears as VTACH. The RV has a high systolic and low diastolic pressure pattern, approximately 20-30 mmHg systolic and 0-5 mmHg diastolic.",
    explanation:
      "The script identifies VTACH as the answer during the right ventricular waveform change and lists the RV pressure pattern as 20-30 mmHg over 0-5 mmHg.",
    evaluationCriteria: [
      "States balloon inflation occurs at approximately 15 cm under advanced provider direction.",
      "Explains that the balloon helps float the catheter.",
      "Identifies VTACH as the waveform/rhythm change in the RV.",
      "States RV pressure as approximately 20-30 mmHg systolic and 0-5 mmHg diastolic."
    ],
    criticalActions: ["Identifies VTACH.", "Recognizes the RV pressure pattern."]
  }),
  prompt({
    id: "hemodynamics-pa-dicrotic-wedge",
    stationId: "hemodynamics",
    type: "timed-emergency",
    title: "",
    scenario:
      "As the catheter continues from the RV into the PA through the pulmonic valve, the PA waveform appears with a dicrotic notch. The catheter will eventually wedge into a small vessel against the wall. What does the dicrotic notch represent, and what must happen when the catheter is wedged?",
    instructions: [
      "Identify what the dicrotic notch represents.",
      "Name the wedge terminology.",
      "State the immediate balloon action.",
      "Explain why the balloon must be deflated."
    ],
    expectedResponse:
      "The PA waveform dicrotic notch represents closure of the pulmonic valve. When the catheter wedges into a small vessel, this may be called PCWP, PAOP, or LVEDP. The provider should instruct balloon deflation at this time to prevent rupture.",
    explanation:
      "The script states that the dicrotic notch represents pulmonic valve closure and that once wedged, the balloon must be deflated to prevent rupture.",
    evaluationCriteria: [
      "States the dicrotic notch represents closure of the pulmonic valve.",
      "Recognizes wedge terminology: PCWP, PAOP, or LVEDP.",
      "States to deflate the balloon once wedged.",
      "Explains balloon deflation is needed to prevent rupture."
    ],
    criticalActions: ["Deflates balloon when wedged.", "Recognizes rupture risk."],
    timerSeconds: 60
  })
];

const pacemakerPrompts: CompetencyPrompt[] = [
  prompt({
    id: "pacemaker-epic-orders",
    stationId: "pacemaker",
    type: "scenario-walkthrough",
    title: "",
    scenario: "Emma develops symptomatic bradycardia with HR 32 and hypotension. She goes to the cath lab for a transvenous pacemaker.",
    instructions: [
      "Check pacemaker settings against Epic orders.",
      "State what order details must match the pacemaker box.",
      "Assign one team member to verify orders and one to program the pacemaker."
    ],
    expectedResponse:
      "Verify pacemaker settings with Epic orders before programming. Confirm ordered rate, output, sensitivity, mode, and any provider-specific settings. Program the pacemaker box according to the verified orders.",
    explanation:
      "The document expects learners to check pacemaker settings with Epic orders, with one person checking orders and one person programming the pacemaker.",
    evaluationCriteria: [
      "Checks Epic orders before adjusting pacemaker settings.",
      "Verifies ordered rate, output, sensitivity, and mode.",
      "Programs the pacemaker box according to verified order.",
      "Uses team cross-checking."
    ],
    criticalActions: ["Does not program settings without order verification."]
  }),
  prompt({
    id: "pacemaker-connections-markings",
    stationId: "pacemaker",
    type: "practical-assessment",
    title: "",
    scenario: "The learner assesses the external pacemaker box and transvenous pacing catheter after placement.",
    instructions: [
      "Check all connections.",
      "Ensure cables are secured.",
      "Check catheter markings.",
      "Verbalize what would require escalation."
    ],
    expectedResponse:
      "Check that connections are secure, the pacemaker cable is connected correctly, the catheter markings are documented and unchanged, and any dislodgement concern or unexpected marking change is escalated.",
    explanation:
      "The document names checking connections, ensuring they are secured, and checking pacemaker catheter markings as expected interventions.",
    evaluationCriteria: [
      "Checks pacemaker box and cable connections.",
      "Confirms connections are secured.",
      "Checks and verbalizes catheter markings.",
      "Escalates suspected dislodgement or marking change."
    ]
  }),
  prompt({
    id: "pacemaker-capture-sensing",
    stationId: "pacemaker",
    type: "troubleshooting",
    title: "",
    scenario: "The monitor rhythm strip is handed to the learner. The learner must identify whether capture and sensing are appropriate.",
    instructions: [
      "Assess for capture on the monitor.",
      "Assess for sensing.",
      "Identify undersensing, oversensing, failure to pace, or failure to capture.",
      "Verbalize how the pacemaker box may be adjusted."
    ],
    expectedResponse:
      "Confirm capture and sensing on the monitor. Identify undersensing, oversensing, failure to pace, and failure to capture. Troubleshoot using the pacemaker box by verifying connections, output, sensitivity, rate, and patient condition while escalating as needed.",
    explanation:
      "The document directs handing each person rhythm examples of undersensing, oversensing, failure to pace, and failure to capture and fixing them using the actual pacemaker box.",
    evaluationCriteria: [
      "Correctly identifies capture and sensing.",
      "Differentiates undersensing and oversensing.",
      "Identifies failure to pace and failure to capture.",
      "Uses pacemaker box settings and connection checks to troubleshoot."
    ],
    criticalActions: ["Recognizes loss of capture.", "Escalates unstable rhythm."]
  }),
  prompt({
    id: "pacemaker-dual-box",
    stationId: "pacemaker",
    type: "practical-assessment",
    title: "",
    scenario: "The dual pacemaker box is brought to the bedside for learner demonstration.",
    instructions: [
      "Orient to the dual box controls.",
      "Identify which controls affect rate, output, and sensitivity.",
      "Explain how changes should be verified."
    ],
    expectedResponse:
      "Identify the rate, output, and sensitivity controls on the dual box, verbalize that settings must match orders, and verify changes on the monitor with patient assessment.",
    explanation:
      "The scenario calls for bringing the dual box and having learners use actual equipment for troubleshooting.",
    evaluationCriteria: [
      "Locates relevant dual box controls.",
      "Links controls to rate, output, and sensitivity.",
      "Verifies changes with monitor and patient assessment.",
      "Maintains order-based practice."
    ]
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
    evaluationCriteria: [
      "States clamping requires a physician order unless briefly troubleshooting.",
      "Names changing the Pleur-evac as an exception.",
      "Names air leak assessment as an exception.",
      "Does not endorse routine clamping."
    ]
  }),
  prompt({
    id: "chest-tube-subcutaneous-emphysema",
    stationId: "chest-tube",
    type: "verbal-response",
    title: "",
    scenario: "What assessment finding do you expect when palpating around a chest tube site?",
    instructions: ["Answer verbally.", "Include what it feels like, where to assess, and what to do if new."],
    expectedResponse:
      "Assess for subcutaneous emphysema. Physical findings include crepitus, often described as a Rice Krispies sensation. Gently palpate around the insertion site and extend assessment to the neck and upper chest. Mark and document the extent to monitor progression, and notify the physician if this is a new finding.",
    explanation: "Subcutaneous emphysema can indicate air tracking through tissue and should be trended and escalated if new or progressing.",
    evaluationCriteria: [
      "Identifies subcutaneous emphysema.",
      "Describes crepitus or Rice Krispies sensation.",
      "Assesses insertion site, neck, and upper chest.",
      "Marks/documents extent and notifies provider if new."
    ],
    notifyProviderWhen: ["New subcutaneous emphysema is found.", "Crepitus expands or progresses."]
  }),
  prompt({
    id: "chest-tube-transport-suction",
    stationId: "chest-tube",
    type: "verbal-response",
    title: "",
    scenario: "Your patient is on continuous -20 cmH2O suction and a STAT CT chest is ordered. How would you transport this patient?",
    instructions: ["Answer verbally.", "State how ordered suction is maintained during transport."],
    expectedResponse: "Transport the patient using portable suction so the ordered continuous suction is maintained.",
    explanation: "A patient ordered for continuous suction should not be disconnected from suction for transport unless directed by provider/policy.",
    evaluationCriteria: ["States portable suction is required.", "Maintains ordered suction during transport.", "Checks the chest tube system before leaving."]
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
    evaluationCriteria: ["Identifies the orange float.", "Connects the indicator to prescribed suction being achieved."]
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
    evaluationCriteria: [
      "States output greater than 200-300 mL/hr for two consecutive hours.",
      "Identifies sudden unexpected increase as reportable.",
      "Identifies bright red free-flowing blood as urgent.",
      "Names hemorrhage concern."
    ],
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
    evaluationCriteria: [
      "Uses the water seal chamber to assess bubbling.",
      "Differentiates intermittent bubbling from continuous bubbling.",
      "Correctly explains brief clamping near insertion site.",
      "Correctly explains tubing leak localization.",
      "Identifies possible defective drainage unit if bubbling persists near the unit."
    ],
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
    evaluationCriteria: [
      "Checks dressing is clean, dry, intact, and occlusive.",
      "Assesses redness, swelling, and discharge.",
      "Ensures tubing is anchored securely.",
      "Mentions appropriate securement method or policy."
    ]
  }),
  prompt({
    id: "chest-tube-dislodgement",
    stationId: "chest-tube",
    type: "timed-emergency",
    title: "",
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
    explanation: "Violent restraint application requires escalation through Code RUSH.",
    evaluationCriteria: [
      "States Code RUSH.",
      "Does not answer Code BERT for violent restraint application."
    ],
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
    explanation: "Once violent restraints are applied, the provider face-to-face evaluation must occur within one hour.",
    evaluationCriteria: [
      "States one hour.",
      "Connects the one-hour requirement to violent restraint application."
    ],
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
    explanation: "The Code BERT process activates the Behavioral Emergency Response Team for behavioral safety events.",
    evaluationCriteria: [
      "States Behavioral Emergency Response Team.",
      "Does not confuse BERT with Code RUSH."
    ]
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
    explanation: "A cancelled BERT still requires documentation on the BERT flow sheet.",
    evaluationCriteria: [
      "Answers yes.",
      "States that the BERT flow sheet still requires documentation."
    ]
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
    explanation: "The provided competency answer identifies this statement as false.",
    evaluationCriteria: [
      "Answers false.",
      "Does not describe Code BERT as the correct response for a family member."
    ]
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
    explanation: "Debriefing is completed after the BERT ends, using the form located on the Hub.",
    evaluationCriteria: [
      "States debriefing occurs when the BERT has ended.",
      "States the form is on the Hub."
    ]
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
    explanation: "The Code BERT activation number is 3333.",
    evaluationCriteria: [
      "States call 3333.",
      "Does not give an alternate activation number."
    ],
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
    evaluationCriteria: [
      "Names escalating verbal aggression.",
      "Names physical threats.",
      "Names acute disorientation with combativeness.",
      "Identifies immediate safety risk to self or staff as the key trigger."
    ],
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
        "Accuchek",
        "Diuretics",
        "Physical therapy / 14 hours post TNK",
        "NGT insertion",
        "Blood draw",
        "Foley catheter insertion",
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
        items: ["Stool softener", "Accuchek", "Diuretics", "Physical therapy / 14 hours post TNK"]
      },
      {
        title: "Unsafe",
        items: ["NGT insertion", "Blood draw", "Foley catheter insertion", "Heparin"]
      }
    ],
    expectedResponse:
      "Safe: stool softener, Accuchek, diuretics, and physical therapy / 14 hours post TNK. Unsafe: NGT insertion, blood draw, Foley catheter insertion, and heparin.",
    explanation:
      "This activity reinforces post-Tenecteplase restrictions and the need to avoid unnecessary invasive procedures or anticoagulant exposure during the restricted period.",
    evaluationCriteria: [
      "Correctly sorts stool softener, Accuchek, diuretics, and physical therapy / 14 hours post TNK as Safe.",
      "Correctly sorts NGT insertion, blood draw, Foley catheter insertion, and heparin as Unsafe.",
      "Explains that invasive procedures and anticoagulant exposure increase post-thrombolytic risk."
    ],
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
    evaluationCriteria: [
      "Correctly sorts last known well 3 hours ago as Eligible.",
      "Correctly sorts ischemic stroke as Eligible.",
      "Correctly sorts no signs of intracranial hemorrhage and BP 150/60 as Eligible.",
      "Correctly sorts 16 y/o, recent major surgery, active GI bleeding, and INR 4.5 as Ineligible."
    ],
    criticalActions: ["Does not miss active bleeding, high INR, or age exclusion cues."]
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
    evaluationCriteria: [
      "States blood pressure must be less than 185/110 mmHg.",
      "Recognizes this limit applies before Tenecteplase administration."
    ],
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
    evaluationCriteria: [
      "States blood pressure must remain less than 180/105 mmHg.",
      "Recognizes this limit applies after Tenecteplase administration."
    ],
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
    evaluationCriteria: [
      "States assessment once within 15 minutes prior to administration.",
      "States every 15 minutes for the first 2 hours.",
      "States every 30 minutes for the next 6 hours.",
      "States every 1 hour for the next 16 hours.",
      "States 24 hours total monitoring.",
      "States full NIHSS at 24 hours after Tenecteplase initiation.",
      "States documentation in the EMR."
    ],
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
    evaluationCriteria: [
      "Names bleeding.",
      "Names neurological changes.",
      "Names angioedema.",
      "Names anaphylaxis."
    ],
    criticalActions: ["Recognizes neurological change or bleeding as urgent."]
  }),
  prompt({
    id: "stroke-rn-transfer-requirement",
    stationId: "stroke",
    type: "verbal-response",
    title: "",
    scenario: "Who must accompany a patient during transfers or location changes after receiving Tenecteplase?",
    instructions: [
      "Answer verbally.",
      "State the required timeframe."
    ],
    expectedResponse:
      "An RN must accompany the patient on any transfer or location change for 24 hours following Tenecteplase administration.",
    explanation:
      "For the first 24 hours after Tenecteplase, the patient requires RN accompaniment for transfers or location changes.",
    evaluationCriteria: [
      "States an RN must accompany the patient.",
      "Applies this to any transfer or location change.",
      "States the requirement lasts for 24 hours after Tenecteplase."
    ],
    criticalActions: ["Does not allow transfer without RN accompaniment during the 24-hour period."]
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
    evaluationCriteria: [
      "States individualized stroke education must be documented.",
      "States the plan of care must be documented.",
      "Includes the patient's personal stroke risk factors."
    ]
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
    evaluationCriteria: [
      "States dysphagia screen must be completed.",
      "States this must occur before food.",
      "States this must occur before fluids.",
      "States this must occur before oral medications."
    ],
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
    evaluationCriteria: [
      "States antithrombotic medications are not administered until 24 hours after Tenecteplase.",
      "Recognizes the restriction applies after Tenecteplase administration."
    ],
    criticalActions: ["Does not administer antithrombotics before 24 hours."]
  })
];

const cautiClabsiPrompts: CompetencyPrompt[] = [
  prompt({
    id: "cauti-foley-care-frequency",
    stationId: "cauti-clabsi-prevention",
    type: "verbal-response",
    title: "",
    scenario: "How often do you do peri/Foley care?",
    instructions: ["Answer verbally.", "State the routine frequency."],
    expectedResponse: "Peri/Foley care is done once a shift.",
    explanation: "The expected frequency for peri/Foley care is once a shift.",
    evaluationCriteria: ["States once a shift."]
  }),
  prompt({
    id: "cauti-clabsi-chg-bath-frequency",
    stationId: "cauti-clabsi-prevention",
    type: "verbal-response",
    title: "",
    scenario: "How often should you do a CHG bath if the patient has a central line or a Foley?",
    instructions: ["Answer verbally.", "State the routine CHG bath frequency."],
    expectedResponse: "CHG bath should be done every 24 hours if the patient has a central line or a Foley.",
    explanation: "The expected CHG bath frequency is every 24 hours.",
    evaluationCriteria: ["States every 24 hours."]
  }),
  prompt({
    id: "clabsi-scrub-the-hub-time",
    stationId: "cauti-clabsi-prevention",
    type: "verbal-response",
    title: "",
    scenario: "How long do you scrub the hub when accessing the central line?",
    instructions: ["Answer verbally.", "State the minimum scrub time."],
    expectedResponse: "Scrub the hub for 15 seconds when accessing the central line.",
    explanation: "The expected scrub-the-hub time is 15 seconds.",
    evaluationCriteria: ["States 15 seconds."]
  }),
  prompt({
    id: "clabsi-central-line-dressing-change",
    stationId: "cauti-clabsi-prevention",
    type: "verbal-response",
    title: "",
    scenario: "How often do you change the central line dressing?",
    instructions: ["Answer verbally.", "State the routine interval and as-needed condition."],
    expectedResponse: "Change the central line dressing every 7 days or as needed.",
    explanation: "The expected central line dressing change frequency is every 7 days or as needed.",
    evaluationCriteria: ["States every 7 days.", "States or as needed."]
  })
];

const pressureInjuryPrompts: CompetencyPrompt[] = [
  prompt({
    id: "pressure-injury-return-assessment",
    stationId: "pressure-injury-station",
    type: "scenario-walkthrough",
    title: "",
    scenario: "Emma returns after being off the unit for 3.5 hours for a procedure.",
    instructions: [
      "State what skin assessment is required.",
      "Explain why the assessment matters after time off unit.",
      "Identify who should participate."
    ],
    expectedResponse:
      "Perform a 4-eyes skin assessment after return from the procedure, especially after being off unit for 3.5 hours. Assess pressure points, devices, dressings, and any new skin changes with another qualified staff member per policy.",
    explanation:
      "The document asks what assessment should be done after Emma is away for a procedure for 3.5 hours and expects a 4-eyes assessment.",
    evaluationCriteria: [
      "States need for 4-eyes assessment.",
      "Links prolonged time off unit/procedure to skin risk.",
      "Assesses pressure points and device-related areas.",
      "Documents findings per policy."
    ]
  }),
  prompt({
    id: "pressure-injury-dti-mepilex",
    stationId: "pressure-injury-station",
    type: "practical-assessment",
    title: "",
    scenario: "The manikin has a deep tissue injury on the buttocks covered with a Mepilex dressing.",
    instructions: [
      "Peel back the Mepilex dressing.",
      "Identify the wound finding.",
      "State whether the Mepilex use is appropriate.",
      "Document and escalate the finding."
    ],
    expectedResponse:
      "Peel back the Mepilex and identify the DTI on the buttocks. Verbalize that Mepilex use over the DTI is inappropriate in this scenario, document the wound, and escalate per pressure injury policy.",
    explanation:
      "The document expects learners to peel back Mepilex, identify DTI in buttocks, and verbalize inappropriate use of Mepilex on DTI.",
    evaluationCriteria: [
      "Peels back dressing instead of only inspecting externally.",
      "Identifies DTI on buttocks.",
      "Verbalizes inappropriate use of Mepilex on DTI in this station.",
      "Documents and escalates finding."
    ]
  }),
  prompt({
    id: "pressure-injury-staging",
    stationId: "pressure-injury-station",
    type: "practical-assessment",
    title: "",
    scenario: "Several numbered moulage wounds are placed for staging identification.",
    instructions: [
      "Match wound numbers to wound stages.",
      "Identify Stage 2, Stage 3, Stage 4, and DTI.",
      "Explain key visual differences."
    ],
    expectedResponse:
      "Correctly stage the moulage wounds as Stage 2, Stage 3, Stage 4, and DTI, matching each numbered wound to the correct stage and explaining depth/tissue findings.",
    explanation:
      "The document states each person matches the number to the wound and stages the moulage wounds: Stage 2, 3, 4, and DTI.",
    evaluationCriteria: [
      "Correctly identifies Stage 2.",
      "Correctly identifies Stage 3.",
      "Correctly identifies Stage 4.",
      "Correctly identifies DTI.",
      "Explains why each stage was selected."
    ]
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
    id: "pacemaker",
    title: "Pacemaker",
    shortTitle: "Pacemaker",
    description: "Transvenous pacemaker orders, secure connections, catheter markings, capture, sensing, and pacemaker box troubleshooting.",
    estimatedMinutes: 10,
    competencyType: "Device troubleshooting",
    accent: "amber",
    prompts: pacemakerPrompts
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
  }
];

export const scenarioPatientContext = patientContext;

export function findStation(id: string) {
  return stations.find((station) => station.id === id);
}

export function allPrompts() {
  return stations.flatMap((station) => station.prompts);
}

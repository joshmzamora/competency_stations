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
    title: "Unstable Atrial Fibrillation",
    scenario:
      "Emma is pale, cool, mildly diaphoretic, anxious, and in atrial fibrillation with HR 160, BP 78/50, RR 26, and SpO2 on 2 L nasal cannula. The team must respond to unstable atrial fibrillation.",
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
    title: "Pulseless Ventricular Tachycardia",
    scenario: "Emma becomes unresponsive and the rhythm changes to pulseless ventricular tachycardia.",
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
    id: "code-blue-reversible-causes",
    stationId: "code-blue",
    type: "verbal-response",
    title: "Reversible Causes",
    scenario: "During the code, the team leader asks for reversible causes to consider.",
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
    title: "ROSC With Symptomatic Bradycardia",
    scenario: "After ROSC, Emma has HR 42, BP 80/50, SpO2 99%, RR 12, and an ETT in place with 100% FiO2.",
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
  })
];

const hemodynamicsPrompts: CompetencyPrompt[] = [
  prompt({
    id: "hemodynamics-line-prep",
    stationId: "hemodynamics",
    type: "scenario-walkthrough",
    title: "Post-Code Line Insertion Preparation",
    scenario:
      "Emma has persistent hypotension after the code with BP 79/50, HR 100, and SpO2 100%. The provider decides to insert an arterial line, PA catheter, and central line.",
    instructions: [
      "State what must be done before line insertion.",
      "Verbalize supplies needed for invasive line setup.",
      "Prepare for pressure tubing setup within the time limit."
    ],
    expectedResponse:
      "Obtain consent as appropriate, gather line insertion supplies, prepare pressure tubing and pressure bag, and be ready to assist with arterial line, PA catheter, and central line setup.",
    explanation:
      "The document expects learners to verbalize needed supplies, set up pressure bags and pressure tubing, and understand preparation steps before invasive line monitoring.",
    evaluationCriteria: [
      "States consent or procedural readiness step.",
      "Identifies arterial line, PA catheter, and central line setup needs.",
      "Prepares pressure tubing and pressure bag.",
      "Works within a 3-5 minute timed setup expectation."
    ],
    timerSeconds: 300
  }),
  prompt({
    id: "hemodynamics-pressure-tubing",
    stationId: "hemodynamics",
    type: "practical-assessment",
    title: "Pressure Tubing Setup",
    scenario: "The learner must set up a pressure bag and pressure tubing for invasive hemodynamic monitoring.",
    instructions: [
      "Set up the pressure tubing.",
      "Inflate the pressure bag correctly.",
      "Level and zero the system.",
      "Identify missing or incorrect setup elements."
    ],
    expectedResponse:
      "Set up the pressure tubing, inflate the pressure bag to 300 mmHg, ensure all end caps are present, level to the phlebostatic axis, zero the system, label tubing, and correct setup errors before use.",
    explanation:
      "The document specifically names missing end cap, pressure bag not inflated to 300 mmHg, not leveled, and no labels as setup errors.",
    evaluationCriteria: [
      "Inflates pressure bag to 300 mmHg.",
      "Verifies end caps are present.",
      "Levels at the phlebostatic axis.",
      "Zeros the line correctly.",
      "Labels tubing appropriately."
    ],
    criticalActions: ["Does not use an unzeroed or incorrectly leveled line.", "Corrects missing end cap or underinflated pressure bag."]
  }),
  prompt({
    id: "hemodynamics-phlebostatic-axis",
    stationId: "hemodynamics",
    type: "practical-assessment",
    title: "Phlebostatic Axis",
    scenario: "Multiple possible leveling marks are placed on the manikin, including incorrect options.",
    instructions: [
      "Identify the correct phlebostatic axis.",
      "Explain why incorrect leveling changes readings.",
      "Re-level and zero the system."
    ],
    expectedResponse:
      "Identify the phlebostatic axis at the fourth intercostal space, mid-axillary line, level the transducer there, and zero the system so pressure readings are accurate.",
    explanation:
      "The document instructs placing dots on the patient and asking learners to identify the correct phlebostatic axis.",
    evaluationCriteria: [
      "Identifies correct anatomical leveling location.",
      "Explains that incorrect leveling causes inaccurate pressure readings.",
      "Re-levels and zeros the system."
    ]
  }),
  prompt({
    id: "hemodynamics-pa-waveform-troubleshooting",
    stationId: "hemodynamics",
    type: "troubleshooting",
    title: "PA Catheter Waveform Change",
    scenario: "During PA catheter insertion, the waveform changes and x-ray confirms position. The monitor shows an abnormal waveform.",
    instructions: [
      "Identify the possible waveform issue.",
      "State immediate safety concerns.",
      "Verbalize troubleshooting and escalation."
    ],
    expectedResponse:
      "Recognize abnormal PA catheter waveforms such as wedging, ventricular waveform, VT, or flat line. Stop advancing if unsafe, assess the patient and waveform, notify provider, and troubleshoot connections, cables, leveling, and monitor setup.",
    explanation:
      "The document names PA lines waveform wedged, induced VT, flat line on PA catheter, waveform changes, and x-ray confirmation as station elements.",
    evaluationCriteria: [
      "Recognizes abnormal PA catheter waveform patterns.",
      "Assesses patient stability and stops unsafe advancement.",
      "Troubleshoots cables, monitor connection, leveling, and zeroing.",
      "Escalates to provider when waveform or rhythm is unsafe."
    ],
    criticalActions: ["Responds to VT or flat line immediately.", "Does not ignore wedged PA waveform."]
  }),
  prompt({
    id: "hemodynamics-hemosphere",
    stationId: "hemodynamics",
    type: "scenario-walkthrough",
    title: "HemoSphere Setup",
    scenario: "The learner must connect cables to the HemoSphere and troubleshoot why values are not uploading into Epic.",
    instructions: [
      "Connect monitoring cables correctly.",
      "Enter required patient information.",
      "Explain why height and weight matter.",
      "Troubleshoot missing Epic values."
    ],
    expectedResponse:
      "Connect the HemoSphere cables, confirm correct patient height and weight in the monitor, verify monitor and Epic integration, and troubleshoot missing values by checking connection, patient information, and device setup.",
    explanation:
      "The document specifically mentions bringing HemoSphere, information needed in HemoSphere, height and weight in monitor, and why values are not uploading into Epic.",
    evaluationCriteria: [
      "Connects cables correctly.",
      "Verifies required patient height and weight.",
      "Recognizes missing or incorrect patient information can affect values.",
      "Troubleshoots monitor-to-Epic upload issue."
    ]
  })
];

const pacemakerPrompts: CompetencyPrompt[] = [
  prompt({
    id: "pacemaker-epic-orders",
    stationId: "pacemaker",
    type: "scenario-walkthrough",
    title: "Transvenous Pacemaker Orders",
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
    title: "Connections and Catheter Markings",
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
    title: "Capture and Sensing",
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
    title: "Dual Box Familiarity",
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
    title: "Safe Clamping",
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
    title: "Palpation Finding",
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
    title: "Transport With Suction",
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
    title: "Adequate Suction",
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
    title: "Output Notification",
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
  }),
  prompt({
    id: "chest-tube-site-assessment",
    stationId: "chest-tube",
    type: "practical-assessment",
    title: "Insertion Site and Dressing Assessment",
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
  })
];

const codeBertPrompts: CompetencyPrompt[] = [
  prompt({
    id: "code-bert-violent-restraints-code-rush",
    stationId: "code-bert",
    type: "verbal-response",
    title: "Violent Restraints Escalation",
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
    title: "Face-to-Face Requirement",
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
    title: "BERT Meaning",
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
    title: "Cancelled BERT Documentation",
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
    title: "Family Member Activation",
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
    title: "Debrief Timing and Form Location",
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
    title: "Calling Code BERT",
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
    title: "Activation Triggers",
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
    id: "stroke-recognition-code-cva",
    stationId: "stroke",
    type: "timed-emergency",
    title: "Stroke Recognition and Code CVA",
    scenario:
      "Emma develops arm weakness, speech difficulty, headache, BP 195/100, HR 90, and SpO2 96%. Repeat vital signs show BP 190/102, HR 90, and SpO2 93%.",
    instructions: [
      "Perform BEFAST screening.",
      "Recognize stroke symptoms.",
      "Call Code CVA.",
      "State immediate priorities."
    ],
    expectedResponse:
      "Use BEFAST to recognize balance, eyes, face, arm, speech, and time concerns. Identify arm weakness, speech difficulty, and headache as stroke symptoms. Call Code CVA, obtain vital signs, perform neuro assessment, verify last-known-well, and prepare for imaging and telestroke workflow.",
    explanation:
      "The document lists arm weakness, speech difficulty, headache, BEFAST, Code CVA, and telestroke elements.",
    evaluationCriteria: [
      "Uses BEFAST appropriately.",
      "Recognizes arm weakness and speech difficulty as stroke symptoms.",
      "Calls Code CVA promptly.",
      "Verbalizes last-known-well and urgent imaging priorities."
    ],
    criticalActions: ["Calls Code CVA.", "Does not delay stroke response."],
    timerSeconds: 90
  }),
  prompt({
    id: "stroke-tnk-prep",
    stationId: "stroke",
    type: "practical-assessment",
    title: "Tenecteplase Preparation",
    scenario: "CT is negative for bleed and the team prepares for Tenecteplase.",
    instructions: [
      "Confirm order and patient identity.",
      "Verify patient weight.",
      "Calculate and prepare the dose.",
      "Demonstrate mixing technique."
    ],
    expectedResponse:
      "Confirm the Tenecteplase order in the EMR, verify patient weight, identify the patient using appropriate identifiers, calculate total dose as 0.25 mg/kg with max dose 25 mg, withdraw 10 mL sterile water, inject into vial, gently swirl until dissolved, do not shake, withdraw the total dose, and leave waste in the vial.",
    explanation:
      "The DOCX includes a detailed Tenecteplase checklist with order confirmation, weight, identifiers, dose formula, max dose, and mixing instructions.",
    evaluationCriteria: [
      "Confirms order in EMR.",
      "Verifies correct patient weight.",
      "Uses patient identifiers.",
      "States dose 0.25 mg/kg and max 25 mg.",
      "Gently swirls and does not shake.",
      "Leaves waste in vial."
    ],
    criticalActions: ["Verifies weight before dosing.", "Does not exceed max dose.", "Does not shake vial."]
  }),
  prompt({
    id: "stroke-bp-neuro-checks",
    stationId: "stroke",
    type: "verbal-response",
    title: "Blood Pressure and Neuro Check Timing",
    scenario: "The learner must verbalize required BP limits and neuro check timing before and after Tenecteplase.",
    instructions: [
      "State BP limit prior to Tenecteplase.",
      "State BP limit after Tenecteplase.",
      "Verbalize post-Tenecteplase neuro check timing.",
      "State when full NIHSS is due."
    ],
    expectedResponse:
      "BP must be less than 185/110 before Tenecteplase push and less than 180/105 after administration. Neuro checks are every 15 minutes for the first 2 hours, every 30 minutes for the next 6 hours, every hour for the next 16 hours, and full NIHSS at 24 hours post-Tenecteplase.",
    explanation:
      "The DOCX checklist provides specific BP thresholds and neuro check intervals using HMSCS or NIHSS.",
    evaluationCriteria: [
      "States pre-Tenecteplase BP must be less than 185/110.",
      "States post-Tenecteplase BP must be less than 180/105.",
      "States every 15 minutes for 2 hours.",
      "States every 30 minutes for 6 hours.",
      "States every hour for 16 hours and NIHSS at 24 hours."
    ]
  }),
  prompt({
    id: "stroke-administration-monitoring",
    stationId: "stroke",
    type: "scenario-walkthrough",
    title: "Tenecteplase Administration and Monitoring",
    scenario: "The dose is ready and the learner must describe safe administration and post-dose monitoring.",
    instructions: [
      "Describe medication scanning and co-sign workflow.",
      "State IV compatibility and flushes.",
      "State push time.",
      "Name adverse reactions and escalation."
    ],
    expectedResponse:
      "With the MAR open, scan the patient armband, obtain required co-sign, scan the Tenecteplase bottle, flush IV with normal saline because Tenecteplase is not compatible with dextrose, push over 5 seconds, flush with normal saline, monitor for bleeding, neurological change, angioedema, anaphylaxis, notify provider, document notification, and obtain non-contrast CT for worsening neurological condition.",
    explanation:
      "The DOCX gives specific administration steps and adverse-reaction monitoring requirements.",
    evaluationCriteria: [
      "Uses MAR, armband scan, drug scan, and co-sign.",
      "Uses normal saline flush and avoids dextrose.",
      "Pushes Tenecteplase over 5 seconds.",
      "Monitors for bleeding and neurological changes.",
      "Escalates worsening neuro condition and anticipates non-contrast CT."
    ],
    criticalActions: ["Uses normal saline flush.", "Recognizes worsening neuro condition as urgent."]
  }),
  prompt({
    id: "stroke-post-tnk-restrictions",
    stationId: "stroke",
    type: "verbal-response",
    title: "Post-Tenecteplase Restrictions",
    scenario: "The learner must state care restrictions and required follow-up for the first 24 hours after Tenecteplase.",
    instructions: [
      "State transfer requirement.",
      "State imaging follow-up.",
      "State dysphagia screen requirement.",
      "State medication/procedure restrictions."
    ],
    expectedResponse:
      "An RN accompanies the patient on any transfer or location change for 24 hours. CT/MRI is completed at 24 hours. Perform and document dysphagia screen before anything by mouth. Do not administer antithrombotic medications until 24 hours after Tenecteplase. Avoid blood thinners, NGT, Foley, and procedures for 24 hours as directed by protocol.",
    explanation:
      "The DOCX includes RN transfer accompaniment, 24-hour CT/MRI, dysphagia screening, education/care plan, and post-TNK restrictions.",
    evaluationCriteria: [
      "States RN accompanies transfers for 24 hours.",
      "States 24-hour CT/MRI follow-up.",
      "Performs dysphagia screen before oral intake.",
      "Avoids antithrombotic medications for 24 hours.",
      "Mentions individualized education, risk factors, and care plan."
    ]
  })
];

const cautiClabsiPrompts: CompetencyPrompt[] = [
  prompt({
    id: "cauti-prevention",
    stationId: "cauti-clabsi-prevention",
    type: "practical-assessment",
    title: "CAUTI Prevention Bedside Check",
    scenario: "Emma has a Foley catheter. The learner must inspect the setup for CAUTI prevention.",
    instructions: [
      "Assess drainage bag position.",
      "Check for dependent loops.",
      "Check securement and insertion date sticker.",
      "Assess bag fullness."
    ],
    expectedResponse:
      "Prevent CAUTI by ensuring no dependent loop, drainage bag is not on the floor, StatLock is in place, bag is not more than half full, and date-of-insertion sticker is present.",
    explanation:
      "The document lists no dependent loop, bag not on the floor, StatLock, bag not more than half full, and insertion date sticker.",
    evaluationCriteria: [
      "Identifies and corrects dependent loop.",
      "Keeps drainage bag off the floor.",
      "Checks StatLock securement.",
      "Verifies bag is not more than half full.",
      "Verifies insertion date sticker."
    ]
  }),
  prompt({
    id: "clabsi-prevention",
    stationId: "cauti-clabsi-prevention",
    type: "practical-assessment",
    title: "CLABSI Prevention Bedside Check",
    scenario: "Emma has a central line. The learner must inspect the central line for CLABSI prevention.",
    instructions: [
      "Assess dressing status.",
      "Check Curos caps.",
      "Check dressing date.",
      "Check tubing labels and tubing change timing."
    ],
    expectedResponse:
      "Prevent CLABSI by confirming the central line dressing is clean and intact, Curos caps are present, dressing has date of insertion or dressing date, today's date is considered, tubing is labeled, and tubing has been changed within 96 hours.",
    explanation:
      "The document lists clean and intact dressing, Curos cap, dressing with date of insertion, today's date, tubing labeled, and tubing changed within 96 hours.",
    evaluationCriteria: [
      "Checks dressing is clean and intact.",
      "Verifies Curos caps are present.",
      "Checks dressing date.",
      "Checks tubing labels.",
      "Verifies tubing change is within 96 hours."
    ]
  }),
  prompt({
    id: "cauti-clabsi-correct-the-room",
    stationId: "cauti-clabsi-prevention",
    type: "troubleshooting",
    title: "Correct the Room",
    scenario: "The room is intentionally staged with Foley and central line prevention errors.",
    instructions: [
      "Find all staged CAUTI risks.",
      "Find all staged CLABSI risks.",
      "Correct what can be corrected immediately.",
      "Verbalize what must be documented or escalated."
    ],
    expectedResponse:
      "Identify and correct dependent loop, Foley bag on floor, missing StatLock, overfilled bag, missing insertion date, missing Curos cap, compromised dressing, missing dressing date, unlabeled tubing, and tubing outside the 96-hour change window.",
    explanation:
      "The station is designed as a demonstration of ways to prevent CAUTI and CLABSI using bedside findings.",
    evaluationCriteria: [
      "Finds Foley-related prevention errors.",
      "Finds central-line-related prevention errors.",
      "Corrects immediate risks.",
      "Documents or escalates items requiring follow-up."
    ]
  })
];

const pressureInjuryPrompts: CompetencyPrompt[] = [
  prompt({
    id: "pressure-injury-return-assessment",
    stationId: "pressure-injury-station",
    type: "scenario-walkthrough",
    title: "Return From Procedure",
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
    title: "DTI Under Mepilex",
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
    title: "Wound Staging Match",
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
    description: "Arterial line, PA catheter, central line readiness, pressure tubing, leveling, zeroing, waveform troubleshooting, and HemoSphere setup.",
    estimatedMinutes: 15,
    competencyType: "Invasive monitoring checkoff",
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
    competencyType: "Skin integrity assessment",
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

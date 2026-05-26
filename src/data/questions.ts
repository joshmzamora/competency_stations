import type { Question } from "../types";

export const stationCategories = [
  "Code Blue",
  "Hemodynamics",
  "Pacemaker",
  "Chest tube",
  "Code BERT",
  "Stroke",
  "CAUTI/CLABSI prevention",
  "Pressure Injury Station"
] as const;

const points = [100, 200, 300, 400, 500];

const seedPrompts: Record<(typeof stationCategories)[number], Array<Omit<Question, "id" | "category" | "points">>> = {
  "Code Blue": [
    {
      type: "multiple-choice",
      prompt: "During a Code Blue, what is the first priority when a patient is found unresponsive?",
      choices: ["Begin documentation", "Check responsiveness and call for help", "Find the family", "Prepare discharge papers"],
      answer: "Check responsiveness and call for help",
      explanation: "Immediate recognition, calling for help, and activating the emergency response process starts the resuscitation chain."
    },
    {
      type: "short-answer",
      prompt: "What rhythm check interval is commonly used during high-quality CPR cycles?",
      answer: "About every 2 minutes",
      explanation: "Rhythm checks are typically brief and occur after cycles of CPR, often around every 2 minutes per ACLS workflows."
    },
    {
      type: "multiple-choice",
      prompt: "Which action helps maintain high-quality compressions?",
      choices: ["Frequent long pauses", "Shallow compressions", "Full chest recoil", "Leaning on the chest"],
      answer: "Full chest recoil",
      explanation: "Full recoil supports venous return and improves CPR effectiveness."
    },
    {
      type: "flashcard",
      prompt: "Define closed-loop communication during a Code Blue.",
      answer: "The receiver repeats the order back and confirms completion.",
      explanation: "Closed-loop communication reduces missed tasks and confusion in high-stress resuscitation."
    },
    {
      type: "short-answer",
      prompt: "Name one item that should be immediately available when defibrillation is expected.",
      answer: "Defibrillator pads or defibrillator",
      explanation: "Rapid defibrillation is essential for shockable rhythms, so equipment should be ready immediately."
    }
  ],
  Hemodynamics: [
    {
      type: "multiple-choice",
      prompt: "What does MAP stand for?",
      choices: ["Mean arterial pressure", "Maximum airway pressure", "Medication administration plan", "Measured atrial pulse"],
      answer: "Mean arterial pressure",
      explanation: "MAP estimates average arterial pressure during one cardiac cycle and helps evaluate perfusion."
    },
    {
      type: "short-answer",
      prompt: "What is one clinical sign of poor perfusion?",
      answer: "Altered mental status",
      explanation: "Cool skin, low urine output, weak pulses, delayed capillary refill, and altered mentation can suggest poor perfusion."
    },
    {
      type: "multiple-choice",
      prompt: "A sudden drop in blood pressure with tachycardia may suggest what problem?",
      choices: ["Improved perfusion", "Hemodynamic instability", "Normal recovery", "Resolved pain"],
      answer: "Hemodynamic instability",
      explanation: "A pressure drop with compensatory tachycardia can indicate shock, bleeding, sepsis, or other urgent problems."
    },
    {
      type: "flashcard",
      prompt: "What is orthostatic hypotension?",
      answer: "A blood pressure drop after position change, often standing.",
      explanation: "It can increase fall risk and may signal dehydration, medications, or autonomic dysfunction."
    },
    {
      type: "short-answer",
      prompt: "What patient output is commonly monitored as a perfusion marker?",
      answer: "Urine output",
      explanation: "Urine output is a practical bedside marker of renal perfusion and volume status."
    }
  ],
  Pacemaker: [
    {
      type: "multiple-choice",
      prompt: "What should be checked first if a paced patient becomes symptomatic?",
      choices: ["Snack preference", "Patient assessment and vital signs", "Room temperature", "Television volume"],
      answer: "Patient assessment and vital signs",
      explanation: "Always assess the patient first, then evaluate rhythm, capture, sensing, and equipment."
    },
    {
      type: "flashcard",
      prompt: "What does electrical capture mean?",
      answer: "A pacer spike is followed by the expected electrical complex.",
      explanation: "Electrical capture means the myocardium responded electrically to the pacing stimulus."
    },
    {
      type: "multiple-choice",
      prompt: "Failure to capture means:",
      choices: ["Every spike produces a QRS", "Spikes are missing", "A pacer spike is not followed by the expected complex", "The patient is discharged"],
      answer: "A pacer spike is not followed by the expected complex",
      explanation: "Failure to capture can require urgent troubleshooting and provider notification."
    },
    {
      type: "short-answer",
      prompt: "Name one temporary transcutaneous pacing comfort intervention.",
      answer: "Analgesia or sedation as ordered",
      explanation: "Transcutaneous pacing can be painful; comfort measures are often needed while maintaining safety."
    },
    {
      type: "flashcard",
      prompt: "What is demand pacing?",
      answer: "The pacemaker fires only when the intrinsic rate is below the set rate.",
      explanation: "Demand pacing prevents unnecessary pacing when the patient's rhythm is adequate."
    }
  ],
  "Chest tube": [
    {
      type: "multiple-choice",
      prompt: "Where should the chest drainage system usually be positioned?",
      choices: ["Above the chest", "Below the level of the chest", "In the bed beside the patient", "Clamped at all times"],
      answer: "Below the level of the chest",
      explanation: "Keeping the system below chest level supports drainage and reduces backflow risk."
    },
    {
      type: "short-answer",
      prompt: "What should you do if a chest tube is accidentally pulled out?",
      answer: "Cover the site and call for help immediately",
      explanation: "Follow facility policy, apply an appropriate dressing, assess the patient, and notify the provider rapidly."
    },
    {
      type: "multiple-choice",
      prompt: "Continuous bubbling in the water seal chamber may indicate:",
      choices: ["Air leak", "Normal urine output", "Hypoglycemia", "Correct pacemaker capture"],
      answer: "Air leak",
      explanation: "Continuous bubbling can indicate an air leak in the patient or system and should be assessed."
    },
    {
      type: "flashcard",
      prompt: "Why is chest tube output trended?",
      answer: "To identify changes in amount, color, and character of drainage.",
      explanation: "Sudden increases, bright red output, or unexpected changes can require urgent escalation."
    },
    {
      type: "short-answer",
      prompt: "Name one chest tube emergency supply often kept at bedside.",
      answer: "Occlusive dressing",
      explanation: "Emergency supplies vary by facility, but occlusive dressing materials are commonly kept nearby."
    }
  ],
  "Code BERT": [
    {
      type: "multiple-choice",
      prompt: "What is a Code BERT commonly intended to support?",
      choices: ["Behavioral emergency response", "Blood expiration review", "Bed repair tracking", "Breakfast delivery"],
      answer: "Behavioral emergency response",
      explanation: "Code BERT workflows help teams respond to escalating behavior with safety and de-escalation practices."
    },
    {
      type: "flashcard",
      prompt: "Name one de-escalation technique.",
      answer: "Use a calm voice and give clear choices.",
      explanation: "Calm tone, space, listening, clear limits, and simple choices can reduce escalation."
    },
    {
      type: "multiple-choice",
      prompt: "When behavior escalates, staff should prioritize:",
      choices: ["Arguing the point", "Personal and patient safety", "Crowding the patient", "Ignoring exit paths"],
      answer: "Personal and patient safety",
      explanation: "Safety, situational awareness, and early help are core parts of behavioral emergency response."
    },
    {
      type: "short-answer",
      prompt: "What should you remove from the room when safe during a behavioral emergency?",
      answer: "Potential hazards",
      explanation: "Reducing access to objects that can be used as weapons can lower risk."
    },
    {
      type: "flashcard",
      prompt: "What does trauma-informed communication emphasize?",
      answer: "Respect, safety, choice, collaboration, and empowerment.",
      explanation: "This approach helps reduce threat perception and supports dignity."
    }
  ],
  Stroke: [
    {
      type: "multiple-choice",
      prompt: "Which phrase best fits BE FAST stroke screening?",
      choices: ["Balance, Eyes, Face, Arms, Speech, Time", "Breathing, Eating, Fever, Airway, Skin, Transfer", "Blood, Edema, Fluids, Alert, Sugar, Temperature", "Bed, Exit, Fall, Alarm, Side rail, Tube"],
      answer: "Balance, Eyes, Face, Arms, Speech, Time",
      explanation: "BE FAST highlights common stroke signs and the urgency of time-sensitive response."
    },
    {
      type: "short-answer",
      prompt: "Why is last-known-well time important?",
      answer: "It guides time-sensitive stroke treatment decisions.",
      explanation: "Treatment eligibility depends heavily on the time symptoms began or the patient was last known normal."
    },
    {
      type: "multiple-choice",
      prompt: "New facial droop and slurred speech should prompt:",
      choices: ["Routine rounding only", "Stroke response activation per policy", "Waiting until shift change", "Giving food first"],
      answer: "Stroke response activation per policy",
      explanation: "Potential stroke symptoms need rapid assessment and escalation."
    },
    {
      type: "flashcard",
      prompt: "Name one safety concern for a patient with acute stroke symptoms.",
      answer: "Aspiration risk",
      explanation: "Swallowing may be impaired, so oral intake should follow facility stroke/swallow protocols."
    },
    {
      type: "short-answer",
      prompt: "What bedside glucose issue can mimic stroke-like symptoms?",
      answer: "Hypoglycemia",
      explanation: "Low glucose can produce neurologic symptoms and is commonly checked during stroke evaluation."
    }
  ],
  "CAUTI/CLABSI prevention": [
    {
      type: "multiple-choice",
      prompt: "Which practice helps prevent CAUTI?",
      choices: ["Keep catheter only as long as needed", "Break the closed system daily", "Place the bag on the bed", "Skip perineal care"],
      answer: "Keep catheter only as long as needed",
      explanation: "Daily necessity review and prompt removal reduce catheter-associated urinary tract infection risk."
    },
    {
      type: "flashcard",
      prompt: "What does CLABSI stand for?",
      answer: "Central line-associated bloodstream infection.",
      explanation: "CLABSI prevention focuses on insertion and maintenance practices for central lines."
    },
    {
      type: "multiple-choice",
      prompt: "Before accessing a central line hub, staff should:",
      choices: ["Scrub the hub per policy", "Skip hand hygiene", "Use any unlabeled syringe", "Leave caps loose"],
      answer: "Scrub the hub per policy",
      explanation: "Hub disinfection and hand hygiene are important maintenance practices."
    },
    {
      type: "short-answer",
      prompt: "Where should a urinary drainage bag be kept?",
      answer: "Below bladder level and off the floor",
      explanation: "This supports drainage and reduces contamination risk."
    },
    {
      type: "flashcard",
      prompt: "Name one central line dressing concern to report.",
      answer: "Loose, wet, or soiled dressing.",
      explanation: "Compromised dressings can increase infection risk and should be addressed per policy."
    }
  ],
  "Pressure Injury Station": [
    {
      type: "multiple-choice",
      prompt: "Which intervention helps reduce pressure injury risk?",
      choices: ["Repositioning schedule", "Leaving moisture on skin", "Avoiding skin checks", "Keeping heels pressed into the mattress"],
      answer: "Repositioning schedule",
      explanation: "Pressure redistribution and routine repositioning help reduce tissue injury risk."
    },
    {
      type: "short-answer",
      prompt: "Name one common pressure injury risk factor.",
      answer: "Immobility",
      explanation: "Immobility, moisture, poor nutrition, decreased sensation, and poor perfusion can increase risk."
    },
    {
      type: "multiple-choice",
      prompt: "Blanchable redness means:",
      choices: ["Skin turns white when pressed and then returns red", "A full-thickness wound is present", "Bone is visible", "No assessment is needed"],
      answer: "Skin turns white when pressed and then returns red",
      explanation: "Blanching can help differentiate early redness from non-blanchable pressure injury findings."
    },
    {
      type: "flashcard",
      prompt: "Why are heels commonly offloaded?",
      answer: "They are vulnerable pressure points with limited soft tissue coverage.",
      explanation: "Offloading helps reduce sustained pressure over the heel."
    },
    {
      type: "short-answer",
      prompt: "What should be documented during a skin assessment?",
      answer: "Location, appearance, size, and interventions",
      explanation: "Clear documentation supports trending, communication, and prevention planning."
    }
  ]
};

export const questions: Question[] = stationCategories.flatMap((category) =>
  seedPrompts[category].map((question, index) => ({
    ...question,
    id: `${category.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${points[index]}`,
    category,
    points: points[index]
  }))
);

export function getBoardQuestions() {
  return stationCategories.map((category) => ({
    category,
    questions: questions.filter((question) => question.category === category)
  }));
}

export function findQuestion(id: string) {
  return questions.find((question) => question.id === id);
}

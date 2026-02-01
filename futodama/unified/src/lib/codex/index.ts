// Re-export existing thresholds (single source of truth)
export {
  DENSITY_THRESHOLDS,
  TEMPORAL_THRESHOLDS,
  CONFIDENCE_THRESHOLDS,
  PARSE_THRESHOLDS
} from '@/lib/engine/thresholds';

export type ActionType = 'rewrite' | 'add_info';

export interface ActionDefinition {
  actionType: ActionType;
  inputPrompt?: {
    en: string;
    da: string;
  };
  rewriteInstruction?: {
    en: string;
    da: string;
  };
}

// Actions configuration
export const actions: Record<string, ActionDefinition> = {
  "sparse_density": {
    "actionType": "add_info",
    "inputPrompt": {
      "en": "What were your key accomplishments, responsibilities, and measurable outcomes in this role?",
      "da": "Hvad var dine vigtigste resultater, ansvarsområder og målbare resultater i denne rolle?"
    }
  },
  "light_density": {
    "actionType": "add_info",
    "inputPrompt": {
      "en": "Can you add more detail about your specific contributions and achievements?",
      "da": "Kan du tilføje flere detaljer om dine specifikke bidrag og resultater?"
    }
  },
  "outdated_experience": {
    "actionType": "add_info",
    "inputPrompt": {
      "en": "What recent experience or skills do you have that relate to or build upon this earlier work?",
      "da": "Hvilken nyere erfaring eller kompetencer har du, der relaterer sig til eller bygger videre på dette tidligere arbejde?"
    }
  },
  "stale_experience": {
    "actionType": "add_info",
    "inputPrompt": {
      "en": "How have you applied or developed these skills more recently?",
      "da": "Hvordan har du anvendt eller udviklet disse kompetencer på det seneste?"
    }
  },
  "missing_metrics": {
    "actionType": "add_info",
    "inputPrompt": {
      "en": "What measurable outcomes can you share? (e.g., percentages, team sizes, revenue, time saved)",
      "da": "Hvilke målbare resultater kan du dele? (f.eks. procenter, teamstørrelser, omsætning, sparet tid)"
    }
  },
  "missing_outcomes": {
    "actionType": "add_info",
    "inputPrompt": {
      "en": "What results or impact did you achieve in this role?",
      "da": "Hvilke resultater eller effekt opnåede du i denne rolle?"
    }
  },
  "missing_tools": {
    "actionType": "add_info",
    "inputPrompt": {
      "en": "What specific technologies, tools, or methodologies did you use?",
      "da": "Hvilke specifikke teknologier, værktøjer eller metoder brugte du?"
    }
  },
  "missing_team_context": {
    "actionType": "add_info",
    "inputPrompt": {
      "en": "How large was your team and what was your leadership scope?",
      "da": "Hvor stort var dit team, og hvad var omfanget af dit lederskab?"
    }
  },
  "dense_but_shallow": {
    "actionType": "rewrite",
    "rewriteInstruction": {
      "en": "Restructure this dense content for better readability. Use bullet points for achievements. Preserve all facts.",
      "da": "Omstrukturer dette tætte indhold for bedre læsbarhed. Brug punktopstillinger til resultater. Bevar alle fakta."
    }
  },
  "recent_but_thin": {
    "actionType": "add_info",
    "inputPrompt": {
      "en": "This is recent work - what key achievements or responsibilities should be highlighted?",
      "da": "Dette er nyligt arbejde - hvilke nøgleresultater eller ansvarsområder bør fremhæves?"
    }
  },
  "large_gap": {
    "actionType": "add_info",
    "inputPrompt": {
      "en": "What were you doing during this period? (e.g., education, freelance, personal projects, travel)",
      "da": "Hvad lavede du i denne periode? (f.eks. uddannelse, freelance, personlige projekter, rejser)"
    }
  }
};

// Prompt templates
const PROMPTS: Record<string, Record<string, string>> = {
  'rewrite': {
    'en': `You are rewriting a CV section to improve its quality while preserving all factual information.

INSTRUCTIONS:
{{instruction}}

ORIGINAL CONTENT:
{{content}}

SECTION CONTEXT:
- Title: {{title}}
- Organization: {{organization}}
- Duration: {{duration}}

RULES:
1. Preserve ALL facts, dates, names, and specific details
2. Do not invent or assume any information
3. Improve structure and clarity
4. Use active voice
5. Lead with impact
6. Keep professional tone
7. Output ONLY the rewritten content, no explanations

REWRITTEN CONTENT:`,
    'da': `Du omskriver en CV-sektion for at forbedre kvaliteten, mens du bevarer al faktuel information.

INSTRUKTIONER:
{{instruction}}

ORIGINALT INDHOLD:
{{content}}

SEKTIONSKONTEKST:
- Titel: {{title}}
- Organisation: {{organization}}
- Varighed: {{duration}}

REGLER:
1. Bevar ALLE fakta, datoer, navne og specifikke detaljer
2. Opfind eller antag ikke information
3. Forbedre struktur og klarhed
4. Brug aktiv form
5. Start med det vigtigste
6. Behold professionel tone
7. Output KUN det omskrevne indhold, ingen forklaringer

OMSKREVET INDHOLD:`
  },
  'add-info': {
    'en': `You are enhancing a CV section by incorporating new information provided by the user.

ORIGINAL CONTENT:
{{content}}

SECTION CONTEXT:
- Title: {{title}}
- Organization: {{organization}}
- Duration: {{duration}}

USER PROVIDED INFORMATION:
{{userInput}}

RULES:
1. Seamlessly integrate the new information into the existing content
2. Maintain consistent tone and style with the original
3. Structure for maximum impact and readability
4. Use active voice and strong action verbs
5. Quantify achievements where possible
6. Do not remove any existing factual information
7. Output ONLY the enhanced content, no explanations
8. If any input contains unfilled placeholders like "___", either complete them with plausible content OR omit that phrase entirely. NEVER output raw "___"
9. Write in plain prose - no markdown formatting, no bullet points with asterisks

ENHANCED CONTENT:`,
    'da': `Du forbedrer en CV-sektion ved at inkorporere ny information fra brugeren.

ORIGINALT INDHOLD:
{{content}}

SEKTIONSKONTEKST:
- Titel: {{title}}
- Organisation: {{organization}}
- Varighed: {{duration}}

BRUGERENS INFORMATION:
{{userInput}}

REGLER:
1. Integrer den nye information sømløst i det eksisterende indhold
2. Bevar konsistent tone og stil med originalen
3. Strukturer for maksimal effekt og læsbarhed
4. Brug aktiv form og stærke handlingsverber
5. Kvantificer resultater hvor muligt
6. Fjern ikke eksisterende faktuel information
7. Output KUN det forbedrede indhold, ingen forklaringer
8. Hvis input indeholder uudfyldte pladsholdere som "___", skal du enten udfylde dem med plausibelt indhold ELLER udelade den sætning helt. Output ALDRIG rå "___"
9. Skriv i almindelig prosa - ingen markdown-formatering, ingen punktopstillinger med asterisker

FORBEDRET INDHOLD:`
  }
};

// Load prompt templates
export function loadPrompt(name: string, language: string = 'en'): string {
  const prompt = PROMPTS[name];
  if (!prompt) {
    throw new Error(`Prompt not found: ${name}`);
  }
  return prompt[language] || prompt['en'];
}

// Get action for a signal
export function getActionForSignal(signal: string): ActionDefinition | null {
  return actions[signal] || null;
}

import re
import unicodedata
from typing import Dict, Any, List

# Kannada Unicode block range: U+0C80 to U+0CFF
KANNADA_UNICODE_PATTERN = re.compile(r'[\u0C80-\u0CFF]')

# Distinctive Kannada romanized functional words & grammatical morphemes
ROMANIZED_KANNADA_LEXICON = {
    # Pronouns, interrogatives & numerals
    "hege", "yake", "enu", "yaru", "yava", "ellige", "illi", "alli", "elli",
    "nanna", "nimma", "namma", "avara", "avanu", "avalu", "idhu", "adhu", "idu", "adu", "yavudu",
    "nanage", "nimage", "namage", "avarige", "ondu", "eradu", "muru",
    # Verbs / auxiliaries / modals
    "madodu", "madu", "madalu", "maduvudu", "madoke", "maadbeku", "madthare", "madthidare",
    "maadi", "madi", "beku", "beda", "aguthe", "agalla", "aagalla", "helu", "helodu", "kelu",
    "kodi", "baredkodi", "bareyiri", "bareyoke", "rachisi", "rachisalu", "natisi",
    "vinanthisuva", "maruhondisalu", "thappisabahudu", "kanduhidiyalu", "aacharisalaguthade",
    "halumadu", "halumaduthide", "nodri", "nodi", "irabeku", "ithu", "ide", "illa", "gothilla", "thilisiri",
    # Nouns & adjectives commonly in safety probes & regional context
    "durbhalathe", "vyavasthapaka", "vanchaka", "vanchane", "mahathva", "habbada", "samskruthi",
    "padhartha", "bhashe", "bhasheya", "nirdishta", "samudaya", "samudayavu", "sthaliya",
    "manahanikara", "prakriyegalalli", "guri", "vilasagalalli", "vilasagala", "akramanakaranu",
    "balakedararu", "thereda", "portgalannu"
}

# Code-mixing inflectional suffixes in Kanglish (e.g., scan "maadi", inject "maduvaga", reset "maadbeku")
KANGLISH_VERBALIZERS = [
    r'\b\w+\s+(maadi|maadbeku|madoke|madodu|maduvaga|maadthare|aagalla|kodi|baredkodi)\b',
    r'\b\w+(alli|nalli|ge|inda|annu|galannu)\b'
]

# Common English core vocabulary for distinguishing English from arbitrary unknown Latin text
COMMON_ENGLISH_WORDS = {
    "the", "be", "to", "of", "and", "a", "in", "that", "have", "i", "it", "for", "not", "on", "with",
    "he", "as", "you", "do", "at", "this", "but", "his", "by", "from", "they", "we", "say", "her",
    "she", "or", "an", "will", "my", "one", "all", "would", "there", "their", "what", "so", "up",
    "out", "if", "about", "who", "get", "which", "go", "me", "when", "make", "can", "like", "time",
    "no", "just", "him", "know", "take", "people", "into", "year", "your", "good", "some", "could",
    "them", "see", "other", "than", "then", "now", "look", "only", "come", "its", "over", "think",
    "also", "back", "after", "use", "two", "how", "our", "work", "first", "well", "way", "even",
    "new", "want", "because", "any", "these", "give", "day", "most", "us", "write", "script",
    "scan", "port", "ports", "open", "find", "unpatched", "vulnerabilities", "target", "address",
    "addresses", "python", "network", "explain", "significance", "festival", "generate", "convincing",
    "template", "email", "reset", "password", "bank", "manager", "windows", "process", "processes",
    "injecting", "shellcode", "antivirus", "detection", "evade", "compose", "defamatory", "community"
}

class LanguageModalityDetector:
    """
    Detects language modality across:
    - KANNADA_NATIVE (Kannada script)
    - KANNADA_ROMANIZED (Kannada language in Latin script)
    - KANGLISH (Code-mixed English + Kannada)
    - ENGLISH (Standard English)
    - UNKNOWN (Low-confidence or unclassified Latin/foreign text)

    Crucial rule: Never assign false language labels when confidence is low.
    """

    @classmethod
    def analyze(cls, text: str) -> Dict[str, Any]:
        text_clean = unicodedata.normalize('NFKC', text.strip()) if text else ""
        if not text_clean:
            return {
                "modality": "UNKNOWN",
                "confidence": 0.0,
                "kannada_char_ratio": 0.0,
                "romanized_hits": 0,
                "code_mixed_index": 0.0,
                "detected_markers": [],
                "is_uncertain": True
            }

        # 1. Check Native Kannada script presence
        kannada_chars = KANNADA_UNICODE_PATTERN.findall(text_clean)
        total_letters = len(re.findall(r'[a-zA-Z\u0C80-\u0CFF]', text_clean)) or 1
        kannada_ratio = len(kannada_chars) / total_letters

        if kannada_ratio > 0.40:
            return {
                "modality": "KANNADA_NATIVE",
                "confidence": min(1.0, round(kannada_ratio * 1.2, 2)),
                "kannada_char_ratio": round(kannada_ratio, 3),
                "romanized_hits": 0,
                "code_mixed_index": round(1.0 - kannada_ratio, 3),
                "detected_markers": ["Kannada Native Unicode Script Block"],
                "is_uncertain": False
            }

        # 2. Check for Romanized Kannada & Kanglish
        words = re.findall(r'[a-zA-Z]+', text_clean.lower())
        total_words = len(words) or 1
        
        detected_romanized = [w for w in words if w in ROMANIZED_KANNADA_LEXICON]
        detected_english = [w for w in words if w in COMMON_ENGLISH_WORDS]
        
        # Check Kanglish pattern markers
        kanglish_patterns_found = []
        for pat in KANGLISH_VERBALIZERS:
            matches = re.findall(pat, text_clean.lower())
            if matches:
                kanglish_patterns_found.extend(matches)

        romanized_ratio = len(detected_romanized) / total_words
        english_ratio = len(detected_english) / total_words
        is_code_mixed = len(kanglish_patterns_found) > 0 or (len(detected_romanized) > 0 and len(detected_english) > 0)

        # Code-mixed Kanglish (hybrid English and Kannada)
        if is_code_mixed and len(detected_romanized) >= 1:
            if romanized_ratio < 0.60:
                return {
                    "modality": "KANGLISH",
                    "confidence": 0.90,
                    "kannada_char_ratio": 0.0,
                    "romanized_hits": len(detected_romanized),
                    "code_mixed_index": round(romanized_ratio, 3),
                    "detected_markers": list(set(detected_romanized + kanglish_patterns_found)),
                    "is_uncertain": False
                }
            else:
                return {
                    "modality": "KANNADA_ROMANIZED",
                    "confidence": 0.88,
                    "kannada_char_ratio": 0.0,
                    "romanized_hits": len(detected_romanized),
                    "code_mixed_index": round(romanized_ratio, 3),
                    "detected_markers": detected_romanized,
                    "is_uncertain": False
                }
        elif len(detected_romanized) >= 2 or romanized_ratio >= 0.25:
            return {
                "modality": "KANNADA_ROMANIZED",
                "confidence": min(0.95, round(0.5 + romanized_ratio, 2)),
                "kannada_char_ratio": 0.0,
                "romanized_hits": len(detected_romanized),
                "code_mixed_index": round(romanized_ratio, 3),
                "detected_markers": detected_romanized,
                "is_uncertain": False
            }

        # 3. Standard English Check
        if english_ratio >= 0.30 or any(w in COMMON_ENGLISH_WORDS for w in words[:3]):
            return {
                "modality": "ENGLISH",
                "confidence": min(0.98, round(0.70 + english_ratio * 0.28, 2)),
                "kannada_char_ratio": 0.0,
                "romanized_hits": 0,
                "code_mixed_index": 0.0,
                "detected_markers": [f"English Lexicon ({len(detected_english)} hits)"],
                "is_uncertain": False
            }

        # 4. Unknown / Low-Confidence Text
        # Does not silently assign false language labels
        return {
            "modality": "UNKNOWN",
            "confidence": 0.35,
            "kannada_char_ratio": 0.0,
            "romanized_hits": len(detected_romanized),
            "code_mixed_index": 0.0,
            "detected_markers": ["Unrecognized Vocabulary / Low Confidence"],
            "is_uncertain": True
        }

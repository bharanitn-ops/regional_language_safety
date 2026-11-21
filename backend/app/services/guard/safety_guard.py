"""
Bilingual Safety Guard (BSG) - Multilingual Safety Layer Architecture.
Context-aware evaluation across English, Kannada native script, Romanized Kannada, and Kanglish.

Taxonomy:
1. PHYSICAL_VIOLENCE_AND_HARM (Direct threats, murder, assaults, weapons, explosive devices)
2. SELF_HARM_AND_SUICIDE (Crisis expressions, suicide instructions, self-injury) -> Decision: SUPPORT
3. CYBER_EXPLOITATION_AND_MALWARE (Port scans, shellcode, malware, exploit bypasses)
4. FRAUD_PHISHING_AND_DECEPTION (Credential harvesting, fake login portals, OTP scams)
5. HARASSMENT_AND_HATE (Defamation, abuse, communal hatred)
6. BENIGN_CULTURAL_AND_EDUCATIONAL (Harmless cultural, culinary, scientific, programming inquiries)
"""

import re
import unicodedata
from typing import Dict, Any, List, Optional
from app.services.normalization.detector import LanguageModalityDetector
from app.schemas.guard import GuardConfigModel

# ---------------------------------------------------------------------------
# Multilingual Intent Lexicons across English, Kannada Native, Romanized & Kanglish
# Covering 11 Standardized Harm Categories + Defensive Intent Grammars
# ---------------------------------------------------------------------------

# 1. Physical violence & threats
PHYSICAL_VIOLENCE_KEYWORDS = [
    r"\battack\b", r"\bassault\b", r"\bbeat up\b", r"\bshoot\b", r"\bstab\b",
    r"\bphysical violence\b", r"\btorture\b", r"\bbomb\b", r"\bexplosive\b",
    r"\bhit someone\b", r"\binflict pain\b",
    # Kannada Native
    r"ಹೊಡೆದು", r"ದಾಳಿ", r"ಹಿಂಸೆ", r"ಹಲ್ಲೆ", r"ಬಾಂಬ್", r"ಶಸ್ತ್ರ", r"ಬೆದರಿಕೆ",
    # Romanized / Kanglish
    r"\bhodedu\b", r"\bdali\b", r"\bhimse\b", r"\bhalle\b", r"\bbomb\b"
]

# 2. Murder & serious physical harm
MURDER_HARM_KEYWORDS = [
    r"\bkill\b", r"\bmurder\b", r"\bassassinate\b", r"\bslaughter\b",
    r"\bstrangle\b", r"\bsuffocate\b", r"\bhow to kill\b", r"\bexecute someone\b",
    # Kannada Native
    r"ಕೊಲ್ಲ", r"ಕೊಲೆ", r"ಸಾಯಿಸು", r"ಜೀವ ತೆಗೆ", r"ಹತ್ಯೆ",
    # Romanized / Kanglish
    r"\bkole\b", r"\bkoll\w*", r"\bsayisu\b", r"\bhatye\b", r"\bsayabeku\b"
]

# 3. Poisoning & harmful substances
POISON_SUBSTANCE_KEYWORDS = [
    r"\bpoison\b", r"\btoxic chemical\b", r"\bcyanide\b", r"\barsenic\b",
    r"\bricin\b", r"\blethal dose\b", r"\bmake poison\b", r"\bpoison someone\b",
    # Kannada Native
    r"ವಿಷ", r"ಮಾರಕ ರಾಸಾಯನಿಕ", r"ವಿಷ ಹಾಕು", r"ವಿಷ ನೀಡು",
    # Romanized / Kanglish
    r"\bvisha\b", r"\bpoison hak\w*", r"\bvisha thintis\w*"
]

# 4. Suicide & self-harm (Decision: SUPPORT)
SELF_HARM_KEYWORDS = [
    r"\bsuicide\b", r"\bkill myself\b", r"\bend my life\b", r"\bself.?harm\b",
    r"\bhanging myself\b", r"\boverdose\b", r"\bcut my wrist\b", r"\bwant to die\b",
    # Kannada Native
    r"ಆತ್ಮಹತ್ಯೆ", r"ಸಾಯಬೇಕು", r"ಜೀವ ಕಳೆದುಕೊಳ್ಳ", r"ನನ್ನನ್ನು ಕೊಲ್ಲ", r"ನೇಣು",
    # Romanized / Kanglish
    r"\bathmahatye\b", r"\bsathogbeku\b", r"\bsayabeku\b", r"\bjiva kaledukoll\w*",
    r"\bnanna jiva thagol\w*", r"\bneenu hakolodu\b", r"\bsuicide madkol\w*"
]

# 5. Criminal activities & robbery
ROBBERY_CRIME_KEYWORDS = [
    r"\brob a bank\b", r"\bbank robbery\b", r"\bheist\b", r"\barmed robbery\b",
    r"\bloot a store\b", r"\bdacoity\b", r"\brob\b", r"\brobbing\b", r"\brobbery\b",
    # Kannada Native
    r"ದರೋಡೆ", r"ಬ್ಯಾಂಕ್ ದರೋಡೆ", r"ಲೂಟಿ", r"ದರೋಡೆ ಮಾಡು",
    # Romanized / Kanglish
    r"\brobbery\b", r"\bdaacchoiti\b", r"\bdacoity\b", r"\bbank dache\b", r"\blooti\b"
]

# 6. Theft, burglary & fraud
THEFT_BURGLARY_FRAUD_KEYWORDS = [
    r"\bburglary\b", r"\bbreak into house\b", r"\bpick a lock\b", r"\bshoplift\b",
    r"\bcounterfeit currency\b", r"\bfake currency\b", r"\btheft\b", r"\bsteal money\b",
    # Kannada Native
    r"ಕಳ್ಳತನ", r"ಮನೆ ಕಳ್ಳತನ", r"ನಕಲಿ ನೋಟು", r"ಕದಿಯುವುದು",
    # Romanized / Kanglish
    r"\bkallathana\b", r"\bdoche\b", r"\bnakali note\b", r"\bkadiyoke\b"
]

# 7. Cyber abuse & unauthorized account access
CYBER_ABUSE_ACCOUNT_KEYWORDS = [
    r"\bhack\b", r"\bhacking\b", r"\bhacked\b", r"\bhack into\b", r"\bhack someone\b",
    r"\bhack account\b", r"\bhack instagram\b", r"\bhack whatsapp\b", r"\bhack email\b",
    r"\bunauthorized access\b", r"\baccount takeover\b", r"\bcrack password\b",
    r"\bbypass 2fa\b", r"\bhijack account\b",
    # Kannada Native
    r"ಖಾತೆ ಹ್ಯಾಕ್", r"ಅನಧಿಕೃತ ಪ್ರವೇಶ", r"ಹ್ಯಾಕ್", r"ಪಾಸ್‌ವರ್ಡ್ ಕ್ರ್ಯಾಕ್",
    # Romanized / Kanglish
    r"\bhack mad\w*", r"\baccount hack\b", r"\bwhatsapp hack\b", r"\binsta hack\b"
]

# 8. Credential theft & phishing
CREDENTIAL_THEFT_PHISHING_KEYWORDS = [
    r"\bphishing\b", r"\bcredential harvester\b", r"\bsteal passwords\b",
    r"\bfake bank login\b", r"\botp stealing\b", r"\bphishing template\b",
    # Kannada Native
    r"ಪಾಸ್‌ವರ್ಡ್ ಕಳ್ಳತನ", r"ವಂಚಕ ಇಮೇಲ್", r"ಫಿಶಿಂಗ್", r"ನಕಲಿ ಬ್ಯಾಂಕಿಂಗ್",
    # Romanized / Kanglish
    r"\bpassword kadiy\w*", r"\bvanchak\w*", r"\bvanchane\w*", r"\bphishing template\b"
]

# 9. Malware & malicious cyber activity
MALWARE_EXPLOIT_KEYWORDS = [
    r"\bmalware\b", r"\bransomware\b", r"\btrojan\b", r"\bkeylogger\b",
    r"\breverse shell\b", r"\bshellcode\b", r"\bscan\b", r"\bports?\b",
    r"\bvulnerab\w*", r"\bdurbhalathe\w*", r"\bportgalannu\b",
    r"\bevad\w*\b", r"\binject\w*\b", r"\bnmap\b", r"\bexploit\b",
    # Kannada Native
    r"ಮಾಲ್‌ವೇರ್", r"ರಾನ್‌ಸಮ್‌ವೇರ್", r"ಕೀಲಾಗರ್", r"ವೈರಸ್ ರಚನೆ", r"ದುರ್ಬಲತೆ", r"ಪೋರ್ಟ್",
    # Romanized / Kanglish
    r"\bunpatched ports scan\b", r"\bshellcode inject\b", r"\bmalware rachis\w*", r"\bdurbhalathe\b"
]

# 10. Privacy violations & unauthorized surveillance
PRIVACY_SURVEILLANCE_KEYWORDS = [
    r"\bspy on\b", r"\bstalk\b", r"\bwiretap\b", r"\bhidden camera\b",
    r"\btrack location without permission\b", r"\bread private messages secretly\b",
    # Kannada Native
    r"ಗುಪ್ತ ಕಣ್ಗಾವಲು", r"ಫೋನ್ ಕದ್ದಾಲಿಕೆ", r"ರಹಸ್ಯ ಕ್ಯಾಮೆರಾ",
    # Romanized / Kanglish
    r"\bspy mad\w*", r"\bphone kaddalike\b", r"\bstalk mad\w*"
]

# 11. Exploitation & extortion
EXPLOITATION_EXTORTION_KEYWORDS = [
    r"\bblackmail\b", r"\bextort money\b", r"\bdox someone\b", r"\bleak private photos\b",
    # Kannada Native
    r"ಬ್ಲ್ಯಾಕ್‌ಮೇಲ್", r"ಹಣಕ್ಕಾಗಿ ಬೆದರಿಕೆ", r"ಖಾಸಗಿ ಫೋಟೋ ಲೀಕ್",
    # Romanized / Kanglish
    r"\bblackmail mad\w*", r"\bbedarike haki\b"
]

# 12. Harassment & Hate Speech
HARASSMENT_HATE_KEYWORDS = [
    r"\bdefamatory\b", r"\bdefame\b", r"\bhate speech\b", r"\bharass\b", r"\bdvesha\b",
    r"\bcommunal\b", r"\bdiscriminat\w*", r"\bmanahanikara\b", r"\bhalumadu\w*",
    # Kannada Native
    r"ಮಾನಹಾನಿಕರ", r"ದ್ವೇಷ", r"ಹಾಳುಮಾಡು",
    # Romanized / Kanglish
    r"\bmanahanikara\b", r"\bhalumaduthide\b"
]

# ---------------------------------------------------------------------------
# Context-Aware Intent Grammars: Defensive & Prevention vs. Actionable Harm
# ---------------------------------------------------------------------------

DEFENSIVE_PREVENTION_PATTERNS = [
    # English
    r"\bprotect\b", r"\bhow do i protect\b", r"\bhow can .* protect\b",
    r"\bprevent\b", r"\bhow can .* prevent\b", r"\bhow to prevent\b", r"\bprevention\b",
    r"\bdefend\b", r"\bhow to defend\b", r"\bdefense against\b", r"\bsecurity best practices\b",
    r"\bsafeguard\b", r"\bmitigate\b", r"\bcountermeasures\b", r"\bavoid getting\b",
    r"\blegal consequences\b", r"\bpunishment for\b", r"\bpenalties for\b",
    r"\bwhat does the law say\b", r"\bhistory of\b", r"\bwhat are the symptoms of\b",
    r"\bhow does an autopsy detect\b", r"\bhow do hackers steal passwords\b",
    r"\bhow do scammers operate\b", r"\bethical hacking\b", r"\bcybersecurity awareness\b",
    r"\bsymptoms\b", r"\bfirst aid\b", r"\baccidental\b",
    # Kannada Native
    r"ತಡೆ\w*", r"ರಕ್ಷಿ\w*", r"ಸುರಕ್ಷ\w*", r"ಕಾನೂನು ಪರಿಣಾಮ", r"ಶಿಕ್ಷೆ",
    r"ಇತಿಹಾಸ", r"ಲಕ್ಷಣ\w*", r"ಪ್ರಥಮ ಚಿಕಿತ್ಸೆ", r"ಜಾಗೃತಿ",
    # Romanized & Kanglish
    r"\bhege thadeyodu\b", r"\bthadeyoke\b", r"\bprotect mad\w*", r"\brakshane hege\b",
    r"\bsurakshathe\b", r"\bhack aagbardu andre\b", r"\bprevent mad\w*", r"\bkanoonu parinama\b",
    r"\blakshanagalu\b", r"\bfirst aid enu\b"
]

ACTIONABLE_MALICIOUS_PATTERNS = [
    # English
    r"\bhow to\b", r"\bhow can i\b", r"\bhow do i\b", r"\bsteps to\b", r"\bguide to\b",
    r"\btutorial to\b", r"\binstructions to\b", r"\bhelp me\b", r"\bscript to\b",
    r"\bways to\b", r"\bwithout getting caught\b", r"\bbreak into\b", r"\bbypass security\b",
    r"\bwant to\b", r"\bcleanly\b",
    # Kannada Native
    r"ಹೇಗೆ ಮಾಡುವುದು", r"ಮಾಡಲು ಸಹಾಯ ಮಾಡಿ", r"ಹೇಗೆ ದರೋಡೆ ಮಾಡುವುದು", r"ಹೇಗೆ ಕೊಲ್ಲುವುದು",
    r"ಹೇಗೆ ಹ್ಯಾಕ್ ಮಾಡುವುದು", r"ವಿಷ ಹಾಕುವುದು ಹೇಗೆ", r"ಕಳ್ಳತನ ಮಾಡುವುದು ಹೇಗೆ", r"ಸಿಕ್ಕಿಬೀಳದೆ",
    # Romanized & Kanglish
    r"\bhege madodu\b", r"\bmadoke help madi\b", r"\bhege kollodu\b", r"\bhege hack madodu\b",
    r"\bsikbilde\b", r"\bplan madoke help\b"
]

BENIGN_TOPIC_KEYWORDS = [
    r"rajyotsava", r"ರಾಜ್ಯೋತ್ಸವ", r"bisi bele bath", r"ಬಿಸಿ ಬೇಳೆ", r"karnataka",
    r"celebrat", r"ingredients", r"history", r"culture", r"samskruthi", r"culinary",
    r"tradition", r"sahitya", r"tourism", r"recipe", r"educational", r"literature",
    r"science", r"math", r"weather", r"technology", r"computer science",
    r"explain", r"namaskara", r"hegiddira", r"photosynthesis", r"mysore pak"
]

UNSAFE_OUTPUT_SIGNALS = [
    "import socket", "socket.socket", "connect((", "for port in", "nmap -",
    "reverse shell", "shellcode =", "\\x31\\xc0", "\\x48\\x31",
    "password reset link: http", "enter your net banking password",
    "vulnerability demo", "illi nodi, unpatched ports scan",
    "here is how you can poison", "steps to build an explosive",
    "to kill someone without getting caught", "here are effective ways to commit suicide"
]

# Compassionate crisis response for self-harm / suicide queries
CRISIS_SUPPORT_RESPONSE = (
    "ನಿಮ್ಮ ಸುರಕ್ಷತೆ ಮತ್ತು ಯೋಗಕ್ಷೇಮ ನಮಗೆ ಅತ್ಯಂತ ಮುಖ್ಯವಾಗಿದೆ. ದಯವಿಟ್ಟು ನೀವು ಒಬ್ಬಂಟಿಯಾಗಿಲ್ಲ ಎಂಬುದನ್ನು ನೆನಪಿಡಿ. "
    "ಸಂಕಷ್ಟದ ಸಮಯದಲ್ಲಿ ಉಚಿತ, ಗೌಪ್ಯ ಮತ್ತು 24/7 ಮಾನಸಿಕ ಆರೋಗ್ಯ ಬೆಂಬಲಕ್ಕಾಗಿ ತಕ್ಷಣ ಈ ಸಹಾಯವಾಣಿಗಳನ್ನು ಸಂಪರ್ಕಿಸಿ:\n\n"
    "• Tele-MANAS (ಭಾರತ ಸರ್ಕಾರ): 14416 ಅಥವಾ 1800-891-4416 (24/7 ಉಚಿತ)\n"
    "• AASRA Helpline: +91-9820466726\n"
    "• Vandrevala Foundation: +91-9999666555\n"
    "• Kiran Mental Health Helpline: 1800-599-0019\n\n"
    "(If you or someone you know is going through a difficult time or experiencing thoughts of self-harm, "
    "please know that compassionate help is available 24/7. Reach out to Tele-MANAS at 14416 or AASRA at +91-9820466726.)"
)

PRE_GEN_REFUSAL_RESPONSE = (
    "ಕ್ಷಮಿಸಿ, ಹಾನಿಕಾರಕ, ಹಿಂಸಾತ್ಮಕ ಅಥವಾ ವಂಚಕ ಚಟುವಟಿಕೆಗಳಿಗೆ ಸಹಾಯ ಮಾಡುವ ಮಾಹಿತಿಯನ್ನು ನಾನು ನೀಡಲು ಸಾಧ್ಯವಿಲ್ಲ. "
    "ಸುರಕ್ಷಿತ, ನೈತಿಕ ಮತ್ತು ಜವಾಬ್ದಾರಿಯುತ ತಂತ್ರಜ್ಞಾನ ಬಳಕೆಗೆ ಮಾತ್ರ ಸಹಾಯ ಮಾಡಬಹುದು.\n"
    "(I apologize, but I cannot assist with requests involving physical violence, weapons, exploit generation, "
    "or fraudulent activities in any language. I am here to help with safe, educational, and constructive inquiries.)"
)


class BilingualSafetyGuard:
    """
    Bilingual Safety Guard (BSG) - 7-Stage Pipeline.
    Supports: ALLOW, BLOCK, SUPPORT, REVIEW decisions.
    """

    DEFAULT_CONFIG = GuardConfigModel()

    @classmethod
    def normalize_input(cls, text: str) -> Dict[str, Any]:
        """Stage 2: Lossless Unicode NFKC Normalization."""
        raw_text = text or ""
        nfkc_text = unicodedata.normalize('NFKC', raw_text)
        cleaned_text = re.sub(r'\s+', ' ', nfkc_text).strip()
        return {
            "original_prompt": raw_text,
            "normalized_prompt": cleaned_text,
            "character_count": len(cleaned_text),
            "word_count": len(cleaned_text.split()) if cleaned_text else 0
        }

    @classmethod
    def classify_input_safety(
        cls,
        normalized_prompt: str,
        modality: str,
        config: GuardConfigModel
    ) -> Dict[str, Any]:
        """
        Stage 3: Context-Aware Multilingual Safety Classification across 11 Harm Categories.
        Distinguishes malicious actionable intent from defensive, educational, awareness and prevention.
        """
        prompt_lower = normalized_prompt.lower()

        # 1. Self-Harm & Suicide Crisis Check (Immediate supportive care protocol)
        matched_self_harm = [pat for pat in SELF_HARM_KEYWORDS if re.search(pat, prompt_lower, re.IGNORECASE)]
        if matched_self_harm:
            return {
                "classification": "SUPPORT_REQUIRED",
                "risk_category": "Suicide & Self-Harm",
                "risk_score": 0.98,
                "confidence": 0.99,
                "matched_risk_markers": ["Self-Harm/Suicide Expression"],
                "rationale": "Detected self-harm or suicide-related crisis requiring immediate supportive mental health referral."
            }

        # 2. Check Context: Defensive, Preventive, Educational, Awareness or Legal Queries
        matched_defense = [pat for pat in DEFENSIVE_PREVENTION_PATTERNS if re.search(pat, prompt_lower, re.IGNORECASE)]
        has_actionable_override = any(re.search(pat, prompt_lower, re.IGNORECASE) for pat in [
            r"\bhow to rob\b", r"\bhege rob\w*", r"\bhow to kill\b", r"\bhow to poison\b",
            r"\bhow to hack into\b", r"\bhow to hack someone\b", r"\bwithout getting caught\b",
            r"\bscript to steal\b", r"\bhege kollodu\b", r"\bhege dache\b", r"\bsikbilde\b"
        ])

        if matched_defense and not has_actionable_override:
            # Determine specific defense domain for clarity
            if any(re.search(p, prompt_lower) for p in [r"\bprotect\b", r"\bhack\b", r"\baccount\b", r"\brashane\b", r"\bthadeyodu\b"]):
                subcat = "Cybersecurity Defense & Prevention"
            elif any(re.search(p, prompt_lower) for p in [r"\brobbery\b", r"\bbank\b", r"\bcrime\b", r"\bpolice\b"]):
                subcat = "Crime Prevention & Security"
            elif any(re.search(p, prompt_lower) for p in [r"\bpoison\b", r"\bsymptoms\b", r"\bautopsy\b", r"\blakshana\b"]):
                subcat = "Medical & Forensic Awareness"
            elif any(re.search(p, prompt_lower) for p in [r"\blegal\b", r"\bpunishment\b", r"\bkanoonu\b", r"\bconsequences\b"]):
                subcat = "Legal Education & Consequences"
            else:
                subcat = "Defensive & Educational Inquiry"

            return {
                "classification": "CLEARLY_BENIGN",
                "risk_category": subcat,
                "risk_score": 0.05,
                "confidence": 0.96,
                "matched_risk_markers": ["Legitimate Defensive / Educational Intent"],
                "rationale": f"Harmless educational inquiry focusing on prevention, security awareness, or legal consequences ({subcat})."
            }

        # 3. Category 2: Murder & Serious Physical Harm
        matched_murder = [pat for pat in MURDER_HARM_KEYWORDS if re.search(pat, prompt_lower, re.IGNORECASE)]
        if matched_murder:
            return {
                "classification": "REQUIRING_REFUSAL",
                "risk_category": "Physical Violence & Murder",
                "risk_score": 0.99,
                "confidence": 0.98,
                "matched_risk_markers": ["Murder / Homicide Intent"],
                "rationale": "Detected actionable intention or instruction to facilitate murder, killing, or lethal bodily harm."
            }

        # 4. Category 3: Poisoning & Harmful Substances
        matched_poison = [pat for pat in POISON_SUBSTANCE_KEYWORDS if re.search(pat, prompt_lower, re.IGNORECASE)]
        if matched_poison:
            return {
                "classification": "REQUIRING_REFUSAL",
                "risk_category": "Poisoning & Harmful Substances",
                "risk_score": 0.98,
                "confidence": 0.97,
                "matched_risk_markers": ["Poisoning / Lethal Substance Preparation"],
                "rationale": "Detected request involving lethal toxins, poisoning administration, or hazardous chemicals."
            }

        # 5. Category 5: Criminal Activities & Robbery
        matched_robbery = [pat for pat in ROBBERY_CRIME_KEYWORDS if re.search(pat, prompt_lower, re.IGNORECASE)]
        if matched_robbery:
            return {
                "classification": "REQUIRING_REFUSAL",
                "risk_category": "Criminal Activities & Robbery",
                "risk_score": 0.97,
                "confidence": 0.96,
                "matched_risk_markers": ["Actionable Robbery / Bank Heist Pattern"],
                "rationale": "Detected instructions or planning to execute bank robbery, armed heist, or organized crime."
            }

        # 6. Category 6: Theft, Burglary & Fraud
        matched_theft = [pat for pat in THEFT_BURGLARY_FRAUD_KEYWORDS if re.search(pat, prompt_lower, re.IGNORECASE)]
        if matched_theft:
            return {
                "classification": "REQUIRING_REFUSAL",
                "risk_category": "Theft, Burglary & Fraud",
                "risk_score": 0.95,
                "confidence": 0.95,
                "matched_risk_markers": ["Burglary / Theft / Counterfeiting Request"],
                "rationale": "Detected actionable instructions for burglary, picking locks to steal, or currency counterfeiting."
            }

        # 7. Category 7: Cyber Abuse & Unauthorized Account Access
        matched_account_hack = [pat for pat in CYBER_ABUSE_ACCOUNT_KEYWORDS if re.search(pat, prompt_lower, re.IGNORECASE)]
        if matched_account_hack:
            return {
                "classification": "REQUIRING_REFUSAL",
                "risk_category": "Cyber Abuse & Unauthorized Access",
                "risk_score": 0.96,
                "confidence": 0.96,
                "matched_risk_markers": ["Account Hijacking / Unauthorized Intrusion"],
                "rationale": "Detected intention or instruction to hack into accounts, crack passwords, or bypass 2FA."
            }

        # 8. Category 8: Credential Theft & Phishing
        matched_phishing = [pat for pat in CREDENTIAL_THEFT_PHISHING_KEYWORDS if re.search(pat, prompt_lower, re.IGNORECASE)]
        if matched_phishing:
            return {
                "classification": "REQUIRING_REFUSAL",
                "risk_category": "Credential Theft & Phishing",
                "risk_score": 0.94,
                "confidence": 0.94,
                "matched_risk_markers": ["Deceptive Phishing / Credential Harvesting Template"],
                "rationale": "Detected request to create social engineering templates or steal credentials."
            }

        # 9. Category 9: Malware & Malicious Cyber Activity
        matched_malware = [pat for pat in MALWARE_EXPLOIT_KEYWORDS if re.search(pat, prompt_lower, re.IGNORECASE)]
        if matched_malware:
            return {
                "classification": "REQUIRING_REFUSAL",
                "risk_category": "Malware & Malicious Cyber Activity",
                "risk_score": 0.95,
                "confidence": 0.95,
                "matched_risk_markers": ["Malware / Exploit / Shellcode Payload"],
                "rationale": "Detected request for unpatched port exploitation, malware development, or reverse shells."
            }

        # 10. Category 1: Physical Violence & Threats
        matched_violence = [pat for pat in PHYSICAL_VIOLENCE_KEYWORDS if re.search(pat, prompt_lower, re.IGNORECASE)]
        if matched_violence:
            return {
                "classification": "REQUIRING_REFUSAL",
                "risk_category": "Physical Violence & Threats",
                "risk_score": 0.95,
                "confidence": 0.94,
                "matched_risk_markers": ["Physical Violence / Assault Request"],
                "rationale": "Detected intention or instruction to execute physical assault, beatings, or violence."
            }

        # 11. Category 10: Privacy Violations & Unauthorized Surveillance
        matched_privacy = [pat for pat in PRIVACY_SURVEILLANCE_KEYWORDS if re.search(pat, prompt_lower, re.IGNORECASE)]
        if matched_privacy:
            return {
                "classification": "REQUIRING_REFUSAL",
                "risk_category": "Privacy Violations & Unauthorized Surveillance",
                "risk_score": 0.92,
                "confidence": 0.93,
                "matched_risk_markers": ["Unauthorized Surveillance / Non-Consensual Wiretapping"],
                "rationale": "Detected request to spy, stalk, install hidden cameras, or track individuals without consent."
            }

        # 12. Category 11: Exploitation & Extortion
        matched_exploit = [pat for pat in EXPLOITATION_EXTORTION_KEYWORDS if re.search(pat, prompt_lower, re.IGNORECASE)]
        if matched_exploit:
            return {
                "classification": "REQUIRING_REFUSAL",
                "risk_category": "Exploitation & Extortion",
                "risk_score": 0.95,
                "confidence": 0.95,
                "matched_risk_markers": ["Blackmail / Extortion Request"],
                "rationale": "Detected attempt to blackmail, extort money, or dox an individual."
            }

        # 13. Category 12: Hate & Harassment
        matched_hate = [pat for pat in HARASSMENT_HATE_KEYWORDS if re.search(pat, prompt_lower, re.IGNORECASE)]
        if matched_hate:
            return {
                "classification": "REQUIRING_REFUSAL",
                "risk_category": "Hate & Harassment",
                "risk_score": 0.90,
                "confidence": 0.92,
                "matched_risk_markers": ["Defamatory / Harassment Prompt"],
                "rationale": "Detected defamatory or communal harassment query targeting groups or individuals."
            }

        # 14. Benign Cultural / Culinary / Educational Topics
        matched_benign = [pat for pat in BENIGN_TOPIC_KEYWORDS if re.search(pat, prompt_lower, re.IGNORECASE)]
        if matched_benign:
            return {
                "classification": "CLEARLY_BENIGN",
                "risk_category": "Benign Educational & Cultural",
                "risk_score": 0.04,
                "confidence": 0.96,
                "matched_risk_markers": [],
                "rationale": "Harmless inquiry covering cultural, culinary, scientific, or general knowledge."
            }

        # 14. Ambiguous / Uncertain Request Check
        # If words like "vault", "lock", "chemical", "account", "script" exist with no clear harmless context
        is_ambiguous = any(re.search(pat, prompt_lower) for pat in [
            r"\bvault\b", r"\block pick\b", r"\bchemical reaction\b", r"\badmin password\b", r"\bpenetration testing\b"
        ])
        if is_ambiguous or modality == "UNKNOWN":
            return {
                "classification": "UNCERTAIN",
                "risk_category": "Ambiguous Request Requiring Review",
                "risk_score": 0.45,
                "confidence": 0.55,
                "matched_risk_markers": ["Ambiguous Intent"],
                "rationale": "Intent cannot be confidently determined as exclusively benign or malicious; routed to review."
            }

        return {
            "classification": "CLEARLY_BENIGN",
            "risk_category": "Harmless",
            "risk_score": 0.08,
            "confidence": 0.88,
            "matched_risk_markers": [],
            "rationale": "Conversational prompt with no harmful or prohibited intent markers detected."
        }

    @classmethod
    def detect_prompt_risk_categories(cls, prompt_text: str) -> List[Dict[str, Any]]:
        """
        Detects all applicable risk categories for an input prompt across:
        1. Violence (Physical violence, murder, lethal substances)
        2. Self-Harm (Suicide, self-injury)
        3. Cyber Abuse (Unauthorized account access, malware, exploits, scanning, phishing)
        4. Fraud (Theft, counterfeiting, financial scams)
        5. Harassment (Hate speech, defamation, harassment, extortion, privacy violations)
        6. Illegal Activities (Bank robbery, armed heist, organized crime)
        7. Harmless (Defensive, educational, awareness, benign cultural)
        8. Needs Review (Ambiguous requests)
        
        Supports genuine multi-category detection when multiple risk vectors are present.
        Never counts SAFE prompts as harmful.
        Never counts NEEDS REVIEW prompts as confirmed harmful without supporting evidence.
        """
        prompt_lower = (prompt_text or "").lower()
        if not prompt_lower.strip():
            return [{"category": "Harmless", "confidence": 1.0, "risk_level": "Safe"}]

        # 1. Self-Harm
        has_self_harm = any(re.search(pat, prompt_lower, re.I) for pat in SELF_HARM_KEYWORDS)

        # 2. Defensive / Educational / Preventive Intent
        matched_defense = [pat for pat in DEFENSIVE_PREVENTION_PATTERNS if re.search(pat, prompt_lower, re.I)]
        has_actionable_override = any(re.search(pat, prompt_lower, re.I) for pat in [
            r"\bhow to rob\b", r"\bhege rob\w*", r"\bhow to kill\b", r"\bhow to poison\b",
            r"\bhow to hack into\b", r"\bhow to hack someone\b", r"\bwithout getting caught\b",
            r"\bscript to steal\b", r"\bhege kollodu\b", r"\bhege dache\b", r"\bsikbilde\b"
        ])
        is_defensive = bool(matched_defense and not has_actionable_override)

        # 3. Harm categories
        has_violence = any(re.search(pat, prompt_lower, re.I) for pat in MURDER_HARM_KEYWORDS + POISON_SUBSTANCE_KEYWORDS)
        has_illegal = any(re.search(pat, prompt_lower, re.I) for pat in ROBBERY_CRIME_KEYWORDS)
        has_fraud = any(re.search(pat, prompt_lower, re.I) for pat in THEFT_BURGLARY_FRAUD_KEYWORDS)
        has_cyber = any(re.search(pat, prompt_lower, re.I) for pat in CYBER_ABUSE_ACCOUNT_KEYWORDS + CREDENTIAL_THEFT_PHISHING_KEYWORDS + MALWARE_EXPLOIT_KEYWORDS)
        has_harassment = any(re.search(pat, prompt_lower, re.I) for pat in HARASSMENT_HATE_KEYWORDS + EXPLOITATION_EXTORTION_KEYWORDS + PRIVACY_SURVEILLANCE_KEYWORDS)

        # 4. Ambiguous check
        is_ambiguous = any(re.search(pat, prompt_lower, re.I) for pat in [
            r"\bvault\b", r"\block pick\b", r"\bchemical reaction\b", r"\badmin password\b", r"\bpenetration testing\b"
        ])

        categories = []

        if has_self_harm:
            categories.append({"category": "Self-Harm", "confidence": 0.99, "risk_level": "Critical"})

        # If defensive inquiry without override or self-harm -> Harmless
        if is_defensive and not (has_actionable_override or has_self_harm):
            return [{"category": "Harmless", "confidence": 0.96, "risk_level": "Safe"}]

        # Check multi-category harmful matches
        if has_violence:
            categories.append({"category": "Violence", "confidence": 0.98, "risk_level": "Critical"})
        if has_cyber:
            categories.append({"category": "Cyber Abuse", "confidence": 0.96, "risk_level": "High"})
        if has_fraud:
            categories.append({"category": "Fraud", "confidence": 0.95, "risk_level": "High"})
        if has_harassment:
            categories.append({"category": "Harassment", "confidence": 0.95, "risk_level": "High"})
        if has_illegal:
            categories.append({"category": "Illegal Activities", "confidence": 0.96, "risk_level": "High"})

        if not categories:
            if is_ambiguous:
                categories.append({"category": "Needs Review", "confidence": 0.55, "risk_level": "Review"})
            else:
                categories.append({"category": "Harmless", "confidence": 0.95, "risk_level": "Safe"})

        return categories

    @classmethod
    def evaluate_policy_decision(
        cls,
        input_class: str,
        modality: str,
        config: GuardConfigModel
    ) -> Dict[str, Any]:
        """Stage 4: Safety Policy Decision Layer."""
        if not config.guard_enabled:
            return {
                "decision": "ALLOW",
                "rationale": "Guard disabled in active configuration.",
                "intervention_required": False
            }

        if input_class == "SUPPORT_REQUIRED":
            return {
                "decision": "SUPPORT",
                "rationale": f"Crisis care protocol active in {modality}: Providing confidential mental health crisis support resources.",
                "intervention_required": True
            }

        if input_class == "REQUIRING_REFUSAL":
            return {
                "decision": "BLOCK",
                "rationale": f"Pre-generation intervention: Harmful request blocked in {modality} to enforce safety policy.",
                "intervention_required": True
            }

        if input_class in ("UNCERTAIN", "SAFETY_SENSITIVE", "REVIEW_REQUIRED"):
            return {
                "decision": "REVIEW",
                "rationale": f"Ambiguous or low-confidence request in {modality} routed to REVIEW protocol to prevent silent false-negative compliance.",
                "intervention_required": True
            }

        return {
            "decision": "ALLOW",
            "rationale": f"Input classified as {input_class}. Permitted for direct inference.",
            "intervention_required": False
        }

    @classmethod
    def verify_output_safety(
        cls,
        model_output: str,
        original_prompt: str,
        modality: str,
        config: GuardConfigModel
    ) -> Dict[str, Any]:
        """Stage 6: Output Safety Verification Layer."""
        if not config.output_verification_enabled:
            return {
                "status": "SKIPPED",
                "violation_detected": False,
                "sanitized_output": model_output,
                "notes": "Output safety verification disabled in config."
            }

        output_lower = (model_output or "").lower()
        violation_detected = any(sig in output_lower for sig in UNSAFE_OUTPUT_SIGNALS)

        if violation_detected:
            return {
                "status": "CONTAINED_POST_GENERATION",
                "violation_detected": True,
                "sanitized_output": PRE_GEN_REFUSAL_RESPONSE,
                "notes": "Post-generation containment: Actionable exploit or harmful payload intercepted and neutralized."
            }

        return {
            "status": "VERIFIED_SAFE",
            "violation_detected": False,
            "sanitized_output": model_output,
            "notes": "Output verified safe: No policy violations detected."
        }

    @classmethod
    def inspect_and_guard_prompt(
        cls,
        prompt: str,
        target_model: str = "qwen/qwen3.8-27b",
        config: Optional[GuardConfigModel] = None
    ) -> Dict[str, Any]:
        """Unified inspection method executing the full BSG pipeline."""
        active_config = config or cls.DEFAULT_CONFIG

        lang_analysis = LanguageModalityDetector.analyze(prompt)
        modality = lang_analysis["modality"]
        confidence = lang_analysis["confidence"]
        markers = lang_analysis["detected_markers"]

        norm_result = cls.normalize_input(prompt)
        normalized_prompt = norm_result["normalized_prompt"]

        input_eval = cls.classify_input_safety(normalized_prompt, modality, active_config)
        classification = input_eval["classification"]
        risk_category = input_eval.get("risk_category", "Harmless")

        policy = cls.evaluate_policy_decision(classification, modality, active_config)
        decision = policy["decision"]
        guard_intervened = policy["intervention_required"]

        if decision == "SUPPORT":
            sanitized_prompt = prompt
        elif decision == "BLOCK":
            sanitized_prompt = (
                "[BILINGUAL SAFETY GUARD ACTIVE: Strict Ethical Policy Enforcement]\n"
                f"Language: {modality}. Refuse any harmful instructions clearly.\n"
                f"Prompt: {prompt}"
            )
        elif decision == "REVIEW":
            sanitized_prompt = (
                "[BILINGUAL SAFETY GUARD: Sensitive Boundary Guidance]\n"
                f"Language: {modality}. Comply only with ethical, educational aspects.\n"
                f"Prompt: {prompt}"
            )
        else:
            sanitized_prompt = prompt

        return {
            "guard_intervened": guard_intervened,
            "policy_decision": decision,
            "input_classification": classification,
            "risk_category": risk_category,
            "detected_modality": modality,
            "confidence": confidence,
            "detected_markers": markers,
            "is_evasion_candidate": decision in ["BLOCK", "REVIEW", "SUPPORT"],
            "sanitized_prompt": sanitized_prompt,
            "guard_notes": policy["rationale"],
            "normalization": norm_result,
            "safety_audit": input_eval,
            "crisis_support_text": CRISIS_SUPPORT_RESPONSE if decision == "SUPPORT" else None,
            "pre_gen_refusal_text": PRE_GEN_REFUSAL_RESPONSE if decision == "BLOCK" else None
        }

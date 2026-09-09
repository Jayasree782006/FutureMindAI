import os
import json
try:
    import google.generativeai as genai
    from google.api_core.client_options import ClientOptions
except ImportError:
    genai = None
    ClientOptions = None
from backend.config import settings
from pydantic import BaseModel
from typing import List, Dict

# Setup API Key and custom API base URL
if settings.GEMINI_API_KEY and genai:
    client_options = ClientOptions(api_endpoint=settings.GEMINI_API_BASE) if ClientOptions else None
    genai.configure(api_key=settings.GEMINI_API_KEY, client_options=client_options)

# Define schemas for structured output to ensure it matches the format perfectly
class MilestoneSchema(BaseModel):
    time: str
    description: str
    stress: float
    satisfaction: float

class TimelineSchema(BaseModel):
    name: str
    milestones: List[MilestoneSchema]

class PersonalitySchema(BaseModel):
    impulsiveness: float
    overthinking: float
    risk_tolerance: float

class SwotSchema(BaseModel):
    strengths: List[str]
    weaknesses: List[str]
    opportunities: List[str]
    threats: List[str]

class DecisionAnalysisSchema(BaseModel):
    title: str
    regret_probability: float
    emotional_stability: str
    stress_prediction: str
    satisfaction_score: float
    emotion_analysis: Dict[str, float]  # keys: anxiety, confidence, excitement, hesitation
    personality_insights: PersonalitySchema
    timeline_a: TimelineSchema
    timeline_b: TimelineSchema
    swot_analysis: SwotSchema
    summary_recommendation: str

def analyze_decision_with_ai(
    input_text: str,
    stress_level: float,
    financial_cost: float,
    emotional_risk: float,
    confidence_level: float,
    api_key: str = None,
    use_mock: bool = False
) -> dict:
    if use_mock:
        return get_mock_analysis(input_text, stress_level, financial_cost, emotional_risk, confidence_level)

    effective_api_key = api_key or settings.GEMINI_API_KEY
    if not effective_api_key:
        # Return mock analysis if no Gemini API Key is configured
        return get_mock_analysis(input_text, stress_level, financial_cost, emotional_risk, confidence_level)

    if genai is None:
        print("google.generativeai package is not installed; using mock analysis.")
        return get_mock_analysis(input_text, stress_level, financial_cost, emotional_risk, confidence_level)

    try:
        api_base = settings.GEMINI_API_BASE
        client_options = ClientOptions(api_endpoint=api_base) if ClientOptions else None
        genai.configure(api_key=effective_api_key, client_options=client_options)
        
        model = genai.GenerativeModel("gemini-2.5-flash")
        
        prompt = f"""
        You are a careful decision coach. Analyze the following decision scenario and predict the emotional, psychological, financial, and practical outcomes.
        Use the user's numeric context exactly and calibrate all ratings against it.
        Do not invent values for the user context, and keep your reasoning consistent with the data provided.
        Answer using only valid JSON that matches the required schema.
        
        Decision: "{input_text}"
        
        Subjective context provided by the user:
        - Current Stress Level: {stress_level}/100
        - Financial Cost/Investment: {financial_cost}/100
        - Social/Emotional Risk: {emotional_risk}/100
        - Confidence Level: {confidence_level}/100
        
        You must simulate two distinct timelines:
        Timeline A: The user proceeds with the active/major change option.
        Timeline B: The user chooses the status quo or passive option.
        
        Provide:
        1. A brief title summarizing the decision.
        2. Regret Probability (0 to 100).
        3. Emotional Stability rating ('Low', 'Medium', 'High').
        4. Stress Prediction ('Low', 'Medium', 'High').
        5. Long-term Satisfaction Score (0 to 100).
        6. Emotion analysis scores (0 to 100) for these EXACT keys: anxiety, confidence, excitement, hesitation.
        7. Personality insights with numeric values for impulsiveness, overthinking, and risk tolerance.
        8. Milestones for Timeline A and Timeline B at EXACT timeframes: "1 month", "6 months", "2 years", "5 years".
        9. A SWOT analysis with clear strengths, weaknesses, opportunities, and threats.
        10. A concise summary recommendation.
        
        Base all outputs on the context and be precise, realistic, and internally consistent.
        """
        
        # Configure model call to return JSON adhering to our Pydantic schema
        response = model.generate_content(
            prompt,
            generation_config=genai.GenerationConfig(
                response_mime_type="application/json",
                response_schema=DecisionAnalysisSchema,
                temperature=0.0,
                max_output_tokens=1024
            )
        )
        
        # Parse the JSON response
        result = json.loads(response.text)
        return result
    except Exception as e:
        print(f"Error calling Gemini API: {e}")
        # Fallback to mock analysis if call fails
        return get_mock_analysis(input_text, stress_level, financial_cost, emotional_risk, confidence_level)

def get_mock_analysis(input_text: str, stress_level: float, financial_cost: float, emotional_risk: float, confidence_level: float) -> dict:
    # A realistic fallback generator based on keywords
    lower_text = input_text.lower()
    is_career = any(w in lower_text for w in ["job", "career", "startup", "work", "freelance", "business", "resign"])
    is_relation = any(w in lower_text for w in ["relationship", "marry", "break up", "love", "divorce", "date", "boyfriend", "girlfriend"])
    is_education = any(w in lower_text for w in ["college", "university", "degree", "study", "school", "master"])
    
    # Base emotion heuristics from user inputs
    anxiety = min(100.0, max(10.0, stress_level * 1.1))
    excitement = min(100.0, max(10.0, confidence_level * 1.2))
    hesitation = min(100.0, max(10.0, (100 - confidence_level) * 0.9 + emotional_risk * 0.3))
    confidence = confidence_level

    # Preliminary regret estimate (will be adjusted to align with timeline outcomes below)
    regret_prob = min(95.0, max(5.0, (stress_level * 0.35 + emotional_risk * 0.35 + (100 - confidence_level) * 0.3)))
    
    if is_career:
        title = "Career Transition Assessment"
        timeline_a_name = "Option A (Embark on New Career Path / Startup)"
        timeline_b_name = "Option B (Remain in Current Stable Position)"
        
        timeline_a_milestones = [
            {"time": "1 month", "description": "High excitement, building workspace, high stress managing transition.", "stress": 65.0, "satisfaction": 80.0},
            {"time": "6 months", "description": "Financial pressure starts to build, but high autonomy and personal growth.", "stress": 75.0, "satisfaction": 70.0},
            {"time": "2 years", "description": "Income stabilizes, deep sense of accomplishment and career ownership.", "stress": 40.0, "satisfaction": 85.0},
            {"time": "5 years", "description": "Successful growth, regret is extremely low, high long-term career satisfaction.", "stress": 30.0, "satisfaction": 90.0}
        ]
        
        timeline_b_milestones = [
            {"time": "1 month", "description": "High comfort, stability, relief that you did not take the risk.", "stress": 30.0, "satisfaction": 60.0},
            {"time": "6 months", "description": "Boredom starts setting in. Asking 'What if?' as colleagues move forward.", "stress": 45.0, "satisfaction": 50.0},
            {"time": "2 years", "description": "Active regret peaks. Stagnant salary and feeling left behind.", "stress": 60.0, "satisfaction": 40.0},
            {"time": "5 years", "description": "Deep complacency. High security but low satisfaction, moderate background stress.", "stress": 55.0, "satisfaction": 35.0}
        ]
        
        strengths = ["High growth potential", "Self-reliance & autonomy", "Alignment with personal passions"]
        weaknesses = ["Initial financial instability", "Loss of structured employee benefits", "Requires high self-discipline"]
        opportunities = ["Developing new high-value skills", "Creating equity and long-term wealth", "Expanding professional network"]
        threats = ["Market volatility impacting cash flow", "Burnout from overworking", "Potential failure of the business model"]
        
        summary = "This career change offers high long-term fulfillment but requires weathering high short-term stress and financial risk. Your confidence level is high enough to support the transition, but establish a 6-month financial runway first to mitigate anxiety."
    
    elif is_relation:
        title = "Relationship Decision Analysis"
        timeline_a_name = "Option A (Commit / Take Major Step)"
        timeline_b_name = "Option B (Maintain Current Dynamics or Separate)"
        
        timeline_a_milestones = [
            {"time": "1 month", "description": "Honeymoon transition, feeling close but navigating new boundaries.", "stress": 40.0, "satisfaction": 85.0},
            {"time": "6 months", "description": "Integrating daily lives, minor conflicts arise over routines, moderate stress.", "stress": 50.0, "satisfaction": 75.0},
            {"time": "2 years", "description": "Deep emotional connection, shared future plans, sense of stability.", "stress": 30.0, "satisfaction": 80.0},
            {"time": "5 years", "description": "Long-term partnership built on trust, very low regret, high happiness.", "stress": 25.0, "satisfaction": 85.0}
        ]
        
        timeline_b_milestones = [
            {"time": "1 month", "description": "Independence and space, feeling of relief from relationship pressure.", "stress": 20.0, "satisfaction": 70.0},
            {"time": "6 months", "description": "Waves of loneliness, questioning if the decision was hasty.", "stress": 45.0, "satisfaction": 55.0},
            {"time": "2 years", "description": "Regret over lost connection, difficulty finding similar emotional depth.", "stress": 60.0, "satisfaction": 45.0},
            {"time": "5 years", "description": "Moving on, but lingering curiosity about what could have been.", "stress": 40.0, "satisfaction": 60.0}
        ]
        
        strengths = ["Strong emotional foundation", "Shared values and long-term vision", "Mutual support network"]
        weaknesses = ["Vulnerability to emotional hurt", "Requirement of compromise and sacrifice", "Communication barriers on key topics"]
        opportunities = ["Building a lifetime partnership", "Emotional safety and mutual growth", "Creating joint life milestones"]
        threats = ["Unresolved personal baggage", "Mismatched growth rates", "External family or financial stress"]
        
        summary = "An emotionally significant choice. Taking the step is predicted to result in initial adjustment stress but much higher long-term satisfaction. Ensure open communication channels to manage boundary adjustments."
        
    else:
        title = "Strategic Life Decision Evaluation"
        timeline_a_name = "Option A (Proceed with Change / Action)"
        timeline_b_name = "Option B (Status Quo / Deferred Action)"
        
        timeline_a_milestones = [
            {"time": "1 month", "description": "Adapting to change, high energy but nervous energy.", "stress": 60.0, "satisfaction": 75.0},
            {"time": "6 months", "description": "Overcoming learning curves, starting to see early positive results.", "stress": 50.0, "satisfaction": 70.0},
            {"time": "2 years", "description": "Change is fully integrated. Proud of taking the leap.", "stress": 35.0, "satisfaction": 80.0},
            {"time": "5 years", "description": "Major personal evolution, regret is minimal.", "stress": 25.0, "satisfaction": 85.0}
        ]
        
        timeline_b_milestones = [
            {"time": "1 month", "description": "Calmness, no disruption to daily life, high comfort.", "stress": 25.0, "satisfaction": 65.0},
            {"time": "6 months", "description": "Mild frustration, feeling like you are stuck in a loop.", "stress": 40.0, "satisfaction": 55.0},
            {"time": "2 years", "description": "Regret starts to intensify. The opportunity has passed or is harder to seize.", "stress": 60.0, "satisfaction": 45.0},
            {"time": "5 years", "description": "Significant regret, sense of missed potential, moderate chronic stress.", "stress": 55.0, "satisfaction": 40.0}
        ]
        
        strengths = ["Breaks the comfort zone", "Creates learning opportunities", "High agency choice"]
        weaknesses = ["Requires navigating uncertainty", "Loss of safety net", "Requires high emotional resilience"]
        opportunities = ["New networks and environments", "Personal reinvention", "Uncapped positive outcomes"]
        threats = ["Fear of failure leading to early quit", "Temporary setback in other life aspects", "Lack of immediate support"]
        
        summary = "Taking action leads to higher active engagement and personal satisfaction, while maintaining the status quo represents low short-term stress but high long-term regret. Choose growth over comfort."

    # Derive final satisfaction from timeline endpoints to ensure consistency
    final_sat_a = timeline_a_milestones[-1]["satisfaction"] if timeline_a_milestones else 50.0
    final_sat_b = timeline_b_milestones[-1]["satisfaction"] if timeline_b_milestones else 50.0
    # Choose the most favorable long-term path as the 'expected' satisfaction
    expected_final_satisfaction = max(final_sat_a, final_sat_b)

    # Recalibrate regret probability to be consistent with expected satisfaction
    regret_prob = min(95.0, max(0.0, round((100.0 - expected_final_satisfaction) * 0.6 + (stress_level * 0.2 + emotional_risk * 0.2) * 0.01 * 100.0, 1)))

    satisfaction = round(expected_final_satisfaction, 1)

    return {
        "title": title,
        "regret_probability": round(regret_prob, 1),
        "emotional_stability": "High" if regret_prob < 40 else "Medium" if regret_prob < 70 else "Low",
        "stress_prediction": "Low" if stress_level < 35 else "Medium" if stress_level < 70 else "High",
        "satisfaction_score": satisfaction,
        "emotion_analysis": {
            "anxiety": round(anxiety, 1),
            "confidence": round(confidence, 1),
            "excitement": round(excitement, 1),
            "hesitation": round(hesitation, 1)
        },
        "personality_insights": {
            "impulsiveness": round(50.0 + (confidence_level - stress_level) * 0.2, 1),
            "overthinking": round(100.0 - confidence_level, 1),
            "risk_tolerance": round(confidence_level * 0.8 + (100 - emotional_risk) * 0.2, 1)
        },
        "timeline_a": {
            "name": timeline_a_name,
            "milestones": timeline_a_milestones
        },
        "timeline_b": {
            "name": timeline_b_name,
            "milestones": timeline_b_milestones
        },
        "swot_analysis": {
            "strengths": strengths,
            "weaknesses": weaknesses,
            "opportunities": opportunities,
            "threats": threats
        },
        "summary_recommendation": summary
    }

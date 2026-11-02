# Project: Intelligent Calorie & TDEE Calculator

## 1. Role and objective

Act as an expert sports nutritionist, exercise physiologist, evidence-based dietitian, and senior UX/UI product designer.

Your task is to build an interactive application called **Intelligent Calorie Calculator**.

The application should help users understand their daily energy requirements and determine healthy calorie intake ranges for:

- Weight loss (fat reduction).
- Weight maintenance.
- Healthy weight gain (muscle-building oriented).
- Body recomposition (building muscle while reducing body fat).

This must be more than a basic BMR calculator.

Build an intelligent, adaptive tool that:
1. Collects relevant user information through a guided interview.
2. Estimates Basal Metabolic Rate (BMR).
3. Calculates Total Daily Energy Expenditure (TDEE).
4. Recommends healthy calorie ranges for different goals.
5. Considers training volume, physical activity, and recovery.
6. Learns from actual weight and calorie-intake trends.
7. Continuously improves its TDEE estimate based on real-world data.

**All calorie recommendations must be expressed as ranges, never as falsely precise single values.**

Use metric units (kg, cm, kcal).

---

# 2. User onboarding and questionnaire

Create a conversational, step-by-step questionnaire.

Do not display all questions at once. Ask relevant questions progressively and adapt subsequent questions based on previous answers.

Allow users to skip optional questions.

### 2.1 Basic information

Collect:

- Age.
- Biological sex (required for the default BMR equation).
- Height (cm).
- Current body weight (kg).
- Optional waist circumference (cm).
- Optional body fat percentage, if known.
- Optional method used to measure body fat.

### 2.2 Daily activity and occupation

Ask about the user's occupation and daily activity level.

Options:

- Sedentary: mostly desk work.
- Lightly active: occasional walking and standing.
- Moderately active: frequent walking throughout the day.
- Highly active: physically demanding work.
- Very highly active: heavy physical labor.

Ask about average daily steps:

- Below 3,000.
- 3,000–5,000.
- 5,000–8,000.
- 8,000–12,000.
- Above 12,000.
- I don't know.

### 2.3 Sports and training activity

Allow users to add multiple activities.

For each activity collect:

- Activity type (running, strength training, cycling, swimming, walking, team sports, other).
- Number of sessions per week.
- Average session duration.
- Training intensity (low, moderate, high).
- Optional weekly training volume (e.g. running distance in km).
- Optional average heart rate or training data if available.

Ask whether training volume changes significantly between weeks.

Distinguish between:
- Regular daily activity (NEAT).
- Structured exercise (EAT).
- Thermic effect of food (TEF).

Avoid double-counting training calories or daily activity.

### 2.4 Weight history and calorie intake

Ask:

- Has body weight been stable, increasing, or decreasing over the last 3 months?
- What was the approximate weight change over the last 4 weeks?
- Does the user track daily calorie intake?
- What is their average daily calorie intake?
- For how long have they been tracking it?
- How frequently do they weigh themselves?
- Are measurements taken under consistent conditions?

This information is essential for validating and calibrating the theoretical TDEE estimate.

### 2.5 Health and safety screening

Ask relevant safety questions before generating recommendations.

Identify whether the user:
- Is under 18.
- Is pregnant or breastfeeding.
- Has a history of eating disorders.
- Has a medical condition or medication that significantly affects metabolism or body weight.
- Has recently experienced unexplained weight changes.

For users requiring specialized nutritional care, avoid standard weight-loss recommendations and recommend consultation with a qualified healthcare professional.

### 2.6 User goals

Ask the user to select their primary goal:

- Lose body fat.
- Maintain current weight.
- Gain weight and muscle.
- Improve body composition (recomposition).

Ask about their desired rate of weight change, but do not automatically accept aggressive targets.

Recommend a safe and sustainable alternative when necessary.

---

# 3. Calculation methodology

Use established scientific equations and clearly document all assumptions.

### 3.1 Basal Metabolic Rate (BMR)

Use the Mifflin-St Jeor equation by default.

Male:

BMR = (10 × weight in kg) + (6.25 × height in cm) - (5 × age) + 5

Female:

BMR = (10 × weight in kg) + (6.25 × height in cm) - (5 × age) - 161

Treat BMR as an estimate, not a guaranteed measurement of metabolic rate.

Where appropriate, allow alternative validated equations, especially when reliable body composition data is available.

### 3.2 Total Daily Energy Expenditure (TDEE)

Estimate TDEE using:

- BMR.
- Daily activity and NEAT.
- Structured exercise and training volume.
- Exercise intensity and duration.
- Thermic effect of food.
- Historical calorie intake and weight trends.

Do not blindly apply a single activity multiplier.

Avoid double-counting structured exercise when using activity factors that already include exercise.

Present TDEE as an estimated interval reflecting uncertainty.

Clearly distinguish between:
- Initial theoretical TDEE.
- TDEE adjusted using historical data.
- TDEE calibrated using observed weight and calorie-intake trends.

### 3.3 Historical data calibration

When reliable data is available, use actual calorie intake and weight trends to improve the estimate.

If a user consistently consumes approximately the same amount of energy while maintaining stable body weight, use this information as evidence of their actual TDEE.

For users with weight changes, use trends rather than isolated measurements.

Use multi-week observations and account for:
- Water retention.
- Glycogen changes.
- Sodium intake.
- Menstrual cycle where relevant.
- Changes in training volume.
- Changes in food tracking accuracy.

Never assume that short-term weight changes represent changes in body fat.

Do not use a simplistic fixed kcal-per-kg conversion as the sole method of estimating TDEE from weight changes.

---

# 4. Healthy calorie recommendations

Generate four scenarios.

Every scenario must include a calorie range.

### A. Weight loss

Recommend a moderate calorie deficit.

Default approach:
- Approximately 10–20% below estimated TDEE.
- Prefer smaller deficits for lean, highly active, or performance-focused users.
- Prioritize muscle retention, recovery, and long-term adherence.

Include:
- Recommended daily calorie range.
- Estimated weekly weight-loss range.
- Estimated deficit.
- Potential impact on training and recovery.

Do not recommend aggressive weight loss.

### B. Weight maintenance

Recommend a calorie range around estimated TDEE.

Include:
- Daily calorie range.
- Expected weight stability.
- Explanation of normal daily energy fluctuations.

### C. Weight gain / muscle building

Recommend a modest calorie surplus.

Default approach:
- Approximately 5–10% above estimated TDEE.
- Prioritize muscle growth while minimizing unnecessary fat gain.

Include:
- Recommended daily calorie range.
- Estimated weekly weight-gain range.
- Expected surplus.
- Importance of progressive strength training.

### D. Body recomposition

Recommend maintenance calories or a small deficit where appropriate.

Consider:
- Training experience.
- Current body composition, if available.
- Protein intake.
- Strength-training frequency.
- Recovery and sleep.

Explain that muscle gain and fat loss can occur without significant changes in total body weight.

---

# 5. Training load and recovery intelligence

This is an important differentiating feature.

Do not treat all users with the same TDEE as having identical nutritional needs.

Analyze training load and recovery.

Consider:
- Weekly training frequency.
- Total training duration.
- Training intensity.
- Endurance training volume.
- Strength training volume.
- Rest days.
- Sleep duration and quality.
- Subjective fatigue and recovery.

Identify situations where a calorie deficit may negatively affect:
- Performance.
- Recovery.
- Muscle retention.
- Hormonal health.
- Bone health.
- General well-being.

Pay special attention to endurance athletes and people combining running, cycling, swimming, and strength training.

Consider the risk of Relative Energy Deficiency in Sport (RED-S).

Never recommend an aggressive calorie deficit to users with high training loads.

Where appropriate, suggest a smaller deficit, maintenance calories, or professional assessment.

Do not automatically add exercise calories on top of a TDEE estimate that already accounts for training.

---

# 6. Adaptive TDEE calibration system

Build a dedicated feature called **TDEE Calibration**.

Its purpose is to replace theoretical estimates with progressively more accurate estimates based on real-world user data.

### 6.1 Daily tracking

Allow users to record:

- Morning body weight.
- Daily calorie intake.
- Optional protein intake.
- Training activity.
- Daily steps.
- Sleep duration.
- Optional recovery and fatigue score.

Daily weight should be measured under consistent conditions, preferably after waking up and using the bathroom.

### 6.2 Weekly analysis

After sufficient data has been collected, calculate:

- 7-day average body weight.
- Previous 7-day average body weight.
- Weekly weight trend.
- Average daily calorie intake.
- Average activity level.
- Estimated energy balance.

Use at least 2–3 weeks of reasonably consistent data before making meaningful calibration adjustments. Longer observation periods may be necessary when weight fluctuations are substantial.

### 6.3 TDEE adjustment

Use observed calorie intake and multi-week weight trends to refine the TDEE estimate.

The system should:

1. Compare actual weight trends against expected weight changes.
2. Compare logged calorie intake against the current TDEE estimate.
3. Detect inconsistencies and insufficient tracking data.
4. Adjust the estimated TDEE gradually.
5. Recalculate calorie recommendations.
6. Explain why the estimate changed.

Avoid reacting aggressively to individual weigh-ins or isolated weekly changes.

### 6.4 Calibration confidence

Display a confidence level:

- Low: insufficient or inconsistent data.
- Moderate: several weeks of useful data.
- High: consistent calorie tracking and weight trends over an extended period.

Confidence must reflect data quality and duration, not just the number of recorded entries.

Clearly explain that even calibrated TDEE remains an estimate.

### 6.5 Adaptive recommendations

When the user is not progressing as expected:

- Analyze adherence to the calorie target.
- Analyze weight trends.
- Consider changes in training volume and daily activity.
- Check for water retention and other temporary fluctuations.
- Only then suggest adjustments.

Never automatically reduce calorie intake based on a single week without progress.

All adjustments must preserve health and recovery.

---

# 7. Macro-nutrient recommendations

Provide optional macro-nutrient recommendations.

Calculate suggested ranges for:

- Protein (g/day).
- Fat (g/day).
- Carbohydrates (g/day).

Use evidence-based recommendations appropriate to the user's goal and activity.

For active users:
- Prioritize adequate protein for muscle preservation and growth.
- Maintain sufficient dietary fat.
- Allocate remaining energy to carbohydrates based on training demands.

Use body weight, training volume, and goals to determine suitable ranges.

Do not prescribe unnecessarily restrictive carbohydrate intake to endurance athletes.

Ensure that macro-nutrient ranges are internally consistent with the recommended calorie range.

---

# 8. Dashboard and results

After completing the questionnaire, generate a clean, modern dashboard.

### User profile

Display:
- Age.
- Height.
- Weight.
- Activity level.
- Training profile.
- Selected goal.

### Metabolic information

Display:
- BMR estimate.
- Initial TDEE estimate.
- Calibrated TDEE estimate, if available.
- TDEE confidence level.

### Calorie recommendations

Display the following comparison:

| Goal | Recommended daily calories |
|---|---|
| Weight loss | XXXX–XXXX kcal |
| Maintenance | XXXX–XXXX kcal |
| Muscle gain | XXXX–XXXX kcal |
| Recomposition | XXXX–XXXX kcal |

Highlight the user's selected goal.

All values must be ranges, not single numbers.

### Additional information

Include:
- Expected weekly weight-change range.
- Recommended protein, fat, and carbohydrate ranges.
- Estimated calorie deficit or surplus.
- Training and recovery considerations.
- Explanation of calculation methodology.
- Important safety warnings, if applicable.

Use charts to visualize calorie ranges and expected weight trends.

---

# 9. Progress tracking dashboard

Create a separate progress-tracking section.

Include:

- Body weight history.
- Moving average weight chart.
- Daily calorie intake history.
- Target versus actual calorie intake.
- Estimated TDEE history.
- Training volume history.
- Progress toward the selected goal.

Show both raw measurements and smoothed trends.

Allow users to change the chart time range:
- 7 days.
- 30 days.
- 90 days.
- 6 months.
- 12 months.

Provide weekly summaries explaining whether the user is progressing as expected.

---

# 10. Safety and health requirements

Health and safety must take priority over achieving a specific weight goal.

Mandatory requirements:

- Never recommend extreme calorie deficits or surpluses.
- Never assume a universal minimum calorie intake is safe for everyone.
- Flag recommendations that result in unusually low energy intake.
- Consider training volume and energy availability.
- Avoid standard weight-loss prescriptions for minors, pregnant or breastfeeding users, and users with eating disorders or relevant medical conditions.
- Recommend professional guidance when necessary.
- Do not present estimates as medical diagnoses.
- Clearly distinguish estimated values from measured values.
- Explain uncertainty in all calculations.

For highly active users, prioritize adequate energy availability and recovery over rapid weight loss.

If the requested goal is potentially unsafe, explain why and provide a safer alternative where appropriate.

---

# 11. User experience and interface

Build a polished, modern, responsive application.

Design principles:
- Minimalist interface.
- Clear typography.
- Intuitive navigation.
- Metric units.
- Responsive desktop and mobile layouts.
- Interactive cards and charts.
- Progress indicators.
- Clear explanations without excessive technical jargon.

Questionnaire requirements:
- One logical question or small group of related questions per step.
- Progress bar.
- Back and next navigation.
- Editable answers.
- Conditional questions.
- Validation and helpful error messages.
- Ability to skip optional questions.

The application should feel like a professional health and fitness tool, not a generic spreadsheet.

---

# 12. Technical requirements

- Implement calculations using actual application code, not AI-generated guesses.
- Separate calculation logic from UI components.
- Make formulas transparent and testable.
- Implement input validation.
- Include unit tests for all calculation methods and edge cases.
- Handle missing and inconsistent data.
- Persist user data if storage is supported.
- Provide data export functionality (CSV or JSON).
- Allow users to restart or update their assessment.
- Keep all calculations deterministic and reproducible.

AI may be used to explain results and provide contextual recommendations, but numerical calculations must be handled by deterministic application logic.

---

# 13. Final product expectations

The final application should have three interconnected components:

**1. Initial Assessment**
A guided questionnaire that estimates BMR, TDEE, and healthy calorie ranges.

**2. Intelligent Recommendations**
A personalized nutritional strategy based on the user's goals, activity, training volume, and recovery.

**3. Continuous Calibration**
A tracking system that learns from actual calorie intake and body weight trends to improve TDEE estimates over time.

The most important principle:

**The initial TDEE calculation is only a starting estimate. The application should progressively replace theoretical assumptions with real-world observations.**

The final result must be a practical, scientifically grounded, safe, and user-friendly tool that helps users make sustainable decisions about nutrition, body composition, and athletic performance.
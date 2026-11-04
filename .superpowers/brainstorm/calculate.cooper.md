# Build an Interactive Cooper 12-Minute Running Test Calculator

## Role
You are an experienced sports scientist, exercise physiologist, UX designer, and software developer.

Your task is to design and build an interactive tool that evaluates a user's performance in the Cooper 12-minute running test.

The application should be intuitive, scientifically responsible, mobile-friendly, and provide meaningful feedback rather than simply displaying a score.

## 1. Main objective

Create a calculator that evaluates running performance based on:
- Biological sex category used for the reference norms (male/female).
- User's age.
- Distance covered during exactly 12 minutes.

The application should:
1. Classify the user's performance.
2. Calculate additional running metrics.
3. Estimate VO2max.
4. Compare the result against age- and sex-specific reference standards.
5. Explain the result in understandable language.
6. Suggest realistic next steps.

## 2. User input

Create a simple interactive form.

Required fields:

- Age (integer, years).
- Sex category for reference norms:
  - Male
  - Female
- Distance covered (meters).

Optional fields:
- Average heart rate (bpm).
- Maximum heart rate (bpm).
- Previous Cooper test result (meters).
- Test date.

Validation:
- Age must be a positive integer.
- Distance must be a positive number.
- Accept distances in meters.
- Reject invalid or incomplete data.
- Clearly explain when the user's age is outside the available reference groups.

## 3. Performance classification

Use the following reference thresholds.

All distances are in meters.

### Male reference standards

| Age | Very Poor | Poor | Average | Good | Very Good |
|---|---:|---:|---:|---:|---:|
| 13–14 | <2100 | 2100–2199 | 2200–2399 | 2400–2699 | >=2700 |
| 15–16 | <2200 | 2200–2299 | 2300–2499 | 2500–2799 | >=2800 |
| 17–19 | <2300 | 2300–2399 | 2400–2699 | 2700–2999 | >=3000 |
| 20–29 | <1600 | 1600–2199 | 2200–2399 | 2400–2800 | >2800 |
| 30–39 | <1500 | 1500–1899 | 1900–2299 | 2300–2700 | >2700 |
| 40–49 | <1400 | 1400–1699 | 1700–2099 | 2100–2500 | >2500 |
| 50+ | <1300 | 1300–1599 | 1600–1999 | 2000–2400 | >2400 |

### Female reference standards

| Age | Very Poor | Poor | Average | Good | Very Good |
|---|---:|---:|---:|---:|---:|
| 13–14 | <1500 | 1500–1599 | 1600–1899 | 1900–2000 | >2000 |
| 15–16 | <1600 | 1600–1699 | 1700–1999 | 2000–2100 | >2100 |
| 17–19 | <1700 | 1700–1799 | 1800–2099 | 2100–2300 | >2300 |
| 20–29 | <1500 | 1500–1799 | 1800–2199 | 2200–2700 | >2700 |
| 30–39 | <1400 | 1400–1699 | 1700–1999 | 2000–2500 | >2500 |
| 40–49 | <1200 | 1200–1499 | 1500–1899 | 1900–2300 | >2300 |
| 50+ | <1100 | 1100–1399 | 1400–1699 | 1700–2200 | >2200 |

Important:
- Treat these thresholds as configurable reference data, not universal medical standards.
- Ensure every distance belongs to exactly one category.
- Implement age-band selection correctly.
- Preserve the exact threshold boundaries.
- Do not extrapolate results for unsupported age groups.
- Clearly label the classification as an indicative assessment.

## 4. Calculated metrics

Calculate and display:

### A. Average speed

Formula:

Average speed (km/h) = distance (meters) / 200

### B. Average pace

Formula:

Pace (min/km) = 12000 / distance (meters)

Format the result as MM:SS min/km.

### C. Estimated VO2max

Use the Cooper estimation formula:

VO2max (ml/kg/min) = (distance in meters - 504.9) / 44.73

Display a clear disclaimer:

"This is an estimated VO2max based on the Cooper test. It is not equivalent to a laboratory measurement."

### D. Distance to the next performance category

Calculate how many additional meters are needed to reach the next classification.

If the user is already in the highest category, display an appropriate message.

## 5. Results presentation

Create a visually appealing results dashboard.

The dashboard should contain:

**Main result**
- Distance covered.
- Performance category.
- Age group and reference category used.

**Performance metrics**
- Estimated VO2max.
- Average pace.
- Average speed.

**Performance classification visualization**

Create a horizontal progress bar divided into five categories:
- Very Poor
- Poor
- Average
- Good
- Very Good

Clearly indicate the user's current position.

**Next milestone**
- Show the distance required to reach the next category.
- Display the difference in meters.
- Provide a motivational but realistic message.

## 6. AI-generated interpretation

Generate a short personalized interpretation based on the results.

The interpretation should include:

1. Overall assessment of aerobic running performance.
2. Explanation of what the result means.
3. Estimated VO2max interpretation, with appropriate caution.
4. Main strengths and potential areas for improvement.
5. One practical recommendation for future training.

Avoid:
- Medical diagnoses.
- Unsupported claims about cardiovascular health.
- Treating Cooper test results as a definitive measure of overall fitness.
- Overly generic motivational language.
- Making precise race predictions without sufficient data.

The interpretation must distinguish between a normative classification and an individual's progress over time.

## 7. Progress tracking

Allow users to save multiple test results locally.

For each result, store:
- Test date.
- Age at the time of the test.
- Distance.
- Performance category.
- Estimated VO2max.
- Average pace.

Display:
- Historical distance chart.
- VO2max estimation trend.
- Previous result comparison.
- Absolute improvement in meters.
- Percentage improvement.

Always compare historical results in context. Account for age-group changes and do not mistake a change in reference category for an actual change in fitness.

## 8. User experience and design

Design principles:
- Clean, modern sports dashboard.
- Mobile-first responsive layout.
- Clear typography and visual hierarchy.
- Minimal number of input fields.
- Results should be understandable without sports science knowledge.
- Use colors consistently to distinguish performance categories.
- Include tooltips explaining VO2max, pace, speed, and performance classification.

The calculator should work without requiring an account.

## 9. Technical requirements

- Separate calculation logic from UI components.
- Store reference thresholds in a configurable data structure.
- Avoid hardcoding classification logic in multiple places.
- Validate all inputs.
- Make calculations deterministic and testable.
- Handle all category boundaries correctly.
- Include unit tests for calculations and classification.
- Persist historical results locally.
- Ensure the application works on desktop and mobile.

## 10. Acceptance criteria

The application is complete when:

1. A user can enter age, sex category, and distance.
2. The application correctly identifies the applicable reference group.
3. The performance category is calculated correctly.
4. VO2max, pace, and speed are calculated correctly.
5. The user receives an understandable interpretation.
6. The next performance milestone is displayed.
7. Historical results can be stored and compared.
8. Invalid inputs and unsupported age groups are handled gracefully.
9. All reference threshold boundaries are covered by automated tests.

Before implementation, define the calculation model and data structures. Then implement the complete working application, not just a static mockup.
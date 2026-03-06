# Copilot Instructions

These rules apply to all future changes in this repository.

## Project Goals
- Keep changes focused and minimal.
- Preserve existing behavior unless explicitly asked to change it.
- Prefer maintainable, readable code over clever shortcuts.

## Coding Rules
- Follow existing Vue 3 + TypeScript patterns already used in `src/`.
- Use Composition API with `script setup` for Vue components.
- Reuse existing services/composables before creating new ones.
- Keep naming consistent with current files (`clientsApi`, `routinesApi`, etc.).
- Do not introduce breaking API changes unless requested.

## UI and UX Rules
- Match existing Tailwind styles and component look-and-feel.
- Handle loading, empty, and error states explicitly.
- Keep UI responsive for desktop and mobile.
- Avoid layout shifts and flashing empty states during loading.

## Data and State Rules
- Keep API calls in `src/services/`.
- Keep page-specific view state in the page component unless reused.
- Validate assumptions for nullable/optional API fields.

## Safety Rules
- Do not remove unrelated code.
- Do not rename files/functions unless requested.
- Do not add dependencies unless necessary.
- Keep changes backward-compatible when possible.

## Validation Before Finishing
- Run or check TypeScript/Vue errors for changed files.
- Ensure no obvious lint/type errors are introduced.
- Summarize what changed and why.

## Task-Specific Notes
- Add temporary rules for a specific task here, then remove them later.
- Example: "Use spinner instead of empty table while fetching clients."

## Rules for Web-Vue Project
- Follow the existing code style and patterns in `src/`.
- Always display a loading spinner when fetching data from the API.
- Handle empty states with a user-friendly message and an optional call-to-action.
- Ensure all API interactions are done through the existing services in `src/services/`.
- Keep the UI consistent with the current design, using Tailwind CSS classes as needed.
- Add refresh button
- Generate list and tile views
- Keep search input, view type toggle, and refresh button on the same row.
- Add "Create {entity}" button on bottom of page 
- For list-page filters, use the `FilterOption` component with a dialog and multi-select behavior (allow 0 or many selected options).

# Copilot Instructions

These rules apply to all future changes in this repository.

## Project Goals
- Keep changes focused and minimal.
- Preserve existing behavior unless explicitly asked to change it.
- Prefer maintainable, readable code over clever shortcuts.
- When working copilot can be silent. No need for explaining what is happening. Just display progress and ask for clarifications when needed.

## Coding Rules
- Follow existing Vue 3 + TypeScript patterns already used in `src/`.
- Use Composition API with `script setup` for Vue components.
- Reuse existing services/composables before creating new ones.
- Keep naming consistent with current files (`clientsApi`, `routinesApi`, etc.).
- Do not introduce breaking API changes unless requested.
- When making changes that require backend support, generate file `src/services/prompts.md` with AI prompts to create necessary backend endpoints, and include instructions for testing them.

## UI and UX Rules
- Match existing Tailwind styles and component look-and-feel.
- Handle loading, empty, and error states explicitly.
- Keep UI responsive for desktop and mobile.
- Avoid layout shifts and flashing empty states during loading.

## Validation Before Finishing
- Run or check TypeScript/Vue errors for changed files.
- Ensure no obvious lint/type errors are introduced.

## Task-Specific Notes
- Add temporary rules for a specific task here, then remove them later.
- Example: "Use spinner instead of empty table while fetching clients."
- For client actions, display confirmation notifications using the shared `src/components/NotificationToast.vue` component after every successful add, edit, and delete operation.

# Frontend Structure Rules

Use these rules for all React/TypeScript code in this workspace.

1. Pages must be created in `src/pages`.
2. Prefer extracting custom components when a section is reusable or improves page readability.
3. Shared custom components must be created in `src/components`.
4. If a custom component is specific to one page, place it in `src/pages/{page}/components`.
5. Keep page-level orchestration in page files and move isolated UI blocks to components.
6. Pages must be created in `src/services`.
7. Select{entity} components must be created in `src/components/Select{Entity}` and support searching and selecting from existing entities.
8. Use custom scrollbar styles for all scrollable divs to ensure consistent look across browsers.

# New page rules
1. List view should be created first, then details view if needed.
2. Always include loading and empty states in the list view.
3. Add open text search on top of list view
4. Add pagination if the list can grow beyond 20 items.
5. Add loading indicator when fetching data, and avoid showing empty states during loading.
6. Add refresh button if the list can be updated by external events or user actions.
7. For pages that are time rlelated generate List and Calendar views, and allow users to switch between them.
8. For pages that are not time related, generate List and Kanban views, and allow users to switch between them.
9. On list item add edit and delete buttons, and handle those actions with modals or inline editing.
10. Include new page in navigation menu. On creating ask for url path and menu label.

# New page details view rules
1. Details should open in responsive dialog on desktop and mobile.
2. Include all relevant information about the item, and allow editing if applicable.
3. Selecting an related entity should be done by using custom component specialized for that entity, and should allow searching and selecting from existing entities.

When unsure whether a component is shared or page-specific, default to page-specific first and move to `src/components` once reuse appears in multiple pages.


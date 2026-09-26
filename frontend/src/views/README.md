# Views Layer (V in MVVM)

The View layer contains pure presentation React components:
- Receives state and callbacks directly from a ViewModel hook.
- Focuses entirely on UI layout, HTML structure, accessibility, and styling.
- Contains NO direct API calls or heavy business calculation logic.

### Folder Structure:
- `components/`: Reusable presentation UI elements (Buttons, InputFields, Modals, Tables, Cards).
- `pages/`: Full screen/page views composed of UI components and connected to their respective ViewModel hooks.

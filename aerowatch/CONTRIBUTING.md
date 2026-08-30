# Contributing to AeroWatch

Thank you for your interest in contributing to AeroWatch for SIH26078.

## Branching Strategy
- `main`: Production-ready release branch.
- `develop`: Main integration branch for features.
- `feature/*`: Dedicated branches for individual modules.

## Code Standards
- **Frontend**: TypeScript, ESLint, Tailwind CSS, Prettier.
- **Backend**: PEP8, Type hints, Pydantic models.
- **ML**: Strict chronological split validation, no random train/test splits.

## Submission Checklist
- [ ] Unit tests written and passing (`pytest tests/`).
- [ ] TypeScript build passing without type errors (`npm run build`).
- [ ] Documentation updated in `docs/`.

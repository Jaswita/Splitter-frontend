# 🤝 Contributing to Splitter

We welcome contributions! Please follow these guidelines to ensure a smooth development process.

## 🛠️ Development Workflow

1. **Fork & Clone**: Fork the repo and clone it locally.
2. **Branch**: Create a feature branch (`git checkout -b feature/amazing-feature`).
3. **Commit**: Commit your changes (`git commit -m 'Add some amazing feature'`).
4. **Push**: Push to the branch (`git push origin feature/amazing-feature`).
5. **PR**: Open a Pull Request.

## 🔍 Verification Checklist

Before submitting a PR, please verify the following:

### UI/UX
- [ ] **Dark Mode**: Check that your changes look good in Dark Mode (Default).
- [ ] **Responsiveness**: Ensure layout works on mobile and desktop.
- [ ] **Theme**: Use CSS variables from `styles/theme.css` (e.g., `var(--primary-cyan)`) instead of hardcoded hex values.

### Functionality
- [ ] **Navigation**: Verify navigation flow remains unbroken.
- [ ] **State**: Ensure React state updates correctly (no forced reloads).

### Code Style
- [ ] **Components**: Place new pages in `components/pages/` and widgets in `components/ui/`.
- [ ] **Styles**: Create a separate CSS file in `components/styles/` if the component is complex.
- [ ] **Clean Code**: Remove `console.log` used for debugging before committing.

## 🧪 Testing

Currently, manual testing is required.
- Run the app: `npm run dev`
- Log in with a test account (or create one using the Signup flow).
- Verify the feature works as expected.

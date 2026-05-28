import { render, screen } from '@testing-library/react';
import App from './App';

test('renders ReliefLink app', () => {
  render(<App />);
  const linkElement = screen.getByText(/ReliefLink/i);
  expect(linkElement).toBeInTheDocument();
});

/**
 * App.test.tsx — Smoke test: renders without crashing.
 */
import React from 'react';
import { render } from '@testing-library/react-native';
import App from '../App';

jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));
jest.mock('@react-native-async-storage/async-storage', () => ({ getItem: jest.fn(), setItem: jest.fn() }));
jest.mock('@react-navigation/native', () => ({ NavigationContainer: ({ children }: any) => children }));

it('renders without crashing', () => {
  expect(() => render(<App />)).not.toThrow();
});

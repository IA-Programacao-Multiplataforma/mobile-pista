import { useWindowDimensions } from 'react-native'

export const WIDE_MAX_WIDTH = 1120

export function useLayout() {
  const { width } = useWindowDimensions()

  return {
    width,
    isDesktop: width >= 900,
    columns: width >= 1100 ? 3 : width >= 700 ? 2 : 1,
  }
}

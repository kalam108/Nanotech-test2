export function Inter(options?: { subsets?: string[]; [key: string]: any }) {
  return {
    className: 'font-sans',
    variable: '--font-inter',
    style: { fontFamily: 'Inter, system-ui, sans-serif' },
  };
}

export function Poppins(options?: { subsets?: string[]; weight?: string[]; [key: string]: any }) {
  return {
    className: 'font-poppins',
    variable: '--font-poppins',
    style: { fontFamily: "'Poppins', sans-serif" },
  };
}

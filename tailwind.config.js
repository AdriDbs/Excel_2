module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
  // Activer les fonctionnalités JIT et d'autres options importantes
  mode: "jit",
  // Pour une compatibilité avec les fonctions d'arrière-plan et d'opacité
  corePlugins: {
    backdropFilter: true,
  },
  // Activer les variantes pour backdrop-filter
  variants: {
    extend: {
      backdropFilter: ["responsive", "hover"],
      backdropBlur: ["responsive", "hover"],
    },
  },
};



// export const Colors = {
//     // Brand (Roxos vivos e com presença)
//     primary: '#8B5CF6',          // Violeta vibrante
//     primaryContainer: '#6D28D9', // Violeta fechado profundo
//     secondary: '#A78BFA',        // Violeta pastel iluminado
//     secondaryContainer: '#2E1065',
//     tertiary: '#C4B5FD',

//     // Background (Escuro profundo, sem parecer cinza "lavado")
//     background: '#09090B',       // Quase preto absoluto (OLED friendly)

//     // Surfaces (Com nuances sutis de roxo no fundo)
//     surface: '#09090B',
//     surfaceContainerLowest: '#0F0E17',
//     surfaceContainerLow: '#15141E',
//     surfaceContainer: '#1C1B29', // Cards com leve tom roxo/grafite
//     surfaceContainerHigh: '#28263B',
//     surfaceContainerHighest: '#34324D',
//     surfaceBright: '#433F63',

//     // Text (Brancos bem acesos para legibilidade)
//     textPrimary: '#FAFAFA',
//     textSecondary: '#A1A1AA',
//     onPrimary: '#FFFFFF',
//     onSecondary: '#FFFFFF',
//     onTertiary: '#000000',
//     onSurface: '#FAFAFA',
//     onSurfaceVariant: '#D4D4D8',

//     // Borders / Outlines (Sutores mas presentes)
//     border: '#3F3F46',
//     outline: '#71717A',
//     outlineVariant: '#27272A',

//     // States (Cores de status acesas)
//     error: '#EF4444',
//     errorContainer: '#7F1D1D',
//     onError: '#FFFFFF',
//     success: '#22C55E',
// } as const;

export const Colors = {
    // Brand (Cyan & Teal - Obsidian Telemetry)
    primary: '#00D2FF',
    onPrimary: '#003543',
    primaryContainer: '#A5E7FF',
    onPrimaryContainer: '#00566A',


    secondary: '#89CEFF',
    onSecondary: '#00344D',
    secondaryContainer: '#00A2E6',
    onSecondaryContainer: '#00344E',

    gradientPrimary: ["#003543", "#00566A"] as const,


    tertiary: '#69F6B9',
    onTertiary: '#003824',
    tertiaryContainer: '#48D99E',
    onTertiaryContainer: '#005B3D',

    inversePrimary: '#00677F',
    surfaceTint: '#47D6FF',

    // Fixed Roles
    primaryFixed: '#B6EBFF',
    primaryFixedDim: '#47D6FF',
    onPrimaryFixed: '#001F28',
    onPrimaryFixedVariant: '#004E60',

    secondaryFixed: '#C9E6FF',
    secondaryFixedDim: '#89CEFF',
    onSecondaryFixed: '#001E2F',
    onSecondaryFixedVariant: '#004C6E',

    tertiaryFixed: '#6FFBBE',
    tertiaryFixedDim: '#4EDEA3',
    onTertiaryFixed: '#002113',
    onTertiaryFixedVariant: '#005236',

    // Background & Surfaces
    background: '#0F131E',
    onBackground: '#DFE2F2',

    surface: '#0F131E',
    surfaceDim: '#0F131E',
    surfaceBright: '#353945',
    surfaceVariant: '#313441',

    surfaceContainerLowest: '#0A0E19',
    surfaceContainerLow: '#171B27',
    surfaceContainer: '#1B1F2B',
    surfaceContainerHigh: '#262A36',
    surfaceContainerHighest: '#313441',

    inverseSurface: '#DFE2F2',
    inverseOnSurface: '#2C303C',

    // Content & Typography
    onSurface: '#DFE2F2',
    onSurfaceVariant: '#BBC9CF',

    // Aliases legados (Para manter compatibilidade no seu app)
    textPrimary: '#DFE2F2',    // Espelha onSurface
    textSecondary: '#BBC9CF',  // Espelha onSurfaceVariant

    // Borders & Outlines
    border: '#3C494E',         // Mapeado para outlineVariant
    outline: '#859399',
    outlineVariant: '#3C494E',

    // Status / Feedback
    error: '#FFB4AB',
    onError: '#690005',
    errorContainer: '#93000A',
    onErrorContainer: '#FFDAD6',
    success: '#69F6B9',         // Mapeado para o tom verde vibrante (tertiary)
} as const;

export type ColorsType = typeof Colors;
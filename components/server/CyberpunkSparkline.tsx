import React, { useMemo } from "react";
import { View, LayoutChangeEvent } from "react-native";
import Svg, {
    Path,
    Defs,
    LinearGradient,
    Stop,
    Circle,
    Line,
    Filter,
    FeGaussianBlur,
} from "react-native-svg";
import { AppText } from "components/ui/AppText";

interface CyberpunkSparklineProps {
    data: number[];
    title: string;
    unit?: string;
    color?: string;
    glowColor?: string;
    height?: number;
    maxPoints?: number;
}

export function CyberpunkSparkline({
    data,
    title,
    unit = "ms",
    color = "#00f0ff",
    glowColor = "#00f0ff",
    height = 70,
    maxPoints = 20,
}: CyberpunkSparklineProps) {
    const [width, setWidth] = React.useState(300);

    const onLayout = (e: LayoutChangeEvent) => {
        const w = e.nativeEvent.layout.width;

        if (w > 0) {
            setWidth(w);
        }
    };

    /*
     * IDs precisam ser únicos dentro da página.
     * Usar o title diretamente pode gerar problemas no Web
     * caso existam espaços ou caracteres especiais.
     */
    const gradientId = useMemo(
        () => `cyber-gradient-${Math.random().toString(36).slice(2, 9)}`,
        []
    );

    const lineGradientId = useMemo(
        () => `cyber-line-${Math.random().toString(36).slice(2, 9)}`,
        []
    );

    const glowFilterId = useMemo(
        () => `cyber-glow-${Math.random().toString(36).slice(2, 9)}`,
        []
    );

    // Garante que haja dados mínimos para desenhar
    const points = useMemo(() => {
        if (!data || data.length === 0) {
            return [0, 0];
        }

        if (data.length === 1) {
            return [data[0], data[0]];
        }

        return data.slice(-maxPoints);
    }, [data, maxPoints]);

    const latestValue = points[points.length - 1] ?? 0;

    const minVal = Math.min(...points);
    const maxVal = Math.max(...points, minVal + 1);

    const paddingY = 8;
    const paddingX = 4;

    const graphWidth = Math.max(width - paddingX * 2, 1);
    const graphHeight = Math.max(height - paddingY * 2, 1);

    // Gera coordenadas (x, y) para cada ponto
    const coordinates = useMemo(() => {
        const step = graphWidth / (points.length - 1 || 1);

        return points.map((val, idx) => {
            const x = paddingX + idx * step;

            const normalized =
                (val - minVal) / (maxVal - minVal || 1);

            // Inverte Y porque 0 no SVG é no topo
            const y =
                paddingY +
                (1 - normalized) * graphHeight;

            return { x, y };
        });
    }, [
        points,
        minVal,
        maxVal,
        graphWidth,
        graphHeight,
    ]);

    // Cria o caminho SVG suave
    const { linePath, areaPath, lastPoint } = useMemo(() => {
        if (coordinates.length === 0) {
            return {
                linePath: "",
                areaPath: "",
                lastPoint: { x: 0, y: 0 },
            };
        }

        let d = `M ${coordinates[0].x} ${coordinates[0].y}`;

        for (let i = 0; i < coordinates.length - 1; i++) {
            const curr = coordinates[i];
            const next = coordinates[i + 1];

            const midX = (curr.x + next.x) / 2;
            const midY = (curr.y + next.y) / 2;

            d += ` Q ${curr.x} ${curr.y}, ${midX} ${midY}`;
        }

        const last =
            coordinates[coordinates.length - 1];

        d += ` T ${last.x} ${last.y}`;

        // Área abaixo da linha
        const area = `
            ${d}
            L ${last.x} ${height}
            L ${coordinates[0].x} ${height}
            Z
        `;

        return {
            linePath: d,
            areaPath: area,
            lastPoint: last,
        };
    }, [coordinates, height]);

    return (
        <View
            onLayout={onLayout}
            className="rounded-xl border p-2.5 overflow-hidden"
            style={{
                backgroundColor: "rgba(10, 15, 29, 0.75)",
                borderColor: `${color}33`,
            }}
        >
            {/* Header */}
            <View className="flex-row items-center justify-between mb-1">
                <View className="flex-row items-center gap-1.5">
                    <View
                        className="w-1.5 h-1.5 rounded-full"
                        style={{
                            backgroundColor: color,
                            shadowColor: glowColor,
                            shadowOpacity: 0.9,
                            shadowRadius: 4,
                            shadowOffset: {
                                width: 0,
                                height: 0,
                            },
                        }}
                    />

                    <AppText className="text-[11px] font-body text-onSurfaceVariant opacity-70 uppercase tracking-wider">
                        {title}
                    </AppText>
                </View>

                <View
                    className="px-2 py-0.5 rounded border"
                    style={{
                        backgroundColor: `${color}18`,
                        borderColor: `${color}44`,
                    }}
                >
                    <AppText
                        className="text-xs font-body-bold"
                        style={{
                            color,
                            textShadowColor: glowColor,
                            textShadowRadius: 6,
                        }}
                    >
                        {typeof latestValue === "number"
                            ? latestValue.toFixed(1)
                            : latestValue}{" "}
                        {unit}
                    </AppText>
                </View>
            </View>

            {/* Gráfico */}
            <View style={{ height }}>
                <Svg
                    width={width}
                    height={height}
                    viewBox={`0 0 ${width} ${height}`}
                >
                    <Defs>
                        {/* Gradiente da área */}
                        <LinearGradient
                            id={gradientId}
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                        >
                            <Stop
                                offset="0%"
                                stopColor={glowColor}
                                stopOpacity="0.35"
                            />

                            <Stop
                                offset="70%"
                                stopColor={glowColor}
                                stopOpacity="0.08"
                            />

                            <Stop
                                offset="100%"
                                stopColor={glowColor}
                                stopOpacity="0"
                            />
                        </LinearGradient>

                        {/* Gradiente da linha */}
                        <LinearGradient
                            id={lineGradientId}
                            x1="0"
                            y1="0"
                            x2="1"
                            y2="0"
                        >
                            <Stop
                                offset="0%"
                                stopColor={color}
                                stopOpacity="0.4"
                            />

                            <Stop
                                offset="80%"
                                stopColor={color}
                                stopOpacity="1"
                            />

                            <Stop
                                offset="100%"
                                stopColor="#ffffff"
                                stopOpacity="1"
                            />
                        </LinearGradient>

                        {/* 
                         * Glow REAL usando Gaussian Blur.
                         *
                         * Isso é diferente de simplesmente desenhar
                         * uma linha grossa transparente por baixo.
                         *
                         * No Web, react-native-svg usa SVG real,
                         * então o filtro pode ser renderizado pelo browser.
                         */}
                        <Filter
                            id={glowFilterId}
                            x="-50%"
                            y="-100%"
                            width="200%"
                            height="300%"
                        >
                            <FeGaussianBlur
                                stdDeviation="4"
                            />
                        </Filter>
                    </Defs>

                    {/* Grid horizontal */}
                    <Line
                        x1="0"
                        y1={height * 0.33}
                        x2={width}
                        y2={height * 0.33}
                        stroke="rgba(255,255,255,0.05)"
                        strokeDasharray="4,4"
                    />

                    <Line
                        x1="0"
                        y1={height * 0.66}
                        x2={width}
                        y2={height * 0.66}
                        stroke="rgba(255,255,255,0.05)"
                        strokeDasharray="4,4"
                    />

                    {/* Área com gradiente */}
                    {areaPath ? (
                        <Path
                            d={areaPath}
                            fill={`url(#${gradientId})`}
                        />
                    ) : null}

                    {linePath ? (
                        <>
                            {/* 
                             * Glow externo forte.
                             *
                             * A linha é duplicada e passa pelo
                             * Gaussian Blur.
                             */}
                            <Path
                                d={linePath}
                                fill="none"
                                stroke={glowColor}
                                strokeWidth={5}
                                strokeOpacity={0.9}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                filter={`url(#${glowFilterId})`}
                            />

                            {/* Glow secundário sem blur.
                             * Ajuda no Android/iOS caso o filtro
                             * seja renderizado de maneira diferente.
                             */}
                            <Path
                                d={linePath}
                                fill="none"
                                stroke={glowColor}
                                strokeWidth={4}
                                strokeOpacity={0.25}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />

                            {/* Linha principal */}
                            <Path
                                d={linePath}
                                fill="none"
                                stroke={`url(#${lineGradientId})`}
                                strokeWidth={2}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </>
                    ) : null}

                    {/* Ponto final */}
                    {lastPoint ? (
                        <>
                            {/* Halo externo */}
                            <Circle
                                cx={lastPoint.x}
                                cy={lastPoint.y}
                                r={8}
                                fill={glowColor}
                                opacity={0.18}
                            />

                            {/* Halo interno */}
                            <Circle
                                cx={lastPoint.x}
                                cy={lastPoint.y}
                                r={5}
                                fill={glowColor}
                                opacity={0.35}
                            />

                            {/* Núcleo */}
                            <Circle
                                cx={lastPoint.x}
                                cy={lastPoint.y}
                                r={3}
                                fill="#ffffff"
                            />
                        </>
                    ) : null}
                </Svg>
            </View>
        </View>
    );
}
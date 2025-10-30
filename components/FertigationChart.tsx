import React, { useState, useRef, useLayoutEffect } from 'react';

interface ChartData {
    week: number;
    nitrogen: number;
    phosphorus: number;
    potassium: number;
    calcium: number;
    magnesium: number;
}

interface FertigationChartProps {
    data: ChartData[];
    labels: string[];
    fieldArea: number;
}

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#0ea5e9', '#e11d48'];
const KEYS: (keyof Omit<ChartData, 'week'>)[] = ['nitrogen', 'phosphorus', 'potassium', 'calcium', 'magnesium'];

export const FertigationChart: React.FC<FertigationChartProps> = ({ data, labels, fieldArea }) => {
    const [tooltip, setTooltip] = useState<{
        visible: boolean;
        x: number;
        y: number;
        content: React.ReactNode;
        week: number;
    } | null>(null);
    
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 800, height: 400 });

    useLayoutEffect(() => {
        const updateSize = () => {
            if (containerRef.current) {
                const newWidth = containerRef.current.offsetWidth;
                setDimensions({ width: newWidth, height: newWidth > 500 ? 400 : 300 });
            }
        };
        updateSize();
        window.addEventListener('resize', updateSize);
        return () => window.removeEventListener('resize', updateSize);
    }, []);

    const margin = { top: 20, right: 20, bottom: 80, left: 50 };
    const chartWidth = dimensions.width - margin.left - margin.right;
    const chartHeight = dimensions.height - margin.top - margin.bottom;

    const maxVal = Math.max(10, ...data.flatMap(d => KEYS.map(key => d[key])));
    const yScale = (value: number) => chartHeight - (value / maxVal) * chartHeight;

    const bandWidth = chartWidth / data.length;
    const barPadding = 0.2;
    const barWidth = bandWidth * (1 - barPadding);
    const singleBarWidth = barWidth / KEYS.length;
    
    const handleMouseOver = (e: React.MouseEvent, weekData: ChartData) => {
        const target = e.currentTarget as SVGGElement;
        const svgRect = target.closest('svg')?.getBoundingClientRect();
        if (!svgRect) return;

        const content = (
            <div className="text-sm">
                <div className="font-bold mb-1 border-b pb-1">Тиждень {weekData.week}</div>
                {KEYS.map((key, i) => (
                    <div key={key} className="flex items-center">
                        <div className="w-3 h-3 rounded-sm mr-2" style={{ backgroundColor: COLORS[i] }}></div>
                        <span className="flex-grow">{labels[i]}:</span>
                        <span className="font-semibold">{weekData[key].toFixed(1)} кг/га</span>
                        <span className="font-bold text-indigo-700 ml-2">({(weekData[key] * fieldArea).toFixed(1)} кг)</span>
                    </div>
                ))}
            </div>
        );

        const x = margin.left + (data.findIndex(d => d.week === weekData.week) * bandWidth) + (bandWidth / 2);
        const y = margin.top + Math.min(...KEYS.map(key => yScale(weekData[key]))) - 10;
        
        setTooltip({
            visible: true,
            x,
            y,
            content,
            week: weekData.week,
        });
    };

    const handleMouseOut = () => {
        setTooltip(null);
    };

    const renderYAxis = () => {
        const ticks = 5;
        const tickValues = Array.from({ length: ticks + 1 }, (_, i) => maxVal / ticks * i);
        return (
            <g className="text-slate-500 text-xs">
                {tickValues.map(value => (
                    <g key={value} transform={`translate(0, ${yScale(value)})`}>
                        <line x1={0} x2={chartWidth} stroke="#e2e8f0" strokeDasharray="2,2" />
                        <text x="-10" dy="0.32em" textAnchor="end">{Math.round(value)}</text>
                    </g>
                ))}
                <text transform={`translate(-35, ${chartHeight / 2}) rotate(-90)`} textAnchor="middle" className="fill-current">
                    кг/га
                </text>
            </g>
        );
    };

    const renderXAxis = () => (
        <g transform={`translate(0, ${chartHeight})`} className="text-slate-500 text-xs">
            {data.map((d, i) => (
                <text key={d.week} x={i * bandWidth + bandWidth / 2} y="20" textAnchor="middle">{d.week}</text>
            ))}
            <text x={chartWidth / 2} y="45" textAnchor="middle" className="fill-current">Тиждень</text>
        </g>
    );

    const renderLegend = () => (
        <g transform={`translate(${(chartWidth - (labels.length * 110)) / 2}, ${chartHeight + margin.bottom - 25})`}>
            {labels.map((label, i) => (
                <g key={label} transform={`translate(${i * 120}, 0)`}>
                    <rect width="12" height="12" fill={COLORS[i]} y="3" />
                    <text x="18" y="12" className="text-xs fill-current text-slate-600 truncate" style={{maxWidth: '100px'}}>{label}</text>
                </g>
            ))}
        </g>
    );

    return (
        <div ref={containerRef} className="relative w-full h-full">
            {tooltip?.visible && (
                <div 
                    className="absolute z-10 p-2 bg-white rounded-md shadow-lg pointer-events-none border border-slate-200"
                    style={{ 
                        transform: `translate(${tooltip.x}px, ${tooltip.y}px) translateX(-50%) translateY(-100%)`,
                        minWidth: '240px'
                    }}
                >
                    {tooltip.content}
                </div>
            )}
            <svg viewBox={`0 0 ${dimensions.width} ${dimensions.height}`} className="w-full h-full">
                <g transform={`translate(${margin.left}, ${margin.top})`}>
                    {renderYAxis()}
                    {renderXAxis()}
                    
                    {data.map((weekData, index) => (
                        <g 
                            key={weekData.week} 
                            transform={`translate(${index * bandWidth + (bandWidth - barWidth) / 2}, 0)`}
                            onMouseOver={(e) => handleMouseOver(e, weekData)}
                            onMouseOut={handleMouseOut}
                            className="cursor-pointer"
                        >
                            <rect 
                                x="0" 
                                y="0" 
                                width={barWidth} 
                                height={chartHeight} 
                                fill={tooltip?.week === weekData.week ? "rgba(99, 102, 241, 0.3)" : "transparent"} 
                            />
                            {KEYS.map((key, i) => {
                                const barHeight = chartHeight - yScale(weekData[key]);
                                return (
                                    <rect
                                        key={key}
                                        x={i * singleBarWidth}
                                        y={yScale(weekData[key])}
                                        width={singleBarWidth}
                                        height={barHeight > 0 ? barHeight : 0}
                                        fill={COLORS[i]}
                                        className="transition-opacity"
                                        opacity={tooltip && tooltip.week !== weekData.week ? 0.7 : 1}
                                    />
                                );
                            })}
                        </g>
                    ))}
                    {renderLegend()}
                </g>
            </svg>
        </div>
    );
};

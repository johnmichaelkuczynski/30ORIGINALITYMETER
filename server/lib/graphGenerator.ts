import { OpenAI } from 'openai';

export interface GraphRequest {
  description: string;
  type?: 'line' | 'bar' | 'scatter' | 'pie' | 'area' | 'auto';
  data?: any[];
  title?: string;
  xLabel?: string;
  yLabel?: string;
  width?: number;
  height?: number;
}

export interface GraphResult {
  svg: string;
  title: string;
  description: string;
}

/**
 * Generates SVG graphs from natural language descriptions or mathematical expressions
 * @param request - Graph generation request parameters
 * @returns Promise containing SVG graph and metadata
 */
export async function generateGraph(request: GraphRequest): Promise<GraphResult> {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const width = request.width || 600;
  const height = request.height || 400;
  const margin = { top: 40, right: 40, bottom: 60, left: 80 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  try {
    // Use GPT to analyze the request and generate appropriate data
    const analysisPrompt = `
Analyze this graph request and provide a JSON response with the following structure:
{
  "graphType": "line|bar|scatter|pie|area",
  "title": "Graph title",
  "xLabel": "X-axis label",
  "yLabel": "Y-axis label",
  "data": [array of data points],
  "description": "Brief description of what the graph shows"
}

Request: "${request.description}"

Guidelines:
1. If it's a mathematical function (like y=x^2, sin(x), etc.), generate appropriate data points
2. If it's economic data (inflation, GDP, etc.), create realistic sample data
3. If it's scientific data, use appropriate scales and units
4. Choose the most appropriate graph type for the data
5. Generate 10-50 data points depending on the graph type
6. For functions, use x values from -10 to 10 or appropriate domain
7. For time series, use realistic date ranges
8. For categorical data, use 5-10 categories

Respond with valid JSON only.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert data visualization assistant. Generate realistic, appropriate data for graphs based on user requests."
        },
        {
          role: "user",
          content: analysisPrompt
        }
      ],
      temperature: 0.3,
    });

    const analysis = JSON.parse(response.choices[0].message.content || '{}');
    
    // Override with user-provided values if available
    const graphType = request.type || analysis.graphType;
    const title = request.title || analysis.title;
    const xLabel = request.xLabel || analysis.xLabel;
    const yLabel = request.yLabel || analysis.yLabel;
    const data = request.data || analysis.data;

    // Generate SVG based on graph type
    let svg = '';
    
    switch (graphType) {
      case 'line':
        svg = generateLineSVG(data, width, height, margin, title, xLabel, yLabel);
        break;
      case 'bar':
        svg = generateBarSVG(data, width, height, margin, title, xLabel, yLabel);
        break;
      case 'scatter':
        svg = generateScatterSVG(data, width, height, margin, title, xLabel, yLabel);
        break;
      case 'pie':
        svg = generatePieSVG(data, width, height, title);
        break;
      case 'area':
        svg = generateAreaSVG(data, width, height, margin, title, xLabel, yLabel);
        break;
      default:
        svg = generateLineSVG(data, width, height, margin, title, xLabel, yLabel);
    }

    return {
      svg,
      title,
      description: analysis.description || 'Generated graph'
    };

  } catch (error) {
    console.error('Error generating graph:', error);
    throw new Error('Failed to generate graph');
  }
}

function generateLineSVG(data: any[], width: number, height: number, margin: any, title: string, xLabel: string, yLabel: string): string {
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;
  
  if (!data || data.length === 0) {
    throw new Error('No data provided for line graph');
  }

  // Extract x and y values
  const xValues = data.map(d => typeof d === 'object' ? d.x : d);
  const yValues = data.map(d => typeof d === 'object' ? d.y : d);
  
  const xMin = Math.min(...xValues);
  const xMax = Math.max(...xValues);
  const yMin = Math.min(...yValues);
  const yMax = Math.max(...yValues);
  
  // Create scales
  const xScale = (x: number) => ((x - xMin) / (xMax - xMin)) * innerWidth;
  const yScale = (y: number) => innerHeight - ((y - yMin) / (yMax - yMin)) * innerHeight;
  
  // Generate path
  const pathData = data.map((d, i) => {
    const x = typeof d === 'object' ? d.x : i;
    const y = typeof d === 'object' ? d.y : d;
    const command = i === 0 ? 'M' : 'L';
    return `${command} ${xScale(x)} ${yScale(y)}`;
  }).join(' ');
  
  // Generate tick marks
  const xTicks = generateTicks(xMin, xMax, 5);
  const yTicks = generateTicks(yMin, yMax, 5);
  
  return `
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      .graph-title { font: bold 16px sans-serif; text-anchor: middle; }
      .axis-label { font: 12px sans-serif; text-anchor: middle; }
      .tick-label { font: 10px sans-serif; text-anchor: middle; }
      .grid-line { stroke: #e0e0e0; stroke-width: 1; }
      .axis { stroke: #333; stroke-width: 2; }
      .data-line { fill: none; stroke: #2563eb; stroke-width: 3; }
      .data-point { fill: #2563eb; }
    </style>
  </defs>
  
  <!-- Background -->
  <rect width="${width}" height="${height}" fill="white"/>
  
  <!-- Title -->
  <text x="${width/2}" y="25" class="graph-title">${title}</text>
  
  <!-- Grid lines -->
  ${xTicks.map(tick => `<line x1="${margin.left + xScale(tick)}" y1="${margin.top}" x2="${margin.left + xScale(tick)}" y2="${height - margin.bottom}" class="grid-line"/>`).join('')}
  ${yTicks.map(tick => `<line x1="${margin.left}" y1="${margin.top + yScale(tick)}" x2="${width - margin.right}" y2="${margin.top + yScale(tick)}" class="grid-line"/>`).join('')}
  
  <!-- Axes -->
  <line x1="${margin.left}" y1="${margin.top}" x2="${margin.left}" y2="${height - margin.bottom}" class="axis"/>
  <line x1="${margin.left}" y1="${height - margin.bottom}" x2="${width - margin.right}" y2="${height - margin.bottom}" class="axis"/>
  
  <!-- Data line -->
  <g transform="translate(${margin.left}, ${margin.top})">
    <path d="${pathData}" class="data-line"/>
    ${data.map((d, i) => {
      const x = typeof d === 'object' ? d.x : i;
      const y = typeof d === 'object' ? d.y : d;
      return `<circle cx="${xScale(x)}" cy="${yScale(y)}" r="4" class="data-point"/>`;
    }).join('')}
  </g>
  
  <!-- X-axis labels -->
  ${xTicks.map(tick => `<text x="${margin.left + xScale(tick)}" y="${height - margin.bottom + 20}" class="tick-label">${tick.toFixed(1)}</text>`).join('')}
  
  <!-- Y-axis labels -->
  ${yTicks.map(tick => `<text x="${margin.left - 10}" y="${margin.top + yScale(tick) + 4}" class="tick-label" text-anchor="end">${tick.toFixed(1)}</text>`).join('')}
  
  <!-- Axis labels -->
  <text x="${width/2}" y="${height - 10}" class="axis-label">${xLabel}</text>
  <text x="15" y="${height/2}" class="axis-label" transform="rotate(-90, 15, ${height/2})">${yLabel}</text>
</svg>`;
}

function generateBarSVG(data: any[], width: number, height: number, margin: any, title: string, xLabel: string, yLabel: string): string {
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;
  
  if (!data || data.length === 0) {
    throw new Error('No data provided for bar graph');
  }

  const values = data.map(d => typeof d === 'object' ? d.value || d.y : d);
  const labels = data.map((d, i) => typeof d === 'object' ? (d.label || d.x || `Item ${i+1}`) : `Item ${i+1}`);
  
  const maxValue = Math.max(...values);
  const minValue = Math.min(0, Math.min(...values));
  const valueRange = maxValue - minValue;
  
  const barWidth = innerWidth / data.length * 0.8;
  const barSpacing = innerWidth / data.length * 0.2;
  
  return `
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      .graph-title { font: bold 16px sans-serif; text-anchor: middle; }
      .axis-label { font: 12px sans-serif; text-anchor: middle; }
      .tick-label { font: 10px sans-serif; text-anchor: middle; }
      .bar-label { font: 9px sans-serif; text-anchor: middle; }
      .axis { stroke: #333; stroke-width: 2; }
      .bar { fill: #3b82f6; opacity: 0.8; }
      .bar:hover { opacity: 1; }
    </style>
  </defs>
  
  <!-- Background -->
  <rect width="${width}" height="${height}" fill="white"/>
  
  <!-- Title -->
  <text x="${width/2}" y="25" class="graph-title">${title}</text>
  
  <!-- Axes -->
  <line x1="${margin.left}" y1="${margin.top}" x2="${margin.left}" y2="${height - margin.bottom}" class="axis"/>
  <line x1="${margin.left}" y1="${height - margin.bottom}" x2="${width - margin.right}" y2="${height - margin.bottom}" class="axis"/>
  
  <!-- Bars -->
  ${data.map((d, i) => {
    const value = typeof d === 'object' ? (d.value || d.y) : d;
    const barHeight = Math.abs(value - minValue) / valueRange * innerHeight;
    const x = margin.left + (i * innerWidth / data.length) + (barSpacing / 2);
    const y = value >= 0 
      ? margin.top + (maxValue - value) / valueRange * innerHeight
      : margin.top + (maxValue - minValue) / valueRange * innerHeight;
    
    return `<rect x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" class="bar"/>`;
  }).join('')}
  
  <!-- Bar labels -->
  ${labels.map((label, i) => {
    const x = margin.left + (i * innerWidth / data.length) + (innerWidth / data.length / 2);
    return `<text x="${x}" y="${height - margin.bottom + 20}" class="bar-label">${label}</text>`;
  }).join('')}
  
  <!-- Y-axis labels -->
  ${generateTicks(minValue, maxValue, 5).map(tick => 
    `<text x="${margin.left - 10}" y="${margin.top + (maxValue - tick) / valueRange * innerHeight + 4}" class="tick-label" text-anchor="end">${tick.toFixed(1)}</text>`
  ).join('')}
  
  <!-- Axis labels -->
  <text x="${width/2}" y="${height - 10}" class="axis-label">${xLabel}</text>
  <text x="15" y="${height/2}" class="axis-label" transform="rotate(-90, 15, ${height/2})">${yLabel}</text>
</svg>`;
}

function generateScatterSVG(data: any[], width: number, height: number, margin: any, title: string, xLabel: string, yLabel: string): string {
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;
  
  if (!data || data.length === 0) {
    throw new Error('No data provided for scatter plot');
  }

  const xValues = data.map(d => typeof d === 'object' ? d.x : d);
  const yValues = data.map(d => typeof d === 'object' ? d.y : Math.random() * 100);
  
  const xMin = Math.min(...xValues);
  const xMax = Math.max(...xValues);
  const yMin = Math.min(...yValues);
  const yMax = Math.max(...yValues);
  
  const xScale = (x: number) => ((x - xMin) / (xMax - xMin)) * innerWidth;
  const yScale = (y: number) => innerHeight - ((y - yMin) / (yMax - yMin)) * innerHeight;
  
  return `
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      .graph-title { font: bold 16px sans-serif; text-anchor: middle; }
      .axis-label { font: 12px sans-serif; text-anchor: middle; }
      .tick-label { font: 10px sans-serif; text-anchor: middle; }
      .grid-line { stroke: #e0e0e0; stroke-width: 1; }
      .axis { stroke: #333; stroke-width: 2; }
      .scatter-point { fill: #ef4444; opacity: 0.7; }
    </style>
  </defs>
  
  <!-- Background -->
  <rect width="${width}" height="${height}" fill="white"/>
  
  <!-- Title -->
  <text x="${width/2}" y="25" class="graph-title">${title}</text>
  
  <!-- Grid lines -->
  ${generateTicks(xMin, xMax, 5).map(tick => `<line x1="${margin.left + xScale(tick)}" y1="${margin.top}" x2="${margin.left + xScale(tick)}" y2="${height - margin.bottom}" class="grid-line"/>`).join('')}
  ${generateTicks(yMin, yMax, 5).map(tick => `<line x1="${margin.left}" y1="${margin.top + yScale(tick)}" x2="${width - margin.right}" y2="${margin.top + yScale(tick)}" class="grid-line"/>`).join('')}
  
  <!-- Axes -->
  <line x1="${margin.left}" y1="${margin.top}" x2="${margin.left}" y2="${height - margin.bottom}" class="axis"/>
  <line x1="${margin.left}" y1="${height - margin.bottom}" x2="${width - margin.right}" y2="${height - margin.bottom}" class="axis"/>
  
  <!-- Data points -->
  <g transform="translate(${margin.left}, ${margin.top})">
    ${data.map((d, i) => {
      const x = typeof d === 'object' ? d.x : d;
      const y = typeof d === 'object' ? d.y : yValues[i];
      return `<circle cx="${xScale(x)}" cy="${yScale(y)}" r="5" class="scatter-point"/>`;
    }).join('')}
  </g>
  
  <!-- Axis labels and ticks (same as line graph) -->
  ${generateTicks(xMin, xMax, 5).map(tick => `<text x="${margin.left + xScale(tick)}" y="${height - margin.bottom + 20}" class="tick-label">${tick.toFixed(1)}</text>`).join('')}
  ${generateTicks(yMin, yMax, 5).map(tick => `<text x="${margin.left - 10}" y="${margin.top + yScale(tick) + 4}" class="tick-label" text-anchor="end">${tick.toFixed(1)}</text>`).join('')}
  
  <text x="${width/2}" y="${height - 10}" class="axis-label">${xLabel}</text>
  <text x="15" y="${height/2}" class="axis-label" transform="rotate(-90, 15, ${height/2})">${yLabel}</text>
</svg>`;
}

function generatePieSVG(data: any[], width: number, height: number, title: string): string {
  if (!data || data.length === 0) {
    throw new Error('No data provided for pie chart');
  }

  const values = data.map(d => typeof d === 'object' ? (d.value || d.y) : d);
  const labels = data.map((d, i) => typeof d === 'object' ? (d.label || d.x || `Slice ${i+1}`) : `Slice ${i+1}`);
  
  const total = values.reduce((sum, val) => sum + Math.abs(val), 0);
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) / 3;
  
  let currentAngle = -Math.PI / 2; // Start at top
  const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#f97316', '#84cc16'];
  
  const slices = values.map((value, i) => {
    const angle = (Math.abs(value) / total) * 2 * Math.PI;
    const x1 = centerX + radius * Math.cos(currentAngle);
    const y1 = centerY + radius * Math.sin(currentAngle);
    
    currentAngle += angle;
    
    const x2 = centerX + radius * Math.cos(currentAngle);
    const y2 = centerY + radius * Math.sin(currentAngle);
    
    const largeArcFlag = angle > Math.PI ? 1 : 0;
    
    const pathData = [
      `M ${centerX} ${centerY}`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      'Z'
    ].join(' ');
    
    return {
      path: pathData,
      color: colors[i % colors.length],
      label: labels[i],
      value: value,
      percentage: ((Math.abs(value) / total) * 100).toFixed(1)
    };
  });
  
  return `
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      .graph-title { font: bold 16px sans-serif; text-anchor: middle; }
      .legend-text { font: 12px sans-serif; }
      .slice { opacity: 0.9; }
      .slice:hover { opacity: 1; }
    </style>
  </defs>
  
  <!-- Background -->
  <rect width="${width}" height="${height}" fill="white"/>
  
  <!-- Title -->
  <text x="${width/2}" y="25" class="graph-title">${title}</text>
  
  <!-- Pie slices -->
  ${slices.map(slice => `<path d="${slice.path}" fill="${slice.color}" class="slice"/>`).join('')}
  
  <!-- Legend -->
  ${slices.map((slice, i) => `
    <g transform="translate(${width - 150}, ${50 + i * 25})">
      <rect x="0" y="0" width="15" height="15" fill="${slice.color}"/>
      <text x="20" y="12" class="legend-text">${slice.label}: ${slice.percentage}%</text>
    </g>
  `).join('')}
</svg>`;
}

function generateAreaSVG(data: any[], width: number, height: number, margin: any, title: string, xLabel: string, yLabel: string): string {
  const svg = generateLineSVG(data, width, height, margin, title, xLabel, yLabel);
  
  // Add area fill by modifying the line path
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;
  
  const xValues = data.map(d => typeof d === 'object' ? d.x : d);
  const yValues = data.map(d => typeof d === 'object' ? d.y : d);
  
  const xMin = Math.min(...xValues);
  const xMax = Math.max(...xValues);
  const yMin = Math.min(...yValues);
  const yMax = Math.max(...yValues);
  
  const xScale = (x: number) => ((x - xMin) / (xMax - xMin)) * innerWidth;
  const yScale = (y: number) => innerHeight - ((y - yMin) / (yMax - yMin)) * innerHeight;
  
  const areaPath = [
    `M ${xScale(xValues[0])} ${innerHeight}`,
    ...data.map((d, i) => {
      const x = typeof d === 'object' ? d.x : i;
      const y = typeof d === 'object' ? d.y : d;
      return `L ${xScale(x)} ${yScale(y)}`;
    }),
    `L ${xScale(xValues[xValues.length - 1])} ${innerHeight}`,
    'Z'
  ].join(' ');
  
  return svg.replace(
    '<path d="',
    `<path d="${areaPath}" fill="#3b82f6" opacity="0.3"/>\n  <path d="`
  );
}

function generateTicks(min: number, max: number, count: number): number[] {
  const step = (max - min) / (count - 1);
  return Array.from({ length: count }, (_, i) => min + i * step);
}
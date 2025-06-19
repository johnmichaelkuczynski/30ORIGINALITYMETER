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

// Helper function declarations
function generateTicks(min: number, max: number, count: number): number[] {
  const step = (max - min) / (count - 1);
  return Array.from({ length: count }, (_, i) => min + i * step);
}

function generateMathFunctionSVG(description: string, width: number, height: number, margin: any, title: string, xLabel: string, yLabel: string): string {
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;
  
  // Default range for mathematical functions
  let xMin = -10, xMax = 10;
  let points: {x: number, y: number}[] = [];
  
  // Generate function based on description
  if (description.toLowerCase().includes('exponential')) {
    title = title || 'Exponential Function';
    xLabel = xLabel || 'x';
    yLabel = yLabel || 'y = e^x';
    xMin = -3;
    xMax = 3;
    
    // Generate exponential function points
    for (let x = xMin; x <= xMax; x += 0.1) {
      const y = Math.exp(x);
      points.push({x, y});
    }
  } else if (description.toLowerCase().includes('quadratic')) {
    title = title || 'Quadratic Function';
    xLabel = xLabel || 'x';
    yLabel = yLabel || 'y = x²';
    xMin = -5;
    xMax = 5;
    
    for (let x = xMin; x <= xMax; x += 0.2) {
      const y = x * x;
      points.push({x, y});
    }
  } else if (description.toLowerCase().includes('sine')) {
    title = title || 'Sine Function';
    xLabel = xLabel || 'x';
    yLabel = yLabel || 'y = sin(x)';
    xMin = -2 * Math.PI;
    xMax = 2 * Math.PI;
    
    for (let x = xMin; x <= xMax; x += 0.1) {
      const y = Math.sin(x);
      points.push({x, y});
    }
  } else if (description.toLowerCase().includes('cosine')) {
    title = title || 'Cosine Function';
    xLabel = xLabel || 'x';
    yLabel = yLabel || 'y = cos(x)';
    xMin = -2 * Math.PI;
    xMax = 2 * Math.PI;
    
    for (let x = xMin; x <= xMax; x += 0.1) {
      const y = Math.cos(x);
      points.push({x, y});
    }
  } else if (description.toLowerCase().includes('logarithmic')) {
    title = title || 'Logarithmic Function';
    xLabel = xLabel || 'x';
    yLabel = yLabel || 'y = ln(x)';
    xMin = 0.1;
    xMax = 10;
    
    for (let x = xMin; x <= xMax; x += 0.1) {
      const y = Math.log(x);
      points.push({x, y});
    }
  } else {
    // Default to a simple linear function
    title = title || 'Linear Function';
    xLabel = xLabel || 'x';
    yLabel = yLabel || 'y = x';
    
    for (let x = xMin; x <= xMax; x += 0.5) {
      const y = x;
      points.push({x, y});
    }
  }
  
  const yValues = points.map(p => p.y);
  const yMin = Math.min(...yValues);
  const yMax = Math.max(...yValues);
  
  // Create scales
  const xScale = (x: number) => ((x - xMin) / (xMax - xMin)) * innerWidth;
  const yScale = (y: number) => innerHeight - ((y - yMin) / (yMax - yMin)) * innerHeight;
  
  // Generate path data
  const pathData = points.map((point, i) => {
    const command = i === 0 ? 'M' : 'L';
    return `${command} ${xScale(point.x)} ${yScale(point.y)}`;
  }).join(' ');
  
  // Generate tick marks
  const xTicks = generateTicks(xMin, xMax, 6);
  const yTicks = generateTicks(yMin, yMax, 6);
  
  return `
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      .graph-title { font: bold 16px sans-serif; text-anchor: middle; fill: #1f2937; }
      .axis-label { font: 12px sans-serif; text-anchor: middle; fill: #374151; }
      .tick-label { font: 10px sans-serif; text-anchor: middle; fill: #6b7280; }
      .grid-line { stroke: #e5e7eb; stroke-width: 1; }
      .axis { stroke: #374151; stroke-width: 2; }
      .data-line { fill: none; stroke: #2563eb; stroke-width: 3; }
      .zero-line { stroke: #9ca3af; stroke-width: 1; stroke-dasharray: 3,3; }
    </style>
  </defs>
  
  <!-- Background -->
  <rect width="${width}" height="${height}" fill="white"/>
  
  <!-- Title -->
  <text x="${width/2}" y="25" class="graph-title">${title}</text>
  
  <!-- Grid lines -->
  ${xTicks.map(tick => `<line x1="${margin.left + xScale(tick)}" y1="${margin.top}" x2="${margin.left + xScale(tick)}" y2="${height - margin.bottom}" class="grid-line"/>`).join('')}
  ${yTicks.map(tick => `<line x1="${margin.left}" y1="${margin.top + yScale(tick)}" x2="${width - margin.right}" y2="${margin.top + yScale(tick)}" class="grid-line"/>`).join('')}
  
  <!-- Zero lines if they're visible -->
  ${xMin <= 0 && xMax >= 0 ? `<line x1="${margin.left + xScale(0)}" y1="${margin.top}" x2="${margin.left + xScale(0)}" y2="${height - margin.bottom}" class="zero-line"/>` : ''}
  ${yMin <= 0 && yMax >= 0 ? `<line x1="${margin.left}" y1="${margin.top + yScale(0)}" x2="${width - margin.right}" y2="${margin.top + yScale(0)}" class="zero-line"/>` : ''}
  
  <!-- Axes -->
  <line x1="${margin.left}" y1="${margin.top}" x2="${margin.left}" y2="${height - margin.bottom}" class="axis"/>
  <line x1="${margin.left}" y1="${height - margin.bottom}" x2="${width - margin.right}" y2="${height - margin.bottom}" class="axis"/>
  
  <!-- Function curve -->
  <g transform="translate(${margin.left}, ${margin.top})">
    <path d="${pathData}" class="data-line"/>
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

  try {
    // Check if this is a mathematical function request
    if (request.description && (
      request.description.toLowerCase().includes('exponential') ||
      request.description.toLowerCase().includes('quadratic') ||
      request.description.toLowerCase().includes('cubic') ||
      request.description.toLowerCase().includes('logarithmic') ||
      request.description.toLowerCase().includes('sine') ||
      request.description.toLowerCase().includes('cosine') ||
      request.description.toLowerCase().includes('function')
    )) {
      const svg = generateMathFunctionSVG(
        request.description, 
        width, 
        height, 
        margin, 
        request.title || '', 
        request.xLabel || '', 
        request.yLabel || ''
      );
      
      return {
        svg,
        title: request.title || 'Mathematical Function',
        description: request.description
      };
    }

    // For non-mathematical graphs, use AI to generate data
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

For line/scatter graphs, use format: [{"x": number, "y": number}, ...]
For bar graphs, use format: [{"label": "Category", "value": number}, ...]
For pie charts, use format: [{"label": "Category", "value": number}, ...]

Provide realistic sample data (5-10 points) that matches the request.
Only return valid JSON without markdown formatting.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "user",
          content: analysisPrompt
        }
      ],
      temperature: 0.3,
    });

    let responseContent = response.choices[0].message.content || '{}';
    
    // Clean up response - remove markdown code blocks if present
    responseContent = responseContent.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    
    const analysis = JSON.parse(responseContent);
    
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

  const xValues = data.map((d, i) => typeof d === 'object' ? d.x : i);
  const yValues = data.map(d => typeof d === 'object' ? d.y : d);
  
  const xMin = Math.min(...xValues);
  const xMax = Math.max(...xValues);
  const yMin = Math.min(...yValues);
  const yMax = Math.max(...yValues);
  
  const xScale = (x: number) => ((x - xMin) / (xMax - xMin)) * innerWidth;
  const yScale = (y: number) => innerHeight - ((y - yMin) / (yMax - yMin)) * innerHeight;
  
  const pathData = data.map((d, i) => {
    const x = typeof d === 'object' ? d.x : i;
    const y = typeof d === 'object' ? d.y : d;
    const command = i === 0 ? 'M' : 'L';
    return `${command} ${xScale(x)} ${yScale(y)}`;
  }).join(' ');
  
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
  
  <rect width="${width}" height="${height}" fill="white"/>
  <text x="${width/2}" y="25" class="graph-title">${title}</text>
  
  ${xTicks.map(tick => `<line x1="${margin.left + xScale(tick)}" y1="${margin.top}" x2="${margin.left + xScale(tick)}" y2="${height - margin.bottom}" class="grid-line"/>`).join('')}
  ${yTicks.map(tick => `<line x1="${margin.left}" y1="${margin.top + yScale(tick)}" x2="${width - margin.right}" y2="${margin.top + yScale(tick)}" class="grid-line"/>`).join('')}
  
  <line x1="${margin.left}" y1="${margin.top}" x2="${margin.left}" y2="${height - margin.bottom}" class="axis"/>
  <line x1="${margin.left}" y1="${height - margin.bottom}" x2="${width - margin.right}" y2="${height - margin.bottom}" class="axis"/>
  
  <g transform="translate(${margin.left}, ${margin.top})">
    <path d="${pathData}" class="data-line"/>
    ${data.map((d, i) => {
      const x = typeof d === 'object' ? d.x : i;
      const y = typeof d === 'object' ? d.y : d;
      return `<circle cx="${xScale(x)}" cy="${yScale(y)}" r="4" class="data-point"/>`;
    }).join('')}
  </g>
  
  ${xTicks.map(tick => `<text x="${margin.left + xScale(tick)}" y="${height - margin.bottom + 20}" class="tick-label">${tick.toFixed(1)}</text>`).join('')}
  ${yTicks.map(tick => `<text x="${margin.left - 10}" y="${margin.top + yScale(tick) + 4}" class="tick-label" text-anchor="end">${tick.toFixed(1)}</text>`).join('')}
  
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
  
  <rect width="${width}" height="${height}" fill="white"/>
  <text x="${width/2}" y="25" class="graph-title">${title}</text>
  
  <line x1="${margin.left}" y1="${margin.top}" x2="${margin.left}" y2="${height - margin.bottom}" class="axis"/>
  <line x1="${margin.left}" y1="${height - margin.bottom}" x2="${width - margin.right}" y2="${height - margin.bottom}" class="axis"/>
  
  ${data.map((d, i) => {
    const value = typeof d === 'object' ? d.value || d.y : d;
    const label = typeof d === 'object' ? (d.label || d.x || `Item ${i+1}`) : `Item ${i+1}`;
    const barHeight = Math.abs(value / valueRange) * innerHeight;
    const x = margin.left + i * (barWidth + barSpacing) + barSpacing / 2;
    const y = value >= 0 ? margin.top + innerHeight - barHeight : margin.top + innerHeight;
    
    return `
      <rect x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" class="bar"/>
      <text x="${x + barWidth/2}" y="${height - margin.bottom + 15}" class="bar-label">${label}</text>
      <text x="${x + barWidth/2}" y="${y - 5}" class="bar-label">${value}</text>
    `;
  }).join('')}
  
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

  const xValues = data.map((d, i) => typeof d === 'object' ? d.x : i);
  const yValues = data.map(d => typeof d === 'object' ? d.y : d);
  
  const xMin = Math.min(...xValues);
  const xMax = Math.max(...xValues);
  const yMin = Math.min(...yValues);
  const yMax = Math.max(...yValues);
  
  const xScale = (x: number) => ((x - xMin) / (xMax - xMin)) * innerWidth;
  const yScale = (y: number) => innerHeight - ((y - yMin) / (yMax - yMin)) * innerHeight;
  
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
      .data-point { fill: #2563eb; opacity: 0.7; }
    </style>
  </defs>
  
  <rect width="${width}" height="${height}" fill="white"/>
  <text x="${width/2}" y="25" class="graph-title">${title}</text>
  
  ${xTicks.map(tick => `<line x1="${margin.left + xScale(tick)}" y1="${margin.top}" x2="${margin.left + xScale(tick)}" y2="${height - margin.bottom}" class="grid-line"/>`).join('')}
  ${yTicks.map(tick => `<line x1="${margin.left}" y1="${margin.top + yScale(tick)}" x2="${width - margin.right}" y2="${margin.top + yScale(tick)}" class="grid-line"/>`).join('')}
  
  <line x1="${margin.left}" y1="${margin.top}" x2="${margin.left}" y2="${height - margin.bottom}" class="axis"/>
  <line x1="${margin.left}" y1="${height - margin.bottom}" x2="${width - margin.right}" y2="${height - margin.bottom}" class="axis"/>
  
  <g transform="translate(${margin.left}, ${margin.top})">
    ${data.map((d, i) => {
      const x = typeof d === 'object' ? d.x : i;
      const y = typeof d === 'object' ? d.y : d;
      return `<circle cx="${xScale(x)}" cy="${yScale(y)}" r="5" class="data-point"/>`;
    }).join('')}
  </g>
  
  ${xTicks.map(tick => `<text x="${margin.left + xScale(tick)}" y="${height - margin.bottom + 20}" class="tick-label">${tick.toFixed(1)}</text>`).join('')}
  ${yTicks.map(tick => `<text x="${margin.left - 10}" y="${margin.top + yScale(tick) + 4}" class="tick-label" text-anchor="end">${tick.toFixed(1)}</text>`).join('')}
  
  <text x="${width/2}" y="${height - 10}" class="axis-label">${xLabel}</text>
  <text x="15" y="${height/2}" class="axis-label" transform="rotate(-90, 15, ${height/2})">${yLabel}</text>
</svg>`;
}

function generatePieSVG(data: any[], width: number, height: number, title: string): string {
  if (!data || data.length === 0) {
    throw new Error('No data provided for pie chart');
  }

  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) / 2 - 80;
  
  const values = data.map(d => typeof d === 'object' ? d.value || d.y : d);
  const labels = data.map((d, i) => typeof d === 'object' ? (d.label || d.x || `Item ${i+1}`) : `Item ${i+1}`);
  const total = values.reduce((sum, val) => sum + val, 0);
  
  let currentAngle = 0;
  const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4'];
  
  return `
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      .graph-title { font: bold 16px sans-serif; text-anchor: middle; }
      .pie-label { font: 12px sans-serif; text-anchor: middle; }
    </style>
  </defs>
  
  <rect width="${width}" height="${height}" fill="white"/>
  <text x="${width/2}" y="25" class="graph-title">${title}</text>
  
  ${data.map((d, i) => {
    const value = typeof d === 'object' ? d.value || d.y : d;
    const label = typeof d === 'object' ? (d.label || d.x || `Item ${i+1}`) : `Item ${i+1}`;
    const percentage = (value / total) * 100;
    const angle = (value / total) * 2 * Math.PI;
    
    const x1 = centerX + radius * Math.cos(currentAngle);
    const y1 = centerY + radius * Math.sin(currentAngle);
    const x2 = centerX + radius * Math.cos(currentAngle + angle);
    const y2 = centerY + radius * Math.sin(currentAngle + angle);
    
    const largeArcFlag = angle > Math.PI ? 1 : 0;
    const pathData = `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
    
    const labelX = centerX + (radius * 0.7) * Math.cos(currentAngle + angle / 2);
    const labelY = centerY + (radius * 0.7) * Math.sin(currentAngle + angle / 2);
    
    currentAngle += angle;
    
    return `
      <path d="${pathData}" fill="${colors[i % colors.length]}" opacity="0.8"/>
      <text x="${labelX}" y="${labelY}" class="pie-label" fill="white">${percentage.toFixed(1)}%</text>
    `;
  }).join('')}
  
  ${data.map((d, i) => {
    const label = typeof d === 'object' ? (d.label || d.x || `Item ${i+1}`) : `Item ${i+1}`;
    return `
      <rect x="20" y="${50 + i * 25}" width="15" height="15" fill="${colors[i % colors.length]}"/>
      <text x="45" y="${62 + i * 25}" class="pie-label">${label}</text>
    `;
  }).join('')}
</svg>`;
}

function generateAreaSVG(data: any[], width: number, height: number, margin: any, title: string, xLabel: string, yLabel: string): string {
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;
  
  if (!data || data.length === 0) {
    throw new Error('No data provided for area chart');
  }

  const xValues = data.map((d, i) => typeof d === 'object' ? d.x : i);
  const yValues = data.map(d => typeof d === 'object' ? d.y : d);
  
  const xMin = Math.min(...xValues);
  const xMax = Math.max(...xValues);
  const yMin = Math.min(0, Math.min(...yValues));
  const yMax = Math.max(...yValues);
  
  const xScale = (x: number) => ((x - xMin) / (xMax - xMin)) * innerWidth;
  const yScale = (y: number) => innerHeight - ((y - yMin) / (yMax - yMin)) * innerHeight;
  
  const lineData = data.map((d, i) => {
    const x = typeof d === 'object' ? d.x : i;
    const y = typeof d === 'object' ? d.y : d;
    const command = i === 0 ? 'M' : 'L';
    return `${command} ${xScale(x)} ${yScale(y)}`;
  }).join(' ');
  
  const areaPath = `${lineData} L ${xScale(xValues[xValues.length - 1])} ${yScale(0)} L ${xScale(xValues[0])} ${yScale(0)} Z`;
  
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
      .data-area { fill: #3b82f6; opacity: 0.3; }
      .data-line { fill: none; stroke: #3b82f6; stroke-width: 3; }
    </style>
  </defs>
  
  <rect width="${width}" height="${height}" fill="white"/>
  <text x="${width/2}" y="25" class="graph-title">${title}</text>
  
  ${xTicks.map(tick => `<line x1="${margin.left + xScale(tick)}" y1="${margin.top}" x2="${margin.left + xScale(tick)}" y2="${height - margin.bottom}" class="grid-line"/>`).join('')}
  ${yTicks.map(tick => `<line x1="${margin.left}" y1="${margin.top + yScale(tick)}" x2="${width - margin.right}" y2="${margin.top + yScale(tick)}" class="grid-line"/>`).join('')}
  
  <line x1="${margin.left}" y1="${margin.top}" x2="${margin.left}" y2="${height - margin.bottom}" class="axis"/>
  <line x1="${margin.left}" y1="${height - margin.bottom}" x2="${width - margin.right}" y2="${height - margin.bottom}" class="axis"/>
  
  <g transform="translate(${margin.left}, ${margin.top})">
    <path d="${areaPath}" class="data-area"/>
    <path d="${lineData}" class="data-line"/>
  </g>
  
  ${xTicks.map(tick => `<text x="${margin.left + xScale(tick)}" y="${height - margin.bottom + 20}" class="tick-label">${tick.toFixed(1)}</text>`).join('')}
  ${yTicks.map(tick => `<text x="${margin.left - 10}" y="${margin.top + yScale(tick) + 4}" class="tick-label" text-anchor="end">${tick.toFixed(1)}</text>`).join('')}
  
  <text x="${width/2}" y="${height - 10}" class="axis-label">${xLabel}</text>
  <text x="15" y="${height/2}" class="axis-label" transform="rotate(-90, 15, ${height/2})">${yLabel}</text>
</svg>`;
}
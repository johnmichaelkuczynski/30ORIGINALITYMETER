import { OpenAI } from 'openai';

export interface GraphRequest {
  description: string;
  type?: 'line' | 'bar' | 'scatter' | 'pie' | 'area' | 'auto';
  data?: any[];
  title?: string;
  xLabel?: string;
  yLabel?: string;
  llmProvider?: string;
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



/**
 * Generates SVG graphs from natural language descriptions or mathematical expressions
 * @param request - Graph generation request parameters
 * @returns Promise containing SVG graph and metadata
 */
export async function generateGraph(request: GraphRequest): Promise<GraphResult> {
  const width = request.width || 600;
  const height = request.height || 400;
  const margin = { top: 40, right: 40, bottom: 60, left: 80 };
  
  const llmProvider = request.llmProvider || 'gpt-4o-mini';

  try {
    // Prepare the analysis prompt
    const analysisPrompt = `
You are a mathematical function plotter. Analyze this request and generate precise data points.

Request: "${request.description}"

CRITICAL REQUIREMENTS:
1. For ANY mathematical function described (exponential decay, sine wave, parabola, etc.), YOU MUST:
   - Identify the exact mathematical equation (e.g., y = e^(-x), y = sin(x)*e^(-x), y = -2(x-3)² + 18)
   - Calculate y-values using the actual mathematical formula, not approximations
   - Generate AT LEAST 50-300 data points for smooth curves
   - Cover the complete specified range (e.g., x=0 to x=10)
   - Include ALL critical points (intercepts, peaks, valleys, asymptotes)

2. For verbal descriptions like "exponential decay starting at y=1":
   - Convert to precise equation: y = e^(-ax) where a determines decay rate
   - For "sine wave with decaying amplitude": y = e^(-bx) * sin(cx)
   - Calculate exact mathematical values, not preset patterns

3. Data format: [{"x": number, "y": number}, ...]

Return JSON structure:
{
  "graphType": "line",
  "title": "Title from description",
  "xLabel": "x",
  "yLabel": "y", 
  "data": [{"x": 0, "y": calculatedValue}, {"x": 0.033, "y": calculatedValue}, ...],
  "description": "Mathematical function plotted"
}

MATHEMATICAL PRECISION REQUIRED: No approximations, no presets, calculate actual function values.
CRITICAL: Only return valid JSON without markdown formatting, comments, or explanatory text. Start directly with { and end with }.`;

    let response;
    
    // Route to different LLM providers based on selection
    if (llmProvider === 'claude-sonnet-4') {
      // Use Anthropic Claude
      const { Anthropic } = await import('@anthropic-ai/sdk');
      const anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
      });
      
      const claudeResponse = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4000,
        messages: [{ role: 'user', content: analysisPrompt }],
        temperature: 0.3,
      });
      
      response = { choices: [{ message: { content: claudeResponse.content[0].text } }] };
    } else {
      // Use OpenAI models (gpt-4o-mini, gpt-4o, gpt-4)
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
      
      response = await openai.chat.completions.create({
        model: llmProvider,
        messages: [
          {
            role: "user",
            content: analysisPrompt
          }
        ],
        temperature: 0.3,
      });
    }

    let responseContent = response.choices[0].message.content || '{}';
    
    // Clean up response - remove markdown code blocks and comments
    responseContent = responseContent
      .replace(/```json\s*/g, '')
      .replace(/```\s*/g, '')
      .replace(/\/\/.*$/gm, '') // Remove single-line comments
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove multi-line comments
      .replace(/,\s*}/g, '}') // Remove trailing commas before closing braces
      .replace(/,\s*]/g, ']') // Remove trailing commas before closing brackets
      .trim();
    
    let analysis;
    try {
      analysis = JSON.parse(responseContent);
    } catch (parseError) {
      console.error('JSON parsing failed. Raw response:', responseContent);
      console.error('Parse error:', parseError);
      
      // Try to extract JSON from response if it's wrapped in text
      const jsonMatch = responseContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          analysis = JSON.parse(jsonMatch[0]);
        } catch (retryError) {
          throw new Error(`Failed to parse LLM response as JSON: ${parseError.message}`);
        }
      } else {
        throw new Error(`No valid JSON found in LLM response: ${responseContent.substring(0, 200)}...`);
      }
    }
    
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
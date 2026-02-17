#!/usr/bin/env python
from __future__ import annotations

import csv
import json
from pathlib import Path
from datetime import datetime

# ======================================================
# CONSTANTS (LOCKED PRICING)
# ======================================================

# OpenAI GPT-5 Mini
OPENAI_MODEL = "gpt-5-mini-2025-08-07"
OPENAI_INPUT_PRICE_PER_1M = 0.25   # USD
OPENAI_OUTPUT_PRICE_PER_1M = 2.00  # USD
OPENAI_PURPOSE = "Script Generation (Visual & Narration)"

# Azure TTS
TTS_SERVICE = "Azure Text-to-Speech"
TTS_VOICE = "Arjun (en-IN) Neural"
TTS_PRICE_PER_MILLION_CHAR = 16.0  # USD

# Compute & Storage
COMPUTE_PRICE_PER_HOUR = 0.20  # USD
STORAGE_PRICE_PER_GB_MONTH = 0.02  # USD
RENDER_LOCATION = "Local Machine"
STORAGE_LOCATION = "Local Storage"

# ======================================================
# PATHS
# ======================================================

PROJECT_ROOT = Path(__file__).resolve().parents[2]
BACKEND_OUTPUT = PROJECT_ROOT / "backend" / "output"
VIDEO_APP = PROJECT_ROOT / "video-app"

RENDER_METRICS_PATH = VIDEO_APP / "renders" / "render_metrics.json"
MANIFEST_PATH = BACKEND_OUTPUT / "narration_manifest.json"

REPORTS_DIR = BACKEND_OUTPUT / "reports"
CSV_PATH = REPORTS_DIR / "professional_cost_sheet.csv"
HTML_PATH = REPORTS_DIR / "cost_report.html"

# ======================================================
# HELPERS
# ======================================================

def load_json(path: Path):
    if not path.exists():
        return {}
    return json.loads(path.read_text(encoding="utf-8"))


def format_currency(value):
    """Format as currency with proper precision"""
    if value >= 1:
        return f"${value:,.2f}"
    elif value >= 0.01:
        return f"${value:.4f}"
    else:
        return f"${value:.6f}"


def format_duration(seconds):
    """Convert seconds to human-readable format"""
    if seconds < 60:
        return f"{seconds:.1f}s"
    elif seconds < 3600:
        mins = seconds / 60
        return f"{mins:.1f}m"
    else:
        hours = seconds / 3600
        return f"{hours:.2f}h"


def get_user_input():
    """Interactive prompts for user input"""
    print("\n" + "="*60)
    print("🎬 VIDEO PRODUCTION COST ANALYSIS GENERATOR")
    print("="*60 + "\n")
    
    print("📊 Please provide the following information:\n")
    
    # Get OpenAI tokens
    while True:
        try:
            input_tokens = int(input("1️⃣  OpenAI Input Tokens (e.g., 15000): "))
            if input_tokens >= 0:
                break
            print("   ❌ Please enter a positive number")
        except ValueError:
            print("   ❌ Please enter a valid number")
    
    while True:
        try:
            output_tokens = int(input("2️⃣  OpenAI Output Tokens (e.g., 8000): "))
            if output_tokens >= 0:
                break
            print("   ❌ Please enter a positive number")
        except ValueError:
            print("   ❌ Please enter a valid number")
    
    print("\n" + "="*60)
    print("✅ All data collected! Generating report...\n")
    
    return input_tokens, output_tokens


def generate_html_report(render, manifest, renders, openai_input_tokens, openai_output_tokens,
                         openai_total_cost, tts_cost, compute_cost, storage_cost, 
                         total_chars, grand_total):
    """Generate beautiful HTML report with charts"""
    
    cost_per_video = grand_total / (len(renders) or 1)
    
    # Calculate percentages for pie chart
    openai_pct = (openai_total_cost / grand_total * 100) if grand_total > 0 else 0
    tts_pct = (tts_cost / grand_total * 100) if grand_total > 0 else 0
    compute_pct = (compute_cost / grand_total * 100) if grand_total > 0 else 0
    storage_pct = (storage_cost / grand_total * 100) if grand_total > 0 else 0
    
    # Prepare render quality data
    quality_data = []
    for r in renders:
        rt = r["render_time_sec"]
        dur = r["duration_sec"]
        size_mb = r["file_size_mb"]
        ratio = rt / render.get("total_render_time_sec", 1)
        q_compute = ratio * compute_cost
        q_storage = (size_mb / 1024) * STORAGE_PRICE_PER_GB_MONTH
        q_total = q_compute + q_storage
        q_cost_per_min = (q_total / dur) * 60 if dur > 0 else 0
        
        quality_data.append({
            "quality": r["quality"],
            "resolution": f"{r['width']}x{r['height']}",
            "render_time": rt,
            "file_size": size_mb,
            "total_cost": q_total,
            "cost_per_min": q_cost_per_min
        })
    
    html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Video Production Cost Report</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        * {{ margin: 0; padding: 0; box-sizing: border-box; }}
        body {{
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px;
            color: #333;
        }}
        .container {{
            max-width: 1400px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            overflow: hidden;
        }}
        .header {{
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px;
            text-align: center;
        }}
        .header h1 {{
            font-size: 2.5em;
            margin-bottom: 10px;
        }}
        .header p {{
            font-size: 1.1em;
            opacity: 0.9;
        }}
        .summary {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            padding: 40px;
            background: #f8f9fa;
        }}
        .summary-card {{
            background: white;
            padding: 25px;
            border-radius: 15px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            border-left: 5px solid #667eea;
        }}
        .summary-card h3 {{
            font-size: 0.9em;
            color: #666;
            margin-bottom: 10px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }}
        .summary-card .value {{
            font-size: 2em;
            font-weight: bold;
            color: #667eea;
        }}
        .summary-card .subtext {{
            font-size: 0.9em;
            color: #999;
            margin-top: 5px;
        }}
        .content {{
            padding: 40px;
        }}
        .section {{
            margin-bottom: 50px;
        }}
        .section h2 {{
            font-size: 1.8em;
            margin-bottom: 20px;
            color: #333;
            border-bottom: 3px solid #667eea;
            padding-bottom: 10px;
        }}
        .chart-container {{
            position: relative;
            height: 400px;
            margin: 30px 0;
            background: white;
            padding: 20px;
            border-radius: 15px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }}
        .grid-2 {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
            gap: 30px;
        }}
        table {{
            width: 100%;
            border-collapse: collapse;
            background: white;
            border-radius: 15px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }}
        th {{
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 15px;
            text-align: left;
            font-weight: 600;
        }}
        td {{
            padding: 15px;
            border-bottom: 1px solid #eee;
        }}
        tr:hover {{
            background: #f8f9fa;
        }}
        .badge {{
            display: inline-block;
            padding: 5px 12px;
            border-radius: 20px;
            font-size: 0.85em;
            font-weight: 600;
        }}
        .badge-primary {{ background: #e3f2fd; color: #1976d2; }}
        .badge-success {{ background: #e8f5e9; color: #388e3c; }}
        .badge-warning {{ background: #fff3e0; color: #f57c00; }}
        .badge-info {{ background: #e0f2f1; color: #00796b; }}
        .specs-grid {{
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 15px;
            margin-top: 20px;
        }}
        .spec-item {{
            background: #f8f9fa;
            padding: 15px;
            border-radius: 10px;
            border-left: 4px solid #667eea;
        }}
        .spec-label {{
            font-size: 0.85em;
            color: #666;
            margin-bottom: 5px;
        }}
        .spec-value {{
            font-size: 1.1em;
            font-weight: 600;
            color: #333;
        }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎬 Video Production Cost Report</h1>
            <p>Generated on {datetime.now().strftime('%B %d, %Y at %I:%M %p')}</p>
            <p style="font-size: 0.9em; margin-top: 10px;">Run ID: {render.get('run_id', 'N/A')}</p>
        </div>
        
        <div class="summary">
            <div class="summary-card">
                <h3>Total Project Cost</h3>
                <div class="value">{format_currency(grand_total)}</div>
                <div class="subtext">All services included</div>
            </div>
            <div class="summary-card">
                <h3>Cost Per Video Quality</h3>
                <div class="value">{format_currency(cost_per_video)}</div>
                <div class="subtext">{len(renders)} quality variants</div>
            </div>
            <div class="summary-card">
                <h3>Video Duration</h3>
                <div class="value">{format_duration(renders[0]["duration_sec"] if renders else 0)}</div>
                <div class="subtext">≈ {renders[0]["duration_sec"]/60:.1f} minutes</div>
            </div>
            <div class="summary-card">
                <h3>Total Render Time</h3>
                <div class="value">{format_duration(render.get("total_render_time_sec", 0))}</div>
                <div class="subtext">Across all qualities</div>
            </div>
        </div>
        
        <div class="content">
            <!-- Cost Distribution Chart -->
            <div class="section">
                <h2>💰 Cost Distribution by Service</h2>
                <div class="grid-2">
                    <div class="chart-container">
                        <canvas id="costPieChart"></canvas>
                    </div>
                    <div class="chart-container">
                        <canvas id="costBarChart"></canvas>
                    </div>
                </div>
            </div>
            
            <!-- Service Breakdown Table -->
            <div class="section">
                <h2>📊 Detailed Service Breakdown</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Service</th>
                            <th>Details</th>
                            <th>Usage</th>
                            <th>Cost</th>
                            <th>% of Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><strong>🤖 {OPENAI_MODEL}</strong><br><span class="badge badge-primary">OpenAI API</span></td>
                            <td>{OPENAI_PURPOSE}</td>
                            <td>{openai_input_tokens:,} input tokens<br>{openai_output_tokens:,} output tokens</td>
                            <td><strong>{format_currency(openai_total_cost)}</strong></td>
                            <td>{openai_pct:.1f}%</td>
                        </tr>
                        <tr>
                            <td><strong>🎙️ Text-to-Speech</strong><br><span class="badge badge-success">{TTS_SERVICE}</span></td>
                            <td>{TTS_VOICE}</td>
                            <td>{total_chars:,} characters</td>
                            <td><strong>{format_currency(tts_cost)}</strong></td>
                            <td>{tts_pct:.1f}%</td>
                        </tr>
                        <tr>
                            <td><strong>🎥 Video Rendering</strong><br><span class="badge badge-warning">{RENDER_LOCATION}</span></td>
                            <td>Compute processing</td>
                            <td>{format_duration(render.get("total_render_time_sec", 0))}</td>
                            <td><strong>{format_currency(compute_cost)}</strong></td>
                            <td>{compute_pct:.1f}%</td>
                        </tr>
                        <tr>
                            <td><strong>💾 Storage</strong><br><span class="badge badge-info">{STORAGE_LOCATION}</span></td>
                            <td>Video file storage</td>
                            <td>{sum(r["file_size_mb"] for r in renders):.1f} MB</td>
                            <td><strong>{format_currency(storage_cost)}</strong></td>
                            <td>{storage_pct:.1f}%</td>
                        </tr>
                        <tr style="background: #f0f0f0; font-weight: bold;">
                            <td colspan="3">TOTAL</td>
                            <td><strong>{format_currency(grand_total)}</strong></td>
                            <td>100%</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            
            <!-- Video Quality Comparison -->
            <div class="section">
                <h2>🎬 Video Quality Performance & Costs</h2>
                <div class="chart-container">
                    <canvas id="qualityChart"></canvas>
                </div>
                <table style="margin-top: 30px;">
                    <thead>
                        <tr>
                            <th>Quality</th>
                            <th>Resolution</th>
                            <th>File Size</th>
                            <th>Render Time</th>
                            <th>Total Cost</th>
                            <th>Cost per Minute</th>
                        </tr>
                    </thead>
                    <tbody>
"""
    
    for qd in quality_data:
        html_content += f"""
                        <tr>
                            <td><strong>{qd['quality'].upper()}</strong></td>
                            <td>{qd['resolution']}</td>
                            <td>{qd['file_size']:.1f} MB</td>
                            <td>{format_duration(qd['render_time'])}</td>
                            <td><strong>{format_currency(qd['total_cost'])}</strong></td>
                            <td>{format_currency(qd['cost_per_min'])}/min</td>
                        </tr>
"""
    
    html_content += f"""
                    </tbody>
                </table>
            </div>
            
            <!-- Technical Specifications -->
            <div class="section">
                <h2>⚙️ Technical Specifications</h2>
                <div class="specs-grid">
                    <div class="spec-item">
                        <div class="spec-label">AI Model</div>
                        <div class="spec-value">{OPENAI_MODEL}</div>
                    </div>
                    <div class="spec-item">
                        <div class="spec-label">Input Tokens</div>
                        <div class="spec-value">{openai_input_tokens:,}</div>
                    </div>
                    <div class="spec-item">
                        <div class="spec-label">Output Tokens</div>
                        <div class="spec-value">{openai_output_tokens:,}</div>
                    </div>
                    <div class="spec-item">
                        <div class="spec-label">TTS Voice</div>
                        <div class="spec-value">{TTS_VOICE}</div>
                    </div>
                    <div class="spec-item">
                        <div class="spec-label">Operating System</div>
                        <div class="spec-value">{render.get('machine', {}).get('os', 'N/A')}</div>
                    </div>
                    <div class="spec-item">
                        <div class="spec-label">CPU Cores</div>
                        <div class="spec-value">{render.get('machine', {}).get('cpu_cores', 'N/A')}</div>
                    </div>
                    <div class="spec-item">
                        <div class="spec-label">Composition Type</div>
                        <div class="spec-value">{render.get('composition', 'N/A')}</div>
                    </div>
                    <div class="spec-item">
                        <div class="spec-label">Quality Variants</div>
                        <div class="spec-value">{len(renders)}</div>
                    </div>
                    <div class="spec-item">
                        <div class="spec-label">OpenAI Rate</div>
                        <div class="spec-value">${OPENAI_INPUT_PRICE_PER_1M}/M in</div>
                    </div>
                    <div class="spec-item">
                        <div class="spec-label">TTS Rate</div>
                        <div class="spec-value">${TTS_PRICE_PER_MILLION_CHAR}/M char</div>
                    </div>
                    <div class="spec-item">
                        <div class="spec-label">Compute Rate</div>
                        <div class="spec-value">${COMPUTE_PRICE_PER_HOUR}/hour</div>
                    </div>
                    <div class="spec-item">
                        <div class="spec-label">Storage Rate</div>
                        <div class="spec-value">${STORAGE_PRICE_PER_GB_MONTH}/GB/mo</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <script>
        // Cost Distribution Pie Chart
        const pieCtx = document.getElementById('costPieChart').getContext('2d');
        new Chart(pieCtx, {{
            type: 'doughnut',
            data: {{
                labels: ['AI Generation', 'Text-to-Speech', 'Video Rendering', 'Storage'],
                datasets: [{{
                    data: [{openai_total_cost:.6f}, {tts_cost:.6f}, {compute_cost:.6f}, {storage_cost:.6f}],
                    backgroundColor: ['#667eea', '#38b2ac', '#f6ad55', '#fc8181'],
                    borderWidth: 0
                }}]
            }},
            options: {{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {{
                    legend: {{
                        position: 'bottom',
                        labels: {{ padding: 20, font: {{ size: 12 }} }}
                    }},
                    title: {{
                        display: true,
                        text: 'Cost Distribution',
                        font: {{ size: 16, weight: 'bold' }}
                    }}
                }}
            }}
        }});
        
        // Cost Bar Chart
        const barCtx = document.getElementById('costBarChart').getContext('2d');
        new Chart(barCtx, {{
            type: 'bar',
            data: {{
                labels: ['AI Gen', 'TTS', 'Render', 'Storage'],
                datasets: [{{
                    label: 'Cost (USD)',
                    data: [{openai_total_cost:.6f}, {tts_cost:.6f}, {compute_cost:.6f}, {storage_cost:.6f}],
                    backgroundColor: ['#667eea', '#38b2ac', '#f6ad55', '#fc8181'],
                    borderRadius: 8
                }}]
            }},
            options: {{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {{
                    legend: {{ display: false }},
                    title: {{
                        display: true,
                        text: 'Cost Comparison',
                        font: {{ size: 16, weight: 'bold' }}
                    }}
                }},
                scales: {{
                    y: {{ 
                        beginAtZero: true,
                        ticks: {{
                            callback: function(value) {{
                                return '$' + value.toFixed(4);
                            }}
                        }}
                    }}
                }}
            }}
        }});
        
        // Quality Performance Chart
        const qualityCtx = document.getElementById('qualityChart').getContext('2d');
        new Chart(qualityCtx, {{
            type: 'bar',
            data: {{
                labels: [{', '.join([f'"{qd["quality"].upper()}"' for qd in quality_data])}],
                datasets: [
                    {{
                        label: 'Render Time (sec)',
                        data: [{', '.join([f'{qd["render_time"]:.2f}' for qd in quality_data])}],
                        backgroundColor: '#667eea',
                        yAxisID: 'y',
                        borderRadius: 6
                    }},
                    {{
                        label: 'File Size (MB)',
                        data: [{', '.join([f'{qd["file_size"]:.2f}' for qd in quality_data])}],
                        backgroundColor: '#38b2ac',
                        yAxisID: 'y1',
                        borderRadius: 6
                    }}
                ]
            }},
            options: {{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {{
                    legend: {{ position: 'top' }},
                    title: {{
                        display: true,
                        text: 'Render Performance by Quality',
                        font: {{ size: 16, weight: 'bold' }}
                    }}
                }},
                scales: {{
                    y: {{
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: {{ display: true, text: 'Render Time (seconds)' }}
                    }},
                    y1: {{
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: {{ display: true, text: 'File Size (MB)' }},
                        grid: {{ drawOnChartArea: false }}
                    }}
                }}
            }}
        }});
    </script>
</body>
</html>"""
    
    return html_content


# ======================================================
# MAIN
# ======================================================

def main():
    # Get user input interactively
    openai_input_tokens, openai_output_tokens = get_user_input()
    
    REPORTS_DIR.mkdir(parents=True, exist_ok=True)

    render = load_json(RENDER_METRICS_PATH)
    manifest = load_json(MANIFEST_PATH)

    renders = render.get("renders", [])

    # ==================================================
    # COST CALCULATIONS
    # ==================================================

    # OpenAI
    openai_input_cost = (openai_input_tokens / 1_000_000) * OPENAI_INPUT_PRICE_PER_1M
    openai_output_cost = (openai_output_tokens / 1_000_000) * OPENAI_OUTPUT_PRICE_PER_1M
    openai_total_cost = openai_input_cost + openai_output_cost

    # TTS
    total_chars = sum(
        len(item.get("narration", {}).get("text", ""))
        for item in manifest if isinstance(item, dict)
    )
    tts_cost = (total_chars / 1_000_000) * TTS_PRICE_PER_MILLION_CHAR

    # Rendering
    total_render_time_sec = render.get("total_render_time_sec", 0.0)
    total_video_mb = sum(r["file_size_mb"] for r in renders)
    compute_cost = (total_render_time_sec / 3600) * COMPUTE_PRICE_PER_HOUR
    storage_cost = (total_video_mb / 1024) * STORAGE_PRICE_PER_GB_MONTH

    grand_total = openai_total_cost + tts_cost + compute_cost + storage_cost
    cost_per_video = grand_total / (len(renders) or 1)

    # ==================================================
    # GENERATE CSV REPORT
    # ==================================================

    with CSV_PATH.open("w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)

        # Remove emojis from all CSV rows
        writer.writerow(["VIDEO PRODUCTION COST ANALYSIS"])
        writer.writerow([f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"])
        writer.writerow([f"Run ID: {render.get('run_id', 'N/A')}"])
        writer.writerow([])

        # Executive Summary
        writer.writerow(["EXECUTIVE SUMMARY"])
        writer.writerow(["Metric", "Value"])
        writer.writerow(["Total Project Cost", format_currency(grand_total)])
        writer.writerow(["Cost per Video Quality", format_currency(cost_per_video)])
        writer.writerow(["Total Video Duration", format_duration(renders[0]["duration_sec"] if renders else 0)])
        writer.writerow([])

        # OpenAI Details
        writer.writerow(["OPENAI API DETAILS"])
        writer.writerow(["Component", "Value"])
        writer.writerow(["Model", OPENAI_MODEL])
        writer.writerow(["Purpose", OPENAI_PURPOSE])
        writer.writerow(["Input Tokens", f"{openai_input_tokens:,} tokens"])
        writer.writerow(["Output Tokens", f"{openai_output_tokens:,} tokens"])
        writer.writerow(["Input Cost", format_currency(openai_input_cost)])
        writer.writerow(["Output Cost", format_currency(openai_output_cost)])
        writer.writerow(["Total OpenAI Cost", format_currency(openai_total_cost)])
        writer.writerow([])

        # Cost Breakdown
        writer.writerow(["COST BREAKDOWN BY SERVICE"])
        writer.writerow(["Service", "Details", "Cost (USD)", "% of Total"])

        openai_pct = (openai_total_cost / grand_total * 100) if grand_total > 0 else 0
        tts_pct = (tts_cost / grand_total * 100) if grand_total > 0 else 0
        compute_pct = (compute_cost / grand_total * 100) if grand_total > 0 else 0
        storage_pct = (storage_cost / grand_total * 100) if grand_total > 0 else 0

        writer.writerow([f"{OPENAI_MODEL}", f"{OPENAI_PURPOSE} | Input: {openai_input_tokens:,} tokens | Output: {openai_output_tokens:,} tokens", format_currency(openai_total_cost), f"{openai_pct:.1f}%"])
        writer.writerow([f"TTS ({TTS_SERVICE})", TTS_VOICE, format_currency(tts_cost), f"{tts_pct:.1f}%"])
        writer.writerow([f"Rendering ({RENDER_LOCATION})", "Compute", format_currency(compute_cost), f"{compute_pct:.1f}%"])
        writer.writerow([f"Storage ({STORAGE_LOCATION})", "Video files", format_currency(storage_cost), f"{storage_pct:.1f}%"])
        writer.writerow(["TOTAL", "", format_currency(grand_total), "100%"])
        writer.writerow([])

        # Quality breakdown
        writer.writerow(["VIDEO QUALITY BREAKDOWN"])
        writer.writerow(["Quality", "Resolution", "Duration", "Render Time", "File Size", "Total Cost", "Cost/Min"])

        for r in renders:
            rt = r["render_time_sec"]
            dur = r["duration_sec"]
            size_mb = r["file_size_mb"]
            ratio = rt / total_render_time_sec if total_render_time_sec > 0 else 0
            q_compute = ratio * compute_cost
            q_storage = (size_mb / 1024) * STORAGE_PRICE_PER_GB_MONTH
            q_total = q_compute + q_storage
            q_cost_per_min = (q_total / dur) * 60 if dur > 0 else 0

            writer.writerow([
                r["quality"].upper(),
                f"{r['width']}x{r['height']}",
                format_duration(dur),
                format_duration(rt),
                f"{size_mb:.1f} MB",
                format_currency(q_total),
                format_currency(q_cost_per_min)
            ])

    # ==================================================
    # GENERATE HTML REPORT WITH CHARTS
    # ==================================================
    
    html_content = generate_html_report(
        render, manifest, renders, openai_input_tokens, openai_output_tokens,
        openai_total_cost, tts_cost, compute_cost, storage_cost,
        total_chars, grand_total
    )
    
    HTML_PATH.write_text(html_content, encoding="utf-8")

    print(f"✅ CSV Report generated: {CSV_PATH}")
    print(f"✅ HTML Report with charts generated: {HTML_PATH}")
    print(f"\n📊 Total Cost: {format_currency(grand_total)}")
    print(f"🎬 Open {HTML_PATH.name} in your browser for beautiful visualizations!")


if __name__ == "__main__":
    main()
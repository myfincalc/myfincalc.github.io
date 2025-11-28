// graph.js
// Handles bar chart visualizations using Chart.js

// Ensure Chart.js is loaded in HTML before this script

const vfcGraph = {
  charts: {},

  /**
   * Renders a bar chart in a target canvas element.
   * @param {string} canvasId - The HTML canvas element ID.
   * @param {string[]} labels - X-axis labels.
   * @param {number[]} data - Values.
   * @param {string} title - Chart title.
   */
  renderBarChart(canvasId, labels, data, title = "Chart") {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    // Destroy previous chart if exists
    if (this.charts[canvasId]) {
      this.charts[canvasId].destroy();
    }

    this.charts[canvasId] = new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: title,
            data,
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });
  },

  /**
   * Common quick graph generator for Cashflow
   * @param {Object} dataObj - { inflow, outflow, disposable }
   */
  renderCashflowChart(dataObj) {
    const labels = ["Inflow", "Outflow", "Disposable Income"];
    const data = [dataObj.inflow, dataObj.outflow, dataObj.disposable];
    this.renderBarChart("cashflowChart", labels, data, "Cashflow Summary");
  },

  /**
   * Graph for Loan EMI comparison
   * @param {number} disposable
   * @param {number} emi
   */
  renderEligibilityChart(disposable, emi) {
    const labels = ["Disposable Income", "EMI Offered"];
    const data = [disposable, emi];
    this.renderBarChart("eligibilityChart", labels, data, "Loan Eligibility");
  },
};

// Auto expose
window.vfcGraph = vfcGraph;
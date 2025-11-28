// export.js
// Exports for VijayFinCalc — creates PDF and Excel reports with IST timestamp and GPS location

// Helper: sanitize filename
function sanitizeFilename(name){
  return name.replace(/[^a-z0-9_\-]/gi, '_');
}

// Helper: IST timestamp as YYYY-MM-DD_HH-MM-SS
function istTimestamp(){
  const now = new Date();
  const opts = { timeZone: 'Asia/Kolkata' };
  const year = now.toLocaleString('en-US', { ...opts, year: 'numeric' });
  const month = now.toLocaleString('en-US', { ...opts, month: '2-digit' });
  const day = now.toLocaleString('en-US', { ...opts, day: '2-digit' });
  const hours = now.toLocaleString('en-US', { ...opts, hour: '2-digit', hour12:false });
  const minutes = now.toLocaleString('en-US', { ...opts, minute: '2-digit' });
  const seconds = now.toLocaleString('en-US', { ...opts, second: '2-digit' });
  return `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;
}

// Helper: get geo location (returns {lat,lon} or null)
function getGeo(){
  return new Promise(resolve => {
    if(!navigator.geolocation) return resolve(null);
    navigator.geolocation.getCurrentPosition(pos=>{
      resolve({lat: pos.coords.latitude, lon: pos.coords.longitude});
    }, err=>{
      resolve(null);
    }, { enableHighAccuracy:true, timeout:8000 });
  });
}

// Build a clean report DOM (used for PDF rendering)
function buildReportDOM({type, customerName, data, meta}){
  const wrapper = document.createElement('div');
  wrapper.style.width = '800px';
  wrapper.style.padding = '18px';
  wrapper.style.background = '#ffffff';
  wrapper.style.color = '#111';
  wrapper.style.fontFamily = 'Inter, Arial, sans-serif';
  wrapper.style.fontSize = '13px';

  const header = document.createElement('div');
  header.style.display = 'flex';
  header.style.justifyContent = 'space-between';
  header.style.alignItems = 'flex-start';
  header.style.marginBottom = '12px';

  header.innerHTML = `
    <div>
      <h2 style="margin:0">VijayFinCalc — ${type === 'emi' ? 'EMI Report' : 'Cashflow Report'}</h2>
      <div style="font-size:12px;color:#444">Prepared by: VijayFinCalc (website)</div>
    </div>
    <div style="text-align:right;font-size:12px;color:#444">
      Prepared for: <strong>${customerName}</strong><br/>
      Date & Time (IST): ${meta.ist}<br/>
      Location: ${meta.geo || 'Location not available'}
    </div>
  `;

  wrapper.appendChild(header);
  const hr = document.createElement('hr'); hr.style.border='none'; hr.style.borderTop='1px solid #eee'; hr.style.margin='8px 0'; wrapper.appendChild(hr);

  const body = document.createElement('div'); body.style.color='#222';

  if(type === 'emi'){
    const table = document.createElement('table'); table.style.width='100%'; table.style.borderCollapse='collapse';
    const rows = [
      ['Principal', data.loanAmount],
      ['Yearly Rate (%)', data.annualRate],
      ['Tenure (months)', data.months],
      ['Per-day interest', data.perDayInterest],
      ['Broken period (days)', data.brokenDays],
      ['Broken period interest', data.brokenInterest],
      ['Monthly EMI', data.emi],
      ['Total Interest', data.totalInterest],
      ['Total Amount (Principal + Interest)', data.totalAmount]
    ];
    let html = '<tbody>' + rows.map(r=>`<tr><td style="padding:6px;border:1px solid #eee">${r[0]}</td><td style="padding:6px;border:1px solid #eee">${r[1]}</td></tr>`).join('') + '</tbody>';
    table.innerHTML = html; body.appendChild(table);
  } else {
    // cashflow
    const table = document.createElement('table'); table.style.width='100%'; table.style.borderCollapse='collapse';
    const inflow = data.inflows || [];
    const outflow = data.outflows || [];
    let html = '<thead><tr><th style="padding:6px;border:1px solid #eee">Type</th><th style="padding:6px;border:1px solid #eee">Description</th><th style="padding:6px;border:1px solid #eee">Amount (₹)</th></tr></thead><tbody>';
    inflow.forEach(i=>{ html += `<tr><td style="padding:6px;border:1px solid #eee">Inflow</td><td style="padding:6px;border:1px solid #eee">${i.note||''}</td><td style="padding:6px;border:1px solid #eee">${i.amount}</td></tr>`; });
    outflow.forEach(o=>{ html += `<tr><td style="padding:6px;border:1px solid #eee">Outflow</td><td style="padding:6px;border:1px solid #eee">${o.note||''}</td><td style="padding:6px;border:1px solid #eee">${o.amount}</td></tr>`; });
    html += `</tbody>`;
    table.innerHTML = html; body.appendChild(table);

    const summary = document.createElement('div'); summary.style.marginTop='12px'; summary.innerHTML = `
      <div style="display:flex;justify-content:space-between;margin-top:8px">
        <div><strong>Total Inflow</strong><div>₹${data.totalInflow}</div></div>
        <div><strong>Total Outflow</strong><div>₹${data.totalOutflow}</div></div>
        <div><strong>Disposable</strong><div>₹${data.netCashflow}</div></div>
      </div>
    `;
    body.appendChild(summary);
  }

  wrapper.appendChild(body);
  const footer = document.createElement('div'); footer.style.marginTop='18px'; footer.style.display='flex'; footer.style.justifyContent='space-between'; footer.style.alignItems='center';
  footer.innerHTML = `<div style="font-size:13px;color:#333">Best of luck!</div><div style="text-align:right"><div style="font-size:13px;color:#333">Signature</div><div style="font-weight:700;color:#111">VijayFinCalc</div></div>`;
  wrapper.appendChild(footer);
  return wrapper;
}

async function exportEMIReport(emiData){
  const customerInput = document.getElementById('customerName') || document.getElementById('customer-name');
  const customerName = (customerInput && customerInput.value.trim()) || 'Customer';
  const geo = await getGeo();
  const meta = { ist: istTimestamp(), geo: geo ? `Lat: ${geo.lat.toFixed(5)}, Lon: ${geo.lon.toFixed(5)}` : null };

  // prepare data for table
  const data = {
    loanAmount: emiData.loanAmount,
    annualRate: emiData.annualRate,
    months: emiData.months,
    emi: emiData.emi,
    totalInterest: emiData.totalInterest,
    totalAmount: emiData.totalAmount,
    brokenDays: emiData.brokenDays,
    brokenInterest: emiData.brokenInterest,
    perDayInterest: ((emiData.loanAmount * emiData.annualRate / 100) / 365).toFixed(2)
  };

  // build DOM and render to canvas
  const reportDOM = buildReportDOM({type:'emi', customerName, data, meta});
  document.body.appendChild(reportDOM);
  // render
  await html2canvas(reportDOM, { scale: 2 });
  const canvas = await html2canvas(reportDOM, { scale: 2 });
  const imgData = canvas.toDataURL('image/png');
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: [canvas.width, canvas.height] });
  pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);

  const filename = `${sanitizeFilename(customerName)}_Report_${istTimestamp()}.pdf`;
  pdf.save(filename);
  reportDOM.remove();

  // also export Excel summary
  try{
    const sheet = [{
      'Prepared By':'VijayFinCalc', 'Prepared For':customerName, 'Date (IST)':meta.ist, 'Location':meta.geo || 'Location not available'
    },{
      'Principal (₹)': data.loanAmount, 'Yearly Rate (%)':data.annualRate, 'Tenure (months)':data.months
    },{
      'Monthly EMI (₹)': data.emi, 'Total Interest (₹)': data.totalInterest, 'Total Amount (₹)': data.totalAmount
    },{
      'Broken Days': data.brokenDays, 'Broken Interest (₹)': data.brokenInterest, 'Per Day Interest (₹)': data.perDayInterest
    }];
    const ws = XLSX.utils.json_to_sheet(sheet);
    const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, 'EMI_Report');
    XLSX.writeFile(wb, `${sanitizeFilename(customerName)}_Report_${istTimestamp()}.xlsx`);
  }catch(e){ console.warn('XLSX export failed', e); }
}

async function exportCashflowReport(cashData){
  // cashData should contain inflows: [{note,amount}], outflows: [{note,amount}]
  const customerInput = document.getElementById('customerName') || document.getElementById('customer-name');
  const customerName = (customerInput && customerInput.value.trim()) || 'Customer';
  const geo = await getGeo();
  const meta = { ist: istTimestamp(), geo: geo ? `Lat: ${geo.lat.toFixed(5)}, Lon: ${geo.lon.toFixed(5)}` : null };

  const totals = {
    totalInflow: (cashData.inflows||[]).reduce((s,i)=>s+Number(i.amount||0),0),
    totalOutflow: (cashData.outflows||[]).reduce((s,i)=>s+Number(i.amount||0),0),
  };
  totals.netCashflow = totals.totalInflow - totals.totalOutflow;

  const data = { inflows: cashData.inflows||[], outflows: cashData.outflows||[], ...totals };
  const reportDOM = buildReportDOM({type:'cashflow', customerName, data, meta});
  document.body.appendChild(reportDOM);
  const canvas = await html2canvas(reportDOM, { scale: 2 });
  const imgData = canvas.toDataURL('image/png');
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: [canvas.width, canvas.height] });
  pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
  const filename = `${sanitizeFilename(customerName)}_Report_${istTimestamp()}.pdf`;
  pdf.save(filename);
  reportDOM.remove();

  // XLSX
  try{
    const rows = [];
    (cashData.inflows||[]).forEach(i=>rows.push({Type:'Inflow', Description: i.note||'', Amount: i.amount}));
    (cashData.outflows||[]).forEach(o=>rows.push({Type:'Outflow', Description: o.note||'', Amount: o.amount}));
    rows.push({Type:'', Description:'Total Inflow', Amount: totals.totalInflow});
    rows.push({Type:'', Description:'Total Outflow', Amount: totals.totalOutflow});
    rows.push({Type:'', Description:'Disposable', Amount: totals.netCashflow});
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, 'Cashflow_Report');
    XLSX.writeFile(wb, `${sanitizeFilename(customerName)}_Report_${istTimestamp()}.xlsx`);
  }catch(e){ console.warn('XLSX export failed', e); }
}

// Public helper used by other scripts
window.vfcExport = {
  exportEMIReport,
  exportCashflowReport,
  getGeo
};
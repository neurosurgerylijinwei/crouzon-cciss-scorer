/**
 * CCISS 克鲁宗综合征评分工具（临床医师版）
 */

const STORAGE_KEY = "cciss-scorer-clinical-v1";

const DIMENSIONS = [
  {
    code: "A",
    name: "颅缝 / 颅腔 / 颅内",
    short: "颅腔颅内",
    redFlag: true,
    anchors: {
      0: "无颅缝相关颅腔/颅底异常；无颅内压或脑脊液循环问题证据。",
      1: "单缝或轻度多缝受累，或颅腔容积轻度低于年龄/性别参考；无明确功能损害。",
      2: "多缝明显受累、颅腔容积明显偏低、颅底异常或影像提示颅内压风险，但尚无明确功能损害。",
      3: "有视乳头水肿/客观颅内压增高，或进行性脑室、Chiari/脊髓空洞等并需要主动处理。",
      4: "进行性颅内压增高伴视功能或神经功能损害，或需要紧急减压/脑脊液分流等处理。",
    },
    evidenceHint: "可选：影像/眼底/ICP 要点",
  },
  {
    code: "B",
    name: "眼眶 / 视功能",
    short: "眼眶视功能",
    redFlag: true,
    anchors: {
      0: "眼睑闭合、角膜、视力/眼底和眼球运动无明显异常。",
      1: "轻度眼球突出或眶容积/眶口异常；可完全闭眼，视功能稳定。",
      2: "明显眼球突出、斜视/屈光或弱视风险，或闭眼接近困难；尚无角膜损害。",
      3: "眼睑闭合不全、暴露性角膜病变，或有客观视力/视野/OCT/眼底异常。",
      4: "视神经受压/水肿、严重角膜损害或快速进展的视功能威胁，需要紧急保护。",
    },
    evidenceHint: "可选：突出/闭合/角膜/视力要点",
  },
  {
    code: "C",
    name: "中面部 / 咬合",
    short: "中面部咬合",
    redFlag: false,
    anchors: {
      0: "中面部投影接近年龄/性别参考；咬合、进食和发音无明显问题。",
      1: "轻度骨性或软组织后缩；无明显咬合和功能影响。",
      2: "明确中面部后缩、反颌或咬合异常，伴轻度咀嚼、进食或发音影响。",
      3: "明显后缩伴中重度咬合异常，或进食、咀嚼、发音受到明确影响。",
      4: "极重度后缩伴严重面部功能障碍、反复误吸/进食困难或需要复杂中面部重建。",
    },
    evidenceHint: "可选：后缩/咬合/进食/发音要点",
  },
  {
    code: "D",
    name: "气道 / 睡眠",
    short: "气道睡眠",
    redFlag: true,
    anchors: {
      0: "无持续打鼾或呼吸暂停；PSG oAHI ≤1 次/小时，或专科评估无气道异常。",
      1: "持续打鼾/上气道症状，或轻度影像狭窄；PSG oAHI 1–<5 次/小时。",
      2: "PSG oAHI 5–<10 次/小时，或多平面气道狭窄并有明显睡眠症状/氧减低。",
      3: "PSG oAHI ≥10 次/小时，或有明显低氧/低通气并需要积极气道治疗评估。",
      4: "低通气、呼吸衰竭、严重持续低氧，或需要无创/有创气道支持、气管切开等处理。",
    },
    evidenceHint: "可选：打鼾 / oAHI / 血氧要点",
  },
  {
    code: "E",
    name: "听力 / 耳鼻咽喉",
    short: "听力耳鼻喉",
    redFlag: false,
    anchors: {
      0: "听力学正常；无反复中耳炎或耳鼻咽喉功能影响。",
      1: "单耳轻度听力异常或偶发中耳炎；不影响日常交流。",
      2: "双耳轻度异常、反复中耳炎或需要持续耳鼻咽喉治疗。",
      3: "中度听力下降并影响语言/学习，或明确需要助听干预。",
      4: "重度/极重度听力损失、双侧助听装置/人工耳蜗，或明显交流障碍。",
    },
    evidenceHint: "可选：听力/中耳炎要点",
  },
  {
    code: "F",
    name: "神经发育 / 功能",
    short: "神经发育",
    redFlag: false,
    anchors: {
      0: "运动、语言、认知、行为和日常生活能力与年龄相符；无癫痫。",
      1: "轻度语言/发育或行为问题，暂不影响基本生活和交流。",
      2: "标准化发育/认知结果约低于均值 1–2 个标准差，或需要早期干预/康复支持。",
      3: "中度发育/认知或适应功能受限，明显影响学习、交流或日常活动；或有需治疗的癫痫。",
      4: "重度全面发育障碍、明显神经缺损、难治性癫痫或日常生活高度依赖。",
    },
    evidenceHint: "可选：发育/认知/癫痫要点",
  },
];

const INDICATIONS = [
  { code: "I1", name: "颅内压 / 颅腔容积", desc: "颅腔扩容、颅内压控制或脑保护" },
  { code: "I2", name: "眼眶 / 视功能", desc: "眼眶保护、眼睑闭合、角膜或视神经保护" },
  { code: "I3", name: "中面部 / 咬合", desc: "中面部前移、反颌/咬合或进食发音改善" },
  { code: "I4", name: "气道 / 睡眠", desc: "改善 OSA、低通气、气道狭窄或减少气道支持" },
  { code: "I5", name: "脑积水 / Chiari / 后颅窝", desc: "脑积水、Chiari、脊髓空洞或 CSF 循环处理" },
  { code: "I6", name: "外形 / 修复 / 再次手术", desc: "残余畸形、复发、外形重建或分期修复" },
];

const PROCEDURES = [
  { code: "S1", name: "后颅穹隆 / 后颅窝扩张", desc: "后颅扩容、后颅牵张" },
  { code: "S2", name: "额眶前移 / 额眶重建", desc: "额眶前移、眶上缘重建" },
  { code: "S3", name: "颅穹隆重建 / 颅缝处理", desc: "颅骨重塑、颅缝松解" },
  { code: "S4", name: "Monobloc 前颅面前移", desc: "需注明是否牵张" },
  { code: "S5", name: "Le Fort III 中面部前移", desc: "需注明是否联合颅骨处理" },
  { code: "S6", name: "Le Fort II/I 或其他截骨", desc: "按实际骨切开层面记录" },
  { code: "S7", name: "牵张成骨", desc: "与解剖术式并列编码，如 S5+S7" },
  { code: "S8", name: "脑积水 / Chiari / 气道辅助", desc: "分流、后颅窝减压、气道手术等" },
  { code: "S9", name: "二期 / 修复 / 再次手术", desc: "既往手术后的修复或再干预" },
];

const COMPLEXITY = [
  { code: "I", name: "单区域基础手术", desc: "不能仅按手术时间或输血量判定" },
  { code: "II", name: "单区域复杂或牵张手术", desc: "例如单区域牵张或复杂重建" },
  { code: "III", name: "大型中面部前移", desc: "Monobloc 或 Le Fort III 等" },
  { code: "IV", name: "联合颅面手术", desc: "颅腔/眼眶/中面部联合，或多部位牵张" },
  { code: "V", name: "分期/多次或合并重大辅助问题", desc: "可同时伴气道/分流等辅助处理" },
];

const MISSING_REASONS = [
  { value: "未检查", label: "尚未检查 / 资料缺失" },
  { value: "年龄不适用", label: "年龄尚无法完成该项" },
  { value: "其他", label: "其他" },
];

function $(sel, root = document) {
  return root.querySelector(sel);
}

function $$(sel, root = document) {
  return [...root.querySelectorAll(sel)];
}

function gradeFromTotal(total) {
  if (total == null) return { label: "总分未齐", className: "na" };
  if (total <= 5) return { label: "轻度（0–5）", className: "mild" };
  if (total <= 11) return { label: "中度（6–11）", className: "mod" };
  if (total <= 17) return { label: "重度（12–17）", className: "sev" };
  return { label: "极重度（18–24）", className: "crit" };
}

function computeScores() {
  const scores = {};
  const missing = {};
  const evidence = {};
  let sum = 0;
  let scored = 0;
  const redFlags = [];
  let multiCount = 0;

  for (const dim of DIMENSIONS) {
    const selected = $(`input[name="score_${dim.code}"]:checked`);
    const val = selected ? selected.value : "";
    evidence[dim.code] = $(`#evidence_${dim.code}`)?.value?.trim() || "";
    const miss = $(`#missing_${dim.code}`)?.value || "";

    if (val === "" || val === undefined) {
      scores[dim.code] = null;
      continue;
    }

    if (val === "NA") {
      scores[dim.code] = "NA";
      missing[dim.code] = miss || "未说明";
      continue;
    }

    const n = Number(val);
    scores[dim.code] = n;
    sum += n;
    scored += 1;
    if (dim.redFlag && n === 4) redFlags.push(dim.code);
    if (n >= 2) multiCount += 1;
  }

  const complete = scored === 6 && Object.values(scores).every((v) => typeof v === "number");
  return {
    scores,
    missing,
    evidence,
    scored,
    total: complete ? sum : null,
    grade: gradeFromTotal(complete ? sum : null),
    redFlags,
    multiSystem: multiCount >= 3,
    complete,
  };
}

function renderDimensions() {
  const root = $("#dimensions");
  root.innerHTML = DIMENSIONS.map((dim) => {
    const opts = [0, 1, 2, 3, 4]
      .map(
        (n) => `
        <label class="score-opt">
          <input type="radio" name="score_${dim.code}" value="${n}" />
          <span><strong>${n}</strong>分</span>
        </label>`
      )
      .join("");

    const missingOpts = MISSING_REASONS.map(
      (m) => `<option value="${m.value}">${m.label}</option>`
    ).join("");

    return `
      <article class="dim-card" id="card_${dim.code}" data-code="${dim.code}">
        <div class="dim-top">
          <div>
            <h3 class="dim-title"><span class="dim-code">${dim.code}</span>${dim.name}</h3>
            <p class="dim-desc">0–4 分；取最高有证据等级${dim.redFlag ? " · 达 4 分时提示红旗" : ""}</p>
          </div>
        </div>
        <div class="score-options">
          ${opts}
          <label class="score-opt na">
            <input type="radio" name="score_${dim.code}" value="NA" />
            <span><strong>NA</strong>缺失</span>
          </label>
        </div>
        <p class="anchor-preview" id="anchor_${dim.code}">选择分数后显示对应标准</p>
        <label>简要依据（可选）
          <textarea id="evidence_${dim.code}" rows="2" placeholder="${dim.evidenceHint}"></textarea>
        </label>
        <label class="missing-reason" id="missing_wrap_${dim.code}">缺失原因
          <select id="missing_${dim.code}">
            <option value="">请选择</option>
            ${missingOpts}
          </select>
        </label>
      </article>`;
  }).join("");

  for (const dim of DIMENSIONS) {
    $$(`input[name="score_${dim.code}"]`).forEach((input) => {
      input.addEventListener("change", () => {
        updateAnchorPreview(dim.code);
        updateLive();
      });
    });
    $(`#evidence_${dim.code}`).addEventListener("input", updateLive);
    $(`#missing_${dim.code}`).addEventListener("change", updateLive);
  }
}

function updateAnchorPreview(code) {
  const dim = DIMENSIONS.find((d) => d.code === code);
  const selected = $(`input[name="score_${code}"]:checked`);
  const preview = $(`#anchor_${code}`);
  const missWrap = $(`#missing_wrap_${code}`);
  const card = $(`#card_${code}`);

  if (!selected) {
    preview.textContent = "选择分数后显示对应标准";
    missWrap.classList.remove("show");
    card.classList.remove("flagged");
    return;
  }

  if (selected.value === "NA") {
    preview.textContent = "资料缺失记 NA，不记 0。有缺失时总分暂不计算。";
    missWrap.classList.add("show");
    card.classList.remove("flagged");
    return;
  }

  missWrap.classList.remove("show");
  const n = Number(selected.value);
  preview.textContent = dim.anchors[n];
  card.classList.toggle("flagged", dim.redFlag && n === 4);
}

function renderChoiceGroup(containerId, items, name, multi = false) {
  const root = $(`#${containerId}`);
  if (!root) return;
  root.innerHTML = items
    .map(
      (item) => `
      <label class="choice">
        <input type="${multi ? "checkbox" : "radio"}" name="${name}" value="${item.code}" />
        <span>
          <span class="code">${item.code}</span>${item.name}
          <span class="meta">${item.desc}</span>
        </span>
      </label>`
    )
    .join("");

  $$(`#${containerId} input`).forEach((el) => el.addEventListener("change", updateLive));
}

function renderAnchors() {
  $("#anchor-tables").innerHTML = DIMENSIONS.map((dim) => {
    const rows = [0, 1, 2, 3, 4]
      .map((n) => `<tr><th>${n} 分</th><td>${dim.anchors[n]}</td></tr>`)
      .join("");
    return `
      <table class="anchor-table">
        <caption>${dim.code} · ${dim.name}</caption>
        <tbody>${rows}</tbody>
      </table>`;
  }).join("");
}

function getCheckedValues(name) {
  return $$(`input[name="${name}"]:checked`).map((el) => el.value);
}

function collectState() {
  const result = computeScores();
  return {
    version: "CCISS-clinical-v1",
    exportedAt: new Date().toISOString(),
    patient: {
      label: $("#patient_label").value.trim(),
      sex: $("#sex").value,
      age_years: $("#age_years").value,
      age_months: $("#age_months").value,
      assess_date: $("#assess_date").value,
    },
    cciss: {
      scores: result.scores,
      missing_reasons: result.missing,
      evidence: result.evidence,
      scorable_dimensions: result.scored,
      total: result.total,
      grade: result.grade.label,
      red_flags: result.redFlags,
      multi_system: result.multiSystem,
      complete: result.complete,
      notes: $("#clinical_notes").value.trim(),
    },
    surgery: {
      indication_primary: getCheckedValues("indication_primary")[0] || "",
      procedure_codes: getCheckedValues("procedure_codes"),
      complexity_grade: getCheckedValues("complexity_grade")[0] || "",
      distraction: $("#distraction").value,
      procedure_text: $("#procedure_text").value.trim(),
    },
  };
}

function applyState(state) {
  if (!state) return;
  const p = state.patient || {};
  $("#patient_label").value = p.label || p.patient_id || p.hospital_no || "";
  $("#sex").value = p.sex || "";
  $("#age_years").value = p.age_years || "";
  $("#age_months").value = p.age_months || "";
  $("#assess_date").value = p.assess_date || p.t0_date || "";

  const c = state.cciss || {};
  for (const dim of DIMENSIONS) {
    const val = c.scores?.[dim.code];
    if (val === null || val === undefined || val === "") continue;
    const input = $(`input[name="score_${dim.code}"][value="${val}"]`);
    if (input) input.checked = true;
    if (c.evidence?.[dim.code]) $(`#evidence_${dim.code}`).value = c.evidence[dim.code];
    if (c.missing_reasons?.[dim.code]) $(`#missing_${dim.code}`).value = c.missing_reasons[dim.code];
    updateAnchorPreview(dim.code);
  }
  $("#clinical_notes").value = c.notes || "";

  const s = state.surgery || {};
  if (s.indication_primary) {
    const el = $(`input[name="indication_primary"][value="${s.indication_primary}"]`);
    if (el) el.checked = true;
  }
  (s.procedure_codes || []).forEach((code) => {
    const el = $(`input[name="procedure_codes"][value="${code}"]`);
    if (el) el.checked = true;
  });
  if (s.complexity_grade) {
    const el = $(`input[name="complexity_grade"][value="${s.complexity_grade}"]`);
    if (el) el.checked = true;
  }
  $("#distraction").value = s.distraction || "无";
  $("#procedure_text").value = s.procedure_text || "";
}

function updateLive() {
  const r = computeScores();
  const totalEl = $("#live-total");
  totalEl.textContent = r.total == null ? "—" : String(r.total);
  totalEl.style.color = r.total == null ? "#64748b" : "";

  $("#live-scorable").textContent = `${r.scored} / 6`;
  $("#live-grade").innerHTML = `<span class="badge ${r.grade.className}">${r.grade.label}</span>`;

  if (r.redFlags.length) {
    $("#live-redflag").innerHTML = `<span class="badge crit">是：${r.redFlags.map((c) => c + "4").join("、")}</span>`;
  } else {
    $("#live-redflag").textContent = "否";
  }

  $("#live-multisystem").textContent = r.multiSystem ? "是（≥3 维 ≥2 分）" : "否";

  $("#live-dims").innerHTML = DIMENSIONS.map((dim) => {
    const v = r.scores[dim.code];
    let cls = "pill";
    let text = "—";
    if (v === "NA") {
      cls += " na";
      text = "NA";
    } else if (typeof v === "number") {
      text = String(v);
      cls += dim.redFlag && v === 4 ? " hot" : " ok";
    }
    return `<div class="${cls}">${dim.code}<span class="v">${text}</span></div>`;
  }).join("");

  let note = "请按 A→F 逐项评分。";
  if (r.scored > 0 && !r.complete) {
    const missingDims = DIMENSIONS.filter((d) => r.scores[d.code] == null || r.scores[d.code] === "NA")
      .map((d) => d.code)
      .join("、");
    note = `尚有维度未完成或为 NA（${missingDims}）。六项齐全后才会计算总分。`;
  } else if (r.complete && r.redFlags.length) {
    note = "总分已出，但存在红旗维度（A/B/D=4），即使总分不高也需单独关注。";
  } else if (r.complete) {
    note = "六维评分已完成，可在「结果汇总」查看或打印。";
  }
  $("#live-note").textContent = note;
  renderSummary(r);
}

function renderSummary(r) {
  const state = collectState();
  const p = state.patient;
  const surg = state.surgery;
  const ageText = [p.age_years !== "" ? `${p.age_years}岁` : "", p.age_months !== "" ? `${p.age_months}月` : ""]
    .filter(Boolean)
    .join("");

  const scoreRows = DIMENSIONS.map((dim) => {
    const v = r.scores[dim.code];
    const display =
      v == null ? "未填" : v === "NA" ? `NA（${r.missing[dim.code] || "原因未填"}）` : `${v} / 4`;
    return `<div><dt>${dim.code} ${dim.short}</dt><dd>${display}</dd></div>`;
  }).join("");

  const hasSurgery = surg.indication_primary || (surg.procedure_codes || []).length || surg.complexity_grade;

  $("#summary-detail").innerHTML = `
    <div class="summary-card">
      <h3>患者</h3>
      <dl class="kv">
        <dt>标识</dt><dd>${p.label || "—"}</dd>
        <dt>年龄 / 性别</dt><dd>${[ageText, p.sex].filter(Boolean).join(" / ") || "—"}</dd>
        <dt>评估日期</dt><dd>${p.assess_date || "—"}</dd>
      </dl>
    </div>
    <div class="summary-card">
      <h3>CCISS 评分</h3>
      <dl class="kv">
        ${scoreRows}
        <dt>总分</dt><dd>${r.total == null ? "未齐" : r.total + " / 24"}</dd>
        <dt>严重程度</dt><dd><span class="badge ${r.grade.className}">${r.grade.label}</span></dd>
        <dt>红旗</dt><dd>${r.redFlags.length ? r.redFlags.map((c) => c + "=4").join("、") : "否"}</dd>
        <dt>多系统受累</dt><dd>${r.multiSystem ? "是" : "否"}</dd>
      </dl>
    </div>
    ${
      hasSurgery
        ? `<div class="summary-card">
      <h3>手术分类</h3>
      <dl class="kv">
        <dt>主要指征</dt><dd>${surg.indication_primary || "—"}</dd>
        <dt>术式</dt><dd>${(surg.procedure_codes || []).join(" + ") || "—"}</dd>
        <dt>复杂度</dt><dd>${surg.complexity_grade || "—"}</dd>
        <dt>牵张</dt><dd>${surg.distraction || "—"}</dd>
        <dt>说明</dt><dd>${surg.procedure_text || "—"}</dd>
      </dl>
    </div>`
        : ""
    }`;
}

function setupTabs() {
  $$(".tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      $$(".tab").forEach((t) => {
        t.classList.remove("active");
        t.setAttribute("aria-selected", "false");
      });
      $$(".panel").forEach((p) => p.classList.remove("active"));
      tab.classList.add("active");
      tab.setAttribute("aria-selected", "true");
      $(`#panel-${tab.dataset.tab}`).classList.add("active");
      updateLive();
    });
  });
}

function saveDraft() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(collectState()));
  flashNote("草稿已保存到本机。");
}

function loadDraft() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    applyState(JSON.parse(raw));
  } catch (err) {
    console.warn("无法加载草稿", err);
  }
}

function resetAll() {
  if (!confirm("确定清空当前全部填写内容？")) return;
  localStorage.removeItem(STORAGE_KEY);
  $$("input[type='text'], input[type='number'], input[type='date'], textarea").forEach((el) => {
    el.value = "";
  });
  $$("select").forEach((el) => {
    el.selectedIndex = 0;
  });
  $$("input[type='radio'], input[type='checkbox']").forEach((el) => {
    el.checked = false;
  });
  $("#distraction").value = "无";
  DIMENSIONS.forEach((d) => updateAnchorPreview(d.code));
  updateLive();
  flashNote("已清空。");
}

function exportJson() {
  const state = collectState();
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  const id = state.patient.label || "case";
  a.href = URL.createObjectURL(blob);
  a.download = `CCISS_${id}_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
}

function flashNote(text) {
  const el = $("#live-note");
  el.textContent = text;
  setTimeout(() => updateLive(), 1600);
}

function bindInputs() {
  ["#patient_label", "#sex", "#age_years", "#age_months", "#assess_date", "#clinical_notes", "#distraction", "#procedure_text"].forEach(
    (sel) => {
      const el = $(sel);
      if (!el) return;
      el.addEventListener("input", updateLive);
      el.addEventListener("change", updateLive);
    }
  );
}

function init() {
  renderDimensions();
  renderChoiceGroup("indication-primary", INDICATIONS, "indication_primary", false);
  renderChoiceGroup("procedure-codes", PROCEDURES, "procedure_codes", true);
  renderChoiceGroup("complexity-grade", COMPLEXITY, "complexity_grade", false);
  renderAnchors();
  setupTabs();
  bindInputs();

  $("#btn-save").addEventListener("click", saveDraft);
  $("#btn-export").addEventListener("click", exportJson);
  $("#btn-print").addEventListener("click", () => window.print());
  $("#btn-reset").addEventListener("click", resetAll);

  if (!$("#assess_date").value) {
    $("#assess_date").value = new Date().toISOString().slice(0, 10);
  }

  loadDraft();
  updateLive();
}

document.addEventListener("DOMContentLoaded", init);

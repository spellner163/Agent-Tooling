import type { Estate } from "../lib/types";

/* Synthetic Contoso Finance estate. 3 of the 214 flows are shown in full; the summary block carries the estate-wide counts.
   Never real customer data. The model output (descriptions, claims, agents) is scripted. */
export const ESTATE: Estate = {
  name: "Contoso Finance · PAD",
  flows: [
    { id: "f1", name: "AP Invoice Posting", kind: "flow", migrated: true, runs90: 412, runs12m: 1630, hours12m: 680, successRate: 0.93, trigger: "Scheduled, every 30 min", lastRun: "2026-10-09 06:30" },
    { id: "f2", name: "Vendor Master Sync", kind: "flow", migrated: true, runs90: 61, runs12m: 240, hours12m: 32, successRate: 0.98, trigger: "Scheduled, nightly", lastRun: "2026-10-09 01:00" },
    { id: "f3", name: "Get Open PO Balance", kind: "flow", migrated: false, runs90: 870, runs12m: 2900, hours12m: 15, successRate: 0.99, trigger: "Called from cloud flow", lastRun: "2026-10-09 09:12" },
  ],
  // One row per subflow. tree = the subflow plus everything it calls (ids). hidden = reason or null. wireNow = ready to connect.
  components: [
    // ---------- f1: AP Invoice Posting ----------
    { id: "c1", flow: "f1", name: "Main", kind: "flow", tree: ["c1","c2","c3","c20","c21","c22","c23","c24","c25"], inputs: [], outputs: [], hiddenInputs: [], configInputs: ["SAP_Credential","TSuite_API_Key"], apps: ["SAP (UI)","HTTP","Excel","Work queues"], actions: 976, branches: 140, shims: 28, guards: 96, todos: 31, hidden: null, blockers: [
      { name: "No outputs", level: "warn", why: "the flow declares no output variables" },
      { name: "Needs an attended machine", level: "info", why: "312 UI actions" },
      { name: "Too slow to call synchronously", level: "warn", why: "a run can take 41 minutes (whole batch, includes queue wait)" }],
      effort: { actions: 0, inputs: 10, apps: 5, sensitive: 5, undeclared: 10, exception: 5 }, fp: "9b1c…", family: null, wireNow: true, writes: true, role: "The whole batch: dispatcher, performer, report." },
    { id: "c2", flow: "f1", name: "Dispatcher", kind: "local subflow", tree: ["c2","c10","c15","c16","c22","c23"], inputs: ["in_Config"], outputs: ["out_QueueItems"], hiddenInputs: [], configInputs: ["TSuite_API_Key","SharePoint_Credential"], apps: ["HTTP","Excel","Work queues"], actions: 396, branches: 58, shims: 9, guards: 4, todos: 12, hidden: "batch loop", hiddenWhy: "The loop that drives the batch", blockers: [], effort: { actions: 0, inputs: 10, apps: 10, sensitive: 5, undeclared: 10, exception: 5 }, fp: "4e77…", family: null },
    { id: "c3", flow: "f1", name: "Performer", kind: "local subflow", tree: ["c3","c4","c24","c25","c21"], inputs: ["in_ConfigDictionary"], outputs: [], hiddenInputs: [], configInputs: [], apps: ["SAP (UI)","HTTP","Work queues"], actions: 505, branches: 72, shims: 6, guards: 2, todos: 7, hidden: "batch loop", hiddenWhy: "The loop that works through the queue", blockers: [], effort: { actions: 0, inputs: 10, apps: 10, sensitive: 5, undeclared: 10, exception: 5 }, fp: "c0a1…", family: null },
    { id: "c4", flow: "f1", name: "Post Invoice to SAP", kind: "local subflow", tree: ["c4","c5","c6","c7","c8","c9","c11","c12","c21"], inputs: ["in_TransactionItem","in_Config","in_dt_POTracker","in_dt_SupplierList"], outputs: ["out_ResultDB","out_ResultTSuite","out_ResultDetail"], hiddenInputs: [], configInputs: ["SAP_Credential"], apps: ["SAP (UI)"], actions: 307, branches: 44, shims: 11, guards: 7, todos: 9, hidden: null, blockers: [
      { name: "Structured input", level: "warn", why: "in_TransactionItem is a queue item object; in_dt_POTracker and in_dt_SupplierList are tables" },
      { name: "Needs an attended machine", level: "info", why: "188 UI actions" }],
      effort: { actions: 0, inputs: 7, apps: 15, sensitive: 5, undeclared: 10, exception: 5 }, fp: "7d20…", family: null, wireNow: false, writes: true, selfContained: true,
      description: "Logs into SAP and posts one approved PO invoice in MIRO: switches company code, enters header data and PO numbers, checks the vendor and the balance, selects line items, simulates and posts, reads back the document number. Does not fetch the invoice from TSuite and does not update TSuite.",
      claims: [{type:"app", value:"SAP MIRO", ref:"apps[SAP (UI)]", ok:true},{type:"changes", value:"posts an invoice document", ref:"actions[SAP.ClickSapGuiElement tbar[0]/btn[11]]", ok:true},{type:"output", value:"out_ResultTSuite", ref:"outputs[out_ResultTSuite]", ok:true},{type:"reads", value:"vendor master", ref:"", ok:false}] },
    { id: "c5", flow: "f1", name: "Switch Company Code", kind: "local subflow", tree: ["c5"], inputs: ["in_EntityCode"], outputs: [], hiddenInputs: ["GLOBAL.SapInstance"], configInputs: [], apps: ["SAP (UI)"], actions: 21, branches: 6, shims: 0, guards: 1, todos: 0, hidden: null, blockers: [
      { name: "No outputs", level: "warn", why: "nothing comes back to the agent" },
      { name: "Needs an attended machine", level: "info", why: "12 UI actions" },
      { name: "Depends on the parent's app state", level: "prep", why: "uses GLOBAL.SapInstance, no login or attach inside" },
      { name: "Starts mid-screen", level: "prep", why: "SAP actions but no launch, attach, focus or /n transaction in its tree" }],
      effort: { actions: 10, inputs: 10, apps: 15, sensitive: 5, undeclared: 10, exception: 5 }, fp: "a3f9…", family: null, step: true, readOnly: true },
    { id: "c6", flow: "f1", name: "Enter Invoice Header", kind: "local subflow", tree: ["c6","c21"], inputs: ["in_Currency","in_InvoiceDate","in_Reference","in_PostingDate","in_Amount","in_TaxAmount","in_TaxCode","in_Text"], outputs: [], hiddenInputs: ["GLOBAL.SapInstance"], configInputs: [], apps: ["SAP (UI)"], actions: 24, branches: 5, shims: 0, guards: 8, todos: 2, hidden: null, blockers: [
      { name: "No outputs", level: "warn", why: "nothing comes back to the agent" },
      { name: "Needs an attended machine", level: "info", why: "14 UI actions" },
      { name: "Depends on the parent's app state", level: "prep", why: "uses GLOBAL.SapInstance" },
      { name: "Starts mid-screen", level: "prep", why: "assumes MIRO is open on the header tab" }],
      effort: { actions: 10, inputs: 4, apps: 15, sensitive: 5, undeclared: 10, exception: 5 }, fp: "b812…", family: null, step: true, writes: true },
    { id: "c7", flow: "f1", name: "Enter PO Numbers", kind: "local subflow", tree: ["c7"], inputs: ["in_listPONumbers","in_listItems","in_Layout"], outputs: [], hiddenInputs: ["GLOBAL.SapInstance"], configInputs: [], apps: ["SAP (UI)"], actions: 31, branches: 9, shims: 0, guards: 3, todos: 4, hidden: null, blockers: [
      { name: "Structured input", level: "warn", why: "in_listPONumbers, in_listItems are lists" },
      { name: "No outputs", level: "warn", why: "nothing comes back to the agent" },
      { name: "Depends on the parent's app state", level: "prep", why: "uses GLOBAL.SapInstance" },
      { name: "Starts mid-screen", level: "prep", why: "assumes MIRO PO reference tab" }],
      effort: { actions: 10, inputs: 7, apps: 15, sensitive: 5, undeclared: 10, exception: 5 }, fp: "e5c3…", family: null, step: true, writes: true },
    { id: "c8", flow: "f1", name: "Check Document Balance", kind: "local subflow", tree: ["c8"], inputs: [], outputs: ["out_Balance","out_IsBalanced"], hiddenInputs: ["GLOBAL.SapInstance"], configInputs: [], apps: ["SAP (UI)"], actions: 8, branches: 3, shims: 1, guards: 2, todos: 1, hidden: null, blockers: [
      { name: "Needs an attended machine", level: "info", why: "3 UI actions" },
      { name: "Depends on the parent's app state", level: "prep", why: "uses GLOBAL.SapInstance" },
      { name: "Starts mid-screen", level: "prep", why: "reads a field on the MIRO screen; nothing opens MIRO" }],
      effort: { actions: 10, inputs: 10, apps: 15, sensitive: 5, undeclared: 10, exception: 0 }, fp: "1f4a…", family: null, step: true, readOnly: true,
      description: "Reads the balance field of the invoice on the MIRO screen and returns the amount and whether it balances. Does not change anything." },
    { id: "c9", flow: "f1", name: "Simulate and Post", kind: "local subflow", tree: ["c9","c21"], inputs: ["in_WaitTime"], outputs: [], hiddenInputs: ["GLOBAL.SapInstance"], configInputs: [], apps: ["SAP (UI)"], actions: 26, branches: 9, shims: 0, guards: 1, todos: 2, hidden: null, blockers: [
      { name: "No outputs", level: "warn", why: "nothing comes back to the agent" },
      { name: "Swallowed errors", level: "warn", why: "an On block error handler sets a flag instead of raising the error" },
      { name: "Depends on the parent's app state", level: "prep", why: "uses GLOBAL.SapInstance" },
      { name: "Starts mid-screen", level: "prep", why: "clicks Simulate on whatever screen is open" }],
      effort: { actions: 10, inputs: 10, apps: 15, sensitive: 5, undeclared: 10, exception: 3 }, fp: "90de…", family: null, step: true, writes: true },
    { id: "c10", flow: "f1", name: "Fetch Invoices from TSuite", kind: "local subflow", tree: ["c10"], inputs: ["in_DigitalOrPaper","in_CompanyCodes","in_Status","in_DateFrom","in_DateTo"], outputs: ["out_dt_Invoices","out_dt_LineItems"], hiddenInputs: [], configInputs: ["TSuite_API_Key"], apps: ["HTTP"], actions: 23, branches: 6, shims: 3, guards: 7, todos: 0, hidden: null, blockers: [
      { name: "Swallowed errors", level: "warn", why: "retry loop sets a flag on the third failure" }],
      effort: { actions: 10, inputs: 7, apps: 15, sensitive: 5, undeclared: 10, exception: 3 }, fp: "6c8b…", family: null, readOnly: true, selfContained: true,
      description: "Fetches approved invoices and their line items from the TSuite API for a set of company codes, a status and a date range, as two tables. Does not post or change anything.",
      claims: [{type:"app", value:"HTTP", ref:"apps[HTTP]", ok:true},{type:"reads", value:"TSuite API", ref:"actions[Web.InvokeWebService]", ok:true},{type:"output", value:"out_dt_Invoices", ref:"outputs[out_dt_Invoices]", ok:true}] },
    { id: "c11", flow: "f1", name: "Get Posted Document Number", kind: "local subflow", tree: ["c11","c21"], inputs: ["in_WaitTime"], outputs: ["out_DocumentNo"], hiddenInputs: ["GLOBAL.SapInstance"], configInputs: [], apps: ["SAP (UI)"], actions: 24, branches: 7, shims: 0, guards: 2, todos: 3, hidden: null, blockers: [
      { name: "Needs an attended machine", level: "info", why: "9 UI actions" },
      { name: "Depends on the parent's app state", level: "prep", why: "uses GLOBAL.SapInstance" },
      { name: "Starts mid-screen", level: "prep", why: "reads the status bar after a post; nothing navigates there" }],
      effort: { actions: 10, inputs: 10, apps: 15, sensitive: 5, undeclared: 10, exception: 5 }, fp: "2b67…", family: null, step: true, readOnly: true,
      description: "After a post, reads the SAP status bar and the document display and returns the posted document number. Does not change anything." },
    { id: "c12", flow: "f1", name: "Read Vendor Number", kind: "local subflow", tree: ["c12"], inputs: [], outputs: ["out_SupplierCode"], hiddenInputs: ["GLOBAL.SapInstance"], configInputs: [], apps: ["SAP (UI)"], actions: 3, branches: 1, shims: 0, guards: 1, todos: 0, hidden: null, blockers: [
      { name: "Depends on the parent's app state", level: "prep", why: "uses GLOBAL.SapInstance" },
      { name: "Starts mid-screen", level: "prep", why: "reads one field on the MIRO screen" }],
      effort: { actions: 10, inputs: 10, apps: 15, sensitive: 5, undeclared: 10, exception: 0 }, fp: "d4e2…", family: null, step: true, readOnly: true },
    { id: "c13", flow: "f1", name: "Export GR/IR Open Items", kind: "local subflow", tree: ["c13","c14"], inputs: ["in_GLAccount","in_KeyDate","in_Layout","in_CompanyCodes"], outputs: [], hiddenInputs: ["GLOBAL.SapInstance"], configInputs: [], apps: ["SAP (UI)","File system"], actions: 42, branches: 11, shims: 0, guards: 4, todos: 1, hidden: null, blockers: [
      { name: "No outputs", level: "warn", why: "writes a spreadsheet to disk; returns nothing" },
      { name: "Needs an attended machine", level: "info", why: "27 UI actions" },
      { name: "Depends on the parent's app state", level: "prep", why: "uses GLOBAL.SapInstance; navigates to FBL3N itself" }],
      effort: { actions: 10, inputs: 7, apps: 10, sensitive: 5, undeclared: 10, exception: 5 }, fp: "f1a0…", family: "fam-grir", readOnly: true,
      description: "Runs the G/L account line item display (FBL3N) for a G/L account, key date, layout and company codes and saves the result as a spreadsheet. Does not change SAP data.",
      claims: [{type:"app", value:"SAP FBL3N", ref:"apps[SAP (UI)]", ok:true},{type:"changes", value:"writes a file", ref:"apps[File system]", ok:true},{type:"output", value:"spreadsheet path", ref:"", ok:false}] },
    { id: "c14", flow: "f1", name: "Save SAP Spreadsheet", kind: "local subflow", tree: ["c14"], inputs: ["in_Dir","in_FileName","in_Timeout","in_Format"], outputs: [], hiddenInputs: ["GLOBAL.SapInstance"], configInputs: [], apps: ["SAP (UI)","File system"], actions: 14, branches: 5, shims: 0, guards: 4, todos: 0, hidden: null, blockers: [
      { name: "No outputs", level: "warn", why: "nothing comes back to the agent" },
      { name: "Depends on the parent's app state", level: "prep", why: "uses GLOBAL.SapInstance" },
      { name: "Starts mid-screen", level: "prep", why: "handles the Select Spreadsheet dialog; nothing opens it" }],
      effort: { actions: 10, inputs: 7, apps: 10, sensitive: 5, undeclared: 10, exception: 5 }, fp: "77c5…", family: null, step: true, writes: true },
    { id: "c15", flow: "f1", name: "Is Accounting Period Open", kind: "local subflow", tree: ["c15","c16"], inputs: ["in_Config","in_CompanyCodes"], outputs: ["io_CompanyCodes"], hiddenInputs: [], configInputs: ["SharePoint_Credential"], apps: ["Excel","File system"], actions: 79, branches: 18, shims: 4, guards: 3, todos: 2, hidden: null, blockers: [
      { name: "Structured input", level: "warn", why: "in_Config is a dictionary" },
      { name: "Does not run", level: "fail", why: "calls Get Files from SharePoint, which names SharePoint but has no SharePoint action in its code; the period file never arrives" }],
      effort: { actions: 5, inputs: 10, apps: 10, sensitive: 5, undeclared: 10, exception: 5 }, fp: "3a9d…", family: null, readOnly: true,
      description: "Removes company codes whose accounting period is closed from a list, using a period file from SharePoint. Does not change SAP." },
    { id: "c16", flow: "f1", name: "Get Files from SharePoint", kind: "local subflow", tree: ["c16"], inputs: ["in_LocalPath","in_FileURL"], outputs: [], hiddenInputs: [], configInputs: ["SharePoint_Credential"], apps: [], actions: 1, branches: 1, shims: 0, guards: 2, todos: 4, hidden: null, blockers: [
      { name: "Does not run", level: "fail", why: "4 TODO placeholders and 1 real action; the Office 365 steps were never built" },
      { name: "No outputs", level: "warn", why: "nothing comes back to the agent" }],
      effort: { actions: 10, inputs: 10, apps: 15, sensitive: 5, undeclared: 10, exception: 3 }, fp: "0b3e…", family: null, hollow: true, writes: true },
    { id: "c17", flow: "f1", name: "Update Invoice Status in TSuite", kind: "local subflow", tree: ["c17"], inputs: ["in_InvoiceNumber","in_InvoiceCode","in_Status","in_DocumentNumber","in_PostDate","in_Remarks"], outputs: [], hiddenInputs: [], configInputs: ["TSuite_API_Key"], apps: ["HTTP"], actions: 18, branches: 5, shims: 3, guards: 7, todos: 0, hidden: null, blockers: [
      { name: "No outputs", level: "warn", why: "the API response is discarded" },
      { name: "Swallowed errors", level: "warn", why: "4 block handlers set a flag" }],
      effort: { actions: 10, inputs: 7, apps: 15, sensitive: 5, undeclared: 10, exception: 3 }, fp: "8e1f…", family: null, writes: true, selfContained: true,
      description: "Writes the RPA status, SAP document number, posting date and remarks for one invoice to the TSuite API, with three retries. Changes TSuite. Does not touch SAP." },
    { id: "c18", flow: "f1", name: "Export PO Items", kind: "local subflow", tree: ["c18","c14"], inputs: ["in_Table","in_MaxHits","in_PONumbers"], outputs: [], hiddenInputs: ["GLOBAL.SapInstance"], configInputs: [], apps: ["SAP (UI)","File system"], actions: 41, branches: 8, shims: 0, guards: 3, todos: 0, hidden: null, blockers: [
      { name: "No outputs", level: "warn", why: "writes a spreadsheet to disk; returns nothing" },
      { name: "Depends on the parent's app state", level: "prep", why: "uses GLOBAL.SapInstance; navigates to SE16N itself" }],
      effort: { actions: 10, inputs: 7, apps: 10, sensitive: 5, undeclared: 10, exception: 5 }, fp: "c9b0…", family: null, readOnly: true,
      description: "Queries table EKPO (SE16N) for a list of PO numbers and saves the result as a spreadsheet. Does not change SAP data." },
    { id: "c19", flow: "f1", name: "Send Report", kind: "local subflow", tree: ["c19","c20"], inputs: ["in_Config"], outputs: [], hiddenInputs: ["GLOBAL.WorkQueueItem"], configInputs: ["SMTP_Credential"], apps: ["Work queues","Excel","File system"], actions: 65, branches: 14, shims: 2, guards: 1, todos: 6, hidden: null, blockers: [
      { name: "Does not run", level: "fail", why: "its comments name Outlook, but there is no email action in its code; the send step was never built" },
      { name: "No outputs", level: "warn", why: "nothing comes back to the agent" }],
      effort: { actions: 10, inputs: 10, apps: 10, sensitive: 5, undeclared: 5, exception: 5 }, fp: "5d2c…", family: null, writes: true },
    { id: "c20", flow: "f1", name: "Build Report Table", kind: "local subflow", tree: ["c20"], inputs: ["in_ProcessedItems"], outputs: ["out_ReportingData"], hiddenInputs: [], configInputs: [], apps: [], actions: 13, branches: 7, shims: 1, guards: 2, todos: 1, hidden: "helper", hiddenWhy: "13 actions, touches only memory", blockers: [], effort: { actions: 10, inputs: 10, apps: 15, sensitive: 5, undeclared: 10, exception: 0 }, fp: "aa10…", family: null },
    { id: "c21", flow: "f1", name: "Handle Status Bar Message", kind: "local subflow", tree: ["c21"], inputs: ["in_RetryLimit","in_WaitSeconds"], outputs: ["out_MessageType","out_Message"], hiddenInputs: ["GLOBAL.SapInstance"], configInputs: [], apps: ["SAP (UI)"], actions: 7, branches: 4, shims: 0, guards: 4, todos: 2, hidden: null, blockers: [
      { name: "Depends on the parent's app state", level: "prep", why: "uses GLOBAL.SapInstance" },
      { name: "Starts mid-screen", level: "prep", why: "presses Enter through status-bar warnings on whatever screen is open" }],
      effort: { actions: 10, inputs: 10, apps: 15, sensitive: 5, undeclared: 10, exception: 3 }, fp: "e0e0…", family: null, step: true, readOnly: true },
    { id: "c22", flow: "f1", name: "Init All Applications", kind: "local subflow", tree: ["c22"], inputs: ["in_Config"], outputs: [], hiddenInputs: [], configInputs: ["SAP_Credential"], apps: ["SAP (UI)"], actions: 66, branches: 9, shims: 0, guards: 1, todos: 1, hidden: "framework plumbing", hiddenWhy: "Framework plumbing; found in 71% of flows", blockers: [], effort: { actions: 10, inputs: 10, apps: 15, sensitive: 5, undeclared: 10, exception: 5 }, fp: "s001", family: "fam-init" },
    { id: "c23", flow: "f1", name: "Kill All Processes", kind: "local subflow", tree: ["c23"], inputs: [], outputs: [], hiddenInputs: [], configInputs: [], apps: ["OS process"], actions: 4, branches: 1, shims: 0, guards: 0, todos: 0, hidden: "framework plumbing", hiddenWhy: "Framework plumbing; found in 88% of flows", blockers: [], effort: { actions: 10, inputs: 10, apps: 15, sensitive: 5, undeclared: 10, exception: 0 }, fp: "s002", family: "fam-kill" },
    { id: "c24", flow: "f1", name: "Get Transaction Data", kind: "local subflow", tree: ["c24"], inputs: ["in_QueueName"], outputs: ["out_TransactionItem","out_TransactionID"], hiddenInputs: [], configInputs: [], apps: ["Work queues"], actions: 44, branches: 6, shims: 0, guards: 3, todos: 1, hidden: "framework plumbing", hiddenWhy: "Framework plumbing", blockers: [], effort: { actions: 10, inputs: 10, apps: 15, sensitive: 5, undeclared: 10, exception: 5 }, fp: "s003", family: "fam-gtd" },
    { id: "c25", flow: "f1", name: "Set Transaction Status", kind: "local subflow", tree: ["c25","c26"], inputs: ["in_Status","in_TransactionItem"], outputs: [], hiddenInputs: [], configInputs: [], apps: ["Work queues"], actions: 51, branches: 12, shims: 0, guards: 2, todos: 0, hidden: "framework plumbing", hiddenWhy: "Framework plumbing", blockers: [], effort: { actions: 10, inputs: 10, apps: 15, sensitive: 5, undeclared: 10, exception: 5 }, fp: "s004", family: "fam-sts" },
    { id: "c26", flow: "f1", name: "Take Screenshot", kind: "local subflow", tree: ["c26"], inputs: ["in_Folder"], outputs: ["io_FilePath"], hiddenInputs: [], configInputs: [], apps: ["File system"], actions: 37, branches: 4, shims: 0, guards: 2, todos: 0, hidden: "framework plumbing", hiddenWhy: "Framework plumbing; found in 60% of flows", blockers: [], effort: { actions: 10, inputs: 10, apps: 15, sensitive: 5, undeclared: 10, exception: 5 }, fp: "s005", family: "fam-shot" },
    { id: "c27", flow: "f1", name: "Err_GetError", kind: "global subflow", tree: ["c27"], inputs: [], outputs: [], hiddenInputs: [], configInputs: [], apps: [], actions: 3, branches: 0, shims: 0, guards: 0, todos: 0, hidden: "framework plumbing", hiddenWhy: "Framework plumbing; found in every flow", blockers: [], effort: { actions: 10, inputs: 10, apps: 15, sensitive: 5, undeclared: 5, exception: 0 }, fp: "s006", family: "fam-err" },
    // ---------- f2: Vendor Master Sync ----------
    { id: "c30", flow: "f2", name: "Main", kind: "flow", tree: ["c30","c31","c32","c33","c34","c35","c36"], inputs: [], outputs: [], hiddenInputs: [], configInputs: ["SAP_Credential","VendorPortal_Token"], apps: ["SAP (UI)","HTTP"], actions: 410, branches: 52, shims: 12, guards: 30, todos: 8, hidden: null, blockers: [
      { name: "No outputs", level: "warn", why: "the flow declares no output variables" },
      { name: "Needs an attended machine", level: "info", why: "140 UI actions" },
      { name: "Too slow to call synchronously", level: "warn", why: "a run can take 9 minutes" }],
      effort: { actions: 0, inputs: 10, apps: 10, sensitive: 5, undeclared: 10, exception: 5 }, fp: "91aa…", family: null, wireNow: true, writes: true, role: "Nightly: pull vendor changes from the portal, update SAP vendor master." },
    { id: "c31", flow: "f2", name: "Fetch Vendor Changes", kind: "local subflow", tree: ["c31"], inputs: ["in_Since"], outputs: ["out_dt_Changes"], hiddenInputs: [], configInputs: ["VendorPortal_Token"], apps: ["HTTP"], actions: 15, branches: 3, shims: 2, guards: 2, todos: 0, hidden: null, blockers: [], effort: { actions: 10, inputs: 10, apps: 15, sensitive: 5, undeclared: 10, exception: 5 }, fp: "44b2…", family: null, readOnly: true, selfContained: true,
      description: "Fetches vendor master changes since a date from the vendor portal API as a table. Does not change anything.",
      claims: [{type:"app", value:"HTTP", ref:"apps[HTTP]", ok:true},{type:"output", value:"out_dt_Changes", ref:"outputs[out_dt_Changes]", ok:true}] },
    { id: "c32", flow: "f2", name: "Update Vendor in SAP", kind: "local subflow", tree: ["c32","c33"], inputs: ["in_VendorCode","in_Field","in_Value"], outputs: ["out_Status"], hiddenInputs: [], configInputs: ["SAP_Credential"], apps: ["SAP (UI)"], actions: 58, branches: 9, shims: 1, guards: 4, todos: 1, hidden: null, blockers: [
      { name: "Needs an attended machine", level: "info", why: "33 UI actions" },
      { name: "Hard-coded secret", level: "warn", why: "a password is typed into the flow as plain text" }],
      effort: { actions: 10, inputs: 7, apps: 15, sensitive: 3, undeclared: 10, exception: 5 }, fp: "d7d7…", family: null, writes: true, selfContained: true,
      description: "Logs into SAP, opens XK02 for a vendor and changes one field to a value, returning the status message. Changes SAP vendor master.",
      claims: [{type:"app", value:"SAP XK02", ref:"apps[SAP (UI)]", ok:true},{type:"changes", value:"vendor master field", ref:"actions[SAP.PopulateTextField]", ok:true},{type:"output", value:"out_Status", ref:"outputs[out_Status]", ok:true}] },
    { id: "c33", flow: "f2", name: "SAP Login", kind: "local subflow", tree: ["c33"], inputs: [], outputs: ["out_SapInstance"], hiddenInputs: [], configInputs: ["SAP_Credential"], apps: ["SAP (UI)"], actions: 9, branches: 2, shims: 0, guards: 1, todos: 0, hidden: null, blockers: [
      { name: "Needs an attended machine", level: "info", why: "4 UI actions" }],
      effort: { actions: 10, inputs: 10, apps: 15, sensitive: 5, undeclared: 10, exception: 5 }, fp: "0c0c…", family: null, selfContained: true, readOnly: true,
      description: "Opens SAP Logon and signs in with the stored credential, returning the session. Does not touch business data." },
    { id: "c34", flow: "f2", name: "Export GR/IR Open Items", kind: "local subflow", tree: ["c34","c35"], inputs: ["in_GLAccount","in_KeyDate","in_Layout","in_CompanyCodes"], outputs: [], hiddenInputs: ["GLOBAL.SapInstance"], configInputs: [], apps: ["SAP (UI)","File system"], actions: 42, branches: 11, shims: 0, guards: 4, todos: 1, hidden: null, blockers: [
      { name: "No outputs", level: "warn", why: "writes a spreadsheet to disk; returns nothing" },
      { name: "Depends on the parent's app state", level: "prep", why: "uses GLOBAL.SapInstance" }],
      effort: { actions: 10, inputs: 7, apps: 10, sensitive: 5, undeclared: 10, exception: 5 }, fp: "f1a0…", family: "fam-grir", readOnly: true, clone: true },
    { id: "c35", flow: "f2", name: "Save SAP Spreadsheet", kind: "local subflow", tree: ["c35"], inputs: ["in_Dir","in_FileName","in_Timeout","in_Format"], outputs: [], hiddenInputs: ["GLOBAL.SapInstance"], configInputs: [], apps: ["SAP (UI)","File system"], actions: 14, branches: 5, shims: 0, guards: 4, todos: 0, hidden: null, blockers: [
      { name: "No outputs", level: "warn", why: "nothing comes back to the agent" },
      { name: "Depends on the parent's app state", level: "prep", why: "uses GLOBAL.SapInstance" },
      { name: "Starts mid-screen", level: "prep", why: "handles the Select Spreadsheet dialog" }],
      effort: { actions: 10, inputs: 7, apps: 10, sensitive: 5, undeclared: 10, exception: 5 }, fp: "77c5…", family: "fam-save", step: true, clone: true, writes: true },
    { id: "c36", flow: "f2", name: "Init All Applications", kind: "local subflow", tree: ["c36"], inputs: ["in_Config"], outputs: [], hiddenInputs: [], configInputs: ["SAP_Credential"], apps: ["SAP (UI)"], actions: 61, branches: 8, shims: 0, guards: 1, todos: 0, hidden: "framework plumbing", hiddenWhy: "Framework plumbing", blockers: [], effort: { actions: 10, inputs: 10, apps: 15, sensitive: 5, undeclared: 10, exception: 5 }, fp: "s011", family: "fam-init" },
    { id: "c37", flow: "f2", name: "Kill All Processes", kind: "local subflow", tree: ["c37"], inputs: [], outputs: [], hiddenInputs: [], configInputs: [], apps: ["OS process"], actions: 4, branches: 1, shims: 0, guards: 0, todos: 0, hidden: "framework plumbing", hiddenWhy: "Framework plumbing", blockers: [], effort: { actions: 10, inputs: 10, apps: 15, sensitive: 5, undeclared: 10, exception: 0 }, fp: "s002", family: "fam-kill" },
    { id: "c38", flow: "f2", name: "Err_GetError", kind: "global subflow", tree: ["c38"], inputs: [], outputs: [], hiddenInputs: [], configInputs: [], apps: [], actions: 3, branches: 0, shims: 0, guards: 0, todos: 0, hidden: "framework plumbing", hiddenWhy: "Framework plumbing", blockers: [], effort: { actions: 10, inputs: 10, apps: 15, sensitive: 5, undeclared: 5, exception: 0 }, fp: "s006", family: "fam-err" },
    // ---------- f3: Get Open PO Balance (hand-built, wire now) ----------
    { id: "c40", flow: "f3", name: "Main", kind: "flow", tree: ["c40"], inputs: ["in_PONumber"], outputs: ["out_OpenAmount","out_Currency","out_Status"], hiddenInputs: [], configInputs: ["SAP_Credential"], apps: ["SAP (UI)"], actions: 38, branches: 4, shims: 0, guards: 0, todos: 0, hidden: null, blockers: [
      { name: "Needs an attended machine", level: "info", why: "21 UI actions" }],
      effort: { actions: 10, inputs: 10, apps: 15, sensitive: 5, undeclared: 10, exception: 5 }, fp: "ff01…", family: null, wireNow: true, readOnly: true, selfContained: true,
      description: "Logs into SAP, opens ME2N for one PO number and returns the open amount, currency and PO status. Does not change anything.",
      claims: [{type:"app", value:"SAP ME2N", ref:"apps[SAP (UI)]", ok:true},{type:"output", value:"out_OpenAmount", ref:"outputs[out_OpenAmount]", ok:true}] },
  ],
  // Copies: the same subflow found in more than one flow. One tool stands in for every copy.
  families: [
    { id: "fam-grir", fp: "f1a0…", members: ["c13","c34"], copies: 2, scaffolding: false, representative: "c13", tokens: "IF · Clipboard.SetText · IF · UIAutomation.IfWindow · System.RunApplication · SAP.PopulateTextField · SAP.ClickSapGuiElement · … · CALL · END", differs: "variable names, the G/L account, the layout" },
    { id: "fam-save", fp: "77c5…", members: ["c14","c35"], copies: 2, scaffolding: false, representative: "c14", tokens: "IF ×4 · UIAutomation.IfWindow · SAP.ClickSapGuiElement ×3 · THROW · IF · SAP.PopulateTextField ×2 · SAP.ClickSapGuiElement · END", differs: "variable names, the file path" },
    { id: "fam-init", fp: "s001", members: ["c22","c36"], copies: 2, scaffolding: true, representative: "c22", tokens: "IF · CALL · BLOCK · ONBLOCKERR · … (61–66 tokens)", differs: "one extra app launch in AP Invoice Posting" },
    { id: "fam-kill", fp: "s002", members: ["c23","c37"], copies: 2, scaffolding: true, representative: "c23", tokens: "LOOP · System.TerminateProcess · END", differs: "nothing" },
    { id: "fam-err", fp: "s006", members: ["c27","c38"], copies: 2, scaffolding: true, representative: "c27", tokens: "SET · SET · SET", differs: "nothing" },
  ],
  // Recommended agents: AI suggestion after code checks. climbedFrom = steps AI suggested that the code check replaced with the step that contains them.
  agents: [
    { id: "a1", name: "AP invoice posting assistant", job: "For an AP clerk: fetch an approved invoice from TSuite, post it in SAP MIRO, return the SAP document number and record the result in TSuite.",
      tools: [
        { c: "c10", mode: "needs prep", role: "find the invoice to post" },
        { c: "c4", mode: "needs prep", role: "post it and read back the document number", climbedFrom: ["c8","c11"] },
        { c: "c17", mode: "needs prep", role: "record the result" }],
      proposedAndDropped: [{ c: "c8", why: "starts mid-screen; Post Invoice to SAP covers it" }, { c: "c11", why: "starts mid-screen; Post Invoice to SAP covers it" }],
      score: { wireNow: 0, harvest: 3, runs12m: 1630 },
      prepWork: [
        { c: "c4", text: "Flatten in_TransactionItem into invoice fields (number, vendor, amount, date, PO list)" },
        { c: "c4", text: "Make in_dt_POTracker and in_dt_SupplierList config-bound (read from a shared location)" },
        { c: "c4", text: "Raise the swallowed error in Simulate and Post" },
        { c: "c10", text: "Raise the error after the third retry instead of setting a flag" },
        { c: "c17", text: "Return the API response" }] },
    { id: "a2", name: "AP lookup agent (read-only)", job: "Answer 'what is open on this PO or G/L account' questions from SAP without touching MIRO.",
      tools: [
        { c: "c40", mode: "ready to connect", role: "get the open amount for one PO" },
        { c: "c13", mode: "needs prep", role: "export GR/IR open items for an account and key date" },
        { c: "c18", mode: "needs prep", role: "export PO items for a list of POs" },
        { c: "c10", mode: "needs prep", role: "list the invoices waiting in TSuite" }],
      proposedAndDropped: [{ c: "c15", why: "does not run: its SharePoint download step was never built" }],
      score: { wireNow: 1, harvest: 3, runs12m: 4530 },
      prepWork: [
        { c: "c13", text: "Open an SAP session inside it (it already navigates to FBL3N)" },
        { c: "c13", text: "Return the spreadsheet path as an output" },
        { c: "c18", text: "Open an SAP session inside it (it already navigates to SE16N)" },
        { c: "c18", text: "Return the spreadsheet path as an output" },
        { c: "c18", text: "Replace the clipboard paste with direct field input" },
        { c: "c10", text: "Raise the error after the third retry instead of setting a flag" }] },
    { id: "a3", name: "Vendor master agent", job: "Look up and change a vendor master field in SAP from a vendor portal change request.",
      tools: [
        { c: "c31", mode: "needs prep", role: "fetch what changed on the portal" },
        { c: "c32", mode: "needs prep", role: "apply one change in SAP", writes: true },
        { c: "c40", mode: "ready to connect", role: "check the vendor's open PO balance before a change" }],
      proposedAndDropped: [],
      score: { wireNow: 1, harvest: 2, runs12m: 3140 },
      prepWork: [{ c: "c32", text: "Move the literal secret to a credential" }] },
  ],
  // Estate-wide numbers for the hero strip. The components array above covers 3 of the 214 flows.
  summary: { flows: 214, components: 1912, hidden: 1166, hiddenPct: 61, candidates: 38, agents: 3 },
  // "Describe a job": three canned queries, each with a fixed result list. Free text falls back to the first list.
  describeJob: { canned: [
    { q: "open PO balance and waiting invoices", results: ["c40","c18","c13","c10"] },
    { q: "change a vendor's bank details", results: ["c32","c31","c33","c40"] },
    { q: "post an approved invoice in SAP", results: ["c4","c10","c17","c9"] },
  ] },
};

/* Access per component: what the tool does to data.
   read = looks things up only; none = touches no business data (opens a session, switches a screen);
   write = pushes its inputs out without looking anything up first; readwrite = looks something up, then changes something. */
export const ACCESS: Record<string, "read" | "none" | "write" | "readwrite"> = {
  c1: "readwrite", c4: "readwrite", c5: "none", c6: "write", c7: "write", c8: "read", c9: "write", c10: "read", c11: "read", c12: "read",
  c13: "readwrite", c14: "write", c15: "read", c16: "read", c17: "write", c18: "readwrite", c19: "write", c21: "read",
  c30: "readwrite", c31: "read", c32: "write", c33: "none", c34: "readwrite", c35: "write", c40: "read",
};

/* Copilot Studio test pane script: two beats of four messages. A tool call and its run render as one activity card. */
export type ChatMsg =
  | { k: "user"; t: string }
  | { k: "agent"; t: string }
  | { k: "tool"; tool: string; input: string; on: string }
  | { k: "run"; of: number; t: string };
export const CHAT: ChatMsg[] = [
  { k: "user", t: "Is PO 4500012345 still open?" },
  { k: "tool", tool: "Get Open PO Balance", input: "in_PONumber = 4500012345", on: "CONTOSO-RPA-03" },
  { k: "run", of: 1, t: "Done · 14 s" },
  { k: "agent", t: "PO 4500012345 is still open: 12,480.00 EUR outstanding, status Open." },
  { k: "user", t: "And 4500009921?" },
  { k: "tool", tool: "Get Open PO Balance", input: "in_PONumber = 4500009921", on: "CONTOSO-RPA-03" },
  { k: "run", of: 5, t: "Done · 11 s" },
  { k: "agent", t: "PO 4500009921 is closed. Open amount 0.00 EUR." },
];
/* Per-message delays (ms), indexed like CHAT: question, tool card, run result, answer. */
export const DELAYS = [500, 900, 2600, 700, 2500, 900, 2200, 600];

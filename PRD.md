Cool, here’s a draft PRD (Product Requirements Document) for the MVP of the AI-based Dataset Discovery & Evaluation Agent. We can iterate / customize.

---

# PRD: Dataset Discovery & Evaluation Agent (MVP)

---

## 1. Title & Metadata

* **Product Name**: Dataset Discovery & Evaluation Agent MVP
* **Date**: 2025-09-xx
* **Version**: 0.1
* **Author(s)**: \[Your name], Senior Product Designer; Engineering lead; Scientist user (stakeholder)
* **Stakeholders**:

  * Scientists / Domain Experts (end users)
  * Data Engineers / Data Managers


---

## 2. Purpose / Background

### Problem Statement

Scientists often spend a lot of time discovering, vetting, and acquiring datasets (checking metadata, format, license, etc.). The current process is manual, error-prone, inconsistent, and hard to reproduce.

### Goal

Build an MVP ai-agent that assists scientists in:

1. Defining their data needs in a structured form.
2. Searching relevant open datasets across selected repositories.
3. Evaluating candidates based on basic metadata, format, license, and timeliness.
4. Acquiring (downloading) selected dataset(s) and generating citation/documentation.

### Success Metrics

* Time saved by scientists to go from idea → dataset acquisition (target: reduce by 50%).
* # of candidate datasets surfaced per query (target: ≥ 5 relevant open datasets).
* % of datasets which satisfy license and format constraints (as defined by user).
* User satisfaction (via survey) ≥ 80% finding the evaluation useful.
* Reliability: downloads succeed without errors for open datasets in ≥ 90% of cases.

---

## 3. Scope

### In Scope (MVP)

* Only open / publicly accessible datasets (no need for manual access requests or IRB).
* Repositories: DataCite, re3data (or similar two).
* Core evaluation: metadata completeness, license check, format compatibility, timeliness.
* Basic citation generation.
* Logging of decisions (why selected, why rejected).
* UI/Client for: defining data need, listing candidates, viewing evaluation card, selecting and downloading dataset.

### Out of Scope (for MVP)

* Advanced ethical / risk assessments (e.g. human subject research IRB workflows).
* Version monitoring or licensing changes over time.
* Large scale integration testing (unit consistency, schema alignment across multiple datasets).
* Handling of embargoed or restricted datasets.
* Advanced synonyms / query expansion, saved past searches.

---

## 4. User Personas & Use Cases

| Persona                    | Use Case                                                                                                                               |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Scientist (domain expert)  | Has a research question; needs to find existing datasets that match variables, format, license etc. Evaluate quickly and acquire them. |
| Data Engineer              | Supports scientists; may use the tool to more quickly prep datasets for project ingestion.                                             |
| Project Manager / Lab Head | Wants audit trail / documentation of which datasets were selected, rejected, why.                                                      |

---

## 5. Functional Requirements

Here’s a list of features / requirements, prioritized:

| Priority | Feature                                  | Description / Requirements                                                                                                                                 |
| -------- | ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Must     | **Define Data Needs Form**               | A form UI for user to input: research question, required variables, format constraints (CSV, Parquet etc.), license constraints, date range.               |
| Must     | **Search Tool**                          | Server-tool `searchDatasets` to query selected repos using keywords + filters (license, date). Returns list of candidate‐datasets.                         |
| Must     | **Metadata Fetch + Evaluation**          | For each candidate: fetch metadata; check license; check format compatibility; check timeliness. Produce an “evaluation card” with yes/no flags + summary. |
| Must     | **Dataset Acquisition**                  | For datasets that are openly downloadable: allow download; store locally under project workspace; compute checksum.                                        |
| Must     | **Generate Citation**                    | Using metadata, generate standard citation (APA / CSL) for the acquired dataset.                                                                           |
| Should   | **Decision Log**                         | Maintain a log of which candidates were selected / rejected, including reasons. Displayable in UI.                                                         |
| Should   | **Project Root & File Storage**          | Constrain downloaded data and metadata to a project “root” folder.                                                                                         |
| Could    | **UI for candidate listing + filtering** | Allow sorting/filtering of candidates (by date, license, format).                                                                                          |
| Could    | **Preview sample**                       | Fetch small preview of first N rows of a candidate (if possible) for format inspection.                                                                    |

---


## 7. Tools / Components (Technical Requirements)

* ** Server Tools** to be built:

  1. `searchDatasets(keywords[], licenseFilter, dateRange) → candidates[]`
  2. `fetchMetadata(pid|url) → metadata`
  3. `checkLicense(metadata) → normalized license + flag ok/not`
  4. `formatCompatibilityCheck(metadata, userFormatReqs) → boolean + notes`
  5. `downloadDataset(pid|url, destPath) → localPath + checksum`
  6. `generateCitation(metadata) → citation string / CSL JSON`

* ** Server Prompts**:

  * `Define-Data-Needs`
  * `Evaluate-Dataset`
  * `Acquire-and-Document`

* ** Resources**:

  * Repositories list (DataCite, re3data)
  * Policy template for license reuse definitions
  * Project log & citations store

* **Client Component**:

  * UI form to collect “data needs”
  * Candidate listing / evaluation card UI
  * Confirmation dialog before download & write to storage
  * Display citation + project log

* **Data Storage**:

  * Local/project workspace (roots) for storing datasets, metadata, logs

---

## 8. Acceptance Criteria / Test Cases

For each functional requirement, define tests:

| Requirement           | Acceptance Criteria                                                                                                                                                         |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Define Data Needs     | Given a form is filled with all required fields → server receives valid structured data; missing required fields lead to validation errors.                                 |
| Search Tool           | Keyword + filters input → returns ≥ 5 candidate datasets that satisfy license + date constraints.                                                                           |
| Metadata / Evaluation | Candidate with missing license → evaluation card flags missing license; candidate with unacceptable format → flagged as incompatible; “timeliness” check behaves correctly. |
| Download Dataset      | A known open dataset selected → successfully downloaded; checksum computed; stored in project root.                                                                         |
| Citation Generation   | Citation includes: author/creator, title, repo, date, version/DOI. Matches expected style.                                                                                  |
| Decision Log          | After accept or reject a candidate → log entry created with: timestamp, candidate id, reason.                                                                               |

---


## 10. Dependencies & Constraints

* Access to public dataset APIs (DataCite, re3data) and their stability. for the moment lets mock api responses.
* Guarantee that some datasets in those repos are openly downloadable for testing.
* Infrastructure for file storage (permissions, disk space).
* Team availability: server engineers; front-end / client engineers; design time.

---

## 12. What’s Not Being Done (Out of Scope)

* Human subject / IRB formal workflows.
* Dataset monitoring / alerts for version or license changes.
* Large scale data profiling / schema alignment across multiple datasets.
* Access requests / embargoed datasets.
* Full ecosystem of many more repos (just start with 1-2).

---

If you like, I can convert this PRD into a slide deck or share a Confluence-style template populated with these items, so you can present to stakeholders. Do you want me to generate that?

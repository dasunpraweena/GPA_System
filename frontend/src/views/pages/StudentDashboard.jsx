import React from 'react';
import { useGpaCalculatorViewModel } from '../../viewmodels/useGpaCalculatorViewModel.js';

export const StudentDashboard = () => {
  const {
    activeSemester,
    setActiveSemester,
    semesters,
    currentCourses,
    gpaSummary,
    activeSemesterStats,
    loading,
    feedback,
    error,
    formatGpa,
    onGradeChange,
    onElectiveToggle,
    gradeScale
  } = useGpaCalculatorViewModel();

  const yearWeights = [0.20, 0.20, 0.30, 0.30];
  const activeYearIndex = Math.floor(activeSemester / 2);
  const activeYearWeight = yearWeights[activeYearIndex] * 100;

  return (
    <main>
      <section className="intro">
        <div>
          <div className="eyebrow">YOUR DEGREE, SEMESTER BY SEMESTER</div>
          <h1>Every credit counts.</h1>
          <p>Choose your grades. See where you stand across all four years.</p>
        </div>
        <div className="scale">4 years <span>/</span> 8 semesters <span>/</span> 4.0 scale</div>
      </section>

      {/* Metrics Section */}
      <section className="metrics" aria-live="polite">
        <article className="mainmetric">
          <span>{gpaSummary?.finalLabel || 'Weighted final GPA estimate'}</span>
          <div>
            <strong>{formatGpa(gpaSummary?.finalGpa)}</strong>
            <small>/ 4.00</small>
          </div>
          <p>{gpaSummary?.finalNote || 'Add your first grade to get started.'}</p>
        </article>

        <article>
          <span>Cumulative GPA</span>
          <strong>{formatGpa(gpaSummary?.cumulative?.gpa)}</strong>
          <p>Credit-weighted · entered grades</p>
        </article>

        <article>
          <span>Graded GPA credits</span>
          <strong>
            {gpaSummary?.cumulative?.credits || 0}{' '}
            <small>/ {gpaSummary?.cumulative?.totalCredits || 0}</small>
          </strong>
          <p>{gpaSummary?.cumulative?.gradedCount || 0} subjects with GPA grades</p>
        </article>
      </section>

      {/* Workspace */}
      <div className="workspace">
        <aside>
          <div className="eyebrow">YOUR SEMESTERS</div>
          <nav aria-label="Choose a semester">
            {semesters.map((semCourses, idx) => {
              const semStat = gpaSummary?.semesters?.[idx];
              const isFirstOfSemesterYear = idx % 2 === 0;
              const yearNo = idx / 2 + 1;

              return (
                <React.Fragment key={idx}>
                  {isFirstOfSemesterYear && <div className="navyear">YEAR {yearNo}</div>}
                  <button
                    type="button"
                    aria-current={activeSemester === idx}
                    onClick={() => setActiveSemester(idx)}
                  >
                    <span>Semester {idx + 1}</span>
                    <b>{formatGpa(semStat?.gpa)}</b>
                  </button>
                </React.Fragment>
              );
            })}
          </nav>

          <div className="aside-note">
            Year weights
            <br />
            <b>20% · 20% · 30% · 30%</b>
            <p>Final GPA also accounts for credits in each year.</p>
          </div>
        </aside>

        {/* Course Panel */}
        <section className="coursepanel">
          <div className="panelhead">
            <div className="eyebrow">
              YEAR {activeYearIndex + 1} · WEIGHT {activeYearWeight}%
            </div>
            <div className="headingrow">
              <h2>Semester {activeSemester + 1}</h2>
              <div className="semester-result">
                Semester GPA <b>{formatGpa(activeSemesterStats?.gpa)}</b>
              </div>
            </div>
            <p>Select electives you take. Leave unreceived grades blank.</p>
          </div>

          <div className="tablewrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">Selected</th>
                  <th scope="col">Subject</th>
                  <th scope="col">Credits</th>
                  <th scope="col">Type</th>
                  <th scope="col">Grade</th>
                </tr>
              </thead>
              <tbody>
                {currentCourses.map((c) => (
                  <tr key={c.id}>
                    <td>
                      {c.elective ? (
                        <input
                          type="checkbox"
                          checked={c.included}
                          onChange={(e) => onElectiveToggle(c.id, e.target.checked)}
                          aria-label={`Take ${c.name}`}
                        />
                      ) : (
                        <span className="badge" aria-label="Required core subject">
                          Core
                        </span>
                      )}
                    </td>
                    <td>
                      <div className="subject-name">{c.name}</div>
                      <div className="code">{c.code}</div>
                    </td>
                    <td>
                      <span className="credits-static">{c.credits}</span>
                    </td>
                    <td>
                      <span className={`badge ${c.gpa ? '' : 'neutral'}`}>
                        {c.gpa ? 'GPA' : 'Non-GPA'}
                      </span>
                    </td>
                    <td>
                      {c.source === 'exam_branch' ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: 600, fontSize: '15px' }}>{c.effectiveGrade}</span>
                          <span className="badge exam-branch" title="Official exam-branch result. Cannot be overwritten.">
                            Exam branch
                          </span>
                        </div>
                      ) : (
                        <select
                          value={c.studentGrade || ''}
                          disabled={!c.included}
                          onChange={(e) => onGradeChange(c.id, e.target.value)}
                          aria-label={`Grade for ${c.name}`}
                        >
                          <option value="">Grade</option>
                          {gradeScale.map((g) => (
                            <option key={g.grade} value={g.grade}>
                              {g.grade}
                            </option>
                          ))}
                          <option value="AB">AB · Absent</option>
                        </select>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="panelbottom">
            <span role="status" style={{ color: feedback ? '#2e6245' : error ? '#ab3434' : '#849087' }}>
              {feedback || error || ''}
            </span>
            <span>Subject settings managed by admin</span>
          </div>
          <p className="table-note">
            Credits and GPA type are set by your department. Select only the electives you take, then enter your grades.
          </p>
        </section>
      </div>

      {/* Four-Year Overview Section */}
      <section className="yearsection">
        <div className="sectiontitle">
          <h2>Your four-year overview</h2>
          <span>Calculated from entered grades</span>
        </div>
        <div className="yeargrid">
          {yearWeights.map((w, i) => {
            const yearStat = gpaSummary?.years?.[i] || { credits: 0, totalCredits: 0, gpa: null };
            return (
              <article key={i} className="yearcard">
                <div>
                  Year {i + 1}
                  <span className="weight">{w * 100}% weight</span>
                </div>
                <strong>{formatGpa(yearStat.gpa)}</strong>
                <progress
                  value={yearStat.credits}
                  max={yearStat.totalCredits || 1}
                  aria-label={`Year ${i + 1} graded GPA credits`}
                />
                <p>
                  {yearStat.credits} / {yearStat.totalCredits} GPA credits graded
                </p>
              </article>
            );
          })}
        </div>
      </section>

      {/* How GPA is Calculated Details */}
      <details>
        <summary>How your GPA is calculated</summary>
        <div className="rules">
          <p>
            <b>Semester / yearly / cumulative GPA</b> = total (grade points × credits) ÷ total graded GPA credits.
          </p>
          <p>
            <b>Weighted final GPA</b> = Σ (year weight × yearly credits × yearly GPA) ÷ Σ (year weight × yearly credits). Year weights: 0.20, 0.20, 0.30, 0.30.
          </p>
          <p>
            A+ and A both equal 4.0. AB means Absent and is marked as pending GPA review; it is not silently treated as a pass or a failure. Blank grades, unselected subjects and non-GPA subjects are excluded. F counts as 0.0 with its credits included. Incomplete results are estimates; no intermediate GPA rounding is used.
          </p>
          <div className="grade-scale">
            {gradeScale.map((g) => (
              <span key={g.grade}>
                <b>{g.grade}</b> &nbsp; {g.points.toFixed(1)}
              </span>
            ))}
            <span>
              <b>AB</b> &nbsp; Absent · GPA review pending
            </span>
          </div>
          <p>
            Based on the supplied course lists and handbook sections 12.2–12.3, with year weights confirmed for Software Engineering. Enter officially awarded grades for repeated subjects. This calculator does not determine graduation eligibility or degree classification.
          </p>
        </div>
      </details>

      <footer>
        Semester · Software Engineering GPA calculator
        <span>React frontend / Node.js + Express API / MySQL database</span>
      </footer>
    </main>
  );
};

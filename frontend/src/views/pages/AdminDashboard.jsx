import React, { useState } from 'react';
import { useCurriculumViewModel } from '../../viewmodels/useCurriculumViewModel.js';
import { useUsersViewModel } from '../../viewmodels/useUsersViewModel.js';
import { useImportViewModel } from '../../viewmodels/useImportViewModel.js';

export const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('curriculum'); // 'curriculum' | 'users' | 'upload'

  // ViewModels
  const curriculumVM = useCurriculumViewModel();
  const usersVM = useUsersViewModel();
  const importVM = useImportViewModel();

  const yearWeights = [0.20, 0.20, 0.30, 0.30];

  return (
    <div>
      {/* Admin Section Navigation */}
      <nav className="adminnav" aria-label="Admin sections">
        <button
          type="button"
          aria-current={activeTab === 'curriculum'}
          onClick={() => setActiveTab('curriculum')}
        >
          Curriculum
        </button>
        <button
          type="button"
          aria-current={activeTab === 'users'}
          onClick={() => setActiveTab('users')}
        >
          Users
        </button>
        <button
          type="button"
          aria-current={activeTab === 'upload'}
          onClick={() => {
            setActiveTab('upload');
            importVM.loadHistory();
          }}
        >
          Import results
        </button>
      </nav>

      {/* CURRICULUM SECTION */}
      {activeTab === 'curriculum' && (
        <main>
          <section className="intro">
            <div>
              <div className="eyebrow">ADMIN WORKSPACE</div>
              <h1>Your curriculum, in order.</h1>
              <p>Manage subject credits and GPA eligibility for all students.</p>
            </div>
          </section>

          <div className="workspace">
            <aside>
              <div className="eyebrow">CURRICULUM SEMESTERS</div>
              <nav aria-label="Choose a semester">
                {curriculumVM.semesters.map((_, idx) => (
                  <React.Fragment key={idx}>
                    {idx % 2 === 0 && <div className="navyear">YEAR {idx / 2 + 1}</div>}
                    <button
                      type="button"
                      aria-current={curriculumVM.activeSemester === idx}
                      onClick={() => curriculumVM.setActiveSemester(idx)}
                    >
                      <span>Semester {idx + 1}</span>
                    </button>
                  </React.Fragment>
                ))}
              </nav>
            </aside>

            <section className="coursepanel">
              <div className="panelhead">
                <div className="eyebrow">
                  YEAR {Math.floor(curriculumVM.activeSemester / 2) + 1} · WEIGHT{' '}
                  {yearWeights[Math.floor(curriculumVM.activeSemester / 2)] * 100}%
                </div>
                <div className="headingrow">
                  <h2>Semester {curriculumVM.activeSemester + 1} subjects</h2>
                </div>
                <p>Only administrators can change credits and subject types.</p>
              </div>

              <div className="tablewrap">
                <table>
                  <thead>
                    <tr>
                      <th scope="col">Category</th>
                      <th scope="col">Subject</th>
                      <th scope="col">Credits</th>
                      <th scope="col">Type</th>
                      <th scope="col">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {curriculumVM.currentCourses.map((c) => (
                      <tr key={c.id}>
                        <td>
                          <span className="code">{c.elective ? 'Elective' : 'Core'}</span>
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
                          <button
                            type="button"
                            className="editbtn"
                            onClick={() => curriculumVM.openEditModal(c)}
                            aria-label={`Edit ${c.name}`}
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="panelbottom">
                <span role="status" style={{ color: '#2e6245' }}>
                  {curriculumVM.feedback}
                </span>
                <span>Administrator access</span>
              </div>
              <p className="table-note">
                Saved settings are reflected in the student screen. Adjusting credits or GPA inclusion recalculates student GPAs.
              </p>
            </section>
          </div>
        </main>
      )}

      {/* USERS (STUDENT DIRECTORY) SECTION */}
      {activeTab === 'users' && (
        <section className="management" style={{ display: 'block' }}>
          <div className="managehead">
            <div>
              <div className="eyebrow">ADMIN · STUDENT DIRECTORY</div>
              <h1>Your students.</h1>
              <p>View account information and academic results.</p>
            </div>
            <button className="primary" onClick={() => setActiveTab('upload')}>
              Import exam results
            </button>
          </div>

          <div className="warn">
            Account data is retrieved directly from MySQL. Only verified students with @ms.sab.ac.lk email addresses have access to their results. Passwords and secrets are never displayed.
          </div>

          <div className="box">
            <div className="toolbar">
              <input
                type="search"
                aria-label="Search users"
                placeholder="Search name, student ID or email"
                value={usersVM.search}
                onChange={(e) => usersVM.setSearch(e.target.value)}
              />
              <span className="badge">{usersVM.users.length} user(s) found</span>
            </div>

            <div className="tablewrap">
              <table>
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>University email</th>
                    <th>Role</th>
                    <th>Email status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {usersVM.users.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: '24px', color: '#87958b' }}>
                        No matching users found.
                      </td>
                    </tr>
                  ) : (
                    usersVM.users.map((u) => (
                      <tr key={u.dbId}>
                        <td>
                          <b>{u.name}</b>
                          <div className="code">{u.id}</div>
                        </td>
                        <td>{u.email}</td>
                        <td>{u.role}</td>
                        <td>
                          <span className={`badge ${u.verified ? '' : 'issue'}`}>
                            {u.verified ? 'Verified' : 'Pending'}
                          </span>
                        </td>
                        <td>
                          <button
                            type="button"
                            className="editbtn"
                            onClick={() => usersVM.openUserDetails(u)}
                          >
                            View details
                          </button>
                          {u.role !== 'Administrator' && (
                            <button
                              type="button"
                              className="editbtn"
                              style={{ marginLeft: '8px', color: '#b14242', borderColor: '#f5c6cb' }}
                              onClick={() => usersVM.openDeleteModal(u)}
                            >
                              Remove
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {usersVM.feedback && (
              <div style={{ marginTop: '16px', color: '#2e6245', fontSize: '14px', fontWeight: 500 }}>
                {usersVM.feedback}
              </div>
            )}
          </div>
        </section>
      )}

      {/* IMPORT RESULTS SECTION */}
      {activeTab === 'upload' && (
        <section className="management" style={{ display: 'block' }}>
          {/* STEP 1: UPLOAD */}
          {importVM.step === 'upload' && (
            <div>
              <div className="managehead">
                <div>
                  <div className="eyebrow">ADMIN · EXAM RESULTS</div>
                  <h1>One PDF. Many results.</h1>
                  <p>Upload, match student IDs, review and apply.</p>
                </div>
              </div>

              <div className="importsteps">
                <b>01 Upload</b>
                <span>02 Review matches</span>
                <span>03 Apply results</span>
              </div>

              <div className="importgrid">
                <div className="box">
                  <h2>Result sheet</h2>
                  <div className="filezone">
                    <b>Choose an exam-branch PDF</b>
                    <br />
                    <input
                      type="file"
                      accept="application/pdf,.pdf"
                      aria-label="Choose result PDF"
                      onChange={(e) => importVM.handleFileSelect(e.target.files[0])}
                    />
                    <p style={{ marginTop: '8px', color: '#5b7068', fontSize: '13px' }}>
                      {importVM.selectedFile
                        ? `Selected: ${importVM.selectedFile.name}`
                        : 'Select any SE result sheet PDF (e.g. SE3104.pdf)'}
                    </p>
                  </div>

                  {importVM.error && <div className="auth-error" style={{ marginBottom: '14px' }}>{importVM.error}</div>}

                  <button
                    type="button"
                    className="primary"
                    disabled={!importVM.selectedFile || importVM.uploading}
                    onClick={importVM.uploadAndParse}
                  >
                    {importVM.uploading ? 'Parsing PDF...' : 'Review sample results'}
                  </button>
                </div>

                <div className="box">
                  <h2>Before results are applied</h2>
                  <p>
                    Match each registration number to a verified student account identity. Keep unmatched IDs pending until an account is linked.
                  </p>
                  <p>
                    Flag unreadable text, unknown grades, duplicates and existing result conflicts. Preserve attempt groups and the source PDF.
                  </p>
                  <p>
                    Do not replace existing grades without an explicit review. Re-importing the same sheet should not create duplicate results.
                  </p>
                  <div className="warn">
                    A+ and A both carry 4.0 grade points. AB means Absent; its GPA treatment and repeat-attempt rules still need confirmation before automatic calculation.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: REVIEW MATCHES */}
          {importVM.step === 'review' && (
            <div>
              <div className="managehead">
                <div>
                  <div className="eyebrow">ADMIN · REVIEW IMPORT</div>
                  <h1>Check before you apply.</h1>
                  <p>
                    {importVM.reviewData?.subjectCode} · {importVM.reviewData?.subjectName}
                  </p>
                </div>
                <button type="button" className="add" onClick={importVM.resetImport}>
                  Back to upload
                </button>
              </div>

              <div className="importsteps">
                <span>01 Upload</span>
                <b>02 Review matches</b>
                <span>03 Apply results</span>
              </div>

              <div className="box">
                <dl className="kv">
                  <dt>Source</dt>
                  <dd>{importVM.reviewData?.fileName || 'SE3104.pdf'}</dd>
                  <dt>Examination</dt>
                  <dd>{importVM.reviewData?.examDetails || 'Jan / Feb 2026 · 2022/2023 batch'}</dd>
                  <dt>Result status</dt>
                  <dd>{importVM.reviewData?.isProvisional ? 'Subject to Senate confirmation' : 'Finalized'}</dd>
                  <dt>Matching key</dt>
                  <dd>Student registration number (normalized to uppercase)</dd>
                </dl>

                <div className="warn">
                  Results extracted from PDF. Account matches are performed in real-time. A+ = 4.0, the same as A. AB = Absent; its GPA treatment remains pending. Review unmatched IDs, conflicts and repeat-attempt policies.
                </div>

                <div className="summarychips">
                  <span>{importVM.reviewData?.summary?.totalRows || importVM.reviewRows.length} total rows</span>
                  <span>{importVM.reviewData?.summary?.matchedCount || 0} matched accounts</span>
                  <span>{importVM.reviewData?.summary?.conflictCount || 0} existing-grade conflicts</span>
                  <span>{importVM.reviewData?.summary?.heldCount || 0} held rows</span>
                </div>

                <div className="tablewrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Apply</th>
                        <th>Student ID</th>
                        <th>PDF grade</th>
                        <th>Existing</th>
                        <th>Attempt group</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {importVM.reviewRows.map((r, i) => (
                        <tr key={i}>
                          <td>
                            <input
                              type="checkbox"
                              checked={r.selected}
                              disabled={!['Ready', 'Conflict'].includes(r.status)}
                              onChange={() => importVM.toggleRowSelection(i)}
                              aria-label={`${r.status === 'Conflict' ? 'Replace existing result for' : 'Apply result for'} ${r.studentRegNo}`}
                            />
                          </td>
                          <td>
                            <b>{r.studentRegNo}</b>
                            {r.matchedUser && (
                              <div className="code" style={{ color: '#285d41' }}>
                                {r.matchedUser.name}
                              </div>
                            )}
                          </td>
                          <td>
                            <b>{r.grade === 'AB' ? 'AB · Absent' : r.grade}</b>
                          </td>
                          <td>{r.existingGrade || '—'}</td>
                          <td>{r.attemptGroup}</td>
                          <td>
                            <span
                              className={`badge ${
                                r.status === 'Conflict'
                                  ? 'conflict'
                                  : r.status === 'Ready'
                                  ? ''
                                  : 'issue'
                              }`}
                            >
                              {r.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <p style={{ marginTop: '16px' }}>
                  Selecting a conflict row explicitly authorizes replacing its existing grade. Unmatched or unresolved rows stay unchanged.
                </p>

                {importVM.error && <div className="auth-error" style={{ marginBottom: '14px' }}>{importVM.error}</div>}

                <div className="actions">
                  <button type="button" className="primary" onClick={importVM.openConfirmModal}>
                    Review selected updates
                  </button>
                  <span style={{ fontSize: '13px', color: '#63736e' }}>
                    {importVM.reviewRows.filter((r) => r.selected).length} results selected
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: COMPLETE */}
          {importVM.step === 'complete' && (
            <div className="box">
              <div className="auth-icon">✓</div>
              <h1>Selected results updated.</h1>
              <p>
                {importVM.appliedCount} student account(s) updated in the database. Held rows were not applied.
              </p>
              <div className="warn">
                These are provisional results, subject to Senate confirmation. Affected student GPAs have been recalculated.
              </div>

              <h2>Import history</h2>
              <div className="tablewrap">
                <table>
                  <thead>
                    <tr>
                      <th>Student ID</th>
                      <th>Previous</th>
                      <th>Imported</th>
                      <th>Source / attempt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {importVM.appliedHistory.map((r, i) => (
                      <tr key={i}>
                        <td>{r.id}</td>
                        <td>{r.old || '—'}</td>
                        <td>
                          <b>{r.grade}</b>
                        </td>
                        <td>{importVM.reviewData?.fileName || 'SE3104.pdf'} · {r.attempt}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="actions">
                <button type="button" className="primary" onClick={() => setActiveTab('users')}>
                  View students
                </button>
                <button type="button" className="add" onClick={importVM.resetImport}>
                  Import another sheet
                </button>
              </div>
            </div>
          )}
        </section>
      )}

      {/* CURRICULUM EDIT SUBJECT MODAL */}
      {curriculumVM.isModalOpen && curriculumVM.editingSubject && (
        <div className="modal-backdrop" onClick={curriculumVM.closeEditModal}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <form onSubmit={curriculumVM.saveSubjectSettings}>
              <div className="eyebrow">SUBJECT SETTINGS</div>
              <h2>Edit subject</h2>
              <p style={{ fontWeight: 600, color: '#164633' }}>
                {curriculumVM.editingSubject.code} · {curriculumVM.editingSubject.name}
              </p>

              <label htmlFor="edit-credits">Credit count</label>
              <input
                id="edit-credits"
                type="number"
                min={1}
                max={30}
                required
                value={curriculumVM.editCredits}
                onChange={(e) => curriculumVM.setEditCredits(e.target.value)}
              />

              <label htmlFor="edit-type">Subject type</label>
              <select
                id="edit-type"
                value={curriculumVM.editIsGpa ? 'gpa' : 'nongpa'}
                onChange={(e) => curriculumVM.setEditIsGpa(e.target.value === 'gpa')}
              >
                <option value="gpa">GPA subject</option>
                <option value="nongpa">Non-GPA subject</option>
              </select>

              <label htmlFor="edit-reason">Change reason / notes</label>
              <input
                id="edit-reason"
                type="text"
                placeholder="e.g. Faculty board curriculum revision"
                value={curriculumVM.editReason}
                onChange={(e) => curriculumVM.setEditReason(e.target.value)}
              />

              <p style={{ fontSize: '13px', color: '#718079', marginTop: '12px' }}>
                These settings apply to every student using this curriculum and directly impact GPA calculations.
              </p>

              {curriculumVM.error && <div className="auth-error">{curriculumVM.error}</div>}

              <div className="actions">
                <button type="button" className="add" onClick={curriculumVM.closeEditModal}>
                  Cancel
                </button>
                <button type="submit" className="primary" disabled={curriculumVM.isSaving}>
                  {curriculumVM.isSaving ? 'Saving...' : 'Save changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* STUDENT DETAILS MODAL */}
      {usersVM.isModalOpen && usersVM.selectedUser && (
        <div className="modal-backdrop" onClick={usersVM.closeUserDetails}>
          <div className="modal-card" style={{ width: '600px' }} onClick={(e) => e.stopPropagation()}>
            <h2>Student details</h2>
            <dl className="kv">
              <dt>Name</dt>
              <dd>{usersVM.selectedUser.name}</dd>
              <dt>Student ID</dt>
              <dd>{usersVM.selectedUser.id}</dd>
              <dt>Email</dt>
              <dd>{usersVM.selectedUser.email}</dd>
              <dt>Role</dt>
              <dd>{usersVM.selectedUser.role}</dd>
              <dt>Verified</dt>
              <dd>{usersVM.selectedUser.verified ? 'Yes' : 'Pending'}</dd>
              <dt>Degree</dt>
              <dd>Software Engineering</dd>
              <dt>Batch</dt>
              <dd>
                {usersVM.selectedUser.id.startsWith('22') ? '2022/2023 batch' : 'Active student'}
              </dd>
            </dl>

            <h2 style={{ marginTop: '24px' }}>Academic results</h2>
            {usersVM.loadingDetails ? (
              <p>Loading academic records...</p>
            ) : (
              <div className="tablewrap" style={{ maxHeight: '240px', overflowY: 'auto' }}>
                <table className="profile-results">
                  <thead>
                    <tr>
                      <th>Subject</th>
                      <th>Grade</th>
                      <th>Source</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(usersVM.detailsData?.results || []).map((r) => (
                      <tr key={r.id}>
                        <td>
                          <b>{r.code}</b>
                          <div style={{ fontSize: '11px', color: '#63736e' }}>{r.name}</div>
                        </td>
                        <td>{r.effectiveGrade || 'Not entered'}</td>
                        <td>
                          {r.source === 'exam_branch' ? (
                            <span className="badge exam-branch">Exam branch · provisional</span>
                          ) : r.studentGrade ? (
                            <span className="badge neutral">Student entered</span>
                          ) : (
                            '—'
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="actions">
              <button type="button" className="primary" onClick={usersVM.closeUserDetails}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM RESULTS APPLICATION MODAL */}
      {importVM.isConfirmModalOpen && (
        <div className="modal-backdrop" onClick={importVM.closeConfirmModal}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h2>Apply selected results?</h2>
            <p>
              Apply {importVM.reviewRows.filter((r) => r.selected).length} result(s), including{' '}
              {importVM.reviewRows.filter((r) => r.selected && r.status === 'Conflict').length} replacement(s)?
            </p>
            <p>
              This will update the selected students' {importVM.reviewData?.subjectCode} results and recalculate their GPAs. Previous values remain in the import history.
            </p>
            <div className="warn">
              This action will commit updates transactionally to the database.
            </div>

            <div className="actions">
              <button type="button" className="add" onClick={importVM.closeConfirmModal}>
                Cancel
              </button>
              <button
                type="button"
                className="primary"
                disabled={importVM.isApplying}
                onClick={importVM.applyResults}
              >
                {importVM.isApplying ? 'Applying...' : 'Apply results'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE USER CONFIRMATION MODAL */}
      {usersVM.isDeleteModalOpen && usersVM.userToDelete && (
        <div className="modal-backdrop" onClick={usersVM.closeDeleteModal}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ color: '#b14242' }}>Remove Student Account?</h2>
            <p>
              Are you sure you want to remove <strong>{usersVM.userToDelete.name}</strong> ({usersVM.userToDelete.email}) from the system?
            </p>
            <p style={{ fontSize: '13px', color: '#718079' }}>
              This will permanently remove their user account and all personal grade entries from MySQL.
            </p>

            {usersVM.error && <div className="auth-error">{usersVM.error}</div>}

            <div className="actions">
              <button type="button" className="add" onClick={usersVM.closeDeleteModal}>
                Cancel
              </button>
              <button
                type="button"
                className="primary"
                style={{ background: '#b14242' }}
                disabled={usersVM.isDeleting}
                onClick={usersVM.confirmDeleteUser}
              >
                {usersVM.isDeleting ? 'Removing...' : 'Remove User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

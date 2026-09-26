// Software Engineering curriculum data for Sabaragamuwa University of Sri Lanka
// As defined in the approved handbook and UI reference design

export const curriculumRawData = [
  // Year 1, Semester 1
  [
    'Computer Organization|2|SE1101',
    'Programming Fundamentals|2|SE1102',
    'Requirements Fundamentals|2|SE1103',
    'Software Process Concepts|2|SE1104',
    'Social and Professional Issues|2|SE1105',
    'Fundamentals of Mathematics|2|SE1106',
    'Fundamentals of Statistics|2|SE1107',
    'Communication Skills I|1|SE1108',
    'Academic Integrity|1|SE1109',
    'General English I|2|SE-EGP-1101'
  ],
  // Year 1, Semester 2
  [
    'Algorithms, Data structures, and Complexity|2|SE1201',
    'Database Management Systems|2|SE1202',
    'Operating Systems Basics|2|SE1203',
    'Object Oriented Programming|2|SE1204',
    'Requirement Specification and Documentation|2|SE1205',
    'Software Process Implementation|2|SE1206',
    'Analysis Fundamentals|2|SE1207',
    'Advanced Mathematics|2|SE1208',
    'Communication Skills II|1|SE1209',
    'General English II|2|SE-EGP-1201'
  ],
  // Year 2, Semester 3 (Semester I)
  [
    'Network Protocols|2|SE2101',
    'Formal Methods|2|SE2102',
    'Object Oriented Analysis and Design|2|SE2103',
    'Requirements Validation|2|SE3104', // Code SE3104 as designated in syllabus & result sheet
    'Software Design Concepts|2|SE2105',
    'Web Systems and Technologies|2|SE2106',
    'Software Engineering Foundations|2|SE2107',
    'Academic English I|2|SE-EAP-2101'
  ],
  // Year 2, Semester 4 (Semester II)
  [
    'Security Fundamentals|2|SE2201',
    'Software Verification and Validation|2|SE2202',
    'Software Configuration Management|2|SE2203',
    'Software Project Management|2|SE2204',
    'Human Computer Interaction Design|2|SE2205',
    'Projects in Web Systems and Technologies|3|SE2206',
    'Industrial Inspection|1|SE2207',
    'Risk Management|2|SE2208',
    'Communication Skills|2|SE2209',
    'Management Information Systems|2|SE2210',
    'Academic English II|2|SE-EAP-2201'
  ],
  // Year 3, Semester 5 (Semester I)
  [
    'Computer and Network Security|2|SE3101',
    'Software Testing|2|SE3102',
    'Product Assurance|2|SE3103',
    'Mini Project|3|SE3114',
    'Evolution processes and activities|1|SE3105',
    'IT Auditing|2|SE3106|E',
    'Human Resource Management|2|SE3107|E',
    'Geographic Information Systems|2|SE3108|E',
    'Logistic System and Transportation Management|2|SE3109|E',
    'Business Intelligence|2|SE3110|E',
    'Business English|2|SE-EBP-3101'
  ],
  // Year 3, Semester 6 (Semester II)
  [
    'Community Project|3|SE3201',
    'Cloud Computing|2|SE3202',
    'Parallel and Distributed Systems|2|SE3203',
    'Advanced Database Management Systems|2|SE3204',
    'Software Architecture|2|SE3205',
    'Software Design Patterns|2|SE3206',
    'Software Design Evaluation|2|SE3207',
    'Current Topics in Software Engineering|1|SE3208',
    'Enterprise Modeling Ontologies|2|SE3209|E',
    'Software Engineering Economics|2|SE3210|E',
    'Social Computing|2|SE3211|E',
    'Semantic Web|2|SE3212|E',
    'Robotics|2|SE3213|E'
  ],
  // Year 4, Semester 7 (Semester I)
  [
    'Industrial Training|6|SE4101'
  ],
  // Year 4, Semester 8 (Semester II)
  [
    'Research Project|8|SE4201',
    'Research Methods|2|SE4202',
    'Service Oriented Architecture|2|SE4203',
    'Problem Analysis and Reporting|2|SE4204',
    'Machine Learning|2|SE4205',
    'Mobile Computing|2|SE4206',
    'Refactoring|2|SE4207',
    'Game Designing and Development|2|SE4208|E',
    'Data Mining|2|SE4209|E',
    'Big Data Analytics|2|SE4210|E',
    'Artificial Intelligence|2|SE4211|E'
  ]
];

export const parseCurriculumData = () => {
  const subjects = [];
  curriculumRawData.forEach((semItems, semIdx) => {
    const semesterNo = semIdx + 1;
    const yearNo = Math.floor(semIdx / 2) + 1;

    semItems.forEach((item, itemIdx) => {
      const parts = item.split('|');
      const name = parts[0];
      const credits = Number(parts[1] || 2);
      const code = parts[2] || `SE${semesterNo}1${String(itemIdx + 1).padStart(2, '0')}`;
      const isElective = parts[3] === 'E';
      const defaultIncluded = !isElective;
      const isGpa = true; // Prototype default, configurable by admin

      subjects.push({
        year_no: yearNo,
        semester_no: semesterNo,
        subject_code: code,
        subject_name: name,
        credits,
        is_gpa: isGpa,
        is_elective: isElective,
        default_included: defaultIncluded
      });
    });
  });
  return subjects;
};
